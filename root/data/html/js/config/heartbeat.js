var g_defaultGroup = "HEARTBEAT";

$(function () {
	PreCustomize();
	initEnvironment();
	LoadParamJs("HEARTBEAT", Run);
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum = ["04030912", "0501"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "heartbeat", 
				parent.g_langData[parent.g_configData.language]);
}

function Run()
{
	InitForm();
	InitSetting();
	EventBind();
	ContentShow();
	PostCustomize();
}

function InitForm()
{
	var group = g_defaultGroup;

	$("#sliderHeartBeatInterval").each(function(index, element) {
		var $obj = $(this).parent().parent().find("input[type='text']");
		$(this).slider({
			range: "min",
			min: 1,
			max: 300,
			slide: function(event, ui) {
				$obj.val(ui.value);
			}
		})
	});
	// Text box 숫자범위
	$("#formHeartBeatInterval:text").blur(function() {
		var inputValTextInterval = $("#formHeartBeatInterval:text").val();
		
		if(inputValTextInterval < 1 || inputValTextInterval > 300 || inputValTextInterval == "")
		{
			$("#formHeartBeatInterval:text").val(eval(group+ "_INTERVAL")).focus();
			$("#sliderHeartBeatInterval").slider("value", eval(group+ "_INTERVAL"));
			alert(GetMsgLang("04030912"));
		}
	});
	// Text box, Slider-bar 동기화
	$("#formHeartBeatInterval:text").keyup(function() {
			$("#sliderHeartBeatInterval").slider("value", $("#formHeartBeatInterval:text").val());
	});
	if (parent.g_configData.langPath == "/language/Arabic.xml")
	{
		$(".slider-bar").slider({isRTL: true});
	}
}

function InitSetting()
{
	var group = g_defaultGroup;
	
	$("#formHeartBeatInterval:text").numeric();

	if(eval(group+"_ENABLE") == "yes")
	{
		$("#formHeartBeatEnable:checkbox").attr("checked", "checked");
	}
	else
	{
		$("#formHeartBeatEnable:checkbox").attr("checked", "");
	}
	
	$("#formHeartBeatInterval:text").val(eval(group + "_INTERVAL"));
	$("#formHeartBeatInterval:text").parent().parent().find(".slider-bar").slider("value", eval(group + "_INTERVAL"));
	
	if(eval(group+"_TCP_ENABLE") == "yes")
	{
		$("#formHeartBeatServer:checkbox").attr("checked", "checked");
	}
	else
	{
		$("#formHeartBeatServer:checkbox").attr("checked", "");
	}
	
	if(eval(group+"_TCPPUSH_ENABLE") == "yes")
	{
		$("#formHeartBeatNotification:checkbox").attr("checked", "checked");
	}
	else
	{
		$("#formHeartBeatNotification:checkbox").attr("checked", "");
	}
	
	if(eval(group+"_MULTICAST_ENABLE") == "yes")
	{
		$("#formHeartBeatMulticast:checkbox").attr("checked", "checked");
	}
	else
	{
		$("#formHeartBeatMulticast:checkbox").attr("checked", "");
	}
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
			.add_list("HEARTBEAT.enable", HEARTBEAT_ENABLE, ($("#formHeartBeatEnable:checkbox").attr("checked") == true) ? "yes":"no")
			.add_list("HEARTBEAT.interval", HEARTBEAT_INTERVAL, $("#formHeartBeatInterval:text").val())
			.add_list("HEARTBEAT.Tcp.enable", HEARTBEAT_TCP_ENABLE, ($("#formHeartBeatServer:checkbox").attr("checked") == true) ? "yes":"no")
			.add_list("HEARTBEAT.Tcppush.enable", HEARTBEAT_TCPPUSH_ENABLE, ($("#formHeartBeatNotification:checkbox").attr("checked") == true) ? "yes":"no")
			.add_list("HEARTBEAT.Multicast.enable", HEARTBEAT_MULTICAST_ENABLE, ($("#formHeartBeatMulticast:checkbox").attr("checked") == true) ? "yes":"no");
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