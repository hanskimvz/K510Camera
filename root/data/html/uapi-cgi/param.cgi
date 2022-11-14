
<?PHP
error_reporting( E_ALL );
ini_set( 'display_errors', '1' );

define('PROMPT_SHM_ID',     0xF8080);
define('PROMPT_SHM_SIZE',   1024);   // 2^10  
define('PARAM_SHM_ID',      0xF8081);
define('PARAM_SHM_SIZE',    65536);    // 2^16
define("PARAM_FNAME",    "/root/data/param.json");


function write_memory($arr){ // memory(array) to shared memory
    $json_str = json_encode($arr, JSON_NUMERIC_CHECK);
    
    if( !($shmid = shmop_open(PARAM_SHM_ID, "c", 0644, PARAM_SHM_SIZE)) ){
        print 'shmop_open failed.';
    }
    shmop_write($shmid, $json_str."EOF\0", 0);
    shmop_close($shmid);
    return false;
}

function read_memory(){ // shared memory to memory(array)
    if( !($shmid = shmop_open(PARAM_SHM_ID, "a", 0, PARAM_SHM_SIZE)) ){
        die('shmop_open failed.');
    }
    $json_str = shmop_read($shmid, 0, PARAM_SHM_SIZE);
    shmop_close($shmid);  
    // print ($json_str);
    if (!isset($_GET['format'])){
        $_GET['format'] = 'plain';
    }

    $arr_t = json_decode(substr($json_str,0,strpos($json_str, "EOF\0")), true);
    return $arr_t;
}

function load_params() { // file to shared memory
    if (!file_exists(PARAM_FNAME) ){
        print PARAM_FNAME." not exist\n";
        exit();
    }

    if (!($fp = fopen(PARAM_FNAME, "r"))) {
        print "cannot open file ".PARAM_FNAME."\n";
        exit();
    }
    $body = strtolower(trim(fread($fp, filesize(PARAM_FNAME))));
    fclose($fp);
    
    $arr = json_decode($body, true);
    write_memory($arr);
}


function save_params() { // shared memory to file
    $json_str = json_encode(read_memory(),JSON_NUMERIC_CHECK);

    if (!file_exists(PARAM_FNAME) ){
        print PARAM_FNAME." not exist\n";
        exit();
    }

    if (!($fp = fopen(PARAM_FNAME, "w"))) {
        print "cannot open file ".PARAM_FNAME."\n";
        exit();
    }
    fwrite($fp, $json_str);
    fclose($fp);
}

function convertArray($arr, $narr = array(), $nkey = '') {
    foreach ($arr as $key => $value) {
        if (is_array($value)) {
            $narr = array_merge($narr, convertArray($value, $narr, $nkey . $key . '.'));
        } else {
            $narr[$nkey . $key] = $value;
        }
    }

    return $narr;
}

header("Content-Type: text/plain");

$_COOKIE['role'] ='admin';
// print "cookie: "; print_r($_COOKIE); 

if ($_COOKIE['role'] !='admin') {
    print "not permitted \n";
    exit();
}

// if(!isset($_GET['table'])  || !$_GET['table']) {
//     $_GET['table'] = 'param_tbl';
// }

if (!isset($_GET['action'])){
    // action : list, update, add, modify, delete, query
    $_GET['action'] = 'list';
}

function setFlag($group, $flag){
    print $group." ".$flag."\n";
}

// print (getcwd());

// $fname ="/mnt/db/param.db";
// $fname ="/mnt/db/param.json";
// if (!file_exists($fname) ){
//     print $fname." not exist\n";
//     exit();
// }

// $fp = fopen($fname, "r");
// if (!$fp){
//     print "cannot open file ".$fname."\n";
// }
// $body = fread($fp, filesize($fname));
// $body = strtolower($body);
// fclose($fp);
// $arr_t = json_decode($body, true);
// $arr_rs = array();


function resolve(array $arr, $path, $default = null) {
    $current = $arr;
    $p = strtok($path, '.');

    while ($p !== false) {
        if (!isset($current[$p])) {
            return $default;
        }
        $current = $current[$p];
        $p = strtok('.');
    }
    return $current;
}




