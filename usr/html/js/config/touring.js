var chk = 0;
var resChk = 0;
var tourNumber = 1;
var revLang = "/language/English.xml";
var g_playChk = 0;
var g_snapshotPlay = false;
var g_snapshotUrl = "/uapi-cgi/snapshot.fcgi";
var g_videoWidth = 480;
var g_videoHeight = 270;
var g_touringIntervalMin = 1;
var g_touringIntervalMax = 80;
var g_touringIntervaldefault = 5;
var g_touringSpeedMin = 1;
var g_touringSpeedMax = 63;
var g_touringSpeeddefault = 5;

$(function () {
	PreCustomize();
	initEnvironment();
	LoadParamJs("NETWORK&ENCODER&VIDEOIN", mainRun);
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum = ["04110129","04110130"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "touring", 
				parent.g_langData[parent.g_configData.language]);
}

function mainRun()
{
	var changeWidthHeight = adjustRatioWidthHeight(VIDEOIN_CH0_CMOS_RATIO, g_videoHeight);
	g_videoWidth = changeWidthHeight[0];
	g_videoHeight = changeWidthHeight[1];

	$("button").button();
	InitForm();
	InitSetting();
	SetRelation();
	EventBind();
	ContentShow();
	Enable($("button#btnPreview"));
	SetRotateSize();
	InitStartVideo();
	PostCustomize();
}

function adjustContentsByBrand()
{
	jqDisplayCtrl(".tourSpeedContents", parent.g_support.tourSpeed == true);
	jqDisplayCtrl(".tourIntervalSpeedType1", parent.g_support.tourInterval_3_99 == false, "inline");
	jqDisplayCtrl(".tourIntervalIrSpeedPtz", parent.g_support.tourInterval_3_99 == true, "inline");
	jqDisplayCtrl(".tourSpeed_1_63", parent.g_support.tourSpeedLabel_1_63 == true, "inline");
	jqDisplayCtrl(".tourSpeed_1_64", parent.g_support.tourSpeedLabel_1_64 == true, "inline");

	if(parent.g_support.tourInterval_3_99)
	{
		g_touringIntervalMin = 3;
		g_touringIntervalMax = 99;
		g_touringIntervaldefault = 5;
	}

	if(parent.g_support.tourSpeedLabel_1_64)
	{
		g_touringSpeedMin = 1;
		g_touringSpeedMax = 64;
		g_touringIntervaldefault = 1;
		g_touringSpeeddefault = 1;
	}

	if(parent.g_brand.mfzType == "no"){
		$("#ptz_zoomfocus").css("display", "none");
	}
}

function InitForm()
{
	adjustContentsByBrand();
	//ptz panel UI
	$("#ptz_panel dd").each(function(index, element) {
		ptzImageName = "../images/"+$(this).attr("id")+".gif";
		$(this).css("background", "url('" + ptzImageName + "')	no-repeat center #FFFFFF");
	});

	$("#touringIntervalSlider").each(function(index, element) {
		var $obj = $(this).parent().parent().find("input[type='text']");
		$(this).slider({
			range: "min",
			min: g_touringIntervalMin,
			max: g_touringIntervalMax,
			value: g_touringIntervaldefault,
			slide: function(event, ui) {
				$obj.val(ui.value);
			}
		})
	});

	$("#touringIntervalText:text").blur(function(){
		var inputValInterval = $("#touringIntervalText:text").val();
		if(inputValInterval < g_touringIntervalMin || inputValInterval > g_touringIntervalMax || inputValInterval == "")
		{
			$("#touringIntervalText:text").val(g_touringIntervaldefault).focus();
			$("#touringIntervalSlider").slider("value", g_touringIntervaldefault);
			alert(GetMsgLang("04110129"));
		}
	});

	$("#touringIntervalText:text").keyup(function() {
			$("#touringIntervalSlider").slider("value", $("#touringIntervalText:text").val());
	});

	$("#touringSpeedSlider").each(function(index, element) {
		var $obj = $(this).parent().parent().find("input[type='text']");
		$(this).slider({
			range: "min",
			min: g_touringSpeedMin,
			max: g_touringSpeedMax,
			value: g_touringSpeeddefault,
			slide: function(event, ui) {
				$obj.val(ui.value);
			}
		})
	});

	$("#touringSpeedText:text").blur(function(){
		var inputVal = $("#touringSpeedText:text").val();
		if(inputVal < g_touringSpeedMin || inputVal > g_touringSpeedMax || inputVal == "")
		{
			$("#touringSpeedText:text").val(1).focus();		
			$("#touringSpeedSlider").slider("value", 1);
			alert(GetMsgLang("04110129"));
		}
	});

	$("#touringSpeedText:text").keyup(function() {
			$("#touringSpeedSlider").slider("value", $("#touringSpeedText:text").val());
	});

	var rtlFlag = false;

	if (revLang == "/language/Arabic.xml") rtlFlag = true;
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
			alert(GetMsgLang("04110129"));
		}
	});
	// speed Text box, Slider-bar 동기화
	$("#text_speedbar:text").keyup(function() {
			$("#slider_speedbar").slider("value", $("#text_speedbar:text").val());
	});
	$("#preset_number").val(1);


	var maxPreset = 255;
	if(parent.g_brand.pantilt == g_defbrand.irptz)
	{
		maxPreset = 250;
		$("label[for='preset_number']").text("(1 ... " + maxPreset + ")");
	}
	$("#preset_number:text").blur(function(){
		var inputValPtz = $("#preset_number:text").val();
		if(inputValPtz < 1 || inputValPtz > maxPreset || inputValPtz == "")
		{
			$("#preset_number:text").val(1).focus();
			alert(GetMsgLang("04110129"));
		}
	});

	Disable($("button#btnPreview"));
}

