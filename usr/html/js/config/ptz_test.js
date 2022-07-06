var g_snapshot_play = false;
var g_snapshot_url = "/uapi-cgi/snapshot.fcgi";
var chk = 0;
var g_resChk = 0;
var g_width = 640;//480;
var g_height = 360;//270;
var g_selectIndex = 0;
var g_Command = "undefined";

$(function () {
  PreCustomize();
  var classNum = ["04020916", "04020917", "04020918", "04020919", "04020920", "04020921", "04020923", "04020924", "0501"];
  InitMsgLang(classNum);
  
  // Language set
  var environmentReq = new CGIRequest();
  var environmentReqQString = "";
  var langDepth = setup + maincontents + "privacymask3d";
  environmentReq.SetAddress("/environment.xml");
  environmentReq.SetCallBackFunc(function(xml){
    var revLang = "/language/English.xml";
    if($('lang', xml).size() > 0)
    {
      revLang = $('lang', xml).text();
      getLangXml(revLang, langDepth);
      LoadParamJs("NETWORK&ENCODER&EVENTPROFILE&VIDEOIN&cache", Run);
    }
  });
  environmentReq.Request(environmentReqQString);
});

function testPage()
{
  return true;
}

function Run()
{
  var changeWidthHeight = adjustRatioWidthHeight(VIDEOIN_CH0_CMOS_RATIO, g_height);
  g_width = changeWidthHeight[0];
  g_height = changeWidthHeight[1];
  InitThemes();
  InitForm();
  ContentShow();
  Load();
  PostCustomize();
}

function Load()
{
  _debug("start");

  if (StartVideo() == true)
  {
    setTimeout( function() {
      MotionOn();     
      InitSetting();
      EventBind();

      ViewLoadingSave(false);
    }, 50);
  }
  ResizePage();

  _debug("stop");
}



function InitForm()
{
  $("button").button();
  $(".view").css("max-width", "900px");
  
  //ptz panel UI
  $("#ptz_panel dd").each(function(index, element) {
    ptzImageName = "../images/"+$(this).attr("id")+".gif";
    $(this).css("background", "url('" + ptzImageName + "')  no-repeat center");
  });

   // ptz speedbar
  $("#ptz_speedbar #slider_speedbar").each(function(index, element) {
    var $obj = $(this).parent().parent().find("input[type='text']");
    $(this).slider({
      range: "min",
      min: 1,
      max: 100,
      value: 20,
      slide: function(event, ui) {
        $obj.val(ui.value);
      }
    })
  });

  $("#text_speedbar").val(20);

  // speed range
  $("#text_speedbar:text").blur(function(){
    var inputValSpeed = $("#text_speedbar:text").val();
    if(inputValSpeed < 1 || inputValSpeed > 100 || inputValSpeed == "")
    {
      $("#text_speedbar:text").val(1).focus();
      $("#slider_speedbar").slider("value", 1);
      alert(GetMsgLang("04020916"));
    }
  });
  // speed Text box, Slider-bar 동기화
  $("#text_speedbar:text").keyup(function() {
      $("#slider_speedbar").slider("value", $("#text_speedbar:text").val());
  });
}

function InitSetting()
{
  var szValue = "ADD,0,0,0,2499,4999";
  AxUMF.SetParam("CONTROL", "MOTIONAREA", szValue);
}

