var g_defaultGroup = "SCHEDULE";
var prefix = "S";
var selectIdx = "";

var oldStartHour = 0;
var oldStartMinute = 0;
var oldEndHour = 23;
var oldEndMinute = 59;

$(function () {
	PreCustomize();
	initEnvironment();
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
	var classNum = ["04031117", "04031118", "04031136", "04031137", "04031138",
				"04031139", "04031140", "0501", "04031141", "04031142", "04031143"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "eventschedule", 
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

function SetRelation()
{
	$("#formTimeStartHour:text").numeric();
	$("#formTimeStartMinute:text").numeric();
	$("#formTimeEndHour:text").numeric();
	$("#formTimeEndMinute:text").numeric();

	$("#formTimeStartHour:text").change(function() {
			var inputValText = $("#formTimeStartHour:text").val()-0;
			$("#formTimeStartHour:text").val(inputValText);
		if(inputValText < 0 || inputValText > 23)
		{
			$("#formTimeStartHour:text").val(oldStartHour).focus();
			alert(GetMsgLang("04031139"));
			return false;
		}
	});
	$("#formTimeStartMinute:text").change(function() {
			var inputValText = $("#formTimeStartMinute:text").val()-0;
			$("#formTimeStartMinute:text").val(inputValText);
		if(inputValText < 0 || inputValText > 59)
		{
			$("#formTimeStartMinute:text").val(oldStartMinute).focus();
			alert(GetMsgLang("04031139"));
			return false;
		}
	});
	$("#formTimeEndHour:text").change(function() {
			var inputValText = $("#formTimeEndHour:text").val()-0;
			$("#formTimeEndHour:text").val(inputValText);
		if(inputValText < 0 || inputValText > 23)
		{
			$("#formTimeEndHour:text").val(oldEndHour).focus();
			alert(GetMsgLang("04031139"));
			return false;
		}
	});
	$("#formTimeEndMinute:text").change(function() {
			var inputValText = $("#formTimeEndMinute:text").val()-0;
			$("#formTimeEndMinute:text").val(inputValText);
		if(inputValText < 0 || inputValText > 59)
		{
			$("#formTimeEndMinute:text").val(oldEndMinute).focus();
			alert(GetMsgLang("04031139"));
			return false;
		}
	});
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

	for(var i=1;i<=12;i++)
	{
		$("#formDateStartMonth").append("<option>").find("option:last").attr("value", i).append(""+i);
		$("#formDateEndMonth").append("<option>").find("option:last").attr("value", i).append(""+i);
	}
	for(var i=1;i<=31;i++)
	{
		$("#formDateStartDay").append("<option>").find("option:last").attr("value", i).append(""+i);
		$("#formDateEndDay").append("<option>").find("option:last").attr("value", i).append(""+i);
	}
	for(var i=2000;i<=2037;i++)
	{
		$("#formDateStartYear").append("<option>").find("option:last").attr("value", i).append(""+i);
		$("#formDateEndYear").append("<option>").find("option:last").attr("value", i).append(""+i);
	}

	$("#input_form").dialog({
		autoOpen: false,
		width: 440,
		modal: true,
		resizable: false,
		position: 'center',
		open: function() {
			$("#testStatus").html("");
			$("#msg_status").removeClass('ui-state-error, ui-state-highlight').text("");
			$(":text").removeClass('ui-state-error');

			$("#formScheduleName:text").focus();

			Disable($("button#btnAdd"));
			Disable($("button#btnModify"));
			Disable($("button#btnRemove"));
			ResizePage(500);
		},
		close: function() {
			ResizePage();
			$("#effect").hide();
			Enable($("button"));
		}
	});

	$("#btnDialogOK").click(function(){
		var bValid = true;
		var dateFlag = 0;

		for(var i=0; i < 7; i++)
		{
			if($("#formDays" + i + ":checkbox").attr("checked") == true)
			{
				dateFlag=1;
			}
		}

		bValid = bValid && checkLength($("#formScheduleName:text"), GetMsgLang("04031141") + " (1 ... 32)", 1, 32);
		bValid = bValid && checkLength($("#formScheduleDes:text"), GetMsgLang("04031141") + " (0 ... 100)", 0, 100);

		if($("#formDateEnable:checkbox").attr("checked") == true)//check date
		{
			if(Number($("select#formDateStartYear").val()) > Number($("select#formDateEndYear").val()))
			{
				UpdateStatus(GetMsgLang("04031142"));
				bValid = bValid && false;
			}
			else if(Number($("select#formDateStartYear").val()) == Number($("select#formDateEndYear").val()))
			{
				if(Number($("select#formDateStartMonth").val()) > Number($("select#formDateEndMonth").val()))
				{
					UpdateStatus(GetMsgLang("04031142"));
					bValid = bValid && false;
				}
				else if(Number($("select#formDateStartMonth").val()) == Number($("select#formDateEndMonth").val()))
				{
					if(Number($("select#formDateStartDay").val()) > Number($("select#formDateEndDay").val()))
					{
						UpdateStatus(GetMsgLang("04031142"));
						bValid = bValid && false;
					}
				}
			}
			if($("#formTimeEnable:checkbox").attr("checked") == false){
				//set default time
				$("#formTimeStartHour:text").val("0");
				$("#formTimeStartMinute:text").val("0");
				$("#formTimeEndHour:text").val("23");
				$("#formTimeEndMinute:text").val("59");
			}
		}
		else
		{
			if($("#formTimeEnable:checkbox").attr("checked") == false && $("#formDaysEnable:checkbox").attr("checked") == false && dateFlag == 0)
			{
				UpdateStatus(GetMsgLang("04031143"));
				bValid = bValid && false;
			}
		}

		if($("#formTimeEnable:checkbox").attr("checked") == true)//check time
		{
			if($("#formDateEnable:checkbox").attr("checked") == false)
			{
				//set default date
				$("select#formDateStartMonth").val("1");
				$("select#formDateStartDay").val("1");
				$("select#formDateStartYear").val("2000");
				$("select#formDateEndMonth").val("12");
				$("select#formDateEndDay").val("31");
				$("select#formDateEndYear").val("2037");
			}		
		}

		if($("#formDaysEnable:checkbox").attr("checked") == true)//check days
		{
			if(dateFlag == 0){
				UpdateStatus(GetMsgLang("04031143"));
				bValid = bValid && false;
			}
			if($("#formTimeEnable:checkbox").attr("checked") == false){
				//set default time
				$("#formTimeStartHour:text").val("0");
				$("#formTimeStartMinute:text").val("0");
				$("#formTimeEndHour:text").val("23");
				$("#formTimeEndMinute:text").val("59");
			}
			if($("#formDateEnable:checkbox").attr("checked") == false){
				//set default date
				$("select#formDateStartMonth").val("1");
				$("select#formDateStartDay").val("1");
				$("select#formDateStartYear").val("2000");
				$("select#formDateEndMonth").val("12");
				$("select#formDateEndDay").val("31");
				$("select#formDateEndYear").val("2037");
			}
			
		}

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
				reqQString = "action=add&srcgroup=SCHEDULE.Default&group=SCHEDULE.S*&xmlschema";
				reqQString += "&name=" + encodeURIComponent($("#formScheduleName:text").val());
				reqQString += "&description=" + encodeURIComponent($("#formScheduleDes:text").val());
				reqQString += "&dateenable=" + encodeURIComponent(($("#formDateEnable:checkbox").attr("checked") == true) ? "yes" : "no");
				reqQString += "&timeenable=" + encodeURIComponent(($("#formTimeEnable:checkbox").attr("checked") == true) ? "yes" : "no");
				reqQString += "&startmonth=" + encodeURIComponent($("select#formDateStartMonth").val());
				reqQString += "&startday=" + encodeURIComponent($("select#formDateStartDay").val());
				reqQString += "&startyear=" + encodeURIComponent($("select#formDateStartYear").val());
				reqQString += "&endmonth=" + encodeURIComponent($("select#formDateEndMonth").val());
				reqQString += "&endday=" + encodeURIComponent($("select#formDateEndDay").val());
				reqQString += "&endyear=" + encodeURIComponent($("select#formDateEndYear").val());
				reqQString += "&starthour=" + encodeURIComponent($("#formTimeStartHour:text").val());
				reqQString += "&startminute=" + encodeURIComponent($("#formTimeStartMinute:text").val());
				reqQString += "&endhour=" + encodeURIComponent($("#formTimeEndHour:text").val());
				reqQString += "&endminute=" + encodeURIComponent($("#formTimeEndMinute:text").val());
				//dayofweek, mselect ....!
				var days = ["mon","tue","wed","thu","fri","sat","sun"];
				var firstValue = 0;
				reqQString += "&dayofweek=";
				for(var i=0; i < 7; i++)
				{
					if($("#formDays" + i + ":checkbox").attr("checked") == true)
					{
						if(firstValue == 0)
							firstValue = 1;
						else
							reqQString += ",";

						reqQString += days[i];
					}
				}
				break;
			case "modify":
				var days = ["mon","tue","wed","thu","fri","sat","sun"];
				var firstValue = 0;
				var dayofweekString = "";
				for(var i=0; i < 7; i++)
				{
					if($("#formDays" + i + ":checkbox").attr("checked") == true)
					{
						if(firstValue == 0)
							firstValue = 1;
						else
							dayofweekString += ",";

						dayofweekString += days[i];
					}
				}

				QString
					.set_action('update')
					.set_schema('xml')
					.add_list("name", eval("SCHEDULE_" + prefix + selectIdx + "_NAME"), encodeURIComponent($("#formScheduleName:text").val()))
					.add_list("description", eval("SCHEDULE_" + prefix + selectIdx + "_DESCRIPTION"), encodeURIComponent($("#formScheduleDes:text").val()))
					.add_list("dateenable", eval("SCHEDULE_" + prefix + selectIdx + "_DATEENABLE"), encodeURIComponent(($("#formDateEnable:checkbox").attr("checked") == true) ? "yes" : "no"))
					.add_list("timeenable", eval("SCHEDULE_" + prefix + selectIdx + "_TIMEENABLE"), encodeURIComponent(($("#formTimeEnable:checkbox").attr("checked") == true) ? "yes" : "no"))
					.add_list("startmonth", eval("SCHEDULE_" + prefix + selectIdx + "_STARTMONTH"), encodeURIComponent($("select#formDateStartMonth").val()))
					.add_list("startday", eval("SCHEDULE_" + prefix + selectIdx + "_STARTDAY"), encodeURIComponent($("select#formDateStartDay").val()))
					.add_list("startyear", eval("SCHEDULE_" + prefix + selectIdx + "_STARTYEAR"), encodeURIComponent($("select#formDateStartYear").val()))
					.add_list("endmonth", eval("SCHEDULE_" + prefix + selectIdx + "_ENDMONTH"), encodeURIComponent($("select#formDateEndMonth").val()))
					.add_list("endday", eval("SCHEDULE_" + prefix + selectIdx + "_ENDDAY"), encodeURIComponent($("select#formDateEndDay").val()))
					.add_list("endyear", eval("SCHEDULE_" + prefix + selectIdx + "_ENDYEAR"), encodeURIComponent($("select#formDateEndYear").val()))
					.add_list("starthour", eval("SCHEDULE_" + prefix + selectIdx + "_STARTHOUR"), encodeURIComponent($("#formTimeStartHour:text").val()))
					.add_list("startminute", eval("SCHEDULE_" + prefix + selectIdx + "_STARTMINUTE"), encodeURIComponent($("#formTimeStartMinute:text").val()))
					.add_list("endhour", eval("SCHEDULE_" + prefix + selectIdx + "_ENDHOUR"), encodeURIComponent($("#formTimeEndHour:text").val()))
					.add_list("endminute", eval("SCHEDULE_" + prefix + selectIdx + "_ENDMINUTE"), encodeURIComponent($("#formTimeEndMinute:text").val()))
					.add_list("dayofweek", eval("SCHEDULE_" + prefix + selectIdx + "_DAYOFWEEK"), encodeURIComponent(dayofweekString));

				reqQString = QString.get_qstring();
				if(!reqQString) {
					return;
				}
				reqQString += "&group=Schedule." + prefix + selectIdx;
				break;
			default:
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

	Disable($("button"));
}

function InitSetting()
{
	var notify_cnt = eval(g_defaultGroup + "_NBROFCOUNT");
	var notifyList = "";
	if(notify_cnt > 0)
		notifyList = eval(g_defaultGroup + "_LIST").split(",");

	$("select#formScheduleList").empty();
	if(notifyList == "" || notifyList == null)
	{
		return false;
	}
	for(var i=0;i<notifyList.length;i++)
	{
		var group = g_defaultGroup + "_" + prefix + notifyList[i];
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
			$("select#formScheduleList").append("<option value='" + notifyList[i] + "'>&lrm;</option>")
			.find("option").last().append(FillText(descListCheck, descListCheck.length, "right")
				+ FillText(valName, 19, "right")
				+ FillText(valNum, 6, "right")
			);
		}
		else {
			$("select#formScheduleList").append("<option value='" + notifyList[i] + "'></option>")
			.find("option").last().append("&nbsp;"
				+ FillText(valNum, 6, "left")
				+ FillText(valName, 19, "left")
				+ FillText(descListCheck, 64, "left")
			);
		}
	}
	$("#effect").hide();

}

function EventBind()
{
	Enable($("button"));

	$("#formDateEnable:checkbox").unbind().change(function() {
		if($("#formDateEnable:checkbox").attr("checked") == true)
		{
			Enable($('#formDateStartMonth'));
			Enable($('#formDateStartDay'));
			Enable($('#formDateStartYear'));
			Enable($('#formDateEndMonth'));
			Enable($('#formDateEndDay'));
			Enable($('#formDateEndYear'));
		}
		else
		{
			Disable($('#formDateStartMonth'));
			Disable($('#formDateStartDay'));
			Disable($('#formDateStartYear'));
			Disable($('#formDateEndMonth'));
			Disable($('#formDateEndDay'));
			Disable($('#formDateEndYear'));

			$("select#formDateStartMonth").val("1");
			$("select#formDateStartDay").val("1");
			$("select#formDateStartYear").val("2000");
			$("select#formDateEndMonth").val("12");
			$("select#formDateEndDay").val("31");
			$("select#formDateEndYear").val("2037");
		}
	});

	$("#formTimeEnable:checkbox").unbind().change(function() {
		if($("#formTimeEnable:checkbox").attr("checked") == true)
		{
			Enable($('#formTimeStartHour'));
			Enable($('#formTimeStartMinute'));
			Enable($('#formTimeEndHour'));
			Enable($('#formTimeEndMinute'));
		}
		else
		{
			Disable($('#formTimeStartHour'));
			Disable($('#formTimeStartMinute'));
			Disable($('#formTimeEndHour'));
			Disable($('#formTimeEndMinute'));

			$("#formTimeStartHour:text").val("0");
			$("#formTimeStartMinute:text").val("0");
			$("#formTimeEndHour:text").val("23");
			$("#formTimeEndMinute:text").val("59");
		}
	});

	$("#formDaysEnable:checkbox").unbind().change(function() {
		if($("#formDaysEnable:checkbox").attr("checked") == true)
		{
			for(var i=0; i < 7; i++)
			{
				Enable($("#formDays" + i + ":checkbox"));
			}
		}
		else
		{
			for(var i=0; i < 7; i++)
			{
				Disable($("#formDays" + i + ":checkbox"));

				$("#formDays" + i + ":checkbox").attr("checked", "");
			}
		}
	});

	$("#btnAdd").click(function() {
		if($("#formScheduleList option").size() >= 8)
		{
			alert(GetMsgLang("04031140"));
			return;
		}
		$("#effect").hide();
		

		$("#input_form").dialog("option", "title", GetMsgLang("04031117"));
		$("#input_form").dialog("option", "mode", "add");
		$("#input_form").dialog('open');


		$(":text").val("");
		$("#formTimeStartHour:text").val("0");
		$("#formTimeStartMinute:text").val("0");
		$("#formTimeEndHour:text").val("23");
		$("#formTimeEndMinute:text").val("59");
		$(":checkbox").attr("checked", "checked");
		$("select#formDateStartMonth").val("1");
		$("select#formDateStartDay").val("1");
		$("select#formDateStartYear").val("2000");
		$("select#formDateEndMonth").val("12");
		$("select#formDateEndDay").val("31");
		$("select#formDateEndYear").val("2037");
		$("#formDateEnable").attr("checked", "");
		$("#formTimeEnable").attr("checked", "");

		oldStartHour = "0";
		oldStartMinute = "0";
		oldEndHour = "23";
		oldEndMinute = "59";

		$("#formDateEnable:checkbox").change();
		$("#formTimeEnable:checkbox").change();
		$("#formDaysEnable:checkbox").change();
	});
	$("#btnModify").click(function() {
		$("#effect").hide();
		if($("#formScheduleList").val() == null)
		{
			alert(GetMsgLang("04031136"));
			return false;
		}

		$("#input_form").dialog("option", "title", GetMsgLang("04031118"));
		$("#input_form").dialog("option", "mode", "modify");
		$("#input_form").dialog('open');

		var group = g_defaultGroup + "_" + prefix + selectIdx;

		$("#formScheduleName:text").val(eval(group + "_NAME"));
		$("#formScheduleDes:text").val(eval(group + "_DESCRIPTION"));
		$("select#formDateStartMonth").val(eval(group + "_STARTMONTH"));
		$("select#formDateStartDay").val(eval(group + "_STARTDAY"));
		$("select#formDateStartYear").val(eval(group + "_STARTYEAR"));
		$("select#formDateEndMonth").val(eval(group + "_ENDMONTH"));
		$("select#formDateEndDay").val(eval(group + "_ENDDAY"));
		$("select#formDateEndYear").val(eval(group + "_ENDYEAR"));
		$("#formTimeStartHour:text").val(eval(group + "_STARTHOUR"));
		$("#formTimeStartMinute:text").val(eval(group + "_STARTMINUTE"));
		$("#formTimeEndHour:text").val(eval(group + "_ENDHOUR"));
		$("#formTimeEndMinute:text").val(eval(group + "_ENDMINUTE"));

		oldStartHour = eval(group + "_STARTHOUR");
		oldStartMinute = eval(group + "_STARTMINUTE");
		oldEndHour = eval(group + "_ENDHOUR");
		oldEndMinute = eval(group + "_ENDMINUTE");

		$(":checkbox").attr("checked", "");

		var dayofweek = eval(group + "_DAYOFWEEK");
		var dayofweeks = dayofweek.split(',');
		
		for(var i=0;i<dayofweeks.length;i++)
		{
			switch(dayofweeks[i])
			{
			case "mon":	$("#formDays"+ "0" + ":checkbox").attr("checked", "checked"); break;
			case "tue":	$("#formDays"+ "1" + ":checkbox").attr("checked", "checked"); break;
			case "wed":	$("#formDays"+ "2" + ":checkbox").attr("checked", "checked"); break;
			case "thu":	$("#formDays"+ "3" + ":checkbox").attr("checked", "checked"); break;
			case "fri":	$("#formDays"+ "4" + ":checkbox").attr("checked", "checked"); break;
			case "sat":	$("#formDays"+ "5" + ":checkbox").attr("checked", "checked"); break;
			case "sun":	$("#formDays"+ "6" + ":checkbox").attr("checked", "checked"); break;
			}
		}

		if(eval(group+"_DATEENABLE") == "yes")
		{
			$("#formDateEnable:checkbox").attr("checked", "checked");
		}
		else
		{
			$("#formDateEnable:checkbox").attr("checked", "");
		}

		if(eval(group+"_TIMEENABLE") == "yes")
		{
			$("#formTimeEnable:checkbox").attr("checked", "checked");
		}
		else
		{
			$("#formTimeEnable:checkbox").attr("checked", "");
		}

		if(dayofweeks != "")
		{
			$("#formDaysEnable:checkbox").attr("checked", "checked");
		}
		else
		{
			$("#formDaysEnable:checkbox").attr("checked", "");
		}

		$("#formDateEnable:checkbox").change();
		$("#formTimeEnable:checkbox").change();
		$("#formDaysEnable:checkbox").change();
	});

	$("select#formScheduleList").click(function() {
		if($(this).val() == null) return;
		selectIdx = $(this).val();

		var group = g_defaultGroup + "_" + prefix + selectIdx;
		var groupEnablelist = g_defaultGroup + "_PROFILE"
		ResizePage(450);

		$("#infoScheduleName").html(eval(group + "_NAME"));
		$("#infoScheduleDes").html(FillText(eval(group+"_DESCRIPTION"), 64, "left"));
		$("#infoStartDate").html(padZero(eval(group+"_STARTMONTH")) + "/" + padZero(eval(group+"_STARTDAY")) + "/" + eval(group+"_STARTYEAR"));
		$("#infoEndDate").html(padZero(eval(group+"_ENDMONTH")) + "/" + padZero(eval(group+"_ENDDAY")) + "/" + eval(group+"_ENDYEAR"));
		$("#infoTime").html(padZero(eval(group+"_STARTHOUR")) + ":" + padZero(eval(group+"_STARTMINUTE")) + " ~ " + padZero(eval(group+"_ENDHOUR")) + ":" + padZero(eval(group+"_ENDMINUTE")));

		var dayofweekArray = eval(group+"_DAYOFWEEK").split(",");
		var dayofweek = "";
		for(var i=0;i<dayofweekArray.length-1;i++)
			dayofweek += (dayofweekArray[i].substr(0,1)).toUpperCase() + dayofweekArray[i].substr(1,2) + ", ";
		dayofweek += (dayofweekArray[dayofweekArray.length-1].substr(0,1)).toUpperCase() + dayofweekArray[dayofweekArray.length-1].substr(1,2);
		if(dayofweek == "")// if dayofweek is empty, event server makes them all checked
			dayofweek = "Mon, Tue, Wed, Thu, Fri, Sat, Sun";
		$("#infoDays").text(dayofweek);

		$( "#effect" ).show();
	}).keyup(function(){
		$(this).click();
	});

	$("select#formScheduleList").dblclick(function() {
		if($(this).val() == null) return;
		$("#btnModify").click();
	});

	$("#btnRemove").click(function() {
		if($("#formScheduleList").val() == null)
		{
			alert(GetMsgLang("04031137"));
			return false;
		}

		if (!confirm(GetMsgLang("04031138")))
		{
			return false;
		}
		
		var Req = new CGIRequest();
		var reqQString = "action=remove&xmlschema&group=SCHEDULE." + prefix + selectIdx;

		var eventGroup = g_defaultGroup;
		var profileList;
		var profile_cnt = eval(g_defaultGroup + "_NBROFCOUNT");

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

	$("#formScheduleName:text").keyup(function(){
		LimitCharac("formScheduleName:text", 32);
	});
	$("#formScheduleDes:text").keyup(function(){
		LimitCharac("formScheduleDes:text", 100);
	});
}

function padZero(param)
{
	return "00".concat(param).match(/\d{2}$/);
}
