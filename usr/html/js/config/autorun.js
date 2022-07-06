var autorunActionValue = "none";
var autorunTimeValue = 1;
var autorunNumberValue = "";
var autorunPanSpeed = "";
var autorunPanAngle = "";

$(function () {
	PreCustomize();
	initEnvironment();
	mainRun();
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum = ["04110211", "04110215"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "autorun", 
				parent.g_langData[parent.g_configData.language]);
}

function mainRun()
{
	InitForm();
	InitSetting();
	SetRelation();
	EventBind();
	ContentShow();
	PostCustomize();
}

function InitForm()
{
	adjustContentsByBrand();
}

function adjustContentsByBrand()
{
	jqDisplayCtrl(".formAutorunMoveMenu_panning", parent.g_brand.pantilt != g_defbrand.irptz);
	jqDisplayCtrl(".formAutorunMoveMenu_panningInfo", parent.g_brand.pantilt != g_defbrand.irptz);
	jqDisplayCtrl("#autorunTimeIRSpeedPTZ", parent.g_brand.pantilt == g_defbrand.irptz, "inline");
	jqDisplayCtrl("#autorunTimeSpeedType1", parent.g_brand.pantilt != g_defbrand.irptz, "inline");
}

function InitSetting()
{
	GetPresetList();
}

function checkValidAutoRunRange(curTime, timeFormat)
{
	var ret = false;
	var autorunTimeList = [10, 30, 60, 300, 600, 1200, 1800, 2400, 3000, 3600];
	var setTime = curTime;

	if(timeFormat == "min")
		setTime = curTime * 60;

	$.each(autorunTimeList, function(i, val) {
		if(val == setTime) ret = true;
	});

	return ret;
}

function SetRelation()
{
	$("#formAutorunEnable:checkbox").unbind().change(function(){
		var statusFlag = $(this).attr("checked");

		if(statusFlag == false)
		{
			statusFlag = "none";
		}

		actionDisableCheck(statusFlag);
	});

	if(parent.g_brand.pantilt == g_defbrand.irptz)
	{
		Disable($("#autorunTime").val("sec"));

		$("#formAutorunTime:text").blur(function() {
			var isValid = checkValidAutoRunRange($(this).val(), $("#autorunTime").val());

			if(isValid == false)
			{
				alert(GetMsgLang("04110215"));
			}
		});
	}
	else
	{
		$("#formAutorunTime:text").blur(function() {
			var curTimeUnit = $("select#autorunTime").val();
			var inputValTextTime = $("#formAutorunTime:text").val()-0;
			$("#formAutorunTime:text").val(inputValTextTime);

			if(inputValTextTime < 0 || inputValTextTime > 60 || inputValTextTime == "")
			{
				$("#formAutorunTime:text").val(autorunTimeValue).focus();
				alert(GetMsgLang("04110211"));
			}
		});
	}

	$("#formAutorunPanningAngle:text").blur(function() {
		var inputValTextAngle = $("#formAutorunPanningAngle:text").val()-0;
		$("#formAutorunPanningAngle:text").val(inputValTextAngle);

		if(inputValTextAngle < -5 || inputValTextAngle > 185 || inputValTextAngle == "")
		{
			$("#formAutorunPanningAngle:text").val(autorunPanAngle).focus();
			alert(GetMsgLang("04110211"));
		}
	});

	$("#formAutorunPanningSpeed:text").blur(function() {
		var inputValTextSpeed = $("#formAutorunPanningSpeed:text").val()-0;
		$("#formAutorunPanningSpeed:text").val(inputValTextSpeed);

		if(inputValTextSpeed < 20 || inputValTextSpeed > 50 || inputValTextSpeed == "")
		{
			$("#formAutorunPanningSpeed:text").val(autorunPanSpeed).focus();
			alert(GetMsgLang("04110211"));
		}
	});
}


function EventBind()
{
	var Req = new CGIRequest();

	$("#btnApply").button().click(function() {
		var reqQString = "aux=setautorun";
		var setTime = "&autorun.time.value=";
		var setTimeUnit = "&autorun.time.unit=";
		var setAction = "&autorun.action=";
		var setNumber = "&autorun.number=";
		var setAngle = "&autorun.pan.angle=";
		var setSpeed = "&autorun.pan.speed=";

		ViewLoadingSave(true);

		setTime += $("#formAutorunTime").val();
		setTimeUnit += $("#autorunTime").val();

		if($("#formAutorunEnable").attr("checked") == false)
		{
			setAction += "none";
		}
		else
		{
			setAction += $("input[name='formAutorunMoveMenu']:checked:radio").val();
		}

		if($("input[name='formAutorunMoveMenu']:checked:radio").val() == "tour")
		{
			setNumber += $("#selectTouringNumber").val();
		}
		else if($("input[name='formAutorunMoveMenu']:checked:radio").val() == "preset")
		{
			if($("#selecetPresetNumber").val() != "none")
			{
				setNumber += $("#selectPresetNumber").val();
			}
		}
		else
		{
			setNumber += 1;
		}

		setAngle += $("#formAutorunPanningAngle").val();
		setSpeed += $("#formAutorunPanningSpeed").val();

		reqQString += setTime + setAction + setNumber + setAngle + setSpeed + setTimeUnit;
		
		$.get("/nvc-cgi/ptz/ptz2.fcgi?" + reqQString + "&_=" + (new Date()).getTime(), function() {
			ViewLoadingSave(false);
			InitSetting();
		});
	});
}

function GetPresetList()
{
	var presetValue = "";
	var presetCount = "";
	var presetList = "";

	$("#selectPresetNumber").empty();

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
					$("#selectPresetNumber").append("<option value='" + presetValue[i] + "'>" + presetValue[i] + "</option>");
				}
			}
			else
			{
				$("#selectPresetNumber").append("<option value='none'>none</option>");
			}

			// Auto run status 출력
			GetAutoRunStatus();
		}
		else
		{
			$("#selectPresetNumber").append("<option value='none'>none</option>");

			// Auto run status 출력
			GetAutoRunStatus();
		}
	});
}