function InitSetting()
{
	$("#touringIntervalText").val(g_touringIntervaldefault);
	$("#touringSpeedText").val(1);
	GetPresetList();
	GetTourList();
}

function SetRelation()
{
	$("#selectTouringList").change(function(){
		tourNumber = $(this).val();
		GetTourList();
	});
}

function EventBind()
{
	var vfatReq = new CGIRequest();
	var opStrPtzStop = "cpantiltzoommove=0,0,0";
	var opStrFocusStop = "cfocusmove=0";

	$("#btnAdd").click(function(){
		if($("#touringIntervalText:text").val() < g_touringIntervalMin || $("#touringIntervalText:text").val() > g_touringIntervalMax || $("#touringIntervalText:text").val() == "") return;
		if($("#touringSpeedText:text").val() < g_touringSpeedMin || $("#touringSpeedText:text").val() > g_touringSpeedMax || $("#touringSpeedText:text").val() == "") return;

		var presetNum = $("#selectPresetList").val();
		var intervalNum = $("#touringIntervalText").val();
		var speedVal = $("#touringSpeedText").val();
		var presetText = FillText(presetNum, 20, "left") + FillText(intervalNum, 14, "left");
		var nRetTourList = 0;
		var tourListOptVal = presetNum + ":" + intervalNum;

		if(parent.g_support.tourSpeed)
		{
			presetText += speedVal;
			tourListOptVal += (":" + speedVal);
		}

		if(presetNum == "none")
		{
			alert(GetMsgLang("04110130"));
			return;
		}

		$("#touringList").append("<option value='" + tourListOptVal + "'>" + presetText + "</option>");

		nRetTourList = GetTourCount();

		if(nRetTourList >= 16)
		{
			Disable($("#btnAdd"));
		}
	});

	$("#btnRemove").click(function(){
		var nRetTourList = 0;

		$("#touringList option:selected").remove();

		nRetTourList = GetTourCount();

		if(nRetTourList <16)
		{
			Enable($("#btnAdd"));
		}
	});

	$("#btnUp").click(function(){
		var $op = $('#touringList option:selected');
		$op.first().prev().before($op);
	});

	$("#btnDown").click(function(){
		var $op = $('#touringList option:selected');
		$op.last().next().after($op);
	});

	$("#btnApply").click(function(){
		var allTourList = "";

		$("#touringList option").each(function(){
			$this = $(this);

			if(allTourList == "")
			{
				allTourList += $this.val();
			}
			else
			{
				allTourList += "," + $this.val();
			}
		});

		$.get("/nvc-cgi/ptz/ptz2.fcgi?settour=" + tourNumber + "&tourpreset=" + allTourList + "&_=" + (new Date()).getTime(), function() {
		});
	});

	$("#btnPreview").toggle(
		function(){
			playStatus = "PLAY";
			if(browserCheck() == "msie")
			{
				if(g_playChk != 1)
				{
					player_start(playStatus);
				}

				$("#viewToggle").css("display", "block");
				$("#ptzContents").css("display", "block");
				ResizePage();
				parent.$('html, body').animate({scrollTop:10000}, 0);
			}
			else
			{
				if(g_playChk != 1)
				{
					qtime_start(playStatus);
				}

				$("#viewToggle").css("display", "block");
				$("#ptzContents").css("display", "block");
				ResizePage();
				parent.$('html, body').animate({scrollTop:10000}, 0);
			}
		},
		function(){
			playStatus = "STOP";
			if(browserCheck() == "msie")
			{
				if(g_playChk != 0)
				{
					player_start(playStatus);
				}

				$("#viewToggle").css("display", "none");
				$("#ptzContents").css("display", "none");
				ResizePage();
			}
			else
			{
				if(g_playChk != 0)
				{
					qtime_start(playStatus);
				}

				$("#viewToggle").css("display", "none");
				$("#ptzContents").css("display", "none");
				ResizePage();
			}
		}
	);

	$("#btnTourStart").click(function(){
		var setNumber = $("#bottomTourListContents").val();

		$.get("/nvc-cgi/ptz/ptz2.fcgi?calltour=" + setNumber + "&_=" + (new Date()).getTime(), function() {
		});
	});
	$("#btnTourStop").click(function(){
		var setNumber = $("#bottomTourListContents").val();

		$.get("/nvc-cgi/ptz/ptz2.fcgi?canceltour=" + setNumber + "&_=" + (new Date()).getTime(), function() {
		});
	});

	/* PTZ */
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
	$("#btnSet").click(function() {
		var presetNum = $("#preset_number").val();
		var opStr = "&storedevicepreset=" + presetNum;

		Disable($("button"));
		actionPreset(opStr);
	});

	// Go
	$("#btnGo").click(function() {
		var presetNum = $("#setPresetList").val();
		var opStr = "&gotodevicepreset=" + presetNum;

		Disable($("button"));
		actionMove(opStr);
	});

	// Clear
	$("#btnClear").click(function() {
		var presetNum = $("#preset_number").val();
		var opStr = "&removedevicepreset=" + presetNum;

		Disable($("button"));
		actionPreset(opStr);
	});
}

