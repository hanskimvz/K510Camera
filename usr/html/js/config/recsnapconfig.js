var nVCAPreviewH = -1;
var nVCADataMgrH = -1;
var nRenderBlockH = -1;
var nAVDecoderBlockH = -1;
var snapshot_url = "/uapi-cgi/snapshot.fcgi";
var status_url = "/uapi-cgi/status.cgi?time";
var oldSize = 0;
var oldTimeM = 0;
var oldTimeS = 0;
var oldRecPath = "";
var oldSnapPath = "";
var oldRecPrefix = "RECORD";
var oldSnapPrefix = "SNAPSHOT";
var oldVideoAudio = "";
var oldRulSeg = "";
var firstloading = 0;

var httpPortNum = ( "" == window.location.port ) ? 80 : window.location.port;
var urlAxLang = "http://" + document.domain + ":" + httpPortNum + "/language/AxEnglish.xml";
var revLang = "/language/English.xml";

$(function () {
	PreCustomize();

	var classNum = ["02016713"];
	InitMsgLang(classNum);

	if(location.pathname.split("/")[1] === "viewer") {
		if(paramjs_url && param_url && snapshot_url && language_url) {
			paramjs_url = "/uapi-cgi/viewer/paramjs.fcgi";
			param_url = "/uapi-cgi/viewer/param.cgi";
			snapshot_url = "/uapi-cgi/viewer/snapshot.fcgi";
			status_url = "/uapi-cgi/viewer/status.cgi?time";
			language_url = "/uapi-cgi/viewer/language.cgi";
		}
	}

	Run();

	// Language set
	var environmentReq = new CGIRequest();
	var environmentReqQString = "";
	var langDepth = live + maincontents + "recsnapconfig";
	environmentReq.SetAddress("../environment.xml");
	environmentReq.SetCallBackFunc(function(xml){
		if($('lang', xml).size() > 0)
		{
			revLang = $('lang', xml).text();

			var language = revLang.split( /\/|\./ )[2];

			if("xml"==language)
			{
				language = revLang.split( /\/|\./ )[1];
			}

			var httpProtocol = window.location.protocol;
			var httpPort = window.location.port;

			if(httpProtocol == "http:")
			{
				if(window.location.port == "" || window.location.port == 80)
					httpPort = 80;
				else
					httpPort = window.location.port;
			}
			else if(httpProtocol == "https:")
			{
				if(window.location.port == "" || window.location.port == 443)
					httpPort = 443;
				else
					httpPort = window.location.port;
			}

			urlAxLang = httpProtocol + "//" + document.domain + ":" + httpPort + "/language/Ax" + language + ".xml";

			getLangXml(revLang, langDepth);
		}
	});
	environmentReq.Request(environmentReqQString);
});

function testPage()
{
	return true;
}

function adjustContentsByBrand()
{
	if(g_brand.productID != "d001")
	{
		if(g_brand.audioInOut != "1/0" && g_brand.audioInOut != "1/1")
		{
			var audioVideoAR = $("#formARRecRes").children("[value='audiovideo']");

			if(audioVideoAR.size() > 0) audioVideoAR.remove();
		}
	}
}

function Run()
{
	InitThemes();
	adjustContentsByBrand();
	$("#frame").show();
	$("button").button();
	ContentShow();

	var vcaReq = new CGIRequest();
	var vcaReqQString = "";

	vcaReq.SetAddress(param_url + "?action=list&group=VCA.Ch0.enable&xmlschema");
	vcaReq.SetCallBackFunc(function (xml) {
		// xml data 받아옴
		if ($('Ch0 > enable', xml).size() > 0) {
			LoadParamJs("NETWORK&ENCODER&PTZ&SYSTEM.Status.Videoin.Ch0.standard&VIDEOIN&cache", Load);
		}
		return;
	});
	vcaReq.Request(vcaReqQString);
}
function Load()
{
	StartVideo();
	PostCustomize();
}

