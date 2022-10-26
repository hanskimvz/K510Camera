var resolution = "720x480";
var now_resolution = resolution;
var chk = 0;
var resChk = 0;
var statusInterval = 1;
var clock = null;
var uptimeClock = null;
var videoSizeFlag = 0;
var g_curTabPosition = 0;

var nVCAPreviewH = -1;
var nVCADataMgrH = -1;
var nRenderBlockH = -1;
var nAVDecoderBlockH = -1;
var snapshot_url = "/uapi-cgi/snapshot.fcgi";
var status_url = "/uapi-cgi/status.cgi?time";
var snapshot_play = false;
var statusRecording = 0;
var recordingCodec = "";
var recordingFPS = 0;
var recordingRes = "";
var recordingStream = 0;
var recordingGOP = 0;
var recordingProfile = "";
var pressBtn = -1;
var pauseState = 0;
var recordingEnable = 0;

var profileName = "ENCODER_CH0";
var playerStopping = false;
var useActiveX = "custom";
var g_vcaEnableFlag = false;
var rev_TimeUptime = 0;
var initSysTime = 0;
var initUptimeOutput = 0;
var httpPort = ( "" == window.location.port ) ? 80 : window.location.port;
var g_urlAxLang = "http://" + document.domain + ":" + httpPort + "/language/AxEnglish.xml";
var nVideoStartTimeout = 300;

var g_uartModeDBValue = "";
var g_isUartEnable = false;
var g_aspectRatioDBValue = "";
var g_cookieName_fishEyeViewType = "cookie_fisheyeViewType";
var g_isIeRplalens4x3 = false;
var g_is4x3 = false;
var g_isRotate = false;
var g_accessLevel = "admin";
var g_videoStreamEnableCheckBox = true;
var g_audioStreamEnableCheckBox = true;
var g_audioSpeakerVolumeSliderValue = 100;

$(function () {
	PreCustomize();
	initEnvironment();
	initBrand();
	LoadParamJs("DIDO&NETWORK&ENCODER&PTZ&VIDEOIN&UART.Ch1&SYSTEM.Status.Videoin.Ch0.standard&SYSTEM.Install.place", Run);

	$(window).unload(function() {
		page_unload();
	});
});

function initEnvironment()
{
	var classNum = ["020155", "020156", "020162", "020163", "020165", "020166", "0501"];
	InitMsgLang(classNum);

	var httpProtocol = window.location.protocol;
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

	var language = g_configData.langPath.split( /\/|\./ )[2];
	if("xml"==language)
		language = g_configData.langPath.split( /\/|\./ )[1];

	g_urlAxLang = httpProtocol + "//" + document.domain + ":" + httpPort + "/language/Ax" + language + ".xml";

	getLangXml(g_configData.langPath, live + menucontents, function(){
		$("span#txtRec").text(GetMsgLang("020162"));
	});
	$("button").button();
}

function initBrand()
{
	setGuestURL();
	TopMenuDisplay();

	if(navigator.userAgent.indexOf("Opera") != -1)
	{
		$("#topmenu #list a:eq(0)").click(function(){
			$("#screen").empty();
		});
		$("#topmenu #list a:eq(1)").click(function(){
			$("#screen").empty();
		});
	}

	$("ul#list li").click(function(){
		if($(this).children().attr("href"))
		{
			$("ul#list li").each(function(index, element){
				$(this).removeClass("ui-state-hover-top");
			});
			$(this).addClass("ui-state-hover-top");
		}
	});
	if(location.pathname.split("/")[1] === "viewer") {
		if(paramjs_url && param_url && snapshot_url && language_url) {
			paramjs_url = "/uapi-cgi/viewer/paramjs.fcgi";
			param_url = "/uapi-cgi/viewer/param.cgi";
			snapshot_url = "/uapi-cgi/viewer/snapshot.fcgi";
			status_url = "/uapi-cgi/viewer/status.cgi?time";
			language_url = "/uapi-cgi/viewer/language.cgi";
			ptz2_url = "/nvc-cgi/ptz/ptz2.fcgi";
		}

		g_accessLevel = "viewer";
	}

	InitDoContents(g_brand.doCount);

	if(g_brand.livectrl == "1")
	{
		$(".HomePositionContents").css("display", "block");
		$("a[href='#tab_2']").parent().css("display", "block");
		if(g_support.touringMenu == true)
			$(".TourContents").css("display", "block");
		if(g_brand.mfzType == "no"){
			$("#ptz_zoomfocus").css("display", "none");
			$("#ptz_panel").css("margin-right", "50px");
			$(".020142").css("margin-top", "100px");
		}
	}
	else
	{
		$("a[href='#tab_2']").parent().css("display", "none");
		$(".TourContents").css("display", "none");
		$(".HomePositionContents").css("display", "none");
	}

	if(g_brand.productID != "d001")
	{
		$(".audioContents").css("display", g_brand.audioInOut == "0/0" ? "none" : "inline-block");
	}

	if(g_brand.usb == 0 && g_brand.sd == 0)
		$(".storage_TopMenu").css("display", "none");

	if(g_brand.rs485 == 1 || g_brand.rs232c == 1 || g_brand.rs422 == 1)
		g_isUartEnable = true;

	if("rs51c0b" == g_brand.imgDevice ||
		"mdc200s" == g_brand.imgDevice ||
		"mdc600s" == g_brand.imgDevice)
	{
		$(".bitrateContents").css("display","none");
	}
}

function Run()
{
	receiveUptime();
	InitPtz();
	$("#frame").show();

	ContentShow();
	call_xmlData(param_url + "?action=list&group=VCA.Ch0.enable&xmlschema", false, function(xml){
		if($('Ch0 > enable', xml).size() > 0)
			g_vcaEnableFlag = $('Ch0 > enable', xml).text().toLowerCase() == 'yes';
	});
	Load();
}

function getUriParams() 
{
	var url = decodeURIComponent(location.href);
	url = decodeURIComponent(url);

	var idx = url.indexOf("?")
	if(idx == -1)
		return new Array();

	var params = url.substring( idx+1, url.length );
	params = params.split("&");

	var param = new Array();
	for(var i in params) {
		var argList = params[i].split("=")
		param[argList[0]] = argList[1];
	}

	return param;
}

function Load()
{
	profileName = "ENCODER_CH0";
	statusInterval = 1;

	startRevInterval();
	InitInterface();
	InitSetting();
	InitToolbars();
	InitStream();
	EventBind();

	var forceSnapshot = false;
	var param = getUriParams();
	if(param["transmission"] == "snapshot") 
	{
		forceSnapshot = true
	}
	g_aspectRatioDBValue = VIDEOIN_CH0_CMOS_RATIO.toLowerCase();
	g_isIeRplalens4x3 = (browserCheck() == "msie" && 
							g_support.unwarping && 
							isLimitFPS14(g_aspectRatioDBValue, g_brand.productID));
	g_is4x3 = (VIDEOIN_CH0_CMOS_RATIO == "4:3");
	g_isRotate = (VIDEOIN_CH0_ROTATE_DIRECTION != "none");

	jqDisplayCtrl(".wiperContents", g_support.wiper == true);

	if( forceSnapshot || /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) || (browserCheck() != "msie" && NETWORK_SRTP_ENABLE == "yes"))
	{
		StartSnapshot();
	}
	else
	{
		StartVideo();
	}
	$(".ui-tabs .ui-tabs-panel").css("padding", "0em 0.4em");

	$("#panel_tabs .dewarpingTab").css("display", g_isIeRplalens4x3 ? "block" : "none");
	PostCustomize();
	rtspStreamAudioVideoEnable();
}

function receiveUptime()
{
	var statusReq = new CGIRequest();
	var statusReqQString = "xmlschema";

	statusReq.SetAddress(status_url);
	statusReq.SetCallBackFunc(function(xml){
		if($("time > uptime", xml).size() > 0)
		{
			rev_TimeUptime = Number($("time > uptime", xml).text());
			initUptimeOutput = rev_TimeUptime;
		}
	});
	statusReq.Request(statusReqQString);
}

function curSysTimeOutput()
{
	var curUptimeOutput = 0;

	curUptimeOutput = Number(initUptimeOutput) + Number(1);
	initUptimeOutput = curUptimeOutput;

	var tUptime = Math.floor(curUptimeOutput/(60*60));
	var mUptime = Math.floor((curUptimeOutput/(60))%60);
	var sUptime = Math.floor((curUptimeOutput)%60);

	tUptime = (tUptime>=10) ? tUptime : ("0"+tUptime);
	mUptime = (mUptime>=10) ? mUptime : ("0"+mUptime);
	sUptime = (sUptime>=10) ? sUptime : ("0"+sUptime);
	curUptimeOutput = tUptime + ":" + mUptime + ":" + sUptime;

	$("#status_TimeUptime").text(curUptimeOutput);

}

