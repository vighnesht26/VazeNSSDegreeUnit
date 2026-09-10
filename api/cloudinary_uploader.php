<?php
header('Content-Type: application/json');
require __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/cloudinary_config.php';

use Cloudinary\Configuration\Configuration;
use Cloudinary\Api\Upload\UploadApi;


Configuration::instance([
    'cloud' => [
        'cloud_name' => getenv('CLOUD_NAME') ?: (defined('CLOUD_NAME') ? CLOUD_NAME : ''),
        'api_key'    => getenv('API_KEY') ?: (defined('API_KEY') ? API_KEY : ''),
        'api_secret' => getenv('API_SECRET') ?: (defined('API_SECRET') ? API_SECRET : '')
    ],
    'url' => [
        'secure' => true
    ]
]);


function uploadToCloudinary($filePath, $publicId, $resourceType = 'image') {
    $uploadApi = new UploadApi();

    $response = $uploadApi->upload($filePath, [
        'public_id'     => $publicId,
        'resource_type' => $resourceType,
        'overwrite'     => true,
        'use_filename'  => false
    ]);

    return $response['secure_url'];
}

?>
