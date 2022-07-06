
var g_defaultGroup = "IPFILTER";
var AllowListWeb;
var DenyListWeb;

$(function () {
	PreCustomize();
	initEnvironment();
	LoadParamJs(g_defaultGroup, mainRun);
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum = ["04041117", "04041118", "04041119", "0501", "04041120", "04041122"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "ipfiltering", 
				parent.g_langData[parent.g_configData.language]);
}

function mainRun()
{
	InitForm();
	SetRelation();
	InitSetting();
	EventBind();
	ContentShow();
	PostCustomize();
}

function InitForm()
{
	var testString;
	var $allFormAllow = $("#formIPfilterAllowtext:text"); 
	var $allFormBlock = $("#formIPfilterBlocktext:text");
	
	
	$("#user_form_allow").dialog({
		autoOpen: false,
		width: 400,
		modal: true,
		resizable: false,
		open: function() {
		},
		close: function() {
			$allFormAllow.removeClass('ui-state-error'); 
			$allFormAllow.val(""); 
			$("#msg_status_allow").removeClass('ui-state-highlight'); 

			ResizePage();
		}
	});
}

function InitSetting()
{
	var group = g_defaultGroup;

	AllowListWeb = eval(group + "_ALLOWLIST_FILTER");
	DenyListWeb = eval(group + "_DENYLIST_FILTER");

	RefreshEnableIPAddressfiltering();
	RefreshAlwaysAllowPingRequest();
	RefreshAllowAdminIP();
	RefreshFilteredIPAddresses();
}

function RefreshEnableIPAddressfiltering() {
	var getDBval
	var group = g_defaultGroup;

	getDBval = eval(group + "_ENABLE");

	if(getDBval == "yes")
	{
		$("#IPFilteringEnable:checkbox").attr("checked", "checked");
	}
	else
	{
		$("#IPFilteringEnable:checkbox").attr("checked", "");
	}	
}

function RefreshAlwaysAllowPingRequest() {
	var getDBval
	var group = g_defaultGroup;
	
	getDBval = eval(group + "_ALWAYSALLOWICMP");

	if(getDBval == "yes")
	{
		$("#AlwaysAllowPing:checkbox").attr("checked", "checked");
	}
	else
	{
		$("#AlwaysAllowPing:checkbox").attr("checked", "");
	}	
}

function RefreshAllowAdminIP() {
	var getDBval
	var group = g_defaultGroup;
	
	getDBval = eval(group + "_ADMINIP");
	if(getDBval == "")
	{
		getDBval = "...";
	}
	var szIP = getDBval.split(".");
	$("#AllowadminIP .ip_octet:eq(0)").val(szIP[0]);
	$("#AllowadminIP .ip_octet:eq(1)").val(szIP[1]);
	$("#AllowadminIP .ip_octet:eq(2)").val(szIP[2]);
	$("#AllowadminIP .ip_octet:eq(3)").val(szIP[3]);
}

function RefreshFilteredIPAddresses() {
	var getDBval
	var group = g_defaultGroup;
	
	getDBval = eval(group + "_TYPE");
	
	$("input[name='formIPFilterAllowDeny']" +
		"[value='" + getDBval + "']:radio")
			.attr("checked", "checked");
	
	if (getDBval == "allow") 
	{
		RefreshIPAllowSetting();
	}
	else
	{
		RefreshIPDenySetting();
	}
}

function RefreshIPAllowSetting() {
	var getDBval
	var group = g_defaultGroup;
	var result
	var resultlength

	getDBval = eval(group + "_ALLOWLIST_FILTER");

	result = getDBval.split(",");
	resultlength = result.length;

	$("select#formIPAddressList:").empty()
	
	if (resultlength == 1)
	{
		if (result[0] == "")
		{
		}
		else
		{
			for (var i = 0; i < resultlength; i++)
			{
				$("select#formIPAddressList").append("<option>"+ result[i] +"</option>")
			}
		}
	}
	else
	{
		for (var i = 0; i < resultlength; i++)
		{
			$("select#formIPAddressList").append("<option>"+ result[i] +"</option>")
		}
	}
}

function RefreshIPDenySetting() {
	var getDBval
	var group = g_defaultGroup;
	var result
	var resultlength
	
	getDBval = eval(group + "_DENYLIST_FILTER");
	
	result = getDBval.split(",");
	resultlength = result.length;

	$("select#formIPAddressList:").empty()
	
	if (resultlength == 1)
	{
		if (result[0] == "")
		{
		}
		else
		{
			for (var i = 0; i < resultlength; i++)
			{
				$("select#formIPAddressList").append("<option>"+ result[i] +"</option>")
			}
		}
	}
	else
	{
		for (var i = 0; i < resultlength; i++)
		{
			$("select#formIPAddressList").append("<option>"+ result[i] +"</option>")
		}
	}
}

function ShowWebIPAllowList() {
	var result
	var resultlength
	var AllowListWebCopy = AllowListWeb;
	result = AllowListWebCopy.split(",");
	resultlength = result.length;
	
	$("select#formIPAddressList:").empty()
	
	if (resultlength == 1)
	{
		if (result[0] == "")
		{
		}
		else
		{
			for (var i = 0; i < resultlength; i++)
			{
				$("select#formIPAddressList").append("<option>"+ result[i] +"</option>")
			}
		}
	}
	else
	{
		for (var i = 0; i < resultlength; i++)
		{
			$("select#formIPAddressList").append("<option>"+ result[i] +"</option>")
		}
	}
}

function ShowWebIPDenyList() {
	var result
	var resultlength
	var DenyListWebCopy = DenyListWeb
	result = DenyListWebCopy.split(",");
	resultlength = result.length;
	
	$("select#formIPAddressList:").empty()
	
	if (resultlength == 1)
	{
		if (result[0] == "")
		{
		}
		else
		{
			for (var i = 0; i < resultlength; i++)
			{
				$("select#formIPAddressList").append("<option>"+ result[i] +"</option>")
			}
		}
	}
	else
	{
		for (var i = 0; i < resultlength; i++)
		{
			$("select#formIPAddressList").append("<option>"+ result[i] +"</option>")
		}
	}
}


function SetRelation()
{
	$("#formAllowadminIP:text").ipaddress();
	$("#AllowadminIP .ip_octet").css("border", "0px");
	
	$("input[name='formIPFilterAllowDeny']").change(function() {	
		var getDBval
		var getWEBval				
		var Req = new CGIRequest();
		var reqQString = "action=update&xmlschema";
		var group = g_defaultGroup;
		
		getWEBval = $("input[name='formIPFilterAllowDeny']:checked:radio").val();
		
		getDBval = eval(group + "_TYPE");
				
		if (getWEBval == "allow")
		{
			ShowWebIPAllowList();
		}	
		else if (getWEBval == "deny")
		{
			ShowWebIPDenyList();
		}
		else
		{
			return;
		}
	});
}

function EventBind()
{
	var Req = new CGIRequest();
	
	$("#btnAddIP").button().click(function() {
		ResizePage(500);
		$("#user_form_allow").dialog("option", "title", GetMsgLang("04041120"));
		$("#user_form_allow").dialog("option", "mode", "add");
		$("#user_form_allow").dialog('open');
		$("#formIPfilterAllowtext:text").focus();
		$("#formIPfilterAllowtext:text").val("");
	});
	
	$("#btnRemoveIP").button().unbind("click").click(function() {
		var getDBval
		var getWebval
		var getWebval2 = $("input[name='formIPFilterAllowDeny']:checked:radio").val();
		var nbrofoption
		var result
		var group = g_defaultGroup;
		var arrayOfIPList
		
		if($("#formIPAddressList").val() == null)
		{
			alert(GetMsgLang("04041117"));
			return false;
		}

		getDBval = eval(group + "_TYPE");

		if (getWebval2 == "allow") 
		{
			getWebval = $("#formIPAddressList")[0].selectedIndex;
			nbrofoption = $("#formIPAddressList").children('option').length -1;

			if(nbrofoption <= 0)
			{
				AllowListWeb =  "" ;
			}
			else
			{
				arrayOfIPList = AllowListWeb.split(',');
				arrayOfIPList.splice(getWebval,1);
				AllowListWeb = arrayOfIPList.join(',');
			}
			
		} 
		else if (getWebval2 == "deny")
		{
			getWebval = $("#formIPAddressList")[0].selectedIndex;
			nbrofoption = $("#formIPAddressList").children('option').length -1;

			if(nbrofoption <= 0)
			{
				DenyListWeb = "" ;
			}
			else
			{	
				arrayOfIPList = DenyListWeb.split(',');
				arrayOfIPList.splice(getWebval,1);
				DenyListWeb = arrayOfIPList.join(',');
			}
		} 
		else 
		{
			return false;
		}

		if (getWebval2 == "allow")
		{
			ShowWebIPAllowList();
		}
		else
		{
			ShowWebIPDenyList();
		}
	});
	
	$("#btnDialogOK").button().click(function() {
		var bValid = true;			
		var group = g_defaultGroup;				
		var getWEBval
		var getWEBAllowDenyval
		var arrayOfIPList
		var nbrofoption
		
		getWEBval = $("#formIPfilterAllowtext:text").val();
		
		//$allFormAllow.removeClass('ui-state-error'); // ???????????????????????????????
		//$("#msg_status_allow").removeClass('ui-state-highlight'); // ???????????????????????????????

		if(bValid == false)
		{
			return false;
		}

		getWEBAllowDenyval = $("input[name='formIPFilterAllowDeny']:checked:radio").val();

		if (getWEBAllowDenyval == "allow") 
		{
			arrayOfIPList = AllowListWeb.split(',');

			if (arrayOfIPList.length == 1)
			{
				if (arrayOfIPList[0] == "")
				{
					AllowListWeb = getWEBval;
				}
				else
				{
					arrayOfIPList.splice(arrayOfIPList.length+1, 1, getWEBval);
					AllowListWeb = arrayOfIPList.join(',');
				}
			}
			else
			{
				arrayOfIPList.splice(arrayOfIPList.length+1, 1, getWEBval);
				AllowListWeb = arrayOfIPList.join(',');
			}
			//AllowListWeb +=","+getWEBval
			ShowWebIPAllowList();

		}
		else if (getWEBAllowDenyval == "deny")
		{
			arrayOfIPList = DenyListWeb.split(',');
			
			if (arrayOfIPList.length == 1)
			{
				if (arrayOfIPList[0] == "")
				{
					DenyListWeb = getWEBval;
				}
				else
				{
					arrayOfIPList.splice(arrayOfIPList.length+1, 1, getWEBval);
					DenyListWeb = arrayOfIPList.join(',');
				}
			}
			else
			{
				arrayOfIPList.splice(arrayOfIPList.length+1, 1, getWEBval);
				DenyListWeb = arrayOfIPList.join(',');
			}		
			ShowWebIPDenyList() ;
		}
		else 
		{
			return false;
		}
			
		$("#user_form_allow").dialog('close');
	});

	$("#btnDialogCancel").button().click(function() {
		// Cancel 버튼을 눌렀을 때 동작
		$("#user_form_allow").dialog('close');
	});
	
	$("#btnApply").button().click(function() {
		var reqQString = "action=update&xmlschema";
		var getWebval =$("input[name='formIPFilterAllowDeny']:checked:radio").val();
		var szIP_admin = $("#AllowadminIP .ip_octet:eq(0)").val() +"."+ 
			$("#AllowadminIP .ip_octet:eq(1)").val() +"."+ 
			$("#AllowadminIP .ip_octet:eq(2)").val() +"."+ 
			$("#AllowadminIP .ip_octet:eq(3)").val();
		if(szIP_admin == "...") {
			szIP_admin = "";
		}


		if($("#IPFilteringEnable:checkbox").attr("checked") == true)
		{
			if(szIP_admin == "" && AllowListWeb == "")
			{
				alert(GetMsgLang("04041122"));
				uconlog("[Weblog] At least one accessible over IP is required.");
				return;
			}
		}


		var isFilterEnable =$("#IPFilteringEnable:checkbox").attr("checked");

		QString = makeQString();
		QString
			.set_action('update')
			.set_schema('xml');

		if(!isFilterEnable)
			QString.add_list("IPFILTER.enable", IPFILTER_ENABLE, "no");

		QString
		.add_list("IPFILTER.alwaysallowicmp", IPFILTER_ALWAYSALLOWICMP,($("#AlwaysAllowPing:checkbox").attr("checked") == true) ? "yes":"no")
		.add_list("IPFILTER.adminip", IPFILTER_ADMINIP, encodeURIComponent(szIP_admin))
		.add_list("IPFILTER.type", IPFILTER_TYPE, getWebval)
		.add_list("IPFILTER.Allowlist.filter", IPFILTER_ALLOWLIST_FILTER, AllowListWeb)
		.add_list("IPFILTER.Denylist.filter", IPFILTER_DENYLIST_FILTER, DenyListWeb);

		if(isFilterEnable)
			QString.add_list("IPFILTER.enable", IPFILTER_ENABLE, "yes");
		
		reqQString = QString.get_qstring();
		if(!reqQString) {
			return;
		}

		Req.SetStartFunc(ViewLoadingSave);

		Req.SetCallBackFunc(function(xml){
			var ret = CGIResponseCheck(0, xml);
			if(ret != 0) {
				var errormessage = "";
				if(ret != -2) {
					errormessage = "\n" + ret;
				}
				alert(GetMsgLang("0501") + errormessage);
			}
			LoadParamJs(g_defaultGroup, function() {
				InitSetting();
				ViewLoadingSave(false);
			});

		return;
		});
		Req.Request(reqQString);
	});

}
