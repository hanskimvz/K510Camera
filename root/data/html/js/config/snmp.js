var DefaultGroup = "NETWORK_SNMP";
var prefix = "U";
var selectIdx = "";

$(function () {
	PreCustomize();
	initEnvironment();
	LoadParamJs("NETWORK.Snmp", mainRun);
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum = ["04040932", "04040933", "04040934", "04040935",
					"04040936", "04040937", "04040938", "04040939",
					"04040940", "04040941", "04040942", "0501"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "snmp", 
				parent.g_langData[parent.g_configData.language]);
}

function mainRun()
{
	InitForm();
	InitSetting();
	EventBind();
	ContentShow();
	ResizePage(600);
	PostCustomize();
}

function InitForm()
{
	var $allForm = $("#formUserName, #formUserPassword, #formUserConfirmPassword");
	
	function UpdateStatus(str)
	{
		$("#msg_status").text(str).addClass("ui-state-highlight");
	}
	function checkLength(o,str,min,max)
	{
		if ( o.val().length > max || o.val().length < min ) {
			o.addClass('ui-state-error');
			UpdateStatus(str);
			o.focus();
			return false;
		} else {
			return true;
		}
	}
	function checkRegexp(o,regexp,n)
	{
		if ( !( regexp.test( o.val() ) ) ) {
			o.addClass('ui-state-error');
			UpdateStatus(n);
			o.focus();
			return false;
		} else {
			return true;
		}
	}
	function checkEqual(o,v,n)
	{
		if ( o.val() != v.val() ) {
			v.addClass('ui-state-error');
			UpdateStatus(n);
			v.focus();
			return false;
		} else {
			return true;
		}
	}
	
	function checkUserData()
	{
		var bValid = true;
		
		bValid = bValid && checkLength($("#formUserName:text"), GetMsgLang("04040934"),1 , 32);
		bValid = bValid && checkLength($("#formUserPassword:password"), GetMsgLang("04040935"), 8, 255);
		bValid = bValid && checkLength($("#formUserConfirmPassword:password"), GetMsgLang("04040936"), 8, 255);
		bValid = bValid && checkRegexp($("#formUserName:text"),/^[a-z]([0-9a-z_])+$/i, GetMsgLang("04040937"));
		bValid = bValid && checkRegexp($("#formUserPassword:password"),/^([0-9a-zA-Z])+$/, GetMsgLang("04040938"));
		bValid = bValid && checkRegexp($("#formUserConfirmPassword:password"),/^([0-9a-zA-Z])+$/, GetMsgLang("04040938"));
		bValid = bValid && checkEqual($("#formUserPassword:password"), $("#formUserConfirmPassword:password"), GetMsgLang("04040939"));
				
		if(bValid == false)
			return false;
		else
			return true;
	}

	$("#user_form").dialog({
		autoOpen: false,
		width: 380,
		modal: true,
		resizable: false,
		open: function() {
			$("#msg_status").removeClass('ui-state-error, ui-state-highlight').text("");
			$(":text").removeClass('ui-state-error');

			$("#formUserName:text").keyup(function(){
					LimitCharac("formUserName:text", 32);
			});

			//Disable($("button"));
			Disable($("#btnAdd"));
			Disable($("#btnModify"));
			Disable($("#btnRemove"));
			Disable($("#btnApply"));
		},
		close: function(){
			$allForm.removeClass('ui-state-error');
			$allForm.val("");
			Enable($("button"));
		}
	});
	
	$("#formSelectAuth").append("<option>").find("option:last").attr("value", "md5").append("MD5");
	$("#formSelectAuth").append("<option>").find("option:last").attr("value", "sha").append("SHA");		
	
	$("#formSelectPriv").append("<option>").find("option:last").attr("value", "des").append("DES");
	$("#formSelectPriv").append("<option>").find("option:last").attr("value", "aes").append("AES");			 
	
	$("#btnDialogApply").button().click(function(){
			$allForm.removeClass('ui-state-error');
			$("#msg_status").removeClass('ui-state-highlight');		
			var bValid = true;
			var Req = new CGIRequest();
			var reqString = "";
			
			QString = makeQString();				
			
			switch($("#user_form").dialog("option", "mode"))
			{
			case "add":
					if(checkUserData() == false)
							return false;
							
					reqQString = "action=add&srcgroup=NETWORK.Snmp.User.Default&group=NETWORK.Snmp.User.U*&xmlschema";
					reqQString += "&name=" + encodeURIComponent($("#formUserName:text").val());
					reqQString += "&pwd=" + encodeURIComponent($("#formUserPassword:password").val());
					reqQString += "&authprotocol=" + encodeURIComponent($("select#formSelectAuth").val());
					reqQString += "&privprotocol=" + encodeURIComponent($("select#formSelectPriv").val());
					
					break;
			case "modify":
					if(checkUserData() == false)
							return false;
													
					QString
							.set_action('update')
							.set_schema('xml')
							.add_list("name", window["NETWORK_SNMP_USER_" + prefix + selectIdx + "_NAME"], encodeURIComponent($("#formUserName:text").val()))
							.add_list("pwd", window["NETWORK_SNMP_USER_" + prefix + selectIdx + "_PWD"], encodeURIComponent($("#formUserPassword:password").val()))
							.add_list("authprotocol", window["NETWORK_SNMP_USER_" + prefix + selectIdx + "_AUTHPROTOCOL"], encodeURIComponent($("select#formSelectAuth").val()))	 
							.add_list("privprotocol", window["NETWORK_SNMP_USER_" + prefix + selectIdx + "_PRIVPROTOCOL"], encodeURIComponent($("select#formSelectPriv").val()));
					reqQString = QString.get_qstring();	 
					
					if(!reqQString) {
							return;
					}
					
					reqQString += "&group=NETWORK.Snmp.User." + prefix + selectIdx;														 
					break;
			default:
					return false;
					break;
			}
			
			Req.SetType("POST");
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
					LoadParamJs("Network.snmp", function() {
							$("#user_form").dialog('close');
							InitUserList();
							ViewLoadingSave(false);
					});
					return;
			});
			Req.Request(reqQString);
	});
	
	$("#btnDialogCancel").button().click(function(){
			$("#user_form").dialog('close');
	});
}

