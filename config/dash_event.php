<?php

session_start(); 
header('Content-Type: application/json');
include 'connect.php';

if(isset($_SESSION['admin_id']) ){
    $response = [
        'success' => false,
        'recent' => null,
        'upcoming' => null,
        'error'=>''
    ];
    try {
        $current_date = date('Y-m-d');
        
        $upcoming_sql = "SELECT event_id, name, event_type, status, date ,venue 
        FROM event WHERE date > ? LIMIT 1"; 

        $sql1 = $conn->prepare($upcoming_sql);
        $sql1 ->bind_param("s", $current_date);
        $sql1->execute();
        
        $upcoming_event = $sql1->get_result();
        $u_event = $upcoming_event->fetch_assoc();
        $sql1->close();

        $response['success']=true;
        $response['upcoming'] = $u_event;




    }catch(Exeption $e){
        $response['error'] = $e->getMessage();
    }
    $conn->close();
}
echo json_encode($response);
exit();
?>