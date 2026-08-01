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

    

    
    
            
        
        
    $msg = ['success'=> false, 'message'=>'', 'error'=>' ' ];
    
   
    $hashedpass = password_hash($passwd , PASSWORD_DEFAULT);

try{$username = generateUsername($name);
    $sql = $conn->prepare("SELECT 1 FROM student WHERE username = ?");
    while (true) {
        $sql->bind_param("s", $username);
        $sql->execute();
        $res = $sql->get_result();

         if ($res->num_rows === 0) {
            break; 
        }

        
        $username = generateUsername($name); 
    }
    $sql->close();

    $stmt = $conn->prepare("INSERT INTO student(username, first_name, father_name, mother_name, surname, email, gender, mobile,blood_grp, caste, dob, password, role ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)");
    $stmt->bind_param("sssssssssssss", $username, $name,$fname,$mname,$sname, $email,$gender, $mobile,$bloodgrp,$caste,$DOB, $hashedpass, $role);
    $stmt->execute();

        $std_id = $conn->insert_id;
        $stmt2 = $conn->prepare("INSERT INTO   academic_details(student_id, academic_year,nss_year,class,program,division,roll_no) VALUES(?,?,?,?,?,?,?)");
        $stmt2->bind_param("issssss", $std_id, $academic_yr, $NSSyr, $class, $program, $division,$roll);
        if($stmt2->execute()){
        http_response_code(200);
        $msg['success'] = true;   
        $msg['message'] = "Registered Successfully Your Username is {$username}";
        }
        $stmt->close();
        $stmt2->close();
    }
   

catch(Exception $e){
    if($e->getCode() === 1062){
        http_response_code(409);

        $error = $e->getMessage();
        if(str_contains($error,'mobile')){
            $msg['error']= "Mobile Number already exists!";
        }
        else if(str_contains($error,'email')){
            $msg['error']= "email already exists!";
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

}

function generateUsername(string $name): string{
    $maxlen = 15;
    $minlen = 8;
    $uname = $name;
    if(strlen($name) <4){
        $uname = $uname. 'user';
    }
    $remainlen = $maxlen - strlen($uname);
     if($remainlen < 3){
        $uname = substr($uname, 0 , $maxlen - 4);
        $remainlen = 4;
     }
    $minRange = pow(10, max(2, $remainlen - 2)); 
    $maxRange = pow(10,  max(2,$remainlen - 1))-1;

    $usernum = rand( $minRange, $maxRange);
    $username = $uname. $usernum;
    

    return $username;
}


?>