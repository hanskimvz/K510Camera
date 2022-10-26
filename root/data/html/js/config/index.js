$(function () {
	// PreCustomize();
	// TopMenuDisplay();
	// initEnvironment();
	// initBrand();
	// initOEM();
	// initMenuActive();
	eventBind();
	// PostCustomize();
});

// function initEnvironment()
// {
// 	initLanguage();
// }

// function initLanguage()
// {
// 	setLanguage(parent.g_configData.langPath, setup + menucontents, 
// 				parent.g_langData[parent.g_configData.language]);
// }

// function initMenuActive()
// {
// 	var leftmenuIndex = 0;
// 	if(getCookie("tcpipRedirection") == 1)
// 	{
// 		var leftmenuDetailIndex = 0;
// 		leftmenuDetailIndex = getCookie("tmpLeftmenuDetailIndex");

// 		if(leftmenuDetailIndex < 4)  leftmenuIndex = 0;
// 		else  leftmenuIndex = 3;

// 		$("#leftmenu li").each(function(index,element){
// 			$(this).removeClass("ui-state-hover");
// 			if(index == leftmenuDetailIndex) $(this).addClass("ui-state-hover");
// 		});

// 		$("#contentFrame").attr("src", "tcpip.html");
// 		setCookie("tcpipRedirection", 0, 1);
// 	}

// 	if(getCookie("languageRedirection") == 1)
// 	{
// 		leftmenuIndex = 8;
// 		$("#leftmenu li").removeClass("ui-state-hover");
// 		$("#contentFrame").attr("src", "language.html");
// 		$("#leftmenu .maintenanceContents + div a[href='language.html']").parent().addClass("ui-state-hover");
// 		setCookie("languageRedirection", 0, 1);
// 	}

// 	$("#leftmenu").accordion({
// 		active: leftmenuIndex,
// 		collapsible: true,
// 		autoHeight: false,
// 		navigation: true,
// 		animated: true
// 	});


// 	// We need to know if VCA is enabled
// 	$(".vcaLoading").toggle(true);
// 	$(".vcaLoaded").toggle(false);
// 	$(".vcaCalibration").toggle(false);
// 	$(".vcaClassification").toggle(false);
// 	$(".vcaMaintenance").toggle(false);
// 	$(".vcaPtzTracking").toggle(false);
// 	$(".vcaCounting").toggle(false);
// 	$(".vcaStatistics").toggle(false);
// 	$(".vcaEnabled").toggle(false);
// 	$(".vcaError").toggle(false);
// 	$("#vcaMenuHeader").click(function(){
// 		$(".vcaLoading").toggle(true);
// 		$(".vcaLoaded").toggle(false);
// 		$(".vcaCalibration").toggle(false);
// 		$(".vcaClassification").toggle(false);
// 		$(".vcaMaintenance").toggle(false);
// 		$(".vcaPtzTracking").toggle(false);
// 		$(".vcaCounting").toggle(false);
// 		$(".vcaStatistics").toggle(false);
// 		$(".vcaEnabled").toggle(false);
// 		$(".vcaError").toggle(false);
// 		vcaMenuToggle(false);
// 	});
// 	$(window).bind("capServerDataRefresh", vcaMenuToggle, true);

// 	// If the user clicks the close button on the popup
// 	$("#topbarCloseLink").click(function() {
// 		$("#topbar").removeClass('topbar-open');
// 		$("#topbar").addClass('topbar-close');

// 		vcaTrialAck();
// 	});

// 	// Activate link
// 	$("#activateLink").click(function(){
// 		// Close up the top bar
// 		$("#topbar").removeClass('topbar-open');
// 		$("#topbar").addClass('topbar-close');

// 		$("#leftmenu a[href='activate.html']").click();
// 		$("#leftmenu .activateContents").click();
// 	});
// }

// function initBrand()
// {
// 	if(g_brand.productid != "d001")
// 	{
// 		if(g_brand.audioInOut == "0/0")
// 		{
// 			$("#videoAudioMenuHeaderText").css("display", "none");
// 			$("#videoMenuHeaderText").css("display", "inline");
// 		}
// 		else if(g_brand.audioInOut == "1/0")
// 		{
// 			$("#videoAudioMenuHeaderText").css("display", "inline");
// 			$("#videoMenuHeaderText").css("display", "none");
// 		}
// 		else if(g_brand.audioInOut == "0/1")
// 		{
// 			$("#videoAudioMenuHeaderText").css("display", "inline");
// 			$("#videoMenuHeaderText").css("display", "none");
// 		}
// 	}
// 	else
// 	{
// 		$("#videoAudioMenuHeaderText").css("display", "inline");
// 		$("#videoMenuHeaderText").css("display", "none");
// 	}
	
