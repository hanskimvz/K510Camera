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
	var classNum = ["04070703", "04070704", "04070705", "04070706"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "reboot", 
				parent.g_langData[parent.g_configData.language]);
}

function mainRun()
{
	EventBind();
	setTimeout(ContentShow, 500);
	PostCustomize();
}

function EventBind()
{
	$("#btnReboot").button().click(function() {
		if (!confirm(GetMsgLang("04070703")))
		{
			return false;
		}

		if(parent.g_brand.pantilt == g_defbrand.irptz)
		{
			ViewLoadingSave(true);
			$.get("/nvc-cgi/ptz/ptz2.fcgi?aux=remote_reset&_=" + (new Date()).getTime(), function() {
				ViewLoadingSave(false);
				runReboot();
			});
		}
		else
		{
			runReboot();
		}

		return;
	});
}

function runReboot()
{
	var Req = new CGIRequest();
	
	Req.SetAddress("/nvc-cgi/admin/reboot.cgi");
	Req.Request();
	$("button").remove();

	var maxTime = 100;
	$("li.item").append(GetMsgLang("04070704") + "..... <span id='time_cnt'>" + maxTime + " " + GetMsgLang("04070705") + "</span>");
	$("li.item").append("<p>" + GetMsgLang("04070706"));

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
		isRebooted();
		clearInterval(fd);		
	}
	else
	{
		var resultTime = (run_time > max_time ? max_time : run_time);
		$('span#time_cnt').html(resultTime + ' ' + GetMsgLang("04070705"));
	}
}

function isRebooted()
{
	var url = CheckUrl('reboot.html');
	if (url == true)
	{
		console.log("Reboot complete");
		document.location.href='reboot.html';
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
