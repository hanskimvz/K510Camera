$(function () {
	PreCustomize();
	initEnvironment();
	initBrand();
	LoadParamJs("VIDEOOUT&VIDEOIN", Run);
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
	setLanguage(parent.g_configData.langPath, setup + maincontents + "videoout", 
				parent.g_langData[parent.g_configData.language]);
}

function Run()
{
	InitSetting();
	EventBind();
	ContentShow();
	PostCustomize();
}

function initBrand()
{
	jqDisplayCtrl("#VideoOut_Encoder", parent.g_support.videoOutputNVN == true);
	jqDisplayCtrl("#VideoOut", parent.g_support.videoOutput == true);
	if(parent.g_support.videoOutput == true)
	{
		jqDisplayCtrl(".functionEx", parent.g_support.rotation == true || parent.g_support.stabilization == true);
		jqDisplayCtrl(".Rotation_Contents", parent.g_support.rotation == true);
		jqDisplayCtrl(".Stabilization_Contents", parent.g_support.stabilization == true);

		if(parent.g_brand.imgDevice == "seek-thermal" || parent.g_support.tamarisk == true)
		{
			jqDisplayCtrl(".Stabilization_Contents", false);
		}
	}
}

function InitSetting()
{
	if(parent.g_support.videoOutputNVN == true)
	{
		$("input[name='VideoOutMode'][value='" + VIDEOOUT_CH0_MODE + "']:radio").attr("checked", "checked");		
	}
	else if(parent.g_support.videoOutput == true)
	{
		if(VIDEOOUT_CH0_BNC_ENABLE == "no")
		{
			$("input[name='VideoOutBNCOutput'][value='off']:radio").attr("checked", "checked");	 
		}
		else
		{
			$("input[name='VideoOutBNCOutput'][value='" + VIDEOOUT_CH0_BNC_STANDARD + "']:radio").attr("checked", "checked");		
		}

		var rotateEnableFlag = false;
		var stbEnableFlag = false;
		if(parent.g_support.rotation == true)
		{
			rotateEnableFlag = VIDEOIN_CH0_ROTATE_DIRECTION != 'none' ? true : false;
		}
		if(parent.g_support.stabilization == true)
		{
			stbEnableFlag = (VIDEOIN_CH0_VS_ST0 == 'yes' || VIDEOIN_CH0_VS_ST1 == 'yes' || VIDEOIN_CH0_VS_SNAPSHOT == 'yes') ? true : false;
		}

		if(rotateEnableFlag || stbEnableFlag)
		{
			Disable($("input[name='VideoOutBNCOutput']:radio"));
			$("input[name='VideoOutBNCOutput'][value='off']:radio").attr("checked", "checked");
		}
	}
}

function EventBind()
{
	var applyReq = new CGIRequest();

	$("#btnApply").button().click(function() {
		var reqQString = "action=update&xmlschema";

		if(parent.g_support.videoOutputNVN == true)
		{
			QString = makeQString();
			QString
				.set_action('update')
				.set_schema('xml')
				.add_list("VIDEOOUT.Ch0.mode", VIDEOOUT_CH0_MODE, ($("input[name='VideoOutMode']:checked:radio").val()));
			reqQString = QString.get_qstring();
			if(!reqQString) {
				return;
			}
		}
		else if(parent.g_support.videoOutput == true)
		{
			var BNCOutput = $("input[name='VideoOutBNCOutput']:checked:radio").val();

			QString = makeQString();
			if(BNCOutput == "off")
			{
				QString
					.set_action('update')
					.set_schema('xml')
					.add_list("VIDEOOUT.Ch0.Bnc.enable", VIDEOOUT_CH0_BNC_ENABLE, "no");
			}
			else
			{
				QString
					.set_action('update')
					.set_schema('xml')
					.add_list("VIDEOOUT.Ch0.Bnc.enable", null, "yes")
					.add_list("VIDEOOUT.Ch0.Bnc.standard", VIDEOOUT_CH0_BNC_STANDARD, BNCOutput);
			}
			reqQString = QString.get_qstring();
			if(!reqQString) {
				return;
			}
		}

		applyReq.SetStartFunc(ViewLoadingSave);

		applyReq.SetCallBackFunc(function(xml){
			var ret = CGIResponseCheck(0, xml);
			if(ret != 0) {
				var errormessage = "";
				if(ret != -2) {
					errormessage = "\n" + ret;
				}
				alert(GetMsgLang("0501") + errormessage);
			}

			_debug("update - " + reqQString);
			LoadParamJs("VIDEOOUT", function() {
				InitSetting();
				ViewLoadingSave(false);
			});

			return;
		});

		_debug("start" + reqQString);
		applyReq.Request(reqQString);
	});

	$(".linkCamera").click(function(){
		//link camera page
		parent.$("#leftmenu .videoaudioContents + div a[href='camera.html']")[0].click();
	});
}