// 	if(g_brand.repositioning == g_defbrand.existrepositioning && g_brand.mfzType == "motorized")
// 	{
// 		$("#repositioning").css("display", "block");
// 		$("#zoomfocus").css("display", "none");
// 		$("#privacymask").css("display", "none");
// 		$("#focusAssist").css("display", "none");
// 	}
// 	else
// 	{
// 		$("#repositioning").css("display", "none");

// 		if(g_brand.mfzType == "motorized")
// 		{
// 			$("#zoomfocus").css("display", "block");
// 			$("#focusAssist").css("display", "none");
// 		}
// 		else
// 		{
// 			$("#zoomfocus").css("display", "none");

// 			if(g_brand.imgDevice == "en773a" || 
// 				g_brand.imgDevice == "en773v" ||
// 				g_brand.imgDevice == "tw9910" ||
// 				g_brand.imgDevice == "rs51c0b" ||
// 				g_brand.imgDevice == "mdc200s" ||
// 				g_brand.imgDevice == "mdc600s" ||
// 				g_brand.pantilt == g_defbrand.type1ptz ||
// 				g_brand.pantilt == g_defbrand.irptz ||
// 				g_brand.pantilt == g_defbrand.ptz)
// 			{
// 				$("#focusAssist").css("display", "none");
// 			}
// 			else
// 			{
// 				$("#focusAssist").css("display", "block");
// 			}
// 		}
// 	}	
	
// 	if(g_brand.diCount == 0 && g_brand.doCount == 0)
// 	{
// 		$("#dido").css("display", "none");
// 	}

// 	var isSerialPort = false;
// 	if(!(g_brand.rs485 == 0 && g_brand.rs232c == 0 && g_brand.rs422 == 0))
// 		isSerialPort = true;
		
// 	if(g_brand.pir == 0 && 
// 		g_brand.diCount == 0 && 
// 		g_brand.doCount == 0 && 
// 		isSerialPort == false)
// 	{
// 		$("#leftmenu .peripheral_Contents").css("display", "none");
// 	}

// 	if (g_brand.cameraClass == "encoder")
// 	{
// 		$("#Camera_Contents").css("display","none");
// 		$("#Videoin_Contents").css("display","block");
// 	}
// 	else
// 	{
// 		$("#Camera_Contents").css("display","block");
// 		$("#Videoin_Contents").css("display","none");
// 	}

// 	var isSpeedDome = false;
// 	if(g_brand.pantilt == g_defbrand.type1ptz || g_brand.pantilt == g_defbrand.irptz || g_brand.pantilt == g_defbrand.ptz || g_brand.pantilt == g_defbrand.thermal1)
// 		isSpeedDome = true;	 
		
// 	if(isSpeedDome == true)
// 	{
// 		if(g_brand.imgDevice != "mz2251-5x" && g_brand.imgDevice != "mz2307") // IPN5502
// 			$("#privacymask").css("display", "none");

// 		if(g_brand.pantilt == g_defbrand.irptz)
// 		{
// 			$("#privacymask3d_wmk").css("display", "block");
// 		}
// 		else
// 		{
// 			if(g_brand.pantilt != g_defbrand.ptz)
// 				$("#privacymask3d").css("display", "block");
// 		}
// 		$("#ptz").css("display", "block");
// 	}
	
// 	if(isSpeedDome == false && isSerialPort == true)
// 	{
// 		$("#uart").css("display", "block");
// 		$("#protocol").css("display", "block");		 
// 	}
// 	else 
// 	{
// 		$("#uart").css("display", "none");
// 		$("#protocol").css("display", "none");
// 	}

// 	if(isSpeedDome == false && isSerialPort == false)
// 	{
// 		$("#leftmenu .ptzContents").css("display", "none");
// 	}
// 	else
// 	{
// 		$("#leftmenu .ptzContents").css("display", "block"); 
// 	}
	
// 	if (g_brand.usb == 0 && g_brand.sd == 0)
// 	{
// 		$(".storage_TopMenu").css("display", "none");
// 		$(".storageContents").css("display", "none");
// 	}

