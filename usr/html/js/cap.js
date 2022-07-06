/*	This file uses JsDoc Toolkit documentation.
 *	http://code.google.com/p/jsdoc-toolkit/
 */

/**	@fileOverview This file contains the CAP Javascript Library.
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
	$,
*/

(function (window, undefined) {
	'use strict';
	// Local copies of jQuery and console
	var $ = window.$;
	var console = window.console;

	// Check the needed dependencies
	if ((window === undefined)  ||
			($ === undefined)) {
		if (console && console.error) {
			console.error('CAP: Error: You must include jQuery for the cap.js library to work.');
		}
		window.CAP	= undefined;
		return;
	}

	// If CAP has already been added don't add it again!
	if (window.CAP) {
		return;
	}

	// If the top level window has CAP in it use that
	if (window.top.CAP) {
		window.CAP = window.top.CAP;
		return;
	}

	// Local copies of the window objects for speed
	var document	= window.document;
	var navigator	= window.navigator;
	var location	= window.location;

	/**	A local private copy of our CAP namespace.
	 *	@private
	 *	@since Version 0.1.0
	 */
	var CAP = {};

	/**	Exceptions that can be used throughout the library.
	 *	<br/><br/>
	 *	They are <code>Object.freeze</code>'ed in the
	 *	<code>CAP.methods.init()</code> function to prevent
	 *	values being changed.
	 *	<br/><br/>
	 *	@namespace	Private Exceptions
	 *	@private
	 *	@since Version 0.1.2
	 */
	CAP.exceptions =
		{
			FAIL:					'(CAP Exception) Generic failure',
			INVALID_PARAMS:			'(CAP Exception) Invalid parameters for function',
			NO_SERVER_DATA:			'(CAP Exception) No server data has been retrieved',
			INVALID_SETTING:		'(CAP Exception) The setting could not be found at the specified path'
		};

	/**	Definitions that can be used throughout the library.
	 *	<br/><br/>
	 *	They are <code>Object.freeze</code>'ed in the
	 *	<code>CAP.methods.init()</code> function to prevent
	 *	values being changed.
	 *	<br/><br/>
	 *	These are like <code>#define</code> in C programming.
	 *	@namespace	Private Definitions
	 *	@private
	 *	@since Version 0.1.0
	 */
	CAP.defines = {};

	/**	Enumerators that can be used throughout the library.
	 *	<br/><br/>
	 *	They are <code>Object.freeze</code>'ed in the
	 *	<code>CAP.methods.init()</code> function to prevent
	 *	values being changed.
	 *	<br/><br/>
	 *	These are like <code>enums</code> in C programming.
	 *	@namespace	Private enumerators
	 *	@private
	 *	@since Version 0.1.0
	 */
	CAP.enums =
		{
			/**	This is the logging level of the CAP library.
			 *	@namespace Logging Level
			 *	@private
			 *	@since Version 0.1.0
			 */
			logLevel :
				{
					/**	No logging
					 *	@private
					 *	@since Version 0.1.1
					 */
					NONE:		0,

					/**	An error
					 *	@private
					 *	@since Version 0.1.1
					 */
					ERROR:		1,

					/**	A warning
					 *	@private
					 *	@since Version 0.1.1
					 */
					WARN:		2,

					/**	An informative message
					 *	@private
					 *	@since Version 0.1.1
					 */
					INFO:		3,

					/**	A debugging message
					 *	@private
					 *	@since Version 0.1.1
					 */
					DEBUG:		4,

					/**	A verbose message
					 *	@private
					 *	@since Version 0.1.1
					 */
					VERBOSE:	5,

					/**	The number of logging levels
					 *	@private
					 *	@since Version 0.1.1
					 */
					NUM:		6,
					// These provide an easy way to convert to a string value.
					0:	'None',
					1:	'Error',
					2:	'Warning',
					3:	'Information',
					4:	'Debug',
					5:	'Verbose'
				}
		};

	/**	Private elements that can be added to the page dynamically
	 *	@namespace	Private elements
	 *	@private
	 *	@since Version 0.1.14
	 */
	CAP.elements =
		{
			/**	The single instance of our AJAX message that is added to the
			 *	top of the page.
			 *	@private
			 *	@since Version 0.1.14
			 */
			ajaxMessage:	undefined,

			/** An iframe to block out ActiveX objects and allow messages to be displayed in front of them
			 */
			messageFrame:	undefined,

			/** The number of ajax requests for which we are awaiting responses
			 */
			ajaxPendingCount: 0
		};

	/**	Private members
	 *	@namespace	Private members
	 *	@private
	 *	@since Version 0.1.0
	 */
	CAP.members =
		{
			/**	The current logging level of the CAP library
			 *	@private
			 *	@since Version 0.1.0
			 */
			logLevel: CAP.enums.logLevel.WARN,

			/**	The key bindings that have been added via the
			 *	CAP.methods.addKeyBinding().
			 *	@private
			 *	@since Version 0.1.0
			 */
			keyBindings: {},

			/**	The data from the server.  This can be refreshed with CAP.methods.reloadServerData();
			 *	@private
			 *	@since Version 0.1.4
			 */
			serverData:	undefined,

			/**	The timestamp of the last server data refresh
			 *	@private
			 *	@since Version 0.1.4
			 */
			serverDataTimestamp:	undefined,

			/**	Indicates whether of not the config has been requested 
			 *	@private
			 */
			loadStarted: 0,

			/**	The queue of AJAX requests.  This is only here because the DB
			 *	and CGI are slow and buggy.  See ajaxRequest.
			 *	@private
			 */
			ajaxFifo: [],

			/**	Indicates whether of not the multi-language strings have been set
			 *	@private
			 */
			isLanguageSet: false
		};


	/**	Private event handlers
	 *	@namespace	Private event handlers
	 *	@private
	 *	@since Version 0.1.0
	 */
	CAP.eventCallback =
		{
			/**	When binded to the keydown event
			 *	this functions processes CAP keyboard
			 *	shortcuts
			 *	@event
			 *	@param	{UIEvent}	event	The event from the user agent.
			 *	@throws		{CAP.exceptions}	A CAP exception
			 *	@private
			 *	@since Version 0.1.0
			 */
			keyPress: function (event) {
				try {
					var keyCombo	= '';
					var key			= event.keycode || event.which;
					/* TODO
					 * We only support key bindings on A-Z at the moment
					 * this can be made more robust and better
					 * https://developer.mozilla.org/en/DOM/Event/UIEvent/KeyEvent
					 */
					if (65  <= key && key <= 90) {
						keyCombo += event.ctrlKey  ? 'CTRL+'  : '';
						keyCombo += event.altKey   ? 'ALT+'   : '';
						keyCombo += event.shiftKey ? 'SHIFT+' : '';
						keyCombo += String.fromCharCode(key);
						if (CAP.members.keyBindings[keyCombo]) {
							CAP.members.keyBindings[keyCombo].callback();
						}
					}
				} catch (exception) {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed to process CAP keyPress: ' + exception);
					throw exception;
				}
			},

			/**	The callback function when the brand.xml file is asynchronously requested.
			 *	@param event	{data}			The response data
			 *	@param event	{textStatus}		The status
			 *	@param event	{jqXHR}			The jQuery XML HTTP request object
			 *	@throws		{CAP.exception}	A CAP exception
			 *	@event
			 *	@private
			 */
			loadBrandDataSuccess: function (data, textStatus, jqXHR) {
				try {
					CAP.methods.log(CAP.enums.logLevel.VERBOSE, 'Received brand data');

					// Go parse all the useful stuff coming back from the brand data

					// I am sure there is a smarter way to do this, but I am just a novice...
					CAP.members.brandInfo = {
						model: {
							serial: 	$('model > serial', data).text().toLowerCase(),
							productid:	$('model > productid', data).text().toLowerCase()
						},
						device: {
							id:		$('device > id', data).text().toLowerCase()
						},
						information: {
							camera: {
								cameraclass:	$('information > camera > class', data).text().toLowerCase()
							},
							ptz: {
								pantilt:	$('information > ptz > pantilt', data).text().toLowerCase()
							},
							videoin: {
								lens:		$('information > videoin > lens', data).text().toLowerCase(),
								imgdevice:	$('information > videoin > imgdevice', data).text().toLowerCase(),
								standard:	$('information > videoin > standard', data).text().toLowerCase(),
								aspectratio: {
									w16h9:		$('information > videoin > aspectratio > W16H9', data).text().toLowerCase(),
									v4h3:		$('information > videoin > aspectratio > W4H3', data).text().toLowerCase()
								}
							},
							mfz: {
								mfztype:	$('information > mfz > mfztype', data).text().toLowerCase(),
								mfzctrl:	$('information > mfz > mfzctrl', data).text().toLowerCase()
							},
							videoout: {
								tvout:		$('information > videoout > tvout', data).text().toLowerCase()
							}
						}

						// There are lots of other goodies in here - add them if you need them
					};
					
				} catch (exception) {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed request to load brand.xml: ' + exception);
					throw exception;
				}
			},

			/**	The callback function when the brand.xml file is asynchronously requested.
			 *	@param event	{data}			The response data
			 *	@param event	{textStatus}		The status
			 *	@param event	{jqXHR}			The jQuery XML HTTP request object
			 *	@throws		{CAP.exception}	A CAP exception
			 *	@event
			 *	@private
			 */
			loadBrandDataFailure: function (data, textStatus, jqXHR) {
				try {
					CAP.methods.log(CAP.enums.logLevel.VERBOSE, 'LoadBrandData Failed' );
				} catch (exception) {
					throw exception;
				}
			},

			/**	The callback function when the server data is asynchronously requested.
			 *	@param event	{data}			The response data
			 *	@param event	{textStatus}	The status
			 *	@param event	{jqXHR}			The jQuery XML HTTP request object
			 *	@throws		{CAP.exception}	A CAP exception
			 *	@event
			 *	@private
			 *	@since Version 0.1.4
			 */
			reloadServerDataSuccess: function (data, textStatus, jqXHR) {
				try {
					CAP.methods.log(CAP.enums.logLevel.VERBOSE, 'Storing server data');
					var sendEvent						= !CAP.members.serverData;
					CAP.members.serverData				= data;
					// TODO: This needs to be a data timestamp from the SERVER
					CAP.members.serverDataTimestamp		= (new Date()).getTime();
					if (sendEvent) {
						$(window.top).trigger('capServerDataLoaded');
					} else {
						$(window.top).trigger('capServerDataRefresh');
					}
				} catch (exception) {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed request to parse returned server data: ' + exception);
					throw exception;
				}
			},
			
			/**	The callback function when server group data is asynchronously requested.
			 *	@param event	{data}			The response data
			 *	@param event	{textStatus}	The status
			 *	@param event	{jqXHR}			The jQuery XML HTTP request object
			 *	@throws		{CAP.exception}	A CAP exception
			 *	@event
			 *	@private
			 *	@since Version 0.1.4
			 */
			reloadServerGroupDataSuccess: function (data, textStatus, jqXHR) {
				try {
					CAP.methods.log(CAP.enums.logLevel.VERBOSE, 'Storing server group data');
					var childNode = data;
					for (childNode = childNode.firstChild; childNode !== null; childNode = childNode.nextSibling) {
						if(childNode.nodeName === "Params") {
							CAP.methods.updateNodes(childNode, "Params");
							break;
						}
					}
//					CAP.members.serverData				= data;
					// TODO: This needs to be a data timestamp from the SERVER
					CAP.members.serverDataTimestamp		= (new Date()).getTime();
					$(window.top).trigger('capServerDataRefresh');
				} catch (exception) {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed request to parse returned server data: ' + exception);
					throw exception;
				}
			},

			/**	The callback function when the server data is asynchronously requested and the request fails.
			 *	@param event	{data}			The response data
			 *	@param event	{textStatus}	The status
			 *	@param event	{jqXHR}			The jQuery XML HTTP request object
			 *	@throws		{CAP.exception}	A CAP exception
			 *	@event
			 *	@private
			 *	@since Version 0.1.4
			 */
			reloadServerDataFailure: function (data, textStatus, jqXHR) {
				try {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'ReloadServerData Failed');
					$(window.top).trigger('capServerDataRefreshFailed');
				} catch (exception) {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed to notify of server data refresh failure: ' + exception);
					throw exception;
				}
			},

			/**	The callback function when the server data is asynchronously set.
			 *	@param event	{data}			The response data
			 *	@param event	{textStatus}	The status
			 *	@param event	{jqXHR}			The jQuery XML HTTP request object
			 *	@throws		{CAP.exception}	A CAP exception
			 *	@event
			 *	@private
			 *	@since Version 0.1.4
			 */
			beforeSetServerData: function (jqXHR, settings) {
				try {
					CAP.methods.log(CAP.enums.logLevel.VERBOSE, 'Performing pre set server data operations');
				} catch (exception) {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed to handle server data set success callback: ' + exception);
					throw exception;
				}
			},

			/**	The callback function when the server data is asynchronously set.
			 *	@param event	{data}			The response data
			 *	@param event	{textStatus}	The status
			 *	@param event	{jqXHR}			The jQuery XML HTTP request object
			 *	@throws		{CAP.exception}	A CAP exception
			 *	@event
			 *	@private
			 *	@since Version 0.1.4
			 */
			setServerDataSuccess: function (data, textStatus, jqXHR) {
				try {
					CAP.methods.log(CAP.enums.logLevel.INFO, 'Set server data');
					CAP.elements.ajaxPendingCount--;
					if (CAP.elements.ajaxPendingCount === 0) {
						$(window.top).trigger('capSetServerDataComplete');
					}
				} catch (exception) {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed to handle server data set success callback: ' + exception);
					throw exception;
				}
			},

			/**	The callback function when the server data fails to be set.
			 *	@param event	{data}			The response data
			 *	@param event	{textStatus}	The status
			 *	@param event	{jqXHR}			The jQuery XML HTTP request object
			 *	@throws		{CAP.exception}	A CAP exception
			 *	@event
			 *	@private
			 *	@since Version 0.1.14
			 */
			setServerDataFailure: function (data, textStatus, jqXHR) {
				try {
					CAP.methods.log(CAP.enums.logLevel.WARN, 'Failed to set server data: ' + textStatus);
					if (textStatus === 'timeout') {
						CAP.methods.ajaxMessage(GetMsgLang("04050003"), true);//'Setting the configuration timed out.  Is there still a connection to the hardware?'
					} else {
						// TODO: If we return content with our error codes from
						CAP.methods.ajaxMessage(GetMsgLang("04050004") + data, true);//'Failed to set configuration: '
					}
					CAP.elements.ajaxPendingCount--;
					if (CAP.elements.ajaxPendingCount === 0) {
						$(window.top).trigger('capSetServerDataComplete');
					}
				} catch (exception) {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed to handle server data set failure callback: ' + exception);
					throw exception;
				}
			},

			/**	Used to serialize the ajaxRequest.  Need this because the DB and CGI are slow.
			 *	@private
			 */
			ajaxComplete: function (data, textStatus, jqXHR) {
				try {
					// Pop of the dude that was processing
					CAP.members.ajaxFifo.pop();
					if (CAP.members.ajaxFifo.length === 0)
						CAP.methods.ajaxMessage();
					// Check for anymore!
					if (CAP.members.ajaxFifo.length > 0) {
						CAP.methods.log(CAP.enums.logLevel.INFO, 'Starting next AJAX request: ' + CAP.members.ajaxFifo[CAP.members.ajaxFifo.length - 1].url + '. ' + (CAP.members.ajaxFifo.length - 1) + ' to go');
						$.ajax(CAP.members.ajaxFifo[CAP.members.ajaxFifo.length - 1]);
					}
				} catch (exception) {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'The AJAX serialization messed up: ' + exception);
					throw exception;
				}
			}
		};

	/**	Private Methods
	 *	@namespace	Private Methods
	 *	@private
	 *	@since Version 0.1.0
	 */
	CAP.methods =
		{
			/**	This initialises our namespace, doing various
			 *	things so that the CAP library can be used effectively
			 *	in the user agent.
			 *	@throws		{CAP.exceptions}	A CAP exception
			 *	@private
			 *	@since Version 0.1.0
			 */
			init: function () {
				try {
					var object	= 0;

					CAP.methods.log(CAP.enums.logLevel.VERBOSE, 'Initialising CAP Library...');

					if ('function' === typeof (Object.freeze)) {
						// Freeze the defines so the values cannot be changed
						for (object = 0; object < CAP.defines.length; object++) {
							Object.freeze(CAP.defines[object]);
						}

						// Freeze the enums so the values cannot be changed
						for (object = 0; object < CAP.enums.length; object++) {
							Object.freeze(CAP.enums[object]);
						}
					}

					// Initialize multi-language strings
					if(!CAP.members.isLanguageSet) {
						top.$(window.top).one('languageSet', CAP.methods.init);
						CAP.methods.setLanguage();
//						CAP.logging.info('Language not set.  CAP initialization is waiting for \'languageSet\' event');
						return;
					}

					// Add our event listeners
					$(document).keydown(CAP.eventCallback.keyPress);

					// Add our keyEvents
					CAP.methods.addKeyBinding('CTRL+ALT+Q', CAP.methods.increaseLogLevel);
					CAP.methods.addKeyBinding('CTRL+ALT+W', CAP.methods.decreaseLogLevel);
					CAP.methods.addKeyBinding('CTRL+ALT+A', CAP.methods.resetLogLevel);
					CAP.methods.addKeyBinding('CTRL+ALT+S', CAP.methods.clearLogLevel);

					// Create the ajax message
					var textNode	= document.createTextNode('This is an AJAX message.  You can set this message with CAP.ajax.userMessage.');
					var imageNode	= document.createElement('img');
					imageNode.src	= '/images/loading.gif';
					imageNode.id	= 'savingImage';
					$(imageNode).css({
						'display'		:	'block',
						'margin-left'	:	'auto',
						'margin-right'	:	'auto',
						'margin-bottom'	:	'20px'
					});
					CAP.elements.ajaxMessage = document.createElement('div');
					CAP.elements.ajaxMessage.appendChild(imageNode);
					CAP.elements.ajaxMessage.appendChild(textNode);
					$(CAP.elements.ajaxMessage).attr('id', 'ajaxMessage');
					$(CAP.elements.ajaxMessage).css(
						{
							'position'			: 'absolute',
							'top'				: '45%',
							'left'				: '50%',
							'width'				: '20%',
							'min-width'			: '200px',
							'text-align'		: 'center',
//							'border-radius'		: '5px',
							'border'			: '1px solid black',
//							'box-shadow'		: '0px 0px 3px rgba(0,0,0,0.8)',
							'margin'			: '5px',
							'background-color'	: '#FFFFFF',
							'padding'			: '5px',
							'z-index'			: '5000'
						}
					);
					$(CAP.elements.ajaxMessage).hide();
					CAP.elements.messageFrame		= document.createElement('iframe'); //This iframe is required to make the message show up in front of the activex control
					CAP.elements.messageFrame.src	= "";
//					CAP.elements.messageFrame.style.filter='progid:DxImageTransform.Microsoft.Alpha(style=0,opacity=0)';
					$(CAP.elements.messageFrame).css(
						{
							'left'		:	'50%',
							'top'		:	'45%',
							'width'		:	'20%',
							'min-width'	:	'200px',
							'height'	:	'100px',
							'z-index'	:	'10',
							'position'	:	'absolute',
							'border'	:	'0',
							'filter'	:	'progid:DxImageTransform.Microsoft.Alpha(style=0,opacity=0)'
						}
					);
					$(CAP.elements.messageFrame).hide();

					if($("#right").length) {
						$("#right").append(CAP.elements.messageFrame);
						$("#right").append(CAP.elements.ajaxMessage);
					}
					else {
						$("#config-page").append(CAP.elements.messageFrame);
						$("#config-page").append(CAP.elements.ajaxMessage);
					}
				} catch (exception) {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'CAP Library Initialisation...FAILED: ' + exception);
					return;
				}


				CAP.methods.log(CAP.enums.logLevel.INFO, 'CAP Library Initialisation...DONE!');
			},

			/**	Get multi-language strings.
			 *	@private
			 */
			setLanguage: function () {
				var environmentReq = new CGIRequest();
				var environmentReqQString = "";
				var revLang = "/language/English.xml";
				environmentReq.SetAddress("/environment.xml");
				environmentReq.SetCallBackFunc( function(xml){
					var httpPortNum = ( "" == window.location.port ) ? 80 : window.location.port;
					var urlLang = "http://" + document.domain + ":" + httpPortNum + "/language/English.xml";

					if($('lang', xml).size() > 0)
						revLang = $('lang', xml).text();

					if(!CAP.members.isLanguageSet) {
						var classNum = [];
						//CAP strings
						for(var i = 1; i < 5; i++) classNum.push("0405000"+i.toString());
						//Zones and Rules strings
						for(var i = 1; i < 10; i++) classNum.push("0405020"+i.toString());
						for(var i = 10; i < 100; i++) classNum.push("040502"+i.toString());
						//Complex Rules strings
						for(var i = 1; i < 10; i++) classNum.push("0405130"+i.toString());
						for(var i = 10; i < 100; i++) classNum.push("040513"+i.toString());
						//PTZ Control strings
						for(var i = 1; i < 10; i++) classNum.push("0405100"+i.toString());
						for(var i = 10; i < 100; i++) classNum.push("040510"+i.toString());
						//Calibration strings
						for(var i = 1; i < 10; i++) classNum.push("0405030"+i.toString());
						for(var i = 10; i < 100; i++) classNum.push("040503"+i.toString());
						//Classification strings
						for(var i = 1; i < 10; i++) classNum.push("0405040"+i.toString());
						for(var i = 10; i < 100; i++) classNum.push("040504"+i.toString());
						//Tamper strings
						for(var i = 1; i < 10; i++) classNum.push("0405060"+i.toString());
						for(var i = 10; i < 100; i++) classNum.push("040506"+i.toString());
						//Scene change strings
						for(var i = 1; i < 10; i++) classNum.push("0405070"+i.toString());
						for(var i = 10; i < 100; i++) classNum.push("040507"+i.toString());
						//Burnt-in annotation strings
						for(var i = 1; i < 10; i++) classNum.push("0405110"+i.toString());
						for(var i = 10; i < 100; i++) classNum.push("040511"+i.toString());
						//Advanced strings
						for(var i = 1; i < 10; i++) classNum.push("0405050"+i.toString());
						for(var i = 10; i < 100; i++) classNum.push("040505"+i.toString());
						InitMsgLang(classNum);
					}

					getLangXml(revLang, "setup maincontents", function() {
						CAP.members.isLanguageSet = true;
						top.$(window.top).trigger('languageSet');
					});
				});
				environmentReq.Request(environmentReqQString);
			},

			/**	Get all server data as a xml formatted string.
			 *	@throws		{CAP.exception}	A CAP exception
			 *	@example	var xml = getServerDataXml();
			 *	@private
			 *	@since Version 0.1.4
			 */
			getServerDataXml: function () {
				try {
					if (!CAP.members.serverData) {
						throw CAP.exceptions.NO_SERVER_DATA;
					}
					if(undefined !== CAP.members.serverData.xml && 'string' === typeof(CAP.members.serverData.xml))
					{
						//IE8 and IE9 case
						return CAP.members.serverData.xml;
					}
					else if('object' === typeof(CAP.members.serverData))
					{
						//IE10 (and others) case
						var oSerializer = new XMLSerializer();
						var xmlString = oSerializer.serializeToString(CAP.members.serverData);
						return xmlString;
					}
					throw CAP.exceptions.NO_SERVER_DATA;
				} catch (exception) {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed to get server data xml string: ' + exception);
					throw exception;
				}
			},

			/**	Get server data.
			 *	@param group	{string}	The group to get the value of
			 *	@param failQuietly	{boolean}	If failQuietly is true then null will be returned if a setting is not found, otherwise an exception will be thrown
			 *	@throws		{CAP.exception}	A CAP exception
			 *	@example	var answer = getServerData('VIDEOIN.nbrofchannel');
			 *	@private
			 *	@since Version 0.1.4
			 */
			getServerData: function (group, failQuietly) {
				try {
					if (!CAP.members.serverData) {
						throw CAP.exceptions.NO_SERVER_DATA;
					}
					var tag				= 0;
					var currentNode		= CAP.members.serverData;
					var groupArray		= group.split('.');
					var nextNode		= null;
					var childNode		= null;
					var failWithNull	= failQuietly || false;

					groupArray.splice(0, 0, 'Params');

					for (tag = 0; tag < groupArray.length; tag++) {
						for (childNode = currentNode.firstChild; childNode !== null; childNode = childNode.nextSibling) {
							if (childNode.nodeName === groupArray[tag]) {
								currentNode = childNode;
								break;
							}
						}
						if (currentNode.nodeName !== groupArray[tag]) {
							if (failWithNull === true) {
								return null;
							} else {
								throw CAP.exception.INVALID_SETTING;
							}
						}

					}
					if (currentNode.firstChild === null) {
						return "";
					} else {
						return currentNode.firstChild.data;
					}
				} catch (exception) {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed to get server data group ' + group + ': ' + exception);
					throw exception;
				}
			},

			/**	Set local data for the cases when we want to avoid a full list. This should be replaced with the assynchronous updating mechanism.
			 *	@param group	{string}	The group to set the value of
			 *	@param value	{string}	The value to set the group to
			 *	@param failQuietly	{boolean}	If failQuietly is true then null will be returned if a setting is not found, otherwise an exception will be thrown
			 *	@throws		{CAP.exception}	A CAP exception
			 *	@example	var answer = setLocalData('VCA.Ch0.curprofile', 1);
			 *	@private
			 *	@since Version 0.1.4
			 */
			setLocalData: function (group, value, failQuietly) {
				try {
					if (!CAP.members.serverData) {
						throw CAP.exceptions.NO_SERVER_DATA;
					}
					var tag				= 0;
					var currentNode		= CAP.members.serverData;
					var groupArray		= group.split('.');
					var nextNode		= null;
					var childNode		= null;
					var failWithNull	= failQuietly || false;

					groupArray.splice(0, 0, 'Params');

					for (tag = 0; tag < groupArray.length; tag++) {
						for (childNode = currentNode.firstChild; childNode !== null; childNode = childNode.nextSibling) {
							if (childNode.nodeName === groupArray[tag]) {
								currentNode = childNode;
								break;
							}
						}
						if (currentNode.nodeName !== groupArray[tag]) {
							if (failWithNull === true) {
								return null;
							} else {
								throw CAP.exception.INVALID_SETTING;
							}
						}

					}
					currentNode.firstChild.data = value;
					$(window.top).trigger(group);
				} catch (exception) {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed to set server data group ' + group + ': ' + exception);
					throw exception;
				}
			},

			/**	Updates all child nodes.
			 *	@param node	{object} XML Node whose children are to be updated
			 *	@param group	{string} Node CAP group
			 *	@throws		{CAP.exception}	A CAP exception
			 *	@private
			 *	@since Version 0.1.4
			 */
			updateNodes: function (node, group) {
				try {
					var childNode = node;
					for (childNode = childNode.firstChild; childNode !== null; childNode = childNode.nextSibling) {
						if(childNode.firstChild === null) {
							CAP.methods.setLocalData(group, childNode.data);
						}
						else {
							CAP.methods.updateNodes(childNode, group+"."+childNode.nodeName);
						}
					}
				} catch (exception) {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed request to update Params node: ' + exception);
					throw exception;
				}
			},

			/**	Reloads the server data.
			 *	@param group	{string} Optional CAP group
			 *	@throws		{CAP.exception}	A CAP exception
			 *	@private
			 *	@since Version 0.1.4
			 */
			reloadServerData: function (group) {
				try {
					CAP.methods.log(CAP.enums.logLevel.DEBUG, 'Reloading server data');
					var command = 'action=list&xmlschema';
					var successCallback = CAP.eventCallback.reloadServerDataSuccess;
					if(typeof(group) === 'string') {
						command = 'action=list&group='+group+'&xmlschema';
						successCallback = CAP.eventCallback.reloadServerGroupDataSuccess;
					}
					CAP.methods.cgiRequest('GET', command, true, {callbackSuccess: successCallback, callbackError: CAP.eventCallback.reloadServerDataFailure});
				} catch (exception) {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed request to reload server data: ' + exception);
					throw exception;
				}
			},

			/**	A CAP CGI set request
			 *	@param jsonArray		{string}	An array of action, groups and values
			 *	@param jsonArray.action		{string}	The action to perform to the CAP group. Permitted actions are add, remove or update
			 *	@param jsonArray.group		{string}	The identifier of the CAP group to perform the action on
			 *	@param jsonArray.entries	{string}	An array of values to use
			 *	@param jsonArray.entries.id	{string}	The identifier of the entry in the CAP group use
			 *	@param jsonArray.entries.value	{string}	The value to set the identifier too
			 *	@param doReloadServerData	{boolean}	Whether to call reloadServerData after the request. Defaults to true
			 *	@throws		{CAP.exception}	A CAP exception
			 *	@example	CAP.methods.setServerData(
							[
								{
									action: update,
									group: 'VIDEOIN.Ch0.Color',
									entries:
										[
											{
												id:		'brightness',
												value:	'65'
											},
											{
												id:		'contrast',
												value:	'35'
											}
										]
								},
								{
									action: add,
									group: 'VCA.Ch0',
									entries:
										[
											{
												id:		'object'
												value	'zone'
											},
											{
												id:		'color'
												value:	'255,255,0'
											}
										]
								}
							]);
			 *	@private
			 *	@since Version 0.1.4
			 */
			setServerData: function (jsonArray, doReloadServerData) {
				try {

					if (('object' !== typeof (jsonArray)) ||
							('number' !== typeof (jsonArray.length))) {
						throw CAP.exception.INVALID_PARAMS;
					}
					doReloadServerData = typeof doReloadServerData !== 'undefined' ? doReloadServerData : true;
					var jsonIndex = 0;
					for (jsonIndex = 0; jsonIndex < jsonArray.length; jsonIndex++) {
						if (('string' !== typeof (jsonArray[jsonIndex].action)) ||
								('string' !== typeof (jsonArray[jsonIndex].group)) ||
								('number' !== typeof (jsonArray[jsonIndex].entries.length)) ||
								((jsonArray[jsonIndex].action !== 'add' &&
								jsonArray[jsonIndex].action !== 'remove' &&
								jsonArray[jsonIndex].action !== 'update'))) {
							throw CAP.exception.INVALID_PARAMS;
						}
						var requestString	 = 'action=' + jsonArray[jsonIndex].action;
						requestString	+= '&group=' + jsonArray[jsonIndex].group;
						var entryIndex = 0;
						for (entryIndex = 0; entryIndex < jsonArray[jsonIndex].entries.length; entryIndex++) {
							if (('string' !== typeof (jsonArray[jsonIndex].entries[entryIndex].id)) ||
									('string' !== typeof (jsonArray[jsonIndex].entries[entryIndex].value))) {
								throw CAP.exception.INVALID_PARAMS;
							}
							requestString	+= '&' + jsonArray[jsonIndex].entries[entryIndex].id;
							//requestString	+= '=' + jsonArray[jsonIndex].entries[entryIndex].value;
							requestString += '=' + encodeURIComponent(jsonArray[jsonIndex].entries[entryIndex].value);
						}
						if(jsonIndex < jsonArray.length-1)
						{
							requestString += '&nocmd';
						}
						CAP.elements.ajaxPendingCount++;
						if(doReloadServerData)
						{
							CAP.methods.ajaxMessage(GetMsgLang("04050001"));//'Saving configuration. Please wait'
						}
						CAP.methods.cgiRequest('GET', requestString, true, 
							{
								callbackSuccess:	CAP.eventCallback.setServerDataSuccess,
								callbackError:		CAP.eventCallback.setServerDataFailure,
								callbackBefore:		CAP.eventCallback.beforeSetServerData
							});
					}
					if(doReloadServerData && jsonArray.length > 0)
					{
						CAP.methods.reloadServerData();
					}
				} catch (exception) {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed to set information via CAP CGI: ' + exception);
					throw exception;
				}
			},

			/**	A CAP CGI restore request
			 *	@param jsonArray		{string}	An array of groups
			 *	@param jsonArray.group		{string}	The identifier of the CAP group to restore
			 *	@param doReloadServerData	{boolean}	Whether to call reloadServerData after the request. Defaults to true
			 *	@throws		{CAP.exception}	A CAP exception
			 *	@example	CAP.methods.restoreServerData(
							[
								{
									group: 'VCA.Ch0.enable'
								},
								{
									group: 'VCA.Ch0.enablemovobj'
								}
							]);
			 *	@private
			 */
			restoreServerData: function (jsonArray, doReloadServerData) {
				try {

					if (('object' !== typeof (jsonArray)) ||
						('number' !== typeof (jsonArray.length))) {
						throw CAP.exception.INVALID_PARAMS;
					}
					doReloadServerData = typeof doReloadServerData !== 'undefined' ? doReloadServerData : true;
					var jsonIndex = 0;
					for (jsonIndex = 0; jsonIndex < jsonArray.length; jsonIndex++) {
						if ('string' !== typeof (jsonArray[jsonIndex].group)) {
							throw CAP.exception.INVALID_PARAMS;
						}
						var requestString	 = 'group=' + jsonArray[jsonIndex].group;
						if(jsonIndex < jsonArray.length-1)
						{
							requestString += '&nocmd';
						}
						CAP.elements.ajaxPendingCount++;
						if(doReloadServerData)
						{
							CAP.methods.ajaxMessage(GetMsgLang("04050002"));//'Restoring configuration. Please wait'
						}
						CAP.methods.cgiRequest('GET', requestString, true, 
							{
								timeout:		0,
								callbackSuccess:	CAP.eventCallback.setServerDataSuccess,
								callbackError:		CAP.eventCallback.setServerDataFailure,
								callbackBefore:		CAP.eventCallback.beforeSetServerData
							}, '/uapi-cgi/factory.cgi');
					}
					if(doReloadServerData && jsonArray.length > 0)
					{
						CAP.methods.reloadServerData();
					}
				} catch (exception) {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed to restore information via CAP CGI: ' + exception);
					throw exception;
				}
			},

			/**	A CAP CGI set request using a generic request string
			 *	@param requestString	{string}	The CAP CGI request string
			 *	@param optionalCgiUri	{string}	An optional string for setting the CGI URI.
			 *	@throws		{CAP.exception}	A CAP exception
			 *	@public
			 *	@since Version 0.1.4
			 */
			sendServerRequest: function (requestString, optionalCgiUri) {
				try {
					if (('string' !== typeof (requestString)) ||
						(undefined !== optionalCgiUri && 'string' !== typeof (optionalCgiUri))) {
						throw CAP.exception.INVALID_PARAMS;
					}
					CAP.elements.ajaxPendingCount++;
					CAP.methods.ajaxMessage(GetMsgLang("04050001"));//'Saving configuration. Please wait'
					CAP.methods.cgiRequest('GET', requestString, true, 
						{
							callbackSuccess:	CAP.eventCallback.setServerDataSuccess,
							callbackError:		CAP.eventCallback.setServerDataFailure,
							callbackBefore:		CAP.eventCallback.beforeSetServerData
						}, optionalCgiUri);
					CAP.methods.reloadServerData();
				} catch (exception) {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed to set information via CAP CGI: ' + exception);
					throw exception;
				}
			},

			/**	A simple CAP CGI set request using a generic request string
			 *	@param requestString	{string}	The CAP CGI request string
			 *	@param optionalJson		{function}	The optional arguments in JSON format
			 *	@param optionalJson.callbackSuccess		{function}	The asynchronous successful callback function
			 *	@param optionalJson.callbackError		{function}	The asynchronous failure callback function
			 *	@param optionalJson.callbackBefore		{function}	The function to call when before the CGI request starts
			 *	@param optionalJson.callbackComplete	{function}	The function to call when the request completes (after success and fail)
			 *	@param optionalCgiUri	{string}	An optional string for setting the CGI URI.
			 *	@throws		{CAP.exception}	A CAP exception
			 *	@public
			 *	@since Version 0.1.4
			 */
			sendSimpleServerRequest: function (requestString, optionalJson, optionalCgiUri) {
				try {
					if (('string' !== typeof (requestString)) ||
						(undefined !== optionalCgiUri && 'string' !== typeof (optionalCgiUri))) {
						throw CAP.exception.INVALID_PARAMS;
					}
					CAP.methods.cgiRequest('GET', requestString, false, optionalJson, optionalCgiUri);
				} catch (exception) {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed to set information via CAP CGI: ' + exception);
					throw exception;
				}
			},

			/**	This shows a generic in-page AJAX message.  There can only ever
			 *	be one message.  Setting another string will replace the message
			 *	in place.
			 *	@param string	{string}	The message string.  Leave this undefined
			 *								to remove the message.
			 *	@param error	{boolean}	(Optional) If the message is an error. This
			 *								will set the background colour to red.
			 *	@throws		{CAP.exception}	A CAP exception
			 *	@private
			 *	@since Version 0.1.14
			 */
			ajaxMessage: function (string, error) {
				try {
					if (string) {
						if (('string' !== typeof (string))) {
							throw CAP.exception.INVALID_PARAMS;
						}

						if (('boolean' === typeof (error)) && error) {
							$(CAP.elements.ajaxMessage).css('background-color', '#FF4040');
							$(CAP.elements.ajaxMessage.firstChild).css('display: none');
						} else {
							$(CAP.elements.ajaxMessage).css('background-color', '#FFFFFF');
							$(CAP.elements.ajaxMessage.firstChild).css('display: block');
						}

						// The second child is the textNode
						CAP.elements.ajaxMessage.firstChild.nextSibling.nodeValue = string;

						$(CAP.elements.messageFrame).show();
						$(CAP.elements.ajaxMessage).show();
						$(CAP.elements.messageFrame).width($(CAP.elements.ajaxMessage).outerWidth(true));
						$(CAP.elements.messageFrame).height($(CAP.elements.ajaxMessage).outerHeight(true));

						// Fade out errors after 5 seconds
						if (('boolean' === typeof (error)) && error) {
							$(CAP.elements.ajaxMessage).delay(5000).hide('slow');
							$(CAP.elements.messageFrame).delay(8000).hide();
						}
					} else {
						$(CAP.elements.ajaxMessage).hide('slow');
						$(CAP.elements.messageFrame).delay(3000).hide();
						$(window.top).delay(3000).trigger('capAjaxMessageHide');
					}
				} catch (exception) {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed to process AJAX message \'' + string + '\': ' + exception);
					throw exception;
				}
			},

			/**	A CAP CGI request
			 *	@param method			{string}	The HTTP request method
			 *	@param requestString	{string}	The CAP CGI request string
			 *	@param requestString	{string}	The CAP CGI request string
			 *	@param optionalJson		{function}	The optional arguments in JSON format
			 *	@param optionalJson.callbackSuccess		{function}	The asynchronous successful callback function
			 *	@param optionalJson.callbackError		{function}	The asynchronous failure callback function
			 *	@param optionalJson.callbackBefore		{function}	The function to call when before the CGI request starts
			 *	@param optionalJson.callbackComplete	{function}	The function to call when the request completes (after success and fail)
			 *	@param optionalCgiUri	{string}	An optional string for setting the CGI URI.
			 *	@throws		{CAP.exception}	A CAP exception
			 *	@private
			 *	@since Version 0.1.4
			 */
			cgiRequest: function (method, requestString, useFIFO, optionalJson, optionalCgiUri) {
				try {
					// The AJAX request will handle the checking of the other parameters
					if (('string' !== typeof (requestString))) {
						throw CAP.exception.INVALID_PARAMS;
					}
					if((undefined === optionalCgiUri) || ('string' !== typeof (optionalCgiUri)))
						var cgiUri = '/uapi-cgi/param.cgi';
					else
						var cgiUri = optionalCgiUri;					
					var uri		= cgiUri + '?' + requestString;
					CAP.methods.log(CAP.enums.logLevel.DEBUG, 'Requesting ' + uri);
					if(useFIFO)
						CAP.methods.ajaxRequest(method, uri, optionalJson);
					else
						CAP.methods.ajaxSimpleRequest(method, uri, optionalJson);
				} catch (exception) {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed to request data from the CAP CGI: ' + exception);
					throw CAP.exception.FAIL;
				}
			},

			/**	A logging method to print data to the
			 *	user agents console.
			 *	@param	{CAP.enum.logLevel}	level	The logging level of this log.
			 *	@param	{Object}			object	The Javascript object to log.
			 *	@private
			 *	@since Version 0.1.0
			 */
			log: function (level, object) {
				var currentTime = new Date();
				var minutes = currentTime.getMinutes();
				var seconds = currentTime.getSeconds();
				var milliseconds = currentTime.getMilliseconds();
				if (typeof (CAP.enums.logLevel.ERROR) === typeof (level) &&
						CAP.members.logLevel >= level &&
						level !== CAP.enums.logLevel.NONE) {
					switch (level) {
					case CAP.enums.logLevel.ERROR:
						if (console) {console.error('CAP: ' + minutes + ':' + seconds + ':' + milliseconds + ': ' + object); }
						break;
					case CAP.enums.logLevel.WARN:
						if (console) {console.warn('CAP: ' + minutes + ':' + seconds + ':' + milliseconds + ': ' + object); }
						break;
					case CAP.enums.logLevel.INFO:
						if (console) {console.info('CAP: ' + minutes + ':' + seconds + ':' + milliseconds + ': ' + object); }
						break;
					case CAP.enums.logLevel.DEBUG:
						if (console) {console.log('CAP: ' + minutes + ':' + seconds + ':' + milliseconds + ': ' + object); }
						break;
					case CAP.enums.logLevel.VERBOSE:
						if (console) {console.log('CAP: ' + minutes + ':' + seconds + ':' + milliseconds + ': ' + object); }
						break;
					default:
						if (console) {console.log('CAP: ' + minutes + ':' + seconds + ':' + milliseconds + ': ' + object); }
						break;
					}
				}
			},

			/**	An AJAX XML HTTP request
			 *	@param method			{string}	The HTTP request method
			 *	@param uri				{string}	The universal resource identifier of the CGI
			 *	@param optionalJson		{function}	The optional arguments in JSON format
			 *	@param optionalJson.timeout		{number}	The timeout (in milliseconds) for the request
			 *	@param optionalJson.callbackSuccess		{function}	The asynchronous successful callback function
			 *	@param optionalJson.callbackError		{function}	The asynchronous failure callback function
			 *	@param optionalJson.callbackBefore		{function}	The function to call when before the CGI request starts
			 *	@param optionalJson.callbackComplete	{function}	The function to call when the request completes (after success and fail)
			 *	@throws		{CAP.exceptions}	A CAP exception
			 *	@private
			 *	@since Version 0.1.3
			 */
			ajaxRequest: function (method, uri, optionalJson) {
				try {
					if (('string' !== typeof (method)) ||
							('string' !== typeof (uri)) ||
							(optionalJson && optionalJson.timeout !== undefined && ('number' !== typeof (optionalJson.timeout))) ||
							(optionalJson && optionalJson.callbackSuccess && ('function' !== typeof (optionalJson.callbackSuccess))) ||
							(optionalJson && optionalJson.callbackError && ('function' !== typeof (optionalJson.callbackError))) ||
							(optionalJson && optionalJson.callbackBefore && ('function' !== typeof (optionalJson.callbackBefore))) ||
							(optionalJson && optionalJson.callbackComplete && ('function' !== typeof (optionalJson.callbackComplete))) ||
							!((method === 'GET') || (method === 'POST'))) {
						throw CAP.exceptions.INVALID_PARAMS;
					}
					CAP.methods.log(CAP.enums.logLevel.DEBUG, 'AJAX to ' + uri);
/* We should just send the ajax request straight away but because the DB and CGI
   are craaaazy slow and buggy, we're gonna serialize them into a FIFO
					$.ajax(
*/
					CAP.members.ajaxFifo.unshift(
						{
							url:		uri,
							timeout:	(optionalJson && optionalJson.timeout !== undefined ) ? optionalJson.timeout : 30000,
							success:	(optionalJson && optionalJson.callbackSuccess)	||	null,
							beforeSend:	(optionalJson && optionalJson.callbackBefore)	||	null,
							error:		(optionalJson && optionalJson.callbackError)	||	null,
							complete:	CAP.eventCallback.ajaxComplete,/*(optionalJson && optionalJson.callbackComplete)	||	null,*/ /* We can't do this as we need to serialize the AJAX requests*/
							cache:		false,
							type:		method
						}
					);

					/* Need to start the first one! */
					if (CAP.members.ajaxFifo.length === 1) {
						CAP.methods.log(CAP.enums.logLevel.INFO, 'Starting first AJAX request: ' + uri);
						$.ajax(CAP.members.ajaxFifo[0]);
					}
				} catch (exception) {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed to request data from the server: ' + exception);
					throw CAP.exceptions.FAIL;
				}
			},

			/**	An AJAX XML HTTP request that bypasses the FIFO
			 *	@param method			{string}	The HTTP request method
			 *	@param uri				{string}	The universal resource identifier of the CGI
			 *	@param optionalJson		{function}	The optional arguments in JSON format
			 *	@param optionalJson.callbackSuccess		{function}	The asynchronous successful callback function
			 *	@param optionalJson.callbackError		{function}	The asynchronous failure callback function
			 *	@param optionalJson.callbackBefore		{function}	The function to call when before the CGI request starts
			 *	@param optionalJson.callbackComplete	{function}	The function to call when the request completes (after success and fail)
			 *	@throws		{CAP.exceptions}	A CAP exception
			 *	@private
			 *	@since Version 0.1.3
			 */
			ajaxSimpleRequest: function (method, uri, optionalJson) {
				try {
					if (('string' !== typeof (method)) ||
							('string' !== typeof (uri)) ||
							(optionalJson && optionalJson.callbackSuccess && ('function' !== typeof (optionalJson.callbackSuccess))) ||
							(optionalJson && optionalJson.callbackError && ('function' !== typeof (optionalJson.callbackError))) ||
							(optionalJson && optionalJson.callbackBefore && ('function' !== typeof (optionalJson.callbackBefore))) ||
							(optionalJson && optionalJson.callbackComplete && ('function' !== typeof (optionalJson.callbackComplete))) ||
							!((method === 'GET') || (method === 'POST'))) {
						throw CAP.exceptions.INVALID_PARAMS;
					}
					CAP.methods.log(CAP.enums.logLevel.DEBUG, 'AJAX to ' + uri);
					$.ajax(
						{
							url:		uri,
							timeout:	30000,
							success:	(optionalJson && optionalJson.callbackSuccess)	||	null,
							beforeSend:	(optionalJson && optionalJson.callbackBefore)	||	null,
							error:		(optionalJson && optionalJson.callbackError)	||	null,
							complete:	(optionalJson && optionalJson.callbackComplete)	||	null,
							cache:		false,
							type:		method
						}
					);
				} catch (exception) {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed to request data from the server: ' + exception);
					throw CAP.exceptions.FAIL;
				}
			},

			/**	Prints the current logging level to the console.
			 *	@throws		{CAP.exceptions}	A CAP exception
			 *	@private
			 *	@since Version 0.1.0
			 */
			printLogLevel: function () {
				try {
					if (console && console.log) { console.log('CAP: Log Level: ' + CAP.enums.logLevel[CAP.members.logLevel]); }
				} catch (exception) {
					throw CAP.exceptions.FAIL;
				}
			},

			/**	Increases the logging level.
			 *	@throws		{CAP.exceptions}	A CAP exception
			 *	@private
			 *	@since Version 0.1.0
			 */
			increaseLogLevel : function () {
				try {
					if (CAP.members.logLevel < (CAP.enums.logLevel.NUM - 1)) {
						CAP.members.logLevel++;
					}
					CAP.methods.printLogLevel();
				} catch (exception) {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed to increase log level: ' + exception);
					throw exception;
				}
			},


			/**	Decreases the logging level
			 *	@throws		{CAP.exceptions}	A CAP exception
			 *	@private
			 *	@since Version 0.1.0
			 */
			decreaseLogLevel : function () {
				try {
					if (CAP.members.logLevel > CAP.enums.logLevel.NONE) {
						CAP.members.logLevel--;
					}
					CAP.methods.printLogLevel();
				} catch (exception) {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed to decrease log level: ' + exception);
					throw exception;
				}
			},

			/**	Resets the logging level to the default
			 *	warning and error output
			 *	@throws		{CAP.exceptions}	A CAP exception
			 *	@private
			 *	@since Version 0.1.0
			 */
			resetLogLevel : function () {
				try {
					CAP.members.logLevel = CAP.enums.logLevel.WARN;
					CAP.methods.printLogLevel();
				} catch (exception) {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed to reset log level: ' + exception);
					throw exception;
				}
			},

			/**	Clears the logging level so that
			 *	no logging will be output
			 *	@throws		{CAP.exceptions}	A CAP exception
			 *	@private
			 *	@since Version 0.1.0
			 */
			clearLogLevel : function () {
				try {
					CAP.members.logLevel = CAP.enums.logLevel.NONE;
					CAP.methods.printLogLevel();
				} catch (exception) {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed to clear log level: ' + exception);
					throw exception;
				}
			},

			/**	Sorts a key binding string so that the meta
			 *	meta keys are first.  This is so that when we
			 *	do a lookup for the callback function in CAP.members.keyBindings
			 *	we can find the correct one.
			 *	@param		{String}	keyCombo	A key binding in the form CTRL+ALT+A
			 *	@returns	{String}	A sorted string ready to be added to the CAP.members.keyBindings
			 *	@throws		{CAP.exceptions}	A CAP exception
			 *	@private
			 *	@since Version 0.1.0
			 */
			sortKeyBinding: function (keyCombo) {
				// Check we have the correct parameters
				if ('string' !== typeof (keyCombo)) {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'Invalid parameters to sortKeyBinding');
					throw CAP.exceptions.INVALID_PARAMS;
				}

				try {
					var	i = 0;
					var	keyComboSplit = keyCombo.toUpperCase().split('+');
					var	keyComboSorted = [];

					// Reorder the keys
					if ((i = $.inArray('CTRL',  keyComboSplit)) >= 0) { keyComboSorted.push(keyComboSplit.splice(i, 1)); }
					if ((i = $.inArray('ALT',   keyComboSplit)) >= 0) { keyComboSorted.push(keyComboSplit.splice(i, 1)); }
					if ((i = $.inArray('SHIFT', keyComboSplit)) >= 0) { keyComboSorted.push(keyComboSplit.splice(i, 1)); }

					// Make sure we have a key to bind too
					//TODO We only accept A-Z
					if ((keyComboSplit.length !== 1) ||
							(keyComboSplit.join('').length !== 1) ||
							(keyComboSplit.join('').match(/[A-Z]/g) === null)) {
						CAP.methods.log(CAP.enums.logLevel.ERROR, 'Invalid keys to bind too: \'' + keyComboSplit.join(' & ') + '\'');
						return undefined;
					}

					// Add the sorted meta keys back to the split array at the start.
					if (keyComboSorted.length) { keyComboSplit = keyComboSorted.concat(keyComboSplit); }

					// Return the sorted key combination
					return keyComboSplit.join('+');
				} catch (exception) {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed to sort key binding: ' + exception);
					throw CAP.exceptions.FAIL;
				}
			},

			/**	Adds a key binding to a callback function.
			 *	@param		{String}	keyCombo	A key binding in the form CTRL+ALT+A
			 *	@param		{Function}	callback	The callback function to run when
			 *										the key binding is pressed
			 *	@throws		{CAP.exceptions}	A CAP exception
			 *	@example	status = CAP.methods.addKeyBinding('CTRL+ALT+Q', CAP.methods.increaseLogLevel);
			 *	@private
			 *	@since Version 0.1.0
			 */
			addKeyBinding: function (keyCombo, callback) {
				// Check we have the correct parameters
				if (('string' !== typeof (keyCombo)) || ('function' !== typeof (callback))) {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'Invalid parameters to addKeyBinding');
					throw CAP.exceptions.INVALID_PARAMS;
				}
				try {
					// Process the key binding string
					keyCombo = CAP.methods.sortKeyBinding(keyCombo);

					CAP.methods.log(CAP.enums.logLevel.VERBOSE, 'Adding keybinding for ' + keyCombo);

					// Add the key binding to the list
					CAP.members.keyBindings[keyCombo] = {
						callback: callback
					};
				} catch (exception) {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed to add key binding: ' + exception);
					throw exception;
				}
			},

			/**	Removes a key binding.
			 *	@param		{String}	keyCombo	A key binding in the form CTRL+ALT+A
			 *	@throws		{CAP.exceptions}	A CAP exception
			 *	@example	status = CAP.methods.removeKeyBinding('CTRL+ALT+Q');
			 *	@private
			 *	@since Version 0.1.0
			 */
			removeKeyBinding: function (keyCombo) {
				// Check we have the correct parameters
				if ('string' !== typeof (keyCombo)) {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'Invalid parameters to removeKeyBinding');
					throw CAP.exceptions.INVALID_PARAMS;
				}
				try {
					// Process the key binding string
					if ((keyCombo = CAP.methods.sortKeyBinding(keyCombo)) === undefined) {
						CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed to sort key combination');
						return CAP.enums.errorCode.FAIL;
					}

					CAP.methods.log(CAP.enums.logLevel.VERBOSE, 'Removing keybinding from ' + keyCombo);

					// Remove the key binding to the list
					if (CAP.members.keyBindings[keyCombo]) {
						delete CAP.members.keyBindings[keyCombo];
					} else {
						CAP.methods.log(CAP.enums.logLevel.WARN, 'There is no key binding for ' + keyCombo + ' to remove.');
					}
				} catch (exception) {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed to remove key binding: ' + exception);
					throw exception;
				}
			},

			/**	Loads the brand.xml file from the server that contains product info
			 *	@throws		{CAP.exception}	A CAP exception
			 *	@private
			 */
			loadBrandData: function () {
				try {
					CAP.methods.log(CAP.enums.logLevel.DEBUG, 'Loading brand.xml data');
					CAP.methods.cgiRequest('GET', '', false, {callbackSuccess: CAP.eventCallback.loadBrandDataSuccess, callbackError: CAP.eventCallback.loadBrandDataFailure}, '/brand.xml');
				} catch (exception ) {
					CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed request to load brand.xml file: ' + exception );
					throw exception;
				}
			}
		};

	// Initialise the namespace when the DOM loads
	$(document).ready(CAP.methods.init);

	/**	The CAP Javascript Library contains a interface layer
	 *	between the web user experience and the APIs that
	 *	interface with the application code.
	 *	@namespace	A CAP Javascript Library
	 *	@exports window.CAP as CAP 
	 *	@version 0.1.15
	 */
	window.CAP = {
		loadConfig : function () {
			if (CAP.members.loadStarted === 0) {
				// Get the server data
				CAP.methods.log(CAP.enums.logLevel.DEBUG, 'Getting initial server data');
				CAP.methods.reloadServerData();

				// Only need to load the brand data on the first time (it does not change
				// like the config does)
				CAP.methods.loadBrandData();

				CAP.members.loadStarted = 1;
			}
		},

		reLoadConfig : function () {
			if (CAP.members.loadStarted === 0) {
				//First time loading
				window.CAP.loadConfig();
			}
			else {
				// Get the server data
				CAP.methods.log(CAP.enums.logLevel.DEBUG, 'Getting server data');
				CAP.methods.reloadServerData();

				CAP.members.loadStarted = 1;
			}
		},

		invalidate : function () {
			CAP.members.loadStarted = 0;
			CAP.members.serverData = undefined;
		},

		/**	Functions that are useful for pages.
		 *	@namespace	Functions that are used in the pages.
		 *	@public
		 *	@since Version 0.1.14
		 */
		page :
			{
				/**	Initializes a dynamically loaded page in the IPX.  This is to provide
				 *	a transistional period between the old Javascript design and a new
				 *	library based design.
				 *	TODO: A dynamically loaded page shouldn't have to call any functions
				 *	      to display itself.  The loading page should handle all that.
				 *	      The configuration index page should initialise the page.
				 *	@public
				 *	@since Version 0.1.14
				 */
				show : function (window) {
					try {
						CAP.methods.log(CAP.enums.logLevel.WARN, 'TODO: Remove the need for CAP.pageShow().');
						if (window.InitThemes && window.ContentShow) {
							window.InitThemes();
							window.ContentShow();
						} else {
							CAP.methods.log(CAP.enums.logLevel.ERROR, 'You need to include InitThemes() and ContentShow() in your configuration page.');
						}
					} catch (exception) {
						CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed request intialise the page.  Have you included common.js?: ' + exception);
						throw exception;
					}
				}
			},

		/**	Exceptions that can be thrown from CAP Javascript functions
		 *	@namespace	Exceptions that can be thrown from CAP Javascript functions
		 *	@public
		 *	@since Version 0.1.1
		 */
		exception :
			{
				/**	A generic failure
				 *	@public
				 *	@since Version 0.1.1
				 */
				FAIL:					CAP.exceptions.FAIL,

				/**	Invalid parameters to a function
				 *	@public
				 *	@since Version 0.1.1
				 */
				INVALID_PARAMS:			CAP.exceptions.INVALID_PARAMS,

				/**	No server data available
				 *	@public
				 *	@since Version 0.1.1
				 */
				NO_SERVER_DATA:			CAP.exceptions.NO_SERVER_DATA
			},

		/**	The CAP AJAX provides public methods to perform AJAX requests
		 *	@namespace	Contains everything to peform AJAX methods.
		 *	@public
		 *	@since Version 0.1.0
		 */
		ajax:
			{
				/**	If the server data is loaded.
				 *	@throws		{CAP.exception}	A CAP exception
				 *	@public
				 *	@since Version 0.1.4
				 */
				serverDataLoaded: function () {
					return (CAP.members.serverData !== undefined);
				},

				/**	Reloads the server data.  This will refresh the most recent
				 *	data from the hardware.
				 *	@param group	{string} Optional CAP group
				 *	@throws		{CAP.exception}	A CAP exception
				 *	@public
				 *	@since Version 0.1.4
				 */
				reloadServerData: function (group) {
					try {
						CAP.methods.reloadServerData(group);
					} catch (exception) {
						CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed request to reload server data: ' + exception);
						throw exception;
					}
				},

				/**	An asychronous CAP CGI set request
				 *	@throws				{CAP.exception}	A CAP exception
				 *	@param jsonArray.action		{string}	The action to perform to the CAP group. Permitted actions are add, remove or update
				 *	@param jsonArray.group		{string}	The identifier of the CAP group to perform the action on
				 *	@param jsonArray.entries	{string}	An array of values to use
				 *	@param jsonArray.entries.id	{string}	The identifier of the entry in the CAP group use
				 *	@param jsonArray.entries.value	{string}	The value to set the identifier too
				 *	@param doReloadServerData	{boolean}	Whether to call reloadServerData after the request. Defaults to true
				 *	@throws		{CAP.exception}	A CAP exception
				 *	@example	CAP.ajax.setServerData(
								[
								{
									action: update,
									group: 'VIDEOIN.Ch0.Color',
									entries:
										[
											{
												id:		'brightness',
												value:	'65'
											},
											{
												id:		'contrast',
												value:	'35'
											}
										]
								},
								{
									action: add,
									group: 'VCA.Ch0',
									entries:
										[
											{
												id:		'object'
												value	'zone'
											},
											{
												id:		'color'
												value:	'255,255,0'
											}
										]
								}
								]);
				 *	@public
				 *	@since Version 0.1.4
				 */
				setServerData: function (jsonArray, doReloadServerData) {
					try {
						CAP.methods.setServerData(jsonArray, doReloadServerData);
					} catch (exception) {
						CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed to set information via CAP CGI: ' + exception);
						throw exception;
					}
				},
	
				/**	An asychronous CAP CGI restore request
				 *	@param jsonArray		{string}	An array of groups
				 *	@param jsonArray.group		{string}	The identifier of the CAP group to restore
				 *	@param doReloadServerData	{boolean}	Whether to call reloadServerData after the request. Defaults to true
				 *	@throws		{CAP.exception}	A CAP exception
				 *	@example	CAP.methods.restoreServerData(
								[
									{
										group: 'VCA.Ch0.enable'
									},
									{
										group: 'VCA.Ch0.enablemovobj'
									}
								]);
				 *	@public
				 */
				restoreServerData: function (jsonArray, doReloadServerData) {
					try {
						CAP.methods.restoreServerData(jsonArray, doReloadServerData);
					} catch (exception) {
						CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed to restore information via CAP CGI: ' + exception);
						throw exception;
					}
				},

				/**	An asychronous CAP CGI set request using a generic request string
				 *	@param requestString		{string}	The CAP CGI request string
				 *	@param optionalCgiUri	{string}	An optional string for setting the CGI URI.
				 *	@throws		{CAP.exception}	A CAP exception
				 *	@public
				 *	@since Version 0.1.4
				 */
				sendServerRequest: function (requestString, optionalCgiUri) {
					try {
						CAP.methods.sendServerRequest(requestString, optionalCgiUri);
					} catch (exception) {
						CAP.methods.log(CAP.enums.logLevel.ERROR, 'CGI request failed: ' + exception);
						throw exception;
					}
				},

				/**	An immediate CAP CGI set request using a generic request string
				 *	@param requestString		{string}	The CAP CGI request string
				 *	@param optionalJson		{function}	The optional arguments in JSON format
				 *	@param optionalJson.callbackSuccess		{function}	The asynchronous successful callback function
				 *	@param optionalJson.callbackError		{function}	The asynchronous failure callback function
				 *	@param optionalJson.callbackBefore		{function}	The function to call when before the CGI request starts
				 *	@param optionalJson.callbackComplete	{function}	The function to call when the request completes (after success and fail)
				 *	@param optionalCgiUri	{string}	An optional string for setting the CGI URI.
				 *	@throws		{CAP.exception}	A CAP exception
				 *	@public
				 *	@since Version 0.1.4
				 */
				sendSimpleServerRequest: function (requestString, optionalJson, optionalCgiUri) {
					try {
						CAP.methods.sendSimpleServerRequest(requestString, optionalJson, optionalCgiUri);
					} catch (exception) {
						CAP.methods.log(CAP.enums.logLevel.ERROR, 'CGI request failed: ' + exception);
						throw exception;
					}
				},

				/**	Get server data.
				 *	@param group	{string}	The group to get the value of
				 *	@throws		{CAP.exception}	A CAP exception
				 *	@example	var answer = getServerData('VIDEOIN.nbrofchannel');
				 *	@public
				 *	@since Version 0.1.4
				 */
				getServerData: function (group, failQuietly) {
					try {
						return CAP.methods.getServerData(group, failQuietly);
					} catch (exception) {
						CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed to get server data group ' + group + ': ' + exception);
						throw exception;
					}
				},

				/**	Set local data for the cases when we want to avoid a full list. This should be replaced with the assynchronous updating mechanism.
				 *	@param group	{string}	The group to set the value of
				 *	@param value	{string}	The value to set the group to
				 *	@param failQuietly	{boolean}	If failQuietly is true then null will be returned if a setting is not found, otherwise an exception will be thrown
				 *	@throws		{CAP.exception}	A CAP exception
				 *	@example	var answer = setLocalData('VCA.Ch0.curprofile', 1);
				 *	@private
				 *	@since Version 0.1.4
				 */
				setLocalData: function (group, value, failQuietly) {
					try {
						return CAP.methods.setLocalData(group, value, failQuietly);
					} catch (exception) {
						CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed to set server data group ' + group + ': ' + exception);
						throw exception;
					}
				},

				/**	Get all server data as a xml formatted string.
				 *	@throws		{CAP.exception}	A CAP exception
				 *	@example	var xml = getAllServerDataXML();
				 *	@public
				 *	@since Version 0.1.4
				 */
				getAllServerDataXml: function () {
					try {
						return CAP.methods.getServerDataXml();
					} catch (exception) {
						CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed to get server data xml: ' + exception);
						throw exception;
					}
				},

				/** @brief	Automatically save the settings on the page using their element classes and IDs
				 *	@param	currentWindow	The DOM object for the current window (or any other DOM object in the same javascript namespace)
				 *	@param	baseGroup		The group to be prepended to the setting names (e.g. 'VCA.Ch0')
				 *	@throws	{CAP.exception}		A CAP exception
				 *	@public
				 *
				 *	The autoSave and autoLoad are intended to reduce the amount
				 *	of code required for loading and saving settings from the
				 *	camera.  HTML elements can be given one of the following
				 *	classes, which should be chosen to match the format in
				 *	which the data is transferred using the CGI interface:
				 *
				 *	auto-text	- to save/load text box values to/from settings of CGI format setting=value
				 *	auto-display- to load text with span elements from settings of CGI format setting=value
				 *	auto-multi	- to save/load sets of tick-boxes to/from settings of CGI format setting=option1,option2,option3
				 *	auto-select	- to save/load combo box values to/from settings of CGI format setting=value
				 *	auto-yesno  - to save/load a single tick-box value to settings of CGI format setting={yes,no}
				 *
				 *	In most cases, the id of the item specifies the setting 
				 *	name.  For auto-multi, the ids of the checkboxes specify 
				 *	the option values and the id of a surrounding span 
				 *	specifies the setting name.
				 *
				 *	@example <input type="text" id="retrigtime" class="auto-text" />
				 *
				 *	@see Form fields can be also be loaded using the autoLoad function
				 */
				autoSave : function (currentWindow, baseGroup) {
					var jsonArray = [];
					try {
						//Automatically set from the auto items on the page
						var itemNum, groupNum;

						// First text items:
						var autoTextItems = currentWindow.$('input.auto-text').toArray();
						for (itemNum = 0; itemNum < autoTextItems.length; itemNum++) {
							jsonArray.push(
								{
									id:		autoTextItems[itemNum].id,
									value:	autoTextItems[itemNum].value
								}
							);
						}

						// Next multiple-select items:
						var autoMultiGroups = currentWindow.$('span.auto-multi').toArray();
						for (groupNum = 0; groupNum < autoMultiGroups.length; groupNum++) {
							var autoMultiItems = autoMultiGroups[groupNum].getElementsByTagName("input");
							var activeElements = "";

							for (itemNum = 0; itemNum < autoMultiItems.length; itemNum++) {
								if (autoMultiItems[itemNum].checked) {
									if (activeElements === "") {
										activeElements = autoMultiItems[itemNum].id;
									} else {
										activeElements += "," + autoMultiItems[itemNum].id;
									}
								}
							}
							jsonArray.push(
								{
									id:		autoMultiGroups[groupNum].id,
									value:	activeElements
								}
							);
						}

						// Next single-select items:
						// Combo boxes:
						var autoSelectItems = currentWindow.$('select.auto-select').toArray();
						for (itemNum = 0; itemNum < autoSelectItems.length; itemNum++) {
							jsonArray.push(
								{
									id:		autoSelectItems[itemNum].id,
									value:	autoSelectItems[itemNum].options[autoSelectItems[itemNum].selectedIndex].value
								}
							);
						}
						// Radio buttons:
						var autoSelectGroups = currentWindow.$('span.auto-select').toArray();
						for (groupNum = 0; groupNum < autoSelectGroups.length; groupNum++) {
							var autoSelectItems = autoSelectGroups[groupNum].getElementsByTagName("input");
							for (itemNum = 0; itemNum < autoSelectItems.length; itemNum++) {
								if(autoSelectItems[itemNum].type == "radio") {
									if (autoSelectItems[itemNum].checked) {
										jsonArray.push(
											{
												id:		autoSelectGroups[groupNum].id,
												value:	autoSelectItems[itemNum].id
											}
										);
									}
								}
							}

						}


						//Finally yes/no tickboxes:
						var yesNoItems = currentWindow.$('input.auto-yesno').toArray();
						for (itemNum = 0; itemNum < yesNoItems.length; itemNum++) {
							var itemValue = "no";
							if(yesNoItems[itemNum].checked)
								itemValue = "yes";
							jsonArray.push(
								{
									id:		yesNoItems[itemNum].id,
									value:	itemValue
								}
							);
						}

						var jsonObject = {
							action:		'update',
							group:		baseGroup,
							entries:	jsonArray
						};

						CAP.methods.setServerData([jsonObject]);
					} catch (exception) {
						CAP.logging.error('autoSave FAILED: ' + exception);
						throw exception;
					}
				},

				/**	@brief Automatically load the settings on the page using their element classes and IDs
				 *	@throws		{CAP.exception}		A CAP exception
				 *	@public
				 *
				 *	The autoSave and autoLoad are intended to reduce the amount
				 *	of code required for loading and saving settings from the 
				 *	camera.
				 *
				 *	@see See autoSave for details of how the automatic saving and loading works
				 *
				 */
				autoLoad : function (currentWindow, baseGroup) {
					try {
						// Automatically fill in the values for auto-elements:
						var itemNum, groupNum;

						// First text items:
						var autoTextItems = currentWindow.$('input.auto-text').toArray();
						for (itemNum = 0; itemNum < autoTextItems.length; itemNum++) {
							autoTextItems[itemNum].value = CAP.methods.getServerData(baseGroup + '.' + autoTextItems[itemNum].id);
						}
						currentWindow.$('input.auto-text').change();

						// Now display only items:
						var autoDisplayItems = currentWindow.$('span.auto-display').toArray();
						for (itemNum = 0; itemNum < autoDisplayItems.length; itemNum++) {
							autoDisplayItems[itemNum].firstChild.data = CAP.methods.getServerData(baseGroup + '.' + autoDisplayItems[itemNum].id);
						}

						// Next multiple-select items:
						var autoMultiGroups = currentWindow.$('span.auto-multi').toArray();
						for (groupNum = 0; groupNum < autoMultiGroups.length; groupNum++) {
							var autoMultiItems = autoMultiGroups[groupNum].getElementsByTagName("input");
							var activeElements = CAP.methods.getServerData(baseGroup + '.' + autoMultiGroups[groupNum].id).split(',');
							for (itemNum = 0; itemNum < autoMultiItems.length; itemNum++) {
								autoMultiItems[itemNum].checked = (activeElements.indexOf(autoMultiItems[itemNum].id) !== -1);
							}
						}

						// Next single-select items:
						// Combo boxes:
						var autoSelectItems = currentWindow.$('select.auto-select').toArray();
						for (groupNum = 0; groupNum < autoSelectItems.length; groupNum++) {
							var selectedItem = CAP.methods.getServerData(baseGroup + '.' + autoSelectItems[groupNum].id);
							var options = autoSelectItems[groupNum].options;
							for (itemNum = 0; itemNum < options.length; itemNum++) {
								if (options[itemNum].value === selectedItem) {
									autoSelectItems[groupNum].selectedIndex = itemNum;
									break;
								}
							}
						}

						// Radio buttons:
						var autoSelectGroups = currentWindow.$('span.auto-select').toArray();
						for (groupNum = 0; groupNum < autoSelectGroups.length; groupNum++) {
							var radioItems = autoSelectGroups[groupNum].getElementsByTagName("input");
							var selectedItem = CAP.methods.getServerData(baseGroup + '.' + autoSelectGroups[groupNum].id);
							for (itemNum = 0; itemNum < radioItems.length; itemNum++) {
								radioItems[itemNum].checked = (radioItems[itemNum].id === selectedItem);
							}
						}
						currentWindow.$('span.auto-select').change();

						
						// Finally yes/no tickboxes:
						var yesNoItems = currentWindow.$('input.auto-yesno').toArray();
						for (itemNum = 0; itemNum < yesNoItems.length; itemNum++) {
							yesNoItems[itemNum].checked	= (CAP.methods.getServerData(baseGroup + '.' + yesNoItems[itemNum].id) === "yes");
						}
					} catch (exception) {
						CAP.logging.error('autoLoad FAILED: ' + exception);
						throw exception;
					}
				}

			},

		/**	The CAP logging provides public methods to output necessary
		 *	logging messages from inside the CAP Javascript Library.
		 *	<br/><br/>
		 *	The logging level can be changed with the various public
		 *	methods to suppress or enable various levels or logging
		 *	statements.
		 *	<br/><br/>
		 *	The CAP log messages are sent to the user agent console.
		 *	@namespace	Contains everything to control and
		 *				use the CAP logging correctly.
		 *	@public
		 *	@since Version 0.1.0
		 */
		logging :
			{
				/**	An error message to print to the user agent console
				 *	@param	{Object}			object	The Javascript object to log.
				 *	@private
				 *	@since Version 0.1.13
				 */
				error: function (object) {
					try {
						CAP.methods.log(CAP.enums.logLevel.ERROR, object);
					} catch (exception) {
						if (console && console.error) { console.error('CAP: (Logging Error!): ' + object); }
					}
				},

				/**	A warning message to print to the user agent console
				 *	@param	{Object}			object	The Javascript object to log.
				 *	@private
				 *	@since Version 0.1.13
				 */
				warn: function (object) {
					try {
						CAP.methods.log(CAP.enums.logLevel.WARN, object);
					} catch (exception) {
						if (console && console.error) { console.error('CAP: (Logging Warning!): ' + object); }
					}
				},

				/**	A debugging message to print to the user agent console
				 *	@param	{Object}			object	The Javascript object to log.
				 *	@private
				 *	@since Version 0.1.13
				 */
				debug: function (object) {
					try {
						CAP.methods.log(CAP.enums.logLevel.DEBUG, object);
					} catch (exception) {
						if (console && console.error) { console.error('CAP: (Logging Debug!): ' + object); }
					}
				},

				/**	An informative message to print to the user agent console
				 *	@param	{Object}			object	The Javascript object to log.
				 *	@private
				 *	@since Version 0.1.13
				 */
				info: function (object) {
					try {
						CAP.methods.log(CAP.enums.logLevel.INFO, object);
					} catch (exception) {
						if (console && console.error) { console.error('CAP: (Logging Info!): ' + object); }
					}
				},

				/**	A verbose message to print to the user agent console
				 *	@param	{Object}			object	The Javascript object to log.
				 *	@private
				 *	@since Version 0.1.13
				 */
				verbose: function (object) {
					try {
						CAP.methods.log(CAP.enums.logLevel.VERBOSE, object);
					} catch (exception) {
						if (console && console.error) { console.error('CAP: (Logging Verbose!): ' + object); }
					}
				},

				/**	Increases the logging level and prints
				 *	the logging level to the console.
				 *	@example	CAP.methods.increaseLogLevel();
				 *	@public
				 *	@since Version 0.1.0
				 */
				increaseLogLevel :	function () {
					try {
						CAP.methods.increaseLogLevel();
					} catch (exception) {
						CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed to increase the logging level:' + exception);
						// We do not need to rethrow as it is not critical
					}
				},

				/**	Decreases the logging level and prints
				 *	the logging level to the console.
				 *	@example	CAP.methods.decreaseLogLevel();
				 *	@public
				 *	@since Version 0.1.0
				 */
				decreaseLogLevel :	function () {
					try {
						CAP.methods.decreaseLogLevel();
					} catch (exception) {
						CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed to decrease the logging level:' + exception);
						// We do not need to rethrow as it is not critical
					}
				},

				/**	Resets the logging level to the default
				 *	warning and error output.  It also prints
				 *	the logging level to the console.
				 *	@example	CAP.methods.resetLogLevel();
				 *	@public
				 *	@since Version 0.1.0
				 */
				resetLogLevel :	function () {
					try {
						CAP.methods.resetLogLevel();
					} catch (exception) {
						CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed to reset the logging level:' + exception);
						// We do not need to rethrow as it is not critical
					}
				},

				/**	Clears the logging level so that
				 *	no logging will be output.  It also prints
				 *	the logging level to the console.
				 *	@example	CAP.methods.clearLogLevel();
				 *	@public
				 *	@since Version 0.1.0
				 */
				clearLogLevel :	function () {
					try {
						CAP.methods.clearLogLevel();
					} catch (exception) {
						CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed to clear the logging level:' + exception);
						// We do not need to rethrow as it is not critical
					}
				}
			},

		brand:	{
				/**	Returns the brand info
				 *	@example	CAP.brand.getBrandInfo();
				 *	@public
				 */
				getBrandInfo : function() {
					return CAP.members.brandInfo;
				}
			},

		validation:
			{
				attachAutoValidation : function(currentWindow) {
					var items = currentWindow.$("[data-validation]");
					items.each(function(index) {
						var validationData = $(this).attr("data-validation").split(",");

						if(validationData.length != 0){	
							//Attach the validation handlers:
							if(validationData[0] === "int" && validationData.length == 3) {
								if(validationData[1] < 0)
									$(this).numeric({allow:"-"});
								$(this).blur(function() {
									var integerValue = parseInt($(this).val());
									if(integerValue < validationData[1])
										integerValue = validationData[1];
									else
										if(integerValue > validationData[2])
											integerValue = validationData[2];
									
									if(integerValue != parseInt($(this).val()))
										$(this).val(integerValue);
								});
							}
							
							if(validationData[0] === "float" && validationData.length == 3) {
								$(this).numeric({allow:"-."});
								$(this).blur(function() {
									var floatValue = parseFloat($(this).val());
									if(floatValue < validationData[1])
										floatValue = validationData[1];
									else
										if(floatValue > validationData[2])
											floatValue = validationData[2];
									if(parseFloat($(this).val()) != floatValue)
										$(this).val(floatValue);
								});
							}
						}
					});
				}
			},

		language:
			{
				changeLanguage : function () {
					CAP.methods.setLanguage();
				}
			}
	};

}(window));
