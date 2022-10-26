var g_defaultGroup = "NETWORK";

$(function () {
	PreCustomize();
	initEnvironment();
	initBrand();
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
	var classNum = ["04040565", "04040566", "04040567", "04040568",
					"0501", "04040574", "04040575"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "rtsprtp", 
				parent.g_langData[parent.g_configData.language]);
}

function initBrand()
{
	var audioDisplayCss = "block";
	if(parent.g_brand.audioInOut  == "0/0")
		audioDisplayCss = "none";

	$(".audioContents").css("display", audioDisplayCss);
}

function mainRun() 
{
	InitForm();
	$("button").button();
	InitSettingSub();
	SetRelationSub();
	InitSetting();
	SetRelation();
	EventBind();
	ContentShow();
	ResizePage(1400);
	PostCustomize();
}

function InitForm()
{
	$("#stream_tab").tabs();
}

function InitSettingSub()
{
	var group = "NETWORK" + "_RTSP";
	$("#formRtspPort:text").val(eval(group+ "_PORT"));
	
	if(eval(group+"_AUTHEN_ENABLE") == "yes")
	{
		$("#formRtspAuthEnable:checkbox").attr("checked", "checked");
	}
	else
	{
		$("#formRtspAuthEnable:checkbox").attr("checked", "");
	}
	
	$("select#formRtspAuthType").val(eval(group+"_AUTHEN_TYPE"));
	$("#srtpEnable").attr("checked", NETWORK_SRTP_ENABLE == "yes" ? "checked" : "");
	$("#protectionProfile").val(NETWORK_SRTP_PROTECTIONPROFILE);
	$("#masterKey").val(NETWORK_SRTP_KEY_MASTER);
	$("#saltKey").val(NETWORK_SRTP_KEY_SALT);
}

function SetRelationSub()
{
	var group = "NETWORK" + "_RTSP";

	$("#formRtspPort:text").numeric();

	// Rtsp configration port
	$("#formRtspPort:text").blur(function() {
		var group = "NETWORK";
		var inputValTextRtspPort = $("#formRtspPort:text").val()-0;
		$("#formRtspPort:text").val(inputValTextRtspPort);
		if(inputValTextRtspPort < 1 || inputValTextRtspPort > 65535 || inputValTextRtspPort == "")
		{
			$("#formRtspPort:text").val(eval(group+ "_RTSP_PORT")).focus();
			alert(GetMsgLang("04040565"));
		}
	});

	$("#formRtspAuthEnable:checkbox").change(function() {
		if($(this).attr("checked") == false)
		{
			Disable($("#formRtspAuthType"));
		}
		else
		{
			Enable($("#formRtspAuthType"));
		}
	});
	$("#formRtspAuthEnable:checkbox").change();
}

function InitSetting()
{
	var idx = 0;

	while(idx < 2)
	{
		$this = $("#stream_tab > div").eq(idx);
		
		var group = "NETWORK" + "_RTP_ST" + idx;

		if(eval(group+"_UNICAST_ENABLE") == "yes")
		{
			$("#formRtpUniEnable_stream_" + idx + ":checkbox", $this).attr("checked", "checked");
		}
		else
		{
			$("#formRtpUniEnable_stream_" + idx + ":checkbox", $this).attr("checked", "");
		}

		$("#formRtpUniSSName_stream_" + idx + ":text", $this).val(eval(group+ "_UNICAST_NAME"));

		if(eval(group+"_UNICAST_INCLUDEAUDIO") == "yes")
		{
			$("#formRtpUniAudio_stream_" + idx + ":checkbox", $this).attr("checked", "checked");
		}
		else
		{
			$("#formRtpUniAudio_stream_" + idx + ":checkbox", $this).attr("checked", "");
		}
		if(eval(group+"_UNICAST_INCLUDEMETA") == "yes")
		{
			$("#formRtpUniMeta_stream_" + idx + ":checkbox", $this).attr("checked", "checked");
		}
		else
		{
			$("#formRtpUniMeta_stream_" + idx + ":checkbox", $this).attr("checked", "");
		}
		if(eval(group+"_UNICAST_INCLUDEONVIFMETA") == "yes")
		{
			$("#formRtpUniMetaOnvif_stream_" + idx + ":checkbox", $this).attr("checked", "checked");
		}
		else
		{
			$("#formRtpUniMetaOnvif_stream_" + idx + ":checkbox", $this).attr("checked", "");
		}

		if(eval(group+"_UNICAST_ENABLEQOS") == "yes")
		{
			$("#formRtpUniQos_stream_" + idx + ":checkbox", $this).attr("checked", "checked");
		}
		else
		{
			$("#formRtpUniQos_stream_" + idx + ":checkbox", $this).attr("checked", "");
		}
		$("#formRtpUniVideoDSCP_stream_" + idx + ":text", $this).val(eval(group+ "_UNICAST_VIDEODSCP"));
		$("#formRtpUniAudioDSCP_stream_" + idx + ":text", $this).val(eval(group+ "_UNICAST_AUDIODSCP"));
		$("#formRtpUniMetaDSCP_stream_" + idx + ":text", $this).val(eval(group+ "_UNICAST_METADSCP"));
		$("#formRtpUniOnvifMetaDSCP_stream_" + idx + ":text", $this).val(eval(group+ "_UNICAST_ONVIFMETADSCP"));

		if(eval(group+"_MULTICAST_ENABLE") == "yes")
		{
			$("#formRtpMulEnable_stream_" + idx + ":checkbox", $this).attr("checked", "checked");
		}
		else
		{
			$("#formRtpMulEnable_stream_" + idx + ":checkbox", $this).attr("checked", "");
		}
		
		if(eval(group+"_MULTICAST_ALWAYSMULTICAST") == "yes")
		{
			$("#formRtpMulEnableAlways_stream_" + idx + ":checkbox", $this).attr("checked", "checked");
		}
		else
		{
			$("#formRtpMulEnableAlways_stream_" + idx + ":checkbox", $this).attr("checked", "");
		}

		$("#formRtpMulIP_stream_" + idx + ":text", $this).val(eval(group+ "_MULTICAST_IPADDRESS"));
		$("#formRtpMulIP_Audio_stream_" + idx + ":text", $this).val(eval(group+ "_MULTICAST_AUDIOIPADDRESS"));
		$("#formRtpMulIP_Meta_stream_" + idx + ":text", $this).val(eval(group+ "_MULTICAST_METAIPADDRESS"));
		$("#formRtpMulIP_OnvifMeta_stream_" + idx + ":text", $this).val(eval(group+ "_MULTICAST_ONVIFMETAIPADDRESS"));
		$("#formRtpMulVideoPort_stream_" + idx + ":text", $this).val(eval(group+ "_MULTICAST_VIDEOPORT"));
		$("#formRtpMulAudioPort_stream_" + idx + ":text", $this).val(eval(group+ "_MULTICAST_AUDIOPORT"));
		$("#formRtpMulMetaPort_stream_" + idx + ":text", $this).val(eval(group+ "_MULTICAST_METAPORT"));
		$("#formRtpMulOnvifMetaPort_stream_" + idx + ":text", $this).val(eval(group+ "_MULTICAST_ONVIFMETAPORT"));
		$("#formRtpMulTTL_stream_" + idx + ":text", $this).val(eval(group+ "_MULTICAST_TTL"));
		$("#formRtpMulSSName_stream_" + idx + ":text", $this).val(eval(group+ "_MULTICAST_NAME"));

		if(eval(group+"_MULTICAST_INCLUDEAUDIO") == "yes")
		{
			$("#formRtpMulAudio_stream_" + idx + ":checkbox", $this).attr("checked", "checked");
		}
		else
		{
			$("#formRtpMulAudio_stream_" + idx + ":checkbox", $this).attr("checked", "");
		}
		
		if(eval(group+"_MULTICAST_INCLUDEMETA") == "yes")
		{
			$("#formRtpMulMeta_stream_" + idx + ":checkbox", $this).attr("checked", "checked");
		}
		else
		{
			$("#formRtpMulMeta_stream_" + idx + ":checkbox", $this).attr("checked", "");
		}
		if(eval(group+"_MULTICAST_INCLUDEONVIFMETA") == "yes")
		{
			$("#formRtpMulMetaOnvif_stream_" + idx + ":checkbox", $this).attr("checked", "checked");
		}
		else
		{
			$("#formRtpMulMetaOnvif_stream_" + idx + ":checkbox", $this).attr("checked", "");
		}

		if(eval(group+"_MULTICAST_ENABLEQOS") == "yes")
		{
			$("#formRtpMulQos_stream_" + idx + ":checkbox", $this).attr("checked", "checked");
		}
		else
		{
			$("#formRtpMulQos_stream_" + idx + ":checkbox", $this).attr("checked", "");
		}

		$("#formRtpMulVideoDSCP_stream_" + idx + ":text", $this).val(eval(group+ "_MULTICAST_VIDEODSCP"));
		$("#formRtpMulAudioDSCP_stream_" + idx + ":text", $this).val(eval(group+ "_MULTICAST_AUDIODSCP"));
		$("#formRtpMulMetaDSCP_stream_" + idx + ":text", $this).val(eval(group+ "_MULTICAST_METADSCP"));
		$("#formRtpMulOnvifMetaDSCP_stream_" + idx + ":text", $this).val(eval(group+ "_MULTICAST_ONVIFMETADSCP"));
		$("#formRtpUniQos_stream_" + idx + ":checkbox", $this).change();
		$("#formRtpMulQos_stream_" + idx + ":checkbox", $this).change();

		// IP address
		$("#formRtpMulIP_stream_" + idx + ":text", $this).ipaddress();
		$("#formRtpMulIPValid_stream_" + idx + " .ip_octet").css("border", "0px");
		$("#formRtpMulIP_Audio_stream_" + idx + ":text", $this).ipaddress();
		$("#formRtpMulIPValid_Audio_stream_" + idx + " .ip_octet").css("border", "0px");
		$("#formRtpMulIP_Meta_stream_" + idx + ":text", $this).ipaddress();
		$("#formRtpMulIPValid_Meta_stream_" + idx + " .ip_octet").css("border", "0px");
		$("#formRtpMulIP_OnvifMeta_stream_" + idx + ":text", $this).ipaddress();
		$("#formRtpMulIPValid_OnvifMeta_stream_" + idx + " .ip_octet").css("border", "0px");

		idx++;
	}
}

function SetRelation()
{
	var group = "NETWORK" + "_RTSP";
	var idx = 0;
			
	$("#formRtpUniSSName_stream_0:text", $("#stream_0")).keyup(function(){
		var text = $("#formRtpUniSSName_stream_0:text", $("#stream_0")).val();
		if(text.length > 32)
		{
			$("#formRtpUniSSName_stream_0:text", $("#stream_0")).val(text.substr(0,32));
			return false;
		}
		else
		{
			return true;
		}
	}).alphanumeric();
	$("#formRtpUniSSName_stream_1:text", $("#stream_1")).keyup(function(){
		var text = $("#formRtpUniSSName_stream_1:text", $("#stream_1")).val();

		if(text.length > 32)
		{
			$("#formRtpUniSSName_stream_1:text", $("#stream_1")).val(text.substr(0,32));
			return false;
		}
		else
		{
			return true;
		}
	}).alphanumeric();
	$("#formRtpMulSSName_stream_0:text", $("#stream_0")).keyup(function(){
		var text = $("#formRtpMulSSName_stream_0:text", $("#stream_0")).val();
		if(text.length > 32)
		{
			$("#formRtpMulSSName_stream_0:text", $("#stream_0")).val(text.substr(0,32));
			return false;
		}
		else
		{
			return true;
		}
	}).alphanumeric();
	$("#formRtpMulSSName_stream_1:text", $("#stream_1")).keyup(function(){
		var text = $("#formRtpMulSSName_stream_1:text", $("#stream_1")).val();

		if(text.length > 32)
		{
			$("#formRtpMulSSName_stream_1:text", $("#stream_1")).val(text.substr(0,32));
			return false;
		}
		else
		{
			return true;
		}
	}).alphanumeric();

	// Unicast DSCP 설정
	var group_stream_0 = "NETWORK" + "_RTP_ST0";
	$("#formRtpUniVideoDSCP_stream_0:text", $("#stream_0")).blur(function() {
		var inputValTextRtpUniVideo = $("#formRtpUniVideoDSCP_stream_0:text", $("#stream_0")).val()-0;
		$("#formRtpUniVideoDSCP_stream_0:text", $("#stream_0")).val(inputValTextRtpUniVideo);
		if($(this, $("#stream_0")).val() == 0) return;
		if(inputValTextRtpUniVideo < 0 || inputValTextRtpUniVideo > 63 || inputValTextRtpUniVideo == "")
		{
			$("#formRtpUniVideoDSCP_stream_0:text", $("#stream_0")).val(eval(group_stream_0+ "_UNICAST_VIDEODSCP")).focus();
			alert(GetMsgLang("04040565"));
		}
	});
	$("#formRtpUniAudioDSCP_stream_0:text", $("#stream_0")).blur(function() {
		var inputValTextRtpUniAudio = $("#formRtpUniAudioDSCP_stream_0:text", $("#stream_0")).val()-0;
		$("#formRtpUniAudioDSCP_stream_0:text", $("#stream_0")).val(inputValTextRtpUniAudio);
		if($(this, $("#stream_0")).val() == 0) return;
		if(inputValTextRtpUniAudio < 0 || inputValTextRtpUniAudio > 63 || inputValTextRtpUniAudio == "")
		{
			$("#formRtpUniAudioDSCP_stream_0:text", $("#stream_0")).val(eval(group_stream_0+ "_UNICAST_AUDIODSCP")).focus();
			alert(GetMsgLang("04040565"));
		}
	});
	$("#formRtpUniMetaDSCP_stream_0:text", $("#stream_0")).blur(function() {
		var inputValTextRtpUniMeta = $("#formRtpUniMetaDSCP_stream_0:text", $("#stream_0")).val()-0;
		$("#formRtpUniMetaDSCP_stream_0:text", $("#stream_0")).val(inputValTextRtpUniMeta);
		if($(this, $("#stream_0")).val() == 0) return;
		if(inputValTextRtpUniMeta < 0 || inputValTextRtpUniMeta > 63 || inputValTextRtpUniMeta == "")
		{
			$("#formRtpUniMetaDSCP_stream_0:text", $("#stream_0")).val(eval(group_stream_0+ "_UNICAST_METADSCP")).focus();
			alert(GetMsgLang("04040565"));
		}
	});
	$("#formRtpUniOnvifMetaDSCP_stream_0:text", $("#stream_0")).blur(function() {
		var inputValTextRtpUniOnvifMeta = $("#formRtpUniOnvifMetaDSCP_stream_0:text", $("#stream_0")).val()-0;
		$("#formRtpUniOnvifMetaDSCP_stream_0:text", $("#stream_0")).val(inputValTextRtpUniOnvifMeta);
		if($(this, $("#stream_0")).val() == 0) return;
		if(inputValTextRtpUniOnvifMeta < 0 || inputValTextRtpUniOnvifMeta > 63 || inputValTextRtpUniOnvifMeta == "")
		{
			$("#formRtpUniOnvifMetaDSCP_stream_0:text", $("#stream_0")).val(eval(group_stream_0+ "_UNICAST_ONVIFMETADSCP")).focus();
			alert(GetMsgLang("04040565"));
		}
	});

	// Multicast Video Port, Audio Port, TTL 설정
	$("#formRtpMulVideoPort_stream_0:text", $("#stream_0")).blur(function() {
		var inputValTextRtpVideoPort = $("#formRtpMulVideoPort_stream_0:text", $("#stream_0")).val()-0;
		$("#formRtpMulVideoPort_stream_0:text", $("#stream_0")).val(inputValTextRtpVideoPort);
		if(inputValTextRtpVideoPort < 1 || inputValTextRtpVideoPort >65535 || inputValTextRtpVideoPort == "")
		{
			$("#formRtpMulVideoPort_stream_0:text", $("#stream_0")).val(eval(group_stream_0+ "_MULTICAST_VIDEOPORT")).focus();
			alert(GetMsgLang("04040565"));
		}
	});
	$("#formRtpMulAudioPort_stream_0:text", $("#stream_0")).blur(function() {
		var inputValTextRtpAudioPort = $("#formRtpMulAudioPort_stream_0:text", $("#stream_0")).val()-0;
		$("#formRtpMulAudioPort_stream_0:text", $("#stream_0")).val(inputValTextRtpAudioPort);
		if(inputValTextRtpAudioPort < 1 || inputValTextRtpAudioPort > 65535 || inputValTextRtpAudioPort == "")
		{
			$("#formRtpMulAudioPort_stream_0:text", $("#stream_0")).val(eval(group_stream_0+ "_MULTICAST_AUDIOPORT")).focus();
			alert(GetMsgLang("04040565"));
		}
	});
	$("#formRtpMulMetaPort_stream_0:text", $("#stream_0")).blur(function() {
		var inputValTextRtpMetaPort = $("#formRtpMulMetaPort_stream_0:text", $("#stream_0")).val()-0;
		$("#formRtpMulMetaPort_stream_0:text", $("#stream_0")).val(inputValTextRtpMetaPort);
		if(inputValTextRtpMetaPort < 1 || inputValTextRtpMetaPort > 65535 || inputValTextRtpMetaPort == "")
		{
			$("#formRtpMulMetaPort_stream_0:text", $("#stream_0")).val(eval(group_stream_0+ "_MULTICAST_METAPORT")).focus();
			alert(GetMsgLang("04040565"));
		}
	});
	$("#formRtpMulOnvifMetaPort_stream_0:text", $("#stream_0")).blur(function() {
		var inputValTextRtpOnvifMetaPort = $("#formRtpMulOnvifMetaPort_stream_0:text", $("#stream_0")).val()-0;
		$("#formRtpMulOnvifMetaPort_stream_0:text", $("#stream_0")).val(inputValTextRtpOnvifMetaPort);
		if(inputValTextRtpOnvifMetaPort < 1 || inputValTextRtpOnvifMetaPort > 65535 || inputValTextRtpOnvifMetaPort == "")
		{
			$("#formRtpMulOnvifMetaPort_stream_0:text", $("#stream_0")).val(eval(group_stream_0+ "_MULTICAST_ONVIFMETAPORT")).focus();
			alert(GetMsgLang("04040565"));
		}
	});
	$("#formRtpMulTTL_stream_0:text", $("#stream_0")).blur(function() {
		var inputValTextRtpMulTTL = $("#formRtpMulTTL_stream_0:text", $("#stream_0")).val()-0;
		$("#formRtpMulTTL_stream_0:text", $("#stream_0")).val(inputValTextRtpMulTTL);
		if(inputValTextRtpMulTTL < 1 || inputValTextRtpMulTTL > 255 || inputValTextRtpMulTTL == "")
		{
			$("#formRtpMulTTL_stream_0:text", $("#stream_0")).val(eval(group_stream_0+ "_MULTICAST_TTL")).focus();
			alert(GetMsgLang("04040565"));
		}
	});

	// Multicast DSCP 설정
	$("#formRtpMulVideoDSCP_stream_0:text", $("#stream_0")).blur(function() {
		var inputValTextRtpMulVideo = $("#formRtpMulVideoDSCP_stream_0:text", $("#stream_0")).val()-0;
		$("#formRtpMulVideoDSCP_stream_0:text", $("#stream_0")).val(inputValTextRtpMulVideo);
			if($(this, $("#stream_0")).val() == 0) return;
		if(inputValTextRtpMulVideo < 0 || inputValTextRtpMulVideo > 63 || inputValTextRtpMulVideo == "")
		{
			$("#formRtpMulVideoDSCP_stream_0:text", $("#stream_0")).val(eval(group_stream_0+ "_MULTICAST_VIDEODSCP")).focus();
			alert(GetMsgLang("04040565"));
		}
	});
	$("#formRtpMulAudioDSCP_stream_0:text", $("#stream_0")).blur(function() {
		var inputValTextRtpMulAudio = $("#formRtpMulAudioDSCP_stream_0:text", $("#stream_0")).val()-0;
		$("#formRtpMulAudioDSCP_stream_0:text", $("#stream_0")).val(inputValTextRtpMulAudio);
			if($(this, $("#stream_0")).val() == 0) return;
		if(inputValTextRtpMulAudio < 0 || inputValTextRtpMulAudio > 63 || inputValTextRtpMulAudio == "")
		{
			$("#formRtpMulAudioDSCP_stream_0:text", $("#stream_0")).val(eval(group_stream_0+ "_MULTICAST_AUDIODSCP")).focus();
			alert(GetMsgLang("04040565"));
		}
	});
	$("#formRtpMulMetaDSCP_stream_0:text", $("#stream_0")).blur(function() {
		var inputValTextRtpMulMeta = $("#formRtpMulMetaDSCP_stream_0:text", $("#stream_0")).val()-0;
		$("#formRtpMulMetaDSCP_stream_0:text", $("#stream_0")).val(inputValTextRtpMulMeta);
		if($(this, $("#stream_0")).val() == 0) return;
		if(inputValTextRtpMulMeta < 0 || inputValTextRtpMulMeta > 63 || inputValTextRtpMulMeta == "")
		{
			$("#formRtpMulMetaDSCP_stream_0:text", $("#stream_0")).val(eval(group_stream_0+ "_MULTICAST_METADSCP")).focus();
			alert(GetMsgLang("04040565"));
		}
	});
	$("#formRtpMulOnvifMetaDSCP_stream_0:text", $("#stream_0")).blur(function() {
		var inputValTextRtpMulOnvifMeta = $("#formRtpMulOnvifMetaDSCP_stream_0:text", $("#stream_0")).val()-0;
		$("#formRtpMulOnvifMetaDSCP_stream_0:text", $("#stream_0")).val(inputValTextRtpMulOnvifMeta);
		if($(this, $("#stream_0")).val() == 0) return;
		if(inputValTextRtpMulOnvifMeta < 0 || inputValTextRtpMulOnvifMeta > 63 || inputValTextRtpMulOnvifMeta == "")
		{
			$("#formRtpMulOnvifMetaDSCP_stream_0:text", $("#stream_0")).val(eval(group_stream_0+ "_MULTICAST_METADSCP")).focus();
			alert(GetMsgLang("04040565"));
		}
	});

	// Enable Qos 에 따른 Disable 설정
	$("#formRtpUniQos_stream_0:checkbox", $("#stream_0")).change(function() {
		if($(this).attr("checked") == false)
		{
			Disable($("#formRtpUniVideoDSCP_stream_0", $("#stream_0")));
			Disable($("#formRtpUniAudioDSCP_stream_0", $("#stream_0")));
			Disable($("#formRtpUniMetaDSCP_stream_0", $("#stream_0")));
			Disable($("#formRtpUniOnvifMetaDSCP_stream_0", $("#stream_0")));
		}
		else
		{
			Enable($("#formRtpUniVideoDSCP_stream_0", $("#stream_0")));
			Enable($("#formRtpUniAudioDSCP_stream_0", $("#stream_0")));
			Enable($("#formRtpUniMetaDSCP_stream_0", $("#stream_0")));
			Enable($("#formRtpUniOnvifMetaDSCP_stream_0", $("#stream_0")));
		}
	});
	$("#formRtpMulQos_stream_0:checkbox", $("#stream_0")).change(function() {
		if($(this).attr("checked") == false)
		{
			Disable($("#formRtpMulVideoDSCP_stream_0", $("#stream_0")));
			Disable($("#formRtpMulAudioDSCP_stream_0", $("#stream_0")));
			Disable($("#formRtpMulMetaDSCP_stream_0", $("#stream_0")));
			Disable($("#formRtpMulOnvifMetaDSCP_stream_0", $("#stream_0")));
		}
		else
		{
			Enable($("#formRtpMulVideoDSCP_stream_0", $("#stream_0")));
			Enable($("#formRtpMulAudioDSCP_stream_0", $("#stream_0")));
			Enable($("#formRtpMulMetaDSCP_stream_0", $("#stream_0")));
			Enable($("#formRtpMulOnvifMetaDSCP_stream_0", $("#stream_0")));
		}
	});
	$("#formRtpUniQos_stream_0:checkbox", $("#stream_0")).change();
	$("#formRtpMulQos_stream_0:checkbox", $("#stream_0")).change();

	// Unicast DSCP 설정
	var group_stream_1 = "NETWORK" + "_RTP_ST1";
	
	$("#formRtpUniVideoDSCP_stream_1:text", $("#stream_1")).blur(function() {
		var inputValTextRtpUniVideo = $("#formRtpUniVideoDSCP_stream_1:text", $("#stream_1")).val()-0;
		$("#formRtpUniVideoDSCP_stream_1:text", $("#stream_1")).val(inputValTextRtpUniVideo);
		if($(this, $("#stream_1")).val() == 0) return;
		if(inputValTextRtpUniVideo < 0 || inputValTextRtpUniVideo > 63 || inputValTextRtpUniVideo == "")
		{
			$("#formRtpUniVideoDSCP_stream_1:text", $("#stream_1")).val(eval(group_stream_1+ "_UNICAST_VIDEODSCP")).focus();
			alert(GetMsgLang("04040565"));
		}
	});
	$("#formRtpUniAudioDSCP_stream_1:text", $("#stream_1")).blur(function() {
		var inputValTextRtpUniAudio = $("#formRtpUniAudioDSCP_stream_1:text", $("#stream_1")).val()-0;
		$("#formRtpUniAudioDSCP_stream_1:text", $("#stream_1")).val(inputValTextRtpUniAudio);
		if($(this, $("#stream_1")).val() == 0) return;
		if(inputValTextRtpUniAudio < 0 || inputValTextRtpUniAudio > 63 || inputValTextRtpUniAudio == "")
		{
			$("#formRtpUniAudioDSCP_stream_1:text", $("#stream_1")).val(eval(group_stream_1+ "_UNICAST_AUDIODSCP")).focus();
			alert(GetMsgLang("04040565"));
		}
	});
	$("#formRtpUniMetaDSCP_stream_1:text", $("#stream_1")).blur(function() {
		var inputValTextRtpUniMeta = $("#formRtpUniMetaDSCP_stream_1:text", $("#stream_1")).val()-0;
		$("#formRtpUniMetaDSCP_stream_1:text", $("#stream_1")).val(inputValTextRtpUniMeta);
		if($(this, $("#stream_1")).val() == 0) return;
		if(inputValTextRtpUniMeta < 0 || inputValTextRtpUniMeta > 63 || inputValTextRtpUniMeta == "")
		{
			$("#formRtpUniMetaDSCP_stream_1:text", $("#stream_1")).val(eval(group_stream_1+ "_UNICAST_METADSCP")).focus();
			alert(GetMsgLang("04040565"));
		}
	});
	$("#formRtpUniOnvifMetaDSCP_stream_1:text", $("#stream_1")).blur(function() {
		var inputValTextRtpUniOnvifMeta = $("#formRtpUniOnvifMetaDSCP_stream_1:text", $("#stream_1")).val()-0;
		$("#formRtpUniOnvifMetaDSCP_stream_1:text", $("#stream_1")).val(inputValTextRtpUniOnvifMeta);
		if($(this, $("#stream_1")).val() == 0) return;
		if(inputValTextRtpUniOnvifMeta < 0 || inputValTextRtpUniOnvifMeta > 63 || inputValTextRtpUniOnvifMeta == "")
		{
			$("#formRtpUniOnvifMetaDSCP_stream_1:text", $("#stream_1")).val(eval(group_stream_1+ "_UNICAST_ONVIFMETADSCP")).focus();
			alert(GetMsgLang("04040565"));
		}
	});

	// Multicast Video Port, Audio Port, TTL 설정
	$("#formRtpMulVideoPort_stream_1:text", $("#stream_1")).blur(function() {
		var inputValTextRtpVideoPort = $("#formRtpMulVideoPort_stream_1:text", $("#stream_1")).val()-0;
		$("#formRtpMulVideoPort_stream_1:text", $("#stream_1")).val(inputValTextRtpVideoPort);
		if(inputValTextRtpVideoPort < 1 || inputValTextRtpVideoPort >65535 || inputValTextRtpVideoPort == "")
		{
			$("#formRtpMulVideoPort_stream_1:text", $("#stream_1")).val(eval(group_stream_1+ "_MULTICAST_VIDEOPORT")).focus();
			alert(GetMsgLang("04040565"));
		}
	});
	$("#formRtpMulAudioPort_stream_1:text", $("#stream_1")).blur(function() {
		var inputValTextRtpAudioPort = $("#formRtpMulAudioPort_stream_1:text", $("#stream_1")).val()-0;
		$("#formRtpMulAudioPort_stream_1:text", $("#stream_1")).val(inputValTextRtpAudioPort);
		if(inputValTextRtpAudioPort < 1 || inputValTextRtpAudioPort > 65535 || inputValTextRtpAudioPort == "")
		{
			$("#formRtpMulAudioPort_stream_1:text", $("#stream_1")).val(eval(group_stream_1+ "_MULTICAST_AUDIOPORT")).focus();
			alert(GetMsgLang("04040565"));
		}
	});
	$("#formRtpMulMetaPort_stream_1:text", $("#stream_1")).blur(function() {
		var inputValTextRtpMetaPort = $("#formRtpMulMetaPort_stream_1:text", $("#stream_1")).val()-0;
		$("#formRtpMulMetaPort_stream_1:text", $("#stream_1")).val(inputValTextRtpMetaPort);
		if(inputValTextRtpMetaPort < 1 || inputValTextRtpMetaPort > 65535 || inputValTextRtpMetaPort == "")
		{
			$("#formRtpMulMetaPort_stream_1:text", $("#stream_1")).val(eval(group_stream_1+ "_MULTICAST_METAPORT")).focus();
			alert(GetMsgLang("04040565"));
		}
	});
	$("#formRtpMulOnvifMetaPort_stream_1:text", $("#stream_1")).blur(function() {
		var inputValTextRtpOnvifMetaPort = $("#formRtpMulOnvifMetaPort_stream_1:text", $("#stream_1")).val()-0;
		$("#formRtpMulOnvifMetaPort_stream_1:text", $("#stream_1")).val(inputValTextRtpOnvifMetaPort);
		if(inputValTextRtpOnvifMetaPort < 1 || inputValTextRtpOnvifMetaPort > 65535 || inputValTextRtpOnvifMetaPort == "")
		{
			$("#formRtpMulOnvifMetaPort_stream_1:text", $("#stream_1")).val(eval(group_stream_1+ "_MULTICAST_ONVIFMETAPORT")).focus();
			alert(GetMsgLang("04040565"));
		}
	});
	$("#formRtpMulTTL_stream_1:text", $("#stream_1")).blur(function() {
		var inputValTextRtpMulTTL = $("#formRtpMulTTL_stream_1:text", $("#stream_1")).val()-0;
		$("#formRtpMulTTL_stream_1:text", $("#stream_1")).val(inputValTextRtpMulTTL);
		if(inputValTextRtpMulTTL < 1 || inputValTextRtpMulTTL > 255 || inputValTextRtpMulTTL == "")
		{
			$("#formRtpMulTTL_stream_1:text", $("#stream_1")).val(eval(group_stream_1+ "_MULTICAST_TTL")).focus();
			alert(GetMsgLang("04040565"));
		}
	});

	// Multicast DSCP 설정
	$("#formRtpMulVideoDSCP_stream_1:text", $("#stream_1")).blur(function() {
		var inputValTextRtpMulVideo = $("#formRtpMulVideoDSCP_stream_1:text", $("#stream_1")).val()-0;
		$("#formRtpMulVideoDSCP_stream_1:text", $("#stream_1")).val(inputValTextRtpMulVideo);
			if($(this, $("#stream_1")).val() == 0) return;
		if(inputValTextRtpMulVideo < 0 || inputValTextRtpMulVideo > 63 || inputValTextRtpMulVideo == "")
		{
			$("#formRtpMulVideoDSCP_stream_1:text", $("#stream_1")).val(eval(group_stream_1+ "_MULTICAST_VIDEODSCP")).focus();
			alert(GetMsgLang("04040565"));
		}
	});
	$("#formRtpMulAudioDSCP_stream_1:text", $("#stream_1")).blur(function() {
		var inputValTextRtpMulAudio = $("#formRtpMulAudioDSCP_stream_1:text", $("#stream_1")).val()-0;
		$("#formRtpMulAudioDSCP_stream_1:text", $("#stream_1")).val(inputValTextRtpMulAudio);
			if($(this, $("#stream_1")).val() == 0) return;
		if(inputValTextRtpMulAudio < 0 || inputValTextRtpMulAudio > 63 || inputValTextRtpMulAudio == "")
		{
			$("#formRtpMulAudioDSCP_stream_1:text", $("#stream_1")).val(eval(group_stream_1+ "_MULTICAST_AUDIODSCP")).focus();
			alert(GetMsgLang("04040565"));
		}
	});
	$("#formRtpMulMetaDSCP_stream_1:text", $("#stream_1")).blur(function() {
		var inputValTextRtpMulMeta = $("#formRtpMulMetaDSCP_stream_1:text", $("#stream_1")).val()-0;
		$("#formRtpMulMetaDSCP_stream_1:text", $("#stream_1")).val(inputValTextRtpMulMeta);
		if($(this, $("#stream_1")).val() == 0) return;
		if(inputValTextRtpMulMeta < 0 || inputValTextRtpMulMeta > 63 || inputValTextRtpMulMeta == "")
		{
			$("#formRtpMulMetaDSCP_stream_1:text", $("#stream_1")).val(eval(group_stream_1+ "_MULTICAST_METADSCP")).focus();
			alert(GetMsgLang("04040565"));
		}
	});
	$("#formRtpMulOnvifMetaDSCP_stream_1:text", $("#stream_1")).blur(function() {
		var inputValTextRtpMulOnvifMeta = $("#formRtpMulOnvifMetaDSCP_stream_1:text", $("#stream_1")).val()-0;
		$("#formRtpMulOnvifMetaDSCP_stream_1:text", $("#stream_1")).val(inputValTextRtpMulOnvifMeta);
		if($(this, $("#stream_1")).val() == 0) return;
		if(inputValTextRtpMulOnvifMeta < 0 || inputValTextRtpMulOnvifMeta > 63 || inputValTextRtpMulOnvifMeta == "")
		{
			$("#formRtpMulOnvifMetaDSCP_stream_1:text", $("#stream_1")).val(eval(group_stream_1+ "_MULTICAST_METADSCP")).focus();
			alert(GetMsgLang("04040565"));
		}
	});

	// Enable Qos 에 따른 Disable 설정
	$("#formRtpUniQos_stream_1:checkbox", $("#stream_1")).change(function() {
		if($(this).attr("checked") == false)
		{
			Disable($("#formRtpUniVideoDSCP_stream_1", $("#stream_1")));
			Disable($("#formRtpUniAudioDSCP_stream_1", $("#stream_1")));
			Disable($("#formRtpUniMetaDSCP_stream_1", $("#stream_1")));
			Disable($("#formRtpUniOnvifMetaDSCP_stream_1", $("#stream_1")));
		}
		else
		{
			Enable($("#formRtpUniVideoDSCP_stream_1", $("#stream_1")));
			Enable($("#formRtpUniAudioDSCP_stream_1", $("#stream_1")));
			Enable($("#formRtpUniMetaDSCP_stream_1", $("#stream_1")));
			Enable($("#formRtpUniOnvifMetaDSCP_stream_1", $("#stream_1")));
		}
	});
	$("#formRtpMulQos_stream_1:checkbox", $("#stream_1")).change(function() {
		if($(this).attr("checked") == false)
		{
			Disable($("#formRtpMulVideoDSCP_stream_1", $("#stream_1")));
			Disable($("#formRtpMulAudioDSCP_stream_1", $("#stream_1")));
			Disable($("#formRtpMulMetaDSCP_stream_1", $("#stream_1")));
			Disable($("#formRtpMulOnvifMetaDSCP_stream_1", $("#stream_1")));
		}
		else
		{
			Enable($("#formRtpMulVideoDSCP_stream_1", $("#stream_1")));
			Enable($("#formRtpMulAudioDSCP_stream_1", $("#stream_1")));
			Enable($("#formRtpMulMetaDSCP_stream_1", $("#stream_1")));
			Enable($("#formRtpMulOnvifMetaDSCP_stream_1", $("#stream_1")));
		}
	});
	$("#formRtpUniQos_stream_1:checkbox", $("#stream_1")).change();
	$("#formRtpMulQos_stream_1:checkbox", $("#stream_1")).change();

	while(idx < 2)
	{
		$this = $("#stream_tab > div").eq(idx);

		// Unicast stream
		$("#formRtpUniVideoDSCP_stream_" + idx + ":text", $this).numeric();
		$("#formRtpUniAudioDSCP_stream_" + idx + ":text", $this).numeric();
		$("#formRtpUniMetaDSCP_stream_" + idx + ":text", $this).numeric();
		$("#formRtpUniOnvifMetaDSCP_stream_" + idx + ":text", $this).numeric();

		// Multicast stream
		$("#formRtpMulIP_stream_" + idx + ":text", $this).numeric();
		$("#formRtpMulIP_Audio_stream_" + idx + ":text", $this).numeric();
		$("#formRtpMulIP_Meta_stream_" + idx + ":text", $this).numeric();
		$("#formRtpMulIP_OnvifMeta_stream_" + idx + ":text", $this).numeric();
		$("#formRtpMulVideoPort_stream_" + idx + ":text", $this).numeric();
		$("#formRtpMulAudioPort_stream_" + idx + ":text", $this).numeric();
		$("#formRtpMulMetaPort_stream_" + idx + ":text", $this).numeric();
		$("#formRtpMulOnvifMetaPort_stream_" + idx + ":text", $this).numeric();
		$("#formRtpMulTTL_stream_" + idx + ":text", $this).numeric();
		$("#formRtpMulVideoDSCP_stream_" + idx + ":text", $this).numeric();
		$("#formRtpMulAudioDSCP_stream_" + idx + ":text", $this).numeric();
		$("#formRtpMulMetaDSCP_stream_" + idx + ":text", $this).numeric();
		$("#formRtpMulOnvifMetaDSCP_stream_" + idx + ":text", $this).numeric();
 
		idx++;
	}
}

function EventBind()
{
	var Req = new CGIRequest();
	
	$("#masterGenerate").click(function(){
		$("#masterKey").val(strGeneration(32));
	});

	$("#saltGenerate").click(function(){
		$("#saltKey").val(strGeneration(28));
	});

	var MasterKeyPreVal;
	var SaltKeyPreVal;
	$("#masterKey").focus(function(){
		MasterKeyPreVal = $("#masterKey").val();
	}).change(function(){
		if(!checkStringValidation($("#masterKey").val(), g_defregexp.hexOnly, null, 32, true))
		{
			$("#masterKey").val(MasterKeyPreVal);
		}
		else
		{
			MasterKeyPreVal = $("#masterKey").val();
		}
	});
	
	$("#saltKey").focus(function(){
		SaltKeyPreVal = $("#saltKey").val();
	}).change(function(){
		if(!checkStringValidation($("#saltKey").val(), g_defregexp.hexOnly, null, 28, true))
		{
			$("#saltKey").val(SaltKeyPreVal);
		}
		else
		{
			SaltKeyPreVal = $("#saltKey").val();
		}
	});
	

	$("#btnApply").click(function() {
		var reqQString = "action=update&xmlschema";
		var streamfstUniName = $("#formRtpUniSSName_stream_0:text", "#stream_0").val();
		var streamsndUniName = $("#formRtpUniSSName_stream_1:text", "#stream_1").val();
		var streamfstMulName = $("#formRtpMulSSName_stream_0:text", "#stream_0").val();
		var streamsndMulName = $("#formRtpMulSSName_stream_1:text", "#stream_1").val();
		var applyStream = 0;
		if($("#formRtspPort:text").val() < 1 || $("#formRtspPort:text").val() > 65535 || $("#formRtspPort:text").val() == "") return;
		if( false == IsValidMulticastIP()) return false;
		
		if(!checkStringValidation($("#masterKey").val(), g_defregexp.hexOnly, null, 32, true))
		{
			alert(GetMsgLang("04040574"));
			return false;
		}
		if(!checkStringValidation($("#saltKey").val(), g_defregexp.hexOnly, null, 28, true))
		{
			alert(GetMsgLang("04040575"));
			return false;
		}

		if(streamfstUniName == streamsndUniName)
		{
			alert(GetMsgLang("04040566"));
			return false;
		}
		if(streamfstMulName == streamsndMulName)
		{
			alert(GetMsgLang("04040566"));
			return false;
		}

		var bValid = true;

		bValid = bValid && checkRegexp($("#formRtpUniSSName_stream_0:text"),/^[a-z]([0-9a-z_])+$/i,GetMsgLang("04040568"));
		bValid = bValid && checkRegexp($("#formRtpMulSSName_stream_0:text"),/^[a-z]([0-9a-z_])+$/i,GetMsgLang("04040568"));
		bValid = bValid && checkRegexp($("#formRtpUniSSName_stream_1:text"),/^[a-z]([0-9a-z_])+$/i,GetMsgLang("04040568"));
		bValid = bValid && checkRegexp($("#formRtpMulSSName_stream_1:text"),/^[a-z]([0-9a-z_])+$/i,GetMsgLang("04040568"));

		if(bValid == false)
		{
			return false;
		}

		
		QString = makeQString();
		QString
			.set_action('update')
			.set_schema('xml')
			.add_list("NETWORK.Rtsp.port", NETWORK_RTSP_PORT, $("#formRtspPort:text").val())
			.add_list("NETWORK.Rtsp.Authen.enable", NETWORK_RTSP_AUTHEN_ENABLE, ($("#formRtspAuthEnable:checkbox").attr("checked") == true) ? "yes":"no")
			.add_list("NETWORK.Rtsp.Authen.type", NETWORK_RTSP_AUTHEN_TYPE, $("#formRtspAuthType").val())
			.add_list("NETWORK.Srtp.enable", NETWORK_SRTP_ENABLE, ($("#srtpEnable").attr("checked") == true) ? "yes":"no")
			.add_list("NETWORK.Srtp.protectionprofile", NETWORK_SRTP_PROTECTIONPROFILE, $("#protectionProfile").val())
			.add_list("NETWORK.Srtp.Key.master", NETWORK_SRTP_KEY_MASTER, $("#masterKey").val())
			.add_list("NETWORK.Srtp.Key.salt", NETWORK_SRTP_KEY_SALT, $("#saltKey").val());

		for(applyStream = 0; applyStream < 2; applyStream++)
		{
			$this = $("#stream_tab > div").eq(applyStream);
			
			if($("#formRtpUniVideoDSCP_stream_" + applyStream + ":text", $this).val() < 0 || $("#formRtpUniVideoDSCP_stream_" + applyStream + ":text", $this).val() > 63 || $("#formRtpUniVideoDSCP_stream_" + applyStream + ":text", $this).val() == "") return;
			if($("#formRtpUniAudioDSCP_stream_" + applyStream + ":text", $this).val() < 0 || $("#formRtpUniAudioDSCP_stream_" + applyStream + ":text", $this).val() > 63 || $("#formRtpUniAudioDSCP_stream_" + applyStream + ":text", $this).val() == "") return;
			if($("#formRtpUniMetaDSCP_stream_" + applyStream + ":text", $this).val() < 0 || $("#formRtpUniMetaDSCP_stream_" + applyStream + ":text", $this).val() > 63 || $("#formRtpUniMetaDSCP_stream_" + applyStream + ":text", $this).val() == "") return;
			if($("#formRtpUniOnvifMetaDSCP_stream_" + applyStream + ":text", $this).val() < 0 || $("#formRtpUniOnvifMetaDSCP_stream_" + applyStream + ":text", $this).val() > 63 || $("#formRtpUniOnvifMetaDSCP_stream_" + applyStream + ":text", $this).val() == "") return;
			if($("#formRtpMulVideoDSCP_stream_" + applyStream + ":text", $this).val() < 0 || $("#formRtpMulVideoDSCP_stream_" + applyStream + ":text", $this).val() > 63 || $("#formRtpMulVideoDSCP_stream_" + applyStream + ":text", $this).val() == "") return;
			if($("#formRtpMulMetaDSCP_stream_" + applyStream + ":text", $this).val() < 0 || $("#formRtpMulMetaDSCP_stream_" + applyStream + ":text", $this).val() > 63 || $("#formRtpMulMetaDSCP_stream_" + applyStream + ":text", $this).val() == "") return;
			if($("#formRtpMulOnvifMetaDSCP_stream_" + applyStream + ":text", $this).val() < 0 || $("#formRtpMulOnvifMetaDSCP_stream_" + applyStream + ":text", $this).val() > 63 || $("#formRtpMulOnvifMetaDSCP_stream_" + applyStream + ":text", $this).val() == "") return;
			if($("#formRtpMulVideoPort_stream_" + applyStream + ":text", $this).val() < 1 || $("#formRtpMulVideoPort_stream_" + applyStream + ":text", $this).val() > 65535 || $("#formRtpMulVideoPort_stream_" + applyStream + ":text", $this).val() == "") return;
			if($("#formRtpMulAudioPort_stream_" + applyStream + ":text", $this).val() < 1 || $("#formRtpMulAudioPort_stream_" + applyStream + ":text", $this).val() > 65535 || $("#formRtpMulAudioPort_stream_" + applyStream + ":text", $this).val() == "") return;
			if($("#formRtpMulMetaPort_stream_" + applyStream + ":text", $this).val() < 1 || $("#formRtpMulMetaPort_stream_" + applyStream + ":text", $this).val() > 65535 || $("#formRtpMulMetaPort_stream_" + applyStream + ":text", $this).val() == "") return;
			if($("#formRtpMulOnvifMetaPort_stream_" + applyStream + ":text", $this).val() < 1 || $("#formRtpMulOnvifMetaPort_stream_" + applyStream + ":text", $this).val() > 65535 || $("#formRtpMulOnvifMetaPort_stream_" + applyStream + ":text", $this).val() == "") return;
			if($("#formRtpMulTTL_stream_" + applyStream + ":text", $this).val() < 1 || $("#formRtpMulTTL_stream_" + applyStream + ":text", $this).val() > 255 || $("#formRtpMulTTL_stream_" + applyStream + ":text", $this).val() == "") return;
			
			QString
				.add_list("NETWORK.Rtp.St" + applyStream + ".Unicast.enable", eval("NETWORK_RTP_ST" + applyStream + "_UNICAST_ENABLE"), ($("#formRtpUniEnable_stream_" + applyStream + ":checkbox", $this).attr("checked") == true) ? "yes":"no")
				.add_list("NETWORK.Rtp.St" + applyStream + ".Unicast.name", eval("NETWORK_RTP_ST" + applyStream + "_UNICAST_NAME"), encodeURIComponent($("#formRtpUniSSName_stream_" + applyStream + ":text", $this).val()))
				.add_list("NETWORK.Rtp.St" + applyStream + ".Unicast.includeaudio", eval("NETWORK_RTP_ST" + applyStream + "_UNICAST_INCLUDEAUDIO"), ($("#formRtpUniAudio_stream_" + applyStream + ":checkbox", $this).attr("checked") == true) ? "yes":"no")
				.add_list("NETWORK.Rtp.St" + applyStream + ".Unicast.includemeta", eval("NETWORK_RTP_ST" + applyStream + "_UNICAST_INCLUDEMETA"), ($("#formRtpUniMeta_stream_" + applyStream + ":checkbox", $this).attr("checked") == true) ? "yes":"no")
				.add_list("NETWORK.Rtp.St" + applyStream + ".Unicast.includeonvifmeta", eval("NETWORK_RTP_ST" + applyStream + "_UNICAST_INCLUDEONVIFMETA"), ($("#formRtpUniMetaOnvif_stream_" + applyStream + ":checkbox", $this).attr("checked") == true) ? "yes":"no")
				.add_list("NETWORK.Rtp.St" + applyStream + ".Unicast.enableqos", eval("NETWORK_RTP_ST" + applyStream + "_UNICAST_ENABLEQOS"), ($("#formRtpUniQos_stream_" + applyStream + ":checkbox", $this).attr("checked") == true) ? "yes":"no")
				.add_list("NETWORK.Rtp.St" + applyStream + ".Unicast.videodscp", eval("NETWORK_RTP_ST" + applyStream + "_UNICAST_VIDEODSCP"), $("#formRtpUniVideoDSCP_stream_" + applyStream + ":text", $this).val())
				.add_list("NETWORK.Rtp.St" + applyStream + ".Unicast.audiodscp", eval("NETWORK_RTP_ST" + applyStream + "_UNICAST_AUDIODSCP"), $("#formRtpUniAudioDSCP_stream_" + applyStream + ":text", $this).val())
				.add_list("NETWORK.Rtp.St" + applyStream + ".Unicast.metadscp", eval("NETWORK_RTP_ST" + applyStream + "_UNICAST_METADSCP"), $("#formRtpUniMetaDSCP_stream_" + applyStream + ":text", $this).val())
				.add_list("NETWORK.Rtp.St" + applyStream + ".Unicast.onvifmetadscp", eval("NETWORK_RTP_ST" + applyStream + "_UNICAST_ONVIFMETADSCP"), $("#formRtpUniOnvifMetaDSCP_stream_" + applyStream + ":text", $this).val())
				.add_list("NETWORK.Rtp.St" + applyStream + ".Multicast.enable", eval("NETWORK_RTP_ST" + applyStream + "_MULTICAST_ENABLE"), ($("#formRtpMulEnable_stream_" + applyStream + ":checkbox", $this).attr("checked") == true) ? "yes":"no")
				.add_list("NETWORK.Rtp.St" + applyStream + ".Multicast.alwaysmulticast", eval("NETWORK_RTP_ST" + applyStream + "_MULTICAST_ALWAYSMULTICAST"), ($("#formRtpMulEnableAlways_stream_" + applyStream + ":checkbox", $this).attr("checked") == true) ? "yes":"no")
				.add_list("NETWORK.Rtp.St" + applyStream + ".Multicast.ipaddress", eval("NETWORK_RTP_ST" + applyStream + "_MULTICAST_IPADDRESS"), $("#formRtpMulIPValid_stream_" + applyStream + " #_octet_1", $this).val() + '.' +
									$("#formRtpMulIPValid_stream_" + applyStream + " #_octet_2", $this).val() + '.' +
									$("#formRtpMulIPValid_stream_" + applyStream + " #_octet_3", $this).val() + '.' +
									$("#formRtpMulIPValid_stream_" + applyStream + " #_octet_4", $this).val())
				.add_list("NETWORK.Rtp.St" + applyStream + ".Multicast.audioipaddress", eval("NETWORK_RTP_ST" + applyStream + "_MULTICAST_AUDIOIPADDRESS"), $("#formRtpMulIPValid_Audio_stream_" + applyStream + " #_octet_1", $this).val() + '.' +
									$("#formRtpMulIPValid_Audio_stream_" + applyStream + " #_octet_2", $this).val() + '.' +
									$("#formRtpMulIPValid_Audio_stream_" + applyStream + " #_octet_3", $this).val() + '.' +
									$("#formRtpMulIPValid_Audio_stream_" + applyStream + " #_octet_4", $this).val())
				.add_list("NETWORK.Rtp.St" + applyStream + ".Multicast.metaipaddress", eval("NETWORK_RTP_ST" + applyStream + "_MULTICAST_METAIPADDRESS"), $("#formRtpMulIPValid_Meta_stream_" + applyStream + " #_octet_1", $this).val() + '.' +
									$("#formRtpMulIPValid_Meta_stream_" + applyStream + " #_octet_2", $this).val() + '.' +
									$("#formRtpMulIPValid_Meta_stream_" + applyStream + " #_octet_3", $this).val() + '.' +
									$("#formRtpMulIPValid_Meta_stream_" + applyStream + " #_octet_4", $this).val())
				.add_list("NETWORK.Rtp.St" + applyStream + ".Multicast.onvifmetaipaddress", eval("NETWORK_RTP_ST" + applyStream + "_MULTICAST_ONVIFMETAIPADDRESS"), $("#formRtpMulIPValid_OnvifMeta_stream_" + applyStream + " #_octet_1", $this).val() + '.' +
									$("#formRtpMulIPValid_OnvifMeta_stream_" + applyStream + " #_octet_2", $this).val() + '.' +
									$("#formRtpMulIPValid_OnvifMeta_stream_" + applyStream + " #_octet_3", $this).val() + '.' +
									$("#formRtpMulIPValid_OnvifMeta_stream_" + applyStream + " #_octet_4", $this).val())
				.add_list("NETWORK.Rtp.St" + applyStream + ".Multicast.videoport", eval("NETWORK_RTP_ST" + applyStream + "_MULTICAST_VIDEOPORT"), $("#formRtpMulVideoPort_stream_" + applyStream + ":text", $this).val())
				.add_list("NETWORK.Rtp.St" + applyStream + ".Multicast.audioport", eval("NETWORK_RTP_ST" + applyStream + "_MULTICAST_AUDIOPORT"), $("#formRtpMulAudioPort_stream_" + applyStream + ":text", $this).val())
				.add_list("NETWORK.Rtp.St" + applyStream + ".Multicast.metaport", eval("NETWORK_RTP_ST" + applyStream + "_MULTICAST_METAPORT"), $("#formRtpMulMetaPort_stream_" + applyStream + ":text", $this).val())
				.add_list("NETWORK.Rtp.St" + applyStream + ".Multicast.onvifmetaport", eval("NETWORK_RTP_ST" + applyStream + "_MULTICAST_ONVIFMETAPORT"), $("#formRtpMulOnvifMetaPort_stream_" + applyStream + ":text", $this).val())
				.add_list("NETWORK.Rtp.St" + applyStream + ".Multicast.ttl", eval("NETWORK_RTP_ST" + applyStream + "_MULTICAST_TTL"), $("#formRtpMulTTL_stream_" + applyStream + ":text", $this).val())
				.add_list("NETWORK.Rtp.St" + applyStream + ".Multicast.name", eval("NETWORK_RTP_ST" + applyStream + "_MULTICAST_NAME"), encodeURIComponent($("#formRtpMulSSName_stream_" + applyStream + ":text", $this).val()))
				.add_list("NETWORK.Rtp.St" + applyStream + ".Multicast.includeaudio", eval("NETWORK_RTP_ST" + applyStream + "_MULTICAST_INCLUDEAUDIO"), ($("#formRtpMulAudio_stream_" + applyStream + ":checkbox", $this).attr("checked") == true) ? "yes":"no")
				.add_list("NETWORK.Rtp.St" + applyStream + ".Multicast.includemeta", eval("NETWORK_RTP_ST" + applyStream + "_MULTICAST_INCLUDEMETA"), ($("#formRtpMulMeta_stream_" + applyStream + ":checkbox", $this).attr("checked") == true) ? "yes":"no")
				.add_list("NETWORK.Rtp.St" + applyStream + ".Multicast.includeonvifmeta", eval("NETWORK_RTP_ST" + applyStream + "_MULTICAST_INCLUDEONVIFMETA"), ($("#formRtpMulMetaOnvif_stream_" + applyStream + ":checkbox", $this).attr("checked") == true) ? "yes":"no")
				.add_list("NETWORK.Rtp.St" + applyStream + ".Multicast.enableqos", eval("NETWORK_RTP_ST" + applyStream + "_MULTICAST_ENABLEQOS"), ($("#formRtpMulQos_stream_" + applyStream + ":checkbox", $this).attr("checked") == true) ? "yes":"no")
				.add_list("NETWORK.Rtp.St" + applyStream + ".Multicast.videodscp", eval("NETWORK_RTP_ST" + applyStream + "_MULTICAST_VIDEODSCP"), $("#formRtpMulVideoDSCP_stream_" + applyStream + ":text", $this).val())
				.add_list("NETWORK.Rtp.St" + applyStream + ".Multicast.audiodscp", eval("NETWORK_RTP_ST" + applyStream + "_MULTICAST_AUDIODSCP"), $("#formRtpMulAudioDSCP_stream_" + applyStream + ":text", $this).val())
				.add_list("NETWORK.Rtp.St" + applyStream + ".Multicast.metadscp", eval("NETWORK_RTP_ST" + applyStream + "_MULTICAST_METADSCP"), $("#formRtpMulMetaDSCP_stream_" + applyStream + ":text", $this).val())
				.add_list("NETWORK.Rtp.St" + applyStream + ".Multicast.onvifmetadscp", eval("NETWORK_RTP_ST" + applyStream + "_MULTICAST_ONVIFMETADSCP"), $("#formRtpMulOnvifMetaDSCP_stream_" + applyStream + ":text", $this).val());
		}
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

			LoadParamJs(g_defaultGroup + "&cache", function() {
				InitSettingSub();
				SetRelationSub();
				InitSetting();
				SetRelation();
				ViewLoadingSave(false);
			});

			return;
		});
		Req.Request(reqQString);
	});
}

