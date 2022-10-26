function autoScrollHeight(selector, func)
{
	var h = document.getElementById(selector).scrollHeight;
	if(h > 0)
	{
		document.getElementById(selector).setAttribute('style','height:'+ h +'px');
	}
	func();
}

var strGeneration = function(leng) {
	var chars = "0123456789abcdef";
	var randomstring = '';

	for (var i=0; i<leng; i++)
	{
		var num = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(num,num+1);
	}

	return randomstring;
}

function sleep_js(num){
	var now = new Date();
	var stop = now.getTime() + num;
	while(true)
	{
		now = new Date();
		if(now.getTime() > stop)return;
	}
}

function getTodayDate()
{
	var now = new Date();
	var year= now.getFullYear();
	var mon = (now.getMonth()+1)>9 ? ''+(now.getMonth()+1) : '0'+(now.getMonth()+1);
	var day = now.getDate()>9 ? ''+now.getDate() : '0'+now.getDate();

	return year + mon + day;
}

function checkStringValidation(str, regEx, minLength, maxLength, allowBlank)
{		
	if(allowBlank != null && (!str || g_defregexp.blank.test(str)))
		return allowBlank;
	
	if(minLength != null && str.length<minLength)
		return false;
	
	if(maxLength != null && str.length>maxLength)
		return false;
	
	if(!regEx)
		return false;
	else if(typeof(regEx) == "string")
		regEx = new RegExp(regEx);
	
	return regEx.test(str);
}