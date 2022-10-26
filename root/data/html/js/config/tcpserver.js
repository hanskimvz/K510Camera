var g_defaultGroup = "EVENT";
var selectIdx = "";
var gKeyword = [	
	"CH_ID",	
	"CFG_INFO",	
	"EV_ID",	
	"EV_DESC",	
	"TIMESTAMP",	
	"CT_ID",	
	"CT_NAME",	
	"CT_VAL",	
	"ST_NO",	
	"ZN_BIT",	
	"ZN_MASK",	
	"ZN_IDX",	
	"OBJ_SZ",	
	"MD_ENDIS",	
	"SENSITIVITY",	
	"PT_NUM",	
	"PT_POS",	
	"BTARY_ENDIS",	
	"ZNINFO_ENDIS",	
	"ALMINFO_ENDIS",	
	"INTERFACE",	
	"PREV_IP",	
	"PREV_SUBNET",	
	"PREV_GATEWAY",	
	"PREV_DNS1",	
	"PREV_DNS2",	
	"CURR_IP",	
	"CURR_SUBNET",	
	"CURR_GATEWAY",	
	"CURR_DNS1",	
	"CURR_DNS2",	
	"DSPLOAD",	
	"FPS",	
	"BITRATE",	
	"COUNT",	
	"PREV_MASK",	
	"CURR_MASK",	
	"TEMP_CELSIUS",	
	"TEMP_CELSIUS_PRECISION3",	
	"TEMP_FAHRENHEIT",	
	"TEMP_FAHRENHEIT_PRECISION3",	
	"HEATER",
	"FAN",
	"SYS_TYPE",	
	"SYS_ACTION",	
	"SYS_INFO",	
	"PACKETLEN",	
	"DEVIP",	
	"UNITNAME",	
	"DATETIME",	
	"DTS",	
	"MSGTYPE",	
	"MSGINFO",	
	"RULENAME",
	"EOS"
];


var gVcaConfigKeywords = [
	"CH_ID",	
	"CFG_INFO"
];

var gVcaAlarmKeywords = [
	"CH_ID",	
	"EV_DESC",
	"TIMESTAMP"
];

var gVcaCounterKeywords = [
	"CH_ID",	
	"EV_DESC",
	"TIMESTAMP"
];

var gMdEnableKeywords = [
	"MD_ENDIS"
];

var gMdConfigKeywords = [
	"CH_ID",
	"MD_ENDIS",	
	"ST_NO",
	"ZN_IDX",
	"SENSITIVITY",	
	"OBJ_SZ",
	"PT_NUM",	
	"PT_POS"
];

var gMdDetectedKeywords = [
	"CH_ID",	
	"ST_NO",
	"ZN_BIT",	
	"ZN_MASK",
	"OBJ_SZ",
	"TIMESTAMP"
];

var gNetworkKeywords = [
	"INTERFACE",	
	"PREV_IP",	
	"PREV_SUBNET",	
	"PREV_GATEWAY",	
	"PREV_DNS1",	
	"PREV_DNS2",	
	"CURR_IP",	
	"CURR_SUBNET",	
	"CURR_GATEWAY",	
	"CURR_DNS1",	
	"CURR_DNS2"
];

var gDidoKeywords = [
	"COUNT",	
	"PREV_MASK",	
	"CURR_MASK"
];

var gTemperKeywords = [
	"TEMP_CELSIUS",	
	"TEMP_CELSIUS_PRECISION3",	
	"TEMP_FAHRENHEIT",	
	"TEMP_FAHRENHEIT_PRECISION3",
	"HEATER",
	"FAN"
];

var gSystemKeywords = [
	"COUNT",	
	"PREV_MASK",	
	"CURR_MASK"
];

var gMsgHeaderKeywords = [
	"EOS",
	"PACKETLEN",
	"DEVIP",
	"UNITNAME",	
	"DATETIME",	
	"DTS",	
	"MSGTYPE",	
	"MSGINFO",
	"RULENAME"
];