// 	jqDisplayCtrl("#wirelesslan", g_brand.wifi == 1);
// 	jqDisplayCtrl("#pir", g_brand.pir == 1);
// 	jqDisplayCtrl("#Videoout_Contents", g_support.videoout == true);
// 	jqDisplayCtrl("#touring", g_support.touringMenu == true);
// 	jqDisplayCtrl("#autorun", g_brand.autorun == g_defbrand.existautorun);
// 	jqDisplayCtrl("li.usbsd_Contents", g_brand.usb != 0);
// 	jqDisplayCtrl("li.sd_Contents", g_brand.usb == 0);
// 	jqDisplayCtrl("li.faceContents", g_brand.lensType != "fisheye");

// 	if("rs51c0b" == g_brand.imgDevice||
// 		"mdc200s" == g_brand.imgDevice ||
// 		"mdc600s" == g_brand.imgDevice)
// 	{
// 		$("#Camera_Contents, #Videoin_Contents, #wirelesslan").css("display","none");
// 		$(".motionContents, .faceContents, .eProfileContents").css("display","none");
// 	}

// 	if("seek-thermal" == g_brand.imgDevice)
// 	{
// 		jqDisplayCtrl($(".faceContents"), false);
// 		jqDisplayCtrl($("#focusAssist"), false);
// 	}

// 	if(g_support.tamarisk)
// 	{
// 		jqDisplayCtrl($(".faceContents"), false);
// 		jqDisplayCtrl($("#focusAssist"), false);
// 	}

// 	if(g_brand.soctype == "dm368")
// 	{
// 		jqDisplayCtrl($(".faceContents"), false);
// 		jqDisplayCtrl($("#focusAssist"), false);
// 	}

// 	jqDisplayCtrl("#heater", g_support.tamarisk);
// 	jqDisplayCtrl(".presetScheduleContent", g_support.presetSchedule);
// }

// function initOEM()
// {
// 	call_xmlData("/status/status.xml", true, function(xml){
// 		jqDisplayCtrl("#oem", $("state:first", xml).text() == "oem");
// 	});

// 	call_xmlData("/status/package.xml", true, function(xml){
// 		var installStatus = jqGetXmlData('package install', xml);
// 		var nameStatus = jqGetXmlData('package name', xml, false);
// 		jqDisplayCtrl(".thirdmngrContent", installStatus == "success");
// 		$(".thirdmngrContent a").text(nameStatus);
// 	});
// }

// var g_isPrivacyMask = false;
// function unloadCheckPrivacyMask(page)
// {
// 	if(g_isPrivacyMask)
// 	{
// 		if(page != "privacymask3d_wmk.html")
// 			g_isPrivacyMask = false;

// 		return -1;
// 	}

// 	if(g_isPrivacyMask == false && page == "privacymask3d_wmk.html")
// 	{
// 		g_isPrivacyMask = true;
// 	}

// 	return 0;
// }

// function clrPrivacy_setting(index)
// {
// 	var packet = new Array();
// 	packet[0] = 0xFF;
// 	packet[1] = 0x01;
// 	packet[2] = 0x40;
// 	packet[3] = 0xE1;
// 	packet[4] = 0x30;
// 	packet[5] = Number(index);
// 	packet[6] = clrPrivacy_getCheckSum(packet);

// 	clrPrivacy_actionSerialFCGI(clrPrivacy_makePacketString(packet), 500);
// }

// function clrPrivacy_makePacketString(array)
// {
// 	var strPacket = "";

// 	for(i=0; i < array.length; i++)
// 	{
// 		if(array[i] < 16)
// 		{
// 			strPacket += ("0" + String(array[i].toString(16)))
// 		}
// 		else
// 		{
// 			strPacket += String(array[i].toString(16));
// 		}
// 	}

// 	return strPacket;
// }

// function clrPrivacy_actionSerialFCGI(packetStr, timeout)
// {
// 	var req = new CGIRequest();
// 	var reqQString = "write=" + packetStr + "&read=100," + timeout;

// 	req.SetAddress("/nvc-cgi/ptz/serial2.fcgi");
// 	req.SetCallBackFunc(function(xml){
// 		return;
// 	});
// 	req.Request(reqQString);
// }

// function clrPrivacy_getCheckSum(array)
// {
// 	var ckSum = "";
// 	var sum = 0;

