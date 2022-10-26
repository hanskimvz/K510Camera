var playChk = 0;
var chk = 0;
var resChk = 0;
var sdChk = 0;
var sdMax = 4;
var snapshot_play = false;
var snapshot_url = "/uapi-cgi/snapshot.fcgi";
var statusInterval = 10;
var clock = null;
var Width = 608;
var Height = 342;

$(function () {
	PreCustomize();
	
	// Language set
	var classNum = ["04020262", "04020263", "04020264", "0501"];
	InitMsgLang(classNum);	
	var environmentReq = new CGIRequest();
	var environmentReqQString = "";
	var langDepth = setup + maincontents + "repositioning";
	environmentReq.SetAddress("/environment.xml");
	environmentReq.SetCallBackFunc(function(xml){
		var revLang = "/language/base/English.xml";
		if($('lang', xml).size() > 0)
		{
			revLang = $('lang', xml).text();
			getLangXml(revLang, langDepth);
			LoadParamJs("PTZ&NETWORK&ENCODER&VIDEOIN&cache", Run);
		}
	});
	environmentReq.Request(environmentReqQString);
	startRevInterval();
});

function testPage()
{
	return true;
}

function Run()
{
	_debug("start");
	var changeWidthHeight = adjustRatioWidthHeight(VIDEOIN_CH0_CMOS_RATIO, Height);
	Width = changeWidthHeight[0];
	Height = changeWidthHeight[1];

	InitThemes();
	InitForm();
	ContentShow();
	GetBrandInformation();
	Load();
	PostCustomize();

	_debug("stop");
}

function Load()
{
	if (StartVideo() == true)
	{
		setTimeout( function() {
			InitSetting();
			SetRelation();
			EventBind();
			ViewLoadingSave(false);
			ListSelectEnableCheck();
		}, 50);
	}
	ResizePage();
}

// Preset
function actionPreset(opString)
{
	var actionReq = new CGIRequest();
	var reqQString = "&xmlschema";

	reqQString += opString;
	actionReq.SetAddress("/uapi-cgi/uptz.fcgi");
	actionReq.SetCallBackFunc(function(xml){
		LoadParamJs("PTZ&cache", function() {
			InitSetting();
			SetRelation();
			ViewLoadingSave(false);
			ListSelectEnableCheck();
		});

		return;
	});
	actionReq.Request(reqQString);
}