function CreateUMFBlocks()
{
	if(AxUMF !== undefined)
	{
		AxUMF.SetParam("CONTROL", "LANGUAGE", urlAxLang);

		AxUMF.SetParam("CONTROL", "CHANGENVVIEW", "1");

		nVCADataMgrH = AxUMF.SetParam("CONTROL", "CREATE_UMFBLOCK", "VCADataManagerBlock, VCADataManagerBlock.dll");
		nAVDecoderBlockH = AxUMF.SetParam("CONTROL", "CREATE_UMFBLOCK", "AVDecoderBlock, AVDecoderBlock.dll");
		nVCAPreviewH = AxUMF.SetParam("CONTROL", "CREATE_UMFBLOCK", "VCADialogBlock, VCADialogBlock.dll");
		nRenderBlockH = AxUMF.SetParam("CONTROL", "CREATE_UMFBLOCK", "RenderBlock, RenderBlock.dll");

		AxUMF.SetParam("CONTROL", "POSITION_UMFBLOCK", nVCAPreviewH + ", 0, 0, 1, 1");
		AxUMF.SetParam("CONTROL", "CONNECT_UMFBLOCKS", nVCAPreviewH + ", " + nRenderBlockH + ", RENDER");
		AxUMF.SetParam("CONTROL", "CONNECT_UMFBLOCKS", nAVDecoderBlockH + ", " + nVCAPreviewH + ", RENDER");
		AxUMF.SetParam("CONTROL", "CONNECT_UMFBLOCKS", nVCAPreviewH + ", " + nVCADataMgrH + ", DATAMANAGER");
		AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nVCAPreviewH + ", UI=VCA_UI_MODE_VIEW");
		AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nVCAPreviewH + ", UI=VCA_UI_MODE_CONTEXT_HIDE");
	}

}

function getArMegabyteValue(curVal)
{
	if(curVal > 2000)
	{
		AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_SET_DATA=RECORDING_SIZE,"+2000*1048576);
		curVal = 2000;
	}

	return curVal;
}

function activeXEvent(szType, szValue)
{
	if(szType == "RECORDING_PATH")
	{
		$("#formARRecPath:text").val(szValue);
		if((firstloading & 1) == 0)
		{
			oldRecPath = szValue;
			firstloading |= 1;
		}
	}
	else if(szType == "RECORDING_PREFIX")
	{
		if(szValue != "")
		{
			$("#formARRecSet:text").val(szValue);
			oldRecPrefix = szValue;
		}
	}
	else if(szType == "SNAPSHOT_PATH")
	{
		$("#formARSnapPath:text").val(szValue);
		if((firstloading & 2) == 0)
		{
			oldSnapPath = szValue;
			firstloading |= 2;
		}
	}
	else if(szType == "SNAPSHOT_PREFIX")
	{
		if(szValue != "")
		{
			$("#formARSnapSet:text").val(szValue);
			oldSnapPrefix = szValue;
		}
	}
	else if(szType == "RECORDING_SIZE")
	{
		var arMegabyteVal = getArMegabyteValue(szValue/1048576);
		$("#formARMegabyte:text").val(arMegabyteVal);

		oldSize = $("#formARMegabyte:text").val();

		if($("#formARMegabyte:text").val() != "0")
		{
			oldRulSeg = "size";
			$("input[name='formARPriRulSeg'][value='" + "size" + "']:radio").attr("checked", "checked");
			$("input[name='formARPriRulSeg']").change();
		}
		else
		{
			$("#formARMegabyte:text").val("10");
		}
	}
	else if(szType == "RECORDING_TIME")
	{
		if(szValue != "")
		{
			var tmp = szValue.split("min");
			if(tmp[0] != szValue)   //min
			{
				if(tmp[0] != '0')
				{
					$("#formARMinute:text").val(tmp[0]);
					oldTimeM = tmp[0];

					oldRulSeg = "timem";
					$("input[name='formARPriRulSeg'][value='" + "timem" + "']:radio").attr("checked", "checked");
					$("input[name='formARPriRulSeg']").change();
					$("#formARSecond:text").val("10");
				}
				else
				{
					oldTimeM = "1";
				}

				oldTimeS = "10";
			}
			else	//sec
			{
				tmp = szValue.split("sec");
				if(tmp[0] != '0')
				{
					$("#formARSecond:text").val(tmp[0]);
					oldTimeS = tmp[0];
				
					oldRulSeg = "times";
					$("input[name='formARPriRulSeg'][value='" + "times" + "']:radio").attr("checked", "checked");
					$("input[name='formARPriRulSeg']").change();
					$("#formARMinute:text").val("1");
				}
				else
				{
					oldTimeS = "10";
				}

				oldTimeM = "1";
			}
		}
	}	
	else if(szType == "RECORDING_INCLUDE_AUDIO")
	{
		if(szValue == 1)
		{
			$("select#formARRecRes").val("audiovideo");
			oldVideoAudio = "audiovideo";
		}
		else
		{
			$("select#formARRecRes").val("video");
			oldVideoAudio = "video";
		}
	}
}

