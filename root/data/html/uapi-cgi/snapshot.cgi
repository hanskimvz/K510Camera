<meta http-equiv='cache-control' content='no-cache'>
<meta http-equiv='expires' content='0'>
<meta http-equiv='pragma' content='no-cache'>
<?php 

$systemid = 0xF8084; // System ID for the shared memory segment 
$shmid = shmop_open($systemid, "a", 0, 0); 
$offset = 524288;

// $read_data = shmop_read($shmid, 0, 200); for ($i=0; $i<200; $i++) {  print (ord($read_data[$i]).",");} shmop_close($shmid); exit();
$read_data = shmop_read($shmid, 0, 1);
// $p = (ord($read_data[0]) +1) %2;
$p = (ord($read_data[0]) ) %2;
$p_x = $offset * $p;

$read_data = shmop_read($shmid, $p_x, 32);
$sz = 0;
for ($i=0; $i<4; $i++) {
    $sz |= ord($read_data[16+$i]) <<(8*$i) ;
}
if (!$sz) {
    $sz = 300000;
}
// string shmop_read ( int shmid, int start, int count)
$img = shmop_read($shmid, $p_x + 32, $sz);

$ts_m=0;
for ($i=0; $i<8; $i++) {
    $ts_m |= ord($read_data[8+$i])<<(8*$i);
}

// print ($ts_m);
flush();
ob_clean();
// $img_b64 = base64_encode($img);
// print '<img id="img" src="data:image/jpg;base64,'.$img_b64.'" width="640" height="320"></img>';

shmop_close($shmid);

header("Content-Type: image/jpeg");
echo $img.$ts.".".$ts_m."=".$sz."=".(strlen($img));

?>

