var DefaultGroup = "ENCODER";
var nSelected = 0;
var selectProfile = "";
var Allow = false;
var infoTimer;
var initValue = false;
var g_speedMFZ = 0;
var g_stream0_fps = 30;
var g_stream1_fps = 30;
var g_stream0_gop = 30;
var g_stream1_gop = 30;
var g_isVcaEnable = false;
var reRangeLoadFlag = 0;
var g_videoStandard = "";
var g_aspectRatioDBValue = "16:9";
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
	var classNum = ["0402059913", "0402059914", "0402059915", "0402059916", "0402059917", 
	"0402059918", "0402059919", "0402059920", "0402059923",
	"0402059924", "0402059925", "0402059928", "0402059929", "0501", "0402059930"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "encoderprofile", 
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
	g_videoStandard = SYSTEM_STATUS_VIDEOIN_CH0_STANDARD.toLowerCase();
	g_aspectRatioDBValue = VIDEOIN_CH0_CMOS_RATIO.toLowerCase();

	if(g_isVcaEnable && "seek-thermal" == parent.g_brand.imgDevice)
		g_isLimitSeek = true;

	InitForm();
	InitSetting();
	EventBind();
	ContentShow();
	PostCustomize();
}

function InitForm()
{
	var resArray = g_dataArray["system_properties_stream_resolution"].split(",");

	if(parent.g_configData.skin != "noline-silver")
	{
		$("ul.line-delimiter").css("display", "none");
	}

	if("rs51c0b" == parent.g_brand.imgDevice ||
		"mdc200s" == parent.g_brand.imgDevice ||
		"mdc600s" == parent.g_brand.imgDevice)
	{
		Disable($(".resolution"));
	}

	if(isLimitFPS14(g_aspectRatioDBValue, parent.g_brand.productID))
	{
		$(".stream_1_contents").css("display", "none");
	}

	if("rs51c0b" == parent.g_brand.imgDevice ||
		"mdc200s" == parent.g_brand.imgDevice ||
		"mdc600s" == parent.g_brand.imgDevice)
	{
		$(".maxFPSContents, .gopContents").css("display", "none");
	}

	if (parent.g_brand.cameraClass == "encoder")
	{
		$("#codecUsageInfo").css("display", "none");
		$("#formEncoderUsage").css("display", "none");
		$("#InfoCodecUsage").css("display", "none");
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
			}

			i++;
		}
	});

	$("#stream_tab").tabs({
		select: function(event, ui)
		{
			var height;
			nSelected = ui.index;
		}
	});

	$("#formEncoderPFName:text").keyup(function(){
		LimitCharac("formEncoderPFName:text", 128);
	});
	$("#formEncoderPFDesc:text").keyup(function(){
		LimitCharac("formEncoderPFDesc:text", 256);
	});

	$("#input_form").dialog({
		autoOpen: false,
		width: 640,
		modal: true,
		resizable: false,
		position: [10,10],
		open: function() {
				$("#msg_status").removeClass('ui-state-error, ui-state-highlight').text("");
				$(":text").removeClass('ui-state-error');

				// space, special key 입력 제한
				var down = "";
				$("#formEncoderPFName:text").keydown(function(e){
					down = $(this).val();
					// 32 space 입력제한
					if(e.which == 32)
					{
						e.preventDefault();
					}
					else
					{
						return true;
					}
				});

				// 글자수 제한
				$("#formEncoderPFName:text").keyup(function(){
					LimitCharac("formEncoderPFName:text", 32);
				});
				$("#formEncoderPFDesc:text").keyup(function(){
					LimitCharac("formEncoderPFDesc:text", 100);
				});
				// 한글 제한 chrome
				LimitKor();
				Disable($("button#btnAdd"));
				Disable($("button#btnCopy"));
				Disable($("button#btnModify"));
				Disable($("button#btnRemove"));
				reRangeLoadFlag = 1;
		},
		close: function() {
			ResizePage();
			$("#msg_status").removeClass('ui-state-error');
			$( "#effect" ).hide();
			Enable($("button#btnAdd"));
			Enable($("button#btnCopy"));
			Enable($("button#btnModify"));
			Enable($("button#btnRemove"));
		}
	});

	$("#btnDialogOK").button().click(function(){
		if(Allow == false)
		{
			alert(GetMsgLang("0402059913"));
			return false;
		}
		var bValid = true;

		bValid = bValid && checkLength($("#formEncoderPFName:text"), GetMsgLang("0402059928"), 1, 32);
		bValid = bValid && checkRegexp($("#formEncoderPFName:text"), /^[a-z]([0-9a-z_])+$/i, GetMsgLang("0402059929"));

		if(bValid == false)
		{
			return false;
		}

		var Req = new CGIRequest();
		var group = DefaultGroup + "PROFILE";

		QString = makeQString();

		switch($("#input_form").dialog("option", "mode"))
		{
		case "add":
		case "copy":
			reqQString = "action=add&xmlschema";
			reqQString += "&profile=" + $("#formEncoderPFName:text").val();
			reqQString += "&description=" + encodeURIComponent($("#formEncoderPFDesc:text").val());

			// stream
			for (stNum = 0; stNum < 2; stNum++) {
				var $obj = $("#stream_" + stNum);
				var codec = $("select#formEncoderPFVCodec_stream_" + stNum, $obj).val(); // 현재 codec 값
				var streamResolution = $("select#formResolution_stream_" + stNum, $obj).val();
				if(g_speedMFZ == 1)
				{
					if(streamResolution == "1280x960")
						streamResolution = "1920x1080";
				}

				// Enable
				reqQString += "&Videocodec.St" + stNum + ".enable=";
				reqQString += ($("#formEncoderPFEnable_stream_" + stNum + ":checkbox", $obj).attr("checked") == true) ? "yes" : "no";
				// Video Codec
				reqQString += "&Videocodec.St" + stNum + ".standard=" + codec;
				// Resolution
				reqQString += "&Videocodec.St" + stNum + "." + codec + ".resolution=";
				reqQString += streamResolution;
				// Max.FPS
				reqQString += "&Videocodec.St" + stNum + "." + codec + ".maxfps=";
				reqQString += $("#formMaxFps_stream_" + stNum + ":text", $obj).val();

				// Mjpeg
				reqQString += "&Videocodec.St" + stNum + ".Mjpeg.quality=";
				reqQString += $("#formQuality_stream_" + stNum + ":text", $obj).val();
				
				// H.264, MPEG4
				// Bit rate control
				reqQString += "&Videocodec.St" + stNum + ".H264.bitratectrl=";
				reqQString += $("input[name='formBitrateCtrl_stream_" + stNum + "']:checked:radio", $obj).val();
				// GOP
				reqQString += "&Videocodec.St" + stNum + ".H264.pcount=";
				reqQString += eval($("#formGOP_stream_" + stNum + ":text", $obj).val() - 1);

				// Profile identification
				reqQString += "&Videocodec.St" + stNum + ".H264.profile=";
				reqQString += $("#formProfileid_" + stNum, $obj).val();

				// Multiple slices
				reqQString += "&Videocodec.St" + stNum + ".H264.slice=";
				reqQString += ($("#formMultipleSlices_stream_" + stNum + ":checkbox", $obj).attr("checked") == true) ? "yes" : "no";

				// Q Value
				reqQString += "&Videocodec.St" + stNum + ".H264.qvalue=";
				reqQString += $("#formBRC_VBR_stream_" + stNum + "_QValue", $obj).val();

				// Target bitrate
				reqQString += "&Videocodec.St" + stNum + "." + codec + ".bitrate=";
				reqQString += $("#formBitrate_stream_" + stNum, $obj).val();

				reqQString += "&Videocodec.St" + stNum + "." + codec + ".maxbitrate=";
				reqQString += $("#maxBitrate_text_st" + stNum, $obj).val();
			}

			var $obj = $("#snapshot");
			var snapshotResolution = $("select#formCdSnapResolution", $obj).val();

			if(g_speedMFZ == 1)
			{
				if(snapshotResolution == "1280x960")
					snapshotResolution = "1920x1080";
			}

			reqQString += "&Snapshot.enable=";
			reqQString += ($("#formCdSnapEnable:checkbox", $obj).attr("checked") == true) ? "yes" : "no";
			reqQString += "&Snapshot.resolution=" + snapshotResolution;
			reqQString += "&Snapshot.maxfps=" + $("#formCdSnapMaxFps:text", $obj).val();
			reqQString += "&Snapshot.quality=" + $("#formCdSnapQuality:text", $obj).val();

			var $obj = $("#audio");
			reqQString += "&Audioin.Ch0.enable=";
			reqQString += ($("#formInEnable:checkbox", $obj).attr("checked") == true) ? "yes" : "no";
			reqQString += "&Audioout.Ch0.enable=";
			reqQString += ($("#formOutEnable:checkbox", $obj).attr("checked") == true) ? "yes" : "no";
			reqQString += "&Audioin.Ch0.volume=" + $("#formInVolume:text", $obj).val();
			reqQString += "&Audioin.Ch0.Adc.codec=" + $("select#formInCodec", $obj).val();
			reqQString += "&Audioin.Ch0.Adc.frequency=" + $("select#formInFrequency", $obj).val();
			reqQString += "&Audioout.Ch0.volume=" + $("#formOutVolume:text", $obj).val();
			reqQString += "&Audioout.Ch0.Tcp.port=" + $("#formOutPort:text", $obj).val();
			reqQString += "&Audioin.Ch0.port=" + $("input[name='audioInputSource']:checked:radio", $obj).val();
			
			break;
		case "modify":
			reqQString = "action=update&xmlschema";
			QString
				.set_action('update')
				.set_schema('xml')
				.add_list("description", eval("ENCODERPROFILE_" + selectProfile.toUpperCase() + "_DESCRIPTION"), encodeURIComponent($("#formEncoderPFDesc:text").val()));

			// stream
			for(var stNum = 0; stNum < 2; stNum++)
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
					.add_list("Videocodec.St" + stNum + ".enable", eval("ENCODERPROFILE_" + selectProfile.toUpperCase() + "_VIDEOCODEC_ST" + stNum + "_ENABLE"), ($("#formEncoderPFEnable_stream_" + stNum + ":checkbox", $obj).attr("checked") == true) ? "yes" : "no")
					// Video Codec
					.add_list("Videocodec.St" + stNum + ".standard", eval("ENCODERPROFILE_" + selectProfile.toUpperCase() + "_VIDEOCODEC_ST" + stNum + "_STANDARD"), codec)
					// Resolution
					.add_list("Videocodec.St" + stNum + "." + codec + ".resolution", eval("ENCODERPROFILE_" + selectProfile.toUpperCase() + "_VIDEOCODEC_ST" + stNum + "_" + codec.toUpperCase() + "_RESOLUTION"), streamResolution)
					// Max.FPS
					.add_list("Videocodec.St" + stNum + "." + codec + ".maxfps", eval("ENCODERPROFILE_" + selectProfile.toUpperCase() + "_VIDEOCODEC_ST" + stNum + "_" + codec.toUpperCase() + "_MAXFPS"), $("#formMaxFps_stream_" + stNum + ":text", $obj).val())
					// Jpeg Quality
					.add_list("Videocodec.St" + stNum + ".Mjpeg.quality", eval("ENCODERPROFILE_" + selectProfile.toUpperCase() + "_VIDEOCODEC_ST" + stNum + "_MJPEG_QUALITY"), $("#formQuality_stream_" + stNum + ":text", $obj).val())
					// GOP
					.add_list("Videocodec.St" + stNum + ".H264.pcount", eval("ENCODERPROFILE_" + selectProfile.toUpperCase() + "_VIDEOCODEC_ST" + stNum + "_H264_PCOUNT"), String(Number(eval($("#formGOP_stream_" + stNum + ":text", $obj).val()) - 1)))
					.add_list("Videocodec.St" + stNum + ".H264.bitratectrl", eval("ENCODERPROFILE_" + selectProfile.toUpperCase() + "_VIDEOCODEC_ST" + stNum + "_H264_BITRATECTRL"), $("input[name='formBitrateCtrl_stream_" + stNum + "']:checked:radio", $obj).val())
					.add_list("Videocodec.St" + stNum + ".H264.profile", eval("ENCODERPROFILE_" + selectProfile.toUpperCase() + "_VIDEOCODEC_ST" + stNum + "_H264_PROFILE"), $("#formProfileid_" + stNum, $obj).val())
					.add_list("Videocodec.St" + stNum + ".H264.slice", eval("ENCODERPROFILE_" + selectProfile.toUpperCase() + "_VIDEOCODEC_ST" + stNum + "_H264_SLICE"), ($("#formMultipleSlices_stream_" + stNum + ":checkbox", $obj).attr("checked") == true) ? "yes" : "no")
					// Q Value
					.add_list("Videocodec.St" + stNum + ".H264.qvalue",eval("ENCODERPROFILE_" + selectProfile.toUpperCase() + "_VIDEOCODEC_ST" + stNum + "_H264_QVALUE") , $("#formBRC_VBR_stream_" + stNum + "_QValue", $obj).val())
					// Target bitrate
					.add_list("Videocodec.St" + stNum + ".H264.bitrate",eval("ENCODERPROFILE_" + selectProfile.toUpperCase() + "_VIDEOCODEC_ST" + stNum + "_H264_BITRATE") , $("#formBitrate_stream_" + stNum, $obj).val())
					.add_list("Videocodec.St" + stNum + ".H264.maxbitrate",eval("ENCODERPROFILE_" + selectProfile.toUpperCase() + "_VIDEOCODEC_ST" + stNum + "_H264_MAXBITRATE") , $("#maxBitrate_text_st" + stNum, $obj).val());
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
				.add_list("Snapshot.enable", eval("ENCODERPROFILE_" + selectProfile.toUpperCase() + "_SNAPSHOT_ENABLE"), ($("#formCdSnapEnable:checkbox", $obj).attr("checked") == true) ? "yes" : "no")
				.add_list("Snapshot.resolution", eval("ENCODERPROFILE_" + selectProfile.toUpperCase() + "_SNAPSHOT_RESOLUTION"), snapshotResolution)
				.add_list("Snapshot.maxfps", eval("ENCODERPROFILE_" + selectProfile.toUpperCase() + "_SNAPSHOT_MAXFPS"), $("#formCdSnapMaxFps:text", $obj).val())
				.add_list("Snapshot.quality", eval("ENCODERPROFILE_" + selectProfile.toUpperCase() + "_SNAPSHOT_QUALITY"), $("#formCdSnapQuality:text", $obj).val());

			// Audio
			var $obj = $("#audio");
			QString
				.add_list("Audioin.Ch0.enable", eval("ENCODERPROFILE_" + selectProfile.toUpperCase() + "_AUDIOIN_CH0_ENABLE"), ($("#formInEnable:checkbox", $obj).attr("checked") == true) ? "yes" : "no")
				.add_list("Audioout.Ch0.enable", eval("ENCODERPROFILE_" + selectProfile.toUpperCase() + "_AUDIOOUT_CH0_ENABLE"), ($("#formOutEnable:checkbox", $obj).attr("checked") == true) ? "yes" : "no")
				.add_list("Audioin.Ch0.volume", eval("ENCODERPROFILE_" + selectProfile.toUpperCase() + "_AUDIOIN_CH0_VOLUME"), $("#formInVolume:text", $obj).val())
				.add_list("Audioin.Ch0.Adc.codec", eval("ENCODERPROFILE_" + selectProfile.toUpperCase() + "_AUDIOIN_CH0_ADC_CODEC"), $("select#formInCodec", $obj).val())
				.add_list("Audioin.Ch0.Adc.frequency", eval("ENCODERPROFILE_" + selectProfile.toUpperCase() + "_AUDIOIN_CH0_ADC_FREQUENCY"), $("select#formInFrequency", $obj).val())
				.add_list("Audioout.Ch0.volume", eval("ENCODERPROFILE_" + selectProfile.toUpperCase() + "_AUDIOOUT_CH0_VOLUME"), $("#formOutVolume:text", $obj).val())
				.add_list("Audioout.Ch0.Tcp.port", eval("ENCODERPROFILE_" + selectProfile.toUpperCase() + "_AUDIOOUT_CH0_TCP_PORT"), $("#formOutPort:text", $obj).val())
				.add_list("Audioin.Ch0.port", eval("ENCODERPROFILE_" + selectProfile.toUpperCase() + "_AUDIOIN_CH0_PORT"), $("input[name='audioInputSource']:checked:radio", $obj).val());

			reqQString = QString.get_qstring();
			if(!reqQString) {
				return;
			}
			reqQString += "&profile=" + selectProfile;

			break;
		default:
			alert(GetMsgLang("0402059914"));
			return false;
			break;
		}

		if($("#formEncoderPFEnable_stream_0:checkbox", $("#stream_0") ).attr("checked") == false
			&& $("#formEncoderPFEnable_stream_1:checkbox", $("#stream_1")).attr("checked") == false
			&& $("#formCdSnapEnable:checkbox", $("#snapshot")).attr("checked") == false)
		{
			alert(GetMsgLang("0402059915"));
		}
		else{

			if(ResolutionExceptionCheck())
			{
				alert(GetMsgLang("0402059916"));
				return;
			}

			Req.SetAddress("/uapi-cgi/encprofile.cgi");
			Req.SetType("POST");
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

				_debug($("#input_form").dialog("option", "mode") + " - " + reqQString);
				LoadParamJs(DefaultGroup + "PROFILE"+"&cache", function() {
					$("#input_form").dialog('close');
					InitSetting();
					ViewLoadingSave(false);
					$( "#effect" ).hide();
				});
				return;
			});

			_debug("start" + reqQString);
			Req.Request(reqQString);
		}
	});
	$("#btnDialogCancel").button().click(function(){
		$("#input_form").dialog('close');
	});
}

