<?php
session_start();
include '../config/connect.php';


$isAdmin  = isset($_SESSION['admin_id']);
$isLeader = isset($_SESSION['std_id'], $_SESSION['role']) && $_SESSION['role'] === 'Leader';

if (!$isAdmin && !$isLeader) {
    http_response_code(403);
    echo "Unauthorized access.";
    exit();
}

$action = $_GET['action'] ?? '';
$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (empty($action) && isset($data['action'])) {
$action = $data['action'];
}

$currentMonth = (int)date('n'); 
$currentYear  = (int)date('Y');

if ($currentMonth >= 6) {
        
    $startYear = $currentYear;
    $endYear   = substr((string)($currentYear + 1), -2); 
    $endYearfull = $currentYear + 1;
} else {
    
    $startYear = $currentYear - 1;
    $endYear   = substr((string)$currentYear, -2);
    $endYearFull  = $currentYear;
}

$academicYear = $startYear . '-' . $endYear; 

$startDate    = "{$startYear}-06-01";
$endDate      = "{$endYearfull}-05-31";

if($action == 'export_std_list'){
    $filename = "NSS_Volunteer_list_" . $academicYear . ".csv";
}
else if($action == 'export_c_event_list'){
    $filename = "Proforma12A_" . $academicYear . ".csv";
}

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Cache-Control: max-age=0');


$output = fopen('php://output', 'w');




fputs($output, "\xEF\xBB\xBF");
switch($action){
 case 'export_std_list' :
        fputcsv($output, array(
            'SR No.',
            'Student ID',
            'Full Name',
            'Gender',
            'Blood Group',
            'Caste',
            'Date of Birth',
            'Mobile Number',
            'Email Address',
            'Class',
            'Program',
            'Division',
            'Roll No.',
            'Total NSS Hours'
        ));


        $sql = "SELECT s.std_id, s.first_name, s.mother_name, s.father_name ,s.surname, s.gender, s.email, s.mobile, 
                    s.blood_grp, s.caste, s.dob,
                    ad.class, ad.program, ad.division, ad.roll_no, ad.total_hrs
                FROM student s
                INNER JOIN academic_details ad ON s.std_id = ad.student_id
                ORDER BY ad.class ASC, ad.roll_no ASC";

        $result = mysqli_query($conn, $sql);

        if ($result) {
            $sr = 1;
            while ($row = mysqli_fetch_assoc($result)) {
                $fullName = mb_strtoupper(trim(($row['surname'] ?? '') . ' ' . ($row['first_name'] ?? '') . ' ' . ($row['father_name'] ?? '') . ' ' . ($row['mother_name'] ?? '')));

                
                fputcsv($output, array(
                    $sr++,
                    $row['std_id'] ?? '',
                    $fullName,
                    $row['gender'] ?? '',
                    $row['blood_grp'] ?? 'N/A',
                    $row['caste'] ?? 'N/A',
                    $row['dob'] ?? 'N/A',
                    $row['mobile'] ?? '',
                    $row['email'] ?? '',
                    $row['class'] ?? '',
                    $row['program'] ?? '',
                    $row['division'] ?? '',
                    $row['roll_no'] ?? '',
                    $row['total_hrs'] ?? 0
                ));
            }
        }
        break;
case 'export_c_event_list':

        fputcsv($output, array(
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
        ));

        fputcsv($output, array(
            '',
            '',
            '',
            '',
            '',
            'Male',
            'Female',
            'Total',
            '',
            ''
        ));

        $sql = "SELECT e.event_id, e.name,e.event_type,e.date, e.venue, e.organised_by, e.alloted_hrs,
                        COUNT(CASE WHEN a.isabsent = 'no' AND LOWER(gender) = 'male' THEN 1 END ) AS male_count,
                        COUNT(CASE WHEN a.isabsent = 'no' AND LOWER(gender) = 'female' THEN 1 END) AS female_count
                        FROM event e
                        LEFT JOIN attendance a ON e.event_id = a.event_id
                        LEFT JOIN student s ON a.student_id = s.std_id
                        WHERE e.status = 'Completed'
                        AND e.date BETWEEN ? AND ?
                        GROUP BY e.event_id, e.name,e.event_type,e.date, e.venue,e.organised_by,e.alloted_hrs
                        ORDER BY e.date ASC";
        $stmt = $conn->prepare($sql);
        if($stmt){
            $stmt->bind_param("ss",$startDate, $endDate);
            $stmt->execute();
            $result = $stmt->get_result();

            while($row = $result->fetch_assoc()){
                $male = (int)$row['male_count'];
                $female = (int)$row['female_count'];
                $total = $male + $female;

                fputcsv($output, array(
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
                ));
            }
            $stmt->close();
            
        }


}
fclose($output);
exit();
?>