if ($_GET['action'] == 'load') {    // file to memory
    load_params();
}

else if($_GET['action']=='save'){   // memory to file
    save_params();
}

else if ($_GET['action'] == 'list'){
    $arr_t = read_memory();
    if (!isset($_GET['group']) || !trim($_GET['group'])) {
        $arr_rs = $arr_t;
    }
    else {
        foreach(explode(",", $_GET['group']) as $grps){
            $grps = strtolower($grps);
            // array_push($arr_rs, resolve($arr_t, $grps));
            $exp = explode(".", $grps);
          
            if (sizeof($exp) == 1) {
                $arr_rs[$exp[0]]                                                        = $arr_t[$exp[0]];
            }
            else if (sizeof($exp) == 2) {
                $arr_rs[$exp[0]][$exp[1]]                                               = $arr_t[$exp[0]][$exp[1]];
            }
            else if (sizeof($exp) == 3) {
                $arr_rs[$exp[0]][$exp[1]][$exp[2]]                                      = $arr_t[$exp[0]][$exp[1]][$exp[2]];
            }
            else if (sizeof($exp) == 4) {
                $arr_rs[$exp[0]][$exp[1]][$exp[2]][$exp[3]]                             = $arr_t[$exp[0]][$exp[1]][$exp[2]][$exp[3]];
            }
            else if (sizeof($exp) == 5) {
                $arr_rs[$exp[0]][$exp[1]][$exp[2]][$exp[3]][$exp[4]]                    = $arr_t[$exp[0]][$exp[1]][$exp[2]][$exp[3]][$exp[4]];
            }
            else if (sizeof($exp) == 6) {
                $arr_rs[$exp[0]][$exp[1]][$exp[2]][$exp[3]][$exp[4]][$exp[5]]           = $arr_t[$exp[0]][$exp[1]][$exp[2]][$exp[3]][$exp[4]][$exp[5]];
            }
            else if (sizeof($exp) == 7) {
                $arr_rs[$exp[0]][$exp[1]][$exp[2]][$exp[3]][$exp[4]][$exp[5]][$exp[6]]  = $arr_t[$exp[0]][$exp[1]][$exp[2]][$exp[3]][$exp[4]][$exp[5]][$exp[6]];
            }

        }
    }

    if ($_GET['format'] == 'plain'){
        header("Content-Type: text/plain");
        $arr_rs = convertArray($arr_rs);
        foreach($arr_rs as $A =>$B) {
            print $A."=".trim($B)."\n";
        }
    }
    else if ($_GET['format'] == 'json_dot'){
        header("Content-Type: text/json");
        $arr_rs = convertArray($arr_rs);
        $json_str = json_encode($arr_rs, JSON_PRETTY_PRINT);
        print $json_str;

    }
    else if ($_GET['format'] == 'json'){
        header("Content-Type: text/json");
        $json_str = json_encode($arr_rs, JSON_PRETTY_PRINT);
        print $json_str;
    }

}

