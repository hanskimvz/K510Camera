function jqGetXmlData(path, xml, forceLowerCase)
{
	var resultPathXml = $(path, xml);
	if(resultPathXml.size() <= 0)
	{
		//uconlog("[Weblog] xml data does not exist: "+ path);
		return "";
	}

	var str = resultPathXml.text(); 
	var forceLowerCase = (typeof forceLowerCase !== "undefined") ? forceLowerCase : true;
	if(forceLowerCase == true) 
		str = str.toLowerCase();

	return str;
}

function jqGetXmlAttr(path, attrStr, xml, forceLowerCase)
{
	if($(path, xml).size() <= 0) return "";

	var str = $(path, xml).attr(attrStr);
	if(forceLowerCase != false)
	{
		if(typeof str !== "undefined")
			str = str.toLowerCase();
	}

	return str;
}

function iniGetValue(iniContent, fieldName)
{
	var lstLine = iniContent.split("\n");

	for(var i = 0; i < lstLine.length; i++)
	{
		var fieldValue = lstLine[i].split("=");

		if(fieldValue.length == 1) continue;

		if(fieldValue[0] == fieldName)
		{
			return fieldValue[1];
		}
	}

	uconlog("[Weblog] Incorrect data. (" + fieldName + ")");
	return "";
}

function insertNewString(content, insertStr)
{
	return content.split("\n").join(insertStr);
}

function jqSplit(data, delim)
{
	return data.split(delim);
}

function ipv6DomainConvert(dom)
{
	var hostName = dom;
	if($.browser.version.substring(0, 2) == "8." ||
		$.browser.version.substring(0, 2) == "9.")
	{
		hostName = "[" + hostName + "]";
	}

	return hostName;
}

function limitMaxString(id, count)
{
	$(id).keyup(function() {
		var text = $(this).val();
		if(text.length > count)
		{
			$(this).val(text.substr(0,count));
			return false;
		}
		return true;
	});
}