var g_defaultGroup = "AVIREC" + "&" + "ENCODER" + "&" + "ADREC";
var streamCheck = 0; 
var streamCheck_adrec = 0;
var type = 500;

$(function () {
	PreCustomize();
	initEnvironment();
	LoadParamJs(g_defaultGroup, mainRun);
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum = ["0501", "04140239", "04140240", "04140241",
					"04140242", "04140243"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "configuration", 
				parent.g_langData[parent.g_configData.language]);
}

function mainRun()
{
	InitForm();
	InitSetting();
	SetRelation();
	EventBind();
	ContentShow();
	ResizePage(type);
	PostCustomize();
}

function InitSetting()
{
	// AVI Contents
	var group = "AVIREC";
	var group_adrec = "ADREC";
	var aviStreamSourceValue = eval(group + "_SOURCE");
	var adStreamSourceValue = eval(group_adrec + "_SOURCE");
	var aviEnableValue = eval(group + "_ENABLE");
	var adEnableValue = eval(group_adrec + "_ENABLE");

	if(aviEnableValue == "yes" && adEnableValue == "no")
	{
		$("input[name='formRecType'][value='avi']:radio").attr("checked", "checked");
		$(".avi_contents").css("display", "block");
		$(".dat_contents").css("display", "none");
		$(".no_contents").css("display", "none");
		type = 500;
	}
	else if(aviEnableValue == "no" && adEnableValue == "yes")
	{
		$("input[name='formRecType'][value='dat']:radio").attr("checked", "checked");
		$(".avi_contents").css("display", "none");
		$(".dat_contents").css("display", "block");
		$(".no_contents").css("display", "none");
		type = 300;
	}
	else if(aviEnableValue == "no" && adEnableValue == "no")
	{
		$("input[name='formRecType'][value='no']:radio").attr("checked", "checked");
		$(".avi_contents").css("display", "none");
		$(".dat_contents").css("display", "none");
		$(".no_contents").css("display", "block");
		type = 300;
	}
	else
	{
		$("input[name='formRecType'][value='avi']:radio").attr("checked", "checked");
		$(".avi_contents").css("display", "block");
		$(".dat_contents").css("display", "none");
		$(".no_contents").css("display", "none");
		type = 500;
	}

	switch(eval(group+"_STORAGE"))
	{
		case 'sd':
			$("#formARStorageSDCard:checkbox").attr("checked", "checked");
			$("#formARStorageUSBMemory:checkbox").attr("checked", "");
			break;
		case 'usb':
			$("#formARStorageUSBMemory:checkbox").attr("checked", "checked");
			$("#formARStorageSDCard:checkbox").attr("checked", "");
			break;
		case 'sd,usb':
			$("#formARStorageUSBMemory:checkbox").attr("checked", "checked");
			$("#formARStorageSDCard:checkbox").attr("checked", "checked");
			break;
		case 'usb,sd':
			$("#formARStorageUSBMemory:checkbox").attr("checked", "checked");
			$("#formARStorageSDCard:checkbox").attr("checked", "checked");
			break;
		default:
			$("#formARStorageUSBMemory:checkbox").attr("checked", "");
			$("#formARStorageSDCard:checkbox").attr("checked", "");
			break;
	}
	$("input[name='formARRecycling'][value='" + eval(group + "_RECYCLE") + "']:radio").attr("checked", "checked");
	$("#formARRecSet").val(eval(group+"_PREFIXNAME"));

	$("input[name='formARPriRulSeg'][value='" + eval(group + "_SEGTYPE") + "']:radio").attr("checked", "checked");
	$("#formARMegabyte:text").val(eval(group+"_SEGSIZE"));
	$("#formARMegabyte:text").parent().parent().find(".slider-bar").slider("value", Number(eval(group + "_SEGSIZE")));

	$("#formARMinute:text").val(eval(group+"_SEGTIME"));
	$("#formARMinute:text").parent().parent().find(".slider-bar").slider("value", Number(eval(group + "_SEGTIME")));

	$("select#formARRecRes").val(eval(group+"_RESOURCE"));

	// EncoderProfile Stream 에 따른 선택
	var firstSet = ENCODER_CH0_VIDEOCODEC_ST0_ENABLE;
	var secondSet = ENCODER_CH0_VIDEOCODEC_ST1_ENABLE;
	var firstCodec = ENCODER_CH0_VIDEOCODEC_ST0_STANDARD;
	var secondCodec = ENCODER_CH0_VIDEOCODEC_ST1_STANDARD;

	if(firstSet == "yes" && secondSet == "yes")
	{
		if(firstCodec == "mjpeg" && secondCodec == "mjpeg")
		{
			$("select#formARPriStream option[value='first']").remove();
			$("select#formARPriStream option[value='second']").remove();
			$("select#formARPriStream").append("<option>----------------------</option>");
			streamCheck = 1;
		}
		else if(firstCodec != "mjpeg" && secondCodec == "mjpeg")
		{
			$("select#formARPriStream option[value='second']").remove();
			$("select#formARPriStream").append("<option value='second'>-</option>");
			streamCheck = 0;
		}
		else if(firstCodec == "mjpeg" && secondCodec != "mjpeg")
		{
			$("select#formARPriStream option[value='first']").remove();
			$("select#formARPriStream option[value='second']").remove();
			$("select#formARPriStream").append("<option value='first'>-</option>");
			$("select#formARPriStream").append("<option value='second'>Second stream</option>");
			streamCheck = 0;
		}
	}
	else if(firstSet == "yes" && secondSet == "no")
	{
		if(firstCodec == "mjpeg")
		{
			$("select#formARPriStream option[value='first']").remove();
			$("select#formARPriStream option[value='second']").remove();
			$("select#formARPriStream").append("<option>----------------------</option>");
			streamCheck = 1;
		}
		else if(firstCodec != "mjpeg")
		{
			$("select#formARPriStream option[value='second']").remove();
			$("select#formARPriStream").append("<option value='second'>-</option>");
			streamCheck = 0;
		}
	}
	else if(firstSet == "no" && secondSet == "yes")
	{
		if(secondCodec == "mjpeg")
		{
			$("select#formARPriStream option[value='first']").remove();
			$("select#formARPriStream option[value='second']").remove();
			$("select#formARPriStream").append("<option>----------------------</option>");
			streamCheck = 1;
		}
		else if(secondCodec != "mjpeg")
		{
			$("select#formARPriStream option[value='first']").remove();
			$("select#formARPriStream option[value='second']").remove();
			$("select#formARPriStream").append("<option value='first'>-</option>");
			$("select#formARPriStream").append("<option value='second'>Second stream</option>");
			streamCheck = 0;
		}
	}
	else if(firstSet == "no" && secondSet == "no")
	{
		$("select#formARPriStream option[value='first']").remove();
		$("select#formARPriStream option[value='second']").remove();
		$("select#formARPriStream").append("<option>----------------------</option>");
		streamCheck = 1;
	}

	$("select#formARPriStream").val(aviStreamSourceValue);

	// ADREC Contents
	Disable($("#formADUseBuffer"));

	if("ftpbuffer" == eval(group_adrec+"_STORAGE"))
	{
		$("#formADStorageDevice").val("ftp");
	}
	else if("ftp" == eval(group_adrec+"_STORAGE"))
	{
		$("#formADStorageDevice").val("ftp");
	}
	else
	{
		$("#formADStorageDevice").val(eval(group_adrec+"_STORAGE"));
	}

	$("#formADDuration:text").val(eval(group_adrec+"_DURATION"));
	$("#formADDuration:text").parent().parent().find(".slider-bar").slider("value", Number(eval(group_adrec + "_DURATION")));

	var recResourceStr = eval(group_adrec+"_RESOURCE");
	var recResourceArray = recResourceStr.split(",");
	document.getElementById("recSrcCheckBoxVideo").checked = false;
	document.getElementById("recSrcCheckBoxAudeo").checked = false;
	document.getElementById("recSrcCheckBoxVcameta").checked = false;
	document.getElementById("recSrcCheckBoxMdmeta").checked = false;
	for (i = 0; i < recResourceArray.length; i++)
	{
		if(recResourceArray[i] == "video")
		{
			document.getElementById("recSrcCheckBoxVideo").checked = true;
		}
		else if(recResourceArray[i] == "audio")
		{
			document.getElementById("recSrcCheckBoxAudeo").checked = true;
		}
		else if(recResourceArray[i] == "vcameta")
		{
			document.getElementById("recSrcCheckBoxVcameta").checked = true;
		}
		else if(recResourceArray[i] == "mdmeta")
		{
			document.getElementById("recSrcCheckBoxMdmeta").checked = true;
		}
	}

	// EncoderProfile Stream 에 따른 선택
	var firstSet = ENCODER_CH0_VIDEOCODEC_ST0_ENABLE;
	var secondSet = ENCODER_CH0_VIDEOCODEC_ST1_ENABLE;
	var firstCodec = ENCODER_CH0_VIDEOCODEC_ST0_STANDARD;
	var secondCodec = ENCODER_CH0_VIDEOCODEC_ST1_STANDARD;

	if(firstSet == "yes" && secondSet == "yes")
	{
		if(firstCodec == "mjpeg" && secondCodec == "mjpeg")
		{
			$("select#formADPriStream option[value='first']").remove();
			$("select#formADPriStream option[value='second']").remove();
			$("select#formADPriStream").append("<option>----------------------</option>");
			streamCheck_adrec = 1;
		}
		else if(firstCodec != "mjpeg" && secondCodec == "mjpeg")
		{
			$("select#formADPriStream option[value='second']").remove();
			$("select#formADPriStream").append("<option value='second'>-</option>");
			streamCheck_adrec = 0;
		}
		else if(firstCodec == "mjpeg" && secondCodec != "mjpeg")
		{
			$("select#formADPriStream option[value='first']").remove();
			$("select#formADPriStream option[value='second']").remove();
			$("select#formADPriStream").append("<option value='first'>-</option>");
			$("select#formADPriStream").append("<option value='second'>Second stream</option>");
			streamCheck_adrec = 0;
		}
	}
	else if(firstSet == "yes" && secondSet == "no")
	{
		if(firstCodec == "mjpeg")
		{
			$("select#formADPriStream option[value='first']").remove();
			$("select#formADPriStream option[value='second']").remove();
			$("select#formADPriStream").append("<option>----------------------</option>");
			streamCheck_adrec = 1;
		}
		else if(firstCodec != "mjpeg")
		{
			$("select#formADPriStream option[value='second']").remove();
			$("select#formADPriStream").append("<option value='second'>-</option>");
			streamCheck_adrec = 0;
		}
	}
	else if(firstSet == "no" && secondSet == "yes")
	{
		if(secondCodec == "mjpeg")
		{
			$("select#formADPriStream option[value='first']").remove();
			$("select#formADPriStream option[value='second']").remove();
			$("select#formADPriStream").append("<option>----------------------</option>");
			streamCheck_adrec = 1;
		}
		else if(secondCodec != "mjpeg")
		{
			$("select#formADPriStream option[value='first']").remove();
			$("select#formADPriStream option[value='second']").remove();
			$("select#formADPriStream").append("<option value='first'>-</option>");
			$("select#formADPriStream").append("<option value='second'>Second stream</option>");
			streamCheck_adrec = 0;
		}
	}
	else if(firstSet == "no" && secondSet == "no")
	{
		$("select#formADPriStream option[value='first']").remove();
		$("select#formADPriStream option[value='second']").remove();
		$("select#formADPriStream").append("<option>----------------------</option>");
		streamCheck_adrec = 1;
	}

	$("select#formADPriStream").val(adStreamSourceValue);
}

function InitForm()
{
	// Slider-bar
	$(".slider-bar").each(function(index, element) {
		var $obj = $(this).parent().parent().find("input[type='text']");
		$(this).slider({
			range: 'min',
			slide: function(event, ui) {
				$obj.val(ui.value);
			}
		})
	});

	$("#formARMegabyte:text").parent().parent().find(".slider-bar").slider("option", "min", 100).slider("option", "max", 1440);
	$("#formARMinute:text").parent().parent().find(".slider-bar").slider("option", "min", 5).slider("option", "max", 20);
	$("#formADDuration:text").parent().parent().find(".slider-bar").slider("option", "min", 0).slider("option", "max", 60);

	if (parent.g_configData.langPath == "/language/Arabic.xml")
	{
		$(".slider-bar").slider({isRTL: true});
	}

	adjustContentsByBrand();
}

function SetRelation()
{
	var textValExist = "";
	// 글자수 제한
	$("#formARRecSet:text").keydown(function(){
		textValExist = $(this).val();
	}).keyup(function(){
		LimitCharac("formARRecSet:text", 16);

		var textVal = $(this).val();
		var inputValid= /[a-z]|[A-Z]|[0-9]/gi;

		textVal = textVal.replace(inputValid, '');

		if(textVal != "")
		{
			$("#formARRecSet:text").val(textValExist);
		}
	});

	var group = "AVIREC";

	// Number only
	$("#formARMegabyte:text").numeric();
	$("#formARMinute:text").numeric();
	$("#formARConfRecSec:text").numeric();

	// Text box 숫자범위
	$("#formARMegabyte:text").change(function() {
			var inputValTextMega = $("#formARMegabyte:text").val()-0;
			$("#formARMegabyte:text").val(inputValTextMega);
		if(inputValTextMega < 100 || inputValTextMega > 1440)
		{
			$("#formARMegabyte:text").val(eval(group+ "_SEGSIZE")).focus();
			$("div#formARSliderMega").slider("value", eval(group+ "_SEGSIZE"));
			alert(GetMsgLang("04140239"));
			return false;
		}
	});
	$("#formARMinute:text").change(function() {
			var inputValTextTime = $("#formARMinute:text").val()-0;
			$("#formARMinute:text").val(inputValTextTime);
		if(inputValTextTime < 5 || inputValTextTime > 20 || inputValTextTime == "")
		{
			$("#formARMinute:text").val(eval(group+ "_SEGTIME")).focus();
			$("div#formARSliderTime").slider("value", eval(group+ "_SEGTIME"));
			alert(GetMsgLang("04140239"));
			return false;
		}
	});
	$("#formARConfRecSec:text").change(function() {
			var inputValTextTime = $("#formARConfRecSec:text").val()-0;
			$("#formARConfRecSec:text").val(inputValTextTime);
		if(inputValTextTime < 10 || inputValTextTime >600)
		{
			$("#formARConfRecSec:text").val("60").focus();
			alert(GetMsgLang("04140239"));
			return false;
		}
	});

	// Text box, Slider-bar 동기화
	var changeSlideAutoMega = $("#formARSliderMega");
	var changeSlideAutoTime = $("#formARSliderTime");
	$("#formARMegabyte").keyup(function() {
			changeSlideAutoMega.slider("value", $("#formARMegabyte").val());
	});
	$("#formARMinute").keyup(function() {
			changeSlideAutoTime.slider("value", $("#formARMinute").val());
	});

	$("input[name='formARPriRulSeg']").unbind().change(function() {
		if($("input[name='formARPriRulSeg']:checked:radio").val() == "size")
		{
			Disable($("#formARMinute:text"));
			Disable($("#formARMinute:text").parent().parent().find(".slider-bar"));
			Enable($("#formARMegabyte:text"));
			Enable($("#formARMegabyte:text").parent().parent().find(".slider-bar"));
		}
		else if($("input[name='formARPriRulSeg']:checked:radio").val() == "time")
		{
			Disable($("#formARMegabyte:text"));
			Disable($("#formARMegabyte:text").parent().parent().find(".slider-bar"));
			Enable($("#formARMinute:text"));
			Enable($("#formARMinute:text").parent().parent().find(".slider-bar"));
		}
	});
	$("input[name='formARPriRulSeg']").change();

	var group_adrec = "ADREC";

	// Number only
	$("#formADDuration:text").numeric();

	// Text box 숫자범위
	$("#formADDuration:text").change(function() {
			var inputValTextDuration = $("#formADDuration:text").val();
			$("#formADDuration:text").val(inputValTextDuration);
		if(inputValTextDuration < 0 || inputValTextDuration > 60 || inputValTextDuration == "")
		{
			$("#formADDuration:text").val(eval(group_adrec+ "_DURATION")).focus();
			$("div#formADSliderDuration").slider("value", eval(group_adrec+ "_DURATION"));
			alert(GetMsgLang("04140239"));
			return false;
		}
	});

	// Text box, Slider-bar 동기화
	var changeSlideDuration = $("div#formADSliderDuration");
	$("#formADDuration").keyup(function() {
			changeSlideDuration.slider("value", $("#formADDuration").val());
	});

	$("input[name='formRecType']").unbind().change(function() {
		if($("input[name='formRecType']:checked:radio").val() == "avi")
		{
			$(".avi_contents").css("display", "block");
			$(".dat_contents").css("display", "none");
			$(".no_contents").css("display", "none");
			if(AVIREC_ENABLE == "yes")
			{
				$("#btnStart").button({ disabled: false });
				Enable($("#formARConfRecSec"));
			}
			else
			{
				$("#btnStart").button({ disabled: true });
				Disable($("#formARConfRecSec"));
			}
			ResizePage(500);
		}
		else if($("input[name='formRecType']:checked:radio").val() == "dat")
		{
			$(".avi_contents").css("display", "none");
			$(".dat_contents").css("display", "block");
			$(".no_contents").css("display", "none");
			$("#btnStart").button({ disabled: true });
			Disable($("#formARConfRecSec"));
			ResizePage(300);
		}
		else if($("input[name='formRecType']:checked:radio").val() == "no")
		{
			$(".avi_contents").css("display", "none");
			$(".dat_contents").css("display", "none");
			$(".no_contents").css("display", "block");
			$("#btnStart").button({ disabled: true });
			Disable($("#formARConfRecSec"));
			ResizePage(300);
		}
	});
	$("input[name='formRecType']").change();

	//Disable($("li.formConfSdUsbChk"));
}

function EventBind()
{
	var Req = new CGIRequest();
	var recReq = new CGIRequest();
	var adReq = new CGIRequest();
	var noReq = new CGIRequest();
	var revFileName = "";
	var revAction = "";
	var set_time = "";
	var clock = null;

	$("#btnStart").button().click(function() {
		$.getScript("/uapi-cgi/storage.cgi?action=get&mode=js&timekey=" + (new Date()).getTime(), function() {
			if (SDMountCheck(UAPI_STORAGE_NBROFSTORAGE) < 0)
			{
				return;
			}

			var reqQString = "action=start&xmlschema";
			var msgColor = "";
			revFileName = "";
			set_time = $('#formARConfRecSec:text').val();
			SetInstantRecCtrl("start");

			reqQString += "&" + "option=" + $("#formARConfRecSec:text").val();
			recReq.SetAddress("/uapi-cgi/instantrec.cgi");
			recReq.SetCallBackFunc(function(xml){
				if($('file', xml).size() > 0)
				{
					revFileName = $('file', xml).text();
					msgColor = "#52A34C";

					var reboot_time = eval(set_time) + 1;

					function write_time()
					{
						if (reboot_time <= 1) {
							clearInterval(clock);
							SetInstantRecCtrl("stop");
							$('#formARConfRecSec:text').val(set_time);
						}
						else
						{
							reboot_time -= 1;
							if (reboot_time > set_time)
							{
								$('#formARConfRecSec:text').val(set_time);
								return;
							}
							$('#formARConfRecSec:text').val(reboot_time);
						}
					}
					if (clock != null)
					{
						clearInterval(clock);
						clock = null;
					}
					clock = setInterval(function(){
						write_time();
					},1000);
				}
				else
				{
					revFileName = null;
					msgColor = "#E17009";
				}
				$("#testText").text("*" + revFileName).css("color", msgColor);
				if ($('ERROR', xml).size() > 0)
				{
					if ($('ERROR', xml).text().match(/Not exist record file/) == "Not exist record file")
					{
						alert(GetMsgLang("04140242"));
					}
				}
				return;
			});
			recReq.Request(reqQString);
		});
	});

	$("#btnStop").button().click(function() {
		var reqQString = "action=stop&xmlschema";
		if (clock != null)
		{
			clearInterval(clock);
			clock = null;
		}

		recReq.SetAddress("/uapi-cgi/instantrec.cgi");
		recReq.SetCallBackFunc(function(xml){
			if($('action', xml).size() > 0)
			{
				revAction = $('action', xml).text();
				SetInstantRecCtrl("stop");
				$('#formARConfRecSec:text').val(set_time);
			}
			else
			{
				revAction = null;
			}
			var ret = CGIResponseCheck(0, xml);
			if(ret != 0) {
				var errormessage = "";
				if(ret != -2) {
					errormessage = "\n" + ret;
				}
				alert(GetMsgLang("0501") + errormessage);
			}
			return;
		});
		recReq.Request(reqQString);
	});

	$("#btnDown").button().click(function() {
		var fullfilepath = (revFileName.length != 0) ? "/mnt/mmc/" + revFileName : "";
		var cgiurl = "/uapi-cgi/download.cgi?filename=" + fullfilepath;
		$.fileDownload(cgiurl + "&timekey=" + (new Date()).getTime(), {
			successCallback: function (url) {
			},
			failCallback: function (responseHtml, url) {
				if(responseHtml.indexOf("recording") != -1)
				{
					alert(GetMsgLang("04140240") + " \n" + GetMsgLang("04140241"))
				}
			}

		});

	});

	$("#btnApply").button().click(function() {
		$("#formARMegabyte:text").change();
		$("#formARConfRecSec:text").change();
		$("#formARConfRecSec:text").change();

		var reqQString = "action=update&xmlschema";
		var resultSdUsb = "";
		var aviEnableResult = "";
		var adEnableResult = "";

		if($("input[name='formRecType']:checked:radio").val() == "avi")
		{
			aviEnableResult = "yes";
			adEnableResult ="no";
		}
		else if($("input[name='formRecType']:checked:radio").val() == "dat")
		{
			aviEnableResult = "no";
			adEnableResult ="yes";
		}
		else if($("input[name='formRecType']:checked:radio").val() == "no")
		{
			aviEnableResult = "no";
			adEnableResult ="no";
		}

		for(var i=0;i<$("li.formConfSdUsbChk input[type='checkbox']").length;i++)
		{
			if($("li.formConfSdUsbChk input[type='checkbox']").eq(i).attr('checked') == true)
			{
				if(resultSdUsb == "")
				{
					resultSdUsb += $("li.formConfSdUsbChk input[type='checkbox']").eq(i).val();
				}
			}
		}

		if(resultSdUsb == "")
		{
			resultSdUsb = "none";
		}

		QString = makeQString();
		QString
			.set_action('update')
			.set_schema('xml')
			.add_list("AVIREC.storage", AVIREC_STORAGE, resultSdUsb)
			.add_list("AVIREC.enable", AVIREC_ENABLE, aviEnableResult)
			.add_list("ADREC.enable", ADREC_ENABLE, adEnableResult)
			//.add_list("AVIREC.enableautosense", AVIREC_ENABLEAUTOSENSE, ($("#formAREnAuto:checkbox").attr("checked") == true) ? "yes":"no")
			.add_list("AVIREC.recycle", AVIREC_RECYCLE, $("input[name='formARRecycling']:checked:radio").val())
			.add_list("AVIREC.prefixname", AVIREC_PREFIXNAME, $("#formARRecSet").val())
			.add_list("AVIREC.segtype", AVIREC_SEGTYPE, $("input[name='formARPriRulSeg']:checked:radio").val())
			.add_list("AVIREC.segsize", AVIREC_SEGSIZE, $("#formARMegabyte").val())
			.add_list("AVIREC.segtime", AVIREC_SEGTIME, $("#formARMinute").val())
			.add_list("AVIREC.resource", AVIREC_RESOURCE, $("select#formARRecRes").val());

		if(streamCheck == 0)
		{
			if($("select#formARPriStream option[value='" + $("select#formARPriStream").val() + "']").html() == "-") return;

			QString
				.set_action('update')
				.set_schema('xml')
				.add_list("AVIREC.source", AVIREC_SOURCE, $("select#formARPriStream").val());
		}

		reqQString = QString.get_qstring();
		if(!reqQString) {
			return;
		}
		Req.SetStartFunc(ViewLoadingSave);
		Req.SetCallBackFunc(function(xml){
			var ret = CGIResponseCheck(0, xml);
			if(ret != 0) {
				var errormessage = "";
				if(ret != -2) {
					errormessage = "\n" + ret;
				}
				alert(GetMsgLang("0501") + errormessage);
			}
			LoadParamJs(g_defaultGroup+"*", function() {
				ViewLoadingSave(false);
				InitSetting();
				SetRelation();
			});
			return;
		});
		Req.Request(reqQString);
	});

	$("#btnADApply").button().click(function() {
		var reqQString = "action=update&xmlschema";
		var storageDeviceValue = $("#formADStorageDevice").val();
		var aviEnableResult = "";
		var adEnableResult = "";

		if($("input[name='formRecType']:checked:radio").val() == "avi")
		{
			aviEnableResult = "yes";
			adEnableResult ="no";
		}
		else if($("input[name='formRecType']:checked:radio").val() == "dat")
		{
			aviEnableResult = "no";
			adEnableResult ="yes";
		}
		else if($("input[name='formRecType']:checked:radio").val() == "no")
		{
			aviEnableResult = "no";
			adEnableResult ="no";
		}

		if(storageDeviceValue == "ftp")
		{
			storageDeviceValue = "ftpbuffer";
		}


		var recResourceArray =[];
		if(document.getElementById("recSrcCheckBoxVideo").checked == true)
			recResourceArray.splice(recResourceArray.length, 0, "video");
		if(document.getElementById("recSrcCheckBoxAudeo").checked == true)
			recResourceArray.splice(recResourceArray.length, 0, "audio");
		if(document.getElementById("recSrcCheckBoxVcameta").checked == true)
			recResourceArray.splice(recResourceArray.length, 0, "vcameta");
		if(document.getElementById("recSrcCheckBoxMdmeta").checked == true)
			recResourceArray.splice(recResourceArray.length, 0, "mdmeta");

		QString = makeQString();
		QString
			.set_action('update')
			.set_schema('xml')
			.add_list("ADREC.storage", ADREC_STORAGE, storageDeviceValue)
			.add_list("AVIREC.enable", AVIREC_ENABLE, aviEnableResult)
			.add_list("ADREC.enable", ADREC_ENABLE, adEnableResult)
			.add_list("ADREC.duration", ADREC_DURATION, $("#formADDuration").val())
			.add_list("ADREC.resource", ADREC_RESOURCE, recResourceArray);

		if(streamCheck_adrec == 0)
		{
			if($("select#formADPriStream option[value='" + $("select#formADPriStream").val() + "']").html() == "-") return;
			
			QString
				.set_action('update')
				.set_schema('xml')
				.add_list("ADREC.source", ADREC_SOURCE, $("select#formADPriStream").val());
		}
		
		reqQString = QString.get_qstring();
		if(!reqQString) {
			return;
		}
		adReq.SetStartFunc(ViewLoadingSave);
		adReq.SetCallBackFunc(function(xml){
			var ret = CGIResponseCheck(0, xml);
			if(ret != 0) {
				var errormessage = "";
				if(ret != -2) {
					errormessage = "\n" + ret;
				}
				alert(GetMsgLang("0501") + errormessage);
			}
			LoadParamJs(g_defaultGroup +"*", function() {
				ViewLoadingSave(false);
				InitSetting();
				SetRelation();
			});
			return;
		});
		adReq.Request(reqQString);
	});
	
	$("#btnNoRecApply").button().click(function() {
		var reqQString = "action=update&xmlschema";
		var aviEnableResult = "";
		var adEnableResult = "";
		
		if($("input[name='formRecType']:checked:radio").val() == "avi")
		{
			aviEnableResult = "yes";
			adEnableResult ="no";
		}
		else if($("input[name='formRecType']:checked:radio").val() == "dat")
		{
			aviEnableResult = "no";
			adEnableResult ="yes";
		}
		else if($("input[name='formRecType']:checked:radio").val() == "no")
		{
			aviEnableResult = "no";
			adEnableResult ="no";
		}

		QString = makeQString();
		QString
			.set_action('update')
			.set_schema('xml')
			.add_list("AVIREC.enable", AVIREC_ENABLE, aviEnableResult)
			.add_list("ADREC.enable", ADREC_ENABLE, adEnableResult);
		
		reqQString = QString.get_qstring();
		if(!reqQString) {
			return;
		}
		noReq.SetStartFunc(ViewLoadingSave);
		noReq.SetCallBackFunc(function(xml){
			var ret = CGIResponseCheck(0, xml);
			if(ret != 0) {
				var errormessage = "";
				if(ret != -2) {
					errormessage = "\n" + ret;
				}
				alert(GetMsgLang("0501") + errormessage);
			}
			LoadParamJs(g_defaultGroup +"*", function() {
				ViewLoadingSave(false);
				InitSetting();
				SetRelation();
			});
			return;
		});
		noReq.Request(reqQString);
	});
}

function adjustContentsByBrand()
{
	if(g_brand.productID != "d001")
	{
		if(g_brand.audioInOut != "1/0" && g_brand.audioInOut != "1/1")
		{
			var audioVideoAR = $("#formARRecRes").children("[value='audiovideo']");
			if(audioVideoAR.size() > 0) audioVideoAR.remove();

			document.getElementById("recSrcCheckBoxAudeo").checked = false;
			document.getElementById("recSrcCheckBoxAudeo").disabled = true;
		}
	}
}

function SetInstantRecCtrl(state)
{
	if(state == "start")
	{
		$("#btnStart").css("display", "none");
		$("#btnStop").css("display", "inline");
		Disable($('#formARConfRecSec:text'));
		$("#btnDown").css("display", "none");
		$("#testText").text("");
	}
	else if(state = "stop")
	{
		$("#btnStart").css("display", "inline");
		$("#btnStop").css("display", "none");
		Enable($('#formARConfRecSec:text'));
		$("#btnDown").css("display", "inline");
	}
}

function SDMountCheck(count)
{
	var result = 0;

	if (count == 0)
	{
		result = -1;
	}
	else 
	{
		for (var i=0; i < UAPI_STORAGE_NBROFSTORAGE; i++)
		{
			if (eval("UAPI_STORAGE_S" + i + "_MOUNTED") != "yes")
			{
				result = -1;
			}
		}
	}

	if (result != 0)
	{
		alert(GetMsgLang("04140243"));
	}

	return result;
}