// Movement
function actionMove(opString)
{
	var actionReq = new CGIRequest();
	var reqQString = "&xmlschema";

	reqQString += opString;
	actionReq.SetAddress("/uapi-cgi/uptz.fcgi");
	actionReq.SetCallBackFunc(function(xml){
		resChk = 0;
		ViewLoadingSave(false);
		ListSelectEnableCheck();
		presetChk = 1;
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

// Schedule Diff
function scheduleCheck()
{
	var preSd = 0;
	var nextSd = 0;
	var preSdSum = 0;
	var nextSdSum = 0;
	var sdDay = new Array("mon", "tue", "wed", "thu", "fri", "sat", "sun");
	
	sdChk = 0;
	for(preSd=0; preSd<sdMax-1; preSd++)
	{
		for(nextSd=preSd+1; nextSd<sdMax; nextSd++)
		{	
			// 비교 값 초기화
			preSdSum = 0;
			nextSdSum = 0;
			
			// 체크 항목 값 계산
			for(var i=0; i<sdDay.length; i++)
			{
				preSdSum = (preSdSum*2) + (($("#formPreset" + preSd + "_" + sdDay[i]).attr("checked") == true) ? 1:0);
				nextSdSum = (nextSdSum*2) + (($("#formPreset" + nextSd + "_" + sdDay[i]).attr("checked") == true) ? 1:0);
			}
			
			// 합한 값이 0 이면 continue;
			if(preSdSum == 0 || nextSdSum == 0) continue;
			
			// 같은 항목이 있으면 sdChk = 1;
			if(((preSdSum & nextSdSum) != 0) && ($("#formPresetTime_" + preSd).val() == $("#formPresetTime_" + nextSd).val()))
			{
				sdChk = 1;
				break;
			}
			else 
			{
				sdChk = 0;
			}			
		}
		if(sdChk == 1) break;
	}
}

function InitSetting()
{
	var i=0;
	var j=0;
	var dayIdx=0;
	var nList = PTZ_CH0_PRESET_LIST.split(",");
	var idx = [];
	var name = [];
	var scheduleTime0 = PTZ_CH0_SCHEDULE_S0_TIME.split(":");
	var scheduleTime1 = PTZ_CH0_SCHEDULE_S1_TIME.split(":");
	var scheduleTime2 = PTZ_CH0_SCHEDULE_S2_TIME.split(":");
	var scheduleTime3 = PTZ_CH0_SCHEDULE_S3_TIME.split(":");
	var scheduleDay0 = PTZ_CH0_SCHEDULE_S0_DAY.split(",");
	var scheduleDay1 = PTZ_CH0_SCHEDULE_S1_DAY.split(",");
	var scheduleDay2 = PTZ_CH0_SCHEDULE_S2_DAY.split(",");
	var scheduleDay3 = PTZ_CH0_SCHEDULE_S3_DAY.split(",");

	$("#schedule select option").remove();
	for(i=0; i<nList.length; i++)
	{
		var numbering = "";
		var presetEnable = "";

		// preset number
		idx = parseInt(eval("PTZ_CH0_PRESET_P" + nList[i] + "_NUMBER")) + 1;
		name = eval("PTZ_CH0_PRESET_P" + nList[i] + "_NAME");

		if(eval("PTZ_CH0_PRESET_P" + nList[i] + "_ENABLE") == "no")
		{
			name = "--disabled--";
		}

		if(idx <= 9)
		{
			numbering += "0" + idx + ".";
		}
		else
		{
			numbering += idx + ".";
		}
		$("#preset_list option[value='" + idx + "']").text(numbering + " " + name);

		// Schedule List
		if(eval("PTZ_CH0_PRESET_P" + i + "_ENABLE") == "yes")
		{
			var selected = ["", "", "", ""];
			var sNum = 0;

			if(i<9)
			{
				numbering = "0" + (i+1) + ".";
			}
			else
			{
				numbering = (i+1) + ".";
			}
			name = eval("PTZ_CH0_PRESET_P" + i + "_NAME");
			name = name.replace(/</g, "&lt;");

			for(sNum=0; sNum<4; sNum++)
			{
				if(eval("PTZ_CH0_SCHEDULE_S" + sNum + "_PRESET") == i)
					selected[sNum] = "selected";
			}
			$("#formPresetList_0").append("<option value='" + i + "' " + selected[0] + ">" + numbering + " " + name + "</option>");
			$("#formPresetList_1").append("<option value='" + i + "' " + selected[1] + ">" + numbering + " " + name + "</option>");
			$("#formPresetList_2").append("<option value='" + i + "' " + selected[2] + ">" + numbering + " " + name + "</option>");
			$("#formPresetList_3").append("<option value='" + i + "' " + selected[3] + ">" + numbering + " " + name + "</option>");
		}
	}
	// Schedule Time
	$("#formPresetTime_0:text").val(scheduleTime0[0] + ":" + scheduleTime0[1]);
	$("#formPresetTime_1:text").val(scheduleTime1[0] + ":" + scheduleTime1[1]);
	$("#formPresetTime_2:text").val(scheduleTime2[0] + ":" + scheduleTime2[1]);
	$("#formPresetTime_3:text").val(scheduleTime3[0] + ":" + scheduleTime3[1]);

	// Schedule Day
	for(dayIdx=0; dayIdx<7; dayIdx++)
	{
		$("#formPreset0_" + scheduleDay0[dayIdx] + ":checkbox").attr("checked", "checked");
		$("#formPreset1_" + scheduleDay1[dayIdx] + ":checkbox").attr("checked", "checked");
		$("#formPreset2_" + scheduleDay2[dayIdx] + ":checkbox").attr("checked", "checked");
		$("#formPreset3_" + scheduleDay3[dayIdx] + ":checkbox").attr("checked", "checked");
	}
	if($("#formPresetList_0").val() ==	null)
	{
		$("#formPresetList_0").append("<option>------------------------------------------</option>");
	}
	if($("#formPresetList_1").val() ==	null)
	{
		$("#formPresetList_1").append("<option>------------------------------------------</option>");
	}
	if($("#formPresetList_2").val() ==	null)
	{
		$("#formPresetList_2").append("<option>------------------------------------------</option>");
	}
	if($("#formPresetList_3").val() ==	null)
	{
		$("#formPresetList_3").append("<option>------------------------------------------</option>");
	}
}

function GetBrandInformation()
{
	var brandReq = new CGIRequest();
	var brandReqQString = "";
	brandReq.SetAddress("/brand.xml");

	brandReq.SetCallBackFunc(function(xml) {

		var productid = "";
		var audioinout = "";

		// product id
		if($('model > productid', xml).size() > 0)
		{
			productid = $('model > productid', xml).text().toLowerCase();
		}

		// AudioIn/AudioOut
		if($('audio audio', xml).size() > 0)
		{
			if($('audio audio', xml).text().toLowerCase() == 'in')
			{
				audioinout += '1/0';
			}
			else if($('audio audio', xml).text().toLowerCase() == 'out')
			{
				audioinout += '0/1';
			}
			else if($('audio audio', xml).text().toLowerCase() == 'in+out' || $('audio audio', xml).text().toLowerCase() == 'out+in')
			{
				audioinout += '1/1';
			}
			else
			{
				audioinout += '0/0';
			}
		}

		if(productid != "d001")
		{
			if(audioinout == "0/0") // In Out 둘다 없는 경우
			{
				$("#parentpagename").css("display", "none");
				$("#parentpagename_video").css("display", "inline");
			}
			else if(audioinout == "1/0") // In 있고, Out 없는 경우
			{
				$("#parentpagename").css("display", "inline");
				$("#parentpagename_video").css("display", "none");
			}
			else if(audioinout == "0/1") // In 없고, Out 있는 경우
			{
				$("#parentpagename").css("display", "inline");
				$("#parentpagename_video").css("display", "none");
			}
		}
		else
		{
			$("#parentpagename").css("display", "inline");
			$("#parentpagename_video").css("display", "none");
		}
	});
	brandReq.Request(brandReqQString);
}

function InitForm()
{
	$("#save").button();
	var ptzImageName = 0;

	//ViewLoadingSave(true);
	$("button").attr("disabled", "");
	$("#loading_msg").css({
		top: "250px",
		left: "50%"
	});

	// ptz panel UI
	$("#ptz_panel li").each(function(index, element) {
		ptzImageName = "../images/"+$(this).attr("id")+".gif";
		$(this).css("background", "url('" + ptzImageName + "')	no-repeat center #FFFFFF");
	});

	// Schedule Time
	$("#schedule :text").blur(function(){
		var timeArr = new Array(2);
		var initTime = $(this).val();
		timeArr = $(this).val().split(":");

		// HH:MM
		if(timeArr[0] < 00 || timeArr[0] > 23 || timeArr[0] == "" ||
			timeArr[1] < 00 || timeArr[1] > 59 || timeArr[1] == "" ||
			timeArr[0].length != 2 || timeArr[1].length != 2
		)
		{
			$(this).val(initTime).focus();
			alert(GetMsgLang("04020262"));
		}
	}).keyup(function(){
		var objEv = event.srcElement;
		var num ="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
		event.returnValue = true;

		for (var i=0;i<objEv.value.length;i++)
		{
			if(-1 != num.indexOf(objEv.value.charAt(i)))
			event.returnValue = false;
		}
		if (!event.returnValue)
		{
			objEv.value=initTime;
		}
	});
	Disable($("button").button());
}

function SetRelation()
{	
	// 글자수 제한
	$("#preset_name:text").keyup(function(){
		LimitCharac("preset_name:text", 32);
	});

	// Preset list 선택 시
	$("#preset_list").change(function(){
		ListSelectEnableCheck();

		if($("#preset_list").val() === "0") {
			$("#preset_name:text").val("");
			return;
		}
		var presetIdx = $("#preset_list").val()-1;
		$("#preset_name:text").val(eval("PTZ_CH0_PRESET_P" + presetIdx + "_NAME"));
	});
	$("#preset_list").change();
}

function EventBind()
{
	Enable($("button"));
	// Center up
	$("#pt_cu").mousedown(function(){
		var opStr = "&cpantiltmove=0,10";
		if(resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		resChk = 1;
	}).mouseup(function(){
		var opStr = "&cpantiltmove=0";
		actionStop(opStr);
	}).mouseout(function(){
		var opStr = "&cpantiltmove=0";
		actionStop(opStr);
	});

	// Left middle
	$("#pt_lm").mousedown(function(){
		var opStr = "&cpantiltmove=-10,0";
		if(resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		resChk = 1;
	}).mouseup(function(){
		var opStr = "&cpantiltmove=0";
		actionStop(opStr);
	}).mouseout(function(){
		var opStr = "&cpantiltmove=0";
		actionStop(opStr);
	});

	// Center middle - Stop
	$("#pt_cm").mousedown(function(){
		var opStr = "&cpantiltmove=0&czoommove=0&cfocusmove=0";
		actionMove(opStr);
	});

	// Right middle
	$("#pt_rm").mousedown(function(){
		var opStr = "&cpantiltmove=10,0";
		if(resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		resChk = 1;
	}).mouseup(function(){
		var opStr = "&cpantiltmove=0";
		actionStop(opStr);
	}).mouseout(function(){
		var opStr = "&cpantiltmove=0";
		actionStop(opStr);
	});

	// Center down
	$("#pt_cd").mousedown(function(){
		var opStr = "&cpantiltmove=0,-10";
		if(resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		resChk = 1;
	}).mouseup(function(){
		var opStr = "&cpantiltmove=0";
		actionStop(opStr);
	}).mouseout(function(){
		var opStr = "&cpantiltmove=0";
		actionStop(opStr);
	});

	// Zoom
	// Tele
	$("#tele_l3").mousedown(function(){
		var opStr = "&stepmove=zoomtele&step=3";
		actionMove(opStr);
	});
	$("#tele_l2").mousedown(function(){
		var opStr = "&stepmove=zoomtele&step=2";
		actionMove(opStr);
	});
	$("#tele_l1").mousedown(function(){
		var opStr = "&stepmove=zoomtele&step=1";
		actionMove(opStr);
	});
	// Wide
	$("#zoom_r3").mousedown(function(){
		var opStr = "&stepmove=zoomwide&step=3";
		actionMove(opStr);
	});
	$("#zoom_r2").mousedown(function(){
		var opStr = "&stepmove=zoomwide&step=2";
		actionMove(opStr);
	});
	$("#zoom_r1").mousedown(function(){
		var opStr = "&stepmove=zoomwide&step=1";
		actionMove(opStr);
	});

	// Focus
	// Near
	$("#focus_l3").mousedown(function(){
		var opStr = "&stepmove=focusnear&step=3";
		actionMove(opStr);
	});
	$("#focus_l2").mousedown(function(){
		var opStr = "&stepmove=focusnear&step=2";
		actionMove(opStr);
	});
	$("#focus_l1").mousedown(function(){
		var opStr = "&stepmove=focusnear&step=1";
		actionMove(opStr);
	});
	// Far
	$("#far_r3").mousedown(function(){
		var opStr = "&stepmove=focusfar&step=3";
		actionMove(opStr);
	});
	$("#far_r2").mousedown(function(){
		var opStr = "&stepmove=focusfar&step=2";
		actionMove(opStr);
	});
	$("#far_r1").mousedown(function(){
		var opStr = "&stepmove=focusfar&step=1";
		actionMove(opStr);
	});

	// Auto Focus
	$("#btnAF").click(function() {
		var opStr = "&autofocus";
		actionMove(opStr);
	});

	// Go
	$("#btnGo").click(function() {
		var presetListVal = $("#preset_list").val();
		if(presetListVal === "0") {
			alert(GetMsgLang("04020263"));
			return;
		}
		var opStr = "&gotodevicepreset=" + (presetListVal-1);
		actionMove(opStr);
	});

	// Set
	$("#btnSet").click(function() {
		var presetListVal = $("#preset_list").val();
		if(presetListVal === "0") {
			alert(GetMsgLang("04020263"));
			return;
		}
		var presetNum = ($("#preset_list option[value='" + presetListVal + "']").text()).split(" ");
		var presetNameVal = $("#preset_name").val();
		var opStr = "&storedevicepreset=" + (presetListVal-1) + "&name=" + encodeURIComponent(presetNameVal);
		var nList = PTZ_CH0_PRESET_LIST.split(",");
		var t=0;

		ViewLoadingSave(true);
		// preset select box 이름 바로 변경
		$("#preset_list option[value='" + presetListVal + "']").text(presetNum[0] + " " + presetNameVal);
		actionPreset(opStr);
	});

	// Clear
	$("#btnClear").click(function() {
		var presetListVal = $("#preset_list").val();
		if(presetListVal === "0") {
			alert(GetMsgLang("04020263"));
			return;
		}
		var opStr = "&removedevicepreset=" + (presetListVal-1);
		var presetNum = ($("#preset_list option[value='" + presetListVal + "']").text()).split(" ");

		if(eval("PTZ_CH0_PRESET_P" + (presetListVal-1) + "_ENABLE") != "yes")
			return;
			
		ViewLoadingSave(true);
		// preset select box 이름 바로 변경
		$("#preset_list option[value='" + presetListVal + "']").text(presetNum[0] + " --disabled--");
		$("#preset_name").val("");

		//Finally clear preset
		actionPreset(opStr);
	});

	// Save
	$("#save").click(function(){
		var Req = new CGIRequest();
		var reqQString = "action=update&xmlschema";
		var revDay = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
		var resultDay = ["","","",""];
		var i = 0;
		var j = 0;
		
		scheduleCheck();
		
		if(sdChk == 1)
		{
			alert(GetMsgLang("04020264"));
			return;
		}
		

		for(j=0; j<4; j++)
		{
			for(i=0; i<7; i++)
			{
				if($("#formPreset" + j + "_" + revDay[i] + ":checkbox").attr("checked") == true)
				{
					if(resultDay[j] != "")
						resultDay[j] += ",";
					resultDay[j] += revDay[i];
				}
			}

			($("#formPresetList_" + j).val() == null) ? "":$(this).val();
		}

		QString = makeQString();
		QString
			.set_action('update')
			.set_schema('xml')
			.add_list("PTZ.Ch0.Schedule.S0.day", PTZ_CH0_SCHEDULE_S0_DAY, resultDay[0])
			.add_list("PTZ.Ch0.Schedule.S1.day", PTZ_CH0_SCHEDULE_S1_DAY, resultDay[1])
			.add_list("PTZ.Ch0.Schedule.S2.day", PTZ_CH0_SCHEDULE_S2_DAY, resultDay[2])
			.add_list("PTZ.Ch0.Schedule.S3.day", PTZ_CH0_SCHEDULE_S3_DAY, resultDay[3])
			.add_list("PTZ.Ch0.Schedule.S0.time", PTZ_CH0_SCHEDULE_S0_TIME, $("#formPresetTime_0").val() + ":00")
			.add_list("PTZ.Ch0.Schedule.S1.time", PTZ_CH0_SCHEDULE_S1_TIME, $("#formPresetTime_1").val() + ":00")
			.add_list("PTZ.Ch0.Schedule.S2.time", PTZ_CH0_SCHEDULE_S2_TIME, $("#formPresetTime_2").val() + ":00")
			.add_list("PTZ.Ch0.Schedule.S3.time", PTZ_CH0_SCHEDULE_S3_TIME, $("#formPresetTime_3").val() + ":00")
			.add_list("PTZ.Ch0.Schedule.S0.preset", PTZ_CH0_SCHEDULE_S0_PRESET, ($("#formPresetList_0").val() == "------------------------------------------") ? "0":$("#formPresetList_0").val())
			.add_list("PTZ.Ch0.Schedule.S1.preset", PTZ_CH0_SCHEDULE_S1_PRESET, ($("#formPresetList_1").val() == "------------------------------------------") ? "0":$("#formPresetList_1").val())
			.add_list("PTZ.Ch0.Schedule.S2.preset", PTZ_CH0_SCHEDULE_S2_PRESET, ($("#formPresetList_2").val() == "------------------------------------------") ? "0":$("#formPresetList_2").val())
			.add_list("PTZ.Ch0.Schedule.S3.preset", PTZ_CH0_SCHEDULE_S3_PRESET, ($("#formPresetList_3").val() == "------------------------------------------") ? "0":$("#formPresetList_3").val());

		reqQString = QString.get_qstring();
		if(!reqQString) {
			return;
		}

		Req.SetStartFunc(ViewLoadingSave);
		Req.SetCallBackFunc(function(xml){
			var ret = CGIResponseCheck(0, xml);
			if(ret != 0) {
				var errormessage = "";
				if(ret != -2) {
					errormessage = "\n" + ret;
				}
				alert(GetMsgLang("0501") + errormessage);
			}
		
			_debug("update - " + reqQString);
			LoadParamJs("PTZ&cache", function() {
				InitSetting();
				SetRelation();
				ViewLoadingSave(false);
				ListSelectEnableCheck();
			});
			return;
		});
		_debug("start" + reqQString);
		Req.Request(reqQString);
	});
	$("#btnPanTilt").click(function(){
		var opStr = "&calibrate=pan,tilt";
		actionMove(opStr);
	});
	$("#btnZoomFocus").click(function(){
		var opStr = "&calibrate=zoom,focus";
		actionMove(opStr);
	});
}

////////////////////////////////////////////////////////////////////////////////
// Function name : qtime_start(streamUri, width, height)
// Description	 : quicktime 영상 재생
// Return value	: 
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
//			objStr += "<p>fail to loading...</p>";
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
// Description	 : 퀵타임 설치 에러시 동작
// Return value	: 
////////////////////////////////////////////////////////////////////////////////
function qtime_error()
{
	setTimeout(StartSnapshot, 1000);
}

////////////////////////////////////////////////////////////////////////////////
// Function name : activex_error()
// Description	 : ActiveX 설치 에러시 동작
// Return value	: 
////////////////////////////////////////////////////////////////////////////////
function activex_error()
{
	StartSnapshot();
}

////////////////////////////////////////////////////////////////////////////////
// Function name : StartSnapshot()
// Description	 : Snapshot 출력, 영상 설치전
// Return value	: 
////////////////////////////////////////////////////////////////////////////////
function StartSnapshot()
{
	$("#screen").empty();
	$("#screen").append("<img>")
		.find("img:last").attr("id", "snapshotArea");
		
	$("#snapshotArea").attr({
		width: Width,
		height: Height
	});

	snapshot_play = true;
	$("#snapshotArea").hide();
	reflashImage();
}

////////////////////////////////////////////////////////////////////////////////
// Function name : reflashImage()
// Description	 : Snapshot 이미지 로드
// Return value	: 
////////////////////////////////////////////////////////////////////////////////
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

////////////////////////////////////////////////////////////////////////////////
// function name: startRevInterval()
// Description: status 를 받아오기위한 Interval을 시작한다.
////////////////////////////////////////////////////////////////////////////////
function startRevInterval()
{
	clearInterval(clock);
	receiveStatus();
	
	if(clock != null)
	{
		clearInterval(clock);
		clock = null;
	}
	clock = setInterval(function(){
		receiveStatus();
	},statusInterval*1000);
}


////////////////////////////////////////////////////////////////////////////////
//function name: receiveStatus()
//Description: receive status
////////////////////////////////////////////////////////////////////////////////
function receiveStatus()
{
	var resourceReq = new CGIRequest();
	var ptzRed = new CGIRequest();

	resourceReq.SetAddress("/status/resource-state.xml");
	resourceReq.SetCallBackFunc(function(xml){
		var TempPart = $("resource[name='temperature']", xml);
		var rev_TempCelsius_1 = 0;
		var rev_TempCelsius_2 = 0;
		var rev_TempFahrenheit_1 = 0;
		var rev_TempFahrenheit_2 = 0;
		var resultPtzCelsius = 0;
		var resultPtzFahrenheit = 0;
		
		if($("item[name='ptz1-celsius']", TempPart).size() > 0)
		{
			rev_TempCelsius_1 = Number($("item[name='ptz1-celsius']", TempPart).text());
		}
		if($("item[name='ptz1-fahrenheit']", TempPart).size() > 0)
		{
			rev_TempFahrenheit_1 = Number($("item[name='ptz1-fahrenheit']", TempPart).text());
		}
		if($("item[name='ptz2-celsius']", TempPart).size() > 0)
		{
			rev_TempCelsius_2 = Number($("item[name='ptz2-celsius']", TempPart).text());
		}
		if($("item[name='ptz2-fahrenheit']", TempPart).size() > 0)
		{
			rev_TempFahrenheit_2 = Number($("item[name='ptz2-fahrenheit']", TempPart).text());
		}

		resultPtzCelsius = (rev_TempCelsius_1 + rev_TempCelsius_2) / 2;
		resultPtzFahrenheit = (rev_TempFahrenheit_1 + rev_TempFahrenheit_2) / 2;

		$("#status_TempCelsius").text(Math.round(resultPtzCelsius));
		$("#status_TempFahrenheit").text(Math.round(resultPtzFahrenheit));
		
		delete TempPart;
		delete rev_TempCelsius_1;
		delete rev_TempCelsius_2;
		delete rev_TempFahrenheit_1;
		delete rev_TempFahrenheit_2;
		delete resultPtzCelsius;
		delete resultPtzFahrenheit;
		return;
	});
	resourceReq.Request();
	
	ptzRed.SetAddress("/status/ptz-state.xml");
	ptzRed.SetCallBackFunc(function(xml){
		var PositionPart = $("position[name='total']", xml);
		var rev_CyclePan = "-";
		var rev_CycleTilt = "-";

		if($("value[name='pan']", PositionPart).size() > 0)
		{
			rev_CyclePan = $("value[name='pan']", PositionPart).text();
		}
		
		if($("value[name='tilt']", PositionPart).size() > 0)
		{
			rev_CycleTilt = $("value[name='tilt']", PositionPart).text();
		}

		$("#status_CyclePan").text(rev_CyclePan);
		$("#status_CycleTilt").text(rev_CycleTilt);
		
		delete PositionPart;
		delete rev_CyclePan;
		delete rev_CycleTilt;
		return;
	});
	ptzRed.Request();
	
	delete resourceReq;
	delete ptzRed;
}

//////////////////////////////////////////////////////////////////////////////////////////
// function name : ListSelectEnableChekc()
// Description : Preset Select Box 의 값이 List 값이 아닐때(첫번째 항목) Go, Set, Clear 비활성화
//							 Preset Select Box 의 값이 설정되지 않은 값이 선택될때 Set 만 활성화
//							 Preset Select Box 의 값이 설정된 값이 선택될때 Go, Set, Clear 활성화
//////////////////////////////////////////////////////////////////////////////////////////
function ListSelectEnableCheck()
{
	var nList = PTZ_CH0_PRESET_LIST.split(",");
	var nSelectList = $("#preset_list").val();
	var szSelectEnable = "no";

	if(nSelectList === "0") {
		Disable($("#btnGo"));
		Disable($("#btnSet"));
		Disable($("#btnClear"));
		return;
	}

	szSelectEnable = eval("PTZ_CH0_PRESET_P" + (nSelectList-1) + "_ENABLE");
	if(szSelectEnable == "no")
	{
		Disable($("#btnGo"));
		Enable($("#btnSet"));
		Disable($("#btnClear"));
	}
	else
	{
		Enable($("#btnGo"));
		Enable($("#btnSet"));
		Enable($("#btnClear"));
	}
}

////////////////////////////////////////////////////////////////////////////////
// Function name : StartVideo()
// Description	 : 영상 시작
// Return value	: 
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

	snapshot_play = false;

	if(browserCheck() == "msie")
	{
		AxUMF_create(Width,
								 Height,
								 StartSnapshot,
								 function () {
									 AxUMF.SetParam("CONTROL", "AUDIO", "OFF");
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
			if(qtime_start(streamUri, Width, Height) == false)
			{
				return false;
			}
		}
	}
	return true;
}

////////////////////////////////////////////////////////////////////////////////
// Function name : SetRotateSize()
// Description	 : Set width and height according to rotate state.
// Return value	: 
////////////////////////////////////////////////////////////////////////////////
function SetRotateSize()
{
	var rotateValue = VIDEOIN_CH0_ROTATE_DIRECTION;

	switch(rotateValue)
	{
		case "left":
		case "right":
			var result = ExchangeValues(Width, Height);
			Width = result.value1;
			Height = result.value2;
			break;
		case "none":
			break;
	}
}
