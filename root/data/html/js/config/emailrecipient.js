var g_defaultGroup = "EVENT";
var prefix = "E";
var selectIdx = "";

$(function () {
	PreCustomize();
	initEnvironment();
	LoadParamJs(g_defaultGroup, Load);
	LoadParamJs("EVENTPROFILE");
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum = ["04030318", "04030319", "04030320", "04030321", "04030322",
					"04030326", "04030327", "04030328", "04030329", "0501",
					"04030330", "04030331", "04030337", "04030338"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "emailrecipient", 
				parent.g_langData[parent.g_configData.language]);
}

function Load()
{
	InitForm();
	InitSetting();
	SetRelation();
	EventBind();
	$("button").button();
	ContentShow();
	PostCustomize();
}

function InitForm()
{
	function UpdateStatus(str)
	{
		$("#msg_status").text(str).addClass("ui-state-highlight");
	}
	function checkLength(o,str,min,max)
	{
		if ( o.val().length > max || o.val().length < min ) {
			o.addClass('ui-state-error');
			UpdateStatus(str);
			o.focus();
			return false;
		} else {
			return true;
		}
	}

	$("#input_form").dialog({
		autoOpen: false,
		width: 440,
		modal: true,
		resizable: false,
		position: [115, 30],
		open: function() {
			$("#testStatus").html("");
			$("#msg_status").removeClass('ui-state-error, ui-state-highlight').text("");
			$(".formDialog:text").removeClass('ui-state-error');

			$(".formDialog:text").val("");
			$(":checkbox").attr("checked", "checked");

			$("#formEmailName:text").focus();

			// 글자수 제한
			$("#formEmailName:text").keyup(function(){
				LimitCharac("formEmailName:text", 32);
			});
			$("#formEmailDes:text").keyup(function(){
				LimitCharac("formEmailDes:text", 100);
			});
			$("#formEmailAddr:text").keyup(function(){
				LimitCharac("formEmailAddr:text", 48);
			});

			LimitKor();
			Disable($("button#btnAdd"));
			Disable($("button#btnModify"));
			Disable($("button#btnRemove"));
		},
		close: function() {
			ResizePage();
			$("#effect").hide();
			Enable($("button"));
		}
	});

	$("#btnDialogTest").click(function(){
		var emailReq = new CGIRequest();
		var reqQString = "type=email&xmlschema&option=";

		reqQString += $("#formEmailAddr:text").val();

		emailReq.SetAddress("/uapi-cgi/admin/testaction.cgi");
		emailReq.SetCallBackFunc(function(xml){
			if($('option', xml).size() > 0)
			{
				$("#testStatus").html(GetMsgLang("04030328")).css("color", "#52A34C");
			}
			if ($('ERROR', xml).size() > 0)
			{
				$("#testStatus").html(GetMsgLang("04030329")).css("color", "#E62B00");
				return;
			}
			return;
		});
		emailReq.Request(reqQString);
	});

	$("#btnDialogOK").click(function(){
		var bValid = true;

		bValid = bValid && checkLength($("#formEmailName:text"), GetMsgLang("04030330"),1 , 32);
		bValid = bValid && checkLength($("#formEmailAddr:text"), GetMsgLang("04030331"),1 , 48);

		if(bValid == false)
		{
			return false;
		}

		var Req = new CGIRequest();
		var group = g_defaultGroup;

		QString = makeQString();

		switch($("#input_form").dialog("option", "mode"))
		{
			case "add":
				reqQString = "action=add&srcgroup=EVENT.Default.Notify.Email&group=EVENT.Notify.Email.E*&xmlschema";
				reqQString += "&name=" + encodeURIComponent($("#formEmailName:text").val());
				reqQString += "&description=" + encodeURIComponent($("#formEmailDes:text").val());
				reqQString += "&to=" + encodeURIComponent($("#formEmailAddr:text").val());
				break;
			case "modify":
				QString
					.set_action('update')
					.set_schema('xml')
					.add_list("name", eval("EVENT_NOTIFY_EMAIL_" + prefix + selectIdx + "_NAME"), encodeURIComponent($("#formEmailName:text").val()))
					.add_list("description", eval("EVENT_NOTIFY_EMAIL_" + prefix + selectIdx + "_DESCRIPTION"), encodeURIComponent($("#formEmailDes:text").val()))
					.add_list("to", eval("EVENT_NOTIFY_EMAIL_" + prefix + selectIdx + "_TO"), encodeURIComponent($("#formEmailAddr:text").val()));
				reqQString = QString.get_qstring();
				if(!reqQString) {
					return;
				}
				reqQString += "&group=EVENT.Notify.Email." + prefix + selectIdx;
				break;
			default:
				alert(GetMsgLang("04030318"));
				return false;
				break;
		}

		Req.SetType("POST");
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
				$("#input_form").dialog('close');
				InitSetting();
				ViewLoadingSave(false);
			});
			return;
		});
		Req.Request(reqQString);
	});

	$("#btnDialogCancel").click(function(){
		$("#input_form").dialog('close');
	});

	$("div#effect li.item li:not(.item-title)").each(function(){
		$(this).css("width", "450px");
	});

	$("#formEmailRateLimit:text").numeric();
	LimitKor();

	$("#sliderEmailRateLimit").each(function(index, element) {
		var $obj = $(this).parent().parent().find("input[type='text']");
		$(this).slider({
			range: "min",
			min: 0,
			max: 600,
			slide: function(event, ui) {
				$obj.val(ui.value);
			}
		})
	});

	Disable($("button"));
}

