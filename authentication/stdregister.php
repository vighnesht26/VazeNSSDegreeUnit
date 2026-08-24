<?php
header('Content-Type: application/json'); 
session_start();
include '../config/connect.php';
require_once '../config/function.php';

if($_SERVER['REQUEST_METHOD'] === 'POST'){
    $name = $_POST['y_name'];
    $fname = $_POST['f_name'];
    $mname = $_POST['m_name'];
    $sname = $_POST['s_name'];
    $email = $_POST['s_email'];
    $mobile = $_POST['s_mobile'];
    $DOB = $_POST['s_DOB'];
    $gender = $_POST['s_gender'];
    $bloodgrp = $_POST['bld_grp'];
    $caste = $_POST['s_caste'];
    $NSSyr = $_POST['nssyear'];
    $role = 'volunteer';
    
    $academic_yr = getAcademicYear();
    $class = $_POST['s_class'];
    $program = $_POST['s_program'];
    $division = $_POST['s_div'];
    $roll = $_POST['s_roll'];
    $passwd = $_POST['s_pass'];

    if (empty($name) || empty($email) || empty($mobile) || empty($passwd)) {
    http_response_code(400);
    echo json_encode(['error' => 'All required fields must be filled out.']);
    exit();
    }
 
    $hashedpass = password_hash($passwd , PASSWORD_DEFAULT);


    
    try{

    $conn->begin_transaction();

    $stmt = $conn->prepare("INSERT INTO student( first_name, father_name, mother_name, surname, email, gender, mobile,blood_grp, caste, dob, password, role ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)");
    $stmt->bind_param("ssssssssssss",  $name,$fname,$mname,$sname, $email,$gender, $mobile,$bloodgrp,$caste,$DOB, $hashedpass, $role);
    $stmt->execute();
    $std_id = $conn->insert_id;
    $stmt->close();

    
    $stmt2 = $conn->prepare("INSERT INTO   academic_details(student_id, academic_year,nss_year,class,program,division,roll_no) VALUES(?,?,?,?,?,?,?)");
    $stmt2->bind_param("issssss", $std_id, $academic_yr, $NSSyr, $class, $program, $division,$roll);
    $stmt2->execute();  
    $stmt2->close();

    $conn->commit();

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Registration submitted successfully! Your account will be activated once approved by a leader.'
    ]);
    }
   

catch(Exception $e){
    $conn->rollback();
    if($e->getCode() === 1062){
        http_response_code(409);

        $error = $e->getMessage();
        if(str_contains($error,'mobile')){
           echo json_encode(['error'=> "Mobile Number already exists!"]);
        }
        else if(str_contains($error,'email')){
            echo json_encode(['error'=> "email already exists!"]);
        }
        else{
            echo json_encode(['error' => "Different Error". $e->getMessage()]);
        }
    }
    else{
        http_response_code(500);
        echo json_encode(['error' => "A server error occurred. Please try again later."]);
    }

    
}
     

$conn->close();
exit();

}

?>