<?php
session_start();
header('Content-Type: application/json');
include '../config/connect.php';

$response = [
    'success' => false,
    'error' => ''
];


if (isset($_SESSION['admin_id']) || (isset($_SESSION['std_id']) && isset($_SESSION['role']) && $_SESSION['role'] === 'Leader')) {
    
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);

    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Missing event ID."]);
        exit();
    }

    $eventID = intval($data['id']);

    try {
        
        $sql = "UPDATE event SET status = 'Active' WHERE event_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $eventID);

        if ($stmt->execute()) {
            $response['success'] = true;
        } else {
            $response['error'] = 'Database update failed.';
        }

        $stmt->close();
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