// 	for(i=1; i < array.length; i++)
// 	{
// 		sum += Number(array[i]);
// 	}

// 	var hexStr = String(sum.toString(16));
// 	ckSum = hexStr.substring(hexStr.length -2);

// 	return ckSum;
// }

function eventBind()
{
	// Check if a VCA trial license is available, and if so popup the yellow top bar
	// to encourage the user to go and try it out
	// checkForVcaTrial();

	// window.onbeforeunload = function (e) {
	// 	if(g_isPrivacyMask)
	// 	{
	// 		var zonelist = $("#contentFrame").contents().find('#zoneList').val();
	// 		if(zonelist != 0)
	// 		{
	// 			clrPrivacy_setting(zonelist);
	// 		}
	// 	}
	// };

	$("#leftmenu li").click(function() {
		if($(this).children().attr("href"))
		{
			var retPrivacyMask = unloadCheckPrivacyMask($(this).children().attr("href"));
			if(retPrivacyMask < 0)
			{
				var zonelist = $("#contentFrame").contents().find('#zoneList').val();
				if(zonelist != 0)
				{
					clrPrivacy_setting(zonelist);
				}
			}

			$("#leftmenu li").each(function(index, element) {
				$(this).removeClass("ui-state-hover");
			});
			document.getElementById("contentFrame").height = 0;
			$("#contentFrame").attr("src", $(this).children().attr("href"));
			$(this).addClass("ui-state-hover");
			if($(this).children().attr("class") == "040401") setCookie("tmpLeftmenuDetailIndex", $("#leftmenu li").index(this), 1);
		}
		return false;
	});

	$(".left-detail-menu li").addClass("ui-widget-content");
	$(".left-detail-menu li").mouseover(function(){
		$(this).addClass("ui-state-focus");
	});
	$(".left-detail-menu li").mouseout(function(){
		$(this).removeClass("ui-state-focus");
	});

	$("ul#list li").click(function(){
		if($(this).children().attr("href"))
		{
			$("ul#list li").each(function(index, element){
				$(this).removeClass("ui-state-hover-top");
			});
			$(this).addClass("ui-state-hover-top");
		}
	});
}

// function vcaTrialAcked() {
// 	// Test if the user has already acked the VCA trial message
// 	if(typeof(Storage) !== "undefined" ) {
// 		if(localStorage['vca-trial-ack'] == undefined) {
// 			return false;
// 		}
// 	}

// 	return true;
// }

// function vcaTrialAck() {
// 	// Acknowledge the VCA trial to prevent being annoying
// 	if(typeof(Storage) !== "undefined" ) {
// 		localStorage['vca-trial-ack'] = true;
// 	}
// }

// function checkForVcaTrial() {
// 	$.ajax({
// 		url:		"/uapi-cgi/param.cgi?group=VCA.Lc*&_=" + (new Date()).getTime(),
// 		success:	function(data, textStatus, jqXHR){
// 					var licRegex = /VCA\.Lc([0-9])\.productcode=538F+/g;
// 					var results = licRegex.exec(data);
// 					if(results) {
// 						// We have a trial license, see if it's expired or not
// 						var expRegex = new RegExp("VCA\\.Lc" + results[1] + "\\.expired=yes", "g");
// 						var expired = expRegex.test(data);

// 						if(!expired) {
// 							// We have a trial license that is not expired, now check if it's already in use
// 							$.ajax({
// 								url:		"/uapi-cgi/param.cgi?group=VCA.Ch0&_=" + (new Date()).getTime(),
// 								success:	function(data, textStatus, jqXHR){
// 									var enabled = !!data.match(/VCA\.Ch[0-9]\.enable=yes/);

// 									if(!enabled) {

// 										// Check to see if the user has not already closed this bar
// 										if(!vcaTrialAcked()) {
// 											// If we get here then we have a VCA trial license installed which is not expired and
// 											// not yet enabled. Let's shout about this
// 											$("#topbar").removeClass("topbar-close")
// 											$("#topbar").addClass("topbar-open")
// 										}
// 									}
// 								}
// 							});
// 						}
// 					}
// 		}
// 	});

// }

