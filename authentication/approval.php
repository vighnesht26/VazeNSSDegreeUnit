<?php
header('Content-Type: application/json');
session_start();

include '../config/connect.php';
require_once '../config/function.php';

$isLeader = isset($_SESSION['std_id'], $_SESSION['role']) && $_SESSION['role'] === 'Leader';

if (!$isLeader) {
    http_response_code(403);
    
    echo json_encode(['error' => 'Unauthorized access.']);
    exit();
}

$leader_id = $_SESSION['std_id'];

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $query = "SELECT s.std_id,s.first_name,s.surname,s.email,s.mobile,a.class, a.program,a.division,a.roll_no
            FROM student s
            INNER JOIN academic_details a ON s.std_id = a.student_id
            WHERE s.approved_by IS NULL
            ORDER BY s.std_id ASC
        ";

        $result = $conn->query($query);
        $pendingStudents = $result->fetch_all(MYSQLI_ASSOC);
        

        echo json_encode([
            'success' => true,
            'data'    => $pendingStudents
        ]);
    } catch (mysqli_sql_exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch pending approvals: ' . $e->getMessage()]);
    }
    $conn->close();
    exit();
}

//by leader
if ($method === 'POST') {
    $action     = trim($_POST['action'] ?? '');
    $student_id = (int)($_POST['std_id'] ?? 0);

    if (!$student_id || !in_array($action, ['approve', 'reject'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid parameters. Action must be "approve" or "reject".']);
        exit();
    }

    try {
        $conn->begin_transaction();

        $checkStmt = $conn->prepare("SELECT first_name, mobile, email FROM student WHERE std_id = ? AND approved_by IS NULL FOR UPDATE");
        $checkStmt->bind_param("i", $student_id);
        $checkStmt->execute();
        $res = $checkStmt->get_result();
        $student = $res->fetch_assoc();
        $checkStmt->close();

        if (!$student) {
            $conn->rollback();
            http_response_code(404);
            echo json_encode(['error' => 'Student record not found or already processed.']);
            exit();
        }

        // LEADER APPROVES
        if ($action === 'approve') {
            
            $generatedUsername = generateUniqueUsername($conn, $student['first_name'], $student['mobile']);

            
            $updateStmt = $conn->prepare("UPDATE student SET username = ?, approved_by = ? WHERE std_id = ?");
            $updateStmt->bind_param("sii", $generatedUsername, $leader_id, $student_id);
            $updateStmt->execute();
            $updateStmt->close();

            $conn->commit();
            sendVolunteerUsernameEmail($student['email'], $student['first_name'], $generatedUsername);

            echo json_encode([
                'success'  => true,
                // 'message'  => "Student approved successfully. Username generated: {$generatedUsername}",
                // 'username' => $generatedUsername
            ]);
        }

        //LEADER REJECTS
        if ($action === 'reject') {
            $delAcc = $conn->prepare("DELETE FROM academic_details WHERE student_id = ?");
            $delAcc->bind_param("i", $student_id);
            $delAcc->execute();
            $delAcc->close();

            $delStd = $conn->prepare("DELETE FROM student WHERE std_id = ?");
            $delStd->bind_param("i", $student_id);
            $delStd->execute();
            $delStd->close();

            $conn->commit();

            echo json_encode([
                'success' => true,
                'message' => 'Registration rejected and application removed.'
            ]);
        }

    } catch (mysqli_sql_exception $e) {
        $conn->rollback();
        http_response_code(500);
        echo json_encode(['error' => 'Database operation failed: ' . $e->getMessage()]);
    }

    $conn->close();
    exit();
}

http_response_code(405);
echo json_encode(['error' => 'Method Not Allowed']);
exit();