var gDefaultFormat = [
	"ch=$CH_ID$&type=config&info=$CFG_INFO$",	
	"ch=$CH_ID$&type=event&$EV_DESC$&timestamp=$TIMESTAMP$",	
	"ch=$CH_ID$&type=counting&$EV_DESC$&timestamp=$TIMESTAMP$",	
	"configmask=1&enable=$MD_ENDIS$",	
	"configmask=8&enable=$MD_ENDIS$&ch=$CH_ID$&streamno=0&zoneidx=$ZN_IDX$d&sensitivity=$SENSITIVITY$&objectsize=$OBJ_SZ$&pointnum=4&pos=$PT_POS$",
	"configmask=0&ch=$CH_ID$&streamno=$ST_NO$&zonebit=$ZN_BIT$&zonemask=$ZN_MASK$&timestamp=$TIMESTAMP$&objectsize=$OBJ_SZ$",	
	"interface=$INTERFACE$&prev=$PREV_IP$,$PREV_SUBNET$,$PREV_GATEWAY$,$PREV_DNS1$,$PREV_DNS2$&curr=$CURR_IP$,$CURR_SUBNET$,$CURR_GATEWAY$,$CURR_DNS1$,$CURR_DNS2$",	
	"count=$COUNT$&prevmask=$PREV_MASK$&currmask=$CURR_MASK$",	
	"celsius=$TEMP_CELSIUS$,$TEMP_CELSIUS_PRECISION3$&farhrenheit=$TEMP_FAHRENHEIT$,$TEMP_FAHRENHEIT_PRECISION3$&heater=$HEATER$&fan=$FAN$",
	"count=$COUNT$&prevmask=$PREV_MASK$&currmask=$CURR_MASK$",	
	"DOOFTEN$EOS$$PACKETLEN$$EOS$EVENT/1.0\nip=$DEVIP$\nunitname=$UNITNAME$\ndatetime=$DATETIME$\ndts=$DTS$\ntype=$MSGTYPE$\ninfo=$MSGINFO$\n"
];

