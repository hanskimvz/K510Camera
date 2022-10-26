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
	// Language
	getLangEnvironment("calibration");
	
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

	var METRESTOFEET = 3.2808399;

	var page = {};

	page.defines = {};

	page.enums = {};

	page.constructors = {
		/** A preset structure constructor*/
		Preset : function(displayName,height,fov,tilt,pan,roll)
		{
			this.displayName = displayName;
			this.height = height;
			this.fov = fov;
			this.tilt = tilt;
			this.pan = pan;
			this.roll = roll;
		}
	}

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
			
			presets : undefined,
			pageloaded : 0,
			changingPreset : false,
			updateActiveX : true,
			outstandingRequests : 0,

			previousWidth : 0,
			previousHeight : 0,
			vcaDirty : false,
			curPreset : -1

		};

	page.eventCallback =
		{
			timerHandle : null,

			simpleSubmit: function (event) {
				try {
					//Disable buttons
					page.methods.activateButtons(false);

					CAP.logging.verbose('Applying');

					CAP.player.requestServerData(page.members.VCADataMgrHandle);
					setTimeout(page.eventCallback.startRefresh,5000);//Refresh after 5 seconds so that the status gets updated
				} catch (exception) {
					CAP.logging.error('Failed to apply settings: ' + exception);
					throw exception;
				}
			},

			submit: function (event) {
				try {
					CAP.player.setCalibParams( page.members.VCADataMgrHandle, {mode:"params"} );
				} catch (exception) {
					CAP.logging.error('Failed to send calibrate notification to the ActiveX control: ' + exception);
				}
				page.eventCallback.simpleSubmit();
			},

			uncalibrate: function (event) {
				try {
					if(!confirm("WARNING: This will remove all the calibration settings. All current settings will be lost.","Are you sure you want to continue?"))
					{
						return;
					}
					else
					{
						page.members.outstandingRequests++;

						//Disable buttons
						page.methods.activateButtons(false);

						//Send Uncalibrate command
						var numProfiles = CAP.ajax.getServerData('VCA.Ch0.nbrofprofile', false); 
						if(numProfiles === '0')
						{
							var group = 'VCA.Ch0.Cb';
						}
						else
						{
							var curProfile = CAP.ajax.getServerData( 'VCA.Ch0.curprofile' );
							var group = 'VCA.Ch0.Pr' + curProfile + '.Cb';
						}
						CAP.ajax.setServerData([{action:'update', group: group, entries: [{id:'mode',value:'uncalibrated'}]}]);
						setTimeout(page.eventCallback.startRefresh,5000);//Refresh after 5 seconds so that the status gets updated
						CAP.player.setCalibParams( page.members.VCADataMgrHandle, {mode:"uncalibrated"} );
					}
				} catch (exception) {
					CAP.logging.error('Failed to remove calibration: ' + exception);
				}
			},

			settingChanged: function (event) {
				try {
					var originator = $("[id='"+event.data+"']:text")[0];
					if(event.type == 'keyup' && window.event.keyCode == 13)
					{
						//Constrain value range
						switch(event.data)
						{
						case 'Cb.tiltangle':
							if(originator.value < -20) originator.value = -20;
							if(originator.value > 110) originator.value = 110;
							break;
						case 'Cb.vfov':
							if(originator.value < 5) originator.value = 5;
							if(originator.value > 150) originator.value = 150;
							break;
						case 'Cb.panangle':
						case 'Cb.rollangle':
							if(originator.value < -90) originator.value = -90;
							if(originator.value > 90) originator.value = 90;
							break;
						}
					}
					if((event.type == 'change') || (event.type == 'keyup' && window.event.keyCode == 13))
					{

						var calibParams = {};
						switch( originator.id )
						{
						case 'Cb.camheight':
							calibParams.camHeight = originator.value;
							break;
						case 'Cb.tiltangle':
							calibParams.tiltAngle = originator.value;
							break;
						case 'Cb.vfov':
							calibParams.vFov = originator.value;
							break;
						case 'Cb.panangle':
							calibParams.panAngle = originator.value;
							break;
						case 'Cb.rollangle':
							calibParams.rollAngle = originator.value;
							break;
						}

						if( page.members.updateActiveX == true )
						{
							CAP.player.setCalibParams( page.members.VCADataMgrHandle, calibParams );
						}
						$("#presets").val(page.methods.getPresetFromSetting());
					}
				} catch (exception) {
					CAP.logging.error('Failed to send changed setting notification to the ActiveX control: ' + exception);
				}
			},

			presetChosen : function(event) {
				var presetData = page.members.presets[parseInt($("#presets").val())];
				if($("#presets").val() != 3)
				{
					page.members.changingPreset = true;
					$("[id='Cb.camheight']").val(presetData.height).change();
					$("[id='Cb.tiltangle']").val(presetData.tilt).change();
					$("[id='Cb.vfov']").val(presetData.fov).change();
					$("[id='Cb.panangle']").val(presetData.pan).change();
					$("[id='Cb.rollangle']").val(presetData.roll).change();
					page.members.changingPreset = false;
				}
			},
			
			//called when the height (full precision) changes
			heightChanged : function(event)
			{
				$('#imperialHeightRounded').val(page.methods.formatValue($("[id='Cb.camheight']").val()));
				$('#metricHeightRounded').val(page.methods.formatValue($("[id='Cb.camheight']").val()));
			},

			//Called when the rounded metric version of the height changes
			metricHeightChanged : function(event)
			{
				if((event.type == 'keyup' && window.event.keyCode == 13) || event.type == 'change' || event.type == 'click')
				{
					if($('#metricHeightRounded').val() < page.methods.formatValue(0.2)) 
						$('#metricHeightRounded').val(page.methods.formatValue(0.2));
					else
						if($('#metricHeightRounded').val() > page.methods.formatValue(200)) 
							$('#metricHeightRounded').val(page.methods.formatValue(200));
						else
							$('#metricHeightRounded').val(page.methods.formatValue($('#metricHeightRounded').val()));
					$("[id='Cb.camheight']").val($('#metricHeightRounded').val());
					$("[id='Cb.camheight']").change();
				}
			},

			//Called when the rounded imperial version of the height changes
			imperialHeightChanged : function(event)
			{
				if((event.type == 'keyup' && window.event.keyCode == 13) || event.type == 'change' || event.type == 'click')
				{
					if($('#imperialHeightRounded').val() < page.methods.formatValue(0.7)) 
						$('#imperialHeightRounded').val(page.methods.formatValue(0.7) );
					else
						if($('#imperialHeightRounded').val() > page.methods.formatValue(650)) 
							$('#imperialHeightRounded').val(page.methods.formatValue(650) );
						else
							$('#imperialHeightRounded').val(page.methods.formatValue($('#imperialHeightRounded').val()));
					$("[id='Cb.camheight']").val($('#imperialHeightRounded').val());
					$("[id='Cb.camheight']").change();
				}
			},

			activeXEvent : function(szType, szValue)
			{
				CAP.logging.info(szValue);
				
				if(szType == "VCA_DATA")
				{
					var jsonArr = $.parseJSON(szValue);
					if(jsonArr.length === 0)
					{
						page.members.vcaDirty = false;
						//Re-enable buttons
						page.methods.activateButtons(true);
					}
					else
					{
						page.members.outstandingRequests++;
						CAP.ajax.setServerData(jsonArr);

						// Mark that we need a refresh
						setTimeout(page.eventCallback.startRefresh,5000);//Refresh after 5 seconds so that the status gets updated
					}
				}
				else if(szType == "VCA_CALIB_UPDATE")
				{
					var jsonArr = $.parseJSON(szValue);
					page.methods.updateCalibParams(jsonArr);
				}
				else if( szType == "VCA_DIRTY")
				{
					// VCA data is dirty - this means that a change has been made
					page.members.vcaDirty = true;
				}
				else
				if( szType == "VCA_RELOAD_PROFILE")
				{
					page.methods.updatePTZPreset();
					top.$(window.top).one('capServerDataRefresh', function () {
						CAP.player.setProfile(page.members.VCADataMgrHandle, page.members.curPreset, CAP.ajax.getServerData("VCA.Ch0.curprofile"), false);
					});
					CAP.ajax.reloadServerData("VCA.Ch0.curprofile");
				}
			},

			startRefresh : function()
			{
				if( page.members.outstandingRequests == 0 )
				{
					// Send the request now
					page.members.needStatusRefresh = false;

					page.members.outstandingRequests++;

					CAP.ajax.reloadServerData();
				}
				else
				{
					// Mark to sent it later
					page.members.needStatusRefresh = true;
				}

			},

			updateData: function( event )
			{
				page.members.outstandingRequests--;

				if( page.members.outstandingRequests == 0 )
				{
					if( page.members.needStatusRefresh )
					{
						// Send another update to refresh
						page.eventCallback.startRefresh();
					}
					else
					{
						// This must have been the refresh
						page.members.updateActiveX = false; //Disable updates from the form to the ActiveX control to prevent setting vcaDirty
						page.methods.initElements();
						page.methods.updateAxStatus();
						page.members.updateActiveX = true; // Re-enable updates to the ActiveX control
					}
				}
			},

			serverDataSet : function (event) {
				//Re-enable buttons
				page.methods.activateButtons(true);

				// No longer dirty
				page.members.vcaDirty = false;
			},
		};

	page.methods = {
			init: function () 
			{
				try {
					var object	= 0;
					var newPreset;

					CAP.logging.verbose('Initialising VCA Calibration page...');
					
					//Start loading the config if necessary:
					CAP.loadConfig();

					// Resize the page elements:
					page.methods.resizePage();

					// Call the common functions to show the page
					// TODO: This should be phased out in future releases.
					CAP.page.show(window);

					if(!CAP.player.initialized()) {
						top.$(window.top).one('capPlayerInitialized', page.methods.init);
						CAP.logging.info('Player not initialized.  Page initialization is waiting for \'capPlayerInitialized\' event');
						return;
					}

					if(!CAP.ajax.serverDataLoaded()) {
						top.$(window.top).one('capServerDataLoaded', page.methods.init);
						CAP.logging.info('Server data not initialized.  Page initialization is waiting for \'capServerDataLoaded\' event');
						return;
					}
				
					// Attach new listeners
					top.$(window.top).bind('capServerDataRefresh', page.eventCallback.updateData);
	
					//Make the status update whenever the server data is refreshed or the curprofile changes:
					top.$(window.top).bind('capAjaxMessageHide', page.eventCallback.serverDataSet);
					top.$(window.top).bind('VCA.Ch0.curprofile', page.methods.reloadUpdateStatus);

					//Check if changes need to be applied when moving away from page
					top.$("a").bind('click', page.methods.confirmDiscardWork);

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

					//Create the sliders:
					$('#fovSlider').slider(
						{
							range:	"min",
							min:	5,
							max:	150,
							value:	0,
							slide:	function(event,ui)	{$("[id='Cb.vfov']").val(ui.value).change();}
						});
					$("[id='Cb.vfov']:text").numeric(); 
					$("[id='Cb.vfov']:text").bind('keyup change',function(event) 
						{
							if((event.type == 'keyup' && window.event.keyCode == 13) || event.type == 'change' || event.type == 'click')
							{
								//Validate:
								if($("[id='Cb.vfov']:text").val() < page.methods.formatValue(5)) 
									$("[id='Cb.vfov']:text").val(page.methods.formatValue(5) );
								else
									if($("[id='Cb.vfov']:text").val() > page.methods.formatValue(150)) 
										$("[id='Cb.vfov']:text").val(page.methods.formatValue(150) );
									else
										$("[id='Cb.vfov']:text").val(page.methods.formatValue($("[id='Cb.vfov']:text").val()));

								$('#fovSlider').slider("value",$("[id='Cb.vfov']:text").val());
							}
						});
					
					$('#panSlider').slider(
						{
							range:	"min",
							min:	-90,
							max:	90,
							value:	0,
							slide:	function(event,ui)	{$("[id='Cb.panangle']").val(ui.value).change();}
						});
					$("[id='Cb.panangle']:text").numeric({allow:"-"});
					$("[id='Cb.panangle']:text").bind('keyup change',function(event) 
						{
							if((event.type == 'keyup' && window.event.keyCode == 13) || event.type == 'change' || event.type == 'click')
							{
								//Validate:
								if($("[id='Cb.panangle']:text").val() < page.methods.formatValue(-90)) 
									$("[id='Cb.panangle']:text").val(page.methods.formatValue(-90) );
								else
									if($("[id='Cb.panangle']:text").val() > page.methods.formatValue(90)) 
										$("[id='Cb.panangle']:text").val(page.methods.formatValue(90) );
									else
										$("[id='Cb.panangle']:text").val(page.methods.formatValue($("[id='Cb.panangle']:text").val()));
								
								$('#panSlider').slider("value",$("[id='Cb.panangle']:text").val());

							}
						});

					$('#rollSlider').slider(
						{
							range:	"min",
							min:	-90,
							max:	90,
							value:	0,
							slide:	function(event,ui)	{$("[id='Cb.rollangle']").val(ui.value).change();}
						});
					$("[id='Cb.rollangle']:text").numeric({allow:"-"});
					$("[id='Cb.rollangle']:text").bind('keyup change',function(event) 
						{
							if((event.type == 'keyup' && window.event.keyCode == 13) || event.type == 'change' || event.type == 'click')
							{
								//Validate:
								if($("[id='Cb.rollangle']:text").val() < page.methods.formatValue(-90)) 
									$("[id='Cb.rollangle']:text").val(page.methods.formatValue(-90));
								else
									if($("[id='Cb.rollangle']:text").val() > page.methods.formatValue(90)) 
										$("[id='Cb.rollangle']:text").val(page.methods.formatValue(90));
									else
										$("[id='Cb.rollangle']:text").val(page.methods.formatValue($("[id='Cb.rollangle']:text").val()));


								$('#rollSlider').slider("value",$("[id='Cb.rollangle']:text").val());
							}
						});
					$("[id='Cb.tiltangle']:text").numeric({allow:"-"});
					$("[id='Cb.tiltangle']:text").bind('keyup change',function(event) 
						{
							if((event.type == 'keyup' && window.event.keyCode == 13) || event.type == 'change' || event.type == 'click')
							{
								//Validate:
								if($("[id='Cb.tiltangle']:text").val() < page.methods.formatValue(-20)) 
									$("[id='Cb.tiltangle']:text").val(page.methods.formatValue(-20));
								else
									if($("[id='Cb.tiltangle']:text").val() > page.methods.formatValue(110)) 
										$("[id='Cb.tiltangle']:text").val(page.methods.formatValue(110));
									else
										$("[id='Cb.tiltangle']:text").val(page.methods.formatValue($("[id='Cb.tiltangle']:text").val()));
							}
						});

					//Set up based on the chosen units:
					var defaultHeight;
					if(CAP.ajax.getServerData("VCA.Ch0.meaunits") === "metric")
					{
						defaultHeight = 10;
						$(".imperial").hide();
					}
					else
					{
						defaultHeight = 30/METRESTOFEET;
						$(".metric").hide();
					}
					$("[id='Cb.camheight']:text").hide();
					$("#imperialHeightRounded").bind('change keyup',page.eventCallback.imperialHeightChanged);
					$("#metricHeightRounded").bind('change keyup',page.eventCallback.metricHeightChanged);
					$("[id='Cb.camheight']:text").bind('change ',page.eventCallback.heightChanged);
					$("#metricHeightRounded").numeric({allow:"."});
					$("#imperialHeightRounded").numeric({allow:"."});


					//Create the preset options:
					page.members.presets = new Array(4);
					page.members.presets[0] = new page.constructors.Preset("Overhead",defaultHeight,40,90,0,0);
					page.members.presets[1] = new page.constructors.Preset("60 deg lookdown",defaultHeight,40,60,0,0);
					page.members.presets[2] = new page.constructors.Preset("30 deg lookdown",defaultHeight,40,30,0,0);
					page.members.presets[3] = new page.constructors.Preset("(Custom)",defaultHeight,40,30,0,0);

					for(var i=0; i<4; i++)
					{
						newPreset = document.createElement("option");
						newPreset.text = page.members.presets[i].displayName;
						newPreset.value = i;
						$("#presets").toArray()[0].add(newPreset);
					}

					// Bind the element functions
					$('#btnApply').button().click(page.eventCallback.submit);
					$('#btnUncalibrate').button().click(page.eventCallback.uncalibrate);
					$('#presets').change(page.eventCallback.presetChosen);

					// Initialize the elements
					page.methods.toggleElements();

					// Initialize the elements
					page.methods.initElements();

					// Add activeX player
					CAP.player.addPlayer(document.getElementById('AxUMF'), page.methods.setupPlayer);

					//Add PTZ Control
					page.methods.addPTZControl();

					// Attach events
					page.methods.attachEvents();

					//Disable enter key:
					document.onkeypress = function(e){return (window.event.keyCode != 13);}

					//Set flag to avoid problems due to early resize messages:
					page.members.pageLoaded = 1;
					page.methods.resizePage();					

					CAP.logging.info('VCA Calibration page Initialisation...DONE!');
				} catch (exception) {
					CAP.logging.error('VCA Calibration page Initialisation...FAILED: ' + exception);
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
					}
					// Stop player/remove it from container element
					CAP.player.removePlayer(document.getElementById('AxUMF'));
				
					// unregister activex event:
//					top.$(window.top).unbind('capPlayerActiveXEvent',page.eventCallback.activeXEvent);

					top.$(window.top).unbind('capServerDataRefresh', page.eventCallback.updateData);
					top.$(window.top).unbind('VCA.Ch0.curprofile', page.methods.reloadUpdateStatus);
					top.$(window.top).unbind('capAjaxMessageHide', page.eventCallback.serverDataSet);
					top.$("a").unbind('click', page.methods.confirmDiscardWork);
					top.$(window.top).unbind('resize', page.methods.resizePage);

					// Revert page style changes
					page.methods.resetPageSize();
				
					// Unset flag to avoid late resize event
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
					page.methods.activateButtons(vcaEnabled);


					//Enable PTZ
					var ptzEnabled = window.ActiveXObject !== undefined &&
							( CAP.ajax.getServerData('SYSTEM.Properties.Hardware.rs485') === '1' 
							|| CAP.ajax.getServerData('SYSTEM.Properties.Hardware.pantilt') === 'REPOSITIONING'
							|| CAP.ajax.getServerData('SYSTEM.Properties.Hardware.pantilt') === 'SPEED TYPE 1'
							|| CAP.ajax.getServerData('SYSTEM.Properties.Hardware.pantilt') === 'PTZ');
					$('.ptzDisabled').toggle(!ptzEnabled);
					$('.ptzEnabled').toggle(ptzEnabled);

					page.methods.resizePage();

				} catch (exception) {
					CAP.logging.error('VCA Calibration page element toggling...FAILED: ' + exception);
					return;
				}
			},

			activateButtons: function (activeState) {
				if('boolean' === typeof (activeState)) {
					// Enable the buttons
					$('#btnApply').button('option', 'disabled', !activeState);
					$('#btnUncalibrate').button('option', 'disabled', !activeState);
				}
			},

			initElements: function () {
				try {
					var numProfiles = CAP.ajax.getServerData('VCA.Ch0.nbrofprofile', false); 
					if(numProfiles === '0')
						CAP.ajax.autoLoad(window,'VCA.Ch0');
					else
					{
						var profileIdx = CAP.ajax.getServerData('VCA.Ch0.curprofile', false);
						CAP.ajax.autoLoad(window,'VCA.Ch0.Pr' + profileIdx);
					}
					$("#presets").val(page.methods.getPresetFromSetting());

					//Round to 2 d.p.
					$("[id='Cb.tiltangle']").val(page.methods.formatValue($("[id='Cb.tiltangle']").val()));
					$("[id='Cb.vfov']").val(page.methods.formatValue($("[id='Cb.vfov']").val()));
					$("[id='Cb.panangle']").val(page.methods.formatValue($("[id='Cb.panangle']").val()));
					$("[id='Cb.rollangle']").val(page.methods.formatValue($("[id='Cb.rollangle']").val()));

					page.methods.updateStatus();
				} catch (exception) {
					CAP.logging.error('VCA Calibration page element initialisation...FAILED: ' + exception);
					return;
				}
			},

			attachEvents: function () {
				
				//Attach change listeners to the text fields so that the activex is notified:
				var inputItems = $('input.auto-text').toArray();
				
				for(itemNum=0; itemNum < inputItems.length; itemNum++)
				{
					jQuery(inputItems[itemNum]).bind('keyup change',inputItems[itemNum].id,page.eventCallback.settingChanged);
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

					//Connect UMFBlocks
					CAP.player.connectUMFBlocks(page.members.VCAViewHandle, page.members.VCARenderHandle,"RENDER");
					CAP.player.connectUMFBlocks(page.members.VCAAudioVideoHandle, page.members.VCAViewHandle, "RENDER");
					CAP.player.connectUMFBlocks(page.members.VCAViewHandle, page.members.VCADataMgrHandle, "DATAMANAGER");

					//Position UMFBlocks
					CAP.player.positionUMFBlock(page.members.VCAViewHandle, 0, 0, 1, 1);

					//Setup the User Interface
					CAP.player.enableCalibrationUI(page.members.VCAViewHandle);

					//Load Server Data
					var serverDataXml = CAP.ajax.getAllServerDataXml();
					CAP.player.provideServerData(page.members.VCADataMgrHandle, serverDataXml);
					page.methods.updatePTZPreset();

					//Resize the page:
					ResizePage($('#config-page').height());
				} catch (exception) {
					CAP.logging.error('VCA Calibration player setup...FAILED: ' + exception);
					return;
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

			confirmDiscard : function(workJson) {
//				var doDiscard = confirm("There are unsaved changes on this page.\nClick OK to discard your changes and carry on.\nClick Cancel to go back.");
				var doDiscard = confirm(top.GetMsgLang("04050332").replace(/\\n/g,"\n"));

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

			confirmDiscardWork : function(workJson) {
				if(page.members.vcaDirty)
				{
					if(workJson && workJson.onDirty !== undefined && 'function' === typeof (workJson.onDirty))
						workJson.onDirty();				
					return page.methods.confirmDiscard(workJson);
				}
				else
				{
					if(workJson && workJson.onClean !== undefined && 'function' === typeof (workJson.onClean))
						workJson.onClean();				
					return true;
				}
			},

			resizePage : function()
			{
				if(page.members.pageLoaded == undefined || page.members.pageLoaded == 0)
				{
					return;
				}

				try {
					if(top.$('#left').length)
						var leftWidth = top.$('#left').width() + 20;
					else
						var leftWidth = 0;

					top.$('#frame').css({
						"max-width" : "none",
						"min-width" : "885px",
						"width" : "100%",
						"overflow" : "visible"
					});
					top.$('#right').css({
						"max-width" : "none",
						"width" : "auto",
						"margin-left" : leftWidth,
						"float" : "none",
					});
					
					var axPadding = $('#AxUMF').outerWidth(true) - $('#AxUMF').width();
					var axWidth = $('#config-page').width() - $('#rightpanel').width() - axPadding;
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
					var ratio = resolution.split("x");
					var axHeight = axWidth * ratio[1] / ratio[0];

					var maxHeight = 0;
					if(typeof(top.window.innerHeight) !== "undefined")
						maxHeight = top.window.innerHeight;
					else //IE8
						maxHeight = top.$('body').parent().height();

					if(top.$('#right').length)
						var maxOffset = top.$('#right').offset().top + (top.$('#right').outerHeight(true) - top.$('#right').outerHeight()) + $('#AxUMF').offset().top + 2*axPadding;
					else
						var maxOffset = $('#AxUMF').offset().top + 2*axPadding;
					if(axHeight + maxOffset > maxHeight)
					{
						axHeight = maxHeight - maxOffset;
						axWidth = axHeight*ratio[0]/ratio[1];
					}

					// This is to avoid infinite loops of resizes due to scrollbars appearing and disappearing
					if(axWidth != page.members.previousWidth || axWidth < $('#AxUMF').width())
					{
						page.members.previousWidth = $('#AxUMF').width();

						$('#middleregion').css({
							"width" : axWidth
						});

						$('#AxUMF').css({
							"height" : axHeight,
							"width" : axWidth - axPadding
						});

						$('#rightpanel').css({
							"float" : "none",
							"margin-left" : $('#AxUMF').outerWidth(true),
						});
						
						var verticalPadding = (300 - $('#loadingMessage').height())/2;
						
						$('#loadingMessage').css({
							"margin-top": verticalPadding,
							"margin-bottom": verticalPadding
						});
						
						ResizePage($('#config-page').height());
					}

				} catch (exception) {
					CAP.logging.error('VCA Calibration page formating...FAILED: ' + exception);
					return;
				}
			},

			resetPageSize : function()
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


			reloadUpdateStatus : function()
			{
				setTimeout(page.eventCallback.startRefresh,5000);//Refresh after 5 seconds so that the status gets updated				
			},

			updateStatus : function()
			{
				var group = 'VCA.Ch0.Cb.status';
				var status = CAP.ajax.getServerData( group );
				$("[id='Cb.status']").toArray()[0].firstChild.data = status;
			},

			updateAxStatus : function()
			{
				var group = 'VCA.Ch0.Cb.status';
				var status = CAP.ajax.getServerData( group );
				CAP.player.setCalibParams( page.members.VCADataMgrHandle, {status:status} );
			},

			updateCalibParams : function(jsonArray)
			{
				try {
					if (('object' !== typeof (jsonArray)) ||
						('number' !== typeof (jsonArray.length)) ||
						(1 != jsonArray.length)) {
						throw CAP.exception.INVALID_PARAMS;
					}
					var json = jsonArray[0];
					if (('string' !== typeof (json.action)) ||
						('string' !== typeof (json.group)) ||
						('number' !== typeof (json.entries.length)) ||
						(json.action !== 'update')) {
						throw CAP.exception.INVALID_PARAMS;
					}

					page.members.updateActiveX = false; //Disable updates from the form to the ActiveX control to prevent infinite loops

					var entryIndex = 0;
					for (entryIndex = 0; entryIndex < json.entries.length; entryIndex++) {
						if (('string' !== typeof (json.entries[entryIndex].id)) ||
							('string' !== typeof (json.entries[entryIndex].value))) {
							throw CAP.exception.INVALID_PARAMS;
						}

						var elements = $("[id='Cb."+json.entries[entryIndex].id+"']:text");

						if(elements.length != 0)
						{
							elements.toArray()[0].value = page.methods.formatValue(json.entries[entryIndex].value); //the mode should reflect the status on the camera and not the current one
							elements.change();
						}
					}
					page.members.updateActiveX = true; // Re-enable updates to the ActiveX control
				} catch (exception) {
					page.members.updateActiveX = true; // Re-enable updates to the ActiveX control
					CAP.logging.error('Failed to synchronize calibration data: ' + exception);
					throw exception;
				}
			},

			/** Works out how to display value efficiently, allowing up to two decimal places if needed 
			 * @param value		A value of unknown precision
			 * @returns 		The value with up to two decimal places as needed 
			 **/
			formatValue : function(value)
			{
				var floatValue = parseFloat(value);
				if(isNaN(floatValue))
					return value;
				var decimalPlaces, rounded;
				for(decimalPlaces=0; decimalPlaces < 2; decimalPlaces++)
				{
					rounded = Math.round(floatValue*Math.pow(10,decimalPlaces))/Math.pow(10,decimalPlaces);
					if(rounded == floatValue || decimalPlaces == 1)
						return rounded;
				}
			},

			/** Compares the current settings with the preset settings 
			 * @returns 	The index of the preset is a match is found or 3 (which corresponds to custom settings)
			 **/
			getPresetFromSetting: function () {
				for(i = 0; i < 4; i++)
					if( $("[id='Cb.camheight']").val() == page.members.presets[i].height &&
						$("[id='Cb.tiltangle']").val() == page.members.presets[i].tilt &&
						$("[id='Cb.vfov']").val() == page.members.presets[i].fov &&
						$("[id='Cb.panangle']").val() == page.members.presets[i].pan &&
						$("[id='Cb.rollangle']").val() == page.members.presets[i].roll )
						return i;
				return 3;
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
									page.members.curPreset = curPreset;
									CAP.player.setPreset(page.members.VCADataMgrHandle, curPreset);
								}
							}, 
							uri);
					}
				} catch (exception) {
					CAP.logging.error('VCA Calibration update PTZ Preset...FAILED: ' + exception);
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
			page.eventCallback.simpleSubmit();
		},
		confirmDiscardWork : function(doWork) {
			return page.methods.confirmDiscardWork(doWork);
		},
		forceResize : function() {
			return page.methods.resizePage();
		},
	};

}(CAP, CAP.VCA, window));

