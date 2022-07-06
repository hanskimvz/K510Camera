var g_defaultGroup = "EVENT";
var selectIdx = "";
var prefix = "H";

$(function () {
	PreCustomize();
	initEnvironment();
	LoadParamJs(g_defaultGroup, Load);
	LoadParamJs("EVENTPROFILE");
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum =["04030528", "04030529", "04030530", "04030531",
					"04030532", "04030533", "04030534", "04030535",
					"0501", "04030538", "04030539", "04030540", "04030541", "04030544", "04030545", "04030546", "04030547"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "httpnotification", 
				parent.g_langData[parent.g_configData.language]);
}

function Load()
{
	InitForm();
	InitSetting();
	SetRelation();
	EventBind();
	$("button").button();
	ContentShow();
	PostCustomize();
}

function InitForm()
{
	$(".slider-bar").each(function(index, element) {
		var $obj = $(this).parent().parent().find("input[type='text']");
		$(this).slider({
			range: "min",
			min: 0,
			max: 100,
			slide: function(event, ui) {
				$obj.val(ui.value);
			}
		})
	});

	function UpdateStatus(str)
	{
		$("#msg_status").text(str).addClass("ui-state-highlight");
	}
	function checkLength(o,str,min,max)
	{
		if ( o.val().length > max || o.val().length < min )
		{
			o.addClass('ui-state-error');
			UpdateStatus(str);
			o.focus();
			return false;
		}
		else
		{
			return true;
		}
	}

	function checkNull(id, text) {
		var retVal = true;
		if($(id).val() == null || $(id).val() == undefined || $(id).val() == ""){
			alert(text + GetMsgLang("04030545"));
			$(id).focus();
			retVal = false;
		}
	    return retVal;
	}

	function checkIP(strIP) {
		var expUrl = /^(1|2)?\d?\d([.](1|2)?\d?\d){3}$/;
		if(strIP.length >= 48)
			return false;
	    return expUrl.test(strIP);
	}

	function ValidUrl(str) {
		var expUrl = /^(1|2)?\d?\d([.](1|2)?\d?\d){3}/;
		var pattern = new RegExp('^(((http(s?)):\\/\\/)?)'+ // protocol
			'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
			expUrl + ')' +
			//'((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
			'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
			'((\\/)*[a-zA-Z0-9\\`\\!\\?\\=\\~\\s\\@\\|\\-\\_\\=\\+\\[\\]\\{\\}\'\"\\;\\:\\<\\>\\,\\.\/\\#\\$\\%\\^\\&\\*\\(\\)]*$)','i'); // query string
		if(!pattern.test(str)) {
			return false;
		} else {
			return true;
		}
	}

	function checkPort(strPort) {
		if(strPort == null || strPort == undefined || strPort == "")
			strPort = 80;
		else if(strPort < 1 || strPort >65535){
			alert(strPort + GetMsgLang("04030546"));
			return false;
		}
	    return strPort;
	}

	var max_Name = 32;
	var max_Description = 100;
	var max_Address = 48;
	var max_UserID = 32;
	var max_Password = 32;
	var max_Message = 255;
	var max_URL = 512;
	
	$("#input_form").dialog({
		autoOpen: false,
		width: 440,
		modal: true,
		resizable: false,
		position: [115, 30],
		open: function() {
			$(".ui-dialog-buttonpane").append("<div id='testStatus' style='margin: 12px 0px 0px 105px;'></div>");
			$("#msg_status").removeClass('ui-state-error, ui-state-highlight').text("");
			$(":text").removeClass('ui-state-error');

			$(":text, :password").val("");
			$("#formHttpPort:hidden").val("80");
			//$("#formHttpTimeoutText:text").val("5");
			$(".slider-bar").slider("value", "5");
			$("#formHttpUrl:text").focus(function() {
				if($("#formHttpUrl:text").val() == "")
					$("#formHttpUrl:text").val("http://");
			});
			$("#formHttpName:text").focus();

			// 글자수 제한
			$("#formHttpName:text").keyup(function(){
				LimitCharac("formHttpName:text", max_Name);
			});
			$("#formHttpDes:text").keyup(function(){
				LimitCharac("formHttpDes:text", max_Description);
			});
			$("#formHttpUrl:text").keyup(function(){
				LimitCharac("formHttpUrl:text", max_URL);
			});
			/* $("#formHttpAddr:hidden").keyup(function(){
				LimitCharac("formHttpAddr:hidden", max_Address);
			}); */
			$("#formHttpUser:text").keyup(function(){
				LimitCharac("formHttpUser:text", max_UserID);
			});
			$("#formHttpPwd:password").keyup(function(){
				LimitCharac("formHttpPwd:password", max_Password);
			});
			$("#formHttpMsg:hidden").keyup(function(){
				//LimitCharac("formHttpMsg:hidden", max_Message);
				if($(this).val().substring(0,1) == "/")
				{
					$(this).val($(this).val().substring(1, $(this).val().length));
				}
			});
			$("#formHttpMsg:hidden").change(function(){
				//LimitCharac("formHttpMsg:hidden", max_Message);
				if($(this).val().substring(0,1) == "/")
				{
					$(this).val($(this).val().substring(1, $(this).val().length));
				}
			});

			LimitKor();
			Disable($("button#btnAdd"));
			Disable($("button#btnModify"));
			Disable($("button#btnRemove"));
		},
		close: function() {
			ResizePage();
			$("div#testStatus").remove();
			$("#effect").hide();
			Enable($("button"));
		}
	});

	$("#btnDialogOK").click(function() {
		var strHttpUrl = $("#formHttpUrl:text").val();
		var protocolArray = strHttpUrl.split('//');
		var strProtocol = "";
		for (var i = 1; i < protocolArray.length; i++) {
			if(i > 1)
				strProtocol += "//";
			strProtocol += protocolArray[i];
		}
		if(protocolArray[0] == "http:" || protocolArray[0] == "https:")
			strHttpUrl = strProtocol;
		var retGap = ValidUrl(strHttpUrl);
		var httpUrlArray = strHttpUrl.split('/');
		var parseIpPort = httpUrlArray[0].split(':');
		var urlPath = "";
		for (var i = 1; i < httpUrlArray.length; i++) {
			if(i > 1)
				urlPath += "/";
			urlPath += httpUrlArray[i];
		}

		if(checkNull("#formHttpUrl:text", "URL")){
			if(!(retGap || checkIP(parseIpPort[0]))){
				alert(GetMsgLang("04030544"));
				return;
			}
			if(!checkPort(parseIpPort[1]))
				return;
		}
		else
			return;
		var maybeProtocol = "";
		if(protocolArray[0] == "http:" || protocolArray[0] == "https:"){
			maybeProtocol = protocolArray[0] + "//";
		}
		$("#formHttpAddr:hidden").val(maybeProtocol + parseIpPort[0]);
		$("#formHttpPort:hidden").val(checkPort(parseIpPort[1]));
		$("#formHttpMsg:hidden").val(urlPath);
		
		var bValid = true;
		bValid = bValid && checkLength($("#formHttpName:text"), GetMsgLang("04030538"), 1 , max_Name);
		bValid = bValid && checkLength($("#formHttpAddr:hidden"), GetMsgLang("04030539"), 1 , max_Address);
		bValid = bValid && checkLength($("#formHttpMsg:hidden"), GetMsgLang("04030540"), 1 , max_Message);
		bValid = bValid && checkLength($("#formHttpUrl:text"), GetMsgLang("04030547"), 7 , max_URL);

		if(bValid == false)
		{
			return false;
		}

		var Req = new CGIRequest();
		var group = g_defaultGroup;

		QString = makeQString();

		switch($("#input_form").dialog("option", "mode"))
		{
			case "add":
				reqQString = "type=http&action=add&xmlschema";
				reqQString = "action=add&srcgroup=EVENT.Default.Notify.Http&group=EVENT.Notify.Http.H*&xmlschema";
				reqQString += "&name=" + encodeURIComponent($("#formHttpName:text").val());
				reqQString += "&description=" + encodeURIComponent($("#formHttpDes:text").val());
				reqQString += "&address=" + encodeURIComponent($("#formHttpAddr:hidden").val());
				reqQString += "&port=" + $("#formHttpPort:hidden").val();
				reqQString += "&account=" + encodeURIComponent($("#formHttpUser:text").val());
				reqQString += "&pwd=" + encodeURIComponent($("#formHttpPwd:password").val());
				reqQString += "&syntax=" + encodeURIComponent($("#formHttpMsg:hidden").val());
				reqQString += "&optionenable=";
				reqQString += ($("#formHttpOption:checkbox").attr("checked") == true) ? "yes" : "no";
				//reqQString += "&timeout=" + $("#formHttpTimeoutText:text").val();
				break;
			case "modify":
				QString
					.set_action('update')
					.set_schema('xml')
					.add_list("name", encodeURIComponent(eval("EVENT_NOTIFY_HTTP_" + prefix + selectIdx + "_NAME")), encodeURIComponent($("#formHttpName:text").val()))
					.add_list("description", encodeURIComponent(eval("EVENT_NOTIFY_HTTP_" + prefix + selectIdx + "_DESCRIPTION")), encodeURIComponent($("#formHttpDes:text").val()))
					.add_list("address", encodeURIComponent(eval("EVENT_NOTIFY_HTTP_" + prefix + selectIdx + "_ADDRESS")), encodeURIComponent($("#formHttpAddr:hidden").val()))
					.add_list("port", encodeURIComponent(eval("EVENT_NOTIFY_HTTP_" + prefix + selectIdx + "_PORT")), $("#formHttpPort:hidden").val())
					.add_list("account", encodeURIComponent(eval("EVENT_NOTIFY_HTTP_" + prefix + selectIdx + "_ACCOUNT")), encodeURIComponent($("#formHttpUser:text").val()))
					.add_list("pwd", encodeURIComponent(eval("EVENT_NOTIFY_HTTP_" + prefix + selectIdx + "_PWD")), encodeURIComponent($("#formHttpPwd:password").val()))
					.add_list("syntax", encodeURIComponent(eval("EVENT_NOTIFY_HTTP_" + prefix + selectIdx + "_SYNTAX")), encodeURIComponent($("#formHttpMsg:hidden").val()))
					.add_list("optionenable", eval("EVENT_NOTIFY_HTTP_" + prefix + selectIdx + "_OPTIONENABLE"), ($("#formHttpOption:checkbox").attr("checked") == true) ? "yes" : "no")
					//.add_list("timeout", eval("EVENT_NOTIFY_HTTP_" + prefix + selectIdx + "_TIMEOUT"), $("#formHttpTimeoutText:text").val());
				reqQString = QString.get_qstring();
				if(!reqQString)
				{
					return;
				}
				reqQString += "&group=EVENT.Notify.Http." + prefix + selectIdx;
				break;
			default:
				alert(GetMsgLang("04030528"));
				return false;
				break;
		}

		if($("#formHttpPort:hidden").val() < 1 || $("#formHttpPort:hidden").val() >65535 || $("#formHttpPort:hidden").val() == "") return;
		//if($("#formHttpTimeoutText:text").val() < 0 || $("#formHttpTimeoutText:text").val() >100 || $("#formHttpTimeoutText:text").val() == "") return;

		Req.SetType("POST");
		Req.SetStartFunc(ViewLoadingSave);

		Req.SetCallBackFunc(function(xml){
			var ret = CGIResponseCheck(0, xml);
			if(ret != 0)
			{
				var errormessage = "";
				if(ret != -2)
				{
					errormessage = "\n" + ret;
				}
				alert(GetMsgLang("0501") + errormessage);
			}
			LoadParamJs(g_defaultGroup, function() {
				$("#input_form").dialog('close');
				InitSetting();
				ViewLoadingSave(false);
			});
			return;
		});
		Req.Request(reqQString);
	});

	$("#btnDialogCancel").click(function() {
		$("#input_form").dialog('close');
	});

	$("#btnHTTPTest").click(function(){
		var strHttpUrl = $("#formHttpUrl:text").val();
		var protocolArray = strHttpUrl.split('//');
		var strProtocol = "";
		for (var i = 1; i < protocolArray.length; i++) {
			if(i > 1)
				strProtocol += "//";
			strProtocol += protocolArray[i];
		}
		if(protocolArray[0] == "http:" || protocolArray[0] == "https:")
			strHttpUrl = strProtocol;
		var retGap = ValidUrl(strHttpUrl);
		var httpUrlArray = strHttpUrl.split('/');
		var parseIpPort = httpUrlArray[0].split(':');
		var urlPath = "";
		for (var i = 1; i < httpUrlArray.length; i++) {
			if(i > 1)
				urlPath += "/";
			urlPath += httpUrlArray[i];
		}

		if(checkNull("#formHttpUrl:text", "URL")){
			if(!(retGap || checkIP(parseIpPort[0]))){
				alert(GetMsgLang("04030544"));
				return;
			}
			if(!checkPort(parseIpPort[1]))
				return;
		}
		else
			return;
		var maybeProtocol = "";
		if(protocolArray[0] == "http:" || protocolArray[0] == "https:"){
			maybeProtocol = protocolArray[0] + "//";
		}
		else {
			maybeProtocol ="http://";
		}
		$("#formHttpAddr:hidden").val(maybeProtocol + parseIpPort[0]);
		$("#formHttpPort:hidden").val(checkPort(parseIpPort[1]));
		$("#formHttpMsg:hidden").val(urlPath);
		
		ViewLoadingSave(true);
		Disable($("button"));
		
		var addr = parseIpPort[0];
		var msg = $("#formHttpMsg").val();
		var server = addr + "/" + msg;
		var type = maybeProtocol.substring(0,(maybeProtocol.length)-3);
		var port = $("#formHttpPort").val();
		var account = $("#formHttpUser").val();
		var password = $("#formHttpPwd").val();

		try {
	        $.post("/uapi-cgi/admin/testaction.cgi",
			{ type: type, server: server, port:port, account: account, pwd: password }, 
			function(data) { 
				parseTestActionResponse(data);
				ViewLoadingSave(false);
				Enable($("button"));
			}, "text");
	    } catch(err) {
	        alert("error : "+err);
	    }
		/*$.get("/uapi-cgi/admin/testaction.cgi?type=http&server=" + server +
												"&port=" + port +
												"&account=" + account +
												"&pwd=" + password , function(data) {
			parseTestActionResponse(data);
			ViewLoadingSave(false);
			Enable($("button"));
		});*/
	});

	Disable($("button"));
}

function InitSetting()
{
	var group = g_defaultGroup;
	var notifyList = "";
	var notify_cnt = eval(g_defaultGroup + "_NOTIFY_HTTP_NBROFCOUNT");
	if(notify_cnt > 0)
		notifyList = eval(g_defaultGroup + "_NOTIFY_HTTP_LIST").split(",");

	$("select#formNotifyList").empty();
	if(notifyList == "" || notifyList == null)
	{
		return false;
	}
	for(var i=0;i<notifyList.length;i++)
	{
		var group = g_defaultGroup + "_NOTIFY_HTTP_" + prefix + notifyList[i];
		var valNum = eval(i+1) + "";
		var valName = eval(group + "_NAME");

		var descListCheck = eval(group + "_DESCRIPTION");
		var cnt = 0;

		for(var j = 0; j < descListCheck.length; ++j)
		{
			if(descListCheck.charAt(j) != ' ')
				++cnt;
		}

		if(cnt == 0)
		{
			descListCheck = "";
		}
		else
		{
			descListCheck = eval(group + "_DESCRIPTION");
		}
		
		valName = valName.replace(/</g, "&lt;");
		descListCheck = descListCheck.replace(/</g, "&lt;");

		if (parent.g_configData.langPath == "/language/Arabic.xml") {
			$("select#formNotifyList").append("<option value='" + notifyList[i] + "'>&lrm;</option>")
			.find("option").last().append(FillText(descListCheck, descListCheck.length, "right")
				+ FillText(valName, 19, "right")
				+ FillText(valNum, 6, "right")
			);
		}
		else {
			$("select#formNotifyList").append("<option value='" + notifyList[i] + "'></option>")
			.find("option").last().append("&nbsp;"
				+ FillText(valNum, 6, "left")
				+ FillText(valName, 19, "left")
				+ FillText(descListCheck, 64, "left")
			);
		}
		
	}
	$("#effect").hide();
}

function SetRelation()
{
	$("#formHttpPort:hidden").numeric();
}

function EventBind()
{
	Enable($("button"));

	$("#btnAdd").click(function() {
		if($("#formNotifyList option").size() >= 8)
		{
			alert(GetMsgLang("04030541"));
			return;
		}
		$("#effect").hide();
		ResizePage(550);

		$("#input_form").dialog("option", "title", GetMsgLang("04030534"));
		$("#input_form").dialog("option", "mode", "add");
		$("#input_form").dialog('open');
		//$("#formHttpTimeoutText:text").val("0");
		//$("#sliderHttpTimeoutText").slider("value", "0");
		$("#formHttpOption:checkbox").attr("checked", "");

		$("#formHttpPort:hidden").blur(function() {
			var inputValTextPort = $("#formHttpPort:hidden").val()-0;
			$("#formHttpPort:hidden").val(inputValTextPort);
			if(inputValTextPort < 1 || inputValTextPort >65535 || inputValTextPort == "")
			{
				$("#formHttpPort:hidden").val("80").focus();
				alert(GetMsgLang("04030529"));
			}
		});

	});
	$("#btnModify").click(function() {
		$("#effect").hide();
		if($("#formNotifyList").val() == null)
		{
			alert(GetMsgLang("04030530"));
			return false;
		}

		ResizePage(550);

		$("#input_form").dialog("option", "title", GetMsgLang("04030535"));
		$("#input_form").dialog("option", "mode", "modify");
		$("#input_form").dialog('open');

		var group = g_defaultGroup + "_NOTIFY_HTTP_" + prefix + selectIdx;

		$("#formHttpPort:hidden").blur(function() {
			var inputValTextPort = $("#formHttpPort:hidden").val()-0;
			$("#formHttpPort:hidden").val(inputValTextPort);
			
			if(inputValTextPort < 1 || inputValTextPort >65535 || inputValTextPort == "")
			{
				$("#formHttpPort:hidden").val(eval(group + "_PORT")).focus();
				alert(GetMsgLang("04030529"));
			}
		});
		$("#formHttpName:text").val(eval(group + "_NAME"));
		$("#formHttpDes:text").val(eval(group + "_DESCRIPTION"));
		$("#formHttpUrl:text").val(eval(group + "_ADDRESS")+ ":" + eval(group + "_PORT") + "/" + eval(group + "_SYNTAX"));
		$("#formHttpAddr:hidden").val(eval(group + "_ADDRESS"));
		$("#formHttpPort:hidden").val(eval(group + "_PORT"));
		$("#formHttpUser:text").val(eval(group + "_ACCOUNT"));
		$("#formHttpPwd:password").val(eval(group + "_PWD"));
		$("#formHttpMsg:hidden").val(eval(group + "_SYNTAX"));
		if(eval(group + "_OPTIONENABLE") == "yes")
		{
			$("#formHttpOption:checkbox").attr("checked", "checked");
		}
		else
		{
			$("#formHttpOption:checkbox").attr("checked", "");
		}
		//$("#formHttpTimeoutText:text").val(eval(group + "_TIMEOUT"));
		//$("#formHttpTimeoutText:text").parent().parent().find(".slider-bar").slider("value", eval(group + "_TIMEOUT"));
	});

	$("select#formNotifyList").click(function() {
		if($(this).val() == null) return;
		selectIdx = $(this).val();
		var group = g_defaultGroup + "_NOTIFY_HTTP_" + prefix + selectIdx;
		ResizePage(480);

		$("#infoHttpName").html(eval(group + "_NAME"));
		$("#infoHttpDes").html(FillText(eval(group+"_DESCRIPTION"), 64, "left"));
		$("#infoHttpAddr").html(eval(group + "_ADDRESS"));
		$("#infoHttpPort").html(eval(group + "_PORT"));
		$("#infoHttpAcc").html(eval(group + "_ACCOUNT"));
		$("#infoHttpMsg").html(eval(group + "_SYNTAX")).attr("style", "width:450px; overflow-x:hidden");
		$("#infoHttpEnableOption").html(eval(group + "_OPTIONENABLE"));

		$( "#effect" ).show();
	}).keyup(function(){
		$(this).click();
	});
	$("select#formNotifyList").dblclick(function() {
		if($(this).val() == null) return;
		$("#btnModify").click();
	});

	$("#btnRemove").click(function() {
		if($("#formNotifyList").val() == null)
		{
			alert(GetMsgLang("04030531"));
			return false;
		}

		if (!confirm(GetMsgLang("04030532")))
		{
			return false;
		}

		var Req = new CGIRequest();
		var reqQString = "action=remove&xmlschema&group=EVENT.Notify.Http." + prefix + selectIdx;

		var eventGroup = g_defaultGroup;
		var profileList;
		var profile_cnt = eval(g_defaultGroup + "PROFILE" + "_NBROFCOUNT");

		if(profile_cnt > 0)
			profileList = eval(g_defaultGroup + "PROFILE" + "_LIST").split(",");

		for (var i = 0; i < profile_cnt; i++)
		{
			var enableList = eval(g_defaultGroup + "PROFILE" + "_P" + profileList[i].toUpperCase() + "_NOTIFICATION_HTTP_ENABLELIST").split(",");

			for (var j = 0; j < enableList.length; j++)
			{
				if(enableList[j] == selectIdx)
				{
					alert(GetMsgLang("04030533"));
					return false;
				}
			}
		}

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
			LoadParamJs(g_defaultGroup , function() {
				InitSetting();
				ViewLoadingSave(false);
				$( "#effect" ).hide();
			});
			return;
		});
		Req.Request(reqQString);
	});
}


