var selectGroup = "";
var statusInterval = 4;
var clock = null;
var storageReqFlag = 1;
var bFirst = true;
var loadId = null;
var extformatStatus = 0;
var storageUSB = "";

$(function () {
	PreCustomize();
	initEnvironment();
	initBrand();
	initConfig();
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum = ["0501", "04140323", "04140324", "04140325",
					"04140326", "04140327", "04140328", "04140329"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "usbsdstorage", 
				parent.g_langData[parent.g_configData.language]);
}

function initBrand()
{
	if(parent.g_brand.usb == 0)
	{
		$(".usbsd_Contents").css("display", "none");
		$(".sd_Contents").css("display", "inline");
		$("li.sd_Contents").css("display", "block");
	}
	else
	{
		$(".usbsd_Contents").css("display", "inline");
		$("li.usbsd_Contents").css("display", "block");
		$(".sd_Contents").css("display", "none");
	}
}

function initConfig()
{
	if(storageReqFlag == 1)
	{
		storageReqFlag = 0;
		$.getScript("/uapi-cgi/storage.cgi?action=get&mode=js&timekey=" + (new Date()).getTime(), function() {
			LoadParamJs("AVIREC.Storage&ADREC.enable", mainRun);
			storageReqFlag = 1;
		});
	}
}

function mainRun()
{
	clearInterval(loadId);
	var Req = new CGIRequest();
	$("input[type='submit']").button();

	Req.SetAddress("/status/format.xml");
	Req.SetCallBackFunc(function (xml) {
		if($("format status", xml).size() > 0)
		{
			if($("format status", xml).text() != "idle")
			{
				Disable($("button"));
				ViewLoadingSave(true);
				getProgress();
				loadId = setInterval("getProgress()", 1000);
				$("#formatStatus_contents").css("display", "block");
			}
		}

		InitSetting();
		SetRelation();
		EventBind();
		ContentShow();
		ResizePage(350);
		PostCustomize();
		DisableSDButton();
	});

	Req.Request();
}

function InitSetting()
{
	$("select#formStorageList").empty();

	for(var i = 0; i < UAPI_STORAGE_NBROFSTORAGE; i++)
	{
		var group = "UAPI_STORAGE_S" + i;

		if (parent.g_configData.langPath == "/language/Arabic.xml") {
			$("select#formStorageList").append("<option value='" + i + "'>&lrm;</option>")
				.find("option:last").append(
					+ parseInt(eval(group + "_SIZE")/1024) + "MB"
					+ FillText(eval(group+"_DISK"), 14, "right")
			);
		}
		else {
			$("select#formStorageList").append("<option value='" + i + "'></option>")
				.find("option:last").append("&nbsp;"
					+ FillText(eval(group+"_DISK"), 14, "left")
					+ parseInt(eval(group + "_SIZE")/1024) + "MB"
			);
		}

		//if(eval(group+"_DEV") == AVIREC_STORAGE)
		if(eval("UAPI_STORAGE_S" + i + "_MOUNTED") == "yes")
		{
			$("select#formStorageList > option:eq(" + i + ")").attr("selected", "selected");
		}
		else
		{
			$("select#formStorageList > option:eq(0)").attr("selected", "selected");
		}		 
	}
}

function cbRecStatusData(status)
{
	if(status == null)
		return;

	var recadStatusValue = status.split("\n")[0].split("=")[1];
	if(recadStatusValue == "error")
		$("#txtStatus").css("color", "red");
}

function SetRelation()
{
	$("select#formStorageList").change(function() {
		$("#txtStatus").css("color", "black");
		var group = "UAPI_STORAGE_S" + $(this).val();
		selectGroup = group;
		
		if($(this).val() == null)
		{
			$("#txtDisk").text("-");
			$("#txtType").text("-");
			$("#txtSize").text("-");
			$("#txtFree").text("-");
			$("#txtStatus").text("-");
		}
		else
		{
			$("#txtDisk").text(eval(group + "_DISK"));
			$("#txtType").text(eval(group + "_FILESYSTEM"));
			$("#txtSize").text(parseInt(eval(group + "_SIZE")/1024) + "MB");

			$("#txtStatus").text((eval(group + "_MOUNTED") == "yes") ? "connected":"disconnected");
			if(ADREC_ENABLE == "yes")
				uQueryText("/run/recad_status", cbRecStatusData);
			
			if (eval(group + "_FREE") == "-")
			{
				$("#txtFree").text("-");
			}
			else
			{
				$("#txtFree").text(parseInt(eval(group + "_FREE")/1024) + "MB");
			}
		}
	});
	$("select#formStorageList").change();
}

function reGetList()
{
	if(storageReqFlag == 1)
	{
		storageReqFlag = 0;
		$.getScript("/uapi-cgi/storage.cgi?action=get&mode=js&timekey=" + (new Date()).getTime(), function() {
			LoadParamJs("AVIREC.Storage");
			InitSetting();
			SetRelation();
			$("select#formStorageList").change();
			ViewLoadingSave(false);
			Enable($("button"));
			DisableSDButton();
			storageReqFlag = 1;
			return;
		});
	}
	else if(storageReqFlag == 0)
	{
		ViewLoadingSave(false);
	}
}

function DisableSDButton()
{
	if(UAPI_STORAGE_NBROFSTORAGE == 0)
	{
		$("#btnFormatVfat").button({ disabled: true });
		$("#btnFormatExt3").button({ disabled: true });
		$("#btnMount").button({ disabled: true });
		$("#btnEject").button({ disabled: true });
	}
	else if(eval(selectGroup + "_MOUNTED") == "yes")
	{
		$("#btnMount").button({ disabled: true });
	}
	else if(eval(selectGroup + "_MOUNTED") == "no")
	{
		$("#btnEject").button({ disabled: true });
	}
}

function EventBind()
{
	var vfatReq = new CGIRequest();
	var removeInterval = 2000;

	$("#btnList").button().click(function() {
		Disable($("button"));
		ViewLoadingSave(true);
		reGetList();		
	});
	$("#btnList_sd").button().click(function() {
		Disable($("button"));
		ViewLoadingSave(true);
		reGetList();		
	});

	$("#btnFormatVfat").button().click(function() {
		if(UAPI_STORAGE_NBROFSTORAGE == 0) return;
		
		if(!confirm(GetMsgLang("04140329")))
		{
			return false;
		}

		Disable($("button"));
		ViewLoadingSave(true);

		$.getScript("/uapi-cgi/storage.cgi?action=format&dev=" + eval(selectGroup + "_DEV") +"&fs=vfat&mode=js&timekey=" + (new Date()).getTime(), 
			function(data, textStatus, jqxhr) {
				storageReqFlag = 1;

				if(textStatus != "success")
				{
					alert(GetMsgLang("0501"));
					ViewLoadingSave(false);
					
					return;
				}
				if(UAPI_STORAGE_RESULT == "OK")
				{
					reGetList();
					//window.location.reload();
					if(storageReqFlag == 0)
					{
						ViewLoadingSave(false);
						InitSetting();
					}
				}
				else
				{
					if (UAPI_STORAGE_MESSAGE == 'not found device')
					{
						alert(GetMsgLang("04140323"));
					}
					else if (UAPI_STORAGE_MESSAGE == 'can not make filesystem')
					{
						alert(GetMsgLang("04140324"));
					}
					else if (UAPI_STORAGE_MESSAGE == 'bad filesystem')
					{
						alert(GetMsgLang("04140325"));
					}
					else
					{
						alert(GetMsgLang("04140326"));
					}

					ViewLoadingSave(false);
				}
			return;
		});
	});

	$("#btnFormatExt3").button().click(function() {
		if(UAPI_STORAGE_NBROFSTORAGE == 0) return;

		if(!confirm(GetMsgLang("04140329")))
		{
			return false;
		}

		Disable($("button"));
		ViewLoadingSave(true);
		getProgress();
		loadId = setInterval("getProgress()", 1000);
		
		$.getScript("/uapi-cgi/storage.cgi?action=format&dev=" + eval(selectGroup + "_DEV") +"&fs=ext3&mode=js&timekey=" + (new Date()).getTime(), 
			function(data, textStatus, jqxhr) {
				storageReqFlag = 1;
				if(textStatus != "success")
				{
					alert(GetMsgLang("0501"));
					ViewLoadingSave(false);
					return;
				}

				if(data == undefined || data == "" || data.split("\n")[0].split("=")[1].split("'")[1] == "OK")
				{
					window.location.reload();
				}
				else
				{
					if (UAPI_STORAGE_MESSAGE == 'not found device')
					{
						alert(GetMsgLang("04140323"));
					}
					else if (UAPI_STORAGE_MESSAGE == 'can not make filesystem')
					{
						alert(GetMsgLang("04140324"));
					}
					else if (UAPI_STORAGE_MESSAGE == 'bad filesystem')
					{
						alert(GetMsgLang("04140325"));
					}
					else
					{
						alert(GetMsgLang("04140326"));
					}

					ViewLoadingSave(false);
				}
				return;
			});
		});
	
	$("#btnMount").button().click(function() {
		if(UAPI_STORAGE_NBROFSTORAGE == 0) return;
		Disable($("button"));
		ViewLoadingSave(true);
		
		$.getScript("/uapi-cgi/storage.cgi?action=mount&dev=" + eval(selectGroup + "_DEV") +"&mode=js&timekey=" + (new Date()).getTime(), 
			function(data, textStatus, jqxhr) {
				storageReqFlag = 1;

				if(textStatus != "success")
				{
					alert(GetMsgLang("0501"));
					ViewLoadingSave(false);
					return;
				}
				
				if(UAPI_STORAGE_RESULT == "OK")
				{
					reGetList();
					if(storageReqFlag == 0)
					{
						ViewLoadingSave(false);
						InitSetting();
					}
				}
				else
				{
					if(UAPI_STORAGE_MESSAGE == 'Already mmc was mounted')
					{
						alert(GetMsgLang("04140327"));
					}
					else if(UAPI_STORAGE_MESSAGE == 'Mounting MMC Fail')
					{
						alert(GetMsgLang("04140328"));
					}
					
					ViewLoadingSave(false);
				}
				return;
		});
	});
	
	$("#btnEject").button().click(function() {
		if(UAPI_STORAGE_NBROFSTORAGE == 0) return;
		if(eval(selectGroup + "_MOUNTED"))
		{
			if(eval(selectGroup + "_MOUNTED") == "no") return;
		}
		Disable($("button"));
		ViewLoadingSave(true);
		$.getScript("/uapi-cgi/storage.cgi?action=eject&dev=" + eval(selectGroup + "_DEV") +"&mode=js&timekey=" + (new Date()).getTime(), 
			function(data, textStatus, jqxhr) {
				storageReqFlag = 1;
				
				if(textStatus != "success")
				{
					alert(GetMsgLang("0501"));
					ViewLoadingSave(false);
					return;
				}
				
				if(UAPI_STORAGE_RESULT == "OK")
				{
					reGetList();
					if(storageReqFlag == 0)
					{
						ViewLoadingSave(false);
						InitSetting();
					}
				}
				else
				{
					if(UAPI_STORAGE_MESSAGE.match(/is not mounted/) == 'is not mounted')
					{
						alert(GetMsgLang("04140323"));
					}
					else
					{
						alert(GetMsgLang("04140326"));
					}

					ViewLoadingSave(false);
				}
				return;
		});
	});
}

function getProgress()
{
	var Req = new CGIRequest();

	Req.SetAddress("/status/format.xml");
	Req.SetCallBackFunc(showProgress);

	Req.Request();
}

function showProgress(xml)
{	
	if($("format status", xml).text() != "idle")
	{
		extformatStatus = 1;
	}
	
	if(Number($("progress", xml).text()) >= 0 && Number($("progress", xml).text()) <= 100)
	{
		$("#formatStatus_contents").css("display", "block");
		ResizePage();
		
		if(Number($("progress", xml).text()) == 100 && extformatStatus ==1)
		{
			$('#image-progress').progression({
				Current: 100,
				Maximum: 100,
				Animate: (bFirst==true)?false:true,
				aBackground: "#A9D7E9"
			});

			$("#message").empty();
			extformatStatus = 0;
			//window.location.reload();
			
			bFirst = true;
			return;
		}
		else if(($("error", xml).text() != "none"))
		{
			$('#image-progress').progression({
				Current: 100,
				Maximum: 100,
				Background: "#FF0000",
				Animate: false
			});
			$("#message").empty();

			bFirst = true;
			return;
		}
		$("#message").empty().append("<dl />");
		
		if(extformatStatus != 0)
		{
			$('#image-progress').progression({
				Current: $.trim($("progress", xml).text()),
				Maximum: 100,
				Animate: (bFirst==true)?false:true,
				aBackground: "#A9D7E9"
			});
		}
		if (bFirst == true) bFirst = false;
	}
}
