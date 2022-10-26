var DefaultGroup = "ENCODER";
var g_speedMFZ = 0;
var initValue = false;
var selectProfile = "";
var re_nSelected = 0;
var showProfileFlag = 0;
var nowStream = 0;
var Allow = false;
var loadingFlag = 0;
var g_stream0_limit_fps = 30;
var g_stream0_limit_gop = 30;
var g_stream1_limit_fps = 30;
var g_stream1_limit_gop = 30;
var profileLoadCheck = 0;
var g_isVcaEnable = false;
var IsCodecUsageRestriction = true;
var g_videoStandard = "";
var g_aspectRatioDBValue = "16:9";
var g_rotateDBValue = "none";
var g_isLimitSeek = false;
var g_resListForSeek = ["960x540", "1024x768", "xga", "1120x630", "1280x720"];

$(function () {
	PreCustomize();
	initEnvironment();
	initBrand();
	initConfig();
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum = ["0402069904", "0402069905", "0402069906", "0402069907", "0402069908", "0402069912", "0501"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "stream",
				parent.g_langData[parent.g_configData.language]);
}

function initConfig()
{
	var vcaReq = new CGIRequest();
	vcaReq.SetAddress("/uapi-cgi/param.cgi?action=list&group=VCA.Ch0.enable&xmlschema");
	vcaReq.SetCallBackFunc(function(xml){
		if($('Ch0 > enable', xml).size() > 0)
		{
			if($('Ch0 > enable', xml).text().toLowerCase() == 'yes')
				g_isVcaEnable = true;
		}

		getDataConfig_UAPI("SYSTEM.Properties.Stream.resolution", function(data){
			initDataValue(data);
			LoadParamJs("ENCODERPROFILE&ENCODER&SYSTEM&SYSTEM.Status.Videoin\
				&VIDEOIN.Ch0.Cmos.ratio&VIDEOIN.Ch0.Rotate.direction", Run);
		});
	});
	vcaReq.Request();
}

function Run()
{
	ENCODER_CH0_VIDEOCODEC_ST0_STANDARD = ENCODER_CH0_VIDEOCODEC_ST0_STANDARD.toLowerCase();
	ENCODER_CH0_VIDEOCODEC_ST1_STANDARD = ENCODER_CH0_VIDEOCODEC_ST1_STANDARD.toLowerCase();
	g_videoStandard = SYSTEM_STATUS_VIDEOIN_CH0_STANDARD.toLowerCase();
	g_aspectRatioDBValue = VIDEOIN_CH0_CMOS_RATIO.toLowerCase();
	g_rotateDBValue = VIDEOIN_CH0_ROTATE_DIRECTION.toLowerCase();

	if(g_isVcaEnable && "seek-thermal" == parent.g_brand.imgDevice)
		g_isLimitSeek = true;

	InitForm();
	InitSetting();
	SetRelation();
	EventBind();
	ContentShow();
	PostCustomize();
}

function InitForm()
{
	initValue = false;
	var resArray = g_dataArray["system_properties_stream_resolution"].split(",");

	if("rs51c0b" == parent.g_brand.imgDevice ||
		"mdc200s" == parent.g_brand.imgDevice ||
		"mdc600s" == parent.g_brand.imgDevice)
	{
		Disable($(".resolution"));
	}



	if("rs51c0b" == parent.g_brand.imgDevice ||
		"mdc200s" == parent.g_brand.imgDevice ||
		"mdc600s" == parent.g_brand.imgDevice)
	{
		$(".maxFPSContents, .gopContents, .resContents, .brcContents, .showBtnContents").css("display", "none");
		$(".stream_tab#stream_tab").height(150);
		Disable($("#formEncoderPFEnable_stream_0"));
	}

	$("button").button();
	$(":text").numeric();

	if(parent.g_configData.skin != "noline-silver")
	{
		$("ul.line-delimiter").css("display", "none");
	}

	if (parent.g_brand.cameraClass == "encoder")
	{
		$("#codecUsageInfo").css("display", "none");
		$("#formEncoderUsage").css("display", "none");
	}

	$(".resolution option").remove();
	$(".resolution").each(function() {
		var i = 0;
		var resolutionSubText = "";

		while (resArray[i])
		{
			var isAdd = true;
			if("seek-thermal" == parent.g_brand.imgDevice && $(this).attr("id") == "formResolution_stream_1")
			{
				$.each(g_resListForSeek, function(index, value){
					if(resArray[i] == value)
					{
						isAdd = false;
						return false;
					}
				});
			}

			if(isAdd)
			{
				if(g_speedMFZ == 1)
				{
					if(resArray[i] == "1920x1080")
						resArray[i] = "1280x960";
				}

				resolutionSubText = (g_aspectRatioDBValue == "16:9" ? "" : " (" + translateResolution(g_videoStandard, resArray[i]) + ")");
				$(this).append("<option value=" + resArray[i] + ">" + resArray[i].toUpperCase() + resolutionSubText + "</option>");
				if(g_rotateDBValue != "none" && resArray[i] == "qqvga")
				{
					Disable($(".resolution option[value='qqvga']"));
					$(".QQVGARotationEx").css("display", "block");
				}
			}

			i++;
		}
	});

	$("#stream_tab").tabs({
		select: function(event, ui)
		{
			nSelected = ui.index;
			re_nSelected = nSelected;
		}
	});

	$("#stream_tab > div").each(function(index, element) {
		if(!$(this).html())
		{
			switch($(this).attr("id"))
			{
				case "stream_0":
					objId = "stream_stream_0";
					break;
				case "stream_1":
					objId = "stream_stream_1";
					break;
				case "snapshot":
					objId = "stream_snapshot";
					break;
				case "audio":
					objId = "stream_audio";
					break;
				default:
					return false;
					break;
			}
			$(this).remove("form");
			$(this).append("<form>" + $("#"+objId).html() + "</form>");
			InitSubSetting(index);
		}
	});

	if(isLimitFPS14(g_aspectRatioDBValue, parent.g_brand.productID) || isLimitStreamForSeek())
		$(".stream_1_contents").css("display", "none");

	initValue = true;
	useInfo();
}

function InitSetting()
{
	var ProfileGroup = DefaultGroup + "PROFILE";
	var profileList;
	var profile_cnt = eval(ProfileGroup + "_NBROFPROFILE");

	if(profile_cnt > 0)
		profileList = eval(ProfileGroup + "_LIST").split(",");

	$("select#formProfileList").empty();
	for(var i = 0; i < profile_cnt; i++)
	{
		var group = ProfileGroup + "_" + profileList[i].toUpperCase();
		var resolv_0 = eval(group+"_VIDEOCODEC_ST0_STANDARD");
		var size_0 = eval(group+"_VIDEOCODEC_ST0_"+resolv_0.toUpperCase()+"_RESOLUTION").toLowerCase();
		var resolv_1 = eval(group+"_VIDEOCODEC_ST1_STANDARD");
		var size_1 = eval(group+"_VIDEOCODEC_ST1_"+resolv_1.toUpperCase()+"_RESOLUTION").toLowerCase();

		var descListCheck = eval(group+"_DESCRIPTION");
		var cnt = 0;

		for(var j = 0; j < descListCheck.length; ++j)
		{
			if(descListCheck.charAt(j) != ' ')
				++cnt;
		}

		if(cnt == 0)
		{
			descListCheck = "";
		}
		else
		{
			descListCheck = eval(group+"_DESCRIPTION");
		}

		if (eval(group+"_VIDEOCODEC_ST0_ENABLE") == "no")
		{
			resolv_0 = " ";
			size_0 = " ";
		}
		if (eval(group+"_VIDEOCODEC_ST1_ENABLE") == "no")
		{
			resolv_1 = " ";
			size_1 = " ";
		}
		if(g_speedMFZ == 1)
		{
			if(size_0 == "1920x1080")
				size_0 = "1280x960";
			if(size_1 == "1920x1080")
				size_1 = "1280x960";
		}
		if (parent.g_configData.langPath == "/language/Arabic.xml") {
			$("select#formProfileList").append("<option value='" + profileList[i] + "'>&lrm;</option>")
			.find("option").last().append(
				FillText(resolv_1 + '-' + size_1, (resolv_1 + '-' + size_1).length, "right")
				+ FillText(resolv_0 + '-' + size_0, 22, "right")
				+ FillText(descListCheck, 29, "right")
				+ FillText(eval(group+"_NAME"), 14, "right")
			);
		}
		else {
			$("select#formProfileList").append("<option value='" + profileList[i] + "'></option>")
			.find("option").last().append("&nbsp;"
				+ FillText(eval(group+"_NAME"), 14, "left")
				+ FillText(descListCheck, 29, "left")
				+ FillText(resolv_0 + '-' + size_0, 22, "left")
				+ FillText(resolv_1 + '-' + size_1, 22, "left")
			);
		}
	}
	reRange();
}

function InitSubSetting(idx)
{
	//initValue = false;
	var profile = DefaultGroup + "_CH0" ;
	switch(idx)
	{
		// first stream
		case 0:
			var codecDB = eval(profile + "_VIDEOCODEC_ST0_STANDARD"); // DB codec 값

			// Enable streaming
			if(eval(profile + "_VIDEOCODEC_ST0_ENABLE") == "yes")
				$("#formEncoderPFEnable_stream_0:checkbox").attr("checked", "checked");
			else
				$("#formEncoderPFEnable_stream_0:checkbox").attr("checked", "");

			// Video codec
			$("select#formEncoderPFVCodec_stream_0").val(eval(profile + "_VIDEOCODEC_ST0_STANDARD"));
			$("select#formEncoderPFVCodec_stream_0").unbind().change(function() {
				if($("#formEncoderPFEnable_stream_0:checkbox").attr("checked") == true)
					useInfo();
			});

			// Resolution
			$("#formResolution_stream_0").val(eval(profile + "_VIDEOCODEC_ST0_" + codecDB.toUpperCase() + "_RESOLUTION").toLowerCase());
			$("select#formResolution_stream_0").unbind().change(function() {
				if($("#formEncoderPFEnable_stream_0:checkbox").attr("checked") == true)
				{
					reRange();
				}
			});
			$("#formEncoderPFEnable_stream_0:checkbox").change(useInfo);

			// Max. FPS
			$("#formMaxFps_stream_0:text").val(eval(profile + "_VIDEOCODEC_ST0_" + codecDB.toUpperCase() + "_MAXFPS"))
			.parent().parent().find(".slider-bar").slider({
				range: 'min',
				min: 1,
				max: 30,
				change: function(event, ui) {
					if($("#formEncoderPFEnable_stream_0:checkbox").attr("checked") == true)
						useInfo();
				},
				value: eval(profile + "_VIDEOCODEC_ST0_" + codecDB.toUpperCase() + "_MAXFPS"),
				slide: function(event, ui) {
					$("#formMaxFps_stream_0:text").val(ui.value);
				}
			});

			$("#formGOP_stream_0:text").val(Number(eval(profile + "_VIDEOCODEC_ST0_H264_PCOUNT")) + 1)
			.parent().parent().find(".slider-bar").slider({
				range: 'min',
				min: 1,
				max: 30,
				value: Number(eval(profile + "_VIDEOCODEC_ST0_H264_PCOUNT")) + 1,
				slide: function(event, ui) {
					$("#formGOP_stream_0:text").val(ui.value);
				}
			});
			$("#maxBitrate_text_st0:text").val(eval(profile + "_VIDEOCODEC_ST0_H264_MAXBITRATE"))
			.parent().parent().find(".slider-bar").slider({
				range: 'min',
				min: g_defrange.minbitrate,
				max: g_defrange.maxbitrate,
				value: eval(profile + "_VIDEOCODEC_ST0_H264_MAXBITRATE"),
				slide: function(event, ui) {
					$("#maxBitrate_text_st0:text").val(ui.value);
				}
			});
			$("#formBitrate_stream_0:text").val(eval(profile + "_VIDEOCODEC_ST0_H264_BITRATE"))
			.parent().parent().find(".slider-bar").slider({
				range: 'min',
				min: g_defrange.minbitrate,
				max: g_defrange.maxBitrateCBR,
				value: eval(profile + "_VIDEOCODEC_ST0_H264_BITRATE"),
				slide: function(event, ui) {
					$("#formBitrate_stream_0:text").val(ui.value);
				}
			});
			$("#formQuality_stream_0:text").val(eval(profile + "_VIDEOCODEC_ST0_MJPEG_QUALITY"))
			.parent().parent().find(".slider-bar").slider({
				range: 'min',
				min: 0,
				max: 100,
				value: eval(profile + "_VIDEOCODEC_ST0_MJPEG_QUALITY"),
				slide: function(event, ui) {
					$("#formQuality_stream_0:text").val(ui.value);
				}
			});

			// Profile identification
			$("#formProfileid_0").val(eval(profile + "_VIDEOCODEC_ST0_H264_PROFILE"));

			// Multiple slices
			if(eval(profile + "_VIDEOCODEC_ST0_H264_SLICE") == "yes")
			{
				$("#formMultipleSlices_stream_0:checkbox").attr("checked", "checked");
			}
			else
			{
				$("#formMultipleSlices_stream_0:checkbox").attr("checked", "");
			}

			// Bit rate control
			$("input[name='formBitrateCtrl_stream_0'][value='" + eval(profile + "_VIDEOCODEC_ST0_H264_BITRATECTRL") + "']:radio").attr("checked", "checked");

			// Q Value
			$("#formBRC_VBR_stream_0_QValue").val(eval(profile + "_VIDEOCODEC_ST0_H264_QVALUE"));


			// 텍스트 박스 & 슬라이더바
			$("#formMaxFps_stream_0:text").unbind().keyup(function() {
				$("#sliderMaxFps_stream_0").slider("value", $("#formMaxFps_stream_0:text").val());
			}).blur(function() {
				var inputValMaxFps = $("#formMaxFps_stream_0:text").val()-0;
				$("#formMaxFps_stream_0:text").val(inputValMaxFps);
				var rangeMaxfps = eval(profile + "_VIDEOCODEC_ST0_" + codecDB.toUpperCase() + "_MAXFPS");

				if(inputValMaxFps < 1 || inputValMaxFps > 30 || inputValMaxFps == "")
				{
					$("#formMaxFps_stream_0:text").val(rangeMaxfps).focus();
					$("#sliderMaxFps_stream_0").slider("value", rangeMaxfps);
					alert(GetMsgLang("0402069904"));
				}
			});

			$("#formGOP_stream_0:text").unbind().keyup(function() {
				$("#sliderGOP_stream_0").slider("value", $("#formGOP_stream_0:text").val());
			}).blur(function() {
				var inputValPcount = $("#formGOP_stream_0:text").val()-0;
				$("#formGOP_stream_0:text").val(inputValPcount);
				var rangePcount;

				rangePcount = Number(eval(profile + "_VIDEOCODEC_ST0_H264_PCOUNT")) + 1;

				if(inputValPcount < 1 || inputValPcount > 30 || inputValPcount == "")
				{
					$("#formGOP_stream_0:text").val(rangePcount).focus();
					$("#sliderGOP_stream_0").slider("value", rangePcount);
					alert(GetMsgLang("0402069904"));
				}
			});

			$("#maxBitrate_text_st0:text").unbind().keyup(function() {
				$("#maxBitrate_slider_st0").slider("value", $("#maxBitrate_text_st0:text").val());
			}).blur(function() {
				var inputValBitrate = $("#maxBitrate_text_st0:text").val()-0;
				$("#maxBitrate_text_st0:text").val(inputValBitrate);
				var rangeBitrate;

				rangeBitrate = eval(profile + "_VIDEOCODEC_ST0_H264_MAXBITRATE");

				if(inputValBitrate < g_defrange.minbitrate || inputValBitrate > g_defrange.maxbitrate || inputValBitrate == "")
				{
					$("#maxBitrate_text_st0:text").val(rangeBitrate).focus();
					$("#maxBitrate_slider_st0").slider("value", rangeBitrate);
					alert(GetMsgLang("0402069904"));
				}
			});

			$("#formBitrate_stream_0:text").unbind().keyup(function() {
				$("#sliderBitrate_stream_0").slider("value", $("#formBitrate_stream_0:text").val());
			}).blur(function() {
				var inputValBitrate = $("#formBitrate_stream_0:text").val()-0;
				$("#formBitrate_stream_0:text").val(inputValBitrate);
				var rangeBitrate;

				rangeBitrate = eval(profile + "_VIDEOCODEC_ST0_H264_BITRATE");

				if(inputValBitrate < g_defrange.minbitrate || inputValBitrate > g_defrange.maxBitrateCBR || inputValBitrate == "")
				{
					$("#formBitrate_stream_0:text").val(rangeBitrate).focus();
					$("#sliderBitrate_stream_0").slider("value", rangeBitrate);
					alert(GetMsgLang("0402069904"));
				}
			});

			$("#formQuality_stream_0:text").unbind().keyup(function() {
				$("#sliderQuality_stream_0").slider("value", $("#formQuality_stream_0:text").val());
			}).blur(function() {
				var inputValQuality = $("#formQuality_stream_0:text").val()-0;
				$("#formQuality_stream_0:text").val(inputValQuality);
				if($(this).val() == 0) return;
				var rangeQuality;

				rangeQuality = eval(profile + "_VIDEOCODEC_ST0_MJPEG_QUALITY");

				if(inputValQuality < 0 || inputValQuality > 100 || inputValQuality == "")
				{
					$("#formQuality_stream_0:text").val(rangeQuality).focus();
					$("#sliderQuality_stream_0").slider("value", rangeQuality);
					alert(GetMsgLang("0402069904"));
				}
			});

			SetSubRelation(idx);
			break;

		// second stream
		case 1:
			var codecDB = eval(profile + "_VIDEOCODEC_ST1_STANDARD"); // DB codec 값

			// Enable streaming
			if(eval(profile + "_VIDEOCODEC_ST1_ENABLE") == "yes")
				$("#formEncoderPFEnable_stream_1:checkbox").attr("checked", "checked");
			else
				$("#formEncoderPFEnable_stream_1:checkbox").attr("checked", "");

			// Video codec
			$("select#formEncoderPFVCodec_stream_1").val(eval(profile + "_VIDEOCODEC_ST1_STANDARD"));
			$("select#formEncoderPFVCodec_stream_1").unbind().change(function() {
				if($("#formEncoderPFEnable_stream_1:checkbox").attr("checked") == true)
					useInfo();
			});

			// Resolution
			$("#formResolution_stream_1").val(eval(profile + "_VIDEOCODEC_ST1_" + codecDB.toUpperCase() + "_RESOLUTION").toLowerCase());
			$("select#formResolution_stream_1").unbind().change(function() {
				if($("#formEncoderPFEnable_stream_1:checkbox").attr("checked") == true)
					useInfo();
			});
			$("#formEncoderPFEnable_stream_1:checkbox").change(useInfo);

			// Max. FPS
			$("#formMaxFps_stream_1:text").val(eval(profile + "_VIDEOCODEC_ST1_" + codecDB.toUpperCase() + "_MAXFPS"))
			.parent().parent().find(".slider-bar").slider({
				range: 'min',
				min: 1,
				max: 30,
				change: function(event, ui) {
					if($("#formEncoderPFEnable_stream_1:checkbox").attr("checked") == true)
						useInfo();
				},
				value: eval(profile + "_VIDEOCODEC_ST1_" + codecDB.toUpperCase() + "_MAXFPS"),
				slide: function(event, ui) {
					$("#formMaxFps_stream_1:text").val(ui.value);
				}
			});

			$("#formGOP_stream_1:text").val(Number(eval(profile + "_VIDEOCODEC_ST1_H264_PCOUNT")) + 1)
			.parent().parent().find(".slider-bar").slider({
				range: 'min',
				min: 1,
				max: 30,
				value: Number(eval(profile + "_VIDEOCODEC_ST1_H264_PCOUNT")) + 1,
				slide: function(event, ui) {
					$("#formGOP_stream_1:text").val(ui.value);
				}
			});
			$("#maxBitrate_text_st1:text").val(eval(profile + "_VIDEOCODEC_ST1_H264_MAXBITRATE"))
			.parent().parent().find(".slider-bar").slider({
				range: 'min',
				min: g_defrange.minbitrate,
				max: g_defrange.maxbitrate,
				value: eval(profile + "_VIDEOCODEC_ST1_H264_MAXBITRATE"),
				slide: function(event, ui) {
					$("#maxBitrate_text_st1:text").val(ui.value);
				}
			});
			$("#formBitrate_stream_1:text").val(eval(profile + "_VIDEOCODEC_ST1_H264_BITRATE"))
			.parent().parent().find(".slider-bar").slider({
				range: 'min',
				min: g_defrange.minbitrate,
				max: g_defrange.maxBitrateCBR,
				value: eval(profile + "_VIDEOCODEC_ST1_H264_BITRATE"),
				slide: function(event, ui) {
					$("#formBitrate_stream_1:text").val(ui.value);
				}
			});
			$("#formQuality_stream_1:text").val(eval(profile + "_VIDEOCODEC_ST1_MJPEG_QUALITY"))
			.parent().parent().find(".slider-bar").slider({
				range: 'min',
				min: 0,
				max: 100,
				value: eval(profile + "_VIDEOCODEC_ST1_MJPEG_QUALITY"),
				slide: function(event, ui) {
					$("#formQuality_stream_1:text").val(ui.value);
				}
			});

			// Profile identification
			$("#formProfileid_1").val(eval(profile + "_VIDEOCODEC_ST1_H264_PROFILE"));

			// Multiple slices
			if(eval(profile + "_VIDEOCODEC_ST1_H264_SLICE") == "yes")
			{
				$("#formMultipleSlices_stream_1:checkbox").attr("checked", "checked");
			}
			else
			{
				$("#formMultipleSlices_stream_1:checkbox").attr("checked", "");
			}

			// Bit rate control
			$("input[name='formBitrateCtrl_stream_1'][value='" + eval(profile + "_VIDEOCODEC_ST1_H264_BITRATECTRL") + "']:radio").attr("checked", "checked");

			// Q Value
			$("#formBRC_VBR_stream_1_QValue").val(eval(profile + "_VIDEOCODEC_ST1_H264_QVALUE"));

			// 텍스트 박스 & 슬라이더바
			$("#formMaxFps_stream_1:text").unbind().keyup(function() {
				$("#sliderMaxFps_stream_1").slider("value", $("#formMaxFps_stream_1:text").val());
			}).blur(function() {
				var inputValMaxFps = $("#formMaxFps_stream_1:text").val()-0;
				$("#formMaxFps_stream_1:text").val(inputValMaxFps);
				var rangeMaxfps = eval(profile + "_VIDEOCODEC_ST1_" + codecDB.toUpperCase() + "_MAXFPS");

				if(inputValMaxFps < 1 || inputValMaxFps > 30 || inputValMaxFps == "")
				{
					$("#formMaxFps_stream_1:text").val(rangeMaxfps).focus();
					$("#sliderMaxFps_stream_1").slider("value", rangeMaxfps);
					alert(GetMsgLang("0402069904"));

				}
			});

			$("#formGOP_stream_1:text").unbind().keyup(function() {
				$("#sliderGOP_stream_1").slider("value", $("#formGOP_stream_1:text").val());
			}).blur(function() {
				var inputValPcount = $("#formGOP_stream_1:text").val()-0;
				$("#formGOP_stream_1:text").val(inputValPcount);
				var rangePcount;

				rangePcount = Number(eval(profile + "_VIDEOCODEC_ST1_H264_PCOUNT")) + 1;

				if(inputValPcount < 1 || inputValPcount > 30 || inputValPcount == "")
				{
					$("#formGOP_stream_1:text").val(rangePcount).focus();
					$("#sliderGOP_stream_1").slider("value", rangePcount);
					alert(GetMsgLang("0402069904"));
				}
			});

			$("#maxBitrate_text_st1:text").unbind().keyup(function() {
				$("#maxBitrate_slider_st1").slider("value", $("#maxBitrate_text_st1:text").val());
			}).blur(function() {
				var inputValBitrate = $("#maxBitrate_text_st1:text").val()-0;
				$("#maxBitrate_text_st1:text").val(inputValBitrate);
				var rangeBitrate;

				rangeBitrate = eval(profile + "_VIDEOCODEC_ST1_H264_MAXBITRATE");

				if(inputValBitrate < g_defrange.minbitrate || inputValBitrate > g_defrange.maxbitrate || inputValBitrate == "")
				{
					$("#maxBitrate_text_st1:text").val(rangeBitrate).focus();
					$("#maxBitrate_slider_st1").slider("value", rangeBitrate);
					alert(GetMsgLang("0402069904"));
				}
			});

			$("#formBitrate_stream_1:text").unbind().keyup(function() {
				$("#sliderBitrate_stream_1").slider("value", $("#formBitrate_stream_1:text").val());
			}).blur(function() {
				var inputValBitrate = $("#formBitrate_stream_1:text").val()-0;
				$("#formBitrate_stream_1:text").val(inputValBitrate);
				var rangeBitrate;

				rangeBitrate = eval(profile + "_VIDEOCODEC_ST1_H264_BITRATE");

				if(inputValBitrate < g_defrange.minbitrate || inputValBitrate > g_defrange.maxBitrateCBR || inputValBitrate == "")
				{
					$("#formBitrate_stream_1:text").val(rangeBitrate).focus();
					$("#sliderBitrate_stream_1").slider("value", rangeBitrate);
					alert(GetMsgLang("0402069904"));
				}
			});

			$("#formQuality_stream_1:text").unbind().keyup(function() {
				$("#sliderQuality_stream_1").slider("value", $("#formQuality_stream_1:text").val());
			}).blur(function() {
				var inputValQuality = $("#formQuality_stream_1:text").val()-0;
				$("#formQuality_stream_1:text").val(inputValQuality);
				if($(this).val() == 0) return;
				var rangeQuality;

				rangeQuality = eval(profile + "_VIDEOCODEC_ST1_MJPEG_QUALITY");

				if(inputValQuality < 0 || inputValQuality > 100 || inputValQuality == "")
				{
					$("#formQuality_stream_1:text").val(rangeQuality).focus();
					$("#sliderQuality_stream_1").slider("value", rangeQuality);
					alert(GetMsgLang("0402069904"));
				}
			});

			SetSubRelation(idx);
			break;

		// snapshot
		case 2:
			$("#formCdSnapEnable:checkbox").change(useInfo);
			if(eval(profile+"_SNAPSHOT_ENABLE") == "yes")
				$("#formCdSnapEnable:checkbox").attr("checked", "checked");
			else
				$("#formCdSnapEnable:checkbox").attr("checked", "");
			$("select#formCdSnapResolution").val(eval(profile+"_SNAPSHOT_RESOLUTION").toLowerCase());
			$("select#formCdSnapResolution").unbind().change(function() {
				if($("#formCdSnapEnable:checkbox").attr("checked") == true)
					useInfo();
			});

			$("#formCdSnapMaxFps:text").val(eval(profile+"_SNAPSHOT_MAXFPS"))
			.parent().parent().find(".slider-bar").slider({
				range: 'min',
				min: 1,
				max: 5,
				change: function(event, ui) {
					if($("#formCdSnapEnable:checkbox").attr("checked") == true)
						useInfo();
				},
				value: eval(profile+"_SNAPSHOT_MAXFPS"),
				slide: function(event, ui) {
					$("#formCdSnapMaxFps:text").val(ui.value);
				}
			});

			$("#formCdSnapQuality:text").val(eval(profile+"_SNAPSHOT_QUALITY"))
			.parent().parent().find(".slider-bar").slider({
				range: 'min',
				min: 0,
				max: 100,
				value: eval(profile+"_SNAPSHOT_QUALITY"),
				slide: function(event, ui) {
					$("#formCdSnapQuality:text").val(ui.value);
				}
			});

			// 텍스트 박스 & 슬라이더바
			$("#formCdSnapMaxFps:text").unbind().keyup(function() {
				$("#sliderCdSnapMaxFps").slider("value", $("#formCdSnapMaxFps:text").val());
			}).blur(function() {
				var inputValCdSnapMaxFps = $("#formCdSnapMaxFps:text").val()-0;
				$("#formCdSnapMaxFps:text").val(inputValCdSnapMaxFps);

				if(inputValCdSnapMaxFps < 1 || inputValCdSnapMaxFps > 5 || inputValCdSnapMaxFps == "")
				{
					$("#formCdSnapMaxFps:text").val(eval(profile+"_SNAPSHOT_MAXFPS")).focus();
					$("#sliderCdSnapMaxFps").slider("value", eval(profile+"_SNAPSHOT_MAXFPS"));
					alert(GetMsgLang("0402069904"));
				}
			});

			$("#formCdSnapQuality:text").unbind().keyup(function() {
				$("#sliderCdSnapQuality").slider("value", $("#formCdSnapQuality:text").val());
			}).blur(function() {
				var inputValCdSnapQuality = $("#formCdSnapQuality:text").val()-0;
				$("#formCdSnapQuality:text").val(inputValCdSnapQuality);
				if($(this).val() == 0) return;

				if(inputValCdSnapQuality < 0 || inputValCdSnapQuality > 100 || inputValCdSnapQuality == "")
				{
					$("#formCdSnapQuality:text").val(eval(profile+"_SNAPSHOT_QUALITY")).focus();
					$("#sliderCdSnapQuality").slider("value", eval(profile+"_SNAPSHOT_QUALITY"));
					alert(GetMsgLang("0402069904"));

				}
			});
			return true;
			break;

		// audio
		case 3:
			if(eval(profile+"_AUDIOIN_CH0_ENABLE") == "yes")
				$("#formInEnable:checkbox").attr("checked", "checked");
			else
				$("#formInEnable:checkbox").attr("checked", "");

			if(eval(profile+"_AUDIOOUT_CH0_ENABLE") == "yes")
				$("#formOutEnable:checkbox").attr("checked", "checked");
			else
				$("#formOutEnable:checkbox").attr("checked", "");

			$("input[name='audioInputSource'][value='" + eval(profile + "_AUDIOIN_CH0_PORT") + "']:radio").attr("checked", "checked");

			$("#formInVolume:text").val(eval(profile+"_AUDIOIN_CH0_VOLUME"))
			.parent().parent().find("#sliderEncoderPFInputVol, .slider-bar").slider({
				range: 'min',
				min: 0,
				max: 255,
				value: eval(profile+"_AUDIOIN_CH0_VOLUME"),
				slide: function(event, ui) {
					$("#formInVolume:text").val(ui.value);
				}
			});
			$("#formOutVolume:text").val(eval(profile+"_AUDIOOUT_CH0_VOLUME"))
			.parent().parent().find("#sliderEncoderPFOutVol, .slider-bar").slider({
				range: 'min',
				min: 0,
				max: 255,
				value: eval(profile+"_AUDIOOUT_CH0_VOLUME"),
				slide: function(event, ui) {
					$("#formOutVolume:text").val(ui.value);
				}
			});

			$("#formInVolume:text").unbind().keyup(function() {
				$("#sliderEncoderPFInputVol").slider("value", $("#formInVolume:text").val());
			}).blur(function() {
				var inputValAudioInVol = $("#formInVolume:text").val()-0;
				$("#formInVolume:text").val(inputValAudioInVol);
				if($(this).val() == 0) return;

				if(inputValAudioInVol < 0 || inputValAudioInVol > 255 || inputValAudioInVol == "")
				{
					$("#formInVolume:text").val(eval(profile+"_AUDIOIN_CH0_VOLUME")).focus();
					$("#sliderEncoderPFInputVol").slider("value", eval(profile+"_AUDIOIN_CH0_VOLUME"));
					alert(GetMsgLang("0402069904"));
				}
			});
			$("#formOutVolume:text").unbind().keyup(function() {
				$("#sliderEncoderPFOutVol").slider("value", $("#formOutVolume:text").val());
			}).blur(function() {
				var inputValAudioOutVol = $("#formOutVolume:text").val()-0;
				$("#formOutVolume:text").val(inputValAudioOutVol);
				if($(this).val() == 0) return;

				if(inputValAudioOutVol < 0 || inputValAudioOutVol > 255 || inputValAudioOutVol == "")
				{
					$("#formOutVolume:text").val(eval(profile+"_AUDIOOUT_CH0_VOLUME")).focus();
					$("#sliderEncoderPFOutVol").slider("value", eval(profile+"_AUDIOOUT_CH0_VOLUME"));
					alert(GetMsgLang("0402069904"));
				}
			});

			$("select#formInCodec").val(eval(profile+"_AUDIOIN_CH0_ADC_CODEC"));
			$("select#formInFrequency").val(eval(profile+"_AUDIOIN_CH0_ADC_FREQUENCY"));
			$("#formOutPort:text").val(eval(profile+"_AUDIOOUT_CH0_TCP_PORT"));

			$("#formOutPort:text").unbind().keyup().blur(function() {
				var inputValAudioOutVol = $("#formOutPort:text").val()-0;
				$("#formOutPort:text").val(inputValAudioOutVol);

				if(inputValAudioOutVol < 1 || inputValAudioOutVol > 65535 || inputValAudioOutVol == "")
				{
					$("#formOutPort:text").val(eval(profile+"_AUDIOOUT_CH0_TCP_PORT")).focus();
					alert(GetMsgLang("0402069904"));
				}
			});
			return true;
			break;

		default:
			return false;
			break;
	}
	if(idx == 3)
	{
		//initValue = true;
		//useInfo();
	}
	custom_init();

	if (parent.g_configData.langPath == "/language/Arabic.xml")
	{
		$(".slider-bar").slider({isRTL: true});
	}
}

function SetRelation()
{
	$("#linkEncoderProfile").click(function(){
		var result = "";
		result = parent.$(":header span.ui-icon-triangle-1-s + a").attr("href");

		if(result == "#0") // Basic Configuration
		{
			parent.$("#leftmenu .videoaudioContents").click();
			parent.$("#leftmenu .videoaudioContents + div a[href='encoderprofile.html']").click();
		}
		else // Video Audio
		{
			parent.$("#leftmenu .videoaudioContents + div a[href='encoderprofile.html']").click();
		}
	});
}

function SetSubRelation(idx)
{
	//initValue = false;
	var size = 480;
	// first stream relation
	$("select#formEncoderPFVCodec_stream_0").unbind().change(function(){
		if($("#formEncoderPFEnable_stream_0:checkbox").attr("checked") == true)
			useInfo();

		var firstCodec = $(this).val();

		if(firstCodec != "mjpeg")
		{
			$("#jpegQuality_stream_0").css("display", "none");
			$("#profileid_stream_0").css("display", "block");
			$("#multipleSlices_stream_0").css("display", "block");

			if("rs51c0b" != parent.g_brand.imgDevice && 
		"mdc200s" != parent.g_brand.imgDevice &&
		"mdc600s" != parent.g_brand.imgDevice)
			{
				$("#gop_stream_0").css("display", "block");
				$("#bitRateControl_stream_0").css("display", "block");
				$("#formBRC_VBR_stream_0").css("display", "block");
				$("#formBRC_CBR_stream_0").css("display", "block");
			}
		}
		else
		{
			$("#bitRateControl_stream_0").css("display", "none");
			$("#formBRC_VBR_stream_0").css("display", "none");
			$("#formBRC_CBR_stream_0").css("display", "none");
			$("#jpegQuality_stream_0").css("display", "block");
			$("#profileid_stream_0").css("display", "none");
			$("#multipleSlices_stream_0").css("display", "none");
			$("#gop_stream_0").css("display", "none");
		}
		EvenOdd(parent.g_configData.skin);
	});
	// second stream relation
	$("select#formEncoderPFVCodec_stream_1").unbind().change(function(){
		if($("#formEncoderPFEnable_stream_1:checkbox").attr("checked") == true)
			useInfo();

		var secondCodec = $(this).val();

		if(secondCodec != "mjpeg")
		{
			$("#jpegQuality_stream_1").css("display", "none");
			$("#profileid_stream_1").css("display", "block");
			$("#multipleSlices_stream_1").css("display", "block");

			if("rs51c0b" != parent.g_brand.imgDevice && 
		"mdc200s" != parent.g_brand.imgDevice && 
		"mdc600s" != parent.g_brand.imgDevice)
			{
				$("#gop_stream_1").css("display", "block");
				$("#bitRateControl_stream_1").css("display", "block");
				$("#formBRC_VBR_stream_1").css("display", "block");
				$("#formBRC_CBR_stream_1").css("display", "block");
			}
		}
		else
		{
			$("#bitRateControl_stream_1").css("display", "none");
			$("#formBRC_VBR_stream_1").css("display", "none");
			$("#formBRC_CBR_stream_1").css("display", "none");
			$("#jpegQuality_stream_1").css("display", "block");
			$("#profileid_stream_1").css("display", "none");
			$("#multipleSlices_stream_1").css("display", "none");
			$("#gop_stream_1").css("display", "none");
		}
		EvenOdd(parent.g_configData.skin);
	});

	// first bit rate control relation
	$("input[name='formBitrateCtrl_stream_0']").unbind().change(function(){
		var firstBRCVal = $("input[name='formBitrateCtrl_stream_0']:checked:radio").val();
		if(firstBRCVal == "vbr")
		{
			Enable($("select#formBRC_VBR_stream_0_QValue"));
			Enable($("#maxBitrate_text_st0:text"));
			Enable($("#maxBitrate_text_st0:text").parent().parent().find(".slider-bar"));
			Disable($("#formBitrate_stream_0:text"));
			Disable($("#formBitrate_stream_0:text").parent().parent().find(".slider-bar"));
		}
		else
		{
			Disable($("select#formBRC_VBR_stream_0_QValue"));
			Disable($("#maxBitrate_text_st0:text"));
			Disable($("#maxBitrate_text_st0:text").parent().parent().find(".slider-bar"));
			Enable($("#formBitrate_stream_0:text"));
			Enable($("#formBitrate_stream_0:text").parent().parent().find(".slider-bar"));
		}
	});
	// second bit rate control relation
	$("input[name='formBitrateCtrl_stream_1']").unbind().change(function(){
		var firstBRCVal = $("input[name='formBitrateCtrl_stream_1']:checked:radio").val();
		if(firstBRCVal == "vbr")
		{
			Enable($("select#formBRC_VBR_stream_1_QValue"));
			Enable($("#maxBitrate_text_st1:text"));
			Enable($("#maxBitrate_text_st1:text").parent().parent().find(".slider-bar"));
			Disable($("#formBitrate_stream_1:text"));
			Disable($("#formBitrate_stream_1:text").parent().parent().find(".slider-bar"));
		}
		else
		{
			Disable($("select#formBRC_VBR_stream_1_QValue"));
			Disable($("#maxBitrate_text_st1:text"));
			Disable($("#maxBitrate_text_st1:text").parent().parent().find(".slider-bar"));
			Enable($("#formBitrate_stream_1:text"));
			Enable($("#formBitrate_stream_1:text").parent().parent().find(".slider-bar"));
		}
	});

	$("select#formEncoderPFVCodec_stream_0").change();
	$("select#formEncoderPFVCodec_stream_1").change();
	$("input[name='formBitrateCtrl_stream_0']").change();
	$("input[name='formBitrateCtrl_stream_1']").change();
	//initValue = true;
}

function isValidResolutionCombination()
{
	var curSt0Codec = $("select#formEncoderPFVCodec_stream_0").val();
	var curSt1Codec = $("select#formEncoderPFVCodec_stream_1").val();
	var enableValue = [$("#formEncoderPFEnable_stream_0:checkbox").attr("checked") == true ? "yes" : "no",
							$("#formEncoderPFEnable_stream_1:checkbox").attr("checked") == true ? "yes" : "no",
							$("#formCdSnapEnable:checkbox").attr("checked") == true ? "yes" : "no"];
	var resolutionValue = [$("select#formResolution_stream_0").val(),
							$("select#formResolution_stream_1").val(),
							$("select#formCdSnapResolution").val()];

	for(var i = 0; i < 3; i++)
	{
		if(enableValue[i] == "no") continue;

		if(resolutionValue[i] == "qxga")
		{
			for(var j = 0; j < 3; j++)
			{
				if(i == j) continue;
				if(enableValue[j] == "no") continue;

				if(resolutionValue[j] == "uxga" || resolutionValue[j] == "sxga")
					return -1;
			}
		}

		if(resolutionValue[i] == "uxga")
		{
			for(var j = 0; j < 3; j++)
			{
				if(i == j) continue;
				if(enableValue[j] == "no") continue;

				if(resolutionValue[j] == "sxga")
					return -1;
			}
		}
	}

	return 0;
}

function EventBind()
{
	var Req = new CGIRequest();
	var group = DefaultGroup + "_CH0";

	$("#btnShow").toggle(
		function(){
			$(".profileLoad, .profileList").show();
			showProfileFlag = 1;
			showListResize();
		},
		function(){
			$(".profileLoad, .profileList").hide();
			showProfileFlag = 0;
			showListResize();
		}
	);

	$("#btnApply").click(function() {
		if(g_rotateDBValue != "none")
		{
			var limit = false;
			var enableFirstStream = $("#formEncoderPFEnable_stream_0:checkbox").attr("checked");
			var enableSecondStream = $("#formEncoderPFEnable_stream_1:checkbox").attr("checked");
			var enableSnapshot = $("#formCdSnapEnable:checkbox").attr("checked");
			var resFirstStream = $("#formResolution_stream_0").val();
			var resSecondStream = $("#formResolution_stream_1").val();
			var resSnapshot = $("#formCdSnapResolution").val();

			if(enableFirstStream && resFirstStream == "qqvga") limit = true;
			if(enableSecondStream && resSecondStream == "qqvga") limit = true;
			if(enableSnapshot && resSnapshot == "qqvga") limit = true;

			if(limit)
			{
				alert(GetMsgLang("0402069913"));
				return false;
			}
		}

		if(Allow == false)
		{
			alert(GetMsgLang("0402069905"));
			return false;
		}

		if(isLimitFPS14(g_aspectRatioDBValue, parent.g_brand.productID))
		{
			if(isValidResolutionCombination() < 0)
			{
				alert(GetMsgLang("0402069907"));
				return false;
			}
		}

		if(isLimitStreamForSeek_form())
		{
			var enableSecondStream = $("#formEncoderPFEnable_stream_1:checkbox").attr("checked");
			if(enableSecondStream)
			{
				alert(GetMsgLang("0402069912"));
				return false;
			}

		}

		var reqQString = "action=update&xmlschema";
		var RetAdditionalValue = "";

		//reqQString += "&ENCODER.Ch0.profile=" + $("select#formProfileList").val();
		QString = makeQString();
		QString
			.set_action('update')
			.set_schema('xml');

		// stream
		for(var stNum=0; stNum<2; stNum++)
		{
			var $obj = $("#stream_" + stNum);
			var codec = $("select#formEncoderPFVCodec_stream_" + stNum, $obj).val(); // 현재 codec 값
			var streamResolution = $("select#formResolution_stream_" + stNum, $obj).val();
			if(g_speedMFZ == 1)
			{
				if(streamResolution == "1280x960")
					streamResolution = "1920x1080";
			}

			QString
				// Enable
				.add_list("ENCODER.Ch0.Videocodec.St" + stNum + ".enable", eval(group + "_VIDEOCODEC_ST" + stNum + "_ENABLE"), ($("#formEncoderPFEnable_stream_" + stNum + ":checkbox", $obj).attr("checked") == true) ? "yes" : "no")
				// Video Codec
				.add_list("ENCODER.Ch0.Videocodec.St" + stNum + ".standard", eval(group + "_VIDEOCODEC_ST" + stNum + "_STANDARD"), codec)
				// Resolution
				.add_list("ENCODER.Ch0.Videocodec.St" + stNum + "." + codec + ".resolution", eval(group + "_VIDEOCODEC_ST" + stNum + "_" + codec.toUpperCase() + "_RESOLUTION"), streamResolution)
				// Max.FPS
				.add_list("ENCODER.Ch0.Videocodec.St" + stNum + "." + codec + ".maxfps", eval(group + "_VIDEOCODEC_ST" + stNum + "_" + codec.toUpperCase() + "_MAXFPS"), $("#formMaxFps_stream_" + stNum + ":text", $obj).val())
				.add_list("ENCODER.Ch0.Videocodec.St" + stNum + ".Mjpeg.quality", eval(group + "_VIDEOCODEC_ST" + stNum + "_MJPEG_QUALITY"), $("#formQuality_stream_" + stNum + ":text", $obj).val())
				.add_list("ENCODER.Ch0.Videocodec.St" + stNum + ".H264.pcount", eval(group + "_VIDEOCODEC_ST" + stNum + "_H264_PCOUNT"), String(Number(eval($("#formGOP_stream_" + stNum + ":text", $obj).val()) - 1)))
				.add_list("ENCODER.Ch0.Videocodec.St" + stNum + ".H264.bitratectrl", eval(group + "_VIDEOCODEC_ST" + stNum + "_H264_BITRATECTRL"), $("input[name='formBitrateCtrl_stream_" + stNum + "']:checked:radio", $obj).val())
				.add_list("ENCODER.Ch0.Videocodec.St" + stNum + ".H264.profile", eval(group + "_VIDEOCODEC_ST" + stNum + "_H264_PROFILE"), $("#formProfileid_" + stNum, $obj).val())
				//.add_list("ENCODER.Ch0.Videocodec.St" + stNum + ".H264.slice", eval(group + "_VIDEOCODEC_ST" + stNum + "_H264_SLICE"), ($("#formMultipleSlices_stream_" + stNum + ":checkbox", $obj).attr("checked") == true) ? "yes" : "no")
				.add_list("ENCODER.Ch0.Videocodec.St" + stNum + ".H264.qvalue",eval(group + "_VIDEOCODEC_ST" + stNum + "_H264_QVALUE") , $("#formBRC_VBR_stream_" + stNum + "_QValue", $obj).val())
				.add_list("ENCODER.Ch0.Videocodec.St" + stNum + ".H264.bitrate",eval(group + "_VIDEOCODEC_ST" + stNum + "_H264_BITRATE") , $("#formBitrate_stream_" + stNum, $obj).val())
				.add_list("ENCODER.Ch0.Videocodec.St" + stNum + ".H264.maxbitrate",eval(group + "_VIDEOCODEC_ST" + stNum + "_H264_MAXBITRATE") , $("#maxBitrate_text_st" + stNum, $obj).val());
		}

		// Snapshot
		var $obj = $("#snapshot");
		var snapshotResolution = $("select#formCdSnapResolution", $obj).val();
		if(g_speedMFZ == 1)
		{
			if(snapshotResolution == "1280x960")
				snapshotResolution = "1920x1080";
		}

		QString
			.add_list("ENCODER.Ch0.Snapshot.enable", eval(group + "_SNAPSHOT_ENABLE"), ($("#formCdSnapEnable:checkbox", $obj).attr("checked") == true) ? "yes" : "no")
			.add_list("ENCODER.Ch0.Snapshot.resolution", eval(group + "_SNAPSHOT_RESOLUTION"), snapshotResolution)
			.add_list("ENCODER.Ch0.Snapshot.maxfps", eval(group + "_SNAPSHOT_MAXFPS"), $("#formCdSnapMaxFps:text", $obj).val())
			.add_list("ENCODER.Ch0.Snapshot.quality", eval(group + "_SNAPSHOT_QUALITY"), $("#formCdSnapQuality:text", $obj).val());

		// Audio
		var $obj = $("#audio");
		QString
			.add_list("ENCODER.Ch0.Audioin.Ch0.enable", eval(group + "_AUDIOIN_CH0_ENABLE"), ($("#formInEnable:checkbox", $obj).attr("checked") == true) ? "yes" : "no")
			.add_list("ENCODER.Ch0.Audioout.Ch0.enable", eval(group + "_AUDIOOUT_CH0_ENABLE"), ($("#formOutEnable:checkbox", $obj).attr("checked") == true) ? "yes" : "no")
			.add_list("ENCODER.Ch0.Audioin.Ch0.volume", eval(group + "_AUDIOIN_CH0_VOLUME"), $("#formInVolume:text", $obj).val())
			.add_list("ENCODER.Ch0.Audioin.Ch0.Adc.codec", eval(group + "_AUDIOIN_CH0_ADC_CODEC"), $("select#formInCodec", $obj).val())
			.add_list("ENCODER.Ch0.Audioin.Ch0.Adc.frequency", eval(group + "_AUDIOIN_CH0_ADC_FREQUENCY"), $("select#formInFrequency", $obj).val())
			.add_list("ENCODER.Ch0.Audioin.Ch0.port", eval(group + "_AUDIOIN_CH0_PORT"), $("input[name='audioInputSource']:checked:radio", $obj).val())
			.add_list("ENCODER.Ch0.Audioout.Ch0.volume", eval(group + "_AUDIOOUT_CH0_VOLUME"), $("#formOutVolume:text", $obj).val())
			.add_list("ENCODER.Ch0.Audioout.Ch0.Tcp.port", eval(group + "_AUDIOOUT_CH0_TCP_PORT"), $("#formOutPort:text", $obj).val());

		if($("#formEncoderPFEnable_stream_0:checkbox", $("#stream_0") ).attr("checked") == false
					&& $("#formEncoderPFEnable_stream_1:checkbox", $("#stream_1")).attr("checked") == false
					&& $("#formCdSnapEnable:checkbox", $("#snapshot")).attr("checked") == false)
		{
			alert(GetMsgLang("0402069906"));
		}
		else
		{
			reqQString = QString.get_qstring();

			if(!reqQString) {
				return;
			}

			if(g_isVcaEnable && isLimitFPS14(g_aspectRatioDBValue, parent.g_brand.productID))
			{
				var curSt0Enable = ($("#formEncoderPFEnable_stream_0", $("#stream_0")).attr("checked") == true) ? "yes" : "no";
				var curSt0Resolution = $("select#formResolution_stream_0", $("#stream_0")).val();
				var curSnapshotEnable = ($("#formCdSnapEnable", $("#snapshot")).attr("checked") == true) ? "yes" : "no";
				var curSnapshotResolution = $("select#formCdSnapResolution", $("#snapshot")).val();
				if(curSt0Enable == "yes" && curSnapshotEnable == "yes")
				{
					if(curSt0Resolution != curSnapshotResolution)
					{
						alert(GetMsgLang("0402069907"));
						return;
					}
				}
			}

			var reqArr = reqQString.split("&");
			reqArr.splice(1, 0, "ENCODER.Ch0.Videocodec.lock=no");
			reqQString = reqArr.join("&");
			reqQString += "&ENCODER.Ch0.Videocodec.lock=yes";

			RetAdditionalValue = GetAdditionalUpdateRequest();

			if(RetAdditionalValue != undefined)
			{
				reqQString += GetAdditionalUpdateRequest();
			}

			if (IsCodecUsageRestriction == true && ResolutionExceptionCheck())
			{
				alert(GetMsgLang("0402069907"));
				return;
			}

			//add empty function for NotifyMessage function redefinition
			NotifyMessage();

			Req.SetStartFunc(ViewLoadingSave);
			Req.SetCallBackFunc(function(xml){
				var ret = CGIResponseCheck(0, xml);
				loadingFlag = 1;
				if(ret != 0) {
					var errormessage = "";
					if(ret != -2) {
						errormessage = "\n" + ret;
					}
					alert(GetMsgLang("0501") + errormessage);
				}
				LoadParamJs(DefaultGroup, function() {
					ViewLoadingSave(false);
					initValue = false;

					ENCODER_CH0_VIDEOCODEC_ST0_STANDARD = ENCODER_CH0_VIDEOCODEC_ST0_STANDARD.toLowerCase()
					ENCODER_CH0_VIDEOCODEC_ST1_STANDARD = ENCODER_CH0_VIDEOCODEC_ST1_STANDARD.toLowerCase()

					$("#stream_tab > div").each(function(index, element) {
						InitSubSetting(index);
					});

					if(isLimitFPS14(g_aspectRatioDBValue, parent.g_brand.productID) || isLimitStreamForSeek())
						$(".stream_1_contents").css("display", "none");
					else
						$(".stream_1_contents").css("display", "block");

					reRange();
					initValue = true;
					loadingFlag = 0;
					useInfo();
				});
				loadingFlag = 0;
				return;
			});
			Req.Request(reqQString);
			loadingFlag = 1;
		}
	});

	$("#btnLoad").click(function(){
		profileLoadCheck = 1;
		initValue = false;
		if(selectProfile == "" || selectProfile == null)
		{
			alert(GetMsgLang("0402069908"));
			return;
		}

		var profile = DefaultGroup + "PROFILE_" + selectProfile.toUpperCase(); // profile name
		var codec_stream_0 = eval(profile + "_VIDEOCODEC_ST0_STANDARD"); // first stream codec
		var codec_stream_1 = eval(profile + "_VIDEOCODEC_ST1_STANDARD"); // second stream codec

		// first stream
		// Enable streaming
		if(eval(profile + "_VIDEOCODEC_ST0_ENABLE") == "yes")
			$("#formEncoderPFEnable_stream_0:checkbox").attr("checked", "checked");
		else
			$("#formEncoderPFEnable_stream_0:checkbox").attr("checked", "");

		// Video codec
		$("select#formEncoderPFVCodec_stream_0").val(codec_stream_0);
		$("select#formEncoderPFVCodec_stream_0").unbind().change(function() {
			if($("#formEncoderPFEnable_stream_0:checkbox").attr("checked") == true)
				useInfo();
		});

		// Resolution
		$("#formResolution_stream_0").val(eval(profile + "_VIDEOCODEC_ST0_" + codec_stream_0.toUpperCase() + "_RESOLUTION"));
		$("select#formResolution_stream_0").unbind().change(function() {
			if($("#formEncoderPFEnable_stream_0:checkbox").attr("checked") == true)
				useInfo();
		});
		$("#formEncoderPFEnable_stream_0:checkbox").change(useInfo);

		// Max. FPS
		$("#formMaxFps_stream_0:text").val(eval(profile + "_VIDEOCODEC_ST0_" + codec_stream_0.toUpperCase() + "_MAXFPS"))
		.parent().parent().find(".slider-bar").slider({
			range: 'min',
			min: 1,
			max: 30,
			change: function(event, ui) {
				if($("#formEncoderPFEnable_stream_0:checkbox").attr("checked") == true)
					useInfo();
			},
			value: eval(profile + "_VIDEOCODEC_ST0_" + codec_stream_0.toUpperCase() + "_MAXFPS"),
			slide: function(event, ui) {
				$("#formMaxFps_stream_0:text").val(ui.value);
			}
		});

		$("#formGOP_stream_0:text").val(Number(eval(profile + "_VIDEOCODEC_ST0_H264_PCOUNT")) + 1)
		.parent().parent().find(".slider-bar").slider({
			range: 'min',
			min: 1,
			max: 30,
			value: Number(eval(profile + "_VIDEOCODEC_ST0_H264_PCOUNT")) + 1,
			slide: function(event, ui) {
				$("#formGOP_stream_0:text").val(ui.value);
			}
		});
		$("#maxBitrate_text_st0:text").val(eval(profile + "_VIDEOCODEC_ST0_H264_MAXBITRATE"))
		.parent().parent().find(".slider-bar").slider({
			range: 'min',
			min: g_defrange.minbitrate,
			max: g_defrange.maxbitrate,
			value: eval(profile + "_VIDEOCODEC_ST0_H264_MAXBITRATE"),
			slide: function(event, ui) {
				$("#maxBitrate_text_st0:text").val(ui.value);
			}
		});
		$("#formBitrate_stream_0:text").val(eval(profile + "_VIDEOCODEC_ST0_H264_BITRATE"))
		.parent().parent().find(".slider-bar").slider({
			range: 'min',
			min: g_defrange.minbitrate,
			max: g_defrange.maxBitrateCBR,
			value: eval(profile + "_VIDEOCODEC_ST0_H264_BITRATE"),
			slide: function(event, ui) {
				$("#formBitrate_stream_0:text").val(ui.value);
			}
		});
		$("#formQuality_stream_0:text").val(eval(profile + "_VIDEOCODEC_ST0_MJPEG_QUALITY"))
		.parent().parent().find(".slider-bar").slider({
			range: 'min',
			min: 0,
			max: 100,
			value: eval(profile + "_VIDEOCODEC_ST0_MJPEG_QUALITY"),
			slide: function(event, ui) {
				$("#formQuality_stream_0:text").val(ui.value);
			}
		});

		// Profile identification
		$("#formProfileid_0").val(eval(profile + "_VIDEOCODEC_ST0_H264_PROFILE"));

		// Multiple slices
		if(eval(profile + "_VIDEOCODEC_ST0_H264_SLICE") == "yes")
		{
			$("#formMultipleSlices_stream_0:checkbox").attr("checked", "checked");
		}
		else
		{
			$("#formMultipleSlices_stream_0:checkbox").attr("checked", "");
		}

		// Bit rate control
		$("input[name='formBitrateCtrl_stream_0'][value='" + eval(profile + "_VIDEOCODEC_ST0_H264_BITRATECTRL") + "']:radio").attr("checked", "checked");

		// Q Value
		$("#formBRC_VBR_stream_0_QValue").val(eval(profile + "_VIDEOCODEC_ST0_H264_QVALUE"));

		// 텍스트 박스 & 슬라이더바
		$("#formMaxFps_stream_0:text").unbind().keyup(function() {
			$("#sliderMaxFps_stream_0").slider("value", $("#formMaxFps_stream_0:text").val());
		}).blur(function() {
			var inputValMaxFps = $("#formMaxFps_stream_0:text").val()-0;
			$("#formMaxFps_stream_0:text").val(inputValMaxFps);
			var rangeMaxfps = eval(profile + "_VIDEOCODEC_ST0_" + codec_stream_0.toUpperCase() + "_MAXFPS");

			if(inputValMaxFps < 1 || inputValMaxFps > 30 || inputValMaxFps == "")
			{
				$("#formMaxFps_stream_0:text").val(rangeMaxfps).focus();
				$("#sliderMaxFps_stream_0").slider("value", rangeMaxfps);
				alert(GetMsgLang("0402069904"));
			}
		});

		$("#formGOP_stream_0:text").unbind().keyup(function() {
			$("#sliderGOP_stream_0").slider("value", $("#formGOP_stream_0:text").val());
		}).blur(function() {
			var inputValPcount = $("#formGOP_stream_0:text").val()-0;
			$("#formGOP_stream_0:text").val(inputValPcount);
			var rangePcount;

			rangePcount = Number(eval(profile + "_VIDEOCODEC_ST0_H264_PCOUNT")) + 1;

			if(inputValPcount < 1 || inputValPcount > 30 || inputValPcount == "")
			{
				$("#formGOP_stream_0:text").val(rangePcount).focus();
				$("#sliderGOP_stream_0").slider("value", rangePcount);
				alert(GetMsgLang("0402069904"));
			}
		});

		$("#maxBitrate_text_st0:text").unbind().keyup(function() {
			$("#maxBitrate_slider_st0").slider("value", $("#maxBitrate_text_st0:text").val());
		}).blur(function() {
			var inputValBitrate = $("#maxBitrate_text_st0:text").val()-0;
			$("#maxBitrate_text_st0:text").val(inputValBitrate);
			var rangeBitrate;

			rangeBitrate = eval(profile + "_VIDEOCODEC_ST0_H264_MAXBITRATE");

			if(inputValBitrate < g_defrange.minbitrate || inputValBitrate > g_defrange.maxbitrate || inputValBitrate == "")
			{
				$("#maxBitrate_text_st0:text").val(rangeBitrate).focus();
				$("#maxBitrate_slider_st0").slider("value", rangeBitrate);
				alert(GetMsgLang("0402069904"));
			}
		});

		$("#formBitrate_stream_0:text").unbind().keyup(function() {
			$("#sliderBitrate_stream_0").slider("value", $("#formBitrate_stream_0:text").val());
		}).blur(function() {
			var inputValBitrate = $("#formBitrate_stream_0:text").val()-0;
			$("#formBitrate_stream_0:text").val(inputValBitrate);
			var rangeBitrate;

			rangeBitrate = eval(profile + "_VIDEOCODEC_ST0_H264_BITRATE");

			if(inputValBitrate < g_defrange.minbitrate || inputValBitrate > g_defrange.maxBitrateCBR || inputValBitrate == "")
			{
				$("#formBitrate_stream_0:text").val(rangeBitrate).focus();
				$("#sliderBitrate_stream_0").slider("value", rangeBitrate);
				alert(GetMsgLang("0402069904"));
			}
		});

		$("#formQuality_stream_0:text").unbind().keyup(function() {
			$("#sliderQuality_stream_0").slider("value", $("#formQuality_stream_0:text").val());
		}).blur(function() {
			var inputValQuality = $("#formQuality_stream_0:text").val()-0;
			$("#formQuality_stream_0:text").val(inputValQuality);
			if($(this).val() == 0) return;
			var rangeQuality;

			rangeQuality = eval(profile + "_VIDEOCODEC_ST0_MJPEG_QUALITY");

			if(inputValQuality < 0 || inputValQuality > 100 || inputValQuality == "")
			{
				$("#formQuality_stream_0:text").val(rangeQuality).focus();
				$("#sliderQuality_stream_0").slider("value", rangeQuality);
				alert(GetMsgLang("0402069904"));
			}
		});

		// second stream
		// Enable streaming
		if(eval(profile + "_VIDEOCODEC_ST1_ENABLE") == "yes")
			$("#formEncoderPFEnable_stream_1:checkbox").attr("checked", "checked");
		else
			$("#formEncoderPFEnable_stream_1:checkbox").attr("checked", "");

		// Video codec
		$("select#formEncoderPFVCodec_stream_1").val(eval(profile + "_VIDEOCODEC_ST1_STANDARD"));
		$("select#formEncoderPFVCodec_stream_1").unbind().change(function() {
			if($("#formEncoderPFEnable_stream_1:checkbox").attr("checked") == true)
				useInfo();
		});

		// Resolution
		$("#formResolution_stream_1").val(eval(profile + "_VIDEOCODEC_ST1_" + codec_stream_1.toUpperCase() + "_RESOLUTION"));
		$("select#formResolution_stream_1").unbind().change(function() {
			if($("#formEncoderPFEnable_stream_1:checkbox").attr("checked") == true)
				useInfo();
		});
		$("#formEncoderPFEnable_stream_1:checkbox").change(useInfo);

		// Max. FPS
		$("#formMaxFps_stream_1:text").val(eval(profile + "_VIDEOCODEC_ST1_" + codec_stream_1.toUpperCase() + "_MAXFPS"))
		.parent().parent().find(".slider-bar").slider({
			range: 'min',
			min: 1,
			max: 30,
			change: function(event, ui) {
				if($("#formEncoderPFEnable_stream_1:checkbox").attr("checked") == true)
					useInfo();
			},
			value: eval(profile + "_VIDEOCODEC_ST1_" + codec_stream_1.toUpperCase() + "_MAXFPS"),
			slide: function(event, ui) {
				$("#formMaxFps_stream_1:text").val(ui.value);
			}
		});

		$("#formGOP_stream_1:text").val(Number(eval(profile + "_VIDEOCODEC_ST1_H264_PCOUNT")) + 1)
		.parent().parent().find(".slider-bar").slider({
			range: 'min',
			min: 1,
			max: 30,
			value: Number(eval(profile + "_VIDEOCODEC_ST1_H264_PCOUNT")) + 1,
			slide: function(event, ui) {
				$("#formGOP_stream_1:text").val(ui.value);
			}
		});
		$("#maxBitrate_text_st1:text").val(eval(profile + "_VIDEOCODEC_ST1_H264_MAXBITRATE"))
		.parent().parent().find(".slider-bar").slider({
			range: 'min',
			min: g_defrange.minbitrate,
			max: g_defrange.maxbitrate,
			value: eval(profile + "_VIDEOCODEC_ST1_H264_MAXBITRATE"),
			slide: function(event, ui) {
				$("#maxBitrate_text_st1:text").val(ui.value);
			}
		});
		$("#formBitrate_stream_1:text").val(eval(profile + "_VIDEOCODEC_ST1_H264_BITRATE"))
		.parent().parent().find(".slider-bar").slider({
			range: 'min',
			min: g_defrange.minbitrate,
			max: g_defrange.maxBitrateCBR,
			value: eval(profile + "_VIDEOCODEC_ST1_H264_BITRATE"),
			slide: function(event, ui) {
				$("#formBitrate_stream_1:text").val(ui.value);
			}
		});
		$("#formQuality_stream_1:text").val(eval(profile + "_VIDEOCODEC_ST1_MJPEG_QUALITY"))
		.parent().parent().find(".slider-bar").slider({
			range: 'min',
			min: 0,
			max: 100,
			value: eval(profile + "_VIDEOCODEC_ST1_MJPEG_QUALITY"),
			slide: function(event, ui) {
				$("#formQuality_stream_1:text").val(ui.value);
			}
		});

		// Profile identification
		$("#formProfileid_1").val(eval(profile + "_VIDEOCODEC_ST1_H264_PROFILE"));

		// Multiple slices
		if(eval(profile + "_VIDEOCODEC_ST1_H264_SLICE") == "yes")
		{
			$("#formMultipleSlices_stream_1:checkbox").attr("checked", "checked");
		}
		else
		{
			$("#formMultipleSlices_stream_1:checkbox").attr("checked", "");
		}

		// Bit rate control
		$("input[name='formBitrateCtrl_stream_1'][value='" + eval(profile + "_VIDEOCODEC_ST1_H264_BITRATECTRL") + "']:radio").attr("checked", "checked");

		// Q Value
		$("#formBRC_VBR_stream_1_QValue").val(eval(profile + "_VIDEOCODEC_ST1_H264_QVALUE"));

		// 텍스트 박스 & 슬라이더바
		$("#formMaxFps_stream_1:text").unbind().keyup(function() {
			$("#sliderMaxFps_stream_1").slider("value", $("#formMaxFps_stream_1:text").val());
		}).blur(function() {
			var inputValMaxFps = $("#formMaxFps_stream_1:text").val()-0;
			$("#formMaxFps_stream_1:text").val(inputValMaxFps);
			var rangeMaxfps = eval(profile + "_VIDEOCODEC_ST1_" + codec_stream_1.toUpperCase() + "_MAXFPS");

			if(inputValMaxFps < 1 || inputValMaxFps > 30 || inputValMaxFps == "")
			{
				$("#formMaxFps_stream_1:text").val(rangeMaxfps).focus();
				$("#sliderMaxFps_stream_1").slider("value", rangeMaxfps);
				alert(GetMsgLang("0402069904"));
			}
		});

		$("#formGOP_stream_1:text").unbind().keyup(function() {
			$("#sliderGOP_stream_1").slider("value", $("#formGOP_stream_1:text").val());
		}).blur(function() {
			var inputValPcount = $("#formGOP_stream_1:text").val()-0;
			$("#formGOP_stream_1:text").val(inputValPcount);
			var rangePcount;

			rangePcount = Number(eval(profile + "_VIDEOCODEC_ST1_H264_PCOUNT")) + 1;

			if(inputValPcount < 1 || inputValPcount > 30 || inputValPcount == "")
			{
				$("#formGOP_stream_1:text").val(rangePcount).focus();
				$("#sliderGOP_stream_1").slider("value", rangePcount);
				alert(GetMsgLang("0402069904"));
			}
		});

		$("#maxBitrate_text_st1:text").unbind().keyup(function() {
			$("#maxBitrate_slider_st1").slider("value", $("#maxBitrate_text_st1:text").val());
		}).blur(function() {
			var inputValBitrate = $("#maxBitrate_text_st1:text").val()-0;
			$("#maxBitrate_text_st1:text").val(inputValBitrate);
			var rangeBitrate;

			rangeBitrate = eval(profile + "_VIDEOCODEC_ST1_H264_MAXBITRATE");

			if(inputValBitrate < g_defrange.minbitrate || inputValBitrate > g_defrange.maxbitrate || inputValBitrate == "")
			{
				$("#maxBitrate_text_st1:text").val(rangeBitrate).focus();
				$("#maxBitrate_slider_st1").slider("value", rangeBitrate);
				alert(GetMsgLang("0402069904"));
			}
		});

		$("#formBitrate_stream_1:text").unbind().keyup(function() {
			$("#sliderBitrate_stream_1").slider("value", $("#formBitrate_stream_1:text").val());
		}).blur(function() {
			var inputValBitrate = $("#formBitrate_stream_1:text").val()-0;
			$("#formBitrate_stream_1:text").val(inputValBitrate);
			var rangeBitrate;

			rangeBitrate = eval(profile + "_VIDEOCODEC_ST1_H264_BITRATE");

			if(inputValBitrate < g_defrange.minbitrate || inputValBitrate > g_defrange.maxBitrateCBR || inputValBitrate == "")
			{
				$("#formBitrate_stream_1:text").val(rangeBitrate).focus();
				$("#sliderBitrate_stream_1").slider("value", rangeBitrate);
				alert(GetMsgLang("0402069904"));
			}
		});

		$("#formQuality_stream_1:text").unbind().keyup(function() {
			$("#sliderQuality_stream_1").slider("value", $("#formQuality_stream_1:text").val());
		}).blur(function() {
			var inputValQuality = $("#formQuality_stream_1:text").val()-0;
			$("#formQuality_stream_1:text").val(inputValQuality);
			if($(this).val() == 0) return;
			var rangeQuality;

			rangeQuality = eval(profile + "_VIDEOCODEC_ST1_MJPEG_QUALITY");

			if(inputValQuality < 0 || inputValQuality > 100 || inputValQuality == "")
			{
				$("#formQuality_stream_1:text").val(rangeQuality).focus();
				$("#sliderQuality_stream_1").slider("value", rangeQuality);
				alert(GetMsgLang("0402069904"));
			}
		});

		// snapshot
		$("#formCdSnapEnable:checkbox").unbind().change(useInfo);
		if(eval(profile+"_SNAPSHOT_ENABLE") == "yes")
			$("#formCdSnapEnable:checkbox").attr("checked", "checked");
		else
			$("#formCdSnapEnable:checkbox").attr("checked", "");
		$("select#formCdSnapResolution").val(eval(profile+"_SNAPSHOT_RESOLUTION"));
		$("select#formCdSnapResolution").unbind().change(function() {
			if($("#formCdSnapEnable:checkbox").attr("checked") == true)
				useInfo();
		});

		$("#formCdSnapMaxFps:text").val(eval(profile+"_SNAPSHOT_MAXFPS"))
		.parent().parent().find(".slider-bar").slider({
			range: 'min',
			min: 1,
			max: 5,
			change: function(event, ui) {
				if($("#formCdSnapEnable:checkbox").attr("checked") == true)
					useInfo();
			},
			value: eval(profile+"_SNAPSHOT_MAXFPS"),
			slide: function(event, ui) {
				$("#formCdSnapMaxFps:text").val(ui.value);
			}
		});

		$("#formCdSnapQuality:text").val(eval(profile+"_SNAPSHOT_QUALITY"))
		.parent().parent().find(".slider-bar").slider({
			range: 'min',
			min: 0,
			max: 100,
			value: eval(profile+"_SNAPSHOT_QUALITY"),
			slide: function(event, ui) {
				$("#formCdSnapQuality:text").val(ui.value);
			}
		});

		// 텍스트 박스 & 슬라이더바
		$("#formCdSnapMaxFps:text").unbind().keyup(function() {
			$("#sliderCdSnapMaxFps").slider("value", $("#formCdSnapMaxFps:text").val());
		}).blur(function() {
			var inputValCdSnapMaxFps = $("#formCdSnapMaxFps:text").val()-0;
			$("#formCdSnapMaxFps:text").val(inputValCdSnapMaxFps);

			if(inputValCdSnapMaxFps < 1 || inputValCdSnapMaxFps > 5 || inputValCdSnapMaxFps == "")
			{
				$("#formCdSnapMaxFps:text").val(eval(profile+"_SNAPSHOT_MAXFPS")).focus();
				$("#sliderCdSnapMaxFps").slider("value", eval(profile+"_SNAPSHOT_MAXFPS"));
				alert(GetMsgLang("0402069904"));
			}
		});

		$("#formCdSnapQuality:text").unbind().keyup(function() {
			$("#sliderCdSnapQuality").slider("value", $("#formCdSnapQuality:text").val());
		}).blur(function() {
			var inputValCdSnapQuality = $("#formCdSnapQuality:text").val()-0;
			$("#formCdSnapQuality:text").val(inputValCdSnapQuality);
			if($(this).val() == 0) return;

			if(inputValCdSnapQuality < 0 || inputValCdSnapQuality > 100 || inputValCdSnapQuality == "")
			{
				$("#formCdSnapQuality:text").val(eval(profile+"_SNAPSHOT_QUALITY")).focus();
				$("#sliderCdSnapQuality").slider("value", eval(profile+"_SNAPSHOT_QUALITY"));
				alert(GetMsgLang("0402069904"));
			}
		});


		// audio
		if(eval(profile+"_AUDIOIN_CH0_ENABLE") == "yes")
			$("#formInEnable:checkbox").attr("checked", "checked");
		else
			$("#formInEnable:checkbox").attr("checked", "");

		if(eval(profile+"_AUDIOOUT_CH0_ENABLE") == "yes")
			$("#formOutEnable:checkbox").attr("checked", "checked");
		else
			$("#formOutEnable:checkbox").attr("checked", "");

		$("#formInVolume:text").val(eval(profile+"_AUDIOIN_CH0_VOLUME"))
		.parent().parent().find("#sliderEncoderPFInputVol, .slider-bar").slider({
			range: 'min',
			min: 0,
			max: 255,
			value: eval(profile+"_AUDIOIN_CH0_VOLUME"),
			slide: function(event, ui) {
				$("#formInVolume:text").val(ui.value);
			}
		});
		$("#formOutVolume:text").val(eval(profile+"_AUDIOOUT_CH0_VOLUME"))
		.parent().parent().find("#sliderEncoderPFOutVol, .slider-bar").slider({
			range: 'min',
			min: 0,
			max: 255,
			value: eval(profile+"_AUDIOOUT_CH0_VOLUME"),
			slide: function(event, ui) {
				$("#formOutVolume:text").val(ui.value);
			}
		});

		$("#formInVolume:text").unbind().keyup(function() {
			$("#sliderEncoderPFInputVol").slider("value", $("#formInVolume:text").val());
		}).blur(function() {
			var inputValAudioInVol = $("#formInVolume:text").val()-0;
			$("#formInVolume:text").val(inputValAudioInVol);
			if($(this).val() == 0) return;

			if(inputValAudioInVol < 0 || inputValAudioInVol > 255 || inputValAudioInVol == "")
			{
				$("#formInVolume:text").val(eval(profile+"_AUDIOIN_CH0_VOLUME")).focus();
				$("#sliderEncoderPFInputVol").slider("value", eval(profile+"_AUDIOIN_CH0_VOLUME"));
				alert(GetMsgLang("0402069904"));
			}
		});
		$("#formOutVolume:text").unbind().keyup(function() {
			$("#sliderEncoderPFInputVol").slider("value", $("#formOutVolume:text").val());
		}).blur(function() {
			var inputValAudioOutVol = $("#formOutVolume:text").val()-0;
			$("#formOutVolume:text").val(inputValAudioOutVol);
			if($(this).val() == 0) return;

			if(inputValAudioOutVol < 0 || inputValAudioOutVol > 255 || inputValAudioOutVol == "")
			{
				$("#formOutVolume:text").val(eval(profile+"_AUDIOOUT_CH0_VOLUME")).focus();
				$("#sliderEncoderPFInputVol").slider("value", eval(profile+"_AUDIOOUT_CH0_VOLUME"));
				alert(GetMsgLang("0402069904"));
			}
		});

		$("select#formInCodec").val(eval(profile+"_AUDIOIN_CH0_ADC_CODEC"));
		$("select#formInFrequency").val(eval(profile+"_AUDIOIN_CH0_ADC_FREQUENCY"));
		$("#formOutPort:text").val(eval(profile+"_AUDIOOUT_CH0_TCP_PORT"));

		$("#formOutPort:text").unbind().keyup().blur(function() {
			var inputValAudioOutVol = $("#formOutPort:text").val()-0;
			$("#formOutPort:text").val(inputValAudioOutVol);

			if(inputValAudioOutVol < 1 || inputValAudioOutVol > 65535 || inputValAudioOutVol == "")
			{
				$("#formOutPort:text").val(eval(profile+"_AUDIOOUT_CH0_TCP_PORT")).focus();
				alert(GetMsgLang("0402069904"));
			}
		});

		$("input[name='audioInputSource'][value='" + eval(profile + "_AUDIOIN_CH0_PORT") + "']:radio").attr("checked", "checked");

		SetSubRelation();
		reRange();
		// first stream 으로 이동
		$("#stream_tab ul li a:eq(0)").click();
		initValue = true;
		useInfo();
	});

	$("select#formProfileList").click(function(){
		selectProfile = $(this).val();
	});
}

////////////////////////////////////////////////////////////////////////////////
// Function Name : ResolutionExceptionCheck()
// Description     : 1080p, 720p, 630p 의 설정이 동시에 이루어 지지 않도록 한다.
// Return value    : 동시설정되지 않아 저장 허용 0, 아니면 -1
////////////////////////////////////////////////////////////////////////////////
function ResolutionExceptionCheck()
{
	var enableStatus_stream_0 = $("#formEncoderPFEnable_stream_0:checkbox", $("#stream_0")).attr("checked");
	var enableStatus_stream_1 = $("#formEncoderPFEnable_stream_1:checkbox", $("#stream_1")).attr("checked")
	var enableStatus_snapshot = $("#formCdSnapEnable:checkbox", $("#snapshot")).attr("checked");
	var resStatus_stream_0 = $("select#formResolution_stream_0", $("#stream_0")).val();
	var resStatus_stream_1 = $("select#formResolution_stream_1", $("#stream_1")).val();
	var resStatus_snapshot = $("select#formCdSnapResolution", $("#snapshot")).val();

	// First Stream 이 Enable 일때
	if(enableStatus_stream_0 == true)
	{
		if(resStatus_stream_0 == "1920x1080" || resStatus_stream_0 == "1280x720" || resStatus_stream_0 == "1120x630")
		{
			if(enableStatus_stream_1 == true)
			{
				if(resStatus_stream_1 == "1920x1080" || resStatus_stream_1 == "1280x720" || resStatus_stream_1 == "1120x630")
				{
					if(resStatus_stream_0 != resStatus_stream_1)
					{
						return -1
					}
				}
			}

			if(enableStatus_snapshot == true)
			{
				if(resStatus_snapshot == "1920x1080" || resStatus_snapshot == "1280x720" || resStatus_snapshot == "1120x630")
				{
					if(resStatus_stream_0 != resStatus_snapshot)
					{
						return -1
					}
				}
			}
		}
	}

	//Second Stream 이 Enable 일때
	if(enableStatus_stream_1 == true)
	{
		if(resStatus_stream_1 == "1920x1080" || resStatus_stream_1 == "1280x720" || resStatus_stream_1 == "1120x630")
		{
			if(enableStatus_snapshot == true)
			{
				if(resStatus_snapshot == "1920x1080" || resStatus_snapshot == "1280x720" || resStatus_snapshot == "1120x630")
				{
					if(resStatus_stream_1 != resStatus_snapshot)
					{
						return -1
					}
				}
			}
		}
	}

	return 0;
}

function initBrand()
{
	var pathPageNameAll = "inline";
	var pathPageNameVideo = "none";

	if(parent.g_brand.productID != "d001")
	{
		if(parent.g_brand.audioInOut == "0/0")
		{
			pathPageNameAll = "none";
			pathPageNameVideo = "inline";
			$("li.audioContents").css("display", "none").removeClass("item");
		}
		else if(parent.g_brand.audioInOut == "1/0")
		{
			$("ul.audioOutContents").css("display", "none");
		}
		else if(parent.g_brand.audioInOut == "0/1")
		{
			$("ul.audioInContents").css("display", "none");
		}
	}

	$("#parentpagename").css("display", pathPageNameAll);
	$("#parentpagename_video").css("display", pathPageNameVideo);

	jqDisplayCtrl($(".audioInSourceContents"), parent.g_brand.audioInType == 2);

	if(parent.g_brand.pantilt == "speed" && parent.g_brand.lensType == "mfz")
		g_speedMFZ = 1;
}

function useInfo()
{
	if(initValue == false)
	{
		return;
	}
	var defaultName = "";
	var list = "";
	var info = "";
	Disable($("button#btnApply"));
	// stream
	for(var stNum=0;stNum<2;stNum++)
	{
		var $obj = $("#stream_" + stNum);
		var streamResolution = $("select#formResolution_stream_" + stNum, $obj).val();
		var streamResolution2 = ""
		if(g_speedMFZ == 1)
		{
			if(streamResolution == "1280x960")
				streamResolution = "1920x1080";
		}
		streamResolution2 = translateResolution(g_videoStandard, streamResolution);

		if($("#formEncoderPFEnable_stream_" + stNum + ":checkbox", $obj).attr("checked") == true)
		{
			defaultName = "stream" + stNum;
			if(list == "")
			{
				list = "list=" + defaultName;
			}
			else
			{
				list += "," + defaultName;
			}

			var codec = $("select#formEncoderPFVCodec_stream_" + stNum, $obj).val(); // 현재 codec 값
			info += "&" + defaultName + "_codec=" + codec;
			info += "&" + defaultName + "_resolution=" + (streamResolution2 == "" ? streamResolution : streamResolution2);
			info += "&" + defaultName + "_fps=" + $("#formMaxFps_stream_" + stNum + ":text", $obj).val();
		}
	}

	// snapshot
	if($("#formCdSnapEnable:checkbox", $("#snapshot")).attr("checked") == true)
	{
		var snapResolution = $("select#formCdSnapResolution", $("#snapshot")).val();
		var snapResolution2 = "";
		if(g_speedMFZ == 1)
		{
			if(snapResolution == "1280x960")
				snapResolution = "1920x1080";
		}
		snapResolution2 = translateResolution(g_videoStandard, snapResolution);

		defaultName = "snapshot"
		if(list == "")
		{
			list = "list=" + defaultName;
		}
		else
		{
			list += "," + defaultName;
		}

		info += "&" + defaultName + "_codec=" + "jpeg";
		info += "&" + defaultName + "_resolution=" + (snapResolution2 == "" ? snapResolution : snapResolution2);
		info += "&" + defaultName + "_fps=" + $("#formCdSnapMaxFps:text", $("#snapshot")).val();
	}

	$.getScript("/uapi-cgi/resource.cgi?mode=js&" + list + info, function(){
		var usedResult = Math.ceil(resUsed);
		var usageDescription = usedResult + "%";

		if(g_isVcaEnable == false && list == "")
			usedResult = 0;

		var trueFalseResult = isValidUsageRange(usedResult);
		if(g_isVcaEnable == true || g_rotateDBValue != "none")
		{
			usageDescription = usedResult + "% + 50% " + (g_isVcaEnable ? "(VCA)" : "(Image Rotation)");
			trueFalseResult = isValidUsageRange(eval(usedResult + 50));
		}

		Allow = trueFalseResult;
		var usageFontSize = "15px";
		var usageColor = "#52A34C";
		if(trueFalseResult == true || usedResult == 0)
		{
			if(loadingFlag == 0){
				Enable($("button#btnApply"));	
			}
		}
		else if(trueFalseResult == false)
		{
			Disable($("button#btnApply"));
			usageFontSize = "20px";
			usageColor = "#E62B00";
		}

		$("#formEncoderUsage").text(usageDescription).css({
			"font-size" : usageFontSize,
			"color" : usageColor,
			"font-weight" : "bold"
		});

		if (IsCodecUsageRestriction == false)
		{
			if(loadingFlag == 0){
				Enable($("button#btnApply"));	
			}
			Allow = true;
		}
	});
}

////////////////////////////////////////////////////////////////////////////////
// Function Name: showListResize()
// Description    : Show profile list 버튼을 클릭하였을때 페이지 Resize
////////////////////////////////////////////////////////////////////////////////
function showListResize()
{
	var showProfileListSize = 230;
	var extraSize = 140;
	var tabSize = $("#stream_tab").height();
	var wholePageSize = tabSize + extraSize;

	if(showProfileFlag == 1)
		wholePageSize = wholePageSize + showProfileListSize;

	ResizePage(wholePageSize);
}

function reRange()
{
	var resolution = $("select#formResolution_stream_0").val();
	var stream0FpsLabel = $("#maxFps_stream_0 label");
	var stream1FpsLabel = $("#maxFps_stream_1 label");
	var stream0GopLabel = $("#gop_stream_0 label");
	var stream1GopLabel = $("#gop_stream_1 label");
	var isEncoderPal = (parent.g_brand.cameraClass == "encoder" && g_videoStandard == "pal");

	if(isEncoderPal)
	{
		//g_stream0_limit_gopfps = 25;
		g_stream0_limit_fps = 25;
		g_stream0_limit_gop = 25;
		//g_stream1_limit_gopfps = 25;
		g_stream1_limit_fps = 25;
		g_stream1_limit_gop = 25;
	}
	else
	{
		if(g_isVcaEnable == true && resolution == "1920x1080")
		{
			g_stream0_limit_fps = 15;
			g_stream0_limit_gop = 15;
		}
		else
		{
			g_stream0_limit_fps = transrationMaxRange(g_aspectRatioDBValue, parent.g_brand.productID);
			g_stream0_limit_gop = 30;
		}
	}

	if("seek-thermal" == parent.g_brand.imgDevice)
	{
		var seekRange = 9;
		g_stream0_limit_fps = seekRange;
		g_stream0_limit_gop = seekRange;
		g_stream1_limit_fps = seekRange;
		g_stream1_limit_gop = seekRange;
	}

	if(parent.g_support.tamarisk9fps)
	{
		var tama9Range = 9;
		g_stream0_limit_fps = tama9Range;
		g_stream0_limit_gop = tama9Range;
		g_stream1_limit_fps = tama9Range;
		g_stream1_limit_gop = tama9Range;
	}

	stream0FpsLabel.html("(1 ... " + g_stream0_limit_fps + " fps)");
	stream0GopLabel.html("(1 ... " + g_stream0_limit_gop + ")");
	stream1FpsLabel.html("(1 ... " + g_stream1_limit_fps + " fps)");
	stream1GopLabel.html("(1 ... " + g_stream1_limit_gop + ")");

	reRelation();
}

function reRelation()
{
	var profile = DefaultGroup + "_CH0";

	if(profileLoadCheck == 1)
	{
		profile = DefaultGroup + "PROFILE_" + selectProfile.toUpperCase();
	}

	var codecDB = eval(profile + "_VIDEOCODEC_ST0_STANDARD");
	var codecDB_1 = eval(profile + "_VIDEOCODEC_ST1_STANDARD");
	var reMaxFps = eval(profile + "_VIDEOCODEC_ST0_" + codecDB.toUpperCase() + "_MAXFPS");
	var reMaxFps_1 = eval(profile + "_VIDEOCODEC_ST1_" + codecDB_1.toUpperCase() + "_MAXFPS");
	var reGop = Number(eval(profile + "_VIDEOCODEC_ST0_H264_PCOUNT")) + 1;
	var reGop_1 = Number(eval(profile + "_VIDEOCODEC_ST1_H264_PCOUNT")) + 1;

	if(g_stream0_limit_fps == 15)
	{
		if(reMaxFps > 15)
			reMaxFps = 15;

		if(reGop > 15)
			reGop = 15;
	}
	else if(g_stream0_limit_fps == 14)
	{
		if(reMaxFps > 14)
			reMaxFps = 14;
	}

	if ($("#formMaxFps_stream_0:text").val() > g_stream0_limit_fps)
	{
		reMaxFps = g_stream0_limit_fps;
	}
	if ($("#formMaxFps_stream_1:text").val() > g_stream1_limit_fps)
	{
		reMaxFps_1 = g_stream1_limit_fps;
	}

	$("#formMaxFps_stream_0:text").val(reMaxFps)
	.parent().parent().find(".slider-bar").slider({
		range: 'min',
		min: 1,
		max: g_stream0_limit_fps,
		value: reMaxFps,
		slide: function(event, ui) {
			$("#formMaxFps_stream_0:text").val(ui.value);
		}
	});

	$("#formMaxFps_stream_1:text").val(reMaxFps_1)
	.parent().parent().find(".slider-bar").slider({
		range: 'min',
		min: 1,
		max: g_stream1_limit_fps,
		value: reMaxFps_1,
		slide: function(event, ui) {
			$("#formMaxFps_stream_1:text").val(ui.value);
		}
	});

	$("#formGOP_stream_0:text").val(reGop)
	.parent().parent().find(".slider-bar").slider({
		range: 'min',
		min: 1,
		max: g_stream0_limit_gop,
		value: reGop,
		slide: function(event, ui) {
			$("#formGOP_stream_0:text").val(ui.value);
		}
	});

	$("#formGOP_stream_1:text").val(reGop_1)
	.parent().parent().find(".slider-bar").slider({
		range: 'min',
		min: 1,
		max: g_stream1_limit_gop,
		value: reGop_1,
		slide: function(event, ui) {
			$("#formGOP_stream_1:text").val(ui.value);
		}
	});

	$("#formMaxFps_stream_0:text").unbind().keyup(function() {
		$("#sliderMaxFps_stream_0").slider("value", $("#formMaxFps_stream_0:text").val());
	}).blur(function() {
		var inputValMaxFps = $("#formMaxFps_stream_0:text").val();
		var rangeMaxfps = reMaxFps;

		if(inputValMaxFps < 1 || inputValMaxFps > g_stream0_limit_fps || inputValMaxFps == "")
		{
			$("#formMaxFps_stream_0:text").val(rangeMaxfps).focus();
			$("#sliderMaxFps_stream_0").slider("value", rangeMaxfps);
			alert(GetMsgLang("0402069904"));
		}
	});
	$("#formMaxFps_stream_1:text").unbind().keyup(function() {
		$("#sliderMaxFps_stream_1").slider("value", $("#formMaxFps_stream_1:text").val());
	}).blur(function() {
		var inputValMaxFps = $("#formMaxFps_stream_1:text").val();
		var rangeMaxfps = reMaxFps_1;

		if(inputValMaxFps < 1 || inputValMaxFps > g_stream1_limit_fps || inputValMaxFps == "")
		{
			$("#formMaxFps_stream_1:text").val(rangeMaxfps).focus();
			$("#sliderMaxFps_stream_1").slider("value", rangeMaxfps);
			alert(GetMsgLang("0402069904"));
		}
	});

	$("#formGOP_stream_0:text").unbind().keyup(function() {
		$("#sliderGOP_stream_0").slider("value", $("#formGOP_stream_0:text").val());
	}).blur(function() {
		var inputValPcount = $("#formGOP_stream_0:text").val();
		var rangePcount;

		rangePcount = reGop;

		if(inputValPcount < 1 || inputValPcount > g_stream0_limit_gop || inputValPcount == "")
		{
			$("#formGOP_stream_0:text").val(rangePcount).focus();
			$("#sliderGOP_stream_0").slider("value", rangePcount);
			alert(GetMsgLang("0402069904"));
		}
	});

	$("#formGOP_stream_1:text").unbind().keyup(function() {
		$("#sliderGOP_stream_1").slider("value", $("#formGOP_stream_1:text").val());
	}).blur(function() {
		var inputValPcount = $("#formGOP_stream_1:text").val();
		var rangePcount;

		rangePcount = reGop_1;

		if(inputValPcount < 1 || inputValPcount > g_stream1_limit_gop || inputValPcount == "")
		{
			$("#formGOP_stream_1:text").val(rangePcount).focus();
			$("#sliderGOP_stream_1").slider("value", rangePcount);
			alert(GetMsgLang("0402069904"));
		}
	});

	$("#formMaxFps_stream_0:text", $("#stream_0")).numeric();
	$("#formGOP_stream_0:text", $("#stream_0")).numeric();
	$("#formMaxFps_stream_1:text", $("#stream_1")).numeric();
	$("#formGOP_stream_1:text", $("#stream_1")).numeric();
	$(".numeric").numeric();

	profileLoadCheck = 0;
}


function custom_init() {
	return true;
}

function NotifyMessage()
{
	//Show notification message
}

function GetAdditionalUpdateRequest()
{
	return;
}

function isLimitStreamForSeek()
{
	var isLimit = false;
	var firstStandard = ENCODER_CH0_VIDEOCODEC_ST0_STANDARD.toUpperCase();
	var firstResolution = eval("ENCODER_CH0_VIDEOCODEC_ST0_" + firstStandard + "_RESOLUTION").toLowerCase();

	if(g_isLimitSeek)
	{
		$.each(g_resListForSeek, function(index, value){
			if(ENCODER_CH0_VIDEOCODEC_ST0_ENABLE == "yes" && firstResolution == value)
			{
				isLimit = true;
			}
			else if(ENCODER_CH0_SNAPSHOT_ENABLE == "yes" && ENCODER_CH0_SNAPSHOT_RESOLUTION == value)
			{
				isLimit = true;
			}
		});
	}

	return isLimit;
}

function isLimitStreamForSeek_form()
{
	var isLimit = false;
	var firstEnable = $("#formEncoderPFEnable_stream_0:checkbox").attr("checked");
	var snapEnable = $("#formCdSnapEnable:checkbox").attr("checked");
	var firstResolution = $("select#formResolution_stream_0").val();
	var snapResolution = $("select#formCdSnapResolution").val();

	if(g_isLimitSeek)
	{
		$.each(g_resListForSeek, function(index, value){
			if(firstEnable == true && firstResolution == value)
			{
				isLimit = true;
			}
			else if(snapEnable == true  && snapResolution == value)
			{
				isLimit = true;
			}
		});
	}

	return isLimit;
}