function InitSetting()
{
	var profileList;
	var profile_cnt = eval(DefaultGroup + "PROFILE" + "_NBROFPROFILE");

	if(profile_cnt > 0)
		profileList = eval(DefaultGroup + "PROFILE" + "_LIST").split(",");
	
	$("select#formProfileList").empty();
	for(var i = 0; i < profile_cnt; i++)
	{
		var group = DefaultGroup + "PROFILE" + "_" + profileList[i].toUpperCase();
		var resolv_0 = eval(group + "_VIDEOCODEC_ST0_STANDARD");
		var size_0 = eval(group + "_VIDEOCODEC_ST0_" + resolv_0.toUpperCase() + "_RESOLUTION");
		var resolv_1 = eval(group+"_VIDEOCODEC_ST1_STANDARD");
		var size_1 = eval(group + "_VIDEOCODEC_ST1_" + resolv_1.toUpperCase() + "_RESOLUTION");

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

		descListCheck = descListCheck.replace(/</g, "&lt;");

		if (parent.g_configData.langPath == "/language/Arabic.xml")
		{
			$("select#formProfileList").append("<option value='" + profileList[i] + "'>&lrm;</option>")
			.find("option").last().append(FillText(resolv_1 + '-' + size_1, (resolv_1 + '-' + size_1).length, "right")
				+ FillText(resolv_0 + '-' + size_0, 22, "right")
				+ FillText(descListCheck, 29, "right")
				+ FillText(eval(group+"_NAME"), 14, "right")
			);
		}
		else
		{
			$("select#formProfileList").append("<option value='" + profileList[i] + "'></option>")
			.find("option").last().append("&nbsp;"
				+ FillText(eval(group+"_NAME"), 14, "left")
				+ FillText(descListCheck, 29, "left")
				+ FillText(resolv_0 + '-' + size_0, 22, "left")
				+ FillText(resolv_1 + '-' + size_1, 22, "left")
			);
		}
	}
}

