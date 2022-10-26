var g_defaultGroup = "NETWORK";
var selectGroup = "";
var statusInterval = 3;
var clock = null;
var wlanChannelCnt = 0;
var cellCnt = 0;
var wlanChannelGroup = "wlan" + wlanChannelCnt;
var revStatusMac = new Array();
var revStatusEssid = new Array();
var revStatusMode = new Array();
var revStatusFrequency = new Array();
var revStatusNoiselevel = new Array();
var revStatusSignallevel = new Array();
var revStatusQuality = new Array();
var revStatusAuthmode = new Array();
var revStatusEncryptkey = new Array();
var revStatusEncrypttype = new Array();
var revStatusBitrate = new Array();

$(function () {
	PreCustomize();
	initEnvironment();
	initBrand();
        ViewLoadingSave(true);
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
	var classNum = ["04041034", "04041035", "0501", "0503"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "wirelesslan",
				parent.g_langData[parent.g_configData.language]);
}

function mainRun()
{
	$("button").button();
	Disable($("button"));
	ContentShow();
	StatusLoad();
}

function initBrand()
{
	if(parent.g_brand.productID == "z013")
	{
		$(".infoAP_bitrates").css("display", "none");
		$(".infoAP_encryption").css("display", "none");
		$("#formWL_ListBoxMode").empty();
		$("#info_quality").text("RSSI");
		$("#listButton").css("margin-top", "55px");
	}
}

function StatusLoad()
{
	var statusReq = new CGIRequest();
	var statusReqQString = "";
	statusReq.SetAddress("/uapi-cgi/status.cgi?network&xmlschema");
	statusReq.SetCallBackFunc(function(xml){
		if($('network nbrofchannel', xml).size() > 0)
		{
			wlanChannelCnt = $('network nbrofchannel', xml).text();
			wlanChannelGroup = "wlan" + (wlanChannelCnt - 1);
		}

		if($('network '+ wlanChannelGroup + ' nbrofcount', xml).size() > 0)
		{
			cellCnt = $('network '+ wlanChannelGroup + ' nbrofcount', xml).text();

		}

		// Mac
		for(var i=0; i<cellCnt; i++)
		{
			if($('network '+ wlanChannelGroup + ' cell' + i + ' mac', xml).size() > 0)
			{
				revStatusMac[i] = $('network '+ wlanChannelGroup + ' cell' + i + ' mac', xml).text();
			}
		}

		// Essid
		for(var i=0; i<cellCnt; i++)
		{
			if($('network '+ wlanChannelGroup + ' cell' + i + ' essid', xml).size() > 0)
			{
				revStatusEssid[i] = $('network '+ wlanChannelGroup + ' cell' + i + ' essid', xml).text();
			}
		}

		// Mode
		for(var i=0; i<cellCnt; i++)
		{
			if($('network '+ wlanChannelGroup + ' cell' + i + ' mode', xml).size() > 0)
			{
				revStatusMode[i] = $('network '+ wlanChannelGroup + ' cell' + i + ' mode', xml).text();
			}
		}

		// Frequency
		for(var i=0; i<cellCnt; i++)
		{
			if($('network '+ wlanChannelGroup + ' cell' + i + ' frequency', xml).size() > 0)
			{
				revStatusFrequency[i] = $('network '+ wlanChannelGroup + ' cell' + i + ' frequency', xml).text();
			}
		}

		// Noiselevel
		for(var i=0; i<cellCnt; i++)
		{
			if($('network '+ wlanChannelGroup + ' cell' + i + ' noiselevel', xml).size() > 0)
			{
				revStatusNoiselevel[i] = $('network '+ wlanChannelGroup + ' cell' + i + ' noiselevel', xml).text();
			}
		}

		// Signallevel
		for(var i=0; i<cellCnt; i++)
		{
			if($('network '+ wlanChannelGroup + ' cell' + i + ' signallevel', xml).size() > 0)
			{
				revStatusSignallevel[i] = $('network '+ wlanChannelGroup + ' cell' + i + ' signallevel', xml).text();
			}
		}

		// Quality
		for(var i=0; i<cellCnt; i++)
		{
			if($('network '+ wlanChannelGroup + ' cell' + i + ' quality', xml).size() > 0)
			{
				revStatusQuality[i] = $('network '+ wlanChannelGroup + ' cell' + i + ' quality', xml).text();
			}
		}

		// Authmode
		for(var i=0; i<cellCnt; i++)
		{
			if($('network '+ wlanChannelGroup + ' cell' + i + ' authmode', xml).size() > 0)
			{
				var authValue = $('network '+ wlanChannelGroup + ' cell' + i + ' authmode', xml).text();
				var replaceAuthValue = authValue.split("-");

				revStatusAuthmode[i] = replaceAuthValue[0];
			}
		}

		// Encryptkey
		for(var i=0; i<cellCnt; i++)
		{
			if($('network '+ wlanChannelGroup + ' cell' + i + ' encryptionkey', xml).size() > 0)
			{
				revStatusEncryptkey[i] = $('network '+ wlanChannelGroup + ' cell' + i + ' encryptionkey', xml).text();
			}
		}

		// Encrypttype
		for(var i=0; i<cellCnt; i++)
		{
			if($('network '+ wlanChannelGroup + ' cell' + i + ' encrypttype', xml).size() > 0)
			{
				revStatusEncrypttype[i] = $('network '+ wlanChannelGroup + ' cell' + i + ' encrypttype', xml).text();
			}
		}

		// Bitrate
		for(var i=0; i<cellCnt; i++)
		{
			if($('network '+ wlanChannelGroup + ' cell' + i + ' bitrate', xml).size() > 0)
			{
				revStatusBitrate[i] = $('network '+ wlanChannelGroup + ' cell' + i + ' bitrate', xml).text();
			}
		}
		Load();
	});
	statusReq.Request(statusReqQString);
}

function Load()
{
	InitSetting();
	SubInitSetting();
        ViewLoadingSave(false);
	EventBind();
	SetRelation();
	PostCustomize();
}

function reGetList()
{
	var statusReq = new CGIRequest();
	var statusReqQString = "";
	statusReq.SetAddress("/uapi-cgi/status.cgi?network&xmlschema");
	statusReq.SetCallBackFunc(function(xml){
		if($('network nbrofchannel', xml).size() > 0)
		{
			wlanChannelCnt = $('network nbrofchannel', xml).text();
			wlanChannelGroup = "wlan" + (wlanChannelCnt - 1);
		}

		if($('network '+ wlanChannelGroup + ' nbrofcount', xml).size() > 0)
		{
			cellCnt = $('network '+ wlanChannelGroup + ' nbrofcount', xml).text();

		}

		// Mac
		for(var i=0; i<cellCnt; i++)
		{
			if($('network '+ wlanChannelGroup + ' cell' + i + ' mac', xml).size() > 0)
			{
				revStatusMac[i] = $('network '+ wlanChannelGroup + ' cell' + i + ' mac', xml).text();
			}
		}

		// Essid
		for(var i=0; i<cellCnt; i++)
		{
			if($('network '+ wlanChannelGroup + ' cell' + i + ' essid', xml).size() > 0)
			{
				revStatusEssid[i] = $('network '+ wlanChannelGroup + ' cell' + i + ' essid', xml).text();
			}
		}

		// Mode
		for(var i=0; i<cellCnt; i++)
		{
			if($('network '+ wlanChannelGroup + ' cell' + i + ' mode', xml).size() > 0)
			{
				revStatusMode[i] = $('network '+ wlanChannelGroup + ' cell' + i + ' mode', xml).text();
			}
		}

		// Frequency
		for(var i=0; i<cellCnt; i++)
		{
			if($('network '+ wlanChannelGroup + ' cell' + i + ' frequency', xml).size() > 0)
			{
				revStatusFrequency[i] = $('network '+ wlanChannelGroup + ' cell' + i + ' frequency', xml).text();
			}
		}

		// Noiselevel
		for(var i=0; i<cellCnt; i++)
		{
			if($('network '+ wlanChannelGroup + ' cell' + i + ' noiselevel', xml).size() > 0)
			{
				revStatusNoiselevel[i] = $('network '+ wlanChannelGroup + ' cell' + i + ' noiselevel', xml).text();
			}
		}

		// Signallevel
		for(var i=0; i<cellCnt; i++)
		{
			if($('network '+ wlanChannelGroup + ' cell' + i + ' signallevel', xml).size() > 0)
			{
				revStatusSignallevel[i] = $('network '+ wlanChannelGroup + ' cell' + i + ' signallevel', xml).text();
			}
		}

		// Quality
		for(var i=0; i<cellCnt; i++)
		{
			if($('network '+ wlanChannelGroup + ' cell' + i + ' quality', xml).size() > 0)
			{
				revStatusQuality[i] = $('network '+ wlanChannelGroup + ' cell' + i + ' quality', xml).text();
			}
		}

		// Authmode
		for(var i=0; i<cellCnt; i++)
		{
			if($('network '+ wlanChannelGroup + ' cell' + i + ' authmode', xml).size() > 0)
			{
				var authValue = $('network '+ wlanChannelGroup + ' cell' + i + ' authmode', xml).text();
				var replaceAuthValue = authValue.split("-");

				revStatusAuthmode[i] = replaceAuthValue[0];
			}
		}

		// Encryptkey
		for(var i=0; i<cellCnt; i++)
		{
			if($('network '+ wlanChannelGroup + ' cell' + i + ' encrypttype', xml).size() > 0)
			{
				revStatusEncryptkey[i] = $('network '+ wlanChannelGroup + ' cell' + i + ' encrypttype', xml).text();
			}
		}

		// Encrypttype
		for(var i=0; i<cellCnt; i++)
		{
			if($('network '+ wlanChannelGroup + ' cell' + i + ' encrypttype', xml).size() > 0)
			{
				revStatusEncrypttype[i] = $('network '+ wlanChannelGroup + ' cell' + i + ' encrypttype', xml).text();
			}
		}

		// Bitrate
		for(var i=0; i<cellCnt; i++)
		{
			if($('network '+ wlanChannelGroup + ' cell' + i + ' bitrate', xml).size() > 0)
			{
				revStatusBitrate[i] = $('network '+ wlanChannelGroup + ' cell' + i + ' bitrate', xml).text();
			}
		}
		$("#formWL_ListMac + li").text("-");
		$("#formWL_ListEncType + li").text("-");
		$("#formWL_ListBitrates + li").text("-");
		$("#formWL_ListQuality + li").text("-");
		//$("#formWL_ListChannel + li").text("-");
		$("#formWL_ListAuthSelect").empty();
		$("#formWL_ListAuthSelect").append("<option value=''>-</option>");
		$("#formWL_ListNetkeyPass").val("");
		InitSetting();
		ViewLoadingSave(false);
	});
	statusReq.Request(statusReqQString);
}

function SetRelation()
{
	$("#formWL_DhcpIPText:text").ipaddress();
	$("#formWL_DhcpChk0:radio ~ p:eq(0) .ip_octet").css("border", "0px");

	$("#formWL_DhcpSubnetText:text").ipaddress();
	$("#formWL_DhcpChk0:radio ~ p:eq(1) .ip_octet").css("border", "0px");

	$("#formWL_DhcpGatewayText:text").ipaddress();
	$("#formWL_DhcpChk0:radio ~ p:eq(2) .ip_octet").css("border", "0px");

	$("#formWL_StaticIPText:text").ipaddress();
	$("#formWL_DhcpChk1:radio ~ p:eq(0) .ip_octet").css("border", "0px");

	$("#formWL_StaticSubnetText:text").ipaddress();
	$("#formWL_DhcpChk1:radio ~ p:eq(1) .ip_octet").css("border", "0px");

	$("#formWL_StaticGatewayText:text").ipaddress();
	$("#formWL_DhcpChk1:radio ~ p:eq(2) .ip_octet").css("border", "0px");

	$("#formWL_StaticDns1Text:text").ipaddress();
	$("#formWL_DhcpChk1:radio ~ p:eq(3) .ip_octet").css("border", "0px");

	$("#formWL_StaticDns2Text:text").ipaddress();
	$("#formWL_DhcpChk1:radio ~ p:eq(4) .ip_octet").css("border", "0px");

	$("#formLinkLocalIP:text").ipaddress();
	$("#linkLocalIPContents .ip_octet").css("border", "0px");

	$("#formLinkLocalSubnet:text").ipaddress();
	$("#linkLocalSubnetContents .ip_octet").css("border", "0px");

	Disable($("#linkLocalIPContents .ip_octet"));
	$("#linkLocalIPContents div.ip_container").css("background-color", "#EEEEEE");
	Disable($("#linkLocalSubnetContents .ip_octet"));
	$("#linkLocalSubnetContents div.ip_container").css("background-color", "#EEEEEE");

	$("input[name='formWL_DhcpChk']").change(function() {
		if($("input[name='formWL_DhcpChk']:checked:radio").val() == "no")
		{
			Disable($("#formWL_DhcpChk0:radio ~ p:eq(0) .ip_octet"));
			$("#formWL_DhcpChk0:radio ~ p:eq(0) div.ip_container").css("background-color", "#EEEEEE");
			Disable($("#formWL_DhcpChk0:radio ~ p:eq(1) .ip_octet"));
			$("#formWL_DhcpChk0:radio ~ p:eq(1) div.ip_container").css("background-color", "#EEEEEE");
			Disable($("#formWL_DhcpChk0:radio ~ p:eq(2) .ip_octet"));
			$("#formWL_DhcpChk0:radio ~ p:eq(2) div.ip_container").css("background-color", "#EEEEEE");
			Enable($("#formWL_DhcpChk1:radio ~ p:eq(0) .ip_octet"));
			$("#formWL_DhcpChk1:radio ~ p:eq(0) div.ip_container").css("background-color", "#FFFFFF");
			Enable($("#formWL_DhcpChk1:radio ~ p:eq(1) .ip_octet"));
			$("#formWL_DhcpChk1:radio ~ p:eq(1) div.ip_container").css("background-color", "#FFFFFF");
			Enable($("#formWL_DhcpChk1:radio ~ p:eq(2) .ip_octet"));
			$("#formWL_DhcpChk1:radio ~ p:eq(2) div.ip_container").css("background-color", "#FFFFFF");
			Enable($("#formWL_DhcpChk1:radio ~ p:eq(3) .ip_octet"));
			$("#formWL_DhcpChk1:radio ~ p:eq(3) div.ip_container").css("background-color", "#FFFFFF");
			Enable($("#formWL_DhcpChk1:radio ~ p:eq(4) .ip_octet"));
			$("#formWL_DhcpChk1:radio ~ p:eq(4) div.ip_container").css("background-color", "#FFFFFF");
			Enable($("#formWL_DhcpChk1:radio ~ p:eq(5) .ip_octet"));
			$("#formWL_DhcpChk1:radio ~ p:eq(5) div.ip_container").css("background-color", "#FFFFFF");

			Enable($("#btnIPTest"));
		}
		else
		{
			Disable($("#formWL_DhcpChk0:radio ~ p:eq(0) .ip_octet"));
			$("#formWL_DhcpChk0:radio ~ p:eq(0) div.ip_container").css("background-color", "#EEEEEE");
			Disable($("#formWL_DhcpChk0:radio ~ p:eq(1) .ip_octet"));
			$("#formWL_DhcpChk0:radio ~ p:eq(1) div.ip_container").css("background-color", "#EEEEEE");
			Disable($("#formWL_DhcpChk0:radio ~ p:eq(2) .ip_octet"));
			$("#formWL_DhcpChk0:radio ~ p:eq(2) div.ip_container").css("background-color", "#EEEEEE");
			Disable($("#formWL_DhcpChk1:radio ~ p:eq(0) .ip_octet"));
			$("#formWL_DhcpChk1:radio ~ p:eq(0) div.ip_container").css("background-color", "#EEEEEE");
			Disable($("#formWL_DhcpChk1:radio ~ p:eq(1) .ip_octet"));
			$("#formWL_DhcpChk1:radio ~ p:eq(1) div.ip_container").css("background-color", "#EEEEEE");
			Disable($("#formWL_DhcpChk1:radio ~ p:eq(2) .ip_octet"));
			$("#formWL_DhcpChk1:radio ~ p:eq(2) div.ip_container").css("background-color", "#EEEEEE");
			Disable($("#formWL_DhcpChk1:radio ~ p:eq(3) .ip_octet"));
			$("#formWL_DhcpChk1:radio ~ p:eq(3) div.ip_container").css("background-color", "#EEEEEE");
			Disable($("#formWL_DhcpChk1:radio ~ p:eq(4) .ip_octet"));
			$("#formWL_DhcpChk1:radio ~ p:eq(4) div.ip_container").css("background-color", "#EEEEEE");
			Disable($("#formWL_DhcpChk1:radio ~ p:eq(5) .ip_octet"));
			$("#formWL_DhcpChk1:radio ~ p:eq(5) div.ip_container").css("background-color", "#EEEEEE");

			Disable($("#btnIPTest"));
		}
	});

	$("input[name='formWL_DhcpChk']:radio").change();

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
		ResizePage();
	});
	$("#linkLocalEnable:checkbox").change();
}

