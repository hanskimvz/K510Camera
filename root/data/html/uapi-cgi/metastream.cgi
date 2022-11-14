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

#define VCA_SHM_ID          0xF8085
#define VCA_SHM_SIZE           4096   // 2^12

$systemid = 0xF8085; // System ID for the shared memory segment 
$shmid = shmop_open($systemid, "a", 0, 0); 
$sz = shmop_size($shmid);

$old_frame_cnt =0;
$flag = 0;
while(1) {
    $read_data = shmop_read($shmid, 0, 24);
    $frame_cnt = ord($read_data[1]) <<8 | ord($read_data[0]);
    if ($frame_cnt == $old_frame_cnt) {
        $flag ++;
        if ($flag > 10000000) {
            print "@";
        }
        usleep(20000);
        continue;
    }
    $old_frame_cnt = $frame_cnt;

    for ($i=0, $ts_m=0; $i<8; $i++) {
        $ts_m |= ord($read_data[8+$i])<<(8*$i);
    }
    for ($i=0, $sz=0; $i<2; $i++) {
        $sz |= ord($read_data[16+$i]) <<(8*$i) ;
    }
    $read_data = shmop_read($shmid, 24, $sz);
    $arr_rs = array();
    for ($i =0; $i<$sz; $i+=12 ){
        $cat_no = ord($read_data[$i]);
        $score  = ord($read_data[$i+2]) | ord($read_data[$i+3]) << 8;
        $pos_x0 = ord($read_data[$i+4]) | ord($read_data[$i+5]) << 8;
        $pos_x1 = ord($read_data[$i+6]) | ord($read_data[$i+7]) << 8;
        $pos_y0 = ord($read_data[$i+8]) | ord($read_data[$i+9]) << 8;
        $pos_y1 = ord($read_data[$i+10])| ord($read_data[$i+11])<< 8;
    
        $width  = $pos_x1 - $pos_x0;
        $height = $pos_y1 - $pos_y0;
    
        $pos_xc = $pos_x0 + $width/2;
        $pos_yc = $pos_y0 + $height/2;
    
        array_push($arr_rs, 
            array(
                "cat_no"  => $cat_no,
                "cat_item"=> $arr_cat[$cat_no],
                "score"   => $score/100,
                "pos_lt"  => [$pos_x0, $pos_y0],
                "pos_rb"  => [$pos_x1, $pos_y1],
                "pos_cen" => [(int)$pos_xc, (int)$pos_yc],
                "width"   => $width,
                "height"  => $height  
            )
        );
    }

    $arr_rs_t = array(
        "frame_cnt" => $frame_cnt,
        "timestamp" => $ts_m/1000,
        "datetime" => date("Y-m-d H:i:s", ($ts_m/1000) + 3600*8),
        "object_count" =>count($arr_rs),
        "data" => $arr_rs
    );
    
    $json_str = json_encode($arr_rs_t, JSON_NUMERIC_CHECK);
    print $json_str."@";
    // usleep(20000)
}
shmop_close($shmid);
?>