$(function () {
	PreCustomize();
	initEnvironment();
	initBrand();
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
	var classNum = ["04030733", "04030734", "04030735", "04030736", "0501", "04030739", "04030740"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "tcpserver", 
				parent.g_langData[parent.g_configData.language]);
}

function initBrand()
{

	jqDisplayCtrl(".mdContents", "rs51c0b" != parent.g_brand.imgDevice && "mdc200s" != parent.g_brand.imgDevice && "mdc600s" != parent.g_brand.imgDevice);
	jqDisplayCtrl(".didoContents", "rs51c0b" != parent.g_brand.imgDevice);
}

function Load()
{
	InitSetting();
	SetRelation();
	EventBind();
	ContentShow();
	PostCustomize();
}

function InitSetting()
{
	$("#formTcpPort:text").blur(function() {
			var inputValTextTcpPort = $("#formTcpPort:text").val()-0;
			$("#formTcpPort:text").val(inputValTextTcpPort);
		if(inputValTextTcpPort < 1 || inputValTextTcpPort > 65535 || inputValTextTcpPort == "")
		{
			$("#formTcpPort:text").val(eval(g_defaultGroup+ "_NOTIFY_TCP_PORT")).focus();
			alert(GetMsgLang("04030733"));
		}
	});
	$("#formTcpPort:text").val(eval(g_defaultGroup+ "_NOTIFY_TCP_PORT"));
	
		$("#stream_tab").tabs({
		select: function(event, ui)
	{
		ResizePage(700);
	}
	});
	InitForm();
}

function SetRelation()
{
	$("#formTcpPort:text").numeric();
}

function EventBind()
{
	Enable($("button"));
	var Req = new CGIRequest();
	if ($("#formTcpPort:text").val() < 1 || $("#formTcpPort:text").val() > 65535 || $("#formTcpPort:text").val() == "") return;

	$("#btnApply").button().click(function() {
		var reqQString = "action=update&xmlschema";

		QString = makeQString();
		QString
			.set_action('update')
			.set_schema('xml')
			.add_list("EVENT.Notify.Tcp.port", EVENT_NOTIFY_TCP_PORT, encodeURIComponent($("#formTcpPort:text").val()));
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
			LoadParamJs(g_defaultGroup + "&cacne", function() {
				InitSetting();
				ViewLoadingSave(false);
			});

			return;
		});
		Req.Request(reqQString);
	});

	$("#linkcustomaizeventfmt").button().click(function(){
		ResizePage(700);
	$("#msgfmt_form").dialog("option", "title", GetMsgLang("04030739"));
	$("#msgfmt_form").dialog('open');
	});

	$("#idck_enablecusheader").change(function() {
		if($("#idck_enablecusheader").attr("checked") == true)
		{
			$("#idtext_cusheader").attr("disabled", false);
			$("#idtext_cusheader").val(eval("EVENT_NOTIFY_MESSAGE_CUSTOMIZEDHEADER_FMT").replace(/\\n/g, "\n").replace(/@/g, "&"));
		}
		else
		{
			$("#idtext_cusheader").attr("disabled", true);
			$("#idtext_cusheader").val(gDefaultFormat[10]);
		}
	});

	$("input[name='idradio_vcaconfigformat']").change(function(){
			if($("input[name='idradio_vcaconfigformat']:checked:radio").val() == "custom")
			{
				$("#idtext_vcaconfigformat").attr("disabled", false);
			$("#idtext_vcaconfigformat").val(eval("EVENT_NOTIFY_MESSAGE_VCA_CONFIG_FMT").replace(/@/g, "&"));
			}
			else
			{
				$("#idtext_vcaconfigformat").attr("disabled", true);
			$("#idtext_vcaconfigformat").val(gDefaultFormat[0]);
			}
	});

	$("input[name='idradio_vcaalarmformat']").change(function(){
			if($("input[name='idradio_vcaalarmformat']:checked:radio").val() == "custom")
			{
				$("#idtext_vcaalarmformat").attr("disabled", false);
			$("#idtext_vcaalarmformat").val(eval("EVENT_NOTIFY_MESSAGE_VCA_ALARM_FMT").replace(/@/g, "&"));
			}
			else
			{
				$("#idtext_vcaalarmformat").attr("disabled", true);
			$("#idtext_vcaalarmformat").val(gDefaultFormat[1]);
			}
	});

	$("input[name='idradio_vcacounterformat']").change(function(){
			if($("input[name='idradio_vcacounterformat']:checked:radio").val() == "custom")
			{
				$("#idtext_vcacounterformat").attr("disabled", false);
			$("#idtext_vcacounterformat").val(eval("EVENT_NOTIFY_MESSAGE_VCA_COUNTER_FMT").replace(/@/g, "&"));
			}
			else
			{
				$("#idtext_vcacounterformat").attr("disabled", true);
			$("#idtext_vcacounterformat").val(gDefaultFormat[2]);
			}
	});

	$("input[name='idradio_mddetectedformat']").change(function(){
			if($("input[name='idradio_mddetectedformat']:checked:radio").val() == "custom")
			{
				$("#idtext_mddetectedformat").attr("disabled", false);
			$("#idtext_mddetectedformat").val(eval("EVENT_NOTIFY_MESSAGE_MD_DETECTED_FMT").replace(/@/g, "&"));
			}
			else
			{
				$("#idtext_mddetectedformat").attr("disabled", true);
			$("#idtext_mddetectedformat").val(gDefaultFormat[5]);
			}
	});

	$("input[name='idradio_networkformat']").change(function(){
			if($("input[name='idradio_networkformat']:checked:radio").val() == "custom")
			{
				$("#idtext_networkformat").attr("disabled", false);
			$("#idtext_networkformat").val(eval("EVENT_NOTIFY_MESSAGE_NETWORK_FMT").replace(/@/g, "&"));
			}
			else
			{
				$("#idtext_networkformat").attr("disabled", true);
			$("#idtext_networkformat").val(gDefaultFormat[6]);
			}
	});

	$("input[name='idradio_didoformat']").change(function(){
			if($("input[name='idradio_didoformat']:checked:radio").val() == "custom")
			{
				$("#idtext_didoformat").attr("disabled", false);
			$("#idtext_didoformat").val(eval("EVENT_NOTIFY_MESSAGE_DIDO_FMT").replace(/@/g, "&"));
			}
			else
			{
				$("#idtext_didoformat").attr("disabled", true);
			$("#idtext_didoformat").val(gDefaultFormat[7]);
			}
	});

	$("input[name='idradio_sysformat']").change(function(){
			if($("input[name='idradio_sysformat']:checked:radio").val() == "custom")
			{
				$("#idtext_sysformat").attr("disabled", false);
			$("#idtext_sysformat").val(eval("EVENT_NOTIFY_MESSAGE_SYSTEM_FMT").replace(/@/g, "&"));
			}
			else
			{
				$("#idtext_sysformat").attr("disabled", true);
			$("#idtext_sysformat").val(gDefaultFormat[9]);
			}
	});

	/*
		delete tooltip(2014.02.20)
		restore tooltip(2014.09.22)
	*/
	$("#idtext_cusheader").mouseover(function () {
		var example = "DOOFTEN176EVENT/1.0<br/>\
						ip=192.168.1.194<br/>\
						unitname=Tcp Event<br/>\
						datetime=Thu Jul 11 08:07:14 2013<br/>\
						dts=1373530034.967525<br/>\
						type=temperature<br/>\
						info=celsius=56,666&#38farhrenheit=133,998";
		var sz = setupKWTooltip(gMsgHeaderKeywords, example);
		xtooltip_show("idtext_cusheader", sz, 0,0);
	});

	$("#idtext_cusheader").mouseout( function() {
		xtooltip_hide("tooltip");
	});

	$("#idtext_vcaconfigformat").mouseover(function () {
		var example = "ch=0&#38type=config&#38info=zone";
		var sz = setupKWTooltip(gVcaConfigKeywords, example);
		xtooltip_show("idtext_vcaconfigformat", sz, 0,0);
	});

	$("#idtext_vcaconfigformat").mouseout( function() {
		xtooltip_hide("tooltip");
	});

	$("#idtext_vcaalarmformat").mouseover(function () {
		var example = "ch=0&#38type=event&#38ev8[sts=end,tp=presence,zn=0,rl=0,bb=26672:29780:9107:8046,oc=1,et=15002:909]&#38timestamp= 15493.619118";
		var sz = setupKWTooltip(gVcaAlarmKeywords, example);
		xtooltip_show("idtext_vcaalarmformat", sz, 0,0);
	});

	$("#idtext_vcaalarmformat").mouseout( function() {
		xtooltip_hide("tooltip");
	});

	$("#idtext_vcacounterformat").mouseover(function () {
		var example = "ch=0&#38type=counting&#38ct1[name=Counter 0,val=131]&#38timestamp=15493.619118";
		var sz = setupKWTooltip(gVcaCounterKeywords, example);
		xtooltip_show("idtext_vcacounterformat", sz, 0,0);
	});

	$("#idtext_vcacounterformat").mouseout( function() {
		xtooltip_hide("tooltip");
	});

	$("#idtext_mddetectedformat").mouseover(function () {
		var example = "configmask=0&#38ch=0&#38streamno=0&#38zonebit=2&#38zonemask=5&#38<br/>timestamp=15992,52537&#38objectsize=16,16,16,16,16,16,16,16";
		var sz = setupKWTooltip(gMdDetectedKeywords, example);
		xtooltip_show("idtext_mddetectedformat", sz, 0,0);
	});

	$("#idtext_mddetectedformat").mouseout( function() {
		xtooltip_hide("tooltip");
	});

	$("#idtext_networkformat").mouseover(function () {
		var example = "interface=eth0&#38prev=192.168.59.189,255.255.0.0,192.168.0.1,0.0.0.0,0.0.0.0&#38<br/>curr=192.168.3.127,255.255.0.0,192.168.0.1,168.126.63.1,168.126.63.2";
		var sz = setupKWTooltip(gNetworkKeywords, example);
		xtooltip_show("idtext_networkformat", sz, 0,0);
	});

	$("#idtext_networkformat").mouseout( function() {
		xtooltip_hide("tooltip");
	});

	$("#idtext_didoformat").mouseover(function () {
		var example = "count=2&#38prevmask=0&#38currmask=1";
		var sz = setupKWTooltip(gDidoKeywords, example);
		xtooltip_show("idtext_didoformat", sz, 0,0);
	}).keyup(function(){
		var text = $("#idtext_didoformat").val();
		if(text.length > 466)
		{
			$("#idtext_didoformat").val(text.substr(0,466));
			return false;
		}
		else
		{
			return true;
		}
	});

	$("#idtext_didoformat").mouseout( function() {
		xtooltip_hide("tooltip");
	});

	$("#idtext_sysformat").mouseover(function () {
		var example = "info=count=1&prevmask=1&currmask=0";
		var sz = setupKWTooltip(gSystemKeywords, example);
		xtooltip_show("idtext_sysformat", sz, 0,0);
	});

	$("#idtext_sysformat").mouseout( function() {
		xtooltip_hide("tooltip");
	});
}

