/*	This file uses JsDoc Toolkit documentation.
 *	http://code.google.com/p/jsdoc-toolkit/
 */

/**	@fileOverview This file contains the control code for the PTZ control page.
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
	CAP.ptz,
 */

(function (CAP, player, window, undefined) {
	// Language static elements
	getLangEnvironment("ptzcontrol");
	
	'use strict';
	// Local copies of the window objects for speed
	var $ = window.$;
	var document	= window.document;
	var navigator	= window.navigator;
	var location	= window.location;

	// Check the CAP namespace has been included
	if ((CAP === undefined) ||
		(player === undefined) ||
		($ === undefined)) {
		console.error('CAP.ptz: Error: You must include the base CAP and CAP.player libraries and jQuery');
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
			isSpeedCamera : false,
			isReposCamera : false,
			cgiScript : '/nvc-cgi/ptz/ptz2.fcgi',
			currentPreset : -1,
			isOnProfile : false,
			isMoving : false,
			enabledPresets : [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1],
			goToHomeTimeout : undefined,

			prIdNames : undefined,
			prNames : undefined,
			prDropDownNames : undefined,
			prCurName : undefined,
			moveStop: undefined,
			moveStopForce: undefined,
			focusStop: undefined,
			moveUp: undefined,
			moveDown: undefined,
			moveLeft: undefined,
			moveRight: undefined,
			moveLeftUp: undefined,
			moveRightUp: undefined,
			moveLeftDown: undefined,
			moveRightDown: undefined,
			zoomWideSmall: undefined,
			zoomWideMedium: undefined,
			zoomWideLarge: undefined,
			zoomTeleSmall: undefined,
			zoomTeleMedium: undefined,
			zoomTeleLarge: undefined,
			focusNearSmall: undefined,
			focusNearMedium: undefined,
			focusNearLarge: undefined,
			focusFarSmall: undefined,
			focusFarMedium: undefined,
			focusFarLarge: undefined,
			autoFocus: undefined,
			zoomIn : undefined,
			zoomOut : undefined,
			focusNear : undefined,
			focusFar : undefined,
			goToPreset : undefined,
			setPreset : undefined,
			clearPreset : undefined,
			addProfile : undefined,
			delProfile : undefined
		};

	page.eventCallback = 
	{
		updatePresetDropDown : function (event) {
			for(i=1; i<17; i++)
			{
				id = '';
				if(i < 10) id += '0';
				id += i;
				page.members.prIdNames[i-1](id + '. ');
				if(page.members.isSpeedCamera) {
					if(page.members.enabledPresets[i-1] == 1) page.members.prNames[i-1]('');
					else page.members.prNames[i-1](top.GetMsgLang("04051017"));
				} else {
					var isEnabled = CAP.ajax.getServerData('PTZ.Ch0.Preset.P' + (i-1) + '.enable') === 'yes';
					if(isEnabled) page.members.prNames[i-1](CAP.ajax.getServerData('PTZ.Ch0.Preset.P' + (i-1) + '.name'));
					else page.members.prNames[i-1](top.GetMsgLang("04051017"));
				}
			}
			page.members.prNames[16](top.GetMsgLang("04051020"));
			page.methods.updateSelectUI();
		},

		enableProfileButtons : function (event) {
			page.methods.updateProfileButtons();
		},

		restorePreset : function () {
			// Restore currentPreset
			if(window.top.PTZCurrentPreset !== undefined && window.top.PTZCurrentPreset >= 0)
			{
				page.members.currentPreset = window.top.PTZCurrentPreset;
				var displayPreset = page.members.currentPreset;
				CAP.player.setPreset(parent.window.PtzContainer.getDataMgrHandler(), displayPreset);
				if(page.members.isSpeedCamera && page.members.currentPreset == 0)
				{
					$("#preset_list").val(17);
				}
				else
				{
					if(page.members.isReposCamera)
						$("#preset_list").val(page.members.currentPreset+1);
					else
						$("#preset_list").val(page.members.currentPreset);
				}
				page.methods.updateSelectUI();
			}
		}

	};

	page.methods = {
			init: function () {
				try {
					var object	= 0;

					CAP.logging.verbose('Initialising PTZ control page...');
					
					//Start loading the config if necessary:
					CAP.loadConfig();
					
					//Check that the database has loaded:
					if(!CAP.ajax.serverDataLoaded()) {
						top.$(window.top).one('capServerDataLoaded', page.methods.init);
						CAP.logging.info('Server data not initialized.  Page initialization is waiting for \'capServerDataLoaded\' event');
						return;
					}

					// Check for PTZ camera
					var cameraType = CAP.ajax.getServerData('SYSTEM.Properties.Hardware.pantilt');
					if(cameraType === 'NONE')
					{
						var rs485 = CAP.ajax.getServerData('SYSTEM.Properties.Hardware.rs485');
						if(rs485 != '1')
						{
							return;
						}
						cameraType = 'RS485';
					}

					// Save the camera type
					page.members.isSpeedCamera = ( cameraType === 'SPEED TYPE 1') || ( cameraType === 'PTZ') || ( cameraType === 'RS485');
					page.members.isReposCamera = ( cameraType === 'REPOSITIONING');
					if(!page.members.isSpeedCamera) {
						page.members.cgiScript = '/uapi-cgi/uptz.fcgi';
					}
					else {
						page.members.cgiScript = '/nvc-cgi/ptz/ptz2.fcgi';
						page.methods.getPresetList();
					}

					//Attach new listeners:
					top.$(window.top).bind('capAjaxMessageHide', page.eventCallback.updatePresetDropDown);
					top.$(window.top).bind('capAjaxMessageHide', page.eventCallback.enableProfileButtons);
					if(page.members.isSpeedCamera) {
						top.$(window.top).bind('capAjaxMessageHide', page.methods.getPresetList);
					}
					top.$(window.top).bind('capPlayerReady', page.eventCallback.restorePreset);

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
					// Initialize the elements
					page.methods.toggleElements();

					// ptz panel UI
					$("#ptz_panel li").each(function(index, element) {
						ptzImageName = "../images/"+$(this).attr("id")+".gif";
						$(this).css("background", "url('" + ptzImageName + "')  no-repeat center #FFFFFF");
					});

					InitThemes();
					page.methods.initSpeedBar();
					ContentShow();
					ViewLoadingSave(false);

					page.methods.createViewModel();

					if(CAP.player.isReady())
						page.eventCallback.restorePreset(); //in case it is already ready

					page.methods.setInputNameBehaviour();

					page.methods.updateIsOnProfile();
					page.methods.updateProfileButtons();

					page.methods.resizePage();

					CAP.logging.info('PTZ Control page Initialisation...DONE!');
				} catch (exception) {
					CAP.logging.error('PTZ Control page Initialisation...FAILED: ' + exception);
					return;
				}
			},

			uninit: function () {
				try {
					//Remove resize event handler
					top.$(window.top).unbind('resize', page.methods.resizePage);

					// Check for PTZ camera
					var cameraType = CAP.ajax.getServerData('SYSTEM.Properties.Hardware.pantilt');
					if(cameraType === 'NONE')
					{
						var rs485 = CAP.ajax.getServerData('SYSTEM.Properties.Hardware.rs485');
						if(rs485 != '1')
						{
							return;
						}
					}

					// Save currentPreset
					window.top.PTZCurrentPreset = page.members.currentPreset;

					//Remove event handlers:
					top.$(window.top).unbind('capAjaxMessageHide', page.eventCallback.updatePresetDropDown);
					top.$(window.top).unbind('capAjaxMessageHide', page.eventCallback.enableProfileButtons);
					if(page.members.isSpeedCamera) {
						top.$(window.top).unbind('capAjaxMessageHide', page.methods.getPresetList);
					}
					top.$(window.top).unbind('capPlayerReady', page.eventCallback.restorePreset);
				} catch (exception) {
					CAP.logging.error('PTZ Control page element finalisation...FAILED: ' + exception);
					return;
				}
			},

			getPresetList: function () {
				try {
					CAP.ajax.sendSimpleServerRequest("query=presetlist", {
						callbackSuccess : function (data) {
							// Preset Number List
							for(var i=0; i<16; i++)
							{ 
								page.members.enabledPresets[i] = 0;
							}  
							var presetCount = data.split("\n")[1].split("=")[1];
							var presetList = data.split("\n")[2].split("=")[1];
							if(presetList != undefined && presetList != "")
							{
								var presetValue = presetList.split(",");  
								if(presetValue != "")
								{
									for(var i=0; i<presetCount; i++)
									{ 
										page.members.enabledPresets[presetValue[i]-1] = 1;
									}  
								}
							}
							page.eventCallback.updatePresetDropDown();
						}
					}, page.members.cgiScript);
				} catch (exception) {
					CAP.logging.error('PTZ Control page get preset list...FAILED: ' + exception);
					return;
				}
			},

			toggleElements: function () {
				try {
					//Enable speed
					$('.ptzReposition').toggle(!page.members.isSpeedCamera);
					$('.ptzSpeed').toggle(page.members.isSpeedCamera);
					if(!page.members.isSpeedCamera)
					{
						$('#preset_list option[value="17"]').wrap( '<span style="display: none;" />' );
					}

					//Position reposition only buttons
					if(!page.members.isSpeedCamera) {
						$('#pt_cu').css({'margin-left':'27px', 'margin-right':'27px'});
						$('#pt_cd').css({'margin-left':'27px', 'margin-right':'27px'});
					}
				} catch (exception) {
					CAP.logging.error('VCA Zones and Rules page element toggling...FAILED: ' + exception);
					return;
				}
			},

			resizePage: function () {
				var ptz_movement_width = $('#ptz_movement_bg').width();
				var ptz_movement_height = $('#ptz_movement_bg').height();
				if(ptz_movement_width === 0 || ptz_movement_height === 0)
					return;

				$('#ptz_preposition_bg').height(ptz_movement_height);
				$('#ptz_profiles_bg').height(ptz_movement_height);

				if(parent.$('#ptzFrame').width() < $('#ptz_movement').outerWidth() + $('#ptz_config').outerWidth())
				{
					$('#ptz_config').css('margin-top', 10);
					parent.$('#ptzFrame').height($('#ptz_movement').outerHeight() + $('#ptz_config').outerHeight());
				}
				else
				{
					$('#ptz_config').css('margin-top', 0);
					parent.$('#ptzFrame').height($('#ptz_movement').outerHeight());
				}
				parent.window.PtzContainer.forceResize();
			},

			initSpeedBar: function () {
				// ptz speedbar
				$("#slider_speedbar").slider({
					range: "min",
					min: 1,
					max: 100,
					value: 20,
					slide: function(event, ui) {
						$("#text_speedbar").val(ui.value);
			 		}
			 	});

				// speed range
				$("#text_speedbar:text").blur(function(){
					var inputValSpeed = $("#text_speedbar:text").val();
					if(inputValSpeed < 1 || inputValSpeed == "")
					{
						$("#text_speedbar:text").val(1).focus();
						$("#slider_speedbar").slider("value", 1);
					}
					if(inputValSpeed > 100)
					{
						$("#text_speedbar:text").val(100).focus();
						$("#slider_speedbar").slider("value", 100);
					}
				});
				// speed Text box, Slider-bar 동기화
				$("#text_speedbar:text").keyup(function() {
					$("#slider_speedbar").slider("value", $("#text_speedbar:text").val());
				});
			},

			createViewModel: function () {
				try {
					//Setup Preset drop-down box entries
					page.members.prIdNames = new Array(17);
					page.members.prNames = new Array(17);
					page.members.prDropDownNames = new Array(17);
					for(i=1; i<17; i++)
					{
						id = '';
						if(i < 10) id += '0';
						id += i;
						page.members.prIdNames[i-1] = ko.observable(id + '. ');
						page.members.prNames[i-1] = ko.observable(function () {
							if(page.members.isSpeedCamera) {
								if(page.members.enabledPresets[i-1] == 1) return '';
								else return top.GetMsgLang("04051017");
							} else {
								var isEnabled = CAP.ajax.getServerData('PTZ.Ch0.Preset.P' + (i-1) + '.enable') === 'yes';
								if(isEnabled) return CAP.ajax.getServerData('PTZ.Ch0.Preset.P' + (i-1) + '.name');
								else return top.GetMsgLang("04051017");
							}
						}());
						page.members.prDropDownNames[i-1] = ko.computed(function() {return page.members.prIdNames[i-1]() + page.members.prNames[i-1]();}, page.members);
					}
					page.members.prIdNames[16] = ko.observable('');
					page.members.prNames[16] = ko.observable('Home');
					page.members.prDropDownNames[16] = ko.computed(function() {return page.members.prIdNames[16]() + page.members.prNames[16]();}, page.members);
					page.members.prCurName = ko.observable("");

					//Setup camera control buttons behaviour
					page.members.moveStop = page.methods.moveStop;
					page.members.moveStopForce = page.methods.moveStopForce;
					page.members.moveUp = page.methods.moveUp;
					page.members.moveDown = page.methods.moveDown;
					page.members.moveLeft = page.methods.moveLeft;
					page.members.moveRight = page.methods.moveRight;
					page.members.moveLeftUp = page.methods.moveLeftUp;
					page.members.moveRightUp = page.methods.moveRightUp;
					page.members.moveLeftDown = page.methods.moveLeftDown;
					page.members.moveRightDown = page.methods.moveRightDown;

					page.members.zoomWideSmall = page.methods.zoomWideSmall;
					page.members.zoomWideMedium = page.methods.zoomWideMedium;
					page.members.zoomWideLarge = page.methods.zoomWideLarge;
					page.members.zoomTeleSmall = page.methods.zoomTeleSmall;
					page.members.zoomTeleMedium = page.methods.zoomTeleMedium;
					page.members.zoomTeleLarge = page.methods.zoomTeleLarge;
					page.members.focusNearSmall = page.methods.focusNearSmall;
					page.members.focusNearMedium = page.methods.focusNearMedium;
					page.members.focusNearLarge = page.methods.focusNearLarge;
					page.members.focusFarSmall = page.methods.focusFarSmall;
					page.members.focusFarMedium = page.methods.focusFarMedium;
					page.members.focusFarLarge = page.methods.focusFarLarge;

					page.members.autoFocus = page.methods.autoFocus;

					page.members.zoomIn = page.methods.zoomIn,
					page.members.zoomOut = page.methods.zoomOut,
					page.members.focusNear = page.methods.focusNear,
					page.members.focusFar = page.methods.focusFar,
					page.members.focusStop = page.methods.focusStop,

					//Setup preset buttons behaviour
					page.members.goToPreset = page.methods.goToPreset;
					page.members.setPreset = page.methods.setPreset;
					page.members.clearPreset = page.methods.clearPreset;

					//Setup profile buttons behaviour
					page.members.addProfile = page.methods.addProfile;
					page.members.delProfile = page.methods.delProfile;

					//Apply knockout bindings
					ko.applyBindings(page.members);

					CAP.logging.info('PTZ Control create view model...DONE!');
				} catch (exception) {
					CAP.logging.error('PTZ Control create view model...FAILED: ' + exception);
					return;
				}
			},

			setInputNameBehaviour : function() {	
				// 글자수 제한
				$("#preset_name:text").keyup(function(){
					LimitCharac("preset_name:text", 32);
				});

				// Preset list 선택 시
				$("#preset_list").change(page.methods.updateSelectUI);
				$("#preset_list").change();
			},

			updateSelectUI : function ()
			{
				var presetVal = $("#preset_list").val();
				if(presetVal === "0" || presetVal === "17") {
					if(presetVal === "0")
						page.members.prCurName("");
					else
						page.members.prCurName("Home");
					page.methods.updateProfileButtons();
					return;
				}
				var presetIdx = $("#preset_list").val()-1;
				var isEnabled = CAP.ajax.getServerData('PTZ.Ch0.Preset.P' + presetIdx + '.enable') === 'yes';
				if(isEnabled) page.members.prCurName(page.members.prNames[presetIdx]());
				else page.members.prCurName("");

				page.methods.updateProfileButtons();
			},

			addPTZProfile : function (presetId)
			{
				if(parent.window.PtzContainer.getDataMgrHandler() !== undefined)
				{
					ret = CAP.player.addProfile(parent.window.PtzContainer.getDataMgrHandler(), presetId);
				}
			},

			delPTZProfile : function (presetId)
			{
				if(parent.window.PtzContainer.getDataMgrHandler() !== undefined)
				{
					ret = CAP.player.delProfile(parent.window.PtzContainer.getDataMgrHandler(), presetId);
				}
			},

			setPTZProfileIdx : function (profileIdx, isGoCommand)
			{
				if(parent.window.PtzContainer.getDataMgrHandler() !== undefined)
				{
					var displayPreset = page.members.currentPreset;
					ret = CAP.player.setProfile(parent.window.PtzContainer.getDataMgrHandler(), displayPreset, profileIdx, isGoCommand);
					if(ret === parent.window.PtzContainer.getDataMgrHandler() && 1 <= profileIdx && profileIdx <= 16)
					{
						CAP.ajax.setLocalData('VCA.Ch0.curprofile', profileIdx);
						page.members.isOnProfile = true;
						return;
					}
				}
				CAP.ajax.setLocalData('VCA.Ch0.curprofile', 0);
				page.members.isOnProfile = false;
			},

			isOnPreset : function() {
				return (0 <= page.members.currentPreset && page.members.currentPreset <= 15);
			},

			updateIsOnProfile : function() {
				if(page.methods.isOnPreset())
				{
					var assocProfile = CAP.ajax.getServerData('PTZ.Ch0.Preset.P' + page.members.currentPreset + '.vcaprofile');
					if(1 <= assocProfile && assocProfile <= 16)
					{
						page.members.isOnProfile = true;
						return;
					}
				}
				page.members.isOnProfile = false;
			},

			isOnProfile : function() {
				return page.members.isOnProfile;
			},

			setNoPreset : function() {
				//Update curprofile in Ax
				page.members.currentPreset = -1;
				page.methods.setPTZProfileIdx(0);
				page.methods.updateProfileButtons();
			},

			confirmDiscardWork : function(doWork) {
				return parent.window.PtzContainer.confirmDiscardWork(doWork);
			},

			moveStop: function () {
				if(!page.members.isMoving)
					return;
				try {
					page.members.isMoving = false;
					if(page.members.isSpeedCamera)
						CAP.ajax.sendSimpleServerRequest("cpantiltzoommove=0,0,0", {}, page.members.cgiScript);
					else
						CAP.ajax.sendSimpleServerRequest("cpantiltmove=0", {}, page.members.cgiScript);
					page.methods.setNoPreset();
				} catch (exception) {
					CAP.logging.error('Move stop...FAILED: ' + exception);
					return;
				}
			},

			moveStopForce: function () {
				try {
					// Force a stop command to be sent (needed to do auto-focus)
					page.members.isMoving = true;
					page.members.moveStop(true);
				} catch (exception) {
					CAP.logging.error('Move stop force...FAILED: ' + exception);
					return;
				}
			},

			focusStop: function () {
				if(!page.members.isMoving)
					return;
				try {
					page.members.isMoving = false;
					CAP.ajax.sendSimpleServerRequest("cfocusmove=0", {}, '/nvc-cgi/ptz/ptz2.fcgi');
					page.methods.setNoPreset();
				} catch (exception) {
					CAP.logging.error('Focus stop...FAILED: ' + exception);
					return;
				}
			},

			moveAction: function (speedX, speedY) {
				return page.methods.confirmDiscardWork({
					onDirty : function () {
						page.members.isMoving = false;
					},

					onClean : function () {
						page.methods.setGoToVcaHomePreset();

						page.members.isMoving = true;
						CAP.ajax.sendSimpleServerRequest("cpantiltmove=" + speedX + "," + speedY, {}, page.members.cgiScript);
						page.methods.setNoPreset();
					}
				});
			},

			moveUp: function () {
				try {
					var speedX = "0";
					var speedY = "10";
					if(page.members.isSpeedCamera) {
						speedY = $("#text_speedbar").val();
					}
					return page.methods.moveAction(speedX, speedY);
				} catch (exception) {
					CAP.logging.error('Move up...FAILED: ' + exception);
					return;
				}
			},

			moveDown: function () {
				try {
					var speedX = "0";
					var speedY = "-10";
					if(page.members.isSpeedCamera) {
						speedY = "-" + $("#text_speedbar").val();
					}
					return page.methods.moveAction(speedX, speedY);
				} catch (exception) {
					CAP.logging.error('Move down...FAILED: ' + exception);
					return;
				}
			},

			moveLeft: function () {
				try {
					var speedX = "-10";
					var speedY = "0";
					if(page.members.isSpeedCamera) {
						speedX = "-" + $("#text_speedbar").val();
					}
					return page.methods.moveAction(speedX, speedY);
				} catch (exception) {
					CAP.logging.error('Move left...FAILED: ' + exception);
					return;
				}
			},

			moveRight: function () {
				try {
					var speedX = "10";
					var speedY = "0";
					if(page.members.isSpeedCamera) {
						speedX = $("#text_speedbar").val();
					}
					return page.methods.moveAction(speedX, speedY);
				} catch (exception) {
					CAP.logging.error('Move left...FAILED: ' + exception);
					return;
				}
			},

			moveLeftUp: function () {
				try {
					var speedX = "-10";
					var speedY = "10";
					if(page.members.isSpeedCamera) {
						speedX = "-" + $("#text_speedbar").val();
						speedY = $("#text_speedbar").val();
					}
					return page.methods.moveAction(speedX, speedY);
				} catch (exception) {
					CAP.logging.error('Move left up...FAILED: ' + exception);
					return;
				}
			},

			moveRightUp: function () {
				try {
					var speedX = "10";
					var speedY = "10";
					if(page.members.isSpeedCamera) {
						speedX = $("#text_speedbar").val();
						speedY = $("#text_speedbar").val();
					}
					return page.methods.moveAction(speedX, speedY);
				} catch (exception) {
					CAP.logging.error('Move right up...FAILED: ' + exception);
					return;
				}
			},

			moveLeftDown: function () {
				try {
					var speedX = "-10";
					var speedY = "-10";
					if(page.members.isSpeedCamera) {
						speedX = "-" + $("#text_speedbar").val();
						speedY = "-" + $("#text_speedbar").val();
					}
					return page.methods.moveAction(speedX, speedY);
				} catch (exception) {
					CAP.logging.error('Move left down...FAILED: ' + exception);
					return;
				}
			},

			moveRightDown: function () {
				try {
					var speedX = "10";
					var speedY = "-10";
					if(page.members.isSpeedCamera) {
						speedX = $("#text_speedbar").val();
						speedY = "-" + $("#text_speedbar").val();
					}
					return page.methods.moveAction(speedX, speedY);
				} catch (exception) {
					CAP.logging.error('Move right down...FAILED: ' + exception);
					return;
				}
			},

			zoomWide : function (grade)
			{
				var doZoomWide = function () {
					if ('number' !== typeof (grade) || grade < 1 || grade > 3) {
						throw CAP.exception.INVALID_PARAMS;
					}
					CAP.ajax.sendSimpleServerRequest("stepmove=zoomwide&step=" + grade, {}, '/uapi-cgi/uptz.fcgi');
					page.methods.setNoPreset();
				};
				return page.methods.confirmDiscardWork({onDiscard : doZoomWide, onClean : doZoomWide});
			},

			zoomWideSmall: function () {
				try {
					page.methods.zoomWide(1);
				} catch (exception) {
					CAP.logging.error('Zoom wide small...FAILED: ' + exception);
					return;
				}
			},

			zoomWideMedium: function () {
				try {
					page.methods.zoomWide(2);
				} catch (exception) {
					CAP.logging.error('Zoom wide medium...FAILED: ' + exception);
					return;
				}
			},

			zoomWideLarge: function () {
				try {
					page.methods.zoomWide(3);
				} catch (exception) {
					CAP.logging.error('Zoom wide large...FAILED: ' + exception);
					return;
				}
			},

			zoomTele : function (grade)
			{
				var doZoomTele = function () {
					if ('number' !== typeof (grade) || grade < 1 || grade > 3) {
						throw CAP.exception.INVALID_PARAMS;
					}
					CAP.ajax.sendSimpleServerRequest("stepmove=zoomtele&step=" + grade, {}, '/uapi-cgi/uptz.fcgi');
					page.methods.setNoPreset();
				};
				return page.methods.confirmDiscardWork({onDiscard : doZoomTele, onClean : doZoomTele});
			},

			zoomTeleSmall: function () {
				try {
					page.methods.zoomTele(1);
				} catch (exception) {
					CAP.logging.error('Zoom tele small...FAILED: ' + exception);
					return;
				}
			},

			zoomTeleMedium: function () {
				try {
					page.methods.zoomTele(2);
				} catch (exception) {
					CAP.logging.error('Zoom tele medium...FAILED: ' + exception);
					return;
				}
			},

			zoomTeleLarge: function () {
				try {
					page.methods.zoomTele(3);
				} catch (exception) {
					CAP.logging.error('Zoom tele large...FAILED: ' + exception);
					return;
				}
			},

			focusNearGrade : function (grade)
			{
				var doFocusNearGrade = function () {
					if ('number' !== typeof (grade) || grade < 1 || grade > 3) {
						throw CAP.exception.INVALID_PARAMS;
					}
					CAP.ajax.sendSimpleServerRequest("stepmove=focusnear&step=" + grade, {}, '/uapi-cgi/uptz.fcgi');
					page.methods.setNoPreset();
				};
				return page.methods.confirmDiscardWork({onDiscard : doFocusNearGrade, onClean : doFocusNearGrade});
			},

			focusNearSmall: function () {
				try {
					page.methods.focusNearGrade(1);
				} catch (exception) {
					CAP.logging.error('Focus near small...FAILED: ' + exception);
					return;
				}
			},

			focusNearMedium: function () {
				try {
					page.methods.focusNearGrade(2);
				} catch (exception) {
					CAP.logging.error('Focus near medium...FAILED: ' + exception);
					return;
				}
			},

			focusNearLarge: function () {
				try {
					page.methods.focusNearGrade(3);
				} catch (exception) {
					CAP.logging.error('Focus near large...FAILED: ' + exception);
					return;
				}
			},

			focusFarGrade : function (grade)
			{
				var doFocusFarGrade = function () {
					if ('number' !== typeof (grade) || grade < 1 || grade > 3) {
						throw CAP.exception.INVALID_PARAMS;
					}
					CAP.ajax.sendSimpleServerRequest("stepmove=focusfar&step=" + grade, {}, '/uapi-cgi/uptz.fcgi');
					page.methods.setNoPreset();
				};
				return page.methods.confirmDiscardWork({onDiscard : doFocusFarGrade, onClean : doFocusFarGrade});
			},

			focusFarSmall: function () {
				try {
					page.methods.focusFarGrade(1);
				} catch (exception) {
					CAP.logging.error('Focus far small...FAILED: ' + exception);
					return;
				}
			},

			focusFarMedium: function () {
				try {
					page.methods.focusFarGrade(2);
				} catch (exception) {
					CAP.logging.error('Focus far medium...FAILED: ' + exception);
					return;
				}
			},

			focusFarLarge: function () {
				try {
					page.methods.focusFarGrade(3);
				} catch (exception) {
					CAP.logging.error('Focus far large...FAILED: ' + exception);
					return;
				}
			},

			autoFocus: function () {
				var doAutoFocus = function () {
					try {
						CAP.ajax.sendSimpleServerRequest("autofocus", {}, '/uapi-cgi/uptz.fcgi');
						page.methods.setNoPreset();
					} catch (exception) {
						CAP.logging.error('Autofocus...FAILED: ' + exception);
						return;
					}
				};
				return page.methods.confirmDiscardWork({onDiscard : doAutoFocus, onClean : doAutoFocus});
			},

			zoomIn : function ()
			{
				var doZoomIn = function () {
					page.members.isMoving = true;
					CAP.ajax.sendSimpleServerRequest("cpantiltzoommove=0,0," + $("#text_speedbar").val(), {}, '/nvc-cgi/ptz/ptz2.fcgi');
					page.methods.setNoPreset();
				};
				return page.methods.confirmDiscardWork({onDiscard : doZoomIn, onClean : doZoomIn});
			},

			zoomOut : function ()
			{
				var doZoomOut = function () {
					page.members.isMoving = true;
					CAP.ajax.sendSimpleServerRequest("cpantiltzoommove=0,0,-" + $("#text_speedbar").val(), {}, '/nvc-cgi/ptz/ptz2.fcgi');
					page.methods.setNoPreset();
				};
				return page.methods.confirmDiscardWork({onDiscard : doZoomOut, onClean : doZoomOut});
			},

			focusNear : function ()
			{
				var doFocusNear = function () {
					page.members.isMoving = true;
					CAP.ajax.sendSimpleServerRequest("cfocusmove=" + $("#text_speedbar").val(), {}, '/nvc-cgi/ptz/ptz2.fcgi');
					page.methods.setNoPreset();
				};
				return page.methods.confirmDiscardWork({onDiscard : doFocusNear, onClean : doFocusNear});
			},

			focusFar : function ()
			{
				var doFocusFar = function () {
					page.members.isMoving = true;
					CAP.ajax.sendSimpleServerRequest("cfocusmove=-" + $("#text_speedbar").val(), {}, '/nvc-cgi/ptz/ptz2.fcgi');
					page.methods.setNoPreset();
				};
				return page.methods.confirmDiscardWork({onDiscard : doFocusFar, onClean : doFocusFar});
			},

			goToPreset: function () {
				var presetListVal = parseInt($("#preset_list").val());
				if(presetListVal === 0 || page.members.prNames[presetListVal-1] === top.GetMsgLang("04051017")) {
//					alert("Please select an enabled PTZ preset");
					alert(top.GetMsgLang("04051021"));
					return;
				}
				var doGoToPreset = function () {
					try {
						page.methods.setGoToVcaHomePreset();

						page.members.currentPreset = presetListVal-1;
						if(page.members.isSpeedCamera) page.members.currentPreset = presetListVal;

						if(presetListVal === 17)
						{
							//Home position
							page.members.currentPreset = 0;

							CAP.ajax.sendSimpleServerRequest("aux=home", {}, page.members.cgiScript);
							//Update curprofile via Ax
							page.methods.setPTZProfileIdx(CAP.ajax.getServerData('PTZ.Ch0.Preset.P0.vcaprofile'));
						}
						else
						{
							CAP.ajax.sendSimpleServerRequest("gotodevicepreset=" + page.members.currentPreset, {}, page.members.cgiScript);
							//Update curprofile via Ax
							page.methods.setPTZProfileIdx(CAP.ajax.getServerData('PTZ.Ch0.Preset.P'+ page.members.currentPreset +'.vcaprofile'));
						}

						page.methods.updateProfileButtons();
					} catch (exception) {
						CAP.logging.error('Go to preset...FAILED: ' + exception);
						return false;
					}
				};
				return page.methods.confirmDiscardWork({onDiscard : doGoToPreset, onClean : doGoToPreset});
			},

			setGoToVcaHomePreset: function () {
				if(!page.members.isSpeedCamera) 
					return true;

				var ptzEnable = CAP.ajax.getServerData('VCA.Ch0.Ptz.enable') === 'yes';
				var return2home = CAP.ajax.getServerData('VCA.Ch0.Ptz.return2home') === 'yes';
				if(!ptzEnable || !return2home)
					return true;

				if(page.members.goToHomeTimeout !== undefined)
					clearTimeout(page.members.goToHomeTimeout);

				var return2HomeTimeout = CAP.ajax.getServerData('VCA.Ch0.Ptz.return2hometimeout');
				page.members.goToHomeTimeout = setTimeout(function () {
					try {
						var homePreset = CAP.ajax.getServerData('VCA.Ch0.Ptz.homepreset');

						page.members.currentPreset = homePreset;
						page.methods.setPTZProfileIdx(CAP.ajax.getServerData('PTZ.Ch0.Preset.P'+ (homePreset-1) +'.vcaprofile'), false);

						page.methods.updateProfileButtons();
					} catch (exception) {
						CAP.logging.error('Go to Home preset...FAILED: ' + exception);
						return false;
					}
				}, return2HomeTimeout * 1000);
			},

			setPreset: function () {
				try {
					var presetListVal = parseInt($("#preset_list").val());
					if(presetListVal === 0) {
//						alert("Please select preset to set");
						alert(top.GetMsgLang("04051022"));
						return false;
					}

					var newName = page.members.prCurName();
					if(newName === top.GetMsgLang("04051017")) {
//						alert("Please select a different name");
						alert(top.GetMsgLang("04051023"));
						return false;
					}
					var doSetPreset = function () {
						//Disable profile buttons
//						$('#btnAddProfile').button('option', 'disabled', true);
//						$('#btnDelProfile').button('option', 'disabled', true);
						page.members.currentPreset = presetListVal-1;
						if(page.members.isSpeedCamera) page.members.currentPreset = presetListVal;

						if(presetListVal === 17)
						{
							//Home position
							page.members.currentPreset = 0;

							CAP.ajax.sendSimpleServerRequest("aux=save_home", {}, page.members.cgiScript);
							//Update curprofile via Ax
							page.methods.setPTZProfileIdx(CAP.ajax.getServerData('PTZ.Ch0.Preset.P0.vcaprofile'), false);
						}
						else
						{
							requestString = "&storedevicepreset=" + page.members.currentPreset;
							if(!page.members.isSpeedCamera) requestString = requestString + "&name=" + encodeURIComponent(newName);

							CAP.ajax.sendServerRequest(requestString, page.members.cgiScript);
							var prId = page.members.currentPreset;
							page.methods.setPTZProfileIdx(CAP.ajax.getServerData('PTZ.Ch0.Preset.P'+ prId +'.vcaprofile'), false);
						}
						page.methods.updateProfileButtons();
					};
					return page.methods.confirmDiscardWork({onDiscard : doSetPreset, onClean : doSetPreset});
				} catch (exception) {
					CAP.logging.error('Set preset...FAILED: ' + exception);
					return false;
				}
			},

			clearPreset: function () {
				var presetListVal = parseInt($("#preset_list").val());
				if(presetListVal === 0) {
//					alert("Please select preset to clear");
					alert(top.GetMsgLang("04051024"));
					return;
				}
				if(presetListVal === 17) {
//					alert("Home preset cannot be cleared");
					alert(top.GetMsgLang("04051025"));
					return;
				}
				var presetListValTxt = presetListVal;
				var currentPresetTxt = page.members.currentPreset;
				if(!page.members.isSpeedCamera) {
					presetListVal = presetListVal-1;
					currentPresetTxt = currentPresetTxt+1;
				}

				var hasConfirmed = true;
				if(presetListVal !== page.members.currentPreset) {
					var doClear = confirm(top.GetMsgLang("04051026") + 
							      presetListValTxt + 
							      top.GetMsgLang("04051027") + 
							      currentPresetTxt + 
							      top.GetMsgLang("04051028") + "\n" + 
							      top.GetMsgLang("04051029") + "\n" + 
							      top.GetMsgLang("04051030"));
					if(!doClear)
						return;
				}
				else hasConfirmed = false;

				var doClearPreset = function () {
					try {
						CAP.ajax.sendServerRequest("&removedevicepreset=" + presetListVal, page.members.cgiScript);
						if(presetListVal === page.members.currentPreset) {
							page.members.currentPreset = -1;

							page.methods.setPTZProfileIdx(0, false);
							parent.window.PtzContainer.submitDirectly();
							page.methods.updateProfileButtons();
						}
					} catch (exception) {
						CAP.logging.error('Clear preset...FAILED: ' + exception);
						return false;
					}
				};
				var doClearPresetOnClean = function () {
					if(!hasConfirmed) {
						var doConfirm = confirm(top.GetMsgLang("04051031") + 
									presetListValTxt + 
									top.GetMsgLang("04051032") + "\n" +
									top.GetMsgLang("04051029") + "\n" + 
									top.GetMsgLang("04051030"));
						if(!doConfirm)
							return;
					}
					doClearPreset();
				}
				return page.methods.confirmDiscardWork({onDiscard : doClearPreset, onClean : doClearPresetOnClean});
			},

			addProfile: function () {
				if(!page.methods.isOnPreset()) {
//					alert("Please go to PTZ preset or set new preset");
					alert(top.GetMsgLang("04051033"));
					return;
				}
				if(page.methods.isOnProfile()) {
//					alert("This PTZ preset already has an associated profile!");
					alert(top.GetMsgLang("04051034"));
					return;
				}
				var doAddProfile = function () {
					try {
						var actualPresetId = page.members.currentPreset;
						page.methods.addPTZProfile(actualPresetId);

						page.members.isOnProfile = true;
						page.methods.updateProfileButtons();

					} catch (exception) {
						CAP.logging.error('Add Profile...FAILED: ' + exception);
						return false;
					}
				};
				return page.methods.confirmDiscardWork({onDiscard : doAddProfile, onClean : doAddProfile});
			},

			delProfile: function () {
				try {
					if(!page.methods.isOnPreset()) {
//						alert("Please go to PTZ preset");
						alert(top.GetMsgLang("04051035"));
						return;
					}
					if(!page.methods.isOnProfile()) {
//						alert("The profile associated with this PTZ preset has already been deleted!");
						alert(top.GetMsgLang("04051036"));
						return;
					}

					// Warn the user that this happens immediately
//					var ret = confirm("Deleting a profile requires changes to be applied immediately.\nClick OK to delete the profile and apply current changes.\nClick Cancel to go back.");
					var ret = confirm(top.GetMsgLang("04051037") + "\n" + top.GetMsgLang("04051038") + "\n" + top.GetMsgLang("04051030"));

					if( ret ) {
						var actualPresetId = page.members.currentPreset;
						page.methods.delPTZProfile(actualPresetId);
						parent.window.PtzContainer.submitDirectly();

						page.members.isOnProfile = false;
						page.methods.updateProfileButtons();
					}
				} catch (exception) {
					CAP.logging.error('Delete Profile...FAILED: ' + exception);
					return false;
				}
			},

			updateProfileButtons: function() {
				try {
					// BW - Update profile buttons
					var selectedPreset = $("#preset_list").val() !== "0";
					$('#btnSet').button('option', 'disabled', !selectedPreset);

					var selectedPresetIdx = $("#preset_list").val()-1;
					var enabledPreset = false;
					if(selectedPreset) {
						if(page.members.isSpeedCamera) enabledPreset = page.members.enabledPresets[selectedPresetIdx];
						else enabledPreset = CAP.ajax.getServerData('PTZ.Ch0.Preset.P' + selectedPresetIdx + '.enable') === 'yes';
					}
					$('#btnGo').button('option', 'disabled', !selectedPreset || !enabledPreset);
					$('#btnClear').button('option', 'disabled', !selectedPreset || !enabledPreset);

					var onPreset = page.methods.isOnPreset();
					var onProfile = page.methods.isOnProfile();
					$('#btnAddProfile').button('option', 'disabled', !onPreset || onProfile);
					$('#btnDelProfile').button('option', 'disabled', !onProfile);

				} catch (exception) {
					CAP.logging.error('UpdateProfileButtons...FAILED: ' + exception);
					return;
				}

			},
		};

	// Initialise the page when the DOM loads
	$(window).ready(page.methods.init);
	// Finalise the page when the DOM unloads
	$(window).unload(page.methods.uninit);
	// Update elements' size
	top.$(window.top).resize(page.methods.resizePage);
}(CAP, CAP.player, window));
