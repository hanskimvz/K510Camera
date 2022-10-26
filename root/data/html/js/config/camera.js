var g_defaultGroup = "VIDEOIN";
var g_streamPlayFlag = 0;
var g_analogOuputValue = 0; // 0: ntsc, 1: pal
var g_snapshotPlayFlag = false;
var g_snapshotURL = "/uapi-cgi/snapshot.fcgi";
var g_videoStandardValue = ""; // ntsc/pal/off/cmos
var g_defaultHeight = 342;
var g_streamWidth = 608;
var g_streamHeight = g_defaultHeight;
var g_rotateFlag = false;
var g_rtspPIDStatusPath = "/run/rtspd.pid";
var g_responsRtspPid = null;
var g_rotateInterval = null;
var g_rotateCounter = 0;
var g_saveRtspPid = null;
var g_changeRotate = false;
var g_vcaEnableFlag = false;
var g_tvoutEnableFlag = false;
var g_faceEnableFlag = false;
var g_snapshotResizeFlag = false;
var g_flagView = true;
var g_vDelayMinValue = 2;
var g_textRangeCheckID = "04020159";
var g_brandDeviceType = "";
var g_timSupportNRVersion = false;

$(function () {
	PreCustomize();
	initEnvironment();
	initVideoinStatus();
	getTimFWVersion();
	LoadParamJs("VIDEOIN&NETWORK&ENCODER&SYSTEM.Status.Videoin&VIDEOOUT&FD", Run);
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum = [g_textRangeCheckID, "04020160", "04020161", "04020194", "04020195", "0402019936", "0501", "0402019941"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "camera",
				parent.g_langData[parent.g_configData.language]);
}

function Run()
{
	g_videoStandardValue = SYSTEM_STATUS_VIDEOIN_CH0_STANDARD;
	g_faceEnableFlag = FD_CH0_ENABLE == 'yes' ? true : false;

	if (g_videoStandardValue.toLowerCase() == "pal")
		g_vDelayMinValue = 5;

	$("button").button();
	InitForm();
	InitSetting();
	ContentShow();

	call_xmlData("/uapi-cgi/param.cgi?action=list&group=VCA.Ch0.enable&xmlschema", false, function(xml){
		if($('Ch0 > enable', xml).size() > 0)
			g_vcaEnableFlag = $('Ch0 > enable', xml).text().toLowerCase() == 'yes' ? true : false;
	});

	SetRelation();
	EventBind();
	InitStartVideo();
	ResizePage();

	PostCustomize();
}

function initVideoinStatus()
{
	call_xmlData("/status/videoin.xml", true, function(xml){
		var infoVideoinStandard = jqGetXmlData('videoin channel standard', xml);
		var videoStandardValue = (infoVideoinStandard == "off") ? "Test mode" : infoVideoinStandard.toUpperCase();
		$("#formCamStandard").text(videoStandardValue);
		return;
	});
}

function getTimFWVersion()
{
	call_xmlData("/uapi-cgi/param.cgi?action=list&group=videoin.ch0.tim.version&xmlschema", false, function(xml){
		if($('Ch0 > Tim > version', xml).size() > 0)
			g_timSupportNRVersion = parseInt(($('Ch0 > Tim > version', xml).text()).substring(11,19).replace(/\./gi, '')) >= 255 ? true : false;
	});
}

function setSliderBar(selector, minRange, maxRange, slideFunc)
{
	$(selector).each(function(index, element) {
		var $obj = $(this).parent().parent().find("input[type='text']");
		$(this).slider({
			range: "min",
			min: minRange,
			max: maxRange,
			slide: function(event, ui) {
				$obj.val(ui.value);
				if (slideFunc)
				{
					slideFunc(event, ui);
				}
			}
		})
	});
}

function adjustContentsByBrand()
{
	if (parent.g_brand.cameraClass == "encoder")
		g_brandDeviceType = "encoder";

	if(parent.g_brand.productID != "d001")
	{
		if(parent.g_brand.audioInOut == "0/0")
		{
			$("#parentpagename").css("display", "none");
			$("#parentpagename_video").css("display", "inline");
		}
		else if(parent.g_brand.audioInOut == "1/0")
		{
			$("#parentpagename").css("display", "inline");
			$("#parentpagename_video").css("display", "none");
		}
		else if(parent.g_brand.audioInOut == "0/1")
		{
			$("#parentpagename").css("display", "inline");
			$("#parentpagename_video").css("display", "none");
		}
	}
	else
	{
		$("#parentpagename").css("display", "inline");
		$("#parentpagename_video").css("display", "none");
	}

	if(parent.g_brand.pantilt == g_defbrand.type1ptz ||
		parent.g_brand.pantilt == g_defbrand.irptz ||
		parent.g_brand.pantilt == g_defbrand.ptz)
	{
		g_brandDeviceType = "speeddome";
		var optionWBM = "<option value='atw1'> atw1</option>" +
						"<option value='manual'> manual</option>" +
						"<option value='indoor'> indoor</option>" +
						"<option value='outdoor'> outdoor</option>";

		if("mz2307" == parent.g_brand.imgDevice || "mz2251-5x" == parent.g_brand.imgDevice)
		{
			optionWBM = "<option value='atw1'> atw1</option>" +
						"<option value='manual'> manual</option>";
		}

		$("#formCamWBMode").empty();
		$("#formCamWBMode").append(optionWBM);

		$(".noise_filter0").css("display", "none");
		$(".noise_filter1").css("display", "block");
		$(".ATM_Contents").css("display", "block");
		$("#Exposure_Manual").css("display", "none");
		$(".MaximumAGC_Contents").css("display", "none");
		$("#formCamBLCZone").css("display", "none");

		GetAnalogOutputStatus();
		FlipMirrorException();
	}
	else if(parent.g_brand.imgDevice == "imx122")
	{
		$(".noise_filter0").css("display", "block");
		$(".noise_filter1").css("display", "none");
		$(".ATM_Contents").css("display", "none");
		$("#Exposure_Manual").css("display", "block");
		$(".MaximumAGC_Contents").css("display", "block");
		$("#formCamBLCZone").css("display", "block");
	}
	else if(parent.g_brand.repositioning == g_defbrand.existrepositioning) // Repositioning 모델
	{

		g_brandDeviceType = "repositioning";
		$(".noise_filter0").css("display", "block");
		$(".noise_filter1").css("display", "none");
		$(".ATM_Contents").css("display", "none");
		$("#Exposure_Manual").css("display", "block");
		$(".MaximumAGC_Contents").css("display", "block");
		$("#formCamBLCZone").css("display", "block");
	}
	else
	{
		$(".noise_filter0").css("display", "block");
		$(".noise_filter1").css("display", "none");
		$(".ATM_Contents").css("display", "none");
		$("#Exposure_Manual").css("display", "block");
		$(".MaximumAGC_Contents").css("display", "block");
		$("#formCamBLCZone").css("display", "block");
	}

	if(parent.g_brand.pantilt == g_defbrand.type1ptz ||
		parent.g_brand.pantilt == g_defbrand.ptz)
	{
		$(".dnlevelContents").css("display", "none");
	}

	if(parent.g_support.brightnessZero)
		$("#brightnessRange").text("(0 ... 255, 0)");
	else
		$("#brightnessRange").text("(0 ... 255, 128)");

	if(parent.g_brand.irType != "none")
	{
		if(parent.g_brand.irType == "smartir_type1")
		{
			$("#smartIR_contents").css("display", "block");
			$(".smartIR").css("display", "inline");
			$(".normalIR").css("display", "none");
		}
		else if(parent.g_brand.irType == "normal")
		{
			$("#smartIR_contents").css("display", "block");
			$(".smartIR").css("display", "none");
			$(".normalIR").css("display", "inline");
		}
	}
	else
	{
		$("#smartIR_contents").css("display", "none");
	}

	var dbRatioValue = videoin_getAttr("CMOS_RATIO");

	if(isLimitFPS14(dbRatioValue, parent.g_brand.productID))
	{
		$(".14maxShutter").css("display", "block");
		$(".30maxShutter").css("display", "none");
	}
	else
	{
		$(".14maxShutter").css("display", "none");
		$(".30maxShutter").css("display", "block");
	}

	if (parent.g_brand.cameraClass == "encoder") {
		$("#pagename").css("display", "none");
		$("#pagename_videoin").css("display", "inline");
		$(".Exposure_Contents").css("display", "none");
		$(".DWDRLevel_Contents").css("display", "none");
		$(".ATM_Contents").css("display", "none");
		$(".WB_contents").css("display", "none");
		$(".ISP_Contents").css("display", "none");
		$(".Adjust_Contents").css("display", "block");
		$(".Deinterlace_Contents").css("display", "block");
		$(".Standardformat_Contents").css("display", "block");

		if (g_videoStandardValue == "ntsc")
		{
			$(".ntscVdelayContents").css("display", "inline");
			$(".ntscHdelayContents").css("display", "inline");
			$(".palVdelayContents").css("display", "none");
			$(".palHdelayContents").css("display", "none");
		}
		else if (g_videoStandardValue == "pal")
		{
			$(".ntscVdelayContents").css("display", "none");
			$(".ntscHdelayContents").css("display", "none");
			$(".palVdelayContents").css("display", "inline");
			$(".palHdelayContents").css("display", "inline");
		}
		else if (g_videoStandardValue == "off")
		{
			$(".ntscVdelayContents").css("display", "inline");
			$(".ntscHdelayContents").css("display", "inline");
			$(".palVdelayContents").css("display", "none");
			$(".palHdelayContents").css("display", "none");
		}
	}
	else
	{
		$("#pagename").css("display", "inline");
		$("#pagename_videoin").css("display", "none");
		$(".Adjust_Contents").css("display", "none");
		$(".Deinterlace_Contents").css("display", "none");
		$(".Standardformat_Contents").css("display", "none");
	}

	if(parent.g_brand.cameraClass == "encoder" || parent.g_support.tamarisk == true)
		$(".aspectRatioContents").css("display", "none");
	else
		$(".aspectRatioContents").css("display", "block");

	$(".daynightrefocus").css("display", (parent.g_brand.mfzType == "motorized")? "block" : "none");

	jqDisplayCtrl(".Rotation_Contents", parent.g_support.rotation == true);
	jqDisplayCtrl(".Stabilization_Contents", parent.g_support.stabilization == true);
	jqDisplayCtrl(".exposureShutterSpeed", parent.g_support.exposureShutterSpeed == true);
	jqDisplayCtrl(".blcOffOptionContents", parent.g_support.blcOffOption == true);
	jqDisplayCtrl(".smartIRManualContents", parent.g_support.smartIRManual == true, "inline");
	jqDisplayCtrl(".2DNRContents", parent.g_support.dynamic2Dnr == true);
	jqDisplayCtrl(".DNRContents", parent.g_support.dnr == true);
	jqDisplayCtrl(".DWDR_Contents", parent.g_support.dwdr == true);
	jqDisplayCtrl(".WDR_Contents", parent.g_support.wdr == true);
	jqDisplayCtrl(".WDRLevel_Contents", parent.g_support.wdrLevel == true);
	jqDisplayCtrl(".AnalogOutput_Contents", parent.g_support.analogoutput == true);
	jqDisplayCtrl(".VideoOut_Contents", parent.g_support.videoOutput == true);
	jqDisplayCtrl(".illumiSensorContents", parent.g_support.enableIllumiSensor == true);

	jqDisplayCtrl($(".Defog_Contents"), parent.g_support.defog);
	if(parent.g_support.defog == true)
	{
		jqDisplayCtrl($(".Defog_Contents_Level"), parent.g_support.defogLevel);
	}


	if(parent.g_brand.imgDevice == "en773a")
	{
		var shutterSpeed = $("#manualShutterSpeed");
		var curText = shutterSpeed.text();
		var changeText = curText.replace("1/2", "1/30");

		shutterSpeed.text(changeText);
	}

	if(parent.g_brand.imgDevice == "en773v")
	{
		$(".en773v_flickerless").css("display", "block");
		$(".Exposure_Flickerless").css("display", "none");
		Disable($("#formCamExposureFlicker50"));
		Disable($("#formCamExposureFlicker60"));		
	}

	if(parent.g_brand.dntype == "none")
		$(".dnContents").css("display", "none");

	if(parent.g_brand.cdscontroltype == "none")
		$(".illumiSensorContents").css("display", "none");

	$(".vsEnableContents").css("display", parent.g_support.stabilizationEnable ? "block" : "none");
	$(".vsStreamContents").css("display", parent.g_support.stabilizationEnable ? "none" : "block");
	$(".vsBorderContents").css("display", parent.g_support.stabilizationEnable ? "none" : "block");

	if(parent.g_brand.imgDevice == "seek-thermal")
	{
		jqDisplayCtrl($(".videoAppContents"), false);
		jqDisplayCtrl($(".Stabilization_Contents"), false);
		jqDisplayCtrl($(".Exposure_Contents"), false);
		jqDisplayCtrl($(".DWDR_Contents"), false);
		jqDisplayCtrl($(".WB_contents"), false);
		jqDisplayCtrl($(".ISP_Contents"), false);
		jqDisplayCtrl($(".noisereductionContents"), true);
		jqDisplayCtrl($(".colorizationContents"), true);
		jqDisplayCtrl($(".oceanContents"), false);
		jqDisplayCtrl($(".flammaContents"), false);
		jqDisplayCtrl($(".infernoContents"), false);
		jqDisplayCtrl($(".redLightContents"), false);
		jqDisplayCtrl($(".thermalMetaContents"), true);
	}

	if(parent.g_brand.lensType == "fisheye" || parent.g_support.tamarisk || "dm368" == parent.g_brand.soctype)
		jqDisplayCtrl($(".fdLinkContents"), false);

	if(parent.g_support.tamarisk)
	{
		jqDisplayCtrl($(".saturationContents"), false);
		jqDisplayCtrl($(".Exposure_Contents"), false);
		jqDisplayCtrl($(".DWDR_Contents"), false);
		jqDisplayCtrl($(".WB_contents"), false);
		jqDisplayCtrl($(".ISP_Contents"), false);
		jqDisplayCtrl($(".colorizationContents"), true);
		jqDisplayCtrl($(".gainControlContents"), true);
		jqDisplayCtrl($(".nucAutoCalibContents"), true);
		jqDisplayCtrl($(".fdLinkContents"), false);
		jqDisplayCtrl($(".Stabilization_Contents"), false);
		jqDisplayCtrl($(".agcMergeSpeedContents"), true);

		if(g_timSupportNRVersion) //if tim version is over than "Rel: X1.P3.00.02.55"
		{
			jqDisplayCtrl($(".noisereductionContents"), true);
		}
	}

	if(parent.g_brand.imgDevice == "tamarisk320fps9" || parent.g_brand.imgDevice == "tamarisk320fps30")
		jqDisplayCtrl($(".noisereductionContents"), true);

	if(limitQQVGARotaion())
	{
		$(".resQQVGAContents").css("display", "block");
		Disable($(".useRotation"));
	}

	EvenOdd(parent.g_configData.skin);
}

function limitQQVGARotaion()
{
	var limit = false;
	var st0_enable = ENCODER_CH0_VIDEOCODEC_ST0_ENABLE;
	var st0_codec = ENCODER_CH0_VIDEOCODEC_ST0_STANDARD;
	var st0_resolution = eval("ENCODER_CH0_VIDEOCODEC_ST0_" + st0_codec.toUpperCase() + "_RESOLUTION");
	var st1_enable = ENCODER_CH0_VIDEOCODEC_ST1_ENABLE;
	var st1_codec = ENCODER_CH0_VIDEOCODEC_ST1_STANDARD;
	var st1_resolution = eval("ENCODER_CH0_VIDEOCODEC_ST1_" + st1_codec.toUpperCase() + "_RESOLUTION");
	var snap_enable = ENCODER_CH0_SNAPSHOT_ENABLE;
	var snap_resolution = ENCODER_CH0_SNAPSHOT_RESOLUTION;

	if(st0_enable == "yes" && st0_resolution == "qqvga") limit = true;
	if(st1_enable == "yes" && st1_resolution == "qqvga") limit = true;
	if(snap_enable == "yes" && snap_resolution == "qqvga") limit = true;

	return limit;
}

function InitForm()
{
	setSliderBar("#sliderCamBrightness, #sliderCamContrast, #sliderCamSaturation, #sliderCamSharpness, " +
		"#sliderCamSmartIR, #sliderCamGainRed, #sliderCamGainBlue", 0, 255);
	setSliderBar("#sliderCamNoisefilter, #sliderCamNoisefilter_sub", 0, 15);
	setSliderBar("#sliderCamWDRLevel", 1, 16);
	setSliderBar("#sliderCamDWDRLevel", 1, 16);
	setSliderBar("#sliderVerticaldelay", g_vDelayMinValue, 128);
	setSliderBar("#sliderHorizontaldelay", 2, 128);
	setSliderBar("#sliderCamDaytonight", 0, 63, function(event, ui) {
		if(ui.value >= $("#formCamNighttoday:text").val())
			$("#formCamNighttoday:text").val(ui.value+1).parent().parent().find(".slider-bar").slider("value", ui.value+1);
	});
	setSliderBar("#sliderCamNighttoday", 1, 64, function(event, ui) {
		if(ui.value <= $("#formCamDaytonight:text").val())
			$("#formCamDaytonight:text").val(ui.value-1).parent().parent().find(".slider-bar").slider("value", ui.value-1);
	});

	if (parent.g_configData.langPath == "/language/Arabic.xml")
		$(".slider-bar").slider({isRTL: true});

	setSliderBar("#sliderIceLevel", 0, 7);
	setSliderBar("#sliderManualGain", 0, 4095);
	setSliderBar("#sliderManualLevel", 0, 4095);
	setSliderBar("#sliderNucAutoCalibInterval", 5, 60);

	adjustContentsByBrand();
}

function videoin_getAttr(name)
{
	var group = g_defaultGroup + "_" + "CH0";
	var returnValue = window[group + "_" + name];
	return returnValue;
}

function setTextSliderValue(selector, dbValue)
{
	$(selector).val(dbValue).parent().parent().find(".slider-bar").slider("value", dbValue);
}

function InitSetting()
{
	FlipMirrorLoad(videoin_getAttr("IMAGE_MIRROR"));
	$("select#formCamWBMode").val(videoin_getAttr("ISP_WHITEBALANCE_MODE"));
	$("select#formCamWBMode").change();

	$("#formCamName:text").val(videoin_getAttr("NAME"));

	setTextSliderValue($("#formCamBright:text"), videoin_getAttr("COLOR_BRIGHTNESS"));
	setTextSliderValue($("#formCamContrast:text"), videoin_getAttr("COLOR_CONTRAST"));
	setTextSliderValue($("#formCamSaturation:text"), videoin_getAttr("COLOR_SATURATION"));
	setTextSliderValue($("#formCamSharpness:text"), videoin_getAttr("COLOR_SHARPNESS"));
	setTextSliderValue($("#formCamNoisefilter:text"), videoin_getAttr("ISP_NOISEFILTER"));
	setTextSliderValue($("#formCamNoisefilter_sub:text"), videoin_getAttr("ISP_NOISEFILTER"));
	setTextSliderValue($("#textCamSmartIR:text"), videoin_getAttr("ISP_EXPOSURE_IRLEVEL"));
	setTextSliderValue($("#formCamGainRed:text"), videoin_getAttr("ISP_WHITEBALANCE_MANUALREDGAIN"));
	setTextSliderValue($("#formCamGainBlue:text"), videoin_getAttr("ISP_WHITEBALANCE_MANUALBLUEGAIN"));

	var dssDBValue = videoin_getAttr("ISP_EXPOSURE_DSS");

	if(parent.g_brand.imgDevice == "fcb-ev7310" || parent.g_brand.imgDevice == "fcb-ev7500" ||
		parent.g_brand.imgDevice == "mz2307" || parent.g_brand.imgDevice == "mz2251-5x" ||
		parent.g_brand.imgDevice == "fcb-ev7520")
	{
		$("#formCamDSS option").remove();
		$("#formCamDSS").append("<option value='off'>off</option><option value='on'>on</option>");

		if(dssDBValue != "off")
			dssDBValue = "on";
	}
	else if(parent.g_brand.imgDevice == "en773a")
	{
		$("#formCamDSS option[value='16x']").remove();

		if(dssDBValue == "16x")
			dssDBValue = "8x";
	}

	if(dssDBValue == "32x")
		dssDBValue = "off";

	$("select#formCamDSS").val(dssDBValue);
	$("select#formCamEVComp").val(videoin_getAttr("ISP_EXPOSURE_COMPENSATION"));
	$("select#formCamWBMode").val(videoin_getAttr("ISP_WHITEBALANCE_MODE"));

	var exposureModeDbValue = videoin_getAttr("ISP_EXPOSURE_MODE");
	if(exposureModeDbValue == "normal" || exposureModeDbValue == "manual")
	{
		$("input[name='formCamExposureMode'][value='" + exposureModeDbValue + "']:radio").attr("checked", "checked");
	}
	else if(exposureModeDbValue == "normal50" || exposureModeDbValue == "manual50")
	{
		var exposureModeDbSubValue = exposureModeDbValue.substring(0,6);
		$("input[name='formCamExposureMode'][value='" + exposureModeDbSubValue + "']:radio").attr("checked", "checked");
		$("input[name='en773v_flickerlessMode'][value='50']:radio").attr("checked", "checked");
	}
	else
	{
		var exposureModeDbSubValue = exposureModeDbValue.substr(exposureModeDbValue.length-2, 2);
		$("input[name='formCamExposureMode'][value='flicker']:radio").attr("checked", "checked");
		if(parent.g_brand.imgDevice == "en773v")
		{
			$("input[name='en773v_flickerlessMode'][value='" + exposureModeDbSubValue + "']:radio").attr("checked", "checked");
		}
		else
		{
			$("input[name='en773v_flickerlessMode'][value='50']:radio").attr("checked", "");
			$("input[name='en773v_flickerlessMode'][value='60']:radio").attr("checked", "");
			$("input[name='formCamExposureFlicker'][value='" + exposureModeDbValue + "']:radio").attr("checked", "checked");

		}
	}

	$("#fixedshutter").val(videoin_getAttr("ISP_EXPOSURE_FIXEDSHUTTER"));
	$("#minshutter").val(videoin_getAttr("ISP_EXPOSURE_MINSHUTTER"));
	$("#maxshutter").val(videoin_getAttr("ISP_EXPOSURE_MAXSHUTTER"));
	$("#maxagc:text").val(videoin_getAttr("ISP_EXPOSURE_MAXAGC"));

	setTextSliderValue($("#formCamDaytonight:text"), videoin_getAttr("LIGHT_DAYNIGHT_DTNLEVEL"));
	setTextSliderValue($("#formCamNighttoday:text"), videoin_getAttr("LIGHT_DAYNIGHT_NTDLEVEL"));
	setTextSliderValue($("#formCamWDRLevel:text"), parseInt(videoin_getAttr("WDR_LEVEL")) + 1);
	setTextSliderValue($("#formCamDWDRLevel:text"), parseInt(videoin_getAttr("WDR_LEVEL")) + 1);

	$("#formCamWDR:checkbox").attr("checked", (videoin_getAttr("WDR_ENABLE") == "yes") ? "checked" : "");
	$("#formCamDWDR:checkbox").attr("checked", (videoin_getAttr("WDR_ENABLE") == "yes") ? "checked" : "");
	$("#enableIllumiSensor").attr("checked", (videoin_getAttr("LIGHT_DAYNIGHT_SENSOR_ENABLE") == "yes") ? "checked" : "");
	$("#stabilizationEnable:checkbox").attr("checked", (videoin_getAttr("VS_ENABLE") == "yes") ? "checked" : "");
	$("select#formCamAFM").val(videoin_getAttr("FOCUS_MODE"));

	$("input[name='formCamDaynightMode'][value='" + videoin_getAttr("LIGHT_DAYNIGHT_MODE") + "']:radio").attr("checked", "checked");
	$("input[name='formCamBLC'][value='" + videoin_getAttr("LIGHT_BACKLIGHT_ENABLE") + "']:radio").attr("checked", "checked");
	$("select#formCamBLCZone").val(videoin_getAttr("LIGHT_BACKLIGHT_ZONE"));
	$("input[name='formCamSmartIR'][value='" + videoin_getAttr("ISP_EXPOSURE_IRMODE") + "']:radio").attr("checked", "checked");

	$("#formVStabSt0Enable:checkbox").attr("checked", (videoin_getAttr("VS_ST0") == "yes") ? "checked" : "");
	$("#formVStabSt1Enable:checkbox").attr("checked", (videoin_getAttr("VS_ST1") == "yes") ? "checked" : "");
	$("#formVStabSnapshotEnable:checkbox").attr("checked", (videoin_getAttr("VS_SNAPSHOT") == "yes") ? "checked" : "");
	$("select#formVStabBorderType").val(videoin_getAttr("VS_BORDERTYPE"));
	$("#formDefogEnable:checkbox").attr("checked", (videoin_getAttr("ISP_DEFOG_ENABLE") == "yes") ? "checked" : "");
	$("select#formDefogManualLevel").val(videoin_getAttr("ISP_DEFOG_MANUAL_LEVEL"));
	$("input[name='agcMergeSpeedOption'][value='" + videoin_getAttr("TIM_AGCSPEED") + "']:radio").attr("checked", "checked");

	if (g_videoStandardValue == "ntsc" || g_videoStandardValue == "pal")
	{
		setTextSliderValue($("#verticaldelay:text"), videoin_getAttr("ADJUST_" + g_videoStandardValue.toUpperCase() + "_VDELAY"));
		setTextSliderValue($("#horizontaldelay:text"), videoin_getAttr("ADJUST_" + g_videoStandardValue.toUpperCase() + "_HDELAY"));
	}
	else if (g_videoStandardValue == "off")
	{
		setTextSliderValue($("#verticaldelay:text"), videoin_getAttr("ADJUST_NTSC_VDELAY"));
		setTextSliderValue($("#horizontaldelay:text"), videoin_getAttr("ADJUST_NTSC_HDELAY"));
	}

	$("#formCamDeinterlaceEnable:checkbox").attr("checked", videoin_getAttr("DEINTERLACE_ENABLE") == "yes" ? "checked": "");
	$("input[name='formCamRotation'][value='" + videoin_getAttr("ROTATE_DIRECTION") + "']:radio").attr("checked", "checked");
	$("#syncDayNight:checkbox").attr("checked", videoin_getAttr("FOCUS_SYNCWITHDAYNIGHT") == "yes" ? "checked": "");

	var aspectRatioDBValue = videoin_getAttr("CMOS_RATIO");
	$("input[name='aspectRatioOption'][value='" + aspectRatioDBValue + "']:radio").attr("checked", "checked");

	var enableRotationVSControl = (isLimitFPS14(aspectRatioDBValue, parent.g_brand.productID) == false);
	jqEnableControl($(".Rotation_Contents"), enableRotationVSControl);
	jqEnableControl($(".Stabilization_Contents"), enableRotationVSControl);
	jqDisplayCtrl(".Ratio_Contents", !enableRotationVSControl);

	var isVideoTransFormEnable = true;
	if((parent.g_brand.lens == "hqo_rpla8trt" && aspectRatioDBValue == "4:3") || parent.g_brand.pantilt == g_defbrand.irptz)
	{
		isVideoTransFormEnable = false;
	}

	jqDisplayCtrl(".videoTransFormContents", isVideoTransFormEnable == true);

	if(parent.g_support.videoOutput == true)
	{
		g_tvoutEnableFlag = VIDEOOUT_CH0_BNC_ENABLE == "yes" ? true : false;
	}

	$("#noiseredEnable:checkbox").attr("checked", (videoin_getAttr("TIM_NOISEREDUCTION_ENABLE") == "yes") ? "checked" : "");
	$("#thermalMetaEnable:checkbox").attr("checked", (videoin_getAttr("TIM_METADATA_ENABLE") == "yes") ? "checked" : "");
	$("#colorNegativeEnable:checkbox").attr("checked", (videoin_getAttr("TIM_COLORIZATION_POLARITY") == "negative") ? "checked" : "");
	$("input[name='colTable'][value='" + videoin_getAttr("TIM_COLORIZATION_MODE") + "']:radio").attr("checked", "checked");
	$("input[name='gainControlMode'][value='" + videoin_getAttr("TIM_GAINCONTROL_MODE") + "']:radio").attr("checked", "checked");

	setTextSliderValue($("#iceLevel:text"), videoin_getAttr("TIM_GAINCONTROL_ICE_LEVEL"));
	setTextSliderValue($("#manualGain:text"), videoin_getAttr("TIM_GAINCONTROL_MANUAL_GAIN"));
	setTextSliderValue($("#manualLevel:text"), videoin_getAttr("TIM_GAINCONTROL_MANUAL_OFFSET"));
	setTextSliderValue($("#nucAutoCalibInterval:text"), videoin_getAttr("TIM_NUC_INTERVAL"));
}

function setTextBlur(selector, minRange, maxRange, setValue, langClassID)
{
	$(selector).blur(function() {
		var nowValue = $(selector).val()-0;
		if(minRange == 0 && nowValue == 0) return;
		if(nowValue < minRange || nowValue > maxRange || nowValue == "" || (!checkStringValidation($(selector).val(), g_defregexp.numberOnly, null, null, false)))
		{
			$(selector).val(setValue).focus();
			$(selector).parent().parent().find(".slider-bar").slider("value", setValue);
			alert(GetMsgLang(langClassID));
		}
	});
}

function syncTextBoxSliderBar(selector)
{
	$(selector).keyup(function() {
		$(selector).parent().parent().find(".slider-bar").slider("value", $(selector).val());
	});
}

function setDisplayEnable(selector, enableFlag)
{
	if(enableFlag == true)
		Enable($(selector));
	else
		Disable($(selector));
}

function SetRelation()
{
	$("#formCamName:text").keyup(function(){
		LimitCharac("formCamName:text", 32);
	});

	$("#formCamBright:text").numeric();
	$("#formCamContrast:text").numeric();
	$("#formCamSaturation:text").numeric();
	$("#formCamSharpness:text").numeric();
	$("#formCamNoisefilter:text").numeric();
	$("#formCamNoisefilter_sub:text").numeric();
	$("#textCamSmartIR:text").numeric();
	$("#formCamGainRed:text").numeric();
	$("#formCamGainBlue:text").numeric();
	$("#formCamDaytonight:text").numeric();
	$("#formCamNighttoday:text").numeric();
	$("#formCamWDRLevel:text").numeric();
	$("#formCamDWDRLevel:text").numeric();
	$("#maxshutter:text").numeric();
	$("#minshutter:text").numeric();
	$("#fixedshutter:text").numeric();
	$("#maxagc:text").numeric();

	$("#iceLevel, #manualGain, #manualLevel, #nucAutoCalibInterval").numeric();

	setTextBlur("#formCamBright:text", 0, 255, videoin_getAttr("COLOR_BRIGHTNESS"), g_textRangeCheckID);
	setTextBlur("#formCamContrast:text", 0, 255, videoin_getAttr("COLOR_CONTRAST"), g_textRangeCheckID);
	setTextBlur("#formCamSaturation:text", 0, 255, videoin_getAttr("COLOR_SATURATION"), g_textRangeCheckID);
	setTextBlur("#formCamSharpness:text", 0, 255, videoin_getAttr("COLOR_SHARPNESS"), g_textRangeCheckID);
	setTextBlur("#formCamNoisefilter:text", 0, 15, videoin_getAttr("ISP_NOISEFILTER"), g_textRangeCheckID);
	setTextBlur("#formCamNoisefilter_sub:text", 0, 15, videoin_getAttr("ISP_NOISEFILTER"), g_textRangeCheckID);
	setTextBlur("#textCamSmartIR:text", 0, 255, videoin_getAttr("ISP_EXPOSURE_IRLEVEL"), g_textRangeCheckID);
	setTextBlur("#formCamGainRed:text", 0, 255, videoin_getAttr("ISP_WHITEBALANCE_MANUALREDGAIN"), g_textRangeCheckID);
	setTextBlur("#formCamGainBlue:text", 0, 255, videoin_getAttr("ISP_WHITEBALANCE_MANUALBLUEGAIN"), g_textRangeCheckID);
	setTextBlur("#formCamDaytonight:text", 0, 63, videoin_getAttr("LIGHT_DAYNIGHT_DTNLEVEL"), g_textRangeCheckID);
	setTextBlur("#formCamNighttoday:text", 1, 64, videoin_getAttr("LIGHT_DAYNIGHT_NTDLEVEL"), g_textRangeCheckID);
	setTextBlur("#formCamWDRLevel:text", 1, 16, parseInt(videoin_getAttr("WDR_LEVEL")) + 1, g_textRangeCheckID);
	setTextBlur("#formCamDWDRLevel:text", 1, 16, parseInt(videoin_getAttr("WDR_LEVEL")) + 1, g_textRangeCheckID);
	setTextBlur("#maxagc:text", 0, 100, videoin_getAttr("ISP_EXPOSURE_MAXAGC"), g_textRangeCheckID);
	setTextBlur("#minshutter:text", 1000, 10000, videoin_getAttr("ISP_EXPOSURE_MINSHUTTER"), g_textRangeCheckID);
	setTextBlur("#maxshutter:text", (isLimitFPS14(videoin_getAttr("CMOS_RATIO"), parent.g_brand.productID)?14:30), 500, videoin_getAttr("ISP_EXPOSURE_MAXSHUTTER"), g_textRangeCheckID);

	setTextBlur("#iceLevel:text", 0, 7, videoin_getAttr("TIM_GAINCONTROL_ICE_LEVEL"), g_textRangeCheckID);
	setTextBlur("#manualGain:text", 0, 4095, videoin_getAttr("TIM_GAINCONTROL_MANUAL_GAIN"), g_textRangeCheckID);
	setTextBlur("#manualLevel:text", 0, 4095, videoin_getAttr("TIM_GAINCONTROL_MANUAL_OFFSET"), g_textRangeCheckID);
	setTextBlur("#nucAutoCalibInterval:text", 5, 60, videoin_getAttr("TIM_NUC_INTERVAL"), g_textRangeCheckID);

	var manualShutterMinRange = 2;
	if(parent.g_brand.imgDevice == "en773a")
		manualShutterMinRange = 30;

	setTextBlur("#fixedshutter:text", manualShutterMinRange, 5000, videoin_getAttr("ISP_EXPOSURE_FIXEDSHUTTER"), g_textRangeCheckID);

	$("#verticaldelay:text").blur(function() {
		var inputValVdelay = $("#verticaldelay:text").val()-0;
		$("#verticaldelay:text").val(inputValVdelay);
		if(inputValVdelay < g_vDelayMinValue || inputValVdelay > 128 || inputValVdelay == "")
		{
			if (g_videoStandardValue == "ntsc" || g_videoStandardValue == "pal")
			{
				$("#verticaldelay:text").val(videoin_getAttr("ADJUST_" + g_videoStandardValue.toUpperCase() + "_VDELAY")).focus();
				$("#sliderVerticaldelay").slider("value", videoin_getAttr("ADJUST_" + g_videoStandardValue.toUpperCase() + "_VDELAY"));
			}
			else if (g_videoStandardValue == "off")
			{
				$("#verticaldelay:text").val(videoin_getAttr("ADJUST_NTSC_VDELAY")).focus();
				$("#sliderVerticaldelay").slider("value", videoin_getAttr("ADJUST_NTSC_VDELAY"));
			}
			alert(GetMsgLang(g_textRangeCheckID));
		}
	});
	$("#horizontaldelay:text").blur(function() {
		var inputValHdelay = $("#horizontaldelay:text").val()-0;
		$("#horizontaldelay:text").val(inputValHdelay);
		if(inputValHdelay < 2 || inputValHdelay > 128 || inputValHdelay == "")
		{
			if (g_videoStandardValue == "ntsc" || g_videoStandardValue == "pal")
			{
				$("#horizontaldelay:text").val(videoin_getAttr("ADJUST_" + g_videoStandardValue.toUpperCase() + "_HDELAY")).focus();
				$("#sliderHorizontaldelay").slider("value", videoin_getAttr("ADJUST_" + g_videoStandardValue.toUpperCase() + "_HDELAY"));
			}
			else if (g_videoStandardValue == "off")
			{
				$("#horizontaldelay:text").val(videoin_getAttr("ADJUST_NTSC_HDELAY")).focus();
				$("#sliderHorizontaldelay").slider("value", videoin_getAttr("ADJUST_NTSC_HDELAY"));
			}
			alert(GetMsgLang(g_textRangeCheckID));
		}
	});

	syncTextBoxSliderBar("#formCamBright:text");
	syncTextBoxSliderBar("#formCamContrast:text");
	syncTextBoxSliderBar("#formCamSaturation:text");
	syncTextBoxSliderBar("#formCamSharpness:text");
	syncTextBoxSliderBar("#formCamNoisefilter:text");
	syncTextBoxSliderBar("#formCamNoisefilter_sub:text");
	syncTextBoxSliderBar("#textCamSmartIR:text");
	syncTextBoxSliderBar("#formCamGainRed:text");
	syncTextBoxSliderBar("#formCamGainBlue:text");
	syncTextBoxSliderBar("#formCamWDRLevel:text");
	syncTextBoxSliderBar("#formCamDWDRLevel:text");
	syncTextBoxSliderBar("#verticaldelay:text");
	syncTextBoxSliderBar("#horizontaldelay:text");
	syncTextBoxSliderBar("#iceLevel:text");
	syncTextBoxSliderBar("#manualGain:text");
	syncTextBoxSliderBar("#manualLevel:text");
	syncTextBoxSliderBar("#nucAutoCalibInterval:text");


	// Day Night Level
	var dayToNightText = $("#formCamDaytonight:text");
	var nightToDayText = $("#formCamNighttoday:text");
	dayToNightText.keyup(function() {
		$("#sliderCamDaytonight").slider("value", dayToNightText.val());
		if(dayToNightText.val()*1 >= nightToDayText.val()*1 && dayToNightText.val()*1 <= 63)
		{
			nightToDayText.val(dayToNightText.val()*1+1).parent().parent().find(".slider-bar").slider("value", dayToNightText.val()*1+1);
		}
	});
	nightToDayText.keyup(function() {
		$("#sliderCamNighttoday").slider("value", nightToDayText.val());
		if(nightToDayText.val()*1 <= dayToNightText.val()*1 && nightToDayText.val()*1 <= 64)
		{
			dayToNightText.val(nightToDayText.val()*1-1).parent().parent().find(".slider-bar").slider("value", nightToDayText.val()*1-1);
		}
	});

	$("#formCamWDR").change(function(){
		setDisplayEnable("#sliderCamWDRLevel, #formCamWDRLevel", $("#formCamWDR:checkbox").attr("checked"));
	});
	$("#formCamWDR").change();

	$("#formCamDWDR").change(function(){
		setDisplayEnable("#sliderCamDWDRLevel, #formCamDWDRLevel", $("#formCamDWDR:checkbox").attr("checked"));
	});
	$("#formCamDWDR").change();

	// Back light Control
	$("input[name='formCamBLC']").change(function(){
		setDisplayEnable("#formCamBLCZone", $("input[name='formCamBLC']:checked:radio").val() == "yes");
	});
	$("input[name='formCamBLC']").change();

	// Smart IR
	$("input[name='formCamSmartIR']").change(function(){
		setDisplayEnable("#sliderCamSmartIR, #textCamSmartIR", $("input[name='formCamSmartIR']:checked:radio").val() == "manual");
	});
	$("input[name='formCamSmartIR']").change();

	// White balance
	$("select#formCamWBMode").change(function() {
		setDisplayEnable("#formCamGainRed, #sliderCamGainRed, #formCamGainBlue, #sliderCamGainBlue", $(this).val() == "manual");
	});
	$("select#formCamWBMode").change();

	// Day & Night Level
	$("input[name='formCamDaynightMode']").change(function(){
		setDisplayEnable("#sliderCamDaytonight, #formCamDaytonight, #sliderCamNighttoday, #formCamNighttoday",
		$("input[name='formCamDaynightMode']:checked:radio").val() == "auto");
	});
	$("input[name='formCamDaynightMode']").change();

	// Exposure mode
	$("input[name='formCamExposureMode']").change(function(){
		// $("input[name='formCamExposureMode']:checked:radio").val()  객체로 뽑아서 사용
		if($("input[name='formCamExposureMode']:checked:radio").val() == "normal" && $("input[name='en773v_flickerlessMode']:checked:radio").val() == "50")
		{
			Disable($("#fixedshutter"));
			Enable($("#minshutter"));
			Enable($("#maxshutter"));
			Disable($("#formCamExposureFlicker50"));
			Disable($("#formCamExposureFlicker60"));
		}
		else if($("input[name='formCamExposureMode']:checked:radio").val() == "manual" && $("input[name='en773v_flickerlessMode']:checked:radio").val() == "50")
		{
			Enable($("#fixedshutter"));
			Disable($("#minshutter"));
			Disable($("#maxshutter"));
			Disable($("#formCamExposureFlicker50"));
			Disable($("#formCamExposureFlicker60"));
		}
		else if($("input[name='formCamExposureMode']:checked:radio").val() == "normal")
		{
			Disable($("#fixedshutter"));
			Enable($("#minshutter"));
			Enable($("#maxshutter"));
			Disable($("#formCamExposureFlicker50"));
			Disable($("#formCamExposureFlicker60"));
		}
		else if($("input[name='formCamExposureMode']:checked:radio").val() == "manual")
		{
			Enable($("#fixedshutter"));
			Disable($("#minshutter"));
			Disable($("#maxshutter"));
			Disable($("#formCamExposureFlicker50"));
			Disable($("#formCamExposureFlicker60"));
		}
		else if($("input[name='formCamExposureMode']:checked:radio").val() == "flicker")
		{
			Disable($("#fixedshutter"));
			Disable($("#minshutter"));
			Disable($("#maxshutter"));

			if(parent.g_brand.imgDevice == "en773v")
			{
				Disable($("#formCamExposureFlicker50"));
				Disable($("#formCamExposureFlicker60"));
			}
			else
			{
				Disable($("#en773v_flickerless50"));
				Disable($("#en773v_flickerless60"));
				Enable($("#formCamExposureFlicker50"));
				Enable($("#formCamExposureFlicker60"));
			}	
		}
	});
	$("input[name='formCamExposureMode']").change();

	$(".linkVCA").click(function(){
		parent.$("#leftmenu .vcaContents + div a[href='vcaenabledisable.html']").click();
		parent.$("#vcaMenuHeader").click();
	});

	$(".linkStream").click(function(){
		parent.$("#streamContents").click();
	});

	if(parent.g_support.videoOutput == true)
	{
		$(".linkVideoOut").click(function(){
			parent.$("#leftmenu .videoaudioContents + div a[href='videoout.html']").click();
		});
	}

	$(".linkFacedetection").click(function(){
		parent.$("#leftmenu .eventConfContents + div a[href='facedetection.html']").click();
		parent.$("#eventMenuHeader").click();
	});
	CheckRotationStabilizationSet();

	$("#formDefogEnable:checkbox").change(function() {
		if($(this).attr("checked") == false)
		{
			Disable($("#formDefogManualLevel"));
		}
		else
		{
			Enable($("#formDefogManualLevel"));
		}
	});
	$("#formDefogEnable:checkbox").change();

	// Gain Control
	$("input[name='gainControlMode']").change(function(){
		var thisMode = $("input[name='gainControlMode']:checked:radio").val();
		setDisplayEnable("#iceLevel, #sliderIceLevel", thisMode == "ice");
		setDisplayEnable("#manualGain, #manualLevel, #sliderManualGain, #sliderManualLevel", thisMode == "manual");
	});
	$("input[name='gainControlMode']").change();
}

function checkTextLimit(selector, minRange, maxRange)
{
	if($(selector).val() < minRange || $(selector).val() > maxRange || $(selector).val() == "")
	{
		return false;
	}
	return true;
}

function EventBind()
{
	var Req = new CGIRequest();
	var playStatus = "STOP";
	var preSize = "";

	var isCodecUse = true;
	$.getScript("/uapi-cgi/resource.cgi?mode=js" + "&_=" + (new Date()).getTime(), function(){
		if(Math.ceil(resUsed) > 50)
			isCodecUse = false;
	});

	$("#btnApply").click(function() {
		if(!checkTextLimit("#formCamBright:text", 0, 255)) return;
		if(!checkTextLimit("#formCamContrast:text", 0, 255)) return;
		if(!checkTextLimit("#formCamSaturation:text", 0, 255)) return;
		if(!checkTextLimit("#formCamSharpness:text", 0, 255)) return;
		if(!checkTextLimit("#formCamNoisefilter:text", 0, 15)) return;
		if(!checkTextLimit("#formCamNoisefilter_sub:text", 0, 15)) return;
		if(!checkTextLimit("#textCamSmartIR:text", 0, 255)) return;
		if(!checkTextLimit("#textCamSmartIR:text", 0, 255)) return;
		if(!checkTextLimit("#formCamGainRed:text", 0, 255)) return;
		if(!checkTextLimit("#formCamGainBlue:text", 0, 255)) return;
		if(!checkTextLimit("#formCamDaytonight:text", 0, 63)) return;
		if(!checkTextLimit("#formCamNighttoday:text", 1, 64)) return;
		if(!checkTextLimit("#formCamWDRLevel:text", 1, 16)) return;
		if(!checkTextLimit("#formCamDWDRLevel:text", 1, 16)) return;
		if(!checkTextLimit("#minshutter:text", 1000, 10000)) return;
		if(!checkTextLimit("#iceLevel:text", 0, 7)) return;
		if(!checkTextLimit("#manualGain:text", 0, 4095)) return;
		if(!checkTextLimit("#manualLevel:text", 0, 4095)) return;
		if(!checkTextLimit("#nucAutoCalibInterval:text", 5, 60)) return;

		var dbRatioValue = videoin_getAttr("CMOS_RATIO");
		var minLimitOfMaxShutter = 30;
		if(isLimitFPS14(dbRatioValue, parent.g_brand.productID))
			minLimitOfMaxShutter = 14;

		if(!checkTextLimit("#maxshutter:text", minLimitOfMaxShutter, 500)) return;

		if(g_videoStandardValue != "cmos")
		{
			if(!checkTextLimit("#horizontaldelay:text", 2, 128)) return;
			if(!checkTextLimit("#verticaldelay:text", g_vDelayMinValue, 128)) return;
		}
		if(Number($("#formCamNighttoday:text").val()) <= Number($("#formCamDaytonight:text").val()))
		{
			alert(GetMsgLang("04020160"));
			return;
		}
		if(isCodecUse == false && $("input[name='formCamRotation']:checked:radio").val() != "none")
		{
			alert(GetMsgLang("04020194"));
			return;
		}

		var orientation = "none";
		var wdrEnableValue = "";
		var wdrLevelValue = "";
		var exposureModeValue = "";
		var reqQString = "action=update&xmlschema";

		var selectorID_verticalFlip = $("#formCamFlip:checkbox");
		var selectorID_verticalMirror = $("#formCamMirror:checkbox");
		if(selectorID_verticalFlip.attr("checked") == true && selectorID_verticalMirror.attr("checked") == true)
		{
			orientation = "hv";
		}
		else if(selectorID_verticalFlip.attr("checked") == true && selectorID_verticalMirror.attr("checked") == false)
		{
			orientation = "v";
		}
		else if(selectorID_verticalFlip.attr("checked") == false && selectorID_verticalMirror.attr("checked") == true)
		{
			orientation = "h";
		}
		else if(selectorID_verticalFlip.attr("checked") == false && selectorID_verticalMirror.attr("checked") == false)
		{
			orientation = "none";
		}
		if(parent.g_brand.pantilt == g_defbrand.type1ptz || parent.g_brand.imgDevice == "en773a" || parent.g_brand.pantilt == g_defbrand.irptz || parent.g_brand.pantilt == g_defbrand.ptz || parent.g_brand.imgDevice == "en773v")
		{
			wdrEnableValue = ($("#formCamWDR:checkbox").attr("checked") == true) ? "yes":"no";
			wdrLevelValue = $("#formCamWDRLevel:text").val() - 1;

			var blcEnableValue = $("input[name='formCamBLC']:checked:radio").val();
			if(wdrEnableValue == "yes" && blcEnableValue == "yes")
			{
				alert(GetMsgLang("04020195"));
				return;
			}
		}
		else
		{
			wdrEnableValue = ($("#formCamDWDR:checkbox").attr("checked") == true) ? "yes":"no";
			wdrLevelValue = $("#formCamDWDRLevel:text").val() - 1;
		}

		//en773v flicker mode
		if(($("input[name='formCamExposureMode']:checked:radio").val() == "manual" && $("input[name='en773v_flickerlessMode']:checked:radio").val() == "50") ||
			 ($("input[name='formCamExposureMode']:checked:radio").val() == "normal" && $("input[name='en773v_flickerlessMode']:checked:radio").val() == "50"))
		{
			exposureModeValue = $("input[name='formCamExposureMode']:checked:radio").val() + "50";
		}
		else if($("input[name='formCamExposureMode']:checked:radio").val() == "manual" ||
			 $("input[name='formCamExposureMode']:checked:radio").val() == "normal")
		{
			exposureModeValue = $("input[name='formCamExposureMode']:checked:radio").val();
		}
		else
		{
			if(parent.g_brand.imgDevice == "en773v")
			{
				exposureModeValue = $("input[name='formCamExposureMode']:checked:radio").val() + "less" + $("input[name='en773v_flickerlessMode']:checked:radio").val();
			}
			else
				exposureModeValue = $("input[name='formCamExposureFlicker']:checked:radio").val();
		}
		console.log("set mode : " + exposureModeValue);
		if(parent.g_brand.imgDevice == "en773v" && ($("input[name='formCamExposureMode']:checked:radio").val() == "manual" || $("input[name='formCamExposureMode']:checked:radio").val() == "flicker")) //manual50, manual60, flickerless50, flickerless60
		{
			if(wdrEnableValue == "yes")
			{
				alert(GetMsgLang("0402019941"));
				return;
			}	
		}
		
		if($("input[name='formCamRotation']:checked:radio").val() != VIDEOIN_CH0_ROTATE_DIRECTION) {
			g_changeRotate = true;
		}

		var isChangeRatio = false;
		if($("input[name='aspectRatioOption']:checked:radio").val() != VIDEOIN_CH0_CMOS_RATIO) {
			isChangeRatio = true;
		}

		QString = makeQString();
		QString
			.set_action('update')
			.set_schema('xml')
			.add_list("VIDEOIN.Ch0.name", encodeURIComponent(VIDEOIN_CH0_NAME), encodeURIComponent($("#formCamName:text").val()))
			.add_list("VIDEOIN.Ch0.Cmos.ratio", VIDEOIN_CH0_CMOS_RATIO, $("input[name='aspectRatioOption']:checked:radio").val())
			.add_list("VIDEOIN.Ch0.Color.brightness", VIDEOIN_CH0_COLOR_BRIGHTNESS, $("#formCamBright:text").val())
			.add_list("VIDEOIN.Ch0.Color.contrast", VIDEOIN_CH0_COLOR_CONTRAST, $("#formCamContrast:text").val())
			.add_list("VIDEOIN.Ch0.Color.saturation", VIDEOIN_CH0_COLOR_SATURATION, $("#formCamSaturation:text").val())
			.add_list("VIDEOIN.Ch0.Color.sharpness", VIDEOIN_CH0_COLOR_SHARPNESS, $("#formCamSharpness:text").val())
			.add_list("VIDEOIN.Ch0.ISP.Exposure.dss", VIDEOIN_CH0_ISP_EXPOSURE_DSS, $("#formCamDSS").val())
			.add_list("VIDEOIN.Ch0.ISP.Exposure.mode", VIDEOIN_CH0_ISP_EXPOSURE_MODE, exposureModeValue)
			.add_list("VIDEOIN.Ch0.ISP.Exposure.minshutter", VIDEOIN_CH0_ISP_EXPOSURE_MINSHUTTER, $("#minshutter").val())
			.add_list("VIDEOIN.Ch0.ISP.Exposure.maxshutter", VIDEOIN_CH0_ISP_EXPOSURE_MAXSHUTTER, $("#maxshutter").val())
			.add_list("VIDEOIN.Ch0.ISP.Exposure.maxagc", VIDEOIN_CH0_ISP_EXPOSURE_MAXAGC, $("#maxagc").val())
			.add_list("VIDEOIN.Ch0.ISP.Exposure.fixedshutter", VIDEOIN_CH0_ISP_EXPOSURE_FIXEDSHUTTER, $("#fixedshutter").val())
			.add_list("VIDEOIN.Ch0.ISP.Exposure.compensation", VIDEOIN_CH0_ISP_EXPOSURE_COMPENSATION, $("#formCamEVComp").val())
			.add_list("VIDEOIN.Ch0.Image.mirror", VIDEOIN_CH0_IMAGE_MIRROR, orientation)
			.add_list("VIDEOIN.Ch0.Light.Daynight.mode", VIDEOIN_CH0_LIGHT_DAYNIGHT_MODE, $("input[name='formCamDaynightMode']:checked:radio").val())
			.add_list("VIDEOIN.Ch0.Light.Backlight.enable", VIDEOIN_CH0_LIGHT_BACKLIGHT_ENABLE, $("input[name='formCamBLC']:checked:radio").val())
			.add_list("VIDEOIN.Ch0.Light.Backlight.zone", VIDEOIN_CH0_LIGHT_BACKLIGHT_ZONE, $("select#formCamBLCZone").val())
			.add_list("VIDEOIN.Ch0.ISP.noisefilter", VIDEOIN_CH0_ISP_NOISEFILTER, $("#formCamNoisefilter:text").val())
			.add_list("VIDEOIN.Ch0.Wdr.enable", VIDEOIN_CH0_WDR_ENABLE, wdrEnableValue)
			.add_list("VIDEOIN.Ch0.Wdr.level", VIDEOIN_CH0_WDR_LEVEL, wdrLevelValue)
			.add_list("VIDEOIN.Ch0.Focus.mode", VIDEOIN_CH0_FOCUS_MODE, $("select#formCamAFM").val())
			// noise filter sub
			.add_list("VIDEOIN.Ch0.ISP.noisefilter", VIDEOIN_CH0_ISP_NOISEFILTER, $("#formCamNoisefilter_sub:text").val())
			.add_list("VIDEOIN.Ch0.ISP.Exposure.irmode", VIDEOIN_CH0_ISP_EXPOSURE_IRMODE, $("input[name='formCamSmartIR']:checked:radio").val())
			.add_list("VIDEOIN.Ch0.ISP.Exposure.irlevel", VIDEOIN_CH0_ISP_EXPOSURE_IRLEVEL, $("#textCamSmartIR:text").val())
			.add_list("VIDEOIN.Ch0.ISP.Whitebalance.mode", VIDEOIN_CH0_ISP_WHITEBALANCE_MODE, $("#formCamWBMode").val())
			.add_list("VIDEOIN.Ch0.ISP.Whitebalance.manualredgain", VIDEOIN_CH0_ISP_WHITEBALANCE_MANUALREDGAIN, $("#formCamGainRed:text").val())
			.add_list("VIDEOIN.Ch0.ISP.Whitebalance.manualbluegain", VIDEOIN_CH0_ISP_WHITEBALANCE_MANUALBLUEGAIN, $("#formCamGainBlue:text").val())
			// Day Night Level
			.add_list("VIDEOIN.Ch0.Light.Daynight.dtnlevel", VIDEOIN_CH0_LIGHT_DAYNIGHT_DTNLEVEL, $("#formCamDaytonight:text").val())
			.add_list("VIDEOIN.Ch0.Light.Daynight.ntdlevel", VIDEOIN_CH0_LIGHT_DAYNIGHT_NTDLEVEL, $("#formCamNighttoday:text").val())
			.add_list("VIDEOIN.Ch0.Deinterlace.enable", VIDEOIN_CH0_DEINTERLACE_ENABLE, ($("#formCamDeinterlaceEnable:checkbox").attr("checked") == true) ? "yes":"no")
			.add_list("VIDEOIN.Ch0.Rotate.direction", VIDEOIN_CH0_ROTATE_DIRECTION, $("input[name='formCamRotation']:checked:radio").val())
			.add_list("VIDEOIN.Ch0.Focus.syncwithdaynight", VIDEOIN_CH0_FOCUS_SYNCWITHDAYNIGHT, ($("#syncDayNight:checkbox").attr("checked") == true) ? "yes":"no")
			.add_list("VIDEOIN.Ch0.Light.Daynight.Sensor.enable", VIDEOIN_CH0_LIGHT_DAYNIGHT_SENSOR_ENABLE, ($("#enableIllumiSensor").attr("checked") == true) ? "yes":"no")
			// Stabilisation
			.add_list("VIDEOIN.Ch0.VS.enable", VIDEOIN_CH0_VS_ENABLE, ($("#stabilizationEnable:checkbox").attr("checked")) ? "yes":"no")
			.add_list("VIDEOIN.Ch0.VS.st0", VIDEOIN_CH0_VS_ST0, ($("#formVStabSt0Enable:checkbox").attr("checked")) ? "yes":"no")
			.add_list("VIDEOIN.Ch0.VS.st1", VIDEOIN_CH0_VS_ST1, ($("#formVStabSt1Enable:checkbox").attr("checked")) ? "yes":"no")
			.add_list("VIDEOIN.Ch0.VS.snapshot", VIDEOIN_CH0_VS_SNAPSHOT, ($("#formVStabSnapshotEnable:checkbox").attr("checked")) ? "yes":"no")
			.add_list("VIDEOIN.Ch0.VS.bordertype", VIDEOIN_CH0_VS_BORDERTYPE, $("select#formVStabBorderType").val())
			.add_list("VIDEOIN.Ch0.Isp.Defog.enable", VIDEOIN_CH0_ISP_DEFOG_ENABLE, ($("#formDefogEnable:checkbox").attr("checked") == true) ? "yes":"no")
			.add_list("VIDEOIN.Ch0.Isp.Defog.Manual.level", VIDEOIN_CH0_ISP_DEFOG_MANUAL_LEVEL, $("select#formDefogManualLevel").val())
			.add_list("VIDEOIN.Ch0.Tim.Noisereduction.enable", VIDEOIN_CH0_TIM_NOISEREDUCTION_ENABLE, ($("#noiseredEnable:checkbox").attr("checked")) ? "yes":"no")
			.add_list("VIDEOIN.Ch0.Tim.Metadata.enable", VIDEOIN_CH0_TIM_METADATA_ENABLE, ($("#thermalMetaEnable:checkbox").attr("checked")) ? "yes":"no")
			.add_list("VIDEOIN.Ch0.Tim.Colorization.mode", VIDEOIN_CH0_TIM_COLORIZATION_MODE, $("input[name='colTable']:checked:radio").val())
			.add_list("VIDEOIN.Ch0.Tim.Colorization.polarity", VIDEOIN_CH0_TIM_COLORIZATION_POLARITY, ($("#colorNegativeEnable:checkbox").attr("checked")) ? "negative":"positive")
			.add_list("VIDEOIN.Ch0.Tim.Gaincontrol.Ice.level", VIDEOIN_CH0_TIM_GAINCONTROL_ICE_LEVEL, $("#iceLevel:text").val())
			.add_list("VIDEOIN.Ch0.Tim.Gaincontrol.Manual.gain", VIDEOIN_CH0_TIM_GAINCONTROL_MANUAL_GAIN, $("#manualGain:text").val())
			.add_list("VIDEOIN.Ch0.Tim.Gaincontrol.Manual.offset", VIDEOIN_CH0_TIM_GAINCONTROL_MANUAL_OFFSET, $("#manualLevel:text").val())
			.add_list("VIDEOIN.Ch0.Tim.Nuc.interval", VIDEOIN_CH0_TIM_NUC_INTERVAL, $("#nucAutoCalibInterval:text").val())
			.add_list("VIDEOIN.Ch0.Tim.Gaincontrol.mode", VIDEOIN_CH0_TIM_GAINCONTROL_MODE, $("input[name='gainControlMode']:checked:radio").val())
			.add_list("VIDEOIN.Ch0.Tim.agcspeed", VIDEOIN_CH0_TIM_AGCSPEED, $("input[name='agcMergeSpeedOption']:checked:radio").val());

		if (g_videoStandardValue == "ntsc")
		{
			QString
				.add_list("VIDEOIN.Ch0.Adjust.Ntsc.vdelay", VIDEOIN_CH0_ADJUST_NTSC_VDELAY, $("#verticaldelay:text").val())
				.add_list("VIDEOIN.Ch0.Adjust.Ntsc.hdelay", VIDEOIN_CH0_ADJUST_NTSC_HDELAY, $("#horizontaldelay:text").val());
		}
		else if (g_videoStandardValue == "pal")
		{
			QString
				.add_list("VIDEOIN.Ch0.Adjust.Pal.vdelay", VIDEOIN_CH0_ADJUST_PAL_VDELAY, $("#verticaldelay:text").val())
				.add_list("VIDEOIN.Ch0.Adjust.Pal.hdelay", VIDEOIN_CH0_ADJUST_PAL_HDELAY, $("#horizontaldelay:text").val());
		}
		reqQString = QString.get_qstring();
		if(!reqQString) {
			if(g_brandDeviceType == "speeddome")
			{
				SetPtzStatus(0);
			}
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

			if(g_brandDeviceType == "speeddome")
			{
				SetPtzStatus(1);
			}
			LoadParamJs(g_defaultGroup, function() {
				InitSetting();
				SetRelation();
				if(g_changeRotate == true || isChangeRatio == true)
				{
					refreshPreview();
				}
				ViewLoadingSave(false);
			});

			return;
		});
		Req.SetErrorFunc(function(){
			LoadParamJs(g_defaultGroup, function() {
				alert(GetMsgLang("0501"));
				ViewLoadingSave(false);
			});
			return;
		});
		Req.Request(reqQString);
	});

	$("#btnView").toggle(
		function(){
			g_flagView = false;
			preSize = parent.document.getElementById("contentFrame").height - (g_streamHeight + 15);
			playStatus = "STOP";
			if(browserCheck() == "msie")
			{
				if(g_streamPlayFlag != 0)
				{
					player_start(playStatus);
				}

				$("#viewToggle").css("display", "none");
			}
			else
			{
				if(g_streamPlayFlag != 0)
				{
					qtime_start(playStatus);
				}

				$("#viewToggle").css("display", "none");
			}
			ResizePage(preSize);
		},
		function(){
			g_flagView = true;
			playStatus = "PLAY";
			if(browserCheck() == "msie")
			{
				if(g_streamPlayFlag != 1)
					player_start(playStatus);
			}
			else
			{
				if(g_streamPlayFlag != 1)
					qtime_start(playStatus);
			}
			$("#viewToggle").css("display", "block");
			ResizePage();
			parent.$('html, body').animate({scrollTop:10000}, 0);
		}
	);

	$("#btnPopup").click(function()
	{
		if(g_flagView == true)
		{
			$("#btnView").click();
		}

		var pageWidth=670;
		var pageHeight = 460;
		if(g_streamWidth < g_streamHeight)
		{
			pageHeight = 730;
		}

		var previewSrc = "/config/popup.html"
		var previewParam = "scrollbars=yes,toolbar=0,location=no,directories=0,status=0,menubar=0,resizable=1,width="+pageWidth+",height="+pageHeight;
		window.open(previewSrc, "Popup", previewParam);
	});

	//TestView
	$("#btnStop").click(function()
	{
		if($("#viewToggle").css("display") == "block")
		{
			document.preview.Stop();
		}
	});

	$("#btnStart").click(function()
	{
		if($("#viewToggle").css("display") == "block")
		{
			document.preview.Play();
		}
	});

	$("#btnCalibrate").click(function()
	{
		ViewLoadingSave(true);
		var req = new CGIRequest();
		req.SetAddress("/uapi-cgi/timcontrol.cgi?action=nuc");
		req.SetCallBackFunc(function(){ViewLoadingSave(false);});
		req.SetErrorFunc(function(){ViewLoadingSave(false);});
		req.Request();
	});
}

