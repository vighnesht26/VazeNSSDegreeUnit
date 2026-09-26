<?php
session_start();
header('Content-Type: application/json');
require '../config/connect.php';

$action = $_GET['action'] ?? '';
$input  = file_get_contents("php://input");
$data   = json_decode($input, true);

if (empty($action) && isset($data['action'])) {
    $action = $data['action'];
}

switch ($action) {
    
    case 'get_registration_status':
        $sql = "SELECT status FROM settings WHERE field = 'registration_status'";
       $result = $conn->query($sql);
        $status = 'open';

        if ($result && $row = $result->fetch_assoc()) {
            $status = strtolower($row['status']);
        }

        echo json_encode([
            'success' => true,
            'status'  => $status
        ]);
        $conn->close();
        exit();

    case 'toggle_registration':
       

        $newStatus = strtolower(trim($data['status'] ?? ''));
        if (!in_array($newStatus, ['open', 'closed'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid status']);
            exit();
        }

        $stmt = $conn->prepare("INSERT INTO settings(field, status) 
                                VALUES ('registration_status', ?) 
                                ON DUPLICATE KEY UPDATE status = ?");
        $stmt->bind_param("ss", $newStatus, $newStatus);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'status' => $newStatus]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $conn->error]);
        }

        $stmt->close();
        $conn->close();
        exit();

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid action']);
        exit();
}