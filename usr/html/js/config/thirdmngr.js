var g_status_xml = "../status/status.xml";
var g_userfsinfo_xml = "../status/userfs_info.xml";
var g_package_xml = "../status/package.xml";
var g_fwupStatus_html = "../config/fwup_status.html";

$(function () {
	PreCustomize();	
	call_xmlData("/environment.xml", false, runEnvironment);
});

function runEnvironment(xml)
{	

	var classNum = ["04071108", "04071109", "04071110", "04071111", "04071112", "04071113", "04071114"];
	InitMsgLang(classNum);

	var envLanguage = jqGetXmlData('lang', xml, false);
	getLangXml(envLanguage, setup + maincontents + "thirdmngr");
	
	Run();
}

function Run()
{
	$("button").button();
	$("input[type='submit']").button();
	
	call_xmlData(g_status_xml, false, function(xml){
		var fwStatus = jqGetXmlData('state:first', xml);
		
		if(fwStatus == "firmware")
		{
			location.href = g_fwupStatus_html;
			return;
		}

		InitThemes();
		SetRelation();
		InitSetting();
		EventBind();
		ContentShow();
		firmwareCheck();
		
		PostCustomize();
	});	
}

function SetRelation()
{
	$("#Filedata").change(function(){
		var fileData = $(this).val();
		var fileEx = "";
		$("#btnStart").css("display", "inline");

		fileEx = fileExtension_rev(fileData);
		fileExtension_chk(fileEx);
	});

	$("form").submit(function(){
		Disable($("#btnStart"));
		ViewLoadingSave(true);

		$("#loading_msg").css({
			top: "30%",
			left: "50%"
		});
		return true;
	});
}

function InitSetting()
{
	call_xmlData(g_userfsinfo_xml, false, function(xml){
		var userfsRunStatus = jqGetXmlData('userfs status', xml);

		call_xmlData(g_package_xml, false, function(xml){
			var installStatus = jqGetXmlData('package install', xml);
			var nameStatus = jqGetXmlData('package name', xml, false);
			var subnameStatus = jqGetXmlData('package subname', xml, false);
			var support_stop = jqGetXmlData('package support stop', xml);
			var support_start = jqGetXmlData('package support start', xml);
			var support_restart = jqGetXmlData('package support restart', xml);
			var support_uninstall = jqGetXmlData('package support uninstall', xml);
			
			var versionStatus = jqGetXmlData('package version', xml);
			versionStatus = "Version " + versionStatus;
			
			var statusStr = subnameStatus + " " + versionStatus + " is ";
			
			$("#serverMessage").text(statusStr);
			$("#runStatus").text(userfsRunStatus);
			$("#pagename").text(nameStatus);
			
			jqDisplayCtrl("#btnServerStop, #btnServerRestart", userfsRunStatus == "running", "inline");
			jqDisplayCtrl("#btnServerStart", userfsRunStatus != "running", "inline");


			if(support_stop == "none")
				jqDisplayCtrl("#btnServerStop", false);	

			if(support_start == "none")
				jqDisplayCtrl("#btnServerStart", false);	

			if(support_restart == "none")
				jqDisplayCtrl("#btnServerRestart", false);	

			if(support_uninstall == "none")
				jqDisplayCtrl("#support_uninstall", false);	
			
			

			var isShowStopStartContents = (support_stop == "none" && support_start == "none" && support_restart == "none") ? false : true;
			jqDisplayCtrl(".stopStartContents", isShowStopStartContents);
			
			jqDisplayCtrl(".uninstallContents", support_uninstall != "none");
		});
	});
}

function EventBind()
{
	$("#btnServerStart").click(function(){
		ViewLoadingSave(true);
		$.get("/nvc-cgi/admin/thirdmngr.cgi?action=start&_=" + (new Date()).getTime(), function(data) {
			InitSetting();
			ViewLoadingSave(false);
	    });
	});

	$("#btnServerStop").click(function(){
		ViewLoadingSave(true);
		$.get("/nvc-cgi/admin/thirdmngr.cgi?action=stop&_=" + (new Date()).getTime(), function(data) {
			InitSetting();
			ViewLoadingSave(false);
	    });
	});

	$("#btnServerRestart").click(function(){
		ViewLoadingSave(true);
		$.get("/nvc-cgi/admin/thirdmngr.cgi?action=restart&_=" + (new Date()).getTime(), function(data) {
			InitSetting();
			ViewLoadingSave(false);
		});
	});

	$("#btnServerUninstall").click(function(){
		if (!confirm(GetMsgLang("04071110")))
			return false;
		
		$.get("/nvc-cgi/admin/thirdmngr.cgi?action=uninstall&_=" + (new Date()).getTime());
		$(".uninstallRemove").remove();

		var maxRebootSec = 85;
		var timeString = GetMsgLang("04071112");
		$("#uninstallContents").html(GetMsgLang("04071113") + ".....");
		
		var reboot_time = maxRebootSec + 3;
		var clock;
		function write_time()
		{
			if (reboot_time <= 1) {
				clearInterval(clock);
				parent.location.href=parent.location.href;
			}
			else
			{
				reboot_time -= 1;
				if (reboot_time > maxRebootSec)
				{
					$('span#time_cnt').html(maxRebootSec + ' ' + timeString);
					return;
				}
				$('span#time_cnt').html(reboot_time + ' ' + timeString);
			}
		}
		clock = setInterval(function(){
			write_time();
			if(reboot_time == maxRebootSec){
				$("#uninstallContents").html(GetMsgLang("04071111") + "..... <span id='time_cnt'>" + maxRebootSec + " " + timeString + "</span>");
				$("#uninstallContents").append("<p>" + GetMsgLang("04071114"));
			}
		},1000);
	});
}

function firmwareCheck()
{
	call_xmlData(g_status_xml, false, function(xml){
		var fwStatus = jqGetXmlData('state:first', xml);
		
		if(fwStatus == "firmware")
		{
			location.href = g_fwupStatus_html;
			return;
		}
		
		setTimeout("firmwareCheck()", 3000);
	});
}

function fileExtension_rev(fileValue)
{
	var lastIndex = -1;
	var extension = "";

	lastIndex  = fileValue.lastIndexOf('.');

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
		alert(GetMsgLang("04071108"));
		return;
	}
	else if(fileChk.toLowerCase() == "enc")
	{
		$("#btnStart").css("display", "inline");
		$("#btnStart").attr("value", GetMsgLang("04071109"));
	}
}



