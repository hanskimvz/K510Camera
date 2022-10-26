function jqEnableControl(selectObj, isEnable)
{
	selectObj.attr("disabled", isEnable == true ? "" : "disabled");

	var objAttrType = selectObj.attr("type");
	if(objAttrType == "button")
	{
		selectObj.button({ disabled: !isEnable});
	}
	else if(objAttrType == "text" || objAttrType == "password")
	{
		selectObj.css("background-color", isEnable == true ? "#FFFFFF" : "#EEEEEE");
	}

	if(selectObj.has(".slider-bar"))
		selectObj.slider("option", "disabled", !isEnable);
}

function jqDisplayCtrl(con, isShow, dpOption)
{
	var display = "block";
	if(dpOption != undefined)
		display = dpOption;

	$(con).css("display", isShow ? display : "none");
}

function preventInput(con)
{
	$(con).bind("paste", function(e){
		e.preventDefault();
	}).keydown(function(e){
		e.preventDefault();
	});
}