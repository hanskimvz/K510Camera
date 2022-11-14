<?php 
Header("Content-type: text/json");
$arr_cat = array(
    "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck",
    "boat", "traffic light", "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat",
    "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe",
    "backpack", "umbrella", "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard",
    "sports ball", "kite", "baseball bat", "baseball glove", "skateboard", "surfboard", "tennis racket", "bottle",
    "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple",
    "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake",
    "chair", "couch", "potted plant", "bed", "dining table", "toilet", "tv", "laptop",
    "mouse", "remote", "keyboard", "cell phone", "microwave", "oven", "toaster", "sink",
    "refrigerator", "book", "clock", "vase", "scissors", "teddy bear", "hair drier", "toothbrush"
);

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


if (!isset($_GET['stream'])){
    exit();
}

$exr = explode(",", $_GET['stream']);
foreach($exr as $exr) {
    // print($exr);
    if ($exr == 'video') {
        if(isset($_GET['channel']) && $_GET['channel']==0){
            $shmid_frame0   = shmop_open(0xF8082, "a", 0, 0);
        }
        else if(isset($_GET['channel']) && $_GET['channel']==1){
            $shmid_frame1   = shmop_open(0xF8083, "a", 0, 0);
        }
    }
    if ($exr == 'snapshot'){
        $shmid_snapshot = shmop_open(0xF8084, "a", 0, 0);
    }
    if ($exr == 'vca'){
        $shmid_VCA      = shmop_open(0xF8085, "a", 0, 0);
    }
}


for ($m=0; $m<1; $m++) {
    if (isset($shmid_frame0)) {
        $read_data = shmop_read($shmid_frame0, 0, 1600);
        printf ("%2d:",$m);
        for($i=0; $i<1600; $i++) {
            printf("%2X,", ord($read_data[$i]));
        }
        $sz = 0;
        for ($i=0; $i<4; $i++) {
            $sz |= ord($read_data[$i]) <<(8*$i) ;
        }
        print ",".$sz."\n";
        // usleep(35000);
    }
    else if (isset($shmid_frame1)) {
        $read_data = shmop_read($shmid_frame1, 0, 30);
        printf ("%2d:",$m);
        for($i=0; $i<30; $i++) {
            printf("%2X,", ord($read_data[$i]));
        }
        $sz = 0;
        for ($i=0; $i<8; $i++) {
            $sz |= ord($read_data[$i]) <<(8*$i) ;
        }
        print $sz."\n";

        // usleep(100000);
    }    
    if (isset($shmid_snapshot)) {
        $read_data = shmop_read($shmid_snapshot, 16, 84);
        printf ("%2d:",$m);
        for($i=0; $i<60; $i++) {
            printf("%2X,", ord($read_data[$i]));
        }
        $sz = 0;
        for ($i=0; $i<8; $i++) {
            $sz |= ord($read_data[$i+16]) <<(8*$i) ;
        }
        print $sz."\n";

        // usleep(35000);
    }        
    usleep(30000);
}
if (isset($shmid_frame0)) {
    shmop_close($shmid_frame0);
}
if (isset($shmid_frame1)) {
    shmop_close($shmid_frame1);
}
if (isset($shmid_snapshot)) {
    shmop_close($shmid_snapshot);
}
if (isset($shmid_VCA)) {
    shmop_close($shmid_VCA);
}

exit();




for ($i=0; $i<300; $i++) {
    $read_data = shmop_read($shmid, 0, 1);
    $p = (ord($read_data[0]) +3) %4;
    $p_x = $offset * $p;

    $read_data = shmop_read($shmid, $p_x, 16);
    $sz = ord($read_data[12]) | ord($read_data[13]) <<8 | ord($read_data[14]) <<16 | ord($read_data[15])<<24;
    if (!$sz) {
        $sz = 300000;
    }
    // print ($sz);
    // // string shmop_read ( int shmid, int start, int count)

    $img = shmop_read($shmid, $p_x + 16, $sz+4);
    $frame_cnt = ord($read_data[4]) | ord($read_data[5]) <<8;
    // print($p.": ".$frame_cnt);
    // header("Content-Type: image/jpeg");
    // echo $img;
    flush();
    $img_b64 = base64_encode($img);
    // print '<img id="img" src="data:image/jpg;base64,'.$img_b64.'" style="position: absolute; left: 0; top: 0; z-index: 0;"></img>';
    echo '<script>img.src="data:image/jpg;base64,'.$img_b64.'";</script>';
    usleep(100);
    ob_flush();
    flush();
}
shmop_close($shmid);
?>

