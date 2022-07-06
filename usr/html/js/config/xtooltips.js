//XSToolTip
function xstooltip_findPosX(obj,w)
{
	var curleft = 0;
	if (w)
		curleft = obj.offsetWidth;
	if (obj.offsetParent)
	{
		while (obj.offsetParent)
		{
			curleft += obj.offsetLeft;
			obj = obj.offsetParent;
		}
	}
	else if (obj.x)
		curleft += obj.x;
	return curleft;
}

function xstooltip_findPosY(obj,h)
{
	var curtop = 0;
	if (h) curtop = obj.offsetHeight;

	if (obj.offsetParent)
	{
		while (obj.offsetParent)
		{
			curtop += obj.offsetTop
			obj = obj.offsetParent;
		}
	}
	else if (obj.y)
		curtop += obj.y;
	return curtop;
}

function xtooltip_show(tooltipId, parentId, posX, posY)
{
	it = document.getElementById(tooltipId);

	if (it.style.first)
	{
		it.style.first = 0;
		// need to fixate default size (MSIE problem)
		it.style.width = it.offsetWidth + 'px';
		it.style.height = it.offsetHeight + 'px';
	}

	{
		img = document.getElementById(parentId);

		// if tooltip is too wide, shift left to be within parent
		//if (posX + it.offsetWidth > img.offsetWidth) posX = img.offsetWidth - it.offsetWidth;
		//if (posX < 0 ) posX = 0;

		var x = xstooltip_findPosX(img,1) + posX;
		var y = xstooltip_findPosY(img,0) + posY;

		it.style.top = y + 'px';
		it.style.left = x + 'px';
	}

	it.style.visibility = 'visible';
}

function xtooltip_hide(tooltipId)
{
	it = document.getElementById(tooltipId);
	it.style.visibility = 'hidden';
}