function InitSetting()
{
	$("#formEmailRateLimit:text").val(eval(g_defaultGroup + "_NOTIFY_EMAIL_SENDRATELIMIT"));
	$("#formEmailRateLimit:text").parent().parent().find(".slider-bar").slider("value", eval(g_defaultGroup + "_NOTIFY_EMAIL_SENDRATELIMIT"));

	$("input[name='contentsEncodingType'][value='" + eval(g_defaultGroup + "_NOTIFY_EMAIL_CONTENTSTYPE") + "']:radio").attr("checked", "checked");

	var notify_cnt = eval(g_defaultGroup + "_NOTIFY_EMAIL_NBROFCOUNT");
	var notifyList = "";
	if(notify_cnt > 0)
		notifyList = eval(g_defaultGroup + "_NOTIFY_EMAIL_LIST").split(",");

	$("select#formNotifyList").empty();
	if(notifyList == "" || notifyList == null)
	{
		return false;
	}
	for(var i=0;i<notifyList.length;i++)
	{
		var group = g_defaultGroup + "_NOTIFY_EMAIL_" + prefix + notifyList[i];
		var valNum = eval(i+1) + "";
		var valName = eval(group + "_NAME");

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
			$("select#formNotifyList").append("<option value='" + notifyList[i] + "'>&lrm;</option>")
			.find("option").last().append(FillText(descListCheck, descListCheck.length, "right")
				+ FillText(valName, 19, "right")
				+ FillText(valNum, 6, "right")
			);
		}
		else {
			$("select#formNotifyList").append("<option value='" + notifyList[i] + "'></option>")
			.find("option").last().append("&nbsp;"
				+ FillText(valNum, 6, "left")
				+ FillText(valName, 19, "left")
				+ FillText(descListCheck, 64, "left")
			);
		}
	}
	$("#effect").hide();
}

function SetRelation()
{
	$("#linkSmtp").click(function(){
		parent.$("#leftmenu .networkConfContents + div a[href='smtp.html']").click();
		parent.$("#leftmenu .networkConfContents").click();
	});

	// Text box range of number
	$("#formEmailRateLimit:text").blur(function() {
		var inputValTextInterval = $("#formEmailRateLimit:text").val();

		if(inputValTextInterval < 0 || inputValTextInterval > 600 || inputValTextInterval == "")
		{
			$("#formEmailRateLimit:text").val(eval(g_defaultGroup + "_NOTIFY_EMAIL_SENDRATELIMIT")).focus();
			$("#sliderEmailRateLimit").slider("value", eval(g_defaultGroup + "_NOTIFY_EMAIL_SENDRATELIMIT"));
			alert(GetMsgLang("04030337"));
		}
	});
	// Text box, Slider-bar sync.
	$("#formEmailRateLimit:text").keyup(function() {
		$("#sliderEmailRateLimit").slider("value", $("#formEmailRateLimit:text").val());
	});
}