function player_start(playStatus)
{
	if(playStatus == "STOP")
	{
		g_streamPlayFlag = 0;
		AxUMF_stop();
	}
	else if(playStatus == "PLAY")
	{
		g_streamPlayFlag = 1;
		AxUMF_play();
	}
}

function qtime_start(playStatus)
{
	var haveqt = false;

	if (navigator.plugins) {
		for (i=0; i < navigator.plugins.length; i++ ) {
			console.log(navigator.plugins[i].name);
			if (navigator.plugins[i].name.indexOf("QuickTime") >= 0) {
				haveqt = true;
			}
		}
	}

	var streamNum = 0;
	var trans = "UNICAST";
	var rtspPort = NETWORK_RTSP_PORT;
	var ipAddr = document.domain;
	var firstStreamEnable = ENCODER_CH0_VIDEOCODEC_ST0_ENABLE;
	var secondStreamEnable = ENCODER_CH0_VIDEOCODEC_ST1_ENABLE;
	var streamUri = "rtsp://" + ipAddr + ":" + rtspPort +"/";

	streamNum = firstStreamEnable=="yes" ? 0: 1;
	if(firstStreamEnable =="yes")
	{
		trans = NETWORK_RTP_ST0_UNICAST_ENABLE == "yes" ? "UNICAST" : "MULTICAST";
	}
	else if(secondStreamEnable == "yes")
	{
		trans = NETWORK_RTP_ST1_UNICAST_ENABLE == "yes" ? "UNICAST" : "MULTICAST";
	}

	streamUri += window["NETWORK_RTP_ST" + streamNum + "_" + trans + "_NAME"];
	var objStr = "<div id='objVideoScreen' style='width:" + g_streamWidth + "px; height:" + g_streamHeight + "px;'>" +
	"<object width=100% height=100%" +
	" CODEBASE='http://www.apple.com/qtactivex/qtplugin.cab' ONERROR='qtime_error();'>" +
	//"<param name='src' value='/images/qtposter.mov'>" +
	"<param name='qtsrc' value='" + streamUri + "'>" +
	"<param name='autoplay' value='true'>" +
	"<param name='controller' value='false'>" +
	"<param name='type' value='video/quicktime'>" +
	"<param name='scale' value='tofit'>" +
	"<param name='target' value='myself'>" +
	"<embed id='VideoScreen'" +
	" name='preview'" +
	" width=100% height=100%" +
	" type='video/quicktime'" +
	" src='/images/qtposter.mov'" +
	" src='" + streamUri + "'" +
	" qtsrc='" + streamUri + "'" +
	" autoplay='true'" +
	" controller='false'" +
	" type='video/quicktime'" +
	" scale='tofit'" +
	" target='myself'" +
	" plugin='quicktimeplugin'" +
	" cache='false'" +
	" pluginspage='http://www.apple.com/quicktime/download/'" +
	" loop='false'" +
	"/>" +
	"</object>" +
	"</div>";

	$("#screen").html(objStr);

	if(haveqt == false)
	{
		qtime_error();
		return;
	}
}

