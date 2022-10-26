var g_defaultGroup = "USER";

$(function () {
	PreCustomize();
	initEnvironment();
	LoadParamJs(g_defaultGroup, Load);
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum = ["04070117", "04070118", "04070119", "04070120", 
					"04070121", "04070122", "04070123", "0501",
					"04070126", "04070127", "04070128", "04070129",
					"04070130", "04070131"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "users", 
				parent.g_langData[parent.g_configData.language]);
}

function Load()
{
	initForm();
	InitSetting();
	EventBind();
	$("button").button();
	ContentShow();
	ResizePage(380);
	PostCustomize();
}

function initForm()
{
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
	Disable($("button"));

	var $allForm = $("#formUserName, #formUserPassword, #formUserConfirmPassword");

	$("#user_form").dialog({
		autoOpen: false,
		width: 360,
		modal: true,
		resizable: false,
		open: function() {
			$("#msg_status").removeClass('ui-state-error, ui-state-highlight').text("");
			$(":text").removeClass('ui-state-error');

			// 글자수 제한
			$("#formUserName:text").keyup(function(){
				LimitCharac("formUserName:text", 32);
			});
			$("#formUserPassword:password").keyup(function(){
				LimitCharac("formUserPassword:password", 32);
			});
			$("#formUserConfirmPassword:password").keyup(function(){
				LimitCharac("formUserConfirmPassword:password", 32);
			});
			Disable($("#btnAdd"));
			Disable($("#btnModify"));
			Disable($("#btnRemove"));
			Disable($("#btnApply"));
		},
		close: function(){
			$allForm.removeClass('ui-state-error');
			$allForm.val("");
			$("#msg_status").removeClass('ui-state-highlight');
			Enable($("button"));
		}
	});
	
	$("#btnDialogApply").click(function(){
		$allForm.removeClass('ui-state-error');
		$("#msg_status").removeClass('ui-state-highlight');
		var bValid = true;
		var Req = new CGIRequest();
		var reqString = "";
		var group = "";

		QString = makeQString();

		switch($("#user_form").dialog("option", "mode"))
		{
		case "add":
			bValid = bValid && checkLength($("#formUserName:text"), GetMsgLang("04070126"),4 , 32);
			bValid = bValid && checkLength($("#formUserPassword:password"), GetMsgLang("04070127"), 4, 32);
			bValid = bValid && checkLength($("#formUserConfirmPassword:password"), GetMsgLang("04070128"), 4, 32);
			bValid = bValid && checkRegexp($("#formUserName:text"),/^[a-z]([0-9a-z_])+$/i,GetMsgLang("04070129"));
			bValid = bValid && checkEqual($("#formUserPassword:password"), $("#formUserConfirmPassword:password"), GetMsgLang("04070131"));

			if(bValid == false)
			{
				return false;
			}

			reqQString = "action=add&xmlschema";
			QString.set_action('add').set_schema('xml');
			switch($("input[name='formUserGroup']:checked:radio").val())
			{
			case "viewer":
				group = "USER.Viewer.name";
				break;
			case "operator":
				group = "USER.Operator.name";
				break;
			case "admin":
				group = "USER.Admin.name";
				break;
			default:
				group = "USER.Admin.name"; // User group 삭제에 따른 임시 추가
				break;
			}
			break;
		case "modify":
			bValid = bValid && checkLength($("#formUserPassword:password"), GetMsgLang("04070127"), 4, 32);
			bValid = bValid && checkLength($("#formUserConfirmPassword:password"), GetMsgLang("04070128"), 4, 32);
			bValid = bValid && checkEqual($("#formUserPassword:password"), $("#formUserConfirmPassword:password"), GetMsgLang("04070131"));

			if(bValid == false)
			{
				return false;
			}
			reqQString = "action=update&xmlschema";
			QString.set_action('update').set_schema('xml');
			if($("#formUserName:text").val() == "root")
			{
				group = "USER.Root.name";
			}
			else
			{
				group = "USER." + GetLevel($("select#formUserList").val()) +".name";
				reqQString += "&level=" + $("input[name='formUserGroup']:checked:radio").val();
			}

			break;
		default:
			alert(GetMsgLang("04070117"));
			return false;
			break;
		}

		reqQString += "&group=" + group + "&user=" + $("#formUserName:text").val();
		if( $("#formUserPassword:password").val() != "")
		{
			reqQString += "&pwd=" + encodeURIComponent($("#formUserPassword:password").val());
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

			_debug("param - " + reqQString);
			LoadParamJs(g_defaultGroup, function() {
				$("#user_form").dialog('close');
				InitSetting();
				ViewLoadingSave(false);

				_debug("reload");
				_debug("stop");
			});

			return;
		});
		Req.SetErrorFunc(function(){
			LoadParamJs(g_defaultGroup, function() {
				alert(GetMsgLang("0501"));
				$("#user_form").dialog('close');
				InitSetting();
				ViewLoadingSave(false);
			});
			return;
		});
		_debug("start");
		Req.Request(reqQString);
	});

	$("#btnDialogCancel").click(function(){ 
		$("#user_form").dialog('close');		
	});
}

