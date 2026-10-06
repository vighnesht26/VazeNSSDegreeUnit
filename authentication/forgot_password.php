<?php
session_start();
header('Content-Type: application/json');

require '../config/connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
    exit();
}

$username   = trim($_POST['username'] ?? ''); 
$email        = trim($_POST['email'] ?? '');
$contact      = trim($_POST['contact'] ?? '');  
$newPassword  = $_POST['new_password'] ?? '';
$confPassword = $_POST['confirm_password'] ?? '';


if (empty($username) || empty($email) || empty($contact) || empty($newPassword)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'All fields are required.']);
    exit();
}

if ($newPassword !== $confPassword) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Passwords do not match.']);
    exit();
}

if (strlen($newPassword) < 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Password must be at least 6 characters.']);
    exit();
}


$stmt = $conn->prepare("SELECT std_id FROM student WHERE username = ? AND email = ? AND mobile = ? LIMIT 1");
$stmt->bind_param("sss", $username, $email, $contact);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$user){
$stmt = $conn->prepare("SELECT admin_id FROM admin WHERE username = ? AND email = ? AND mobile = ? LIMIT 1");
$stmt->bind_param("sss", $username, $email, $contact);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$stmt->close();


if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Verification failed. Provided details do not match our records.']);
    exit();
}


$hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

$updateStmt = $conn->prepare("UPDATE admin SET password = ? WHERE admin_id = ?");
$updateStmt->bind_param("si", $hashedPassword, $user['admin_id']);

if ($updateStmt->execute()) {
    $updateStmt->close();
    echo json_encode(['success' => true, 'message' => 'Password reset successfully! You can now login with your new password.']);
    exit();
} else {
    $updateStmt->close();
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error while updating password.']);
    exit();
}
}



$hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

$updateStmt = $conn->prepare("UPDATE student SET password = ? WHERE std_id = ?");
$updateStmt->bind_param("si", $hashedPassword, $user['std_id']);

if ($updateStmt->execute()) {
    $updateStmt->close();
    echo json_encode(['success' => true, 'message' => 'Password reset successfully! You can now login with your new password.']);
    exit();
} else {
    $updateStmt->close();
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error while updating password.']);
    exit(); 
}