function GetAnalogOutputStatus()
{
	$.get("/nvc-cgi/ptz/ptz2.fcgi?getvouttype" + "&_=" + (new Date()).getTime(), function(data) {
		if(data.substring(0,2) != "#4")
		{
			g_analogOuputValue = data.split("\n")[1].split("=")[1];
			g_analogOuputValue = (g_analogOuputValue == 0) ? "ntsc" : "pal";
			$("input[name='formCamAnalogOutput'][value='" + g_analogOuputValue + "']:radio").attr("checked", "checked");
		}
	});
}

function SetPtzStatus(setFlag)
{
	var reqQString_AnalogOutput = $("input[name='formCamAnalogOutput']:checked:radio").val();

	if(g_analogOuputValue == reqQString_AnalogOutput)
	{
		return;
	}
	if(setFlag == 0)
	{
		ViewLoadingSave(true);
	}

	if(g_analogOuputValue != reqQString_AnalogOutput)
	{
		reqQString_AnalogOutput = "setvouttype=" + ((reqQString_AnalogOutput == "ntsc") ? "0":"1");
	}
	else
	{
		reqQString_AnalogOutput = "";
	}

	$.get("/nvc-cgi/ptz/ptz2.fcgi?" + reqQString_AnalogOutput + "&_=" + (new Date()).getTime(), function() {
		GetAnalogOutputStatus();

		if(setFlag == 0)
		{
			ViewLoadingSave(false);
		}
	});
}

