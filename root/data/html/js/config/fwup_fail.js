$(function () {
	PreCustomize();
	call_xmlData("/environment.xml", true, initEnvironment);
});

function initEnvironment(xml)
{
	initLanguage(xml);
	InitThemes();
	mainRun();
}

function initLanguage(xml)
{
	var classNum = ["04071203", "04071204", "04071205"];
	InitMsgLang(classNum);

	var envLanguage = jqGetXmlData('lang', xml, false);
	getLangXml(envLanguage, setup + maincontents + "fwupfail");
}

function mainRun()
{
	runReboot();
	setTimeout(ContentShow, 500);
	PostCustomize();
}

function runReboot()
{
	var maxTime = 90;

	$("li.item").append(GetMsgLang("04071203") + "..... <span id='time_cnt'>" + maxTime + " " + GetMsgLang("04071204") + "</span>");
	$("li.item").append("<p>" + GetMsgLang("04071205"));

	var runTime = maxTime + 3;
	var intervalID = setInterval(function(){
		write_time(runTime, maxTime, intervalID);

		runTime--;
	},1000);
}

function write_time(run_time, max_time, fd)
{
	if (run_time <= 1) 
	{
		clearInterval(fd);
		document.location.href='firmwareupgrade.html';
	}
	else
	{
		var resultTime = (run_time > max_time ? max_time : run_time);
		$('span#time_cnt').html(resultTime + ' ' + GetMsgLang("04071204"));
	}
}