function receiveStatus()
{
	if(g_curTabPosition == 1)
	{
		var resourceReq = new CGIRequest();

		resourceReq.SetAddress("../status/resource-state.xml");
		resourceReq.SetCallBackFunc(function(xml){
			var rev_CpuIdle = 0;
			var rev_CpuUsage = 0;
			var rev_MemUsed = 0;
			var rev_MemFree = 0;
			var rev_MemCached = 0;
			var rev_MemUsage = 0;
			var rev_TempCelsius = 0;
			var rev_TempFahrenheit = 0;
			var CpuPart = $("resource[name='cpu']", xml);
			var MemoryPart = $("resource[name='memory']", xml);
			var TempPart = $("resource[name='temperature']", xml);

			rev_CpuIdle = $("item[name='idle']", CpuPart).text();
			rev_MemUsed = Number($("item[name='used']", MemoryPart).text());
			rev_MemFree = Number($("item[name='free']", MemoryPart).text());
			rev_MemCached = Number($("item[name='cached']", MemoryPart).text());
			rev_TempCelsius = $("item[name='celsius']", TempPart).text();
			rev_TempFahrenheit = $("item[name='fahrenheit']", TempPart).text();

			if(rev_CpuIdle == "")
			{
				rev_CpuUsage = "- ";
				$("#status_CpuUsed").text(rev_CpuUsage);
			}
			else
			{
				rev_CpuUsage = 100 - rev_CpuIdle;
				rev_CpuUsage = parseInt(rev_CpuUsage * 100) / 100;
				$("#status_CpuUsed").text(Math.round(rev_CpuUsage));
			}
			if(rev_MemUsed == 0 || rev_MemUsed == "")
			{
				$("#status_MemUsed").text("- ");
			}
			else
			{
				rev_MemUsage = (rev_MemUsed * 100) / (rev_MemUsed + rev_MemFree + rev_MemCached);
				$("#status_MemUsed").text(Math.round(rev_MemUsage));
			}

			delete rev_CpuIdle;
			delete rev_CpuUsage;
			delete rev_MemUsed;
			delete rev_MemFree;
			delete rev_MemCached;
			delete rev_MemUsage;
			delete rev_TempCelsius;
			delete rev_TempFahrenheit;
			delete CpuPart;
			delete MemoryPart;
			delete TempPart;

			var encoderReq = new CGIRequest();
			encoderReq.SetAddress("../status/encode.xml");
			encoderReq.SetCallBackFunc(function(xml){
				var streamForm = ['Fstream', 'Sstream', 'Snapshot']
				var streamPart = Array();
				var rev_streamType = Array();
				var rev_streamResolution = Array();
				var rev_streamFps = Array();
				var rev_streamBitrate = Array();
				var max_channel = 3;

				for (var i =0; i < max_channel; i++) {
					streamPart[i] = $("stream[name='" + i + "']", xml);
					rev_streamType[i] = $("type", streamPart[i]).text();
					rev_streamResolution[i] = $("resolution", streamPart[i]).text();
					rev_streamFps[i] = $("fps", streamPart[i]).text();
					rev_streamBitrate[i] = $("bitrate", streamPart[i]).text();

					if(IsEmpty(rev_streamType[i])&&IsEmpty(rev_streamResolution[i])&&IsEmpty(rev_streamFps[i]))
					{
						$(".stream"+ i +"StatusContents").css("display", "none");
					}
					else
					{
						$(".stream"+ i +"StatusContents").css("display", "block");
						rev_streamBitrate[i] = (IsEmpty(rev_streamBitrate[i])) ?	'-' : Math.round(rev_streamBitrate[i]/1024)+"kbps";
						if (IsEmpty(rev_streamType[i])) rev_streamType[i] = '-';
						if (IsEmpty(rev_streamResolution[i])) rev_streamResolution[i] = '-';
						if (IsEmpty(rev_streamFps[i])) rev_streamFps[i] = '-';
					}
				}

				for (i = 0; i < max_channel; i++) {
					$("#status_" + streamForm[i] + 'Type').text(rev_streamType[i]);
					$("#status_" + streamForm[i] + 'Resolution').text(rev_streamResolution[i].toUpperCase());
					$("#status_" + streamForm[i] + 'Fps').text(rev_streamFps[i]);
					$("#status_" + streamForm[i] + 'Bitrate').text(rev_streamBitrate[i]);
				}

				delete streamForm;
				delete streamPart;
				delete rev_streamType;
				delete rev_streamResolution;
				delete rev_streamFps;
				delete rev_streamBitrate;
				delete max_channel;

				return;
			});
			encoderReq.Request();
			delete encoderReq;
			return;
		});
		resourceReq.Request();
		delete resourceReq;

		var connectionReq = new CGIRequest();
		connectionReq.SetAddress("../status/rtsp_connection_client.xml");
		connectionReq.SetCallBackFunc(function(xml){
		   $("select#formConnectList").empty();
			var index = 0;
			var rtspConnection = $("rtsp_connection_client", xml);
			$("client",rtspConnection).each(function(){
				index = index + 1;
				$("select#formConnectList").append("<option>" + " " + $(this).attr("ip") + " : " + $(this).attr("port") + "</option>");
			});
			$("#status_ConnectNum").text(index);
			return;
		});
		connectionReq.Request();
		delete connectionReq;
	}
	if(statusRecording == 1)
	{
		LoadParamJs("ENCODER&SYSTEM.Status.Videoin.Ch0.standard&VIDEOIN",0);

		if(recordingCodec != GetCodec(recordingStream))
		{
			StopRecording();
		}
		else
		{
			if(recordingRes != GetResolution(recordingCodec, recordingStream) || 
				recordingFPS != GetFPS(recordingCodec, recordingStream) || 
				recordingGOP != GetGOP(recordingCodec, recordingStream) || 
				recordingProfile != GetProfile(recordingCodec, recordingStream))
			{
				StopRecording();
			}
		}
	}
}

function httpGet(theUrl)
{
	var xmlHttp = null;

	xmlHttp = new XMLHttpRequest();
	xmlHttp.open( "GET", theUrl, false );
	xmlHttp.send( null );
	return xmlHttp.responseText;
}

function CreateUMFBlocks()
{
	if(AxUMF !== undefined)
	{
		AxUMF.SetParam("CONTROL", "LANGUAGE", g_urlAxLang);

		AxUMF.SetParam("CONTROL", "CHANGENVVIEW", "1");

		nVCADataMgrH = AxUMF.SetParam("CONTROL", "CREATE_UMFBLOCK", "VCADataManagerBlock, VCADataManagerBlock.dll");
		nAVDecoderBlockH = AxUMF.SetParam("CONTROL", "CREATE_UMFBLOCK", "AVDecoderBlock, AVDecoderBlock.dll");
		nVCAPreviewH = AxUMF.SetParam("CONTROL", "CREATE_UMFBLOCK", "VCADialogBlock, VCADialogBlock.dll");
		nRenderBlockH = AxUMF.SetParam("CONTROL", "CREATE_UMFBLOCK", "RenderBlock, RenderBlock.dll");

		AxUMF.SetParam("CONTROL", "POSITION_UMFBLOCK", nVCAPreviewH + ", 0, 0, 1, 1");

		AxUMF.SetParam("CONTROL", "CONNECT_UMFBLOCKS", nVCAPreviewH + ", " + nRenderBlockH + ", RENDER");
		AxUMF.SetParam("CONTROL", "CONNECT_UMFBLOCKS", nAVDecoderBlockH + ", " + nVCAPreviewH + ", RENDER");
		AxUMF.SetParam("CONTROL", "CONNECT_UMFBLOCKS", nVCAPreviewH + ", " + nVCADataMgrH + ", DATAMANAGER");

		AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nVCAPreviewH + ", UI=VCA_UI_MODE_VIEW");
		$("#audioSpeaker").change();
		$("#audioMicrophone").change();

		if(g_vcaEnableFlag)
		{
			var actionReq = new CGIRequest();
			actionReq.SetAddress(param_url);
			actionReq.SetCallBackFunc(function(xml)
			{
				AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nVCADataMgrH + ", DATA=" + xml.xml);
			});
			actionReq.Request("action=list&group=VCA&xmlschema");

			var actionReqPT = new CGIRequest();
			actionReqPT.SetAddress(param_url);
			actionReqPT.SetCallBackFunc(function(xml)
			{
				AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nVCADataMgrH + ", UPDATE_DATA=" + xml.xml);
			});
			actionReqPT.Request("action=list&group=SYSTEM.Properties.Hardware.pantilt&xmlschema");
		}

		if(!g_vcaEnableFlag)
		{
			MouseRButtonOff();
		}
		AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_GET_DATA=RECORDING_SIZE"); // Rec/Snap setting check
	}
}

function VCA_PTZ_MODE_ON()
{
	if(AxUMF !== undefined)
	{
		nRet = AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nVCAPreviewH + ", PTZIP=" + document.domain);
		nRet = AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nVCAPreviewH + ", PTZPORT=" + httpPort);
		nRet = AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nVCAPreviewH + ", UI=VCA_UI_MODE_PTZ");
		nRet = AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nVCAPreviewH + ", DEVICE_ID=" + g_brand.productID);
	}
}

function VCA_VIEW_MODE_ON()
{
	if(AxUMF !== undefined)
	{
		nRet = AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nVCAPreviewH + ", UI=VCA_UI_MODE_VIEW");
	}
}

function setOrientationStatus(data)
{
	if(AxUMF !== undefined)
	{
		nRet = AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nVCAPreviewH + ", VIDEO_TRANSFORM=" + ((data != "none") ? 1 : 0));
	}
}

function setHttpsStatus()
{
	if(AxUMF !== undefined)
	{
		nRet = AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nVCAPreviewH + ", PTZ_HTTP_STATUS=" + (window.location.protocol == "https:") ? "HTTPS" : "HTTP");
	}
}

