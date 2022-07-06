var g_defaultGroup = "DIDO";
var DICount = 1;
var DOCount = 1;
var g_langData;

$(function () {
	PreCustomize();
	initEnvironment();
	LoadParamJs(g_defaultGroup + "&EVENTPROFILE", mainRun);
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum = ["04060130", "0501"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "dido", 
				parent.g_langData[parent.g_configData.language]);
}

function mainRun()
{
	InitForm();
	InitSetting();
	btnDisableStatus();
	SetRelation();
	EventBind();
	$("button").button();
	ContentShow();
	PostCustomize();
}

function InitForm()
{
	DICount = parent.g_brand.diCount;
	DOCount = parent.g_brand.doCount;

	if(DICount == 0)
		$(".diContents").css("display", "none");

	if(DOCount == 0)
		$(".doContents").css("display", "none");

	InitPage();

	for(var i=0; i<DICount; i++)
	{
		$("input[name='formMainTrigger" + "_ch" + i +"']:radio").attr("disabled", "disabled");
		$("#sliderDiInterval" + "_ch" + i).each(function(index, element) {
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
		$("#sliderDiDuration" + "_ch" + i).each(function(index, element) {
			var $obj = $(this).parent().parent().find("input[type='text']");
			$(this).slider({
				range: "min",
				min: 1,
				max: 600,
				slide: function(event, ui) {
					$obj.val(ui.value);
				}
			})
		});
	}

	if (parent.g_configData.langPath == "/language/Arabic.xml")
	{
		$(".slider-bar").slider({isRTL: true});
	}

	for(var i=0; i<DOCount; i++)
	{
		$("#sliderDoInterval" + "_ch" + i).each(function(index, element) {
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
		$("#sliderDoDuration" + "_ch" + i).each(function(index, element) {
			var $obj = $(this).parent().parent().find("input[type='text']");
			$(this).slider({
				range: "min",
				min: 1,
				max: 600,
				slide: function(event, ui) {
					$obj.val(ui.value);
				}
			})
		});
	}

}

function InitSetting(){
	var group = g_defaultGroup;
	if(parent.g_brand.pantilt == g_defbrand.type1ptz || parent.g_brand.pantilt == g_defbrand.irptz)
		$(".resourcetype_hidden").css("display", "none");
	
	$("input[name='formDiResource'][value='" + eval(group + "_DI_CH0_TYPE") + "']:radio").attr("checked", "checked");
	$("input[name='formDiTrigger'][value='" + eval(group + "_MAP_DI_CH0_TYPE") + "']:radio").attr("checked", "checked");
	
	for(var i=0; i<DICount; i++)
	{
		var diDetectiontypeDBvalue = eval(group + "_MAP_DI_CH" + i + "_DETECTIONTYPE");
		$("input[name='diDetectionType_ch" + i +"'][value='" + diDetectiontypeDBvalue + "']:radio").attr("checked", "checked");

		$(".diDetectionTypeSub_ch" + i).css("display", diDetectiontypeDBvalue == "edge" ? "block" : "none");

		$("#formDiSensorInterval" + "_ch" + i +":text").val(eval(group + "_MAP_DI_CH" + i + "_ELAPSE"));
		$("#formDiSensorInterval" + "_ch" + i +":text").parent().parent().find(".slider-bar").slider("value", eval(group + "_MAP_DI_CH" + i + "_ELAPSE"));
		$("#formDiDuration" + "_ch" + i +":text").val(eval(group + "_MAP_DI_CH" + i + "_DURATION"));
		$("#formDiDuration" + "_ch" + i +":text").parent().parent().find(".slider-bar").slider("value", eval(group + "_MAP_DI_CH" + i + "_DURATION"));

		if(i==0) continue;
		$("input[name='formDiTrigger" + "_ch" + eval(i+1) +"'][value='" + eval(group + "_MAP_DI_CH" + i + "_TYPE") + "']:radio").attr("checked", "checked");
	}
	
	for(var i=0; i<DOCount; i++)
	{
		var doDetectiontypeDBvalue = eval(group + "_MAP_DO_CH" + i + "_DETECTIONTYPE");
		$("input[name='doDetectionType_ch" + i +"'][value='" + doDetectiontypeDBvalue + "']:radio").attr("checked", "checked");
		$(".doDetectionTypeSub_ch" + i).css("display", doDetectiontypeDBvalue == "edge" ? "block" : "none");

		$("#formDoAlarmInterval" + "_ch" + i +":text").val(eval(group + "_MAP_DO_CH" + i + "_ELAPSE"));
		$("#formDoAlarmInterval" + "_ch" + i +":text").parent().parent().find(".slider-bar").slider("value", eval(group + "_MAP_DO_CH" + i + "_ELAPSE"));
		$("#formDoDuration" + "_ch" + i +":text").val(eval(group + "_MAP_DO_CH" + i + "_DURATION"));
		$("#formDoDuration" + "_ch" + i +":text").parent().parent().find(".slider-bar").slider("value", eval(group + "_MAP_DO_CH" + i + "_DURATION"));
	}
}

function SetRelation()
{
	var group = g_defaultGroup;

	for(var i=0; i<DICount; i++)
	{
		$(".diDetectionType_ch" + i + " input[name='diDetectionType_ch" + i + "']").unbind().change(function(){
			var ch = $(this).attr("id").split("_")[1].substring(2,3);

			if($(this).val() == "edge")
				$(".diDetectionTypeSub_ch" + ch).css("display", "block");
			else
				$(".diDetectionTypeSub_ch" + ch).css("display", "none");

			ResizePage();
		});

		$("#formDiSensorInterval" + "_ch" + i +":text").numeric();
		$("#formDiDuration" + "_ch" + i +":text").numeric();

		$("#formDiSensorInterval" + "_ch" + i +":text").blur(function() {
			var ch = $(this).attr("id").split("_")[1].substring(2,3);
			var inputValTextDi = $(this).val()-0;

			$(this).val(inputValTextDi);
			if($(this).val() == 0) return;

			if(inputValTextDi < 0 || inputValTextDi > 600 || inputValTextDi == "")
			{
				$(this).val(eval(group + "_MAP_DI_CH" + ch + "_ELAPSE")).focus();
				$(this).parent().parent().find(".slider-bar").slider("value", eval(group + "_MAP_DI_CH" + ch + "_ELAPSE"));
				alert(GetMsgLang("04060130"));
			}
		});
		$("#formDiDuration" + "_ch" + i +":text").blur(function() {
			var ch = $(this).attr("id").split("_")[1].substring(2,3);
			var inputValTextDi = $(this).val()-0;

			$(this).val(inputValTextDi);
			if(inputValTextDi < 1 || inputValTextDi > 600 || inputValTextDi == "")
			{
				$(this).val(eval(group + "_MAP_DI_CH" + ch + "_DURATION")).focus();
				$(this).parent().parent().find(".slider-bar").slider("value", eval(group + "_MAP_DI_CH" + ch + "_DURATION"));
				alert(GetMsgLang("04060130"));
			}
		});

		$("#formDiSensorInterval" + "_ch" + i).keyup(function() {
			$(this).parent().parent().find(".slider-bar").slider("value", $(this).val());
		});
		$("#formDiDuration" + "_ch" + i).keyup(function() {
			$(this).parent().parent().find(".slider-bar").slider("value", $(this).val());
		});
	}

	for(var i=0; i<DOCount; i++)
	{
		$(".doDetectionType_ch" + i + " input[name='doDetectionType_ch" + i + "']").unbind().change(function(){
			var ch = $(this).attr("id").split("_")[1].substring(2,3);

			if($(this).val() == "edge")
				$(".doDetectionTypeSub_ch" + ch).css("display", "block");
			else
				$(".doDetectionTypeSub_ch" + ch).css("display", "none");

			ResizePage();
		});

		$("#formDoAlarmInterval" + "_ch" + i +":text").numeric();
		$("#formDoDuration" + "_ch" + i +":text").numeric();

		$("#formDoAlarmInterval" + "_ch" + i +":text").blur(function() {
			var ch = $(this).attr("id").split("_")[1].substring(2,3);
			var inputValTextDi = $(this).val()-0;

			$(this).val(inputValTextDi);
			if($(this).val() == 0) return;

			if(inputValTextDi < 0 || inputValTextDi > 600 || inputValTextDi == "")
			{
				$(this).val(eval(group + "_MAP_DO_CH" + ch + "_ELAPSE")).focus();
				$(this).parent().parent().find(".slider-bar").slider("value", eval(group + "_MAP_DO_CH" + ch + "_ELAPSE"));
				alert(GetMsgLang("04060130"));
			}
		});
		$("#formDoDuration" + "_ch" + i +":text").blur(function() {
			var ch = $(this).attr("id").split("_")[1].substring(2,3);
			var inputValTextDi = $(this).val()-0;

			$(this).val(inputValTextDi);
			if(inputValTextDi < 1 || inputValTextDi > 600 || inputValTextDi == "")
			{
				$(this).val(eval(group + "_MAP_DO_CH" + ch + "_DURATION")).focus();
				$(this).parent().parent().find(".slider-bar").slider("value", eval(group + "_MAP_DO_CH" + ch + "_DURATION"));
				alert(GetMsgLang("04060130"));
			}
		});

		$("#formDoAlarmInterval" + "_ch" + i).keyup(function() {
			$(this).parent().parent().find(".slider-bar").slider("value", $(this).val());
		});
		$("#formDoDuration" + "_ch" + i).keyup(function() {
			$(this).parent().parent().find(".slider-bar").slider("value", $(this).val());
		});
	}
}

function btnDisableStatus()
{
	var group = g_defaultGroup;
	if(eval(group+"_DO_CH0_TRIG") == "on")
	{
		$("input[name='formMainTrigger']:radio").attr("disabled", "");
		$("input[name='formMainTrigger'][value='on']:radio").attr("checked", "checked");
	}
	else
	{
		$("input[name='formMainTrigger']:radio").attr("disabled", "");
		$("input[name='formMainTrigger'][value='off']:radio").attr("checked", "checked");
	}

	for(var i=1; i<DOCount; i++)
	{
		if(eval(group+"_DO_CH" + i + "_TRIG") == "on")
		{
			$("input[name='formMainTrigger" + "_ch" + eval(i+1) +"']:radio").attr("disabled", "");
			$("input[name='formMainTrigger" + "_ch" + eval(i+1) +"'][value='on']:radio").attr("checked", "checked");
		}
		else
		{
			$("input[name='formMainTrigger" + "_ch" + eval(i+1) +"']:radio").attr("disabled", "");
			$("input[name='formMainTrigger" + "_ch" + eval(i+1) +"'][value='off']:radio").attr("checked", "checked");
		}
	}
}

function setTrigger(selectorID, channel, data)
{
	ViewLoadingSave(true);
	Disable($("input[name='" + selectorID + "']"));

	var req = new CGIRequest();
	var reqQString = "action=update&group=DIDO.Do.Ch" + channel + "&trig=" + data;

	req.SetCallBackFunc(function(xml){
		$("input[name='" + selectorID + "'][value='" + data + "']:radio").attr("checked", "checked");
		Enable($("input[name='" + selectorID + "']"));
		ViewLoadingSave(false);
		return;
	});
	req.Request(reqQString);
}

function EventBind()
{
	var triggerName = "formMainTrigger";
	$("input[name='" + triggerName + "']").unbind().change(function(){
		var triggerVal = $("input[name='" + triggerName + "']:checked:radio").val();
		setTrigger(triggerName, 0, triggerVal);
	});
	
	for(var i=1; i<DOCount; i++)
	{
		var triggerChName = "formMainTrigger_ch" + eval(i+1);
		$("input[name='" + triggerChName + "']").unbind().change(function(){
			var id = $(this).attr("id");
			var ch = id.split("_")[2].substring(2,3);
			var triggerVal = $(this).val();
			setTrigger(id, ch-1, triggerVal);
		});
	}

	$("#btnApply").click(function() {
		var reqQString = "action=update&xmlschema";
		
		QString = makeQString();
		QString
			.set_action('update')
			.set_schema('xml')
			.add_list("DIDO.Di.Ch0.type", DIDO_DI_CH0_TYPE, $("input[name='formDiResource']:checked:radio").val())
			.add_list("DIDO.Map.Di.Ch0.type", DIDO_MAP_DI_CH0_TYPE, $("input[name='formDiTrigger']:checked:radio").val());

		for(var i=0; i<DICount; i++)
		{
			QString
			.add_list("DIDO.Map.Di.Ch" + i + ".elapse", eval("DIDO_MAP_DI_CH" + i + "_ELAPSE"), $("#formDiSensorInterval" + "_ch" + i +":text").val())
			.add_list("DIDO.Map.Di.Ch" + i + ".duration", eval("DIDO_MAP_DI_CH" + i + "_DURATION"), $("#formDiDuration" + "_ch" + i +":text").val())
			.add_list("DIDO.Map.Di.Ch" + i + ".detectiontype", eval("DIDO_MAP_DI_CH" + i + "_DETECTIONTYPE"), $("input[name='diDetectionType_ch" + i +"']:checked:radio").val());

			if(i == 0) continue;
			QString
			.add_list("DIDO.Map.Di.Ch" + i + ".type", eval("DIDO_MAP_DI_CH" + i + "_TYPE"), $("input[name='formDiTrigger" + "_ch" + eval(i+1) +"']:checked:radio").val());
		}
		for(var i=0; i<DOCount; i++)
		{
			QString
			.add_list("DIDO.Map.Do.Ch" + i + ".elapse", eval("DIDO_MAP_DO_CH" + i + "_ELAPSE"), $("#formDoAlarmInterval" + "_ch" + i +":text").val())
			.add_list("DIDO.Map.Do.Ch" + i + ".duration", eval("DIDO_MAP_DO_CH" + i + "_DURATION"), $("#formDoDuration" + "_ch" + i +":text").val())
			.add_list("DIDO.Map.Do.Ch" + i + ".detectiontype", eval("DIDO_MAP_DO_CH" + i + "_DETECTIONTYPE"), $("input[name='doDetectionType_ch" + i +"']:checked:radio").val());
		}
		

		reqQString = QString.get_qstring();
		if(!reqQString) {
			return;
		}

		var Req = new CGIRequest();
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
				InitSetting();
			});
			return;
		});
		Req.Request(reqQString);
	});
}

function InitPage()
{
	var DIFormStr = "";
	var DOFormStr = "";

	for(var i = 1; i < DICount; i++)
	{
		DIFormStr = "";
		DIFormStr += "<li class='item'>";
		DIFormStr += "  <ul>";
		DIFormStr += "	  <li class='item-title<span class='04060124'>DI</span>" + "#" + eval(i+1) + "</li>";
		DIFormStr += "  </ul>";
		DIFormStr += "</li>";
		DIFormStr += "<li class='item'>";
		DIFormStr += "  <ul class='indentContents'>";
		DIFormStr += "	  <li class='item-title 04060107'>Trigger type :</li>";
		DIFormStr += "	  <li>";
		DIFormStr += "		  <input type='radio' name='formDiTrigger" + "_ch" + eval(i+1) + "' id='formDiTrigger" + "_ch" + eval(i+1) + "0' value='no' /><label for='formDiTrigger" + "_ch" + eval(i+1) + "0' class='04060108'> Normally open</label>";
		DIFormStr += "	  </li>";
		DIFormStr += "	  <li>";
		DIFormStr += "		  <input type='radio' name='formDiTrigger" + "_ch" + eval(i+1) + "' id='formDiTrigger" + "_ch" + eval(i+1) + "1' value='nc' /><label for='formDiTrigger" + "_ch" + eval(i+1) + "1' class='04060109'> Normally closed</label>";
		DIFormStr += "	  </li>";
		DIFormStr += "  </ul>";
		DIFormStr += "</li>";
		DIFormStr += "<li class='item diDetectionType_ch" + i + "'>";
		DIFormStr += "  <ul class='indentation_margin_4'>";
		DIFormStr += "	  <li class='item-title margin_left_step4 04060138'>Detection type :</li>";
		DIFormStr += "	  <li>";
		DIFormStr += "		  <input type='radio' name='diDetectionType_ch" + i +"' id='diDetectionType_ch" + i + "_0' value='edge' /><label for='diDetectionType_ch" + i + "_0' class='04060139'> Edge trigger</label>";
		DIFormStr += "	  </li>";
		DIFormStr += "	  <li>";
		DIFormStr += "		  <input type='radio' name='diDetectionType_ch" + i +"' id='diDetectionType_ch" + i + "_1' value='level' /><label for='diDetectionType_ch" + i + "_1' class='04060140'> Level trigger</label>";
		DIFormStr += "	  </li>";
		DIFormStr += "  </ul>";
		DIFormStr += "</li>";
		DIFormStr += "<li class='item diDetectionTypeSub_ch" + i + "'>";
		DIFormStr += "  <ul class='indentation_margin_8'>";
		DIFormStr += "	  <li class='item-title margin_left_step8' style='width:220px; margin: 1px 0px 1px 4px;' >";
		DIFormStr += "		  <span class='04060110'>Interval between triggers</span><br /><span class='04060111'>(0: trigger for every detection) :</span>";
		DIFormStr += "	  </li>";
		DIFormStr += "	  <li style='margin-top: 4px;'><div id='sliderDiInterval" + "_ch" + i + "' class='slider-bar'></div></li>";
		DIFormStr += "	  <li>";
		DIFormStr += "		  <input type='text' size='5' id='formDiSensorInterval" + "_ch" + i + "' style='text-align:center;' />";
		DIFormStr += "		  <label for='formDiSensorInterval" + "_ch" + i + "' class='04060112'> (0 ... 600 sec)</label>";
		DIFormStr += "	  </li>";
		DIFormStr += "  </ul>";
		DIFormStr += "</li>";
		DIFormStr += "<li class='item diDetectionTypeSub_ch" + i + "'>";
		DIFormStr += "  <ul class='indentation_margin_8'>";
		DIFormStr += "	  <li class='item-title margin_left_step8 04060122'>Duration :</li>";
		DIFormStr += "	  <li><div id='sliderDiDuration" + "_ch" + i + "' class='slider-bar'></div></li>";
		DIFormStr += "	  <li>";
		DIFormStr += "		  <input type='text' size='5' id='formDiDuration" + "_ch" + i + "' style='text-align:center;'' />";
		DIFormStr += "		  <label for='formDiDuration" + "_ch" + i + "' class='04060123'> (1 ... 600 sec)</label>";
		DIFormStr += "	  </li>";
		DIFormStr += "  </ul>";
		DIFormStr += "</li>";

		$("#di_append").append(DIFormStr);
	}

		
	for(i = 1; i < DOCount; i++)
	{
		DOFormStr = "";
		DOFormStr += "<li class='item'>";
		DOFormStr += "  <ul>";
		DOFormStr += "	  <li class='item-title<span class='04060131'>DO</span>" + "#" + eval(i+1) + "</li>";
		DOFormStr += "  </ul>";
		DOFormStr += "</li>";
		DOFormStr += "<li class='item doDetectionType_ch" + i + "'>";
		DOFormStr += "  <ul class='indentation_margin_4'>";
		DOFormStr += "	  <li class='item-title margin_left_step4 04060138'>Detection type :</li>";
		DOFormStr += "	  <li>";
		DOFormStr += "		  <input type='radio' name='doDetectionType_ch" + i +"' id='doDetectionType_ch" + i + "_0' value='edge' /><label for='doDetectionType_ch" + i + "_0' class='04060139'> Edge trigger</label>";
		DOFormStr += "	  </li>";
		DOFormStr += "	  <li>";
		DOFormStr += "		  <input type='radio' name='doDetectionType_ch" + i +"' id='doDetectionType_ch" + i + "_1' value='level' /><label for='doDetectionType_ch" + i + "_1' class='04060140'> Level trigger</label>";
		DOFormStr += "	  </li>";
		DOFormStr += "  </ul>";
		DOFormStr += "</li>";
		DOFormStr += "<li class='item doDetectionTypeSub_ch" + i + "'>";
		DOFormStr += "  <ul class='indentation_margin_8'>";
		DOFormStr += "	  <li class='item-title margin_left_step8' style='width:220px; margin: 1px 0px 1px 4px;' >";
		DOFormStr += "		  <span class='04060132'>Interval between triggers</span><br /><span class='04060133'>(0: trigger for every detection) :</span>";
		DOFormStr += "	  </li>";
		DOFormStr += "	  <li style='margin-top: 4px;'><div id='sliderDoInterval" + "_ch" + i + "' class='slider-bar'></div></li>";
		DOFormStr += "	  <li>";
		DOFormStr += "		  <input type='text' size='5' id='formDoAlarmInterval" + "_ch" + i + "' style='text-align:center;' />";
		DOFormStr += "		  <label for='formDoAlarmInterval" + "_ch" + i + "' class='04060134'> (0 ... 600 sec)</label>";
		DOFormStr += "	  </li>";
		DOFormStr += "  </ul>";
		DOFormStr += "</li>";
		DOFormStr += "<li class='item doDetectionTypeSub_ch" + i + "'>";
		DOFormStr += "  <ul class='indentation_margin_8'>";
		DOFormStr += "	  <li class='item-title margin_left_step8 04060135'>Duration :</li>";
		DOFormStr += "	  <li><div id='sliderDoDuration" + "_ch" + i + "' class='slider-bar'></div></li>";
		DOFormStr += "	  <li>";
		DOFormStr += "		  <input type='text' size='5' id='formDoDuration" + "_ch" + i + "' style='text-align:center;'' />";
		DOFormStr += "		  <label for='formDoDuration" + "_ch" + i + "' class='04060136'> (1 ... 600 sec)</label>";
		DOFormStr += "	  </li>";
		DOFormStr += "  </ul>";
		DOFormStr += "</li>";

		$("#do_append").append(DOFormStr);

		DOFormStr = "";
		DOFormStr += "<li class='item'>";
		DOFormStr += "<ul class='indentContents'>";
		DOFormStr += "<li class='item-title'><span class='04060127'>DO</span>" + "#" + eval(i+1) + " :</li>";
		DOFormStr += "<li>";
		DOFormStr += "<input type='radio' name='formMainTrigger" + "_ch" + eval(i+1) + "' id='trig_on" + "_ch" + eval(i+1) + "' value='on' />";
		DOFormStr += "<label for='trig_on" + "_ch" + eval(i+1) + "' class='04060128'> Active</label> ";
		DOFormStr += "</li>";
		DOFormStr += "<li>";
		DOFormStr += "<input type='radio' name='formMainTrigger" + "_ch" + eval(i+1) + "' id='trig_off" + "_ch" + eval(i+1) + "' value='off' />";
		DOFormStr += "<label for='trig_off" + "_ch" + eval(i+1) + "' class='04060129'> Inactive</label>";
		DOFormStr += "</li>";
		DOFormStr += "</ul>";
		DOFormStr += "</li>";

		$("#doctr_append").append(DOFormStr);
	}

	setLanguage(parent.g_configData.langPath, setup + maincontents + "dido", parent.g_langData[parent.g_configData.language]);
	EvenOdd(parent.g_configData.skin);
}
