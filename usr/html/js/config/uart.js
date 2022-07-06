var g_defaultGroup = "UART";
var nSelectedStream = 0;
var clock = null;
var statusInterval = 1;

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
	var classNum = ["04060330", "04060331", "0501", "04060325"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "uart", 
				parent.g_langData[parent.g_configData.language]);
}

function initConfig()
{
	$.get("/uapi-cgi/param.cgi?action=query&group=UART.Ch1.baudrate", function(data) {
		var resultArray = data.split("|");
		var baudrateList = resultArray[2].split(",");
		$("#formUartBaudRate option").remove();
		for(i=0; i < baudrateList.length; i++)
		{
			$("#formUartBaudRate").append("<option value=" + baudrateList[i] + ">" + baudrateList[i] + "</option>");
		}

		LoadParamJs(g_defaultGroup, mainRun);
	});
}

function mainRun()
{
	PreCustomize();
	InitForm();
	SetRelation();
	InitSetting();
	EventBind();
	ContentShow();
	PostCustomize();
}

function InitForm()
{
	$("button").button();

	$("#type").text(eval(g_defaultGroup + "_CH1_TYPE").toUpperCase());
	Disable($("#formUartFlowCtrlNone"));

	$("#serialoverip div").each(function(index, element) {
		if(!$(this).html())
		{
			switch($(this).attr("id"))
			{
				case "udp":
					objId = "uart_udp";
					break;
				case "tcpclient":
					objId = "uart_tcpclient";
					break;
				case "tcpserver":
					objId = "uart_tcpserver";
					break;
				default:
					return false;
					break;
			}
			$(this).remove("form");
			$(this).append("<form>" + $("#"+objId).html() + "</form>");
		}
	});

	$("#formUartIpaddress_udp:text").ipaddress();
	$("#IPAddress_udp .ip_octet").css("border", "0px");
	$("#formUartPort_udp:text").numeric();
	$("#formUartIpaddress_tcpclient:text").ipaddress();
	$("#IPAddress_tcpclient .ip_octet").css("border", "0px");
	$("#formUartPort_tcpclient:text").numeric();
	$("#formUartTimeout_tcpclient:text").numeric();
	$("#formUartPort_tcpserver:text").numeric();
	$("#formUartTimeout_tcpserver:text").numeric();
	$("#formUartTimeout_tcpserver:text").numeric();
}

function InitSetting()
{
	var group = g_defaultGroup + "_CH1";

		$("select#formUartBaudRate").val(eval(group+"_BAUDRATE"));
		$("input[name='formUartData'][value='" + eval(group + "_DATABITS") + "']:radio").attr("checked", "checked");
		$("input[name='formUartParity'][value='" + eval(group + "_PARITY") + "']:radio").attr("checked", "checked");
		$("input[name='formUartStop'][value='" + eval(group + "_STOPBITS") + "']:radio").attr("checked", "checked");
		$("input[name='formUartFlowCtrl'][value='" + eval(group + "_FLOWCONTROL") + "']:radio").attr("checked", "checked");
		$("input[name='formUartMode'][value='" + eval(group + "_MODE") + "']:radio").attr("checked", "checked");

		$("input[name='formUartOverIPMode'][value='" + eval(group + "_SERIALOVERIP_MODE") + "']:radio").attr("checked", "checked");
		$("#serialoverip div").each(function(index, element) {
		InitModeSubSetting(index);
		});

		$("input[name='formUartData']").change();
	$("input[name='formUartStop']").change();
		$("input[name='formUartOverIPMode']").change();
		$("input[name='formUartMode']").change();

		startRefreshStatus();
}