function InitStartVideo()
{
	g_streamPlayFlag = 1;
	playStatus = "PLAY";
	g_snapshotPlayFlag = false;

	setResizeWidthHeight();
	getPid(g_rtspPIDStatusPath);

	if(browserCheck() == "msie")
	{
		AxUMF_create(g_streamWidth, g_streamHeight, StartSnapshot, function () {
			g_streamPlayFlag = 1;
			if(AxUMF !== undefined)
			{
				AxUMF.SetParam("CONTROL", "AUDIO", "OFF");
			}
		 }, null);
	}
	else
	{
		if(NETWORK_SRTP_ENABLE=="yes")
		{
			StartSnapshot();
		}
		else
		{
			qtime_start(playStatus);
		}
	}
}

function qtime_error()
{
	setTimeout(StartSnapshot, 1000);
}

function activex_error()
{
	StartSnapshot();
}

function StartSnapshot()
{
	$("#screen").empty();
	$("#screen").append("<img>")
		.find("img:last").attr("id", "snapshotArea");

	$("#snapshotArea").attr({
		width: g_streamWidth,
		height: g_streamHeight
	});

	g_snapshotPlayFlag = true;
	$("#snapshotArea").hide();
	reflashImage();
}

function reflashImage() {
	loadImage = function() {
		if(g_snapshotPlayFlag === false) {
			return;
		}
		$("#snapshotArea").attr("src", ImageBuf.src);
		$("#snapshotArea").show();
		if(g_snapshotResizeFlag == false)
		{
			ResizePage();
			g_snapshotResizeFlag = true;
		}

		setTimeout(function() {
			ImageBuf.src = g_snapshotURL + "?_=" + (new Date()).getTime();
		}, 200);
	}
	var ImageBuf = new Image();
	$(ImageBuf).load(loadImage);
	$(ImageBuf).error(function() {
		setTimeout(function() {
			ImageBuf.src = g_snapshotURL + "?_=" + (new Date()).getTime();
		}, 1000);
	});
	ImageBuf.src = g_snapshotURL;
}

