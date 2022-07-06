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
  getLangEnvironment("scenemaintenance");
  
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
			
			pageloaded : 0,

			previousWidth : 0,
			previousHeight : 0

		};

	page.eventCallback =
		{
			timerHandle : null,

			reset: function (event) {
				CAP.ajax.setServerData([{action:'update',group:'VCA.Ch0',entries:[{id:'reset',value:'yes'}]}]);	
			},

			startRefresh : function()
			{
				CAP.ajax.reloadServerData();
			},

			serverDataSet : function (event) {
			},

			updateData: function( event )
			{
				page.methods.initElements();
			}
		};

	page.methods = {
			init: function ()
			{
				try {
					var object	= 0;
					var newPreset;

					CAP.logging.verbose('Initialising VCA Scene Maintenance page...');
					
					//Start loading the config if necessary:
					CAP.loadConfig();

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
					
					//Make the status update whenever the server data is refreshed:
					top.$(window.top).bind('capAjaxMessageHide', page.eventCallback.serverDataSet);

					// Attach new listeners
					top.$(window.top).bind('capServerDataRefresh', page.eventCallback.updateData);

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
					$('#btnReset').button().click(page.eventCallback.reset);
					$('#automatic').change(page.eventCallback.updateAdvancedEnable);
					$('#manual').change(page.eventCallback.updateAdvancedEnable);
					$('#disabled').change(page.eventCallback.updateAdvancedEnable);

					// Initialize the elements
					page.methods.toggleElements();

					// Initialize the elements
					page.methods.initElements();

					// Add activeX player
					CAP.player.addPlayer(document.getElementById('AxUMF'), page.methods.setupPlayer);

					// Attach events
					page.methods.attachEvents();

					//Disable enter key:
					document.onkeypress = function(e){return (window.event.keyCode != 13);}

					//Set flag to avoid problems due to early resize messages:
					page.members.pageLoaded = 1;
					page.methods.resizePage();					

					CAP.logging.info('VCA Scene Change page Initialisation...DONE!');
				} catch (exception) {
					CAP.logging.error('VCA Scene Change page Initialisation...FAILED: ' + exception);
					return;
				}
			},

			uninit: function () {
				try {
					if(CAP.player.isSetup()) {
						//Disconnect UMFBlocks
						CAP.player.disconnectUMFBlocks(page.members.VCAViewHandle, page.members.VCARenderHandle,"RENDER");
						CAP.player.disconnectUMFBlocks(page.members.VCAAudioVideoHandle, page.members.VCAViewHandle, "RENDER");
						CAP.player.disconnectUMFBlocks(page.members.VCAViewHandle, page.members.VCADataMgrHandle, "DATAMANAGER");
					}
					// Stop player/remove it from container element
					CAP.player.removePlayer(document.getElementById('AxUMF'));

					//TODO: comment Make the status update whenever the server data is refreshed:
					top.$(window.top).unbind('capAjaxMessageHide', page.eventCallback.serverDataSet);
					top.$(window.top).unbind('capServerDataRefresh', page.eventCallback.updateData);
					top.$(window.top).unbind('resize', page.methods.resizePage);

					// Revert page style changes
					page.methods.resetPageSize();
				
					// Unset flag to avoid late resize event
					page.members.pageLoaded = 0;
				} catch (exception) {
					CAP.logging.error('VCA scene change detection page element finalisation...FAILED: ' + exception);
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

					page.methods.resizePage();

				} catch (exception) {
					CAP.logging.error('VCA Scene Change page element toggling...FAILED: ' + exception);
					return;
				}
			},

			activateButtons: function (activeState) {
				if('boolean' === typeof (activeState)) {
					// Enable the buttons
					$('#btnApply').button('option', 'disabled', !activeState);
				}
			},

			initElements: function () {
				try {
					//CAP.ajax.autoLoad(window,'VCA.Ch0.Sd');
					CAP.validation.attachAutoValidation(window);
					page.eventCallback.updateAdvancedEnable();
					//Disable Apply button
					page.methods.activateButtons(false);
				} catch (exception) {
					CAP.logging.error('VCA Scene Change page element initialisation...FAILED: ' + exception);
					return;
				}
			},

			attachEvents: function () {
				//Attach change listeners to the text fields so that the activex is notified:
				var inputItems = $('input.auto-text, span.auto-multi, select.auto-select, span.auto-select, input.auto-yesno').toArray();
				
				for(itemNum=0; itemNum < inputItems.length; itemNum++)
				{
					jQuery(inputItems[itemNum]).bind('keyup change',inputItems[itemNum].id,page.eventCallback.settingChanged);
				}
			},

			setupPlayer: function () {
				try {
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
					CAP.player.enableSceneChgUI(page.members.VCAViewHandle);

					//Load Server Data
					var serverDataXml = CAP.ajax.getAllServerDataXml();
					CAP.player.provideServerData(page.members.VCADataMgrHandle, serverDataXml);

					//Resize the page:
					ResizePage($('#config-page').height());
				} catch (exception) {
					CAP.logging.error('VCA Scene Change player setup...FAILED: ' + exception);
					return;
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
					
					var axWidth = $('#config-page').width() - $('#rightpanel').outerWidth(true) - $('#AxUMF').outerWidth(true) + $('#AxUMF').width();
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

					var axPadding = $('#AxUMF').outerWidth(true) - $('#AxUMF').width();

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

						$('#rightpanel').css({
							"float" : "left"
						});

						$('#AxUMF').css({
							"height" : axHeight,
							"width" : axWidth
						});
						
						var verticalPadding = (300 - $('#loadingMessage').height())/2;
						
						$('#loadingMessage').css({
							"margin-top": verticalPadding,
							"margin-bottom": verticalPadding
						});
						
						ResizePage($('#config-page').height());
					}

				} catch (exception) {
					CAP.logging.error('VCA Scene Change page formating...FAILED: ' + exception);
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

		};

	// Initialise the page when the DOM loads
	$(window).ready(page.methods.init);
	// Finalise the page when the DOM unloads
	$(window).unload(page.methods.uninit);
	// Update elements' size
	$(window).resize(page.methods.resizePage);

}(CAP, CAP.VCA, window));

