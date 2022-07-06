/*	This file uses JsDoc Toolkit documentation.
 *	http://code.google.com/p/jsdoc-toolkit/
 */

/**	@fileOverview This file contains the CAP player Javascript Library.
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
	$,
 */
function AttachIE11Event(_strEventId, _functionCallback) 
{
  var paramsFromToStringRegex = /\(\)|\(.+\)/;
  var params = _functionCallback.toString().match(paramsFromToStringRegex)[0];
  //hash function
  var functionName = "IE11WR_" + _functionCallback.toString().split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);a = a&a; return a>>>0;},0);
  window.top[functionName] = _functionCallback;
  functionName = "window.top." + functionName;
  var handler;
  try 
  {
    handler = document.createElement("script");
    handler.setAttribute("for", this.id);
  }
  catch(ex) 
  {
    handler = document.createElement('<script for="' + this.id + '">');
  }
  handler.event = _strEventId + params;
  handler.appendChild(document.createTextNode(functionName + params + ";"));
  this.parentElement.appendChild(handler);
};

(function (CAP, window, $, undefined) {
	'use strict';

	// Check the CAP namespace has been included
	if ((CAP === undefined) ||
			(window === undefined) ||
			($ === undefined)) {
		console.error('CAP.player: Error: You must include the base CAP library and jQuery');
		CAP.player	= undefined;
		return;
	}

	// If CAP.player has already been added don't add it again!
	if (window.CAP.player) {
		return;
	}

	// If the top level window has CAP.player in it use that
	if (window.top.CAP.player) {
		window.CAP.player = window.top.CAP.player;
		return;
	}

	// Local copies of the window objects for speed
	var document	= window.document;
	var navigator	= window.navigator;
	var location	= window.location;

	/**	A local private copy of our player namespace.
	 *	@exports player as CAP.player
	 *	@private
	 *	@since Version 0.1.0
	 */
	var player = {};

	/**	Exceptions that can be used throughout the library.
	 *	<br/><br/>
	 *	They are <code>Object.freeze</code>'ed in the
	 *	<code>player.methods.init()</code> function to prevent
	 *	values being changed.
	 *	<br/><br/>
	 *	@namespace	Private Exceptions
	 *	@private
	 *	@since Version 0.1.2
	 */
	player.exceptions =
	{
		FAIL:				'(CAP.player Exception) Generic failure',
		INVALID_PARAMS:			'(CAP.player Exception) Invalid parameters for function',
		NOT_SETUP:			'(CAP.player Exception) Player is not setup',
		UMFBLOCK_CREATE_FAIL:		'(CAP.player exception) Failed to create UMFBlock',
		UMFBLOCK_CONNECT_ERROR:		'(CAP.player exception) Failed to connect UMFBlocks',
		UMFBLOCK_DISCONNECT_ERROR:	'(CAP.player exception) Failed to disconnect UMFBlocks',
		UMFBLOCK_DESTROY_ERROR:		'(CAP.player exception) Failed to destroy UMFBlock',
		UMFBLOCK_POSITION_ERROR:	'(CAP.player exception) Failed to position UMFBlock',
		REQUEST_DATA_ERROR:		'(CAP.player exception) Failed to request server data from the player',
		PROVIDE_DATA_ERROR:		'(CAP.player exception) Failed to provide server data to the player',
		UPDATE_DATA_ERROR:		'(CAP.player exception) Failed to update server data in the player',
		REVERT_CHANGES_ERROR:		'(CAP.player exception) Failed to revert changes in the player',
		ADD_PROFILE_ERROR:		'(CAP.player exception) Failed to add profile in the player',
		DELETE_PROFILE_ERROR:		'(CAP.player exception) Failed to delete profile in the player',
		SET_PROFILE_ERROR:		'(CAP.player exception) Failed to set profile in the player',
		SET_PRESET_ERROR:		'(CAP.player exception) Failed to set preset in the player',
		SET_CALIBRATION_PARAMS_ERROR:	'(CAP.player exception) Failed to set calibration parameters',
		ENABLE_VIEW_UI_ERROR:		'(CAP.player exception) Failed to enable view user interface',
		ENABLE_CONFIG_UI_ERROR:		'(CAP.player exception) Failed to enable configuration user interface',
		ENABLE_CALIB_UI_ERROR:		'(CAP.player exception) Failed to enable calibration user interface',
		ENABLE_TAMPER_UI_ERROR:		'(CAP.player exception) Failed to enable tamper user interface',
		ENABLE_SCENE_CHANGE_UI_ERROR:	'(CAP.player exception) Failed to enable scene change user interface',
		PAUSE_VIDEO_ERROR:		'(CAP.player exception) Failed to pause video',
		PLAY_VIDEO_ERROR:		'(CAP.player exception) Failed to play video',
		PAUSE_METADATA_ERROR:		'(CAP.player exception) Failed to pause metadata',
		PLAY_METADATA_ERROR:		'(CAP.player exception) Failed to play metadata',
		RESTORE_DEFAULTS_ZRC_ERROR:	'(CAP.player exception) Failed to restore Zones, Rules and Counters defaults',
	};

	/**	Private elements
	 *	@namespace	Private elements
	 *	@private
	 *	@since Version 0.1.0
	 */
	player.elements = {
		containerElem: undefined,
		installDiv: undefined,
		errorDiv: undefined,
		playerDiv: undefined,
		player: undefined,
		initialized: false
	};
			
	/**	Private members
	 *	@namespace	Private members
	 *	@private
	 */
	player.members =
	{
		/**	Configuration of UMFBlocks on the page
		 *	@private
		 *	@since Version 0.1.0
		 */
		UMFBlockConfig: undefined,
		/**	True after player is configured.
		 *	@private
		 */
		IsReady: false,
	};

	/**	Private event handlers
	 *	@namespace	Private event handlers
	 *	@private
	 */
	player.eventCallback =
	{
		/**	Handler for AxUMFEvent
		 *	@private
		 */
		OnAxUMFEvent: function (szType, szValue) 
		{
			if(szType == "AXUMF_CTRL_READY")
			{
				CAP.player.playerConfig();
				CAP.player.playerStart();
			}
			else
			if(szType == "AXUMF_FRAME_READY")
			{
				if(player.members.UMFBlockConfig !== undefined && 'function' === typeof (player.members.UMFBlockConfig))
					player.members.UMFBlockConfig();
				player.members.IsReady = true;
				$(window.top).trigger('capPlayerReady');
			}
		},

		/**	Handler for capPlayerSetup
		 *	Container configuration done. Start the frame
		 *	@private
		 */
		OnCapPlayerSetup: function () 
		{
			if(player.elements.player === player.elements.playerDiv)
				player.elements.player.SetParam("CONTROL", "PLAY", "");
		},
	};

	player.methods = 
	{
		init: function() {
			try {
				CAP.logging.verbose('Initialising CAP.player...');

				if (!CAP.ajax.serverDataLoaded()) {
					$(window.top).bind('capServerDataLoaded', player.methods.init);
					CAP.logging.info('Server data not loaded.  CAP.player initialization is waiting for \'capServerDataLoaded\' event');
					return;
				}

				if ('function' === typeof (Object.freeze)) {
					Object.freeze(player.exceptions);
				}

				// Create the ActiveX control:
				CAP.player.createPlayerElement();

				player.elements.initialized = true;
				$(window.top).trigger('capPlayerInitialized');

				CAP.logging.info('CAP.player initialisation...DONE!');
			} catch (exception) {
				CAP.logging.error('CAP.player Initialisation...FAILED: ' + exception);
				return;
			}
		},
	}	

	/**	The player namespace is for controlling the player content of the 
	 *	CAP software.
	 *	@namespace		The player namespace is for controlling the player content of the 
	 *					CAP software.
	 *	@version 0.1.5
	 */
	CAP.player =
		{

			initialized : function() {
				return player.elements.initialized;
			},

			isSetup : function() {
				return (window.ActiveXObject !== undefined &&
					player.elements.player !== undefined &&
					player.elements.player === player.elements.playerDiv);
			},

			isReady : function() {
				return player.members.IsReady;
			},

			createPlayerElement: function() {
				var playerDiv = undefined;
				if(window.ActiveXObject !== undefined)
				{
					// Create an install division element
					player.elements.installDiv	= document.createElement('div');
					player.elements.installDiv.innerText = "Error: Viewing/Configuration utility not installed. Resolve this by going to the ";
					var link = document.createElement('a');
					link.setAttribute('target', '_parent');
					link.setAttribute('href', '/viewer/main.html');
					link.innerText = "Live Page.";
					player.elements.installDiv.appendChild(link);

					// Create an error division element
					player.elements.errorDiv = document.createElement('div');
					player.elements.errorDiv.innerText = "There was an error initializing the activeX.";

					player.elements.installDiv.style.width		= player.elements.errorDiv.style.width		= '280px';
					player.elements.installDiv.style.border		= player.elements.errorDiv.style.border		= '2px solid red';
					player.elements.installDiv.style.padding	= player.elements.errorDiv.style.padding	= '10px';
					player.elements.installDiv.style.margin		= player.elements.errorDiv.style.margin		= 'auto';

					player.elements.playerDiv = document.createElement("object");
					player.elements.playerDiv.setAttribute("id", "player");
					player.elements.playerDiv.setAttribute("classid", "clsid:D3BBBE84-3866-4FA1-A4D4-EFA9B9FE611D");
					player.elements.playerDiv.setAttribute("codebase", "/activex/AxUMF.cab#version=" + player_version);
					player.elements.playerDiv.setAttribute("width", "100%");
					player.elements.playerDiv.setAttribute("height", "100%");

					player.elements.player = player.elements.playerDiv;
					// Create attachEvent for IE11
					if(player.elements.player.attachEvent == undefined)
						player.elements.player.attachEvent = AttachIE11Event;
				}
				else
				{
					// ActiveX not Supported
					player.elements.installDiv = document.createElement('div');
					player.elements.errorDiv = document.createElement('div');
		
					player.elements.playerDiv = document.createElement('div');
					player.elements.playerDiv.innerHTML = player.elements.playerDiv.innerText = "VCA configuration requires the use of an activeX object. Please use Internet Explorer.";
					
					player.elements.playerDiv.style.width		= '280px';
					player.elements.playerDiv.style.border		= '2px solid red';
					player.elements.playerDiv.style.padding		= '10px';
					player.elements.playerDiv.style.margin		= 'auto';

					player.elements.player = player.elements.playerDiv;
				}
			},

			adoptPlayerElements: function() {
				if(document.adoptNode && 
					(!($.browser.msie && parseFloat($.browser.version, 10) >= 10.0)) &&//Detect IE10
					!(window.ActiveXObject !== undefined && "ActiveXObject" in window))//Detect IE11
				{
					document.adoptNode(player.elements.playerDiv);
					document.adoptNode(player.elements.installDiv);
					document.adoptNode(player.elements.errorDiv);
					player.elements.player = player.elements.playerDiv;
					player.elements.errorDiv.innerText = "There was an error initializing the activeX.";
				}
				else
				{
					CAP.player.createPlayerElement();
				}
			},

			setupPlayer: function (successCallback) {
				if(player.elements.player === player.elements.errorDiv ||
				   player.elements.player === player.elements.installDiv)
					return;

				if(CAP.ajax.getServerData("ENCODER.Ch0.Videocodec.St0.enable") !== "yes")
				{
					player.elements.errorDiv.innerText = "VCA can only be configured when the First Stream is enabled.";
					player.elements.player = player.elements.errorDiv;
					CAP.player.updateContainer();
					return;
				}

				//Check installation
				var httpPort = CAP.ajax.getServerData('NETWORK.Http.port');
				var szURL = "http://" + document.domain + ":" + httpPort + "/activex/";
				try{
					player.elements.player.SetParam("INSTALL", "DEVICEURL", szURL);
				} catch(e)
				{
					player.elements.player = player.elements.installDiv;
					CAP.player.updateContainer();
					return;
				}
				if(0 == player.elements.player.SetParam("INSTALL", "CHECKINSTALL", ""))
				{
					player.elements.player = player.elements.installDiv;
					CAP.player.updateContainer();
					return;
				}

				player.members.UMFBlockConfig = successCallback;

				CAP.player.attachEvent(player.eventCallback.OnAxUMFEvent);

				player.elements.player.SetParam("CONTROL", "CHECKREADY", "");
			},

			/**	Configures the RTSP source
			 *	@private
			 */
			playerConfig: function () {
				//Login in the activeX
				if(0 == player.elements.player.SetParam("CONFIG", "LOGINID", PLAYER_UST))
				{
					player.elements.player = player.elements.errorDiv;
					CAP.player.updateContainer();
					return;
				}
				if(0 == player.elements.player.SetParam("CONFIG", "PASSWD", PLAYER_PST))
				{
					player.elements.player = player.elements.errorDiv;
					CAP.player.updateContainer();
					return;
				}

				//Setup the RTSP Uri
				if(0 == player.elements.player.SetParam("CONFIG", "RTSPIP", document.domain))
				{
					player.elements.player = player.elements.errorDiv;
					CAP.player.updateContainer();
					return;
				}

				var rtspPort = CAP.ajax.getServerData('NETWORK.Rtsp.port');
				if(0 == player.elements.player.SetParam("CONFIG", "RTSPPORT", rtspPort))
				{
					player.elements.player = player.elements.errorDiv;
					CAP.player.updateContainer();
					return;
				}

				var srtpEnable = CAP.ajax.getServerData("NETWORK.Srtp.enable");
				if(srtpEnable == "yes")
				{
					var srtpProfile = CAP.ajax.getServerData("NETWORK.Srtp.protectionprofile");
					if(0 == player.elements.player.SetParam("CONFIG", "SRTPPROFILE", srtpProfile))
					{
						player.elements.player = player.elements.errorDiv;
						CAP.player.updateContainer();
						return;
					}

					var srtpMasterkey = CAP.ajax.getServerData("NETWORK.Srtp.key.master");
					if(0 == player.elements.player.SetParam("CONFIG", "SRTPMASTERKEY", srtpMasterkey))
					{
						player.elements.player = player.elements.errorDiv;
						CAP.player.updateContainer();
						return;
					}

					var srtpSaltkey = CAP.ajax.getServerData("NETWORK.Srtp.key.salt");
					if(0 == player.elements.player.SetParam("CONFIG", "SRTPSALTKEY", srtpSaltkey))
					{
						player.elements.player = player.elements.errorDiv;
						CAP.player.updateContainer();
						return;
					}
				}
			},

			/**	Configures the stream and starts the player
			 *	@private
			 */
			playerStart: function () {
				var sessionType = "tcp";
				if(CAP.ajax.getServerData("NETWORK.Rtp.St0.Unicast.enable") === "yes")
					var sessionName = CAP.ajax.getServerData("NETWORK.Rtp.St0.Unicast.name");
				else if(CAP.ajax.getServerData("NETWORK.Rtp.St0.Multicast.enable") === "yes")
				{
					var sessionName = CAP.ajax.getServerData("NETWORK.Rtp.St0.Multicast.name");
					sessionType = "multicast";
				}
				else if(CAP.ajax.getServerData("NETWORK.Rtp.St1.Unicast.enable") === "yes")
					var sessionName = CAP.ajax.getServerData("NETWORK.Rtp.St1.Unicast.name");
				else if(CAP.ajax.getServerData("NETWORK.Rtp.St1.Multicast.enable") === "yes")
				{
					var sessionName = CAP.ajax.getServerData("NETWORK.Rtp.St1.Multicast.name");
					sessionType = "multicast";
				}

				if(0 == player.elements.player.SetParam("CONFIG", "SESSIONNAME", sessionName))
				{
					player.elements.player = player.elements.errorDiv;
					CAP.player.updateContainer();
					return;
				}
				
				if(0 == player.elements.player.SetParam("CONFIG", "SESSION", sessionType))
				{
					player.elements.player = player.elements.errorDiv;
					CAP.player.updateContainer();
					return;
				}

				if(0 == player.elements.player.SetParam("CONFIG", "NVVIEW", "UMFBlockContainer.dll"))
				{
					player.elements.player = player.elements.errorDiv;
					CAP.player.updateContainer();
					return;
				}

				//Language set
				var environmentReq = new CGIRequest();
				var environmentReqQString = "";
				environmentReq.SetAddress("/environment.xml");
				environmentReq.SetCallBackFunc( function(xml){
					var revLang = "/language/base/English.xml";
		  
					var httpPortNum = ( "" == window.location.port ) ? 80 : window.location.port;
					var urlAxLang = "http://" + document.domain + ":" + httpPortNum + "/language/AxEnglish.xml";

					if($('lang', xml).size() > 0)
					{
						revLang = $('lang', xml).text();
						var language = revLang.split( /\/|\./ )[2];
		    
						if ( "xml" == language )
							language = revLang.split( /\/|\./ )[1];
		      
						urlAxLang = "http://" + document.domain + ":" + httpPortNum + "/language/Ax" + language + ".xml";
					}

					player.elements.player.SetParam("CONTROL", "LANGUAGE", urlAxLang );

					$(window.top).trigger('capPlayerSetup');
				});
				environmentReq.Request(environmentReqQString);
			},

			updateContainer: function () {
				if(typeof(player.elements.containerElem) !== 'object') {
					CAP.logging.error('PLAYER: Failed to updateContainer: Container element not set.');
					return;
				}

				if (document.adoptNode) {
					//JL: We need to adopt node to change the element ownership when moving 
					//across iframe DOMs, or a DOMException.WRONG_DOCUMENT_ERR exception is thrown.
					if(player.elements.containerElem.hasChildNodes())
						player.elements.containerElem.replaceChild(document.adoptNode(player.elements.player), player.elements.containerElem.firstChild);
					else
						player.elements.containerElem.appendChild(document.adoptNode(player.elements.player));
				} else {
					/* Shitty IE7 and IE8 only have DOM Level 1 support
					 * so we need a work around.
					 */
					if(player.elements.containerElem.hasChildNodes())
						player.elements.containerElem.replaceChild(player.elements.player, player.elements.containerElem.firstChild);
					else
						player.elements.containerElem.appendChild(player.elements.player);
				}
				
			},

			addPlayer: function (element, successCallback) {
				try {
					if (typeof (element) !== 'object') {
						throw CAP.exception.INVALID_PARAMS;
					}

					player.elements.containerElem = element;
					if(window.ActiveXObject === undefined)
					{
						CAP.player.adoptPlayerElements();
						CAP.player.updateContainer();
					}
					else if(typeof (player.elements.player) === 'object') {
						CAP.player.adoptPlayerElements();
						CAP.player.updateContainer();

						top.$(window.top).bind('capPlayerSetup', player.eventCallback.OnCapPlayerSetup);

						CAP.player.setupPlayer(successCallback);
					} else {
						CAP.logging.warn('PLAYER: No player to add.');
					}
				} catch (exception) {
					CAP.logging.error('PLAYER: Failed to add player: ' + exception);
					throw exception;
				}
			},

			removePlayer: function (element) {
				try {
					if (typeof (element) !== 'object') {
						throw CAP.exception.INVALID_PARAMS;
					}

					if(typeof (player.elements.player) === 'object') {
						top.$(window.top).unbind('capPlayerSetup', player.eventCallback.OnCapPlayerSetup);

						player.elements.containerElem.removeChild(player.elements.player);
						if(CAP.player.isSetup()) {
							var ret = player.elements.player.SetParam("CONTROL", "STOP", "");
							CAP.player.detachEvent(player.eventCallback.OnAxUMFEvent);
							player.members.IsReady = false;
						}
						/* Work around for IE7 and IE8 */
						if (!document.adoptNode) {
							/* Remove the current player and create it again! */
							delete player.elements.playerDiv;
						}
					} else {
						CAP.logging.warn('PLAYER: No player to remove.');
					}
				} catch (exception) {
					CAP.logging.error('PLAYER: Failed to remove player: ' + exception);
					throw exception;
				}
			},

			attachEvent: function(callback)
			{
				if(player.elements.player.attachEvent !== undefined)
					player.elements.player.attachEvent('AxUMFEvent', callback);
			},

			detachEvent: function(callback)
			{
				if(player.elements.player.detachEvent !== undefined)
					player.elements.player.detachEvent('AxUMFEvent', callback);
			},

			initUMFBlockContainer: function () {
				if(!CAP.player.isSetup())
					throw player.exceptions.NOT_SETUP;
				return player.elements.player.SetParam("CONTROL", "CHANGENVVIEW", "1");
			},

			createUMFBlock: function (blockDescrition) {
				if(!CAP.player.isSetup())
					throw player.exceptions.NOT_SETUP;
				var handle = player.elements.player.SetParam("CONTROL", "CREATE_UMFBLOCK", blockDescrition);
				if(handle < 0)
					throw player.exceptions.UMFBLOCK_CREATE_ERROR;
				return handle;
			},

			createVCADataManagerBlock: function () {
				if(!CAP.player.isSetup())
					throw player.exceptions.NOT_SETUP;
				return CAP.player.createUMFBlock("VCADataManagerBlock, VCADataManagerBlock.dll");
			},

			createAVDecoderBlock: function () {
				if(!CAP.player.isSetup())
					throw player.exceptions.NOT_SETUP;
				return CAP.player.createUMFBlock("AVDecoderBlock, AVDecoderBlock.dll");
			},

			createVCADialogBlock: function () {
				if(!CAP.player.isSetup())
					throw player.exceptions.NOT_SETUP;
				return CAP.player.createUMFBlock("VCADialogBlock, VCADialogBlock.dll");
			},

			createRenderBlock: function () {
				if(!CAP.player.isSetup())
					return -1;
				return CAP.player.createUMFBlock("RenderBlock, RenderBlock.dll");
			},

			createVCAAlarmLogBlock: function () {
				if(!CAP.player.isSetup())
					throw player.exceptions.NOT_SETUP;
				return CAP.player.createUMFBlock("VCAAlarmLogBlock, VCAAlarmLogBlock.dll");
			},

			createVCAZoneTreeBlock: function () {
				if(!CAP.player.isSetup())
					throw player.exceptions.NOT_SETUP;
				return CAP.player.createUMFBlock("VCAZoneTreeBlock, VCAZoneTreeBlock.dll");
			},

			connectUMFBlocks: function (handle1, handle2, connectionDescription) {
				if(!CAP.player.isSetup())
					throw player.exceptions.NOT_SETUP;
				var handle = player.elements.player.SetParam("CONTROL", "CONNECT_UMFBLOCKS", handle1 + ", " + handle2 + ", " + connectionDescription);
				if(handle < 0)
					throw player.exceptions.UMFBLOCK_CONNECT_ERROR;
				return handle;
			},

			disconnectUMFBlocks: function (handle1, handle2, connectionDescription) {
				if(!CAP.player.isSetup())
					throw player.exceptions.NOT_SETUP;
				var handle = player.elements.player.SetParam("CONTROL", "DISCONNECT_UMFBLOCKS", handle1 + ", " + handle2 + ", " + connectionDescription);
				if(handle < 0)
					throw player.exceptions.UMFBLOCK_DISCONNECT_ERROR;
				return handle;
			},

			destroyUMFBlock: function (handle) {
				if(!CAP.player.isSetup())
					throw player.exceptions.NOT_SETUP;
				handle = player.elements.player.SetParam("CONTROL", "DESTROY_UMFBLOCK", handle);
				if(handle < 0)
					throw player.exceptions.UMFBLOCK_DESTROY_ERROR;
				return handle;
			},

			positionUMFBlock: function (handle, relPosX, relPosY, relWidth, relHeight) {
				if(!CAP.player.isSetup())
					throw player.exceptions.NOT_SETUP;
				handle = player.elements.player.SetParam("CONTROL", "POSITION_UMFBLOCK", handle + ", " + relPosX + ", " + relPosY + ", " + relWidth + ", " + relHeight);
				if(handle < 0)
					throw player.exceptions.UMFBLOCK_POSITION_ERROR;
				return handle;
			},

			requestServerData: function(handle) {
				if(!CAP.player.isSetup())
					throw player.exceptions.NOT_SETUP;
				handle = player.elements.player.SetParam("CONTROL", "REQUEST_UMFBLOCK_DATA", handle);
				if(handle < 0)
					throw player.exceptions.REQUEST_DATA_ERROR;
				return handle;
			},

			provideServerData: function(handle, data) {
				if(!CAP.player.isSetup())
					throw player.exceptions.NOT_SETUP;
				handle = player.elements.player.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", handle + ", DATA=" + data);
				if(handle < 0)
					throw player.exceptions.PROVIDE_DATA_ERROR;
				return handle;
			},

			updateServerData: function(handle, data) {
				if(!CAP.player.isSetup())
					throw player.exceptions.NOT_SETUP;
				handle = player.elements.player.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", handle + ", UPDATE_DATA=" + data);
				if(handle < 0)
					throw player.exceptions.UPDATE_DATA_ERROR;
				return handle;
			},

			revertChanges: function(handle) {
				if(!CAP.player.isSetup())
					throw player.exceptions.NOT_SETUP;
				handle = player.elements.player.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", handle + ", COMMAND=VCA_DM_REVERT_CHANGES");
				if(handle < 0)
					throw player.exceptions.REVERT_CHANGES_ERROR;
				return handle;
			},

			restoreDefaultsZonesRulesCounters: function(handle) {
				if(!CAP.player.isSetup())
					throw player.exceptions.NOT_SETUP;
				handle = player.elements.player.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", handle + ", COMMAND=VCA_DM_RESTORE_DEFAULTS_ZRC");
				if(handle < 0)
					throw player.exceptions.RESTORE_DEFAULTS_ZRC_ERROR;
				return handle;
			},

			addProfile: function(handle, presetId) {
				if(!CAP.player.isSetup())
					throw player.exceptions.NOT_SETUP;
				handle = player.elements.player.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", handle + ", COMMAND=VCA_DM_ADD_PROFILE, PRESETID=" + presetId);
				if(handle < 0)
					throw player.exceptions.ADD_PROFILE_ERROR;
				return handle;
			},

			delProfile: function(handle, presetId) {
				if(!CAP.player.isSetup())
					throw player.exceptions.NOT_SETUP;
				handle = player.elements.player.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", handle + ", COMMAND=VCA_DM_DEL_PROFILE, PRESETID=" + presetId);
				if(handle < 0)
					throw player.exceptions.DELETE_PROFILE_ERROR;
				return handle;
			},

			setProfile: function(handle, presetId, profileId, isGoCommand) {
				if(!CAP.player.isSetup())
					throw player.exceptions.NOT_SETUP;
				var commandString = handle + ", COMMAND=VCA_DM_SET_PROFILE";
				commandString += ", PRESETID=" + presetId;
				commandString += ", PROFILEID=" + profileId;
				if(isGoCommand == true || isGoCommand == undefined)
				{
					commandString += ", ISGOCOMMAND";
				}
				handle = player.elements.player.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", commandString);
				if(handle < 0)
					throw player.exceptions.SET_PROFILE_ERROR;
				return handle;
			},

			setPreset: function(handle, presetId) {
				if(!CAP.player.isSetup())
					throw player.exceptions.NOT_SETUP;
				handle = player.elements.player.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", handle + ", COMMAND=VCA_DM_SET_PRESET, PRESETID=" + presetId);
				if(handle < 0)
					throw player.exceptions.SET_PRESET_ERROR;
				return handle;
			},

			// BW - had to add this special func because web page does not not which profile it's on, especially if
			// the profile has just been added but not yet applied
			setCalibParams: function( handle, calibParams ) {
				if( !CAP.player.isSetup() )
					throw player.exceptions.NOT_SETUP;

				var cmd = handle + ", COMMAND=VCA_DM_SET_CALIBPARAMS";

				if( calibParams.mode )		cmd += ", MODE=" + calibParams.mode;
				if( calibParams.camHeight )	cmd += ", CAMHEIGHT=" + calibParams.camHeight;
				if( calibParams.tiltAngle )	cmd += ", TILTANGLE=" + calibParams.tiltAngle;
				if( calibParams.vFov )		cmd += ", VFOV=" + calibParams.vFov;
				if( calibParams.panAngle )	cmd += ", PANANGLE=" + calibParams.panAngle;
				if( calibParams.rollAngle )	cmd += ", ROLLANGLE=" + calibParams.rollAngle;
				if( calibParams.status )	cmd += ", STATUS=" + calibParams.status;

				handle = player.elements.player.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", cmd);

				if( handle < 0 )
					throw player.exceptions.SET_CALIBRATION_PARAMS_ERROR;

				return handle;
			},

			enableViewUI: function(handle) {
				if(!CAP.player.isSetup())
					throw player.exceptions.NOT_SETUP;
				handle = player.elements.player.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", handle + ", UI=VCA_UI_MODE_VIEW");
				if(handle < 0)
					throw player.exceptions.ENABLE_VIEW_UI_ERROR;
				return handle;
			},

			enableConfigurationUI: function(handle) {
				if(!CAP.player.isSetup())
					throw player.exceptions.NOT_SETUP;
				handle = player.elements.player.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", handle + ", UI=VCA_UI_MODE_CONFIGURATION");
				if(handle < 0)
					throw player.exceptions.ENABLE_CONFIG_UI_ERROR;
				return handle;
			},

			enableCalibrationUI: function(handle) {
				if(!CAP.player.isSetup())
					throw player.exceptions.NOT_SETUP;
				handle = player.elements.player.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", handle + ", UI=VCA_UI_MODE_CALIBRATION");
				if(handle < 0)
					throw player.exceptions.ENABLE_CALIB_UI_ERROR;
				return handle;
			},

			enableTamperUI: function(handle) {
				if(!CAP.player.isSetup())
					throw player.exceptions.NOT_SETUP;
				handle = player.elements.player.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", handle + ", UI=VCA_UI_MODE_TAMPER");
				if(handle < 0)
					throw player.exceptions.ENABLE_TAMPER_UI_ERROR;
				return handle;
			},

			enableSceneChgUI: function(handle) {
				if(!CAP.player.isSetup())
					throw player.exceptions.NOT_SETUP;
				handle = player.elements.player.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", handle + ", UI=VCA_UI_MODE_SCENE_CHG");
				if(handle < 0)
					throw player.exceptions.ENABLE_SCENE_CHANGE_UI_ERROR;
				return handle;
			},

			pauseVideo: function(handle) {
				if(!CAP.player.isSetup())
					throw player.exceptions.NOT_SETUP;
				handle = player.elements.player.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", handle + ", VIDEO_CONTROL=VCA_PAUSE");
				if(handle < 0)
					throw player.exceptions.PAUSE_VIDEO_ERROR;
				return handle;
			},

			playVideo: function(handle) {
				if(!CAP.player.isSetup())
					throw player.exceptions.NOT_SETUP;
				handle = player.elements.player.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", handle + ", VIDEO_CONTROL=VCA_PLAY");
				if(handle < 0)
					throw player.exceptions.PLAY_VIDEO_ERROR;
				return handle;
			},

			pauseMetaData: function(handle) {
				if(!CAP.player.isSetup())
					throw player.exceptions.NOT_SETUP;
				handle = player.elements.player.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", handle + ", METADATA_CONTROL=VCA_PAUSE");
				if(handle < 0)
					throw player.exceptions.PAUSE_METADATA_ERROR;
				return handle;
			},

			playMetaData: function(handle) {
				if(!CAP.player.isSetup())
					throw player.exceptions.NOT_SETUP;
				handle = player.elements.player.SetParam("CONTROL", "PROVIDE_UMFBLOCK_DATA", handle + ", METADATA_CONTROL=VCA_PLAY");
				if(handle < 0)
					throw player.exceptions.PLAY_METADATA_ERROR;
				return handle;
			},
		};
	// Initialise the namespace when the DOM loads
	$(document).ready(player.methods.init);
}(CAP, window, $));
