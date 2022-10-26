var g_brand = {
	pantilt : "",
	cameraClass : "",
	deviceType : "",
	lens : "",
	lensType : "",
	imgDevice : "",
	irType : "",
	mfzType : "",
	mfzCtrl : "",
	productID : "",
	audioInOut : "",
	audioInType : "",
	aspectRatioW16H9 : "",
	aspectRatioW4H3 : "",
	diInternal : "",
	diExternal :  "",
	diCount : "",
	doInternal : "",
	doExternal : "",
	doCount : "",
	tvOut : "",
	usb : "",
	sd : "",
	pir : "",
	wifi : "",
	rs485 : "",
	rs232c : "",
	rs422 : "",
	repositioning : "",
	livectrl : "",
	autorun : "",
	touring : "",
	cdscontroltype : "",
	fanheater : "",
	fullname: "",
	shortname: "",
	serial: "",
	firmware: "",
	versiondesc: "",
	iristype: "",
	dntype: "",
	userfs: "",
	stellaris: "",
	manufacturer: "",
	mac: "",
	rack: "",
	moduleid: "",
	wifi_attr_dev: "",
	dneventtype: "",
	hardware: "",
	soctype: "",
	productdesc: "",
	dome: ""
}

var g_support = {
	rotation : true,
	stabilization : true,
	stabilizationEnable : false,
	exposureShutterSpeed : true,
	blcOffOption : true,
	smartIRManual : true,
	dynamic2Dnr : true,
	dnr : false,
	dwdr : true,
	wdr : false,
	wdrLevel : true,
	digitalZoom : false,
	videoOutput : false,
	videoOutputNVN : false,
	profileG : false,
	analogoutput : false,
	videoout : false,
	tourSpeed : false,
	defog : true,
	defogLevel : true,
	unwarping: false,
	wiper: false,
	brightnessZero: false,
	enableIllumiSensor: false,
	tourSpeedLabel_1_63: false,
	tourSpeedLabel_1_64: false,
	tamarisk: false,
	tamarisk9fps: false,
	tamarisk30fps: false,
	presetSchedule: false,
	touringMenu: false,
	tourInterval_3_99: false,
	peopleTracker: false,
	rs485ctrl: false,
	dntModel: false
}

$(function () {
	var req = new CGIRequest();

	req.SetAsyn(false);
	req.SetAddress("/brand.xml");
	req.SetCallBackFunc(getBrandInfo);
	req.Request();

	initSupport();
});


