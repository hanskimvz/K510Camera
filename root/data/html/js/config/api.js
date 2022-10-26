var OnvifGroup = "ONVIF";
var GenetecGroup = "GENETEC";

$(function () {
	PreCustomize();
	initEnvironment();
	initBrand();
	LoadParamJs("ONVIF&GENETEC", mainRun);
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum = ["0501"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "api", 
				parent.g_langData[parent.g_configData.language]);
}

function initBrand()
{
	jqDisplayCtrl(".profileGContents", parent.g_support.profileG == true);
}

function mainRun()
{
	InitSetting();
	EventBind();
	ContentShow();
	PostCustomize();
}

function InitSetting()
{
	var groupOnvif = OnvifGroup;
	var groupGenetec = GenetecGroup;

	if(eval(groupGenetec+"_ENABLE") == "yes")
	{
		$("#formApiEnable_genetec:checkbox").attr("checked", "checked");
	}
	else
	{
		$("#formApiEnable_genetec:checkbox").attr("checked", "");
	}
	
	if(eval(groupOnvif+"_ENABLE") == "yes")
	{
		$("#formApiEnable_onvif:checkbox").attr("checked", "checked");
	}
	else
	{
		$("#formApiEnable_onvif:checkbox").attr("checked", "");
	}
	
	if(eval(groupOnvif+"_AUTHENTICATION_ENABLE") == "yes")
	{
		$("#formApiEnable_authentication:checkbox").attr("checked", "checked");
	}
	else
	{
		$("#formApiEnable_authentication:checkbox").attr("checked", "");
	}

	if(eval(groupOnvif+"_REPLAYATTACKPROTECTION_ENABLE") == "yes")
	{
		$("#replayAttackProtecion:checkbox").attr("checked", "checked");
	}
	else
	{
		$("#replayAttackProtecion:checkbox").attr("checked", "");
	}

	$("#profileG:checkbox").attr("checked", (eval(groupOnvif+"_PROFILEG_ENABLE") == "yes") ? "checked" : "");

	var protocol = window.location.protocol;
	var port = window.location.port;

	if(protocol == "http:")
	{
		if(window.location.port == "" || window.location.port == 80)
			port = 80;
		else
			port = window.location.port;
	}
	else if(protocol == "https:")
	{
		if(window.location.port == "" || window.location.port == 443)
			port = 443;
		else
			port = window.location.port;
	}

	var host = window.location.hostname;
	if(browserCheck() == "msie" && isIPV6() == true)
	{
		if($.browser.version.substring(0, 2) == "8." ||
				$.browser.version.substring(0, 2) == "9.")
		{
			host = "[" + host + "]";
		}
	}

	var onvif_address = protocol + "//" + host + ":" + port + "/onvif/device_service";
	$("#formApiOnvifaddr").text(onvif_address);
	$("#formApiEnable_onvif:checkbox").change();
}

function EventBind()
{
	var Req = new CGIRequest();

	$("#btnApply").button().click(function() {
		var reqQString = "action=update&xmlschema";

		QString = makeQString();
		QString
			.set_action('update')
			.set_schema('xml')
			.add_list("GENETEC.enable", GENETEC_ENABLE, ($("#formApiEnable_genetec:checkbox").attr("checked") == true) ? "yes":"no")
			.add_list("ONVIF.enable", ONVIF_ENABLE, ($("#formApiEnable_onvif:checkbox").attr("checked") == true) ? "yes":"no")
			.add_list("ONVIF.Authentication.enable", ONVIF_AUTHENTICATION_ENABLE, ($("#formApiEnable_authentication:checkbox").attr("checked") == true) ? "yes":"no")
			.add_list("ONVIF.Replayattackprotection.enable", ONVIF_REPLAYATTACKPROTECTION_ENABLE, ($("#replayAttackProtecion:checkbox").attr("checked") == true) ? "yes":"no")
			.add_list("ONVIF.Profileg.enable", ONVIF_PROFILEG_ENABLE, ($("#profileG:checkbox").attr("checked") == true) ? "yes":"no");
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
			LoadParamJs("ONVIF&GENETEC&cache", function() {
				InitSetting();
				ViewLoadingSave(false);
			});

			return;
		});
		Req.Request(reqQString);
	});

	$("#formApiEnable_onvif:checkbox").change(function() {
		if($("#formApiEnable_onvif:checkbox").attr("checked") == true)
		{
			$(".onvifInner").css('display', 'block');
		}
		else
		{
			$(".onvifInner").css('display', 'none');
		}
	});
	$("#formApiEnable_onvif:checkbox").change();
}