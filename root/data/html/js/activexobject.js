(function activexobject()
{
  var objStr = "";
  objStr += "<object id='VideoScreen'";
  objStr += " style='display:none'";
  objStr += " classid='clsid:D3BBBE84-3866-4FA1-A4D4-EFA9B9FE611D'";
  objStr += " codebase='/activex/AxUMF.cab#version=" + player_version + "'";
  objStr += "></object>";

  if (browserCheck() == "msie") {
    document.write(objStr);
  }
}())

var AxUMF = undefined;
var AxUMF_on_error = undefined;
var AxUMF_config = undefined;
var AxUMF_on_activex_event = undefined;
var run_custom_activex_event = false;
var AxUMF_session_name = undefined;
var AxUMF_select_session = undefined;
var g_hostName = "";

function AttachIE11Event(_strEventId, _functionCallback) 
{
  var nameFromToStringRegex = /^function\s?([^\s(]*)/;
  var paramsFromToStringRegex = /\(\)|\(.+\)/;
  var params = _functionCallback.toString().match(paramsFromToStringRegex)[0];
  var functionName = _functionCallback.name || _functionCallback.toString().match(nameFromToStringRegex)[1];
  var handler;
  try 
  {
    handler = document.createElement("script");
    handler.setAttribute("for", this.id);
  }
  catch(ex) 
  {
    handler = document.createElement('<script for="' + this.id + '">');
  }
  handler.event = _strEventId + params;
  handler.appendChild(document.createTextNode(functionName + params + ";"));
  document.body.appendChild(handler);
};

function AxUMF_defaultSessionSetup()
{
  // stream Name select
  var streamNum = 0;
  var trans = "UNICAST";
  var firstStreamEnable = ENCODER_CH0_VIDEOCODEC_ST0_ENABLE;
  var secondStreamEnable = ENCODER_CH0_VIDEOCODEC_ST1_ENABLE;
  AxUMF_select_session = "tcp";

  if(NETWORK_RTP_ST0_UNICAST_ENABLE == "yes" && firstStreamEnable == "yes")
  {
    streamNum = 0;
    trans = "UNICAST";
  }
  else if(NETWORK_RTP_ST0_MULTICAST_ENABLE == "yes" && firstStreamEnable == "yes")
  {
    streamNum = 0;
    trans = "MULTICAST";
  }
  else if(NETWORK_RTP_ST1_UNICAST_ENABLE == "yes" && secondStreamEnable == "yes")
  {
    streamNum = 1;
    trans = "UNICAST";
  }
  else if(NETWORK_RTP_ST1_MULTICAST_ENABLE == "yes" && secondStreamEnable == "yes")
  {
    streamNum = 1;
    trans = "MULTICAST";
  }
  AxUMF_session_name = eval("NETWORK_RTP_ST" + streamNum + "_" + trans + "_NAME")

  if(trans == 'MULTICAST')
  {
    AxUMF_select_session = "multicast";
  }
  else if(trans == 'UNICAST')
  {
    AxUMF_select_session = "tcp";
  }
}

function AxUMF_create(width, height, on_error, config, on_activex_event, sessionName, selectSession, runAttach)
{
  AxUMF_on_error = on_error;
  AxUMF_config = config;
  AxUMF_on_activex_event = on_activex_event;
  if(sessionName && selectSession)
  {
    AxUMF_session_name = sessionName;
    AxUMF_select_session = selectSession;
  }
  else
  {
    AxUMF_defaultSessionSetup();
  }

  if(!AxUMF)
  {
    AxUMF = $("#VideoScreen")[0];
  }

  if(!AxUMF || !AxUMF.object)
  {
    if(AxUMF_on_error && typeof(AxUMF_on_error) == 'function')
    {
      AxUMF = undefined;
      AxUMF_on_error();
    }      
    return;
  }
  // Create attachEvent for IE11
  if(AxUMF.attachEvent == undefined)
    AxUMF.attachEvent = AttachIE11Event;

  AxUMF.setAttribute("style", "display:inline");
  if(AxUMF_on_error)
    AxUMF.setAttribute("onerror", AxUMF_on_error.toString());
  AxUMF.setAttribute("width", width);
  AxUMF.setAttribute("height", height);
  if (document.adoptNode) {
    //JL: We need to adopt node to change the element ownership when moving 
    //across iframe DOMs, or a DOMException.WRONG_DOCUMENT_ERR exception is thrown.
    if($("#screen")[0].hasChildNodes())
      $("#screen")[0].replaceChild(document.adoptNode(AxUMF), $("#screen")[0].firstChild);
    else
      $("#screen")[0].appendChild(document.adoptNode(AxUMF));
  } else {
    //IE7 and IE8 only have DOM Level 1 support
    //so we need a work around.
    if($("#screen")[0].hasChildNodes())
      $("#screen")[0].replaceChild(AxUMF, $("#screen")[0].firstChild);
    else
      $("#screen")[0].appendChild(AxUMF);
  }

  var httpProtocol = window.location.protocol;
  var httpPort = window.location.port;
  var szURL;

  if(httpProtocol == "http:")
  {
    if(window.location.port == "" || window.location.port == 80)
      httpPort = 80;
    else
      httpPort = window.location.port;
  }
  else if(httpProtocol == "https:")
  {
    if(window.location.port == "" || window.location.port == 443)
      httpPort = 443;
    else
      httpPort = window.location.port;
  }

  g_hostName = window.location.hostname;
  if(isIPV6() == true)
  {
    if($.browser.version.substring(0, 2) == "8." ||
        $.browser.version.substring(0, 2) == "9.")
    {
      g_hostName = "[" + g_hostName + "]";
    }
  }

  szURL = httpProtocol + "//" + g_hostName + ":" + httpPort + "/activex/";

  var nRet;
  var selectSession = "";

  try{
	var nRet = -5;
    AxUMF.SetParam("INSTALL", "DEVICEURL", szURL);
  } catch(e)
  {
    if(AxUMF_on_error && typeof(AxUMF_on_error) == 'function')
    {
      AxUMF = undefined;
      AxUMF_on_error();
    }
    return;
  }
  var Ret = AxUMF.SetParam("INSTALL", "CHECKINSTALL", "");
  if( Ret == 0 )
  {
    if(AxUMF_on_error && typeof(AxUMF_on_error) == 'function')
    {
      AxUMF = undefined;
      AxUMF_on_error();
    }
    return;
  }

  if(runAttach != false)
  {
    if(AxUMF.attachEvent !== undefined)
    {
      AxUMF.attachEvent('AxUMFEvent', activeXObjEvent);
    }
    run_custom_activex_event = true;
  }

  AxUMF.SetParam("CONTROL", "CHECKREADY", "");  
}

function AxUMF_setup(rtspIp, rtspPort)
{
  nRet = AxUMF.SetParam("CONFIG", "LOGINID", PLAYER_UST);
  if(nRet < 0)
    return false;
  nRet = AxUMF.SetParam("CONFIG", "PASSWD", PLAYER_PST);
  if(nRet < 0)
    return false;
  nRet = AxUMF.SetParam("CONFIG", "RTSPIP", rtspIp);
  if(nRet < 0)
    return false;
  nRet = AxUMF.SetParam("CONFIG", "RTSPPORT", rtspPort);
  if(nRet < 0)
    return false;

  if(NETWORK_SRTP_ENABLE == "yes")
  {
    nRet = AxUMF.SetParam("CONFIG", "SRTPMASTERKEY", NETWORK_SRTP_KEY_MASTER);
    if(nRet < 0) return false;

    nRet = AxUMF.SetParam("CONFIG", "SRTPSALTKEY", NETWORK_SRTP_KEY_SALT);
    if(nRet < 0) return false;

    nRet = AxUMF.SetParam("CONFIG", "SRTPPROFILE", NETWORK_SRTP_PROTECTIONPROFILE);
    if(nRet < 0) return false;
  }
}

function AxUMF_start(sessionName, selectSession)
{
  if(AxUMF === undefined)
    return false;

  var nRet = 0;
  nRet = AxUMF.SetParam("CONFIG", "SESSIONNAME", sessionName);
  if(nRet < 0)
    return false;
  nRet = AxUMF.SetParam("CONFIG", "CONNECTTIMEOUT", "15");
  if(nRet < 0)
    return false;

  nRet = AxUMF.SetParam("CONFIG", "SESSION", selectSession);
  if(nRet < 0)
    return false;

  AxUMF.SetParam("CONTROL", "PLAY", "");
}

function activeXObjEvent(szType, szValue)
{
  if(szType == "AXUMF_CTRL_READY")
  {
    if(AxUMF_setup(g_hostName, NETWORK_RTSP_PORT) == false)
    {
      if(AxUMF_on_error && typeof(AxUMF_on_error) == 'function')
        AxUMF_on_error();
    }
    else
    {
      if (AxUMF_start(AxUMF_session_name, AxUMF_select_session) == false) {
        if(AxUMF_on_error && typeof(AxUMF_on_error) == 'function')
          AxUMF_on_error();
      }
    }
  }
  else
  if(szType == "AXUMF_FRAME_READY")
  {
    if(AxUMF_config && typeof(AxUMF_config) == 'function')
      AxUMF_config();
  }

  if(run_custom_activex_event && AxUMF_on_activex_event && typeof(AxUMF_on_activex_event) == 'function')
    AxUMF_on_activex_event(szType, szValue);
}

function AxUMF_stop()
{
  if(AxUMF !== undefined)
  {
    if(AxUMF.detachEvent !== undefined)
      AxUMF.detachEvent('AxUMFEvent', activeXObjEvent);
    run_custom_activex_event = false;
    AxUMF.SetParam("CONTROL", "STOP", "");
  }
}

function AxUMF_play()
{
  if(AxUMF !== undefined)
  {
    if(AxUMF.attachEvent !== undefined)
      AxUMF.attachEvent('AxUMFEvent', activeXObjEvent);
    run_custom_activex_event = true;
    AxUMF.SetParam("CONTROL", "PLAY", "");
  }
}

function AxUMF_resize(width, height)
{
  if(AxUMF != undefined)
  {
    AxUMF.setAttribute("width", width);
    AxUMF.setAttribute("height", height);
  }
}

function AxUMF_areaInit()
{
  if(AxUMF !== undefined)
  {
    AxUMF.SetParam("CONTROL", "MOTION", "ON");
  }
}

function AxUMF_areaAdd(addOption)
{
  if(AxUMF !== undefined)
  {
    AxUMF.SetParam("CONTROL", "MOTIONAREA", addOption);
  }
}

function AxUMF_areaMouseLButtonAdd()
{
  if(AxUMF !== undefined)
  {
    AxUMF.SetParam("CONTROL", "MOTIONAREA", "SET_MLBUTTON_ACTION,ADD");
  }
}

function AxUMF_areaMouseLButtonNone()
{
  if(AxUMF !== undefined)
  {
    AxUMF.SetParam("CONTROL", "MOTIONAREA", "SET_MLBUTTON_ACTION,NONE");
  }
}

function AxUMF_areaMouseRButtonNone()
{
  if(AxUMF !== undefined)
  {
    AxUMF.SetParam("CONTROL", "MOTIONAREA", "SET_MRBUTTON_ACTION,NONE");
  }
}

function AxUMF_areaMouseRButtonDeleteRequest()
{
  if(AxUMF !== undefined)
  {
    AxUMF.SetParam("CONTROL", "MOTIONAREA", "SET_MRBUTTON_ACTION,DELETE_REQUEST");
  }
}

function AxUMF_areaList()
{
  if(AxUMF !== undefined)
  {
    AxUMF.SetParam("CONTROL", "MOTIONAREA", "LIST");
  }
}

function AxUMF_areaSelectShow(idx)
{
  if(AxUMF !== undefined)
  {
    AxUMF.SetParam("CONTROL", "MOTIONAREA", "SHOW," + idx);
  }
}

function AxUMF_areaSelectHide(idx)
{
  if(AxUMF !== undefined)
  {
    AxUMF.SetParam("CONTROL", "MOTIONAREA", "HIDE," + idx);
  }
}

function AxUMF_areaSelect(idx)
{
  if(AxUMF !== undefined)
  {
    AxUMF.SetParam("CONTROL", "MOTIONAREA", "SELECT," + idx);
  }
}

function AxUMF_areaClear()
{
  if(AxUMF !== undefined)
  {
    AxUMF.SetParam("CONTROL", "MOTIONAREA", "CLEAR");
  }
}

function AxUMF_audioOff()
{
  if(AxUMF !== undefined)
  {
    AxUMF.SetParam("CONTROL", "AUDIO", "OFF");
  }
}
