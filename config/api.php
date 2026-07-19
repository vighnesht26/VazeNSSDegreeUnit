<?php
include 'connect.php';
session_start();

 
header('Content-Type: application/json');


if (isset($_SESSION['admin_id'])) {
    echo json_encode([
        'success' => true,
        'name'    => $_SESSION['name']. ' ' .  $_SESSION['lname'],
        'role'    => $_SESSION['role'] 
    ]);
} else {
    echo json_encode([
        'success' => false,
        'name'    => 'Guest',
        'role'    => 'Unauthorized'
    ]);
}
exit();
?>

?>