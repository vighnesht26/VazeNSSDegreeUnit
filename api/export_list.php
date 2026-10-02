<?php

session_start();
require '../config/connect.php';
require '../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

$isAdmin  = isset($_SESSION['admin_id']);
$isLeader = isset($_SESSION['std_id'], $_SESSION['role']) && $_SESSION['role'] === 'Leader';

if (!$isAdmin && !$isLeader) {
    http_response_code(403);
    echo "Unauthorized access.";
    exit();
}

$action = $_GET['action'] ?? '';
$input  = file_get_contents("php://input");
$data   = json_decode($input, true);

if (empty($action) && isset($data['action'])) {
    $action = $data['action'];
}

switch ($action) {
    case 'get_academic_years':
        header('Content-Type: application/json');

        $sql = "SELECT DISTINCT academic_year FROM academic_details
                WHERE academic_year IS NOT NULL AND academic_year != ''
                ORDER BY academic_year DESC";

        $result = $conn->query($sql);
        $years = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $years[] = $row['academic_year'];
            }
        }

        // Current academic year
        $currentMonth = (int)date('n'); 
        $currentYear  = (int)date('Y');
        $curStart     = ($currentMonth >= 6) ? $currentYear : $currentYear - 1;
        $curEnd       = ($currentMonth >= 6) ? substr((string)($currentYear + 1), -2) : substr((string)$currentYear, -2);
        $currentYearStr = "{$curStart}-{$curEnd}";

        if (!in_array($currentYearStr, $years)) {
            array_unshift($years, $currentYearStr);
        }

        echo json_encode([
            'success'      => true,
            'current_year' => $currentYearStr,
            'years'        => $years
        ]);
        $conn->close();
        exit();

    case 'get_programs':
        header('Content-Type: application/json');

        $sql = "SELECT DISTINCT program 
                FROM academic_details 
                WHERE program IS NOT NULL AND program != '' 
                ORDER BY program ASC";
        $result = $conn->query($sql);

        $programs = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $programs[] = $row['program'];
            }
        }

        echo json_encode([
            'success'  => true,
            'programs' => $programs
        ]);
        $conn->close();
        exit();

    case 'export_std_list':
        $getAcademicYear = $_GET['academic_year'];
        $classFilter   = !empty($_GET['class']) ? trim($_GET['class']) : null;
        $programFilter = !empty($_GET['program']) ? trim($_GET['program']) : null;

        
        if (!empty($getAcademicYear) && preg_match('/^(\d{4})-(\d{2})$/', trim($getAcademicYear), $matches)) {
            $startYear    = (int)$matches[1];
            $endYear=  (int)$matches[2];
            $AcademicYear = "{$startYear}-{$endYear}";
        } else {
            $currentMonth = (int)date('n'); 
            $currentYear  = (int)date('Y');
            $startYear    = ($currentMonth >= 6) ? $currentYear : $currentYear - 1;
            $endYear = ($currentMonth >= 6) ? substr((string)($currentYear + 1), -2) : substr((string)$currentYear, -2);
            $AcademicYear = "{$startYear}-{$endYear}";
        }

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheetname = "Volunteer_" .  $AcademicYear;
        $sheet->setTitle($sheetname);
        if(!empty($programFilter)  && !empty($classFilter)){
               $sheet->setTitle($sheetname . "_{$classFilter}_{$programFilter}");
            }
        else if(!empty($programFilter)){
            $sheet->setTitle($sheetname . "_{$programFilter}");}
        else if(!empty($classFilter)){
           $sheet->setTitle($sheetname . "_{$classFilter}");}
        

       
        
        $sheet->setCellValue('A1','SR No.');
        $sheet->setCellValue('B1','Student ID');
        $sheet->setCellValue('C1','Full Name');
        $sheet->setCellValue('D1','Gender');
        $sheet->setCellValue('E1','Blood Group');
        $sheet->setCellValue('F1','Caste');
        $sheet->setCellValue('G1','Date of Birth');
        $sheet->setCellValue('H1','Mobile Number');
        $sheet->setCellValue('I1','Email Address');
        $sheet->setCellValue('J1','Class');
        $sheet->setCellValue('K1','Program');
        $sheet->setCellValue('L1','Division');
        $sheet->setCellValue('M1','Roll No.');
        $sheet->setCellValue('N1','Total NSS Hours');
       

        $sql = "SELECT s.std_id, s.first_name, s.mother_name, s.father_name, s.surname, s.gender, s.email, s.mobile, 
                       s.blood_grp, s.caste, s.dob,
                       ad.class, ad.program, ad.division, ad.roll_no, ad.total_hrs
                FROM student s
                INNER JOIN academic_details ad ON s.std_id = ad.student_id
                WHERE ad.academic_year = ?";

        $bindTypes  = "s";
        $bindParams = [$AcademicYear];

        if (!empty($programFilter)) {
            $sql .= " AND ad.program = ?";
            $bindTypes .= "s";
            $bindParams[] = $programFilter;
        }

        if (!empty($classFilter)) {
            $sql .= " AND ad.class = ?";
            $bindTypes .= "s";
            $bindParams[] = $classFilter;
        }

        $sql .= " ORDER BY ad.class ASC, ad.roll_no ASC";

        $stmt = $conn->prepare($sql);
        if ($stmt) {
            $stmt->bind_param($bindTypes, ...$bindParams);
            $stmt->execute();
            $result = $stmt->get_result();

            $sr = 1;
            
            $rowIndex=2; 
            while ($row = $result->fetch_assoc()) {
                $fullName = mb_strtoupper(trim(($row['surname'] ?? '') . ' ' . ($row['first_name'] ?? '') . ' ' . ($row['father_name'] ?? '') . ' ' . ($row['mother_name'] ?? '')));
                $colIndex=1;
               
                    $sheet->setCellValue([$colIndex++ ,$rowIndex],$sr++);
                    $sheet->setCellValue([$colIndex++ ,$rowIndex],$row['std_id'] ?? '');
                    $sheet->setCellValue([$colIndex++ ,$rowIndex],$fullName);
                    $sheet->setCellValue([$colIndex++ ,$rowIndex],$row['gender']);
                    $sheet->setCellValue([$colIndex++ ,$rowIndex],$row['blood_grp']);
                    $sheet->setCellValue([$colIndex++ ,$rowIndex],$row['caste'] ?? 'N/A');
                    $sheet->setCellValue([$colIndex++ ,$rowIndex],$row['dob'] ?? 'N/A');
                    $sheet->setCellValue([$colIndex++ ,$rowIndex],$row['mobile'] ?? '');
                    $sheet->setCellValue([$colIndex++ ,$rowIndex],$row['email'] ?? '');
                    $sheet->setCellValue([$colIndex++ ,$rowIndex],$row['class'] ?? '');
                    $sheet->setCellValue([$colIndex++ ,$rowIndex],$row['program'] ?? '');
                    $sheet->setCellValue([$colIndex++ ,$rowIndex],$row['division'] ?? '');
                    $sheet->setCellValue([$colIndex++ ,$rowIndex],$row['roll_no'] ?? '');
                    $sheet->setCellValue([$colIndex ,$rowIndex],$row['total_hrs'] ?? 0);
                    $rowIndex++;
                }
                
            }
            $stmt->close();
            
            foreach(range(1,14) as $cell){
                $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($cell))->setAutoSize(true);
                }

            
            if(!empty($programFilter)  && !empty($classFilter)){
                $filename = "Volunteer_{$AcademicYear}_{$classFilter}_{$programFilter}.xlsx";
            }
            else if(!empty($programFilter)){
                $filename = "Volunteer_{$AcademicYear}_{$programFilter}.xlsx";}
            else if(!empty($classFilter)){
                $filename = "Volunteer_{$AcademicYear}_{$classFilter}.xlsx";}
            else{
                $filename = "Volunteer_{$AcademicYear}.xlsx";
            }
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header("Content-Disposition: attachment; filename=\"{$filename}\"");
        header('Cache-Control: max-age=0');

        $writer = new Xlsx($spreadsheet);
        $writer->save('php://output');
        $conn->close();
        exit();
        break;

    case 'export_c_event_list':
        $getAcademicYear = $_GET['academic_year'] ?? $data['academic_year'] ?? '';

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
        $safeYear  = str_replace(['/', '\\'], '-', $AcademicYear);
        $filename  = "Proforma12A_" . $safeYear . ".csv";

        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Cache-Control: max-age=0');

        $output = fopen('php://output', 'w');
        fputs($output, "\xEF\xBB\xBF");

        fputcsv($output, [
            'DATE (in ascending order)',
            'Name of Project (Include meetings and day- to-day activities)',
            'Organised By',
            'Venue',
            'Level (ABP/UL/CL/DL)',
            'Participants',
            '',
            '',
            'Max Hours alloted',
            'No. of Beneficiaries'
        ]);

        fputcsv($output, ['', '', '', '', '', 'Male', 'Female', 'Total', '', '']);

        $sql = "SELECT e.event_id, e.name, e.event_type, e.date, e.venue, e.organised_by, e.alloted_hrs,
                       COUNT(CASE WHEN a.isabsent = 'no' AND LOWER(s.gender) = 'male' THEN 1 END) AS male_count,
                       COUNT(CASE WHEN a.isabsent = 'no' AND LOWER(s.gender) = 'female' THEN 1 END) AS female_count
                FROM event e
                INNER JOIN attendance a ON e.event_id = a.event_id
                INNER JOIN student s ON a.student_id = s.std_id
                WHERE e.status = 'Completed'
                  AND e.date BETWEEN ? AND ?
                GROUP BY e.event_id, e.name, e.event_type, e.date, e.venue, e.organised_by, e.alloted_hrs
                ORDER BY e.date ASC";

        $stmt = $conn->prepare($sql);
        if ($stmt) {
            $stmt->bind_param("ss", $startDate, $endDate);
            $stmt->execute();
            $result = $stmt->get_result();

            while ($row = $result->fetch_assoc()) {
                $male   = (int)$row['male_count'];
                $female = (int)$row['female_count'];
                $total  = $male + $female;

                fputcsv($output, [
                    date('jS F Y', strtotime($row['date'])),
                    $row['name'],
                    $row['organised_by'],
                    $row['venue'],
                    $row['event_type'],
                    $male,
                    $female,
                    $total,
                    $row['alloted_hrs'],
                    $total
                ]);
            }
            $stmt->close();
        }

        fclose($output);
        $conn->close();
        exit();
        break;
    
    
    default:
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'Invalid or missing action.']);
        $conn->close();
        exit();
}