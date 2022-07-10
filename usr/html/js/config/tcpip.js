var g_defaultGroup = "NETWORK";

$(function () {
	// PreCustomize();
	// initEnvironment();
	// LoadParamJs(g_defaultGroup, mainRun);
	mainRun();
});

function initEnvironment()
{
	// initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum = ["04040120", "04040121", "04040122", "0501", "04040128",
					"0503", "04040130", "04040139", "04040140", "04040141",
					"04040142", "04040143", "04040144"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "tcpip",
				parent.g_langData[parent.g_configData.language]);
}

function mainRun()
{
	// InitSetting();
	// EventBind();
	// $("button").button();
	// ContentShow();
	SetRelation();
	PostCustomize();
}

function SetRelation()
{
	$("#formTcpipDhcpIP:text").ipaddress();
	$("#formTcpipDhcpChk0:radio ~ p:eq(0) .ip_octet").css("border", "0px");

	$("#formTcpipDhcpSub:text").ipaddress();
	$("#formTcpipDhcpChk0:radio ~ p:eq(1) .ip_octet").css("border", "0px");

	$("#formTcpipDhcpGate:text").ipaddress();
	$("#formTcpipDhcpChk0:radio ~ p:eq(2) .ip_octet").css("border", "0px");

	$("#formTcpipNoDhcpIP:text").ipaddress();
	$("#formTcpipDhcpChk1:radio ~ p:eq(0) .ip_octet").css("border", "0px");

	$("#formTcpipNoDhcpSub:text").ipaddress();
	$("#formTcpipDhcpChk1:radio ~ p:eq(1) .ip_octet").css("border", "0px");

	$("#formTcpipNoDhcpGate:text").ipaddress();
	$("#formTcpipDhcpChk1:radio ~ p:eq(2) .ip_octet").css("border", "0px");

	$("#formLinkLocalIP:text").ipaddress();
	$("#linkLocalIPContents .ip_octet").css("border", "0px");

	$("#formLinkLocalSubnet:text").ipaddress();
	$("#linkLocalSubnetContents .ip_octet").css("border", "0px");

	Disable($("#linkLocalIPContents .ip_octet"));
	$("#linkLocalIPContents div.ip_container").css("background-color", "#EEEEEE");
	Disable($("#linkLocalSubnetContents .ip_octet"));
	$("#linkLocalSubnetContents div.ip_container").css("background-color", "#EEEEEE");

	//change 이벤트시 Disable 설정
	$("input[name='formTcpipDhcpChk']").change(function() {
		if($("input[name='formTcpipDhcpChk']:checked:radio").val() == "no")
		{
			Disable($("#formTcpipDhcpChk0:radio ~ p:eq(0) .ip_octet"));
			$("#formTcpipDhcpChk0:radio ~ p:eq(0) div.ip_container").css("background-color", "#EEEEEE");
			Disable($("#formTcpipDhcpChk0:radio ~ p:eq(1) .ip_octet"));
			$("#formTcpipDhcpChk0:radio ~ p:eq(1) div.ip_container").css("background-color", "#EEEEEE");
			Disable($("#formTcpipDhcpChk0:radio ~ p:eq(2) .ip_octet"));
			$("#formTcpipDhcpChk0:radio ~ p:eq(2) div.ip_container").css("background-color", "#EEEEEE");
			Enable($("#formTcpipDhcpChk1:radio ~ p:eq(0) .ip_octet"));
			$("#formTcpipDhcpChk1:radio ~ p:eq(0) div.ip_container").css("background-color", "#FFFFFF");
			Enable($("#formTcpipDhcpChk1:radio ~ p:eq(1) .ip_octet"));
			$("#formTcpipDhcpChk1:radio ~ p:eq(1) div.ip_container").css("background-color", "#FFFFFF");
			Enable($("#formTcpipDhcpChk1:radio ~ p:eq(2) .ip_octet"));
			$("#formTcpipDhcpChk1:radio ~ p:eq(2) div.ip_container").css("background-color", "#FFFFFF");
			Enable($("#formTcpipDhcpChk1:radio ~ p:eq(3) .ip_octet"));
			$("#formTcpipDhcpChk1:radio ~ p:eq(3) div.ip_container").css("background-color", "#FFFFFF");
			Enable($("#formPriDNSServ .ip_octet"))
			$("#formPriDNSServ div.ip_container").css("background-color", "#FFFFFF");
			Enable($("#formSecDNSServ .ip_octet"))
			$("#formSecDNSServ div.ip_container").css("background-color", "#FFFFFF");
			Enable($("#formTcpipPriDNS"));
			$("#formTcpipPriDNS").css("background-color", "#FFFFFF");
			Enable($("#formTcpipSecDNS"));
			$("#formTcpipSecDNS").css("background-color", "#FFFFFF");

			Enable($("button#btnIPTest"));
		}
		else
		{
			Disable($("#formTcpipDhcpChk0:radio ~ p:eq(0) .ip_octet"));
			$("#formTcpipDhcpChk0:radio ~ p:eq(0) div.ip_container").css("background-color", "#EEEEEE");
			Disable($("#formTcpipDhcpChk0:radio ~ p:eq(1) .ip_octet"));
			$("#formTcpipDhcpChk0:radio ~ p:eq(1) div.ip_container").css("background-color", "#EEEEEE");
			Disable($("#formTcpipDhcpChk0:radio ~ p:eq(2) .ip_octet"));
			$("#formTcpipDhcpChk0:radio ~ p:eq(2) div.ip_container").css("background-color", "#EEEEEE");
			Disable($("#formTcpipDhcpChk1:radio ~ p:eq(0) .ip_octet"));
			$("#formTcpipDhcpChk1:radio ~ p:eq(0) div.ip_container").css("background-color", "#EEEEEE");
			Disable($("#formTcpipDhcpChk1:radio ~ p:eq(1) .ip_octet"));
			$("#formTcpipDhcpChk1:radio ~ p:eq(1) div.ip_container").css("background-color", "#EEEEEE");
			Disable($("#formTcpipDhcpChk1:radio ~ p:eq(2) .ip_octet"));
			$("#formTcpipDhcpChk1:radio ~ p:eq(2) div.ip_container").css("background-color", "#EEEEEE");
			Disable($("#formTcpipDhcpChk1:radio ~ p:eq(3) .ip_octet"));
			$("#formTcpipDhcpChk1:radio ~ p:eq(3) div.ip_container").css("background-color", "#EEEEEE");
			Disable($("#formPriDNSServ .ip_octet"));
			$("#formPriDNSServ div.ip_container").css("background-color", "#EEEEEE");
			Disable($("#formSecDNSServ .ip_octet"));
			$("#formSecDNSServ div.ip_container").css("background-color", "#EEEEEE");
			Disable($("#formTcpipPriDNS"));
			$("#formTcpipPriDNS").css("background-color", "#EEEEEE");
			Disable($("#formTcpipSecDNS"));
			$("#formTcpipSecDNS").css("background-color", "#EEEEEE");

			Disable($("button#btnIPTest"));
		}
	});

	$("input[name='formTcpipDhcpChk']:radio").change();

	$("#linkLocalEnable:checkbox").change(function() {
		if($("#linkLocalEnable:checkbox").attr("checked") == true)
		{
			$("li.linkLocalIPContents").css('display', 'block');
			$("li.linkLocalSubnetContents").css('display', 'block');
		}
		else
		{
			$("li.linkLocalIPContents").css('display', 'none');
			$("li.linkLocalSubnetContents").css('display', 'none');
		}
		EvenOdd(parent.g_configData.skin);
		ResizePage();
	});
	$("#linkLocalEnable:checkbox").change();

	var dhcpEnableCheck = $("#dhcpEnable:checkbox");
	dhcpEnableCheck.change(function() {
		$("#dhcpType").attr("disabled", dhcpEnableCheck.attr("checked") ? false : true);
	});
	dhcpEnableCheck.change();

	setTextBlur("#prefixLength:text", 0, 128, network_getAttr("ETH0_IPV6_PREFIXLENGTH"), "04040130");

	var ipv6ID = $("#ipv6Enable:checkbox");
	ipv6ID.change(function() {
		$("li.ipv6Contents").css('display', ipv6ID.attr("checked") ? "block" : "none");
		EvenOdd(parent.g_configData.skin);
		ResizePage();
	});
	ipv6ID.change();
}