function InitMsgHeader()
{
	var msgCustomHead = eval("EVENT_NOTIFY_MESSAGE_CUSTOMIZEDHEADER_TYPE");
	if(msgCustomHead == "custom")
	{
		$("#idck_enablecusheader").attr("checked", true);
		$("#idtext_cusheader").val(eval("EVENT_NOTIFY_MESSAGE_CUSTOMIZEDHEADER_FMT").replace(/\\n/g, "\n").replace(/@/g, "&"));
		$("#idtext_cusheader").attr("disabled", false);
	}
	else
	{
		$("#idck_enablecusheader").attr("checked", false);
		$("#idtext_cusheader").val(gDefaultFormat[10]);
		$("#idtext_cusheader").attr("disabled", true);
	}

}

function InitVcaMsg()
{
	var type = eval("EVENT_NOTIFY_MESSAGE_VCA_CONFIG_TYPE");
	$("input[name='idradio_vcaconfigformat'][value='" + type + "']:radio").attr("checked", "checked");
	if(type == "custom")
	{
		$("#idtext_vcaconfigformat").val(eval("EVENT_NOTIFY_MESSAGE_VCA_CONFIG_FMT").replace(/@/g, "&"));
		$("#idtext_vcaconfigformat").attr("disabled", false);
	}
	else
	{
		$("#idtext_vcaconfigformat").val(gDefaultFormat[0]);
		$("#idtext_vcaconfigformat").attr("disabled", true);
	}

	var type = eval("EVENT_NOTIFY_MESSAGE_VCA_ALARM_TYPE");
	$("input[name='idradio_vcaalarmformat'][value='" + type + "']:radio").attr("checked", "checked");
	if(type == "custom")
	{
		$("#idtext_vcaalarmformat").val(eval("EVENT_NOTIFY_MESSAGE_VCA_ALARM_FMT").replace(/@/g, "&"));
		$("#idtext_vcaalarmformat").attr("disabled", false);
	}
	else
	{
		$("#idtext_vcaalarmformat").val(gDefaultFormat[1]);
		$("#idtext_vcaalarmformat").attr("disabled", true);
	}

	var type = eval("EVENT_NOTIFY_MESSAGE_VCA_COUNTER_TYPE");
	$("input[name='idradio_vcacounterformat'][value='" + type + "']:radio").attr("checked", "checked");
	if(type == "custom")
	{
		$("#idtext_vcacounterformat").val(eval("EVENT_NOTIFY_MESSAGE_VCA_COUNTER_FMT").replace(/@/g, "&"));
		$("#idtext_vcacounterformat").attr("disabled", false);
	}
	else
	{
		$("#idtext_vcacounterformat").val(gDefaultFormat[2]);
		$("#idtext_vcacounterformat").attr("disabled", true);
	}
}