function getBrandInfo(xml)
{
	g_brand.pantilt = jqGetXmlData('pantilt', xml);
	g_brand.cameraClass = jqGetXmlData('information camera class', xml);
	g_brand.lens = jqGetXmlData('lens', xml);
	g_brand.productID = jqGetXmlData('model > productid', xml);
	g_brand.imgDevice = jqGetXmlData('imgdevice', xml);
	g_brand.irType = jqGetXmlData('irtype', xml);
	g_brand.mfzType = jqGetXmlData('mfztype', xml);
	g_brand.mfzCtrl = jqGetXmlData('mfzctrl', xml);
	g_brand.aspectRatioW16H9 = jqGetXmlData('information videoin aspectratio W16H9', xml);
	g_brand.aspectRatioW4H3 = jqGetXmlData('information videoin aspectratio W4H3', xml);
	g_brand.usb = jqGetXmlData('information storage usb', xml);
	g_brand.sd = jqGetXmlData('information storage sd', xml);
	g_brand.pir = jqGetXmlData('information sensor pir', xml);
	g_brand.wifi = jqGetXmlData('information network wifi', xml);
	g_brand.rs485 = jqGetXmlData('information uart rs485', xml);
	g_brand.rs232c = jqGetXmlData('information uart rs232c', xml);
	g_brand.rs422 = jqGetXmlData('information uart rs422', xml);
	g_brand.repositioning = jqGetXmlData('information ptz repositioning', xml);
	g_brand.livectrl = jqGetXmlData('information ptz livectrl', xml);
	g_brand.autorun = jqGetXmlData('information ptz autorun', xml);
	g_brand.touring = jqGetXmlData('information ptz touring', xml);
	g_brand.cdscontroltype = jqGetXmlData('information videoin cdscontroltype', xml);
	g_brand.fullname = jqGetXmlData('product > fullname', xml, false);
	g_brand.shortname = jqGetXmlData('product > shortname', xml, false);
	g_brand.serial = jqGetXmlData('model > serial', xml, false);
	g_brand.firmware = jqGetXmlData('version firmware', xml, false);
	g_brand.versiondesc = jqGetXmlData('version description', xml, false);
	g_brand.iristype = jqGetXmlData('information videoin iristype', xml);
	g_brand.dntype = jqGetXmlData('information videoin dntype', xml);
	g_brand.userfs = jqGetXmlData('version userfs', xml);
	g_brand.stellaris = jqGetXmlData('version stellaris', xml);
	g_brand.manufacturer = jqGetXmlData('product manufacturer', xml, false);
	g_brand.mac = jqGetXmlData('product mac', xml, false);
	g_brand.rack = jqGetXmlData('information rack', xml);
	g_brand.moduleid = jqGetXmlData('information module_id', xml);
	g_brand.wifi_attr_dev = jqGetXmlAttr('information network wifi', "dev", xml);
	g_brand.audioInType = jqGetXmlData('audio input', xml);
	g_brand.dneventtype = jqGetXmlData('information videoin dneventtype', xml);
	g_brand.hardware = jqGetXmlData('version hardware', xml);
	g_brand.productdesc = jqGetXmlData('product description', xml);
	g_brand.dome = jqGetXmlData('version dome', xml, false);

	var fanheater = jqGetXmlData('information temp fanheater', xml);
	switch(fanheater)
	{
	case "fan": 
		g_brand.fanheater = "Yes/No";
		break;
	case "heater":
		g_brand.fanheater = "No/Yes";
		break;
	case "fan+heater":
	case "heater+fan":
		g_brand.fanheater = "Yes/Yes";
		break;
	default:
		g_brand.fanheater = "No/No";
	}

	var audioInOut = jqGetXmlData('audio audio', xml);
	switch(audioInOut)
	{
	case "in": 
		g_brand.audioInOut = "1/0";
		break;
	case "out":
		g_brand.audioInOut = "0/1";
		break;
	case "in+out":
	case "out+in":
		g_brand.audioInOut = "1/1";
		break;
	default:
		g_brand.audioInOut = "0/0";
	}

	switch(g_brand.lens)
	{
	case "tamron_df010n2000": 
	case "hk_bvf2812mp": 
		g_brand.lensType = "vari-focal";
		break;
	case "hk_127200wp-bif":
	case "cbc_l1028krw":
	case "hqo_rpla8trt":
		g_brand.lensType = "fisheye";
		break;
	default:
		if(g_brand.mfzType == "motorized"){
			g_brand.lensType = "mfz"; 
		}
		else{
			g_brand.lensType = g_brand.lens;
		}
		break;
	}

	g_brand.diInternal = jqGetXmlData('information dido di internal', xml);
	g_brand.diExternal = jqGetXmlData('information dido di external', xml);
	g_brand.diCount = Number(g_brand.diInternal) + Number(g_brand.diExternal);
	g_brand.doInternal = jqGetXmlData('information dido do internal', xml);
	g_brand.doExternal = jqGetXmlData('information dido do external', xml);
	g_brand.doCount = Number(g_brand.doInternal) + Number(g_brand.doExternal);
	g_brand.tvOut = jqGetXmlData('information videoout tvout', xml);
	g_brand.soctype = g_brand.hardware.split(".")[4];//soctype dmva2, dm368
}

