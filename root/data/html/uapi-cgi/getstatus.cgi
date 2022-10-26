<meta http-equiv='expires' content='0'>
<meta http-equiv='pragma' content='no-cache'>
<?php 
$systemid = 0x000f6084; // System ID for the shared memory segment 
$shmid = shmop_open($systemid, "a", 0, 0); 
$read_data = shmop_read($shmid, 0, 1024);



print ($read_data);


shmop_close($shmid);