function SetInputForm(group)
{
	initValue = false;
	if(group == null)
	{
		group = "DEFAULT";
		$("#formEncoderPFName:text").val("");
	}
	else
	{
		$("#formEncoderPFName:text").val(eval(DefaultGroup + "PROFILE" + "_" + group + "_NAME"));
		if($("#input_form").dialog("option", "mode") == "copy")
		{
			$("#formEncoderPFName:text").val($("#formEncoderPFName:text").val() + '_COPY');
		}
	}
	var profile = DefaultGroup + "PROFILE" + "_" + group;

	$("#formEncoderPFDesc:text").val(eval(profile + "_DESCRIPTION"));

	$("#stream_tab").tabs("select" , 0);

	// tab
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
		}

		switch(index)
		{
			// first stream
			case 0:
				var $this = $(this);
				var codec = $("select#formEncoderPFVCodec_stream_0", $this).val(); // 현재 codec 값
				var codecDB = eval(profile + "_VIDEOCODEC_ST0_STANDARD"); // DB codec 값

				$("select#formEncoderPFVCodec_stream_0", $this).change(function() {
					if ($("#formEncoderPFEnable_stream_0:checkbox", $this).attr("checked") == true)
					{
						useInfo();
					}
				});
				$("select#formResolution_stream_0", $this).change(function() {
					if ($("#formEncoderPFEnable_stream_0:checkbox", $this).attr("checked") == true)
					{
						useInfo();
					}
				});
				$("#formEncoderPFEnable_stream_0:checkbox", $this).change(useInfo);

				$("#formMaxFps_stream_0:text", $this).val(1)
				.parent().parent()
				.find(".slider-bar").slider({
					range: 'min',
					min: 1,
					max: g_stream0_fps,
					value: eval(profile + "_VIDEOCODEC_ST0_" + codecDB.toUpperCase() + "_MAXFPS"),
					change: function(event, ui) {
						if ($("#formEncoderPFEnable_stream_0:checkbox", $this).attr("checked") == true)
						{
							useInfo();
						}
					},
					slide: function(event, ui) {
						$("#formMaxFps_stream_0:text", $this).val(ui.value);
					}
				});

				$("#formGOP_stream_0:text", $this).val(Number(eval(profile + "_VIDEOCODEC_ST0_H264_PCOUNT")) + 1)
				.parent().parent()
				.find(".slider-bar").slider({
					range: 'min',
					min: 1,
					max: g_stream0_gop,
					value: Number(eval(profile + "_VIDEOCODEC_ST0_H264_PCOUNT")) + 1,
					slide: function(event, ui) {
						$("#formGOP_stream_0:text", $this).val(ui.value);
					}
				});
				$("#maxBitrate_text_st0:text", $this).val(eval(profile + "_VIDEOCODEC_ST0_H264_MAXBITRATE"))
				.parent().parent()
				.find(".slider-bar").slider({
					range: 'min',
					min: g_defrange.minbitrate,
					max: g_defrange.maxbitrate,
					value: eval(profile + "_VIDEOCODEC_ST0_H264_MAXBITRATE"),
					slide: function(event, ui) {
						$("#maxBitrate_text_st0:text", $this).val(ui.value);
					}
				});
				
				$("#formBitrate_stream_0:text", $this).val(eval(profile + "_VIDEOCODEC_ST0_H264_BITRATE"))
				.parent().parent()
				.find(".slider-bar").slider({
					range: 'min',
					min: g_defrange.minbitrate,
					max: g_defrange.maxBitrateCBR,
					value: eval(profile + "_VIDEOCODEC_ST0_H264_BITRATE"),
					slide: function(event, ui) {
						$("#formBitrate_stream_0:text", $this).val(ui.value);
					}
				});
				$("#formQuality_stream_0:text", $this).val(eval(profile + "_VIDEOCODEC_ST0_MJPEG_QUALITY"))
				.parent().parent()
				.find(".slider-bar").slider({
					range: 'min',
					min: 0,
					max: 100,
					value: eval(profile + "_VIDEOCODEC_ST0_MJPEG_QUALITY"),
					slide: function(event, ui) {
						$("#formQuality_stream_0:text", $this).val(ui.value);
					}
				});

				// first stream text range
				$("#formMaxFps_stream_0:text", $this).unbind().keyup(function() {
					$("#sliderMaxFps_stream_0", $this).slider("value", $("#formMaxFps_stream_0:text", $this).val());
				}).blur(function() {
					var inputValMaxFps = $("#formMaxFps_stream_0:text", $this).val()-0;
					$("#formMaxFps_stream_0:text", $this).val(inputValMaxFps);
					var rangeMaxfps = eval(profile + "_VIDEOCODEC_ST0_" + codecDB.toUpperCase() + "_MAXFPS");

					if(inputValMaxFps < 1 || inputValMaxFps > g_stream0_fps || inputValMaxFps == "")
					{
						$("#formMaxFps_stream_0:text", $this).val(rangeMaxfps).focus();
						$("#sliderMaxFps_stream_0", $this).slider("value", rangeMaxfps);
						alert(GetMsgLang("0402059917"));
					}
				});
				$("#formGOP_stream_0:text", $this).unbind().keyup(function() {
					$("#sliderGOP_stream_0", $this).slider("value", $("#formGOP_stream_0:text", $this).val());
				}).blur(function() {
					var inputValPcount = $("#formGOP_stream_0:text", $this).val()-0;
					$("#formGOP_stream_0:text", $this).val(inputValPcount);
					var rangePcount;

					rangePcount = Number(eval(profile + "_VIDEOCODEC_ST0_H264_PCOUNT")) + 1;

					if(inputValPcount < 1 || inputValPcount > 30 || inputValPcount == "")
					{
						$("#formGOP_stream_0:text", $this).val(rangePcount).focus();
						$("#sliderGOP_stream_0", $this).slider("value", rangePcount);
						alert(GetMsgLang("0402059917"));
					}
				});
				$("#maxBitrate_text_st0:text", $this).unbind().keyup(function() {
					$("#maxBitrate_slider_st0", $this).slider("value", $("#maxBitrate_text_st0:text", $this).val());
				}).blur(function() {
					var inputValBitrate = $("#maxBitrate_text_st0:text", $this).val()-0;
					$("#maxBitrate_text_st0:text", $this).val(inputValBitrate);
					var rangeBitrate;

					rangeBitrate = eval(profile + "_VIDEOCODEC_ST0_H264_MAXBITRATE");

					if(inputValBitrate < g_defrange.minbitrate || inputValBitrate > g_defrange.maxbitrate || inputValBitrate == "")
					{
						$("#maxBitrate_text_st0:text", $this).val(rangeBitrate).focus();
						$("#maxBitrate_slider_st0", $this).slider("value", rangeBitrate);
						alert(GetMsgLang("0402059917"));
					}
				});
				
				$("#formBitrate_stream_0:text", $this).unbind().keyup(function() {
					$("#sliderBitrate_stream_0", $this).slider("value", $("#formBitrate_stream_0:text", $this).val());
				}).blur(function() {
					var inputValBitrate = $("#formBitrate_stream_0:text", $this).val()-0;
					$("#formBitrate_stream_0:text", $this).val(inputValBitrate);
					var rangeBitrate;

					rangeBitrate = eval(profile + "_VIDEOCODEC_ST0_H264_BITRATE");

					if(inputValBitrate < g_defrange.minbitrate || inputValBitrate > g_defrange.maxBitrateCBR || inputValBitrate == "")
					{
						$("#formBitrate_stream_0:text", $this).val(rangeBitrate).focus();
						$("#sliderBitrate_stream_0", $this).slider("value", rangeBitrate);
						alert(GetMsgLang("0402059917"));
					}
				});

				$("#formQuality_stream_0:text", $this).unbind().keyup(function() {
					$("#sliderQuality_stream_0", $this).slider("value", $("#formQuality_stream_0:text", $this).val());
				}).blur(function() {
					var inputValQuality = $("#formQuality_stream_0:text", $this).val()-0;
					$("#formQuality_stream_0:text", $this).val(inputValQuality);
					if($(this, $this).val() == 0) return;
					var rangeQuality;

					rangeQuality = eval(profile + "_VIDEOCODEC_ST0_MJPEG_QUALITY");

					if(inputValQuality < 0 || inputValQuality > 100 || inputValQuality == "")
					{
						$("#formQuality_stream_0:text", $this).val(rangeQuality).focus();
						$("#sliderQuality_stream_0", $this).slider("value", rangeQuality);
						alert(GetMsgLang("0402059917"));
					}
				});

				SubInitSetting(profile, index);
				SetSubRelation(index);
				break;

			// second stream
			case 1:
				var $this = $(this);
				var codec = $("select#formEncoderPFVCodec_stream_1", $this).val(); // 현재 codec 값
				var codecDB = eval(profile + "_VIDEOCODEC_ST1_STANDARD"); // DB codec 값
				
				$("#formEncoderPFEnable_stream_1:checkbox", $this).change(useInfo);
				$("select#formEncoderPFVCodec_stream_1", $this).change(function() {
					if ($("#formEncoderPFEnable_stream_1:checkbox", $this).attr("checked") == true)
					{
						useInfo();
					}
				});
				$("select#formResolution_stream_1", $this).change(function() {
					if ($("#formEncoderPFEnable_stream_1:checkbox", $this).attr("checked") == true)
					{
						useInfo();
					}
				});

				$("#formMaxFps_stream_1:text", $this).val(eval(profile + "_VIDEOCODEC_ST1_" + codecDB.toUpperCase() + "_MAXFPS"))
				.parent().parent()
				.find(".slider-bar").slider({
					range: 'min',
					min: 1,
					max: 30,
					value: eval(profile + "_VIDEOCODEC_ST1_" + codecDB.toUpperCase() + "_MAXFPS"),
					change: function(event, ui) {
						if ($("#formEncoderPFEnable_stream_1:checkbox", $this).attr("checked") == true)
						{
							useInfo();
						}
					},
					slide: function(event, ui) {
						$("#formMaxFps_stream_1:text", $this).val(ui.value);
					}
				});

				$("#formGOP_stream_1:text", $this).val(Number(eval(profile + "_VIDEOCODEC_ST1_H264_PCOUNT")) + 1)
				.parent().parent()
				.find(".slider-bar").slider({
					range: 'min',
					min: 1,
					max: 30,
					value: Number(eval(profile + "_VIDEOCODEC_ST1_H264_PCOUNT")) + 1,
					slide: function(event, ui) {
						$("#formGOP_stream_1:text", $this).val(ui.value);
					}
				});

				$("#maxBitrate_text_st1:text", $this).val(eval(profile + "_VIDEOCODEC_ST1_H264_MAXBITRATE"))
				.parent().parent()
				.find(".slider-bar").slider({
					range: 'min',
					min: g_defrange.minbitrate,
					max: g_defrange.maxbitrate,
					value: eval(profile + "_VIDEOCODEC_ST1_H264_MAXBITRATE"),
					slide: function(event, ui) {
						$("#maxBitrate_text_st1:text", $this).val(ui.value);
					}
				});
				$("#formBitrate_stream_1:text", $this).val(eval(profile + "_VIDEOCODEC_ST1_H264_BITRATE"))
				.parent().parent()
				.find(".slider-bar").slider({
					range: 'min',
					min: g_defrange.minbitrate,
					max: g_defrange.maxBitrateCBR,
					value: eval(profile + "_VIDEOCODEC_ST1_H264_BITRATE"),
					slide: function(event, ui) {
						$("#formBitrate_stream_1:text", $this).val(ui.value);
					}
				});
				$("#formQuality_stream_1:text", $this).val(eval(profile + "_VIDEOCODEC_ST1_MJPEG_QUALITY"))
				.parent().parent()
				.find(".slider-bar").slider({
					range: 'min',
					min: 0,
					max: 100,
					value: eval(profile + "_VIDEOCODEC_ST1_MJPEG_QUALITY"),
					slide: function(event, ui) {
						$("#formQuality_stream_1:text", $this).val(ui.value);
					}
				});

				// second stream text range
				$("#formMaxFps_stream_1:text", $this).unbind().keyup(function() {
					$("#sliderMaxFps_stream_1", $this).slider("value", $("#formMaxFps_stream_1:text", $this).val());
				}).blur(function() {
					var inputValMaxFps = $("#formMaxFps_stream_1:text", $this).val()-0;
					$("#formMaxFps_stream_1:text", $this).val(inputValMaxFps);
					var rangeMaxfps = eval(profile + "_VIDEOCODEC_ST1_" + codecDB.toUpperCase() + "_MAXFPS");

					if(inputValMaxFps < 1 || inputValMaxFps > g_stream1_fps || inputValMaxFps == "")
					{
						$("#formMaxFps_stream_1:text", $this).val(rangeMaxfps).focus();
						$("#sliderMaxFps_stream_1", $this).slider("value", rangeMaxfps);
						alert(GetMsgLang("0402059917"));
					}
				});
				$("#formGOP_stream_1:text", $this).unbind().keyup(function() {
					$("#sliderGOP_stream_1", $this).slider("value", $("#formGOP_stream_1:text", $this).val());
				}).blur(function() {
					var inputValPcount = $("#formGOP_stream_1:text", $this).val()-0;
					$("#formGOP_stream_1:text", $this).val(inputValPcount);
					var rangePcount;

					rangePcount = eval(profile + "_VIDEOCODEC_ST1_H264_PCOUNT");

					if(inputValPcount < 1 || inputValPcount > 30 || inputValPcount == "")
					{
						$("#formGOP_stream_1:text", $this).val(rangePcount).focus();
						$("#sliderGOP_stream_1", $this).slider("value", rangePcount);
						alert(GetMsgLang("0402059917"));
					}
				});
				$("#maxBitrate_text_st1:text", $this).unbind().keyup(function() {
					$("#maxBitrate_slider_st1", $this).slider("value", $("#maxBitrate_text_st1:text", $this).val());
				}).blur(function() {
					var inputValBitrate = $("#maxBitrate_text_st1:text", $this).val()-0;
					$("#maxBitrate_text_st1:text", $this).val(inputValBitrate);
					var rangeBitrate;

					rangeBitrate = eval(profile + "_VIDEOCODEC_ST1_H264_MAXBITRATE");

					if(inputValBitrate < g_defrange.minbitrate || inputValBitrate > g_defrange.maxbitrate || inputValBitrate == "")
					{
						$("#maxBitrate_text_st1:text", $this).val(rangeBitrate).focus();
						$("#maxBitrate_slider_st1", $this).slider("value", rangeBitrate);
						alert(GetMsgLang("0402059917"));
					}
				});
				$("#formBitrate_stream_1:text", $this).unbind().keyup(function() {
					$("#sliderBitrate_stream_1", $this).slider("value", $("#formBitrate_stream_1:text", $this).val());
				}).blur(function() {
					var inputValBitrate = $("#formBitrate_stream_1:text", $this).val()-0;
					$("#formBitrate_stream_1:text", $this).val(inputValBitrate);
					var rangeBitrate;

					rangeBitrate = eval(profile + "_VIDEOCODEC_ST1_H264_BITRATE");

					if(inputValBitrate < g_defrange.minbitrate || inputValBitrate > g_defrange.maxBitrateCBR || inputValBitrate == "")
					{
						$("#formBitrate_stream_1:text", $this).val(rangeBitrate).focus();
						$("#sliderBitrate_stream_1", $this).slider("value", rangeBitrate);
						alert(GetMsgLang("0402059917"));
					}
				});

				$("#formQuality_stream_1:text", $this).unbind().keyup(function() {
					$("#sliderQuality_stream_1", $this).slider("value", $("#formQuality_stream_1:text", $this).val());
				}).blur(function() {
					var inputValQuality = $("#formQuality_stream_1:text", $this).val()-0;
					$("#formQuality_stream_1:text", $this).val(inputValQuality);
					if($(this, $this).val() == 0) return;
					var rangeQuality;

					rangeQuality = eval(profile + "_VIDEOCODEC_ST1_MJPEG_QUALITY");

					if(inputValQuality < 0 || inputValQuality > 100 || inputValQuality == "")
					{
						$("#formQuality_stream_1:text", $this).val(rangeQuality).focus();
						$("#sliderQuality_stream_1", $this).slider("value", rangeQuality);
						alert(GetMsgLang("0402059917"));
					}
				});

				SubInitSetting(profile, index);
				SetSubRelation(index);
				break;

			// snapshot
			case 2:
				if(eval(profile+"_SNAPSHOT_ENABLE") == "yes")
				{
					$("#formCdSnapEnable:checkbox", $(this)).attr("checked", "checked");
				}
				else
				{
					$("#formCdSnapEnable:checkbox", $(this)).attr("checked", "");
				}
				$("select#formCdSnapResolution", $(this)).val(eval(profile+"_SNAPSHOT_RESOLUTION"));

				var $this = $(this);
				
				$("#formCdSnapEnable:checkbox", $(this)).change(useInfo);
				$("select#formCdSnapResolution", $("#snapshot")).change(function() {
					if ($("#formCdSnapEnable:checkbox", $this).attr("checked") == true)
					{
						useInfo();
					}
				});

				$("#formCdSnapMaxFps:text", $(this)).val(eval(profile+"_SNAPSHOT_MAXFPS"))
				.parent().parent()
				.find(".slider-bar").slider({
					range: 'min',
					min: 1,
					max: 5,
					value: eval(profile+"_SNAPSHOT_MAXFPS"),
					change: function(event, ui) {
						if ($("#formCdSnapEnable:checkbox", $this).attr("checked") == true)
						{
							useInfo();
						}
					},
					slide: function(event, ui) {
						$("#formCdSnapMaxFps:text", $this).val(ui.value);
					}
				});

				$("#formCdSnapQuality:text", $(this)).val(eval(profile+"_SNAPSHOT_QUALITY"))
				.parent().parent()
				.find(".slider-bar").slider({
					range: 'min',
					min: 0,
					max: 100,
					value: eval(profile+"_SNAPSHOT_QUALITY"),
					slide: function(event, ui) {
						$("#formCdSnapQuality:text", $this).val(ui.value);
					}
				});

				// Snapshot Text Range
				$("#formCdSnapMaxFps:text", $this).keyup(function() {
					$("#sliderCdSnapMaxFps", $this).slider("value", $("#formCdSnapMaxFps:text", $this).val());
				});
				$("#formCdSnapQuality:text", $this).keyup(function() {
					$("#sliderCdSnapQuality", $this).slider("value", $("#formCdSnapQuality:text", $this).val());
				});

				$("#formCdSnapMaxFps:text", $this).blur(function() {
					var inputValCdSnapMaxFps = $("#formCdSnapMaxFps:text", $this).val()-0;
					$("#formCdSnapMaxFps:text", $this).val(inputValCdSnapMaxFps);

					if(inputValCdSnapMaxFps < 1 || inputValCdSnapMaxFps > 5 || inputValCdSnapMaxFps == "")
					{
						$("#formCdSnapMaxFps:text", $this).val(eval(profile+"_SNAPSHOT_MAXFPS")).focus();
						$("#sliderCdSnapMaxFps", $this).slider("value", eval(profile+"_SNAPSHOT_MAXFPS"));
						alert(GetMsgLang("0402059917"));
					}
				});
				$("#formCdSnapQuality:text", $this).blur(function() {
					var inputValCdSnapQuality = $("#formCdSnapQuality:text", $this).val()-0;
					$("#formCdSnapQuality:text", $this).val(inputValCdSnapQuality);
					if($(this, $this).val() == 0) return;

					if(inputValCdSnapQuality < 0 || inputValCdSnapQuality > 100 || inputValCdSnapQuality == "")
					{
						$("#formCdSnapQuality:text", $this).val(eval(profile+"_SNAPSHOT_QUALITY")).focus();
						$("#sliderCdSnapQuality", $this).slider("value", eval(profile+"_SNAPSHOT_QUALITY"));
						alert(GetMsgLang("0402059917"));
					}
				});
				break;

			// audio
			case 3:
				if(eval(profile+"_AUDIOIN_CH0_ENABLE") == "yes")
				{
					$("#formInEnable:checkbox", $(this)).attr("checked", "checked");
				}
				else
				{
					$("#formInEnable:checkbox", $(this)).attr("checked", "");
				}
				if(eval(profile+"_AUDIOOUT_CH0_ENABLE") == "yes")
				{
					$("#formOutEnable:checkbox", $(this)).attr("checked", "checked");
				}
				else
				{
					$("#formOutEnable:checkbox", $(this)).attr("checked", "");
				}

				var $this = $(this);
				$("#formInVolume:text", $(this)).val(eval(profile+"_AUDIOIN_CH0_VOLUME"))
				.parent().parent()
				.find("#sliderEncoderPFInputVol, .slider-bar").slider({
					range: 'min',
					min: 0,
					max: 255,
					value: eval(profile+"_AUDIOIN_CH0_VOLUME"),
					slide: function(event, ui) {
						$("#formInVolume:text", $this).val(ui.value);
					}
				});

				$("select#formInCodec", $(this)).val(eval(profile+"_AUDIOIN_CH0_ADC_CODEC"));
				$("select#formInFrequency", $(this)).val(eval(profile+"_AUDIOIN_CH0_ADC_FREQUENCY"));

				$("#formOutVolume:text", $(this)).val(eval(profile+"_AUDIOOUT_CH0_VOLUME"))
				.parent().parent()
				.find("#sliderEncoderPFOutVol, .slider-bar").slider({
					range: 'min',
					min: 0,
					max: 255,
					value: eval(profile+"_AUDIOOUT_CH0_VOLUME"),
					slide: function(event, ui) {
						$("#formOutVolume:text", $this).val(ui.value);
					}
				});

				$("#formOutPort:text", $(this)).val(eval(profile+"_AUDIOOUT_CH0_TCP_PORT"));

				// Audio Text Range
				$("#formInVolume:text", $this).keyup(function() {
					$("#sliderEncoderPFInputVol", $this).slider("value", $("#formInVolume:text", $this).val());
				});
				$("#formOutVolume:text", $this).keyup(function() {
					$("#sliderEncoderPFOutVol", $this).slider("value", $("#formOutVolume:text", $this).val());
				});

				$("#formInVolume:text", $this).blur(function() {
					var inputValInVolume = $("#formInVolume:text", $this).val()-0;
					$("#formInVolume:text", $this).val(inputValInVolume);
					if($(this, $this).val() == 0) return;

					if(inputValInVolume < 0 || inputValInVolume > 255 || inputValInVolume == "")
					{
						$("#formInVolume:text", $this).val(eval(profile+"_AUDIOIN_CH0_VOLUME")).focus();
						$("#sliderEncoderPFInputVol", $this).slider("value", eval(profile+"_AUDIOIN_CH0_VOLUME"));
						alert(GetMsgLang("0402059917"));
					}
				});
				$("#formOutVolume:text", $this).blur(function() {
					var inputValOutVolume = $("#formOutVolume:text", $this).val()-0;
					$("#formOutVolume:text", $this).val(inputValOutVolume);
					if($(this, $this).val() == 0) return;

					if(inputValOutVolume < 0 || inputValOutVolume > 255 || inputValOutVolume == "")
					{
						$("#formOutVolume:text", $this).val(eval(profile+"_AUDIOOUT_CH0_VOLUME")).focus();
						$("#sliderEncoderPFOutVol", $this).slider("value", eval(profile+"_AUDIOOUT_CH0_VOLUME"));
						alert(GetMsgLang("0402059917"));
					}
				});
				$("#formOutPort:text", $this).blur(function() {
					var inputValOutPort = $("#formOutPort:text", $this).val()-0;
					$("#formOutPort:text", $this).val(inputValOutPort);

					if(inputValOutPort < 1 || inputValOutPort > 65535 || inputValOutPort == "")
					{
						$("#formOutPort:text", $this).val(eval(profile+"_AUDIOOUT_CH0_TCP_PORT")).focus();
						alert(GetMsgLang("0402059917"));
					}
				});

				$("select#formInFrequency", $(this)).val(eval(profile+"_AUDIOIN_CH0_ADC_FREQUENCY"));
				$("input[name='audioInputSource'][value='" + eval(profile + "_AUDIOIN_CH0_PORT") + "']:radio", $(this)).attr("checked", "checked");

				break;

			default:
				return false;
				break;
		}
	});

	initValue = true;
	MaxReRange();

	$("#formMaxFps_stream_0:text", $("#stream_0")).numeric();
	$("#formGOP_stream_0:text", $("#stream_0")).numeric();
	$("#formMaxFps_stream_1:text", $("#stream_1")).numeric();
	$("#formGOP_stream_1:text", $("#stream_1")).numeric();

	useInfo();
	if (parent.g_configData.langPath == "/language/Arabic.xml")
	{
		$(".slider-bar").slider({isRTL: true});
	}
}