function initSupport() {
	if((g_brand.repositioning == g_defbrand.existrepositioning && g_brand.mfzType == "motorized") ||
		g_brand.cameraClass == "encoder" || 
		g_brand.pantilt == g_defbrand.type1ptz ||
		g_brand.pantilt == g_defbrand.irptz ||
		g_brand.pantilt == g_defbrand.ptz)
	{
		g_support.rotation = false;
	}

	if(g_brand.pantilt == g_defbrand.type1ptz ||
		g_brand.pantilt == g_defbrand.irptz ||
		g_brand.imgDevice == "tw9910" ||
		g_brand.imgDevice == "en773a" ||
		g_brand.imgDevice == "mz2251-5x" ||
		g_brand.imgDevice == "mz2307")
	{
		if(g_brand.imgDevice == "fcb-ev7500" ||
			g_brand.imgDevice == "mm-308" ||
			g_brand.imgDevice == "mc-s128b" ||
			g_brand.imgDevice == "mc-s368" ||
			g_brand.imgDevice == "fcb-ev7520")
		{
			g_support.stabilization = true;
		}
		else
		{
			g_support.stabilization = false;
		}
	}

	if(g_brand.imgDevice == "fcb-ev7500" ||
		g_brand.imgDevice == "mm-308" ||
		g_brand.imgDevice == "mc-s128b" ||
		g_brand.imgDevice == "mc-s368" ||
		g_brand.imgDevice == "fcb-ev7520")
	{
		g_support.stabilizationEnable = true;
	}


	if(g_brand.imgDevice == "en773a" ||
		g_brand.imgDevice == "en773v" ||
		g_brand.pantilt == g_defbrand.type1ptz ||
		g_brand.pantilt == g_defbrand.irptz ||
		g_brand.pantilt == g_defbrand.ptz)
	{
		g_support.exposureShutterSpeed = false;
		g_support.wdr = true;
	}

	if(g_brand.imgDevice == "en773a")
	{
		g_support.blcOffOption = false;
		g_support.dynamic2Dnr = false;
		g_support.dnr = true;
	}

	if(g_brand.imgDevice == "en773v")
	{
		g_support.stabilization = false;
		g_support.dynamic2Dnr = false;
		g_support.dnr = true;
	}

	if(g_brand.imgDevice == "mm-302a" || 
		g_brand.imgDevice == "mm-308" ||
		g_brand.imgDevice == "en773a") 
	{
		g_support.smartIRManual = false;
	}
	else if(g_brand.irType == "smartir_type1")
	{
		g_support.smartIRManual = true;
	}
	else if(g_brand.irType == "none")
	{
		g_support.smartIRManual = false;
	}

	if(g_brand.irType == "normal")
	{
		g_support.smartIRManual = false;
	}

	if(g_brand.pantilt == g_defbrand.type1ptz ||
		g_brand.pantilt == g_defbrand.irptz ||
		g_brand.pantilt == g_defbrand.ptz ||
		g_brand.cameraClass == "encoder" ||
		g_brand.imgDevice == "en773a" ||
		g_brand.imgDevice == "en773v")
	{
		g_support.dwdr = false;
	}

	if(g_brand.cameraClass == "encoder" ||
		g_brand.imgDevice == "en773a" ||
		g_brand.pantilt == g_defbrand.type1ptz ||
		g_brand.pantilt == g_defbrand.irptz ||
		g_brand.pantilt == g_defbrand.ptz)
	{
		g_support.wdrLevel = false;
	}

	if(g_brand.pantilt == g_defbrand.type1ptz ||
		g_brand.pantilt == g_defbrand.irptz)
	{
		g_support.digitalZoom = true;
	}

	if(g_brand.cameraClass != "encoder" && g_brand.tvOut == 1)
	{
		g_support.videoOutput = true;
		g_support.videoOutputNVN = false;
	}

	if(g_brand.cameraClass == "encoder" && g_brand.tvOut == 1)
	{
		g_support.videoOutput = false;
		g_support.videoOutputNVN = true;
	}

	if(g_brand.sd != "0")
	{
		g_support.profileG = true;
	}

	if(g_brand.pantilt == g_defbrand.type1ptz && 
		(g_brand.productID == "c003" || g_brand.productID == "c004"))
	{
		g_support.analogoutput = true;
	}

	if(g_brand.tvOut == "1" && g_brand.pantilt != g_defbrand.type1ptz)
	{
		g_support.videoout = true;
	}

	if(g_brand.pantilt == g_defbrand.irptz || g_brand.pantilt == g_defbrand.type1ptz)
	{
		g_support.tourSpeed = true;
	}

	if(g_brand.imgDevice == "scm6200" || g_brand.imgDevice == "en773a" || g_brand.imgDevice == "tw9910" || g_brand.imgDevice == "fcb-ev7310")
	{
		g_support.defog = false;
	}

	if(g_brand.imgDevice == "fcb-ev7500" || g_brand.imgDevice == "mm-302a" || 
		g_brand.imgDevice == "mm-308" || g_brand.imgDevice == "mz2307" || 
		g_brand.imgDevice == "mz2251-5x" || g_brand.imgDevice == "mc-s128b" || 
		g_brand.imgDevice == "mc-s368" || g_brand.imgDevice == "fcb-ev7520")
	{
		g_support.defogLevel = false;
	}

	if(g_brand.lens == "hqo_rpla8trt" || g_brand.lens == "cbc_l1028krw")
	{
		g_support.unwarping = true;
	}

	if(g_brand.pantilt == g_defbrand.irptz)
	{
		g_support.wiper = true;
	}

	if(g_brand.imgDevice == "tamarisk320fps9" || g_brand.imgDevice == "tamarisk320fps30" || 
		g_brand.imgDevice == "tamarisk640fps9" || g_brand.imgDevice == "tamarisk640fps30")
	{
		g_support.tamarisk = true;
	}

	if(g_brand.pantilt == g_defbrand.type1ptz || g_brand.pantilt == g_defbrand.irptz ||
		g_brand.pantilt == g_defbrand.ptz || g_brand.imgDevice == "scm6200" ||
		g_brand.imgDevice == "en773a" || g_brand.imgDevice == "mm-302a" ||
		g_brand.imgDevice == "mm-308" || g_brand.imgDevice == "mz2307" || 
		g_brand.imgDevice == "mz2251-5x" || g_brand.imgDevice == "fcb-ev7310" || 
		g_brand.imgDevice == "fcb-ev7500" || g_brand.imgDevice == "mc-s128b" ||
		g_brand.imgDevice == "mc-s368" || g_support.tamarisk == true ||
		g_brand.imgDevice == "fcb-ev7520")
	{
		g_support.brightnessZero = true;
	}

	if(g_brand.cdscontroltype == g_defbrand.dmva2 || g_brand.imgDevice == "en773v")
	{
		g_support.enableIllumiSensor = true;
	}

	if(g_brand.pantilt == g_defbrand.irptz)
	{
		g_support.tourSpeedLabel_1_63 = true;
	}

	if(g_brand.pantilt == g_defbrand.type1ptz)
	{
		g_support.tourSpeedLabel_1_64 = true;
	}

	if(g_brand.imgDevice == "tamarisk320fps9" || g_brand.imgDevice == "tamarisk640fps9")
	{
		g_support.tamarisk9fps = true;
	}

	if(g_brand.imgDevice == "tamarisk320fps30" || g_brand.imgDevice == "tamarisk640fps30")
	{
		g_support.tamarisk30f = true;
	}
	// g_brand.touring==1 : external ptz //g_brand.touring==2 : internal ptz
	if(g_brand.imgDevice == "mz2251-5x" || g_brand.imgDevice == "mz2307" || g_brand.touring == "2") 
	{
		g_support.presetSchedule = true;
	}

	if(g_brand.touring == g_defbrand.existtouring || g_brand.touring == g_defbrand.existswtouring)
	{
		g_support.touringMenu = true;
	}

	//g_brand.touring == "2" : 5502
	if(g_brand.pantilt == g_defbrand.irptz || g_brand.touring == "2") 
	{
		g_support.tourInterval_3_99 = true;
	}

	//IPT series(add model on tools/brand/brand.c)
	if(g_brand.productdesc == "people tracker") 
	{
		g_support.peopleTracker = true;
	}

	//1302sv get dome version with different port
	if(g_brand.productID == "b01e")
	{
		g_support.rs485ctrl = true;
	}

	//day & night transition model >> find model in defbrand.js
	for(var i = 0; i < g_defdnt.dntAllowModel.length; i++)
	{
		if(g_brand.imgDevice == g_defdnt.dntAllowModel[i])
		{
			if(g_defdnt.dntAllowModel[i] == "en773v")//day & night transition is supported after ISP firmware 1.1.0.7
			{
				g_support.dntModel = (parseInt((g_brand.dome).replace(/\./gi, '')) > 1016) ? true: false;
			}
			else
				g_support.dntModel = true;
		}
	}
}
