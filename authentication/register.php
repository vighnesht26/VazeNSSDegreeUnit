<?php
header('Content-Type: application/json'); 
session_start();
require '../config/connect.php';

if (!isset($_SESSION['clg_id'])) {
    http_response_code(401);
   echo json_encode(['success' => false, 'error' => 'Unauthorized access. Please login first.']);
    exit();
}

if($_SERVER['REQUEST_METHOD'] === 'POST'){
    $fname = trim($_POST['a_fname'] ?? '');
    $lname = trim($_POST['a_lname'] ?? '');
    $email = trim($_POST['a_email'] ?? '');
    $mobile = trim($_POST['a_mobile'] ?? '');
    $pass= trim($_POST['a_pass'] ?? '');
    
    $clg = $_SESSION['clg_id'];
    $role= $_POST['role'];

    $msg = ['success'=>false, 'message'=>'', 'error'=>' ' ];
//Validations
     if (empty($fname)) {
        $msg['error'] = "Name is required.";
    } elseif (!preg_match("/^[A-Za-z]+$/", $fname)) {
         $msg['error'] = "Name should not contain any digit or special character";
    }

     if (empty($lname)) {
         $msg['error'] = "Last name is required.";
    } elseif (!preg_match("/^[A-Za-z]+$/", $lname)) {
         $msg['error'] = "Last Name should not contain any digit or special character";
    }

    if (empty($email)) {
        $msg['error'] = "Email address is required.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $msg['error'] = "Please enter a valid email format.";
    }

     $username = generateAdminUsername($conn,$fname,$mobile); 
    }
            
        
        
    
    
   
    $hashpass = password_hash($pass , PASSWORD_DEFAULT);
     
try{
    $stmt = $conn->prepare("INSERT INTO Admin(username, first_name, last_name, email, mobile, password, role, clg_id ) VALUES(?,?,?,?,?,?,?,?)");
    $stmt->bind_param("sssssssi", $username, $fname, $lname, $email, $mobile, $hashpass, $role, $clg);
    if($stmt->execute()){
        http_response_code(200);
        $msg['success'] = true;   
        $msg['message'] = "Registered Successfully Your Username is {$username}";
    }
   $stmt->close();
}
catch(Exception $e){
    if($e->getCode() === 1062){
        http_response_code(409);

        $error = $e->getMessage();
        if(str_contains($error,'mobile')){
            $msg['error']= "Mobile Number already exists!";
        }
        else{
            $msg['error'] = "Different Error". $e->getMessage();
        }
    }
    else{
        http_response_code(500);
        $msg['error'] = "A server error occurred. Please try again later.";
    }
    
}
     echo json_encode($msg);
     $conn->close();
        exit();


function generateAdminUsername(mysqli $conn, string $name, string $mobile): string {
    $cleanName = strtolower(preg_replace('/[^a-zA-Z]/', '', $name));
    if (strlen($cleanName) < 4) {
        $cleanName .= 'user';
    }
    
    
    $suffix = substr($mobile, -3);
    $baseUsername = $cleanName . $suffix;
    $username = $baseUsername;
    $counter = 1;

    $stmt = $conn->prepare("SELECT 1 FROM admin WHERE username = ? LIMIT 1");

    while (true) {
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $res = $stmt->get_result();

        if ($res->num_rows === 0) {
            break;
        }

        
        $username = $baseUsername . '' . $counter;
        $counter++;
    }

    $stmt->close();
    return $username;
}
?>