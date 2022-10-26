var chk = 0;
var g_resChk = 0;
var g_selectIndex = 0;

$(function () {
	PreCustomize();
	initEnvironment();
	initBrand();
	LoadParamJs("VIDEOIN.Ch0.Rotate.direction", mainRun);
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum = ["04020916", "04020917", "04020918", "04020919", "04020920",
					"04020921", "04020923", "04020924", "0501"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "privacymask3d", 
				parent.g_langData[parent.g_configData.language]);
}

function mainRun()
{
	InitForm();
	ContentShow();
	InitSetting();
	EventBind();
	initResize();
	PostCustomize();
}

function initResize()
{
	if(VIDEOIN_CH0_ROTATE_DIRECTION != "none")
	{
		var controlMenu = $(".controlMenu").height();
		var viewFrame = $("#viewFrame").width();

		ResizePage(controlMenu + viewFrame);
		$("#viewFrame").height(viewFrame);
	}
}

function InitForm()
{
	$("button").button();
	
	//ptz panel UI
	$("#ptz_panel dd").each(function(index, element) {
		ptzImageName = "../images/"+$(this).attr("id")+".gif";
		$(this).css("background", "url('" + ptzImageName + "')	no-repeat center");
	});

	 // ptz speedbar
	$("#ptz_speedbar #slider_speedbar").each(function(index, element) {
		var $obj = $(this).parent().parent().find("input[type='text']");
		$(this).slider({
			range: "min",
			min: 1,
			max: 100,
			value: 20,
			slide: function(event, ui) {
				$obj.val(ui.value);
			}
		})
	});

	$("#text_speedbar").val(20);

	// speed range
	$("#text_speedbar:text").blur(function(){
		var inputValSpeed = $("#text_speedbar:text").val();
		if(inputValSpeed < 1 || inputValSpeed > 100 || inputValSpeed == "")
		{
			$("#text_speedbar:text").val(1).focus();
			$("#slider_speedbar").slider("value", 1);
			alert(GetMsgLang("04020916"));
		}
	});
	// speed Text box, Slider-bar 동기화
	$("#text_speedbar:text").keyup(function() {
			$("#slider_speedbar").slider("value", $("#text_speedbar:text").val());
	});
	$("#preset_number").val(1);
}

function InitSetting()
{
	$("#zoneList").val(0);
	$("#zoneEnableState").attr("checked", "");
}

function initBrand()
{
	var pathPageNameAll = "inline";
	var pathPageNameVideo = "none";

	if(parent.g_brand.productID != "d001" &&
		parent.g_brand.audioInOut == "0/0")
	{
		pathPageNameAll = "none";
		pathPageNameVideo = "inline";
	}

	$("#parentpagename").css("display", pathPageNameAll);
	$("#parentpagename_video").css("display", pathPageNameVideo);
}

function EventBind()
{
	var opStrPtzStop = "cpantiltzoommove=0,0,0";
	var opStrFocusStop = "cfocusmove=0";
	$("input[type='button']").attr("disabled", "");
	
	$("#loading_msg").css({
		top: "100px",
		left: "50%"
	});

	/* PTZ */
	// Left up
	$("#pt_lu").mousedown(function(){
		var opStr = "cpantiltzoommove=" + "-" + $("#text_speedbar").val() + "," + $("#text_speedbar").val() + ",0";
		if(g_resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		g_resChk = 1;
	}).mouseup(function(){
		actionStop(opStrPtzStop);
	}).mouseout(function(){
		actionStop(opStrPtzStop);
	});
	// Center up
	$("#pt_cu").mousedown(function(){
		var opStr = "cpantiltzoommove=" + "0," + $("#text_speedbar").val() + ",0";
		if(g_resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		g_resChk = 1;
	}).mouseup(function(){
		actionStop(opStrPtzStop);
	}).mouseout(function(){
		actionStop(opStrPtzStop);
	});
	// Right up
	$("#pt_ru").mousedown(function(){
		var opStr = "cpantiltzoommove=" + $("#text_speedbar").val() + "," + $("#text_speedbar").val() + ",0";
		if(g_resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		g_resChk = 1;
	}).mouseup(function(){
		actionStop(opStrPtzStop);
	}).mouseout(function(){
		actionStop(opStrPtzStop);
	});
	// Left middle
	$("#pt_lm").mousedown(function(){
		var opStr = "cpantiltzoommove=" + "-" + $("#text_speedbar").val() + ",0,0";
		if(g_resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		g_resChk = 1;
	}).mouseup(function(){
		actionStop(opStrPtzStop);
	}).mouseout(function(){
		actionStop(opStrPtzStop);
	});
	// Center middle - Stop
	$("#pt_cm").mousedown(function(){
		chk = 1;
		actionStop(opStrPtzStop);
	});
	// Right middle
	$("#pt_rm").mousedown(function(){
		var opStr = "cpantiltzoommove=" + $("#text_speedbar").val() + ",0,0";
		if(g_resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		g_resChk = 1;
	}).mouseup(function(){
		actionStop(opStrPtzStop);
	}).mouseout(function(){
		actionStop(opStrPtzStop);
	});
	// Left down
	$("#pt_ld").mousedown(function(){
		var opStr = "cpantiltzoommove=" + "-" + $("#text_speedbar").val() + "," + "-" + $("#text_speedbar").val() + ",0";
		if(g_resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		g_resChk = 1;
	}).mouseup(function(){
		actionStop(opStrPtzStop);
	}).mouseout(function(){
		actionStop(opStrPtzStop);
	});
	// Center down
	$("#pt_cd").mousedown(function(){
		var opStr = "cpantiltzoommove=" + "0," + "-" + $("#text_speedbar").val() + ",0";
		if(g_resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		g_resChk = 1;
	}).mouseup(function(){
		actionStop(opStrPtzStop);
	}).mouseout(function(){
		actionStop(opStrPtzStop);
	});
	// Right down
	$("#pt_rd").mousedown(function(){
		var opStr = "cpantiltzoommove=" + $("#text_speedbar").val() + "," + "-" + $("#text_speedbar").val() + ",0";
		if(g_resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		g_resChk = 1;
	}).mouseup(function(){
		actionStop(opStrPtzStop);
	}).mouseout(function(){
		actionStop(opStrPtzStop);
	});

	// Zoom
	$("#_zIn").mousedown(function(){
		var opStr = "cpantiltzoommove=0,0," + $("#text_speedbar").val();
		if(g_resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		g_resChk = 1;
	}).mouseup(function(){
		actionStop(opStrPtzStop);
	}).mouseout(function(){
		actionStop(opStrPtzStop);
	});
	$("#_zOut").mousedown(function(){
		var opStr = "cpantiltzoommove=0,0," + "-" + $("#text_speedbar").val();
		if(g_resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		g_resChk = 1;
	}).mouseup(function(){
		actionStop(opStrPtzStop);
	}).mouseout(function(){
		actionStop(opStrPtzStop);
	});

	// Focus
	$("#_fNear").mousedown(function(){
		var opStr = "cfocusmove=" + $("#text_speedbar").val();
		if(g_resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		g_resChk = 1;
	}).mouseup(function(){
		actionStop(opStrFocusStop);
	}).mouseout(function(){
		actionStop(opStrFocusStop);
	});
	$("#_fFar").mousedown(function(){
		var opStr = "cfocusmove=" + "-" + $("#text_speedbar").val();
		if(g_resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		g_resChk = 1;
	}).mouseup(function(){
		actionStop(opStrFocusStop);
	}).mouseout(function(){
		actionStop(opStrFocusStop);
	});

	//size plus
	$("#sizePlus").mousedown(function(){
		if(g_selectIndex == 0)
		{
			alert("Select zone id");
			return;
		}

		if(g_resChk == 1)
			return;
		actionSizePlus();
		chk = 1;
		g_resChk = 1;		
	}).mouseup(function(){
		actionStop(opStrPtzStop);
	}).mouseout(function(){
		actionStop(opStrPtzStop);
	});

	//size minus
	$("#sizeMinus").mousedown(function(){
		if(g_selectIndex == 0)
		{
			alert("Select zone id");
			return;
		}

		if(g_resChk == 1)
			return;
		actionSizeMinus();
		chk = 1;
		g_resChk = 1;
	}).mouseup(function(){
		actionStop(opStrPtzStop);
	}).mouseout(function(){
		actionStop(opStrPtzStop);
	});

	//select privacy mask
	$("#zoneList").change(function(){
		viewLoading(true);
		$("#zoneEnableState").attr("checked", "");
		clearPrivacySetting(g_selectIndex, function(){
			g_selectIndex = $("#zoneList").val();
			selectZoneID(g_selectIndex);
		});
	});

	$("#btnSave").click(function(){
		if(g_selectIndex == "0")
		{
			alert("Select zone id");
			return;
		}

		stopPrivacySetting(g_selectIndex);
		savePrivacySetting(g_selectIndex, $("#zoneEnableState").attr("checked") == true ? 1 : 0);
	});

}

function actionSerialFCGI(packetStr, timeout, callbackFunc)
{
	var actionReq = new CGIRequest();
	var reqQString = "write=" + packetStr + "&read=100," + timeout;

	actionReq.SetAddress("/nvc-cgi/ptz/serial2.fcgi");
	actionReq.SetCallBackFunc(function(xml){
		g_resChk = 0;
		if(callbackFunc != undefined)
		{
			callbackFunc();
		}
		viewLoading(false);
		return;
	});
	actionReq.Request(reqQString);
}

function actionSizePlus()
{
	var reqQString = "FF010200000003";
	actionSerialFCGI(reqQString, 300);
}

function actionSizeMinus()
{
	var reqQString = "FF010400000005";
	actionSerialFCGI(reqQString, 300);
}

function selectZoneID(index)
{
	if(index == 0) return;

	var packet = new Array();
	packet[0] = 0xFF;
	packet[1] = 0x01;
	packet[2] = 0x60;
	packet[3] = 0xE1;
	packet[4] = 0x00;
	packet[5] = Number(index);
	packet[6] = getCheckSum(packet);

	$.get("/nvc-cgi/ptz/serial2.fcgi?write=" + makePacketString(packet) + "&read=100,500&_=" + (new Date()).getTime(), function(data) {
		//FF, Address, 20, E1, Mode, Privacy num, Cksum(7) + generel response(4)
		var responsePacket = data.split("\n")[1].split("=")[1];
		var fixPacket = "FF0120E1";
		var idxPacket = responsePacket.indexOf(fixPacket);
		var packetVal = responsePacket.substr(idxPacket, 22);
		var mode = packetVal.substr(8, 2);

		$("#zoneEnableState").attr("checked", (mode == 1) ? "checked" : "");
		startPrivacySetting(index);
	});
}

function startPrivacySetting(index)
{
	if(index == 0) return;

	var packet = new Array();
	packet[0] = 0xFF;
	packet[1] = 0x01;
	packet[2] = 0x40;
	packet[3] = 0xE1;
	packet[4] = 0x10;
	packet[5] = Number(index);
	packet[6] = getCheckSum(packet);

	actionSerialFCGI(makePacketString(packet), 300);
}

function stopPrivacySetting(index)
{
	if(index == 0) return;

	var packet = new Array();
	packet[0] = 0xFF;
	packet[1] = 0x01;
	packet[2] = 0x40;
	packet[3] = 0xE1;
	packet[4] = 0x20;
	packet[5] = Number(index);
	packet[6] = getCheckSum(packet);

	actionSerialFCGI(makePacketString(packet), 300);
}

function savePrivacySetting(index, mode)
{
	if(index == 0) return;

	var packet = new Array();
	packet[0] = 0xFF;
	packet[1] = 0x01;
	packet[2] = 0x40;
	packet[3] = 0xE1;
	packet[4] = mode;
	packet[5] = Number(index);
	packet[6] = getCheckSum(packet);

	actionSerialFCGI(makePacketString(packet), 300, function(){
		g_selectIndex = "0";
		InitSetting();
	});
}

function clearPrivacySetting(index, callbackFunc)
{
	if(index == 0)
	{
		if(callbackFunc != undefined)
		{
			callbackFunc();
		}
		return;
	}

	var packet = new Array();
	packet[0] = 0xFF;
	packet[1] = 0x01;
	packet[2] = 0x40;
	packet[3] = 0xE1;
	packet[4] = 0x30;
	packet[5] = Number(index);
	packet[6] = getCheckSum(packet);

	actionSerialFCGI(makePacketString(packet), 500, callbackFunc);
}

function getCheckSum(array)
{
	var ckSum = "";
	var sum = 0;

	for(i=1; i < array.length; i++)
	{
		sum += Number(array[i]);
	}

	var hexStr = String(sum.toString(16));
	ckSum = hexStr.substring(hexStr.length -2);

	return ckSum;
}

function makePacketString(array)
{
	var strPacket = "";

	for(i=0; i < array.length; i++)
	{
		if(array[i] < 16)
		{
			strPacket += ("0" + String(array[i].toString(16)))
		}
		else
		{
			strPacket += String(array[i].toString(16));
		}
	}

	return strPacket;
}

function actionMove(opString)
{
	var actionReq = new CGIRequest();
	var reqQString = "";

	reqQString += opString;
	actionReq.SetAddress("/nvc-cgi/ptz/ptz2.fcgi");
	actionReq.SetCallBackFunc(function(xml){
		g_resChk = 0;
		ViewLoadingSave(false);
		return;
	});
	actionReq.Request(reqQString);
}

function actionStop(opStr)
{
	if(chk == 1)
	{
		var t=0;
		t = setInterval(function(){
			if(g_resChk == 0)
			{
				actionMove(opStr);
				clearInterval(t);
			}
		}, 10);
		chk = 0;
	}
}
