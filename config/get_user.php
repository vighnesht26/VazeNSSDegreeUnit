<?php
include 'connect.php';
session_start();

 
header('Content-Type: application/json');



if (isset($_SESSION['admin_id']) || isset($_SESSION['std_id']  )){
if (isset($_SESSION['admin_id'])) {
    $admin_id = $_SESSION['admin_id'];
    $stmt = $conn->prepare("SELECT username, first_name, last_name, role, email, mobile FROM admin WHERE admin_id = ?");
    $stmt->bind_param("i", $admin_id);
    
}
else if (isset($_SESSION['std_id'])){
    $std_id = $_SESSION['std_id'];
    $stmt = $conn->prepare("SELECT username, first_name, surname AS last_name, role, email, mobile FROM student WHERE std_id = ?");
    $stmt->bind_param("i", $std_id);
    
}
    $stmt->execute();
    $result = $stmt->get_result();


    if ($row = $result->fetch_assoc()) {
         http_response_code(200);
        echo json_encode([
            'success'   => true,
            'name'      => $row['first_name'] . ' ' . $row['last_name'],
            'role'      => $row['role'],
            'ausername' => $row['username'],
            'email'     => $row['email'],
            'mobile'    => $row['mobile']
        ]);
    } else {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error'   => 'Record not found'
        ]);
    }
    $stmt->close();
} else {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'name'    => 'Guest',
        'role'    => 'Unauthorized'
    ]);
    
}
exit();


?>

