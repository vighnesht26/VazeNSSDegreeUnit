<?php

session_start(); 
header('Content-Type: application/json');
include '../config/connect.php';

if(isset($_SESSION['admin_id']) ){
    $response = [
        'success' => false,
        'recent' => null,
        'upcoming' => null,
        'total_event'=> 0,
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

        $totalcount_sql = "SELECT COUNT(*) AS totalevent FROM event";
        $sql3 = $conn->prepare($totalcount_sql);
        //$status = 'completed';
       // $sql3 = bind_param("s",$status);
        $sql3->execute();
        $total_event = $sql3->get_result()->fetch_assoc();
        
        $sql3->close();


        $response['success']=true;
        $response['upcoming'] = $u_event;
        $response['total_event'] = (int)$total_event['totalevent'];



    }catch(Exeption $e){
        $response['error'] = $e->getMessage();
    }
    $conn->close();
}
echo json_encode($response);
exit();
?>