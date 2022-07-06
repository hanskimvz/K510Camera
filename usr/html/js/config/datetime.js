var g_defaultGroup = "SYSTEM";
var clock = null;
var chkRefreshInit = 0;

$(function () {
	PreCustomize();
	initEnvironment();
	initConfig();
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum = ["04070228", "04070229", "04070230", "04070231", "0501"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "datetime", 
				parent.g_langData[parent.g_configData.language]);
}

function initConfig()
{
	$.getScript("/uapi-cgi/timezone.cgi?action=list&mode=js", function() {
		var prerule = "";

		$("select#formTzName").empty();

		for (var i = 0; i < List.tzArray.length; i++)
		{
			if(prerule != List.tzArray[i].location)
			{
				$("select#formTzName")
				.append("<option value='" + List.tzArray[i].location + "'>"
						+ List.tzArray[i].desc + "</option>");
			}
			prerule = List.tzArray[i].location;
		}
		LoadParamJs("SYSTEM&cache", mainRun);
	});
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
	var group = g_defaultGroup + "_DATETIME";
	var formatIn = "";

	switch (eval(group + "_DATE_FORMAT"))
	{
	case 'yyyymmdd' :
		formatIn = 'Y/m/d';
		break;
	case 'mmddyyyy' :
		formatIn = 'm/d/Y';
		break;
	case 'ddmmyyyy' :
		formatIn = 'd/m/Y';
		break;
	}
	switch (eval(group + "_TIME_FORMAT"))
	{
	case '24hmnss' :
		formatIn += ' G:i:s';
		break;
	case '12hmnss' :
		formatIn += ' g:i:s A';
		break;
	}

	clearInterval(clock);
	if(chkRefreshInit == 0)
	{
		ReflushDateTime(formatIn);
	}
	else if(chkRefreshInit == 1)
	{
		setTimeout(function(){
			ReflushDateTime(formatIn);
		}, 2000);
	}

	if (clock != null)
	{
		clearInterval(clock);
		clock = null;
	}
	clock = setInterval(function(){
		ReflushDateTime(formatIn);
	},60000);

	chkRefreshInit = 1;
}

function GetPosixRule(tz_name)
{
	for (var i = 0; i < List.tzArray.length; i++)
	{
		if (List.tzArray[i].posixrule == tz_name) {
			return List.tzArray[i].location;
		}
	}
	return tz_name;
}

function InitSetting()
{
	var group = g_defaultGroup + "_DATETIME";
	

	$("#formNtpServer").text(eval(group+ "_NTP_S0"));


	//$("select#formTzName").val(eval(group+ "_TZ_NAME"));
	$("select#formTzName").val(GetPosixRule(eval(group+ "_TZ_NAME")));

	if(eval(group+"_SYNCSOURCE") == "ntp")
	{
		$("#formSyncSource:checkbox").attr("checked", "checked");
	}
	else
	{
		$("#formSyncSource:checkbox").attr("checked", ""); 
	}

	var now = new Date();
	var nMonth = ((now.getMonth()+1)<10) ? '0'+(now.getMonth()+1):(now.getMonth()+1);
	var nDay = (now.getDate()<10) ? '0'+now.getDate():now.getDate();
	var nHour = (now.getHours()<10) ? '0'+now.getHours():now.getHours();
	var nMin = (now.getMinutes()<10) ? '0'+now.getMinutes():now.getMinutes();
	var nSec = (now.getSeconds()<10) ? '0'+now.getSeconds():now.getSeconds();

	$("#formDate:text").val(nMonth + "-" + nDay + "-" + now.getFullYear());
	$("#formTime:text").val(nHour + ":" + nMin + ":" + nSec);

	$("#formDateFormat").val(eval(group+"_DATE_FORMAT"));
	if(eval(group+"_TIME_FORMAT") == "24hmnss")
	{
		$("#formTimehour:checkbox").attr("checked", "checked");
	}
}

function SetRelation()
{
	var initDate = $("#formDate:text").val();
	var initTime = $("#formTime:text").val();

	// 링크이동시 왼쪽 메뉴 이동
	$("#linkNtp").click(function(){
		parent.$("#leftmenu .networkConfContents + div a[href='ntp.html']").click();
		parent.$("#leftmenu .networkConfContents").click();
	});

	// Set manually range
	$("#formDate:text").blur(function(){
		var dateArr = new Array(3);
		dateArr = $("#formDate:text").val().split("-");
		// MM-DD-YYYY
		if(dateArr[0] < 01 || dateArr[0] > 12 || dateArr[0] == "" ||
			dateArr[1] < 01 || dateArr[1] > 31 || dateArr[1] == "" ||
			dateArr[2] < 2000 || dateArr[2] > 2037 || dateArr[2] == "" ||
			dateArr[0].length != 2 || dateArr[1].length != 2 || dateArr[2].length != 4
		)
		{
			$("#formDate:text").val(initDate).focus();
			alert(GetMsgLang("04070228"));
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
			objEv.value=initDate;
		}
	});

	$("#formTime:text").blur(function(){
		var timeArr = new Array(3);
		timeArr = $("#formTime:text").val().split(":");

		// HH:MM:SS
		if(timeArr[0] < 00 || timeArr[0] > 23 || timeArr[0] == "" ||
			timeArr[1] < 00 || timeArr[1] > 59 || timeArr[1] == "" ||
			timeArr[2] < 00 || timeArr[2] > 59 || timeArr[2] == "" ||
			timeArr[0].length != 2 || timeArr[1].length != 2 || timeArr[2].length != 2
			
		)
		{
			$("#formTime:text").val(initTime).focus();
			alert(GetMsgLang("04070228"));
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
}

function ReflushDateTime(formatCheck)
{
	$.getScript("/uapi-cgi/datetime.cgi?action=get&mode=js&_=" + (new Date()).getTime(), function() {
		var sDateObj = new Date(DATETIME_DATE_YEAR, DATETIME_DATE_MONTH-1, DATETIME_DATE_DAY,
						DATETIME_TIME_HOUR, DATETIME_TIME_MINUTE, DATETIME_TIME_SECOND);
		var uDateObj = new Date();
		var diffTime = Math.round(sDateObj.getTime()/1000) - Math.round(uDateObj.getTime()/1000);
		if ($.epiclock("#server_clock")) {
			$.epiclock("#server_clock").destroy();
		}
		if ($.epiclock("#formUserDateTime")) {
			$.epiclock("#formUserDateTime").destroy();
		}

		$("#server_clock").empty().epiclock({
			//mode: $.epiclock.modes.explicit,
			format: formatCheck,
			offset: {seconds: diffTime}
		});
		$("#formUserDateTime").empty().epiclock({
			format: formatCheck
			//offset: {seconds: diffTime}
		});

		delete sDateObj;
		delete uDateObj;

		ViewLoadingSave(false);
	});
}

function removeLoadImg()
{
	$("#loading_msg").hide(100, function() {
		$(this).remove();
	});

	// ViewLoading Message hide 상태에서 button 활성화
	$("button").attr("disabled", "");
	$("input[type='button']").attr("disabled", "");
}

function EventBind()
{
	var Req = new CGIRequest();

	$("#btnSet").button().click(function() {
		if (!confirm(GetMsgLang("04070230")))
		{
			return false;
		}

		var reqQString = "action=set";

		Req.SetAddress("/uapi-cgi/datetime.fcgi");
		Req.SetStartFunc(ViewLoadingSave);

		switch($("input[name='formSyncMethod']:checked:radio").val())
		{
			case "pc":
				var now = new Date();
				reqQString += "&year=" + now.getFullYear();
				reqQString += "&month=" + (now.getMonth()+1);
				reqQString += "&day=" + now.getDate();
				reqQString += "&hour=" + now.getHours();
				reqQString += "&minute=" + now.getMinutes();
				reqQString += "&second=" + now.getSeconds();
				reqQString += "&xmlschema";
				break;
			case "ntp":
				Req.SetAddress("/uapi-cgi/ntpsync.cgi");
				reqQString = "";
				break;
			case "menu":
				var dateArr = new Array(3);
				var timeArr = new Array(3);

				dateArr = $("#formDate:text").val().split("-");
				timeArr = $("#formTime:text").val().split(":");

				reqQString += "&month=" + dateArr[0];
				reqQString += "&day=" + dateArr[1];
				reqQString += "&year=" + dateArr[2];
				reqQString += "&hour=" + timeArr[0];
				reqQString += "&minute=" + timeArr[1];
				reqQString += "&second=" + timeArr[2];
				reqQString += "&xmlschema";
				break;
			default:
				alert(GetMsgLang("04070229"));
				return;
				break;
		}
		$this = $(this);

		Req.SetCallBackFunc(function(xml){
			var ret = CGIResponseCheck(0, xml);
			if(ret != 0) {
				var errormessage = "";
				if(ret != -2) {
					errormessage = "\n" + ret;
				}
				alert(GetMsgLang("0501") + errormessage);
			}
			InitForm();
			ViewLoadingSave(false);
			
			return;
		});

		Req.SetErrorFunc(function(){
			InitForm();
			removeLoadImg();
			ViewLoadingSave(false);
			return;
		});
		Req.Request(reqQString);
		//setTimeout("removeLoadImg()", 5000);
	});

	$("#formTime:text, #formDate:text").click(function() {
		$("input[name='formSyncMethod'][value='menu']:radio").attr("checked", "checked");
	});

	$("#btnApply").button().click(function() {
		var reqQString = "action=update&xmlschema";
		var tzflag = false;
		
		QString = makeQString();
		QString
			.set_action('update')
			.set_schema('xml')
			.add_list("SYSTEM.Datetime.syncsource", SYSTEM_DATETIME_SYNCSOURCE, ($("#formSyncSource:checkbox").attr("checked") == true) ? "ntp":"rtc")
			.add_list("SYSTEM.Datetime.Date.format", SYSTEM_DATETIME_DATE_FORMAT, $("#formDateFormat").val())
			.add_list("SYSTEM.Datetime.Time.format", SYSTEM_DATETIME_TIME_FORMAT, ($("#formTimehour:checkbox").attr("checked") == true) ? "24hmnss":"12hmnss");
		
		if ((SYSTEM_DATETIME_TZ_NAME != $("select#formTzName").val()))
		{
			QString
				.add_list("SYSTEM.Datetime.Tz.name", SYSTEM_DATETIME_TZ_NAME, $("select#formTzName").val());
			tzflag = true;
		}
		
		reqQString = QString.get_qstring();
		if(!reqQString) {
			return;
		}
		
		if (!confirm(GetMsgLang("04070231")))
		{
			return false;
		}

		Req.SetAddress("/uapi-cgi/param.cgi");
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
			if (tzflag == true) {
				$.get("/uapi-cgi/timezone.cgi?action=set&_=" + (new Date()).getTime(), function(){
					LoadParamJs(g_defaultGroup + ".DATETIME", function(){
						InitForm();
						InitSetting();
						ViewLoadingSave(false);
					});
				});
			}
			else
			{
				LoadParamJs(g_defaultGroup + ".DATETIME", function(){
					InitForm();
					InitSetting();
					ViewLoadingSave(false);
				});
			}
			return;
		});
		Req.Request(reqQString);
	});
}
