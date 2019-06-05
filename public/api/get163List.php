<?php
$requestUri = $_SERVER['QUERY_STRING'];
$filename = 'https://api.imjad.cn/cloudmusic/?'.$requestUri;
$result = file_get_contents($filename,FALSE);
echo $result;
?>