function InitModeSubSetting(index)
{
	var group = g_defaultGroup + "_CH1";
	var szIP;

	switch(index)
	{
		//udp
		case 0:
		{
			var fullip = eval(group + "_SERIALOVERIP_IPADDRESS");
			if(fullip == "")
			{
				fullip = "...";
			}
			szIP = fullip.split(".");
			$("#IPAddress_udp .ip_octet:eq(0)").val(szIP[0]);
			$("#IPAddress_udp .ip_octet:eq(1)").val(szIP[1]);
			$("#IPAddress_udp .ip_octet:eq(2)").val(szIP[2]);
			$("#IPAddress_udp .ip_octet:eq(3)").val(szIP[3]);
			$("#formUartPort_udp:text").val(eval(group + "_SERIALOVERIP_UDPPORT"));
			break;
		}			

		//tcp client
		case 1:
		{
			var fullip = eval(group + "_SERIALOVERIP_TCPCLIENTIPADDRESS");
			if(fullip == "")
			{
				fullip = "...";
			}
			szIP = fullip.split(".");
			$("#IPAddress_tcpclient .ip_octet:eq(0)").val(szIP[0]);
			$("#IPAddress_tcpclient .ip_octet:eq(1)").val(szIP[1]);
			$("#IPAddress_tcpclient .ip_octet:eq(2)").val(szIP[2]);
			$("#IPAddress_tcpclient .ip_octet:eq(3)").val(szIP[3]);
			$("#formUartPort_tcpclient:text").val(eval(group + "_SERIALOVERIP_TCPCLIENTPORT"));
			$("#formUartTimeout_tcpclient:text").val(eval(group + "_SERIALOVERIP_TCPCONNECTTIMEOUT"));
			break;
		}

		//tcp server
		case 2:
		{
			$("#formUartPort_tcpserver:text").val(eval(group + "_SERIALOVERIP_TCPSERVERPORT"));
			$("#formUartTimeout_tcpserver:text").val(eval(group + "_SERIALOVERIP_TCPCONNECTTIMEOUT"));
			break;
		}

		default:
			return false;
	}
}

