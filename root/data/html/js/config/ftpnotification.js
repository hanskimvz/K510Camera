var DefaultGroup = "EVENT";
var selectIdx = "";
var prefix = "F";

$(function () {
	PreCustomize();
	initEnvironment();
	LoadParamJs(DefaultGroup, Load);
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
	var classNum = ["04030429", "04030430", "04030431", "04030432", "04030433",
					"04030434", "04030435", "04030436", "0501", "04030439", "04030440"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "ftpnotification", 
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

	$("#input_form").dialog({
		autoOpen: false,
		width: 480,
		modal: true,
		resizable: false,
		position: [115, 30],
		open: function() {
			$(".ui-dialog-buttonpane").append("<div id='testStatus' style='margin: 12px 0px 0px 55px;'></div>");
			$("#msg_status").removeClass('ui-state-error, ui-state-highlight').text("");
			$(":text, :password").removeClass('ui-state-error');

			$(":text, :password").val("");
			$(":checkbox").attr("checked", "checked");
			$("#formFtpPort:text").val("21");
			$("select#formFtpNameFormat").val("yyyymmdd");

			$("#formFtpName:text").focus();

			// 글자수 제한
			$("#formFtpName:text").keyup(function(){
				LimitCharac("formFtpName:text", 32);
			});
			$("#formFtpDes:text").keyup(function(){
				LimitCharac("formFtpDes:text", 100);
			});
			$("#formFtpAddr:text").keyup(function(){
				LimitCharac("formFtpAddr:text", 48);
			});
			$("#formFtpPath:text").keyup(function(){
				LimitCharac("formFtpPath:text", 64);
			});
			$("#formFtpUser:text").keyup(function(){
				LimitCharac("formFtpUser:text", 32);
			});
			$("#formFtpPwd:password").keyup(function(){
				LimitCharac("formFtpPwd:password", 32);
			});
			$("#prefixText:text").keyup(function(){
				LimitCharac("prefixText:text", 31);
			});

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

	$("#btnDialogOK").click(function(){ 
		var bValid = true;
		var IPAddressValue = $("#formIPAddress .ip_octet:eq(0)").val() +"."+ 
												 $("#formIPAddress .ip_octet:eq(1)").val() +"."+ 
												 $("#formIPAddress .ip_octet:eq(2)").val() +"."+ 
												 $("#formIPAddress .ip_octet:eq(3)").val();

		if(IPAddressValue == "...")
		{
			IPAddressValue = "";
		}

		bValid = bValid && checkLength($("#formFtpName:text"), GetMsgLang("04030439"),1 , 32);
		//bValid = bValid && checkLength($("#formFtpAddr:text"), "Ftp Server Address",1 , 48);

		if(bValid == false)
		{
			return false;
		}

		var Req = new CGIRequest();
		var group = DefaultGroup;

		QString = makeQString();

		switch($("#input_form").dialog("option", "mode"))
		{
			case "add":
				reqQString = "action=add&srcgroup=EVENT.Default.Notify.Ftp&group=EVENT.Notify.Ftp.F*&xmlschema";
				reqQString += "&name=" + encodeURIComponent($("#formFtpName:text").val());
				reqQString += "&description=" + encodeURIComponent($("#formFtpDes:text").val());
				reqQString += "&address=" + encodeURIComponent(IPAddressValue);
				reqQString += "&port=" + $("#formFtpPort:text").val();
				reqQString += "&targetpath=" + encodeURIComponent($("#formFtpPath:text").val());
				reqQString += "&account=" + encodeURIComponent($("#formFtpUser:text").val());
				reqQString += "&pwd=" + encodeURIComponent($("#formFtpPwd:password").val());
				reqQString += "&nameformatdate=" + $("select#formFtpNameFormat").val();
				reqQString += "&nameformattext=" + encodeURIComponent($("#prefixText").val());
				reqQString += "&nameformatprefix=" + $("input[name='namePrefixType']:checked:radio").val();
				break;
			case "modify":
				QString
					.set_action('update')
					.set_schema('xml')
					.add_list("name", encodeURIComponent(eval("EVENT_NOTIFY_FTP_" + prefix + selectIdx + "_NAME")), encodeURIComponent($("#formFtpName:text").val()))
					.add_list("description", encodeURIComponent(eval("EVENT_NOTIFY_FTP_" + prefix + selectIdx + "_DESCRIPTION")), encodeURIComponent($("#formFtpDes:text").val()))
					.add_list("address", encodeURIComponent(eval("EVENT_NOTIFY_FTP_" + prefix + selectIdx + "_ADDRESS")), encodeURIComponent(IPAddressValue))
					.add_list("port", encodeURIComponent(eval("EVENT_NOTIFY_FTP_" + prefix + selectIdx + "_PORT")), $("#formFtpPort:text").val())
					.add_list("targetpath", encodeURIComponent(eval("EVENT_NOTIFY_FTP_" + prefix + selectIdx + "_TARGETPATH")), encodeURIComponent($("#formFtpPath:text").val()))
					.add_list("account", encodeURIComponent(eval("EVENT_NOTIFY_FTP_" + prefix + selectIdx + "_ACCOUNT")), encodeURIComponent($("#formFtpUser:text").val()))
					.add_list("pwd", encodeURIComponent(eval("EVENT_NOTIFY_FTP_" + prefix + selectIdx + "_PWD")), encodeURIComponent($("#formFtpPwd:password").val()))
					.add_list("nameformatdate", eval("EVENT_NOTIFY_FTP_" + prefix + selectIdx + "_NAMEFORMATDATE"), $("select#formFtpNameFormat").val())
					.add_list("nameformattext", encodeURIComponent(eval("EVENT_NOTIFY_FTP_" + prefix + selectIdx + "_NAMEFORMATTEXT")), encodeURIComponent($("#prefixText:text").val()))
					.add_list("nameformatprefix", eval("EVENT_NOTIFY_FTP_" + prefix + selectIdx + "_NAMEFORMATPREFIX"), $("input[name='namePrefixType']:checked:radio").val());
				reqQString = QString.get_qstring();
				if(!reqQString) {
					return;
				}
				reqQString += "&group=EVENT.Notify.Ftp." + prefix + selectIdx;
				break;
			default:
				alert(GetMsgLang("04030429"));
				return false;
				break;
		}

		if($("#formFtpPort:text").val() < 1 || $("#formFtpPort:text").val() >65535 || $("#formFtpPort:text").val() == "") return;

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
			LoadParamJs(DefaultGroup, function() {
				$("#input_form").dialog('close');
				InitSetting();
				ViewLoadingSave(false);
			});
			return;
		});
		Req.Request(reqQString);
	});

	$("#btnDialogCancel").click(function(){ 
		$("#input_form").dialog('close');		
	});

	$("div#effect li.item li:not(.item-title)").each(function(){
		$(this).css("width", "450px");
	});

	$("#btnFTPTest").click(function(){
		ViewLoadingSave(true);
		Disable($("button"));

		var port = $("#formFtpPort").val();
		var account = $("#formFtpUser").val();
		var password = $("#formFtpPwd").val();
		var targetPath = $("#formFtpPath").val();
		var server = $("#formIPAddress .ip_octet:eq(0)").val() +"."+
				$("#formIPAddress .ip_octet:eq(1)").val() +"."+
				$("#formIPAddress .ip_octet:eq(2)").val() +"."+
				$("#formIPAddress .ip_octet:eq(3)").val();
		
		$.post("/uapi-cgi/admin/testaction.cgi",
												 { type: "ftp", server: server, port:port, account: account, pwd: password, targetpath: targetPath}, 
												 function(data) { 
			parseTestActionResponse(data);
			ViewLoadingSave(false);
			Enable($("button"));
		}, "text");
		/*$.get("/uapi-cgi/admin/testaction.cgi?type=ftp&server=" + server + 
											   "&port=" + port + 
											   "&account=" + account + 
											   "&pwd=" + password +
											   "&targetpath=" + targetPath, function(data) {
			parseTestActionResponse(data);
			ViewLoadingSave(false);
			Enable($("button"));
		});*/
	});

	Disable($("button"));
}

function InitSetting()
{
	var group = DefaultGroup;
	var notifyList = "";
	var notify_cnt = eval(DefaultGroup + "_NOTIFY_FTP_NBROFCOUNT");
	if(notify_cnt > 0)
		notifyList = decodeURIComponent(eval(DefaultGroup + "_NOTIFY_FTP_LIST")).split(",");

	$("select#formNotifyList").empty();
	if(notifyList == "" || notifyList == null)
	{
		return false;
	}
	for(var i=0;i<notifyList.length;i++)
	{
		var group = DefaultGroup + "_NOTIFY_FTP_" + prefix + notifyList[i];
		var valNum = eval(i+1) + "";
		var valName = eval(group + "_NAME");
		var valDes = eval(group + "_DESCRIPTION");
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
			.find("option").last().append(FillText(descListCheck, 64, "right")
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
	// Number only
	$("#formFtpPort:text").numeric();

	$("#formFtpAddr:text").ipaddress();
	$("#formIPAddress .ip_octet").css("border", "0px");
}

function changePrefixTextDisplay()
{
	$("input[name='namePrefixType']").unbind().change(function(){
		if($("input[name='namePrefixType']:checked:radio").val() == "text")
		{
			$(".prefixTextContents").css("display", "block");
		}
		else
		{
			$(".prefixTextContents").css("display", "none");
		}
	});
	$("input[name='namePrefixType']").change();
}

function changePrefixTextDisplay()
{
    $("input[name='namePrefixType']").unbind().change(function(){
        if($("input[name='namePrefixType']:checked:radio").val() == "text")
        {
            $(".prefixTextContents").css("display", "block");
        }
        else
        {
            $(".prefixTextContents").css("display", "none");
        }
    });
    $("input[name='namePrefixType']").change();
}

function EventBind()
{
	Enable($("button"));

	$("#btnAdd").click(function() {
		if($("#formNotifyList option").size() >= 8)
		{
			alert(GetMsgLang("04030440"));
			return;
		}
		$("#effect").hide();
		ResizePage(500);

		$("#input_form").dialog("option", "title", GetMsgLang("04030435"));
		$("#input_form").dialog("option", "mode", "add");
		$("#input_form").dialog('open');

		$("#formFtpPort:text").blur(function() {
			var inputValTextPort = $("#formFtpPort:text").val()-0;
			$("#formFtpPort:text").val(inputValTextPort);
			if(inputValTextPort < 1 || inputValTextPort >65535 || inputValTextPort == "")
			{
				$("#formFtpPort:text").val("21").focus();
				alert(GetMsgLang("04030430"));
			}
		});

		$("input[name='namePrefixType'][value='ip']:radio").attr("checked", "checked");
		$(".prefixTextContents").css("display", "none");

		changePrefixTextDisplay();
	});

	$("#btnModify").click(function() {
		$("#effect").hide();
		if($("#formNotifyList").val() == null)
		{
			alert(GetMsgLang("04030431"));
			return false;
		}
		
		ResizePage(500);

		$("#input_form").dialog("option", "title", GetMsgLang("04030436"));
		$("#input_form").dialog("option", "mode", "modify");
		$("#input_form").dialog('open');

		var group = DefaultGroup + "_NOTIFY_FTP_" + prefix + selectIdx;
		var IPAddressValue = eval(group+ "_ADDRESS").split(".");

		$("#formFtpPort:text").blur(function() {
			var inputValTextPort = $("#formFtpPort:text").val()-0;
			$("#formFtpPort:text").val(inputValTextPort);
			if(inputValTextPort < 1 || inputValTextPort >65535 || inputValTextPort == "")
			{
				$("#formFtpPort:text").val(decodeURIComponent(eval(group + "_PORT"))).focus();
				alert(GetMsgLang("04030430"));
			}
		});

		$("#formFtpName:text").val(eval(group + "_NAME"));
		$("#formFtpDes:text").val(eval(group + "_DESCRIPTION"));
		//$("#formFtpAddr:text").val(eval(group + "_ADDRESS"));
		$("#formFtpPort:text").val(decodeURIComponent(eval(group + "_PORT")));
		$("#formFtpPath:text").val(eval(group + "_TARGETPATH"));
		$("#formFtpUser:text").val(eval(group + "_ACCOUNT"));
		$("#formFtpPwd:password").val(eval(group + "_PWD"));
		$("select#formFtpNameFormat").val(eval(group + "_NAMEFORMATDATE"));
		$("#prefixText").val(eval(group + "_NAMEFORMATTEXT"));
		$("input[name='namePrefixType'][value='" + eval(group + "_NAMEFORMATPREFIX") + "']:radio").attr("checked", "checked");

		$("#formIPAddress .ip_octet:eq(0)").val(IPAddressValue[0]);
		$("#formIPAddress .ip_octet:eq(1)").val(IPAddressValue[1]);
		$("#formIPAddress .ip_octet:eq(2)").val(IPAddressValue[2]);
		$("#formIPAddress .ip_octet:eq(3)").val(IPAddressValue[3]);

		changePrefixTextDisplay();
	});

	$("select#formNotifyList").click(function() {
		if($(this).val() == null) return;
		selectIdx = $(this).val();
		var group = DefaultGroup + "_NOTIFY_FTP_" + prefix + selectIdx;
		ResizePage(480);

		$("#infoFtpName").html(eval(group + "_NAME"));
		$("#infoFtpDes").html(FillText(eval(group+"_DESCRIPTION"), 64, "left"));
		$("#infoFtpAddr").html(eval(group + "_ADDRESS"));
		$("#infoFtpPort").html(decodeURIComponent(eval(group + "_PORT")));
		$("#infoFtpPath").html(eval(group + "_TARGETPATH"));
		$("#infoFtpUser").html(eval(group + "_ACCOUNT"));
		$("#infoFtpNameFormat").html(eval(group + "_NAMEFORMATDATE"));

		var namePrefix = eval(group + "_NAMEFORMATPREFIX");
		var namePrefixText = "";
		if(namePrefix == "text")
			namePrefixText = "(" + eval(group + "_NAMEFORMATTEXT") + ")";

		$("#infoFtpNamePrefix").html(namePrefix + namePrefixText);

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
			alert(GetMsgLang("04030432"));
			return false;
		}

		if (!confirm(GetMsgLang("04030433")))
		{
			return false;
		}

		var Req = new CGIRequest();
		var reqQString = "action=remove&xmlschema&group=EVENT.Notify.Ftp." + prefix + selectIdx;

		var eventGroup = DefaultGroup;
		var profileList;
		var profile_cnt = eval(DefaultGroup + "PROFILE" + "_NBROFCOUNT");

		if(profile_cnt > 0)
			profileList = decodeURIComponent(eval(DefaultGroup + "PROFILE" + "_LIST")).split(",");

		for (var i = 0; i < profile_cnt; i++)
		{
			var enableList = decodeURIComponent(eval(DefaultGroup + "PROFILE" + "_P" + profileList[i].toUpperCase() + "_NOTIFICATION_FTP_ENABLELIST")).split(",");

			for (var j = 0; j < enableList.length; j++)
			{
				if(enableList[j] == selectIdx)
				{
					alert(GetMsgLang("04030434"));
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
			LoadParamJs(DefaultGroup , function() {
				InitSetting();
				ViewLoadingSave(false);
				$( "#effect" ).hide();
			});
			return;
		});
		Req.Request(reqQString);
	});
}
