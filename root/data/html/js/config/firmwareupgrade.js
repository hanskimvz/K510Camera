var loadId;

$(function () {
	PreCustomize();
	initEnvironment();
	mainRun();
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum = ["04070406", "04070407", "04070409"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "firmwareupgrade", 
				parent.g_langData[parent.g_configData.language]);
}

function mainRun()
{
	var Req = new CGIRequest();
	$("input[type='submit']").button();
	
	Req.SetAddress("/status/resource-state.xml");
	Req.SetCallBackFunc(function (xml) {
		var rev_MemFree = 0;
		var MemoryPart = $("resource[name='memory']", xml);
		rev_MemFree = Number($("item[name='free']", MemoryPart).text());
		if(rev_MemFree == "")
		{
			rev_MemFree = "- ";
			alert(GetMsgLang("04070409"));
			Disable($("#Filedata"));
		}
		else
		{
			if(rev_MemFree < 32000)
			{
				$("#noteMsgLi").css("display", "block");
				Disable($("#Filedata"));
			}
		}
	});
	Req.Request();

	Req = new CGIRequest();
	Req.SetAddress("/status/status.xml");
	Req.SetCallBackFunc(function (xml) {
		if($("state:first", xml).text() == "error_fwup")
		{
			location.href="/config/fwup_fail.html";
			return;
		}

		if($("state:first", xml).text() == "firmware")
		{
			location.href="/config/fwup_status.html";
			return;
		}

		initFirmwareVersion();
		SetRelation();
		ContentShow();
		firmwareCheck();
		PostCustomize();
	});

	Req.Request();
}

function firmwareCheck()
{
	var Req = new CGIRequest();

	Req.SetAddress("/status/status.xml");
	Req.SetCallBackFunc(function (xml) {
		if($("state:first", xml).text() == "error_fwup")
		{
			location.href="/config/fwup_fail.html";
			return;
		}

		if($("state:first", xml).text() == "firmware")
		{
			location.href="/config/fwup_status.html";
			return;
		}
		setTimeout("firmwareCheck()", 2000);
	});

	Req.Request();
}

function fileExtension_rev(fileValue)
{
	var lastIndex = -1;
	var extension = "";

	lastIndex	= fileValue.lastIndexOf('.');

	if(lastIndex != -1)
	{
		extension = fileValue.substring( lastIndex+1, fileValue.len );
	}
	else
	{
		extension = "";
	}

	return extension;
}

function fileExtension_chk(fileChk)
{
	if(fileChk.toLowerCase() != "enc")
	{
		$("#btnStart").css("display", "none");
		alert(GetMsgLang("04070406"));
		return;
	}
	else if(fileChk.toLowerCase() == "enc")
	{
		$("#btnStart").css("display", "inline");
	$("#btnStart").attr("value",GetMsgLang("04070407"));
	}
}

function SetRelation()
{
	$("#btnStart").css("display", "none");

	$("#Filedata").change(function(){
		var fileData = $(this).val();
		var fileEx = "";
		$("#btnStart").css("display", "inline");

		fileEx = fileExtension_rev(fileData);
		fileExtension_chk(fileEx);
	});

	$("form").submit(function(){
		$.ajax({timeout: 500000});
		Disable($("#btnStart"));
		ViewLoadingSave(true);
		$("#loading_msg").css({
			top: "30%",
			left: "50%"
		});
		return true;
	});
}

function initFirmwareVersion()
{
	var verDesc = "";
	if("" != parent.g_brand.versiondesc)
		verDesc = "(" + parent.g_brand.versiondesc + ")";

	$("#firmwareVerVal").append(parent.g_brand.firmware + verDesc);
}
