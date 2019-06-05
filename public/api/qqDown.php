<?php
  $requestUri = $_SERVER['QUERY_STRING'];
  parse_str($requestUri);
  $filepath = urldecode($url.$music."?&vkey=".$vkey."&guid=".$guid."&fromtag=".$fromtag."&uin=".$uin);
  $fp = fopen($filepath,"r");
  Header("Content-type: ".$content);
  Header("Content-Disposition: attachment; filename=".$name);
  $buffer = 1024;
  while (!feof($fp)) {
  $file_con = fread($fp,$buffer);
    echo $file_con;
  }
  fclose($fp);
?>