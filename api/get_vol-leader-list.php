<?php
session_start(); 
header('Content-Type: application/json');
include '../config/connect.php';
require_once '../config/function.php';

$response = [
    'success' => false,
    'data' => [
        'leader' =>[],
        'volunteer' => []
    ],
    'error' => ''
];

if (!isset($_SESSION['admin_id'])){
    http_response_code(401);
    $response['error'] = 'Unauthorized access';
    echo json_encode($response);
    exit();
} 

    try {
       
        $academic_year = getAcademicYear();
        $role = $_GET['role'] ?? '';
        
        $sql = "SELECT 
                    s.std_id AS id, 
                    s.first_name,
                    s.surname, 
                    s.mobile, 
                    s.role,
                    a.class, 
                    a.program, 
                    a.division,
                    a.roll_no, 
                    a.total_hrs, 
                    a.academic_year
                    
                FROM student s
                INNER JOIN academic_details a ON s.std_id = a.student_id
                WHERE a.academic_year = ? AND s.role = ?
                ORDER BY s.first_name ASC";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $academic_year, $role);
        $stmt->execute();
        
        $result = $stmt->get_result();

        while($row = $result->fetch_assoc()){
            if($row['role'] === 'Leader'){
                $response['data']['leader'][]= $row;
            }
            else{
                $response['data']['volunteer'][]= $row;
            }
        }

        $response['success'] = true;
     
    $stmt->close();
    $conn->close();
    } catch (Exception $e) {
        http_response_code(500);
        $response['error'] = $e->getMessage();
    }
    
    


echo json_encode($response);
exit();
?>