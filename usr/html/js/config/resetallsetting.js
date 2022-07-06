$(function () {
	PreCustomize();
	initEnvironment();
	mainRun();
	PostCustomize();
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum = ["04070607", "04070608", "04070609", "04070610", "04070611"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "resetallsetting", 
				parent.g_langData[parent.g_configData.language]);
}

function mainRun()
{
	$("#btnFactory").button().click(function() {
		if (!confirm(GetMsgLang("04070607")))
		{
			return false;
		}

		if(parent.g_brand.pantilt == g_defbrand.irptz)
		{
			ViewLoadingSave(true);
			$.get("/nvc-cgi/ptz/ptz2.fcgi?aux=reset_camera_to_defaults&_=" + (new Date()).getTime(), function() {
				ViewLoadingSave(false);
				runReset();
			});
		}
		else
		{
			runReset();
		}
	});
	setTimeout(ContentShow, 500);
}

function runReset()
{
	var Req = new CGIRequest();
	var preserveOption = preserveOptionCheck();
	Req.SetAddress("/nvc-cgi/admin/factory.cgi?" + preserveOption);
	Req.SetStartFunc();
	Req.Request();
	
	$("button").remove();
	$("#exContents").remove();

	$("li.item").html(GetMsgLang("04070609") + "..... <span id='time_cnt'>" + g_defconfig.rebootWaitSeconds + " " + GetMsgLang("04070610") + "</span>");
	$("li.item").append("<p>" + GetMsgLang("04070611"));

	var runTime = g_defconfig.rebootWaitSeconds + 3;
	var intervalID = setInterval(function(){
		write_time(runTime, g_defconfig.rebootWaitSeconds, intervalID);
		runTime--;
	},1000);
}

function write_time(run_time, max_time, fd)
{
	if (run_time <= 1) 
	{
		isRebooted();
		clearInterval(fd);
	}
	else
	{
		var resultTime = (run_time > max_time ? max_time : run_time);
		$('span#time_cnt').html(resultTime + ' ' + GetMsgLang("04070610"));
	}
}

function preserveOptionCheck()
{
	var preserveString = "";
	var network = $("#networkInfo").attr("checked");
	var user = $("#userInfo").attr("checked");
	var timezone = $("#timezoneInfo").attr("checked");

	if (network == true || user == true || timezone == true)
	{
		preserveString = "preserve=";

		if (network == true)
			preserveString += firstStringCheck(preserveString, "network");

		if (user == true)
			preserveString += firstStringCheck(preserveString, "user");

		if (timezone == true)
			preserveString += firstStringCheck(preserveString, "timezone");
	}

	return preserveString;
}

function firstStringCheck(nowString, inputString)
{
	if (nowString == "preserve=")
		return inputString;
	else
		return "," + inputString;
}

function isRebooted()
{
	var url = CheckUrl('resetallsetting.html');
	if (url == true)
	{
		console.log("Reboot complete");
		document.location.href='resetallsetting.html';
		//Re-load the config:
		if(window.CAP !== undefined)
			window.CAP.reLoadConfig();
	}
	return;
}
 
function CheckUrl(url)
{
    if (window.XMLHttpRequest)
    {// code for IE7+, Firefox, Chrome, Opera, Safari
    	var http = new XMLHttpRequest();
    }
    else
    {// code for IE6, IE5
   		var http = new ActiveXObject("Microsoft.XMLHTTP");
    }
    http.open('HEAD', url, false);
    http.send();
    return http.status!=404;  
}
