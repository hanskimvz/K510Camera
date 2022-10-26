var g_defaultGroup = "EVENT";
var selectIdx = "";
var prefix = "F";
var selectNotification = "";

$(function () {
	PreCustomize();
	initEnvironment();
	initConfig();
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum = ["04070543", "04070544", "04070545", "04070546",
					"04070547", "0501"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "systemlog", 
				parent.g_langData[parent.g_configData.language]);
}

function initConfig()
{
	$.getScript("/uapi-cgi/simple_loglistjs.cgi?action=get&timekey=" + (new Date()).getTime(), function() {
		LoadParamJs(g_defaultGroup + "&SYSTEMLOG", mainRun);
	});
}

function mainRun()
{
	EventBind();
	SetRelation();
	InitSetting();
	ContentShow();
	PostCustomize();
}

function SetRelation()
{
	var systemlogGroup = "SYSTEMLOG";
	
	$("#formURL:text").ipaddress();
	$("#formIPAddress .ip_octet").css("border", "0px");

	$("#formPort:text").blur(function() {
		var inputValText = $("#formPort:text").val()-0;
		$("#formPort:text").val(inputValText);
		if(inputValText < 1 || inputValText > 65535 || inputValText == "")
		{
			$("#formPort:text").val(eval(systemlogGroup+ "_FTP_PORT")).focus();
			alert(GetMsgLang("04070543"));
		}
	});
}

function InitSetting()
{
	var group = g_defaultGroup;
	var systemlogGroup = "SYSTEMLOG";
	var notifyList = "";
	var notify_cnt = eval(g_defaultGroup + "_NOTIFY_FTP_NBROFCOUNT");
	var IPAddressValue = eval(systemlogGroup+ "_FTP_ADDRESS").split(".");

	$("#formPort:text").numeric();

	if(notify_cnt > 0)
	{
		notifyList = decodeURIComponent(eval(g_defaultGroup + "_NOTIFY_FTP_LIST")).split(",");
	}

	if(eval(systemlogGroup+"_MODE") == "auto")
	{
		$("#formFTPLogMode:checkbox").attr("checked", "checked");
	}
	else
	{
		$("#formFTPLogMode:checkbox").attr("checked", "");
	}

	$("#formName:text").val(eval(systemlogGroup+ "_FTP_NAME"));
	//$("#formURL:text").val(eval(systemlogGroup+ "_FTP_ADDRESS"));
	$("#formPort:text").val(eval(systemlogGroup+ "_FTP_PORT"));
	$("#formTargetDirectory:text").val(eval(systemlogGroup+ "_FTP_TARGETPATH"));
	$("#formID:text").val(eval(systemlogGroup+ "_FTP_ACCOUNT"));
	$("#formPassword:password").val(eval(systemlogGroup+ "_FTP_PWD"));
	$("#prefixFileType:text").val(eval(systemlogGroup+ "_FTP_PREFIXNAME"));

	$("#formIPAddress .ip_octet:eq(0)").val(IPAddressValue[0]);
	$("#formIPAddress .ip_octet:eq(1)").val(IPAddressValue[1]);
	$("#formIPAddress .ip_octet:eq(2)").val(IPAddressValue[2]);
	$("#formIPAddress .ip_octet:eq(3)").val(IPAddressValue[3]);

	$("select#formNotificationList").empty();
	if(notifyList == "" || notifyList == null)
	{
		return false;
	}
	for(var i=0;i<notifyList.length;i++)
	{
		var group = g_defaultGroup + "_NOTIFY_FTP_" + prefix + notifyList[i];
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
			$("select#formNotificationList").append("<option value='" + notifyList[i] + "'>&lrm;</option>")
			.find("option").last().append(FillText(descListCheck, descListCheck.length, "right")
				+ FillText(valName, 19, "right")
				+ FillText(valNum, 6, "right")
			);
		}
		else {
			$("select#formNotificationList").append("<option value='" + notifyList[i] + "'></option>")
			.find("option").last().append("&nbsp;"
				+ FillText(valNum, 6, "left")
				+ FillText(valName, 19, "left")
				+ FillText(descListCheck, 64, "left")
			);
		}
	}
}

