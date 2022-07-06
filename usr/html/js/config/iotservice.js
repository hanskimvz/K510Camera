var g_defaultGroup = "IOT&SYSTEM&NETWORK"; // param.cgi node group
var IotStatusTimer = null;

$(function () {
	PreCustomize();
	initEnvironment();
	$.getScript("/uapi-cgi/timezone.cgi?action=list&mode=js", function() {
		var prerule = "";
		$("select#iotServiceTzList").empty();
		for (var i = 0; i < List.tzArray.length; i++)
		{
			if(prerule != List.tzArray[i].location)
			{
				$("select#iotServiceTzList")
				.append("<option value='" + List.tzArray[i].location + "'>"
						+ List.tzArray[i].desc + "</option>");
			}
			prerule = List.tzArray[i].location;
		}
		LoadParamJs(g_defaultGroup, mainRun);
	});
});

$( window ).unload(function() {
  StopStatusLoop();
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum = ["04041525", "04041524", "0501"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "iot", 
				parent.g_langData[parent.g_configData.language]);
}

function mainRun()
{
	InitForm();
	SetRelation();
	InitSetting();
	EventBind();
	ContentShow();
	PostCustomize();
	StartStatusLoop();
}

function UpdateStatus()
{
	LoadParamJs(g_defaultGroup, UpdateConnectionStatus);
	IotStatusTimer = setTimeout(UpdateStatus,3000)
}

function StartStatusLoop()
{
	if($("#formIoTEnable:checkbox").attr("checked")) {
		if (!IotStatusTimer)
			UpdateStatus()
	} else {
		StopStatusLoop();
	}
}

function StopStatusLoop()
{
	if(IotStatusTimer) {
		clearTimeout(IotStatusTimer);
		IotStatusTimer=null;
	}
}

function InitForm()
{
	$("button").button();
	$("#formURL:text").keyup(function(){
		LimitCharac("formURL:text", 62);
	});
	$("#formPort:text").numeric();
	Disable($("#formURL"));
	Disable($("#formPort"));
}

function SetRelation()
{
	$("#formPort:text").blur(function() {
		var inputValTextPort = $("#formPort:text").val()-0;
		$("#formPort:text").val(inputValTextPort);
		if(inputValTextPort < 1 || inputValTextPort >65535 || inputValTextPort == "")
		{
			$("#formPort:text").val(IOT_PORT).focus();
			alert(GetMsgLang("04041525"));
		}
	});
}

function UpdateConnectionStatus()
{
	// status file : "/var/info/status/iot_status"
	var status = IOT_STATUS;
	var st_connecting = $("#st_connecting");
	var st_failure = $("#st_failure");
	var st_success = $("#st_success");
	var st_none = $("#st_none");
	st_connecting.hide();
	st_failure.hide();
	st_success.hide();
	st_none.hide();
	if(status == "connecting")
		st_connecting.show();
	else if(status == "failure")
		st_failure.show();
	else if(status == "success")
		st_success.show();
	else {
		st_none.text(status);
		st_none.show();
	}
}

function InitSetting()
{
	var flag = (IOT_ENABLE == "yes") ? "checked":"";
	$("#formIoTEnable:checkbox").attr("checked", flag);
	$("#formURL:text").val(IOT_ADDRESS);
	$("#formPort:text").val(IOT_PORT);
	$("select#iotServiceTzList").val(GetPosixRule(SYSTEM_DATETIME_TZ_NAME));

	if(flag) {
		$("#formConnectionStatus").show();
		UpdateConnectionStatus();
	} else {
		$("#formConnectionStatus").hide();
	}
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

function EventBind()
{
	var req = new CGIRequest();

	$("#btnApply").button().click(function() {
		var tzFormValue = $("select#iotServiceTzList").val();
		var tzFormText  = $("select#iotServiceTzList option[value='" + tzFormValue + "'").text();
		var enableIOT = $("#formIoTEnable:checkbox").attr("checked");

		if(enableIOT == true)
		{
			if (!confirm(GetMsgLang("04041509") + tzFormText + "\n" + GetMsgLang("04041524")))
			{
				return false;
			}
		}

		var reqQString = "action=update&xmlschema";
		var tzFlag = false;
		var ntpSyncFlag = false;

		QString = makeQString();
		QString
			.set_action('update')
			.set_schema('xml')
			.add_list("IOT.enable", IOT_ENABLE, (enableIOT === true) ? "yes":"no")
			.add_list("IOT.address", IOT_ADDRESS, encodeURIComponent($("#formURL:text").val()))
			.add_list("IOT.port", IOT_PORT, encodeURIComponent($("#formPort:text").val()));

			if(SYSTEM_DATETIME_TZ_NAME != tzFormValue)
			{
				QString
					.add_list("SYSTEM.Datetime.Tz.name", SYSTEM_DATETIME_TZ_NAME, tzFormValue);
				tzFlag = true;
			}

			if(enableIOT == true)
			{
				if(isNTPSyncSourceCheck(SYSTEM_DATETIME_SYNCSOURCE))
				{
					QString
						.add_list("SYSTEM.Datetime.syncsource", null, "ntp");
					ntpSyncFlag = true;
				}

				if(isNTPListCheck(SYSTEM_DATETIME_NTP_S0, SYSTEM_DATETIME_NTP_S1, SYSTEM_DATETIME_NTP_S2, SYSTEM_DATETIME_NTP_S3))
				{
					QString
						.add_list("SYSTEM.Datetime.Ntp.s0", null, "time.windows.com")
						.add_list("SYSTEM.Datetime.Ntp.s1", null, "clock.isc.org")
						.add_list("SYSTEM.Datetime.Ntp.s2", null, "ntp.shoa.cl")
						.add_list("SYSTEM.Datetime.Ntp.s3", null, "time.bora.net");
				}

				if(isDNSCheck(NETWORK_DNS_PREFERRED, NETWORK_DNS_ALTERNATE0))
				{
					QString
						.add_list("NETWORK.Dns.preferred", null, "8.8.8.8");
				}
			}

		reqQString = QString.get_qstring();
		if(!reqQString) return;

		req.SetStartFunc(ViewLoadingSave);
		req.SetCallBackFunc(function(xml){
			var ret = CGIResponseCheck(0, xml);
			if(ret !== 0) {
				var errormessage = "";
				if(ret !== -2) {
					errormessage = "\n" + ret;
				}
				alert(GetMsgLang("0501") + errormessage);
			}

			LoadParamJs(g_defaultGroup, function() {
				if(tzFlag == true)
				{
					$.get("/uapi-cgi/timezone.cgi?action=set&_=" + (new Date()).getTime());
				}

				if(ntpSyncFlag == true)
				{
					$.get("/uapi-cgi/ntpsync.cgi?_=" + (new Date()).getTime(), function(){
						ViewLoadingSave(false);
					});
				}
				else
				{
					ViewLoadingSave(false);
				}

				InitSetting();
				StartStatusLoop();
			});

			return;
		});
		req.Request(reqQString);
	});

	$(".linkDateTime").click(function(){
		parent.$("#leftmenu .maintenanceContents + div a[href='datetime.html']").click();
		parent.$(".maintenanceContents a").click();
	});

	$(".linkNTP").click(function(){
		parent.$("#leftmenu .networkConfContents + div a[href='ntp.html']").click();
	});

	$(".linkTcpIp").click(function(){
		parent.$("#leftmenu .networkConfContents + div a[href='tcpip.html']").click();
	});
}

function isNTPSyncSourceCheck(syncSource)
{
	if(syncSource != "ntp") 
		return true;
	else
		return false;
}

function isNTPListCheck(list1, list2, list3, list4)
{
	var isSend = false;

	if(list1 == "" && list2 == "" && list3 == "" && list4 == "")
		isSend = true;

	return isSend;
}

function isDNSCheck(dns1, dns2)
{
	var isSend = false;

	if(dns1 == "" && dns2 == "")
		isSend = true;

	return isSend;
}
