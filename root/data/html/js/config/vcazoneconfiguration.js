/*	This file uses JsDoc Toolkit documentation.
 *	http://code.google.com/p/jsdoc-toolkit/
 */

/**	@fileOverview This file contains the control code for the VCA Zones and Rules page.
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
	// Language static elements
	getLangEnvironment("zonesandrules");
	
	'use strict';
	// Local copies of the window objects for speed
	var $ = window.$;
	var document	= window.document;
	var navigator	= window.navigator;
	var location	= window.location;

	// Check the CAP namespace has been included
	if ((CAP === undefined) ||
			(VCA === undefined) ||
			($ === undefined)) {
		console.error('CAP.VCA: Error: You must include the base CAP library, VCA and jQuery');
		return;
	}

	var page = {};

	page.defines = {};

	page.enums = {};

	/**	Private members
	 *	@namespace	Private members
	 *	@private
	 *	@since Version 0.1.0
	 */
	page.members =
		{
			VCADataMgrHandle : -1,
			VCAAudioVideoHandle : -1,
			VCAViewHandle : -1,
			VCARenderHandle : -1,
			VCAAlarmLogHandle : -1,
			VCAEventSettingsHandle : -1,

			pageLoaded : 0,
			previousWidth : 0,
			vcaDirty : false,
			pageResized : false,
//			waitingForSave : 0
		};

	page.eventCallback =
		{
			timerHangle : null,

			submit: function (event) {
				try {
//					waitingForSave = 1;
					//Disable buttons
					page.methods.activateButtons(false);

					CAP.logging.verbose('Applying');
					CAP.player.requestServerData(page.members.VCADataMgrHandle);
				} catch (exception) {
					CAP.logging.error('Failed to apply settings: ' + exception);
					throw exception;
				}
			},

			restoreDefaults: function (event) {
				try {
					var cameraType = CAP.ajax.getServerData('SYSTEM.Properties.Hardware.pantilt');
					var isRS485 = CAP.ajax.getServerData('SYSTEM.Properties.Hardware.rs485');
					var isPTZCamera = (cameraType === 'SPEED TYPE 1') || (cameraType === 'REPOSITIONING') || (cameraType === 'PTZ') || (isRS485 === '1');
					var profilesAreInUse = isPTZCamera && CAP.ajax.getServerData('VCA.Ch0.nbrofprofile') > 0;

					if(profilesAreInUse) {
//						var warningMsg = "WARNING: This will restore all zones/rules/counters settings for the current profile to their default values. All zones/rules/counters of the current profile will be removed! The profile itself will remain. Are you sure you want to continue?";
						var warningMsg = top.GetMsgLang("04050218");
					}
					else {
//						var warningMsg = "WARNING: This will restore all zones/rules/counters settings to their default values. All zones/rules/counters will be removed! Are you sure you want to continue?";
						var warningMsg = top.GetMsgLang("04050217");
					}

					var doRestore = confirm(warningMsg);

					if(doRestore) {
						CAP.logging.verbose('Restore Defaults');
						CAP.player.restoreDefaultsZonesRulesCounters(page.members.VCADataMgrHandle);
						// No longer dirty
						page.members.vcaDirty = false;
						//Disable buttons
						page.methods.activateButtons();
					}

				} catch (exception) {
				CAP.logging.error('Failed to restore default settings: ' + exception);
					throw exception;
				}
			},

			
			loadData : function (event) {
				try {
					var serverDataXml = CAP.ajax.getAllServerDataXml();
					CAP.player.provideServerData(page.members.VCADataMgrHandle, serverDataXml);
				} catch (exception) {
					CAP.logging.error('Failed to update data: ' + exception);
					throw exception;
				}
			},


			serverDataSet : function (event) {
				//Re-enable buttons
			//	page.methods.activateButtons(true);
//				if(waitingForSave)
//				{
//					page.methods.saveProfile();
//					waitingForSave = 0;
//				}

				// No longer dirty
				page.members.vcaDirty = false;
				//Disable buttons
				page.methods.activateButtons();
			},

			activeXEvent : function(szType, szValue)
			{
				if(szType == "VCA_DATA")
				{
					CAP.logging.info(szValue);
					var axCommands = $.parseJSON(szValue);

					if(axCommands.length > 0)
						CAP.ajax.setServerData(axCommands);
					else
					{
						page.members.vcaDirty = false;
					}
				}
				else
				if(szType == "VCA_AT_TRACK")
				{
					CAP.logging.info(szValue);
					var jsonArr = $.parseJSON(szValue);

					if(jsonArr.length > 0)
						CAP.ajax.setServerData(jsonArr, false);
				}
				else
				if( szType == "VCA_DIRTY")
				{
					// VCA data is dirty - this means that a change has been made
					page.members.vcaDirty = true;

					// Now enable the buttons so a change can be made
					page.methods.activateButtons();

				}
				else
				if( szType == "VCA_RELOAD_PROFILE")
				{
					page.methods.updatePTZPreset();
					CAP.ajax.reloadServerData("VCA.Ch0.curprofile");
				}
			}
		};

	page.methods = {
			init: function () {
				try {
					var object	= 0;

					CAP.logging.verbose('Initialising VCA Zones and Rules page...');
					
					//Start loading the config if necessary:
					CAP.loadConfig();
					
					// Resize the page elements:
					if($.browser.msie && $.browser.version == '8.0')
					{
						page.members.pageResized = false;
					}
					page.methods.resizePage();

					// Call the common functions to show the page
					// TODO: This should be phased out in future releases.
					CAP.page.show(window);

					//Check that the player has initialised: 
					if(!CAP.player.initialized()) {
						top.$(window.top).one('capPlayerInitialized', page.methods.init);
						CAP.logging.info('Player not initialized.  Page initialization is waiting for \'capPlayerInitialized\' event');
						return;
					}
					
					//Check that the data has loaded:
					if(!CAP.ajax.serverDataLoaded()) {
						top.$(window.top).one('capServerDataLoaded', page.methods.init);
						CAP.logging.info('Server data not initialized.  Page initialization is waiting for \'capServerDataLoaded\' event');
						return;
					}

					//Attach new listeners:
					top.$(window.top).bind('capServerDataLoaded', page.eventCallback.loadData);
					top.$(window.top).bind('capServerDataRefresh', page.eventCallback.loadData);

					//Make the status update whenever the server data is refreshed:
					top.$(window.top).bind('capAjaxMessageHide', page.eventCallback.serverDataSet);

					//Check if changes need to be applied when moving away from page
					top.$("a").bind('click', page.methods.confirmDiscardWork);
					//Don't discard when switching between tabs:
					$("#AxUMF_link").unbind('click', page.methods.confirmDiscardWork);
					$("#ComplexRuleSetting_link").unbind('click', page.methods.confirmDiscardWork);
					$("#ComplexRuleSetting_link").bind('click',page.methods.updateComplexRulesProfile);

					// Freeze the defines so the values cannot be changed
					CAP.logging.debug('Freezing ' + page.defines.length + ' defines');
					for (object = 0; object < page.defines.length; object++) {
						Object.freeze(page.defines[object]);
					}

					// Freeze the enums so the values cannot be changed
					CAP.logging.debug('Freezing ' + page.enums.length + ' enums');
					for (object = 0; object < page.enums.length; object++) {
						Object.freeze(page.enums[object]);
					}

					// Bind the element functions
					$('#btnApply').button().click(page.eventCallback.submit);
					$('#btnRestoreDefaults').button().click(page.eventCallback.restoreDefaults);
					//$('#btnLoadProfile').button().click(page.eventCallback.loadProfile);
					//$('#btnSaveProfile').button().click(page.eventCallback.saveProfile);

					// Initialize the elements
					page.methods.toggleElements();

					// Initialize the elements
					page.methods.initElements();

					$("#rule_tabs").tabs({				
						select: function(event, ui)
						{
							switch(ui.index)
							{							
							case 0:
								$("#AxUMF").toggle(true);								
								$("#ComplexRuleSetting").toggle(false);								
								$("#ptz-control").toggle(true);								
								$("#screenTools").toggle(true);
								page.methods.toggleElements();							
								break;							
							case 1:
								$("#AxUMF").toggle(false);								
								$("#ComplexRuleSetting").toggle(true);								
								$("#ptz-control").toggle(false);								
								$("#screenTools").toggle(false);								
								break;							
							}						
						},

						show: function(event, ui)
						{
							switch(ui.index)
							{							
							case 0:						
								if($.browser.msie && $.browser.version == '8.0')
								{
									page.members.pageResized = false;
								}
								page.methods.resizePage();
								break;							
							case 1:								
								top.$(window.top).resize();
								break;							
							}						
						},
					});

					// Add activeX player
					CAP.player.addPlayer(document.getElementById('AxUMF'), page.methods.setupPlayer);

					//Add PTZ Control
					page.methods.addPTZControl();

					//Set flag to avoid problems due to early resize messages:
					page.members.pageLoaded = 1;
					if($.browser.msie && $.browser.version == '8.0')
					{
						page.members.pageResized = false;
					}
					page.methods.resizePage();

					CAP.logging.info('VCA Zones and Rules page Initialisation...DONE!');
				} catch (exception) {
					CAP.logging.error('VCA Zones and Rules page Initialisation...FAILED: ' + exception);
					return;
				}
			},

			uninit: function () {
				try {
					//Detach event handler
					CAP.player.detachEvent(page.eventCallback.activeXEvent);

					if(CAP.player.isSetup()) {
						//Disconnect UMFBlocks
						CAP.player.disconnectUMFBlocks(page.members.VCAViewHandle, page.members.VCARenderHandle,"RENDER");
						CAP.player.disconnectUMFBlocks(page.members.VCAAudioVideoHandle, page.members.VCAViewHandle, "RENDER");
						CAP.player.disconnectUMFBlocks(page.members.VCAViewHandle, page.members.VCADataMgrHandle, "DATAMANAGER");
						CAP.player.disconnectUMFBlocks(page.members.VCAAlarmLogHandle, page.members.VCAViewHandle, "METADATA");
						CAP.player.disconnectUMFBlocks(page.members.VCAEventSettingsHandle, page.members.VCADataMgrHandle, "DATAMANAGER");
					}
					// Stop player/remove it from container element
					CAP.player.removePlayer(document.getElementById('AxUMF'));

					// Revert page style changes
					page.methods.resetPageSize();

					//Remove event handlers:
					top.$(window.top).unbind('capServerDataLoaded', page.eventCallback.loadData);
					top.$(window.top).unbind('capServerDataRefresh', page.eventCallback.loadData);
					top.$(window.top).unbind('capAjaxMessageHide', page.eventCallback.serverDataSet);
					top.$("a").unbind('click', page.methods.confirmDiscardWork);
					top.$(window.top).unbind('resize', page.methods.resizePage);
					top.$("#ComplexRuleSetting_link").unbind('click', page.methods.updateComplexRulesProfile);

					//Unset flag to avoid problems due to late resize messages:
					page.members.pageLoaded = 0;
				} catch (exception) {
					CAP.logging.error('VCA Zones and Rules page element finalisation...FAILED: ' + exception);
					return;
				}
			},

			toggleElements: function () {
				try {
					var vcaEnabled	= CAP.VCA.channel[0].enable();
					
					// Show the controls
					$('.vcaInitialising').toggle(false);
					$('.vcaDisabled').toggle(!vcaEnabled);
					$('.vcaEnabled').toggle(vcaEnabled);

					// Work out the initial state of the elements disabled status
					$('.vcaElement').attr('disabled', !vcaEnabled);

					// Enable the buttons
				//	page.methods.activateButtons(vcaEnabled);

					//Enable PTZ
					var ptzEnabled = window.ActiveXObject !== undefined &&
							( CAP.ajax.getServerData('SYSTEM.Properties.Hardware.rs485') === '1'
							|| CAP.ajax.getServerData('SYSTEM.Properties.Hardware.pantilt') === 'REPOSITIONING'
							|| CAP.ajax.getServerData('SYSTEM.Properties.Hardware.pantilt') === 'SPEED TYPE 1'
							|| CAP.ajax.getServerData('SYSTEM.Properties.Hardware.pantilt') === 'PTZ');
					$('.ptzDisabled').toggle(!ptzEnabled);
					$('.ptzEnabled').toggle(ptzEnabled);

					//Disable complex rules UI
					var complexRulesEnabled = CAP.VCA.channel[0].license.features.complexrules();
					$('.css-tabs').toggle(complexRulesEnabled);
					$('#ComplexRuleSetting').toggle(complexRulesEnabled);
				} catch (exception) {
					CAP.logging.error('VCA Zones and Rules page element toggling...FAILED: ' + exception);
					return;
				}
			},

			activateButtons: function (activeState) {
				if(typeof(activeState) === "undefined")
					activeState = page.members.vcaDirty;
				// Enable the buttons
				$('#btnApply').button('option', 'disabled', !activeState);
			},

			initElements: function () {
				try {
/*
					// Fill in the initial state of the elements
					$('#formCountingLineEnable').attr('checked', CAP.VCA.channel[0].enableCountingLine());
					$('#formObjectTrackingEnable').attr('checked', CAP.VCA.channel[0].enableObjectTracking());
*/
				} catch (exception) {
					CAP.logging.error('VCA Zones and Rules page element initialisation...FAILED: ' + exception);
					return;
				}
			},

			setupPlayer: function () {
				try {
					//Attach event handler
					CAP.player.attachEvent(page.eventCallback.activeXEvent);

					//Change the NVView
					CAP.player.initUMFBlockContainer();

					// Create UMFBlocks
					page.members.VCADataMgrHandle = CAP.player.createVCADataManagerBlock();
					page.members.VCAAudioVideoHandle = CAP.player.createAVDecoderBlock();
					page.members.VCAViewHandle = CAP.player.createVCADialogBlock();
					page.members.VCARenderHandle = CAP.player.createRenderBlock();
					page.members.VCAAlarmLogHandle = CAP.player.createVCAAlarmLogBlock();
					page.members.VCAEventSettingsHandle = CAP.player.createVCAZoneTreeBlock();

					//Connect UMFBlocks
					CAP.player.connectUMFBlocks(page.members.VCAViewHandle, page.members.VCARenderHandle,"RENDER");
					CAP.player.connectUMFBlocks(page.members.VCAAudioVideoHandle, page.members.VCAViewHandle, "RENDER");
					CAP.player.connectUMFBlocks(page.members.VCAViewHandle, page.members.VCADataMgrHandle, "DATAMANAGER");
					CAP.player.connectUMFBlocks(page.members.VCAAlarmLogHandle, page.members.VCAViewHandle, "METADATA");
					CAP.player.connectUMFBlocks(page.members.VCAEventSettingsHandle, page.members.VCADataMgrHandle, "DATAMANAGER");

					//Position UMFBlocks
					if($.browser.msie && $.browser.version == '8.0')
					{
						page.members.pageResized = false;
					}
					page.methods.resizePage();

					//Setup the User Interface
					CAP.player.enableConfigurationUI(page.members.VCAViewHandle);

					//Load Server Data
					var serverDataXml = CAP.ajax.getAllServerDataXml();
					CAP.player.provideServerData(page.members.VCADataMgrHandle, serverDataXml);
					page.methods.updatePTZPreset();
				} catch (exception) {
					CAP.logging.error('VCA Zones and Rules player setup...FAILED: ' + exception);
					return;
				}
			},

			getAspectRatio: function ()
			{
				var standard = CAP.ajax.getServerData('ENCODER.Ch0.Videocodec.St0.standard');
				var resolution = "16x9";
				if(standard === "h264")
				{
					resolution = CAP.ajax.getServerData('ENCODER.Ch0.Videocodec.St0.H264.resolution');
				}
				else if(standard === "mjpeg")
				{
					resolution = CAP.ajax.getServerData('ENCODER.Ch0.Videocodec.St0.Mjpeg.resolution');
				}
				var videoStandard = CAP.ajax.getServerData('SYSTEM.Status.Videoin.Ch0.standard');
				resolution = translateResolution(videoStandard, resolution);
				return resolution.split("x");
			},

			resizePage: function () 
			{
				if(page.members.pageLoaded == undefined || page.members.pageLoaded == 0)
				{
					return;
				}

				if($.browser.msie && $.browser.version == '8.0' && page.members.pageResized == true)
				{
					return;
				}
				
				try {
					//Update frame and right elements dimensions
					if(top.$('#left').length)
						var leftWidth = top.$('#left').width() + 20;
					else
						var leftWidth = 0;

					top.$('#frame').css({
						"max-width" : "none",
						"min-width" : "885px",
						"width" : "100%",
						"overflow" : "hidden"
					});
					top.$('#right').css({
						"max-width" : "none",
						"width" : "auto",
						"margin-left" : leftWidth,
						"float" : "none"
					});

					//Compute boundaries
					var axPadding = $('#AxUMF').outerWidth(true) - $('#AxUMF').width();
					var axHeight = 1;
					var axWidth = 1;

					if(top.$('#right').length)
						axWidth = top.$('#right').width() - axPadding;
					else if(typeof(top.window.innerWidth) !== "undefined")
						axWidth = top.window.innerWidth - axPadding;
					else
						axWidth = top.$('body').parent().width() - axPadding;

					if(top.$('#right').length)
						var usedHeight = top.$('#right').offset().top + 
								 (top.$('#right').outerHeight(true) - top.$('#right').outerHeight()) + 
								 $('#AxUMF').offset().top + 
								 2*axPadding + 
								 $('#ptz-control').outerHeight() + 
								 $('#screenTools').outerHeight();
					else
						var usedHeight = $('#AxUMF').offset().top + 
								 2*axPadding + 
								 $('#ptz-control').outerHeight() + 
								 $('#screenTools').outerHeight();

					if(typeof(top.window.innerHeight) !== "undefined")
					{
						axHeight = top.window.innerHeight - usedHeight;
					}
					else //IE8
					{
						axHeight = top.$('body').parent().height() - usedHeight;
					}

					//Video aspect ratio
					var aspectRatio = page.methods.getAspectRatio();
					var videoRatio = aspectRatio[0] / aspectRatio[1];

					//Compute absolute dimensions
					var alarmHeight = 0;
					var treeWidth = 0;
					var videoWidth = 0;
					var videoHeight = 0;

					//Compute tree controller dimensions
					var minTreeWidth = 300;
					var treeWidth = 0.25 * axWidth;
					if(treeWidth < minTreeWidth)
						treeWidth = minTreeWidth;

					//Compute alarm log dimensions
					var minAlarmHeight = 100;
					var alarmHeight = 0.25 * axHeight;
					if(alarmHeight < minAlarmHeight)
						alarmHeight = minAlarmHeight;

					//Find restrictive direction
					var boundRatio = (axWidth - treeWidth)/(axHeight - alarmHeight);
					if(videoRatio > boundRatio)
					{
						//Width restriction
						videoWidth = axWidth - treeWidth;
						videoHeight = videoWidth / videoRatio;
						alarmHeight = axHeight - videoHeight;
					}
					else
					{
						//Height restriction
						videoHeight = axHeight - alarmHeight;
						videoWidth = videoRatio * videoHeight;
						treeWidth = axWidth - videoWidth;
					}

					//Restrict maximum width
					var maxTreeWidth = 350;
					if(treeWidth > maxTreeWidth)
					{
						treeWidth = maxTreeWidth;
						axWidth = videoWidth + treeWidth;
					}

					//Resize the activeX
					$('#AxUMF').css({
						"height" : axHeight,
						"width" : axWidth
					});

					//Resize the blocks
					if(page.members.VCAViewHandle >= 0)
						CAP.player.positionUMFBlock(page.members.VCAViewHandle, 0, 0, videoWidth/axWidth, videoHeight/axHeight);
					if(page.members.VCAAlarmLogHandle >= 0)
						CAP.player.positionUMFBlock(page.members.VCAAlarmLogHandle, 0, videoHeight/axHeight, videoWidth/axWidth, alarmHeight/axHeight);
					if(page.members.VCAEventSettingsHandle >= 0)
						CAP.player.positionUMFBlock(page.members.VCAEventSettingsHandle, videoWidth/axWidth, 0, treeWidth/axWidth, 1);

					//Resize the page
					var resizeHeight = $('#config-page').outerHeight(true);
					ResizePage(resizeHeight);
					if($.browser.msie && $.browser.version == '8.0')
					{
						page.members.pageResized = true;
					}

				} catch (exception) {
					CAP.logging.error('VCA Zones and Rules page formating...FAILED: ' + exception);
					return;
				}
			},

			resetPageSize : function ()
			{
				top.$('#frame').css({
					"min-width" : "",
					"width" : "885px",
					"overflow" : "visible"
				});
				top.$('#right').css({
					"width" : "665px",
					"margin-left" : "0px",
					"float" : "right"
				});
			},

			loadProfile : function (event) {
				profileNumber = CAP.ajax.getServerData('VCA.Ch0.id',true);
				if(profileNumber == null)
				{
					profileNumber = "0";
				}
				if(profileNumber !== "")
				{
					CAP.ajax.setServerData([{action:'update',group:'VCA.Ch0',entries:[{id:'loadProfile',value:profileNumber}]}]);
				}
			},

			saveProfile : function (event) {
				profileNumber = CAP.ajax.getServerData('VCA.Ch0.id',true);
				if(profileNumber == null)
				{
					profileNumber = "0";
				}
				if(profileNumber !== "" && profileNumber != "-1")
				{
					CAP.ajax.setServerData([{action:'update',group:'VCA.Ch0',entries:[{id:'saveProfile',value:profileNumber}]}]);
				}
			},

			addPTZControl : function ()
			{
				//Setup colapsible link
				$('#ptz-control').accordion({
					active: false,
					collapsible: true,
					autoHeight: false,
					navigation: true,
					animated: false,
					change: function(event, ui) {
							top.$(window.top).resize();
							ResizePage($('#config-page').outerHeight(true));
							window.top.PTZControlActive = $('#ptz-control').accordion('option','active');
						}
				});
				if(window.top.PTZControlActive !== undefined) 
					$('#ptz-control').accordion({ active: window.top.PTZControlActive });
			},

			updateComplexRulesProfile : function()
			{
				CAP.ComplexRules.setProfile(CAP.ajax.getServerData("VCA.Ch0.curprofile"));
			},

			confirmDiscard : function(workJson) {
//				var doDiscard = confirm("There are unsaved changes on this page\nClick OK to discard your changes and carry on\nClick Cancel to go back");
				var doDiscard = confirm(top.GetMsgLang("04050216").replace(/\\n/g,"\n"));

				if(doDiscard) {
					try {
						var ret = CAP.player.revertChanges(page.members.VCADataMgrHandle);
						if(ret === page.members.VCADataMgrHandle)
							page.members.vcaDirty = false;
						if(workJson && workJson.onDiscard !== undefined && 'function' === typeof (workJson.onDiscard))
							workJson.onDiscard();	
					} catch (exception) {
						if(workJson && workJson.onCancel !== undefined && 'function' === typeof (workJson.onCancel))
							workJson.onCancel();				
					}
				}
				else {
					if(workJson && workJson.onCancel !== undefined && 'function' === typeof (workJson.onCancel))
						workJson.onCancel();				
				}

				return doDiscard;
			},

			confirmDiscardComplexRule : function() {
				var doDiscard = confirm(top.GetMsgLang("04050219").replace(/\\n/g,"\n"));

				if(doDiscard)
					CAP.ComplexRules.restoreWork();	

				return doDiscard;				
			},

			confirmDiscardWork : function(workJson) {
				var allClean = true;

				//Check to see if any of the zones/rules managed by the ActiveX have changed and if so confirm whether or nor to discard:
				if(page.members.vcaDirty)
				{
					if(workJson && workJson.onDirty !== undefined && 'function' === typeof (workJson.onDirty))
						workJson.onDirty();				
					allClean = page.methods.confirmDiscard(workJson);
				}
				else
				{
					if(workJson && workJson.onClean !== undefined && 'function' === typeof (workJson.onClean))
						workJson.onClean();				
				}
				
				//Check to see if a complex rules is currently being edited and if so confirm whether or nor to discard:
				if(CAP.ComplexRules.getChanges().length > 0)
					if(!page.methods.confirmDiscardComplexRule())
							allClean = false;

				return allClean;
			},

			updatePTZPreset : function() {
				try {
					if(CAP.ajax.getServerData('SYSTEM.Properties.Hardware.rs485') === '1' || 
					   CAP.ajax.getServerData('SYSTEM.Properties.Hardware.pantilt') === 'SPEED TYPE 1' ||
					   CAP.ajax.getServerData('SYSTEM.Properties.Hardware.pantilt') === 'REPOSITIONING' ||
					   CAP.ajax.getServerData('SYSTEM.Properties.Hardware.pantilt') === 'PTZ') {
						var uri = '/nvc-cgi/ptz/ptz2.fcgi';
						if(CAP.ajax.getServerData('SYSTEM.Properties.Hardware.pantilt') === 'REPOSITIONING')
							uri = '/uapi-cgi/uptz.fcgi';
						CAP.ajax.sendSimpleServerRequest(
							"query=curpreset", 
							{
								callbackSuccess:	function (data, textStatus, jqXHR) {
									var curPreset = parseInt(data.slice(data.indexOf("=")+1));
									if(curPreset == NaN || curPreset < -1 || 255 < curPreset)
										curPreset = -1;
									CAP.player.setPreset(page.members.VCADataMgrHandle, curPreset);
								}
							}, 
							uri);
					}
				} catch (exception) {
					CAP.logging.error('VCA Zones and Rules update PTZ Preset...FAILED: ' + exception);
					return;
				}
			},
		};

	// Initialise the page when the DOM loads
	$(window).ready(page.methods.init);
	// Finalise the page when the DOM unloads
	$(window).unload(page.methods.uninit);
	// Update elements' size
	$(window).resize(page.methods.resizePage);

	window.PtzContainer = {
		getDataMgrHandler : function () {
			return page.members.VCADataMgrHandle;
		},
		submitDirectly : function() {
			page.eventCallback.submit();
		},
		confirmDiscardWork : function(doWork) {
			return page.methods.confirmDiscardWork(doWork);
		},
		forceResize : function() {
			if($.browser.msie && $.browser.version == '8.0')
			{
				page.members.pageResized = false;
			}
			return page.methods.resizePage();
		},
	};
}(CAP, CAP.VCA, window));