function activeXEvent(szType, szValue)
{
	if(szType == "VCA_RELOAD_PROFILE")
	{
		var actionReq = new CGIRequest();
		actionReq.SetAddress(param_url);
		actionReq.SetCallBackFunc(function(xml){
		if(g_vcaEnableFlag)
		{
			AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nVCADataMgrH + ", UPDATE_DATA=" + xml.xml);
		}
		});
		actionReq.Request("action=list&group=VCA.Ch0.curprofile&xmlschema");
	}
	if(szType == "VCA_AT_TRACK")
	{
		var jsonArr = $.parseJSON(szValue);

		if(jsonArr.length > 0)
			setServerData(jsonArr);
	}
	else if(szType == "VCA_AV_AVRECORD_STOP")
	{
		$("span#txtRec").text(GetMsgLang("020162"));
		if(pauseState == 0)
			DisableRecord(false);
		statusRecording = 0;
	}
	else if(szType == "VCA_AV_AVRECORD_START")
	{
		var tmp = szValue.split('(');
		switch(tmp[1])
		{
			case "1)":
				DisableRecord(false);
				$("span#txtRec").text(GetMsgLang("020163"));
				break;
			case "-1)":
			case "-2)":
			case "-4)": //Error - Record Fail
				break;
			case "-3)": //Error - Create Directory
				break;
			case "-5)":
			case "-6)": // Error - Open File
				break;
			default:
				break;
		}
	}
	else if(szType == "AUTH_ELEVATE")
	{
		if(szValue == "NEED_ELEVATION")
		{
			window.opener = 'self';
			window.open('','_parent','');
			window.close();
		}
		else
		{
			if(pressBtn == 0) //Record
			{
				recordingRes = GetResolution(recordingCodec, recordingStream);
				recordingFPS = GetFPS(recordingCodec, recordingStream);
				recordingGOP = GetGOP(recordingCodec, recordingStream);
				recordingProfile = GetProfile(recordingCodec, recordingStream);
				AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_CAPTURE_BITSPERSAMPLE=16");
				AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_CAPTURE_SAMPLESPERSEC=" + ENCODER_CH0_AUDIOIN_CH0_ADC_FREQUENCY);
				AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_SET_DATA=RECORDING_FPS," + recordingFPS);
				AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_SET_DATA=RECORDING_CAPTION,0");
				AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_SET_DATA=RECORDING_AVSYNC,0");
//				if(VIDEOIN_CH0_ROTATE_DIRECTION == "none")
//					AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_ROTATION_MODE=0");
//				else
//					AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_ROTATION_MODE=1");

				AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_AVRECORD_START");

				DisableRecord(true);
				$("span#txtRec").text(GetMsgLang("020163"));
				statusRecording = 1;
				pressBtn = -1;
			}
			else if(pressBtn == 1) //Snapshot
			{
				AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_CAPTURE_SNAPSHOT");
				pressBtn = -1;
			}
			else if(pressBtn == 2) //Setting
			{	
				var win = window.open("config/recsnapconfig.html",'pop','width=500,height=362');
				win.focus();
				function chkClose()
				{
					win.close();
				}
				pressBtn = -1;
				if(document.all)
					window.attachEvent("onunload",chkClose);
				else
					window.addEventListener("unload",chkClose,false);
			}
			else
			{
				pressBtn = -1;
			}
		}
	}
	else if(szType == "RECORDING_SIZE")
	{
		if(szValue == "")
		{
			AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_GET_DATA=RECORDING_TIME");
		}
	}
	else if(szType == "RECORDING_TIME")
	{
		if(szValue == "")
		{
			AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_SET_DATA=RECORDING_SIZE,"+10*1024*1024);
			AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_SET_DATA=RECORDING_TIME,0sec");
		}
	}
	else if(szType == "FISH_EYE_CAM_MODE")
	{
		$(".viewTypeContents").css("display", szValue == "1" ? "block" : "none");
/*
		if(szValue == "1" && g_accessLevel != "viewer")
			$(".intallPlaceContents").css("display", "block")
		else
			$(".intallPlaceContents").css("display", "none")
//*/

		setTimeout(setDewarpingMode, 100);
	}
	else if(szType == "VCA_AV_AUDIO_GET_VOLUME")
	{
		g_audioSpeakerVolumeSliderValue = szValue;
	}

}

function setDewarpingMode()
{
	AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_FISH_EYE_CAM=CAMERA_POS," + SYSTEM_INSTALL_PLACE.toUpperCase());
	setCookieViewType();

	var viewTyeValue = $("input[name='viewType']:checked:radio").val();
	axSetParam_fishEyeViewType(viewTyeValue.toUpperCase());
}

//JL: This function is an adapted copy of a cap.js function 
function setServerData(jsonArray) {
	if (('object' !== typeof (jsonArray)) ||
			('number' !== typeof (jsonArray.length))) {
		return false;
	}
	var jsonIndex = 0;
	for (jsonIndex = 0; jsonIndex < jsonArray.length; jsonIndex++) {
		if (('string' !== typeof (jsonArray[jsonIndex].action)) ||
				('string' !== typeof (jsonArray[jsonIndex].group)) ||
				('number' !== typeof (jsonArray[jsonIndex].entries.length)) ||
				((jsonArray[jsonIndex].action !== 'add' &&
					jsonArray[jsonIndex].action !== 'remove' &&
					jsonArray[jsonIndex].action !== 'update'))) {
			return false;
		}
		var requestString	 = 'action=' + jsonArray[jsonIndex].action;
		requestString	+= '&group=' + jsonArray[jsonIndex].group;
		var entryIndex = 0;
		for (entryIndex = 0; entryIndex < jsonArray[jsonIndex].entries.length; entryIndex++) {
			if (('string' !== typeof (jsonArray[jsonIndex].entries[entryIndex].id)) ||
					('string' !== typeof (jsonArray[jsonIndex].entries[entryIndex].value))) {
				return false;
			}
			requestString	+= '&' + jsonArray[jsonIndex].entries[entryIndex].id;
			requestString += '=' + encodeURIComponent(jsonArray[jsonIndex].entries[entryIndex].value);
		}
		if(jsonIndex < jsonArray.length-1)
		{
			requestString += '&nocmd';
		}

		var req = new CGIRequest();
		req.SetAddress("/uapi-cgi/param.cgi");
		req.Request(requestString);
	}
}

function GetVideoSize(str, flag)
{
	var size;
	var res;

	if (flag == "now") res = now_resolution;
	else res = resolution;

	var arr = res.split("x");

	if (str.toUpperCase() == "WIDTH")
	{
		size = arr[0];
	}
	else if (str.toUpperCase() == "HEIGHT")
	{
		size = arr[1];
	}
	else
	{
		return 0;
	}

	if (!Number(size))
	{
		return 0;
	}

	return Number(size);
}

function pushImage() {
	loadImage = function() {
		if(snapshot_play === false) {
			return;
		}
		$("#snapshotArea").attr("src", ImageBuf.src);
		$("#snapshotArea").show();
		var tobj = new Date();
		ImageBuf.src = snapshot_url + "?_=" + tobj.getTime();
		delete tobj;
	}
	var ImageBuf = new Image();
	$(ImageBuf).load(loadImage);
	$(ImageBuf).error(function() {
		delete ImageBuf;
		setTimeout(pushImage, 1000);
	});
	ImageBuf.src = snapshot_url;
}

function reflashImage() {
	loadImage = function() {
		if(snapshot_play === false) {
			return;
		}
		$("#snapshotArea").attr("src", ImageBuf.src);
		$("#snapshotArea").show();
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

function StartSnapshot()
{
	$("#screen").empty();
	$("#screen").append("<img>")
		.find("img:last").attr("id", "snapshotArea");
	snapshot_play = true;
	$("#snapshotArea").hide();
	reflashImage();

	$("#transmission").val("snapshot");
	SetScreenSize($("select#screen_size").val());

	if($("#transmission").val() == "snapshot")
	{
		$("button#screen_full").hide();
		$(".recordContents").css("display", "none");
	}
	else
	{
		if(browserCheck() == "msie") {
			$("button#screen_full").show();
		}
	}
}

function StartVideo()
{
	var trans = "UNICAST";
	var streamNum = 0;
	snapshot_play = false;

	InitRecordButton();

	if ($("select#transmission").val())
	{
		var arr = $("select#transmission").val().split("-");

		if(arr[0] == "multicast")
		{
			trans = "MULTICAST";
		}

		if (arr[1] == "2nd" || arr[1] == "Depth image")
		{
			streamNum = 1;
		}
	}

	var codec = eval(profileName + "_VIDEOCODEC_ST" + streamNum + "_STANDARD").toUpperCase();
	resolution = eval(profileName + "_VIDEOCODEC_ST" + streamNum + "_" + codec + "_RESOLUTION").toLowerCase();
	var streamUri = "rtsp://" + document.domain + ":" + NETWORK_RTSP_PORT +"/";
	streamUri += eval("NETWORK_RTP_ST" + streamNum + "_" + trans + "_NAME");
	var videoStandard = SYSTEM_STATUS_VIDEOIN_CH0_STANDARD.toLowerCase();
	resolution = translateResolution(videoStandard, resolution);

	$("#screen").empty();

	var width = GetVideoSize("width");
	var height = GetVideoSize("height");

	var resSize = {};
	resSize = SetRotateSize(width, height);
	width = resSize.width;
	height = resSize.height;

	if(height == 1080)
	{
		$("select#screen_size option[value=1.5]").remove();
	}
	else
	{
		$("select#screen_size option[value=1.5]").remove();
		$("select#screen_size").append("<option value='1.5'>150%</option>");
	}

	if($("select#transmission").val() == "snapshot")
	{
		StartSnapshot();
		return;
	}
	rtspSessionName = "";
	if (browserCheck() == "msie")
	{
		$(".recordContents").css("display", "block");

		if(useActiveX == "vlc")
		{
			if (vlc_start(streamUri, width, height) == false)
			{
				return false;
			}
		}
		else if(useActiveX == "custom")
		{
			var trans = "UNICAST";
			var streamNum = 0;

			if ($("select#transmission").val())
			{
				var arr = $("select#transmission").val().split("-");
				if(arr[0] == "multicast")
				{
					trans = "MULTICAST";
				}
				if (arr[1] == "2nd" || arr[1] == "Depth image")
				{
					streamNum = 1;
				}
			}
			if(trans == 'MULTICAST')
			{
				selectSession = "multicast";
			}
			else if(trans == 'UNICAST')
			{
				if($("select#transmission").val() == null)
				{
					StartSnapshot();
					return;
				}
				else
				{
					var arr = $("select#transmission").val().split("-");
					selectSession = arr[2];
				}
			}

			var rtstVideoEnable = g_videoStreamEnableCheckBox ? "1" : "0";
			var rtstAideoEnable = g_audioStreamEnableCheckBox ? "1" : "0";
			rtspSessionName = eval("NETWORK_RTP_ST" + streamNum + "_" + trans + "_NAME")
				+ "/streaming_track=video=" + rtstVideoEnable
				+ "&audio=" + rtstAideoEnable;

			AxUMF_create(width,
						height,
						VideoControlError,
						function ()
						{
							CreateUMFBlocks();
							AudioChecked();
						}, 
						activeXEvent,
						rtspSessionName,
						selectSession);

			if(g_brand.cameraClass == "encoder")
			{
				if(AxPTZ == undefined)
					axPTZObject();
			}
		}


	}
	else
	{
		switch($.browser.name)
		{
			case "chrome":
			case "safari":
			case "firefox":
			case "opera":
			default:
				if(qtime_start(streamUri, width, height) == false)
				{
					return false;
				}
			break;
		}
	}
	SetScreenSize($("select#screen_size").val()); 
	return true;
}

function page_unload()
{
	if (browserCheck() == "msie" && useActiveX == "vlc")
	{
		var vlc = document.getElementById("VideoScreen");
		vlc_stop(vlc);
	}
	return;
}

function ChangeVideo()
{
	if($("#transmission").val() == "snapshot")
	{
		$("button#screen_full").hide();
	}
	else
	{
		if(browserCheck() == "msie") {
			$("button#screen_full").show();
		}
	}

	LoadParamJs("ENCODER&SYSTEM.Status.Videoin.Ch0.standard&VIDEOIN",0);

	if (browserCheck() == "msie") {
		var player = document.getElementById("VideoScreen");

		if (useActiveX == "vlc") {
		// vlc activex
			switch (player.input.state) {
				case 0: // IDLE/CLOSE
				case 5: // STOPPING
					StartVideo();
					break;
				case 3: // PLAYING
					player.playlist.stop();
				case 1: // OPENING
				case 2: // BUFFERING
				case 4: // PAUSED
				case 6: // ENDED
				case 7: // ERROR
				default:
					setTimeout(StartVideo, nVideoStartTimeout);
					break;
			}
		}
		else if (useActiveX == "custom")
		{
			AxUMF_stop();
			setTimeout(StartVideo, nVideoStartTimeout);
		}
	}
	else
	{
		switch($.browser.name)
		{
			case "chrome":
			case "safari":
			case "firefox":
			case "opera":
			default:
				setTimeout(StartVideo, nVideoStartTimeout);
				break;
		}
	}

	AudioSet();
	//AudioChecked();

	return true;
}

function vlc_stop(player)
{
	player.playlist.stop();

	var now = new Date();
	var maxTime = now.getTime() + 900;
	while (1)
	{
		now = new Date();

		if (player.input.state == 5)
		{
			break;
		}

		if(now.getTime() > maxTime)
		{
			alert(GetMsgLang("020155"));
			break;
		}
	}

	return;
}

function AudioOn()
{
	if(AxUMF !== undefined)
	{
		AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_AUDIO=ENABLE");
	}
}

function AudioOff()
{
	if(AxUMF !== undefined)
	{
		AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_AUDIO=DISABLE");
	}
}

function MikeOn()
{
	if(AxUMF !== undefined)
	{
		AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_CAPTURE_CHANNELS=1");
		AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_CAPTURE_BITSPERSAMPLE=16");
		AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_CAPTURE_SAMPLESPERSEC=" + ENCODER_CH0_AUDIOIN_CH0_ADC_FREQUENCY);
		AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_CAPTURE_DEVICE_ADDRESS=" + document.domain);
		AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_CAPTURE_DEVICE_PORT=" + ENCODER_CH0_AUDIOOUT_CH0_TCP_PORT);
		AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_CAPTURE=ENABLE");
	}
}

function MikeOff()
{
	if(AxUMF !== undefined)
	{
		AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_CAPTURE=DISABLE");
	}
}

function FrameinfoOn()
{
	if(AxUMF !== undefined)
	{
		AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nVCAPreviewH + ", UI=VCA_UI_TIMESHOW_ON");
	}
}

function FrameinfoOff()
{
	if(AxUMF !== undefined)
	{
		AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nVCAPreviewH + ", UI=VCA_UI_TIMESHOW_OFF");
	}
}

