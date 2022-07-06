/*	This file uses JsDoc Toolkit documentation.
 *	http://code.google.com/p/jsdoc-toolkit/
 */

/**	@fileOverview This file contains the control code for the VCA burnt in
 *	page.
 *	@author CAP
 */

/*global
	CAP,
	CAP.VCA,
 */
/*
$(function () {
});*/

var streamCount = 4;

(function (CAP, VCA, window, undefined) 
{
	// Language
	getLangEnvironment("burntinannotation");
	
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
		console.error('CAP.VCA: Error: You must include the base ' +
			'CAP library, VCA and jQuery');
		return;
	}


	var page = {};

	page.defines = {};

	page.enums = {};

	page.members =
	{
		channelNo: 0
	};

	page.eventCallback =
	{
		submit: function (event) 
		{
			// Update the hidden checkbox
			page.methods.preAutoSaveMultiColor();

			CAP.ajax.autoSave(window,'VCA.Ch0');
		},

		restoreDefaults: function (event) {
			try {
//				var doRestore = confirm("WARNING: This will restore all VCA BiA settings to their default values. Are you sure you want to continue?");
				var doRestore = confirm(top.GetMsgLang("04051142"));

				if(doRestore) {
					CAP.logging.verbose('Restore Defaults');
					CAP.ajax.restoreServerData(
						[
							{	group: 'VCA.Ch0.Ba0'	},
							{	group: 'VCA.Ch0.Ba1'	},
							{	group: 'VCA.Ch0.Ba2'	},
							{	group: 'VCA.Ch0.Ba3'	}
						]);
				}
			} catch (exception) {
				CAP.logging.error('Failed to restore default settings: ' + exception);
				throw exception;
			}
		},

		updateData: function( event )
		{
			page.methods.initElements();
		},

		settingChanged: function (event) {
			try {
				//Enable Apply button
				$('#btnApply').button('option', 'disabled', false);
			} catch (exception) {
				CAP.logging.error('settingChanged Failed: ' + exception);
			}
		}
	};

	page.methods = 
	{
		init: function () 
		{
			try 
			{
				var object	= 0;

				CAP.logging.verbose('Initialising VCA BIA page...');
					
				//Start loading the config if necessary:
				CAP.loadConfig();

				// Call the common functions to show the page
				// TODO: This should be phased out in future releases.
				CAP.page.show(window);

				if(!CAP.VCA.initialized()) {
					top.$(window.top).bind(
						'capVcaInitialized',
						page.methods.init);
					CAP.logging.info('VCA not initialized.  Page initialization is ' +
						'waiting for \'capVcaInitialized\' event');
					return;
				}

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

				// Setup the tabs
				$("#stream_tabs").tabs({
					show: function (event, ui) {
						ResizePage($("#config-page").height());
					}
				});

				// Attach new listeners
				top.$(window.top).bind('capServerDataRefresh', page.eventCallback.updateData);

				// Bind the element functions
				$('#btnApply').button().click(page.eventCallback.submit);
				$('#btnRestoreDefaults').button().click(page.eventCallback.restoreDefaults);

				// Create the stream pages from the templates
				var template = $('#streamTemplate').html();
				for(i = 0; i < streamCount; i++) {
					$('div>#stream_' + i).empty().append(template.replace(
						/Ba0/g, 'Ba' + i).replace(/S0/g, 'S' + i));
				}

				$('#streamTemplate').remove();

				// Initialize the elements
				page.methods.initElements();

				// Enable of disable the elements according to the current enable status:
				page.methods.toggleElements();

				// Attach events
				page.methods.attachEvents();

				CAP.logging.info('VCA BIA page Initialisation...DONE!');
			}
			catch (exception) 
			{
				CAP.logging.error('VCA BIA page Initialisation...FAILED: ' + exception);
				return;
			}
		},

		uninit: function () 
		{
			//Remove event handlers:
			top.$(window.top).unbind('capVcaInitialized', page.methods.init);
			top.$(window.top).unbind('capServerDataRefresh', page.eventCallback.updateData);
		},

		toggleElements: function () 
		{
			try {
				var vcaEnabled = CAP.VCA.channel[0].enable();

				// Show the controls
				$('.vcaDisabled').toggle(!vcaEnabled);
				$('.vcaEnabled').toggle(vcaEnabled);
				$('.vcaInitialising').toggle(false);
				$('.vcaSaving').toggle(false);

				// If IPT then don't show certain options
				var brandInfo = CAP.brand.getBrandInfo();
				if("rs51c0b" == brandInfo.information.videoin.imgdevice || "mdc200s" == brandInfo.information.videoin.imgdevice || "mdc600s" == brandInfo.information.videoin.imgdevice)
					$(".notTofDevice").toggle(false);
				else
					$(".notTofDevice").toggle(true);

				// Work out the initial state of the elements disabled status
				$('.vcaElement').attr('disabled', !vcaEnabled);

				// Enable the buttons
				//$('#btnApply').button('option', 'disabled', !vcaEnabled);

				// Enable/disable bia options
				for(stream = 0; stream < streamCount; stream++) {
					var enableWidgetPrefix = "#Ba" + stream + "\\.";
					$('#biaOptionsS' + stream).toggle(
						$(enableWidgetPrefix + 'enable').attr('checked'));
					$('#objectOptionsS' + stream).toggle(
						$(enableWidgetPrefix + 'enableobject').attr('checked'));
					$('#counterOptionsS' + stream).toggle(
						$(enableWidgetPrefix + 'enablecounter').attr('checked'));
					$('#sysMsgOptionsS' + stream).toggle(
						$(enableWidgetPrefix + 'enablesysmsg').attr('checked'));

					var multiColor = $('#multiColorS' + stream).attr('checked') == true;
					$(enableWidgetPrefix + 'alarmcolor').attr('disabled', multiColor);
					$(enableWidgetPrefix + 'nonalarmcolor').attr('disabled', multiColor);
				}

				ResizePage($("#config-page").height());

			} catch (exception) {
				CAP.logging.error('VCA BIA page element toggling...FAILED: ' + exception);
				return;
			}
		},

		autoLoadMultiColor: function ()
		{
			var stream = 0;
			for(stream = 0; stream < streamCount; stream++) {
				var multiColor = CAP.ajax.getServerData(
					'VCA.Ch0.Ba' + stream + '.objectfmt').split(
					',').indexOf('multicolor') != -1;
				$('#twoColorS' + stream).attr('checked', !multiColor);
				$('#multiColorS' + stream).attr('checked', multiColor);
			}
		},

		preAutoSaveMultiColor : function ()
		{
			var stream;
			for(stream = 0; stream < streamCount; stream++) {
				var multiColor = $('#multiColorS' + stream).attr('checked');
				$('#Ba' + stream + '\\.objectfmt > #multicolor').attr(
					'checked', multiColor);
			}
		},

		bindEnableHandler: function (stream, enableControl)
		{
			var enableGroup = "#Ba" + stream + "\\.";
			$(enableGroup + enableControl).change(
				page.methods.toggleElements).change();
		},

		initElements: function () 
		{
			var i;

			// Populate the widgets
			CAP.ajax.autoLoad(window,'VCA.Ch0');
			CAP.validation.attachAutoValidation(window);

			// Go get information about the board

			// Show/hide analogue output tab depending if encoder or not
			var brandInfo = CAP.brand.getBrandInfo();
			if( brandInfo.information.videoout.tvout != "1" ||
				// TODO: Remove this hack once SW2 add a universal way to determine if the device has
				// a DAC for video output. See IPXSDK-4731
				brandInfo.information.videoin.imgdevice == "scm6200") {
				// It's a camera so remove the 3rd analog out tab
				$('#stream_tabs').tabs('remove', 3);
			}

			// Show/hide licensed widgets
			var features = CAP.VCA.channel[0].license.features;
			$('.vcaCalibration').toggle(features.calibration());
			$('.vcaCounting').toggle(features.counting());
			$('.vcaDiagnostics').toggle(features.linecounter() || features.tamper());
			$('.vcaCountingLine').toggle(features.linecounter());
			$('.vcaTamperInfo').toggle(features.tamper());

			// Handle two/multi color radio buttons with custom code
			page.methods.autoLoadMultiColor();

			// Add greying handlers
			for(i = 0; i < streamCount; i++) {
				page.methods.bindEnableHandler(i, 'enable');
				page.methods.bindEnableHandler(i, 'enableobject');
				page.methods.bindEnableHandler(i, 'enablecounter');
				page.methods.bindEnableHandler(i, 'enablesysmsg');

				$('#twoColorS' + i).change(
					page.methods.toggleElements).change();
				$('#multiColorS' + i).change(
					page.methods.toggleElements).change();
			}

			// Disable Apply button
			$('#btnApply').button('option', 'disabled', true);
		},

		attachEvents: function () {
			//Attach change listeners to the text fields so that the activex is notified:
			var inputItems = $('input.auto-text, span.auto-multi, select.auto-select, span.auto-select, input.auto-yesno, input.indent1').toArray();
			
			for(itemNum=0; itemNum < inputItems.length; itemNum++)
			{
				jQuery(inputItems[itemNum]).bind('keyup change',inputItems[itemNum].id,page.eventCallback.settingChanged);
			}
		}
	};

	// Initialise the page when the DOM loads
	$(document).ready(page.methods.init);
	// Finalise the page when the DOM unloads
	$(window).unload(page.methods.uninit);
}(CAP, CAP.VCA, window));