function InitSetting()
{
	var group = g_defaultGroup;

	var aUserList = eval(group + "_ADMIN_NAME").split(",");
	var oUserList = eval(group + "_OPERATOR_NAME").split(",");
	var vUserList = eval(group + "_VIEWER_NAME").split(",");


	$("select#formUserList > option").remove();

	for(var i = 0;i < aUserList.length; i++)
	{
		if (parent.g_configData.langPath == "/language/Arabic.xml") {
			$("select#formUserList").append("<option value='" + aUserList[i] + "'>&lrm;</option>")
			.find("option").last()
			.append(FillText("Administrator", ("Administrator").length, "right") + FillText(aUserList[i], 30, "right"));
		}
		else {
			$("select#formUserList").append("<option value='" + aUserList[i] + "'></option>")
			.find("option").last()
			.append("&nbsp;"+FillText(aUserList[i], 30, "left")+FillText("&nbsp;Administrator", 20, "left"));
		}
	}
	for(i = 0; i < oUserList.length; i++)
	{
		if($("select#formUserList > option[value='" + oUserList[i] + "']").size() > 0) continue;

		$("select#formUserList").append("<option value='" + oUserList[i] + "'></option>")
			.find("option").last()
			.append("&nbsp;"+FillText(oUserList[i], 30, "left")+FillText("&nbsp;Operator", 20, "left"));
	}
	for(i = 0; i < vUserList.length; i++)
	{
		if($("select#formUserList > option[value='" + vUserList[i] + "']").size() > 0) continue;

		$("select#formUserList").append("<option value='" + vUserList[i] + "'></option>")
			.find("option").last()
			.append("&nbsp;"+FillText(vUserList[i], 30, "left")+FillText("&nbsp;Viewer", 20, "left"));
	}
	//$("input[name='formEnableAuthen'][value='" + eval(group + "_ENABLEAUTHEN") + "']:radio").attr("checked", "checked");
	if(eval(group+"_ANONYMOUSVIEWERLOGIN") == "yes")
	{
		$("#formAnonymous:checkbox").attr("checked", "checked");
	}
	else
	{
		$("#formAnonymous:checkbox").attr("checked", "");
	}
}

function GetLevel(username)
{
	var i;
	var group = g_defaultGroup;

	var aUserList = eval(group + "_ADMIN_NAME").split(",");
	var oUserList = eval(group + "_OPERATOR_NAME").split(",");
	var vUserList = eval(group + "_VIEWER_NAME").split(",");

	for(i = 0; i < aUserList.length; i++)
	{
		if(aUserList[i] == username)
		{
			return "admin";
			break;
		}
	}

	for(i = 0; i < oUserList.length; i++)
	{
		if(oUserList[i] == username)
		{
			return "operator";
			break;
		}
	}

	for(i = 0; i < vUserList.length; i++)
	{
		if(vUserList[i] == username)
		{
			return "viewer";
			break;
		}
	}

	return false;
}

