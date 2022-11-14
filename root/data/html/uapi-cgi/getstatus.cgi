<?php 
header("Content-Type: text/json");

#define PROMPT_SHM_ID       0xF8080
#define PROMPT_SHM_SIZE        1024   // 2^10
#define PARAM_SHM_ID        0xF8081
#define PARAM_SHM_SIZE        65536   // 2^16
#define FRAME_SHM_ID_0      0xF8082
#define FRAME_SHM_SIZE_0    1048576   // 2^20
#define FRAME_SHM_ID_1      0xF8083
#define FRAME_SHM_SIZE_1    1048576   // 2^20
#define SNAPSHOT_SHM_ID     0xF8084
#define SNAPSHOT_SHM_SIZE   1048576   // 2^20
#define VCA_SHM_ID          0xF8085
#define VCA_SHM_SIZE           4096   // 2^12

$systemid = 0xF8080; // System ID for the shared memory segment 
$shmid = shmop_open($systemid, "a", 0, 0); 
$read_data = shmop_read($shmid, 0, 1024);
shmop_close($shmid);
$arr = array();
for ($i=0; $i<5; $i++) {
    // print ("\n".$i.":".$read_data);
    $st = strpos($read_data, "{");
    $ed = strpos($read_data, "}");
    if (!$st && !$ed) {
        break;
    }
    array_push($arr, substr($read_data, $st, $ed+1-$st));
    $read_data = substr($read_data, $ed+1, strlen($read_data));
}

print_r($arr);
$arr_t = array();
for($i=0; $i<sizeof($arr); $i++){
    $arrs = json_decode($arr[$i], true);
    $arrs['datetime'] = date("Y-m-d H:i:s", $arrs['ts']/1000 + 8*3600).".".($arrs['ts']%1000);
    array_push($arr_t, $arrs);
}
print_r($arr_t);
$json_str = json_encode($arr_t);

print $json_str;

