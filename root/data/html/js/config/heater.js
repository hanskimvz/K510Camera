var g_defaultGroup = "system.heater.control.mode";
$(function () {
	PreCustomize();
	initEnvironment();
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
	var classNum = ["0501"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "heater", 
				parent.g_langData[parent.g_configData.language]);
}

function getStatus()
{
	var req = new CGIRequest();

	req.SetAddress("/status/resource-state.xml");
	req.SetCallBackFunc(function (xml) {
		var temperature =     $("resource[name='temperature']", xml);
		var temp_celsius =    $("item[name='celsius']", temperature).text();
		var temp_fahrenheit = $("item[name='fahrenheit']", temperature).text();
		var temp_dytycycle =  $("item[name='heater-dutycycle']", temperature).text();

		$(".celsius").text(temp_celsius);
		$(".fahrenheit").text(temp_fahrenheit);
		$(".dutycycle").text(temp_dytycycle + "%");

		setTimeout("getStatus()", 5000);
	});

	req.Request();
}

function mainRun(data)
{
	getStatus();
	initSetting(data);
	eventBind(data);
	ContentShow();
	PostCustomize();
}

function initSetting(data)
{
	initFormUI(data);
}

function eventBind(data)
{
	$("#btnApply").button().unbind().click(function() {
		var setArray = setDataValue(data);
		var reqQString = "action=update&xmlschema";
		var contentsType = "data";
		QString = makeQString();
		QString.set_action('update').set_schema('xml');

		for(var i=0;i<setArray.length;i++)
		{
			QString.add_list(setArray[i].group, setArray[i].dbValue, setArray[i].formValue);
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
