$(function () {
	PreCustomize();
	initEnvironment();
	LoadParamJs("NETWORK&EVENT", mainRun);
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum = ["04040719", "0501"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "smtp", 
				parent.g_langData[parent.g_configData.language]);
}

function mainRun()
{
	SetRelation();
	InitSetting();
	EventBind();
	ContentShow();
	PostCustomize();
}

function InitSetting()
{
	var group = "EVENT";
	$("#formSmtpUnitName:text").val(eval(group+ "_NOTIFY_EMAIL_UNITNAME"));
	$("#formSmtpAddr:text").val(eval(group+ "_NOTIFY_EMAIL_FROMEMAIL"));

	var group = "NETWORK";
	$("#formSmtpMailSvr:text").val(eval(group+ "_SMTP_ADDRESS"));
	$("#formSmtpMailPort:text").val(eval(group+ "_SMTP_PORT"));
	if(eval(group + "_SMTP_SSL") == "yes")
	{
		$("#formSmtpEnable:checkbox").attr("checked", "checked");
	}
	else
	{
		$("#formSmtpEnable:checkbox").attr("checked", "");
	}
	if(eval(group + "_SMTP_AUTH") == "yes")
	{
		$("#formSmtpUseauth:checkbox").attr("checked", "checked");
	}
	else
	{
		$("#formSmtpUseauth:checkbox").attr("checked", "");
	}
	$("#formSmtpUserName:text").val(eval(group+ "_SMTP_USER"));
	$("#formSmtpPass").val(eval(group+ "_SMTP_PWD"));
	$("#formSmtpUseauth:checkbox").change();
}

function SetRelation()
{
	// 글자수 제한
	$("#formSmtpUnitName:text").keyup(function(){
		LimitCharac("formSmtpUnitName:text", 40);
	});
	$("#formSmtpAddr:text").keyup(function(){
		LimitCharac("formSmtpAddr:text", 128);
	});
	$("#formSmtpMailSvr:text").keyup(function(){
		LimitCharac("formSmtpMailSvr:text", 128);
	});
	$("#formSmtpUserName:text").keyup(function(){
		LimitCharac("formSmtpUserName:text", 128);
	});
	$("#formSmtpPass:password").keyup(function(){
		LimitCharac("formSmtpPass:password", 32);
	});
	$("#formSmtpSendTest:text").keyup(function(){
		LimitCharac("formSmtpSendTest:text", 48);
	});

	var group = "NETWORK";
	$("#formSmtpMailPort:text").numeric();
	$("#formSmtpMailPort:text").blur(function() {
		var inputValTextPort = $("#formSmtpMailPort:text").val();
		if(inputValTextPort == "")
			return;
		
		inputValTextPort = $("#formSmtpMailPort:text").val()-0;
		$("#formSmtpMailPort:text").val(inputValTextPort);

		if(inputValTextPort < 1 || inputValTextPort >65535)
		{
			$("#formSmtpMailPort:text").val(eval(group+ "_SMTP_PORT")).focus();
			alert(GetMsgLang("04040719"));
		}
	});
		$("#formSmtpUseauth:checkbox").change(function() {
				if($("#formSmtpUseauth:checkbox").attr("checked") == true)
				{
			$("div#formSmtpNamepwd").css('display', 'block');
		}
				else
				{
			$("div#formSmtpNamepwd").css('display', 'none');
				}
		ResizePage(430);
		});
}

function EventBind()
{
	var Req = new CGIRequest();
	$("#btnSendTest").button().click(function() {
		Disable($("#btnSendTest"));
		ViewLoadingSave(true);
		var server = $("#formSmtpMailSvr:text").val();
		var from = $("#formSmtpAddr:text").val();
		var to = $("#formSmtpSendTest:text").val();
		var name = $("#formSmtpUnitName:text").val();
		var port = $("#formSmtpMailPort:text").val();
		var ssl = $("#formSmtpEnable:checked").val()?"true":"false";
		var account = $("#formSmtpUserName:text").val();
		var pwd = $("#formSmtpPass").val();

		var param = "type=email&name="+name+"&server="+server+"&from="+from+"&port="+port+"&to="+to+"&ssl="+ssl;
		if($("#formSmtpUseauth:checked").val())
		{
			if(account)
			{
				param += "&account="+account;
			}
			if(pwd)
			{
				param += "&pwd="+pwd;
			}
		}

		$.get("/uapi-cgi/admin/testaction.cgi?" + param, function(data) {
				parseTestActionResponse(data);
				ViewLoadingSave(false);
				Enable($("#btnSendTest"));
		});
	});

	$("#btnApply").button().click(function() {
		var reqQString = "action=update&xmlschema";
		//$("span#formTestBtnResult").html("");
		
		QString = makeQString();
		QString
			.set_action('update')
			.set_schema('xml')
			.add_list("EVENT.Notify.Email.unitname", EVENT_NOTIFY_EMAIL_UNITNAME, encodeURIComponent($("#formSmtpUnitName:text").val()))
			.add_list("EVENT.Notify.Email.fromemail", EVENT_NOTIFY_EMAIL_FROMEMAIL, encodeURIComponent($("#formSmtpAddr:text").val()))
			.add_list("NETWORK.Smtp.address", NETWORK_SMTP_ADDRESS, encodeURIComponent($("#formSmtpMailSvr:text").val()))
			.add_list("NETWORK.Smtp.port", NETWORK_SMTP_PORT, $("#formSmtpMailPort:text").val())
			.add_list("NETWORK.Smtp.ssl", NETWORK_SMTP_SSL, ($("#formSmtpEnable:checkbox").attr("checked") == true) ? "yes":"no")
			.add_list("NETWORK.Smtp.auth", NETWORK_SMTP_AUTH, ($("#formSmtpUseauth:checkbox").attr("checked") == true) ? "yes":"no");
		
		if($("#formSmtpUseauth:checkbox").attr("checked") == false)
		{
			QString
				.add_list("NETWORK.Smtp.user", NETWORK_SMTP_USER, "")
				.add_list("NETWORK.Smtp.pwd", NETWORK_SMTP_PWD, "");
		}
		else
		{
			QString
				.add_list("NETWORK.Smtp.user", NETWORK_SMTP_USER, encodeURIComponent($("#formSmtpUserName:text").val()))
				.add_list("NETWORK.Smtp.pwd", NETWORK_SMTP_PWD, encodeURIComponent($("#formSmtpPass").val()));
		}
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
			LoadParamJs("NETWORK&EVENT&cache", function() {
				InitSetting();
				ViewLoadingSave(false);
			});

			return;
		});
		Req.Request(reqQString);
	});
}

if (!String.prototype.trim) {
	String.prototype.trim = function() {
		return this.replace(/^\s+|\s+$/g,'');
	}
}
