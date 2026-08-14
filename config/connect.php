<?php

//docker
// $server = 'db'; 
// $username = 'root';
// $password = 'rootpassword';
// $dbname = 'vazenssdegreeunit';

// $server= "Localhost";
// $username = "root";
// $password = "";
// $dbname = "vazenssdegreeunit";

// $conn = new mysqli($server, $username, $password, $dbname);

// if($conn->connect_error){   
//     die("connection failed, <br> Please try again." );


// }


//render..TiDB


$host = getenv('DB_HOST');
$port = (int) getenv('DB_PORT');
$user = getenv('DB_USER');
$password = getenv('DB_PASSWORD');
$database = getenv('DB_NAME');

$conn = mysqli_init();

mysqli_ssl_set(
    $conn,
    null,
    null,
    '/etc/secrets/ca.pem',
    null,
    null
);

if (!mysqli_real_connect(
    $conn,
    $host,
    $user,
    $password,
    $database,
    $port
)) {
    die("Database connection failed: " . mysqli_connect_error());
}

mysqli_set_charset($conn, "utf8mb4");
?>