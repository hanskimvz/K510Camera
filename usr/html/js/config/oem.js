var DefaultGroup = "";
var revFullname = "";
var revShortname = "";
var revLogoPosition = "";
var revSkin = "";
var revLogoUrl = "";
var revTextUrl = "";
var revBrandname = "";

$(function () {
	PreCustomize();
	var classNum = ["04100120", "04100122", "04100123", "04100124"];
	InitMsgLang(classNum);

	var environmentReq = new CGIRequest();
	var environmentReqQString = "";
	var langDepth = setup + maincontents + "oem";
	environmentReq.SetAddress("/environment.xml");
	environmentReq.SetCallBackFunc(function(xml){
		var revLang = "/language/English.xml";
		if($('lang', xml).size() > 0)
		{
			revLang = $('lang', xml).text();
			getLangXml(revLang, langDepth);
			Run();
		}
	});
	environmentReq.Request(environmentReqQString);
});

function testPage()
{
	return true;
}

function Run()
{
	InitThemes();
	InitSetting();
	SetRelation();
	EventBind();
	setTimeout(ContentShow, 500);
	//ContentShow();
	PostCustomize();
}

function InitSetting()
{
	$("button#btnSet").button();
	$("button#btnDefaultset").button();
	$("button#btnDown").button();
	$("input[type='submit']").button();
	$("button#btnResetLogo").button();

	$("#titleNameEnter:text").keyup(function(){
		LimitCharac("titleNameEnter:text", 25);
	});
	$("#fullNameEnter:text").keyup(function(){
		LimitCharac("fullNameEnter:text", 60);
	});
	$("#shortNameEnter:text").keyup(function(){
		LimitCharac("shortNameEnter:text", 60);
	});

	var environmentReq = new CGIRequest();
	var brandReq = new CGIRequest();
	var subbrandReq = new CGIRequest();
	var environmentReqQString = "";
	var brandReqQString = "";
	var subbrandReqQString = "";

	environmentReq.SetAddress("/environment.xml");
	environmentReq.SetCallBackFunc(function(xml){
		if($('topname', xml).size() > 0)
		{
			revBrandname = $('topname', xml).text();

			if(revBrandname == "%fullname%")
			{
				$("#titlename select").val(revBrandname);
				Disable($("#titleNameEnter:text"));
				brandReq.SetAddress("/brand.xml");
				brandReq.SetCallBackFunc(function(xml){
					if($('fullname', xml).size() > 0)
					{
						revFullname = $('fullname', xml).text();
						$("#titleNameEnter:text").val(revFullname);
					}
					return;
				});
				brandReq.Request(brandReqQString);
			}
			else if(revBrandname == "%shortname%")
			{
				$("#titlename select").val(revBrandname);
				Disable($("#titleNameEnter:text"));
				brandReq.SetAddress("/brand.xml");
				brandReq.SetCallBackFunc(function(xml){
					if($('shortname', xml).size() > 0)
					{
						revShortname = $('shortname', xml).text();
						$("#titleNameEnter:text").val(revShortname);
					}
					return;
				});
				brandReq.Request(brandReqQString);
			}
			else
			{
				$("#titlename select").val("enter");
				$("#titleNameEnter:text").val(revBrandname);
				Enable($("#titleNameEnter:text"));
			}
		}
		if($('logourl', xml).size() > 0)
		{
			revLogoUrl = $('logourl', xml).text();

			if(revLogoUrl == "/viewer/main.html")
			{
				Disable($("#logolinkEnter:text"));
				$("#logolink select").val("live");
				$("#logolinkEnter:text").val("Live Page");
			}
			else
			{
				Enable($("#logolinkEnter:text"));
				$("#logolink select").val("enter");
				$("#logolinkEnter:text").val(revLogoUrl);
			}
		}

        if($('textlink', xml).size() > 0)
        {
            revTextUrl = $('textlink', xml).text();
            $("#textlinkEnter:text").val(revTextUrl);
        }

		if($('logopos', xml).size() > 0)
		{
			revLogoPosition = $('logopos', xml).text();
			$("#logoPosition select").val(revLogoPosition);
		}

		if($('skin', xml).size() > 0)
		{
			revSkin = $('skin', xml).text();
			$("#skinList select#formThemes").val(revSkin);
		}
		return;
	});
	environmentReq.Request(environmentReqQString);

	subbrandReq.SetAddress("/brand.xml");
	subbrandReq.SetCallBackFunc(function(xml){
		if($('shortname', xml).size() > 0)
		{
			revShortname = $('shortname', xml).text();
			$("#shortNameEnter:text").val(revShortname);
		}
		if($('fullname', xml).size() > 0)
		{
			revFullname = $('fullname', xml).text();
			$("#fullNameEnter:text").val(revFullname);
		}
		return;
	});
	subbrandReq.Request(subbrandReqQString);
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

function fileExtension_chk(btnId, fileChk, extChk)
{
	if(fileChk.toLowerCase() != extChk)
	{
		$("#" + btnId).css("display", "none");
		alert(GetMsgLang("04100120"));
		return;
	}
	else if(fileChk.toLowerCase() == extChk)
	{
		$("#" + btnId).css("display", "inline");
	}
}

function SetRelation()
{
	$("#titlename select").change(function(){
		if($(this).val() == "%fullname%")
		{
			Disable($("#titleNameEnter:text"));
			$("#titleNameEnter:text").val(revFullname);
		}
		else if($(this).val() == "%shortname%")
		{
			Disable($("#titleNameEnter:text"));
			$("#titleNameEnter:text").val(revShortname);
		}
		else
		{
			Enable($("#titleNameEnter:text"));
			$("#titleNameEnter:text").val("");
		}
	});

	$("#logolink select").change(function(){
		if($(this).val() != "enter")
		{
			Disable($("#logolinkEnter:text"));
			$("#logolinkEnter:text").val("Live Page");
		}
		else
		{
			Enable($("#logolinkEnter:text"));
			$("#logolinkEnter:text").val("http://");
		}
	});
	$("#titlename select").change();
	$("#logolink select").change();
	
	$("#oemPackage").change(function(){
		var fileData = $(this).val();
		var fileEx = "";
		$("#packageApply").css("display", "inline");
		$("#packageBtnStart").attr("value", GetMsgLang("04100124"));
		
		fileEx = fileExtension_rev(fileData);
		fileExtension_chk("packageBtnStart", fileEx, "bin");
	});
	$("#oemOEMDB").change(function(){
		var fileData = $(this).val();
		var fileEx = "";
		$("#OEMDBApply").css("display", "inline");
		$("#oemdbBtnStart").attr("value", GetMsgLang("04100124"));
		
		fileEx = fileExtension_rev(fileData);
		fileExtension_chk("oemdbBtnStart", fileEx, "bin");
	});
}

function reload()
{
	ViewLoadingSave(false);
	parent.location.reload();
}

function EventBind()
{
	var Req = new CGIRequest();
	$("button#btnSet").click(function() {
		var reqQString = "action=set";
		var titlename = "";
		var logourl = "";
        var texturl = "";

		if(encodeURIComponent($("#titlename select").val()) == "enter")
		{
			titlename = encodeURIComponent($("#titleNameEnter:text").val());
		}
		else
		{
			titlename = encodeURIComponent($("#titlename select").val());
		}

		if(encodeURIComponent($("#logolink select").val()) == "enter")
		{
			logourl = encodeURIComponent($("#logolinkEnter:text").val());
		}
		else
		{
			logourl = "/viewer/main.html";
		}

        texturl = encodeURIComponent($("#textlinkEnter:text").val());

		QString = makeQString();
		QString
			.set_action('set')
			.set_schema('xml')
			.add_list("environment.logopos", revLogoPosition, $("#logoPosition select").val())
			.add_list("environment.logourl", revLogoUrl, logourl)
			.add_list("environment.textlink", revTextUrl, texturl)
			.add_list("environment.topname", encodeURIComponent(revBrandname), titlename)
			.add_list("environment.skin", revSkin, $("#skinList select#formThemes").val())
			.add_list("brand.fullname", revFullname, $("#fullNameEnter:text").val())
			.add_list("brand.shortname", revShortname, $("#shortNameEnter:text").val());
		reqQString = QString.get_qstring();
		if(!reqQString) {
			return;
		}

		Req.SetAddress("/uapi-cgi/oem.cgi?");
		Req.SetStartFunc(ViewLoadingSave);
		setTimeout("reload()", 2000);
		Req.Request(reqQString);
	});
	$("button#btnDefaultset").click(function(){
		var reqQString = "action=set&enable=yes";

		Req.SetAddress("/uapi-cgi/oem.cgi?");
		Req.SetStartFunc(ViewLoadingSave);
		setTimeout("reload()", 2000);
		Req.Request(reqQString);
	});
	$("button#btnDown").click(function() {
		document.location.href = "/uapi-cgi/oem.cgi?action=get&package";
	});
	$("#formLogoSubmit").submit(function(){
		setTimeout("location.reload()", 2000);
	});
	$("#formPackageSubmit").submit(function(){
		//setTimeout("location.href='/config/reboot.html'", 5000);
		if(!$("#oemPackage").val())
		{
			return;
		}

		var timeString = GetMsgLang("04100123");
		$("ul#countZone li.item").append(GetMsgLang("04100122") + "..... <span id='time_cnt'>60 " + timeString + "</span>");
		$("#configZone").addClass("hidden_contents");
		$("#importZone").addClass("hidden_contents");
		$("#setBtn").addClass("hidden_contents");
		$("ul#countZone").css("display", "block");		
		
		var reboot_time = 63;
		var clock;
		function write_time()
		{
			if (reboot_time <= 1) {
				clearInterval(clock);
				window.parent.location.reload(true);
			}
			else
			{
				reboot_time -= 1;
				if (reboot_time > 60)
				{
					$('span#time_cnt').html('60 '+ timeString);
					return;
				}
				$('span#time_cnt').html(reboot_time + ' ' + timeString);
			}
		}
		clock = setInterval(function(){
			write_time();
		},1000);
	});
	$("#formOEMDBSubmit").submit(function(){
		if(!$("#oemOEMDB").val())
		{
			return;
		}

		var timeString = GetMsgLang("04100123");
		$("ul#countZone li.item").append(GetMsgLang("04100122") + "..... <span id='time_cnt'>" + g_defconfig.rebootWaitSeconds + " " + GetMsgLang("04100123") + "</span>");
		$("#configZone").addClass("hidden_contents");
		$("#importZone").addClass("hidden_contents");
		$("#setBtn").addClass("hidden_contents");
		$("ul#countZone").css("display", "block");		

		var runTime = g_defconfig.rebootWaitSeconds + 3;
	    var intervalID = setInterval(function(){
			write_time(runTime, g_defconfig.rebootWaitSeconds, intervalID);

			runTime--;
		},1000);
	});
	$("button#btnResetLogo").click(function(){
		var logoReq = new CGIRequest();
		//var logoReqQString = "action=set&logo.filename=default";
		var logoReqQString = "action=set&defaultlogo";

		logoReq.SetAddress("/uapi-cgi/oem.cgi");
		logoReq.SetStartFunc(ViewLoadingSave);
		setTimeout("reload()", 2000);
		logoReq.Request(logoReqQString);
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
        $('span#time_cnt').html(resultTime + ' ' + GetMsgLang("04100123"));
    }
}
