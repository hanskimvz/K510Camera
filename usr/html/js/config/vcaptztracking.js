/*	This file uses JsDoc Toolkit documentation.
 *	http://code.google.com/p/jsdoc-toolkit/
 */

/**	@fileOverview This file contains the control code for the VCA ptztracking page.
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
	getLangEnvironment("ptztracking");
	
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
		ruleList: [],
		selectionList: [],
		channelNo: 0,
		selectedSelection: -1,
		availableSelection: -1
	};

	page.eventCallback =
	{
		submit: function (event) 
		{
			//Disable Apply button
			$('#btnApply').button('option', 'disabled', true);

			page.methods.storeSelections();
			CAP.ajax.autoSave(window,'VCA.Ch0.Ptz');
		},

		selectionChangedAvailable : function(event)
		{
			page.members.availableSelection = $("#availableRulesList").attr("selectedIndex");
		},

		selectionChangedSelected : function(event)
		{
			page.members.selectedSelection = $("#selectedRulesList").attr("selectedIndex");
		},

		left: function (event) 
		{
			if(page.members.availableSelection>=0)
			{
				var sel = $('#availableRulesList');
				var selId = parseInt(sel[0].options[page.members.availableSelection].value);	
				page.members.selectionList[selId] = 1;
				page.methods.parseLists();
				$('#btnApply').button('option', 'disabled', false);
			}
			page.members.availableSelection = -1;
			page.members.selectedSelection = -1;
			page.eventCallback.settingChanged();
		},

		right: function (event) 
		{
			if(page.members.selectedSelection>=0)
			{
				var sel = $('#selectedRulesList');
				var selId = parseInt(sel[0].options[page.members.selectedSelection].value);	
				page.members.selectionList[selId] = 0;
				page.methods.parseLists();
				$('#btnApply').button('option', 'disabled', false);
			}
			page.members.availableSelection = -1;
			page.members.selectedSelection = -1;
			page.eventCallback.settingChanged();
		},

		updateEnable : function()
		{
			var enabled = $('#enable').attr('checked');
			var atenabled = $("[id='At.enable']").attr('checked');
			if(enabled)
			{
				$('#homepreset').attr("disabled",false);
				$('#hometrackingonly').attr("disabled",false);
				$('#return2home').attr("disabled",false);
				$('#return2hometimeout').attr("disabled",false);
				$("[id='At.enable']").attr("disabled",false);
				if(atenabled)
				{
					$("[id='At.maxtrackingtime']").attr("disabled",false);
					$("[id='At.holdontime']").attr("disabled",false);
					$("[id='At.manualoverride']").attr("disabled",false);
					$("[id='At.triggertype']").attr("disabled",!CAP.VCA.channel[0].license.features.autotrackinglayon());
					$('#availableRulesList').attr("disabled",!CAP.VCA.channel[0].license.features.autotrackinglayon());
					$('#btnLeft').attr("disabled",!CAP.VCA.channel[0].license.features.autotrackinglayon());
					$('#btnRight').attr("disabled",!CAP.VCA.channel[0].license.features.autotrackinglayon());
					$('#selectedRulesList').attr("disabled",!CAP.VCA.channel[0].license.features.autotrackinglayon());
				}
				else
				{
					$("[id='At.maxtrackingtime']").attr("disabled",true);
					$("[id='At.holdontime']").attr("disabled",true);
					$("[id='At.manualoverride']").attr("disabled",true);
					$("[id='At.triggertype']").attr("disabled",true);
					$('#availableRulesList').attr("disabled",true);
					$('#btnLeft').attr("disabled",true);
					$('#btnRight').attr("disabled",true);
					$('#selectedRulesList').attr("disabled",true);
				}
			}
			else
			{
				$('#homepreset').attr("disabled",true);
				$('#hometrackingonly').attr("disabled",true);
				$('#return2home').attr("disabled",true);
				$('#return2hometimeout').attr("disabled",true);
				$("[id='At.enable']").attr("checked",false);
				$("[id='At.enable']").attr("disabled",true);
				$("[id='At.maxtrackingtime']").attr("disabled",true);
				$("[id='At.holdontime']").attr("disabled",true);
				$("[id='At.manualoverride']").attr("disabled",true);
				$("[id='At.triggertype']").attr("disabled",true);
				$('#availableRulesList').attr("disabled",true);
				$('#btnLeft').attr("disabled",true);
				$('#btnRight').attr("disabled",true);
				$('#selectedRulesList').attr("disabled",true);
			}
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

				CAP.logging.verbose('Initialising VCA ptztracking page...');
					
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

				// Bind the element functions
				$('#btnApply').button().click(page.eventCallback.submit);
				$('#btnLeft').button().click(page.eventCallback.left);
				$('#btnRight').button().click(page.eventCallback.right);
				$('#availableRulesList').click(page.eventCallback.selectionChangedAvailable);
				$('#selectedRulesList').click(page.eventCallback.selectionChangedSelected);
				$('#enable').change(page.eventCallback.updateEnable);
				$("[id='At.enable']").change(page.eventCallback.updateEnable);

				// Enable of disable the elements according to the current enable status:
				page.methods.toggleElements();

				// Initialize the elements
				page.methods.initElements();

				page.eventCallback.updateEnable();

				// Attach events
				page.methods.attachEvents();

				CAP.logging.info('VCA ptztracking page Initialisation...DONE!');
			}
			catch (exception) 
			{
				CAP.logging.error('VCA ptztracking page Initialisation...FAILED: ' + exception);
				return;
			}
		},

		uninit: function () 
		{
			//Remove event handlers:
			top.$(window.top).unbind('capVcaInitialized', page.methods.init);
			page.methods.detachEvents();
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

				// Work out the initial state of the elements disabled status
				$('.vcaElement').attr('disabled', !vcaEnabled);

				// Enable the buttons
				$('#btnApply').button('option', 'disabled', !vcaEnabled);

				ResizePage($("#config-page").height());
			} catch (exception) {
				CAP.logging.error('VCA ptztracking page element toggling...FAILED: ' + exception);
				return;
			}
		},

		storeSelections: function ()
		{
			var selectionString = "";
			var notFirst = 0;
			var test;
			for(ruleNum=0; ruleNum < 60; ruleNum++)
			{
				if(page.members.selectionList[ruleNum])
				{
					if(notFirst)
					{
						selectionString = selectionString.concat(",");
					}
					notFirst = 1;
					selectionString = selectionString.concat( ruleNum.toString());
				}
			}
			CAP.ajax.setServerData([{action:'update',group:'VCA.Ch0.Ptz.At',entries:[{id:'triggerrules',value:selectionString}]}]);
		},

		parseLists: function ()
		{
			$('#availableRulesList').empty();
			$('#selectedRulesList').empty();

			for(ruleNum=0; ruleNum < page.members.ruleList.length; ruleNum++)
			{
				if(page.members.selectionList[ruleNum])
				{
					newEntry = document.createElement("option");
					newEntry.text = page.members.ruleList[ruleNum].name;
					newEntry.value = ruleNum;
				
					var sel = $('#selectedRulesList');
					sel[0].options[sel[0].options.length] = newEntry;
				}
				else
				{
					newEntry = document.createElement("option");
					newEntry.text = page.members.ruleList[ruleNum].name;
					newEntry.value = ruleNum;
				
					var sel = $('#availableRulesList');
					sel[0].options[sel[0].options.length] = newEntry;
				}
			}
		},		

		initElements: function () 
		{
			CAP.ajax.autoLoad(window,'VCA.Ch0.Ptz');
			CAP.validation.attachAutoValidation(window);
		
			page.members.ruleList = [];
			for(ruleNum=0; ruleNum<60; ruleNum++)
			{
				var ruleId;
				ruleId = CAP.ajax.getServerData("VCA.Ch0.Rl"+ruleNum+".uid",true);
				if(ruleId !== null)
				{
					var newObject = {};
					newObject.name = CAP.ajax.getServerData("VCA.Ch0.Rl"+ruleNum+".name");	
					page.members.ruleList.push(newObject);
				}
			}

			var selectedRules = CAP.ajax.getServerData("VCA.Ch0.Ptz.At.triggerrules",true);
			var selectedRules2 = selectedRules.split(',');
			
			for(ruleNum=0; ruleNum < 60; ruleNum++)
			{
				page.members.selectionList[ruleNum] = 0;
			}
			for(ruleNum=0; ruleNum < selectedRules2.length; ruleNum++)
			{
				page.members.selectionList[parseInt(selectedRules2[ruleNum])] = 1;
			}

			page.methods.parseLists();

			// Disable Apply button
			$('#btnApply').button('option', 'disabled', true);
		},

		attachEvents: function () {
			//Attach change listeners to the text fields so that the apply button is enabled:
			var inputItems = $('input.auto-text, span.auto-multi, select.auto-select, span.auto-select, input.auto-yesno').toArray();
			
			for(itemNum=0; itemNum < inputItems.length; itemNum++)
			{
				jQuery(inputItems[itemNum]).bind('keyup change',inputItems[itemNum].id,page.eventCallback.settingChanged);
			}
		},

		detachEvents: function () {
			var inputItems = $('input.auto-text, span.auto-multi, select.auto-select, span.auto-select, input.auto-yesno').toArray();
			
			for(itemNum=0; itemNum < inputItems.length; itemNum++)
			{
				jQuery(inputItems[itemNum]).unbind('keyup change',inputItems[itemNum].id,page.eventCallback.settingChanged);
			}
		}
	};

	// Initialise the page when the DOM loads
	$(document).ready(page.methods.init);
	// Finalise the page when the DOM unloads
	$(window).unload(page.methods.uninit);
}(CAP, CAP.VCA, window));

