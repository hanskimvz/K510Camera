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
	setLanguage(parent.g_configData.langPath, setup + maincontents + "license", 
				parent.g_langData[parent.g_configData.language]);
}

function mainRun()
{
	EventBind();
	ContentShow();
	PostCustomize();
}

function EventBind()
{
	$("#viewLicense").button().toggle(
		function(){
			$(".formLicenseTextArea pre").css("display", "block");
			ResizePage();
		},
		function(){
			$(".formLicenseTextArea pre").css("display", "none");
			ResizePage();
		}
	);
}