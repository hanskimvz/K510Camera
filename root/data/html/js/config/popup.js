var g_playChk = 0;
var g_snapshotPlay = false;
var g_snapshotUrl = "/uapi-cgi/snapshot.fcgi";
var g_videoWidth = 608;
var g_videoHeight = 342;
var g_flagResize = true;

$(function () {
	PreCustomize();

	// Language set
	var environmentReq = new CGIRequest();
	var environmentReqQString = "";
	var langDepth = setup + maincontents + "popup";
	environmentReq.SetAddress("/environment.xml");
	environmentReq.SetCallBackFunc(function(xml){
		var revLang = "/language/English.xml";
		if($('lang', xml).size() > 0)
		{
			revLang = $('lang', xml).text();
			getLangXml(revLang, langDepth);
			LoadParamJs("ENCODER&NETWORK&VIDEOIN&cache", Run);
		}
	});

	environmentReq.Request(environmentReqQString);
});

function Run()
{
	_debug("start");
	
	var changeWidthHeight = adjustRatioWidthHeight(VIDEOIN_CH0_CMOS_RATIO, g_videoHeight);
	g_videoWidth = changeWidthHeight[0];
	g_videoHeight = changeWidthHeight[1];

	InitThemes();
	InitForm();
	EventBind();
	ContentShow();

	PostCustomize();

	_debug("stop");
}

function InitForm()
{
	$("button").button();
	if(browserCheck() != "msie")
	{
		$("#btnFull").hide();
	}

	SetVideoSize();
	InitStartVideo();
}

function EventBind()
{
	$("#btnFull").click(function() {
		if(AxUMF !== undefined)
		{
			AxUMF.SetParam("CONTROL", "FULLSCREEN", "ON");
		}
	});

	$("#btnClose").click(function() {
		window.close();
	});
}

function InitStartVideo()
{
	var playStatus = "PLAY";
	g_playChk = 1;
	g_snapshotPlay = false;

	if(browserCheck() == "msie")
	{
		AxUMF_create(g_videoWidth,
						g_videoHeight,
						StartSnapshot,
						function () {
							g_playChk = 1;
							if(AxUMF !== undefined)
							{
								AxUMF.SetParam("CONTROL", "AUDIO", "OFF");
							}
						}, 
						null);
	}
	else
	{
		if(NETWORK_SRTP_ENABLE == "yes")
		{
			StartSnapshot();
		}
		else
		{
			qtime_start(playStatus);
		}
	}
}

function player_start(playStatus)
{
	if(playStatus == "STOP")
	{
		g_playChk = 0;
		AxUMF_stop();
	}
	else if(playStatus == "PLAY")
	{
		g_playChk = 1;
		AxUMF_play();
	}
}

function qtime_start(playStatus)
{
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

	// stream Name select
	var streamNum = 0;
	var trans = "UNICAST";
	var rtspPort = NETWORK_RTSP_PORT;
	var ipAddr = document.domain;
	var firstStreamEnable = eval("ENCODER_CH0_VIDEOCODEC_ST0_ENABLE");
	var secondStreamEnable = eval("ENCODER_CH0_VIDEOCODEC_ST1_ENABLE");
	var streamUri = "rtsp://" + ipAddr + ":" + rtspPort +"/";

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

	objStr += "<div id='objVideoScreen' style='width:" + g_videoWidth + "px; height:" + g_videoHeight + "px;'>"
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
	objStr += " name='preview'";
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
	objStr += "</object>";
	objStr += "</div>";

	$("#screen").html(objStr);

	if(haveqt == false)
	{
		qtime_error();
		return;
	}
}

function qtime_error()
{
	setTimeout(StartSnapshot, 1000);
}

function activex_error()
{
	StartSnapshot();
}

function StartSnapshot()
{
	$("#btnFull").hide();
	$("#screen").empty();
	$("#screen").append("<img>")
	.find("img:last").attr("id", "snapshotArea");

	$("#snapshotArea").attr({
		width: g_videoWidth,
		height: g_videoHeight
	});

	g_snapshotPlay = true;
	$("#snapshotArea").hide();
	reflashImage();
}

function reflashImage() 
{
	loadImage = function() {
		if(g_snapshotPlay === false) {
			return;
		}
		$("#snapshotArea").attr("src", ImageBuf.src);
		$("#snapshotArea").show();
		if(g_flagResize == true)
		{
			ResizePage();
			g_flagResize = false;
		}

		setTimeout(function() {
			ImageBuf.src = g_snapshotUrl + "?_=" + (new Date()).getTime();
		}, 200);
	}
	var ImageBuf = new Image();
	$(ImageBuf).load(loadImage);
	$(ImageBuf).error(function() {
		setTimeout(function() {
			ImageBuf.src = g_snapshotUrl + "?_=" + (new Date()).getTime();
		}, 1000);
	});
	ImageBuf.src = g_snapshotUrl;
}

function SetVideoSize()
{
	var rotateValue = VIDEOIN_CH0_ROTATE_DIRECTION;

	switch(rotateValue)
	{
	case "left":
	case "right":
		var resultWH = ExchangeValues(g_videoWidth, g_videoHeight);
		g_videoWidth = resultWH.value1;
		g_videoHeight = resultWH.value2;
		break;
	case "none":
		break;
	}
}