function SubInitSetting(profile, idx)
{
	var $this = $("#stream_tab > div").eq(idx);
	var codec = $("select#formEncoderPFVCodec_stream_" + idx, $this).val(); // 현재 codec 값
	var codecDB = eval(profile + "_VIDEOCODEC_ST" + idx + "_STANDARD"); // DB codec 값
	var group = profile + "_VIDEOCODEC_ST" + idx;

	// Enable streaming
	if(eval(profile + "_VIDEOCODEC_ST" + idx + "_ENABLE") == "yes")
	{
		$("#formEncoderPFEnable_stream_" + idx + ":checkbox", $this).attr("checked", "checked");
	}
	else
	{
		$("#formEncoderPFEnable_stream_" + idx + ":checkbox", $this).attr("checked", "");
	}

	// Video codec
	$("select#formEncoderPFVCodec_stream_" + idx , $this).val(eval(profile + "_VIDEOCODEC_ST" + idx + "_STANDARD"));

	// Resolution
	$("#formResolution_stream_" + idx, $this).val(eval(profile + "_VIDEOCODEC_ST" + idx + "_" + codecDB.toUpperCase() + "_RESOLUTION"));

	// Max. FPS
	$("#formMaxFps_stream_" + idx, $this).val(eval(profile + "_VIDEOCODEC_ST" + idx + "_" + codecDB.toUpperCase() + "_MAXFPS"));

	// GOP
	$("#formGOP_stream_" + idx, $this).val(Number(eval(profile + "_VIDEOCODEC_ST" + idx + "_H264_PCOUNT")) + 1);

	// Profile identification
	$("#formProfileid_" + idx, $this).val(eval(profile + "_VIDEOCODEC_ST" + idx + "_H264_PROFILE"));

	// Multiple slices
	if(eval(profile + "_VIDEOCODEC_ST" + idx + "_H264_SLICE") == "yes")
	{
		$("#formMultipleSlices_stream_" + idx + ":checkbox", $this).attr("checked", "checked");
	}
	else
	{
		$("#formMultipleSlices_stream_" + idx + ":checkbox", $this).attr("checked", "");
	}

	// Bit rate control
	$("input[name='formBitrateCtrl_stream_" + idx + "'][value='" + eval(profile + "_VIDEOCODEC_ST" + idx + "_H264_BITRATECTRL") + "']:radio", $this).attr("checked", "checked");

	// Target bitrate
	$("#formBitrate_stream_" + idx, $this).val(eval(profile + "_VIDEOCODEC_ST" + idx + "_H264_BITRATE"));

	// Q Value
	$("#formBRC_VBR_stream_" + idx + "_QValue", $this).val(eval(profile + "_VIDEOCODEC_ST" + idx + "_H264_QVALUE"));
	
	// JPEG quality
	$("#formQuality_stream_" + idx, $this).val(eval(profile + "_VIDEOCODEC_ST" + idx + "_MJPEG_QUALITY"));
}