function GetIPaddressValue()
{
	var idx = 0;
	
	while(idx < 2)
	{
		var group = "NETWORK" + "_RTP_ST" + idx;
		var resetIP_Video = eval(group+ "_MULTICAST_IPADDRESS").split(".");
		var resetIP_Audio = eval(group+ "_MULTICAST_AUDIOIPADDRESS").split(".");
		var resetIP_Meta = eval(group+ "_MULTICAST_METAIPADDRESS").split(".");
		var resetIP_Onvif = eval(group+ "_MULTICAST_ONVIFMETAIPADDRESS").split(".");

		$this = $("#stream_tab > div").eq(idx);
		
		$("#formRtpMulIPValid_stream_" + idx + " #_octet_1", $this).val(resetIP_Video[0]);
		$("#formRtpMulIPValid_stream_" + idx + " #_octet_2", $this).val(resetIP_Video[1]);
		$("#formRtpMulIPValid_stream_" + idx + " #_octet_3", $this).val(resetIP_Video[2]);
		$("#formRtpMulIPValid_stream_" + idx + " #_octet_4", $this).val(resetIP_Video[3]);


		$("#formRtpMulIPValid_Audio_stream_" + idx + " #_octet_1", $this).val(resetIP_Audio[0]);
		$("#formRtpMulIPValid_Audio_stream_" + idx + " #_octet_2", $this).val(resetIP_Audio[1]);
		$("#formRtpMulIPValid_Audio_stream_" + idx + " #_octet_3", $this).val(resetIP_Audio[2]);
		$("#formRtpMulIPValid_Audio_stream_" + idx + " #_octet_4", $this).val(resetIP_Audio[3]);


		$("#formRtpMulIPValid_Meta_stream_" + idx + " #_octet_1", $this).val(resetIP_Meta[0]);
		$("#formRtpMulIPValid_Meta_stream_" + idx + " #_octet_2", $this).val(resetIP_Meta[1]);
		$("#formRtpMulIPValid_Meta_stream_" + idx + " #_octet_3", $this).val(resetIP_Meta[2]);
		$("#formRtpMulIPValid_Meta_stream_" + idx + " #_octet_4", $this).val(resetIP_Meta[3]);


		$("#formRtpMulIPValid_OnvifMeta_stream_" + idx + " #_octet_1", $this).val(resetIP_Onvif[0]);
		$("#formRtpMulIPValid_OnvifMeta_stream_" + idx + " #_octet_2", $this).val(resetIP_Onvif[1]);
		$("#formRtpMulIPValid_OnvifMeta_stream_" + idx + " #_octet_3", $this).val(resetIP_Onvif[2]);
		$("#formRtpMulIPValid_OnvifMeta_stream_" + idx + " #_octet_4", $this).val(resetIP_Onvif[3]);

		idx++;
	}
}