function InitMdMsg()
{
	
	var type = eval("EVENT_NOTIFY_MESSAGE_MD_DETECTED_TYPE");
	$("input[name='idradio_mddetectedformat'][value='" + type + "']:radio").attr("checked", "checked");
	if(type == "custom")
	{
		$("#idtext_mddetectedformat").val(eval("EVENT_NOTIFY_MESSAGE_MD_DETECTED_FMT").replace(/@/g, "&"));
		$("#idtext_mddetectedformat").attr("disabled", false);
	}
	else
	{
		$("#idtext_mddetectedformat").val(gDefaultFormat[5]);
		$("#idtext_mddetectedformat").attr("disabled", true);
	}
}



function InitNetworkMsg()
{
	var type = eval("EVENT_NOTIFY_MESSAGE_NETWORK_TYPE");
	$("input[name='idradio_networkformat'][value='" + type + "']:radio").attr("checked", "checked");
	if(type == "custom")
	{
		$("#idtext_networkformat").val(eval("EVENT_NOTIFY_MESSAGE_NETWORK_FMT").replace(/@/g, "&"));
		$("#idtext_networkformat").attr("disabled", false);
	}
	else
	{
		$("#idtext_networkformat").val(gDefaultFormat[6]);
		$("#idtext_networkformat").attr("disabled", true);
	}
}

