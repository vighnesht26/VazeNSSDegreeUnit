<?php

session_start();

include '../config/connect.php';
header('Content-Type: application/json');
// login
if($_SERVER['REQUEST_METHOD']==='POST'){
    $name = $_POST['c_name'];
    $pass = $_POST['c_pass'];
   

    $Jresponse = ['success'=>false,'error'=>'', 'location'=>''];
    
    //$hashpass = password_hash($pass, PASSWORD_DEFAULT);

    // $sql = "INSERT INTO college (name , password) VALUES('$name', '$hashpass')";
    // if($conn->query($sql)=== TRUE){
    //     echo "Recorded";
    // }
    // else{
    //     echo "not recorded";
    // }
  try{
      $sql1 =$conn->prepare( "SELECT clg_id, password FROM college where name = ?");
      $sql1->bind_param("s",$name);
      $sql1->execute();

      $result1 = $sql1->get_result();

      if($row = $result1->fetch_assoc()){
              

          if($pass === $row['password']) {
              $Jresponse['success'] = true; 
              $_SESSION['clg_id'] = $row['clg_id'];
              $Jresponse['location'] = 'adminregister.html';
                  
          } 
          else{
              $Jresponse['error'] = 'Password is wrong';
          }
            $sql1->close();
          
      }
      else{
          $sql1->close();

            //check admin
          $sql2 =$conn->prepare( "SELECT admin_id,username,first_name,last_name, role ,password FROM admin WHERE username = ?");
          $sql2->bind_param("s",$name);
          $sql2->execute();

          $result2 = $sql2->get_result();

          //admin
          if($row = $result2->fetch_assoc()){
                $dbpass = $row['password'];

                if (password_verify($pass, $dbpass)) {
                  $_SESSION['admin_id'] = $row['admin_id'];
                  // $_SESSION['name'] = $row['first_name'];
                  // $_SESSION['lname']= $row['last_name'];
                  // $_SESSION['role'] = $row['role'];
                  // $_SESSION['a_username'] = $row['username'];

                  $Jresponse['success'] = true; 
                  $Jresponse['location'] = '../Dashboard/dashboardadmin.html';
                
              } else {
                  $Jresponse['error'] = 'Password is wrong';
                
              }
              $sql2->close();
          }
          else{ 
              $sql2->close();

              //check student
              $sql3 =$conn->prepare( "SELECT std_id,password,role FROM student WHERE username = ?");
              $sql3->bind_param("s",$name);
              $sql3->execute();
              $result3 = $sql3->get_result();

              if($row = $result3->fetch_assoc()){
                $dbpass = $row['password'];

                if (password_verify($pass, $dbpass)) {
                  $_SESSION['std_id'] = $row['std_id'];
                  $_SESSION['role'] = $row['role'];
                  
                  $Jresponse['success'] = true; 

                  if($_SESSION['role'] === 'Volunteer'){
                  $Jresponse['location'] = '../Dashboard/dashboardstudent.html';
                  }else if($_SESSION['role'] === 'Leader'){
                    $Jresponse['location'] = '../Dashboard/dashboardadmin.html';
                  }
                
                } 
                else{ 
                  $Jresponse['error'] = 'Password is wrong';
                
                }
                $sql3->close();
              }
              else{
                  $sql3->close();
                  $Jresponse['error'] = 'Username does not exist';
              }
            }
        }
  
  }
  catch(Exception $e){
    $Jresponse['error']= 'Error'. $e->getMessage();
  }
echo json_encode($Jresponse);
    $conn->close();
    exit();
} 
    

