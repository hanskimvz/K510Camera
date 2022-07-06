var g_defaultGroup = "NETLOSS";

$(function () {
	PreCustomize();
	initEnvironment();
	LoadParamJs(g_defaultGroup, Run);
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum = ["0501", "04031211", "04031212"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "netloss", 
				parent.g_langData[parent.g_configData.language]);
}

function Run()
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
	Disable($("button"));
	$("#formPingResponseInterval:text").numeric();

	$("#sliderPingResponseInterval").each(function(index, element) {
		var $obj = $(this).parent().parent().find("input[type='text']");
		$(this).slider({
				range: "min",
				min: 5,
				max: 60,
				slide: function(event, ui) {
						$obj.val(ui.value);
				}
		})
	});	 


	if (parent.g_configData.langPath == "/language/Arabic.xml")
	{
		$(".slider-bar").slider({isRTL: true});
	}
}

function InitSetting()
{
	var group = g_defaultGroup + "_DETECT";
	if(eval(group+"_ETHLINK_ENABLE") == "yes")
	{
		$("#formEthlinkConnectionEnable:checkbox").attr("checked", "checked");
	}
	else
	{
		$("#formEthlinkConnectionEnable:checkbox").attr("checked", "");
	}

	 if(eval(group+"_PING_ENABLE") == "yes")
	{
		$("#formPingResponseEnable:checkbox").attr("checked", "checked");
	}
	else
	{
		$("#formPingResponseEnable:checkbox").attr("checked", "");
	}
	
	$("#formPingResponseInterval:text").val(eval(group + "_PING_INTERVAL"));
	$("#formPingResponseInterval:text").parent().parent().find(".slider-bar").slider("value", eval(group + "_PING_INTERVAL"));

	$("#formHostAddr:text").val(eval(group + "_PING_ADDRESS"));
}

function SetRelation()
{
	var group = g_defaultGroup + "_DETECT";

	//ping response
	// Text box range of number
	$("#formPingResponseInterval:text").blur(function() {
		var inputValTextInterval = $("#formPingResponseInterval:text").val();
		
		if(inputValTextInterval < 5 || inputValTextInterval > 60 || inputValTextInterval == "")
		{
			$("#formPingResponseInterval:text").val(eval(group+ "_PING_INTERVAL")).focus();
			$("#sliderHeartBeatInterval").slider("value", eval(group+ "_PING_INTERVAL"));
			alert(GetMsgLang("04031211"));
		}
	});
	// Text box, Slider-bar sync.
	$("#formPingResponseInterval:text").keyup(function() {
		$("#sliderPingResponseInterval").slider("value", $("#formPingResponseInterval:text").val());
	});

}

function EventBind()
{
	Enable($("button"));

	var Req = new CGIRequest();
	$("#btnApply").button().click(function() {
	if(!(checkStringValidation($("#formHostAddr:text").val(), g_defregexp.ipv4, null, 128, true)
		||checkStringValidation($("#formHostAddr:text").val(), g_defregexp.domain, null, 128, true)))
	{
		alert(GetMsgLang("04031212"));
		return;
	}
		
		var reqQString = "action=update&xmlschema";
		QString = makeQString();
		QString
			.set_action('update')
			.set_schema('xml')
			.add_list("NETLOSS.Detect.Ethlink.enable", NETLOSS_DETECT_ETHLINK_ENABLE, ($("#formEthlinkConnectionEnable:checkbox").attr("checked") == true) ? "yes":"no")
			.add_list("NETLOSS.Detect.Ping.enable", NETLOSS_DETECT_PING_ENABLE,	($("#formPingResponseEnable:checkbox").attr("checked") == true) ? "yes":"no")
			.add_list("NETLOSS.Detect.Ping.interval", NETLOSS_DETECT_PING_INTERVAL, encodeURIComponent($("#formPingResponseInterval:text").val()))
			.add_list("NETLOSS.Detect.Ping.address", NETLOSS_DETECT_PING_ADDRESS, encodeURIComponent($("#formHostAddr:text").val()));
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

			_debug("update - " + reqQString);
			LoadParamJs(g_defaultGroup + "&cache", function() {
				InitSetting();
				ViewLoadingSave(false);
			});

			return;
		});

		_debug("start" + reqQString);
		Req.Request(reqQString);
	});
}