function MouseRButtonOn()
{
	if(AxUMF !== undefined)
	{
		AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nVCAPreviewH + ", UI=VCA_UI_MODE_CONTEXT_SHOW");
	}
}

function MouseRButtonOff()
{
	if(AxUMF !== undefined)
	{
		AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nVCAPreviewH + ", UI=VCA_UI_MODE_CONTEXT_HIDE");

	}
}

function vlc_start(streamUri, width, height)
{
	try {
		var objStr = "";
		objStr += "<object width=" + width + " height=" + height;
		objStr += " classid='clsid:9BE31822-FDAD-461B-AD51-BE1D1C159921'";
		objStr += " id='VideoScreen'>";
		objStr += "<param name='ShowDisplay' value='true' />";
		objStr += "<param name='AutoPlay' value='false' />";
		objStr += "</object>";

		$("#screen").html(objStr);

		var Options = "";
		Options += " :rtsp-caching=300";

		var vlc = document.getElementById("VideoScreen");
		vlc.playlist.clear();
		vlc.playlist.add(streamUri, streamUri, Options);
		vlc.playlist.play();
	} catch(e) {
		objStr = "<div style='width:400px;border:2px solid red;padding:10px;margin:auto'>";
		objStr += "Your VLC plugin has not been detected !</br></br>please go to ";
		objStr += "<a href='http://www.videolan.org' target='_blank'>http://www.videolan.org</a>";
		objStr += " to download your plugin.";
		objStr += "</div>";

		$("#screen").html(objStr);
		return false;
	}
}

function vlc_reconnect(streamUri)
{
	var vlc = document.getElementById("VideoScreen");
	var state = vlc.input.state;
	var time = new Date();

	if((state == 6) || (state == 7))	// ended & error
	{
		vlc.playlist.stop();
		vlc.playlist.clear();
		vlc.playlist.add(streamUri);
		vlc.playlist.play();
	}

	setTimeout(vlc_reconnect, 1000);

	return;
}

function VideoControlError()
{
	$("#transmission").empty();
	if(eval(profileName + "_SNAPSHOT_ENABLE") == "yes")
	{
		$("#transmission").append("<option>")
			.find("option:last").attr({"value":"snapshot", "class":"snapshot"}).append("Snapshot");
	}

	setTimeout(StartSnapshot, 1000);
}

function qtime_start(streamUri, width, height)
{
	var objStr = "";
	var haveqt = false;

	if (navigator.plugins) {
		navigator.plugins.refresh(false);
		for (i=0; i < navigator.plugins.length; i++ ) {
			console.log(navigator.plugins[i].name);
			if (navigator.plugins[i].name.indexOf("QuickTime") >= 0) {
				haveqt = true;
			}
		}
	}

	objStr += "<object width=" + width + " height=" + height;
	objStr += " CODEBASE='http://www.apple.com/qtactivex/qtplugin.cab' ONERROR='VideoControlError();'>";
	//objStr += "<param name='src' value='/images/qtposter.mov'>";
	objStr += "<param name='qtsrc' value='" + streamUri + "'>";
	objStr += "<param name='autoplay' value='true'>";
	objStr += "<param name='controller' value='false'>";
	objStr += "<param name='type' value='video/quicktime'>";
	objStr += "<param name='scale' value='tofit'>";
	objStr += "<param name='target' value='myself'>";
	objStr += "<embed id='VideoScreen'";
	objStr += " width='" + width + "' height='" + height + "'";
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
//			objStr += "<p>fail to loading...</p>";
	objStr += "</object>";

	$("#screen").html(objStr);

	if(haveqt == false)
	{
		VideoControlError();
		return;
	}
}

function FrameResize(flag)
{
	var width = GetVideoSize("width", "now");
	var height = GetVideoSize("height", "now");

	var minwidth = $("#topmenu").width() + $("img#logo").width() + 30;
	if (width < minwidth) width = minwidth;

	var resSize = {};
	resSize = SetRotateSize(width, height);
	width = resSize.width;
	height = resSize.height;

	$("#frame").css("width", function() {
		var item = "block";
		var leftMenuWidth = 0;

		if (flag == false)
		{
			item = "none";
		}

		if ($("#left").css("display") == item)
		{
			leftMenuWidth = $("#left").width() + 10;
		}
		else
		{
			if (flag == false) return;
		}

		if (width < 720)
			width = 720;

		var reSize = leftMenuWidth + width + 30;
		$("div#top").css("width", reSize);

		return reSize;
	});
}

function isCorrectRateCheck(width, height, is4x3)
{
	var wRatio = 16;
	var hRatio = 9;

	if(is4x3)
	{
		wRatio = 4;
		hRatio = 3;
	}

	return (width/wRatio == height/hRatio) ? true : false;
}

function SetScreenSize(rate)
{
	var statusHeight = 16;
	var topheight = $("#top").height(); // top 영역 높이
	var topSpace = 43; // top 영역과 스크린 사이의 높이
	var topheightSize = topheight + topSpace;
	var width;
	var height;
	var GetHeight = GetVideoSize("height");
	var GetWidth = GetVideoSize("width");

	if(nVCAPreviewH >= 0)
	{
		AxUMF.SetParam("CONTROL", "POSITION_UMFBLOCK", nVCAPreviewH + ", 0, 0, 1, 1");
	}

	$("#main").hide();
	$("#VideoScreen").hide();
	if($("#transmission").val() == "snapshot")
	{
		var resSnapshot = ENCODER_CH0_SNAPSHOT_RESOLUTION;
		var snapStream = $("#transmission option[value='snapshot']").attr("class");
		var videoStandard = SYSTEM_STATUS_VIDEOIN_CH0_STANDARD.toLowerCase();

		if(snapStream == "first")
		{
			resSnapshot = ENCODER_CH0_VIDEOCODEC_ST0_MJPEG_RESOLUTION;
		}
		else if(snapStream == "second")
		{
			resSnapshot = ENCODER_CH0_VIDEOCODEC_ST1_MJPEG_RESOLUTION;
		}

		resSnapshot = translateResolution(videoStandard, resSnapshot.toLowerCase());
		resSnapshot = resSnapshot.split("x");
		GetHeight = resSnapshot[1];
		GetWidth = resSnapshot[0];
	}

	var isCorrectRate = isCorrectRateCheck(GetWidth, GetHeight, g_is4x3);
	var resSize = {};
	resSize = SetRotateSize(GetHeight, GetWidth);
	GetHeight = resSize.width;
	GetWidth = resSize.height;

	if (rate == 0) // fit
	{
		var leftSize = 0;
		var clientX = (document.documentElement&&document.documentElement.clientWidth)
						|| document.body.clientWidth || window.innerWidth || self.innerWidth;
		var clientY = (document.documentElement&&document.documentElement.clientHeight)
						|| document.body.clientHeight || window.innerHeight || self.innerHeight;

		//$("#frame").show();
		$("#main").show();
		if ($("#left").css("display") == "block")
		{
			leftSize = $("#left").width();
		} else {
			topheightSize += 28;
		}

		width = clientX - leftSize - 50;
		height = GetHeight * (width/GetWidth) - 10;
//		width -= 2;

		// 스크롤이 생기지 않도록 작은 사이즈의 길이를 기준으로 fit
		if(clientY < (height+topheightSize))
		{
			var tmpHeight = height;
			height = clientY - topheightSize;
			if ($(".footer").size() > 0) {
				height -= ($(".footer").height() + 4);
			}
			width = (height * width) / tmpHeight;
		}
		// 처음 페이지 로딩시 fit 사이즈 보다 해상도가 작으면 100%로 출력
		if(videoSizeFlag ==0)
		{
			if(width > GetWidth || height > GetHeight)
			{
				width = GetWidth;
				height = GetHeight;
				//$("#screen").css("width", "320px");
				$("#screen").css("width", width);
				$("#screen").css("height", height);
				$("#screen_size").val(1);
			}
			videoSizeFlag = 1;
		}
	}
	else
	{
		width = GetWidth * rate;
		height = GetHeight * rate;
		//$("#frame").show();
		$("#main").show();
	}
	if(width < 0	|| height < 0) return;

	if(g_is4x3)
	{
		if(isCorrectRate)
		{
			if(g_isRotate)
				height = (width * 4) / 3;
			else
				width = (height * 4) / 3;
		}
	}
	else
	{
		if(g_isRotate)
			height = (width * 16) / 9;
		else
			width = (height * 16) / 9;
	}

	if($("#transmission").val() == "snapshot")
	{
		$("#screen").css({
			"margin" : "auto",
			"width": width,
			"height": height + statusHeight
		});

		if ($("#screen").size() > 0)
		{
			$("#screen").css("width", width).children("object").css("width", width);
			$("#screen").css("height", height).children("object").css("height", height);
			$("img#snapshotArea").attr("width", width);
			$("img#snapshotArea").attr("height", height);
			now_resolution = width + "x" + height;
		}
	}
	else
	{
		$("#screen").css({
			"margin" : "auto",
			"width": width,
			"height": height + statusHeight
		});

		if ($("#screen").size() > 0)
		{
			$("#screen").css("width", width).children("object").css("width", width);
			$("#screen").css("height", height).children("object").css("height", height);
			$("#VideoScreen").attr("width", width);
			$("#VideoScreen").attr("height", height);

			now_resolution = width + "x" + height;
		}

		$("#VideoScreen").show();
	}
	FrameResize();
}

