<?php
session_start();

include '../config/connect.php';

$isAdmin = isset($_SESSION['admin_id']);
$isLeader = isset($_SESSION['std_id']) && isset($_SESSION['role']) && $_SESSION['role'] === 'leader';

if(!$isAdmin && !$isLeader){
    http_response_code(403);
    die("Unauthorised access");
}

if($_SERVER['REQUEST_METHOD'] === 'POST'){
    $name = $_POST['e_name'];
    $date = $_POST['e_date'];
    $time = $_POST['e_time'];
    $venue = $_POST['e_venue'];
    $organiser = $_POST['e_org'];
    $collab = $_POST['e_collab'];

    $type = $_POST['e_type'];
    $appHrs = $_POST['e_AH'];
    $maxPart = $_POST['e_MP'];
    $status = $_POST['e_status'];
    $rtime = $_POST['e_rtime'];
    $rvenue = $_POST['e_rvenue'];
    $desc = $_POST['e_desc'];
    
    if($_SESSION['admin_id']){
        $admin_id = $_SESSION['admin_id'];
        $sql = "INSERT INTO event(name, date, time, venue, organised_by, collaboration, event_type,approx_hrs, max_participation, status, reporting_time, reporting_venue, description, created_by_admin) 
        VALUES('$name', '$date', '$time', '$venue', '$organiser','$collab', '$type' , '$appHrs', '$maxPart','$status', '$rtime', '$rvenue', '$desc', '$admin_id')";
    }
    elseif($_SESSION['std_id']){
        $leader_id = $_SESSION['std_id'];
        $sql = "INSERT INTO event(name, date, time, venue, organised_by, collaboration, event_type,approx_hrs, max_participation, status, reporting_time, reporting_venue, description, created_by_leader) 
        VALUES('$name', '$date', '$time', '$venue', '$organiser','$collab', '$type' , '$appHrs', '$maxPart','$status', '$rtime', '$rvenue', '$desc', '$leader_id')";
    }
    $response=['success'=>false, 'error'=>''];
    if($conn->query($sql)){
            $response['success'] = true;
    }
    else{
        $response['error']= 'Failed to Add event';
    }
echo json_encode($response);
exit();   
}

$conn->close();


?>