var initFormUI = function(data)
{
	for(var i=0; i<data.dataArray.length; i++)
	{
		var groupObj = $("#" + data.dataArray[i].group);
		var groupType = groupObj.attr("type");

		if(groupType == undefined)
		{
			var inputGroupObj = $("input[name='" + data.dataArray[i].group + "']");
			var selectorCount = inputGroupObj.size();

			if(selectorCount > 0)
			{
				var inputGroupType = inputGroupObj.attr("type");
				if(inputGroupType == "radio")
					$("input[name='" + data.dataArray[i].group + "'][value='" + data.dataArray[i].val + "']:radio").attr("checked", "checked");
			}
		}

		if(groupType == "checkbox")
			groupObj.attr("checked", data.dataArray[i].val == "yes" ? "checked" : "");
		else
			groupObj.val(data.dataArray[i].val);
	}
}