function setTextBlur(selector, minRange, maxRange, setValue, langClassID)
{
	$(selector).blur(function() {
		var nowValue = $(selector).val()-0;
		if(minRange == 0 && nowValue == 0) return;
		if(nowValue < minRange || nowValue > maxRange || nowValue == "")
		{
			$(selector).val(setValue).focus();
			alert(GetMsgLang("04040130"));
		}
	});
}

function InitSetting()
{
	var group = "NETWORK";

	$("input[name='formTcpipDhcpChk'][value='" + eval(group + "_ETH0_DHCP_ENABLE") + "']:radio").attr("checked", "checked");

	// dhcp
	$("#formTcpipDhcpIP:text").val(eval(group+ "_ETH0_DHCP_IPADDRESS"));
	$("#formTcpipDhcpSub:text").val(eval(group+ "_ETH0_DHCP_SUBNET"));
	$("#formTcpipDhcpGate:text").val(eval(group+ "_ETH0_DHCP_GATEWAY"));

	// static
	$("#formTcpipNoDhcpIP:text").val(eval(group+ "_ETH0_IPADDRESS"));
	$("#formTcpipNoDhcpSub:text").val(eval(group+ "_ETH0_SUBNET"));
	$("#formTcpipNoDhcpGate:text").val(eval(group+ "_ETH0_GATEWAY"));

	// dns
	$("#formTcpipPriDNS:text").val(eval(group+ "_DNS_PREFERRED"));
	$("#formTcpipSecDNS:text").val(eval(group+ "_DNS_ALTERNATE0"));

	// host name
	$("#formHostname:text").val(eval(group+ "_ETH0_HOSTNAME"));

	$("input[name='formTcpipDhcpChk']:radio").change();

	if(eval(group+"_ETH0_AUTOIP_ENABLE") == "yes")
	{
		$("#linkLocalEnable:checkbox").attr("checked", "checked");
	}
	else
	{
		$("#linkLocalEnable:checkbox").attr("checked", "");
	}

	$("#formLinkLocalIP:text").val(network_getAttr("ETH0_AUTOIP_IPADDRESS"));
	$("#formLinkLocalSubnet:text").val(network_getAttr("ETH0_AUTOIP_SUBNET"));

	$("#ipv6Enable:checkbox").attr("checked", network_getAttr("IPV6_ENABLE") == "yes"? "checked" : "");
	$("#acceptRAEnable:checkbox").attr("checked", network_getAttr("ETH0_IPV6_RAENABLE") == "yes"? "checked" : "");
	$("#dhcpEnable:checkbox").attr("checked", network_getAttr("ETH0_IPV6_DHCP_ENABLE") == "yes"? "checked" : "");
	$("select#dhcpType").val(network_getAttr("ETH0_IPV6_DHCP_TYPE"));
	$("#staticIPaddress").val(network_getAttr("ETH0_IPV6_IPADDRESS"));
	$("#defaultRouter").val(network_getAttr("ETH0_IPV6_GATEWAY"));
	$("#prefixLength").val(network_getAttr("ETH0_IPV6_PREFIXLENGTH"));
	changeCurrentIPv6Address();
}

