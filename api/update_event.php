<?php

header("Content-Type: application/json; charset=UTF-8");


if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed."]);
    exit();
}


require_once "../config/connect.php"; 


$input = file_get_contents("php://input");
$data = json_decode($input, true);


if (!isset($data['id'])){
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing required fields."]);
    exit();
}
    
    



$eventId    = intval($data['id']);
$eventDate  = isset($data['date']) ? trim($data['date']) : '';
$eventType  = isset($data['event_type']) ? trim($data['event_type']) : '';
$eventVenue = isset($data['venue']) ? trim($data['venue']) : '';
$eventStatus= isset($data['status']) ? trim($data['status']) : '';

try {
    
    $sql = "UPDATE event SET date = COALESCE(NULLIF(?, ''), date), event_type = COALESCE(NULLIF(?, ''), event_type), 
             venue = COALESCE(NULLIF(?, ''), venue),  status = COALESCE (NULLIF( ?, ''), status), updated_at = NOW()
            WHERE event_id = ?";

    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        throw new Exception("Preparation failed: " . $conn->error);
    }

    
    $stmt->bind_param("ssssi", $eventDate, $eventType, $eventVenue, $eventStatus ,$eventId);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode([
                "success" => true,
                "message" => "Event updated successfully."
            ]);
        } else {
            
            echo json_encode([
                "success" => true,
                "message" => "No changes made or event ID not found.",
                "affected_rows" => 0
            ]);
        }
    } else {
        echo json_encode([
            "success" => false,
            "error" => "Execution error: " . $stmt->error
        ]);
    }
    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Database error: " . $e->getMessage()
    ]);
}
?>