function InitSetting()
{
	var group = g_defaultGroup + "_WLAN0";
	$("select#formWL_List").empty();
	for(var i = 0; i < cellCnt; i++)
	{
		if(parent.g_brand.productID == "z013") {
			if (parent.g_configData.langPath == "/language/Arabic.xml") {
				$("select#formWL_List").append("<option value='" + i + "'>&lrm;</option>")
					.find("option").last()
					.append(FillText('-'+revStatusSignallevel[i], (revStatusQuality[i]).length+1, "right")
							+ FillText(revStatusMode[i], 20, "right")
							+ FillText(revStatusEssid[i], 15, "right") );
			}
			else {
				$("select#formWL_List").append("<option value='" + i + "'></option>")
					.find("option").last()
					.append("&nbsp;" + FillText(revStatusEssid[i], 15, "left")
							+ FillText(revStatusMode[i], 20, "left")
							+ FillText('-'+revStatusSignallevel[i], 9, "left"));
			}
		}
		else{
		
			if (parent.g_configData.langPath == "/language/Arabic.xml") {
				$("select#formWL_List").append("<option value='" + i + "'>&lrm;</option>")
					.find("option").last()
					.append(FillText(revStatusQuality[i], (revStatusQuality[i]).length, "right")
							+ FillText(revStatusMode[i], 20, "right")
							+ FillText(revStatusEssid[i], 15, "right") );
			}
			else {
				$("select#formWL_List").append("<option value='" + i + "'></option>")
					.find("option").last()
					.append("&nbsp;" + FillText(revStatusEssid[i], 15, "left")
							+ FillText(revStatusMode[i], 20, "left")
							+ FillText(revStatusQuality[i], 8, "left"));
			}
		}

		if(NETWORK_WLAN0_CONNECT_ESSID == revStatusEssid[i])
		{
			$("select#formWL_List option[value='" + i + "']").attr("selected", "selected");
			selectIdx = i;
			/*
			var revChannelValue = "";

			if(revStatusFrequency[selectIdx].indexOf("Channel") != -1)
			{
				revChannelValue = revStatusFrequency[selectIdx].split("Channel ");
				revChannelValue = revChannelValue[1].substr(0,1);
			}
			*/

			$("#formWL_ListEssid + li").text(revStatusEssid[selectIdx]);
			$("#formWL_ListMode + li").text(revStatusMode[selectIdx]);
			$("#formWL_ListMac + li").text(revStatusMac[selectIdx]);
			$("#formWL_ListEncType + li").text(revStatusEncrypttype[selectIdx]);
			$("#formWL_ListBitrates + li").text(revStatusBitrate[selectIdx]);
			$("#formWL_ListQuality + li").text(revStatusQuality[selectIdx]);
			//$("#formWL_ListChannel + li").text(revChannelValue);

			if(revStatusAuthmode[selectIdx] != "OPEN/SHARED")
			{
				$("#formWL_ListAuthSelect").empty();
				$("#formWL_ListAuthSelect").append("<option value='" + revStatusAuthmode[selectIdx] + "'>" + revStatusAuthmode[selectIdx] + "</option>");
			}
			else if(revStatusAuthmode[selectIdx] == "OPEN/SHARED")
			{
				$("#formWL_ListAuthSelect").empty();
				$("#formWL_ListAuthSelect").append("<option value='OPEN'>OPEN</option>")
										.append("<option value='SHARED'>SHARED</option>");
			}

			$("#formWL_ListNetkeyPass").val("");

			if(revStatusEncrypttype[selectIdx] == "NONE")
			{
				Disable($("#formWL_ListNetkeyPass"));
			}
			else
			{
				Enable($("#formWL_ListNetkeyPass"));
			}
		}
	}
}

