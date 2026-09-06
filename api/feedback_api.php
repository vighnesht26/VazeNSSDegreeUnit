<?php
session_start();
header('Content-Type: application/json');
include '../config/connect.php';


$isStudent = isset($_SESSION['std_id']);
$studentId = $_SESSION['std_id'];

if (!$isStudent || !$studentId) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Unauthorized access.']);
    exit();
}

$action = $_GET['action'] ?? '';
$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (empty($action) && isset($data['action'])) {
    $action = $data['action'];
}

$eventID = $_GET['id'] ?? ($data['id'] ?? 0);
$eventID = intval($eventID);

function requireEventID($id) {
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Missing or invalid event ID."]);
        exit();
    }
}

try {
    switch ($action) {
        case 'showfeedbacks':
            
            $std_id = intval($studentId);

            $sql = "SELECT e.event_id, e.name, e.date, e.venue, e.feedback_status
                FROM event e
                INNER JOIN attendance a 
                    ON e.event_id = a.event_id 
                    AND a.student_id = ? 
                    AND a.isabsent = 'no'
                WHERE e.feedback_status = 'Active'
                AND NOT EXISTS (
                    SELECT 1 
                    FROM response r
                    JOIN feedback f ON r.q_id = f.q_id
                    WHERE f.event_id = e.event_id
                        AND r.ans_by = ?
                )
                ORDER BY e.date DESC
            ";

            try {
                $stmt = $conn->prepare($sql);
                if (!$stmt) {
                    throw new Exception("SQL Prepare failed: " . $conn->error);
                }

                $stmt->bind_param("ii", $std_id, $std_id);
                $stmt->execute();
                $result = $stmt->get_result();
                $feedbacks = $result->fetch_all(MYSQLI_ASSOC);
                $stmt->close();

                echo json_encode([
                    'success' => true,
                    'data'    => $feedbacks
                ]);
                exit();
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'error'   => 'Database error: ' . $e->getMessage()
                ]);
                exit();
            }
        case 'get_feedback_questions':
            requireEventID($eventID);

            
            $e_stmt = $conn->prepare("SELECT event_id, name, date FROM event WHERE event_id = ?");
            $e_stmt->bind_param("i", $eventID);
            $e_stmt->execute();
            $event = $e_stmt->get_result()->fetch_assoc();
            $e_stmt->close();

            if (!$event) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Event not found.']);
                exit();
            }

            if (strcasecmp($event['feedback_status'], 'Active') !== 0) {
                http_response_code(403);
                echo json_encode([
                    'success' => false, 
                    'error' => 'Feedback for this event is currently closed or not yet activated.',
                    'feedback_status' => $event['feedback_status']
                ]);
                exit();
            }
            //  Check if student already submitted feedback
            $chk_stmt = $conn->prepare("SELECT r.r_id FROM response r JOIN question q ON r.q_id = q.q_id
                WHERE (q.event_id = ? OR q.event_id IS NULL) AND r.ans_by = ?
                LIMIT 1
            ");
            $chk_stmt->bind_param("ii", $eventID, $studentId);
            $chk_stmt->execute();
            $already_submitted = $chk_stmt->get_result()->num_rows > 0;
            $chk_stmt->close();

            //questions belonging to this event
            $q_stmt = $conn->prepare("SELECT q_id, question, q_type, event_id FROM question WHERE event_id = ? OR event_id IS NULL ORDER BY q_id ASC");
            $q_stmt->bind_param("i", $eventID);
            $q_stmt->execute();
            $questions = $q_stmt->get_result()->fetch_all(MYSQLI_ASSOC);
            $q_stmt->close();

            echo json_encode([
                'success' => true,
                'event' => $event,
                'already_submitted' => $already_submitted,
                'questions' => $questions
            ]);
            exit();

        case 'submit_feedback':
            requireEventID($eventID);
            $responses = $data['responses'] ?? [];

            if (empty($responses) || !is_array($responses)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'No responses provided.']);
                exit();
            }

            

            $conn->begin_transaction();
            try {
                $ins_stmt = $conn->prepare("INSERT INTO response (answer, q_id, ans_by) VALUES (?, ?, ?)");
                if (!$ins_stmt) {
                    throw new Exception("Prepare failed: " . $conn->error);
                }

                foreach ($responses as $item) {
                    $q_id = intval($item['q_id']);
                    $ans = trim($item['answer'] ?? '');
                    $ins_stmt->bind_param("sii", $ans, $q_id, $studentId);
                    $ins_stmt->execute();
                }
                $ins_stmt->close();

                $conn->commit();
                echo json_encode(['success' => true, 'message' => 'Feedback submitted successfully.']);
                exit();
            } catch (Exception $e) {
                $conn->rollback();
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Failed to save responses: ' . $e->getMessage()]);
                exit();
            }

        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid action.']);
            exit();
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    exit();
}