function network_getAttr(name)
{
	var group = g_defaultGroup;
	var returnValue = window[group + "_" + name];
	return returnValue;
}

function changeCurrentIPv6Address()
{
	$.get("/uapi-cgi/netinfo.cgi?" + "&_=" + (new Date()).getTime(), function(data) {
		if(data == "" || data == "\n" || data == undefined)
		{
			uconlog("[Weblog] IPv6 no data");
			return;
		}

		$("#ipaddressInformation").val(data);
		autoScrollHeight("ipaddressInformation", ResizePage);
	});
}

function EventBind()
{
	var Req = new CGIRequest();
	var tcpipReq = new CGIRequest();
	var revCheckResult = "dead";

	$("#btnIPTest").click(function() {
		ViewLoadingSave(true);
		Disable($("button"));
		var param = "&type=ip&ip=eth0 " + $("#formTcpipNoDhcpIP:text").val();
		$.get("/uapi-cgi/admin/testaction.cgi?" + param, function(data) {
				parseTestActionResponse(data);
				ViewLoadingSave(false);
				Enable($("button"));
		});
	});

	// APPLY BUTTON
	$("#btnApply").click(function() {
		// broadcast 계산
		var nOctB1 = $("#formTcpipDhcpChk1:radio ~ p:eq(0) #_octet_1").val() | ($("#formTcpipDhcpChk1:radio ~ p:eq(1) #_octet_1").val() ^ 255);
		var nOctB2 = $("#formTcpipDhcpChk1:radio ~ p:eq(0) #_octet_2").val() | ($("#formTcpipDhcpChk1:radio ~ p:eq(1) #_octet_2").val() ^ 255);
		var nOctB3 = $("#formTcpipDhcpChk1:radio ~ p:eq(0) #_octet_3").val() | ($("#formTcpipDhcpChk1:radio ~ p:eq(1) #_octet_3").val() ^ 255);
		var nOctB4 = $("#formTcpipDhcpChk1:radio ~ p:eq(0) #_octet_4").val() | ($("#formTcpipDhcpChk1:radio ~ p:eq(1) #_octet_4").val() ^ 255);
		var broadcastAddress = nOctB1+"."+nOctB2+"."+nOctB3+"."+nOctB4;
		var reqQString = "action=update&xmlschema";

		var dns0Value = encodeURIComponent($("#formTcpipPriDNS:text").val());
		var dns1Value = encodeURIComponent($("#formTcpipSecDNS:text").val());
		if(isDnsDuplicate(dns0Value, dns1Value))
		{
			alert(GetMsgLang("04040120"));
			return;
		}

		var group = "NETWORK";
		var manualIpAddress = $("#formTcpipDhcpChk1:radio ~ p:eq(0) #_octet_1").val() + "." +
													$("#formTcpipDhcpChk1:radio ~ p:eq(0) #_octet_2").val() + "." +
													$("#formTcpipDhcpChk1:radio ~ p:eq(0) #_octet_3").val() + "." +
													$("#formTcpipDhcpChk1:radio ~ p:eq(0) #_octet_4").val();

		var curURL = document.location.href;
		var curAddressMode = "ipv6";

		if(curURL.indexOf("[") == -1)
				curAddressMode = "ipv4";

		var redirectMode = "none";
		var redirectURL = window.location.protocol + "//";

		if(curAddressMode == "ipv4")
		{
			if(($("input[name='formTcpipDhcpChk']:checked:radio").val() == "no" && eval(group + "_ETH0_DHCP_ENABLE") == "yes") ||
					(manualIpAddress != eval(group+ "_ETH0_IPADDRESS")))
			{
					redirectMode = "v4manual";
			}
		}
		else
		{
			if($("#ipv6Enable:checkbox").attr("checked") == false)
			{
				if($("input[name='formTcpipDhcpChk']:checked:radio").val() == "yes")
				{
					redirectMode = "v4dhcp";
				}
				else
				{
					redirectMode = "v4manual";
				}
			}
			else if((network_getAttr("ETH0_IPV6_DHCP_ENABLE") == "yes" && $("#dhcpEnable:checkbox").attr("checked") == false) ||
				($("#dhcpEnable:checkbox").attr("checked") == false && $("#staticIPaddress:text").val() != network_getAttr("ETH0_IPV6_IPADDRESS")))
			{
				redirectMode = "v6manual";
			}
		}

		if(redirectMode == "v4manual")
		{
			redirectURL = redirectURL + manualIpAddress;
		}
		else if(redirectMode == "v4dhcp")
		{
			if(eval(group+ "_ETH0_DHCP_IPADDRESS") == "" || eval(group+ "_ETH0_DHCP_IPADDRESS") == "0.0.0.0")
				redirectMode = "none";
	 		else
				redirectURL = redirectURL + eval(group+ "_ETH0_DHCP_IPADDRESS");
		}
		else if(redirectMode == "v6manual")
		{
			var ipv6Addr = $("#staticIPaddress").val();

			if(ipv6Addr == "")
				redirectMode = "none";
			else
				redirectURL = redirectURL + "[" + ipv6Addr + "]";
		}
		else if(redirectMode == "v6dhcp")
		{
			if($("#dhcpEnable:checkbox").attr("checked") == true & curAddressMode == "ipv6")
			{
				redirectURL = curURL.split("]")[0] + "]";
			}
		}

		if(redirectMode != "none")
		{
			if(window.location.port != "")
				redirectURL = redirectURL + ":" + window.location.port;

				var parentURL = parent.location.href;
				var parentURLArray = parentURL.split("/");

				for(var i = 3; i < 7; i++)
				{
					if(parentURLArray[i] != undefined)
						redirectURL = redirectURL + "/" + parentURLArray[i];
					else
						break;
				}
		}

		// static
		if(!checkStringValidation(($("#formTcpipDhcpChk1:radio ~ p:eq(0) #_octet_1").val() + "." +
				$("#formTcpipDhcpChk1:radio ~ p:eq(0) #_octet_2").val() + "." +
				$("#formTcpipDhcpChk1:radio ~ p:eq(0) #_octet_3").val() + "." +
				$("#formTcpipDhcpChk1:radio ~ p:eq(0) #_octet_4").val()), g_defregexp.ipv4, null, null, false))
		{
			alert(GetMsgLang("04040139"));
			return false;
		}
		if(!checkStringValidation(($("#formTcpipDhcpChk1:radio ~ p:eq(1) #_octet_1").val() + "." +
				$("#formTcpipDhcpChk1:radio ~ p:eq(1) #_octet_2").val() + "." +
				$("#formTcpipDhcpChk1:radio ~ p:eq(1) #_octet_3").val() + "." +
				$("#formTcpipDhcpChk1:radio ~ p:eq(1) #_octet_4").val()), g_defregexp.ipv4, null, null, false))
		{
			alert(GetMsgLang("04040140"));
			return false;
		}
		if(!checkStringValidation(($("#formTcpipDhcpChk1:radio ~ p:eq(2) #_octet_1").val() + "." +
				$("#formTcpipDhcpChk1:radio ~ p:eq(2) #_octet_2").val() + "." +
				$("#formTcpipDhcpChk1:radio ~ p:eq(2) #_octet_3").val() + "." +
				$("#formTcpipDhcpChk1:radio ~ p:eq(2) #_octet_4").val()), g_defregexp.ipv4, null, null, false))
		{
			alert(GetMsgLang("04040141"));
			return false;
		}

		// dns
		if(!(checkStringValidation($("#formTcpipPriDNS:text").val(), g_defregexp.ipv4, null, null, true)
				||checkStringValidation($("#formTcpipPriDNS:text").val(), g_defregexp.domain, null, null, true)))
		{
			alert(GetMsgLang("04040142"));
			return false;
		}
		if(!(checkStringValidation($("#formTcpipSecDNS:text").val(), g_defregexp.ipv4, null, null, true)
				||checkStringValidation($("#formTcpipSecDNS:text").val(), g_defregexp.domain, null, null, true)))
		{
			alert(GetMsgLang("04040142"));
			return false;
		}

		// ipv6
		if(!checkStringValidation($("#staticIPaddress").val(), g_defregexp.ipv6, null, null, true) && $("#ipv6Enable:checkbox").attr("checked"))
		{
			alert(GetMsgLang("04040143"));
			return false;
		}
		if(!checkStringValidation($("#defaultRouter").val(), g_defregexp.ipv6, null, null, true) && $("#ipv6Enable:checkbox").attr("checked"))
		{
			alert(GetMsgLang("04040144"));
			return false;
		}

		QString = makeQString();
		QString
			.set_action('update')
			.set_schema('xml')
			.add_list("NETWORK.Eth0.ipaddress", NETWORK_ETH0_IPADDRESS, manualIpAddress)
			.add_list("NETWORK.Eth0.subnet", NETWORK_ETH0_SUBNET, $("#formTcpipDhcpChk1:radio ~ p:eq(1) #_octet_1").val() + "." +
																		$("#formTcpipDhcpChk1:radio ~ p:eq(1) #_octet_2").val() + "." +
																		$("#formTcpipDhcpChk1:radio ~ p:eq(1) #_octet_3").val() + "." +
																		$("#formTcpipDhcpChk1:radio ~ p:eq(1) #_octet_4").val())
			.add_list("NETWORK.Eth0.gateway", NETWORK_ETH0_GATEWAY, $("#formTcpipDhcpChk1:radio ~ p:eq(2) #_octet_1").val() + "." +
																		$("#formTcpipDhcpChk1:radio ~ p:eq(2) #_octet_2").val() + "." +
																		$("#formTcpipDhcpChk1:radio ~ p:eq(2) #_octet_3").val() + "." +
																		$("#formTcpipDhcpChk1:radio ~ p:eq(2) #_octet_4").val())
			.add_list("NETWORK.Eth0.broadcast", NETWORK_ETH0_BROADCAST, broadcastAddress)

			.add_list("NETWORK.Eth0.Dhcp.enable", NETWORK_ETH0_DHCP_ENABLE, $("input[name='formTcpipDhcpChk']:checked:radio").val())
			.add_list("NETWORK.Eth0.Autoip.enable", NETWORK_ETH0_AUTOIP_ENABLE, ($("#linkLocalEnable:checkbox").attr("checked") == true) ? "yes":"no")
			.add_list("NETWORK.Eth0.hostname", NETWORK_ETH0_HOSTNAME, encodeURIComponent($("#formHostname:text").val()))
			.add_list("NETWORK.Ipv6.enable", NETWORK_IPV6_ENABLE, ($("#ipv6Enable:checkbox").attr("checked") == true) ? "yes":"no")
			.add_list("NETWORK.Eth0.Ipv6.raenable", NETWORK_ETH0_IPV6_RAENABLE, ($("#acceptRAEnable:checkbox").attr("checked") == true) ? "yes":"no")
			.add_list("NETWORK.Eth0.Ipv6.Dhcp.enable", NETWORK_ETH0_IPV6_DHCP_ENABLE, ($("#dhcpEnable:checkbox").attr("checked") == true) ? "yes":"no")
			.add_list("NETWORK.Eth0.Ipv6.Dhcp.type", NETWORK_ETH0_IPV6_DHCP_TYPE, $("#dhcpType").val())
			.add_list("NETWORK.Eth0.Ipv6.ipaddress", encodeURIComponent(NETWORK_ETH0_IPV6_IPADDRESS), encodeURIComponent($("#staticIPaddress:text").val()))
			.add_list("NETWORK.Eth0.Ipv6.gateway", encodeURIComponent(NETWORK_ETH0_IPV6_GATEWAY), encodeURIComponent($("#defaultRouter:text").val()))
			.add_list("NETWORK.Dns.preferred", encodeURIComponent(NETWORK_DNS_PREFERRED), dns0Value)
			.add_list("NETWORK.Dns.alternate0", encodeURIComponent(NETWORK_DNS_ALTERNATE0), dns1Value)
			.add_list("NETWORK.Eth0.Ipv6.prefixlength", NETWORK_ETH0_IPV6_PREFIXLENGTH, $("#prefixLength:text").val());

		reqQString = QString.get_qstring();
		if(!reqQString) {
			return;
		}

		$("button").attr("disabled", "disabled");
		if (!confirm(GetMsgLang("04040122")))
		{
			$("button").attr("disabled", "");
			return false;
		}
		$("span#formTestBtnResult").html("");

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

				if(redirectMode != "none")
				{
					setCookie("tcpipRedirection", 1, 1);
					parent.location.replace(redirectURL);
				}
			});

			return;
		});
		Req.Request(reqQString);
	});

	$("#btnIPRenew").click(function() {
		ViewLoadingSave(true);
		LoadParamJs("NETWORK.Eth0.Autoip", function() {
			var renewAutoIP = NETWORK_ETH0_AUTOIP_IPADDRESS.split(".");
			var renewAutoSubnet = NETWORK_ETH0_AUTOIP_SUBNET.split(".");

			$("#linkLocalIPContents .ip_octet:eq(0)").val(renewAutoIP[0]);
			$("#linkLocalIPContents .ip_octet:eq(1)").val(renewAutoIP[1]);
			$("#linkLocalIPContents .ip_octet:eq(2)").val(renewAutoIP[2]);
			$("#linkLocalIPContents .ip_octet:eq(3)").val(renewAutoIP[3]);

			$("#linkLocalSubnetContents .ip_octet:eq(0)").val(renewAutoSubnet[0]);
			$("#linkLocalSubnetContents .ip_octet:eq(1)").val(renewAutoSubnet[1]);
			$("#linkLocalSubnetContents .ip_octet:eq(2)").val(renewAutoSubnet[2]);
			$("#linkLocalSubnetContents .ip_octet:eq(3)").val(renewAutoSubnet[3]);
			ViewLoadingSave(false);
		});
	});
}

function isDnsDuplicate(primaryDns, secondaryDns)
{
	if((primaryDns == "" && secondaryDns == "")
		|| (primaryDns != secondaryDns))
		return false;

	return true;
}