function StartVideo()
{
	if (browserCheck() == "msie") {
		AxUMF_create(720,
					 480,
					 null,
					 function () {			  
						CreateUMFBlocks();
						SetRelation();
						InitSetting();
						EventBind();
					 }, 
					 activeXEvent,
					 null);
	}
	
	$("#activex").hide();
	$("#VideoScreen").hide();

	return true;
}

function InitSetting()
{
	$("#formARRecSet:text").val(oldRecPrefix);
	$("#formARSnapSet:text").val(oldSnapPrefix);
	$("#formARRecPath").attr("readonly",true);
	$("#formARSnapPath").attr("readonly",true);
	$("#formARMegabyte:text").val("10");
	$("#formARSecond:text").val("10");
	$("#formARMinute:text").val("1");
	$("input[name='formARPriRulSeg'][value='" + "size" + "']:radio").attr("checked", "checked");

	AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_GET_DATA=SNAPSHOT_PATH");
	AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_GET_DATA=SNAPSHOT_PREFIX");
	AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_GET_DATA=RECORDING_PATH");
	AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_GET_DATA=RECORDING_PREFIX");
	AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_GET_DATA=RECORDING_INCLUDE_AUDIO");
	AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_GET_DATA=RECORDING_SIZE");
	AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_GET_DATA=RECORDING_TIME"); 
	$("input[name='formARPriRulSeg']").change();
}

function SetRelation()
{
	// Number Only
	$("#formARMegabyte:text").numeric();
	$("#formARSecond:text").numeric();
	$("#formARMinute:text").numeric();

   // Text box 숫자범위
	$("#formARMegabyte:text").change(function() {
		var inputValTextMega = $("#formARMegabyte:text").val()-0;
		$("#formARMegabyte:text").val(inputValTextMega);
		if(inputValTextMega < 10 || inputValTextMega > 2000 || $(this).val() == "NaN")
		{
			$("#formARMegabyte:text").val(oldSize).focus();
			alert(GetMsgLang("02016713"));
			return false;
		}
	});
	$("#formARSecond:text").change(function() {
		var inputValTextTime = $("#formARSecond:text").val()-0;
		$("#formARSecond:text").val(inputValTextTime);
		if(inputValTextTime < 10 || inputValTextTime > 3600 || $(this).val() == "NaN")
		{
			$("#formARSecond:text").val(oldTimeS).focus();
			alert(GetMsgLang("02016713"));
			return false;
		}
	});
	$("#formARMinute:text").change(function() {
		var inputValTextTime = $("#formARMinute:text").val()-0;
		$("#formARMinute:text").val(inputValTextTime);
		if(inputValTextTime < 1 || inputValTextTime > 3600 || $(this).val() == "NaN")
		{
			$("#formARMinute:text").val(oldTimeM).focus();
			alert(GetMsgLang("02016713"));
			return false;
		}
	});

	$("input[name='formARPriRulSeg']").change(function() {
		if($("input[name='formARPriRulSeg']:checked:radio").val() == "size")
		{
			Disable($("#formARSecond:text"));
			Disable($("#formARMinute:text"));
			Enable($("#formARMegabyte:text"));
		}
		else if($("input[name='formARPriRulSeg']:checked:radio").val() == "times")
		{
			Disable($("#formARMegabyte:text"));
			Disable($("#formARMinute:text"));
			Enable($("#formARSecond:text"));
		}
		else if($("input[name='formARPriRulSeg']:checked:radio").val() == "timem")
		{
			Disable($("#formARMegabyte:text"));
			Disable($("#formARSecond:text"));
			Enable($("#formARMinute:text"));
		}
	});

	$("#formARRecSet:text").keyup(function(){
		LimitCharac("formARRecSet:text", 16);

		var textVal = $(this).val();
		var inputValid= /[a-z]|[A-Z]|[0-9]/gi;

		textVal = textVal.replace(inputValid, '');

		if(textVal != "")
		{
			$("#formARRecSet:text").val(oldRecPrefix);
			return false;
		}
	});

	$("#formARSnapSet:text").keyup(function(){
		LimitCharac("formARSnapSet:text", 16);

		var textVal = $(this).val();
		var inputValid= /[a-z]|[A-Z]|[0-9]/gi;

		textVal = textVal.replace(inputValid, '');

		if(textVal != "")
		{
			$("#formARSnapSet:text").val(oldSnapPrefix);
			return false;
		}
	});
}

