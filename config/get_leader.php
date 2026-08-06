<?php
session_start(); 
header('Content-Type: application/json');
include 'connect.php';
require_once 'function.php';

$response = [
    'success' => false,
    'data' => [],
    'error' => ''
];

if (isset($_SESSION['admin_id'])) {
    try {
       
        $academic_year = getAcademicYear();

        
        $sql = "SELECT 
                    s.std_id AS id, 
                    s.first_name, 
                    s.mobile, 
                    a.class, 
                    a.program, 
                    a.division,
                    a.roll_no, 
                    a.total_hrs, 
                    a.academic_year
                FROM student s
                INNER JOIN academic_details a ON s.std_id = a.student_id
                WHERE a.academic_year = ? 
                  AND s.role = 'leader'
                ORDER BY s.first_name ASC";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $academic_year);
        $stmt->execute();
        
        $result = $stmt->get_result();
        $leaders = $result->fetch_all(MYSQLI_ASSOC); 
        $stmt->close();

        $response['success'] = true;
        $response['data'] = $leaders;

    } catch (Exception $e) {
        $response['error'] = $e->getMessage();
    }
    
    $conn->close();
} else {
    $response['error'] = 'Unauthorized access';
}

echo json_encode($response);
exit();
?>