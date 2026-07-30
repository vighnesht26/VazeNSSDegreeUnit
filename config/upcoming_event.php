<?php
session_start(); 
header('Content-Type: application/json');
include 'connect.php';

$response = [
    'success' => false,
    'data' => [],
    'error' => ''
];


if (isset($_SESSION['admin_id'])) {
    try {
       
        $sql = "SELECT event_id, name, event_type, status, date, venue
                FROM event 
                WHERE status <> 'completed'
                ORDER BY date ASC"; 

        $stmt = $conn->prepare($sql);
        $stmt->execute();
        
        $result = $stmt->get_result();
        
       
        $events = $result->fetch_all(MYSQLI_ASSOC); 
        $stmt->close();

        $response['success'] = true;
        $response['data'] = $events;

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