function EventBind()
{
  var opStrPtzStop = "cpantiltzoommove=0,0,0";
  var opStrFocusStop = "cfocusmove=0";
  $("input[type='button']").attr("disabled", "");
  
  $("#loading_msg").css({
    top: "100px",
    left: "50%"
  });

  $("#setROIZoom").click(function(){
    g_Command = "ROIZ";
    MotionList();
  });
  $("#getBack").click(function(){
    var opStr = "getback";
    actionMove(opStr);
  });
  $("#setPointToCenter").click(function(){
    g_Command = "PTC";
    MotionList();
  });

  /* PTZ */
  // Left up
  $("#pt_lu").mousedown(function(){
    var opStr = "cpantiltzoommove=" + "-" + $("#text_speedbar").val() + "," + $("#text_speedbar").val() + ",0";
    if(g_resChk == 1)
      return;
    actionMove(opStr);
    chk = 1;
    g_resChk = 1;
  }).mouseup(function(){
    actionStop(opStrPtzStop);
  }).mouseout(function(){
    actionStop(opStrPtzStop);
  });
  // Center up
  $("#pt_cu").mousedown(function(){
    var opStr = "cpantiltzoommove=" + "0," + $("#text_speedbar").val() + ",0";
    if(g_resChk == 1)
      return;
    actionMove(opStr);
    chk = 1;
    g_resChk = 1;
  }).mouseup(function(){
    actionStop(opStrPtzStop);
  }).mouseout(function(){
    actionStop(opStrPtzStop);
  });
  // Right up
  $("#pt_ru").mousedown(function(){
    var opStr = "cpantiltzoommove=" + $("#text_speedbar").val() + "," + $("#text_speedbar").val() + ",0";
    if(g_resChk == 1)
      return;
    actionMove(opStr);
    chk = 1;
    g_resChk = 1;
  }).mouseup(function(){
    actionStop(opStrPtzStop);
  }).mouseout(function(){
    actionStop(opStrPtzStop);
  });
  // Left middle
  $("#pt_lm").mousedown(function(){
    var opStr = "cpantiltzoommove=" + "-" + $("#text_speedbar").val() + ",0,0";
    if(g_resChk == 1)
      return;
    actionMove(opStr);
    chk = 1;
    g_resChk = 1;
  }).mouseup(function(){
    actionStop(opStrPtzStop);
  }).mouseout(function(){
    actionStop(opStrPtzStop);
  });
  // Center middle - Stop
  $("#pt_cm").mousedown(function(){
    chk = 1;
    actionStop(opStrPtzStop);
  });
  // Right middle
  $("#pt_rm").mousedown(function(){
    var opStr = "cpantiltzoommove=" + $("#text_speedbar").val() + ",0,0";
    if(g_resChk == 1)
      return;
    actionMove(opStr);
    chk = 1;
    g_resChk = 1;
  }).mouseup(function(){
    actionStop(opStrPtzStop);
  }).mouseout(function(){
    actionStop(opStrPtzStop);
  });
  // Left down
  $("#pt_ld").mousedown(function(){
    var opStr = "cpantiltzoommove=" + "-" + $("#text_speedbar").val() + "," + "-" + $("#text_speedbar").val() + ",0";
    if(g_resChk == 1)
      return;
    actionMove(opStr);
    chk = 1;
    g_resChk = 1;
  }).mouseup(function(){
    actionStop(opStrPtzStop);
  }).mouseout(function(){
    actionStop(opStrPtzStop);
  });
  // Center down
  $("#pt_cd").mousedown(function(){
    var opStr = "cpantiltzoommove=" + "0," + "-" + $("#text_speedbar").val() + ",0";
    if(g_resChk == 1)
      return;
    actionMove(opStr);
    chk = 1;
    g_resChk = 1;
  }).mouseup(function(){
    actionStop(opStrPtzStop);
  }).mouseout(function(){
    actionStop(opStrPtzStop);
  });
  // Right down
  $("#pt_rd").mousedown(function(){
    var opStr = "cpantiltzoommove=" + $("#text_speedbar").val() + "," + "-" + $("#text_speedbar").val() + ",0";
    if(g_resChk == 1)
      return;
    actionMove(opStr);
    chk = 1;
    g_resChk = 1;
  }).mouseup(function(){
    actionStop(opStrPtzStop);
  }).mouseout(function(){
    actionStop(opStrPtzStop);
  });

  // Zoom
  $("#_zIn").mousedown(function(){
    var opStr = "cpantiltzoommove=0,0," + $("#text_speedbar").val();
    if(g_resChk == 1)
      return;
    actionMove(opStr);
    chk = 1;
    g_resChk = 1;
  }).mouseup(function(){
    actionStop(opStrPtzStop);
  }).mouseout(function(){
    actionStop(opStrPtzStop);
  });
  $("#_zOut").mousedown(function(){
    var opStr = "cpantiltzoommove=0,0," + "-" + $("#text_speedbar").val();
    if(g_resChk == 1)
      return;
    actionMove(opStr);
    chk = 1;
    g_resChk = 1;
  }).mouseup(function(){
    actionStop(opStrPtzStop);
  }).mouseout(function(){
    actionStop(opStrPtzStop);
  });

  // Focus
  $("#_fNear").mousedown(function(){
    var opStr = "cfocusmove=" + $("#text_speedbar").val();
    if(g_resChk == 1)
      return;
    actionMove(opStr);
    chk = 1;
    g_resChk = 1;
  }).mouseup(function(){
    actionStop(opStrFocusStop);
  }).mouseout(function(){
    actionStop(opStrFocusStop);
  });
  $("#_fFar").mousedown(function(){
    var opStr = "cfocusmove=" + "-" + $("#text_speedbar").val();
    if(g_resChk == 1)
      return;
    actionMove(opStr);
    chk = 1;
    g_resChk = 1;
  }).mouseup(function(){
    actionStop(opStrFocusStop);
  }).mouseout(function(){
    actionStop(opStrFocusStop);
  });

  $("#btnSave").click(function(){
    if(g_selectIndex == "0")
    {
      alert("Select zone id");
      return;
    }

    stopPrivacySetting(g_selectIndex);
    savePrivacySetting(g_selectIndex, $("#zoneEnableState").attr("checked") == true ? 1 : 0);
  });

}

