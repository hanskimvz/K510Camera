var g_defaultGroup = "";

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
	var classNum = ["04070807", "04070809", "04070810"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "confimportexport", 
				parent.g_langData[parent.g_configData.language]);
}

function mainRun()
{
	SetRelation();
	EventBind();
	$("button").button();
	$("#btnRestoreStart").button();
	ContentShow();
	PostCustomize();
}

function SetRelation()
{
	$("#fileImport").change(function(){
		var fileData = $(this).val();
		var fileEx = "";
		$("#importApply").css("display", "inline");
		
		fileEx = fileExtension_rev(fileData);
	});
}

function EventBind()
{
	var Req = new CGIRequest();

// Export
	$("button#btnBackupStart").click(function() {
		document.location.href = "/uapi-cgi/impexp.cgi?action=get";
	});
	
// Import
	$("#formImportSubmit").submit(function(){
		if(!$("#fileImport").val())
		{
			return;
		}
		
		var timeString = GetMsgLang("04070807");
		$("ul#countZone li.item").append(GetMsgLang("04070809") + "..... <span id='time_cnt'>" + g_defconfig.rebootWaitSeconds + " " + GetMsgLang("04070807") + "</span>");
		$("ul#countZone li.item").append("<p>" + GetMsgLang("04070810"));
		$(".exportZone").addClass("hidden_contents");
		$(".importZone").addClass("hidden_contents");
		$("ul#countZone").css("display", "block");

		var runTime = g_defconfig.rebootWaitSeconds + 3;
			var intervalID = setInterval(function(){
			write_time(runTime, g_defconfig.rebootWaitSeconds, intervalID);

			runTime--;
		},1000);
	});
}

function write_time(run_time, max_time, fd)
{
	if (run_time <= 1) 
	{
		clearInterval(fd);
		window.parent.location.reload(true);

		//Re-load the config:
		if(window.CAP !== undefined)
				window.CAP.reLoadConfig();
	}
	else
	{
		var resultTime = (run_time > max_time ? max_time : run_time);
		$('span#time_cnt').html(resultTime + ' ' + GetMsgLang("04070807"));
	}
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