function SetSubRelation(idx)
{
	var $this = $("#stream_tab > div").eq(idx);
	
	for(var i=0; i<2; i++)
	{
		$("#formMaxFps_stream_" + i + ":text", $this).numeric();
		$("#formGOP_stream_" + i + ":text", $this).numeric();
		$("#formBitrate_stream_" + i + ":text", $this).numeric();
		$("#formQuality_stream_" + i + ":text", $this).numeric();
	}
	
	$("#formCdSnapMaxFps:text", $this).numeric();
	$("#formCdSnapQuality:text", $this).numeric();
	
	$("#formInVolume:text", $this).numeric();
	$("#formOutVolume:text", $this).numeric();
	$("#formOutPort:text", $this).numeric();
	 
	// first stream relation
	$("select#formEncoderPFVCodec_stream_0", $this).unbind().change(function(){
		if ($("#formEncoderPFEnable_stream_0:checkbox", $this).attr("checked") == true)
		{
			useInfo();
		}

		var firstCodec = $(this).val();

		if(firstCodec != "mjpeg")
		{
			$("#jpegQuality_stream_0", $this).css("display", "none");
			$("#bitRateControl_stream_0", $this).css("display", "block");
			$("#formBRC_VBR_stream_0", $this).css("display", "block");
			$("#formBRC_CBR_stream_0", $this).css("display", "block");
			$("#profileid_stream_0", $this).css("display", "block");
			$("#multipleSlices_stream_0", $this).css("display", "block");

			if("rs51c0b" == parent.g_brand.imgDevice ||
		"mdc200s" == parent.g_brand.imgDevice ||
		"mdc600s" == parent.g_brand.imgDevice)
				$("#gop_stream_0", $this).css("display", "block");
		}
		else
		{
			$("#bitRateControl_stream_0", $this).css("display", "none");
			$("#formBRC_VBR_stream_0", $this).css("display", "none");
			$("#formBRC_CBR_stream_0", $this).css("display", "none");
			$("#jpegQuality_stream_0", $this).css("display", "block");
			$("#profileid_stream_0", $this).css("display", "none");
			$("#multipleSlices_stream_0", $this).css("display", "none");
			$("#gop_stream_0", $this).css("display", "none");
		}
		EvenOdd(parent.g_configData.skin);
	});
	// second stream relation
	$("select#formEncoderPFVCodec_stream_1", $this).unbind().change(function(){
		if ($("#formEncoderPFEnable_stream_1:checkbox", $this).attr("checked") == true)
		{
			useInfo();
		}
		var secondCodec = $(this).val();

		if(secondCodec != "mjpeg")
		{
			$("#jpegQuality_stream_1", $this).css("display", "none");
			$("#bitRateControl_stream_1", $this).css("display", "block");
			$("#formBRC_VBR_stream_1", $this).css("display", "block");
			$("#formBRC_CBR_stream_1", $this).css("display", "block");
			$("#profileid_stream_1", $this).css("display", "block");
			$("#multipleSlices_stream_1", $this).css("display", "block");

			if("rs51c0b" == parent.g_brand.imgDevice ||
		"mdc200s" == parent.g_brand.imgDevice ||
		"mdc600s" == parent.g_brand.imgDevice)
				$("#gop_stream_1", $this).css("display", "block");
		}
		else
		{
			$("#bitRateControl_stream_1", $this).css("display", "none");
			$("#formBRC_VBR_stream_1", $this).css("display", "none");
			$("#formBRC_CBR_stream_1", $this).css("display", "none");
			$("#jpegQuality_stream_1", $this).css("display", "block");
			$("#profileid_stream_1", $this).css("display", "none");
			$("#multipleSlices_stream_1", $this).css("display", "none");
			$("#gop_stream_1", $this).css("display", "none");
		}
		EvenOdd(parent.g_configData.skin);
	});

	// first bit rate control relation
	$("input[name='formBitrateCtrl_stream_0']", $this).unbind().change(function(){
		var firstBRCVal = $("input[name='formBitrateCtrl_stream_0']:checked:radio", $this).val();
		if(firstBRCVal == "vbr")
		{
			Enable($("select#formBRC_VBR_stream_0_QValue", $this));
			Enable($("#maxBitrate_text_st0:text", $this));
			Enable($("#maxBitrate_text_st0:text", $this).parent().parent().find(".slider-bar"));
			Disable($("#formBitrate_stream_0:text", $this));
			Disable($("#formBitrate_stream_0:text", $this).parent().parent().find(".slider-bar"));
		}
		else
		{
			Disable($("select#formBRC_VBR_stream_0_QValue", $this));
			Disable($("#maxBitrate_text_st0:text", $this));
			Disable($("#maxBitrate_text_st0:text", $this).parent().parent().find(".slider-bar"));
			Enable($("#formBitrate_stream_0:text", $this));
			Enable($("#formBitrate_stream_0:text", $this).parent().parent().find(".slider-bar"));
		}
	});
	// second bit rate control relation
	$("input[name='formBitrateCtrl_stream_1']", $this).unbind().change(function(){
		var firstBRCVal = $("input[name='formBitrateCtrl_stream_1']:checked:radio", $this).val();
		if(firstBRCVal == "vbr")
		{
			Enable($("select#formBRC_VBR_stream_1_QValue", $this));
			Enable($("#maxBitrate_text_st1:text", $this));
			Enable($("#maxBitrate_text_st1:text", $this).parent().parent().find(".slider-bar"));
			Disable($("#formBitrate_stream_1:text", $this));
			Disable($("#formBitrate_stream_1:text", $this).parent().parent().find(".slider-bar"));
		}
		else
		{
			Disable($("select#formBRC_VBR_stream_1_QValue", $this));
			Disable($("#maxBitrate_text_st1:text", $this));
			Disable($("#maxBitrate_text_st1:text", $this).parent().parent().find(".slider-bar"));
			Enable($("#formBitrate_stream_1:text", $this));
			Enable($("#formBitrate_stream_1:text", $this).parent().parent().find(".slider-bar"));
		}
	});

	$("select#formEncoderPFVCodec_stream_0", $this).change();
	$("select#formEncoderPFVCodec_stream_1", $this).change();
	$("input[name='formBitrateCtrl_stream_0']", $this).change();
	$("input[name='formBitrateCtrl_stream_1']", $this).change();

}

