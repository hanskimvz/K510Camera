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

$systemid = 0x000f1206; // System ID for the shared memory segment 
$shmid = shmop_open($systemid, "a", 0, 0); 
$sz = shmop_size($shmid);

// print ("shm id:".$shmid.", size:". shmop_size($shmid));
// shmop_write($shmid, "Hello World!", 0);
// rs[4:5]  = frame_cnt
// rs[8:15]  = ts microsecond
// rs[16:19] = size of metadata
// string shmop_read ( int shmid, int start, int count)
$read_data = shmop_read($shmid, 0, 32);
// for($i=0; $i<32; $i++) {
//     print "(".$i.")".ord($read_data[$i]).",";
// }
$sz = 0;
for ($i=0; $i<4; $i++) {
    $sz |= ord($read_data[16+$i]) <<(8*$i) ;
}
// print ("size:".$sz);
$ts_m=0;
for ($i=0; $i<8; $i++) {
    $ts_m |= ord($read_data[8+$i])<<(8*$i);
}


// print ($sz);
$frame_cnt  = ord($read_data[4]) | ord($read_data[5]) << 8;

$read_data = shmop_read($shmid, 32, $sz);
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
// shmop_delete($shmid);
shmop_close($shmid);

$arr_rs_t = array(
    "frame_cnt" => $frame_cnt,
    "timestamp" => $ts_m/1000,
    "datetime" => date("Y-m-d H:i:s", ($ts_m/1000) + 3600*8),
    "object_count" =>count($arr_rs),
    "data" => $arr_rs
);

// print "<pre>";
// print_r($arr_rs_t);
// print "</pre>";


// $json_str = json_encode($arr_rs_t,JSON_NUMERIC_CHECK);
$json_str = json_encode($arr_rs_t, JSON_NUMERIC_CHECK|JSON_PRETTY_PRINT);
print $json_str;

?>