////////////////////////////////////////////////////////////////////////////////
// Function name : qtime_start(streamUri, width, height)
// Description   : quicktime 영상 재생
// Return value  : 
////////////////////////////////////////////////////////////////////////////////
function qtime_start(streamUri, width, height)
{
  //Enable($("button#btnView"));
  var objStr = "";
  var haveqt = false;

  if (navigator.plugins) {
    for (i=0; i < navigator.plugins.length; i++ ) {
      console.log(navigator.plugins[i].name);
      if (navigator.plugins[i].name.indexOf("QuickTime") >= 0) {
        haveqt = true;
      }
    }
  }

  objStr += "<div id='objVideoScreen' style='width:" + g_width + "px; height:" + g_height + "px;'>"
  objStr += "<object width=100% height=100%";
  objStr += " CODEBASE='http://www.apple.com/qtactivex/qtplugin.cab' ONERROR='qtime_error();'>";
  //objStr += "<param name='src' value='/images/qtposter.mov'>";
  objStr += "<param name='qtsrc' value='" + streamUri + "'>";
  objStr += "<param name='autoplay' value='true'>";
  objStr += "<param name='controller' value='false'>";
  objStr += "<param name='type' value='video/quicktime'>";
  objStr += "<param name='scale' value='tofit'>";
  objStr += "<param name='target' value='myself'>";
  objStr += "<embed id='VideoScreen'";
  objStr += " width=100% height=100%";
  objStr += " type='video/quicktime'"
  objStr += " src='/images/qtposter.mov'";
  objStr += " src='" + streamUri + "'";
  objStr += " qtsrc='" + streamUri + "'";
  objStr += " autoplay='true'";
  objStr += " controller='false'";
  objStr += " type='video/quicktime'";
  objStr += " scale='tofit'";
  objStr += " target='myself'";
  objStr += " plugin='quicktimeplugin'";
  objStr += " cache='false'";
  objStr += " pluginspage='http://www.apple.com/quicktime/download/'";
  objStr += " loop='false'";
  objStr += "/>"
//      objStr += "<p>fail to loading...</p>";
  objStr += "</object>";
  objStr += "</div>";

  $("#screen").html(objStr);

  if(haveqt == false)
  {
    qtime_error();
    return;
  }
}

////////////////////////////////////////////////////////////////////////////////
// Function name : qtime_error()
// Description   : 퀵타임 설치 에러시 동작
// Return value  : 
////////////////////////////////////////////////////////////////////////////////
function qtime_error()
{
  setTimeout(StartSnapshot, 1000);
}

////////////////////////////////////////////////////////////////////////////////
// Function name : activex_error()
// Description   : ActiveX 설치 에러시 동작
// Return value  : 
////////////////////////////////////////////////////////////////////////////////
function activex_error()
{
  StartSnapshot();
}

////////////////////////////////////////////////////////////////////////////////
// Function name : StartSnapshot()
// Description   : Snapshot 출력, 영상 설치전
// Return value  : 
////////////////////////////////////////////////////////////////////////////////
function StartSnapshot()
{
  $("#screen").empty();
  $("#screen").append("<img>")
    .find("img:last").attr("id", "snapshotArea");
    
  $("#snapshotArea").attr("style" , "width:" + g_width + "px; height:" + g_height + "px;");    

  g_snapshot_play = true;
  $("#snapshotArea").hide();
  reflashImage();
}

////////////////////////////////////////////////////////////////////////////////
// Function name : reflashImage()
// Description   : Snapshot 이미지 로드
// Return value  : 
////////////////////////////////////////////////////////////////////////////////
var flag = false;
function reflashImage() 
{
  loadImage = function() {
    if(g_snapshot_play === false) 
    {
      return;
    }

    $("#snapshotArea").attr("src", ImageBuf.src);    
    $("#snapshotArea").show();
    if(flag == false)
    {
      ResizePage();
      flag = true;
    }
    
    setTimeout(function() {
      ImageBuf.src = g_snapshot_url + "?_=" + (new Date()).getTime();
    }, 200);
  }
  var ImageBuf = new Image();
  $(ImageBuf).load(loadImage);
  $(ImageBuf).error(function() {
    setTimeout(function() {
      ImageBuf.src = g_snapshot_url + "?_=" + (new Date()).getTime();
    }, 1000);
  });
  ImageBuf.src = g_snapshot_url;
}

