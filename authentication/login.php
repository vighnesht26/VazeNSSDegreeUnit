<?php
session_start();
include '../config/connect.php';

//college login
if($_SERVER['REQUEST_METHOD']==='POST'){
    $name = $_POST['c_name'];
    $pass = $_POST['c_pass'];
    $loginfor = $_POST['loginfor'];

    $Jresponse = ['success'=>false,'error'=>''];
    //$hashpass = password_hash($pass, PASSWORD_DEFAULT);

    // $sql = "INSERT INTO college (name , password) VALUES('$name', '$hashpass')";
    // if($conn->query($sql)=== TRUE){
    //     echo "Recorded";
    // }
    // else{
    //     echo "not recorded";
    // }
    if($loginfor === 'College'){
    $sql =$conn->prepare( "SELECT clg_id, password FROM college where name = ?");
    $sql->bind_param("s",$name);
    $sql->execute();

    $result = $sql->get_result();

    if($row = $result->fetch_assoc()){
         

         if ($pass === $row['password']) {
            $Jresponse['success'] = true; 
            $_SESSION['clg_id'] = $row['clg_id'];
             $Jresponse['success'] = true;
             $Jrespone['location'] = 'adminregister.html';
            
        } else {
             
            $Jresponse['error'] = 'Password is wrong';
        }

    
    }
    else{
        $Jresponse['error']= "Username not found";
    }
  $sql->close();  

}
//TO admin
  if($loginfor == 'Admin'){
    $sql =$conn->prepare( "SELECT admin_id,username,first_name,last_name, role ,password FROM admin WHERE username = ?");
     $sql->bind_param("s",$name);
     $sql->execute();

     $result = $sql->get_result();

     if($row = $result->fetch_assoc()){
          $dbpass = $row['password'];

          if (password_verify($pass, $dbpass)) {
            $_SESSION['admin_id'] = $row['admin_id'];
            $_SESSION['name'] = $row['first_name'];
            $_SESSION['lname']= $row['last_name'];
            $_SESSION['role'] = $row['role'];
            $_SESSION['a_username'] = $row['username'];
            $Jresponse['success'] = true; 
            $Jresponse['Location'] = '../Dashboard/dashboardadmin.html';
          
         } else {
           
            
            $Jresponse['success'] = false;
            $Jresponse['error'] = 'Password is wrong';
           
         }

    
     }
     else{
         
        
        $Jresponse['error']= "Username not found";
            
     }

   $sql->close();  

 }
    echo json_encode($Jresponse);
    $conn->close();
    exit();
}
