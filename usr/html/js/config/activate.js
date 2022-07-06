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
	CAP
 */
(function (window, undefined) {
	
	'use strict';
	// Local copies of the window objects for speed
	var document	= window.document;
	var navigator	= window.navigator;
	var location	= window.location;
	var $			= window.$;
	var CAP			= window.CAP;

	// Check the CAP namespace has been included
	if ((CAP === undefined) || (CAP.VCA === undefined) || ($ === undefined)) {
		console.error('CAP.VCA: Error: You must include the base CAP library, VCA and jQuery');
		return;
	}

	var refreshCount = 4;
	var timeoutHandle = null;

	var page = {};

	page.defines = {};

	page.enums = {};

	page.members = 
		{
			alreadyComplained: false
		};

	page.eventCallback =
		{
			removeLicense: function (licenseNo) {
				try {
					CAP.logging.verbose('Removing license ' + licenseNo);

					// Create a warning message
					//"Warning: Removing a license may change your VCA configuration due to licensed features being removed.\n\nIs this OK?"
					if(!confirm(GetMsgLang("04080119") + "\n\n" + GetMsgLang("04080120"))) {
						return;
					}

					if(refreshCount < 5)
						refreshCount = 5;

					if(timeoutHandle != null)
						clearTimeout(timeoutHandle);
					CAP.ajax.setServerData(
						[
							{
								action:		'remove',
								group:		'VCA.Lc' + licenseNo,
								entries:	[]
							}
						]
					);
					page.methods.processing();
				} catch (exception) {
					CAP.logging.error('Failed to remove license ' + licenseNo + ': ' + exception);
					throw exception;
				}
			},

			selectHardwareCode: function (event) {
				try {
					CAP.logging.verbose('Copying');
					$('#formHardwareCode').focus();
					$('#formHardwareCode').select();
				} catch (exception) {
					CAP.logging.error('Failed to apply settings: ' + exception);
					throw exception;
				}
			},

			startTrial: function (event) {
				//var message = "Once the trial is started, it cannot be paused. It will run for 45 days and then shut off\n\n";
				//message += "Are you sure you want to start the trial now?";
				var message = GetMsgLang("04080121") + "\n\n" + GetMsgLang("04080122");
				var proceed = confirm(message)
				if( proceed == true )
				{
					$('#formActivationCode').attr("value","START_TRIAL");
					page.eventCallback.submit();
				}
			},


			submit: function (event) {
				try {
					CAP.logging.verbose('Applying');

					var activationString	= document.getElementById('formActivationCode').value;

					if ((270 == activationString.length && activationString.match(/[A-F0-9]{270}/g)) || 
						activationString == "START_TRIAL" ) {
						CAP.logging.debug('Processing activation code');
						CAP.ajax.setServerData(
							[
								{
									action:		'add',
									group:		'VCA',
									entries:	[
										{
											id:		'object',
											value:	'license'
										},
										{
											id:		'license',
											value:	activationString
										}]
								}
							]
						);

						$('#formActivationCode').attr("value", "");
						page.methods.processing();
					} else if (activationString.match(/[0-9]{4}-[0-9]{4}-[0-9]{4}/g)) {
						CAP.logging.debug('Processing token');
						//alert('Unable to process tokens at this time.  We are hoping to add this to a future version of the firmware');
						alert(GetMsgLang("04080113"));
					} else {
						// Invalid activation code
						alert(GetMsgLang("04080114") + '\n\'' + activationString + '\'');
					}
				} catch (exception) {
					CAP.logging.error('Failed to apply settings: ' + exception);
					throw exception;
				}
			}
		};

	page.methods = {
		init: function () {
			try {
				var object	= 0;

				CAP.logging.verbose('Initialising Activation page...');

				// Call the common functions to show the page
				// TODO: This should be phased out in future releases.
				CAP.page.show(window);

				//Start loading the config if necessary:
				CAP.reLoadConfig();

				if (!CAP.VCA.initialized()) {
					window.top.$(window.top).bind('capVcaInitialized', page.methods.init);
					CAP.logging.info('VCA not initialized.  Page initialization is waiting for \'capVcaInitialized\' event');
					return;
				}
				// Show the stuff
				$('.default').toggle(true);
				$('.vcaInitialising').toggle(false);

				// Bind the element functions
				$('#formHardwareCode').click(page.eventCallback.selectHardwareCode);
				$('#btnApply').button().click(page.eventCallback.submit);
				$('#btnStartTrial').button().click(page.eventCallback.startTrial);

				// Initialise the elements
				page.methods.initElements();
				$('#formActivationCode').text("");

				// Call the common functions to show the page
				// TODO: This should be phased out in future releases.
				CAP.page.show(window);

				// Bind callbacks to events:
				top.$(window.top).bind('capServerDataRefresh', page.methods.initElements);
				top.$(window.top).bind('capServerDataFailure', page.methods.initElements);

				CAP.logging.info('Activate page Initialisation...DONE!');
			} catch (exception) {
				CAP.logging.error('Activate page Initialisation...FAILED: ' + exception);
				return;
			}
		},

		uninit: function () {
			//Remove event handlers:
			window.top.$(window.top).unbind('capVcaInitialized', page.methods.init);
			window.top.$(window.top).unbind('capServerDataRefresh', page.methods.initElements);
		},

		invalidElements: function () {
			try {
			for (lic = 0; lic < CAP.VCA.license.length; lic++)
				if (CAP.VCA.license[lic].valid())
					if(CAP.VCA.license[lic].info().length == 0)
						return true;
			} catch (exception) {
				return true; //Exceptions can be generated if the license has only been partially written to the database
			}

			return false;
		},

		initElements: function () {
			var lic	= 0;
			var licensestatus;;
			timeoutHandle = null;

			//Check for invalid elements - an empty info string indicates that the licensing is still in progress
			CAP.logging.debug("About to check for invalid elements");
			//BB - no time to fix properly
/*			if(page.methods.invalidElements())
			{
				CAP.logging.debug("Invalid elements - reloading");
				timeoutHandle = setTimeout(CAP.ajax.reloadServerData,1000); //looks like the licenses are currently being written - do a refresh in 1 second
				return;
			}*/


			licensestatus = CAP.ajax.getServerData("VCA.licensestatus");

			if(licensestatus == "ready")
			{
				// Initialise the elements
				$('#formHardwareCode').attr("value", CAP.VCA.hwGuid());

				var trialLicense = page.methods.getTrialLicense();
				var trialInProgress = page.methods.trialInProgress();

				$('.vcaAllowTrial').toggle(trialLicense != null && !trialInProgress &&
								!CAP.VCA.license[trialLicense].expired());
				$('.vcaTrialInProgress').toggle(trialInProgress);

				// Show the installed licenses
				$('#formInstalledLicenses').empty();
				for (lic = 0; lic < CAP.VCA.license.length; lic++) {
					try
					{
						// NOTE: Don't add suspended licenses to the list
						if (CAP.VCA.license[lic].valid()) {
							if (CAP.VCA.license[lic].info().length != 0 &&
							    !CAP.VCA.license[lic].info().match(/\(SUSPENDED\)/g))
									page.methods.addLicense(CAP.VCA.license[lic].info(), lic);

							if (CAP.VCA.license[lic].productCode() == "538F") {
								// If we have a trial license, chec if expired and if not update the days left
								if (CAP.VCA.license[lic].expired() && !page.members.alreadyComplained) {
									$('#vcaDaysLeft').text("0");
									//var message = "The VCA trial period has expired. To remove the watermark, either:\n\n";
									//message += "+ Contact your supplier to purchase a full license, or\n\n"
									//message += "+ Delete the trial license from the 'Installed Licenses' list";
									var message = GetMsgLang("04080115") + "\n\n" + GetMsgLang("04080116") + "\n\n" +
											GetMsgLang("04080117");
									alert(message);

									// Don't complain again
									page.members.alreadyComplained = true;
								} else {
									if(page.methods.trialInProgress()) {
										var regex = /[^(]+\(([0-9]+).*/g;
										var remaining = regex.exec(CAP.VCA.license[lic].info());
										if(remaining) {
											$('#vcaDaysLeft').text(remaining[1]);

											// Check to see if the VCA has been enabled yet. If not prompt the user
											// to go and enable it
											if(!CAP.VCA.channel[0].enable()) {
												//"A VCA trial is in progress but VCA is not yet enabled. Enable it now?";
												var answer = confirm(GetMsgLang("04080118"));
												if(answer) {
													// Go to enable page
													parent.$("#leftmenu .vcaContents + div a[href='vcaenabledisable.html']").click();
													parent.$("#vcaMenuHeader").click();
												}
											}
										}
									}
								}
							}
						}
					}
					catch (exception)
					{
						CAP.logging.debug("bad license - ignoring");
					}
				}
				if (!$('#formInstalledLicenses').children('li').length) {
					page.methods.addLicense("No Licenses", null);
				}
			}
			else
				timeoutHandle = setTimeout(CAP.ajax.reloadServerData,5000);
		},

		addLicense: function (string, licenseNo) {
			var li = document.createElement('li');
			var s = document.createElement('span');
			$(s).text(string);
			li.appendChild(s);
			if (licenseNo !== null && licenseNo !== undefined) {
				var x = document.createElement('button');
				$(x).text('×');
				$(x).addClass('delete-license');
				$(x).attr('title', 'Delete License');
				$(x).button().click(function () { page.eventCallback.removeLicense(licenseNo); });
				li.appendChild(x);
			}
			$(li).addClass('item');
			document.getElementById('formInstalledLicenses').appendChild(li);
			CAP.page.show(window);
			return li;
		},

		processing: function () {
			var img = document.createElement('img');
			$(img).attr('src', '../images/loading.gif');
			$(img).attr('alt', 'Loading');
			$('#formInstalledLicenses').empty();
			page.methods.addLicense("Processing, Please Wait...", null).firstChild.appendChild(img);
			CAP.page.show(window);
		},


		getTrialLicense: function() {
			try {
				var i = 0;
				for( i = 0; i < CAP.VCA.numberOfLicenses(); i++ ) {
					if( CAP.VCA.license[i].productCode() == "538F" ) {
						// This is a trial license
						return i;
					}
				}
			} catch (exception) {
				CAP.logging.error('VCA Enable/Disable page checkForTrial... FAILED: ' + exception );
			}
			return null;
		},

		trialInProgress: function() {
			try {
				var i = 0;
				// Iterate through all licenses assigned to the channel and see if any are trial licenses
				for( i = 0; i < CAP.VCA.channel[0].licenses().length; i++ ) {
					var licenseId = CAP.VCA.channel[0].licenses()[i];
					if( CAP.VCA.license[licenseId].productCode() == "538F" ) {
						// We do have a trial license assigned to this channel
						return true;
					}
				}
			} catch (exception) {
				CAP.logging.error('VCA Enable/Disable page trialInProgress... FAILED: ' + exception );
			}

			return false;

		}
	};

	// Initialise the page when the DOM loads

	// Language stuff loading
	call_xmlData("/environment.xml", true, runEnvironment);

	function runEnvironment(xml) {
		var classNum = [
			"04080113", "04080114", "04080115",
			"04080116", "04080117", "04080118",
			"04080119", "04080120", "04080121",
			"04080122", "04080123"
		]
		InitMsgLang(classNum);

		var lang = jqGetXmlData('lang', xml, false);
		getLangXml(lang, setup + maincontents + "activate", page.methods.init);
	}

	// Finalise the page when the DOM unloads
	$(window).unload(page.methods.uninit);
}(window));