function FlipMirrorException()
{
	$("#formCamFlip:checkbox, #formCamMirror:checkbox").change(function() {
		$("#formCamFlip:checkbox").attr("checked", $(this).attr("checked") == true ? "checked" : "");
		$("#formCamMirror:checkbox").attr("checked", $(this).attr("checked") == true ? "checked" : "");
	});
	$("#formCamFlip:checkbox, #formCamMirror:checkbox").change();
}

function FlipMirrorLoad(orientationType)
{
	if(orientationType == "none")
	{
		$("#formCamMirror:checkbox").attr("checked", "");
		$("#formCamFlip:checkbox").attr("checked", "");
	}
	else if(orientationType == "h")
	{
		$("#formCamMirror:checkbox").attr("checked", "checked");
		$("#formCamFlip:checkbox").attr("checked", "");
	}
	else if(orientationType == "v")
	{
		$("#formCamMirror:checkbox").attr("checked", "");
		$("#formCamFlip:checkbox").attr("checked", "checked");
	}
	else if(orientationType == "hv")
	{
		$("#formCamMirror:checkbox").attr("checked", "checked");
		$("#formCamFlip:checkbox").attr("checked", "checked");
	}
}

function FlipMirrorLoadException()
{
	$.get("/nvc-cgi/ptz/ptz2.fcgi?aux_query=flip&aux_query=mirror" + "&_=" + (new Date()).getTime(), function(data) {
		if(data.substring(0,2) != "#4")
		{
			var infoFlip = data.split("\n")[1].split("=")[1];
			var infoMirror = data.split("\n")[2].split("=")[1];

			if(infoFlip == 0 && infoMirror == 0)
			{
				$("#formCamMirror:checkbox").attr("checked", "");
				$("#formCamFlip:checkbox").attr("checked", "");
			}
			else if(infoFlip == 0 && infoMirror == 1)
			{
				$("#formCamMirror:checkbox").attr("checked", "checked");
				$("#formCamFlip:checkbox").attr("checked", "");
			}
			else if(infoFlip == 1 && infoMirror == 0)
			{
				$("#formCamMirror:checkbox").attr("checked", "");
				$("#formCamFlip:checkbox").attr("checked", "checked");
			}
			else if(infoFlip == 1 && infoMirror == 1)
			{
				$("#formCamMirror:checkbox").attr("checked", "checked");
				$("#formCamFlip:checkbox").attr("checked", "checked");
			}
		}
	});
}

