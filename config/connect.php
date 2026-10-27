<?php



$server= "Localhost";
$username = "root";
$password = "";
$dbname = "vazenssdegreeunit";

$conn = new mysqli($server, $username, $password, $dbname);

if($conn->connect_error){   
    die("connection failed, <br> Please try again." );


}


// $host     = get_env_var('DB_HOST');
// $port     = (int) get_env_var('DB_PORT', 4000); // TiDB default port is 4000
// $user     = get_env_var('DB_USER');
// $password = get_env_var('DB_PASSWORD');
// $database = get_env_var('DB_NAME');

// error_log("HOST = " . var_export($host, true));
// error_log("PORT = " . var_export($port, true));
// error_log("USER = " . var_export($user, true));
// error_log("DB = " . var_export($database, true));


// $conn = mysqli_init();

// if (!$conn) {
//     die("mysqli_init failed");
// }




// mysqli_options($conn, MYSQLI_OPT_CONNECT_TIMEOUT, 10);


// mysqli_options($conn, MYSQLI_OPT_SSL_VERIFY_SERVER_CERT, false);


// if (!mysqli_real_connect(
//     $conn,
//     $host,
//     $user,
//     $password,
//     $database,
//     $port,
//     null,
//     MYSQLI_CLIENT_SSL
// )) {
//     die("Database connection failed: (" . mysqli_connect_errno() . ") " . mysqli_connect_error());
// }

// mysqli_set_charset($conn, "utf8mb4");
?>
