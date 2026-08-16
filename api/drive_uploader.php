<?php
header('Content-Type: application/json');
include '../vendor/autoload.php';
// include './google_config.php';

function getGoogleDriveService(){
    $client = new Google\Client();
    $client->setClientId(GOOGLE_CLIENT_ID);
    $client->setClientSecret(GOOGLE_CLIENT_SECRET);
    $client->addScope(Google\Service\Drive::DRIVE_FILE);
    $client->setAccessType('offline');

    $token = $client->fetchAccessTokenWithRefreshToken(GOOGLE_REFRESH_TOKEN);

    if(isset($token['error'])){
            throw new Exception( 'Google Auth error'. json_encode($token));

    }

    $client->setAccessToken($token);

    return new Google\Service\Drive($client);
}

function uploadToGoogleDrive($filecontent, $fileName, $mimeType){
    $driveService = getGoogleDriveService();

    $filemetadata = new Google\Service\Drive\DriveFile([
        'name'=>$fileName,
        'parents' => getenv('GOOGLE_DRIVE_FOLDER_ID') 
                      ?: (defined('GOOGLE_DRIVE_FOLDER_ID') && GOOGLE_DRIVE_FOLDER_ID) ? [GOOGLE_DRIVE_FOLDER_ID] : []
    ]);


    $file = $driveService->files->create($filemetadata, [
        'data' =>$filecontent,
        'mimeType' => $mimeType,
        'uploadType' =>'multipart',
        'fields' =>'id, name, webViewLink'
    ]);

    return $file;
}


?>
