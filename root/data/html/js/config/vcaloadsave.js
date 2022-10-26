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
	// Language
	getLangEnvironment("loadsavesetting");
	
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
			uploadStatus: 0,
			resourceReady: false
		};

	page.eventCallback =
		{
			submit: function (event) {
				var uri = "/uapi-cgi/vcaconfig.cgi?action=export&group=";
				uri += page.methods.exportSettingGroup();
				document.location.href = uri;
			},

			load:function()
			{
				var form = document.getElementById("loadform");
				form.group.value = page.methods.importSettingGroup();
				form.submit();
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
					// Bind the element functions
					$('#btnApply').button().click(page.eventCallback.submit);
					// TODO: This should be phased out in future releases.
					CAP.page.show(window);

					

					
					page.methods.SetRelation();
					page.methods.toggleElements();

					

					
					
				} catch (exception) {
					CAP.logging.error('VCA Enable/Disable page Initialisation...FAILED: ' + exception);
					return;
				}
			},

			uninit: function () {
				//Remove event handlers:
				top.$(window.top).unbind('capVcaInitialized', page.methods.init);
			},

			toggleElements: function () {
				$('input[name="xmltick"]').attr("checked",true);

			},

			initElements: function () {
				
			},

			fileExtension_rev :function(fileValue)
			{
			  var lastIndex = -1;
			  var extension = "";

			  lastIndex  = fileValue.lastIndexOf('.');

			  if(lastIndex != -1)
			  {
			    extension = fileValue.substring( lastIndex+1, fileValue.len );
			  }
			  else
			  {
			    extension = "";
			  }

			  return extension;
			},

			fileExtension_chk: function(fileChk)
			{
			  if(fileChk.toLowerCase() != "xml")
			  {
			    $("#btnStart").css("display", "none");
			    alert("Invalid file format for import");
			    return;
			  }
			  else if(fileChk.toLowerCase() == "xml")
			  {
			    $("#btnStart").css("display", "inline");
			  }
			},

			SetRelation: function()
			{
			  $("#btnStart").css("display", "none");
			  $("#btnStart").button().click(page.eventCallback.load);;
			  $("#Filedata").change(function(){
			    var fileData = $(this).val();
			    var fileEx = "";
			    $("#btnStart").css("display", "inline");

			    fileEx = page.methods.fileExtension_rev(fileData);
			    page.methods.fileExtension_chk(fileEx);
			  });
			  $("#iframeImport").load(function(data){
			    var response = $(this.contentWindow.document.body).text();
				ViewLoadingSave(false);
				if(response.search("Failed") != -1)
				{
					alert("Import failed, please check the configuration file");
				}
				else if(response.search("Successful") != -1)
				{
					alert("Import successful");
				}
				
				page.methods.initElements();
			  });
			 
			  $("form").submit(function(){
			    ViewLoadingSave(true);
				$("#btnStart").attr("disabled", true);
			  });
			},

			exportSettingGroup:function()
			{
				var sz = "";

				//if($("#expGeneral").attr("checked") == true)
					sz += "general,";

				//if($("#expZones").attr("checked") == true)
					sz += "zones,";

				//if($("#expRules").attr("checked") == true)
					sz += "rules,";
				
				//if($("#expCounters").attr("checked") == true)
					sz += "counters,";

				//if($("#expCalibration").attr("checked") == true)
					sz += "calib,";

				//if($("#expClass").attr("checked") == true)
					sz += "class,";

				//if($("#expTamper").attr("checked") == true)
					sz += "tamper,";

				//if($("#expBIA").attr("checked") == true)
					sz += "bia,";

				//if($("#expPTZ").attr("checked") == true)
					sz += "ptz,";

				//if($("#expScene").attr("checked") == true)
					sz += "scene";

				return sz;
			},

			importSettingGroup:function()
			{
				var sz = "";

				if($("#impGeneral").attr("checked") == true)
					sz += "general,";

				if($("#impZones").attr("checked") == true)
					sz += "zones,";

				if($("#impRules").attr("checked") == true)
					sz += "rules,";
				
				if($("#impCounters").attr("checked") == true)
					sz += "counters,";

				if($("#impCalibration").attr("checked") == true)
					sz += "calib,";

				if($("#impClass").attr("checked") == true)
					sz += "class,";

				if($("#impTamper").attr("checked") == true)
					sz += "tamper,";

				if($("#impBIA").attr("checked") == true)
					sz += "bia,";

				if($("#impPTZ").attr("checked") == true)
					sz += "ptz,";

				if($("#impScene").attr("checked") == true)
					sz += "scene";

				return sz;
			},
			
		};

	// Initialise the page when the DOM loads
	$(document).ready(page.methods.init);
	// Finalise the page when the DOM unloads
	$(window).unload(page.methods.uninit);
}(CAP, CAP.VCA, window));