function EventBind()
{
	$("button#btnRecPath").button().click(function() {
		if(AxUMF != undefined)
		{
			AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_OPEN_FOLDER_BROWSER=RECORD");
		}
	});

	$("button#btnSnapPath").button().click(function() {
		if(AxUMF != undefined)
		{
			AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_OPEN_FOLDER_BROWSER=SNAPSHOT");
		}
	});

	$("button#btnReset").button().click(function() {
		window.close();
	});

	$("button#btnApply").button().click(function() {
		if($("#formARSnapSet:text").val()=="")
		{
			$("#formARSnapSet:text").focus();
			alert(GetMsgLang("02016713"));
			return;
		}
		if($("#formARRecSet:text").val()=="")
		{
			$("#formARRecSet:text").focus();
			alert(GetMsgLang("02016713"));
			return;
		}

		if($("input[name='formARPriRulSeg']:checked:radio").val() == "size")
		{
			if($("#formARMegabyte:text").val() < 10)
			{
				$("#formARMegabyte:text").focus();
				alert(GetMsgLang("02016713"));
				return;
			}
		}
		else if($("input[name='formARPriRulSeg']:checked:radio").val() == "times")
		{
			if($("#formARSecond:text").val() < 10)
			{
				$("#formARSecond:text").focus();
				alert(GetMsgLang("02016713"));
				return;
			}
		}
		else if($("input[name='formARPriRulSeg']:checked:radio").val() == "timem")
		{
			if($("#formARMinute:text").val() < 1)
			{
				$("#formARMinute:text").focus();
				alert(GetMsgLang("02016713"));
				return;
			}
		}

		if($("#formARSnapSet:text").val() == oldSnapPrefix &&
			$("#formARSnapPath:text").val() == oldSnapPath &&
			$("#formARRecSet:text").val() == oldRecPrefix &&
			$("#formARRecPath:text").val() == oldRecPath &&
			$("select#formARRecRes").val() == oldVideoAudio)
		{
			if($("input[name='formARPriRulSeg']:checked:radio").val() == oldRulSeg)
			{
				if((oldRulSeg == "size" && $("#formARMegabyte:text").val() == oldSize) ||
					(oldRulSeg == "times" && $("#formARSecond:text").val() == oldTimeS) ||
					(oldRulSeg == "timem" && $("#formARMinute:text").val() == oldTimeM))
						return;
			}
		}


		if($("input[name='formARPriRulSeg']:checked:radio").val() == "size")
		{
			AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_SET_DATA=RECORDING_SIZE,"+$("#formARMegabyte:text").val()*1048576);
			AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_SET_DATA=RECORDING_TIME,0sec");
			AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_SET_DATA=RECORDING_TIME,0min");
		}
		else if($("input[name='formARPriRulSeg']:checked:radio").val() == "times")
		{
			AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_SET_DATA=RECORDING_TIME,"+$("#formARSecond:text").val()+"sec");
			AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_SET_DATA=RECORDING_SIZE,0");
		}
		else if($("input[name='formARPriRulSeg']:checked:radio").val() == "timem")
		{
			AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_SET_DATA=RECORDING_TIME,"+$("#formARMinute:text").val()+"min");
			AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_SET_DATA=RECORDING_SIZE,0");
		}

		AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_SET_DATA=SNAPSHOT_PATH,"+$("#formARSnapPath:text").val());
		AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_SET_DATA=SNAPSHOT_PREFIX,"+$("#formARSnapSet:text").val());
		AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_SET_DATA=RECORDING_PATH,"+$("#formARRecPath:text").val());
		AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_SET_DATA=RECORDING_PREFIX,"+$("#formARRecSet:text").val());

		if($("select#formARRecRes").val() == "audiovideo")
			AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_SET_DATA=RECORDING_INCLUDE_AUDIO,1");
		else
			AxUMF.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", nAVDecoderBlockH + ", VCA_AV_SET_DATA=RECORDING_INCLUDE_AUDIO,0");

		window.close();
	});
}
