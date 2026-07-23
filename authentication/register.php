<?php
header('Content-Type: application/json'); 
session_start();
include '../config/connect.php';

if (!isset($_SESSION['clg_id'])) {
   echo json_encode(['success' => false, 'error' => 'Unauthorized access. Please login first.']);
    exit();
}

if($_SERVER['REQUEST_METHOD'] === 'POST'){
    $fname = $_POST['a_fname'];
    $lname = $_POST['a_lname'];
    $email = $_POST['a_email'];
    $mobile = $_POST['a_mobile'];
    $pass= $_POST['a_pass'];
    $po = $_POST['a_po'] ?? null;
    $cm = $_POST['a_cm'] ?? null;
    $clg = $_SESSION['clg_id'];
    $role="";
    $username = $fname. "@123";

    if($po){
        $role = $po;
    }
    elseif($cm){
        $role = $cm;
    }
   
    $hashpass = password_hash($pass , PASSWORD_DEFAULT);
     $msg = ['success'=>false, 'error'=>' ' ];
try{
    $stmt = $conn->prepare("INSERT INTO Admin(username, first_name, last_name, email, mobile, password, role, clg_id ) VALUES(?,?,?,?,?,?,?,?)");
    $stmt->bind_param("sssssssi", $username, $fname, $lname, $email, $mobile, $hashpass, $role, $clg);
    if($stmt->execute()){
        $msg['success'] = true;    
    }
    else{
        $msg['error'] = "Error". $stmt->error;
        
    }$stmt->close();
}
catch(Exception $e){
    $msg['error'] = "System Error". $e->getMessage();
}if (!isset($msg)) {
    $msg = ['success' => false, 'error' => 'No data submitted'];
}
     echo json_encode($msg);
     $conn->close();
        exit();
}

?>