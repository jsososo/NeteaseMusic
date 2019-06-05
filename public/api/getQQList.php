<?php
$requestUri = $_SERVER['QUERY_STRING'];
$filename = 'https://c.y.qq.com/rsc/fcgi-bin/fcg_get_profile_homepage.fcg?'.$requestUri;
$result = file_get_contents($filename,FALSE);
echo $result;
?>