function InitForm_Each(idx)
{
	$this = $("#panel_tabs > div").eq(idx);
	if(!$this.html())
	{
			$this.html($("#panel_source_" + idx).html());
	}
	else
	{
			return false;
	}
	return $this;
}

function leftToggle()
{

	$("#toggle_panel_out").toggle();
	$("#left").toggle();
	SetScreenSize($("#screen_size").val());

/*
	$("#left").animate({width: "toggle"}, 10, function() {
		$("#toggle_panel_out").toggle();
		SetScreenSize($("#screen_size").val());
	});
*/
}
function startRevInterval()
{
	clearInterval(clock);
	curSysTimeOutput();
	receiveStatus();

	if(clock != null)
	{
		clearInterval(clock);
		clock = null;
	}
	clock = setInterval(function(){
		receiveStatus();
		curSysTimeOutput();
	},statusInterval*1000);
}

// Audio 활성 여부 체크
function AudioSet()
{
	var stSelect = $("#transmission").val();
	var chkFlagAudioIn = 'y';
	var chkFlagAudioOut = 'y';

	switch(stSelect)
	{
		case 'unicast-1st-tcp':
		case 'unicast-1st-udp':
			if(NETWORK_RTP_ST0_UNICAST_INCLUDEAUDIO == "yes" && ENCODER_CH0_AUDIOIN_CH0_ENABLE == "yes")
			{
				chkFlagAudioIn = 'y';
			}
			else
			{
				chkFlagAudioIn = 'n';
			}

			if(ENCODER_CH0_AUDIOOUT_CH0_ENABLE == "yes")
			{
				chkFlagAudioOut = 'y';
			}
			else
			{
				chkFlagAudioOut = 'n';
			}
			break;

		case 'unicast-2nd-tcp':
		case 'unicast-2nd-udp':
			if(NETWORK_RTP_ST1_UNICAST_INCLUDEAUDIO == "yes" && ENCODER_CH0_AUDIOIN_CH0_ENABLE == "yes")
			{
				chkFlagAudioIn = 'y';
			}
			else
			{
				chkFlagAudioIn = 'n';
			}

			if(ENCODER_CH0_AUDIOOUT_CH0_ENABLE == "yes")
			{
				chkFlagAudioOut = 'y';
			}
			else
			{
				chkFlagAudioOut = 'n';
			}
			break;

		case 'multicast-1st':
			if(NETWORK_RTP_ST0_MULTICAST_INCLUDEAUDIO == "yes" && ENCODER_CH0_AUDIOIN_CH0_ENABLE == "yes")
			{
				chkFlagAudioIn = 'y';
			}
			else
			{
				chkFlagAudioIn = 'n';
			}

			if(ENCODER_CH0_AUDIOOUT_CH0_ENABLE == "yes")
			{
				chkFlagAudioOut = 'y';
			}
			else
			{
				chkFlagAudioOut = 'n';
			}
			break;

		case 'multicast-2nd':
			if(NETWORK_RTP_ST1_MULTICAST_INCLUDEAUDIO == "yes" && ENCODER_CH0_AUDIOIN_CH0_ENABLE == "yes")
			{
				chkFlagAudioIn = 'y';
			}
			else
			{
				chkFlagAudioIn = 'n';
			}

			if(ENCODER_CH0_AUDIOOUT_CH0_ENABLE == "yes")
			{
				chkFlagAudioOut = 'y';
			}
			else
			{
				chkFlagAudioOut = 'n';
			}
			break;

		case 'snapshot':
			chkFlagAudioIn = 'n';
			chkFlagAudioOut = 'n';
			break;
	}

	$("#videoStreamEnableCheckBox").attr("checked", g_videoStreamEnableCheckBox);

	if(chkFlagAudioIn == 'n')
	{
		$("#audioSpeaker").attr("checked", "");
		$("#audioSpeaker").attr("disabled", "disabled");
		$("#audioSpeakerVolumeSlider").slider("disable");

		$("#audioStreamEnableCheckBox").attr("checked", "");
		$("#audioStreamEnableCheckBox").attr("disabled", "disabled");
	}
	else
	{
		$("#audioSpeaker").attr("disabled", "");
		$("#audioSpeakerVolumeSlider" ).slider({
			value: g_audioSpeakerVolumeSliderValue,
			min: 0,
			max: 100,
			change: function( event, ui )
			{
				var volumeValue = $("#audioSpeakerVolumeSlider").slider("option", "value");
				AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_AUDIO_SET_VOLUME=" + volumeValue);
				$(this).slider("disable");
				setTimeout(volumeWait, 1000);
			}
		});

		$("#audioStreamEnableCheckBox").attr("checked", g_audioStreamEnableCheckBox);
		$("#audioStreamEnableCheckBox").attr("disabled", "");
	}
	if(chkFlagAudioOut == 'n')
	{
		$("#audioMicrophone").attr("checked", "");
		$("#audioMicrophone").attr("disabled", "disabled");
	}
	else
	{
		$("#audioMicrophone").attr("disabled", "");
	}
}

function AudioChecked()
{
	$("#audioSpeaker").unbind().change(function(){
		if($(this).attr("checked") == true)
		{
			AudioOn();
			$("#audioSpeakerVolumeSlider" ).slider("enable");
		}
		else
		{
			AudioOff();
			$("#audioSpeakerVolumeSlider" ).slider("disable");
		}
	});
	$("#audioMicrophone").unbind().change(function(){
		if($(this).attr("checked") == true)
		{
			MikeOn();
		}
		else
		{
			MikeOff();
		}
	});
	$("#audioSpeaker").change();
	$("#audioMicrophone").change();
}

function rtspStreamAudioVideoEnable()
{
	if(browserCheck() == "msie")
	{
		$("#videoStreamEnableCheckBox").unbind().change(function()
		{
			if($(this).attr("checked") == true)
			{
				if(g_videoStreamEnableCheckBox == false)
				{
					g_videoStreamEnableCheckBox = true;
					AxUMF_stop();
					setTimeout(StartVideo, 500);
				}
			}
			else
			{
				if(g_videoStreamEnableCheckBox == true)
				{
					g_videoStreamEnableCheckBox = false;
					AxUMF_stop();
					setTimeout(StartVideo, 500);
				}
			}
			$("#audioStreamEnableCheckBox").attr("disabled", $(this).attr("checked")? "":"disabled");
		});

		$("#audioStreamEnableCheckBox").unbind().change(function()
		{
			if($(this).attr("checked") == true)
			{
				if(g_audioStreamEnableCheckBox == false)
				{
					g_audioStreamEnableCheckBox = true;
					AxUMF_stop();
					setTimeout(StartVideo, 500);
				}
			}
			else
			{
				if(g_audioStreamEnableCheckBox == true)
				{
					g_audioStreamEnableCheckBox = false;
					AxUMF_stop();
					setTimeout(StartVideo, 500);
				}
			}
			$("#videoStreamEnableCheckBox").attr("disabled", $(this).attr("checked")? "":"disabled");
		});
		$("#videoStreamEnableCheckBox").attr("disabled", $("#audioStreamEnableCheckBox").attr("checked")? "":"disabled");
	}
	else
	{
		$("#videoStreamEnableCheckBox").attr("disabled", "disabled");
		$("#audioStreamEnableCheckBox").attr("disabled", "disabled");
	}
}