// // This should be replaced by CAP.VCA but we don't use it in the index page yet!
// function vcaMenuToggle(useCAP) {
// //	if(!useCAP)
// 	if(CAP === undefined || !CAP.ajax.serverDataLoaded())
// 	{
// 		$.ajax({
// 			url:		"/uapi-cgi/param.cgi?group=VCA.Ch0.licenseid&_=" + (new Date()).getTime(),
// 			success:	function(data, textStatus, jqXHR){
// 						if(!!data.match(/VCA\.Ch0\.licenseid=[0-9,]+/)) {
// 							$.ajax({
// 								url:		"/uapi-cgi/param.cgi?group=VCA.Ch0.enable&_=" + (new Date()).getTime(),
// 								success:	function(data, textStatus, jqXHR){
// 											var enabled = !!data.match(/VCA\.Ch[0-9]\.enable=yes/);
// 											$.ajax({
// 												url:		"/uapi-cgi/param.cgi?group=VCA.Lc*.Sf.*&_=" + (new Date()).getTime(),
// 												success:	function(data, textStatus, jqXHR){
// 															var i					 = 0;
// 															var calibration = false;
// 															var trackingEngine = false;
// 															var tamper = false;
// 															var autotracking = false;
// 															var countdog = false;
// 															var statistics = false;
// 															var complexrules = false;
// 															var tofdevice = false;
// 															data = data.split('\n').slice(0, -1);
// 															for (i = 0; i < data.length; i++) {
// 																if(!!data[i].match(/VCA\.Lc[0-9]\.Sf\.calibration=yes/))
// 																	calibration = true;
// 																if(!!data[i].match(/VCA\.Lc[0-9]\.Sf\.trackingengine=yes/))
// 																	trackingEngine = true;
// 																if(!!data[i].match(/VCA\.Lc[0-9]\.Sf\.tamper=yes/))
// 																	tamper = true;
// 																if(!!data[i].match(/VCA\.Lc[0-9]\.Sf\.autotracking=yes/))
// 																	autotracking = true;
// 																if(!!data[i].match(/VCA\.Lc[0-9]\.Sf\.counting=yes/))
// 																	countdog = true;
// 																if(!!data[i].match(/VCA\.Lc[0-9]\.Sf\.statistics=yes/))
// 																	statistics = true;
																
// 															}
// 															if(g_brand.pantilt != g_defbrand.type1ptz && g_brand.pantilt != g_defbrand.irptz)
// 																autotracking = false;


// 															if("rs51c0b" == g_brand.imgDevice || "mdc200s" == g_brand.imgDevice || "mdc600s" == g_brand.imgDevice)
// 																tofdevice = true;
															
// 															$(".vcaLoading").toggle(false);
// 															$(".vcaLoaded").toggle(true);
// 															$(".vcaError").toggle(false);
// 															$(".vcaEnabled").toggle(enabled);
// 															$(".vcaCalibration").toggle(enabled && calibration);
// 															$(".vcaMaintenance").toggle(enabled && tofdevice);
// 															$(".vcaClassification").toggle(enabled && calibration && !tofdevice);
// 															$(".vcaSceneChange").toggle(enabled && trackingEngine && !tofdevice);
// 															$(".vcaTamper").toggle(enabled && tamper && !tofdevice);
// 															$(".vcaPtzTracking").toggle(enabled && autotracking && !tofdevice);
// 															$(".vcaCounting").toggle(enabled && countdog);
// 															$(".vcaStatistics").toggle(enabled && statistics);
															
