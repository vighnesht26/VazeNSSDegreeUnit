<?php
session_start(); 
header('Content-Type: application/json');
include '../config/connect.php';

$response = [
    'success' => false,
    'data' => [],
    'error' => ''
];

if (isset($_SESSION['admin_id']) || (isset($_SESSION['std_id']) && isset($_SESSION['role']) && $_SESSION['role'] === 'Leader'))
    {
    $input = file_get_contents("php://input");
   
    $data = json_decode($input, true);
    

    

    if (!is_array($data) || !isset($data['id'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Missing or invalid event ID."]);
        exit();
    }

    $eventID = intval($data['id']);

    try{
        $sql ="SELECT * FROM event WHERE event_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $eventID);

        $stmt->execute();
        $result = $stmt->get_result();
        $event = $result->fetch_assoc(); 
        $stmt->close();

        if ($event) {
            $response['success'] = true;
            $response['data'] = $event;
        } else {
            $response['error'] = 'Event not found.';
        }

    } catch (Exception $e) {
        $response['error'] = $e->getMessage();
    }
    
    $conn->close();
} else {
    http_response_code(403);
    $response['error'] = 'Unauthorized access';
}

echo json_encode($response);
exit();
        
        
        
    



?>