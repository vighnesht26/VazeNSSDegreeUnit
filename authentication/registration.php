<?php
include '../config/connect.php';

//college login
if(isset($_POST['c_submit'])){
    $name = $_POST['c_name'];
    $pass = $_POST['c_pass'];

    $hashpass = password_hash($pass, PASSWORD_DEFAULT);

    // $sql = "INSERT INTO college (name , password) VALUES('$name', '$hashpass')";
    // if($conn->query($sql)=== TRUE){
    //     echo "Recorded";
    // }
    // else{
    //     echo "not recorded";
    // }

    $sql =$conn->prepare( "SELECT password FROM college where name = ?");
    $sql->bind_param("s",$name);
    $sql->execute();

    $result = $sql->get_result();

    if($row = $result->fetch_assoc()){
         $dbpass = $row['password'];

         if (password_verify($pass, $dbpass)) {
            header("Location: ./adminregister.html");
        } else {
            echo "Invalid password.";
        }

    
    }
    else{
        echo "Username not found";
    }
  $sql->close();  

}