function IsValidMulticastIP()
{
	var IDName = Array(4);
	var szRet = true;
	var i,j;
	
	IDName = ["formRtpMulIPValid_stream_","formRtpMulIPValid_Audio_stream_",
			"formRtpMulIPValid_Meta_stream_","formRtpMulIPValid_OnvifMeta_stream_"];

	for(i=0; i<2; i++)
	{
		for(j=0; j<4; j++)
		{
			szRet = DiffMulticastIP($("#" + IDName[j] + i + " #_octet_1", $("#stream_" + i)).val() + "." +
									$("#" + IDName[j] + i + " #_octet_2", $("#stream_" + i)).val() + "." +
									$("#" + IDName[j] + i + " #_octet_3", $("#stream_" + i)).val() + "." +
									$("#" + IDName[j] + i + " #_octet_4", $("#stream_" + i)).val());

			if(szRet == false)
			{
				alert(GetMsgLang("04040567"));
				return false;
			}
		}
	}

	return true;
}

function DiffMulticastIP(_eIPAddress)
{
	var i;
	var index;
	var szIPAddress;
	var netBytesIP = 0;

	szIPAddress = _eIPAddress;

	if("0.0.0.0" == szIPAddress)
	{
		return true;
	}
 
	for( i=0; i<4; i++ ) 
	{
		var szIP;

		index = szIPAddress.indexOf(".");
		
		if( 3 == i ) 
		{
			szIP = szIPAddress;
			if( -1 != szIP.indexOf(".") ) 
			{
				return false;
			}
		}
		else 
		{
			if( -1 == index ) 
			{
				return false;
			}
			szIP = szIPAddress.substr(0, index);
		}

		szIPAddress = szIPAddress.substr(index+1, szIPAddress.length-index-1);

		if( 0 == i ) {
			netBytesIP = netBytesIP + ( parseInt(szIP, 10) * 256 * 256 * 256 );
		}
		else if( 1 == i ) {
			netBytesIP = netBytesIP + ( parseInt(szIP, 10) * 256 * 256 );
		}
		else if( 2 == i ) {
			netBytesIP = netBytesIP + ( parseInt(szIP, 10) * 256 );
		}
		else if( 3 == i ) {
			netBytesIP = netBytesIP + ( parseInt(szIP, 10) );
		}
	}
	if(!((0xE0000100 <= netBytesIP) && (netBytesIP <= 0xEFFFFFFF)))
	{
		return false;
	}

	return true;
}

function checkRegexp(o,regexp,n)
{
	if(!(regexp.test(o.val())))
	{
		alert(n);
		return false;
	}

	return true;
}