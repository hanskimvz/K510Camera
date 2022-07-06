var g_defaultGroup = "PIR";

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
	var classNum = ["04060208", "0501"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "pir", 
				parent.g_langData[parent.g_configData.language]);
}

function mainRun()
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
	$("button").button();

	$("#sliderPirInterval").each(function(index, element) {
		var $obj = $(this).parent().parent().find("input[type='text']");
		$(this).slider({
			range: "min",
			min: 0,
			max: 600,
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
	var group = "PIR";
	
	$("#formPirInterval:text").val(eval(group + "_INTERVAL"));
	$("#formPirInterval:text").parent().parent().find(".slider-bar").slider("value", eval(group + "_INTERVAL"));
}

function SetRelation()
{

	var group = "PIR";

	// Number only
	$("#formPirInterval:text").numeric();

	// Text box 숫자범위
	$("#formPirInterval:text").blur(function() {
			var inputValTextPir = $("#formPirInterval:text").val()-0;
			$("#formPirInterval:text").val(inputValTextPir);
			if($(this).val() == 0) return;
		if(inputValTextPir < 0 || inputValTextPir > 600 || inputValTextPir == "")
		{
			$("#formPirInterval:text").val(eval(group+ "_INTERVAL")).focus();
			$("#sliderPirInterval").slider("value", eval(group+ "_INTERVAL"));
			alert(GetMsgLang("04060208"));
		}
	});

	// Text box, Slider-bar 동기화
	$("#formPirInterval:text").keyup(function() {
			$("#sliderPirInterval").slider("value", $("#formPirInterval:text").val());
	});
}

function EventBind()
{
	var Req = new CGIRequest();

	$("#btnApply").click(function() {
		if($("#formPirInterval:text").val() < 0 || $("#formPirInterval:text").val() > 600 || $("#formPirInterval:text").val() == "") return;
		
		var reqQString = "action=update&xmlschema";
		QString = makeQString();
		QString
			.set_action('update')
			.set_schema('xml')
			.add_list("PIR.interval", PIR_INTERVAL, $("#formPirInterval:text").val());
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

			LoadParamJs(g_defaultGroup+"&cache", function() {
				InitSetting();
				SetRelation();
				ViewLoadingSave(false);
			});

			return;
		});
		Req.Request(reqQString);
	});
}