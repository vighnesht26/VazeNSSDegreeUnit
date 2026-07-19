<?php
session_start();
include '../config/connect.php';

if (!isset($_SESSION['clg_id'])) {
    die("Unauthorized access. Please log in first.");
}

if(isset($_POST['a_submit'])){
    $fname = $_POST['a_fname'];
    $lname = $_POST['a_lname'];
    $email = $_POST['a_email'];
    $mobile = $_POST['a_mobile'];
    $pass= $_POST['a_pass'];
    $po = $_POST['a_po'] ?? null;
    $cm = $_POST['a_cm'] ?? null;
    $clg = $_SESSION['clg_id'];
    $role="";
    $username = $email;

    if($po){
        $role = $po;
    }
    elseif($cm){
        $role = $cm;
    }

    $hashpass = password_hash($pass , PASSWORD_DEFAULT);

    $stmt = "INSERT INTO Admin(username, first_name, last_name, email, mobile, password, role, clg_id ) VALUES('$username', '$fname','$lname','$email','$mobile','$hashpass','$role' ,'$clg')";
    if($conn->query($stmt)){
        header('Location: ./login.html');
        
    }
    else{
        echo "Not rehistered";
    }
    $stmt->close();
}
$conn->close();
?>