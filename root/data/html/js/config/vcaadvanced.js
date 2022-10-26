/*	This file uses JsDoc Toolkit documentation.
 *	http://code.google.com/p/jsdoc-toolkit/
 */

/**	@fileOverview This file contains the control code for the VCA advanced page.
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
/*
$(function () {
});*/


(function (CAP, VCA, window, undefined) 
{
	// Language
	getLangEnvironment("advanced");
	
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
			CAP.ajax.autoSave(window,'VCA.Ch0');
		},

		restoreDefaults: function (event) {
			try {
//				var doRestore = confirm("WARNING: This will restore all VCA advanced settings to their default values. Are you sure you want to continue?");
				var doRestore = confirm(top.GetMsgLang("04050546"));

				if(doRestore) {
					CAP.logging.verbose('Restore Defaults');
					var jsonArray = [];
					var autoItems = [];
					var baseGroup = 'VCA.Ch0';
					//Get all auto items from page
					autoItems.push.apply(autoItems, window.$('input.auto-text').toArray());
					autoItems.push.apply(autoItems, window.$('span.auto-multi').toArray());
					autoItems.push.apply(autoItems, window.$('select.auto-select').toArray());
					autoItems.push.apply(autoItems, window.$('span.auto-select').toArray());
					autoItems.push.apply(autoItems, window.$('input.auto-yesno').toArray());

					for (itemNum = 0; itemNum < autoItems.length; itemNum++) {
						jsonArray.push({group: baseGroup + '.' + autoItems[itemNum].id});
					}
					CAP.ajax.restoreServerData(jsonArray);
				}
			} catch (exception) {
				CAP.logging.error('Failed to restore default settings: ' + exception);
				throw exception;
			}
		},

		restoreAllDefaults: function (event) {
			try {
				var doRestore = confirm("WARNING: This will restore ALL VCA advanced settings to their default values. Any user configuration will be lost! For default settings, VCA will be switched off and you will be redirected to the Enable/Disable page. If you decide to proceed, this will take a moment. Are you sure you want to continue?");

				if(doRestore) {
					CAP.logging.verbose('Restore Defaults');
					CAP.ajax.restoreServerData(
						[
							{	group: 'VCA.Ch0'	}
						]);
				}
			} catch (exception) {
				CAP.logging.error('Failed to restore all default VCA settings: ' + exception);
				throw exception;
			}
		},

		updateData: function( event )
		{
			var vcaEnabled = CAP.ajax.getServerData( 'VCA.Ch0.enable' ) === "yes";
			if(vcaEnabled)
				page.methods.initElements();
			else
			{
			    parent.$("#leftmenu .vcaContents + div a[href='vcaenabledisable.html']").click();
			    parent.$("#vcaMenuHeader").click();
			}
		},

		settingChanged: function (event) {
			try {
				//Enable Apply button
				$('#btnApply').button('option', 'disabled', false);
			} catch (exception) {
				CAP.logging.error('settingChanged Failed: ' + exception);
			}
		},

		areaChanged: function (event)
		{
			var newValue = parseInt($("#minobjarea").val());

			$("#minobjarea").attr('disabled',$("input[name='autominobjarea'][id='yes']").attr('checked'));
		},

		statChanged: function (event)
		{
			var newValue = parseInt($("#statholdontime").val());

			$("#statholdontime").attr('disabled',$("input[name='autostatholdontime'][id='yes']").attr('checked'));
		},
	};

	page.methods = 
	{
		init: function () 
		{
			try 
			{
				var object	= 0;

				CAP.logging.verbose('Initialising VCA Advanced page...');
					
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

				// Attach new listeners
				top.$(window.top).bind('capServerDataRefresh', page.eventCallback.updateData);

				// Bind the element functions
				$('#btnApply').button().click(page.eventCallback.submit);
				$('#btnRestoreDefaults').button().click(page.eventCallback.restoreDefaults);
				$('#btnRestoreAllDefaults').button().click(page.eventCallback.restoreAllDefaults);
				
				$("#autominobjarea").bind('change',page.eventCallback.areaChanged);
				$("#autostatholdontime").bind('change',page.eventCallback.statChanged);

				// Enable of disable the elements according to the current enable status:
				page.methods.toggleElements();

				// Initialize the elements
				page.methods.initElements();

				// Attach events
				page.methods.attachEvents();
				
				CAP.logging.info('VCA Advanced page Initialisation...DONE!');
			}
			catch (exception) 
			{
				CAP.logging.error('VCA Advanced page Initialisation...FAILED: ' + exception);
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
				$('#btnApply').button('option', 'disabled', !vcaEnabled);

				ResizePage($("#config-page").height());
			} catch (exception) {
				CAP.logging.error('VCA Advanced page element toggling...FAILED: ' + exception);
				return;
			}
		},

		initElements: function () 
		{
			CAP.ajax.autoLoad(window,'VCA.Ch0');
			CAP.validation.attachAutoValidation(window);
			// Disable Apply button
			$('#btnApply').button('option', 'disabled', true);
		},

		attachEvents: function () {
			//Attach change listeners to the text fields so that the save button can be enabled whenever they change:
			var inputItems = $('input.auto-text, span.auto-multi, select.auto-select, span.auto-select, input.auto-yesno').toArray();
			
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
