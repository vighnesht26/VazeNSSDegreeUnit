<?php
$server= "Localhost";
$username = "root";
$password = "";
$dbname = "vazenssdegreeunit";

$conn = new mysqli($server, $username, $password, $dbname);

if($conn->connect_error){   
    die("connection failed, <br> Please try again." );


}
