
<?PHP
// error_reporting( E_ALL );
// ini_set( 'display_errors', '1' );

$_COOKIE['role'] ='admin';
// print "cookie: "; print_r($_COOKIE); 

if ($_COOKIE['role'] !='admin') {
    print "not permitted \n";
    exit();
}

if(!isset($_GET['table'])  || !$_GET['table']) {
    $_GET['table'] = 'param_tbl';
}

if (!isset($_GET['action'])){
    // action : list, update, add, modify, delete, query
    $_GET['action'] = 'list';
}

$fname ="/mnt/db/param.db";

if ($_GET['action'] == 'list' && $_GET['table']=='param_tbl'){
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
    $db = new SQLite3($fname); 
    foreach($arr_sq as $wsq) {
        $sq = "select groupPath, entryName, entryValue from ".$_GET['table']." ".$wsq." order by groupPath asc";
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
        $json = new Services_JSON();
        $json_str = $json->encode($arr_rs);
        print($json_str);
    }
    else if($_GET['format']=="plain"){
        header("Content-Type: text/plain");
        foreach($arr_rs as $A => $B) {
            print $A."=".$B."\n";
        }
    }
   
}
else if ($_GET['action'] == 'list' && $_GET['table']=='user_tbl'){
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
    print($json_str);    
}

else if($_GET['action']=='update'){
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
else if($_GET['action'] == 'delete'){
    header("Content-Type: text/plain");

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
