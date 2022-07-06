
var DefaultGroup = "UART";

$(function () {
//    LoadParamJs(DefaultGroup, Run);
	Run();
    ChangeThemes($.cookie("themes"));
});

function testPage()
{
	return true;
}

function Run()
{
	_debug("start");

	PreCustomize();
	EvenOdd();
	InitSetting();
	EventBind();
	ContentShow();
	PostCustomize();

	_debug("stop");
}

function InitSetting()
{
	var group = DefaultGroup;

	$("select#formSerialportBuadRate").val(eval(group+"_CH0_BAUDRATE"));
	$("input[name='formSerialportData'][value='" + eval(group + "_CH0_DATABITS") + "']:radio").attr("checked", "checked");
	$("input[name='formSerialportParity'][value='" + eval(group + "_CH0_PARITY") + "']:radio").attr("checked", "checked");
	$("input[name='formSerialportStop'][value='" + eval(group + "_CH0_STOPBITS") + "']:radio").attr("checked", "checked");
	$("input[name='formSerialportFC'][value='" + eval(group + "_CH0_FLOWCONTROL") + "']:radio").attr("checked", "checked");
}

function EventBind()
{
	var Req = new CGIRequest();

	$("#btnReset").button().click(function() {
		InitSetting();
	});

	$("#btnApply").button().click(function() {
		var reqQString = "action=update&xmlschema";
		var group = DefaultGroup;

		reqQString += "&" + group + ".Ch0.baudrate=" + $("#formSerialportBuadRate").val();
		reqQString += "&" + group + ".Ch0.databits=" + $("input[name='formSerialportData']:checked:radio").val();
        reqQString += "&" + group + ".Ch0.parity=" + $("input[name='formSerialportParity']:checked:radio").val();
		reqQString += "&" + group + ".Ch0.stopbits=" + $("input[name='formSerialportStop']:checked:radio").val();
		reqQString += "&" + group + ".Ch0.flowcontrol=" + $("input[name='formSerialportFC']:checked:radio").val();

		Req.SetStartFunc(ViewLoadingSave);

		Req.SetCallBackFunc(function(xml){
			ErrorCheck(xml);

			_debug("param - " + reqQString);
			LoadParamJs(DefaultGroup, function() {
				InitSetting();
				ViewLoadingSave(false);
				
				_debug("reload");
				_debug("stop");
			});

			return;
		});
		_debug("start");
		Req.Request(reqQString);
	});
}