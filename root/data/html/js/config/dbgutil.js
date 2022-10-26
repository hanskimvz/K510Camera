

$(function () {
	Run();
});

function Run()
{
	$("button").button();
	InitThemes();
	EventBind();
	ContentShow();
	
}

function EventBind()
{
	$("#btnApply").click(function() {
		var query = $("input[name='query']:checked:radio").val();
		var paramGroup = $("#paramListGroup").val();
		var sendquery = "";

		if(query == "telnet_yes" || query == "telnet_no")
		{
			query = (query == "telnet_yes") ? "yes" : "no";
			sendquery = "/uapi-cgi/param.cgi?action=update&group=network.telnet&enable=" + query + "&_=" + (new Date()).getTime();
		}
		else if(query == "oem_yes" || query == "oem_no")
		{
			query = (query == "oem_yes") ? "yes" : "no";
			sendquery = "/uapi-cgi/oem.cgi?action=set&enable=" + query + "&_=" + (new Date()).getTime();
		}
		else if(query == "list")
		{
			if(paramGroup != "")
				paramGroup = ("&group=" + paramGroup);

			sendquery = "/uapi-cgi/param.cgi?action=list" + paramGroup + "&_=" + (new Date()).getTime();
		}
		else if(query == "query")
		{
			if(paramGroup != "")
				paramGroup = ("&group=" + paramGroup);

			sendquery = "/uapi-cgi/param.cgi?action=query" + paramGroup + "&_=" + (new Date()).getTime();
		}


		$("#sendquery").text(sendquery);
		$.get(sendquery, function(data){
			$("#result").text(data);
		});
		
	});
}
