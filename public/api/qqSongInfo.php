<?php
$requestUri = $_SERVER['QUERY_STRING'];
$filename = 'https://u.y.qq.com/cgi-bin/musicu.fcg?'.$requestUri;
$opt = array ('http'=>array('header'=>"Referer: https://y.qq.com/n/yqq/song"));
$result = file_get_contents($filename,FALSE,stream_context_create($opt));
echo $result;
?>