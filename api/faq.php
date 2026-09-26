<?php
header("Content-Type: application/json");
require_once "../config/connect.php";
session_start();

$action =$_GET['action'] ?? ($_POST['action'] ?? '');$input = json_decode(file_get_contents("php://input"), true);
if (!empty($input['action'])) {
    $action =$input['action'];
}

switch ($action) {

    case 'ask_question':
        $question = trim($input['question'] ?? '');

        if (empty($question)) {
            echo json_encode(['success' => false, 'error' => 'Question cannot be empty.']);
            exit;
        }

        $stmt =$conn->prepare("INSERT INTO faq (question) VALUES (?)");
        $stmt->bind_param("s", $question);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Question submitted successfully!']);
        } else {
            echo json_encode(['success' => false, 'error' => $stmt->error]);
        }
        $stmt->close();
        exit;

    case 'get_faqs':
        $sql = "SELECT f_id, question, answer FROM faq WHERE answer IS NOT NULL AND answer != '' ORDER BY f_id DESC";
        $result = $conn->query($sql);
        $faqs =$result->fetch_all(MYSQLI_ASSOC);

        echo json_encode(['success' => true, 'data' => $faqs]);
        exit;

    case 'get_unanswered':
        $sql = "SELECT f_id, question FROM faq WHERE answer IS NULL OR answer = '' ORDER BY f_id ASC";
        $result = $conn->query($sql);
        $unanswered =$result->fetch_all(MYSQLI_ASSOC);

        echo json_encode(['success' => true, 'data' => $unanswered]);
        exit;

    case 'submit_answer':
        $isLeader = isset($_SESSION['std_id'], $_SESSION['role']) && $_SESSION['role'] === 'Leader';
        $leaderId = $_SESSION['std_id'];
        $fId =$input['f_id'] ?? null;
        $answer = trim($input['answer'] ?? '');

        if (!$isLeader) {
            echo json_encode(['success' => false, 'error' => 'Unauthorized. Leader login required.']);
            exit;
        }

        

        $stmt =$conn->prepare("UPDATE faq SET answer = ?, ans_by = ? WHERE f_id = ?");
        $stmt->bind_param("sii", $answer, $leaderId,$fId);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Answer saved successfully.']);
        } else {
            echo json_encode(['success' => false, 'error' => $stmt->error]);
        }
        $stmt->close();
        exit;
}