function InitInterface()
{
	var toggleCnt = 0;
	// Frame Size
	FrameResize();

	// Corner
	//$(".round-top").corner("top 10px");
	$(".round-bottom").corner("bottom 10px");
	$(".round").corner("10px");

	var defaultPanelHeight = 400;
	// link line
	$("ul.css-tabs a").focus(function() { this.blur(); });

	var mirrorValue = VIDEOIN_CH0_IMAGE_MIRROR;
	var addHeight_tab2 = 200;

	$("button.toggle_panel").click(function(){
		if(toggleCnt == 0)
		{
			// paenl open
			leftToggle();
			toggleCnt = 1;
			if(g_curTabPosition == 0)
			{
				VCA_VIEW_MODE_ON();
			}
			else if(g_curTabPosition == 1)
			{
				VCA_VIEW_MODE_ON();
			}
			else if(g_curTabPosition == 2)
			{
				VCA_PTZ_MODE_ON();
				MouseRButtonOn();
				setOrientationStatus(mirrorValue);
				setHttpsStatus();
			}
			else if(g_curTabPosition == 3)
			{
				axSetParam_fishEyeModeOn();
				axSetParam_fishEyeFeatureEnable(true);
			}
		}
		else
		{
			// paenl close
			axSetParam_fishEyeFeatureEnable(false);
			leftToggle();
			VCA_VIEW_MODE_ON();

			if(!g_vcaEnableFlag)
			{
				MouseRButtonOff();
			}

			if(g_curTabPosition == 0)
			{
				$("#panel").height(defaultPanelHeight);
			}
			else if(g_curTabPosition == 1)
			{
				$("#panel").height(defaultPanelHeight + 205);
				
			}
			else if(g_curTabPosition == 2)
			{
				$("#panel").height(defaultPanelHeight + addHeight_tab2);
			}
			toggleCnt = 0;
		}
	});

	$(".css-tabs").tabs(".css-panes > div");

	$("#panel_tabs").tabs({
		select: function(event, ui)
		{
			nSelectedStream = ui.index;
			InitForm_Each(nSelectedStream);
			axSetParam_fishEyeFeatureEnable(false);

			if(nSelectedStream == 0)
			{
				$("#panel").height(defaultPanelHeight);
				g_curTabPosition = 0;

				if(browserCheck() == "msie") {
					if($("#transmission").val() != 'snapshot')
					//FrameinfoOff();
					VCA_VIEW_MODE_ON()
					if(!g_vcaEnableFlag)
					{
						MouseRButtonOff();
					}
				}
			}
			else if(nSelectedStream == 1)
			{
				axSetParam_fishEyeFeatureEnable(false);
				g_curTabPosition = 1;
				startRevInterval();
				$("#panel").height(defaultPanelHeight + 205);

				if(browserCheck() == "msie") {
					if($("#transmission").val() != 'snapshot')
					{
						VCA_VIEW_MODE_ON()
					}
					if(!g_vcaEnableFlag)
					{
						MouseRButtonOff();
					}
				}
			}
			else if(nSelectedStream == 2)
			{
				axSetParam_fishEyeFeatureEnable(false);

				if(g_brand.cameraClass == "encoder")
				{
					if(AxPTZ == undefined)
					{
						var hostName = window.location.hostname;

						if(isIPV6() == true)
							hostName = ipv6DomainConvert(hostName);

						var initPtzURL = window.location.protocol + "//" + hostName + ":" + httpPort;
						var initPtzLeft = 200;
						var initPtzTop = 200;

						if(axPTZSetup(initPtzURL, initPtzLeft, initPtzTop) < 0)
						{
							uconlog("[Weblog] ActiveX is not ready. AxPTZ: " + AxPTZ);
						}

						$(".ptzCtrlContents").css("display", "block");
					}
				}
				
				if(g_isUartEnable == true && g_uartModeDBValue == "ptz")
				{
					$("#loading_ptz").css("display", "none");
					$("#panel_ptz").css("display", "block");
					$.get("/nvc-cgi/ptz/ptz2.fcgi?query=presetlist&_=" + (new Date()).getTime());
				}
				else
				{
					setOrientationStatus(mirrorValue);
					setHttpsStatus();
					$.ajax({
					url:		"/nvc-cgi/ptz/ptz2.fcgi?query=presetlist&_=" + (new Date()).getTime(),
						success:	function(data, textStatus, jqXHR){
									var presetValue = "";
									var presetCount = "";
									var presetList = "";

									$("#setPresetList").empty();

									if(data.substring(0,2) != "#4")
									{
										presetCount = data.split("\n")[1].split("=")[1];
										presetList = data.split("\n")[2].split("=")[1];

										if(presetList != "")
										{
											presetValue = presetList.split(",");
										}

										if(presetValue != "")
										{
											// Preset Number List 출력
											for(var i=0; i<presetCount; i++)
											{
												$("#setPresetList").append("<option value='" + presetValue[i] + "'>" + presetValue[i] + "</option>");
											}
										}
										else
										{
											$("#setPresetList").append("<option value='none'>none</option>");
										}
									}
									else
									{
										$("#setPresetList").append("<option value='none'>none</option>");
									}

									$("#loading_ptz").css("display", "none");
									$("#panel_ptz").css("display", "block");

									clearInterval(clock);
									//FrameinfoOff();
									VCA_PTZ_MODE_ON();
									MouseRButtonOn();
								},
						error:		function(jqXHR, textStatus, errorThrown){
									$("#loading_ptz").css("display", "block");
									$("#panel_ptz").css("display", "none");
									alert("Loading error! Please try again!");
								}
					});
				}

				$("#panel").height(defaultPanelHeight + addHeight_tab2);
				g_curTabPosition = 2;
			}
			else if(nSelectedStream == 3)
			{
				g_curTabPosition = 3;
				axSetParam_fishEyeModeOn();
				axSetParam_fishEyeFeatureEnable(true);
				$("#panel").height(defaultPanelHeight);
			}
		}
	});
}

function axSetParam_fishEyeModeOn()
{
	if(AxUMF == undefined)
	{
		uconlog("[Weblog] ActiveX is not ready. AxUMF: " + AxUMF);
		return false;
	}

	AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nVCAPreviewH + ", UI=VCA_UI_MODE_FISH_EYE_CAM");

	if(g_support.unwarping)
	{
		var lensName = "A8TRT";
		if(g_brand.lens == "cbc_l1028krw")
			lensName = "B5SST";

		AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_FISH_EYE_CAM=FISH_EYE_LENS_NAME," + lensName);
	}
}
function axSetParam_fishEyeFeatureEnable(isUseFlag)
{
	if(AxUMF == undefined)
	{
		uconlog("[Weblog] ActiveX is not ready. AxUMF: " + AxUMF);
		return false;
	}

	AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_FISH_EYE_CAM=FISH_EYE_CAM_MODE," + (isUseFlag ? "1" : "0"));
}

function setCookieViewType()
{
	var viewTypeValue = getCookie(g_cookieName_fishEyeViewType);
	defaultPositionEnable(viewTypeValue);

	if(viewTypeValue == undefined)
	{
		$("input[name='viewType']:radio[value='ptz']").attr("checked", true);
	}
	else
	{
		$("input[name='viewType']:radio[value='" + viewTypeValue + "']").attr("checked", true);
	}
}

function defaultPositionEnable(curType)
{
	$(".defaultPositionContents").css("display", curType == "peri" ? "none" : "block");
}

// type: PTZ, QUAD, PERI
function axSetParam_fishEyeViewType(type)
{
	if(AxUMF == undefined)
	{
		uconlog("[Weblog] ActiveX is not ready. AxUMF: " + AxUMF);
		return false;
	}

	AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_FISH_EYE_CAM=VIEW_TYPE," + type);
}

function changeInterval()
{
	$("#tab_1 #status_RefreshInterval").change(function(){
		statusInterval = $(this).val();
		startRevInterval();
	});
}

// Preset
function actionPreset(opString)
{
	var actionReq = new CGIRequest();
	var reqQString = "";

	reqQString += opString;
	actionReq.SetAddress("/nvc-cgi/ptz/ptz2.fcgi");
	actionReq.SetCallBackFunc(function(xml){
		LoadParamJs("PTZ", function() {
			InitSetting();
			GetPresetList();
			ViewLoadingSave(false);
			btnDisableStatus();
		});

		return;
	});
	actionReq.Request(reqQString);
}

// Movement
function actionMove(opString)
{
	var actionReq = new CGIRequest();
	var reqQString = "";

	reqQString += opString;
	//actionReq.SetAddress("/uapi-cgi/uptz.fcgi");
	actionReq.SetAddress("/nvc-cgi/ptz/ptz2.fcgi");
	actionReq.SetCallBackFunc(function(xml){
		resChk = 0;
		ViewLoadingSave(false);
		btnDisableStatus();
		return;
	});
	actionReq.Request(reqQString);
}

function actionStop(opStr)
{
	if(chk == 1)
	{
		var t=0;
		t = setInterval(function(){
			if(resChk == 0)
			{
				actionMove(opStr);
				clearInterval(t);
			}
		}, 10);
		chk = 0;
	}
}

function InitSetting()
{
	var i=0;
	var idx;
	var name;

	$("#schedule select option").remove();
	for(i=0; i<16; i++)
	{
		var numbering = "";
		var presetEnable = "";

		// preset number
		idx = parseInt(decodeURIComponent(eval("PTZ_CH0_PRESET_P" + i + "_NUMBER"))) + 1;
		name = eval("PTZ_CH0_PRESET_P" + i + "_NAME");

		if(idx <= 9)
		{
			//numbering += "0" + idx + ".";
			numbering += "Preset 0" + idx;
		}
		else
		{
			//numbering += idx + ".";
			numbering += "Preset " + idx;
		}
	}

	$("input[name='positionType'][value='" + SYSTEM_INSTALL_PLACE + "']:radio").attr("checked", "checked");
}