function SetRelation()
{
	var group = g_defaultGroup + "_CH1";

	//serial port - data & stop
	$("input[name='formUartData']").change(function() {
		var Data = $("input[name='formUartData']:checked:radio").val();
		if(Data == "5")
		{
			Disable($("#formUartStop2bit"));
		}
		else
		{
			Enable($("#formUartStop2bit"));
		}
	});
	$("input[name='formUartStop']").change(function() {
		var Stop = $("input[name='formUartStop']:checked:radio").val();
		if(Stop == "2")
		{
			Disable($("#formUartData5bit"));
		}
		else
		{
			Enable($("#formUartData5bit"));
		}
	});

	//serial port - mode
	$("input[name='formUartMode']").change(function() {
		var szMode = $("input[name='formUartMode']:checked:radio").val();
		if(szMode == "overip")
		{
			Enable($("#formUartOverIPModeUdp"));
			Enable($("#formUartOverIPModeTcpClient"));
			Enable($("#formUartOverIPModeTcpServer"));
			//
			Enable($("#IPAddress_udp .ip_octet"));
			$("#IPAddress_udp div.ip_container").css("background-color", "#FFFFFF");
			Enable($("#formUartPort_udp"));
			Enable($("#IPAddress_tcpclient .ip_octet"));
			$("#IPAddress_tcpclient div.ip_container").css("background-color", "#FFFFFF");
			Enable($("#formUartPort_tcpclient"));
			Enable($("#formUartTimeout_tcpclient"));
			Enable($("#formUartPort_tcpserver"));
			Enable($("#formUartTimeout_tcpserver"));

		}
		else if(szMode == "ptz")
		{
			Disable($("#formUartOverIPModeUdp"));
			Disable($("#formUartOverIPModeTcpClient"));
			Disable($("#formUartOverIPModeTcpServer"));
			//
			Disable($("#IPAddress_udp .ip_octet"));
			$("#IPAddress_udp div.ip_container").css("background-color", "#EEEEEE");
			Disable($("#formUartPort_udp"));
			Disable($("#IPAddress_tcpclient .ip_octet"));
			$("#IPAddress_tcpclient div.ip_container").css("background-color", "#EEEEEE");
			Disable($("#formUartPort_tcpclient"));
			Disable($("#formUartTimeout_tcpclient"));
			Disable($("#formUartPort_tcpserver"));
			Disable($("#formUartTimeout_tcpserver"));
		}
	});

	//serialOverIP - Mode
	$("input[name='formUartOverIPMode']").change(function(){
		var szMode = $("input[name='formUartOverIPMode']:checked:radio").val();
		if(szMode == "udp")
		{
			$("#udp").css("display", "block");
			$("#tcpclient").css("display", "none");
			$("#tcpserver").css("display", "none");
		}
		else if(szMode == "tcp-client")
		{
			$("#udp").css("display", "none");
			$("#tcpclient").css("display", "block");
			$("#tcpserver").css("display", "none");
		}
		else if(szMode == "tcp-server")
		{
			$("#udp").css("display", "none");
			$("#tcpclient").css("display", "none");
			$("#tcpserver").css("display", "block");
		}
	});

	//serialOverIP - port
	$("#formUartPort_udp:text").blur(function() {
			var inputValTextPort = $("#formUartPort_udp:text").val()-0;
			$("#formUartPort_udp:text").val(inputValTextPort);
			if(inputValTextPort < 1 || inputValTextPort >65535 || inputValTextPort == "")
			{
				$("#formUartPort_udp:text").val(eval(group + "_SERIALOVERIP_UDPPORT")).focus();
				alert(GetMsgLang("04060330"));
			}
		});
	$("#formUartPort_tcpclient:text").blur(function() {
			var inputValTextPort = $("#formUartPort_tcpclient:text").val()-0;
			$("#formUartPort_tcpclient:text").val(inputValTextPort);
			if(inputValTextPort < 1 || inputValTextPort >65535 || inputValTextPort == "")
			{
				$("#formUartPort_tcpclient:text").val(eval(group + "_SERIALOVERIP_TCPCLIENTPORT")).focus();
				alert(GetMsgLang("04060330"));
			}
		});
	$("#formUartPort_tcpserver:text").blur(function() {
			var inputValTextPort = $("#formUartPort_tcpserver:text").val()-0;
			$("#formUartPort_tcpserver:text").val(inputValTextPort);
			if(inputValTextPort < 1 || inputValTextPort >65535 || inputValTextPort == "")
			{
				$("#formUartPort_tcpserver:text").val(eval(group + "_SERIALOVERIP_TCPSERVERPORT")).focus();
				alert(GetMsgLang("04060330"));
			}
		});

		//serialOverIP - timeout
		$("#formUartTimeout_tcpclient:text").blur(function() {
		var inputValTextTimeout = $("#formUartTimeout_tcpclient:text").val()-0;
		$("#formUartTimeout_tcpclient:text").val(inputValTextTimeout);
		$("#formUartTimeout_tcpserver:text").val(inputValTextTimeout);
		if($(this).val() == 0) return;
				if(inputValTextTimeout < 0 || inputValTextTimeout > 9999 || inputValTextTimeout == "")
		{
			$("#formUartTimeout_tcpclient:text").val(eval(group + "_SERIALOVERIP_TCPCONNECTTIMEOUT")).focus();
			$("#formUartTimeout_tcpserver:text").val(eval(group + "_SERIALOVERIP_TCPCONNECTTIMEOUT"));
			alert(GetMsgLang("04060330"));
		}
	});
	$("#formUartTimeout_tcpserver:text").blur(function() {
		var inputValTextTimeout = $("#formUartTimeout_tcpserver:text").val()-0;
		$("#formUartTimeout_tcpclient:text").val(inputValTextTimeout);
		$("#formUartTimeout_tcpserver:text").val(inputValTextTimeout);
		if($(this).val() == 0) return;
		if(inputValTextTimeout < 0 || inputValTextTimeout > 9999 || inputValTextTimeout == "")
		{
			$("#formUartTimeout_tcpclient:text").val(eval(group + "_SERIALOVERIP_TCPCONNECTTIMEOUT"));
			$("#formUartTimeout_tcpserver:text").val(eval(group + "_SERIALOVERIP_TCPCONNECTTIMEOUT")).focus();
			alert(GetMsgLang("04060330"));
		}
	});
}

