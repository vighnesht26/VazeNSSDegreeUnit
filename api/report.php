<?php

use PhpOffice\PhpSpreadsheet\Cell\Coordinate;


session_start();

require '../config/connect.php';
require '../vendor/autoload.php';
require './cloudinary_uploader.php';

use PhpOffice\PhpWord\TemplateProcessor;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;


$TEMPLATE_Path = __DIR__ . '/../assets/template.docx';
$REPORT_DIR = __DIR__ . '/../reports/';

$isAdmin  = isset($_SESSION['admin_id']);
$isLeader = isset($_SESSION['std_id'], $_SESSION['role']) && $_SESSION['role'] === 'Leader';

if (!$isAdmin && !$isLeader) {
    http_response_code(403);
    
    echo json_encode(['success' => false, 'error' => 'Unauthorized access.']);
    exit();
}

$action = $_REQUEST['action'] ?? '';

try{
    switch($action){
        case 'generate_report':
            header('Content-Type: application/json');
                if($_SERVER['REQUEST_METHOD'] !== 'POST'){
                    throw new Exception("Invlaid method");
                }

                $eventID = filter_input(INPUT_POST, 'event_id', FILTER_VALIDATE_INT);
                $desc = trim($_POST['desc_report']);
                $conclusion = trim($_POST['con_report']);
                $expense = $_POST['expense'];
                
                if (!$eventID || empty($desc) || empty($conclusion)) {
                    throw new Exception('Event ID, description, and conclusion are required.');
                }
                
                $sql = "SELECT e.event_id, e.date, e.name,
                            COUNT(CASE WHEN a.isabsent = 'no' THEN 1 END) AS total_attendees,
                            COUNT(CASE WHEN a.isabsent = 'no' AND LOWER(s.gender) = 'male' THEN 1 END) as male_count,
                            COUNT(CASE WHEN a.isabsent = 'no' AND LOWER(s.gender) = 'female' THEN 1 END) as female_count
                        FROM event e
                        LEFT JOIN attendance a ON e.event_id = a.event_id
                        LEFT JOIN student s ON a.student_id = s.std_id
                        WHERE e.event_id = ?
                        GROUP BY e.event_id, e.date, e.name";

                $stmt = $conn->prepare($sql);
                $stmt->bind_param("i", $eventID);
                $stmt->execute();
                $event = $stmt->get_result()->fetch_assoc();
                $stmt->close();

                if (!$event) {
                    throw new Exception('Event not found.');
                }

                //word generation
                $temp = new TemplateProcessor($TEMPLATE_Path);

                $temp->setValue('eventName',htmlspecialchars($event['name']));
                $temp->setValue('eventDate',htmlspecialchars($event['date']));

                $temp->setValue('Description',htmlspecialchars($desc));
                $temp->setValue('total',htmlspecialchars($event['total_attendees']));
                $temp->setValue('male',htmlspecialchars($event['male_count']));
                $temp->setValue('female',htmlspecialchars($event['female_count']));
                
                $temp->setValue('Conclusion',htmlspecialchars($conclusion));
                
                if(isset($_FILES['report_flyer']) && $_FILES['report_flyer']['error'] === UPLOAD_ERR_OK){
                    $ext = image_type_to_extension(exif_imagetype($_FILES['report_flyer']['tmp_name']), false) ?: 'jpg';
                    $flyerPath = $_FILES['report_flyer']['tmp_name'] .'.'.$ext;;
                    rename($_FILES['report_flyer']['tmp_name'], $flyerPath);
                    $temp->setImageValue('flyer', array(
                        'path' => $flyerPath,
                        'width' => 400,
                        'height' => 250,
                        'ratio' => true
                    ));
                }
                else{
                    $temp->setValue('flyer' , 'NA');
                }

                if(isset($_FILES['report_geotagged']) && $_FILES['report_geotagged']['error'] === UPLOAD_ERR_OK){
                    $ext = image_type_to_extension(exif_imagetype($_FILES['report_geotagged']['tmp_name']), false) ?: 'jpg';
                    $geotaggedPath = $_FILES['report_geotagged']['tmp_name'] .'.'.$ext;
                    rename($_FILES['report_geotagged']['tmp_name'], $geotaggedPath);
                    $temp->setImageValue('geotagged', array(
                        'path' => $geotaggedPath,
                        'width' => 400,
                        'height' => 250,
                        'ratio' => true
                    ));
                }
                else{
                    $temp->setValue('geotagged' , 'Not uploaded');
                }
                

                // $fileName  = $event['date'] . '_' . $event['name'] . '.docx';
                // $filePath  = $REPORT_DIR . $fileName;

                // $temp->saveAs($filePath);

            
                // $reportUrl = '../reports/' . $fileName;

                $tempFile = tempnam(sys_get_temp_dir(), 'report_'). '.docx';
                $temp->saveAs($tempFile);
                
                $fileName  = 'reports/'. $event['date'] . '_' . $event['name'] . '.docx';
                $reportUrl = uploadToCloudinary($tempFile, $fileName, 'raw');

                if(file_exists($tempFile)){
                    unlink($tempFile);
                }

                

                
                $conn->begin_transaction();

                $sql1 = "INSERT INTO report (male_count, female_count, description, conclusion, expense, report_url, for_event) VALUES(?,?,?,?,?,?,?)";
                $stmt1 = $conn->prepare($sql1);
                $stmt1->bind_param("iissisi", $event['male_count'],$event['female_count'], $desc, $conclusion,$expense, $reportUrl, $eventID);
                $stmt1->execute();

                $sql2 = "UPDATE event SET report_status = 'Completed' WHERE event_id =?";
                $stmt2 = $conn->prepare($sql2);
                $stmt2->bind_param("i",$eventID);
                $stmt2->execute();
                    
                $conn->commit();

                echo json_encode([
                'success'    => true,
                'message'    => 'Report generated and uploaded successfully.'
                ]);
                break;
            case 'view_report':
                
                $eventID = filter_input(INPUT_GET, 'event_id', FILTER_VALIDATE_INT);
                if (!$eventID) {
                    http_response_code(400);
                    header('Content-Type: application/json');
                    echo json_encode(['success' => false, 'error' => 'Invalid Event ID.']);
                    exit();
                }

                $stmt = $conn->prepare("SELECT report_url FROM report WHERE for_event = ?");
                $stmt->bind_param("i", $eventID);
                $stmt->execute();
                $row = $stmt->get_result()->fetch_assoc();
                $stmt->close();

                if ($row && !empty($row['report_url'])) {
                    header("Location: " . $row['report_url']);
                    exit();
                   
                
                } else {
                    http_response_code(404);
                    header('Content-Type: application/json');
                    echo json_encode(['success' => false, 'error' => 'Report not found for this event.']);
                    exit();
                }
                break;
            case 'vol_event_report':
                $getAcademicYear = $_GET['academic_year'];

                if (!empty($getAcademicYear) && preg_match('/^(\d{4})-(\d{2}|\d{4})$/', trim($getAcademicYear), $matches)) {
                    $startYear    = (int)$matches[1];
                    $endYearStr   = $matches[2];
                    $endYearFull  = (strlen($endYearStr) === 2) ? (int)(substr((string)$startYear, 0, 2) . $endYearStr) : (int)$endYearStr;
                    $endYearShort = (strlen($endYearStr) === 4) ? substr($endYearStr, -2) : $endYearStr;
                    $AcademicYear = "{$startYear}-{$endYearShort}";
                } else {
                    $currentMonth = (int)date('n'); 
                    $currentYear  = (int)date('Y');
                    $startYear    = ($currentMonth >= 6) ? $currentYear : $currentYear - 1;
                    $endYearFull  = ($currentMonth >= 6) ? $currentYear + 1 : $currentYear;
                    $endYearShort = ($currentMonth >= 6) ? substr((string)($currentYear + 1), -2) : substr((string)$currentYear, -2);
                    $AcademicYear = "{$startYear}-{$endYearShort}";
                }

                $startDate = "{$startYear}-06-01";
                $endDate   = "{$endYearFull}-05-31";
                
               
                $sqlevent = "SELECT event_id, name, date, alloted_hrs
                            FROM event
                            WHERE date BETWEEN ?  AND ? AND status = 'Completed'
                            ORDER BY date ASC";

                $stmtevent = $conn->prepare($sqlevent);
                $stmtevent->bind_param('ss',$startDate,$endDate);
                $stmtevent->execute();

                $events = $stmtevent->get_result()->fetch_all(MYSQLI_ASSOC);

                $sqlvol = "SELECT s.std_id, CONCAT_WS(' ',s.surname,s.first_name,s.father_name,s.mother_name) AS full_name
                            FROM student s
                            INNER JOIN academic_details ad
                                ON s.std_id = ad.student_id
                            WHERE ad.academic_year = ?
                            ORDER BY s.surname";
                        $stmtvol = $conn->prepare($sqlvol);
                        $stmtvol->bind_param('s',$AcademicYear);
                        $stmtvol->execute();

                        $volunteers = $stmtvol->get_result()->fetch_all(MYSQLI_ASSOC);


                $sqlatt = "SELECT a.event_id, a.student_id, a.isabsent
                            FROM attendance a
                            INNER JOIN  event e
                                ON a.event_id = e.event_id
                            WHERE e.date BETWEEN ? AND ? AND isabsent = 'no'";
                        
                        $stmtatt = $conn->prepare($sqlatt);
                        $stmtatt->bind_param('ss',$startDate,$endDate);
                        $stmtatt->execute();

                        $attendanceresult = $stmtatt->get_result();

                $attendance = [];

                while ($row = $attendanceresult->fetch_assoc()) {
                    $attendance[$row['student_id']][$row['event_id']] = true;
                }
                

                $spreadsheet = new Spreadsheet();
                $sheet = $spreadsheet->getActiveSheet();
                $sheet->setTitle("Volunteer_Event_List_". $AcademicYear);

                $sheet->setCellValue('A1','Sr. No.');
                $sheet->setCellValue('B1', 'Volunteer Name');

                $columnIndex = 3; //column C
                foreach($events as $event){
                    $colLetter = Coordinate::stringFromColumnIndex($columnIndex);
                    $sheet->setCellValue($columnIndex . '1',$event['name']);
                    $columnIndex++;
                }
                $totalColLetter = Coordinate::stringFromColumnIndex($columnIndex);
                $sheet->setCellValue($totalColLetter . '1','Total Hours');

                $rowNum = 2;
                $srno = 1;
                $hasEvent = !empty($events);
                $lastEventColLetter = Coordinate::stringFromColumnIndex(count($events) +2);

                foreach($volunteers as $volunteer){
                    $sheet->setCellValue('A' . $rowNum, $srno++);
                    $sheet->setCellValue('B' . $rowNum, $volunteer['full_name']);

                    $columnIndex = 3;
                    foreach($events as $event){
                        $colLetter = Coordinate::stringFromColumnIndex($columnIndex);
                        $studentId = $volunteer['std_id'];
                        $eventId = $event['event_id'];

                        if(isset($attendance[$studentId][$eventId])){
                            $hours = (float)$event['alloted_hrs'];
                            $sheet->setCellValue($colLetter . $rowNum, $hours);

                        }
                        else{
                            $sheet->setCellValue($colLetter . $rowNum, 0);
                        }
                        $columnIndex++;
                    }
                        if($hasEvent){
                            $sheet->setCellValue($totalColLetter . $rowNum,"=SUM(C{$rowNum}:{$lastEventColLetter}{$rowNum})");

                        }
                        $rowNum++;
                    }
                        foreach(range(1,$columnIndex) as $cell){
                            $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($cell))->setAutoSize(true);

                        }
                        $fileName = "Volunteer_Hours_{$AcademicYear}.xlsx";

                        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                        header("Content-Disposition: attachment; filename=\"{$filename}\"");
                        header('Cache-Control: max-age=0');

                        $writer = new Xlsx($spreadsheet);
                        $writer->save('php://output');
                        exit();
                        break;
            default:
                    http_response_code(400);
                    header('Content-Type: application/json');
                    echo json_encode(['success' => false, 'error' => 'Invalid or missing action.']);
                    $conn->close();
                    exit();        

            
    }
}catch(Exception $e){
    
        $conn->rollback();
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => $e->getMessage(),
        'file'    => $e->getFile(),
        'line'    => $e->getLine()
    ]);
}


?>