function EventBind()
{
	$("#linkEncoderProfile").click(function(){
		parent.$("#leftmenu .eventConfContents + div a[href='ftpnotification.html']").click();
		parent.$("#leftmenu .eventConfContents").click();
	});
	
	$("#btnDownload").button().click(function(){
		document.location.href="/uapi-cgi/logdownload.cgi?";
	});

	$("#btnDownloadEvent").button().click(function(){
		document.location.href="/uapi-cgi/logdownload.cgi?type=event";
	});

	$("#formFTPLogBackup").button().click(function(){
		Disable($("#formFTPLogBackup"));
		StartLogBackup();
	});

	$("#btnApply").button().click(function(){
		var Req = new CGIRequest();
		var reqQString = "action=update&xmlschema";
		var IPAddressValue = $("#formIPAddress .ip_octet:eq(0)").val() +"."+ 
													$("#formIPAddress .ip_octet:eq(1)").val() +"."+ 
													$("#formIPAddress .ip_octet:eq(2)").val() +"."+ 
													$("#formIPAddress .ip_octet:eq(3)").val();

		if(IPAddressValue == "...")
		{
			IPAddressValue = "";
		}

		QString = makeQString();
		QString
			.set_action('update')
			.set_schema('xml')
			.add_list("SYSTEMLOG.mode", SYSTEMLOG_MODE, ($("#formFTPLogMode:checkbox").attr("checked") == true) ? "auto":"manual")
			.add_list("SYSTEMLOG.Ftp.name", SYSTEMLOG_FTP_NAME, $("#formName:text").val())
			.add_list("SYSTEMLOG.Ftp.address", SYSTEMLOG_FTP_ADDRESS, IPAddressValue)
			.add_list("SYSTEMLOG.Ftp.port", SYSTEMLOG_FTP_PORT, $("#formPort:text").val())
			.add_list("SYSTEMLOG.Ftp.targetpath", SYSTEMLOG_FTP_TARGETPATH, $("#formTargetDirectory:text").val())
			.add_list("SYSTEMLOG.Ftp.account", SYSTEMLOG_FTP_ACCOUNT, $("#formID:text").val())
			.add_list("SYSTEMLOG.Ftp.pwd", SYSTEMLOG_FTP_PWD, $("#formPassword:password").val())
			.add_list("SYSTEMLOG.Ftp.prefixname", SYSTEMLOG_FTP_PREFIXNAME, $("#prefixFileType:text").val());

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

			LoadParamJs(g_defaultGroup + "&SYSTEMLOG&cache", function() {
				ViewLoadingSave(false);
				InitSetting();
			});
			return;
		});
		Req.SetErrorFunc(function(){
			LoadParamJs(g_defaultGroup, function() {
				alert(GetMsgLang("0501"));
				ViewLoadingSave(false);
			});
			return;
		});
		Req.Request(reqQString);
	});

	$("#btnShowList").button().toggle(
		function(){
			$(".listLoad, .notificationList").show();
			ResizePage();
		},
		function(){
			$(".listLoad, .notificationList").hide();
			ResizePage();
		}
	);

	$("#btnLoad").button().click(function(){
		var group = g_defaultGroup + "_NOTIFY_FTP_" + prefix + selectNotification;
		if(selectNotification == "" || selectNotification == null)
		{
			alert(GetMsgLang("04070544"));
			return;
		}

		$("#formName:text").val(eval(group + "_NAME"));
		$("#formPort:text").val(decodeURIComponent(eval(group + "_PORT")));
		$("#formTargetDirectory:text").val(eval(group + "_TARGETPATH"));
		$("#formID:text").val(eval(group + "_ACCOUNT"));
		$("#formPassword:password").val(eval(group + "_PWD"));
		$("#formIPAddress .ip_octet:eq(0)").val(eval(group + "_ADDRESS").split(".")[0]);
		$("#formIPAddress .ip_octet:eq(1)").val(eval(group + "_ADDRESS").split(".")[1]);
		$("#formIPAddress .ip_octet:eq(2)").val(eval(group + "_ADDRESS").split(".")[2]);
		$("#formIPAddress .ip_octet:eq(3)").val(eval(group + "_ADDRESS").split(".")[3]);
	});

	$("select#formNotificationList").click(function(){
		selectNotification = $(this).val();
	});
}

////////////////////////////////////////////////////////////////////////////////
// Function name : StartLogBackup()
// Description     : 
// Return value    : 
////////////////////////////////////////////////////////////////////////////////
if (!String.prototype.trim) {
	String.prototype.trim = function() {
		return this.replace(/^\s+|\s+$/g,'');
	}
}

function StartLogBackup()
{
	ViewLoadingSave(true);
	$.get("/uapi-cgi/logbackup.fcgi?&timekey=" + (new Date()).getTime(), function(data) {
		var apiState = 0;
		var errordescription = "";

		//#403|ERR OPERATION|Manual Upload Fail|<description>
		var retPart = data.split("|");
		if(retPart[0] != "#403")
		{
			if(retPart[0] == "#200")
			{
				apiState = 0;
			}
			else
			{
				apiState = -1;
			}
		}
		else
		{
			apiState = -1;
			errordescription = retPart[3].trim();
		}

		if (apiState != 0)
		{
			var errorString = "";
			if (errordescription == "Server denied you to change to the given directory") {
				errorString = GetMsgLang("04070545");
			} else if (errordescription == "Access denied: 501") {
				errorString = GetMsgLang("04070546");
			} else if (errordescription == "Access denied: 530") {
				errorString = GetMsgLang("04070546");
			} else if (errordescription == "couldn't connect to host") {
				errorString = GetMsgLang("04070547");
			} else {
				errorString = GetMsgLang("0501") + "\n(" + errordescription + ")";
			}
			alert(errorString);
		}
		else
		{
			alert("FTP success.");
		}
			
		ViewLoadingSave(false);
		Enable($("#formFTPLogBackup"));
	});
}
