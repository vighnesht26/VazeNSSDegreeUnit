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

switch ($action) {

    case 'get_active_event':
        try{
            $sql =  "SELECT * FROM event WHERE LOWER(status) = 'active'
            ORDER BY date ASC";
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $result = $stmt->get_result();

            echo json_encode(['success' => true,'data' => $result->fetch_all(MYSQLI_ASSOC)]);
            $stmt->close();
        }catch (Exception $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;
    case 'register_event':
        if (!isset($data['event_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing event ID.']);
            break;
        }

        $eventID = intval($data['event_id']);

        try {
           
            $checkSql = "SELECT attendance_no FROM attendance WHERE event_id = ? AND student_id = ?";
            $checkStmt = $conn->prepare($checkSql);
            $checkStmt->bind_param("ii", $eventID, $stdID);
            $checkStmt->execute();

            if ($checkStmt->get_result()->num_rows > 0) {
                echo json_encode(['error' => 'You have already registered for this event.']);
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
                    echo json_encode(['success' => true]);
                } else {
                    echo json_encode(['error' => 'Failed to register for the event.']);
                }
                $insertStmt->close();
            }
            $checkStmt->close();
        } catch (Exception $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;
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

            
            $e_stmt = $conn->prepare("SELECT event_id, name, date,feedback_status FROM event WHERE event_id = ?");
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
            $chk_stmt = $conn->prepare("SELECT r.r_id FROM response r JOIN feedback f ON r.q_id = f.q_id
                WHERE (f.event_id = ? OR f.event_id IS NULL) AND r.ans_by = ?
                LIMIT 1
            ");
            $chk_stmt->bind_param("ii", $eventID, $studentId);
            $chk_stmt->execute();
            $already_submitted = $chk_stmt->get_result()->num_rows > 0;
            $chk_stmt->close();

            //questions belonging to this event
            $q_stmt = $conn->prepare("SELECT q_id, question, q_type,option_a,option_b,option_c,option_d, event_id FROM feedback WHERE event_id = ? OR event_id IS NULL ORDER BY q_id ASC");
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
            break;
        case 'get_academic_details':
                $currentMonth = (int)date('n');
                $currentYear  = (int)date('Y');
                $startYear    = ($currentMonth >= 6) ? $currentYear : $currentYear - 1;
                $endYearShort = substr((string)($startYear + 1), -2);
                $targetAcademicYear = "{$startYear}-{$endYearShort}";

                
                $sql = "SELECT s.username, s.first_name, s.surname,
                            ad.class AS Class, ad.nss_year, ad.program AS Program, 
                            ad.division AS Division, ad.roll_no, ad.academic_year
                        FROM student s
                        LEFT JOIN academic_details ad ON s.std_id = ad.student_id
                        WHERE s.std_id = ?
                        ORDER BY ad.academic_year DESC 
                        LIMIT 1";

                $stmt = $conn->prepare($sql);
                $stmt->bind_param("i", $studentId);
                $stmt->execute();
                $details = $stmt->get_result()->fetch_assoc();
                $stmt->close();

                if ($details) {
                    $lastClass     = strtoupper(trim($details['Class'] ?? ''));
                    $lastNssYear   = strtoupper(trim($details['nss_year'] ?? ''));
                    $lastYear      = trim($details['academic_year'] ?? '');

                    
                    $alreadyRegistered = ($lastYear === $targetAcademicYear);

                    
                    $isCompleted = ($lastClass === 'TY' || $lastNssYear === 'TY');

                    echo json_encode([
                        'success'            => true,
                        'name'               => trim(($details['first_name']) . ' ' . ($details['surname'])),
                        'Class'              => $details['Class'],
                        'nss_year'           => $details['nss_year'],
                        'Program'            => $details['Program'] ,
                        'Division'           => $details['Division'] ,
                        'roll_no'            => $details['roll_no'] ,
                        'academic_year'      => $lastYear,
                        'target_year'        => $targetAcademicYear,
                        'already_registered' => $alreadyRegistered,
                        'is_completed'       => $isCompleted,
                        'can_progress'       => (!$alreadyRegistered && !$isCompleted)
                    ]);
                } else {
                    echo json_encode(['success' => false, 'error' => 'Academic records not found.']);
                }
                break;

        case 'update_academic_details':
            $division = strtoupper(trim($data['division'] ?? ''));
            $rollNo   = trim($data['roll_no'] ?? '');

            if (empty($division) || empty($rollNo)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Division and roll number are required.']);
                break;
            }

           
            $currentMonth = (int)date('n');
            $currentYear  = (int)date('Y');
            $startYear    = ($currentMonth >= 6) ? $currentYear : $currentYear - 1;
            $endYearShort = substr((string)($startYear + 1), -2);
            $targetAcademicYear = "{$startYear}-{$endYearShort}";

           
            $histSql = "SELECT class, nss_year, program, academic_year 
                        FROM academic_details 
                        WHERE student_id = ? 
                        ORDER BY academic_year DESC 
                        LIMIT 1";

            $histStmt = $conn->prepare($histSql);
            $histStmt->bind_param("i", $studentId);
            $histStmt->execute();
            $latestRecord = $histStmt->get_result()->fetch_assoc();
            $histStmt->close();

            if (!$latestRecord) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'No initial academic record found.']);
                break;
            }

            $lastClass   = strtoupper(trim($latestRecord['class']));
            $lastNssYear = strtoupper(trim($latestRecord['nss_year']));
            $lastYear    = trim($latestRecord['academic_year']);
            $program     = trim($latestRecord['program']);

            // If already at TY
            if ($lastClass === 'TY' || $lastNssYear === 'TY') {
                http_response_code(400);
                echo json_encode([
                    'success' => false, 
                    'error'   => 'NSS tenure concludes at TY. Further academic advancement is not allowed.'
                ]);
                break;
            }

            // Already enrolled in the current academic year
            if ($lastYear === $targetAcademicYear) {
                http_response_code(400);
                echo json_encode([
                    'success' => false, 
                    'error'   => "Academic details for {$targetAcademicYear} are already registered."
                ]);
                break;
            }

            // Next Academic Class & NSS Year
            $nextClass   = ($lastClass === 'FY') ? 'SY' : 'TY';
            $nextNssYear = ($lastNssYear === 'FY') ? 'SY' : 'TY';

            $insertSql = "INSERT INTO academic_details 
                        (student_id, academic_year, nss_year, class, program, division, roll_no, total_hrs)
                        VALUES (?, ?, ?, ?, ?, ?, ?, 0.0)";

            $insStmt = $conn->prepare($insertSql);
            if (!$insStmt) {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Database error preparing insertion.']);
                break;
            }

            $insStmt->bind_param("issssss", $studentId, $targetAcademicYear, $nextNssYear, $nextClass, $program, $division, $rollNo);

            if ($insStmt->execute()) {
                echo json_encode([
                    'success'       => true, 
                    'next_class'    => $nextClass,
                    'next_nss_year' => $nextNssYear,
                    'academic_year' => $targetAcademicYear,
                    'message'       => "Successfully promoted to {$nextClass} (NSS Year: {$nextNssYear}) for {$targetAcademicYear}."
                ]);
            } else {
                if ($conn->errno === 1062) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => "A record for academic year {$targetAcademicYear} already exists."]);
                } else {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'error' => $insStmt->error]);
                }
            }

            $insStmt->close();
            break;
        default:
            http_response_code(400);
            $response['error'] = 'Invalid or missing API action.';
            break;

}
$conn->close();

exit();
?>