else if ($_GET['action']=='update'){
    if(isset($_GET['group'])) {
        $_GET['group'] = strtolower($_GET['group']);
        $_GET['group'] .= ".";
    }
    else {
        $_GET['group'] .= "";
    }

    $arr_grp = array();
    foreach(explode("&",strtolower($_SERVER['QUERY_STRING'])) as $qstr){
        list($key, $val) = explode("=", $qstr);
        if ($key == 'action' || $key == 'format' || $key=='group' || $key=='table'){
            continue;
        }
        array_push($arr_grp, $_GET['group'].$key."=".$val);
    }

    $arr_t = read_memory();
    foreach($arr_grp as $gstr){
        print $gstr."...";
        list($grp, $entryValue) = explode("=",$gstr);
        $grps = explode(".", $grp);
        if (sizeof($grps) == 1 && isset($arr_t[$grps[0]])) {
            $arr_t[$grps[0]] = $entryValue;
            print "OK\n";
        }
        else if (sizeof($grps) == 2 && isset($arr_t[$grps[0]][$grps[1]]) ) {
            $arr_t[$grps[0]][$grps[1]] = $entryValue;
            print "OK\n";
        }
        else if (sizeof($grps) == 3 && isset($arr_t[$grps[0]][$grps[1]][$grps[2]])) {
            $arr_t[$grps[0]][$grps[1]][$grps[2]] = $entryValue;
            print "OK\n";
        }
        else if (sizeof($grps) == 4 && isset($arr_t[$grps[0]][$grps[1]][$grps[2]][$grps[3]])) {
            $arr_t[$grps[0]][$grps[1]][$grps[2]][$grps[3]] = $entryValue;
            print "OK\n";
        }
        else if (sizeof($grps) == 5 && isset($arr_t[$grps[0]][$grps[1]][$grps[2]][$grps[3]][$grps[4]])) {
            $arr_t[$grps[0]][$grps[1]][$grps[2]][$grps[3]][$grps[4]] = $entryValue;
            print "OK\n";
        }
        else if (sizeof($grps) == 6 && isset($arr_t[$grps[0]][$grps[1]][$grps[2]][$grps[3]][$grps[4]][$grps[5]])) {
            $arr_t[$grps[0]][$grps[1]][$grps[2]][$grps[3]][$grps[4]][$grps[5]] = $entryValue;
            print "OK\n";
        }
        else {
            print "FAIL\n";
        }
    }

    write_memory($arr_t);
    save_params();

}

else if ($_GET['action']=='update_batch'){
    $arr_t = read_memory();
    // print (exec('whoami')."\n");
    print_r($_POST['sdata']);
    $chFlag = false;
    if (isset($_GET['group']) && $_GET['group'] == 'users') {
        if ($_POST['sdata']['act'] == 'add') {
            array_push($arr_t['users'], 
                array(
                    'id'=>$_POST['sdata']['username'], 
                    'password' => md5($_POST['sdata']['passwd']),
                    'level'=>$_POST['sdata']['usergroup'], 
                    'explain'=>"", 
                    'login_count'=>0, 
                    'last_login'=> 0
                )
            );
            $chFlag = true;
        }
        else if ($_POST['sdata']['act'] == 'modify') {
            for ($i=0; $i<sizeof($arr_t['users']); $i++) {
                if ($arr_t['users'][$i]['id'] == $_POST['sdata']['username']) {
                    $arr_t['users'][$i]['password'] = md5($_POST['sdata']['passwd']);
                    $arr_t['users'][$i]['level'] = $_POST['sdata']['usergroup'];
                }
            }
            $chFlag = true;
        }
        else if ($_POST['sdata']['act'] == 'remove') {
            
        }
        print_r($arr_t['users']);
        // $chFlag = true;
    }
    else {
        
        foreach($_POST['sdata'] as $grp => $entryValue){
            $grps = explode(".", strtolower($grp));
            if (sizeof($grps) == 1 && isset($arr_t[$grps[0]]) && ($arr_t[$grps[0]] != $entryValue)) {
                $arr_t[$grps[0]] = $entryValue;
                $chFlag = true;
            }
            else if (sizeof($grps) == 2 && isset($arr_t[$grps[0]][$grps[1]]) && ($arr_t[$grps[0]][$grps[1]] != $entryValue)) {
                $arr_t[$grps[0]][$grps[1]] = $entryValue;
                $chFlag = true;
            }
            else if (sizeof($grps) == 3 && isset($arr_t[$grps[0]][$grps[1]][$grps[2]]) &&  ($arr_t[$grps[0]][$grps[1]][$grps[2]] != $entryValue)) {
                $arr_t[$grps[0]][$grps[1]][$grps[2]] = $entryValue;
                $chFlag = true;
            }
            else if (sizeof($grps) == 4 && isset($arr_t[$grps[0]][$grps[1]][$grps[2]][$grps[3]]) && ($arr_t[$grps[0]][$grps[1]][$grps[2]][$grps[3]] != $entryValue)) {
                $arr_t[$grps[0]][$grps[1]][$grps[2]][$grps[3]] = $entryValue;
                $chFlag = true;
            }
            else if (sizeof($grps) == 5 && isset($arr_t[$grps[0]][$grps[1]][$grps[2]][$grps[3]][$grps[4]]) && ($arr_t[$grps[0]][$grps[1]][$grps[2]][$grps[3]][$grps[4]] != $entryValue) ){
                $arr_t[$grps[0]][$grps[1]][$grps[2]][$grps[3]][$grps[4]] = $entryValue;
                $chFlag = true;
            }
            else if (sizeof($grps) == 6 && isset($arr_t[$grps[0]][$grps[1]][$grps[2]][$grps[3]][$grps[4]][$grps[5]]) && ($arr_t[$grps[0]][$grps[1]][$grps[2]][$grps[3]][$grps[4]][$grps[5]] != $entryValue)) {
                $arr_t[$grps[0]][$grps[1]][$grps[2]][$grps[3]][$grps[4]][$grps[5]] = $entryValue;
                $chFlag = true;
            }
        }
    }
    if ($chFlag) {
        write_memory($arr_t);
        save_params();
        print "update OK, changes saved";
    }
}


