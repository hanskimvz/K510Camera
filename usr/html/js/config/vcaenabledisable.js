/*	This file uses JsDoc Toolkit documentation.
 *	http://code.google.com/p/jsdoc-toolkit/
 */

/**	@fileOverview This file contains the control code for the VCA enable/disable page.
 *	@author CAP
 */

/*jslint
	devel:		true,
	browser:	true,
	es5:		true,
	vars:		true,
	plusplus:	true,
	maxerr:		50,
	indent:		4,
 */

/*global
	CAP,
	CAP.VCA,
 */
(function (CAP, VCA, window, undefined) {
	
	'use strict';
	// Local copies of the window objects for speed
	var document	= window.document;
	var navigator	= window.navigator;
	var location	= window.location;
	var $ = window.$;	
	
	// Check the CAP namespace has been included
	if ((CAP === undefined) ||
			(VCA === undefined) ||
			($ === undefined)) {
		console.error('CAP.VCA: Error: You must include the base CAP library, VCA and jQuery');
		return;
	}
	
	// Stream Usage
	$.ajax({
		url: "/uapi-cgi/resource.cgi?mode=js" + "&_=" + (new Date()).getTime(),
		datatype: "script",
		success: function(){
			page.members.resourceReady = true;
			CAP.logging.info('Resource is ready.');
			top.$(window.top).trigger('resourceReady'); 
		},
		error: function(){
			page.members.resourceReady = true;
			CAP.logging.info('Resource request failed.');
			top.$(window.top).trigger('resourceReady'); 
		}
	});

	var page = {};

	page.defines = {};

	page.enums = {};

	page.members =
		{
			channelNo: 0,

			resourceReady: false
		};

	page.eventCallback =
		{
			submit: function (event) {
				try {
					CAP.logging.verbose('Applying');

					if(!page.members.resourceReady) {
						top.$(window.top).bind('resourceReady', page.eventCallback.submit);
						CAP.logging.info('Resource not ready.  Submit request is waiting for \'resourceReady\' event');
						return;
					}
					CAP.logging.info('Resource ready. Going to Submit');

					//Remove the listeners:
					top.$(window.top).unbind('resourceReady', page.eventCallback.submit);

					if("seek-thermal" == parent.g_brand.imgDevice)
					{
						var limitResolutionList = ["960x540", "1024x768", "xga", "1120x630", "1280x720"];
						var secondStreamEnable = CAP.ajax.getServerData('ENCODER.Ch0.Videocodec.St1.enable');
						var snapshotResolution = CAP.ajax.getServerData('ENCODER.Ch0.Snapshot.resolution');
						var firstStreamStandard = CAP.ajax.getServerData('ENCODER.Ch0.Videocodec.St0.standard');
						firstStreamStandard = firstStreamStandard.substring(0,1).toUpperCase() + firstStreamStandard.substring(1);
						var firstStreamResolution = CAP.ajax.getServerData('ENCODER.Ch0.Videocodec.St0.' + firstStreamStandard + '.resolution');
						var isLimit = false;

						if(secondStreamEnable == 'yes' && ($('#formVcaEnable').attr('checked') == true))
						{
							$.each(limitResolutionList, function(index, value){
								if(firstStreamResolution == value || snapshotResolution == value)
								{
									isLimit = true;
									return false;
								}
							});

							if(isLimit)
							{
								alert(GetMsgLang("04050130"));
								return;
							}
						}
					}

					// Check Usage
					var localResUsed = 0;
					if(typeof(resUsed) != "undefined") localResUsed = resUsed;
					if((localResUsed >= 50) && ($('#formVcaEnable').attr('checked') == true))
					{
						//alert("VCA cannot be enabled because there is not enough spare resource to support it. Please adjust the stream settings to decrease the device load and try again.");
						alert(GetMsgLang("04050120"));
						return;
					}

					var faceDetectOnChannel = CAP.ajax.getServerData('FD.Ch0.enable');
					if(faceDetectOnChannel == 'yes')
					{
						alert(GetMsgLang("04050129"));
						return;
					}

					if( ( $('#formVcaEnable').attr('checked') == true ) )
					{
						if(VIDEOIN_CH0_CMOS_RATIO == "4:3")
						{
							var cameraType = CAP.ajax.getServerData('BRAND.Product.shortname');
							if( cameraType == 'IPN2103HD' )
							{
								if(ENCODER_CH0_VIDEOCODEC_ST0_ENABLE == 'yes' && ENCODER_CH0_VIDEOCODEC_ST1_ENABLE == 'yes')
								{
									//alert("When using 4:3 aspect ratio, second stream must be disabled before enabling VCA.");
									alert(GetMsgLang("04050121"));
									return;
								}
								if(ENCODER_CH0_SNAPSHOT_ENABLE == 'yes')
								{
									if(ENCODER_CH0_VIDEOCODEC_ST0_STANDARD == 'h264')
									{
										if(ENCODER_CH0_SNAPSHOT_RESOLUTION != ENCODER_CH0_VIDEOCODEC_ST0_H264_RESOLUTION)
										{
											//alert("When using 4:3 aspect ratio, snapshot must be disabled, or set to same resolution as primary stream, before enabling VCA.");
											alert(GetMsgLang("04050122"));
											return;
										}
									}
									if(ENCODER_CH0_VIDEOCODEC_ST0_STANDARD == 'mjpeg')
									{
										if(ENCODER_CH0_SNAPSHOT_RESOLUTION != ENCODER_CH0_VIDEOCODEC_ST0_MJPEG_RESOLUTION)
										{
											//alert("When using 4:3 aspect ratio, snapshot must either be disabled or set to same resolution as primary stream, before enabling VCA.");
											alert(GetMsgLang("04050122"));
											return;
										}
									}
								}

							}
						}
					}

					var jsonArray = [];
					var list = [];
					if(!!$('#formVcaEnable').attr('checked') !== CAP.VCA.channel[0].enable()) {
						// Check we have a VCA stream sorted out
						/*
						if((CAP.ajax.getServerData("ENCODER.Ch0.Videocodec.St1.enable") === "yes") &&
						   !!$('#formVcaEnable').attr('checked')) {
							var codecStd = CAP.ajax.getServerData("ENCODER.Ch0.Videocodec.St1.standard");
							codecStd = codecStd.charAt(0).toUpperCase() + codecStd.slice(1);
							var codecRes = CAP.ajax.getServerData("ENCODER.Ch0.Videocodec.St1." + codecStd + ".resolution");
							if(!confirm("Warning: Enabling VCA will disable the " + codecRes + ' ' + codecStd.toUpperCase() + " second stream.  Do you want to continue?")) return;
						}
						*/
						list.push(	{
										id:		'enable',
										value:	!!$('#formVcaEnable').attr('checked') ? 'yes' : 'no'
									});
					}
					if(!!$('#formObjectTrackingEnable').attr('checked') !== CAP.VCA.channel[0].enableObjectTracking()) {
						list.push(	{
										id:		'enablemovobj',
										value:	!!$('#formObjectTrackingEnable').attr('checked') ? 'yes' : 'no'
									});
					}
					if(!!$('#formCountingLineEnable').attr('checked') !== CAP.VCA.channel[0].enableCountingLine()) {
						list.push(	{
										id:		'enablecntline',
										value:	!!$('#formCountingLineEnable').attr('checked') ? 'yes' : 'no'
									});
					}
					if($('#retail').attr('checked'))
					{
						if(CAP.ajax.getServerData("VCA.Ch0.trackmode")=="surv")
						{
							CAP.ajax.setServerData([{action:'update',group:'VCA.Ch0.',entries:[{id:'trackmode',value:'people'}]}]);
						}
					}
					else
					{
						if(CAP.ajax.getServerData("VCA.Ch0.trackmode")=="people")
						{
							CAP.ajax.setServerData([{action:'update',group:'VCA.Ch0.',entries:[{id:'trackmode',value:'surv'}]}]);
						}
					}
					if(list.length) {
						jsonArray.push(
							{
								action:		'update',
								group:		'VCA.Ch' + page.members.channelNo,
								entries:	list
							}
						);
 					}
					if(!!$('#formCamShakeCancelEnable').attr('checked') !== CAP.VCA.channel[0].enableCameraShakeCancel()) {
						jsonArray.push(	
							{
								action:		'update',
								group:		'VCA.Ch' + page.members.channelNo + '.St',
								entries:	[{
											id:		'enable',
											value:	!!$('#formCamShakeCancelEnable').attr('checked') ? 'yes' : 'no'
										}]
							}
						);
					}
					if(jsonArray.length) {
						CAP.ajax.setServerData(jsonArray, true);
					}
				} catch (exception) {
				CAP.logging.error('Failed to apply settings: ' + exception);
					throw exception;
				}
			},

			restoreDefaults: function (event) {
				try {
					// Confirm restore defaults msg
					var doRestore = confirm(GetMsgLang("04050123"));

					if(doRestore) {

						CAP.logging.verbose('Restore Defaults');
						CAP.ajax.restoreServerData(
							[
								{	group: 'VCA.Ch0.enable'		},
								{	group: 'VCA.Ch0.enablemovobj'	},
								{	group: 'VCA.Ch0.enablecntline'	},
								{	group: 'VCA.Ch0.trackmode'	},
							]);
//						CAP.ajax.sendSimpleServerRequest("group=VCA.Ch0.enable&nocmd", {}, '/uapi-cgi/factory.cgi');
//						CAP.ajax.sendSimpleServerRequest("group=VCA.Ch0.enablemovobj&nocmd", {}, '/uapi-cgi/factory.cgi');
//						CAP.ajax.sendSimpleServerRequest("group=VCA.Ch0.enablecntline", {}, '/uapi-cgi/factory.cgi');
/*					page.methods.toggleElements();
					page.methods.initElements();
*/
					}
				} catch (exception) {
				CAP.logging.error('Failed to restore default settings: ' + exception);
					throw exception;
				}
			},

			updateData: function( event )
			{
				page.methods.initElements();
	 		}
		};

	page.methods = {
			init: function () {
				try {
					var object	= 0;

					CAP.logging.verbose('Initialising VCA Enable/Disable page...');

					//Start loading the config if necessary:
					CAP.loadConfig();

					// Call the common functions to show the page
					// TODO: This should be phased out in future releases.
					CAP.page.show(window);

					if(!CAP.VCA.initialized()) {
						top.$(window.top).bind('capVcaInitialized', page.methods.init);
						CAP.logging.info('VCA not initialized.  Page initialization is waiting for \'capVcaInitialized\' event');
						return;
					}

					// Stream link
					$("#streamLink").click(function(){
						parent.$("h3:eq(0) + div li:eq(3)").click();
						parent.$("h3:eq(0)").click();
						document.location.href = 'stream.html';
					});

					// Activate link
					$("#activateLink").click(function(){
						parent.$("#leftmenu a[href='activate.html']").click();
						parent.$("#leftmenu .activateContents").click();
					});

					// Camera link
					$("#cameraLink").click(function(){
						parent.$("#leftmenu .videoaudioContents + div a[href='camera.html']").click();    
						parent.$("#videoAudioMenuHeader").click();
						document.location.href = 'camera.html';
					});

					// Attach new listeners
					top.$(window.top).bind('capServerDataRefresh', page.eventCallback.updateData);

					// Bind the element functions
					$('#btnApply').button().click(page.eventCallback.submit);
					$('#btnRestoreDefaults').button().click(page.eventCallback.restoreDefaults);

					// Load VideoIn configuration and initialize the elements
					LoadParamJs("VIDEOIN&ENCODER", function(){
						CAP.ajax.reloadServerData('FD.Ch0.enable');
						CAP.ajax.reloadServerData('ENCODER.Ch0');
					});

					// Bind the toggle elements to the check boxes
					$('[type="checkbox"]').change(page.methods.toggleElements);

					// See if we have a trial license.. and if so and we're not in a trial,
					// ask the user if they want to start one
					var vcaLicensed	= !!CAP.VCA.channel[0].licenses().length;
					var trialLicense = page.methods.getTrialLicense();
					if (!vcaLicensed && trialLicense != null &&
						!page.methods.trialInProgress() &&
						!CAP.VCA.license[trialLicense].expired()) {
						//var message = "This device is not licensed, but you can enable a 45 day trial "
						//message += "to evaluate the full VCA functionality\n\n";
						//message += "Would you like to go to the activation page to enable it now?";

						var message = GetMsgLang("04050124") + "\n\n" + GetMsgLang("04050125");

						var answer = confirm(message);

						if(answer == true) {
							$('#activateLink').click();
						}
					}

					// Check if we are in a trial mode and if the trial has expired
					if (trialLicense != null) {
						if(CAP.VCA.license[trialLicense].expired()) {
							// License has expired, ask user to go to activation page to disable it
							//var message = "The VCA trial on this device has expired. In order to ";
							//message += "remove the watermark from the video, please remove the trial license.\n\n";
							//message += "Would you like to go to the activation page to do that now?";

							var message = GetMsgLang("04050126") + "\n\n" + GetMsgLang("04050125");

							var answer = confirm(message);

							if(answer == true)
								$('#activateLink').click();
						}
					}

					CAP.logging.info('VCA Enable/Disable page Initialisation...DONE!');
				} catch (exception) {
					CAP.logging.error('VCA Enable/Disable page Initialisation...FAILED: ' + exception);
					return;
				}
			},

			uninit: function () {
				//Remove event handlers:
				top.$(window.top).unbind('capVcaInitialized', page.methods.init);
				top.$(window.top).unbind('capServerDataRefresh', page.eventCallback.updateData);
			},

			toggleElements: function () {
				try {
					var vcaEnabled	= !!$('#formVcaEnable').attr('checked'),
						vcaLicensed	= !!CAP.VCA.channel[0].licenses().length,
						corridorOrVSEnabled = VIDEOIN_CH0_ROTATE_DIRECTION != 'none' ||
									VIDEOIN_CH0_VS_ST0 == 'yes' ||
									VIDEOIN_CH0_VS_ST1 == 'yes' ||
									VIDEOIN_CH0_VS_SNAPSHOT == 'yes';

					// Show the controls
					$('.vcaNotLicensed').toggle(!vcaLicensed);
					$('.vcaLicensed').toggle(vcaLicensed);
					$('.vcaEnabled').toggle(vcaLicensed && vcaEnabled);
					$('.vcaInitialising').toggle(false);
					$('.corridorOrVSEnabled').toggle(corridorOrVSEnabled);
					if(CAP.VCA.channel[0].license.features.linecounter())
					{
						$('.countingNotAllowed').attr('style', 'display:none');
					}
					else
					{
						$('.countingNotAllowed').attr('style', 'display:inline');
					}
					if(CAP.VCA.channel[0].license.features.trackingengine())
					{
						$('.trackingNotAllowed').attr('style', 'display:none');
					}
					else
					{
						$('.trackingNotAllowed').attr('style', 'display:inline');
					}
					var brandInfo = CAP.brand.getBrandInfo();
					if("rs51c0b" == brandInfo.information.videoin.imgdevice || "mdc200s" == brandInfo.information.videoin.imgdevice || "mdc600s" == brandInfo.information.videoin.imgdevice)
						$(".notTofDevice").toggle(false);
					else
						$(".notTofDevice").toggle(true);
					
					// Work out the state of the elements disabled status
					$('#formVcaEnable').attr('disabled', !vcaLicensed || corridorOrVSEnabled);
					$('#formCountingLineEnable').attr('disabled', !CAP.VCA.channel[0].license.features.linecounter());
					$('#formObjectTrackingEnable').attr('disabled', !CAP.VCA.channel[0].license.features.trackingengine());
					$('#formCamShakeCancelEnable').attr('disabled', !vcaLicensed);

					if($('#formObjectTrackingEnable').attr('checked'))
					{
						$('#surveillance').attr('disabled', false);
						$('#retail').attr('disabled', !CAP.VCA.channel[0].license.features.retailtracking());
					}
					else
					{
						$('#surveillance').attr('disabled', true);
						$('#retail').attr('disabled', true);
					}

				} catch (exception) {
					CAP.logging.error('VCA Enable/Disable page element toggling...FAILED: ' + exception);
					return;
				}
			},

			getTrialLicense: function() {
				try {
					var i = 0;
					for( i = 0; i < CAP.VCA.numberOfLicenses(); i++ ) {
						if( CAP.VCA.license[i].productCode() == "538F" ) {
							// This is a trial license
							return i;
						}
					}
				} catch (exception) {
					CAP.logging.error('VCA Enable/Disable page checkForTrial... FAILED: ' + exception );
				}
				return null;
			},

			trialInProgress: function() {
				try {
					var i = 0;
					// Iterate through all licenses assigned to the channel and see if any are trial licenses
					for( i = 0; i < CAP.VCA.channel[0].licenses().length; i++ ) {
						var licenseId = CAP.VCA.channel[0].licenses()[i];
						if( CAP.VCA.license[licenseId].productCode() == "538F" ) {
							// We do have a trial license assigned to this channel
							return true;
						}
					}
				} catch (exception) {
					CAP.logging.error('VCA Enable/Disable page trialInProgress... FAILED: ' + exception );
				}
				return false;
			},

			initElements: function () {
				try {
					// Fill in the initial state of the elements
					$('#formVcaEnable').attr('checked', CAP.VCA.channel[0].enable());
					$('#formCountingLineEnable').attr('checked', CAP.VCA.channel[0].enableCountingLine());
					$('#formObjectTrackingEnable').attr('checked', CAP.VCA.channel[0].enableObjectTracking());
					$('#formCamShakeCancelEnable').attr('checked', CAP.VCA.channel[0].enableCameraShakeCancel());
					if(CAP.ajax.getServerData("VCA.Ch0.trackmode")=="people")
						$('#retail').attr('checked',true);
					else
						$('#surveillance').attr('checked',true);

					// Set the state of them
					page.methods.toggleElements();
				} catch (exception) {
					CAP.logging.error('VCA Enable/Disable page element initialisation...FAILED: ' + exception);
					return;
				}
			}
		};


	call_xmlData("/environment.xml", true, runEnvironment);

	// Page is initialised once this func is called back
	function runEnvironment(xml) {
		var classNum = [
			"04050120", "04050121", "04050122",
			"04050123", "04050124", "04050125",
			"04050126", "04050129", "04050130"
		];

		InitMsgLang(classNum);

		var lang = jqGetXmlData('lang', xml, false);
		getLangXml(lang, setup + maincontents + "enabledisable", page.methods.init);
	}

	// Finalise the page when the DOM unloads
	$(window).unload(page.methods.uninit);
}(CAP, CAP.VCA, window));