//Preset
function actionPreset(opString)
{
	var actionReq = new CGIRequest();
	var reqQString = "";

	reqQString += opString;
	actionReq.SetAddress("/nvc-cgi/ptz/ptz2.fcgi");
	actionReq.SetCallBackFunc(function(xml){
		LoadParamJs("PTZ", function() {
			GetPresetList();
			ViewLoadingSave(false);
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

function GetPresetList()
{
	var presetValue = "";
	var presetCount = "";
	var presetList = "";

	$("#selectPresetList, #setPresetList").empty();

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
					$("#selectPresetList, #setPresetList").append("<option value='" + presetValue[i] + "'>" + presetValue[i] + "</option>");
				}
			}
			else
			{
				$("#selectPresetList, #setPresetList").append("<option value='none'>none</option>");
			}
		}
		else
		{
			$("#selectPresetList, #setPresetList").append("<option value='none'>none</option>");
		}
	});
}

function GetTourList()
{
	tourNumber = $("#selectTouringList").val();
	$("#touringList").empty();
	Enable($("#btnAdd"));

	$.get("/nvc-cgi/ptz/ptz2.fcgi?gettour=" + tourNumber + "&_=" + (new Date()).getTime(), function(data) {
		var nRetTourList = 0;
		
		if(data.substring(0,2) != "#4")
		{ 
			if (data.split("\n")[1].substring(0,2) != "#4" )
			{ 
				var tourCount = data.split("\n")[1].split("=")[1];
				var tourList = data.split("\n")[2].split("=")[1].split(",");

				for(var i=0; i<tourCount; i++)
				{
					var tourListValue = tourList[i].split(":");
					var presetText = FillText(tourListValue[0], 20, "left") + FillText(tourListValue[1], 14, "left");
					if(parent.g_support.tourSpeed) presetText += tourListValue[2];

					$("#touringList").append("<option value='" + tourList[i] + "'>" + presetText + "</option>");
				}

				nRetTourList = GetTourCount();

				if(nRetTourList >= 16)
				{
					Disable($("#btnAdd"));
				}
				else
				{
					Enable($("#btnAdd"));
				}
			}
		}
	});
}

//현재 Tour List 개수 확인
function GetTourCount()
{
	var nListCount = 0;

	$("#touringList option").each(function(){
		nListCount++;
	});

	return nListCount;
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
		var resultWH = ExchangeValues(g_videoWidth, g_videoHeight);
		g_videoWidth = resultWH.value1;
		g_videoHeight = resultWH.value2;
		break;
	case "none":
		break;
	}
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
						activex_error,
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

var flag = false;
function reflashImage() 
{
	loadImage = function() {
		if(g_snapshotPlay === false) {
			return;
		}
		$("#snapshotArea").attr("src", ImageBuf.src);
		$("#snapshotArea").show();
		if(flag == true)
		{
			ResizePage();
			flag = false;
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
