var g_defaultGroup = "EVENT";
var selectIdx = "";

$(function () {
	PreCustomize();
	initEnvironment();
	LoadParamJs(g_defaultGroup, Load);
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum = ["04030811", "0501"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "multicastnotification", 
				parent.g_langData[parent.g_configData.language]);
}

function Load()
{
	Disable($("button"));
	InitSetting();
	SetRelation();
	EventBind();
	ContentShow();
	PostCustomize();
}

function InitSetting()
{
	$("#formMulticastPort:text").blur(function() {
			var inputValTextMulticastPort = $("#formMulticastPort:text").val()-0;
			$("#formMulticastPort:text").val(inputValTextMulticastPort);
		if(inputValTextMulticastPort < 1 || inputValTextMulticastPort > 65535 || inputValTextMulticastPort == "")
		{
			$("#formMulticastPort:text").val(eval(g_defaultGroup+ "_NOTIFY_MULTICAST_PORT")).focus();
			alert(GetMsgLang("04030811"));
		}
	});
	$("#formMulticastTtl:text").blur(function() {
			var inputValTextTtlPort = $("#formMulticastTtl:text").val()-0;
			$("#formMulticastTtl:text").val(inputValTextTtlPort);
		if(inputValTextTtlPort < 1 || inputValTextTtlPort > 255 || inputValTextTtlPort == "")
		{
			$("#formMulticastTtl:text").val(eval(g_defaultGroup+ "_NOTIFY_MULTICAST_TTL")).focus();
			alert(GetMsgLang("04030811"));
		}
	});
	$("#formMulticastAddr:text").val(eval(g_defaultGroup + "_NOTIFY_MULTICAST_ADDRESS"));
	$("#formMulticastPort:text").val(eval(g_defaultGroup+ "_NOTIFY_MULTICAST_PORT"));
	$("#formMulticastTtl:text").val(eval(g_defaultGroup+ "_NOTIFY_MULTICAST_TTL"));
}

function SetRelation()
{
	$("#formMulticastPort:text").numeric();
	$("#formMulticastTtl:text").numeric();
}

function EventBind()
{
	Enable($("button"));
	var Req = new CGIRequest();
	if ($("#formMulticastPort:text").val() < 1 || $("#formMulticastPort:text").val() > 65535 || $("#formMulticastPort:text").val() == "") return;
	if ($("#formMulticastTtl:text").val() < 1 || $("#formMulticastTtl:text").val() > 255 || $("#formMulticastTtl:text").val() == "") return;

	$("#btnApply").button().click(function() {
		var reqQString = "action=update&xmlschema";

		QString = makeQString();
		QString
			.set_action('update')
			.set_schema('xml')
			.add_list("EVENT.Notify.Multicast.address", EVENT_NOTIFY_MULTICAST_ADDRESS, encodeURIComponent($("#formMulticastAddr:text").val()))
			.add_list("EVENT.Notify.Multicast.port", EVENT_NOTIFY_MULTICAST_PORT, encodeURIComponent($("#formMulticastPort:text").val()))
			.add_list("EVENT.Notify.Multicast.ttl", EVENT_NOTIFY_MULTICAST_TTL, encodeURIComponent($("#formMulticastTtl:text").val()));
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