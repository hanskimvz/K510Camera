var langOption = "English";
var language_url = "/uapi-cgi/language.cgi";

$(function () {
	if(location.pathname.split("/")[1] === "viewer") {
		if(language_url) {
			language_url = "/uapi-cgi/viewer/language.cgi";
		}
	}
	
	$.getScript(language_url + "?action=get&timekey=" + (new Date()).getTime(), function() {
		if(0 >= List.langArray.length)
		{
			return 0;
		}
		
		$("#languageChange").empty();
		for(var i=0;i<List.langArray.length;++i)
		{
			$("#languageChange").append("<option value='" + List.langArray[i].name + "'>" + List.langArray[i].name + "</option>");
			$("#languageChange").val(langOption);
		}
	});

	$("img#logo").hide();
	var clock = null;
	var minWidth = 140;
	var minHeight = 50;

	$("img#logo").attr("src", ".." + g_configData.logoimage  + "?_=" + (new Date()).getTime()).ready(function() {
		$("img#logo").show();
	});

	function resizeImage()
	{
		if($("img").width() != 0)
		{
			var width = $("img#logo").width();
			var height = $("img#logo").height();

			if(width > minWidth)
			{
				clearInterval(clock);

				$("div#top").height(height+10);
				$("div#logomenu").width(width);
				$("div#logomenu").height(height);
				$("img#logo").width(width);
				$("img#logo").height(height);
				$("img#logo").show();
			}
			else if(height > minHeight)
			{
				clearInterval(clock);

				$("div#top").height(height+10);
				$("img#logo").show();
			}
		}
	}
	if (clock != null)
	{
		clearInterval(clock);
		clock = null;
	}
	clock = setInterval(function(){
		resizeImage();
	},100);

	$("#textlinkURL").text(g_configData.textlink);

	if(g_configData.textlink.split("://")[0] == "http" || g_configData.textlink.split("://")[0] == "https")
		$("#textlinkURL").attr("href",g_configData.textlink);
	else
		$("#textlinkURL").attr("href","http://" + g_configData.textlink);

	$("#textlinkURL").attr("target", "_blank");

	if(g_configData.topname == "%fullname%")
	{
		$("div#brandname").text(g_brand.fullname);
	}
	else if(g_configData.topname == "%shortname%")
	{
		$("div#brandname").text(g_brand.shortname);
	}
	else
	{
		$("div#brandname").text(g_configData.topname);
	}

	if (g_configData.langPath == "/language/Arabic.xml")
	{
		g_configData.logopos = (g_configData.logopos == "left") ? "right" : "left";
	}

	if(g_configData.logopos == "left")
	{
		parent.$("div#logomenu").css("float", "left");
		parent.$("div#topmenu").css("float", "right");
	}
	else if(g_configData.logopos == "right")
	{
		parent.$("div#logomenu").css("float", "right");
		parent.$("div#topmenu").css("float", "left");
	}

	if(g_configData.logourl == "/viewer/main.html")
	{
		$("#logo").parent().attr("href", ".." + g_configData.logourl);
		$("#logo.mainLogoLink").parent().attr("href", g_configData.logourl);
	}
	else
	{
		if(g_configData.logourl == "/main.html")
			g_configData.logourl = "/viewer/main.html";
		else
			$("#logo").parent().attr("target", "_blank");

		$("#logo").parent().attr("href", g_configData.logourl);
		
	}

	ChangeThemes(g_configData.skin);
	CallBackCustomize();
});