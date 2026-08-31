<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
require_once __DIR__ . '/../api/mail-config.php';
require_once __DIR__ . '/../vendor/autoload.php';


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






function sendVolunteerUsernameEmail(string $recipientEmail, string $recipientName, string $username): bool {
    $mail = new PHPMailer(true);

    try {
      
        $smtpHost = getenv('SMTP_HOST') ?: (defined('SMTP_HOST') ? SMTP_HOST : 'smtp.gmail.com');
        $smtpUser = getenv('SMTP_USER') ?: (defined('SMTP_USER') ? SMTP_USER : 'proffteam30@gmail.com');
        $smtpPass = getenv('SMTP_PASS') ?: (defined('SMTP_PASS') ? SMTP_PASS : null);
        $smtpPort = (int)(getenv('SMTP_PORT') ?: (defined('SMTP_PORT') ? SMTP_PORT : 587));

        
        $mail->isSMTP();
        $mail->Host       = $smtpHost;
        $mail->SMTPAuth   = true;
        $mail->Username   = $smtpUser;
        $mail->Password   = $smtpPass;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = $smtpPort;
        $mail->CharSet    = 'UTF-8';

        
        $mail->setFrom($smtpUser, 'Vaze NSS Degree Unit');
        $mail->addAddress($recipientEmail, $recipientName);

        
        $mail->isHTML(true);
        $mail->Subject = 'NSS Registration Approved -  Username';
        $mail->Body    = '
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #0f172a; text-align: center;">National Service Scheme</h2>
            <p>Dear <strong>' . htmlspecialchars($recipientName) . '</strong>,</p>
            <p>Your volunteer registration request has been approved by the leader.</p>
            <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
                <span style="font-size: 12px; color: #64748b; font-weight: bold; display: block; text-transform: uppercase;">Your Assigned Username</span>
                <span style="font-size: 20px; color: #0284c7; font-weight: bold;">' . htmlspecialchars($username) . '</span>
            </div>
            <p style="font-size: 13px; color: #64748b;">Use this username along with the password you created during registration to sign in.</p>
        </div>';

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("PHPMailer Error: {$mail->ErrorInfo}");
        return false;
    }
}
?>