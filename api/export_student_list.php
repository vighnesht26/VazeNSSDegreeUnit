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


$currentMonth = (int)date('n'); 
$currentYear  = (int)date('Y');

if ($currentMonth >= 6) {
        
    $startYear = $currentYear;
    $endYear   = substr((string)($currentYear + 1), -2); 
} else {
    
    $startYear = $currentYear - 1;
    $endYear   = substr((string)$currentYear, -2);
}

$academicYear = $startYear . '-' . $endYear; 


$filename = "NSS_Volunteer_list_" . $academicYear . ".csv";

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Cache-Control: max-age=0');


$output = fopen('php://output', 'w');


fputs($output, "\xEF\xBB\xBF");


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


fclose($output);
exit();
?>