<?php
$url  = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg?pcachetime=' . time() . '&songmid=' . $_REQUEST['songmid'] . '&g_tk=5381&jsonpCallback=MusicJsonCallback_lrc&loginUin=0&hostUin=0&format=jsonp&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0';
$curl = curl_init();
curl_setopt($curl, CURLOPT_URL, $url);
curl_setopt($curl, CURLOPT_HEADER, 1);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false); //这个是重点。
curl_setopt($curl, CURLOPT_REFERER, 'https://c.y.qq.com/');
$data = curl_exec($curl);
curl_close($curl);
echo strchr($data, 'MusicJsonCallback');
?>