function SubInitSetting()
{
	var group = g_defaultGroup + "_WLAN0";

	$("input[name='formWL_DhcpChk'][value='" + eval(group + "_DHCP_ENABLE") + "']:radio").attr("checked", "checked");

	// dhcp
	$("#formWL_DhcpIPText:text").val(eval(group+ "_DHCP_IPADDRESS"));
	$("#formWL_DhcpSubnetText:text").val(eval(group+ "_DHCP_SUBNET"));
	$("#formWL_DhcpGatewayText:text").val(eval(group+ "_DHCP_GATEWAY"));

	// static
	$("#formWL_StaticIPText:text").val(eval(group+ "_IPADDRESS"));
	$("#formWL_StaticSubnetText:text").val(eval(group+ "_SUBNET"));
	$("#formWL_StaticGatewayText:text").val(eval(group+ "_GATEWAY"));

	// dns
	$("#formWL_StaticDns1Text:text").val(eval(group+ "_DNS0"));
	$("#formWL_StaticDns2Text:text").val(eval(group+ "_DNS1"));

	$("input[name='formWL_DhcpChk']:radio").change();

	if(eval(group+"_AUTOIP_ENABLE") == "yes")
	{
		$("#linkLocalEnable:checkbox").attr("checked", "checked");
	}
	else
	{
		$("#linkLocalEnable:checkbox").attr("checked", "");
	}

	$("#formLinkLocalIP:text").val(eval(group+ "_AUTOIP_IPADDRESS"));
	$("#formLinkLocalSubnet:text").val(eval(group+ "_AUTOIP_SUBNET"));
}

