var g_defaultGroup = "system";

$(function () {
	PreCustomize();
	initEnvironment();
	getDataConfig(g_defaultGroup, function(data){
		initDataValue(data);
		mainRun(data);
	});
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
	setLanguage(parent.g_configData.langPath, setup + maincontents + "ntp", 
				parent.g_langData[parent.g_configData.language]);
}

function mainRun(data)
{
	initSetting(data);
	eventBind(data);
	ContentShow();
	PostCustomize();
}

function initSetting(data)
{
	initFormUI(data);
	limitMaxString("#system_datetime_ntp_s0", 48);
	limitMaxString("#system_datetime_ntp_s1", 48);
	limitMaxString("#system_datetime_ntp_s2", 48);
	limitMaxString("#system_datetime_ntp_s3", 48);
}

function eventBind(data)
{
	ntpTestBind("#btnNtpTest_0", "#system_datetime_ntp_s0");
	ntpTestBind("#btnNtpTest_1", "#system_datetime_ntp_s1");
	ntpTestBind("#btnNtpTest_2", "#system_datetime_ntp_s2");
	ntpTestBind("#btnNtpTest_3", "#system_datetime_ntp_s3");

	$("#btnApply").button().unbind().click(function() {
		var setArray = setDataValue(data);
		var reqQString = "action=update&xmlschema";
		var contentsType = "data";
		QString = makeQString();
		QString.set_action('update').set_schema('xml');

		for(var i=0;i<setArray.length;i++)
			QString.add_list(setArray[i].group, setArray[i].dbValue, setArray[i].formValue);

		reqQString = QString.get_qstring();
		if(!reqQString) return;

		var req = new CGIRequest();
		req.SetAddress("/nvc-cgi/admin/param.cgi?")
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

			getDataConfig(g_defaultGroup, function(data) {
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

function ntpTestBind(btnID, textID)
{
	$(btnID).button().unbind().click(function() {
		ViewLoadingSave(true);
		Disable($("button"));
		$.get("/uapi-cgi/admin/testaction.cgi?type=ntp&server="+$(textID).val(), function(data) {
			parseTestActionResponse(data);
			ViewLoadingSave(false);
			Enable($("button"));
		});
	});
}