function EventBind()
{
	var Req = new CGIRequest();
	var group = g_defaultGroup + "_CH1";

	$("#btnApply").click(function() {
		var szMode = $("input[name='formUartMode']:checked:radio").val();
		var reqQString = "action=update&xmlschema";			 

		QString = makeQString();
		QString
		.set_action('update')
		.set_schema('xml')
		.add_list("UART.Ch1.mode", eval(group + "_MODE"), szMode)
		.add_list("UART.Ch1.baudrate", eval(group + "_BAUDRATE"), $("select#formUartBaudRate").val())
		.add_list("UART.Ch1.databits", eval(group + "_DATABITS"), $("input[name='formUartData']:checked:radio").val())
		.add_list("UART.Ch1.parity", eval(group + "_PARITY"), $("input[name='formUartParity']:checked:radio").val())
		.add_list("UART.Ch1.stopbits", eval(group + "_STOPBITS"), $("input[name='formUartStop']:checked:radio").val())
		.add_list("UART.Ch1.flowcontrol", eval(group + "_FLOWCONTROL"), $("input[name='formUartFlowCtrl']:checked:radio").val());

		if(szMode == "overip")
		{
			var ipidx = -1;
			var szSerialoveripMode = $("input[name='formUartOverIPMode']:checked:radio").val();
			
			QString
			.add_list("UART.Ch1.Serialoverip.mode", eval(group + "_SERIALOVERIP_MODE"), szSerialoveripMode);

			if(szSerialoveripMode == "udp")
			{
				ipidx = checkBlankIPaddress("IPAddress_udp");
				if(ipidx != -1)
				{
					alert(GetMsgLang("04060331"));
					$("#IPAddress_udp .ip_octet:eq(" + ipidx + ")").focus();
					return;
				}
				var szIP_udp = $("#IPAddress_udp .ip_octet:eq(0)").val() +"."+ 
													$("#IPAddress_udp .ip_octet:eq(1)").val() +"."+ 
													$("#IPAddress_udp .ip_octet:eq(2)").val() +"."+ 
													$("#IPAddress_udp .ip_octet:eq(3)").val();

				QString
				.add_list("UART.Ch1.Serialoverip.ipaddress", eval(group + "_SERIALOVERIP_IPADDRESS"), szIP_udp)
				.add_list("UART.Ch1.Serialoverip.udpport", eval(group + "_SERIALOVERIP_UDPPORT"), $("#formUartPort_udp:text").val());
			}
			else if(szSerialoveripMode == "tcp-client")
			{
				ipidx = checkBlankIPaddress("IPAddress_tcpclient");
				if(ipidx != -1)
				{
					alert(GetMsgLang("04060331"));
					$("#IPAddress_tcpclient .ip_octet:eq(" + ipidx + ")").focus();
					return;
				}
				var szIP_tcpclient = $("#IPAddress_tcpclient .ip_octet:eq(0)").val() +"."+ 
													$("#IPAddress_tcpclient .ip_octet:eq(1)").val() +"."+ 
													$("#IPAddress_tcpclient .ip_octet:eq(2)").val() +"."+ 
													$("#IPAddress_tcpclient .ip_octet:eq(3)").val();

				QString
				.add_list("UART.Ch1.Serialoverip.tcpclientipaddress", eval(group + "_SERIALOVERIP_TCPCLIENTIPADDRESS"), szIP_tcpclient)
				.add_list("UART.Ch1.Serialoverip.tcpclientport", eval(group + "_SERIALOVERIP_TCPCLIENTPORT"), $("#formUartPort_tcpclient:text").val())
				.add_list("UART.Ch1.Serialoverip.tcpconnecttimeout", eval(group + "_SERIALOVERIP_TCPCONNECTTIMEOUT"), $("#formUartTimeout_tcpclient:text").val());
			}
			else if(szSerialoveripMode == "tcp-server")
			{
				QString
				.add_list("UART.Ch1.Serialoverip.tcpserverport", eval(group + "_SERIALOVERIP_TCPSERVERPORT"), $("#formUartPort_tcpserver:text").val())
				.add_list("UART.Ch1.Serialoverip.tcpconnecttimeout", eval(group + "_SERIALOVERIP_TCPCONNECTTIMEOUT"), $("#formUartTimeout_tcpclient:text").val());
			}

			
		}		

		reqQString = QString.get_qstring();

		if(!reqQString) {
			InitSetting()
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
				ViewLoadingSave(false);
					InitSetting()
			});

			return;
		});
		Req.Request(reqQString);
	});	
}

function startRefreshStatus()
{
	clearInterval(clock);
	receiveStatus();

	if(clock != null)
	{
		clearInterval(clock);
		clock = null;
	}
	clock = setInterval(function(){
		receiveStatus();
	},statusInterval*1000);
}

function receiveStatus()
{
	LoadParamJs(g_defaultGroup, function() {
		var group = g_defaultGroup + "_CH1";

		$(".status").each(function() {
			$(this).text(eval(group + "_SERIALOVERIP_STATUS"));
		});
	});	
}

function checkBlankIPaddress(id)
{
	var index = -1;

	for(i=0; i < 4; i++)
	{
		if($("#" + id + " .ip_octet:eq(" + i + ")").val() == "")
		{
			index = i;
			break;
		}
	}

	return index;
}
