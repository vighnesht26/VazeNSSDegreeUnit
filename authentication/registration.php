<?php
include '../config/connect.php';

//college login
if(isset($_POST['c_submit'])){
    $name = $_POST['c_name'];
    $pass = $_POST['c_pass'];
    $loginfor = $_POST['loginfor'];

    $hashpass = password_hash($pass, PASSWORD_DEFAULT);

    // $sql = "INSERT INTO college (name , password) VALUES('$name', '$hashpass')";
    // if($conn->query($sql)=== TRUE){
    //     echo "Recorded";
    // }
    // else{
    //     echo "not recorded";
    // }
    if($loginfor == 'College'){
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
//TO assign
//  if($loginfor == 'Admin'){
//     $sql =$conn->prepare( "SELECT password FROM ..... where name = ?");
//     $sql->bind_param("s",$name);
//     $sql->execute();

//     $result = $sql->get_result();

//     if($row = $result->fetch_assoc()){
//          $dbpass = $row['password'];

//          if (password_verify($pass, $dbpass)) {
//             header("Location: ");
//         } else {
//             echo "Invalid password.";
//         }

    
//     }
//     else{
//         echo "Username not found";
//     }
//   $sql->close();  

// }
}