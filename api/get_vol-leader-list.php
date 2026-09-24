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

$isAdmin  = isset($_SESSION['admin_id']);
$isLeader = isset($_SESSION['std_id'], $_SESSION['role']) && $_SESSION['role'] === 'Leader';

if (!$isAdmin && !$isLeader) {
    http_response_code(403);
    
    echo json_encode(['error' => 'Unauthorized access.']);
    exit();
}

    try {
       
        $academic_year = getAcademicYear();
        $role = $_GET['role'] ?? 'Volunteer';
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';

       

        $sql = "SELECT 
                    s.std_id AS id, 
                    s.first_name,
                    s.surname, 
                    s.mobile, 
                    s.role,
                    a.nss_year,
                    a.class, 
                    a.program, 
                    a.division,
                    a.roll_no, 
                    a.total_hrs, 
                    a.academic_year
                    
                FROM student s
                INNER JOIN academic_details a ON s.std_id = a.student_id
                WHERE a.academic_year = ? AND s.role = ?";

        if (!empty($search)) {
        $sql .= " AND (
                    s.first_name LIKE ? 
                    OR s.surname LIKE ? 
                    OR CONCAT(s.first_name, ' ', s.surname) LIKE ? 
                    OR a.roll_no LIKE ? 
                    OR s.mobile LIKE ?
                    OR a.program LIKE ?
                    OR a.class LIKE ?
                    OR a.nss_year LIKE ?
                  )";
        }

        $sql .= " ORDER BY a.total_hrs DESC LIMIT 10";

    

        $stmt = $conn->prepare($sql);
        if (!empty($search)) {
            $likeParam = "%{$search}%";
            $stmt->bind_param("ssssssssss", $academic_year, $role, $likeParam, $likeParam, $likeParam, $likeParam, $likeParam, $likeParam, $likeParam,$likeParam);
        } else {
            $stmt->bind_param("ss", $academic_year, $role);
        }
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