function EventBind()
{
	$("#btnAdd").button().click(function() {
		if(isCheckMaxList() == false)
		{
			alert("You can create up to 8 profiles. To create a new profile, delete at least one existing profile.");
			return;
		}

		$( "#effect" ).hide();
		ResizePage(680);

		$("#input_form").dialog("destory");
		$("#input_form").dialog("option", "title", GetMsgLang("0402059923"));
		$("#input_form").dialog("option", "mode", "add");
		$("#input_form").dialog('open');
		SetInputForm();
		$("#formEncoderPFName:text").attr("disabled", "").focus();
	});
	$("#btnCopy").button().click(function(){
		if(isCheckMaxList() == false)
		{
			alert("You can create up to 8 profiles. To create a new profile, delete at least one existing profile.");
			return;
		}

		$( "#effect" ).hide();
		if(!selectProfile)
		{
			alert(GetMsgLang("0402059918"));
			return false;
		}
		ResizePage(680);

		$("#input_form").dialog("destory");
		$("#input_form").dialog("option", "title", GetMsgLang("0402059924"));
		$("#input_form").dialog("option", "mode", "copy");
		$("#input_form").dialog('open');
		SetInputForm(selectProfile.toUpperCase());
		$("#formEncoderPFName:text").attr("disabled", "").focus();
	});
	$("#btnModify").button().click(function() {
		$( "#effect" ).hide();
		if(!selectProfile)
		{
			alert(GetMsgLang("0402059919"));
			return false;
		}
		ResizePage(680);

		$("#input_form").dialog("destory");
		$("#input_form").dialog("option", "title", GetMsgLang("0402059925"));
		$("#input_form").dialog("option", "mode", "modify");
		$("#input_form").dialog('open');
		SetInputForm(selectProfile.toUpperCase());
		$("#formEncoderPFName:text").attr("disabled", "disabled");
		$("#formEncoderPFDesc:text").focus();
	});

	$("select#formProfileList").click(function() {
		ResizePage(470);
		if($(this).val() == null) return;
		selectProfile = $(this).val();
		var ProfileGroup = DefaultGroup + "PROFILE_" + selectProfile.toUpperCase();
		var resolv_0 = eval(ProfileGroup+"_VIDEOCODEC_ST0_STANDARD");
		var size_0 = eval(ProfileGroup+"_VIDEOCODEC_ST0_"+resolv_0.toUpperCase()+"_RESOLUTION");
		var resolv_1 = eval(ProfileGroup+"_VIDEOCODEC_ST1_STANDARD");
		var size_1 = eval(ProfileGroup+"_VIDEOCODEC_ST1_"+resolv_1.toUpperCase()+"_RESOLUTION");
		var recenable = eval(ProfileGroup+"_VIDEOCODEC_RECENABLE");
		var snapResolution = eval(ProfileGroup + "_SNAPSHOT_RESOLUTION");
		var profileID_0 = eval(ProfileGroup + "_VIDEOCODEC_ST0_H264_PROFILE");
		var profileID_1 = eval(ProfileGroup + "_VIDEOCODEC_ST1_H264_PROFILE");
		var imgQValue_0 = "";
		var imgQValue_1 = "";
		var vbrcbr_0 = "";
		var vbrcbr_1 = "";
		var bitratectrl_0 = "";
		var bitrate_0 = "";
		var bitrate_1 = "";
		var bitratectrl_1 = "";
		var descriptionVal = "";

		if(resolv_0 != "mjpeg")
		{
			bitratectrl_0 = eval(ProfileGroup + "_VIDEOCODEC_ST0_H264_BITRATECTRL");
			imgQValue_0 = ', ' + 'Image quality-' + eval(ProfileGroup + "_VIDEOCODEC_ST0_H264_QVALUE");
			bitrate_0 = ', ' + eval(ProfileGroup + "_VIDEOCODEC_ST0_H264_BITRATE") + 'Kbit/s';
		}
		if(resolv_1 != "mjpeg")
		{
			bitratectrl_1 = eval(ProfileGroup + "_VIDEOCODEC_ST1_H264_BITRATECTRL");
			imgQValue_1 = ', ' + 'Image quality-' + eval(ProfileGroup + "_VIDEOCODEC_ST1_H264_QVALUE");
			bitrate_1 = ', ' + eval(ProfileGroup + "_VIDEOCODEC_ST1_H264_BITRATE") + 'Kbit/s';
		}
		if(bitratectrl_0 == 'cbr')
		{
			vbrcbr_0 = bitrate_0;
		}
		if(bitratectrl_0 == 'vbr')
		{
			vbrcbr_0 = imgQValue_0;
		}
		if(bitratectrl_1 == 'cbr')
		{
			vbrcbr_1 = bitrate_1;
		}
		if(bitratectrl_1 == 'vbr')
		{
			vbrcbr_1 = imgQValue_1;
		}
		if(g_speedMFZ == 1)
		{
			if(size_0 == "1920x1080")
				size_0 = "1280x960";
			if(size_1 == "1920x1080")
				size_1 = "1280x960";
			if(snapResolution == "1920x1080")
				snapResolution = "1280x960";
		}
		if(profileID_0 == 'HiP')
		{
			profileID_0 = 'high';
		}
		else if(profileID_0 == 'MP')
		{
			profileID_0 = 'main';
		}
		else if(profileID_0 == 'BP')
		{
			profileID_0 = 'baseline';
		}
		if(profileID_1 == 'HiP')
		{
			profileID_1 = 'high';
		}
		else if(profileID_1 == 'MP')
		{
			profileID_1 = 'main';
		}
		else if(profileID_1 == 'BP')
		{
			profileID_1 = 'baseline';
		}

		$("div#effect ul.box li.item li#infoStreamName").html(eval(ProfileGroup + "_NAME"));
		$("div#effect ul.box li.item li#infoStreamDescription").html(FillText(eval(ProfileGroup+"_DESCRIPTION"), 64, "left"));

		//first stream
		if(eval(ProfileGroup+"_VIDEOCODEC_ST0_ENABLE") == "no")
		{
			$("div#effect ul.box li.item li#infoStreamFirst").html("-");
		}
		else
		{
			if(resolv_0 == 'mjpeg')
			{
				$("div#effect ul.box li.item li#infoStreamFirst").html(resolv_0 + ', ' + size_0 + '@'
				+ eval(ProfileGroup + "_VIDEOCODEC_ST0_" + resolv_0.toUpperCase() + "_MAXFPS") + 'FPS' + ', '
				+ 'Quality-'+ eval(ProfileGroup + "_VIDEOCODEC_ST0_MJPEG_QUALITY"));
			}
			else
			{
				$("div#effect ul.box li.item li#infoStreamFirst").html(resolv_0 + ', ' + size_0 + '@'
				+ eval(ProfileGroup + "_VIDEOCODEC_ST0_" + resolv_0.toUpperCase() + "_MAXFPS") + 'FPS' + ', '
				+ 'GOP-' + (Number(eval(ProfileGroup + "_VIDEOCODEC_ST0_H264_PCOUNT")) + 1) + ', '
				+ 'Profile-' + profileID_0 + ', '
				//+ 'Multiple slices-' + eval(ProfileGroup + "_VIDEOCODEC_ST0_H264_SLICE") + ', '
				+ bitratectrl_0
				+ vbrcbr_0);
			}
		}

		//second stream
		if(eval(ProfileGroup+"_VIDEOCODEC_ST1_ENABLE") == "no")
		{
			$("div#effect ul.box li.item li#infoStreamSecond").html("-");
		}
		else
		{
			if(resolv_1 == 'mjpeg')
			{
				$("div#effect ul.box li.item li#infoStreamSecond").html(resolv_1 + ', ' + size_1 + '@'
				+ eval(ProfileGroup + "_VIDEOCODEC_ST1_" + resolv_1.toUpperCase() + "_MAXFPS") + 'FPS' + ', '
				+ 'Quality-' + eval(ProfileGroup + "_VIDEOCODEC_ST1_MJPEG_QUALITY"));
			}
			else
			{
				$("div#effect ul.box li.item li#infoStreamSecond").html(resolv_1 + ', ' + size_1 + '@'
				+ eval(ProfileGroup + "_VIDEOCODEC_ST1_" + resolv_1.toUpperCase() + "_MAXFPS") + 'FPS' + ', '
				+ 'GOP-' + (Number(eval(ProfileGroup + "_VIDEOCODEC_ST1_H264_PCOUNT")) + 1) + ', '
				+ 'Profile-' + profileID_1 + ', '
				//+ 'Multiple slices-' + eval(ProfileGroup + "_VIDEOCODEC_ST1_H264_SLICE") + ', '
				+ bitratectrl_1
				+ vbrcbr_1);
			}
		}

		//snapshot
		if(eval(ProfileGroup + "_SNAPSHOT_ENABLE") == "no")
		{
			$("div#effect ul.box li.item li#infoStreamSnapshot").html("-");
		}
		else
		{
			$("div#effect ul.box li.item li#infoStreamSnapshot").html(snapResolution + '@'
			+ eval(ProfileGroup + "_SNAPSHOT_MAXFPS") + 'FPS' + ', '
			+ 'Quality-'+ eval(ProfileGroup + "_SNAPSHOT_QUALITY"));
		}

		if(parent.g_brand.productID != "d001")
		{
			if(parent.g_brand.audioInOut == "0/0") // In Out 둘다 없는 경우
			{
				
			}
			else if(parent.g_brand.audioInOut == "1/0") // In 있고, Out 없는 경우
			{
				$("div#effect ul.box li.item li#infoStreamAudio").html(
					'Input Enable-' + eval(ProfileGroup + "_AUDIOIN_CH0_ENABLE") + ', '
					+'InputVol-' + eval(ProfileGroup + "_AUDIOIN_CH0_VOLUME") + ', '
					+ eval(ProfileGroup + "_AUDIOIN_CH0_ADC_CODEC") + ', '
					+'Freq-' + eval(ProfileGroup + "_AUDIOIN_CH0_ADC_FREQUENCY"));
			}
			else if(parent.g_brand.audioInOut == "0/1") // In 없고, Out 있는 경우
			{
				$("div#effect ul.box li.item li#infoStreamAudio").html(
					'Output Enable-' + eval(ProfileGroup + "_AUDIOOUT_CH0_ENABLE") + ', '
					+'OutputVol-' + eval(ProfileGroup + "_AUDIOOUT_CH0_VOLUME") + ', '
					+'Port-' + eval(ProfileGroup + "_AUDIOOUT_CH0_TCP_PORT"));
			}
			else // In Out 둘다 있는 경우
			{
				$("div#effect ul.box li.item li#infoStreamAudio").html(
					'Input Enable-' + eval(ProfileGroup + "_AUDIOIN_CH0_ENABLE") + ', '
					+'InputVol-' + eval(ProfileGroup + "_AUDIOIN_CH0_VOLUME") + ', '
					+ eval(ProfileGroup + "_AUDIOIN_CH0_ADC_CODEC") + ', '
					+'Freq-' + eval(ProfileGroup + "_AUDIOIN_CH0_ADC_FREQUENCY") + ', '
					+'Output Enable-' + eval(ProfileGroup + "_AUDIOOUT_CH0_ENABLE") + ', '
					+'OutputVol-' + eval(ProfileGroup + "_AUDIOOUT_CH0_VOLUME") + ', '
					+'Port-' + eval(ProfileGroup + "_AUDIOOUT_CH0_TCP_PORT")); 
			}
		}

		// Infomation Usage
		var list = "list=";
		var info = "";

		if(eval(ProfileGroup+"_VIDEOCODEC_ST0_ENABLE") == "yes")
		{
			list += "stream0,";
		}
		if(eval(ProfileGroup+"_VIDEOCODEC_ST1_ENABLE") == "yes")
		{
			list += "stream1,";
		}
		if(eval(ProfileGroup+"_SNAPSHOT_ENABLE") == "yes")
		{
			list += "snapshot,";
		}

		var streamResolution = eval(ProfileGroup + "_VIDEOCODEC_ST0_" + resolv_0.toUpperCase() + "_RESOLUTION");
		var streamResolution2 = translateResolution(g_videoStandard, streamResolution);
		info += "&stream0_codec=" + eval(ProfileGroup + "_VIDEOCODEC_ST0_STANDARD");
		info += "&stream0_resolution=" + (streamResolution2 == "" ? streamResolution : streamResolution2);
		info += "&stream0_fps=" + eval(ProfileGroup + "_VIDEOCODEC_ST0_" + resolv_0.toUpperCase() + "_MAXFPS");
		streamResolution = eval(ProfileGroup + "_VIDEOCODEC_ST1_" + resolv_1.toUpperCase() + "_RESOLUTION");
		streamResolution2 = translateResolution(g_videoStandard, streamResolution);
		info += "&stream1_codec=" + eval(ProfileGroup + "_VIDEOCODEC_ST1_STANDARD");
		info += "&stream1_resolution=" + (streamResolution2 == "" ? streamResolution : streamResolution2);
		info += "&stream1_fps=" + eval(ProfileGroup + "_VIDEOCODEC_ST1_" + resolv_1.toUpperCase() + "_MAXFPS");
		streamResolution = eval(ProfileGroup + "_SNAPSHOT_RESOLUTION");
		streamResolution2 = translateResolution(g_videoStandard, streamResolution);
		info += "&snapshot_codec=jpeg";
		info += "&snapshot_resolution=" + (streamResolution2 == "" ? streamResolution : streamResolution2);
		info += "&snapshot_fps=" + eval(ProfileGroup + "_SNAPSHOT_MAXFPS");

		$.getScript("/uapi-cgi/resource.cgi?mode=js&" + list + info, function(){
			var usedResult = Math.ceil(resUsed);
			var usageDescription = usedResult + "%";
			var rotateDBValue = VIDEOIN_CH0_ROTATE_DIRECTION.toLowerCase();

			if(g_isVcaEnable == false && list == "")
				usedResult = 0;

			var trueFalseResult = isValidUsageRange(usedResult);
			if(g_isVcaEnable == true || rotateDBValue != "none")
			{
				usageDescription = usedResult + "% + 50% " + (g_isVcaEnable ? "(VCA)" : "(Image Rotation)");
				trueFalseResult = isValidUsageRange(eval(usedResult + 50));
			}

			var usageFontSize = "12px";
			var usageColor = "#52A34C";
			if(trueFalseResult == false)
			{
				usageFontSize = "16px";
				usageColor = "#E62B00";
			}
			$("#infoStreamPrediction").html(usageDescription).css({
				"font-size" : usageFontSize,
				"color" : usageColor, 
				"font-weight" : "bold",
				"margin-top"  : "3px",
				"margin-left" : "10px"
			});
		});

		$( "#effect" ).show();

	}).keyup(function(){
		$(this).click();
	});

	$("select#formProfileList").dblclick(function() {
		if($(this).val() == null) return;
		$("#btnModify").button().click();
	});

	$("#btnRemove").button().click(function() {
		if(!selectProfile)
		{
			alert(GetMsgLang("0402059920"));
			return false;
		}

		if (!confirm(GetMsgLang("0402059930")))
		{
			return false;
		}
		$( "#effect" ).hide();
		var Req = new CGIRequest();
		var reqQString = "action=remove&xmlschema&profile=" + selectProfile;

		Req.SetStartFunc(ViewLoadingSave);
		Req.SetAddress("/uapi-cgi/encprofile.cgi");

		$this = $(this);
		Req.SetCallBackFunc(function(xml){
			var ret = CGIResponseCheck(0, xml);
			if(ret != 0) {
				var errormessage = "";
				if(ret != -2) {
					errormessage = "\n" + ret;
				}
				alert(GetMsgLang("0501") + errormessage);
			}

			_debug("remove - " + reqQString);
			LoadParamJs(DefaultGroup+"PROFILE"+"&cache", function() {
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

////////////////////////////////////////////////////////////////////////////////
// Function Name : ResolutionExceptionCheck()
// Description	 : 1080p, 720p, 630p 의 설정이 동시에 이루어 지지 않도록 한다.
// Return value	: 동시설정되지 않아 저장 허용 0, 아니면 -1
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

function isCheckMaxList()
{
	if($("#formProfileList option").size() >= 8)
		return false;

	return true;
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
		var rotateDBValue = VIDEOIN_CH0_ROTATE_DIRECTION.toLowerCase();

		if(g_isVcaEnable == false && list == "")
			usedResult = 0;

		var trueFalseResult = isValidUsageRange(usedResult);
		if(g_isVcaEnable == true || rotateDBValue != "none")
		{
			usageDescription = usedResult + "% + 50% " + (g_isVcaEnable ? "(VCA)" : "(Image Rotation)");
			trueFalseResult = isValidUsageRange(eval(usedResult + 50));
		}

		Allow = trueFalseResult;
		var usageFontSize = "12px";
		var usageColor = "#52A34C";
		if(trueFalseResult == false)
		{
			usageFontSize = "16px";
			usageColor = "#E62B00";
		}

		$("#formEncoderUsage").text(usageDescription).css({
			"font-size" : usageFontSize,
			"color" : usageColor, 
			"font-weight" : "bold"
		});
	});
}

function MaxReRange()
{
	var isEncoderPal = (parent.g_brand.cameraClass == "encoder" && g_videoStandard == "pal");

	if (isEncoderPal)
	{
		g_stream0_fps = 25;
		g_stream1_fps = 25;
		g_stream0_gop = 25;
		g_stream1_gop = 25;
	}
	else
	{
		g_stream0_fps = transrationMaxRange(g_aspectRatioDBValue, parent.g_brand.productID);
		g_stream1_fps = 30;
		g_stream0_gop = 30;
		g_stream1_gop = 30;
	}

	if("seek-thermal" == parent.g_brand.imgDevice)
	{
		var seekRange = 9;
		g_stream0_fps = seekRange;
		g_stream1_fps = seekRange;
		g_stream0_gop = seekRange;
		g_stream1_gop = seekRange;
	}

	if(parent.g_support.tamarisk9fps)
	{
		var tama9Range = 9;
		g_stream0_fps = tama9Range;
		g_stream1_fps = tama9Range;
		g_stream0_gop = tama9Range;
		g_stream1_gop = tama9Range;
	}

	$("#maxFps_stream_0    label").html("(1 ... " + g_stream0_fps + " fps)");
	$("#maxFps_stream_1    label").html("(1 ... " + g_stream1_fps + " fps)");
	$("#gop_stream_0    label").html("(1 ... " + g_stream0_gop + ")");
	$("#gop_stream_1    label").html("(1 ... " + g_stream1_gop + ")");

	var maxFPSValue_st0 = g_stream0_fps;
	var maxFPSValue_st1 = g_stream1_fps;
	var gopValue_st0 = g_stream0_gop;
	var gopValue_st1 = g_stream1_gop;

	if($("#input_form").dialog("option", "mode") != 'add')
	{
	 	var profile = DefaultGroup + "PROFILE_" + selectProfile.toUpperCase();
		var codecDB_0 = eval(profile + "_VIDEOCODEC_ST0_STANDARD");
		var codecDB_1 = eval(profile + "_VIDEOCODEC_ST1_STANDARD");
		var maxFPSValue_st0 = eval(profile + "_VIDEOCODEC_ST0_" + codecDB_0.toUpperCase() + "_MAXFPS");
		var maxFPSValue_st1 = eval(profile + "_VIDEOCODEC_ST1_" + codecDB_1.toUpperCase() + "_MAXFPS");
		var gopValue_st0 = eval(profile + "_VIDEOCODEC_ST0_H264_PCOUNT")*1 + 1;
		var gopValue_st1 = eval(profile + "_VIDEOCODEC_ST1_H264_PCOUNT")*1 + 1;
	}

	$("#formMaxFps_stream_0:text", $("#stream_0")).val(maxFPSValue_st0)
	.parent().parent()
	.find(".slider-bar").slider({
		range: 'min',
		min: 1,
		max: g_stream0_fps,
		value: maxFPSValue_st0,
		slide: function(event, ui) {
			$("#formMaxFps_stream_0:text", $("#stream_0")).val(ui.value);
		}
	});	

	$("#formMaxFps_stream_1:text", $("#stream_1")).val(maxFPSValue_st1)
	.parent().parent()
	.find(".slider-bar").slider({
		range: 'min',
		min: 1,
		max: g_stream1_fps,
		value: maxFPSValue_st1,
		slide: function(event, ui) {
			$("#formMaxFps_stream_1:text", $("#stream_1")).val(ui.value);
		}
	});

	$("#formGOP_stream_0:text", $("#stream_0")).val(gopValue_st0)
	.parent().parent()
	.find(".slider-bar").slider({
		range: 'min',
		min: 1,
		max: g_stream0_gop,
		value: gopValue_st0,
		slide: function(event, ui) {
			$("#formGOP_stream_0:text", $("#stream_0")).val(ui.value);
		}
	});	

	$("#formGOP_stream_1:text", $("#stream_1")).val(gopValue_st1)
	.parent().parent()
	.find(".slider-bar").slider({
		range: 'min',
		min: 1,
		max: g_stream1_gop,
		value: gopValue_st1,
		slide: function(event, ui) {
			$("#formGOP_stream_1:text", $("#stream_1")).val(ui.value);
		}
	});
	
	$("#formMaxFps_stream_0:text", $("#stream_0")).unbind().keyup(function() {
		$("#sliderMaxFps_stream_0", $("#stream_0")).slider("value", $("#formMaxFps_stream_0:text", $("#stream_0")).val());
	}).blur(function() {
		var inputValMaxFps = $("#formMaxFps_stream_0:text", $("#stream_0")).val();

		if(inputValMaxFps < 1 || inputValMaxFps > g_stream0_fps || inputValMaxFps == "")
		{
			$("#formMaxFps_stream_0:text", $("#stream_0")).val(maxFPSValue_st0).focus();
			$("#sliderMaxFps_stream_0", $("#stream_0")).slider("value", maxFPSValue_st0);
			alert(GetMsgLang("0402059917"));
		}
	});			
	
	$("#formMaxFps_stream_1:text", $("#stream_1")).unbind().keyup(function() {
		$("#sliderMaxFps_stream_1", $("#stream_1")).slider("value", $("#formMaxFps_stream_1:text", $("#stream_1")).val());
	}).blur(function() {
		var inputValMaxFps = $("#formMaxFps_stream_1:text", $("#stream_1")).val();

		if(inputValMaxFps < 1 || inputValMaxFps > g_stream1_fps || inputValMaxFps == "")
		{
			$("#formMaxFps_stream_1:text", $("#stream_1")).val(maxFPSValue_st1).focus();
			$("#sliderMaxFps_stream_1", $("#stream_1")).slider("value", maxFPSValue_st1);
			alert(GetMsgLang("0402059917"));
		}
	});
	
	$("#formGOP_stream_0:text", $("#stream_0")).unbind().keyup(function() {
		$("#sliderGOP_stream_0", $("#stream_0")).slider("value", $("#formGOP_stream_0:text", $("#stream_0")).val());
	}).blur(function() {
		var inputValMax = $("#formGOP_stream_0:text", $("#stream_0")).val();

		if(inputValMax < 1 || inputValMax > g_stream0_gop || inputValMax == "")
		{
			$("#formGOP_stream_0:text", $("#stream_0")).val(gopValue_st0).focus();
			$("#sliderGOP_stream_0", $("#stream_0")).slider("value", gopValue_st0);
			alert(GetMsgLang("0402059917"));
		}
	});			
	
	$("#formGOP_stream_1:text", $("#stream_1")).unbind().keyup(function() {
		$("#sliderGOP_stream_1", $("#stream_1")).slider("value", $("#formGOP_stream_1:text", $("#stream_1")).val());
	}).blur(function() {
		var inputValMax = $("#formGOP_stream_1:text", $("#stream_1")).val();

		if(inputValMax < 1 || inputValMax > g_stream1_gop || inputValMax == "")
		{
			$("#formGOP_stream_1:text", $("#stream_1")).val(gopValue_st1).focus();
			$("#sliderGOP_stream_1", $("#stream_1")).slider("value", gopValue_st1);
			alert(GetMsgLang("0402059917"));
		}
	});
}

function UpdateStatus(str)
{
	$("#msg_status").text(str).addClass("ui-state-highlight");
}

function checkLength(o,str,min,max)
{
	if ( o.val().length > max || o.val().length < min ) {
		o.addClass('ui-state-error');
		UpdateStatus(str);
		o.focus();
		return false;
	} else {
		return true;
	}
}

function checkRegexp(o,regexp,n)
{
	if ( !( regexp.test( o.val() ) ) ) {
		o.addClass('ui-state-error');
		UpdateStatus(n);
		o.focus();
		return false;
	} else {
		return true;
	}
}