else if($_GET['action'] == 'delete') {
    if (!isset($_GET['group'])){
        print  "no group\n";
        exit();
    }
    $arr_t = read_memory();
    foreach(explode(",", $_GET['group']) as $grps){
        $grps = strtolower($grps);
        $exp = explode(".", $grps);
      
        if (sizeof($grps) == 1 && isset($arr_t[$grps[0]])) {
            unset($arr_t[$grps[0]]);
            print "OK\n";
        }
        else if (sizeof($grps) == 2 && isset($arr_t[$grps[0]][$grps[1]]) ) {
            unset($arr_t[$grps[0]][$grps[1]]);
            print "OK\n";
        }
        else if (sizeof($grps) == 3 && isset($arr_t[$grps[0]][$grps[1]][$grps[2]])) {
            unset($arr_t[$grps[0]][$grps[1]][$grps[2]]);
            print "OK\n";
        }
        else if (sizeof($grps) == 4 && isset($arr_t[$grps[0]][$grps[1]][$grps[2]][$grps[3]])) {
            unset($arr_t[$grps[0]][$grps[1]][$grps[2]][$grps[3]]);
            print "OK\n";
        }
        else if (sizeof($grps) == 5 && isset($arr_t[$grps[0]][$grps[1]][$grps[2]][$grps[3]][$grps[4]])) {
            unset($arr_t[$grps[0]][$grps[1]][$grps[2]][$grps[3]][$grps[4]]);
            print "OK\n";
        }
        else if (sizeof($grps) == 6 && isset($arr_t[$grps[0]][$grps[1]][$grps[2]][$grps[3]][$grps[4]][$grps[5]])) {
            unset($arr_t[$grps[0]][$grps[1]][$grps[2]][$grps[3]][$grps[4]][$grps[5]]);
            print "OK\n";
        }
        else {
            print "FAIL\n";
        }

    }  

}



else if ($_GET['action'] == 'list_all'){
    // $fname ="/mnt/db/vca.db";
    $fname ="/mnt/db/param.db";

    $db = new SQLite3($fname); 
    $sq = "select id, passwd, level, explain, login_count, lastlogin, regdate from user_tbl ";
    $rs = $db->query($sq);
    $arr_rs['users'] = array();
    while ($row = $rs->fetchArray()) {
        array_push($arr_rs['users'], array("id"=>$row['id'], "level"=>$row['level'], 'explain'=>$row['explain'], 'login_count'=>$row['login_count'], "last_login"=>$row['lastlogin']));
    }

    $sq = "select groupPath, entryName, entryValue from param_tbl ";
    $rs = $db->query($sq);
    while ($row = $rs->fetchArray()) {
        $arr_rs[$row['groupPath'].".".$row['entryName']] = $row['entryValue'];
    }

    $db->close();

    $fname ="/mnt/db/vca.db";
    $db = new SQLite3($fname); 
    $sq = "select groupPath, entryName, entryValue from param_tbl ";
    $rs = $db->query($sq);
    while ($row = $rs->fetchArray()) {
        $arr_rs[$row['groupPath'].".".$row['entryName']] = $row['entryValue'];
    }
    $db->close();


    // print_r($arr_rs);
    
    header("Content-Type: text/json");
    $arr_t = array();
    foreach($arr_rs as $A => $B) {
        $exp = explode(".",$A);
        if (sizeof($exp) == 1) {
            $arr_t[$exp[0]] = $B;
        }
        else if (sizeof($exp) == 2) {
            $arr_t[$exp[0]][$exp[1]] = $B;
        }
        else if (sizeof($exp) == 3) {
            $arr_t[$exp[0]][$exp[1]][$exp[2]] = $B;
        }
        else if (sizeof($exp) == 4) {
            $arr_t[$exp[0]][$exp[1]][$exp[2]][$exp[3]] = $B;
        }
        else if (sizeof($exp) == 5) {
            $arr_t[$exp[0]][$exp[1]][$exp[2]][$exp[3]][$exp[4]] = $B;
        }
        else if (sizeof($exp) == 6) {
            $arr_t[$exp[0]][$exp[1]][$exp[2]][$exp[3]][$exp[4]][$exp[5]] = $B;
        }
        else if (sizeof($exp) == 7) {
            $arr_t[$exp[0]][$exp[1]][$exp[2]][$exp[3]][$exp[4]][$exp[5]][$exp[6]] = $B;
        }
    }


        $json_str = json_encode($arr_t, JSON_PRETTY_PRINT);
        print($json_str);
    
}


