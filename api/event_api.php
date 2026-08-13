<?php
session_start(); 
header('Content-Type: application/json');
include '../config/connect.php';



$isAdmin  = isset($_SESSION['admin_id']);
$isLeader = isset($_SESSION['std_id'], $_SESSION['role']) && $_SESSION['role'] === 'Leader';

if (!$isAdmin && !$isLeader) {
    http_response_code(403);
    
    echo json_encode(['error' => 'Unauthorized access.']);
    exit();
}

$action = $_GET['action'] ?? '';
$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (empty($action) && isset($data['action'])) {
$action = $data['action'];
}

$eventID = $_GET['id'] ?? ($data['id'] ?? 0);
$eventID = intval($eventID);
function requireEventID($id) {
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Missing or invalid event ID."]);
        exit();
    }
}

   

    try{
        switch($action){
            case 'view_event':
                try{
                    requireEventID($eventID);
                    $sql ="SELECT * FROM event WHERE event_id = ?";
                    $stmt = $conn->prepare($sql);
                    $stmt->bind_param("i", $eventID);

                    $stmt->execute();
                    $result = $stmt->get_result();
                    $event = $result->fetch_assoc(); 
                    $stmt->close();

                    if ($event) {
                        echo json_encode([
                                    "success" => true,
                                    "data" => $event
                                ]);
                        
                    } else {
                        echo json_encode(['error' => 'Event not found.']);
                    }

                } 
                catch (Exception $e) {
                echo json_encode(['error' => $e->getMessage()]);
                    }
    
                $conn->close();
                break;

            case 'update_event':
                requireEventID($eventID);
                $eventDate   = trim($data['date'] ?? '');
                $eventType   = trim($data['event_type'] ?? '');
                $eventVenue  = trim($data['venue'] ?? '');
                $eventStatus = trim($data['status'] ?? '');
                try {
    
                        $sql = "UPDATE event SET date = COALESCE(NULLIF(?, ''), date), event_type = COALESCE(NULLIF(?, ''), event_type), 
                                venue = COALESCE(NULLIF(?, ''), venue),  status = COALESCE (NULLIF( ?, ''), status), updated_at = NOW()
                                WHERE event_id = ?";

                        $stmt = $conn->prepare($sql);

                        if (!$stmt) {
                            throw new Exception("Preparation failed: " . $conn->error);
                        }

                        
                        $stmt->bind_param("ssssi", $eventDate, $eventType, $eventVenue, $eventStatus ,$eventID);

                        if ($stmt->execute()) {
                            if ($stmt->affected_rows > 0) {
                                echo json_encode([
                                    "success" => true,
                                    "message" => "Event updated successfully."
                                ]);
                            } else {
                                
                                echo json_encode([
                                    "success" => true,
                                    "message" => "No changes made or event ID not found.",
                                    "affected_rows" => 0
                                ]);
                            }
                        } else {
                            echo json_encode([
                                "success" => false,
                                "error" => "Execution error: " . $stmt->error
                            ]);
                        }
                        $stmt->close();
                        $conn->close();

                    } catch (Exception $e) {
                        http_response_code(500);
                        echo json_encode([
                            "success" => false,
                            "error" => "Database error: " . $e->getMessage()
                        ]);
                    }
                    break;
            case 'show_upcoming_events':
                try {
       
                        $sql = "SELECT event_id, name, event_type, status, date, venue
                                FROM event 
                                WHERE status <> 'completed'
                                ORDER BY date ASC"; 

                        $stmt = $conn->prepare($sql);
                        $stmt->execute();
                        
                        $result = $stmt->get_result();
                        
                    
                        $events = $result->fetch_all(MYSQLI_ASSOC); 
                        $stmt->close();

                        echo json_encode(['success' => true,
                        'data' => $events]);
                        

                    } catch (Exception $e) {
                        echo json_encode(['error' => $e->getMessage()]);
                    }
                    
                    $conn->close();
                    break;
            case 'dash_event':
                try {
                        $current_date = date('Y-m-d');

                        //status == active
                        $active_sql = "SELECT event_id, name, event_type, status, date, venue 
                        FROM event 
                        WHERE status = 'Active' 
                        ORDER BY date ASC LIMIT 1";
                        $stmt1 = $conn->prepare($active_sql);
                        $stmt1->execute();
                        $active_event = $stmt1->get_result()->fetch_assoc();
                        $stmt1->close();
                         
                        // Upcomings
                        $upcoming_sql = "SELECT event_id, name, event_type, status, date ,venue 
                        FROM event WHERE date > ? AND status = 'Scheduled'
                        ORDER BY date ASC LIMIT 1 "; 

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


                        echo json_encode(['success'=> true,
                        'active' => $active_event ?:null,
                        'upcoming' => $u_event ?: null,
                        'total_event' => (int)($total_event['totalevent'] ?? 0)
                        ]);
                       



                    }catch(Exception $e){
                       echo json_encode(['error' => $e->getMessage()]);
                    }
                    $conn->close();
                    break;
            case 'start_event_registration':
                try {
                    requireEventID($eventID);
                    
                    $sql = "UPDATE event SET status = 'Active' WHERE event_id = ?";
                    $stmt = $conn->prepare($sql);
                    $stmt->bind_param("i", $eventID);

                    if ($stmt->execute()) {
                        echo json_encode(['success' => true,
                        'action' => 'status changed to Active']);
                        

                    } else {
                        echo json_encode(['error' => 'Database update failed.']);
                    }

                    $stmt->close();
                } 
                catch (Exception $e) 
                {
                   echo json_encode(['error' => $e->getMessage()]);
                }

                $conn->close();
                break;
        
            case 'stop_event_registration':
                try {
                    requireEventID($eventID);
                    $sql = "UPDATE event SET status = 'Scheduled' WHERE event_id = ?";
                    $stmt = $conn->prepare($sql);
                    $stmt->bind_param("i", $eventID);

                    if ($stmt->execute()) {
                        echo json_encode(['success' => true,
                        'action' => 'status changed to Scheduled']);
                        
                    } else {
                        echo json_encode(['error' => 'Database update failed.']);
                    }

                    $stmt->close();
                } 
                catch (Exception $e) 
                {
                     echo json_encode(['error' => $e->getMessage()]);
                }

                $conn->close();
                break;

            case 'get_attendance_list':
                requireEventID($eventID);

                $event_sql ="SELECT event_id, name, date, time, status, COALESCE(attendance_status, 'Pending') AS attendance_status FROM event WHERE event_id = ?";
                $stmt = $conn->prepare($event_sql);
                $stmt->bind_param("i", $eventID);
                $stmt->execute();
                $event = $stmt->get_result()->fetch_assoc();
                $stmt->close();

                $vol_sql="SELECT s.std_id, s.first_name, s.surname, s.mobile, s.gender,s.email,
                ad.class, ad.program, ad.division, ad.roll_no,
                a.attendance_no, a.reporting_mark,
                COALESCE(a.isabsent, 'yes') AS isabsent,
                a.marked_by
                FROM attendance a
                JOIN student s ON a.student_id = s.std_id
                JOIN academic_details ad ON s.std_id = ad.student_id
                WHERE a.event_id = ?";
            
                $stmt2 = $conn->prepare($vol_sql);
                $stmt2->bind_param("i", $eventID);
                $stmt2->execute();
                $volunteers = $stmt2->get_result()->fetch_all(MYSQLI_ASSOC);
                $stmt2->close();

                echo json_encode([
                        'success'    => true,
                        'event'      => $event,
                        'volunteers' => $volunteers
                ]);
                    break;

            case 'save_attendance_progress':
                requireEventID($eventID);



                $marked_by = $_SESSION['std_id'];

                if(empty($data["attendance"]) || !is_array($data['attendance'])){
                    echo json_encode(['success'=> false, 'error' => 'No attendance data provided']);
                    break;
                }

                $conn->begin_transaction();

                try{
                    $update_sql = "UPDATE attendance SET isabsent = ?, reporting_mark =?, marked_by=?
                                    WHERE event_id = ? AND student_id = ?";
                    
                    $stmt = $conn->prepare($update_sql);

                   

                    if(!$stmt){
                        throw new Exception("Prepare failed" . $conn->error);
                    }

                    foreach($data['attendance'] as $item){
                        $studentId = intval($item['student_id']);
                        $isAbsent = ($item['is_present'] == 1) ? 'no' : 'yes' ;
                        $repMark = ($item['is_present'] == 1) ? 
                                    (!empty($item['reporting_mark']) ? $item['reporting_mark'] : date('Y-m-d H:i:s')) : NULL;

                        $stmt->bind_param("ssiii", $isAbsent, $repMark, $marked_by, $eventID, $studentId);
                        $stmt->execute();

                    }
                    $stmt->close();
                    $conn->commit();

                    echo json_encode([
                        'success' => true,
                        'message' => 'Attendance progress saved successfully'
                    ]);
                    

                }catch(Exception $e){
                    $conn->rollback();
                    echo json_encode([
                        'success' => false,
                        'error' => 'Failed to save progress' . $e->getMessage()
                        ]);
                }
                break;
        
            case 'submit_attendance':
                requireEventID($eventID);

                $marked_by = $_SESSION['std_id'];

                if(empty($data['attendance']) || !is_array($data['attendance'])){
                    echo json_encode(['success'=> false, 'error'=>'NO attendance data provided']);
                    break;
                }

                $conn->begin_transaction();

                try{
                      $update_sql = "UPDATE attendance SET isabsent = ?, reporting_mark =?, marked_by=?
                                    WHERE event_id = ? AND student_id = ?";
                    
                    $stmt = $conn->prepare($update_sql);

                   

                    if(!$stmt){
                        throw new Exception('Prepare failed' . $conn->error);
                    }

                    foreach($data['attendance'] as $item){
                        $studentId = intval($item['student_id']);
                        $isAbsent = ($item['is_present'] == 1) ? 'no' : 'yes' ;
                        $repMark = ($item['is_present'] == 1) ? 
                                    (!empty($item['reporting_mark']) ? $item['reporting_mark'] : date('Y-m-d H:i:s')) : NULL;

                        $stmt->bind_param("ssiii", $isAbsent, $repMark, $marked_by, $eventID, $studentId);
                        $stmt->execute();

                    }
                    $stmt->close();

                    $event_sql = "UPDATE event SET attendance_status = 'Completed', status = 'Completed' WHERE  event_id = ?";
                    $stmt_event = $conn->prepare($event_sql);
                    $stmt_event->bind_param("i", $eventID);
                    $stmt_event->execute();
                    $stmt_event->close();


                    $conn->commit();

                    echo json_encode([
                        'success' => true,
                        'message' => 'Attendance progress saved successfully'
                    ]);
                    

                }catch(Exception $e){
                    $conn->rollback();
                    echo json_encode([
                        'success' => false,
                        'error' => 'Failed to save progress' . $e->getMessage()
                        ]);
                }
                break;

            case 'show_completed_events':
                 try {
       
                        $sql = "SELECT e.event_id, e.name,e.event_type,e.date, e.venue,e.status,e.report_status,
                        COUNT(CASE WHEN a.isabsent = 'no' THEN 1 END) AS total_attendees,
                        COUNT(CASE WHEN a.isabsent = 'no' AND LOWER(gender) = 'male' THEN 1 END ) AS male_count,
                        COUNT(CASE WHEN a.isabsent = 'no' AND LOWER(gender) = 'female' THEN 1 END) AS female_count
                        FROM event e
                        LEFT JOIN attendance a ON e.event_id = a.event_id
                        LEFT JOIN student s ON a.student_id = s.std_id
                        WHERE e.status = 'Completed'
                        GROUP BY e.event_id, e.name,e.event_type,e.date, e.venue,e.status,e.report_status
                        ORDER BY e.date ASC";


                        $stmt = $conn->prepare($sql);
                        $stmt->execute();
                        
                        $result = $stmt->get_result();
                        
                    
                        $events = $result->fetch_all(MYSQLI_ASSOC); 
                        $stmt->close();

                        echo json_encode(['success' => true,
                        'data' => $events]);
                        

                    } catch (Exception $e) {
                        echo json_encode(['error' => $e->getMessage()]);
                    }
                    
                    $conn->close();
                    break;
            
            default:
            http_response_code(400);
             echo json_encode(['error' => 'Invalid or missing API action.']);
            break;
            } 
        }
        catch (Exception $e) 
        {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        } 
        
        exit();
    
?>