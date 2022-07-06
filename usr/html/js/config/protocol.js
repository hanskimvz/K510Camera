var g_defaultGroup = "PTZDRIVER";
var nSelectedProtocol= 0;

$(function () {
	PreCustomize();
	initEnvironment();
	LoadParamJs("PTZDRIVER&UART", mainRun);
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum = ["04110317", "04110318", "0501"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "protocol", 
				parent.g_langData[parent.g_configData.language]);
}

function mainRun()
{
	var enable_protocol = (UART_CH1_MODE == "ptz") ? true : false ;

	PreCustomize();
	ContentShow();
	InitForm(enable_protocol);
	if(enable_protocol) {
		SetRelation();
		InitSetting();
		EventBind();
	}
	ResizePage();
	PostCustomize();
}

function InitForm(flag)
{
	$("button").button();
	if(flag) {
		$("#protocolpage").remove("form");
		$("#protocolpage").append("<form>" + $("#protocolpage_enable").html() + "</form>");
		$(".settingbutton").show();
		//add ptz protocol list
		var ptzlistReq = new CGIRequest();
		var ptzlistReqQString = "";
		ptzlistReq.SetAddress("/sys/ptzs_list.xml");
		ptzlistReq.SetCallBackFunc(function(xml){
			$("#formPTZProtocol option").remove();
			$(xml).find("ptzs").each(function() {
				$("#formPTZProtocol").append("<option value=" + $(this).attr("file_name") + ">" + $(this).attr("file_name") + "</option>");
			});
			var group = g_defaultGroup + "_CH" + nSelectedProtocol;
			$("select#formPTZProtocol").val(eval(group+"_PROTOCOL"));
		});
		ptzlistReq.Request(ptzlistReqQString);
		$("#formPTZAddress:text").numeric();
	}
	else 
	{
		$("#protocolpage").remove("form");
		$("#protocolpage").append("<form>" + $("#protocolpage_disable").html() + "</form>");
		$(".settingbutton").hide();
		$("#linserialport").click(function(){
			parent.$("#leftmenu .peripheral_Contents + div a[href='uart.html']").click();
			parent.$("#leftmenu .peripheral_Contents").click();
		});
	}
}

function InitSetting()
{
	var driverList = "";
	var driver_cnt = eval(g_defaultGroup + "_NBROFCHANNEL");

	$("select#formPTZDriverList").empty();
	for(var i = 0; i < driver_cnt; i++)
	{
		var group = g_defaultGroup + "_CH" + i;
		var id = eval(i+1) + "";
		var enable = eval(group + "_ENABLE");
		var protocol = eval(group + "_PROTOCOL");
		var address = eval(group + "_ADDRESS");
		var port = eval(group + "_PORT");

		if (parent.g_configData.langPath == "/language/Arabic.xml") {
			$("#protocolpage select#formPTZDriverList").append("<option value='" + i + "'>&lrm;"
				+ FillText(port, port.length, "right")
				+ FillText(address, 15, "right")
				+ FillText(protocol, 32, "right")
				+ FillText(id, 13, "right")
				+ "</option>");
		}
		else {
			$("#protocolpage select#formPTZDriverList").append("<option value='" + i + "'>"
				+ "&nbsp;"
				+ FillText(id, 13, "left")
				+ FillText(protocol, 32, "left")
				+ FillText(address, 15, "left")
				+ FillText(port, 15, "left")
				+ "</option>");
		}
	}

	$("select#formPTZDriverList option:eq(" + nSelectedProtocol + ")").attr("selected", "selected");
	$("select#formPTZDriverList").click();
}

function SetRelation()
{
	$("select#formPTZDriverList").click(function() {
		if($(this).val() == null) return;
		selectIdx = $(this).val();
		nSelectedProtocol = selectIdx;

		var group = g_defaultGroup + "_CH" + selectIdx;
		$("#formPTZID").text(eval(parseInt(selectIdx)+1) + "");
		$("select#formPTZProtocol").val(eval(group+"_PROTOCOL"));
		$("#formPTZAddress:text").val(eval(group + "_ADDRESS"));
		$("#formPTZUartport").text(eval(group + "_PORT"));
	}).keyup(function(){
		$(this).click();
	});

	$("#formPTZAddress:text").blur(function() {
		var inputValTextAddress = $("#formPTZAddress:text").val()-0;
		$("#formPTZAddress:text").val(inputValTextAddress);
		if($(this).val() == 0) return;
		if(inputValTextAddress < 0 || inputValTextAddress >65536 || inputValTextAddress == "")
		{
			selectIdx = $("#formPTZDriverList").val();
			var group = g_defaultGroup + "_CH" + selectIdx;

			$("#formPTZAddress:text").val(eval(group + "_ADDRESS")).focus();
			alert(GetMsgLang("04110317"));
		}
	});
}

function EventBind()
{
	$("#btnApply").click(function() {
		if($("#formPTZDriverList").val() == null)
		{
			alert(GetMsgLang("04110318"));
			return false;
		}

		var selectIdx = $("select#formPTZDriverList").val();
		var group = g_defaultGroup + "_CH" + selectIdx;

		var issave = 0;
		var protocol_s = eval(group + "_PROTOCOL");
		var address_s = eval(group + "_ADDRESS");
		var protocol_c = $("select#formPTZProtocol").val();
		var address_c = $("#formPTZAddress:text").val();
		//not change
		var id = eval(selectIdx+1) + "";
		var port = eval(group + "_PORT");
		var url = "/nvc-cgi/ptz/ptz2.fcgi?ptzid=" + id;
		if(protocol_s != protocol_c)
		{
			issave += 1;
			url += "&protocol=" + protocol_c;
		}
		if(address_s != address_c)
		{
			issave += 1;
			url += "&ptzaddr=" + address_c;
		}
		if(issave == 0) return false;

		ViewLoadingSave(true);

		/*
		name : ptz2.fcgi
		path : /nvc-cgi/ptz/ptz2.fcgi
		exampl : "/nvc-cgi/ptz/ptz2.fcgi?ptzid=" + id + "&ptzaddr=" + address_c + "&protocol=" + protocol_c + "&ptzport=" + port
		*/
		$.get(url +  "&_=" + (new Date()).getTime(), function(data, textStatus){
			if(textStatus == "success")
			{
				ErrorCheck(data);
				LoadParamJs(g_defaultGroup, function(){
					InitSetting();
					ViewLoadingSave(false);
				});
			}
			else
			{
				ViewLoadingSave(false); 
			}
				});
	});	
}

function ErrorCheck(str)
{
	var result = str.split("\n");
	var errstr = "";
	for(i=0; i < result.length; i++)
	{
		if(result[i].length == 0) continue;
		if(-1 == result[i].indexOf("#200|OK"))
		{
			errstr += (result[i] + "\n");
		}
		
	}

	if(errstr.length != 0)
	{
		alert(GetMsgLang("0501"));
		return false;
	}

	return true;
}