else if ($_GET['action'] == 'list_s' && ($_GET['table']=='param_tbl' || $_GET['table']=='vca_tbl')){
    if (!isset($_GET['format'])){
        $_GET['format'] = 'plain';
    }
    if (isset($_GET['group'])){
// select groupPath, entryName, entryValue from param_tbl where group1='network' and group2='dns' and (group3='preferred' or entryName='preferred') order by groupPath asc
        $eGroups = array();
        $arr_sq = array();
        $arr_rs = array();

        foreach(explode(",", $_GET['group']) as $grps){
            $grps = trim($grps);
            $arr = array();
            foreach(explode(".", $grps) as $exgrp){
                array_push($arr, strtolower(trim($exgrp)));
            }
            array_push($eGroups, $arr);
        }    

        foreach($eGroups as $grps) {
            $arr = array();
            for($i=0; $i<sizeof($grps); $i++){
                if (sizeof($grps) > 1 && $i==(sizeof($grps)-1)){
                    array_push($arr, "(group".($i+1)."='".$grps[$i]."' or entryName='".$grps[$i]."')");
                }
                else{
                    array_push($arr, "group".($i+1)."='".$grps[$i]."'");
                }
            }
            if ($arr){
                $sq = "where ".join(" and ", $arr);
                array_push($arr_sq, $sq);
            }
        }
    }
    else {
        $arr_sq = array('');
    }
    // print_r($arr_sq);
    if ($_GET['table'] == 'vca_tbl') {
        $fname ="/mnt/db/vca.db";
    }
    else {
        $fname ="/mnt/db/param.db";
    }
    $db = new SQLite3($fname); 
    foreach($arr_sq as $wsq) {
        $sq = "select groupPath, entryName, entryValue from param_tbl ".$wsq." order by groupPath asc";
        // print $sq."\n";
        $rs = $db->query($sq);
        while ($row = $rs->fetchArray()) {
            $arr_rs[$row['groupPath'].".".$row['entryName']] = $row['entryValue'];
        }
    }
    $db->close();
    // print_r($arr_rs);
    if($_GET['format']=='json'){
        header("Content-Type: text/json");
        require_once $_SERVER['DOCUMENT_ROOT']."/inc/json.php";
        // $json = new Services_JSON();
        // $json_str = $json->encode($arr_rs);
        $arr_t = array();
        foreach($arr_rs as $A => $B) {
            $exp = explode(".",$A);
            if (sizeof($exp) == 1) {
                $arr_t[$exp[0]] = $B;
            }
            else if (sizeof($exp) == 2) {
                $arr_t[$exp[0]][$exp[1]] = $B;
            }
            else if (sizeof($exp) == 3) {
                $arr_t[$exp[0]][$exp[1]][$exp[2]] = $B;
            }
            else if (sizeof($exp) == 4) {
                $arr_t[$exp[0]][$exp[1]][$exp[2]][$exp[3]] = $B;
            }
            else if (sizeof($exp) == 5) {
                $arr_t[$exp[0]][$exp[1]][$exp[2]][$exp[3]][$exp[4]] = $B;
            }
            else if (sizeof($exp) == 6) {
                $arr_t[$exp[0]][$exp[1]][$exp[2]][$exp[3]][$exp[4]][$exp[6]] = $B;
            }
            else if (sizeof($exp) == 7) {
                $arr_t[$exp[0]][$exp[1]][$exp[2]][$exp[3]][$exp[4]][$exp[6]][$exp[7]] = $B;
            }



        }
        // print_r($arr_t);
        // $json_str = json_encode($arr_rs, JSON_PRETTY_PRINT);
        $json_str = json_encode($arr_t, JSON_PRETTY_PRINT);
        print($json_str);
    }
    else if($_GET['format']=="plain"){
        header("Content-Type: text/plain");
        foreach($arr_rs as $A => $B) {
            print $A."=".$B."\n";
        }
    }
   
}
else if ($_GET['action'] == 'list_all' && $_GET['table']=='user_tbl'){
    $fname ="/mnt/db/param.db";
    $arr_rs = array();
    $sq = "select id, passwd, level, explain, login_count, lastlogin, regdate from ".$_GET['table']." ";
    $db = new SQLite3($fname); 
    $rs = $db->query($sq);
    while ($row = $rs->fetchArray()) {
        array_push($arr_rs, array("id"=>$row['id'], "level"=>$row['level'], 'explain'=>$row['explain'], 'login_count'=>$row['login_count'], "last_login"=>$row['lastlogin']));
    }
    $db->close();
    header("Content-Type: text/json");
    require_once $_SERVER['DOCUMENT_ROOT']."/inc/json.php";
    $json = new Services_JSON();
    $json_str = $json->encode($arr_rs);
    // $json_str = json_decode($arr_rs);
    print($json_str);    
}

