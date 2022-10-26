
var g_defaultGroup = "NETWORK.Wsdiscovery.enable";

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
	var classNum = ["0501"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "wsdiscovery", 
				parent.g_langData[parent.g_configData.language]);
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
	$("#wsDiscoveryEnable:checkbox").attr("checked", NETWORK_WSDISCOVERY_ENABLE == "yes" ? "checked" : "");
}

function EventBind()
{
	$("#btnApply").button().click(function() {
		var req = new CGIRequest();

		var qstr = makeQString();
		qstr
			.set_action('update')
			.set_schema('xml')
			.add_list("NETWORK.Wsdiscovery.enable", NETWORK_WSDISCOVERY_ENABLE, ($("#wsDiscoveryEnable:checkbox").attr("checked") == true) ? "yes":"no");
		var reqQuery = qstr.get_qstring();
		if(!reqQuery) {
			return;
		}

		req.SetStartFunc(ViewLoadingSave);
		req.SetCallBackFunc(function(xml){
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
		req.Request(reqQuery);
	});
}
