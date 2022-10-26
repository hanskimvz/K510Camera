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
	getLangEnvironment("complexrules");
  
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
			isDiagOpen: false,
			isLanguageSet: false,
			timeoutHandle: null,
			currentlySaving: false
		};

	page.eventCallback =
		{
			addRule: function () {
				var newRule = CAP.ComplexRules.workData.addNewRule();
				page.methods.updateSelectedRule(newRule);
				page.members.isDiagOpen = true;
				page.methods.resizePage();
				$("#rule-dialog").dialog("option", "title", GetMsgLang("04051313"));
				$("#rule-dialog").dialog("open");
			},

			modifyRule: function () {
				$("#rule-dialog").dialog("option", "title", GetMsgLang("04051314"));
				$("#rule-dialog").dialog("open");
				page.members.isDiagOpen = true;
				page.methods.resizePage();
			},

			removeRule: function () {
				var doRemove = confirm(GetMsgLang("04051377"));

				if(doRemove) 
				{
					var scope = angular.element($('#config-page')).scope();
					CAP.ComplexRules.workData.removeRule(scope.selectedrule.id);
					page.methods.saveWork();				

					page.methods.selectDefaultRule();
				}
			},

			editRuleOK: function () {
				var scope = angular.element($('#config-page')).scope();
				if(scope.selectedrule.isValid()) {
					page.methods.saveWork();
					$("#rule-dialog").dialog("close");
					page.members.isDiagOpen = false;
					page.methods.resizePage();
				}
				else {
					alert(GetMsgLang("04051378"));
				}
			},

			editRuleCancel: function () {
				var restoreIsNeeded = CAP.ComplexRules.getChanges().length > 0;
				if(restoreIsNeeded) 
					CAP.ComplexRules.restoreWork();

				page.methods.selectDefaultRule();
				$("#rule-dialog").dialog("close");
				page.members.isDiagOpen = false;
				page.methods.resizePage();

				if(restoreIsNeeded) {
					page.methods.refreshData();
				}			
			},

			restoreDefaults: function (event) {
				try {
					var doRestore = confirm(GetMsgLang("04051379"));

					if(doRestore) {
						for(var key in CAP.ComplexRules.workData) {
							if(key.match("Rl[0-9]{1,2}") && CAP.ComplexRules.workData[key].type === "complex") {
								CAP.ComplexRules.workData.removeRule(CAP.ComplexRules.workData[key].id);
							}
		 				}
						page.methods.saveWork();

						CAP.logging.verbose('Restore Defaults');
					}
				} catch (exception) {
					CAP.logging.error('Failed to restore default settings: ' + exception);
					throw exception;
				}
			},

			serverDataSet : function (event) {
				//Re-enable buttons
				page.members.currentlySaving = false;
				page.methods.activateButtons();
			},

			updateData: function( event )
			{
				if(CAP.ajax.getServerData("VCA.Ch0.Cr.status") == "pending")
				{
					top.$(window.top).one('capServerDataRefresh', page.eventCallback.updateData);
					page.members.timeoutHandle = setTimeout(CAP.ajax.reloadServerData,2000);
				}
				else
				{
					page.methods.initElements();
					if(CAP.ajax.getServerData("VCA.Ch0.Cr.status") == "error")
					{
						alert(GetMsgLang("04051381") + CAP.ajax.getServerData("VCA.Ch0.Cr.error"));
					}
				}
			}
		};

	page.methods = {
			init: function ()
			{
				try {
					var object	= 0;
					var newPreset;

					CAP.logging.verbose('Initialising VCA Complex Rules page...');
					
					//Start loading the config if necessary:
					CAP.loadConfig();

					// Call the common functions to show the page
					// TODO: This should be phased out in future releases.
					CAP.page.show(window);

					if(!page.members.isLanguageSet) {
						top.$(window.top).one('languageSet', page.methods.init);
						page.methods.setLanguage();
						CAP.logging.info('Language not set.  Page initialization is waiting for \'languageSet\' event');
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
					top.$(window.top).bind('complexRulesModified', page.methods.refreshData);

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
					$('#btnAdd').button().click(page.eventCallback.addRule);
					$('#btnModify').button().click(page.eventCallback.modifyRule);
					$('#btnRemove').button().click(page.eventCallback.removeRule);
					$('#btnRestoreDefaults').button().click(page.eventCallback.restoreDefaults);

					// Initialize the elements
					page.methods.initElements();
	
					CAP.logging.info('VCA Complex Rules page Initialisation...DONE!');
				} catch (exception) {
					CAP.logging.error('VCA Complex Rules page Initialisation...FAILED: ' + exception);
					return;
				}
			},

			uninit: function () {
				try {
					if(page.members.timeoutHandle != null)
						clearTimeout(page.members.timeoutHandle);
					top.$(window.top).unbind('capAjaxMessageHide', page.eventCallback.serverDataSet);
					top.$(window.top).unbind('complexRulesModified', page.methods.refreshData);
					top.$(window.top).unbind('resize', page.methods.resizePage);
				} catch (exception) {
					CAP.logging.error('VCA Complex Rules page element finalisation...FAILED: ' + exception);
					return;
				}
			},

			activateButtons: function () {
				var crRulesBTzero = false;
				for(var key in CAP.ComplexRules.workData) {
					if(key.match("Rl[0-9]{1,2}") && CAP.ComplexRules.workData[key].type === "complex") {
						crRulesBTzero = true;
						break;
					}
				}
				$('#btnAdd').button('option', 'disabled', page.members.currentlySaving);
				$('#btnModify').button('option', 'disabled', (!crRulesBTzero) || page.members.currentlySaving);
				$('#btnRemove').button('option', 'disabled', (!crRulesBTzero) || page.members.currentlySaving);
				$('#btnRestoreDefaults').button('option', 'disabled', page.members.currentlySaving);
			},

			setLanguage: function () {
				//Language set
				var environmentReq = new CGIRequest();
				var environmentReqQString = "";
				environmentReq.SetAddress("/environment.xml");
				environmentReq.SetCallBackFunc( function(xml){
					revLang = "/language/base/English.xml";
		  
					if($('lang', xml).size() > 0)
						revLang = $('lang', xml).text();

					var classNum = [];
					//complexrules section:
					for(var i = 1; i < 10; i++) 
						classNum.push("0405130"+i.toString());
					for(var i = 10; i < 88; i++) 
						classNum.push("040513"+i.toString());

					InitMsgLang(classNum);

					getLangXml(revLang, "setup maincontents complexrules", function() {
						page.members.isLanguageSet = true;
						top.$(window.top).trigger('languageSet');
					});
				});
				environmentReq.Request(environmentReqQString);
			},

			initElements: function () {
				try {
					$("#rule-dialog").dialog({
						dialogClass: "no-close",
						autoOpen: false,
						minWidth: 620,
						width: 620,
						height: "auto",
						modal: true,
						resizable: false,
						position: [20,20],
						draggable: false,
						buttons: [
							{
								text: GetMsgLang("04051309"),
								click: page.eventCallback.editRuleOK,
							},
							{
								text: GetMsgLang("04051310"),
								click: page.eventCallback.editRuleCancel,
							}
						],
					});

					page.methods.selectDefaultRule();

					//Disable Modify and Remove buttons
					page.methods.activateButtons();
				} catch (exception) {
					CAP.logging.error('VCA Complex Rules page element initialisation...FAILED: ' + exception);
					return;
				}
			},

			resizePage : function()
			{
				try {
					if(page.members.isDiagOpen) {
						top.$('#frame').css({
							"max-width" : "none",
							"min-width" : "885px",
							"width" : "100%",
							"overflow" : "hidden"
						});
						top.$('#right').css({
							"max-width" : "none",
							"width" : "auto",
							"float" : "none"
						});
						var extrasHeight = 0;
						if(top.$('#right').length)
							var extrasHeight = top.$('#right').offset().top + (top.$('#right').outerHeight(true) - top.$('#right').outerHeight());
						var newHeight = 0;
						if(typeof(top.window.innerHeight) !== "undefined")
							newHeight = top.window.innerHeight - extrasHeight;
						else //IE8
							newHeight = top.$('body').parent().height() - extrasHeight;
						if(top.document.getElementById("contentFrame") != null)
							top.document.getElementById("contentFrame").height = newHeight;
						parent.$("#ComplexRuleSettingFrame").height(newHeight);
						$("#rule-dialog").dialog( "option", "maxHeight", newHeight - 120 );

						var newDiagWidth = parent.$("#ComplexRuleSettingFrame").width() - 40;
						$("#rule-dialog").dialog( "option", "width", newDiagWidth );
					}
					else {
						if(parent.$('#rule_tabs').tabs("option", "selected") === 1) {
							top.$('#frame').css({
								"max-width" : "715px",
							});
							top.$('#right').css({
								"max-width" : "715px",
							});
							var height = $("#config-page").height();
							parent.$("#ComplexRuleSettingFrame").height(height);
						}
					}
				} catch (exception) {
					CAP.logging.error('VCA Complex Rules page formating...FAILED: ' + exception);
					return;
				}
			},

			updateSelectedRule: function (rule) {
				var scope = angular.element($('#config-page')).scope();
				scope.$apply(function () {
					scope.selectedrule = rule;
				});
			},

			selectDefaultRule: function() {
				var scope = angular.element($('#config-page')).scope();
				for(var key in scope.complexrulesobj)
				{
					if(key.match("Rl[0-9]{1,2}") && scope.complexrulesobj[key].type === "complex")
					{
						scope.selectedrule = scope.complexrulesobj[key];
						break;
					}
				}
			},

			refreshData: function () {
				var scope = angular.element($('#config-page')).scope();
				scope.$apply(function () {
					scope.$broadcast("refreshData");
				});
			},

			saveWork: function () {
				var crCommands = CAP.ComplexRules.getChanges();
				if(crCommands.length > 0)
				{
					crCommands.push({action:'update',group:'VCA.Ch0.Cr',entries:[{id:'status', value:'pending'}]});
					top.$(window.top).one('capServerDataRefresh', page.eventCallback.updateData);
					page.members.currentlySaving = true;
					page.methods.activateButtons();
					CAP.ajax.setServerData(crCommands);
				}
			},

			confirmDiscard : function() {
				if(page.members.isDiagOpen) {
					var doDiscard = confirm(GetMsgLang("04051311").replace(/\\n/g,"\n"));

					if(doDiscard)
						page.eventCallback.editRuleCancel();
				}
				return doDiscard;
			}
		};

	// Initialise the page when the DOM loads
	$(window).ready(page.methods.init);
	// Finalise the page when the DOM unloads
	$(window).unload(page.methods.uninit);
	// Update elements' size
	top.$(window.top).resize(page.methods.resizePage);
}(CAP, CAP.VCA, window));

