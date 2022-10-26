var loadId;
var bFirst = true;
var percent = 0;

$(function ()
{
	getProgress();
	loadId = setInterval("getProgress()", 1000);
	ContentShow();
});

function getProgress()
{
	var Req = new CGIRequest();

	Req.SetAddress("/status/firmware.xml");
	Req.SetCallBackFunc(showProgress);

	Req.Request();
}

function showProgress(xml)
{
	var resObj = $('firmware', xml);
	if(resObj.size() <= 0) {
		return;
	}

	$("#firmware-info").text($.trim($("message", resObj).text()));

	if($("state:first", xml).text() == "complete")
	{
		$('#image-progress').progression({
			Current: 100,
			Maximum: 100,
			Animate: (bFirst==true)?false:true,
			aBackground: "#A9D7E9"
		});

		$("#message").empty();
		$("#firmware-info").text("Complete");

		parent.document.location.reload(true);
		
		//clearInterval(loadId);
		bFirst = true;
		return;
	}
	else if(($("state:first", xml).text() == "error"))
	{
		$('#image-progress').progression({
			Current: 100,
			Maximum: 100,
			Background: "#FF0000",
			Animate: false
		});
		$("#message").empty();
		//clearInterval(loadId);
		bFirst = true;
		return;
	}
	$("#message").empty().append("<dl />");
	$("#message dl").append("<dt />").children(":last")
		.text("Start: " + $.trim($("start_time", resObj).text()));
	$("#message dl").append("<dt />").children(":last")
		.text("Firmware version: " + $.trim($("version:first", resObj).text()));
//	$("#message dl").append("<dt />").children(":last").css("height", "20px")
//		.text("Firmware revision: " + $.trim($("revision:first", resObj).text()));

	$("#message dl").append("<dt />").children(":last")
		.text("[Images]");
	$("images", xml).children().each(function(index, element)
	{
		if($("exist", this).text() == "yes")
		{
			var subPercent = "";
			var nodeName = $.trim(this.nodeName);

			if($("percent", xml).size() > 0)
			{
				if(nodeName == "convex" || nodeName == "en773a" || nodeName == "wonwoo" || nodeName == "dome")
				{
					if($("percent", this).size() > 0)
					{
						subPercent = " (" + $("percent", this).text() + "%)";
					}
				}
			}
			
			$("#message dl").append("<dt />").children(":last").text(nodeName + ": " + $("version", this).text() + subPercent);
			if($("state:first", xml).text() == nodeName)
			{
				$("#message dl").find("dt:last").css("color", "blue");
			}
		}
	});	

	if($.trim($("percent", xml).text()) != "")
	{
		percent = $.trim($("percent", xml).text());
	}

	$('#image-progress').progression({
		Current: percent,
		Maximum: 100,
		Animate: (bFirst==true)?false:true,
		aBackground: "#A9D7E9"
	});

//	if (percent == 100)
//	{
//		clearInterval(loadId);
//	}

	if (bFirst == true) bFirst = false;
}

function testPage()
{
	return true;
}