function EventBind()
{
	var selectIdx = null;
	var tcpipReq = new CGIRequest();

	Enable($("button"));

	$("#btnIPTest").click(function() {
		var param = "&type=ip&ip=eth1 " + $("#formWL_StaticIPText:text").val();
		$.get("/uapi-cgi/admin/testaction.cgi?" + param, function(data) {
			parseTestActionResponse(data);
			ViewLoadingSave(false);
			Enable($("button"));
		});
	});

	$("select#formWL_List").click(function(){
		if($(this).val() == null) return;
		selectIdx = $(this).val();
		/*
		var revChannelValue = "";

		if(revStatusFrequency[selectIdx].indexOf("Channel") != -1)
		{
			revChannelValue = revStatusFrequency[selectIdx].split("Channel ");
			revChannelValue = revChannelValue[1].substr(0,1);
		}
		*/

		$("#formWL_ListEssid + li").text(revStatusEssid[selectIdx]);
		$("#formWL_ListMode + li").text(revStatusMode[selectIdx]);
		$("#formWL_ListMac + li").text(revStatusMac[selectIdx]);
		$("#formWL_ListEncType + li").text(revStatusEncrypttype[selectIdx]);
		$("#formWL_ListBitrates + li").text(revStatusBitrate[selectIdx]);
		$("#formWL_ListQuality + li").text(revStatusQuality[selectIdx]);
		//$("#formWL_ListChannel + li").text(revChannelValue);

		if(revStatusAuthmode[selectIdx] != "OPEN/SHARED")
		{
			$("#formWL_ListAuthSelect").empty();
			$("#formWL_ListAuthSelect").append("<option value='" + revStatusAuthmode[selectIdx] + "'>" + revStatusAuthmode[selectIdx] + "</option>");
		}
		else if(revStatusAuthmode[selectIdx] == "OPEN/SHARED")
		{
			$("#formWL_ListAuthSelect").empty();
			$("#formWL_ListAuthSelect").append("<option value='OPEN'>OPEN</option>")
									.append("<option value='SHARED'>SHARED</option>");
		}

		$("#formWL_ListNetkeyPass").val("");

		if(revStatusEncrypttype[selectIdx] == "NONE")
		{
			Disable($("#formWL_ListNetkeyPass"));
		}
		else
		{
			Enable($("#formWL_ListNetkeyPass"));
		}
	}).keyup(function(){
		$(this).click();
	});

	$("#btnList").click(function(){
		ViewLoadingSave(true);
		reGetList();
	});

	$("#btnApply").click(function(){
		var Req = new CGIRequest();
		var reqQString = "action=update&xmlschema";
		var EssidValue = $("#formWL_ListEssid + li").text();
		var ModeValue = $("#formWL_ListMode + li").text();
		var EncValue = $("#formWL_ListEncType + li").text();
		var nOctB1 = $("#formWL_DhcpChk1:radio ~ p:eq(0) #_octet_1").val() | ($("#formWL_DhcpChk1:radio ~ p:eq(1) #_octet_1").val() ^ 255);
		var nOctB2 = $("#formWL_DhcpChk1:radio ~ p:eq(0) #_octet_2").val() | ($("#formWL_DhcpChk1:radio ~ p:eq(1) #_octet_2").val() ^ 255);
		var nOctB3 = $("#formWL_DhcpChk1:radio ~ p:eq(0) #_octet_3").val() | ($("#formWL_DhcpChk1:radio ~ p:eq(1) #_octet_3").val() ^ 255);
		var nOctB4 = $("#formWL_DhcpChk1:radio ~ p:eq(0) #_octet_4").val() | ($("#formWL_DhcpChk1:radio ~ p:eq(1) #_octet_4").val() ^ 255);
		var broadcastAddress = nOctB1+"."+nOctB2+"."+nOctB3+"."+nOctB4;

		if("WEP" == EncValue)
		{
			if($("#formWL_ListNetkeyPass").val().length != 10 && $("#formWL_ListNetkeyPass").val().length != 26)
			{
				if($("#formWL_ListNetkeyPass").val().length != 0)
				{
					alert(GetMsgLang("04041034"));
					$("#formWL_ListNetkeyPass").focus();
					return;
				}
			}
		}
		else
		{
			if($("#formWL_ListNetkeyPass").val().length < 8)
			{
				if($("#formWL_ListNetkeyPass").val().length != 0)
				{
					alert(GetMsgLang("04041035"));
					$("#formWL_ListNetkeyPass").focus();
					return;
				}
			}
		}

		QString = makeQString();
		QString
			.set_action('update')
			.set_schema('xml')
			.add_list("NETWORK.Wlan0.Connect.essid", NETWORK_WLAN0_CONNECT_ESSID, encodeURIComponent(EssidValue))
			.add_list("NETWORK.Wlan0.Connect.authmode", "", $("#formWL_ListAuthSelect").val())
			.add_list("NETWORK.Wlan0.ipaddress", NETWORK_WLAN0_IPADDRESS, $("#formWL_DhcpChk1:radio ~ p:eq(0) #_octet_1").val() + "." +
																		$("#formWL_DhcpChk1:radio ~ p:eq(0) #_octet_2").val() + "." +
																		$("#formWL_DhcpChk1:radio ~ p:eq(0) #_octet_3").val() + "." +
																		$("#formWL_DhcpChk1:radio ~ p:eq(0) #_octet_4").val())
			.add_list("NETWORK.Wlan0.subnet", NETWORK_WLAN0_SUBNET, $("#formWL_DhcpChk1:radio ~ p:eq(1) #_octet_1").val() + "." +
																		$("#formWL_DhcpChk1:radio ~ p:eq(1) #_octet_2").val() + "." +
																		$("#formWL_DhcpChk1:radio ~ p:eq(1) #_octet_3").val() + "." +
																		$("#formWL_DhcpChk1:radio ~ p:eq(1) #_octet_4").val())
			.add_list("NETWORK.Wlan0.gateway", NETWORK_WLAN0_GATEWAY, $("#formWL_DhcpChk1:radio ~ p:eq(2) #_octet_1").val() + "." +
																		$("#formWL_DhcpChk1:radio ~ p:eq(2) #_octet_2").val() + "." +
																		$("#formWL_DhcpChk1:radio ~ p:eq(2) #_octet_3").val() + "." +
																		$("#formWL_DhcpChk1:radio ~ p:eq(2) #_octet_4").val())
			.add_list("NETWORK.Wlan0.broadcast", NETWORK_WLAN0_BROADCAST, broadcastAddress)
			.add_list("NETWORK.Wlan0.dns0", NETWORK_WLAN0_DNS0, $("#formWL_DhcpChk1:radio ~ p:eq(3) #_octet_1").val() +"."+
																		$("#formWL_DhcpChk1:radio ~ p:eq(3) #_octet_2").val() +"."+
																		$("#formWL_DhcpChk1:radio ~ p:eq(3) #_octet_3").val() +"."+
																		$("#formWL_DhcpChk1:radio ~ p:eq(3) #_octet_4").val())
			.add_list("NETWORK.Wlan0.dns1", NETWORK_WLAN0_DNS1, $("#formWL_DhcpChk1:radio ~ p:eq(4) #_octet_1").val() +"."+
																		$("#formWL_DhcpChk1:radio ~ p:eq(4) #_octet_2").val() +"."+
																		$("#formWL_DhcpChk1:radio ~ p:eq(4) #_octet_3").val() +"."+
																		$("#formWL_DhcpChk1:radio ~ p:eq(4) #_octet_4").val())
			.add_list("NETWORK.Wlan0.Autoip.enable", NETWORK_WLAN0_AUTOIP_ENABLE, ($("#linkLocalEnable:checkbox").attr("checked") == true) ? "yes":"no")
			.add_list("NETWORK.Wlan0.Dhcp.enable", NETWORK_WLAN0_DHCP_ENABLE, $("input[name='formWL_DhcpChk']:checked:radio").val());


		if(parent.g_brand.productID != "z013")
		{
			QString
				.add_list("NETWORK.Wlan0.Connect.mode", NETWORK_WLAN0_CONNECT_MODE, ModeValue)
				.add_list("NETWORK.Wlan0.Connect.encrypttype", NETWORK_WLAN0_CONNECT_ENCRYPTTYPE, EncValue);
		}

		if(selectIdx != null)
		{
			QString
			.add_list("NETWORK.Wlan0.Connect.enable", NETWORK_WLAN0_CONNECT_ENABLE, "yes");
		}

		if($("#formWL_NetKeyText").val() != "")
		{
			QString
				.add_list("NETWORK.Wlan0.Connect.key", "", $("#formWL_ListNetkeyPass").val());
		}


		reqQString = QString.get_qstring();
		if(!reqQString) {
			return;
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

			LoadParamJs(g_defaultGroup, function() {
				ViewLoadingSave(false);
			});

			return;
		});
		Req.SetErrorFunc(function(){
			ViewLoadingSave(false);
		});
		Req.Request(reqQString);
	});

	$("#btnIPRenew").click(function() {
		ViewLoadingSave(true);
		LoadParamJs("NETWORK.Wlan0.Autoip", function() {
			var renewAutoIP = NETWORK_WLAN0_AUTOIP_IPADDRESS.split(".");
			var renewAutoSubnet = NETWORK_WLAN0_AUTOIP_SUBNET.split(".");

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