function setResizeWidthHeight()
{
	var changeWidthHeight = adjustRatioWidthHeight(VIDEOIN_CH0_CMOS_RATIO, g_defaultHeight);
	g_streamWidth = changeWidthHeight[0];
	g_streamHeight = changeWidthHeight[1];

	if(VIDEOIN_CH0_ROTATE_DIRECTION != "none")
	{
		var result = ExchangeValues(g_streamWidth, g_streamHeight);
		g_streamWidth = result.value1;
		g_streamHeight = result.value2;
	}
}

function getPid(path)
{
	var xmlhttp;
	if (window.XMLHttpRequest)
	{
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	}
	else
	{
		// code for IE6, IE5
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange=function() {
		if (xmlhttp.readyState==4 && xmlhttp.status==200)
		{
			g_responsRtspPid = $.trim(xmlhttp.responseText);
		}
	}
	xmlhttp.open("GET", path, true);

	xmlhttp.send();
}

function refreshPreview()
{
	_stop_video = function()
	{
		if(browserCheck() == "msie")
			AxUMF_stop();
		else
			$("#btnStop").click();
	};

	_start_video = function()
	{
		if(browserCheck() == "msie")
			AxUMF_play();
		else
			$("#btnStart").click();
	};

	if(g_responsRtspPid != null && g_saveRtspPid == null){
		g_saveRtspPid = g_responsRtspPid;
	}

	getPid(g_rtspPIDStatusPath);

	if(g_rotateInterval != null){
		clearInterval(g_rotateInterval);
		g_rotateCounter = 0;
	}

	_stop_video();
	setResizeWidthHeight();
	ResizeVideo();
	ResizePage();

	g_rotateInterval = setInterval(function() {
		if(g_rotateCounter<10){
			g_rotateCounter += 1;

			if(g_saveRtspPid != g_responsRtspPid){
				_start_video();
				clearInterval(g_rotateInterval);
				g_saveRtspPid = g_responsRtspPid;
			}

			getPid(g_rtspPIDStatusPath);
		}else{
			_start_video();
			clearInterval(g_rotateInterval);
			g_saveRtspPid = g_responsRtspPid;
		}
	}, 3000);
}

function ResizeVideo()
{
	if(g_snapshotPlayFlag == true)
	{
		$("#snapshotArea").attr({
			width: g_streamWidth,
			height: g_streamHeight
		});
	}
	else
	{
		if(browserCheck() == "msie")
			AxUMF_resize(g_streamWidth, g_streamHeight);
		else
			$("#objVideoScreen").attr("style" , "width:" + g_streamWidth + "px; height:" + g_streamHeight + "px;");
	}
}

function aspectRatioEnable(isEnable)
{
	if(isEnable)
		Enable($(".aspectRatioContents"));
	else
		Disable($(".aspectRatioContents"));
}

function CheckRotationStabilizationSet()
{
	if(g_vcaEnableFlag || g_tvoutEnableFlag || g_faceEnableFlag)
	{
		Disable($("input[name='formCamRotation']:radio"));
		Disable($("#formVStabSt0Enable"));
		Disable($("#formVStabSt1Enable"));
		Disable($("#formVStabSnapshotEnable"));
		Disable($("#formVStabBorderType"));
	}
	else
	{
		$("input[name='formCamRotation']").change(function(){
			if($("input[name='formCamRotation']:checked:radio").val() == "none")
			{
				if(g_faceEnableFlag == false)
				{
					Enable($("#formVStabSt0Enable:checkbox"));
					Enable($("#formVStabSt1Enable:checkbox"));
					Enable($("#formVStabSnapshotEnable:checkbox"));
				}
				Enable($("#formVStabBorderType"));
				//aspectRatioEnable(true);
			}
			else
			{
				Disable($("#formVStabSt0Enable:checkbox"));
				Disable($("#formVStabSt1Enable:checkbox"));
				Disable($("#formVStabSnapshotEnable:checkbox"));
				Disable($("#formVStabBorderType"));
				//aspectRatioEnable(false);
			}
		});
		$("input[name='formCamRotation']").change();

		// Stabilization
		$(".StabilizationStream:checkbox").change(function() {
			var state = false;
			$(".StabilizationStream:checkbox").each(function(){
				if ($(this).attr("checked") == true)
				{
					state = true;
				}
			});
			if (state == true)
			{
				Disable($("input[name='formCamRotation']"));
				//aspectRatioEnable(false);
			}
			else
			{
				Enable($("input[name='formCamRotation']"));
				//aspectRatioEnable(true);
			}
		});
		$(".StabilizationStream:checkbox").change();
	}

	if(g_faceEnableFlag)
	{
		Disable($("#formVStabSt0Enable"));
		Disable($("#formVStabSt1Enable"));
		Disable($("#formVStabSnapshotEnable"));
	}
}
