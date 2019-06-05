<?php
$requestUri = $_SERVER['QUERY_STRING'];
$filename = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg?'.$requestUri;
$opt = array ('http'=>array('header'=>"Referer: https://y.qq.com/n/yqq/playlist"));
$result = file_get_contents($filename,FALSE,stream_context_create($opt));
echo $result;
?>