function InitDidoMsg()
{
	var type = eval("EVENT_NOTIFY_MESSAGE_DIDO_TYPE");
	$("input[name='idradio_didoformat'][value='" + type + "']:radio").attr("checked", "checked");
	if(type == "custom")
	{
		$("#idtext_didoformat").val(eval("EVENT_NOTIFY_MESSAGE_DIDO_FMT").replace(/@/g, "&"));
		$("#idtext_didoformat").attr("disabled", false);
	}
	else
	{
		$("#idtext_didoformat").val(gDefaultFormat[7]);
		$("#idtext_didoformat").attr("disabled", true);
	}
}

function InitSystemMsg()
{
	var type = eval("EVENT_NOTIFY_MESSAGE_SYSTEM_TYPE");
	$("input[name='idradio_sysformat'][value='" + type + "']:radio").attr("checked", "checked");
	if(type == "custom")
	{
		$("#idtext_sysformat").val(eval("EVENT_NOTIFY_MESSAGE_SYSTEM_FMT").replace(/@/g, "&"));
		$("#idtext_sysformat").attr("disabled", false);
	}
	else
	{
		$("#idtext_sysformat").val(gDefaultFormat[9]);
		$("#idtext_sysformat").attr("disabled", true);
	}
}



function ErrorMsgDisplay(type, unsupportKeyword)
{	
	var msg = "";	
	if(type == 0)
	{
		msg += GetMsgLang("04030734");
	}
	else if(type == 1)	
	{		
		msg += GetMsgLang("04030735");
	}	
	else	
	{		
		msg += "\"";		
		msg += unsupportKeyword;		
		msg += "\"";		
		msg += GetMsgLang("04030736");
	}	
	alert(msg);
}

function ParseFormat(format)
{	
	var splitKeyword = [];	
	var index = 0;	
	var formatStr = format;	
	while(1)	
	{		
		index = formatStr.search(/[$]/);		
		if(index == -1)		
		{			
			break;		
		}		
		var subStr = formatStr.substring(index + 1);		
		var secIndex = subStr.search(/[$]/);		
		if(secIndex != 0)		
		{			
			splitKeyword.push(subStr.substring(0, secIndex));		
		}		
		formatStr = subStr.substring(secIndex + 1);	
	}	
	return splitKeyword;
}

function CheckInputFormat(keywordMap, format)
{
	if(format.length == 0)
	{
		alert(GetMsgLang("04030740"));
		return false;
	}

	//check $ pair	
	if(format.search("@") != -1)
	{
		ErrorMsgDisplay(0);		
		return false;	
	}
	
	var kpair = format.match(/[$]/g);	
	if(kpair.length % 2 != 0)	
	{		
		ErrorMsgDisplay(1);		
		return false;	
	}

	var checkKWData = ParseFormat(format);	
	if(checkKWData.length == 0)	
	{		
		return true;	
	}

	for(i = 0; i < checkKWData.length; i ++)	
	{		
		var bFind = false;		
		for(j = 0; j < keywordMap.length; j ++)		
		{			
			if(checkKWData[i] == keywordMap[j])			
			{				
				bFind = true;				
				break;			
			}		
		}		
		if(bFind == false)		
		{			
			ErrorMsgDisplay(2, checkKWData[i]);			
			return false;		
		}	
	}	
	return true;
}