function EventBind()
{
	var Req = new CGIRequest();
	Enable($("button"));

	$("#btnAdd").click(function() {
		$("#user_form").dialog("option", "title", GetMsgLang("04070122"));
		$("#user_form").dialog("option", "mode", "add");
		$("#user_form").dialog('open');
		Enable($("#formUserName:text"));
		Enable($("input[name='formUserGroup']"));
		$("#formUserName").focus();
		$("input[name='formUserGroup'][value='viewer']").attr("checked", "checked");
	});

	$("#btnModify").click(function() {
		var i;
		var sUserName = $("select#formUserList").val();

		if(!sUserName)
		{
			alert(GetMsgLang("04070118"));
			return false;
		}

		$("#user_form").dialog("option", "title", GetMsgLang("04070123"));
		$("#user_form").dialog("option", "mode", "modify");
		$("#user_form").dialog('open');

		$("#formUserName:text").val(sUserName);
		$("input[name='formUserGroup'][value='" + GetLevel(sUserName) + "']:radio").attr("checked", "checked");
		Disable($("#formUserName:text"));
		$("#formUserPassword").focus();

		if($("#formUserName:text").val() == "root")
		{
			$("input[name='formUserGroup']:radio").attr("disabled", "disabled");
		}
		else
		{
			$("input[name='formUserGroup']:radio").attr("disabled", "");
		}
	});

	$("#btnRemove").click(function() {
		var sUserName = $("select#formUserList").val();

		if(!sUserName)
		{
			alert(GetMsgLang("04070119"));
			return false;
		}

		if (!confirm(GetMsgLang("04070121")))
		{
			return false;
		}

		var Req = new CGIRequest();
		var group = "";
		var reqString = reqQString = "action=remove&xmlschema";

		switch(GetLevel(sUserName))
		{
		case "viewer":
			group = "USER.Viewer.name";
			break;
		case "operator":
			group = "USER.Operator.name";
			break;
		case "admin":
			group = "USER.Admin.name";
			break;
		default:
			//alert("Level is wrong;");
			//return false;
			group = "USER.Admin.name"; // User group 삭제에 따른 임시 추가
			break;
		}

		reqQString += "&group=" + group + "&user=" + sUserName;

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

			_debug("remove - " + reqQString);
			LoadParamJs(g_defaultGroup, function() {
				$this.dialog('close');
				InitSetting();
				ViewLoadingSave(false);
				_debug("reload");
				_debug("stop");
			});

			return;
		});

		_debug("start");
		Req.Request(reqQString);
	});

	$("select#formUserList").dblclick(function() {
		if($(this).val() == null) return;
		$("#btnModify").click();
	});

	$("#btnApply").click(function() {
		var reqQString = "action=update&xmlschema";

		QString = makeQString();
		QString
			.set_action('update')
			.set_schema('xml')
			//.add_list("USER.enableauthen", USER_ENABLEAUTHEN, $("input[name='formEnableAuthen']:checked:radio").val())
			.add_list("USER.anonymousviewerlogin", USER_ANONYMOUSVIEWERLOGIN, ($("#formAnonymous:checkbox").attr("checked") == true) ? "yes":"no");
		reqQString = QString.get_qstring();
		if(!reqQString) {
			return ;
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
			_debug("update - " + reqQString);
			LoadParamJs(g_defaultGroup, function() {
				InitSetting();
				ViewLoadingSave(false);
			});
			return;
		});
		Req.SetErrorFunc(function(){
			LoadParamJs(g_defaultGroup, function() {
				alert(GetMsgLang("0501"));
				InitSetting();
				ViewLoadingSave(false);
			});
			return;
		});
		Req.Request(reqQString);
		_debug("start" + reqQString);
	});
}