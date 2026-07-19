<?php
session_start();
include '../config/connect.php';

//college login
if(isset($_POST['c_submit'])){
    $name = $_POST['c_name'];
    $pass = $_POST['c_pass'];
    $loginfor = $_POST['loginfor'];

    //$hashpass = password_hash($pass, PASSWORD_DEFAULT);

    // $sql = "INSERT INTO college (name , password) VALUES('$name', '$hashpass')";
    // if($conn->query($sql)=== TRUE){
    //     echo "Recorded";
    // }
    // else{
    //     echo "not recorded";
    // }
    if($loginfor == 'College'){
    $sql =$conn->prepare( "SELECT clg_id, password FROM college where name = ?");
    $sql->bind_param("s",$name);
    $sql->execute();

    $result = $sql->get_result();

    if($row = $result->fetch_assoc()){
         

         if ($pass === $row['password']) {
            $_SESSION['clg_id'] = $row['clg_id'];
            header("Location: ./adminregister.html");
            exit();
        } else {
            echo "Invalid password.";
        }

    
    }
    else{
        echo "Username not found";
    }
  $sql->close();  

}
//TO assign
  if($loginfor == 'Admin'){
    $sql =$conn->prepare( "SELECT admin_id,first_name,role ,password FROM admin WHERE username = ?");
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
             header("Location: ../Dashboard/dashboardadmin.html");
             exit();
         } else {
            echo "Invalid password.";
         }

    
     }
     else{
         echo "Username not found";
     }
   $sql->close();  

 }

}
$conn->close();