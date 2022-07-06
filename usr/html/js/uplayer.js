function uPlayer(viewerId, objectId, version)
{
	this.isReady      = false;
	this.playObject   = null;
	this.callbackFunc = null;
	
	this.width    = 800;
	this.height   = 600;
	this.user     = "";
	this.passwd   = "";
	this.address  = window.location.hostname;
	this.port     = "554";
	this.path     = "ufirststream";
	this.timeout  = "15";
	this.protocol = "tcp";
	this.srtpenable = "no";
	this.srtpmasterkey = "";
	this.srtpsaltkey = "";
	this.srtpprotectprofile = "";
	
	this.init(viewerId, objectId, version);
	if(this.playObject == null)
	{
		return;
	}
}

uPlayer.prototype.log = function(message)
{
	if(window.console)
	{
		console.log(message);
	}
}

uPlayer.prototype.resume = function()
{
	try
	{
		this.playObject.SetParam("CONTROL", "RESUME", "");
	}
	catch(error)
	{
		this.log(error);
	}
}

uPlayer.prototype.pause = function()
{
	try
	{
		this.playObject.SetParam("CONTROL", "PAUSE", "");
	}
	catch(error)
	{
		this.log(error);
	}
}

uPlayer.prototype.fullScreen = function(flag)
{
	try
	{
		this.playObject.SetParam("CONTROL", "FULLSCREEN", flag == true ? "ON" : "OFF");
	}
	catch(error)
	{
		this.log(error);
	}
}

uPlayer.prototype.audioMute = function(flag)
{
	try
	{
		this.playObject.SetParam("CONTROL", "AUDIO", flag == true ? "PLAYBACK_CLOSE" : "PLAYBACK_OPEN");
	}
	catch(error)
	{
		this.log(error);
	}
}

uPlayer.prototype.showProgress = function(flag)
{
	try
	{
		this.playObject.SetParam("CONTROL", "PLAYBACK_PROGRESS", flag == true ? "ON" : "OFF");
	}
	catch(error)
	{
		this.log(error);
	}
}

uPlayer.prototype.setCallbackFunc = function(callbackFunc)
{
	this.callbackFunc = callbackFunc;
}

uPlayer.prototype.setScreenSize = function(width, height)
{
	this.width  = width;
	this.height = height;
	this.playObject.setAttribute("width", this.width);
	this.playObject.setAttribute("height", this.height);
}

uPlayer.prototype.setLoginInfo = function(user, passwd)
{
	this.user   = user;
	this.passwd = passwd;
}

uPlayer.prototype.setProtocol = function(protocol)
{
	this.protocol = protocol;
}

uPlayer.prototype.play = function() 
{
	if(arguments.length > 0)
	{
		var result = this.parseUrl(arguments[0]);
		
		this.address = result.hostname;
		this.port    = result.port;
		this.path    = result.pathname;
		this.log(arguments[0]);
	}
	
	try
	{
		this.stop();
		this.playObject.SetParam("CONFIG", "LOGINID", this.user);
		this.playObject.SetParam("CONFIG", "PASSWD", this.passwd);
		this.playObject.SetParam("CONFIG", "RTSPIP", this.address);
		this.playObject.SetParam("CONFIG", "RTSPPORT", this.port);
		if(this.srtpenable == "yes")
		{
			this.playObject.SetParam("CONFIG", "SRTPMASTERKEY", this.srtpmasterkey);
			this.playObject.SetParam("CONFIG", "SRTPSALTKEY", this.srtpsaltkey);
			this.playObject.SetParam("CONFIG", "SRTPPROFILE", this.srtpprotectprofile);
		}
		this.playObject.SetParam("CONFIG", "SESSIONNAME", this.path);
		this.playObject.SetParam("CONFIG", "CONNECTTIMEOUT", this.timeout);
		this.playObject.SetParam("CONFIG", "SESSION", this.protocol);
		this.playObject.SetParam("CONTROL", "PLAY", "");
	}
	catch(error)
	{
		this.log(error);
	}
}

uPlayer.prototype.stop = function()
{
	try
	{
		if(this.playObject.detachEvent != undefined)
		{
			this.playObject.detachEvent('AxUMFEvent', this.playerCallback);
		}
		this.playObject.SetParam("CONTROL", "STOP", "");	
	}
	catch(error)
	{
		this.log(error);
	}
}

uPlayer.prototype.authElevate = function(address, port)
{
	try
	{
		this.playObject.SetParam("CONTROL", "AUTH_ELEVATE", address + ","+ port);
	}
	catch(error)
	{
		this.log(error);
	}
}