else if ($_GET['action']=='update_batch_s'){
    // $systemid = 0x000f6084; // System ID for the shared memory segment 
    // $shmid = shmop_open($systemid, "a", 0, 0); 
    // $read_data = shmop_read($shmid, 0, 1024);

    // print (exec('whoami')."\n");
    $arr_sq = array();
    $db = new SQLite3($fname);
    print ($fname);
    foreach($_POST['sdata'] as $key => $value){
        // print $key."=".$value."\n";
        $ex = explode(".", $key);
        $entryName = array_pop($ex);
        $groupPath = join(".", $ex);
        $sq = "select entryValue from ".$_GET['table']." where groupPath='".$groupPath."' COLLATE NOCASE and entryName='".$entryName."' COLLATE NOCASE";
        $rs = $db->query($sq);
        $row = $rs->fetchArray();
        if ($row[0] != $value) {
            $sq = "update ".$_GET['table']." set entryValue='".$value."' where groupPath='".$groupPath."'COLLATE NOCASE and entryName='".$entryName."' ";
            array_push($arr_sq, $sq);
            // setFlag(explode(".", $groupPath)[0], true);
        }
          

    }
    foreach ($arr_sq as $sq) {
        print ($sq);
        // $rs = $db->query($sq);
        $rs = $db->exec($sq);
        print ($rs."\n");

        if($rs) {
            print " :update OK\n";
        }
        else {
            print " :update FAIL\n";
            echo $db->lastErrorMsg();
        }
    }
    $db->close();
    // shmop_close($shmid);    
}

