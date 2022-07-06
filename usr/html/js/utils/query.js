function uQueryText(path, func)
{
	var xmlhttp;
	if (window.XMLHttpRequest) // code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	else // code for IE6, IE5
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");

	xmlhttp.onreadystatechange=function() {
		if (xmlhttp.readyState==4 && xmlhttp.status==200)
			func($.trim(xmlhttp.responseText));
		else
			func(null);
	}
	xmlhttp.open("GET", path + "?_=" + (new Date()).getTime(), true);
	xmlhttp.send();
}