<?php
$requestUri = $_SERVER['QUERY_STRING'];
$filename = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric.fcg?'.$requestUri;
$opt = array ('http'=>array('header'=>"Referer: https://y.qq.com/n/yqq/song/001MzU812PDvbd.html"));
$result = file_get_contents($filename,FALSE,stream_context_create($opt));
echo $result;
?>