uPlayer.prototype.snapshot = function(file)
{
	try
	{
		this.playObject.SetParam("CONTROL", "SNAPSHOT", "," + file);
	}
	catch(error)
	{
		this.log(error);
	}
}

uPlayer.prototype.save = function(msg)
{
	try
	{
		this.playObject.SetParam("CONTROL", "FAST_AVI_RECORD", msg);
	}
	catch(error)
	{
		this.log(error);
	}
}

uPlayer.prototype.srtpEnable = function(enable)
{
	this.srtpenable = enable;
}

uPlayer.prototype.srtpMasterKey = function(key)
{
	this.srtpmasterkey = key;
}

uPlayer.prototype.srtpSaltKey = function(key)
{
	this.srtpsaltkey = key;
}

uPlayer.prototype.srtpProtectionProfile = function(profile)
{
	this.srtpprotectprofile = profile;
}

/**
 * @brief 
 *  activex 받을 이벤트 콜백함수 이며 사용자 콜백 함수가 등록 되어 있을 경우 이벤트를 전달한다.
 */
uPlayer.prototype.playerCallback = function(type, value)
{
	if(type == "AXUMF_CTRL_READY")
	{
		this.isReady = true;
	}
	if(this.callbackFunc != null)
	{
		this.callbackFunc(type, value);
	}
}

uPlayer.prototype.attachEvent = function()
{
	var handler;
	try
	{
		handler = document.createElement("script");
		handler.setAttribute("for", this.playObject.id);
	}
	catch(ex)
	{
		handler = document.createElement('<script for="' + this.playObject.id + '">');
	}
	handler.event = "AxUMFEvent(type, value)";
	handler.appendChild(document.createTextNode("this.playerClass.playerCallback(type, value);"));
	document.body.appendChild(handler);
}

/**
 * @brief 
 *  activex 사용방법
 *  1. activex에서 사용하는 DLL download 주소를 설정한다.
 *  2. activex에서 사용하는 DLL 버전을 체크하고 다운로드 한다.
 *  3. activex에서 이벤트를 받을 이벤트 콜백함수를 설정한다.
 *  4. activex를 사용할 준비가 되었는지 체크한다.
 */
uPlayer.prototype.init = function(viewerId, objectId, version)
{
	var installUrl = window.location.protocol + "//" + window.location.hostname;
	
	if(window.location.port != null && window.location.port != undefined && window.location.port != "")
	{
		installUrl += ":" + window.location.port;
	}
	installUrl += "/activex/";
	
	viewerObject = document.getElementById(viewerId);
	if(viewerObject != null)
	{
		viewerObject.innerHTML += "<object id='" + objectId + "' classid='clsid:D3BBBE84-3866-4FA1-A4D4-EFA9B9FE611D' codebase='../activex/AxUMF.cab#version=" + version + "'></object>";
		viewerObject.innerHTML += "<script for='" + objectId + "' event='AxUMFEvent(type, value)'> g_player.playerCallback(type, value); </script>";

	}
	
	this.playObject = document.getElementById(objectId);
	try
	{
		ret = this.playObject.SetParam("INSTALL", "DEVICEURL", installUrl);
		if(ret == 0)
		{
			throw "install url error";
		}
		ret = this.playObject.SetParam("INSTALL", "CHECKINSTALL", "");
		if(ret == 0)
		{
			throw "install check error";
		}

		this.playObject.playerClass = this;
		this.attachEvent();
		/*
		if(this.playObject.attachEvent != undefined)
		{
			this.playObject.attachEvent('AxUMFEvent', this.playerCallback); //not ie 11
		}
		else
		{
			this.attachEvent();
		}
		*/
		this.playObject.SetParam("CONTROL", "CHECKREADY", "");
	}
	catch(error)
	{
		this.log(error);
	}
}

uPlayer.prototype.parseUrl = function(url)
{
    var parser = document.createElement('a');
    var searchObject = {};
    var queries;
    var split;
    
    parser.href = url;
    queries = parser.search.replace(/^\?/, '').split('&');
    
    for(i = 0; i < queries.length; i++)
    {
        split = queries[i].split('=');
        searchObject[split[0]] = split[1];
    }
    
    return {
        protocol: parser.protocol,
        host: parser.host,
        hostname: parser.hostname,
        port: parser.port,
        pathname: parser.pathname,
        search: parser.search,
        searchObject: searchObject,
        hash: parser.hash
    };
}