function GetAutoRunStatus()
{
	$.get("/nvc-cgi/ptz/ptz2.fcgi?aux_query=autorun" + "&_=" + (new Date()).getTime(), function(data) {
		if(data.substring(0,2) != "#4")
		{
			autorunActionValue = data.split("\n")[1].split("=")[1];
			autorunTimeValue = data.split("\n")[2].split("=")[1];
			autorunTimeUnit = data.split("\n")[3].split("=")[1];
			autorunNumberValue = data.split("\n")[4].split("=")[1];
			autorunPanSpeed = data.split("\n")[5].split("=")[1];
			autorunPanAngle = Math.round(data.split("\n")[6].split("=")[1]);

			$("#autorunTime").val(autorunTimeUnit).css("display", "inline-block");

			if(autorunActionValue == "none")
			{
				$("#formAutorunEnable:checkbox").attr("checked", "");
				$("input[name='formAutorunMoveMenu'][value='home']:radio").attr("checked", "checked");
				$("#selectTouringNumber").val(1);
			}
			else
			{
				$("#formAutorunEnable:checkbox").attr("checked", "checked");
				$("input[name='formAutorunMoveMenu'][value='" + autorunActionValue + "']:radio").attr("checked", "checked");
				
				if(autorunActionValue == "tour")
				{
					$("#selectTouringNumber option").each(function(){
						if($(this).val() == autorunNumberValue)
						{
							$("#selectTouringNumber").val(autorunNumberValue);
						}
					});
				}
				else if(autorunActionValue == "preset")
				{
					$("#selectPresetNumber option").each(function(){
						if($(this).val() == autorunNumberValue)
						{
							$("#selectPresetNumber").val(autorunNumberValue);
						}
					});
				}
			}

			$("#formAutorunTime:text").val(autorunTimeValue);
			$("#formAutorunPanningAngle:text").val(autorunPanAngle);
			$("#formAutorunPanningSpeed:text").val(autorunPanSpeed);

			actionDisableCheck(autorunActionValue);
		}
	});

	return;
}

function actionDisableCheck(actionValue)
{
	switch(actionValue)
	{
	case "none":
		Disable($("#formAutorunMoveMenu0"));
		Disable($("#formAutorunMoveMenu1"));
		Disable($("#formAutorunMoveMenu2"));
		Disable($("#formAutorunMoveMenu3"));
		Disable($("#formAutorunPanningAngle"));
		Disable($("#formAutorunPanningSpeed"));
	Disable($("#selectTouringNumber"));
	Disable($("#selectPresetNumber"));
		break;
	case "home":
	case "preset":
	case "tour":
	default:
		Enable($("#formAutorunMoveMenu0"));
		Enable($("#formAutorunMoveMenu1"));
		Enable($("#formAutorunMoveMenu3"));
		Enable($("#formAutorunPanningAngle"));
		Enable($("#formAutorunPanningSpeed"));
	Enable($("#selectTouringNumber"));
		presetDisableCheck();
		break;
	}

	return;
}

function presetDisableCheck()
{
	if($("#selectPresetNumber").val() == "none")
	{
		Disable($("#formAutorunMoveMenu2"));
		Disable($("#selectPresetNumber"));
	}
	else
	{
		Enable($("#formAutorunMoveMenu2"));
		Enable($("#selectPresetNumber"));
	}
}
