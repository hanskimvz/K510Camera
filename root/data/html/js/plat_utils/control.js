function isValidUsageRange(usedCount)
{
	if(usedCount < 0 || usedCount > 100)
	{
		return false;
	}

	return true;
}

function getCurAddress()
{
	hostName = window.location.hostname;
	if(isIPV6() == true)
	{
		if($.browser.version.substring(0, 2) == "8." ||
			$.browser.version.substring(0, 2) == "9.")
		{
			hostName = "[" + hostName + "]";
		}
	}
	return hostName;
}

function getCurPort()
{
	var httpProtocol = window.location.protocol;
	var httpPort = 80;
	if(httpProtocol == "http:")
	{
		if(window.location.port == "" || window.location.port == 80)
			httpPort = 80;
		else
			httpPort = window.location.port;
	}
	else if(httpProtocol == "https:")
	{
		if(window.location.port == "" || window.location.port == 443)
			httpPort = 443;
		else
			httpPort = window.location.port;
	}

	return httpPort;
}