function InitPtz()
{
	g_uartModeDBValue = UART_CH1_MODE;
	if($("a[href='#tab_2']").parent().css("display") == "none")
	{
		if(g_isUartEnable == true && g_uartModeDBValue == "ptz")
		{
			$("a[href='#tab_2']").parent().css("display", "block");

			$("#setPresetList").css("display", "none");
			$("#setPresetText").css("display", "inline");
			
			//preset numper - text
			$("#setPresetText").val(1);
			$("#setPresetText").blur(function(){
				var inputValPtz = $("#setPresetText").val();
				if(inputValPtz < 1 || inputValPtz > 255 || inputValPtz == "")
				{
					$("#setPresetText").val(1).focus();
					alert(GetMsgLang("020156"));
				}
			});
		}
	}

	var ptzImageName = 0;

	// ptz panel UI
	$("#ptz_panel dd").each(function(index, element) {
		ptzImageName = "images/"+$(this).attr("id")+".gif";
		$(this).css("background", "url('" + ptzImageName + "')	no-repeat center #FFFFFF");
	});

	var rtlFlag = false;

	if (g_configData.langPath == "/language/Arabic.xml") rtlFlag = true;

	// ptz speedbar
	$("#ptz_speedbar #slider_speedbar").each(function(index, element) {
		var $obj = $(this).parent().parent().find("input[type='text']");
		$(this).slider({
			isRTL: rtlFlag,
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
			alert(GetMsgLang("020156") + " (1 ... 100)");
		}
	});
	// speed Text box, Slider-bar 동기화
	$("#text_speedbar:text").keyup(function() {
			$("#slider_speedbar").slider("value", $("#text_speedbar:text").val());
	});
	$("#preset_number").val(1);

	var maxPreset = 255;
	if(g_brand.pantilt == "ir speed ptz")
	{
		maxPreset = 250;
		$("label[for='preset_number']").text("(1 ... " + maxPreset + ")");
	}

	$("#preset_number:text").blur(function(){
		var inputValPtz = $("#preset_number:text").val();
		if(inputValPtz < 1 || inputValPtz > maxPreset || inputValPtz == "")
		{
			$("#preset_number:text").val(1).focus();
			alert(GetMsgLang("020156"));
		}
	});
	if (g_configData.langPath == "/language/Arabic.xml")
	{
		$(".slider-bar").slider({isRTL: true});
	}
}

function AuthElevateRequest()
{
	AxUMF.SetParam("CONTROL", "AUTH_ELEVATE", getCurAddress() + ","+httpPort);
}

function InitToolbars()
{
	$("select#screen_size").change(function() {
		SetScreenSize($(this).val());
	});

	if ( browserCheck() == "msie" )
	{
		$("button#screen_full").button().click(function() {
			if(AxUMF !== undefined)
			{
				AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nVCAPreviewH + ", UI=VCA_UI_FULLSCREEN");
			}
		});

		$("button#snapshot").button().click(function() {
			//Snapshot Process
			if(AxUMF !== undefined)
			{
				if(pressBtn == -1)
				{
					pressBtn = 1;
				}
				AuthElevateRequest();
			 }
		});

		$("button#recording").button().click(
		function(){
			if(statusRecording == 0)
			{
				SetRecordingStream();
				recordingCodec = GetCodec(recordingStream);
				if(recordingCodec == "H264")
				{
					if(pressBtn == -1)
					{
						pressBtn = 0;
					}
					AuthElevateRequest();
				}
			}
			else
			{
				StopRecording();
			}
		});

		$("button#pause").button().toggle(
		function(){
			pauseState = 1;
			var res = AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nVCAPreviewH + ", UI=VCA_UI_MODE_PAUSE");
			$("span#txtPause").text(GetMsgLang("020166"));
			$("span#txtPause").attr("class" , "020166");
			if(statusRecording == 1)
			{
				StopRecording();
			}
			DisableRecord(true);
		},
		function(){
			pauseState = 0;
			var res = AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nVCAPreviewH + ", UI=VCA_UI_MODE_RESUME");
			$("span#txtPause").text(GetMsgLang("020165"));
			$("span#txtPause").attr("class" , "020165");
			DisableRecord(false);
		});

		$("button#controlSetting").button().click(
		function(){
			if(pressBtn == -1)
			{
				pressBtn = 2;
			}
			AuthElevateRequest();
		});
	}
	else
	{
		$("button#screen_full").hide();
		$(".recordContents").css("display", "none");
		$(".audioContents").css("display", "none");
	}

	if(g_configData.skin != "noline-silver")
	{
		$("#snapshot").css("width","75px");
		$("#recording").css("width","75px");
		$("#pause").css("width","75px");
		$("#controlSetting").css("width","75px");
		$("#panel").height(400);
		
		if(g_configData.skin == "ui-darkness" || g_configData.skin == "sunny" || g_configData.skin == "trontastic")
			$("#connectSector").css("height","133px");
	}

	// DrawShow
//			SetScreenSize(1);
}

function padZero(param)
{
	return "00".concat(param).match(/\d{2}$/);
}

function SetRecordingStream()
{
	recordingStream = 0;

	if ($("select#transmission").val())
	{
		var arr = $("select#transmission").val().split("-");

		if (arr[1] == "2nd" || arr[1] == "Depth image")
			recordingStream = 1;
	}
}

function StopRecording()
{
	AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_AVRECORD_STOP");
}

function GetCodec(stream)
{
	return eval(profileName + "_VIDEOCODEC_ST" + stream + "_STANDARD").toUpperCase();
}
function GetFPS(codec, stream)
{
	return eval(profileName + "_VIDEOCODEC_ST" + stream + "_" + codec + "_MAXFPS");
}
function GetResolution(codec, stream)
{
	return eval(profileName + "_VIDEOCODEC_ST" + stream + "_" + codec + "_RESOLUTION");
}
function GetGOP(codec, stream)
{
	return eval(profileName + "_VIDEOCODEC_ST" + stream + "_" + codec + "_PCOUNT");
}
function GetProfile(codec, stream)
{
	return eval(profileName + "_VIDEOCODEC_ST" + stream + "_" + codec + "_PROFILE");
}

function convertIRDepthImage(unitStr)
{
	if(unitStr == "1st")
		return "IR image";
	else if(unitStr == "2nd")
		return "Depth image";

	return unitStr;
}

function InitStream()
{
	var unit;

	if(!fafu_IsExit("NETWORK_RTP_NBROFSTREAM"))
	{
		return false;
	}

	for(var stream = 0; stream < NETWORK_RTP_NBROFSTREAM; stream++)
	{
		switch (stream)
		{
			case 0:
				unit = (stream+1) + "st";
				break;
			case 1:
				unit = (stream+1) + "nd";
				break;
			case 2:
				unit = (stream+1) + "rd";
				break;
			default:
				unit = (stream+1) + "th"
				break;
		}

		if("rs51c0b" == g_brand.imgDevice ||
		"mdc200s" == g_brand.imgDevice ||
		"mdc600s" == g_brand.imgDevice)
			unit = convertIRDepthImage(unit);

		if (eval(profileName + "_VIDEOCODEC_ST" + stream + "_ENABLE").toLowerCase() == "no")
		{
			continue;
		}

		if(!fafu_IsExit("NETWORK_RTP_ST"+stream+"_UNICAST_ENABLE"))
		{
			continue;
		}

		if(eval("NETWORK_RTP_ST"+stream+"_UNICAST_ENABLE") == "yes")
		{
			if(browserCheck() == "msie") 
			{
				var strUDP = "Unicast - " + unit + " (UDP)";
				var strTCP = "Unicast - " + unit + " (TCP)";

				$("#transmission").append("<option>")
					.find("option:last").attr("value", "unicast-" + unit + "-tcp").append(strTCP);
				if(isIPV6() == false)
				{
					$("#transmission").append("<option>")
					.find("option:last").attr("value", "unicast-" + unit + "-udp").append(strUDP);	
				}
			}
			else
			{
				var str = "Unicast - " + unit;
				$("#transmission").append("<option>")
					.find("option:last").attr("value", "unicast-"+ unit + "-tcp").append(str);
			}
		}

		if(!fafu_IsExit("NETWORK_RTP_ST"+stream+"_MULTICAST_ENABLE"))
		{
			continue;
		}

		if(eval("NETWORK_RTP_ST"+stream+"_MULTICAST_ENABLE") == "yes")
		{
			var str = "Multicast - " + unit;

			$("#transmission").append("<option>")
				.find("option:last").attr("value", "multicast-"+ unit).append(str);
		}
	}
	if(eval(profileName + "_SNAPSHOT_ENABLE") == "yes")
	{
		$("#transmission").append("<option>")
			.find("option:last").attr({"value":"snapshot", "class":"snapshot"}).append("Snapshot");
	}
	AudioSet();
}

function btnDisableStatus()
{

	if(DIDO_DO_CH0_TRIG == "on")
	{
		$("input[name='formMainTrigger']:radio").attr("disabled", "");
		$("input[name='formMainTrigger'][value='on']:radio").attr("checked", "checked");
	}
	else
	{
		$("input[name='formMainTrigger']:radio").attr("disabled", "");
		$("input[name='formMainTrigger'][value='off']:radio").attr("checked", "checked");
	}
}