////////////////////////////////////////////////////////////////////////////////
// Function name : StartVideo()
// Description   : 영상 재생
// Return value  : 
////////////////////////////////////////////////////////////////////////////////
function StartVideo()
{
  SetRotateSize();

  // stream Name select
  var streamNum = 0;
  var trans = "UNICAST";
  var rtspPort = NETWORK_RTSP_PORT;
  var streamUri = "rtsp://" + document.domain + ":" + rtspPort + "/";
  var firstStreamEnable = eval("ENCODER_CH0_VIDEOCODEC_ST0_ENABLE");
  var secondStreamEnable = eval("ENCODER_CH0_VIDEOCODEC_ST1_ENABLE");

  if(eval("NETWORK_RTP_ST0_UNICAST_ENABLE") == "yes" && firstStreamEnable == "yes")
  {
    streamNum = 0;
    trans = "UNICAST";
  }
  else if(eval("NETWORK_RTP_ST0_MULTICAST_ENABLE") == "yes" && firstStreamEnable == "yes")
  {
    streamNum = 0;
    trans = "MULTICAST";
  }
  else if(eval("NETWORK_RTP_ST1_UNICAST_ENABLE") == "yes" && secondStreamEnable == "yes")
  {
    streamNum = 1;
    trans = "UNICAST";
  }
  else if(eval("NETWORK_RTP_ST1_MULTICAST_ENABLE") == "yes" && secondStreamEnable == "yes")
  {
    streamNum = 1;
    trans = "MULTICAST";
  }
  streamUri += eval("NETWORK_RTP_ST" + streamNum + "_" + trans + "_NAME");

  g_snapshot_play = false;

  if (browserCheck() == "msie")
  {
    AxUMF_create(g_width,
                g_height,
                StartSnapshot,
                function () {
                  AxUMF.SetParam("CONTROL", "AUDIO", "OFF");
                }, 
                PTZTest_ActiveX_Event,
                null);
  }
  else
  {
    $(".noIEMsg").css("display", "inline");
    $(".noIEContents").css("display", "none");
    if(NETWORK_SRTP_ENABLE == "yes")
    {
    	StartSnapshot();
    }
    else
    {
    	if(qtime_start(streamUri, g_width, g_height) == false) 
    		return false;
    }
  }
  return true;
}

function MotionOn()
{
  if(AxUMF !== undefined)
  {
    AxUMF.SetParam("CONTROL", "MOTION", "ON");
  }
}
function MotionList()
{
  if(AxUMF !== undefined)
  {
    AxUMF.SetParam("CONTROL", "MOTIONAREA", "LIST");
  }
}
function setCMD(szValue)
{
  var staticList = szValue.split(";");
  var listId = staticList[0].split(",");
  var opStr = "";

  if(g_Command == "ROIZ")
  {
    opStr = "roizoom=" + listId[1] + "," + listId[2] + "," + listId[3] + "," + listId[4];
  }
  else if(g_Command == "PTC")
  {
    opStr = "pointtocenter=" + listId[1] + "," + listId[2];
  }

  if(opStr != "")
  {
    actionMove(opStr);
  }
}

////////////////////////////////////////////////////////////////////////////////
// Function name : actionMove(opString) 
// Description   : PTZ 이동
// Return value  : 
////////////////////////////////////////////////////////////////////////////////
function actionMove(opString)
{
  var actionReq = new CGIRequest();
  var reqQString = "";

  reqQString += opString;
  actionReq.SetAddress("/nvc-cgi/ptz/ptz2.fcgi");
  actionReq.SetCallBackFunc(function(xml){
    g_resChk = 0;
    ViewLoadingSave(false);
    return;
  });
  actionReq.Request(reqQString);
}

////////////////////////////////////////////////////////////////////////////////
// Function name : actionStop(opStr) 
// Description   : PTZ 정지
// Return value  : 
////////////////////////////////////////////////////////////////////////////////
function actionStop(opStr)
{
  if(chk == 1)
  {
    var t=0;
    t = setInterval(function(){
      if(g_resChk == 0)
      {
        actionMove(opStr);
        clearInterval(t);
      }
    }, 10);
    chk = 0;
  }
}

////////////////////////////////////////////////////////////////////////////////
// Function name : SetRotateSize()
// Description   : Set width and height according to rotate state.
// Return value  : 
////////////////////////////////////////////////////////////////////////////////
function SetRotateSize()
{
  var rotateValue = VIDEOIN_CH0_ROTATE_DIRECTION;

  switch(rotateValue)
  {
    case "left":
    case "right":
      var result = ExchangeValues(g_width, g_height);
      g_width = result.value1;
      g_height = result.value2;
      break;
    case "none":
      break;
  }
}

function PTZTest_ActiveX_Event(szType, szValue)
{
  var MSG = document.getElementById("msg");
  var listNum = "";
  var AxUMF = document.getElementById("VideoScreen");

  if(szType == "MOTION_AREA_LIST")
  {
    setCMD(szValue);
  }
}