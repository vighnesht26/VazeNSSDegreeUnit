<?php
require './connect.php';
session_start();

 
header('Content-Type: application/json');


$isAdmin  = isset($_SESSION['admin_id']);
if (isset($_SESSION['admin_id']) || isset($_SESSION['std_id']  )){
if (isset($_SESSION['admin_id'])) {
    $admin_id = $_SESSION['admin_id'];
    $stmt = $conn->prepare("SELECT username, first_name, last_name, role, email, mobile FROM admin WHERE admin_id = ?");
    $stmt->bind_param("i", $admin_id);
    
}
else if (isset($_SESSION['std_id'])){
    $std_id = $_SESSION['std_id'];
    $stmt = $conn->prepare("SELECT s.std_id, s.first_name, s.surname, s.email, s.mobile, s.role, s.username,
                             ad.class, ad.nss_year, ad.academic_year
                            FROM student s
                            LEFT JOIN academic_details ad ON s.std_id = ad.student_id
                            WHERE s.std_id = ?
                            ORDER BY ad.academic_year DESC 
                            LIMIT 1");
    $stmt->bind_param("i", $std_id);
    
}
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $stmt->close();

    if (!$row) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error'   => 'Record not found'
        ]);
        exit();
    }

    // Acc expiration for TY
    if (!$isAdmin) {
        $userRole = strtolower(trim($row['role'] ?? ''));

        if ($userRole !== 'programme officer' && $userRole !== 'admin') {
            $currentMonth = (int)date('n');
            $currentYear  = (int)date('Y');
            $startYear    = ($currentMonth >= 6) ? $currentYear : $currentYear - 1;
            $endYearShort = substr((string)($startYear + 1), -2);
            $currentAcademicYear = "{$startYear}-{$endYearShort}";

            $recordedClass   = strtoupper(trim($row['class'] ?? ''));
            $recordedNssYear = strtoupper(trim($row['nss_year'] ?? ''));
            $recordedYear    = trim($row['academic_year'] ?? '');

            $isTY = ($recordedClass === 'TY' || $recordedNssYear === 'TY');
            $isPastYear = (!empty($recordedYear) && $recordedYear !== $currentAcademicYear);

            if ($isTY && $isPastYear) {
                // Destroy active session
                $_SESSION = [];
                if (ini_get("session.use_cookies")) {
                    $params = session_get_cookie_params();
                    setcookie(session_name(), '', time() - 42000,
                        $params["path"], $params["domain"],
                        $params["secure"], $params["httponly"]
                    );
                }
                session_destroy();

                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'error'   => "Your NSS tenure has concluded (Completed TY in {$recordedYear}). Access has expired."
                ]);
                exit();
            }
        }
    }

    // Success response
    http_response_code(200);
    echo json_encode([
        'success'   => true,
        'name'      => trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? '')),
        'role'      => $row['role'],
        'ausername' => $row['username'],
        'email'     => $row['email'],
        'mobile'    => $row['mobile']
    ]);

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

