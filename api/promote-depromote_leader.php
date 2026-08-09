<?php
session_start();
header('Content-Type: application/json');

include '../config/connect.php';

$response = [
    'success ' => false,
    'msg' =>'',
    'error' => ''
];



if(!isset($_SESSION['admin_id'])){
    http_response_code(401);
    $respose['error'] = 'Unauthorised access';
    echo json_encode($response);
    exit();
}

$input = json_decode(file_get_contents('php://input'),true);

if(!isset($input['student_id']) || !is_array($input['student_id']) || empty($input['student_id'])){
    http_response_code(400);
    $response['error'] = 'No volunteer selected';
    echo json_encode($response);
    exit();
}
$target_role = strtolower($input['role'] ?? 'volunteer');
try{
    $student_id = array_map('intval',$input['student_id']);
    $id_list = implode(',',$student_id);

    if($target_role === 'leader'){
    $admin_id = $_SESSION['admin_id'];
    $sql = "UPDATE student SET role = 'Leader', assigned_by = ? WHERE std_id IN ($id_list)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $admin_id);
    }
    else{
        $sql = "UPDATE student SET role = 'volunteer', assigned_by = NULL WHERE std_id IN ($id_list)";
        $stmt = $conn->prepare($sql);
    }
    if($stmt->execute()){
        $response['success'] = TRUE;
        $response['msg'] = count($student_id) . "student updated to ". ucfirst($target_role) ;        
    }
    else{
        $response['error'] = 'Failed to promote' . $stmt->error;
    }

}catch(Exception $e){
    http_response_code(500);
    $response['error'] = $e->getMessage();


}
$conn->close();
echo json_encode($response);
exit();
?>