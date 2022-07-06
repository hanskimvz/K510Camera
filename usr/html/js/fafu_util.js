
function fafu_IsExit(str)
{
	try
	{
		var object = eval(str);

		if(typeof(object) == "undefined")
		{
			return false;
		}
		else
		{
			return true;
		}
	}
	catch(e)
	{
		return false;
	}
}

function fafu_strtoupper(str)
{
	var tmpChar = "";
	var convStr = "";

	for (var i = 0; i < str.length; i++)
	{
		tmpChar = str.charAt(i).toUpperCase();
		convStr += tmpChar;
	}
	
	return convStr;
}

function fafu_strtolower(str)
{
	var tmpChar = "";
	var convStr = "";

	for (var i = 0; i < str.length; i++)
	{
		tmpChar = str.charAt(i).toLowerCase();
		convStr += tmpChar;
	}
	
	return convStr;
}