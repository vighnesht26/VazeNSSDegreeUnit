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
?>