function InitUserList()
{
		var group = DefaultGroup + "_USER";
		var user_cnt = eval(group + "_NBROFCOUNT");
		var userList = "";
		
		if(user_cnt > 0)
				userList = eval(group + "_LIST").split(",");
				
		$("select#formUserList").empty();
		
		if(userList == "" || userList == null)
				return false;
		
		for(var i=0; i<userList.length; i++)
		{
				var subgroup = group + "_" + prefix + userList[i];
				var valName = window[subgroup + "_NAME"];
				var valAuth = window[subgroup + "_AUTHPROTOCOL"];
				var valPriv = window[subgroup + "_PRIVPROTOCOL"];
				
										
				$("select#formUserList").append("<option value='" + userList[i] + "'></option>")
						.find("option").last()
						.append("&nbsp;"+FillText("" + valName, 34, "left")
						+FillText((valAuth == "md5") ? "MD5" : "SHA", 7, "left")
						+FillText((valPriv == "des") ? "DES" : "AES", 5, "left")
				);
		}
}

function InitSetting()
{
	var group = DefaultGroup;
	
	$("#snmpDesLocation:text").keyup(function(){
		LimitCharac("snmpDesLocation:text", 64);
	});
	$("#snmpDesContact:text").keyup(function(){
		LimitCharac("snmpDesContact:text", 64);
	});
	$("#snmpDesCommunity:text").keyup(function(){
		LimitCharac("snmpDesCommunity:text", 64);
	});
	$("#snmpTrapSetVer1Addr:text").keyup(function(){
		LimitCharac("snmpTrapSetVer1Addr:text", 64);
	});
	$("#snmpTrapSetVer2Addr:text").keyup(function(){
		LimitCharac("snmpTrapSetVer2Addr:text", 64);
	});

	if(eval(group+"_ENABLE") == "yes")
	{
		$("#snmpEnable:checkbox").attr("checked", "checked");
	}
	else
	{
		$("#snmpEnable:checkbox").attr("checked", "");
	}

	$("#snmpDesLocation:text").val(window[group+ "_LOCATION"]);
	$("#snmpDesContact:text").val(window[group+ "_CONTACT"]);
	$("#snmpDesCommunity:text").val(window[group+ "_ROCOMMUNITY"]);

	var trap1sinkData = jqSplit(window[group+ "_TRAP1SINK"], " ");
	var trap2sinkData = jqSplit(window[group+ "_TRAP2SINK"], " ");

	$("#snmpTrapSetVer1Addr:text").val(trap1sinkData[0]);
	$("#snmpTrapSetVer1Community:text").val(trap1sinkData[1]);
	$("#snmpTrapSetVer2Addr:text").val(trap2sinkData[0]);
	$("#snmpTrapSetVer2Community:text").val(trap2sinkData[1]);

	var snmpVersion = window[group + "_VERSION"];
	
	if(snmpVersion == "v2c")
			$("input[name='formSnmpVersion'][value='v2c']:radio").attr("checked", "checked");
	else
			$("input[name='formSnmpVersion'][value='v3']:radio").attr("checked", "checked");
	$("input[name='formSnmpVersion']").change();	
	
	InitUserList();
}

