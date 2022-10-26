var langName = new Array();
var langPath = new Array();

$(function () {
	PreCustomize();
	initEnvironment();
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);

	$.getScript("/uapi-cgi/language.cgi?action=get&timekey=" + (new Date()).getTime(), function() {
		Load();
		if(0 >= List.langArray.length) return;
		
		$("#languageChange").empty();
		$("#languageChange").append("<option value='English'>English</option>");

		for(var i=0;i<List.langArray.length;++i)
		{
			langName[i] = List.langArray[i].name;
			langPath[i] = List.langArray[i].path;
			
			if(langName[i].match("Ax*") == "Ax") continue;
			if(List.langArray[i].name == "English") continue;

			$("#languageChange").append("<option value='" + List.langArray[i].name + "'>" + List.langArray[i].name + "</option>");
			if(List.langArray[i].name == parent.g_configData.language)
			{
				$("#languageChange").val(List.langArray[i].name);
			}
		}
	});
}

function initLanguage()
{
	setLanguage(parent.g_configData.langPath, setup + maincontents + "language", 
				parent.g_langData[parent.g_configData.language]);
}

function Load()
{
	EventBind();
	$("button").button();
	ContentShow();
	PostCustomize();
}

function EventBind()
{
	$("#btnSet").click(function(){
		var setPath = "/language/English.xml";
		var langDepth = setup + maincontents + "language";
		var language = $("#languageChange").val();

		if(parent.g_configData.language == language) return;
		ViewLoadingSave(true);

		for(var i=0; i<List.langArray.length; ++i)
		{
			if(language == langName[i])
			{
				setPath = langPath[i];
				break;
			}
		}

		$.get("/uapi-cgi/oem.cgi?action=set&environment.lang=" + setPath + "&_=" + (new Date()).getTime(), function(data, textStatus) {
			if(textStatus == "success")
			{
				setCookie("languageRedirection", 1, 1);
				parent.location.replace(parent.location.href);
			}
			ViewLoadingSave(false); 
		});
	});
}