else if($_GET['action']=='update_s'){
    $arr_grp = array();
    $arr_sq = array();
    header("Content-Type: text/plain");
    if(isset($_GET['group'])) {
        $_GET['group'] .= ".";
    }
    else {
        $_GET['group'] .= "";
    }

    foreach(explode("&",$_SERVER['QUERY_STRING']) as $qstr){
        list($key, $val) = explode("=", $qstr);
        if ($key == 'action' || $key == 'format' || $key=='group' || $key=='table'){
            continue;
        }
        array_push($arr_grp, $_GET['group'].$key."=".$val);
    }

    $db = new SQLite3($fname); 
    foreach($arr_grp as $gstr){
        // print $gstr."\n";
        list($grp, $entryValue) = explode("=",$gstr);
        $grps = explode(".", $grp);
        $entryName = array_pop($grps);
        $groupPath = join(".",$grps);

        $sq = "select datatype, option, readonly from ".$_GET['table']." where groupPath='".$groupPath."' and entryName='".$entryName."'";
        print $sq;
        $rs = $db->query($sq);
        $row = $rs->fetchArray();
        if (!$row) {
            print "Key error, ".$groupPath.".".$entryName."\n";
            continue;
        }
        if ($row['readonly'] == 1) {
            print "this parameter is read only\n";
            continue;
        }
        if($row['datatype']=='int' || $row['datatype']=='port') {
            if (!is_numeric($entryValue)) {
                print "Values Error, Integer only \n";
                continue;
            }
        }
        if ($row['datatype']=='yesno' || $row['datatype']=='select') {
            if (!strpos(" ".$row['option'], $entryValue)){
                print "Values Error: value should be in '".$row['option']."' \n";
                continue;
            }
        
        }
        array_push($arr_sq, array("entryValue"=>$entryValue, "groupPath"=>$groupPath, "entryName"=>$entryName));
        // array_push($arr_sq, "update ".$_GET['table']." set entryValue='".$entryValue."' where groupPath='".strtolower($groupPath)."' and entryName='".$entryName."'");
        
    }
    // select * from param_tbl where groupPath='network.eth0' and entryName='subnet'
    // select * from param_tbl where groupPath='NETWORK.Eth0' and entryName='subnet'
    // select * from param_tbl where groupPath='network.eth0' and entryName='ipaddr'
       
    foreach($arr_sq as $arr) {
        $sq = "update ".$_GET['table']." set entryValue='".$arr['entryValue']."' where groupPath='".strtolower($arr['groupPath'])."' and entryName='".$arr['entryName']."'";
        // print $sq."\n";
        $rs = $db->query($sq);
        if($rs){
            print "update OK, ".$arr['groupPath'].".".$arr['entryName']."=".$arr['entryValue']."\n";
        }
        else {
            print "update FAIL\n";
        }
    }
    $db->close();
   
}

else if($_GET['action'] == 'add'){
    header("Content-Type: text/plain");
    $groupAvailable= ['EVENT', 'EVENTPROFILE','MD','PTZ',"SCHEDULE"];
    if (!isset($_GET['group'])) {
        print "Error, add action needs group";
        exit();
    }
    $ex_grp = explode(".",$_GET['group']);
    $grp_header = strtoupper($ex_grp[0]);
    if (!in_array($grp_header, $groupAvailable)) {
        print "Error, group should be one of [".join(", ", $groupAvailable )."]";
        exit();
    }
    $arr =array();
    for ($i=0; $i<sizeof($ex_grp); $i++){
        array_push($arr, "group".($i+1)."='".$ex_grp[$i]."'");
    }
    $sq = join(" and ",$arr);
    $sq = "select * from ".$_GET['table']." where ".$sq;

    print $sq;
    
}

else if($_GET['action'] == 'modify'){
    header("Content-Type: text/plain");
}


else if($_GET['action'] == 'query'){
    header("Content-Type: text/plain");
    if (isset($_GET['group'])){
        $eGroups = array();
        $arr_sq = array();
        $arr_rs = array();

        foreach(explode(",", $_GET['group']) as $grps){
            $grps = trim($grps);
            $arr = array();
            foreach(explode(".", $grps) as $exgrp){
                array_push($arr, strtolower(trim($exgrp)));
            }
            array_push($eGroups, $arr);
        }    

        foreach($eGroups as $grps) {
            $arr = array();
            for($i=0; $i<sizeof($grps); $i++){
                if (sizeof($grps) > 1 && $i==(sizeof($grps)-1)){
                    array_push($arr, "(group".($i+1)."='".$grps[$i]."' or entryName='".$grps[$i]."')");
                }
                else{
                    array_push($arr, "group".($i+1)."='".$grps[$i]."'");
                }
            }
            if ($arr){
                $sq = "where ".join(" and ", $arr);
                array_push($arr_sq, $sq);
            }
        }
    }
    else {
        $arr_sq = array('');
    }
    // print_r($arr_sq);
    $db = new SQLite3($fname); 
    foreach($arr_sq as $wsq) {
        $sq = "select groupPath, entryName, datatype, option, readonly from ".$_GET['table']." ".$wsq." order by groupPath asc";
        // print $sq."\n";
        $rs = $db->query($sq);
        while ($row = $rs->fetchArray()) {
            if (!$row['option']) {
                $row['option'] = 0;
            }
            $arr_rs[$row['groupPath'].".".$row['entryName']] = $row['datatype']."|".$row['option'];
            if($row['readonly']==1) {
                $arr_rs[$row['groupPath'].".".$row['entryName']] .= "|readonly";
            }
        }
    }
    $db->close();
    // print_r($arr_rs);

    header("Content-Type: text/plain");
    foreach($arr_rs as $A => $B) {
        print $A."=".$B."\n";
    }
}
exit();

