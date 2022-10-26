var g_defaultGroup = "HOST";

$(function () {
	PreCustomize();
	initEnvironment();
	LoadParamJs(g_defaultGroup, mainRun);
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum = ["0501", "04041212"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "host", 
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
}

function InitForm()
{
	$("button").button();
	$("#formURL:text").ipaddress();
	$("#IPAddress .ip_octet").css("border", "0px");
	$("#formPort:text").numeric();
	$("#formInterval:text").numeric();
}

function SetRelation()
{
	$("#formPort:text").blur(function() {
		var inputValTextPort = $("#formPort:text").val()-0;
		$("#formPort:text").val(inputValTextPort);
		if(inputValTextPort < 1 || inputValTextPort >65535 || inputValTextPort == "")
		{
			$("#formPort:text").val(eval(g_defaultGroup + "_PORT")).focus();
			alert(GetMsgLang("04041212"));
		}
	});
	$("#formInterval:text").blur(function() {
		var inputValTextInterval = $("#formInterval:text").val()-0;
		$("#formInterval:text").val(inputValTextInterval);
		if(inputValTextInterval < 1 || inputValTextInterval >1440 || inputValTextInterval == "")
		{
			$("#formInterval:text").val(eval(g_defaultGroup + "_UPDATEINTERVAL")).focus();
			alert(GetMsgLang("04041212"));
		}
	});
}

function InitSetting()
{
	if(eval(g_defaultGroup+"_ENABLE") == "yes")
	{
		$("#formHostEnable:checkbox").attr("checked", "checked");
	}
	else
	{
		$("#formHostEnable:checkbox").attr("checked", "");
	}

	var fullip = eval(g_defaultGroup + "_ADDRESS");
	if(fullip == "")
	{
		fullip = "...";
	}
	var szIP = fullip.split(".");
	$("#IPAddress .ip_octet:eq(0)").val(szIP[0]);
	$("#IPAddress .ip_octet:eq(1)").val(szIP[1]);
	$("#IPAddress .ip_octet:eq(2)").val(szIP[2]);
	$("#IPAddress .ip_octet:eq(3)").val(szIP[3]);

	$("#formPort:text").val(eval(g_defaultGroup + "_PORT"));

	$("#formInterval:text").val(eval(g_defaultGroup + "_UPDATEINTERVAL"));
}

function EventBind()
{
	var Req = new CGIRequest();

	$("#btnApply").button().click(function() {
		var reqQString = "action=update&xmlschema";
		var addressValue = $("#IPAddress .ip_octet:eq(0)").val() +"."+ 
							$("#IPAddress .ip_octet:eq(1)").val() +"."+ 
							$("#IPAddress .ip_octet:eq(2)").val() +"."+ 
							$("#IPAddress .ip_octet:eq(3)").val();

		if(addressValue == "...")
		{
			addressValue = "";
		}

		QString = makeQString();
		QString
			.set_action('update')
			.set_schema('xml')
			.add_list("HOST.enable", HOST_ENABLE, ($("#formHostEnable:checkbox").attr("checked") == true) ? "yes":"no")
			.add_list("HOST.address", HOST_ADDRESS, encodeURIComponent(addressValue))
			.add_list("HOST.port", HOST_PORT, encodeURIComponent($("#formPort:text").val()))
			.add_list("HOST.updateinterval", HOST_UPDATEINTERVAL, encodeURIComponent($("#formInterval:text").val()));
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

			LoadParamJs(g_defaultGroup, function() {
				InitSetting();
				ViewLoadingSave(false);
			});
			return;
		});
		Req.Request(reqQString);
	});
}