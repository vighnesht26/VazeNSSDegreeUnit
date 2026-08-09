<?php
session_start();
header('Content-Type: application/json');
include '../config/connect.php';

$response = [
    'success' => false,
    'data' => null,
    'error' => ''
];


if (!isset($_SESSION['std_id'])) {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Unauthorized access."]);
    exit();
}

$stdID = intval($_SESSION['std_id']);


$action = $_GET['action'] ?? '';
$input = file_get_contents("php://input");
$data = json_decode($input, true) ?? [];

if (empty($action) && isset($data['action'])) {
    $action = $data['action'];
}

switch ($action) {

    case 'get_active_event':
        try{
            $sql =  "SELECT * FROM event WHERE LOWER(status) = 'active'
            ORDER BY date ASC";
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $result = $stmt->get_result();

            $response['success'] = true;
            $response['data'] = $result->fetch_all(MYSQLI_ASSOC);
            $stmt->close();
        }catch (Exception $e) {
            $response['error'] = $e->getMessage();
        }
        break;
    case 'register_event':
        if (!isset($data['event_id'])) {
            http_response_code(400);
            $response['error'] = 'Missing event ID.';
            break;
        }

        $eventID = intval($data['event_id']);

        try {
           
            $checkSql = "SELECT attendance_no FROM attendance WHERE event_id = ? AND student_id = ?";
            $checkStmt = $conn->prepare($checkSql);
            $checkStmt->bind_param("ii", $eventID, $stdID);
            $checkStmt->execute();

            if ($checkStmt->get_result()->num_rows > 0) {
                $response['error'] = 'You have already registered for this event.';
            } else {
              
                $insertSql = "INSERT INTO attendance (event_id, attendance_no, student_id, isabsent) 
                            VALUES (
                                ?, 
                                (SELECT COALESCE(MAX(a.attendance_no), 0) + 1 FROM attendance a WHERE a.event_id = ?), 
                                ?, 
                                'Yes'
                            )";
                
                $insertStmt = $conn->prepare($insertSql);
                $insertStmt->bind_param("iii", $eventID, $eventID, $stdID);

                if ($insertStmt->execute()) {
                    $response['success'] = true;
                } else {
                    $response['error'] = 'Failed to register for the event.';
                }
                $insertStmt->close();
            }
            $checkStmt->close();
        } catch (Exception $e) {
            $response['error'] = $e->getMessage();
        }
        break;


    default:
        http_response_code(400);
        $response['error'] = 'Invalid or missing API action.';
        break;

}
$conn->close();
echo json_encode($response);
exit();
?>