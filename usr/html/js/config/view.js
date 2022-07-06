var g_isPlaySnapshot = false;
var g_snapshotURL = "/uapi-cgi/snapshot.fcgi";
var g_screenWidth = 608;
var g_screenHeight = 342;
var g_isResize = true;

$(function () {
	LoadParamJs("NETWORK&ENCODER&VIDEOIN", mainRun);
});

function mainRun()
{
	initViewSize();
	var changeWidthHeight = adjustRatioWidthHeight(VIDEOIN_CH0_CMOS_RATIO, g_screenHeight);
	g_screenWidth = changeWidthHeight[0];
	g_screenHeight = changeWidthHeight[1];

	startVideo();
	ResizePage();
}

function initViewSize()
{
	if(parent.$("#viewFrame").attr("width"))
		g_screenWidth = parent.$("#viewFrame").attr("width");

	if(parent.$("#viewFrame").attr("height"))
		g_screenHeight = parent.$("#viewFrame").attr("height");
}

function startVideo()
{
	SetRotateSize();
	var streamNum = 0;
	var trans = "UNICAST";
	var rtspPort = NETWORK_RTSP_PORT;
	var streamUri = "rtsp://" + document.domain + ":" + rtspPort + "/";

	if(NETWORK_RTP_ST0_MULTICAST_ENABLE == "yes" &&
		ENCODER_CH0_VIDEOCODEC_ST0_ENABLE == "yes")
	{
		streamNum = 0;
		trans = "MULTICAST";
	}
	else if(NETWORK_RTP_ST1_UNICAST_ENABLE == "yes" &&
		ENCODER_CH0_VIDEOCODEC_ST1_ENABLE == "yes")
	{
		streamNum = 1;
		trans = "UNICAST";
	}
	else if(NETWORK_RTP_ST1_MULTICAST_ENABLE == "yes" &&
		ENCODER_CH0_VIDEOCODEC_ST1_ENABLE == "yes")
	{
		streamNum = 1;
		trans = "MULTICAST";
	}

	streamUri += eval("NETWORK_RTP_ST" + streamNum + "_" + trans + "_NAME");
	g_isPlaySnapshot = false;

	if(browserCheck() == "msie")
	{
		AxUMF_create(g_screenWidth, g_screenHeight, StartSnapshot,
						function () {
							AxUMF.SetParam("CONTROL", "AUDIO", "OFF");
						}, null);
	}
	else
	{
		if(NETWORK_SRTP_ENABLE == "yes")
		{
			StartSnapshot();
		}
		else
		{
			if(qtime_start(streamUri, g_screenWidth, g_screenHeight) == false)
				return false;
		}
	}
}

function qtime_start(streamUri, width, height)
{
	var haveqt = false;
	if (navigator.plugins) {
		for (i=0; i < navigator.plugins.length; i++ ) {
			console.log(navigator.plugins[i].name);
			if (navigator.plugins[i].name.indexOf("QuickTime") >= 0) {
				haveqt = true;
			}
		}
	}

	var objStr = "<div id='objVideoScreen' style='width:" + width + "px; height:" + height + "px;'>";
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
	$("#screen").empty();
	$("#screen").append("<img>")
		.find("img:last").attr("id", "snapshotArea");
		
	$("#snapshotArea").attr({
		width: g_screenWidth,
		height: g_screenHeight
	});

	g_isPlaySnapshot = true;
	$("#snapshotArea").hide();
	reflashImage();
}

function reflashImage() 
{
	loadImage = function() {
		if(g_isPlaySnapshot === false) 
		{
			return;
		}

		$("#snapshotArea").attr("src", ImageBuf.src);
		$("#snapshotArea").show();
		if(g_isResize)
		{
			ResizePage();
			g_isResize = false;
		}
		
		setTimeout(function() {
			ImageBuf.src = g_snapshotURL + "?_=" + (new Date()).getTime();
		}, 200);
	}
	var ImageBuf = new Image();
	$(ImageBuf).load(loadImage);
	$(ImageBuf).error(function() {
		setTimeout(function() {
			ImageBuf.src = g_snapshotURL + "?_=" + (new Date()).getTime();
		}, 1000);
	});
	ImageBuf.src = g_snapshotURL;
}

function SetRotateSize()
{
	var rotateValue = VIDEOIN_CH0_ROTATE_DIRECTION;

	switch(rotateValue)
	{
		case "left":
		case "right":
			var result = ExchangeValues(g_screenWidth, g_screenHeight);
			g_screenWidth = result.value1;
			g_screenHeight = result.value2;
			break;
		case "none":
			break;
	}
}