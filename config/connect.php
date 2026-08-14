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



function get_env_var($key, $default = null) {
    if (isset($_ENV[$key]) && $_ENV[$key] !== '') {
        return $_ENV[$key];
    }
    if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') {
        return $_SERVER[$key];
    }
    $val = getenv($key);
    return ($val !== false && $val !== '') ? $val : $default;
}

$host     = get_env_var('DB_HOST');
$port     = (int) get_env_var('DB_PORT', 4000); // TiDB default port is 4000
$user     = get_env_var('DB_USER');
$password = get_env_var('DB_PASSWORD');
$database = get_env_var('DB_NAME');

$ca_candidates = [
    '/etc/secrets/ca.pem',                 
                     
    '/etc/ssl/certs/ca-certificates.crt'  
];

$ca_path = null;
foreach ($ca_candidates as $candidate) {
    if (file_exists($candidate) && is_readable($candidate)) {
        $ca_path = $candidate;
        break;
    }
}

error_log("HOST = " . var_export($host, true));
error_log("PORT = " . var_export($port, true));
error_log("USER = " . var_export($user, true));
error_log("DB = " . var_export($database, true));
error_log("CA PATH = " . var_export($ca_path, true));

$conn = mysqli_init();

if (!$conn) {
    die("mysqli_init failed");
}


if ($ca_path) {
    mysqli_ssl_set($conn, null, null, $ca_path, null, null);
}


mysqli_options($conn, MYSQLI_OPT_CONNECT_TIMEOUT, 10);


mysqli_options($conn, MYSQLI_OPT_SSL_VERIFY_SERVER_CERT, false);


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
?>