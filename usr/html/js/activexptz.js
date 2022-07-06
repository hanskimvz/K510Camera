var AxPTZ = undefined;
var axPTZObjVer = "2,3,7,0";
var axPTZCab = "AxPTZ.cab";

function axPTZObject()
{
	var ver = axPTZObjVer;
	var cab = axPTZCab;
	var objStr = "";
	
	objStr = "<object id='AxPTZ'" + 
			" style='display:none'" +
			" classid='clsid:8F84D714-C51B-4FA0-A541-7EBFAC1315DB'" +
			" codebase='/activex/" + cab + "#version=" + ver + "'></object>";

	if (browserCheck() == "msie") {
		$("body").append(objStr);
	}
}

function axPTZSetup(url, leftPos, topPos)
{
	if(AxPTZ == undefined)
	{
		AxPTZ = $("#AxPTZ")[0];
	}

	if (AxPTZ != undefined)
	{
		AxPTZ.SetParam("url", "none", "value=" + url, 0, 0);
		AxPTZ.SetParam("left", "none", "value=" + leftPos, 0, 0);
		AxPTZ.SetParam("top", "none", "value=" + topPos, 0, 0);	
	}

	return 0;
}

function axPTZShow()
{
	if(AxPTZ != undefined)
	{
		AxPTZ.SetParam("popup", "none", "show=1", 0, 0 );
		return 0;
	}

	return -1;
}

function axPTZHide()
{
	if(AxPTZ != undefined)
	{
		AxPTZ.SetParam("popup", "none", "show=0", 0, 0 );
		return 0;
	}

	return -1
}