// 														},
// 												error:		function(jqXHR, textStatus, errorThrown){
// 															$("#vcaError").html(textStatus.toUpperCase());
// 															$(".vcaLoading").toggle(false);
// 															$(".vcaLoaded").toggle(false);
// 															$(".vcaError").toggle(true);
// 														},
// 											});
// 										},
// 								error:		function(jqXHR, textStatus, errorThrown){
// 											$("#vcaError").html(textStatus.toUpperCase());
// 											$(".vcaLoading").toggle(false);
// 											$(".vcaLoaded").toggle(false);
// 											$(".vcaError").toggle(true);
// 										},
// 							});
// 						} else {
// 							$(".vcaLoading").toggle(false);
// 							$(".vcaLoaded").toggle(true);
// 							$(".vcaCalibration").toggle(false);
// 							$(".vcaMaintenance").toggle(false);
// 							$(".vcaClassification").toggle(false);
// 							$(".vcaPtzTracking").toggle(false);
// 							$(".vcaCounting").toggle(false);
// 							$(".vcaStatistics").toggle(false);
// 							$(".vcaEnabled").toggle(false);
// 						}
// 					},
// 			error:		function(jqXHR, textStatus, errorThrown){
// 						$("#vcaError").html(textStatus.toUpperCase());
// 						$(".vcaLoading").toggle(false);
// 						$(".vcaLoaded").toggle(false);
// 						$(".vcaCalibration").toggle(false);
// 						$(".vcaMaintenance").toggle(false);
// 						$(".vcaClassification").toggle(false);
// 						$(".vcaPtzTracking").toggle(false);
// 						$(".vcaCounting").toggle(false);
// 						$(".vcaStatistics").toggle(false);
// 						$(".vcaError").toggle(true);
// 					},
// 		});
// 	}
// 	else
// 	{
// 		try
// 		{
// 			var licenseData = CAP.ajax.getServerData('VCA.Ch0.licenseid');
// 			if(!!licenseData.match('[0-9,]'))
// 			{
// 				var licenses = licenseData.split(',');
// 				var enabled = CAP.ajax.getServerData('VCA.Ch0.enable') === 'yes';
// 				var i = 0;
// 				var calibration = false;
// 				var trackingEngine = false;
// 				var autotracking = false;
// 				var tamper = false;
// 				var countdog = false;
// 				var statistics = false;
// 				var complexrules = false;
// 				var tofdevice = false;
// 				for (i = 0; i < licenses.length; i++) {
// 					var licenseId = licenses[i];
// 					if(CAP.ajax.getServerData('VCA.Lc' + licenseId + '.Sf.calibration', true) === 'yes')
// 						calibration = true;
// 					if(CAP.ajax.getServerData('VCA.Lc' + licenseId + '.Sf.trackingengine', true) === 'yes')
// 						trackingEngine = true;
// 					if(CAP.ajax.getServerData('VCA.Lc' + licenseId + '.Sf.tamper', true) === 'yes')
// 						tamper = true;
// 					if(CAP.ajax.getServerData('VCA.Lc' + licenseId + '.Sf.autotracking', true) === 'yes')
// 						autotracking = true;
// 					if(CAP.ajax.getServerData('VCA.Lc' + licenseId + '.Sf.counting', true) === 'yes')
// 						countdog = true;
// 					if(CAP.ajax.getServerData('VCA.Lc' + licenseId + '.Sf.statistics', true) === 'yes')
// 						statistics = true;
					
// 				}
				
// 				if("rs51c0b" == g_brand.imgDevice || "mdc200s" == g_brand.imgDevice || "mdc600s" == g_brand.imgDevice)
// 					tofdevice = true;

// 				$(".vcaLoading").toggle(false);
// 				$(".vcaLoaded").toggle(true);
// 				$(".vcaError").toggle(false);
// 				$(".vcaEnabled").toggle(enabled);
// 				$(".vcaClassification").toggle(enabled && calibration && !tofdevice);
// 				$(".vcaMaintenance").toggle(enabled && tofdevice);
// 				$(".vcaCalibration").toggle(enabled && calibration);
// 				$(".vcaPtzTracking").toggle(enabled && autotracking && !tofdevice);
// 				$(".vcaSceneChange").toggle(enabled && trackingEngine && !tofdevice);
// 				$(".vcaTamper").toggle(enabled && tamper && !tofdevice);
// 				$(".vcaCounting").toggle(enabled && countdog);
// 				$(".vcaStatistics").toggle(enabled && statistics);
// 			}
// 			else
// 			{
// 				$(".vcaLoading").toggle(false);
// 				$(".vcaLoaded").toggle(true);
// 				$(".vcaCalibration").toggle(false);
// 				$(".vcaMaintenance").toggle(false);
// 				$(".vcaClassification").toggle(true);
// 				$(".vcaPtzTracking").toggle(false);
// 				$(".vcaEnabled").toggle(false);
// 				$(".vcaCounting").toggle(false);
// 				$(".vcaStatistics").toggle(false);
// 			}
// 		}
// 		catch(exception)
// 		{
// 			$("#vcaError").html(exception);
// 			$(".vcaLoading").toggle(false);
// 			$(".vcaLoaded").toggle(false);
// 			$(".vcaCalibration").toggle(false);
// 			$(".vcaMaintenance").toggle(false);
// 			$(".vcaClassification").toggle(false);
// 			$(".vcaPtzTracking").toggle(false);
// 			$(".vcaCounting").toggle(false);
// 			$(".vcaStatistics").toggle(false);
// 			$(".vcaError").toggle(true);
// 		}
// 	}
// }
