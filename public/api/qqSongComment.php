<?php
$requestUri = $_SERVER['QUERY_STRING'];
$filename = 'https://c.y.qq.com/base/fcgi-bin/fcg_global_comment_h5.fcg?'.$requestUri;
$opt = array ('http'=>array('header'=>"Referer: https://c.y.qq.com/base/fcgi-bin/fcg_global_comment_h5.fcg"));
$result = file_get_contents($filename,FALSE,stream_context_create($opt));
echo $result;
?>