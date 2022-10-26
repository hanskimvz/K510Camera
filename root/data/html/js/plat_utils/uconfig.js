var g_configData = {
	logoimage : "",
	logourl : "",
	logopos : "",
	topname : "",
	namepos : "",
	menupos : "",
	skin : "",
	langPath : "",
	language : "",
	textlink : ""
}
var g_langData = {};
var g_langFlag = "English";

$(function () {
	getConfig("/environment.xml", false, cb_configData);
	initLanguageConfig();
});

function getConfig(param, async, cbFunc)
{
	var req = new CGIRequest();
	req.SetAsyn(async);
	req.SetAddress(param);
	req.SetCallBackFunc(cbFunc);
	req.Request();
}

function initLanguageConfig()
{
	var langPath = "/uapi-cgi/language.cgi";
	if(location.pathname.split("/")[1] === "viewer")
		langPath = "/uapi-cgi/viewer/language.cgi";

	$.ajax({
		url: langPath + "?action=get&timekey=" + (new Date()).getTime(),
		dataType: "script",
		async: false,
		success: function(data) {
			if(0 >= List.langArray.length) return;
			for(var i=0;i<List.langArray.length;++i)
			{
				if(List.langArray[i].name.match("Ax*") == "Ax") continue;
				g_langFlag = List.langArray[i].name;
				getConfig(List.langArray[i].path, false, cb_langData);
			}
		}
	});
}

function cb_configData(xml)
{
	g_configData.logoimage = jqGetXmlData('logoimage', xml);
	g_configData.logourl = jqGetXmlData('logourl', xml);
	g_configData.logopos = jqGetXmlData('logopos', xml);
	g_configData.topname = jqGetXmlData('topname', xml, false);
	g_configData.namepos = jqGetXmlData('namepos', xml);
	g_configData.menupos = jqGetXmlData('menupos', xml);
	g_configData.skin = jqGetXmlData('skin', xml);
	g_configData.langPath = jqGetXmlData('lang', xml, false);
	g_configData.textlink = jqGetXmlData('textlink', xml);

	var langParse = g_configData.langPath;
	langParse = langParse.split("/");
	langParse = langParse[2].split(".");
	langParse = langParse[0];
	g_configData.language = langParse;
}

function cb_langData(xml)
{
	g_langData[g_langFlag] = xml;
}