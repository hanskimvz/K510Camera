var g_defaultGroup = "PTZ";
var g_moveState = "STOP";
var g_resCheck = 0;

$(function () {
	PreCustomize();
	initEnvironment();
	getDataConfig_UAPI(g_defaultGroup, function(data){
		initDataValue(data);
		mainRun(data);
	});
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
	$("button").button();
}

function initLanguage()
{
	var classNum = ["04110519", "04110520", "0501"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "presetschedule", 
				parent.g_langData[parent.g_configData.language]);
}

function mainRun(data)
{
	initForm();
	getPresetList();
	eventBind(data);
	ContentShow();
	PostCustomize();
	if(parent.g_brand.mfzType == "no"){
		$("#ptz_zoomfocus").css("display", "none");
		$("#ptz_panel").css("margin-right", "20px");
		$(".04110507").css("margin-top", "100px");
	}
}

function initForm()
{
	
	setTextBlur("#text_speedbar:text", 1, 100, 20, "04110519");
	setTextBlur("#preset_number:text", 1, 255, 1, "04110519");
	$("#text_speedbar:text").numeric();
	$("#preset_number:text").numeric();

	$("#ptz_panel dd").each(function(index, element) {
		ptzImageName = "../images/"+$(this).attr("id")+".gif";
		$(this).css("background", "url('" + ptzImageName + "')	no-repeat center #FFFFFF");
	});

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

	$("#text_speedbar:text").blur(function(){
		var inputValSpeed = $("#text_speedbar:text").val();
		if(inputValSpeed < 1 || inputValSpeed > 100 || inputValSpeed == "")
		{
			$("#text_speedbar:text").val(20).focus();
			$("#slider_speedbar").slider("value", 20);
			alert(GetMsgLang("04110519"));
		}
	});

	$("#text_speedbar:text").keyup(function() {
		$("#slider_speedbar").slider("value", $("#text_speedbar:text").val());
	});

	$("#text_speedbar").val(20);
	$("#preset_number").val(1);
}

function setSdPresetNumber()
{
	var scheduleTime0 = g_dataArray["ptz_ch0_schedule_s0_time"].split(":");
	var scheduleTime1 = g_dataArray["ptz_ch0_schedule_s1_time"].split(":");
	var scheduleTime2 = g_dataArray["ptz_ch0_schedule_s2_time"].split(":");
	var scheduleTime3 = g_dataArray["ptz_ch0_schedule_s3_time"].split(":");
	var scheduleDay0 = g_dataArray["ptz_ch0_schedule_s0_day"].split(",");
	var scheduleDay1 = g_dataArray["ptz_ch0_schedule_s1_day"].split(",");
	var scheduleDay2 = g_dataArray["ptz_ch0_schedule_s2_day"].split(",");
	var scheduleDay3 = g_dataArray["ptz_ch0_schedule_s3_day"].split(",");

	$("#ptz_ch0_schedule_s0_preset").val(parseInt(g_dataArray["ptz_ch0_schedule_s0_preset"]) + 1);
	$("#ptz_ch0_schedule_s1_preset").val(parseInt(g_dataArray["ptz_ch0_schedule_s1_preset"]) + 1);
	$("#ptz_ch0_schedule_s2_preset").val(parseInt(g_dataArray["ptz_ch0_schedule_s2_preset"]) + 1);
	$("#ptz_ch0_schedule_s3_preset").val(parseInt(g_dataArray["ptz_ch0_schedule_s3_preset"]) + 1);

	// Schedule Time
	$("#ptz_ch0_schedule_s0_time:text").val(scheduleTime0[0] + ":" + scheduleTime0[1]);
	$("#ptz_ch0_schedule_s1_time:text").val(scheduleTime1[0] + ":" + scheduleTime1[1]);
	$("#ptz_ch0_schedule_s2_time:text").val(scheduleTime2[0] + ":" + scheduleTime2[1]);
	$("#ptz_ch0_schedule_s3_time:text").val(scheduleTime3[0] + ":" + scheduleTime3[1]);

	// Schedule Day
	for(var dayIdx=0; dayIdx<7; dayIdx++)
	{
		$("#formPreset0_" + scheduleDay0[dayIdx] + ":checkbox").attr("checked", "checked");
		$("#formPreset1_" + scheduleDay1[dayIdx] + ":checkbox").attr("checked", "checked");
		$("#formPreset2_" + scheduleDay2[dayIdx] + ":checkbox").attr("checked", "checked");
		$("#formPreset3_" + scheduleDay3[dayIdx] + ":checkbox").attr("checked", "checked");
	}
}

function getPresetList()
{
	var presetValue = "";
	var presetCount = "";
	var presetList = "";

	var selectID = "#setPresetList, #ptz_ch0_schedule_s0_preset, #ptz_ch0_schedule_s1_preset, #ptz_ch0_schedule_s2_preset, #ptz_ch0_schedule_s3_preset";
	$(selectID).empty();

	$.get("/nvc-cgi/ptz/ptz2.fcgi?query=presetlist" + "&_=" + (new Date()).getTime(), function(data) {
		if(data.substring(0,2) != "#4")
		{
			presetCount = data.split("\n")[1].split("=")[1];
			var presetList = data.split("\n")[2].split("=")[1];

			if(presetList != "")
			{
				presetValue = presetList.split(",");
			}

			if(presetValue != "")
			{
				// Preset Number List 출력
				for(var i=0; i<presetCount; i++)
				{
					$(selectID).append("<option value='" + presetValue[i] + "'>" + presetValue[i] + "</option>");
				}
			}
			else
			{
				$(selectID).append("<option value='none'>none</option>");
			}
		}
		else
		{
			$(selectID).append("<option value='none'>none</option>");
		}

		setSdPresetNumber();
	});
}

function eventBind()
{
	var opStrPtzStop = "cpantiltzoommove=0,0,0";
	var opStrFocusStop = "cfocusmove=0";

	$("#pt_cm").unbind().mousedown(function(){
		actionStop(opStrPtzStop);
	});

	bindMoveMent("#pt_lu");
	bindMoveMent("#pt_cu");
	bindMoveMent("#pt_ru");
	bindMoveMent("#pt_lm");
	bindMoveMent("#pt_rm");
	bindMoveMent("#pt_ld");
	bindMoveMent("#pt_cd");
	bindMoveMent("#pt_rd");
	bindMoveMent("#_zIn");
	bindMoveMent("#_zOut");
	bindMoveMent("#_fNear");
	bindMoveMent("#_fFar");

	$("#btnSet").unbind().click(function() {
		var presetNum = $("#preset_number").val();
		Disable($("button"));
		actionPreset("&storedevicepreset=" + presetNum);
	});

	$("#btnGo").unbind().click(function() {
		var presetNum = $("#setPresetList").val();
		Disable($("button"));
		actionMove("&gotodevicepreset=" + presetNum);
	});

	$("#btnClear").unbind().click(function() {
		var presetNum = $("#preset_number").val();
		Disable($("button"));
		actionPreset("&removedevicepreset=" + presetNum);
	});

	$("#btnApply").unbind().click(function(){
		if(scheduleCheck() == 1)
		{
			alert(GetMsgLang("04110520"));
			return;
		}

		var revDay = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
		var resultDay = ["","","",""];

		for(var j=0; j<4; j++)
		{
			for(var i=0; i<7; i++)
			{
				if($("#formPreset" + j + "_" + revDay[i] + ":checkbox").attr("checked") == true)
				{
					if(resultDay[j] != "")
						resultDay[j] += ",";
					resultDay[j] += revDay[i];
				}
			}
		}

		
		var preset0 = $("#ptz_ch0_schedule_s0_preset").val();
		var preset1 = $("#ptz_ch0_schedule_s1_preset").val();
		var preset2 = $("#ptz_ch0_schedule_s2_preset").val();
		var preset3 = $("#ptz_ch0_schedule_s3_preset").val();

		preset0 = (preset0 == "none") ? "0" : (preset0 - 1);
		preset1 = (preset1 == "none") ? "0" : (preset1 - 1);
		preset2 = (preset2 == "none") ? "0" : (preset2 - 1);
		preset3 = (preset3 == "none") ? "0" : (preset3 - 1);

		QString = makeQString();
		QString
			.set_action('update')
			.set_schema('xml')
			.add_list("PTZ.Ch0.Schedule.S0.day", g_dataArray["ptz_ch0_schedule_s0_day"], resultDay[0])
			.add_list("PTZ.Ch0.Schedule.S1.day", g_dataArray["ptz_ch0_schedule_s1_day"], resultDay[1])
			.add_list("PTZ.Ch0.Schedule.S2.day", g_dataArray["ptz_ch0_schedule_s2_day"], resultDay[2])
			.add_list("PTZ.Ch0.Schedule.S3.day", g_dataArray["ptz_ch0_schedule_s3_day"], resultDay[3])
			.add_list("PTZ.Ch0.Schedule.S0.time", g_dataArray["ptz_ch0_schedule_s0_time"], $("#ptz_ch0_schedule_s0_time").val() + ":00")
			.add_list("PTZ.Ch0.Schedule.S1.time", g_dataArray["ptz_ch0_schedule_s1_time"], $("#ptz_ch0_schedule_s1_time").val() + ":00")
			.add_list("PTZ.Ch0.Schedule.S2.time", g_dataArray["ptz_ch0_schedule_s2_time"], $("#ptz_ch0_schedule_s2_time").val() + ":00")
			.add_list("PTZ.Ch0.Schedule.S3.time", g_dataArray["ptz_ch0_schedule_s3_time"], $("#ptz_ch0_schedule_s3_time").val() + ":00")
			.add_list("PTZ.Ch0.Schedule.S0.preset", g_dataArray["ptz_ch0_schedule_s0_preset"], preset0)
			.add_list("PTZ.Ch0.Schedule.S1.preset", g_dataArray["ptz_ch0_schedule_s1_preset"], preset1)
			.add_list("PTZ.Ch0.Schedule.S2.preset", g_dataArray["ptz_ch0_schedule_s2_preset"], preset2)
			.add_list("PTZ.Ch0.Schedule.S3.preset", g_dataArray["ptz_ch0_schedule_s3_preset"], preset3);

		var reqQString = "action=update&xmlschema";
		reqQString = QString.get_qstring();
		if(!reqQString) return;

		ViewLoadingSave(true);
		$("#loading_msg").css({
			top: "360px",
			left: "320px"
		});

		var req = new CGIRequest();
		req.SetCallBackFunc(function(xml){
			var ret = CGIResponseCheck(0, xml);
			if(ret != 0) {
				var errormessage = "";
				if(ret != -2) {
					errormessage = "\n" + ret;
				}
				alert(GetMsgLang("0501") + errormessage);
			}

			getDataConfig_UAPI(g_defaultGroup, function(data){
				initDataValue(data);
				mainRun(data);
				ViewLoadingSave(false);
			});
			return;
		});
		req.Request(reqQString);
		
	});
}

function bindMoveMent(id)
{
	$(id).mousedown(function(){
		if(g_resCheck == 1) return;

		var opt = makeOptionStr(id);
		actionMove(opt);
		g_moveState = "START";
		g_resCheck = 1;
	}).mouseup(function(){
		actionStop("cpantiltzoommove=0,0,0");
	}).mouseout(function(){
		actionStop("cpantiltzoommove=0,0,0");
	});
}

function makeOptionStr(id)
{
	var optionStr = "";
	var curSpeed = $("#text_speedbar").val();

	switch(id)
	{
	case "#pt_lu":
		optionStr = "cpantiltzoommove=" + "-" + curSpeed + "," + curSpeed + ",0";
		break;
	case "#pt_cu":
		optionStr = "cpantiltzoommove=" + "0," + curSpeed + ",0";
		break;
	case "#pt_ru":
		optionStr = "cpantiltzoommove=" + curSpeed + "," + curSpeed + ",0";
		break;
	case "#pt_lm":
		optionStr = "cpantiltzoommove=" + "-" + curSpeed + ",0,0";
		break;
	case "#pt_rm":
		optionStr = "cpantiltzoommove=" + curSpeed + ",0,0";
		break;
	case "#pt_ld":
		optionStr = "cpantiltzoommove=" + "-" + curSpeed + "," + "-" + curSpeed + ",0";
		break;
	case "#pt_cd":
		optionStr = "cpantiltzoommove=" + "0," + "-" + curSpeed + ",0";
		break;
	case "#pt_rd":
		optionStr = "cpantiltzoommove=" + curSpeed + "," + "-" + curSpeed + ",0";
		break;
	case "#_zIn":
		optionStr = "cpantiltzoommove=0,0," + curSpeed;
		break;
	case "#_zOut":
		optionStr = "cpantiltzoommove=0,0," + "-" + curSpeed;
		break;
	case "#_fNear":
		optionStr = "cfocusmove=" + curSpeed;
		break;
	case "#_fFar":
		optionStr = "cfocusmove=" + "-" + curSpeed;
		break;

	default:
		optionStr = "cpantiltzoommove=0,0,0";
	}

	return optionStr;
}

function actionMove(opString)
{
	var req = new CGIRequest();
	var reqQString = "";

	reqQString += opString;
	req.SetAddress("/nvc-cgi/ptz/ptz2.fcgi");
	req.SetCallBackFunc(function(xml){
		g_resCheck = 0;
		ViewLoadingSave(false);
		return;
	});
	req.Request(reqQString);
}

function actionStop(opStr)
{
	if(g_moveState == "START")
	{
		var t=0;
		t = setInterval(function(){
			if(g_resCheck == 0)
			{
				actionMove(opStr);
				clearInterval(t);
			}
		}, 10);
		g_moveState = "STOP";
	}
}

function actionPreset(opString)
{
	var req = new CGIRequest();
	var reqQString = "";

	reqQString += opString;
	req.SetAddress("/nvc-cgi/ptz/ptz2.fcgi");
	req.SetCallBackFunc(function(xml){
		getPresetList();
		ViewLoadingSave(false);
		return;
	});
	req.Request(reqQString);
}

function scheduleCheck()
{
	var preSd = 0;
	var nextSd = 0;
	var preSdSum = 0;
	var nextSdSum = 0;
	var sdDay = new Array("mon", "tue", "wed", "thu", "fri", "sat", "sun");
	var sdMax = 4;
	var retValue = 0;

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
			
			// 같은 항목이 있으면 retValue = 1;ptz_ch0_schedule_s2_time
			if(((preSdSum & nextSdSum) != 0) && ($("#ptz_ch0_schedule_s" + preSd + "_time").val() == $("#ptz_ch0_schedule_s" + nextSd + "_time").val()))
			{
				retValue = 1;
				break;
			}
			else 
			{
				retValue = 0;
			}			
		}
		if(retValue == 1) break;
	}

	return retValue;
}

function setTextBlur(selector, minRange, maxRange, setValue, langClassID)
{
	$(selector).blur(function() {
		var nowValue = $(selector).val()-0;
		if(minRange == 0 && nowValue == 0) return;
		if(nowValue < minRange || nowValue > maxRange || nowValue == "" || (!checkStringValidation($(selector).val(), g_defregexp.numberOnly, null, null, false)))
		{
			$(selector).val(setValue).focus();
			$(selector).parent().parent().find(".slider-bar").slider("value", setValue);
			alert(GetMsgLang(langClassID));
		}
	});
}