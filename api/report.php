<?php
session_start();
header('Content-Type: application/json');
require_once '../config/connect.php';
require_once '../vendor/autoload.php';
require_once './drive_uploader.php';

use PhpOffice\PhpWord\TemplateProcessor;


$TEMPLATE_Path = __DIR__ . '/../assets/template.docx';
$REPORT_DIR = __DIR__ . '/../reports/';

$isAdmin  = isset($_SESSION['admin_id']);
$isLeader = isset($_SESSION['std_id'], $_SESSION['role']) && $_SESSION['role'] === 'Leader';
$creater = $_SESSION['std_id'];
if (!$isAdmin && !$isLeader) {
    http_response_code(403);
    
    echo json_encode(['success' => false, 'error' => 'Unauthorized access.']);
    exit();
}

$action = $_REQUEST['action'] ?? '';

try{
    switch($action){
        case 'generate_report':
            
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
                    $flyerPath = $_FILES['report_flyer']['tmp_name'] . '.jpg';
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
                    $geotaggedPath = $_FILES['report_geotagged']['tmp_name'] . '.jpg';
                    rename($_FILES['report_geotagged']['tmp_name'], $flyerPath);
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

                $tempFile = tempnam(sys_get_temp_dir(), 'report_');
                $temp->saveAs($tempFile);
                $content = file_get_contents($tempFile);

                if(file_exists($tempFile)){
                    unlink($tempFile);
                }

                $fileName  = $event['date'] . '_' . $event['name'] . '.docx';
                $docxmime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

                $driveFile = uploadToGoogleDrive($content, $fileName, $docxmime);
                $reportUrl = $driveFile->webViewLink ?? ('https://drive.google.com/file/d/' . $driveFile->id . '/view');

                $conn->begin_transaction();

                $sql1 = "INSERT INTO report (male_count, female_count, description, conclusion, expense, report_url, for_event, created_by) VALUES(?,?,?,?,?,?,?,?)";
                $stmt1 = $conn->prepare($sql1);
                $stmt1->bind_param("iissisii", $event['male_count'],$event['female_count'], $desc, $conclusion,$expense, $reportUrl, $eventID, $creater);
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
                    echo json_encode(['success' => false, 'error' => 'Report not found for this event.']);
                    exit();
                }
                break;
            
    }
}catch(Exception $e){
    
        $conn->rollback();
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => $e->getMessage()
    ]);
}


?>