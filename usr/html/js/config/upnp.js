var g_defaultGroup = "NETWORK";

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
	setLanguage(parent.g_configData.langPath, setup + maincontents + "upnp", 
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
	$("#formUpnpFriName:text").keyup(function(){
		LimitCharac("formUpnpFriName:text", 32);
	});

	var group = g_defaultGroup;

	if(eval(group+"_UPNP_ENABLE") == "yes")
	{
		$("#formUpnpEnable:checkbox").attr("checked", "checked");
	}
	else
	{
		$("#formUpnpEnable:checkbox").attr("checked", "");
	}

	$("#formUpnpFriName:text").val(eval(group+ "_UPNP_FRIENDLYNAME"));
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
			.add_list("NETWORK.Upnp.enable", NETWORK_UPNP_ENABLE, ($("#formUpnpEnable:checkbox").attr("checked") == true) ? "yes":"no")
			.add_list("NETWORK.Upnp.friendlyname", NETWORK_UPNP_FRIENDLYNAME, encodeURIComponent($("#formUpnpFriName:text").val()));
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