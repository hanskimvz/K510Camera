var g_defaultGroup = "NETWORK";
var g_isCertInstall = false;

$(function () {
	PreCustomize();
	initEnvironment();
	LoadParamJs("NETWORK", mainRun);
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum = ["04040214", "04040215", "04040216", "0501", "04040236", 
					"04040237", "04040238", "04040239", "04040240", "04040247"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "http", 
				parent.g_langData[parent.g_configData.language]);
}

function mainRun()
{
	$("button, input[type='submit']").button();
	InitForm();
	InitSetting();
	SetRelation();
	EventBind();
	ContentShow();
	PostCustomize();
}

function dialogConfig(selector, wVal, hVal, openFunc)
{
	if(wVal == undefined) wVal = "auto";
	if(hVal == undefined) hVal = "auto";

	$("#" + selector).dialog({
		autoOpen: false,
		width: wVal,
		height: hVal,
		modal: true,
		resizable: false,
		position: [115, 30],
		open: function() {
			if(openFunc != undefined || openFunc != null) 
			{
				openFunc();
			}
		}
	});
}

function InitForm()
{
	dialogConfig("selfCertDialog", 440, "auto", function(){
		$("#selfCertDialog input[type='text']").val("");
		$("#selfCertDialog #selfCertValidity").val(365);
	});

	dialogConfig("certReqDialog", 440, "auto", function(){
		$("#certReqDialog input[type='text']").val("");
	});

	dialogConfig("countryCodeDialog", 440, 550);
	$("#selfCertValidity:text").numeric();

	call_xmlData("/xmldata/countrycode.xml", false, function(xml){
		$(xml).find("countries").children().each(function(){
			var name = $(this).attr('name');
			var code = $(this).attr('alpha-2');
			var codeListStr = "<li class='item'>" + 
							  "	<ul>" + 
							  "		<li class='item-title-mini'>" + name + "</li>" + 
							  "		<li>" + code + "</li>" + 
							  "	</ul>" +
							  "</li>";

			$("#countryCodeList").append(codeListStr);
		});
	});

	EvenOdd(parent.g_configData.skin);
	$("#countryCodeList ul").click(function(){
		var curCountryCode = $(this).children().last().text();
		$("#selfCertCountry, #certReqCountry").val(curCountryCode);
		$("#countryCodeDialog").dialog('close');
	});
}

function propertyRemoveBtnEnable(stateID, propertyID, removeID, defaultStr)
{
	if($("#" + stateID).val() == defaultStr)
	{
		Disable($("#" + propertyID));
		Disable($("#" + removeID));
	}
	else
	{
		Enable($("#" + propertyID));
		Enable($("#" + removeID));
	}
}

function getFileExtension(filePath)
{
	var lastIndex	= filePath.lastIndexOf('.');

	if(lastIndex != -1)
		return filePath.substring(lastIndex+1, filePath.len);
	else
		return "";
}

function SetRelation()
{
	$("input[name='formHTTPSet']").change(function(){
		var selectValue = $("input[name='formHTTPSet']:checked:radio").val();
		$(".certificateContents").css("display", selectValue == "yes" ? "block" : "none");
		ResizePage();
	});
	$("input[name='formHTTPSet']").change();

	$("#Filedata").change(function(){
		var fileExtension = getFileExtension($(this).val());
		if(fileExtension.toLowerCase() != "pem")
		{
			$("#submitStart").css("display", "none");
			uconlog("[Weblog] The extension of this file is not pem.");
			return;
		}

		$("#submitStart").css("display", "inline").attr("value",GetMsgLang("04040247"));
	});


}

function changeCertReqState()
{
	$.get("/uapi-cgi/certmngr.cgi?action=querystate&group=certreq" + "&_=" + (new Date()).getTime(), function(data) {
		$("#certReqState").val($("description", data).text());
		propertyRemoveBtnEnable("certReqState", "certReqProperty", "certReqRemove", "No certificate request created.");
	});
}

function changeInstallCertState()
{
	$.get("/uapi-cgi/certmngr.cgi?action=querystate&group=installcert" + "&_=" + (new Date()).getTime(), function(data) {
		var installCertValue = $("description", data).text();

		g_isCertInstall = (installCertValue == "No certificate configured.") ? false : true;
		$("#installCertState").val(installCertValue);

		propertyRemoveBtnEnable("installCertState", "installCertProperty", "installCertRemove", "No certificate configured.");
		jqEnableControl($("#Filedata"), $("#installCertState").val() == "No certificate configured.");
	});
}

function InitSetting()
{
	$("input[name='formHTTPSet'][value='" + eval(g_defaultGroup + "_HTTPS_ENABLE") + "']:radio").attr("checked", "checked");

	$("#formHttpPort:text").val(eval(g_defaultGroup+ "_HTTP_PORT"));
	$("#formHttpsPort:text").val(eval(g_defaultGroup+ "_HTTPS_PORT"));
	$("select#formHTTPAuthType").val(eval(g_defaultGroup+"_HTTP_AUTHENTYPE"));
	changeCertReqState();
	changeInstallCertState();
}

function openDialog(selector, titleName)
{
	$("#" + selector).dialog("option", "title", titleName);
	$("#" + selector).dialog('open');
}

function selfCertInstallBtnAllow(selector, defaultStr, alertStr)
{
	if($("#" + selector).val() != defaultStr)
	{
		return -1;
	}
	return 0;
}

function propertyTextAreaClose(propertyID, clickFormID)
{
	var property = $("." + propertyID);
	if(property.css("display") == "block")
	{
		$("#" + clickFormID).click();
	}
}

function isTextEmpty(selector)
{
	var resultValue = false;
	$("#" + selector + " input[type='text']").each(function(){
		if($(this).val() == undefined || $(this).val() == "")
		{
			resultValue = true;
		}
	});

	return resultValue;
}

function checkTextLimit(selector, minRange, maxRange)
{
	if($(selector).val() < minRange || $(selector).val() > maxRange || $(selector).val() == "")
	{
		return false;
	}
	return true;
}

function EventBind()
{
	$("#formHttpPort:text").unbind().blur(function() {
			var inputValTextHttpPort = $("#formHttpPort:text").val()-0;
			$("#formHttpPort:text").val(inputValTextHttpPort);
		if(inputValTextHttpPort < 1 || inputValTextHttpPort > 65535 || inputValTextHttpPort === "")
		{
			$("#formHttpPort:text").val(eval("NETWORK_HTTP_PORT")).focus();
			alert(GetMsgLang("04040214"));
		}
	});
	$("#formHttpsPort:text").unbind().blur(function() {
			var inputValTextHttpsPort = $("#formHttpsPort:text").val()-0;
			$("#formHttpsPort:text").val(inputValTextHttpsPort);
		if(inputValTextHttpsPort < 1 || inputValTextHttpsPort > 65535 || inputValTextHttpsPort === "")
		{
			$("#formHttpsPort:text").val(eval("NETWORK_HTTPS_PORT")).focus();
			alert(GetMsgLang("04040214"));
		}
	});
	$("#formHttpPort:text").numeric();
	$("#formHttpsPort:text").numeric();

	$("#btnApply").click(function() {
		var Req = new CGIRequest();
		var reqQString = "action=update&xmlschema";

		var httpsSettingValue = $("input[name='formHTTPSet']:checked:radio").val();
		if(httpsSettingValue == "yes")
		{
			if(g_isCertInstall == false)
			{
				alert(GetMsgLang("04040236"));
				return;
			}
		}

		if(encodeURIComponent($("#formHttpPort:text").val()) == encodeURIComponent($("#formHttpsPort:text").val()))
		{
			alert(GetMsgLang("04040215"));
			return; 
		}

		QString = makeQString();
		QString
		.set_action('update')
		.set_schema('xml')
		.add_list("NETWORK.Https.enable", NETWORK_HTTPS_ENABLE, httpsSettingValue)
		.add_list("NETWORK.Http.authentype", NETWORK_HTTP_AUTHENTYPE, $("select#formHTTPAuthType").val())
		.add_list("NETWORK.Http.port", NETWORK_HTTP_PORT, encodeURIComponent($("#formHttpPort:text").val()))
		.add_list("NETWORK.Https.port", NETWORK_HTTPS_PORT, encodeURIComponent($("#formHttpsPort:text").val()));

		reqQString = QString.get_qstring();

		if(!reqQString) {
			return;
		}

		Req.SetStartFunc(ViewLoadingSave);
		alert(GetMsgLang("04040216"));

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

	$("#createSelfCert").click(function(){
		if(selfCertInstallBtnAllow("installCertState", "No certificate configured.", 
			"A certificate already exists. To create and install a new certificate, first remove the old one.") < 0)
		{
			alert(GetMsgLang("04040238"));
			return;
		}

		openDialog("selfCertDialog", GetMsgLang("04040218"));
	});

	$("#createCertReq").click(function(){
		if(selfCertInstallBtnAllow("certReqState", "No certificate request created.", 
			"A certificate request already exists. To create a new request, first remove the old one.") < 0)
		{
			alert(GetMsgLang("04040239"));
			return;
		}

		openDialog("certReqDialog", GetMsgLang("04040221"));
	});

	$("#certReqProperty").toggle(
		function(){
			$.get("/uapi-cgi/certmngr.cgi?action=queryproperty&group=certreq" + "&_=" + (new Date()).getTime(), function(data) {
				$(".certReqPropertyArea pre").text(data).css("display", "block");
				ResizePage();
			});
		},
		function(){
			$(".certReqPropertyArea pre").css("display", "none");
			ResizePage();
		}
	);

	$("#installCertProperty").toggle(
		function(){
			$.get("/uapi-cgi/certmngr.cgi?action=queryproperty&group=installcert" + "&_=" + (new Date()).getTime(), function(data) {
				$(".installCertPropertyArea pre").text(data).css("display", "block");
				ResizePage();
			});
		},
		function(){
			$(".installCertPropertyArea pre").css("display", "none");
			ResizePage();
		}
	);

	$("#certReqRemove").click(function(){ 
		propertyTextAreaClose("certReqPropertyArea pre", "certReqProperty");
		$.get("/uapi-cgi/certmngr.cgi?action=remove&group=certreq" + "&_=" + (new Date()).getTime(), function(data) {
			changeCertReqState();
		});
	});
	
	$("#installCertRemove").click(function(){ 
		propertyTextAreaClose("installCertPropertyArea pre", "installCertProperty");
		$.get("/uapi-cgi/certmngr.cgi?action=remove&group=installcert" + "&_=" + (new Date()).getTime(), function(data) {
			changeInstallCertState();
		});
	});

	$("#selfCertDialogBtnOk").click(function(){
		if(isTextEmpty("selfCertDialog"))
		{
			alert(GetMsgLang("04040237"));
			return;
		}

		if(!checkTextLimit("#selfCertValidity:text", 1, 9999)) return;

		var reqStr =	"action=createselfcert" +
									"&country=" + $("#selfCertCountry").val() +
									"&state=" + $("#selfCertState").val() +
									"&local=" + $("#selfCertLocality").val() +
									"&organization=" + $("#selfCertOrganization").val() +
									"&organizationunit=" + $("#selfCertOrganizationUnit").val() +
									"&commonname=" + $("#selfCertCommonName").val() +
									"&days=" + $("#selfCertValidity").val();

		ViewLoadingSave(true);
		$.get("/uapi-cgi/certmngr.cgi?" + reqStr + "&_=" + (new Date()).getTime(), function(data) {
			ViewLoadingSave(false);
			changeInstallCertState();
			changeCertReqState();
			$("#selfCertDialog").dialog('close');
		});
	});

	$("#certReqDialogBtnOk").click(function(){
		if(isTextEmpty("certReqDialog"))
		{
			alert(GetMsgLang("04040237"));
			return;
		}

		var reqStr =	"action=createcert" +
									"&country=" + $("#certReqCountry").val() +
									"&state=" + $("#certReqStateProvince").val() +
									"&local=" + $("#certReqLocality").val() +
									"&organization=" + $("#certReqOrganization").val() +
									"&organizationunit=" + $("#certReqOrganizationUnit").val() +
									"&commonname=" + $("#certReqCommonName").val();

		ViewLoadingSave(true);
		$.get("/uapi-cgi/certmngr.cgi?" + reqStr + "&_=" + (new Date()).getTime(), function(data) {
			ViewLoadingSave(false);
			changeInstallCertState();
			changeCertReqState();
			$("#certReqDialog").dialog('close');
		});
	});

	$("#selfCertDialogBtnCancel").click(function(){ 
		$("#selfCertDialog").dialog('close');
	});

	$("#certReqDialogBtnCancel").click(function(){ 
		$("#certReqDialog").dialog('close');
	});

	$("form").ajaxForm({
		success : function() {
			changeInstallCertState();
			$("#submitStart").css("display", "none");
			$("#Filedata").val("");
		}
	});

	$("#selfCertCountry, #certReqCountry").click(function(){
		openDialog("countryCodeDialog", GetMsgLang("04040229"));
	});

	preventInput("#selfCertCountry");
	preventInput("#certReqCountry");
}
