var g_isAutoFlip = false;
var g_isDigitalZoom = false;

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
	var classNum = ["04020160", "04020161", "0501"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "ptz", 
				parent.g_langData[parent.g_configData.language]);
}

function mainRun()
{
	$("button").button();
	InitSetting();
	EventBind();
	ContentShow();
	PostCustomize();
}

function InitSetting()
{
	if(parent.g_brand.mfzType == "no"){
		$(".digitalZoomContents").css("display", "none");
		$("#autoFlipEnable").attr("checked", "");
		g_isDigitalZoom = false;
	}
	else
		$("#digitalZoomContents").css("display", "block");
	changeAutoFlipConfig();
	changeDigitalZoomConfig();
}

function EventBind()
{
	$("#btnApply").click(function() {
		setPtzConfig();
	});
}

function changeAutoFlipConfig()
{
	$.get("/nvc-cgi/ptz/ptz2.fcgi?getautoflip" + "&_=" + (new Date()).getTime(), function(data) {
		g_isAutoFlip = (iniGetValue(data, "getautoflip") == "1");
		$("#autoFlipEnable").attr("checked", g_isAutoFlip == true ? "checked" : "");
	});
}

function changeDigitalZoomConfig()
{
	$.get("/nvc-cgi/ptz/ptz2.fcgi?getdzoom" + "&_=" + (new Date()).getTime(), function(data) {
		g_isDigitalZoom = (iniGetValue(data, "getdzoom") == "1");
		$("#digitalZoomEnable").attr("checked", g_isDigitalZoom == true ? "checked" : "");
	});
}

function setPtzConfig()
{
	var curAutoFlip = $("#autoFlipEnable:checkbox").attr("checked");
	var curDigitalZoom = $("#digitalZoomEnable:checkbox").attr("checked");
	if(g_isDigitalZoom == curDigitalZoom && g_isAutoFlip == curAutoFlip)
		return;

	var reqAutoFlip = "&setautoflip=" + (curAutoFlip ? 1:0);
	var reqDigitalZoom = "&setdzoom=" + (curDigitalZoom ? 1:0);

	ViewLoadingSave(true);
	$.get("/nvc-cgi/ptz/ptz2.fcgi?" + reqAutoFlip + reqDigitalZoom + "&_=" + (new Date()).getTime(), function() {
		changeAutoFlipConfig();
		changeDigitalZoomConfig();
		ViewLoadingSave(false);
	});
}
