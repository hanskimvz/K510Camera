var g_defaultGroup = "ADREC";

$(function () {
	PreCustomize();
	initEnvironment();
	initBrand();
	LoadParamJs(g_defaultGroup , mainRun);
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum = ["0501", "04140513"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "ftpstorage", 
				parent.g_langData[parent.g_configData.language]);
}

function initBrand()
{
	$("#prefixFileType").val(parent.g_brand.serial);
}

function mainRun()
{
	InitSetting();
	SetRelation();
	EventBind();
	ContentShow();
	PostCustomize();
}

function SetRelation()
{
	$("#formURL:text").ipaddress();
	$("#formIPAddress .ip_octet").css("border", "0px");

	$("#formPort:text").blur(function() {
		var adrecFtpPortValue = $("#formPort:text").val()-0;
		$("#formPort:text").val(adrecFtpPortValue);
		if(adrecFtpPortValue < 1 || adrecFtpPortValue > 65535 || adrecFtpPortValue == "")
		{
			$("#formPort:text").val(eval("ADREC_FTP_PORT")).focus();
			alert(GetMsgLang("04140513"));
		}
	});
}

function InitSetting()
{
	var group = g_defaultGroup + "_FTP";

	$("#formFriendlyName:text").keyup(function(){
		LimitCharac("formFriendlyName:text", 32);
	});

	$("#formTargetDirectory:text").keyup(function(){
		LimitCharac("formTargetDirectory:text", 64);
	});

	$("#formID:text").keyup(function(){
		LimitCharac("formID:text", 128);
	});

	$("#formPassword").keyup(function(){
		LimitCharac("formPassword", 32);
	});

	$("#formPort:text").numeric();

	$("#formFriendlyName:text").val(eval(group + "_NAME"));
	$("#formURL:text").val(eval(group + "_ADDRESS"));
	$("#formPort:text").val(eval(group + "_PORT"));
	$("#formTargetDirectory:text").val(eval(group + "_TARGETPATH"));
	$("#formID:text").val(eval(group + "_ACCOUNT"));
	$("#formPassword:password").val(eval(group + "_PWD"));
}

function EventBind()
{
	if($("#formPort:text").val() < 1 || $("#formPort:text").val() > 65535 || $("#formPort:text").val() == "") return;

	var Req = new CGIRequest();

	$("#btnApply").button().click(function() {
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
			.add_list("ADREC.Ftp.name", ADREC_FTP_NAME, encodeURIComponent($("#formFriendlyName:text").val()))
			.add_list("ADREC.Ftp.address", ADREC_FTP_ADDRESS, encodeURIComponent(IPAddressValue))
			.add_list("ADREC.Ftp.port", ADREC_FTP_PORT, encodeURIComponent($("#formPort:text").val()))
			.add_list("ADREC.Ftp.targetpath", ADREC_FTP_TARGETPATH, encodeURIComponent($("#formTargetDirectory:text").val()))
			.add_list("ADREC.Ftp.account", ADREC_FTP_ACCOUNT, encodeURIComponent($("#formID:text").val()))
			.add_list("ADREC.Ftp.pwd", ADREC_FTP_PWD, encodeURIComponent($("#formPassword:password").val()));
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
			LoadParamJs(g_defaultGroup + "&cache", function() {
				InitSetting();
				ViewLoadingSave(false);
			});

			return;
		});
		Req.Request(reqQString);
	});
}