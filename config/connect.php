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



$host     = getenv('DB_HOST');
$port     = (int) (getenv('DB_PORT') ?: 3306); 
$user     = getenv('DB_USER');
$password = getenv('DB_PASSWORD');
$database = getenv('DB_NAME');
$ca_path  = '/etc/secrets/ca.pem';


error_log("HOST = " . var_export($host, true));
error_log("PORT = " . var_export($port, true));
error_log("USER = " . var_export($user, true));
error_log("DB = " . var_export($database, true));
error_log("CA EXISTS = " . (file_exists($ca_path) ? 'YES' : 'NO'));

$conn = mysqli_init();

if (!$conn) {
    die("mysqli_init failed");
}


mysqli_ssl_set(
    $conn,
    null,
    null,
    $ca_path,
    null,
    null
);


mysqli_options($conn, MYSQLI_OPT_CONNECT_TIMEOUT, 10);


if (!mysqli_real_connect(
    $conn,
    $host,
    $user,
    $password,
    $database,
    $port,
    null,
    MYSQLI_CLIENT_SSL
)) {
    die("Database connection failed: (" . mysqli_connect_errno() . ") " . mysqli_connect_error());
}

mysqli_set_charset($conn, "utf8mb4");
?>