var g_defaultGroup = "network.rtmp";
$(function () {
	PreCustomize();
	initEnvironment();
	LoadParamJs("NETWORK");
	getDataConfig_UAPI(g_defaultGroup, function(data){
		initDataValue(data);
		mainRun(data);
	});
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
	$("button").button();
}

function initLanguage()
{
	var classNum = ["04041411", "04041412", "0501"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "rtmp", 
				parent.g_langData[parent.g_configData.language]);
}

function mainRun(data)
{
	initSetting(data);
	setRelation();
	eventBind(data);
	ContentShow();
	PostCustomize();
}

function setRelation()
{
	$("#network_rtmp_st0_publish_enable").change(function() {
		$(".firstPublishSub").css('display', $(this).attr("checked") ? "block" : "none");
		ResizePage();
	});
	$("#network_rtmp_st0_publish_enable").change();

	$("#network_rtmp_st1_publish_enable").change(function() {
		$(".secondPublishSub").css('display', $(this).attr("checked") ? "block" : "none");
		ResizePage();
	});
	$("#network_rtmp_st1_publish_enable").change();
}

function initSetting(data)
{
	initFormUI(data);

	$("#hostName_st0, #hostName_st1").text(window.location.hostname);
	$("#port_st0, #port_st1").text(g_dataArray["network_rtmp_port"]);
	$("#name_st0").text(g_dataArray["network_rtmp_st0_appname"]);
	$("#instance_st0").text(g_dataArray["network_rtmp_st0_appinstance"]);
	$("#name_st1").text(g_dataArray["network_rtmp_st1_appname"]);
	$("#instance_st1").text(g_dataArray["network_rtmp_st1_appinstance"]);
	$("#network_rtmp_st0_publish_url:text").val(eval("NETWORK_RTMP_ST0_PUBLISH_URL"));
	$("#network_rtmp_st1_publish_url:text").val(eval("NETWORK_RTMP_ST1_PUBLISH_URL"));
}

function eventBind(data)
{
	$("#btnApply").button().unbind().click(function() {
		if(!(checkStringValidation($("#network_rtmp_st0_appname").val(), g_defregexp.englishNumber, null, 64, false)))
		{
			alert(GetMsgLang("04041411"));
			return false;
		}
		else if(!(checkStringValidation($("#network_rtmp_st0_appinstance").val(), g_defregexp.englishNumber, null, 64, false)))
		{
			alert(GetMsgLang("04041412"));
			return false;
		}
		else if(!(checkStringValidation($("#network_rtmp_st1_appname").val(), g_defregexp.englishNumber, null, 64, false)))
		{
			alert(GetMsgLang("04041411"));
			return false;
		}
		else if(!(checkStringValidation($("#network_rtmp_st1_appinstance").val(), g_defregexp.englishNumber, null, 64, false)))
		{
			alert(GetMsgLang("04041412"));
			return false;
		}
		
		var setArray = setDataValue(data);
		var reqQString = "action=update&xmlschema";
		var contentsType = "data";
		QString = makeQString();
		QString.set_action('update').set_schema('xml');

		for(var i=0;i<setArray.length;i++)
		{
			QString.add_list(setArray[i].group, setArray[i].dbValue, encodeURIComponent(setArray[i].formValue));
		}

		reqQString = QString.get_qstring();
		if(!reqQString) return;

		var req = new CGIRequest();
		req.SetContentsType(contentsType);
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
			LoadParamJs("NETWORK");
			getDataConfig_UAPI(g_defaultGroup, function(data) {
				initDataValue(data);
				initSetting(data);
				eventBind(data);
				ViewLoadingSave(false);
			});

			return;
		});
		req.Request(reqQString);
	});
}
