<?php
function getAcademicYear(): string {
    $currentMonth = (int)date('m'); 
    $currentYear  = (int)date('Y'); 

   
    if ($currentMonth < 6) {
        $startYear = $currentYear - 1;
        $endYear   = substr((string)$currentYear, -2); 
    }else{
        $startYear = $currentYear;
        $endYear   = substr((string)($currentYear + 1), -2); 
    }

    return "{$startYear}-{$endYear}";
}


function generateUniqueUsername(mysqli $conn, string $name, string $mobile): string {
    $cleanName = strtolower(preg_replace('/[^a-zA-Z]/', '', $name));
    if (strlen($cleanName) < 4) {
        $cleanName .= 'user';
    }
    
    
    $suffix = substr($mobile, -4);
    $baseUsername = $cleanName . $suffix;
    $username = $baseUsername;
    $counter = 1;

    $stmt = $conn->prepare("SELECT 1 FROM student WHERE username = ? LIMIT 1");

    while (true) {
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $res = $stmt->get_result();

        if ($res->num_rows === 0) {
            break;
        }

        
        $username = $baseUsername . '_' . $counter;
        $counter++;
    }

    $stmt->close();
    return $username;
}

?>