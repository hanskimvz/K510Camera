var g_defaultGroup = "network.ieee8021x";
var g_caFlag = 0;
var g_clientFlag = 0;
var g_clientPrivateKeyFlag = 0;

$(function () {
	PreCustomize();
	initEnvironment();
	getDataConfig_UAPI_JS(g_defaultGroup, function(data){
		initDataValue(data);
		mainRun(data);
	});
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
	$("button").button();
}

function initLanguage()
{
	var classNum = ["04041614", "04041615", "04041616", "04041617", "0501"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "ieee8021x", 
				parent.g_langData[parent.g_configData.language]);
}

function mainRun(data)
{
	initSetting(data);
	setRelation();
	eventBind(data);
	ContentShow();
	PostCustomize();
}

function setRelation()
{
	$(".removeBtnContents").css("display", "none");

	getCertState("ca", "#state_caCert");
	getCertState("client", "#state_clientCert");
	getCertState("clientprivatekey", "#state_clientPrivateKey");

	startBtnDisplayByFormChange("#caFiledata", "#btnStartCACert");
	startBtnDisplayByFormChange("#clientFiledata", "#btnStartClientCert");
	startBtnDisplayByFormChange("#clientprivatekeyFiledata", "#btnStartClientPKeyCert");
}

function initSetting(data)
{
	initFormUI(data);
}

function eventBind(data)
{
	$("#network_ieee8021x_eaptype").unbind().change(function() {
		$(".clientCertContents, .clientPrivateKeyContents")
			.css("display", ($(this).val() == "peap") ? "none" : "block");

		ResizePage();
	});
	$("#network_ieee8021x_eaptype").change();

	formSendBind("#form_ca", "ca", "#state_caCert", "#btnStartCACert", "#caFiledata");
	formSendBind("#form_client", "client", "#state_clientCert", "#btnStartClientCert", "#clientFiledata");
	formSendBind("#form_clientPrivateKey", "clientprivatekey", "#state_clientPrivateKey", "#btnStartClientPKeyCert", "#clientprivatekeyFiledata");

	removeCertBind("#btnRemoveCACert", "ca", "#state_caCert");
	removeCertBind("#btnRemoveClientCert", "client", "#state_clientCert");
	removeCertBind("#btnRemoveClientPKeyCert", "clientprivatekey", "#state_clientPrivateKey");

	$("#btnApply").unbind().click(function() {
		var enableValue = $("#network_ieee8021x_enable:checkbox").attr("checked");
		var eapTypeValue = $("#network_ieee8021x_eaptype").val();

		if(enableValue)
		{
			if(eapTypeValue == "tls")
			{
				if(g_caFlag != 1 || g_clientFlag != 1 || g_clientPrivateKeyFlag != 1)
				{
					alert(GetMsgLang("04041616"));
					$("#network_ieee8021x_enable:checkbox").attr("checked", "");
					return;
				}
			}
			else
			{
				if(g_caFlag != 1)
				{
					alert(GetMsgLang("04041617"));
					$("#network_ieee8021x_enable:checkbox").attr("checked", "");
					return;
				}
			}
		}

		var setArray = setDataValue(data);
		var reqQString = "action=update&xmlschema";
		var contentsType = "data";
		QString = makeQString();
		QString.set_action('update').set_schema('xml');

		for(var i=0;i<setArray.length;i++)
		{
			QString.add_list(setArray[i].group, setArray[i].dbValue, setArray[i].formValue);
		}

		reqQString = QString.get_qstring();
		if(!reqQString) return;

		var req = new CGIRequest();
		req.SetContentsType(contentsType);
		req.SetStartFunc(ViewLoadingSave);
		req.SetCallBackFunc(function(xml){
			var ret = CGIResponseCheck(0, xml);
			if(ret != 0) {
				var errormessage = "";
				if(ret != -2) {
					errormessage = "\n" + ret;
				}
				alert(GetMsgLang("0501") + errormessage);
			}

			getDataConfig_UAPI_JS(g_defaultGroup, function(data) {
				initDataValue(data);
				initSetting(data);
				eventBind(data);
				ViewLoadingSave(false);
			});

			return;
		});
		req.Request(reqQString);
	});
}

function displayRemoveButton(stateID)
{
	var state = $(stateID).text();
	var btnRemoveID = "";
	var noConfigString = "No certificate configured.";

	switch(stateID)
	{
	case "#state_caCert": 
		g_caFlag = (state == noConfigString) ? 0 : 1;
		btnRemoveID = "#btnRemoveCACert";
		break;
	case "#state_clientCert": 
		g_clientFlag = (state == noConfigString) ? 0 : 1;
		btnRemoveID = "#btnRemoveClientCert";
		break;
	case "#state_clientPrivateKey": 
		g_clientPrivateKeyFlag = (state == noConfigString) ? 0 : 1;
		btnRemoveID = "#btnRemoveClientPKeyCert";
		break;
	default: 
		btnRemoveID = "";
		break;
	}

	var displayType = "inline-block";
	if(state == "No certificate configured.")
		displayType = "none";

	$(btnRemoveID).css("display", (state == noConfigString) ? "none" : "inline-block");
}

function getCertState(type, stateID)
{
	$.get("/uapi-cgi/certmngr.cgi?action=querystate&group=installstd&type=" + type + "&_=" + (new Date()).getTime(), function(data) {
		$(stateID).text($("description", data).text());
		displayRemoveButton(stateID);
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

function startBtnDisplayByFormChange(fileInputID, btnID)
{
	$(fileInputID).unbind().change(function(){
		var displayOption = "none";
		if($(this).val() != "")
		{
			displayOption = "inline-block";
		}

		$(btnID).css("display", displayOption).attr("value", GetMsgLang("04041614")).button();
	});
}

function formSendBind(formID, type, stateID, startBtnID, fileInputID)
{
	$(formID).unbind().ajaxForm({
		success : function() {
			getCertState(type, stateID);
			$(startBtnID).css("display", "none");

			switch(formID)
			{
			case "#form_ca": 
				document.getElementById("form_ca").reset();
				break;
			case "#form_client": 
				document.getElementById("form_client").reset();
				break;
			case "#form_clientPrivateKey": 
				document.getElementById("form_clientPrivateKey").reset();
				break;
			default:
				break;
			}
		}
	});
}

function removeCertBind(removeBtnID, type, stateID)
{
	$(removeBtnID).unbind().click(function(){
		var enableValue = g_dataArray["network_ieee8021x_enable"];
		if(enableValue == "yes")
		{
			if (!confirm(GetMsgLang("04041615")))
			{
				return false;
			}

			var reqQString = "action=update&xmlschema";
			var contentsType = "data";
			QString = makeQString();
			QString.set_action('update').set_schema('xml');
			QString.add_list("network.ieee8021x.enable", null, "no");

			reqQString = QString.get_qstring();
			if(!reqQString) return;

			var req = new CGIRequest();
			req.SetContentsType(contentsType);
			req.SetStartFunc(ViewLoadingSave);
			req.SetAsyn(false);
			req.SetCallBackFunc(function(xml){
				var ret = CGIResponseCheck(0, xml);
				if(ret != 0) {
					var errormessage = "";
					if(ret != -2) {
						errormessage = "\n" + ret;
					}
					alert(GetMsgLang("0501") + errormessage);
				}

				getDataConfig_UAPI_JS(g_defaultGroup, function(data) {
					initDataValue(data);
					initSetting(data);
					eventBind(data);
					ViewLoadingSave(false);
				});
			});
			req.Request(reqQString);
		}

		$.get("/uapi-cgi/certmngr.cgi?action=remove&group=installstd&type=" + type + "&_=" + (new Date()).getTime(), function(data) {
			getCertState(type, stateID);
		});
	});
}