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
	var classNum = ["04090131"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "information", 
				parent.g_langData[parent.g_configData.language]);
}

function mainRun()
{
	initForm();
	initSetting();
	eventBind();
	ContentShow();
	PostCustomize();
}

function initForm()
{
	$("button").button();
	$("#rack_form").dialog({
		autoOpen: false,
		width: 330,
		modal: true,
		resizable: false,
		open: function() {
		},
		close: function(){
		}
	});
}

function initSetting()
{
	$("li#usnVal").text(parent.g_brand.serial);
	$("li#fullNameVal").text(parent.g_brand.fullname);
	$("li#shortNameVal").text(parent.g_brand.shortname);
	$("li#userfsVerVal").text(parent.g_brand.userfs);
	$("li#stellarisVerVal").text(parent.g_brand.stellaris);
	$("li#manufacturerVerVal").text(parent.g_brand.manufacturer);
	$("li#sdVal").text(parent.g_brand.sd);
	$("li#usbVal").text(parent.g_brand.usb);
	$("li#audioVal").text(parent.g_brand.audioInOut);
	$("li#rs485Val").text(parent.g_brand.rs485);

	var verDesc = "";
	if("" != parent.g_brand.versiondesc)
		verDesc = "(" + parent.g_brand.versiondesc + ")";

	$("li#firmwareVerVal").text(parent.g_brand.firmware + verDesc);


	var infoPanTilt = "";
	switch(parent.g_brand.pantilt)
	{
		case 'speed':
			infoPanTilt = 'Speed';
			break;
		case g_defbrand.type1ptz:
			infoPanTilt = 'Speed Type 1';
			break;
		case g_defbrand.irptz:
			infoPanTilt = 'IR Speed PTZ';
			break;
		case g_defbrand.ptz:
			infoPanTilt = 'PTZ';
			break;
		case g_defbrand.thermal1:
			infoPanTilt = 'THERMAL1';
			break;
		default:
			infoPanTilt = 'None';
			break;
	}

	if(parent.g_brand.repositioning == "1")
		infoPanTilt = 'Repositioning';

	if(infoPanTilt == "Speed Type 1" || infoPanTilt == "IR Speed PTZ" || infoPanTilt == "PTZ")
		$(".domeVersion_contents").css("display", "block");
	
	if(parent.g_brand.imgDevice == "en773v" || (infoPanTilt == "PTZ" && !parent.g_support.tamarisk))
		$(".ispVersion_contents").css("display", "block");

	$("li#panTitleVal").text(infoPanTilt);

	var infoFocusZoom = "None";
	if(parent.g_brand.lensType == 'vari-focal')
	{
		infoFocusZoom = 'Vari-focal';
	}
	else if(parent.g_brand.lensType == 'mfz')
	{
		infoFocusZoom = 'MFZ';
	}

	$("li#focusZoomVal").text(infoFocusZoom);

	var infoAutoIris = "None";
	var irisValue = parent.g_brand.iristype.split("_");
	if(irisValue[0] == 'dciris')
	{
		infoAutoIris = 'DC-IRIS';
	}
	else if(irisValue[0] == 'piris')
	{
		infoAutoIris = 'P-IRIS';
	}
	
	$("li#dcAutoirisVal").text(infoAutoIris);

	var infoDayNight = "None";
	if(parent.g_brand.dntype == 'software')
	{
		infoDayNight = 'Software';
	}
	else if(parent.g_brand.dntype == 'tdn')
	{
		infoDayNight = 'TDN';
	}

	$("li#dayNightVal").text(infoDayNight);

	var infoIr = "None";
	var irValue = parent.g_brand.irType.split("_");

	if(irValue[0] == 'smartir')
	{
		infoIr = 'SMART-IR';
	}
	else if(irValue[0] == 'normal')
	{
		infoIr = 'Normal';
	}
	else if(irValue[0] == 'external')
	{
		infoIr = 'External';
	}

	$("li#irIlluminationVal").text(infoIr);
	$("li#tvOutVal").text(parent.g_brand.tvOut == '1' ? '1' : '0');
	$("li#diDoVal").text(parent.g_brand.diCount + "/" + parent.g_brand.doCount);
	$("li#macAddrVal").text(convertMac(parent.g_brand.mac));
	$("li#modulidVal").text(parent.g_brand.moduleid);

	if (parent.g_brand.cameraClass == "encoder" && parent.g_brand.rack != "na")
		$(".rackinfo_contents").css("display", "block");

	if (parent.g_brand.cameraClass == "encoder" && parent.g_brand.moduleid != "")
		$(".moduleidinfo_contents").css("display", "block");

	if(parent.g_support.tamarisk)
	{
		getTimeVersion();
		$(".timVersion_contents").css("display", "block");
	}

	if(infoPanTilt == "Speed Type 1" || infoPanTilt == "IR Speed PTZ" || infoPanTilt == "PTZ" || (infoPanTilt == "PTZ" && !parent.g_support.tamarisk))
		getDomeFWVersion();

	if(parent.g_brand.imgDevice == "en773v")
	{
		getIspFWVersion();
	}

	getResourceState();
	ResizePage();
	EvenOdd(parent.g_configData.skin);
}

