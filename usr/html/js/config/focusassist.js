var playChk = 0;
var selectedStream = 0;
var snapshot_play = false;
var snapshot_url = "/uapi-cgi/snapshot.fcgi";
var width = 608;
var height = 342;
var flagView = true;

﻿$(function () {
	PreCustomize();
	
	// Language set
	var classNum = ["0501"];
	InitMsgLang(classNum);	
	var environmentReq = new CGIRequest();
	var environmentReqQString = "";
	var langDepth = setup + maincontents + "focusassist";
	environmentReq.SetAddress("/environment.xml");
	environmentReq.SetCallBackFunc(function(xml){
		var revLang = "/language/base/English.xml";
		if($('lang', xml).size() > 0)
		{
			revLang = $('lang', xml).text();
			getLangXml(revLang, langDepth);
			LoadParamJs("NETWORK&ENCODER&VIDEOIN&cache", Run);
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
	_debug("start");
	
	var changeWidthHeight = adjustRatioWidthHeight(VIDEOIN_CH0_CMOS_RATIO, height);
	width = changeWidthHeight[0];
	height = changeWidthHeight[1];	

	InitThemes();
	InitForm();	 
	EventBind();
	setTimeout(ContentShow, 500);	
	InitStartVideo();
	PostCustomize();

	_debug("stop");
}

function InitForm()
{
	$("#stream_tab").tabs({
		select: function(event, ui)
		{
			selectedStream = ui.index;
			InitForm_Each(selectedStream)
		}
	});
	InitForm_Each(selectedStream);

	$("button#btnView").button();
	$("button#btnPopup").button();
}

function InitForm_Each(idx)
{
	$this = $("#stream_tab > div").eq(idx);

	if(!$this.html())
	{
		$this.html($("#fa_source").html());
	}
	else
	{
		return false;
	}
	return $this;
}

function EventBind()
{
	$("#btnStart").button().click(function() {
		var Req = new CGIRequest();	
		Req.SetAddress("/uapi-cgi/focusassist.cgi?action=set&enable=yes");
		Req.SetStartFunc(ViewLoadingSave);
		Req.SetCallBackFunc(function(xml){
			ViewLoadingSave(false);
			return;
		});
		Req.Request();
	});
	
	$("#btnStop").button().click(function() {
		var Req = new CGIRequest();		
		Req.SetAddress("/uapi-cgi/focusassist.cgi?action=set&enable=no");
		Req.SetStartFunc(ViewLoadingSave);
		Req.SetCallBackFunc(function(xml){
			ViewLoadingSave(false);
			return;
		});
		Req.Request();
	});	
	
	$("#btnView").toggle(
		function(){
			flagView = false;
			preSize = parent.document.getElementById("contentFrame").height - (height + 15);
			playStatus = "STOP";
			if(browserCheck() == "msie")
			{
				if(playChk != 0)
					player_start(playStatus);

				$("#viewToggle").css("display", "none");
				ResizePage(preSize);
			}
			else
			{
				if(playChk != 0)
					qtime_start(playStatus);

				$("#viewToggle").css("display", "none");
				ResizePage(preSize);
			}
		},
		function(){
			flagView = true;
			playStatus = "PLAY";
			if(browserCheck() == "msie")
			{
				if(playChk != 1)
					player_start(playStatus);

				$("#viewToggle").css("display", "block");
				ResizePage();
				parent.$('html, body').animate({scrollTop:10000}, 0);
			}
			else
			{
				if(playChk != 1)
					qtime_start(playStatus);

				$("#viewToggle").css("display", "block");
				ResizePage();
				parent.$('html, body').animate({scrollTop:10000}, 0);
		   }
		}
	);

	$("#btnPopup").click(function()
	{
		if(flagView == true)
		{
			$("#btnView").click();
		}

		var pageWidth=670;
		var pageHeight = 460;
		if(width < height)
		{
			pageHeight = 730;
		}
		   
		var previewSrc = "/config/popup.html"
		var previewParam = "scrollbars=yes,toolbar=0,location=no,directories=0,status=0,menubar=0,resizable=1,width="+pageWidth+",height="+pageHeight;
		window.open(previewSrc, "Popup", previewParam);
	});	
}



////////////////////////////////////////////////////////////////////////////////
// Active X Functions
////////////////////////////////////////////////////////////////////////////////
function player_start(playStatus)
{
	if(playStatus == "STOP")
	{
		playChk = 0;
		AxUMF_stop();
	}
	else if(playStatus == "PLAY")
	{
		playChk = 1;
		AxUMF_play();
	}
}
function qtime_start(playStatus)
{
	//Enable($("button#btnView"));
	var objStr = "";
	var haveqt = false;

	if (navigator.plugins) {
		for (i=0; i < navigator.plugins.length; i++ ) {
			console.log(navigator.plugins[i].name);
			if (navigator.plugins[i].name.indexOf("QuickTime") >= 0) 
			{
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

	objStr += "<div id='objVideoScreen' style='width:" + width + "px; height:" + height + "px;'>"
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
function InitStartVideo()
{
	playChk = 1;
	playStatus = "PLAY";
	snapshot_play = false;

	SetRotateSize();

	if(browserCheck() == "msie")
	{
		AxUMF_create(width,
					height,
					StartSnapshot,
					function () {
						playChk = 1;	
						if(AxUMF !== undefined)
						{
							AxUMF.SetParam("CONTROL", "AUDIO", "OFF");
						}
					}, 
					null);
		ResizePage();
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
		ResizePage();
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
	$("#screen").append("<img>").find("img:last").attr("id", "snapshotArea");

	$("#snapshotArea").attr({
		width: width,
		height: height
	});

	snapshot_play = true;
	$("#snapshotArea").hide();
	reflashImage();
}

var flag = false;
function reflashImage()
{
	loadImage = function() {
		if(snapshot_play === false)
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
			ImageBuf.src = snapshot_url + "?_=" + (new Date()).getTime();
		}, 200);
	}
	
	var ImageBuf = new Image();
	$(ImageBuf).load(loadImage);
	$(ImageBuf).error(function() {
		setTimeout(function() {
			ImageBuf.src = snapshot_url + "?_=" + (new Date()).getTime();
		}, 1000);
	});
	
	ImageBuf.src = snapshot_url;
}
function SetRotateSize()
{
	var rotateValue = VIDEOIN_CH0_ROTATE_DIRECTION;

	switch(rotateValue)
	{
	case "left":
	case "right":
		var result = ExchangeValues(width, height);
		width = result.value1;
		height = result.value2;
		break;
	case "none":
		break;
	}
}
