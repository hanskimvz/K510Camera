/*	This file uses JsDoc Toolkit documentation.
 *	http://code.google.com/p/jsdoc-toolkit/
 */

/**	@fileOverview This file contains the control code for the VCA classification page.
 *	@author CAP Technology
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
	getLangEnvironment("classification");
	
	'use strict';
	// Local copies of the window objects for speed
	var document	= window.document;
	var navigator	= window.navigator;
	var location	= window.location;
	var $ = window.$;

	// Check the CAP namespace has been included
	if ((CAP === undefined) || (VCA === undefined) || ($ === undefined)) 
	{
		console.error('CAP.VCA: Error: You must include the base CAP library, VCA and jQuery');
		return;
	}

	var page = {};

	page.defines = 
	{	
		MAX_CLASSIFICATION_GROUPS : 5,
		MAX_CLASSIFIERS : 20
	};

	page.enums = {};

	page.members =
	{
		channelNo: 0,
		currentGroupIndex : 0,
		currentSelectionIndex : -1,
		classifierGroups : [],
		useMetric : true,
		originalClassifiers : null
	};

	page.eventCallback =
	{
		submit: function (event) 
		{
			var jsonArray    = [],
			    i            = 0,
			    j            = 0,
			    k            = 0,
			    areas        = [],
			    speeds       = [],
			    areaOverlap  = false,
			    speedOverlap = false,
			    issueWarning = false;
			for (i = 0; i < page.members.classifierGroups[page.members.currentGroupIndex].classifiers.length; i += 1) {
				var area  = page.members.classifierGroups[page.members.currentGroupIndex].classifiers[i].area.split(':'),
				    speed = page.members.classifierGroups[page.members.currentGroupIndex].classifiers[i].speed.split(':');
				area[0]  = parseInt(area[0] ,10);
				area[1]  = parseInt(area[1] ,10);
				speed[0] = parseInt(speed[0] ,10);
				speed[1] = parseInt(speed[1] ,10);
				if((area[0] > area[1])||(speed[0] > speed[1])) {
					alert('The ' + page.members.classifierGroups[page.members.currentGroupIndex].classifiers[i].name + ' classifier has minimums that are greater than the maximums.  Please fix this before applying the classfication settings.');
					return;
				}
				if(area && speed &&
				   (area.length == 2) &&
				   (speed.length == 2) &&
				   !isNaN(area[0]) &&
				   !isNaN(area[1]) &&
				   !isNaN(speed[0]) &&
				   !isNaN(speed[1])) {
					areaOverlap  = false;
					speedOverlap = false;
					for (j = 0; j < areas.length && !areaOverlap; j += 1) {
						areaOverlap = ((areas[j][0] < area [1]   ) && (area [1]    < areas[j][1])) ||
						              ((areas[j][0] < area [0]   ) && (area [0]    < areas[j][1])) ||
						              ((area [0]    < areas[j][0]) && (areas[j][0] < area [1]   )) ||
						              ((area [0]    < areas[j][1]) && (areas[j][1] < area [1]   ));
					}
					areas.push(area);
					for (k = 0; k < speeds.length && !speedOverlap; k += 1) {
						speedOverlap = ((speeds[k][0] < speed [1]   ) && (speed [1]    < speeds[k][1])) ||
						               ((speeds[k][0] < speed [0]   ) && (speed [0]    < speeds[k][1])) ||
						               ((speed [0]    < speeds[k][0]) && (speeds[k][0] < speed [1]   )) ||
						               ((speed [0]    < speeds[k][1]) && (speeds[k][1] < speed [1]   ));
					}
					speeds.push(speed);
					issueWarning = areaOverlap && speedOverlap;
				}
			}
			if (issueWarning && !confirm('Warning: The ' + page.members.classifierGroups[page.members.currentGroupIndex].classifiers[i-1].name + ' classifier has overlapping values with the ' + page.members.classifierGroups[page.members.currentGroupIndex].classifiers[areaOverlap ? (j-1) : (k-1)].name + ' classifier.  The classification may be ambiguous.\n\nWould you like to continue?')) {
				return;
			}
			page.methods.generateJSON(jsonArray);
			if(jsonArray.length != 0)
			{
				CAP.ajax.setServerData(jsonArray);
				page.members.originalClassifiers = page.methods.deepCopy(page.members.classifierGroups);
			}
		},

		restoreDefaults: function (event) {
			try {
//				var doRestore = confirm("WARNING: This will restore all object classifier settings to their default values. Are you sure you want to continue?");
				var doRestore = confirm(top.GetMsgLang("04050424"));

				if(doRestore) {

					CAP.logging.verbose('Restore Defaults');
					$("#classifierlist").attr("selectedIndex", -1);
					CAP.ajax.restoreServerData(
						[
							{	group: 'VCA.Ch0.Cg0'		}
						]);
				}
			} catch (exception) {
				CAP.logging.error('Failed to restore default settings: ' + exception);
				throw exception;
			}
		},

		selectionChanged : function(event)
		{
			//The selected item changed - load the values into the text boxes:
			page.members.currentSelectionIndex = $("#classifierlist").attr("selectedIndex");

			//Load the details for the selected object classifier
			page.methods.loadDetails(page.members.currentSelectionIndex);
			page.methods.updateAddRemoveButtonState();
		},

		add : function (event)
		{
			var classifierList = page.members.classifierGroups[page.members.currentGroupIndex].classifiers;
			var possibleIds = new Array(page.defines.MAX_CLASSIFIERS);
			var newClassifier = {};
		
			if(classifierList.length >= 20)
				return;//No room for more classifiers

			//Find the first unused identifier
			for(classifierNum=0; classifierNum < classifierList.length; classifierNum++)
				possibleIds[classifierList[classifierNum].id] = 1;
			
			for(idNum=0; idNum <= classifierList.length; idNum++)
				if(possibleIds[idNum] != 1)
				{
					newClassifier.id = idNum;
					break;
				}
			
			newClassifier.name = "Classifier "+newClassifier.id;
			newClassifier.enable = "yes";
			newClassifier.area = "0:10";
			newClassifier.speed = "0:20";

			classifierList.push(newClassifier);

			page.members.currentSelectionIndex = classifierList.length-1;
			page.methods.sortList();
			$('#classifierlist').change();
			page.methods.loadDetails(page.members.currentSelectionIndex);
			page.methods.updateAddRemoveButtonState();
			
			if(classifierList.length == page.defines.MAX_CLASSIFIERS)
			{
				//The list is full - disable the remove button
				$('#btnAdd').attr('disabled',true);
			}

			//Make sure that the remove button is enabled:
			$('#btnRemove').attr('disabled',false);
		},

		remove : function (event)
		{
			var classifierList;
			if(page.members.classifierGroups[page.members.currentGroupIndex] == null)
				return;

			classifierList = page.members.classifierGroups[page.members.currentGroupIndex].classifiers;

			if(page.members.currentSelectionIndex == -1 || page.members.currentSelectionIndex > classifierList.length || page.members.currentSelectionIndex < 0)
				return;

			classifierList.splice(page.members.currentSelectionIndex,1);
			page.members.currentSelectionIndex = -1;
			page.methods.sortList();
			page.eventCallback.selectionChanged();
			page.methods.updateAddRemoveButtonState();
		},

		classifierPropertyChanged : function (event)
		{
			var classifier, min, max;

			if(page.members.classifierGroups[page.members.currentGroupIndex] == null || page.members.currentSelectionIndex == -1)
				return;
			classifier = page.members.classifierGroups[page.members.currentGroupIndex].classifiers[page.members.currentSelectionIndex];

			switch(event.data)
			{
				case "name":
					classifier.name = $('#name').val();
					break;
				case "enableclassifier":
					if($('#enableclassifier').val() == 0)
						classifier.enable = "no";
					else
						classifier.enable = "yes";
					break;
				case "minarea":
				case "maxarea":
					if(page.members.useMetric)
					{
						min = Math.round(parseFloat($('#minarea').val()*10));
						max = Math.round(parseFloat($('#maxarea').val()*10));
					}
					else
					{
						min = Math.round(parseFloat($('#minarea').val()));
						max = Math.round(parseFloat($('#maxarea').val()));
					}
					if(!isNaN(min) && !isNaN(max)) 
					{
						classifier.area = min + ":" + max;
						page.methods.sortList();
					}
					break;
				case "minspeed":
				case "maxspeed":
					min = Math.round(parseFloat($('#minspeed').val()));
					max = Math.round(parseFloat($('#maxspeed').val()));
					if(!isNaN(min) && !isNaN(max)) 
					{
						classifier.speed = min + ":" + max;
						page.methods.sortList();
					}
					break;
			}
		},

		updateData: function( event )
		{
			page.members.currentSelectionIndex = -1;
			page.methods.initElements();
		}
	};

	page.methods = 
	{
		init: function () 
		{
			try 
			{
				var object	= 0;
				var yesOption, noOption;

				CAP.logging.verbose('Initialising VCA classification page...');
					
				//Start loading the config if necessary:
				CAP.loadConfig();

				// Call the common functions to show the page
				// TODO: This should be phased out in future releases.
				CAP.page.show(window);

				if(!CAP.VCA.initialized()) 
				{
					top.$(window.top).bind('capVcaInitialized', page.methods.init);
					CAP.logging.info('VCA not initialized.  Page initialization is waiting for \'capVcaInitialized\' event');
					return;
				}

				// Freeze the defines so the values cannot be changed
				CAP.logging.debug('Freezing ' + page.defines.length + ' defines');
				for (object = 0; object < page.defines.length; object++) 
				{
					Object.freeze(page.defines[object]);
				}

				// Freeze the enums so the values cannot be changed
				CAP.logging.debug('Freezing ' + page.enums.length + ' enums');
				for (object = 0; object < page.enums.length; object++) 
				{
					Object.freeze(page.enums[object]);
				}

				// Attach new listeners
				top.$(window.top).bind('capServerDataRefresh', page.eventCallback.updateData);

				// Bind the element functions
				$('#btnApply').button().click(page.eventCallback.submit);
				$('#btnRestoreDefaults').button().click(page.eventCallback.restoreDefaults);
				$('#btnAdd').button().click(page.eventCallback.add);
				$('#btnRemove').button().click(page.eventCallback.remove);
				/* Bug fix for IE8
				 * See http://stackoverflow.com/questions/5122009/select-element-and-jquery-change-event-in-ie8
				 */
				//$('#classifierlist').change(page.eventCallback.selectionChanged);
				$('#classifierlist').click(page.eventCallback.selectionChanged);

				//Add callbacks for the classifier details:
				var inputItems = $('.classifierproperty');
				for (var itemNum=0; itemNum < inputItems.length; itemNum++) {
					/* Bug fix for IE8
					 * See http://stackoverflow.com/questions/5122009/select-element-and-jquery-change-event-in-ie8
					 */
					//jQuery(inputItems[itemNum]).bind('keyup change', inputItems[itemNum].id,page.eventCallback.classifierPropertyChanged);
					jQuery(inputItems[itemNum]).bind('keyup click', inputItems[itemNum].id,page.eventCallback.classifierPropertyChanged);
				}

				// Enable of disable the elements according to the current enable status:
				page.methods.toggleElements();

				// Initialize the elements
				page.methods.initElements();

				// Enable automatic validation
				CAP.validation.attachAutoValidation(window);

				CAP.logging.info('VCA classification page Initialisation...DONE!');
			}
			catch (exception) 
			{
				CAP.logging.error('VCA classification page Initialisation...FAILED: ' + exception);
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
			try 
			{
				var vcaEnabled = CAP.VCA.channel[0].enable();
				
				page.members.useMetric = (CAP.ajax.getServerData("VCA.Ch0.meaunits") == "metric")
				//Make the appropriate labels visible
				$('.metric').toggle(page.members.useMetric);
				$('.imperial').toggle(!page.members.useMetric);

				//Restrict the imperial area to integer
				if(!page.members.useMetric)
				{
					$('#minarea').attr('data-validation', 'int,0,1000');
					$('#maxarea').attr('data-validation', 'int,0,1000');
				}

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
			} 
			catch (exception) 
			{
				CAP.logging.error('VCA Advanced page element toggling...FAILED: ' + exception);
				return;
			}
		},

		initElements: function () 
		{
			//Load the information about all of the classification groups & classifiers:
			var numFound=0;
			var numEntries;
			var entryNum;
			var groupId;
			var id;
			var classifierList;

			try
			{
				page.members.classifierGroups	= [];
				for(classificationGroup=0; classificationGroup<page.defines.MAX_CLASSIFICATION_GROUPS; classificationGroup++)
				{
					var newClassifierGroup = {};
					groupId = CAP.ajax.getServerData("VCA.Ch0.Cg"+classificationGroup+".id",true);
					if(groupId !== null)
					{
						classifierList = new Array();
						for(entryNum=0; entryNum < page.defines.MAX_CLASSIFIERS; entryNum++)
						{
							var id = CAP.ajax.getServerData("VCA.Ch0.Cg"+classificationGroup+".Oc"+entryNum+".id",true);
							if(id !== null) //Was there an entry there?
							{
								var newObject = {};
								newObject.id = id;
								newObject.name = CAP.ajax.getServerData("VCA.Ch0.Cg"+classificationGroup+".Oc"+entryNum+".name");
								newObject.enable = CAP.ajax.getServerData("VCA.Ch0.Cg"+classificationGroup+".Oc"+entryNum+".enable");
								newObject.area = CAP.ajax.getServerData("VCA.Ch0.Cg"+classificationGroup+".Oc"+entryNum+".area");
								newObject.speed = CAP.ajax.getServerData("VCA.Ch0.Cg"+classificationGroup+".Oc"+entryNum+".speed");
								classifierList.push(newObject);
							}
						}

						newClassifierGroup.id = groupId;
						newClassifierGroup.name = CAP.ajax.getServerData("VCA.Ch0.Cg"+classificationGroup+".name");
						newClassifierGroup.classifiers = classifierList;
						page.members.classifierGroups.push(newClassifierGroup);
					}
				}
			}
			catch(exception) 
			{
				CAP.logging.error('VCA Classification page group loading FAILED: ' + exception);
				return;
			}
			
			page.members.originalClassifiers = page.methods.deepCopy(page.members.classifierGroups);

			page.eventCallback.selectionChanged();
			page.methods.sortList();
			page.methods.updateAddRemoveButtonState();
		},

		populateList : function (selectedElement)
		{
			var classifierList;
			var newEntry;
			var nameString;

			try
			{
				if(page.members.classifierGroups[page.members.currentGroupIndex] !== null)
				{
					classifierList = page.members.classifierGroups[page.members.currentGroupIndex].classifiers;
					$('#classifierlist').empty();
					for(classifierNum=0; classifierNum < classifierList.length; classifierNum++)
					{
						newEntry = document.createElement("option");
						//zero-pad the Id so that the columns line up
						if(classifierList[classifierNum].id < 10)
							nameString = "\u00A00" + classifierList[classifierNum].id;
						else
							nameString = "\u00A0" + classifierList[classifierNum].id;

						while(nameString.length < 8)
							nameString = nameString + "\u00A0";//Pad with spaces to ensure the alignment of the classifier names
						nameString = nameString + classifierList[classifierNum].name;
						newEntry.text = nameString;
						newEntry.val = classifierList[classifierNum].id;
						if(selectedElement !== undefined)
							if(classifierList[classifierNum].id == selectedElement)
							{
								newEntry.selected = "selected";
								page.members.currentSelectionIndex = classifierNum;
							}
						/* Bug fix for IE8
						 * See http://bugs.jquery.com/ticket/11492
						 */
						//$('#classifierlist').append(newEntry);
						var sel = $('#classifierlist');
						sel[0].options[sel[0].options.length] = newEntry;
					}
				}
			}
			catch(exception) 
			{
				CAP.logging.error('VCA Classification page group loading FAILED: ' + exception);
				return;
			}
		},

		loadDetails : function (classifierID)
		{
			var classifier, speed, area;
			var classifierList;
			if(page.members.classifierGroups[page.members.currentGroupIndex] == null)
				return;

			classifierList = page.members.classifierGroups[page.members.currentGroupIndex].classifiers;

			if(classifierList.length == 0 || classifierID >= classifierList.length || classifierID === -1)
			{
				//There isn't a classifier selected - set the the details to be empty and disable them.
				$('input.classifierproperty').val("");
				$('.detailsproperty').attr('disabled',true);
			}
			else
			{
				//Copy the details to the information section
				classifier = classifierList[classifierID];
				speed = classifier.speed.split(':');
				area = classifier.area.split(':');

				$('.detailsproperty').attr('disabled',false);
				$('#name').val(classifier.name);

				if(classifier.enable=="yes")
					$('#enableclassifier').val(1);
				else
					$('#enableclassifier').val(0);
				
				if(speed.length > 1)
				{
					$('#minspeed').val(Math.round(parseFloat(speed[0])));
					$('#maxspeed').val(Math.round(parseFloat(speed[1])));
				}

				if(area.length > 1)
				{
					if(page.members.useMetric)
					{
						$('#minarea').val(Math.round(parseFloat(area[0]))/10);
						$('#maxarea').val(Math.round(parseFloat(area[1]))/10);
					}
					else
					{
						$('#minarea').val(Math.round(parseFloat(area[0])));
						$('#maxarea').val(Math.round(parseFloat(area[1])));
					}
				}
			}
		},

		/** @brief Sorts the list of classifiers so that the smallest objects come first */
		sortList : function()
		{
			var classifierList;
			var selectionID;

			if(page.members.classifierGroups[page.members.currentGroupIndex] == null)
				return;

			classifierList = page.members.classifierGroups[page.members.currentGroupIndex].classifiers;

			if(page.members.currentSelectionIndex != -1)
				selectionID = classifierList[page.members.currentSelectionIndex].id;

			classifierList.sort(page.methods.sortFunctionArea);

			page.methods.populateList(selectionID);
		},

		/** @brief Enables or disables the add and remove buttons
		 *  
		 *  Sometimes the add and remove buttons are not relevant, for example 
		 *  it isn't possible to remove an item when the list is empty.  This 
		 *  function enables or disables the buttons accordingly.
		 */
		updateAddRemoveButtonState : function()
		{
			if(page.members.classifierGroups[page.members.currentGroupIndex] == null)
				return;

			listLength = page.members.classifierGroups[page.members.currentGroupIndex].classifiers.length;
			
			if(listLength == 0 || page.members.currentSelectionIndex == -1)
				$('#btnRemove').attr('disabled',true);//Disable the remove button
			else
				$('#btnRemove').attr('disabled',false);//Enable the remove button

			if(listLength == page.defines.MAX_CLASSIFIERS)
				$('#btnAdd').attr('disabled',true);//Disable the add button
			else
				$('#btnAdd').attr('disabled',false);//Enable the add button
		},

		/** @brief Comparison function for sorting the classifiers by Area
		 *  @returns An integer that is negative if a<b, positive if a>b, or negative if a=b
		 */
		sortFunctionArea : function(a,b)
		{
			var firstArea, secondArea;

			if(a === undefined || a === null)
			{
						
				if(b === undefined || b === null)
					return 0;
				else
					return 1
			}
			else
				if(b === undefined || b === null)
					return -1;
				else
				{
					firstArea = a.area.split(':');
					secondArea = b.area.split(':');

					if(firstArea[0] != secondArea[0])	//are min areas the same?
						return firstArea[0]-secondArea[0];	//min areas are different - use them for sorting 
					else
						return firstArea[1]-secondArea[1];  //min areas are the same - sort my max area as a second field
				}

		},
		
		/** @brief Comparison function for sorting the classifiers by Id
		 *  @returns An integer that is negative if a<b, positive if a>b, or negative if a=b
		 */
		sortFunctionId : function(a,b)
		{
			return a.id - b.id;
		},
		
		/** @brief Generates updates in JSON format to effect the changes
		 *
		 * Scans through the modified list of classifiers and classifier 
		 * groups to work out what has been added, deleted or updates so 
		 * that the corresponding CGI requests can be made.
		 *
		 * @param jsonArray[out] 	The array for storing the JSON requests
		 */
		generateJSON : function(jsonArray)
		{
			var originalGroupIndex=0, modifiedGroupIndex=0;

			//Create a JSON object with all of the updates
			if(page.members.originalClassifiers != null)
			{
				//Make local copies of the classifier groups
				originalGroups = page.methods.deepCopy($(page.members.originalClassifiers));
				modifiedGroups = page.methods.deepCopy($(page.members.classifierGroups));

				//Sort classifier groups by Id
				originalGroups.sort(page.methods.sortFunctionId);
				modifiedGroups.sort(page.methods.sortFunctionId);

				//The outer loop over classifier groups
				while(originalGroupIndex < originalGroups.length || modifiedGroupIndex < modifiedGroups.length)
				{
					if(originalGroups[originalGroupIndex].id < modifiedGroups[modifiedGroupIndex].id)
					{
						//A group has been deleted = make a JSON structure to represent the remove
						var removeObject = 
						{
							action: 'remove',
							group:	'VCA.Ch0.Cg'+originalGroups[originalGroupIndex].id,
							entries:	[]
						}
						jsonArray.push(removeObject);

						originalGroupIndex++;
					}
					else
						if(originalGroups[originalGroupIndex].id > modifiedGroups[modifiedGroupIndex].id)
						{
							//A group has been added - make a JSON structure to represent the add
							var addObject = 
							{
								action: 'add',
								group:	'VCA.Ch0',
								entries:[
										 {id:'object',value:'clsgrp'},
										 {id:'name',value:modifiedGroups[modifiedGroupIndex].name},
										 {id:'id',value:modifiedGroups[modifiedGroupIndex].id}
										]
							}
							jsonArray.push(addObject);
							
							page.methods.generateClassifierUpdateJSON(jsonArray,modifiedGroups[modifiedGroupIndex].classifiers);

							modifiedGroupIndex++;
						}
						else
						{
							//The group is still there, but might have changed	
							page.methods.generateClassifierUpdateJSON(jsonArray,'VCA.Ch0.Cg'+modifiedGroups[modifiedGroupIndex].id,modifiedGroups[modifiedGroupIndex].classifiers,originalGroups[modifiedGroupIndex].classifiers);

							originalGroupIndex++;
							modifiedGroupIndex++;
						}
				}	
			}
		},

		/** @brief scans through two classifier lists and records the changes in the JSON array
		 *
		 *  @param jsonArray[out]				The array for the changes to be put into
		 *  @param baseGroup[in]				The CGI group path for the classifier arrays
		 *  @param modifiedClassifierArray[in]  The array of classifiers as modified by the user
		 *  @param originalClassifierArray[in]	The array of classifiers before modification
		 */
		generateClassifierUpdateJSON : function(jsonArray,baseGroup,modifiedClassifierArray,originalClassifierArray)
		{
			var originalClassifierIndex = 0, modifiedClassifierIndex =0;
		
			//Sort the arrays of classifiers	
			modifiedClassifierArray.sort(page.methods.sortFunctionId);
			if(originalClassifierArray !== undefined)
				originalClassifierArray.sort(page.methods.sortFunctionId);
			else
			{
				originalClassifierArray = [];
				originalClassifierIndex = modifiedClassifierArray.length;
			}

			//The outer loop over classifiers - loop while there are remaining classifiers in either the original or modifier classifier arrays
			while(originalClassifierIndex < originalClassifierArray.length || modifiedClassifierIndex < modifiedClassifierArray.length)
			{
				// Does the next modified classifier have a larger id than the next original classifier? (i.e. next original classifier exists only in original array)
				if(originalClassifierIndex < originalClassifierArray.length && (modifiedClassifierIndex >= modifiedClassifierArray.length || originalClassifierArray[originalClassifierIndex].id < modifiedClassifierArray[modifiedClassifierIndex].id))
				{
					//A classifier has been deleted = make a JSON structure to represent the remove
					var removeObject = 
					{
						action: 'remove',
						group:	baseGroup+'.Oc'+originalClassifierArray[originalClassifierIndex].id,
						entries:	[]
					}
					jsonArray.push(removeObject);

					originalClassifierIndex++;
				}
				else
					// Does the next modified classifier have a smaller id than the next original classifier? (i.e. next modifier classifier only exists in modified array)
					if(originalClassifierIndex >= originalClassifierArray.length || originalClassifierArray[originalClassifierIndex].id > modifiedClassifierArray[modifiedClassifierIndex].id)
					{
						//A classifier has been added - make a JSON structure to represent the add
						var addObject = 
						{
							action: 'add',
							group:	baseGroup,
							entries:
								[
									{id:'object',value:'objcls'},
									{id:'name',value:modifiedClassifierArray[modifiedClassifierIndex].name} ,
									{id:'enable',value:modifiedClassifierArray[modifiedClassifierIndex].enable} ,
									{id:'id',value:String(modifiedClassifierArray[modifiedClassifierIndex].id)} ,
									{id:'area',value:modifiedClassifierArray[modifiedClassifierIndex].area} ,
									{id:'speed',value:modifiedClassifierArray[modifiedClassifierIndex].speed} 
								]
						}
						jsonArray.push(addObject);
						modifiedClassifierIndex++;
					}
					else
					{
						//The group is still there, but might have changed	
						var updateObject = 
						{
							action: 'update',
							group:	baseGroup+'.Oc'+originalClassifierArray[originalClassifierIndex].id,
							entries: []
						}
						
						if(modifiedClassifierArray[modifiedClassifierIndex].name != originalClassifierArray[originalClassifierIndex].name)
							updateObject.entries.push({id:'name',value:modifiedClassifierArray[modifiedClassifierIndex].name});
						if(modifiedClassifierArray[modifiedClassifierIndex].enable != originalClassifierArray[originalClassifierIndex].enable)
							updateObject.entries.push({id:'enable',value:modifiedClassifierArray[modifiedClassifierIndex].enable});
						if(modifiedClassifierArray[modifiedClassifierIndex].area != originalClassifierArray[originalClassifierIndex].area)
							updateObject.entries.push({id:'area',value:modifiedClassifierArray[modifiedClassifierIndex].area});
						if(modifiedClassifierArray[modifiedClassifierIndex].speed != originalClassifierArray[originalClassifierIndex].speed)
							updateObject.entries.push({id:'speed',value:modifiedClassifierArray[modifiedClassifierIndex].speed});

						if(updateObject.entries.length != 0)
							jsonArray.push(updateObject);

						originalClassifierIndex++;
						modifiedClassifierIndex++;
					}
			}
		},

		deepCopy : function(element)
		{
			var copy;
			if(element instanceof Array) {
				copy = [];
			} else {
				copy = {};
			}
			for(property in element)
			{
				if(element[property] != null && typeof element[property] == "object") {
					copy[property] = page.methods.deepCopy(element[property]);
				} else {
					copy[property] = element[property];
				}
			}
			return copy;
		},
	};

	// Initialise the page when the DOM loads
	$(document).ready(page.methods.init);
	// Finalise the page when the DOM unloads
	$(window).unload(page.methods.uninit);
}(CAP, CAP.VCA, window));