if ($action == 'add'){
    for ($i=0; $i<sizeof($eGroups); $i++) {
        if($eGroups[$i][0] == 'grouppath'){
            $exp_grp = explode(".",$eValues[$i]);
            $entryName = array_pop($exp_grp);
            $groupPath ="";
            for($j=0; $j<sizeof($exp_grp); $j++){
                if ($groupPath) {
                    $groupPath .= ".";
                }
                $groupPath .= $exp_grp[$j];
                $grp[$j] = $exp_grp[$j];
            }
        }
        else {
            ${$eGroups[$i][0]} = $eValues[$i];
        }
    }
    if($datatype=='int' || $datatype=='port') {
        if (!is_numeric($value)) {
            print "Values Error, Integer only \n";
            exit();
        }
    }
    else if ($datatype=='yesno' || $datatype=='select') {
        if (!strpos(" ".$option, $value)){
            print "Values Error: value should be in '".$option."' \n";
            exit();
        }
    }

    $sq = "insert into ".$_GET['table']."
        (groupPath, entryName, entryValue, group1, group2, group3, group4, group5, group6, made, regdate, description, datatype, option, create_permission, delete_permission, update_permission, read_permission,  readonly, writeonly) 
        values('".$groupPath."','".$entryName."', '".$value."', '".$grp[0]."', '".$grp[1]."', '".$grp[2]."', '".$grp[3]."', '".$grp[4]."', '".$grp[5]."', '".$made."', '".time()."', '".$description."', '".$datatype."', '".$option."', '".$create_permission."', '".$delete_permission."', '".$update_permission."', '".$read_permission."', '".$readonly."', '".$writeonly."') ";

    // print $sq;
    $rs = $db->query($sq);
    if($rs){
        print "add OK\n";
    }
    else {
        print "add FAIL\n";
    }    
}


else if ($action == 'modify'){
}
else if ($action == 'delete'){
}
else if ($action == 'query'){
    for ($i=0; $i<sizeof($eGroups); $i++){
        $upd_sq = "";
        $sel_sq = "";
        $sq = "";
        for($j=0; $j<6; $j++){
            if (!isset($eGroups[$i][$j]) || !$eGroups[$i][$j]) {
                continue;
            }
            if ($sq) {
                $sq .= " and ";
            }
            $sq .= "group".($j+1)."='".$eGroups[$i][$j]."'";
        }
        if ($sq) {
            $sq = "where ".$sq;
        }
        $sel_sq = "select groupPath, entryName, entryValue from ".$_GET['table']." ".$sq." order by groupPath asc";
        $sel_sq = "select  * from ".$_GET['table']." ".$sq." order by groupPath asc";
        array_push($arr_sq, $sel_sq);
    }
    $arr_rs = array();
    for ($i=0; $i<sizeof($arr_sq); $i++){
        $rs = $db->query($arr_sq[$i]);
        while ($row = $rs->fetchArray()) {
            // array_push($arr_rs, ($row['groupPath'].".".$row['entryName']."=".$row['entryValue']));
            array_push($arr_rs, ($row['groupPath'].".".$row['entryName']."=".join("|",$row)));
        }
    }
    $db->close();
    header("Content-Type: text/plain");
    foreach($arr_rs as $A => $B) {
        print $B;
        print "\n";
    }   
}


$db->close();

exit();



?>