function getTimeVersion()
{
	getDataConfig_UAPI("videoin.ch0.tim.version", function(data){
		initDataValue(data);
		$("#timVersionVal").text(g_dataArray["videoin_ch0_tim_version"]);
	});
}

function convertMac(addr)
{
	var szMacValue = addr.substring(0,2) + ":" + addr.substring(2,4) + ":" +
					 addr.substring(4,6) + ":" + addr.substring(6,8) + ":" + 
					 addr.substring(8,10) + ":" + addr.substring(10,12);

	return szMacValue;
}

function getDomeFWVersion()
{
	$.get("/nvc-cgi/ptz/ptz2.fcgi?aux_query=version", function(data) {
		var domeVersion = "";

		if(data.substring(0,2) == "#4")
			domeVersion = "Error";
		else
			domeVersion = data.split("=")[1];

		$("li#domeVersionVal").text(domeVersion);
		if((parent.g_brand.pantilt == "ptz" && !parent.g_support.tamarisk)){ //if 5502 model
			$.get("/nvc-cgi/ptz/ptz2.fcgi?aux_query=sensorversion", function(data) {
				var ispVersion = "";
	
				if(data.substring(0,2) == "#4")
					ispVersion = "Error";
				else
					ispVersion = data.split("=")[1];
	
				$("li#ispVersionVal").text(ispVersion);
			});
		}
	});
}

function getIspFWVersion()
{
	var ispVersion = parent.g_brand.dome;
	$("li#ispVersionVal").text(ispVersion);
}

function getResourceState()
{
	var req = new CGIRequest();
	req.SetAsyn(false);
	req.SetAddress("/status/resource-state.xml");
	req.SetCallBackFunc(function(xml){
		var infoRackID = "";
		var infoRackTemp0 = "";
		var infoRackTemp1 = "";
		var infoRackTemp2 = "";
		var infoRackVoltage0 = "";
		var infoRackVoltage1 = "";
		var infoRackFanState0 = "";
		var infoRackFanState1 = "";
		var infoRackFanState2 = "";

		if($("resource-state resource[name='rackinfo'] item[name='rack-id']", xml).size() > 0)
			infoRackID = $("resource-state resource[name='rackinfo'] item[name='rack-id']", xml).text();

		if($("resource-state resource[name='rackinfo'] item[name='temperature0-celsius']", xml).size() > 0)
			infoRackTemp0 = $("resource-state resource[name='rackinfo'] item[name='temperature0-celsius']", xml).text();

		if($("resource-state resource[name='rackinfo'] item[name='temperature1-celsius']", xml).size() > 0)
			infoRackTemp1 = $("resource-state resource[name='rackinfo'] item[name='temperature1-celsius']", xml).text();
		
		if($("resource-state resource[name='rackinfo'] item[name='temperature2-celsius']", xml).size() > 0)
			infoRackTemp2 = $("resource-state resource[name='rackinfo'] item[name='temperature2-celsius']", xml).text();

		if($("resource-state resource[name='rackinfo'] item[name='voltage0']", xml).size() > 0)
			infoRackVoltage0 = $("resource-state resource[name='rackinfo'] item[name='voltage0']", xml).text();
		
		if($("resource-state resource[name='rackinfo'] item[name='voltage1']", xml).size() > 0)
			infoRackVoltage1 = $("resource-state resource[name='rackinfo'] item[name='voltage1']", xml).text();

		if($("resource-state resource[name='rackinfo'] item[name='fanstat0']", xml).size() > 0)
			infoRackFanState0 = $("resource-state resource[name='rackinfo'] item[name='fanstat0']", xml).text();

		if($("resource-state resource[name='rackinfo'] item[name='fanstat1']", xml).size() > 0)
			infoRackFanState1 = $("resource-state resource[name='rackinfo'] item[name='fanstat1']", xml).text();

		if($("resource-state resource[name='rackinfo'] item[name='fanstat2']", xml).size() > 0)
			infoRackFanState2 = $("resource-state resource[name='rackinfo'] item[name='fanstat2']", xml).text();

		$("#temperatureValue").text(infoRackTemp0 + ", " + infoRackTemp1 + ", " + infoRackTemp2);
		$("#voltageValue").text(infoRackVoltage0 + ", " + infoRackVoltage1);
		$("#fanstateValue").text(infoRackFanState0 + ", " + infoRackFanState1 + ", " + infoRackFanState2);
		$("li#rackinfoVal").html("<a href='#'>" + infoRackID.toUpperCase() + "</a>");
	});
	req.Request();
}

function eventBind()
{
	$("li#rackinfoVal a").click(function(){
		$("#rack_form").dialog("option", "title", GetMsgLang("04090131"));
		$("#rack_form").dialog('open');
	});

	$("#btnDialogRenew").click(function(){ 
		getResourceState();
	});
	
	$("#btnDialogCancel").click(function(){ 
		$("#rack_form").dialog('close');
	});
}