function EventBind()
{
	var Req = new CGIRequest();

	$("#btnApply").button().click(function() {
		var reqQString = "action=update&xmlschema";

		QString = makeQString();
		QString
			.set_action('update')
			.set_schema('xml')
			.add_list("NETWORK.Snmp.enable", NETWORK_SNMP_ENABLE, ($("#snmpEnable:checkbox").attr("checked") == true) ? "yes":"no")
			.add_list("NETWORK.Snmp.version", NETWORK_SNMP_VERSION, $("input[name='formSnmpVersion']:checked:radio").val())
			.add_list("NETWORK.Snmp.location", NETWORK_SNMP_LOCATION, encodeURIComponent($("#snmpDesLocation:text").val()))
			.add_list("NETWORK.Snmp.contact", NETWORK_SNMP_CONTACT, encodeURIComponent($("#snmpDesContact:text").val()))
			.add_list("NETWORK.Snmp.rocommunity", NETWORK_SNMP_ROCOMMUNITY, encodeURIComponent($("#snmpDesCommunity:text").val()))
			.add_list("NETWORK.Snmp.trap1.address", NETWORK_SNMP_TRAP1_ADDRESS, encodeURIComponent($("#snmpTrapSetVer1Addr:text").val()))
			.add_list("NETWORK.Snmp.trap1.community", NETWORK_SNMP_TRAP1_COMMUNITY, encodeURIComponent($("#snmpTrapSetVer1Community:text").val()))			
			.add_list("NETWORK.Snmp.trap2.address", NETWORK_SNMP_TRAP2_ADDRESS, encodeURIComponent($("#snmpTrapSetVer2Addr:text").val()))
			.add_list("NETWORK.Snmp.trap2.community", NETWORK_SNMP_TRAP2_COMMUNITY, encodeURIComponent($("#snmpTrapSetVer2Community:text").val()))						
			.add_list("NETWORK.Snmp.trap1sink", NETWORK_SNMP_TRAP1SINK, encodeURIComponent($("#snmpTrapSetVer1Addr:text").val() + " " + $("#snmpTrapSetVer1Community:text").val()))
			.add_list("NETWORK.Snmp.trap2sink", NETWORK_SNMP_TRAP2SINK, encodeURIComponent($("#snmpTrapSetVer2Addr:text").val() + " " + $("#snmpTrapSetVer2Community:text").val()));
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

			LoadParamJs("NETWORK.Snmp", function() {
				InitSetting();
				ViewLoadingSave(false);
			});

			return;
		});
		Req.Request(reqQString);
	});
	

	$("input[name='formSnmpVersion']").unbind().change(function() {
			if($("input[name='formSnmpVersion']:checked:radio").val() == "v2c")
			{
					$(".v1access").css("display", "block");
					$(".v3access").css("display", "none");

					ResizePage(600);
			}
			else if($("input[name='formSnmpVersion']:checked:radio").val() == "v3")
			{
					$(".v1access").css("display", "none");
					$(".v3access").css("display", "block");

					ResizePage(600);
			}
	});

	$("input[name='formSnmpVersion']").change();
	
	$("#btnAdd").button().click(function() {
			$("#user_form").dialog("option", "title", GetMsgLang("04040941"));
			$("#user_form").dialog("option", "mode", "add");
			$("#user_form").dialog('open'); 
	});

	$("#btnModify").button().click(function() {
			var user = $("select#formUserList").val();
			
			if(!user)
			{
					alert(GetMsgLang("04040932"));
					return false;
			}
			
			$("#user_form").dialog("option", "title", GetMsgLang("04040942"));
			$("#user_form").dialog("option", "mode", "modify");
			$("#user_form").dialog('open');
			
			var group = DefaultGroup + "_USER_" + prefix + selectIdx;
			
			$("#formUserName:text").val(window[group + "_NAME"]);
			$("#formUserPassword:password").val(window[group + "_PWD"]);
			$("#formUserConfirmPassword:password").val(window[group + "_PWD"]);
			$("select#formSelectAuth").val(window[group + "_AUTHPROTOCOL"]);
			$("select#formSelectPriv").val(window[group + "_PRIVPROTOCOL"]);								
	});
	
	$("select#formUserList").click(function() {
			if($(this).val() == null) return;
			selectIdx = $(this).val();
	}).keyup(function(){
			$(this).click();
	});
			
	$("select#formUserList").dblclick(function() {
			if($(this).val() == null) return;
			$("#btnModify").click();
	});		

	$("#btnRemove").button().click(function() {
			var sUserName = $("select#formUserList").val();

			if(!sUserName)
			{
					alert(GetMsgLang("04040933"));
					return false;
			}

			if (!confirm(GetMsgLang("04040940")))
			{
					return false;
			}

			var Req = new CGIRequest();
			var group = "Network.Snmp.User.";
			var reqString = reqQString = "action=remove&xmlschema";

			reqQString += "&group=" + group + prefix + selectIdx;

			Req.SetStartFunc(ViewLoadingSave);

			$this = $(this);

			Req.SetCallBackFunc(function(xml){
					var ret = CGIResponseCheck(0, xml);
					if(ret != 0) {
							var errormessage = "";
							if(ret != -2) {
									errormessage = "\n" + ret;
							}
							alert(GetMsgLang("0501") + errormessage);
					}

					LoadParamJs("Network.snmp", function() {
							$this.dialog('close');
							InitUserList();
							ViewLoadingSave(false);
					});

					return;
			});
			Req.Request(reqQString);
	});
}