function InitForm()
{
	$("#msgfmt_form").dialog({
		autoOpen: false,
			width: 640,
			modal: true,
			resizable: false,
			position: [10,10],
			open: function() {
			InitMsgHeader();
			InitVcaMsg();
			InitMdMsg();
			InitNetworkMsg();
			InitDidoMsg();
			InitSystemMsg();
		 	 	},
	 	 	close:function()
 		{
			 $("#stream_tab").tabs("select" , 0);
			 ResizePage();
 		}
	});

	$("#btnDialogOK").button().click(function(){ 
		if(CheckInputFormat(gMsgHeaderKeywords,$("#idtext_cusheader").val()) == false)
		{
			$("#stream_tab").tabs("select", 0);
			$("#idtext_cusheader").focus();
			return;
		}
		if(CheckInputFormat(gVcaConfigKeywords,$("#idtext_vcaconfigformat").val()) == false)
		{
			$("#stream_tab").tabs("select", 1);
			$("#idtext_vcaconfigformat").focus();
			return;
		}
		if(CheckInputFormat(gVcaAlarmKeywords,$("#idtext_vcaalarmformat").val()) == false)
		{
			$("#stream_tab").tabs("select", 1);
			$("#idtext_vcaalarmformat").focus();
			return;
		}
		if(CheckInputFormat(gVcaCounterKeywords,$("#idtext_vcacounterformat").val()) == false)
		{
			$("#stream_tab").tabs("select", 1);
			$("#idtext_vcacounterformat").focus();
			return;
		}
		if(CheckInputFormat(gMdDetectedKeywords,$("#idtext_mddetectedformat").val()) == false)
		{
			$("#stream_tab").tabs("select", 2);
			$("#idtext_mddetectedformat").focus();
			return;
		}
		if(CheckInputFormat(gNetworkKeywords,$("#idtext_networkformat").val()) == false)
		{
			$("#stream_tab").tabs("select", 3);
			$("#idtext_networkformat").focus();
			return;
		}
		if(CheckInputFormat(gDidoKeywords,$("#idtext_didoformat").val()) == false)
		{
			$("#stream_tab").tabs("select", 4);
			$("#idtext_didoformat").focus();
			return;
		}
		if(CheckInputFormat(gSystemKeywords,$("#idtext_sysformat").val()) == false)
		{
			$("#stream_tab").tabs("select", 5);
			$("#idtext_sysformat").focus();
			return;
		}


		var Req = new CGIRequest();
		QString = makeQString();
		QString.set_action('update')
			.set_schema('xml')
			//Group VCA
			.add_undecode_list("EVENT.Notify.message.vca.config.type", eval("EVENT_NOTIFY_MESSAGE_VCA_CONFIG_TYPE"), $("input[name='idradio_vcaconfigformat']:checked:radio").val())
			.add_undecode_list("EVENT.Notify.message.vca.config.fmt", eval("EVENT_NOTIFY_MESSAGE_VCA_CONFIG_FMT"), $("#idtext_vcaconfigformat").val().replace(/&/g, "@"))	
			.add_undecode_list("EVENT.Notify.message.vca.alarm.type", eval("EVENT_NOTIFY_MESSAGE_VCA_ALARM_TYPE"), $("input[name='idradio_vcaalarmformat']:checked:radio").val())
			.add_undecode_list("EVENT.Notify.message.vca.alarm.fmt", eval("EVENT_NOTIFY_MESSAGE_VCA_ALARM_FMT"), $("#idtext_vcaalarmformat").val().replace(/&/g, "@"))	
			.add_undecode_list("EVENT.Notify.message.vca.counter.type", eval("EVENT_NOTIFY_MESSAGE_VCA_COUNTER_TYPE"), $("input[name='idradio_vcacounterformat']:checked:radio").val())
			.add_undecode_list("EVENT.Notify.message.vca.counter.fmt", eval("EVENT_NOTIFY_MESSAGE_VCA_COUNTER_FMT"), $("#idtext_vcacounterformat").val().replace(/&/g, "@"))	
			//Group MD
			.add_undecode_list("EVENT.Notify.message.md.detected.type", eval("EVENT_NOTIFY_MESSAGE_MD_DETECTED_TYPE"), $("input[name='idradio_mddetectedformat']:checked:radio").val())
			.add_undecode_list("EVENT.Notify.message.md.detected.fmt", eval("EVENT_NOTIFY_MESSAGE_MD_DETECTED_FMT"), $("#idtext_mddetectedformat").val().replace(/&/g, "@"))	
			//Group network
			.add_undecode_list("EVENT.Notify.message.network.type", eval("EVENT_NOTIFY_MESSAGE_NETWORK_TYPE"), $("input[name='idradio_networkformat']:checked:radio").val())
			.add_undecode_list("EVENT.Notify.message.network.fmt", eval("EVENT_NOTIFY_MESSAGE_NETWORK_FMT"), $("#idtext_networkformat").val().replace(/&/g, "@"))	
			//DI/DO	
			.add_undecode_list("EVENT.Notify.message.dido.type", eval("EVENT_NOTIFY_MESSAGE_DIDO_TYPE"), $("input[name='idradio_didoformat']:checked:radio").val())
			.add_undecode_list("EVENT.Notify.message.dido.fmt", eval("EVENT_NOTIFY_MESSAGE_DIDO_FMT"), $("#idtext_didoformat").val().replace(/&/g, "@"))
			///VSIGNAL/VSTD	
			.add_undecode_list("EVENT.Notify.message.system.type", eval("EVENT_NOTIFY_MESSAGE_SYSTEM_TYPE"), $("input[name='idradio_sysformat']:checked:radio").val())
			.add_undecode_list("EVENT.Notify.message.system.fmt", eval("EVENT_NOTIFY_MESSAGE_SYSTEM_FMT"), $("#idtext_sysformat").val().replace(/&/g, "@"));
			
		var headertype = "default";
		if($("#idck_enablecusheader").attr("checked") == true)
		{
			headertype = "custom";
		}
		//Group customized message header
		
		QString.add_undecode_list("EVENT.Notify.message.customizedheader.type", eval("EVENT_NOTIFY_MESSAGE_CUSTOMIZEDHEADER_TYPE"),headertype)
			.add_undecode_list("EVENT.Notify.message.customizedheader.fmt", eval("EVENT_NOTIFY_MESSAGE_CUSTOMIZEDHEADER_FMT"), $("#idtext_cusheader").val().replace(/&/g, "@").replace(/\n/g, "\\n").replace(/\r/g, ""));
			
		var reqQString = QString.get_qstring();
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
				$("#msgfmt_form").dialog('close');
			InitSetting();
			ViewLoadingSave(false);
			});

			return;
		});
		Req.Request(reqQString);
	});

	$("#btnDialogCancel").button().click(function(){
		$("#msgfmt_form").dialog('close');
	});
}

