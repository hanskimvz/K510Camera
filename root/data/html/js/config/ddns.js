var g_defaultGroup = "DDNS";

$(function () {
	PreCustomize();
	initEnvironment();
	LoadParamJs(g_defaultGroup, mainRun);
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum = ["04040822", "0501"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "ddns", 
				parent.g_langData[parent.g_configData.language]);
}

function mainRun()
{
	InitSetting();
	SetRelation();
	EventBind();
	ContentShow();
	PostCustomize();
}

function InitSetting()
{
	var group = g_defaultGroup;

	if(eval(group+"_ENABLE") == "yes")
	{
		$("#formDdnsEnable:checkbox").attr("checked", "checked");
	}
	else
	{
		$("#formDdnsEnable:checkbox").attr("checked", "");
	}
	$("select#formDdnsDynDns").val(eval(group+ "_SERVERTYPE"));
	$("#formDdnsDomainName:text").val(eval(group+ "_DOMAINNAME"));
	$("#formDdnsUpTime:text").val(eval(group+ "_UPDATETIME"));
	$("#formDdnsUserName:text").val(eval(group+ "_USER"));
	$("#formDdnsPass:password").val(eval(group+ "_PWD"));
}

function SetRelation()
{
	// 글자수 제한
	$("#formDdnsDomainName:text").keyup(function(){
		LimitCharac("formDdnsDomainName:text", 128);
	});
	$("#formDdnsUserName:text").keyup(function(){
		LimitCharac("formDdnsUserName:text", 32);
	});
	$("#formDdnsPass:password").keyup(function(){
		LimitCharac("formDdnsPass:password", 32);
	});
	// 한글 제한 chrome
	LimitKor();

	var group = g_defaultGroup;
	$("#formDdnsUpTime:text").numeric();
	$("#formDdnsUpTime:text").blur(function() {
		var inputValTextTime = $("#formDdnsUpTime:text").val()-0;
		$("#formDdnsUpTime:text").val(inputValTextTime);
		if(inputValTextTime < 1 || inputValTextTime > 864000 || inputValTextTime == "")
		{
			$("#formDdnsUpTime:text").val(eval(group+ "_UPDATETIME")).focus();
			alert(GetMsgLang("04040822"));
		}
	});

	$("select#formDdnsDynDns").change(function(){
		if($("select#formDdnsDynDns").val() == "FreeDNS")
		{
			$("#ddns_notify").css("display", "block");
			Disable($("#formDdnsUserName"));
			Disable($("#formDdnsPass"));
		}
		else
		{
			$("#ddns_notify").css("display", "none");
			Enable($("#formDdnsUserName"));
			Enable($("#formDdnsPass"));
		}
	});
	$("select#formDdnsDynDns").change();
}

function EventBind()
{
	var Req = new CGIRequest();

	$("#btnApply").button().click(function() {
		var reqQString = "action=update&xmlschema";
		if($("#formDdnsUpTime:text").val() < 1 || $("#formDdnsUpTime:text").val() > 864000 || $("#formDdnsUpTime:text").val() == "") return;
		
		QString = makeQString();
		QString
			.set_action('update')
			.set_schema('xml')
			.add_list("DDNS.enable", DDNS_ENABLE, ($("#formDdnsEnable:checkbox").attr("checked") == true) ? "yes":"no")
			.add_list("DDNS.servertype", DDNS_SERVERTYPE, $("select#formDdnsDynDns").val())
			.add_list("DDNS.domainname", encodeURIComponent(DDNS_DOMAINNAME), encodeURIComponent($("#formDdnsDomainName:text").val()))
			.add_list("DDNS.updatetime", DDNS_UPDATETIME, $("#formDdnsUpTime:text").val())
			.add_list("DDNS.user", encodeURIComponent(DDNS_USER), encodeURIComponent($("#formDdnsUserName:text").val()))
			.add_list("DDNS.pwd", encodeURIComponent(DDNS_PWD), encodeURIComponent($("#formDdnsPass:password").val()));
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

			LoadParamJs(g_defaultGroup, function() {
				InitSetting();
				ViewLoadingSave(false);
			});

			return;
		});
		Req.Request(reqQString);
	});
}