function EventBind()
{
	Enable($("button"));

	$("#btnAdd").click(function() {
		if($("#formNotifyList option").size() >= 8)
		{
			alert(GetMsgLang("04030338"));
			return;
		}
		$("#effect").hide();
		ResizePage(530);

		$("#input_form").dialog("option", "title", GetMsgLang("04030326"));
		$("#input_form").dialog("option", "mode", "add");
		$("#input_form").dialog('open');
	});
	$("#btnModify").click(function() {
		$("#effect").hide();
		if($("#formNotifyList").val() == null)
		{
			alert(GetMsgLang("04030319"));
			return false;
		}

		ResizePage(530);

		$("#input_form").dialog("option", "title", GetMsgLang("04030327"));
		$("#input_form").dialog("option", "mode", "modify");
		$("#input_form").dialog('open');

		var group = g_defaultGroup + "_NOTIFY_EMAIL_" + prefix + selectIdx;

		$("#formEmailName:text").val(eval(group + "_NAME"));
		$("#formEmailDes:text").val(eval(group + "_DESCRIPTION"));
		$("#formEmailAddr:text").val(eval(group + "_TO"));
	});

	$("select#formNotifyList").click(function() {
		if($(this).val() == null) return;
		selectIdx = $(this).val();

		var group = g_defaultGroup + "_NOTIFY_EMAIL_" + prefix + selectIdx;
		var groupEnablelist = g_defaultGroup + "PROFILE"
		ResizePage(530);

		$("#infoEmailName").html(eval(group + "_NAME"));
		$("#infoEmailDes").html(FillText(eval(group+"_DESCRIPTION"), 64, "left"));
		$("#infoEmailAddr").html(eval(group + "_TO"));

		$( "#effect" ).show();
	}).keyup(function(){
		$(this).click();
	});

	$("select#formNotifyList").dblclick(function() {
		if($(this).val() == null) return;
		$("#btnModify").click();
	});

	$("#btnRemove").click(function() {
		if($("#formNotifyList").val() == null)
		{
			alert(GetMsgLang("04030320"));
			return false;
		}

		if (!confirm(GetMsgLang("04030321")))
		{
			return false;
		}
		
		var Req = new CGIRequest();
		var reqQString = "action=remove&xmlschema&group=EVENT.Notify.Email." + prefix + selectIdx;

		var eventGroup = g_defaultGroup;
		var profileList;
		var profile_cnt = eval(g_defaultGroup + "PROFILE" + "_NBROFCOUNT");

		if(profile_cnt > 0)
			profileList = eval(g_defaultGroup + "PROFILE" + "_LIST").split(",");

		for (var i = 0; i < profile_cnt; i++)
		{
			var enableList = eval(g_defaultGroup + "PROFILE" + "_P" + profileList[i].toUpperCase() + "_NOTIFICATION_EMAIL_ENABLELIST").split(",");

			for (var j = 0; j < enableList.length; j++)
			{
				if(enableList[j] == selectIdx)
				{
					alert(GetMsgLang("04030322"));
					return false;
//					if(!confirm("It is currently in use by the event notification. Are you sure to remove?"))
//					{
//						return false;
//					}
//					else
//					{
//						i = profile_cnt;
//						break;
//					}
				}
			}
		}

		Req.SetStartFunc(ViewLoadingSave);

		$this = $(this);

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
				$( "#effect" ).hide();
			});

			return;
		});
		Req.Request(reqQString);
	});

	var Req = new CGIRequest();
	$("#btnApply").button().click(function() {
		var reqQString = "action=update&xmlschema";

		QString = makeQString();
		QString
			.set_action('update')
			.set_schema('xml')
			.add_list("EVENT.Notify.Email.sendratelimit", EVENT_NOTIFY_EMAIL_SENDRATELIMIT, encodeURIComponent($("#formEmailRateLimit:text").val()))
			.add_list("EVENT.Notify.Email.contentstype", EVENT_NOTIFY_EMAIL_CONTENTSTYPE, $("input[name='contentsEncodingType']:checked:radio").val());
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