function EventBind()
{
	var opStrPtzStop = "cpantiltzoommove=0,0,0";
	var opStrFocusStop = "cfocusmove=0";
	var selectChannelNum = 0;

	btnDisableStatus();

	selectChannelNum = $("#doChannel").val();

	$("#btnWiperStart").click(function(){
		$.get("/nvc-cgi/ptz/ptz2.fcgi?startwiper=0&_=" + (new Date()).getTime());
	});

	$("#btnWiperStop").click(function(){
		$.get("/nvc-cgi/ptz/ptz2.fcgi?stopwiper&_=" + (new Date()).getTime());
	});

	$("#doChannel").change(function () {
		var trigValue = "on";
		selectChannelNum = $(this).val();

		LoadParamJs("DIDO", function () {
			trigValue = eval("DIDO_DO_CH" + selectChannelNum + "_TRIG");
			$("input[name='formMainTrigger'][value='" + trigValue + "']:radio").attr("checked", "checked");
		});
	});

	$("input[name='formMainTrigger']").unbind().change(function () {
		var trigReq = new CGIRequest();
		var trigValue = "on";
		var reqQString = "";

		trigValue = $("input[name='formMainTrigger']:checked:radio").val();
		reqQString = "action=update&group=DIDO.Do.Ch" + selectChannelNum + "&trig=" + trigValue;

		trigReq.SetCallBackFunc(function (xml) {
			$("input[name='formMainTrigger'][value='"+trigValue+"']:radio").attr("checked", "checked");
			return;
		});
		trigReq.SetAddress("/uapi-cgi/param.cgi");
		trigReq.Request(reqQString);	 
	});

	// ptz
	// stop
	$("#pt_cm").mousedown(function(){
		chk = 1;
		actionStop(opStrPtzStop);
	});
	// Left up
	$("#pt_lu").mousedown(function(){
		var opStr = "cpantiltzoommove=" + "-" + $("#text_speedbar").val() + "," + $("#text_speedbar").val() + ",0";
		if(resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		resChk = 1;
	}).mouseup(function(){
		actionStop(opStrPtzStop);
	}).mouseout(function(){
		actionStop(opStrPtzStop);
	});
	// Center up
	$("#pt_cu").mousedown(function(){
		var opStr = "cpantiltzoommove=" + "0," + $("#text_speedbar").val() + ",0";
		if(resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		resChk = 1;
	}).mouseup(function(){
		actionStop(opStrPtzStop);
	}).mouseout(function(){
		actionStop(opStrPtzStop);
	});
	// Right up
	$("#pt_ru").mousedown(function(){
		var opStr = "cpantiltzoommove=" + $("#text_speedbar").val() + "," + $("#text_speedbar").val() + ",0";
		if(resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		resChk = 1;
	}).mouseup(function(){
		actionStop(opStrPtzStop);
	}).mouseout(function(){
		actionStop(opStrPtzStop);
	});
	// Left middle
	$("#pt_lm").mousedown(function(){
		var opStr = "cpantiltzoommove=" + "-" + $("#text_speedbar").val() + ",0,0";
		if(resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		resChk = 1;
	}).mouseup(function(){
		actionStop(opStrPtzStop);
	}).mouseout(function(){
		actionStop(opStrPtzStop);
	});
	// Center middle - Stop
	$("#pt_cm").mousedown(function(){
		actionStop(opStrPtzStop);
	});
	// Right middle
	$("#pt_rm").mousedown(function(){
		var opStr = "cpantiltzoommove=" + $("#text_speedbar").val() + ",0,0";
		if(resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		resChk = 1;
	}).mouseup(function(){
		actionStop(opStrPtzStop);
	}).mouseout(function(){
		actionStop(opStrPtzStop);
	});
	// Left down
	$("#pt_ld").mousedown(function(){
		var opStr = "cpantiltzoommove=" + "-" + $("#text_speedbar").val() + "," + "-" + $("#text_speedbar").val() + ",0";
		if(resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		resChk = 1;
	}).mouseup(function(){
		actionStop(opStrPtzStop);
	}).mouseout(function(){
		actionStop(opStrPtzStop);
	});
	// Center down
	$("#pt_cd").mousedown(function(){
		var opStr = "cpantiltzoommove=" + "0," + "-" + $("#text_speedbar").val() + ",0";
		if(resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		resChk = 1;
	}).mouseup(function(){
		actionStop(opStrPtzStop);
	}).mouseout(function(){
		actionStop(opStrPtzStop);
	});
	// Right down
	$("#pt_rd").mousedown(function(){
		var opStr = "cpantiltzoommove=" + $("#text_speedbar").val() + "," + "-" + $("#text_speedbar").val() + ",0";
		if(resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		resChk = 1;
	}).mouseup(function(){
		actionStop(opStrPtzStop);
	}).mouseout(function(){

		actionStop(opStrPtzStop);
	});

	// Zoom
	$("#_zIn").mousedown(function(){
		var opStr = "cpantiltzoommove=0,0," + $("#text_speedbar").val();
		if(resChk == 1)
			return;
		actionMove(opStr);

		chk = 1;
		resChk = 1;
	}).mouseup(function(){
		actionStop(opStrPtzStop);
	}).mouseout(function(){
		actionStop(opStrPtzStop);
	});
	$("#_zOut").mousedown(function(){
		var opStr = "cpantiltzoommove=0,0," + "-" + $("#text_speedbar").val();
		if(resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		resChk = 1;
	}).mouseup(function(){
		actionStop(opStrPtzStop);
	}).mouseout(function(){
		actionStop(opStrPtzStop);
	});

	// Focus
	$("#_fNear").mousedown(function(){
		var opStr = "cfocusmove=" + $("#text_speedbar").val();
		if(resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		resChk = 1;
	}).mouseup(function(){
		actionStop(opStrFocusStop);
	}).mouseout(function(){
		actionStop(opStrFocusStop);
	});
	$("#_fFar").mousedown(function(){
		var opStr = "cfocusmove=" + "-" + $("#text_speedbar").val();
		if(resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		resChk = 1;
	}).mouseup(function(){
		actionStop(opStrFocusStop);
	}).mouseout(function(){
		actionStop(opStrFocusStop);
	});
	// Set
	$("#btnSet").button().click(function() {
		var presetNum = $("#preset_number").val();
		var opStr = "&storedevicepreset=" + presetNum;

		Disable($("button"));
		actionPreset(opStr);
	});
	// Go
	$("#btnGo").button().click(function() {
		var presetNum;
		if(g_isUartEnable == true && g_uartModeDBValue == "ptz")
		{
			presetNum = $("#setPresetText").val();
		}
		else
		{
			presetNum = $("#setPresetList").val();
		}
		var opStr = "&gotodevicepreset=" + presetNum;
		Disable($("button"));
		actionMove(opStr);
	});
	// Clear
	$("#btnClear").button().click(function() {
		var presetNum = $("#preset_number").val();
		var opStr = "&removedevicepreset=" + presetNum;

		Disable($("button"));
		actionPreset(opStr);
	});
	$("#btnTourStart").button().click(function(){
		var setNumber = $("#bottomTourListContents").val();

		$.get("/nvc-cgi/ptz/ptz2.fcgi?calltour=" + setNumber + "&_=" + (new Date()).getTime(), function() {
		});
	});
	$("#btnTourStop").button().click(function(){
		var setNumber = $("#bottomTourListContents").val();

		$.get("/nvc-cgi/ptz/ptz2.fcgi?canceltour=" + setNumber + "&_=" + (new Date()).getTime(), function() {
		});
	});

	$("#btnHomeSet").button().click(function(){
		$.get("/nvc-cgi/ptz/ptz2.fcgi?aux=save_home" + "&_=" + (new Date()).getTime(), function() {
		});
	});

	$("#btnHomeGo").button().click(function(){

		$.get("/nvc-cgi/ptz/ptz2.fcgi?aux=home" + "&_=" + (new Date()).getTime(), function() {
		});
	});

	$("#positionTypeSave").click(function() {
		var req = new CGIRequest();
		var installPlaceValue = $("input[name='positionType']:checked:radio").val();
		var qstr = makeQString();
		qstr
			.set_action('update')
			.set_schema('xml')
			.add_list("SYSTEM.Install.place", SYSTEM_INSTALL_PLACE, installPlaceValue);

		var reqQuery = qstr.get_qstring();
		if(!reqQuery) return;

		AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_FISH_EYE_CAM=CAMERA_POS," + installPlaceValue.toUpperCase());

		req.SetCallBackFunc(function(xml){
			var ret = CGIResponseCheck(0, xml);
			if(ret != 0) {
				var errormessage = "";
				if(ret != -2)
					errormessage = "\n" + ret;

				alert(GetMsgLang("0501") + errormessage);
			}

			LoadParamJs("SYSTEM.Install.place", function() {
				InitSetting();
			});
		});
		req.SetAddress("/uapi-cgi/param.cgi");
		req.Request(reqQuery);
	});

	$("input[name='viewType']").unbind().change(function () {
		var viewTyeValue = $("input[name='viewType']:checked:radio").val();
		axSetParam_fishEyeViewType(viewTyeValue.toUpperCase());
		setCookie(g_cookieName_fishEyeViewType, viewTyeValue, 365);
		defaultPositionEnable(viewTyeValue);
	});

	$("#defaultPosition").click(function(){
		var viewTyeValue = $("input[name='viewType']:checked:radio").val();
		axSetParam_fishEyeViewType(viewTyeValue.toUpperCase());
		setCookie(g_cookieName_fishEyeViewType, viewTyeValue, 365);
	});

	$("#ptzCtrlShow").click(function(){
		if(axPTZShow() < 0)
		{
			uconlog("[Weblog] ActiveX is not ready. AxPTZ: " + AxPTZ);
		}
	});

	$("#ptzCtrlHide").click(function(){
		if(axPTZHide() < 0)
		{
			uconlog("[Weblog] ActiveX is not ready. AxPTZ: " + AxPTZ);
		}
	});
}

function GetPresetList()
{
	if(g_isUartEnable == true && g_uartModeDBValue == "ptz") return true;

	var presetValue = "";
	var presetCount = "";
	var presetList = "";

	$("#setPresetList").empty();

	$.get("/nvc-cgi/ptz/ptz2.fcgi?query=presetlist" + "&_=" + (new Date()).getTime(), function(data) {
		if(data.substring(0,2) != "#4")
		{
			presetCount = data.split("\n")[1].split("=")[1];
			presetList = data.split("\n")[2].split("=")[1];

			if(presetList != "")
			{
				presetValue = presetList.split(",");
			}

			if(presetValue != "")
			{
				// Preset Number List 출력
				for(var i=0; i<presetCount; i++)
				{
					$("#setPresetList").append("<option value='" + presetValue[i] + "'>" + presetValue[i] + "</option>");
				}
			}
			else
			{
				$("#setPresetList").append("<option value='none'>none</option>");
			}
		}
		else
		{
			$("#setPresetList").append("<option value='none'>none</option>");
		}
	});
}

function setGuestURL()
{
	if("viewer" == location.pathname.split("/")[1])
	{
		$("ul#list li:eq(0) a").attr("href", "../config/index.html");
		$("ul#list li:eq(1) a").attr("href", "../storage/storage.html");
	}
}

function InitDoContents(count)
{
	if (count == 0)
	{
		$(".trigAlarmContents").css("display", "none");
	}
	else if (count > 1)
	{
		$("#doChannel").css("display", "inline");

		var objStr = "";
		var i = 0;

		$("#doChannel").empty();

		for (i = 0; i < count; i++)
		{
			objStr += "<option value='" + i + "'>Channel" + eval(i + 1) + "</option>";
		}

		$("#doChannel").append(objStr);
	}
}

function SetRotateSize(width, height)
{
  var whlist = {};
  whlist.width = width;
  whlist.height = height;

  if(g_isRotate)
  {
	var result = ExchangeValues(width, height);
	whlist.width = result.value1;
	whlist.height = result.value2;
  }

  return whlist;
}

function InitRecordButton()
{
	recordingEnable = 0;

	SetRecordingStream();
	recordingCodec = GetCodec(recordingStream);
	if(recordingCodec != "H264")
		recordingEnable = -1;

	DisableRecord(false);
}

function DisableRecord(disabled)
{
	if(recordingEnable == 0)
	{
		if(disabled == true)
			Disable($("#recording"));
		else
			Enable($("#recording"));
	}
	else
		Disable($("#recording"));
}

function volumeWait()
{
	AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_AUDIO_GET_VOLUME");
	$("#audioSpeakerVolumeSlider").slider("enable");
}