function xstooltip_findPosX(obj,w) 
{	
	var curleft = 0;	
	if (w) 
		curleft = obj.offsetWidth;	
	
	if (obj.offsetParent) 	
	{		
		while (obj.offsetParent)				
		{						
			curleft += obj.offsetLeft						
			obj = obj.offsetParent;				
		}		
	}		
	else if (obj.x)				
		curleft += obj.x;		
	
	return curleft;
}

function xstooltip_findPosY(obj,h) 
{	
	var curtop = 0;	
	if (h) curtop = obj.offsetHeight;		
	if (obj.offsetParent)		 
	{				
		while (obj.offsetParent)				 
		{						
			curtop += obj.offsetTop						
			obj = obj.offsetParent;				
		}		
	}		
	else if (obj.y)				
		curtop += obj.y;		

	return curtop;
}

function xtooltip_show(_parentid, message ,posX, posY)
{		
	it = document.getElementById("tooltip");	
	_parent = document.getElementById(_parentid);
	if (it.style.first)		
	{		
		it.style.first = 0;				// need to fixate default size (MSIE problem)				
		it.style.width = it.offsetWidth + 'px';				
		it.style.height = it.offsetHeight + 'px';		
	}
	
	it.innerHTML = message;

	{												
		// if tooltip is too wide, shift left to be within parent				 
		//if (posX + it.offsetWidth > img.offsetWidth) posX = img.offsetWidth - it.offsetWidth;				
		//if (posX < 0 ) posX = 0;								 
		var x = xstooltip_findPosX(_parent,0) + posX;				
		var y = xstooltip_findPosY(_parent,1) + posY;				
		it.style.top = y + 'px';				
		it.style.left = x + 'px';		
	}				

	it.style.visibility = 'visible'; 	
}

function xtooltip_hide()
{	
	it = document.getElementById("tooltip");	
	it.style.visibility = 'hidden'; 	
}


function setupKWTooltip(gkeywords, example)
{	
	var sz = "<tr><td>";	
	var kid = "#SUPPORT_KW";
	sz += $(kid).text();
	sz += "</td></tr><br/>";			

	
	for(i = 0; i < gkeywords.length; i ++)	
	{		
		sz += "<tr><td>";		
		sz += "<B>";		
		sz += "$";		
		sz += gkeywords[i];		
		sz += "$";		
		sz += "</B>";		
		sz += ":";		
		sz += getDecriptionOfKeyword(gkeywords[i]);		
		sz += "</td></tr><br/>";	
	}	
	sz += "<tr><td><B>";
	kid = "#EXAMPLE";
	sz += $(kid).text();
	sz += "</B></td></tr><br/>";	
	sz += "<tr><td>";	
	sz += example;	
	sz += "</td></tr>";		
	return sz;
}

function getDecriptionOfKeyword(keyword)
{	
	var sz = "";	
	var kid = "#" + keyword;
	sz += $(kid).text();
	return sz;
}

