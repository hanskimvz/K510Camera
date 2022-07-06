<?php
require_once $_SERVER['DOCUMENT_ROOT']."/inc/json.php";
$header = '
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta http-equiv="Cache-Control" content="no-cache"/>
    <meta http-equiv="Expires" content="0"/>
    <meta http-equiv="Pragma" content="no-cache"/>
    <title></title>
    <link type="text/css" href="/css/common.css" rel="stylesheet" />

</head>';
// EOBLOCK;
/*

    <script type="text/javascript" src="/js/jquery-ui-1.8.4.min.js"></script>
    <script type="text/javascript" src="/js/jquery.ui.mouse.js"></script>
    <script type="text/javascript" src="/js/jquery.ui.slider.js"></script>
    <script type="text/javascript" src="/js/jquery.ui.slider-rtl.js"></script>
    <script type="text/javascript" src="/js/jquery.corner.js?v2.09"></script>
    <script type="text/javascript" src="/js/jquery.cookie.js"></script>
    <script type="text/javascript" src="/js/fafu_util.js"></script>
    <script type="text/javascript" src="/js/common.js"></script>
    <script type="text/javascript" src="./js/utils/log.js"></script>
    <script type="text/javascript" src="./js/utils/jq_control.js"></script>
    <script type="text/javascript" src="./js/utils/jq_string.js"></script>
    <script type="text/javascript" src="./js/uapi.ajax.js"></script>

    <script type="text/javascript" src="./js/jquery.browser.js"></script>
    <script type="text/javascript" src="./js/jquery.alphanumeric.pack.js"></script>
    <script type="text/javascript" src="./js/uapi.player.js"></script>
    <script type="text/javascript" src="./js/activexobject.js"></script>
    <script type="text/javascript" src="./js/activexptz.js"></script>
    <!--script type="text/javascript" src="./js/defstring/defbrand.js"></script-->
    <script type="text/javascript" src="./js/plat_utils/string.js"></script>
    <!--script type="text/javascript" src="./js/plat_utils/control.js"></script-->
    <!--script type="text/javascript" src="./js/plat_utils/brand.js"></script-->
    <!--script type="text/javascript" src="./js/plat_utils/uconfig.js"></script-->
    <!--script type="text/javascript" src="./js/brand.js"></script-->
    <!--script type="text/javascript" src="./js/main.js"></script-->

    <!--[If lte IE 8]>
        <link type="text/css" href="./css/ie8.css" rel="stylesheet" />
    <![endif]-->
    <!--[If lte IE 7]>
        <script type="text/javascript" src="./js/ie_exception.js"></script>
    <![endif]-->
    <!--[If lte IE 5]>
        <table bgcolor="#FF5555" width="100%" border="0" cellspacing="8">
            <tr>
                <th align="center">
                    <font size="3" color="#FFF7F7" face="Verdana, Geneva, Arial, Helvetica, sans-serif">
                        Your web browser does not support.<br>Please try one of these more modern browsers.
                    </font>
                </th>
            <tr>
                <th align="center">
                    <font size="2" color="#FFDCD4" face="Arial, Helvetica, sans-serif, Verdana, Geneva">
                        IE8 or later &nbsp; Firefox &nbsp; Chrome &nbsp; Safari
                    </font>
                </th>
            </tr>
        </table>
    <![endif]-->

    */

$top_menu = '<div id="top">
    <div id="logomenu"><a href="/"><img id="logo" class="mainLogoLink" alt="" /></a></div>
    <div id="topmenu" class="ui-widget-header" style="display:block">
        <ul id="list">
            <li><a href="/config/" class="0103">Setup</a></li>
            <li class="storage_TopMenu"><a href="/storage/" class="0109">Search</a></li>
            <li class="ui-state-hover-top"><a href="/">Live</a></li>
        </ul>
    </div>
    <div id="brandname">Nicehans</div>
</div>';



$footer = '
    <script type="text/javascript" src="/js/jquery.min.js"></script>
';

// $footer="";

?>