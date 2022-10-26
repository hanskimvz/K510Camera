<?php
$json_str = file_get_contents($_SERVER['DOCUMENT_ROOT']."/inc/menu.json");
$objmenu = json_decode($json_str);

// print_r($objmenu);
$top_left_menu= '';
foreach(($objmenu->top_left_menu) as $menu ){
    if ($menu->flag =='n') {
        continue;
    }
    $disabled =  $menu->id == "setting" ? "disabled" : "";
    $top_left_menu.= '<button class="btn btn-white" onClick="location.href=(\''.$menu->href.'\')" style="padding:10px 0px 10px 0px; text-align:center;" '.$disabled.'>'.$menu->display.'</button>';
}
$top_left_menu = '<div id="topmenu" class="btn-group btn-group text-center mt-3 pl-2 pr-2" role="group">'.$top_left_menu.'</div>';

$leftMenu = '<li class="nav-item">';
foreach(($objmenu->config) as $grp=>$obj){
    if ($obj->display =='n') {
        continue;
    }
	$leftMenu .= '<a class="nav-link collapsed" href="#" data-toggle="collapse" data-target="#'.$grp.'" aria-expanded="false" aria-controls="'.$grp.'"><span>'.($obj->display).'</span></a>';
	$leftMenu .= '<div id="'.$grp.'" class="collapse" data-parent="#accordionSidebar"><div class="bg-white py-2 collapse-inner rounded">';

    foreach(($obj->submenus) as $page => $param){
        if ($param->flag == 'n'){
            continue;
        }
		$leftMenu .= '<a id="'.($param->lang_key).'" class="collapse-item" href="'.$param->href.'"  target="contentFrame"><span>'.($param->display).'</span></a>';
	}
	$leftMenu .= '</div></div>';
}
$leftMenu .= '</li>';

$sidemenu = '
<ul class="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
'.$top_left_menu.'
'.$leftMenu.'
</ul>';

?>