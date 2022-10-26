var DefaultGroup = "EVENTPROFILE";
var nSelectedStream = 0;
var selectProfile = "";
var eventlistChk = 0;
var vcaZonesReceived = 0;
var vcaRulesReceived = 0;
var vcaCountersReceived = 0;
var vcaListReceived = 0;
var actionListReceived = 0;
var MAX_VCA_ZONES = 40;
var MAX_VCA_RULES = 60;
var g_ptzFlag = 0;
var emailPrefix = "E";
var ftpPrefix = "F";
var httpPrefix = "H";
var g_langData;

var actions = {
	VCA:[
		"Disable VCA",
		"Enable VCA",
		"Reset Counter"
	]
};

//event rulses - constraint list
var g_eventList = ["formEventPFSensor", "formERPir", "formEventPFMotion", "eventSrcFace",
						"formEventPFVCA", "formEventPFSourceAlarm", "formEventPFNetworkLossDetect", "formEventPFDayNightTransition"];
var g_healthList = ["formEventPFIPchange", "formEventPFTemperature", "formEventPFVideoStatus", "storageStatus", "apChangedStatus"];
var g_actionList = ["formEventPFActiveRec", "formEventPFPTZ"]; //doesn't use with g_healthList

var g_sourceAllList = ["formEventPFSensor", "formERPir", "formEventPFMotion", "eventSrcFace",
						"formEventPFVCA", "formEventPFSourceAlarm", "formEventPFNetworkLossDetect", "formEventPFDayNightTransition",
						"formEventPFIPchange", "formEventPFTemperature", "formEventPFVideoStatus",
						"storageStatus", "apChangedStatus", "formEventPFSourceRecurrence", "formEventPFSourceSchedule"];

var g_doTriggerList = ["formEventPFSourceAlarm"];
var g_actionAllList = ["formEventPFAlarm", "formEventPFActiveRec", "formEventPFSaveLog", "formEventPFEmail", "formEventPFFtp", 	"formEventPFHttp", "formEventPFTcpPush", "formEventPFTcp", "formEventPFMulticast", "formEventPFPTZ"];

$(function () {
	PreCustomize();
	initEnvironment();
	initBrand();
	InitForm();
	LoadParamJs("EVENTPROFILE&DIDO", mainRun);
	LoadParamJs("MD&FD&EVENT&PTZ&SCHEDULE", eventlist);
});
$( document ).ready(function() {
    console.log( "ready!" );
});
function initEnvironment()
{
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum = ["0403012801", "0403019904", "0403019905", "0403019906",
					"0403019907", "0403019908","0403019909", "0403019912", 
					"0403019913", "0403019914", "0501", "0403019917", 
					"0403019918", "0403019942", "0403019949", "0403019957", 
					"0403019964", "0403019965", "0403019966", "0403019967", "0403019968",
					"0403019969", "0403019970", "0403019971", "0403019972", "0403019973",
					"0403019974", "0403019975", "0403019976", "0403019977", "0403019978",
					"0403019979", "0403019980", "0403019981", "0403019982", "0403019983",
					"0403019984", "0403019985", "0403019986", "0403019987", "0403019988", "0403019989"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "eventrules", 
				parent.g_langData[parent.g_configData.language]);
}

function initBrand()
{
	if(parent.g_brand.pantilt == g_defbrand.type1ptz ||
		parent.g_brand.pantilt == g_defbrand.irptz ||
		parent.g_brand.pantilt == g_defbrand.ptz)
		g_ptzFlag = 1;

	$("li.storageContents").css("display", parent.g_brand.sd == "0" ? "none" : "block");
	$("li.VideoStatusContents").css("display", parent.g_brand.cameraClass == "encoder" ? "block" : "none");
	$("li.actionPtz").css("display", g_ptzFlag == 1 ? "block" : "none");

	if(parent.g_brand.diCount == 0)
		$("li.di_Contents").css("display", "none");

	if(parent.g_brand.doCount == 0)
		$("li.do_Contents").css("display", "none");

	if (parent.g_brand.sd == 0)
		$("li.RecordingContents").css("display", "none");

	if (parent.g_support.dntModel == false)
		$("li.dn_Contents").css("display", "none");

	if(parent.g_brand.pir == 0)
	{
		$("#pir").css("display", "none").removeClass('item');
		$("#pirHidden").removeClass('item');
	}
	else if(parent.g_brand.pir == 1)
	{
		$("#pir").css("display", "block");
	}

	var isMotionDisplay = true;
	var isFaceDisplay = true;

	if("rs51c0b" == parent.g_brand.imgDevice ||
		"mdc200s" == parent.g_brand.imgDevice ||
		"mdc600s" == parent.g_brand.imgDevice)
		isMotionDisplay = false;

	if("fisheye" == parent.g_brand.lensType || "rs51c0b" == parent.g_brand.imgDevice
		|| "seek-thermal" == parent.g_brand.imgDevice || parent.g_support.tamarisk ||
		"mdc200s" == parent.g_brand.imgDevice ||
		"mdc600s" == parent.g_brand.imgDevice || "dm368" == parent.g_brand.soctype)
		isFaceDisplay = false;

	jqDisplayCtrl("li.motionContents", isMotionDisplay);
	jqDisplayCtrl("li.faceContents", isFaceDisplay);
	jqDisplayCtrl("li.apChangedContents", parent.g_brand.wifi_attr_dev == "rs9113");
}

//Set up VCA interface:
(function (CAP, VCA, window, $, undefined)
{
	//Check includes:
	if((CAP === undefined) || (VCA === undefined) || ($ === undefined))
	{
		console.error('CAP.VCA: Error: You must include the base CAP library, VCA and jQuery');
		return;
	}
	else
	{
		CAP.loadConfig();
	}
}(CAP, CAP.VCA, window, $)
);

function mainRun()
{
	parent.$("#frame").show();
	Enable($("button").button());
	Enable($("select"));
	
	InitSetting();
	SetRelation();
	EventBind();
	initLanguage();
	ContentShow();
	PostCustomize();
}

function isCheckMaxList()
{
	if($("#formProfileList option").size() >= 8)
		return false;

	return true;
}

/** @brief Creates the list of VCA zones that could be used as event sources */
function populateVCARuleList()
{
	var zoneInUse = 'false';
	var zoneID = '';
	var zoneName = '';

	if(browserCheck() == "msie")
	{
		checkboxVCAMarginTop = 'margin-top: 0px';
	}
	else
	{
		checkboxVCAMarginTop = 'margin-top: 2px';
	}

	try
	{
		// VCA zone list
		$("#reclistVCAZone").empty();
		var rulenum = parseInt(CAP.ajax.getServerData("VCA.Ch0.nbrofrule",true));
		
		//Zones might not be in a contiguous block so test to see if each exists:
		for(i=0; i<MAX_VCA_ZONES; i++)
		{
		  zoneInUse = CAP.ajax.getServerData('VCA.Ch0.Zn' + i + '.enable',true);
		  zoneID = CAP.ajax.getServerData('VCA.Ch0.Zn' + i + '.id',true);
		  zoneName = CAP.ajax.getServerData('VCA.Ch0.Zn' + i + '.name',true);

		  if(zoneInUse === null)
		  {
			zoneInUse = 'no';
		  }

		  if(zoneName == null)
		  {
			zoneName = "";
		  }

		  if(zoneInUse === 'yes')
		  {
			//Generate the line in the GUI corresponding to the VCA zone:
			$("#reclistVCAZone").append("<ul></ul>").find("ul").last()
				.append("<li style='margin: 0px 0px 3px 15px'><input type='checkbox' class='zonelist' value='' id='vcaEnableZone" + i + "'></input></li>")
				.append("<li class='ellipsis' style='width: 300px; display: block; overflow: hidden; text-overflow: ellipsis;" + checkboxVCAMarginTop + "'>" + 
				"<label for='vcaEnableZone" + i + "'>" + zoneName + "</label></li>");
			var subrulelistid = "recrulesofzone" + i;
			$("#reclistVCAZone").append("<div id='vcaRuleOfZone" + i + "' class='subsection'><ul><li id='" + subrulelistid + "' style='width:150'></li></ul></div>");
			$("#" + subrulelistid).empty();

			for(j=0; j<MAX_VCA_RULES; j++)
			{
				ruleZone = CAP.ajax.getServerData("VCA.Ch0.Rl" + j + ".datazone",true);
				if(ruleZone != null)
					ruleZone = ruleZone.split(',')[0]; //BB: There can now be a comma seperated list of zones in a rule
				ruleInUse = CAP.ajax.getServerData("VCA.Ch0.Rl" + j + ".enable",true);
				ruleType = CAP.ajax.getServerData("VCA.Ch0.Rl" + j + ".type",true);
				if(ruleZone == i && ruleInUse === 'yes' && ruleType !== 'complex')
				{
					ruleName = CAP.ajax.getServerData("VCA.Ch0.Rl" + j + ".name",true);

					$("#" + subrulelistid).append("<ul></ul>").find("ul").last()
						.append("<li style='margin: 0px 0px 3px 0px'><input type='checkbox' value='' id='vcaEnableRule" + j + "'></input></li>")
						.append("<li class='ellipsis' style='width: 300px; display: block; overflow: hidden; text-overflow: ellipsis;" + checkboxVCAMarginTop + "'>" + 
						"<label for='vcaEnableRule" + j + "'>" + ruleName + "</label></li>");
				}
			}
			$("#vcaRuleOfZone" + i).css('display', 'block');
			$("#vcaEnableZone" + i + ":checkbox").change(function() {
				var subrulelistid = "recrulesofzone" + this.id.replace("vcaEnableZone","");

				if($(this).attr("checked") == true)
				{
					$("#" + subrulelistid + " li :checkbox").attr("checked", "checked");
				}
				else					
				{
					$("#" + subrulelistid + " li :checkbox").attr("checked", "");
				}
			});
		  }

		  $("#recrulesofzone" + i).change(function() {
			var subrulelistid = "vcaEnableZone" + this.id.replace("recrulesofzone","");
			var nextEntry = $(this)[0].firstChild;
			var ruleCountVal = 0;
			
			while(nextEntry != null)
			{
				if(nextEntry.firstChild.firstChild.checked == true)
				{
					ruleCountVal++;
					
				}
				nextEntry = nextEntry.nextSibling;
			}
			if(ruleCountVal > 0)
			{
				$("#" + subrulelistid + ":checkbox").attr("checked", "checked");
			}
			else					
			{
				$("#" + subrulelistid + ":checkbox").attr("checked", "");
			}
		});
		  
		}
		
		//Now add complex rules:
		$("#reclistVCAZone").append("<ul></ul>").find("ul").last()
			.append("<li style='margin: 0px 0px 3px 15px'></li>")
			.append("<li class='ellipsis' style='width: 300px; display: block; overflow: hidden; text-overflow: ellipsis;" + checkboxVCAMarginTop + "'>" + 
			"<label for='vcaEnableZone" + i + "'>" + GetMsgLang("0403012801") + "</label></li>");
		$("#reclistVCAZone").append("<div style='display:block;' class='subsection'><ul><li id='complexrulelist' style='width:150'></li></ul></div>");
		$("#complexrulelist").empty();

		for(j=0; j<MAX_VCA_RULES; j++)
		{
			ruleInUse = CAP.ajax.getServerData("VCA.Ch0.Rl" + j + ".enable",true);
			ruleType = CAP.ajax.getServerData("VCA.Ch0.Rl" + j + ".type",true);

			if(ruleInUse === 'yes' && ruleType === 'complex')
			{
				ruleName = CAP.ajax.getServerData("VCA.Ch0.Rl" + j + ".name","Unnamed Rule");
  
				$("#complexrulelist").append("<ul></ul>").find("ul").last()
					.append("<li style='margin: 0px 0px 3px 0px'><input type='checkbox' value='' id='vcaEnableRule" + j + "'></input></li>")
					.append("<li class='ellipsis' style='width: 300px; display: block; overflow: hidden; text-overflow: ellipsis;" + checkboxVCAMarginTop + "'>" + 
					"<label for='vcaEnableRule" + j + "'>" + ruleName + "</label></li>");
			}
		}
	}
	catch(exception)
	{
		CAP.logging.error('Failed to populate VCA event list: '+exception);
		throw exception;
	}

	vcaRulesReceived = 1;
	vcaZonesReceived = 1;
	updateVCARuleList();
	populateVCACounterList();
	adjustSourcesPageSize();
}

/** @brief	Returns a list of rules that have been ticked in the GUI */
function getVCARuleList()
{
	var enableList = "";
	var ruleID = -1;
	var ruleNum = parseInt(CAP.ajax.getServerData("VCA.Ch0.nbrofrule",true));
	if(vcaRulesReceived == 1) //Has the list of valid zones been received?
	{
		for(var i = 0; i < MAX_VCA_RULES; i ++)
		{
			var elementID = "#vcaEnableRule" + i;
			if($(elementID).attr("checked") == true)
			{
				if(enableList != "")
				{
					enableList += ",";
				}
				enableList += i;
			}
		}
		
	}
	else
	{
		//A zone list hasn't been received yet so there is no GUI - if the profile already exists, return the same settings as the user cannot have modified them
		if(selectProfile.toUpperCase() != "")
		{
			enableList = eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_VCA_ENABLERULELIST");
		}

	}

	
	return enableList;
}

function getVCAZoneEnableList()
{
  var enableList = "";
  var zoneID = -1;
  var nextSiblingIndex = 0;
  if(vcaZonesReceived == 1) //Has the list of valid zones been received?
  {
	var nextEntry = $(".zonelist")[0];
	while(nextEntry != null)
	{
	  if(nextEntry.checked == true)
	  {
		if(enableList != "")
		{
		  enableList += ",";
		}

		zoneID = nextEntry.id;
		zoneID = zoneID.replace("vcaEnableZone","");

		enableList += zoneID;
	  }
	  nextEntry = $(".zonelist")[++nextSiblingIndex];/*nextEntry.nextSibling;*/
	}
  }
  else
  {
	//A zone list hasn't been received yet so there is no GUI - if the profile already exists, return the same settings as the user cannot have modified them
	if(selectProfile.toUpperCase() != "")
	{
	  enableList = eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_VCA_ENABLELIST");
	}

  }
  return enableList;
}


/** @brief	Sets the tick boxes in the list of zones according to the current settings */
function updateVCARuleList()
{
	//Check that both the VCA zones and the enable list have been received, and that the profile is valid:
	if(vcaListReceived == 0 || vcaRulesReceived == 0 || vcaZonesReceived == 0 ||selectProfile == "")
	{
		return;
	}
	$("#reclistVCAZone li :checkbox").attr("checked","");

	{
		//Obtain the enable list
		var vcaEnableList = eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_VCA_ENABLERULELIST").split(",");

		for(var i = 0; i < vcaEnableList.length; i ++)
		{
			$("#vcaEnableRule" + vcaEnableList[i]).attr("checked", "checked");
		}

		//Obtain the enable list
		  var vcaZoneEnableList = eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_VCA_ENABLELIST").split(",");

		  
		  for(var i=0;i<vcaZoneEnableList.length;i++)
		  {
			$("#reclistVCAZone li #vcaEnableZone" + vcaZoneEnableList[i]).attr("checked","checked");
		  }
	}
}

/** @brief Creates the list of VCA counters that could be used as event sources */
function populateVCACounterList()
{
	var ruleInUse = '';
	var ruleID = '';
	var ruleName = '';

	if(browserCheck() == "msie")
	{
		checkboxVCAMarginTop = 'margin-top: 0px';
	}
	else
	{
		checkboxVCAMarginTop = 'margin-top: 2px';
	}

	try
	{
		$("#reclistVCACounter").empty();
		var countnum = parseInt(CAP.ajax.getServerData("VCA.Ch0.nbrofcounter",true));
		for(i = 0; i < countnum; i ++)
		{
			ruleInUse = CAP.ajax.getServerData("VCA.Ch0.Ct" + i + ".enable",true);
			ruleID = i;
			ruleName = CAP.ajax.getServerData("VCA.Ch0.Ct" + i + ".name",true);
			if(ruleName == null)
			{
				ruleName = "";
			}

			if(ruleInUse === 'yes')
			{
				//Generate the line in the GUI corresponding to the Counter:
				$("#reclistVCACounter").append("<ul></ul>").find("ul").last()
					.append("<li style='margin: 0px 3px 3px 15px'><input type='checkbox' value='' id='vcaEnableCounter" + i + "'></input></li>")
					.append("<li class='ellipsis' style='width: 300px; display: block; overflow: hidden; text-overflow: ellipsis;" + checkboxVCAMarginTop + "'>" + 
					"<label for='vcaEnableCounter" + i + "'>" + ruleName + "</label></li>");
			}
		}
		
	}
	catch(exception)
	{
		CAP.methods.log(CAP.enums.logLevel.ERROR, 'Failed to populate VCA event list: '+exception);
		throw exception;
	}

	vcaCountersReceived = 1;
	updateVCACounterList();
	adjustSourcesPageSize();

}

/** @brief	Returns a list of zones that have been ticked in the GUI */
function getVCACounterList()
{
	var enableList = "";
	var ruleID = -1;

	if(vcaCountersReceived == 1) //Has the list of valid zones been received?
	{
		var nextEntry = $("#reclistVCACounter")[0].firstChild;
		while(nextEntry != null)
		{
			if(nextEntry.firstChild.firstChild.checked == true)
			{
				if(enableList != "")
				{
					enableList += ",";
				}

				ruleID = nextEntry.firstChild.firstChild.id;
				ruleID = ruleID.replace("vcaEnableCounter","");

				enableList += ruleID;

			}
			nextEntry = nextEntry.nextSibling;
		}
	}
	else
	{
		//A zone list hasn't been received yet so there is no GUI - if the profile already exists, return the same settings as the user cannot have modified them
		if(selectProfile.toUpperCase() != "")
		{
			enableList = eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_VCA_ENABLECOUNTERLIST");
		}

	}
	return enableList;
}

	


/** @brief	Sets the tick boxes in the list of zones according to the current settings */
function updateVCACounterList()
{
	//Check that both the VCA zones and the enable list have been received, and that the profile is valid:
	if(vcaListReceived == 0 || vcaCountersReceived == 0 || selectProfile == "")
	{
		return;
	}


	{
		//Obtain the enable list
		var vcaEnableList = eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_VCA_ENABLECOUNTERLIST").split(",");

		$("#reclistVCACounter li :checkbox").attr("checked","");
		for(var i=0;i<vcaEnableList.length;i++)
		{
			$("#reclistVCACounter li #vcaEnableCounter" + vcaEnableList[i]).attr("checked","checked");
		}
	}
}

/** @brief */




/** @brief	Adjusts the page size to take account of expanded sections */
function adjustSourcesPageSize()
{
	var newSize = $("#input_form").height() + 160;

	if(newSize < 480)
	{
		newSize = 480;
	}

	ResizePage(newSize);

	if(browserCheck() == "msie")
	{
		$(".ui-widget-overlay").height(newSize);
	}
}

function eventlist()
{
	eventlistChk = 1;
	vcaListReceived = 1;
	//Enable($("button"));
	//Enable($("select"));

	// select box List 표시
	var listEmail = eval("EVENT_NOTIFY_EMAIL_LIST").split(",");
	var listFtp = eval("EVENT_NOTIFY_FTP_LIST").split(",");
	var listHttp = eval("EVENT_NOTIFY_HTTP_LIST").split(",");
	var listMD = eval("MD_CH0_LIST").split(",");
	var listFD = eval("FD_CH0_LIST").split(",");

	var profile = "EVENTPROFILE" + "_P" + selectProfile.toUpperCase();
	var checkboxMarginTop = 'margin-top: 4px';
	var checkboxMDMarginTop = "";
	var i, j = "";

	// get ptz info
	var ptzPresetCountTotal = 0;
	var ptzPresetEnablelist = "";
	var ptzGroup = "PTZ";
	var ptzCntInit = 0;

	ptzPresetCountTotal = eval(ptzGroup + "_CH0_PRESET_NBROFPRESET");

	for(ptzCntInit=0; ptzCntInit<ptzPresetCountTotal; ptzCntInit++)
	{
		if(eval(ptzGroup + ("_CH0_PRESET_P" + ptzCntInit + "_ENABLE")) == "yes")
		{
			if(ptzPresetEnablelist == "")
			{
				ptzPresetEnablelist += ptzCntInit;
			}
			else
			{
				ptzPresetEnablelist += ("," + ptzCntInit);
			}
		}
	}

	if(listMD == "" || listMD == null)
	{
		listMD = 0;
	}

	if(listFD == "" || listFD == null)
		listFD = 0;

	// Motion detection List
	$("#reclistMD").empty();
	for (i=0; i < listMD.length; i++)
	{
		if(eval("MD_CH0_Z" + listMD[i] + "_ENABLE") != "yes") continue;

		var nameMD = eval("MD_CH0_Z" + listMD[i] + "_NAME");
		var descMD = eval("MD_CH0_Z" + listMD[i] + "_DESCRIPTION");

		nameMD = nameMD.replace(/</g, "&lt;");
		descMD = descMD.replace(/</g, "&lt;");

		$("#reclistMD").append("<ul></ul>").find("ul").last()
			.append("<li style='margin: 0px 0px 3px 0px'><input type='checkbox' value='' id='" + "mdEnableZone" + listMD[i] + "'></input></li>")
			.append("<li style='width: 10px; " + checkboxMarginTop + "'>" + 
			"<label for='" + "mdEnableZone" + listMD[i] + "'>" + (i+1) + "." + "</label></li>")
			.append("<li class='ellipsis' style='width: 120px; display: block; overflow: hidden; text-overflow: ellipsis;" + checkboxMarginTop + "'>" + 
			"<label for='" + "mdEnableZone" + listMD[i] + "'>" + nameMD + "</label></li>")
			.append("<li class='ellipsis' style='width: 300px; display: block; overflow: hidden; text-overflow: ellipsis;" + checkboxMarginTop + "'>" + 
			"<label for='" + "mdEnableZone" + listMD[i] + "'>" + descMD + "</label></li>");
	}

	//only one da zone
	$("#listFace").empty();
	for (i=0; i < 1; i++)
	{
		if(eval("FD_CH0_DA" + listFD[i] + "_ENABLE") != "yes")
		{
			$("#eventSrcFace:checkbox").attr("checked", "");
		}

		var name = eval("FD_CH0_DA" + listFD[i] + "_NAME");
		var desc = eval("FD_CH0_DA" + listFD[i] + "_DESCRIPTION");

		name = name.replace(/</g, "&lt;");
		desc = desc.replace(/</g, "&lt;");

		$("#listFace").append("<ul></ul>").find("ul").last()
			.append("<li style='margin: 0px 0px 3px 0px'><input type='checkbox' value='' id='" + "fdEnableZone" + listFD[i] + "'></input></li>")
			.append("<li style='width: 10px; " + checkboxMarginTop + "'>" + 
			"<label for='" + "fdEnableZone" + listFD[i] + "'>" + (i+1) + "." + "</label></li>")
			.append("<li class='ellipsis' style='width: 120px; display: block; overflow: hidden; text-overflow: ellipsis;" + checkboxMarginTop + "'>" + 
			"<label for='" + "fdEnableZone" + listFD[i] + "'>" + name + "</label></li>")
			.append("<li class='ellipsis' style='width: 300px; display: block; overflow: hidden; text-overflow: ellipsis;" + checkboxMarginTop + "'>" + 
			"<label for='" + "fdEnableZone" + listFD[i] + "'>" + desc + "</label></li>");
	}

	// E-Mail List
	$("#reclistEmail").empty();
	if(listEmail != "" && listEmail != null)
	{
		for (i = 0; i < listEmail.length; i++)
		{
			var revEmailName = eval("EVENT_NOTIFY_EMAIL_" + emailPrefix + listEmail[i] + "_NAME");
			revEmailName = revEmailName.replace(/</g, "&lt;");

			$("#reclistEmail").append("<ul></ul>").find("ul").last()
				.append("<li><input type='checkbox' value='" + listEmail[i] + "' id='eventListE" + i + "'></input></li>")
				.append("<li style='" + checkboxMarginTop + "; width: 10px;'>" + (i+1) + "." + "</li>")
				.append("<li style='" + checkboxMarginTop + "; width: 140px; display: block; overflow: hidden; text-overflow: ellipsis;'><a href='#' title='"
							+ eval("EVENT_NOTIFY_EMAIL_"+ emailPrefix + listEmail[i] + "_DESCRIPTION") + "'>"
							+ revEmailName + "</a></li>")
				.append("<li style='" + checkboxMarginTop + "; width: 280px; display: block; overflow: hidden; text-overflow: ellipsis;'>"
							+ eval("EVENT_NOTIFY_EMAIL_" + emailPrefix + listEmail[i] + "_TO") + "</li>");

			// E-Mail 선택시 To 에 표시
			$("#reclistEmail li input[type='checkbox'][value='" + listEmail[i] + "']").unbind().click(function () {
				var result = "";
				for(j=0;j<listEmail.length;j++)
				{
					if($("#reclistEmail li input[type='checkbox'][value='" + listEmail[j] + "']").attr('checked') == true)
					{
						result += $("#reclistEmail li input[type='checkbox'][value='" + listEmail[j] + "']").parent().parent().find("li:eq(2) a").html() + "; ";
					}
				}
				$("input#emailSubTo").val(result);
			});
		}
	}

	// FTP List
	$("#reclistFtp").empty();
	if(listFtp != "" && listFtp != null)
	{
		for(i=0;i<listFtp.length;i++)
		{
			var revFTPName = eval("EVENT_NOTIFY_FTP_" + ftpPrefix + listFtp[i] + "_NAME");
			revFTPName = revFTPName.replace(/</g, "&lt;");

			$("#reclistFtp").append("<ul></ul>").find("ul").last()
				.append("<li><input type='checkbox' value='" + listFtp[i] + "' id='eventListF" + i + "'></input></li>")
				.append("<li style='" + checkboxMarginTop + "; width: 10px;'>" + (i+1) + "." + "</li>")
				.append("<li style='" + checkboxMarginTop + "; width: 140px; display: block; overflow: hidden; text-overflow: ellipsis;'><a href='#' title='"
							+ eval("EVENT_NOTIFY_FTP_" + ftpPrefix + listFtp[i] + "_DESCRIPTION") + "'>"
							+ revFTPName + "</a></li>")
				.append("<li style='" + checkboxMarginTop + "; width: 280px; display: block; overflow: hidden; text-overflow: ellipsis;'>"
							+ eval("EVENT_NOTIFY_FTP_" + ftpPrefix + listFtp[i] + "_ADDRESS") + "</li>");
		}
	}

	// HTTP List
	$("#reclistHttp").empty();
	if(listHttp != "" && listHttp != null)
	{
		for(i=0;i<listHttp.length;i++)
		{
			var revHTTPName = eval("EVENT_NOTIFY_HTTP_" + httpPrefix + listHttp[i] + "_NAME");
			revHTTPName = revHTTPName.replace(/</g, "&lt;");

			$("#reclistHttp").append("<ul></ul>").find("ul").last()
				.append("<li><input type='checkbox' value='" + listHttp[i] + "' id='eventListH" + i + "'></input></li>")
				.append("<li style='" + checkboxMarginTop + "; width: 10px;'>" + (i+1) + "." + "</li>")
				.append("<li style='" + checkboxMarginTop + "; width: 140px; display: block; overflow: hidden; text-overflow: ellipsis;'><a href='#' title='"
							+ eval("EVENT_NOTIFY_HTTP_" + httpPrefix + listHttp[i] + "_DESCRIPTION") + "'>"
							+ revHTTPName + "</a></li>")
				.append("<li style='" + checkboxMarginTop + "; width: 280px; display: block; overflow: hidden; text-overflow: ellipsis;'>"
							+ eval("EVENT_NOTIFY_HTTP_" + httpPrefix + listHttp[i] + "_ADDRESS") + "</li>");
		}
	}

	if(g_ptzFlag == 1)
	{
		$("#ptzlist").empty().append("<option value='none'>none</option>").val("none");

		$.get("/nvc-cgi/ptz/ptz2.fcgi?query=presetlist" + "&_=" + (new Date()).getTime(), function(data) {
			if(data.substring(0,2) != "#4")
			{
				var presetValue = "";
				var presetCount = data.split("\n")[1].split("=")[1];
				var presetList = data.split("\n")[2].split("=")[1];

				if(presetList != "")
					presetValue = presetList.split(",");

				if(presetValue != "")
				{
					$("#ptzlist option[value='none']").remove();

					var presetStr = "";
					for(var i=0; i<presetCount; i++)
					{
						presetStr += "<option value='" + presetValue[i] + "'>" + presetValue[i] + "</option>";
					}

					$("#ptzlist").append(presetStr);
				}
			}
		});
	}

	// schedule list
	var ScheduleList = eval("SCHEDULE_LIST").split(",");
	if(ScheduleList != "")
	{
		$("select#formScheduleList option").remove();
		for(i = 0; i < ScheduleList.length; i++)
		{
			var ScheduleName = eval("SCHEDULE_S" + ScheduleList[i] + "_NAME");
			$("select#formScheduleList").append("<option value=" + ScheduleList[i] + ">" + ScheduleName + "</option>");
		}
	}

	// Active alarm Sub Menu - 체크 상태에 따라 높이 조절
	$("#formEventPFAlarm:checkbox").change(function() {
		var defaultHeight = $("#input_form").height();
		if(defaultHeight != 0)
		{
			if($("#formEventPFAlarm:checkbox").attr("checked") == true)
			{
				$("#formEventPFSubDisDo").css('display', 'block');
				var increaseHeight = $("#input_form").height();

				if(browserCheck() == "msie")
				{
					$(".ui-widget-overlay").height(increaseHeight + 160);
				}
			}
			else
			{
				$("#formEventPFSubDisDo").css('display', 'none');
				ResizePage(defaultHeight + 120);
			}
			if(increaseHeight > defaultHeight == true)
			{
				ResizePage(increaseHeight + 160);
			}
		}
	});
	$("#formEventPFAlarm:checkbox").change();

	for(var i=1; i<parent.g_brand.doCount; i++)
	{
		$("#formEventPFAlarm" + "_ch" + eval(i+1) + ":checkbox").change(function() {
			var ch = $(this).attr("id").split("_")[1].substring(2,3);
			var defaultHeight = $("#input_form").height();

			if(defaultHeight != 0)
			{
				if($("#formEventPFAlarm"+"_ch" + ch + ":checkbox").attr("checked") == true)
				{
					$("#formEventPFSubDisDo"+"_ch" + ch).css('display', 'block');
					var increaseHeight = $("#input_form").height();

					if(browserCheck() == "msie")
					{
						$(".ui-widget-overlay").height(increaseHeight + 160);
					}
				}
				else
				{
					$("#formEventPFSubDisDo"+"_ch" + ch).css('display', 'none');
					ResizePage(defaultHeight + 120);
				}
				if(increaseHeight > defaultHeight == true)
				{
					ResizePage(increaseHeight + 160);
				}
			}
		});
		$("#formEventPFAlarm" + "_ch" + eval(i+1) + ":checkbox").change();
	}

	// FTP recording Sub Menu - 체크 상태에 따라 높이 조절
	$("#formEventPFActiveRec:checkbox").change(function() {
		var defaultHeight = $("#input_form").height();
		if(defaultHeight != 0)
		{
			if($("#formEventPFActiveRec:checkbox").attr("checked") == true)
			{
				$("#formEventPFSubRecording").css('display', 'block');

				var increaseHeight = $("#input_form").height();

				if(browserCheck() == "msie")
				{
					$(".ui-widget-overlay").height(increaseHeight + 160);
				}
			}
			else
			{
				$("#formEventPFSubRecording").css('display', 'none');

				ResizePage(defaultHeight + 120);
			}
			if(increaseHeight > defaultHeight == true)
			{
				ResizePage(increaseHeight + 160);
			}
		}
	});
	$("#formEventPFActiveRec:checkbox").change();

	// E-Mail Recipient Sub Menu - 체크 상태에 따라 높이 조절
	$("#formEventPFEmail:checkbox").change(function() {
		var defaultHeight = $("#input_form").height();
		if(defaultHeight != 0)
		{
			if($("#formEventPFEmail:checkbox").attr("checked") == true)
			{
				$("#formEventPFSubDisEmail").css('display', 'block');
				var increaseHeight = $("#input_form").height();

				if(browserCheck() == "msie")
				{
					$(".ui-widget-overlay").height(increaseHeight + 160);
				}
			}
			else
			{
				var group = "EVENT" + "_NOTIFY";
				addListEmail = eval(group + "_EMAIL_NBROFCOUNT");

				$("#formEventPFSubDisEmail").css('display', 'none');
				ResizePage(defaultHeight + 20 - (addListEmail * 19));
			}
			if(increaseHeight > defaultHeight == true)
			{
				ResizePage(increaseHeight + 160);
			}
		}
	});
	$("#formEventPFEmail:checkbox").change();

	// FTP Notification Sub Menu - 체크 상태에 따라 높이 조절
	$("#formEventPFFtp:checkbox").change(function() {
		var defaultHeight = $("#input_form").height();
		if(defaultHeight != 0)
		{
			if($("#formEventPFFtp:checkbox").attr("checked") == true)
			{
				$("#formEventPFSubDisFtp").css('display', 'block');
				var increaseHeight = $("#input_form").height();

				if(browserCheck() == "msie")
				{
					$(".ui-widget-overlay").height(increaseHeight + 160);
				}
			}
			else
			{
				var group = "EVENT" + "_NOTIFY";
				addListFtp = eval(group + "_FTP_NBROFCOUNT");

				$("#formEventPFSubDisFtp").css('display', 'none');
				ResizePage(defaultHeight+60 - (addListFtp * 19));
			}
			if(increaseHeight > defaultHeight == true)
			{
				ResizePage(increaseHeight + 160);
			}
		}
	});
	$("#formEventPFFtp:checkbox").change();

	// HTTP Notification Sub Menu - 체크 상태에 따라 높이 조절
	$("#formEventPFHttp:checkbox").change(function() {
		var defaultHeight = $("#input_form").height();
		if(defaultHeight != 0)
		{
			if($("#formEventPFHttp:checkbox").attr("checked") == true)
			{
				$("#formEventPFSubDisHttp").css('display', 'block');
				var increaseHeight = $("#input_form").height();

				if(browserCheck() == "msie")
				{
					$(".ui-widget-overlay").height(increaseHeight + 160);
				}
			}
			else
			{
				var group = "EVENT" + "_NOTIFY";
				addListHttp = eval(group + "_HTTP_NBROFCOUNT");

				$("#formEventPFSubDisHttp").css('display', 'none');
				ResizePage(defaultHeight + 110 - (addListHttp * 19));
			}
			if(increaseHeight > defaultHeight == true)
			{
				ResizePage(increaseHeight + 160);
			}
		}
	});
	$("#formEventPFHttp:checkbox").change();

	// Action PTZ Sub Menu - 체크 상태에 따라 높이 조절
	$("#formEventPFPTZ:checkbox").change(function() {
		var defaultHeight = $("#input_form").height();

		if(defaultHeight != 0)
		{
			if($("#formEventPFPTZ:checkbox").attr("checked") == true)
			{
				$("#formEventPFSubPTZ").css('display', 'block');
				var increaseHeight = $("#input_form").height();

				if(browserCheck() == "msie")
				{
					$(".ui-widget-overlay").height(increaseHeight + 160);
				}
			}
			else
			{
				var szPtzPresetList = 1;

				$("#formEventPFSubPTZ").css('display', 'none');
				ResizePage(defaultHeight + 110 - (szPtzPresetList * 19));
			}
			if(increaseHeight > defaultHeight == true)
			{
				ResizePage(increaseHeight + 160);
			}
		}
	});
	$("#formEventPFPTZ:checkbox").change();

	$("input[name='edgeLevelTrigger']").unbind().change(function(){
		var thisVal = $(this).val();
		if(thisVal == "level")
		{
			$(".activeInactiveContents").css("display", "none");
			$(".edgeDurationContents").css("display", "none");
			$(".levelMinHoldOnTimeContents").css("display", "block");
		}
		else
		{
			$(".activeInactiveContents").css("display", "block");
			$(".edgeDurationContents").css("display", "block");
			$(".levelMinHoldOnTimeContents").css("display", "none");
		}
	});

	for(var i=1; i<parent.g_brand.doCount; i++)
	{
		$("input[name='edgeLevelTrigger" + "_ch" + eval(i+1) +"']").unbind().change(function(){
			var ch = $(this).attr("id").split("_")[1].substring(2,3);
			var thisVal = $(this).val();
			if(thisVal == "level")
			{
				$(".activeInactiveContents" + ch).css("display", "none");
				$(".edgeDurationContents" + ch).css("display", "none");
				$(".levelMinHoldOnTimeContents" + ch).css("display", "block");
			}
			else
			{
				$(".activeInactiveContents" + ch).css("display", "block");
				$(".edgeDurationContents" + ch).css("display", "block");
				$(".levelMinHoldOnTimeContents" + ch).css("display", "none");
			}
		});
	}

	$("input[name='httpMethod']").unbind().change(function(){
		var thisVal = $(this).val();
		if(thisVal == "GET")
		{
			$(".postContents").css("display", "none");
		}
		else
		{
			$(".postContents").css("display", "block");
		}
	});

	// List 가 로딩 된 후 체크
	if(selectProfile.toUpperCase() != "")
	{
		var mdEnableList = eval(profile + "_SOURCE_MOTION_ENABLELIST").split(",");
		var fdEnableList = eval(profile + "_SOURCE_FACE_ENABLELIST").split(",");
		var enableListCountEmail = eval(profile + "_NOTIFICATION_EMAIL_ENABLELIST").split(",");
		var enableListCountFtp = eval(profile + "_NOTIFICATION_FTP_ENABLELIST").split(",");
		var enableListCountHttp = eval(profile + "_NOTIFICATION_HTTP_ENABLELIST").split(",");
		var enableListCountTcp = "";
		var enableListCountMulticast = "";
		var toListVal ="";

		// MD Enable checked
		$("#reclistMD li :checkbox").attr("checked", "");
		for(var i=0;i<mdEnableList.length;i++)
		{
			$("#reclistMD li #mdEnableZone" + mdEnableList[i]).attr("checked", "checked");
		}

		$("#listFace li :checkbox").attr("checked", "");
		for(var i=0;i<fdEnableList.length;i++)
		{
			$("#listFace li #fdEnableZone" + fdEnableList[i]).attr("checked", "checked");
		}

		// VCA Enable Checked
		updateVCARuleList();
		updateVCACounterList();

		// Email Enable Checked
		$("#reclistEmail li :checkbox").attr("checked", "");
		if(enableListCountEmail[0] != "")
		{
			for(var i=0;i<enableListCountEmail.length;i++)
			{
				$("#reclistEmail li input[type='checkbox'][value='" + enableListCountEmail[i] + "']").attr("checked", "checked");
				var toList = $("#reclistEmail li input[type='checkbox'][value='" + enableListCountEmail[i] + "']").parent().parent().find("li:eq(2) a").html();
				if(toList != null)
				{
					toListVal += toList + "; ";
				}
			}
			$("input#emailSubTo").val(toListVal);
		}

		// Ftp Enable Checked
		$("#reclistFtp li :checkbox").attr("checked", "");
		for(var i=0;i<enableListCountFtp.length;i++)
		{
			$("#reclistFtp li input[type='checkbox'][value='" + enableListCountFtp[i] + "']").attr("checked", "checked");
		}

		// Http Enable Checked
		$("#reclistHttp li :checkbox").attr("checked", "");
		for(var i=0;i<enableListCountHttp.length;i++)
		{
			$("#reclistHttp li input[type='checkbox'][value='" + enableListCountHttp[i] + "']").attr("checked", "checked");
		}

		// PTZ Enable Checked
		//$("#ptzlist input[name='presetListSelect'][value='" + (enableListCountPTZ+1) + "']:radio").attr("checked", "checked");
	}

	var beforeInputHeight = 0;
	var tabFlag = 0;
	// List 가 로딩 된 후 Event Sources, Event Notification 탭간 높이 조절
	$("#event_tab").tabs({
		select: function(event, ui)
		{
			nSelectedStream = ui.index;
			tabFlag = nSelectedStream;

			switch(nSelectedStream)
			{
				case 0:
					adjustSourcesPageSize();

					if(beforeInputHeight > 0)
						ResizePage(beforeInputHeight);

					beforeInputHeight = $(".ui-dialog").height() + 80;
					break;
				case 1:
					if(eventlistChk != 1)
					{
						return;
					}

					var group = "EVENT" + "_NOTIFY";
					var initHeight = 630;

					addListEmail = eval(group + "_EMAIL_NBROFCOUNT");
					addListFtp = eval(group + "_FTP_NBROFCOUNT");
					addListHttp = eval(group + "_HTTP_NBROFCOUNT");

					if($("#formEventPFAlarm:checkbox").attr("checked") == true)
					{
						$("#formEventPFSubDisDo").css('display', 'block');
						initHeight += 30;
					}
					else if($("#formEventPFAlarm:checkbox").attr("checked") == false)
					{
						$("#formEventPFSubDisDo").css('display', 'none');
					}

					for(var i=1; i<parent.g_brand.doCount; i++)
					{
						if($("#formEventPFAlarm" + "_ch" + eval(i+1) + ":checkbox").attr("checked") == true)
						{
							$("#formEventPFSubDisDo" + "_ch" + eval(i+1)).css('display', 'block');
							initHeight += 100;
						}
						else if($("#formEventPFAlarm" + "_ch" + eval(i+1) + ":checkbox").attr("checked") == false)
						{
							$("#formEventPFSubDisDo" + "_ch" + eval(i+1)).css('display', 'none');
							initHeight += 80;
						}
					}

					if($("#formEventPFActiveRec:checkbox").attr("checked") == true)
					{
						$("#formEventPFSubRecording").css('display', 'block');

						initHeight += 60;
					}
					else if($("#formEventPFActiveRec:checkbox").attr("checked") == false)
					{
						$("#formEventPFSubRecording").css('display', 'none');
					}

					if($("#formEventPFEmail:checkbox").attr("checked") == true)
					{
						$("#formEventPFSubDisEmail").css('display', 'block');
						initHeight += 220 + eval(addListEmail * 19);
					}
					else if($("#formEventPFEmail:checkbox").attr("checked") == false)
					{
						$("#formEventPFSubDisEmail").css('display', 'none');
					}

					if($("#formEventPFFtp:checkbox").attr("checked") == true)
					{
						$("#formEventPFSubDisFtp").css('display', 'block');
						initHeight += 112 + eval(addListFtp * 19);
					}
					else if($("#formEventPFFtp:checkbox").attr("checked") == false)
					{
						$("#formEventPFSubDisFtp").css('display', 'none');
					}

					if($("#formEventPFHttp:checkbox").attr("checked") == true)
					{
						$("#formEventPFSubDisHttp").css('display', 'block');
						initHeight += 60 + eval(addListHttp * 19);
					}
					else if($("#formEventPFHttp:checkbox").attr("checked") == false)
					{
						$("#formEventPFSubDisHttp").css('display', 'none');
					}

					if($("#formEventPFPTZ:checkbox").attr("checked") == true)
					{
						$("#formEventPFSubPTZ").css('display', 'block');
						initHeight += 60 + eval(1 * 19);
					}
					else if($("#formEventPFPTZ:checkbox").attr("checked") == false)
					{
						$("#formEventPFSubPTZ").css('display', 'none');
					}
			

					ResizePage(initHeight);
					if(browserCheck() == "msie")
					{
						$(".ui-widget-overlay").height(initHeight);
					}

					beforeInputHeight = $(".ui-dialog").height() + 80;
					//tabFlag = 1;
					break;
			}
		}
	});
	if($("#input_form").height() != 0)
	{
		if($(this).dialog("option", "mode") == "add")
		{
			ResizePage(580);

		}
		else
		{
			ResizePage($("#input_form").height()+190);
		}
	}
}

function InitForm()
{
	InitPage();

	vcaZonesReceived = 0;
	vcaListReceived = 0;

	Disable($("button"));
	Disable($("select"));

	$("input#emailSubTo").attr("disabled", "disabled");

	$("#sliderEventPFDuration").each(function(index, element) {
		var $obj = $(this).parent().parent().find("input[type='text']");
		$(this).slider({
			range: "min",
			min: 0,
			max: 600,
			slide: function(event, ui) {
				$obj.val(ui.value);
				if($obj.val() == 0)
				{
					$("#formEventPFUnlimited:checkbox").attr("checked", "checked");
				}
				else
				{
					$("#formEventPFUnlimited:checkbox").attr("checked", "");
				}
			}
		})
	});
	for(var i=1; i<parent.g_brand.doCount; i++)
	{
		$("#sliderEventPFDuration" + "_ch" + eval(i+1)).each(function(index, element) {
			var ch = $(this).attr('id').split('_')[1].substring(2,3);
			var $obj = $(this).parent().parent().find("input[type='text']");
			$(this).slider({
				range: "min",
				min: 0,
				max: 600,
				slide: function(event, ui) {
					$obj.val(ui.value);
					if($obj.val() == 0)
					{
						$("#formEventPFUnlimited" + "_ch" + ch + ":checkbox").attr("checked", "checked");
					}
					else
					{
						$("#formEventPFUnlimited" + "_ch" + ch + ":checkbox").attr("checked", "");
					}
				}
			})
		});
	}

	$("#sliderMinHoldOnTime").each(function(index, element) {
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

	for(var i=1; i<parent.g_brand.doCount; i++)
	{
		$("#sliderMinHoldOnTime" + "_ch" + eval(i+1)).each(function(index, element) {
			var ch = $(this).attr('id').split('_')[1].substring(2,3);
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

	$("#sliderEventPFRecPreInterval").each(function(index, element) {
		var $obj = $(this).parent().parent().find("input[type='text']");
		$(this).slider({
			range: "min",
			min: 0,
			max: 5,
			slide: function(event, ui) {
				$obj.val(ui.value);
			}
		})
	});
	$("#sliderEventPFRecPostInterval").each(function(index, element) {
		var $obj = $(this).parent().parent().find("input[type='text']");
		$(this).slider({
			range: "min",
			min: 0,
			max: 60,
			slide: function(event, ui) {
				$obj.val(ui.value);
			}
		})
	});

	$("#sliderEventPFPreImg").each(function(index, element) {
		var $obj = $(this).parent().parent().find("input[type='text']");
		$(this).slider({
			range: "min",
			min: 0,
			max: 8,
			slide: function(event, ui) {
				$obj.val(ui.value);
			}
		})
	});
	$("#sliderEventPFPostImg").each(function(index, element) {
		var $obj = $(this).parent().parent().find("input[type='text']");
		$(this).slider({
			range: "min",
			min: 1,
			max: 8,
			slide: function(event, ui) {
				$obj.val(ui.value);
			}
		})
	});

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

	$("#event_tab").tabs();

	$("#input_form").dialog({
		autoOpen: false,
		width: 640,
		modal: true,
		resizable: false,
		position: [10,10],
		open: function() {
				$("#msg_status").removeClass('ui-state-error, ui-state-highlight').text("");
				$("#formEventPFName:text").removeClass('ui-state-error');

				// 글자수 제한
				$("#formEventPFName:text").keyup(function(){
					LimitCharac("formEventPFName:text", 32);
				});
				$("#formEventPFDesc:text").keyup(function(){
					LimitCharac("formEventPFDesc:text", 100);
				});
				$("#emailSubSubject:text").keyup(function(){
					LimitCharac("emailSubSubject:text", 64);
				});

				Disable($("#btnAdd"));
				Disable($("#btnCopy"));
				Disable($("#btnModify"));
				Disable($("#btnRemove"));
				$( "#effect" ).hide();
				$("#event_tab").tabs("select" , 0);
				ResizePage();
		},
		close: function() {
			Enable($("#btnAdd"));
			Enable($("#btnCopy"));
			Enable($("#btnModify"));
			Enable($("#btnRemove"));
			$( "#effect" ).hide();
			ResizePage();
		}
	});
// Popup Menu 관련 end

	$("#btnDialogOK").click(function() {
		if(isLimitDOLevelTrigger())
		{
			alert(GetMsgLang("0403019957"));
			return false;
		}

		if($("#formEventPFActiveRec:checkbox").attr("checked")
				&& $("#formEventPFRecPreInterval:text").val() == 0
				&& $("#formEventPFRecPostInterval:text").val() == 0)
		{
			alert(GetMsgLang("0403019949"));
			return false;
		}
		
		var bValid = true;

		bValid = bValid && checkLength($("#formEventPFName:text"), GetMsgLang("0403019917"), 1, 32);

		if(bValid == false)
		{
			return false;
		}

		var Req = new CGIRequest();
		var reqString = "";
		var group = DefaultGroup;
		var listMotion = eval("MD_CH0_LIST").split(",");
		var listFace = eval("FD_CH0_LIST").split(",");
		var listEmail = eval("EVENT_NOTIFY_EMAIL_LIST").split(",");
		var listFtp = eval("EVENT_NOTIFY_FTP_LIST").split(",");
		var listHttp = eval("EVENT_NOTIFY_HTTP_LIST").split(",");
		var resultMotion = "";
		var resultFace = "";
		var resultEmail = "";
		var resultFtp = "";
		var resultHttp = "";

		for(var i = 0; i < listMotion.length;i++)
		{
			if($("#reclistMD li #mdEnableZone" + listMotion[i]).attr('checked') == true)
			{
				if(resultMotion == "")
				{
					resultMotion += listMotion[i];
				}
				else if(resultMotion != "")
				{
					resultMotion += "," + listMotion[i];
				}
			}
		}

		for(var i = 0; i < listFace.length;i++)
		{
			if($("#listFace li #fdEnableZone" + listFace[i]).attr('checked') == true)
			{
				if(resultFace == "")
				{
					resultFace += listFace[i];
				}
				else if(resultFace != "")
				{
					resultFace += "," + listFace[i];
				}
			}
		}

		for(var i = 0; i < listEmail.length;i++)
		{
			if($("#reclistEmail li input[type='checkbox'][value='" + listEmail[i] + "']").attr('checked') == true)
			{
				if(resultEmail == "")
				{
					resultEmail += listEmail[i];
				}
				else if(resultEmail != "")
				{
					resultEmail += "," + listEmail[i];
				}
			}
		}
		for(var i = 0; i < listFtp.length;i++)
		{
			if($("#reclistFtp li input[type='checkbox'][value='" + listFtp[i] + "']").attr('checked') == true)
			{
				if(resultFtp == "")
				{
					resultFtp += listFtp[i];
				}
				else if(resultFtp != "")
				{
					resultFtp += "," + listFtp[i];
				}
			}
		}
		for(var i = 0; i < listHttp.length;i++)
		{
			if($("#reclistHttp li input[type='checkbox'][value='" + listHttp[i] + "']").attr('checked') == true)
			{
				if(resultHttp == "")
				{
					resultHttp += listHttp[i];
				}
				else if(resultHttp != "")
				{
					resultHttp += "," + listHttp[i];
				}
			}
		}


		QString = makeQString();

		switch($("#input_form").dialog("option", "mode"))
		{
			case "add":
			case "copy":
				reqQString = "action=add&xmlschema";
				reqQString += "&enable="
				reqQString += ($("#formEventPFEnable:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&name=" + encodeURIComponent($("#formEventPFName:text").val());
				reqQString += "&description=" + encodeURIComponent($("#formEventPFDesc:text").val());
				reqQString += "&Source.Sensor.Ch0.enable=";
				reqQString += ($("#formEventPFSensor:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Source.Sensor.Ch0.trigger=";
				reqQString += ($("input[name='formEventPFSensorTriger']:checked:radio").val());
				reqQString += "&Source.Alarm.Ch0.enable=";
				reqQString += ($("#formEventPFSourceAlarm:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Source.Alarm.Ch0.trigger=";
				reqQString += ($("input[name='formEventPFSourceAlarmTriger']:checked:radio").val());
				reqQString += "&Source.Pir.enable=";
				reqQString += ($("#formERPir:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Source.motion.enable=";
				reqQString += ($("#formEventPFMotion:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Source.Face.enable=";
				reqQString += ($("#eventSrcFace:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Source.VCA.enable=";
				reqQString += ($("#formEventPFVCA:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Source.VCA.allzoneenable=";
				reqQString += ($("#formEventPFAllVCAZone:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Source.VCA.countenable=";
				reqQString += ($("#formEventPFVCACount:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Source.VCA.configenable=";
				reqQString += ($("#formEventPFVCAConfig:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Source.VCA.tamperenable=";
				reqQString += ($("#formEventPFVCATamper:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Source.VCA.translatemd=";
				reqQString += ($("#convertVcaToMD:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Source.VCA.zonetrigger=";
				reqQString += ($("input[name='formEventPFVCATrigger']:checked:radio").val());
				reqQString += "&Source.System.netlossenable=";
				reqQString += ($("#formEventPFNetworkLossDetect:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Source.System.netchgenable=";
				reqQString += ($("#formEventPFIPchange:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Source.System.vsignal=";
				reqQString += ($("#formEventPFVideoStatus:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Source.System.vsignaltrigger=";
				reqQString += ($("input[name='formEventPFVideoTriger']:checked:radio").val());
				reqQString += "&Source.Daynight.enable=";
				reqQString += ($("#formEventPFDayNightTransition:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Source.Daynight.transition=";
				reqQString += ($("input[name='formEventPFFDayNightRadio']:checked:radio").val());
				//reqQString += "&Source.System.tempenable=";
				//reqQString += ($("#formEventPFTemperature:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Source.System.storageenable=";
				reqQString += ($("#storageStatus:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Source.System.apchgenable=";
				reqQString += ($("#apChangedStatus:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Notification.Alarm.Ch0.enable=";
				reqQString += ($("#formEventPFAlarm:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Notification.Alarm.Ch0.trigger=";
				reqQString += ($("input[name='formEventPFActionAlarmTriger']:checked:radio").val());
				reqQString += "&Notification.Alarm.Ch0.mode=";
				reqQString += ($("input[name='edgeLevelTrigger']:checked:radio").val());
				reqQString += "&Notification.Recorder.enable=";
				reqQString += ($("#formEventPFActiveRec:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Notification.email.enable=";
				reqQString += ($("#formEventPFEmail:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Notification.email.snapshot=";
				reqQString += ($("#emailSubSnapshot:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Notification.ftp.enable=";
				reqQString += ($("#formEventPFFtp:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Notification.ftp.snapshot=";
				reqQString += ($("#ftpSubSnapshot:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Notification.ftp.text=";
				reqQString += ($("#ftpSubText:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Notification.http.enable=";
				reqQString += ($("#formEventPFHttp:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Notification.Multicast.enable=";
				reqQString += ($("#formEventPFMulticast:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Notification.Tcp.enable=";
				reqQString += ($("#formEventPFTcp:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Notification.Tcppush.enable=";
				reqQString += ($("#formEventPFTcpPush:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Notification.Ptz.enable=";
				reqQString += ($("#formEventPFPTZ:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Notification.Recorder.thumbnail=";
				reqQString += ($("#recSubThumbnail:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Notification.Email.thumbnail=";
				reqQString += ($("#emailSubThumbnail:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Notification.Ftp.thumbnail=";
				reqQString += ($("#ftpSubThumbnail:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Notification.Ptz.gotopreset=" + $("#ptzlist").val();
				reqQString += "&Notification.Alarm.Ch0.duration=" + $("#formEventPFDuration:text").val();
				reqQString += "&Notification.Alarm.Ch0.minholdontime=" + $("#textMinHoldOnTime:text").val();
				reqQString += "&Notification.Alarm.Ch0.unlimitedoflevel=";
				reqQString += ($("#minHoldOnTimeUnlimited:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Notification.Recorder.preinterval=" + $("#formEventPFRecPreInterval:text").val();
				reqQString += "&Notification.Recorder.postinterval=" + $("#formEventPFRecPostInterval:text").val();
				reqQString += "&Notification.Email.subject=" + encodeURIComponent($("#emailSubSubject:text").val());
				reqQString += "&Notification.Email.nbrofpre=" + $("#formEventPFPreImg:text").val();
				reqQString += "&Notification.Email.nbrofpost=" + $("#formEventPFPostImg:text").val();
				reqQString += "&Source.Motion.enablelist=" + resultMotion;
				reqQString += "&Source.Face.enablelist=" + resultFace;
				reqQString += "&Notification.email.enablelist=" + resultEmail;
				reqQString += "&Notification.ftp.enablelist=" + resultFtp;
				reqQString += "&Notification.http.enablelist=" + resultHttp;
				reqQString += "&Notification.logenable=";
				reqQString += ($("#formEventPFSaveLog:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Notification.Http.method=";
				reqQString += ($("input[name='httpMethod']:checked:radio").val());
				reqQString += "&Notification.Http.Post.snapshot=";
				reqQString += ($("#httpSubSnapshot:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Notification.Http.Post.thumbnail=";
				reqQString += ($("#httpSubThumbnail:checkbox").attr("checked") == true) ? "yes" : "no";
				// VCA Enable List:
				reqQString += "&Source.VCA.enablelist=" + getVCAZoneEnableList();
				reqQString += "&Source.VCA.enablerulelist=" + getVCARuleList();
				//VCA Counter List:
				reqQString += "&Source.VCA.enablecounterlist=" + getVCACounterList();

				// DIDO Channel
				for(var i=1; i<parent.g_brand.diCount; i++)
				{
					reqQString += "&Source.Sensor.Ch" + i + ".enable=";
					reqQString += ($("#formEventPFSensor" + "_ch" + eval(i+1) + ":checkbox").attr("checked") == true) ? "yes" : "no";
					reqQString += "&Source.Sensor.Ch" + i + ".trigger=";
					reqQString += ($("input[name='formEventPFSensorTriger" + "_ch" + eval(i+1) + "']:checked:radio").val());
				}
				for(var i=1; i<parent.g_brand.doCount; i++)
				{
					reqQString += "&Source.Alarm.Ch" + i + ".enable=";
					reqQString += ($("#formEventPFSourceAlarm" + "_ch" + eval(i+1) + ":checkbox").attr("checked") == true) ? "yes" : "no";
					reqQString += "&Source.Alarm.Ch" + i + ".trigger=";
					reqQString += ($("input[name='formEventPFSourceAlarmTriger" + "_ch" + eval(i+1) + "']:checked:radio").val());

					reqQString += "&Notification.Alarm.Ch" + i + ".enable=";
					reqQString += ($("#formEventPFAlarm" + "_ch" + eval(i+1) + ":checkbox").attr("checked") == true) ? "yes" : "no";
					reqQString += "&Notification.Alarm.Ch" + i + ".trigger=";
					reqQString += ($("input[name='formEventPFActionAlarmTriger_ch" + eval(i+1) + "']:checked:radio").val());
					reqQString += "&Notification.Alarm.Ch" + i + ".duration=" + $("#formEventPFDuration" + "_ch" + eval(i+1) + ":text").val();
					reqQString += "&Notification.Alarm.Ch" + i + ".mode=";
					reqQString += ($("input[name='edgeLevelTrigger_ch" + eval(i+1) + "']:checked:radio").val());
					reqQString += "&Notification.Alarm.Ch" + i + ".minholdontime=" + $("#textMinHoldOnTime" + "_ch" + eval(i+1) + ":text").val();
					reqQString += "&Notification.Alarm.Ch" + i + ".unlimitedoflevel=";
					reqQString += ($("#minHoldOnTimeUnlimited" + "_ch" + eval(i+1) + ":checkbox").attr("checked") == true) ? "yes" : "no";
				}
				//time
				reqQString += "&Source.Recurrence.enable=";
				reqQString += ($("#formEventPFSourceRecurrence:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Source.Recurrence.value=";
				reqQString += encodeURIComponent($("#formEventPFRecurrencePeriod:text").val());
				reqQString += "&Source.Recurrence.unit=";
				reqQString += $("#formRecurrenceUnit option:selected").val();
				reqQString += "&Source.Schedule.enable=";
				reqQString += ($("#formEventPFSourceSchedule:checkbox").attr("checked") == true) ? "yes" : "no";
				reqQString += "&Source.Schedule.enablelist=";
				reqQString += $("#formScheduleList option:selected").val();
				break;
			case "modify":
				reqQString = "action=update&xmlschema";
				QString
					.set_action('update')
					.set_schema('xml')
					.add_list("enable", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_ENABLE"), ($("#formEventPFEnable:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("name", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NAME"), encodeURIComponent($("#formEventPFName:text").val()))
					.add_list("description", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_DESCRIPTION"), encodeURIComponent($("#formEventPFDesc:text").val()))			 
					.add_list("Source.Pir.enable", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_PIR_ENABLE"), ($("#formERPir:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("Source.Motion.enable", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_MOTION_ENABLE"), ($("#formEventPFMotion:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("Source.Face.enable", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_FACE_ENABLE"), ($("#eventSrcFace:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("Source.VCA.enable", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_VCA_ENABLE"), ($("#formEventPFVCA:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("Source.VCA.countenable", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_VCA_COUNTENABLE"), ($("#formEventPFVCACount:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("Source.VCA.configenable", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_VCA_CONFIGENABLE"), ($("#formEventPFVCAConfig:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("Source.VCA.tamperenable", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_VCA_TAMPERENABLE"), ($("#formEventPFVCATamper:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("Source.VCA.translatemd", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_VCA_TRANSLATEMD"), ($("#convertVcaToMD:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("Source.VCA.allzoneenable", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_VCA_ALLZONEENABLE"), ($("#formEventPFAllVCAZone:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("Source.VCA.zonetrigger", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_VCA_ZONETRIGGER"), ($("input[name='formEventPFVCATrigger']:checked:radio").val()))
					.add_list("Source.System.netlossenable", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_SYSTEM_NETLOSSENABLE"), ($("#formEventPFNetworkLossDetect:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("Source.System.netchgenable", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_SYSTEM_NETCHGENABLE"), ($("#formEventPFIPchange:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("Source.System.vsignal", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_SYSTEM_VSIGNAL"), ($("#formEventPFVideoStatus:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("Source.System.vsignaltrigger", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_SYSTEM_VSIGNALTRIGGER"), ($("input[name='formEventPFVideoTriger']:checked:radio").val()))
					//.add_list("Source.System.tempenable", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_SYSTEM_TEMPENABLE"), ($("#formEventPFTemperature:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("Source.System.storageenable", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_SYSTEM_STORAGEENABLE"), ($("#storageStatus:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("Source.System.apchgenable", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_SYSTEM_APCHGENABLE"), ($("#apChangedStatus:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("Notification.Recorder.enable", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_RECORDER_ENABLE"), ($("#formEventPFActiveRec:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("Notification.Email.enable", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_EMAIL_ENABLE"), ($("#formEventPFEmail:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("Notification.Email.snapshot", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_EMAIL_SNAPSHOT"), ($("#emailSubSnapshot:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("Notification.ftp.enable", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_FTP_ENABLE"), ($("#formEventPFFtp:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("Notification.ftp.snapshot", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_FTP_SNAPSHOT"), ($("#ftpSubSnapshot:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("Notification.ftp.text", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_FTP_TEXT"), ($("#ftpSubText:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("Notification.http.enable", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_HTTP_ENABLE"), ($("#formEventPFHttp:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("Notification.http.method", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_HTTP_METHOD"), ($("input[name='httpMethod']:checked:radio").val()))
					.add_list("Notification.http.post.snapshot", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_HTTP_POST_SNAPSHOT"), ($("#httpSubSnapshot:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("Notification.Multicast.enable", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_MULTICAST_ENABLE"), ($("#formEventPFMulticast:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("Notification.Tcp.enable", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_TCP_ENABLE"), ($("#formEventPFTcp:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("Notification.Tcppush.enable", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_TCPPUSH_ENABLE"), ($("#formEventPFTcpPush:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("Notification.Email.thumbnail", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_EMAIL_THUMBNAIL"), ($("#emailSubThumbnail:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("Notification.Ftp.thumbnail", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_FTP_THUMBNAIL"), ($("#ftpSubThumbnail:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("Notification.Http.post.thumbnail", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_HTTP_POST_THUMBNAIL"), ($("#httpSubThumbnail:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("Notification.Recorder.thumbnail", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_RECORDER_THUMBNAIL"), ($("#recSubThumbnail:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("Notification.Recorder.preinterval", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_RECORDER_PREINTERVAL"), $("#formEventPFRecPreInterval:text").val())
					.add_list("Notification.Recorder.postinterval", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_RECORDER_POSTINTERVAL"), $("#formEventPFRecPostInterval:text").val())
					.add_list("Notification.Email.subject", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_EMAIL_SUBJECT"), encodeURIComponent($("#emailSubSubject:text").val()))
					.add_list("Notification.Email.nbrofpre", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_EMAIL_NBROFPRE"), $("#formEventPFPreImg:text").val())
					.add_list("Notification.Email.nbrofpost", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_EMAIL_NBROFPOST"), $("#formEventPFPostImg:text").val())
					.add_list("Source.Motion.enablelist", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_MOTION_ENABLELIST"), resultMotion)
					.add_list("Source.Face.enablelist", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_FACE_ENABLELIST"), resultFace)
					.add_list("Source.VCA.enablelist", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_VCA_ENABLELIST"), getVCAZoneEnableList())
					.add_list("Source.VCA.enablerulelist", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_VCA_ENABLERULELIST"), getVCARuleList())
					.add_list("Source.VCA.enablecounterlist", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_VCA_ENABLECOUNTERLIST"), getVCACounterList())
					.add_list("Notification.email.enablelist", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_EMAIL_ENABLELIST"), resultEmail)
					.add_list("Notification.ftp.enablelist", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_FTP_ENABLELIST"), resultFtp)
					.add_list("Notification.http.enablelist", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_HTTP_ENABLELIST"), resultHttp)
					.add_list("Notification.logenable", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_LOGENABLE"), ($("#formEventPFSaveLog:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("Source.Recurrence.enable", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_RECURRENCE_ENABLE"), ($("#formEventPFSourceRecurrence:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("Source.Recurrence.value", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_RECURRENCE_VALUE"), encodeURIComponent($("#formEventPFRecurrencePeriod:text").val()))
					.add_list("Source.Recurrence.unit", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_RECURRENCE_UNIT"), $("#formRecurrenceUnit option:selected").val())
					.add_list("Source.Schedule.enable", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_SCHEDULE_ENABLE"), ($("#formEventPFSourceSchedule:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("Source.Schedule.enablelist", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_SCHEDULE_ENABLELIST"), $("#formScheduleList option:selected").val());
				if(g_ptzFlag == 1)
				{
					var gotoPresetValue = $("#ptzlist").val();
					gotoPresetValue = (gotoPresetValue == "none" ? "1" : gotoPresetValue);
					QString
					.add_list("Notification.Ptz.enable", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_PTZ_ENABLE"), ($("#formEventPFPTZ:checkbox").attr("checked") == true) ? "yes" : "no")
					.add_list("Notification.Ptz.gotopreset", Number(eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_PTZ_GOTOPRESET")), gotoPresetValue);
				}
				if(parent.g_support.dntModel == true)
				{
					QString
						.add_list("Source.Daynight.enable", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_DAYNIGHT_ENABLE"), ($("#formEventPFDayNightTransition:checkbox").attr("checked") == true) ? "yes" : "no")
						.add_list("Source.Daynight.transition", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_DAYNIGHT_TRANSITION"), $("input[name='formEventPFFDayNightRadio']:checked:radio").val());
				}

				// DIDO Channel
				if(parent.g_brand.diCount != 0)
				{
					QString
						.add_list("Source.Sensor.Ch0.enable", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_SENSOR_CH0_ENABLE"), ($("#formEventPFSensor:checkbox").attr("checked") == true) ? "yes" : "no")
						.add_list("Source.Sensor.Ch0.trigger", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_SENSOR_CH0_TRIGGER"), ($("input[name='formEventPFSensorTriger']:checked:radio").val()));   

					for(var i=1; i<parent.g_brand.diCount; i++)
					{
						QString
							.add_list("Source.Sensor.Ch" + i + ".enable", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_SENSOR_CH" + i + "_ENABLE"), ($("#formEventPFSensor" + "_ch" + eval(i+1) + ":checkbox").attr("checked") == true) ? "yes" : "no")
							.add_list("Source.Sensor.Ch" + i + ".trigger", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_SENSOR_CH" + i + "_TRIGGER"), ($("input[name='formEventPFSensorTriger" + "_ch" + eval(i+1) + "']:checked:radio").val()));
					}	
				}

				if(parent.g_brand.doCount != 0)
				{
					QString
						.add_list("Source.Alarm.Ch0.enable", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_ALARM_CH0_ENABLE"), ($("#formEventPFSourceAlarm:checkbox").attr("checked") == true) ? "yes" : "no")
						.add_list("Source.Alarm.Ch0.trigger", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_ALARM_CH0_TRIGGER"), ($("input[name='formEventPFSourceAlarmTriger']:checked:radio").val()))
						.add_list("Notification.Alarm.Ch0.enable", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_ALARM_CH0_ENABLE"), ($("#formEventPFAlarm:checkbox").attr("checked") == true) ? "yes" : "no")
						.add_list("Notification.Alarm.Ch0.trigger", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_ALARM_CH0_TRIGGER"), ($("input[name='formEventPFActionAlarmTriger']:checked:radio").val()))
						.add_list("Notification.Alarm.Ch0.mode", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_ALARM_CH0_MODE"), ($("input[name='edgeLevelTrigger']:checked:radio").val()))
						.add_list("Notification.Alarm.Ch0.duration", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_ALARM_CH0_DURATION"), $("#formEventPFDuration:text").val())
						.add_list("Notification.Alarm.Ch0.minholdontime", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_ALARM_CH0_MINHOLDONTIME"), $("#textMinHoldOnTime:text").val())
						.add_list("Notification.Alarm.Ch0.unlimitedoflevel", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_ALARM_CH0_UNLIMITEDOFLEVEL"), ($("#minHoldOnTimeUnlimited:checkbox").attr("checked") == true) ? "yes" : "no");

					for(var i=1; i<parent.g_brand.doCount; i++)
					{
						QString
							.add_list("Source.Alarm.Ch" + i + ".enable", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_ALARM_CH" + i + "_ENABLE"), ($("#formEventPFSourceAlarm" + "_ch" + eval(i+1) + ":checkbox").attr("checked") == true) ? "yes" : "no")
							.add_list("Source.Alarm.Ch" + i + ".trigger", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_SOURCE_ALARM_CH" + i + "_TRIGGER"), ($("input[name='formEventPFSourceAlarmTriger" + "_ch" + eval(i+1) + "']:checked:radio").val()))
							.add_list("Notification.Alarm.Ch" + i + ".enable", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_ALARM_CH" + i + "_ENABLE"), ($("#formEventPFAlarm" + "_ch" + eval(i+1) + ":checkbox").attr("checked") == true) ? "yes" : "no")
							.add_list("Notification.Alarm.Ch" + i + ".trigger", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_ALARM_CH" + i + "_TRIGGER"), ($("input[name='formEventPFActionAlarmTriger" + "_ch" + eval(i+1) + "']:checked:radio").val()))
							.add_list("Notification.Alarm.Ch" + i + ".mode", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_ALARM_CH" + i + "_MODE"), ($("input[name='edgeLevelTrigger" + "_ch" + eval(i+1) + "']:checked:radio").val()))
							.add_list("Notification.Alarm.Ch" + i + ".duration", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_ALARM_CH" + i + "_DURATION"), $("#formEventPFDuration" + "_ch" + eval(i+1) + ":text").val())
							.add_list("Notification.Alarm.Ch" + i + ".minholdontime", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_ALARM_CH" + i + "_MINHOLDONTIME"), $("#textMinHoldOnTime" + "_ch" + eval(i+1) + ":text").val())
							.add_list("Notification.Alarm.Ch" + i + ".unlimitedoflevel", eval("EVENTPROFILE_P" + selectProfile.toUpperCase() + "_NOTIFICATION_ALARM_CH" + i + "_UNLIMITEDOFLEVEL"), ($("#minHoldOnTimeUnlimited" + "_ch" + eval(i+1) + ":checkbox").attr("checked") == true) ? "yes" : "no");
					}
				}

				reqQString = QString.get_qstring();
				if(!reqQString) {
					return;
				}
				reqQString += "&profile=P" + selectProfile;
				break;
			default:
				alert(GetMsgLang("0403019904"));
				return false;
				break;
		}

		if(isLimitMaxSnapshot())
		{
			$("#event_tab").tabs("select" , 1);
			$("#formEventPFPreImg").focus();
			return;
		}

		Req.SetAddress("/uapi-cgi/evnprofile.cgi");
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
			_debug($("#input_form").dialog("option", "mode") + " - " + reqQString);
			LoadParamJs(DefaultGroup+"&cache", function() {
				$("#input_form").dialog('close');
				InitSetting();
				ViewLoadingSave(false);
				$( "#effect" ).hide();
				PostCustomize();
				ResizePage();
			});
			return;
		});
		_debug("start" + reqQString);
		Req.Request(reqQString);
	});
	$("#btnDialogCancel").click(function() {
		$("#input_form").dialog('close');
	});
	if (parent.g_configData.langPath == "/language/Arabic.xml")
	{
		$(".slider-bar").slider({isRTL: true});
	}
}

function isLimitDOLevelTrigger()
{
	var SourceAllList = g_sourceAllList.concat("formEventPFVCAConfig", "formEventPFVCATamper");
	var limitSourceList = ["formERPir", "formEventPFIPchange", "formEventPFTemperature",
						 "apChangedStatus", "formEventPFSourceRecurrence", "formEventPFDayNightTransition", "formEventPFVCAConfig"];

	var isLimit = false;
	var isLevel = false;
	var doTriggerCount = g_doTriggerList.length;

	var doEnable = $("#formEventPFAlarm:checkbox").attr("checked");
	var doEdgeLevTriVal = $("input[name='edgeLevelTrigger']:checked:radio").val();
	if(doEdgeLevTriVal == "level" && doEnable)
		isLevel = true;

	for(var i=1; i<doTriggerCount; i++) 
	{
		var doEnable = $("#formEventPFAlarm_ch" + eval(i+1)).attr("checked");
		var doChEdgeLevTriVal = $("input[name='edgeLevelTrigger_ch" + eval(i+1) + "']:checked:radio").val();
		if(doChEdgeLevTriVal == "level" && doEnable)
			isLevel = true;
	}

	var AllListCount = SourceAllList.length;
	var limitListCount = limitSourceList.length;
	if(isLevel)
	{
		for(var i=0; i<AllListCount; i++)
		{
			if($("#" + SourceAllList[i]).attr("checked"))
			{

				for(var j=0; j<limitListCount; j++)
				{
					if(SourceAllList[i] == limitSourceList[j])
					{
						isLimit = true;
					}
					else if(SourceAllList[i] == "formEventPFVideoStatus") // Video loss/detect
					{
						if($("input[name='formEventPFVideoTriger']:checked:radio").val() != "all")
							isLimit = true;
					}
					else if($("#" + SourceAllList[i]).attr("class") == "formEventPFSensor") // Sensor(DI*)
					{
						var channel = getChannel(SourceAllList[i])
						var detectType = eval("DIDO_MAP_DI_CH"+channel+"_DETECTIONTYPE");
						if(detectType != "level")
							isLimit = true;
					}
					else if($("#" + SourceAllList[i]).attr("class") == "formEventPFSourceAlarm") // Alarm(DO*)
					{
						var channel = getChannel(SourceAllList[i])
						var detectType = eval("DIDO_MAP_DO_CH"+channel+"_DETECTIONTYPE");
						if(detectType != "level")
							isLimit = true;
					}
					else if(SourceAllList[i] == "formEventPFVCATamper")
					{
						if($("input[name='formEventPFVCATrigger']:checked:radio").val() != "all")
							isLimit = true;
					}
				}
			}
		}
	}

	return isLimit;
}

function getChannel(data)
{
	var checkUnderLine = data.indexOf("_");
	var ch = 0;

	if(checkUnderLine != -1)
		ch = data.split("_")[1].substring(2,3);

	if(ch != 0)
		ch = eval(ch-1);

	return ch;
}

function isLimitMaxSnapshot()
{
	var pre = $("#formEventPFPreImg").val()*1;
	var post = $("#formEventPFPostImg").val()*1;
	var sum = eval(pre+post);

	if(sum > 8)
		return true;

	return false;
}

function InitSetting()
{
	var revEventRules = eval(DefaultGroup + "_ENABLE");

	for(var i=1; i<parent.g_brand.diCount; i++)
	{
		g_eventList.push("formEventPFSensor_ch" + eval(i+1));
		g_sourceAllList.push("formEventPFSensor_ch" + eval(i+1));
	}
	for(var i=1; i<parent.g_brand.doCount; i++)
	{
		g_eventList.push("formEventPFSourceAlarm_ch" + eval(i+1));
		g_sourceAllList.push("formEventPFSourceAlarm_ch" + eval(i+1));
		g_doTriggerList.push("formEventPFSourceAlarm_ch" + eval(i+1));
	}
	
	if(revEventRules == "yes")
	{
		Enable($("#formProfileList"));
		Enable($("#btnAdd"));
		Enable($("#btnCopy"));
		Enable($("#btnModify"));
		Enable($("#btnRemove"));
	}
	else if(revEventRules == "no")
	{
		Disable($("#formProfileList"));
		Disable($("#btnAdd"));
		Disable($("#btnCopy"));
		Disable($("#btnModify"));
		Disable($("#btnRemove"));
	}

	var eventprofileGroup = "EVENTPROFILE";
	var profileList;
	var profile_cnt = eval(eventprofileGroup + "_NBROFCOUNT");

	$("#formEventPFDuration:text").numeric();
	$("#textMinHoldOnTime:text").numeric();
	$("#formEventPFRecPreInterval:text").numeric();
	$("#formEventPFRecPostInterval:text").numeric();
	$("#formEventPFPreImg:text").numeric();
	$("#formEventPFPostImg:text").numeric();
	$("#formEventPFRecurrencePeriod:text").numeric();
	for(var i=1; i<parent.g_brand.doCount; i++)
	{
		$("#formEventPFDuration" + "_ch" + eval(i+1) + ":text").numeric();
		$("#textMinHoldOnTime" + "_ch" + eval(i+1) + ":text").numeric();
	}

	if(eval(eventprofileGroup + "_ENABLE") == "yes")
	{
		$("#formEventRulesEnable:checkbox").attr("checked", "checked");
	}
	else
	{
		$("#formEventRulesEnable:checkbox").attr("checked", "");
	}

	if(profile_cnt > 0)
	{
		profileList = eval(eventprofileGroup + "_LIST").split(",");
	}
	else if(profile_cnt == 0) // profile list 가 0 일때
	{
		// Unlimited 설정
		$("#formEventPFUnlimited:checkbox").unbind().change(function() {
			if($("#formEventPFUnlimited:checkbox").attr("checked") == true)
			{
				$("#formEventPFDuration:text").val('0');
				$("#formEventPFDuration:text").parent().parent().find(".slider-bar").slider("value", '0');
			}
			else
			{
				$("#formEventPFDuration:text").val("1").focus();
				$("div#sliderEventPFDuration").slider("value", "1");
			}
		 });

		for(var i=1; i<parent.g_brand.doCount; i++)
		{
			$("#formEventPFUnlimited" + "_ch" + eval(i+1) + ":checkbox").unbind().change(function() {
				var ch = $(this).attr("id").split("_")[1].substring(2,3);
				if($("#formEventPFUnlimited" + "_ch" + ch + ":checkbox").attr("checked") == true)
				{
					$("#formEventPFDuration" + "_ch" + ch + ":text").val('0');
					$("#formEventPFDuration" + "_ch" + ch + ":text").parent().parent().find(".slider-bar").slider("value", '0');
				}
				else
				{
					$("#formEventPFDuration" + "_ch" + ch + ":text").val("1").focus();
					$("div#sliderEventPFDuration" + "_ch" + ch).slider("value", "1");
				}
			});
		}

		$("#formEventPFDuration:text").blur(function() {
			var inputValTexDuration = $("#formEventPFDuration:text").val()-0;
			$("#formEventPFDuration:text").val(inputValTexDuration);
			if($(this).val() == 0) return;
			if(inputValTexDuration < 0 || inputValTexDuration >600 || inputValTexDuration == "")
			{
				$("#formEventPFDuration:text").val('0').focus();
				$("div#sliderEventPFDuration").slider("value", "0");
				$("#formEventPFUnlimited:checkbox").attr("checked", "checked");
				alert(GetMsgLang("0403019905"));
			}
		});
		$("#textMinHoldOnTime:text").blur(function() {
			var inputVal = $("#textMinHoldOnTime:text").val()-0;
			$("#textMinHoldOnTime:text").val(inputVal);
			if(inputVal < 1 || inputVal > 600 || inputVal == "")
			{
				$("#textMinHoldOnTime:text").val('1').focus();
				$("div#sliderMinHoldOnTime").slider("value", "1");
				alert(GetMsgLang("0403019905"));
			}
		});
		$("#formEventPFRecurrencePeriod:text").blur(function() {
			var inputVal = $("#formEventPFRecurrencePeriod:text").val()-0;
			$("#formEventPFRecurrencePeriod:text").val(inputVal);
			if(inputVal < 1 || inputVal > 1440 || inputVal == "")
			{
				$("#formEventPFRecurrencePeriod:text").val('1').focus();
				alert(GetMsgLang("0403019905"));
			}
		});

		for(var i=1; i<parent.g_brand.doCount; i++)
		{
			$("#formEventPFDuration" + "_ch" + eval(i+1) + ":text").blur(function() {
				var ch = $(this).attr("id").split("_")[1].substring(2,3);
				var inputValTexDuration = $("#formEventPFDuration" + "_ch" + ch + ":text").val()-0;
				$("#formEventPFDuration" + "_ch" + ch + ":text").val(inputValTexDuration);
				if($(this).val() == 0) return;
				if(inputValTexDuration < 0 || inputValTexDuration >600 || inputValTexDuration == "")
				{
					$("#formEventPFDuration" + "_ch" + ch + ":text").val('0').focus();
					$("div#sliderEventPFDuration" + "_ch" + ch ).slider("value", "0");
					$("#formEventPFUnlimited" + "_ch" + ch + ":checkbox").attr("checked", "checked");
					alert(GetMsgLang("0403019905"));
				}
			});
			$("#textMinHoldOnTime" + "_ch" + eval(i+1) + ":text").blur(function() {
				var ch = $(this).attr("id").split("_")[1].substring(2,3);
				var inputVal = $("#textMinHoldOnTime" + "_ch" + ch + ":text").val()-0;
				$("#textMinHoldOnTime" + "_ch" + ch + ":text").val(inputVal);
				if(inputVal < 1 || inputVal > 600 || inputVal == "")
				{
					$("#textMinHoldOnTime" + "_ch" + ch + ":text").val('1').focus();
					$("div#sliderMinHoldOnTime" + "_ch" + ch ).slider("value", "1");
					alert(GetMsgLang("0403019905"));
				}
			});
		}

		$("#formEventPFRecPreInterval:text").blur(function() {
			var inputValTextPreinterval = $("#formEventPFRecPreInterval:text").val()-0;
			$("#formEventPFRecPreInterval:text").val(inputValTextPreinterval);
			if($(this).val() == 0) return;
			if(inputValTextPreinterval < 0 || inputValTextPreinterval > 5 || inputValTextPreinterval == "")
			{
				$("#formEventPFRecPreInterval:text").val('0').focus();
				$("div#sliderEventPFRecPreInterval").slider("value", "0");
				alert(GetMsgLang("0403019905"));
			}
		});
		$("#formEventPFRecPostInterval:text").blur(function() {
			var inputValTextPostInterval = $("#formEventPFRecPostInterval:text").val()-0;
			$("#formEventPFRecPostInterval:text").val(inputValTextPostInterval);
			if($(this).val() == 0) return;
			if(inputValTextPostInterval < 0 || inputValTextPostInterval > 60 || inputValTextPostInterval == "")
			{
				$("#formEventPFRecPostInterval:text").val('0').focus();
				$("div#sliderEventPFRecPostInterval").slider("value", "0");
				alert(GetMsgLang("0403019905"));
			}
		});

		$("#formEventPFPreImg:text").blur(function() {
			var inputValTextPre = $("#formEventPFPreImg:text").val()-0;
			$("#formEventPFPreImg:text").val(inputValTextPre);
			if($(this).val() == 0) return;
			if(inputValTextPre < 0 || inputValTextPre > 8 || inputValTextPre == "")
			{
				$("#formEventPFPreImg:text").val('0').focus();
				$("div#sliderEventPFPreImg").slider("value", "0");
				alert(GetMsgLang("0403019905"));
			}
		});
		$("#formEventPFPostImg:text").blur(function() {
			var inputValTextPost = $("#formEventPFPostImg:text").val()-0;
			$("#formEventPFPostImg:text").val(inputValTextPost);
			if(inputValTextPost < 1 || inputValTextPost > 8 || inputValTextPost == "")
			{
				$("#formEventPFPostImg:text").val('1').focus();
				$("div#sliderEventPFPostImg").slider("value", "1");
				alert(GetMsgLang("0403019905"));
			}
		});


		$("#formEventPFDuration:text").keyup(function() {
			$("div#sliderEventPFDuration").slider("value", $("#formEventPFDuration:text").val());
			if($("#formEventPFDuration:text").val() == '0')
			{
				$("#formEventPFUnlimited:checkbox").attr("checked", "checked");
			}
			else
			{
				$("#formEventPFUnlimited:checkbox").attr("checked", "");
			}
		});

		$("#textMinHoldOnTime:text").keyup(function() {
			$("div#sliderMinHoldOnTime").slider("value", $("#textMinHoldOnTime:text").val());
		});

		for(var i=1; i<parent.g_brand.doCount; i++)
		{
			$("#formEventPFDuration"+"_ch" + eval(i+1) + ":text").keyup(function() {
				var ch = $(this).attr('id').split("_")[1].substring(2,3);

				$("div#sliderEventPFDuration" + "_ch" + ch).slider("value", $("#formEventPFDuration" + "_ch" + ch + ":text").val());
				if($("#formEventPFDuration" + "_ch" + ch + ":text").val() == '0')
				{
					$("#formEventPFUnlimited" + "_ch" + ch + ":checkbox").attr("checked", "checked");
				}
				else
				{
					$("#formEventPFUnlimited" + "_ch" + ch + ":checkbox").attr("checked", "");
				}
			});

			$("#textMinHoldOnTime"+"_ch" + eval(i+1) + ":text").keyup(function() {
				var ch = $(this).attr('id').split("_")[1].substring(2,3);
				$("div#sliderMinHoldOnTime" + "_ch" + ch).slider("value", $("#textMinHoldOnTime" + "_ch" + ch + ":text").val());
			});
		}

		$("#formEventPFRecPreInterval:text").keyup(function() {
			$("div#sliderEventPFRecPreInterval").slider("value", $("#formEventPFRecPreInterval:text").val());
		});
		$("#formEventPFRecPostInterval:text").keyup(function() {
			$("div#sliderEventPFRecPostInterval").slider("value", $("#formEventPFRecPostInterval:text").val());
		});
		$("#formEventPFPreImg:text").keyup(function() {
			$("div#sliderEventPFPreImg").slider("value", $("#formEventPFPreImg:text").val());
		});
		$("#formEventPFPostImg:text").keyup(function() {
			$("div#sliderEventPFPostImg").slider("value", $("#formEventPFPostImg:text").val());
		});
	}

	//Initialise VCA Zone List
	if(!CAP.ajax.serverDataLoaded())
	{
		top.$(window.top).bind('capServerDataLoaded',populateVCARuleList);
	}
	else
	{
		populateVCARuleList();
	}
	
	//Load complex rules setting

	$("select#formProfileList").empty();
	for(var pfnum = 0; pfnum < profile_cnt; pfnum++)
	{
		var group = eventprofileGroup + "_P" + profileList[pfnum].toUpperCase();
		var nameCheck = eval(group+"_NAME");
		var descListCheck = eval(group+"_DESCRIPTION");
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
			descListCheck = eval(group+"_DESCRIPTION");
		}

		nameCheck = nameCheck.replace(/</g, "&lt;");
		descListCheck = descListCheck.replace(/</g, "&lt;");

		if (parent.g_configData.langPath == "/language/Arabic.xml") {
			$("select#formProfileList").append("<option value='" + profileList[pfnum] + "'>&lrm;</option>")
			.find("option:last").append(FillText(descListCheck, descListCheck.length, "right")
				+ FillText(nameCheck, 19, "right")
				+ FillText(eval(group+"_ENABLE"), 6, "right")
			);
		}
		else {
			$("select#formProfileList").append("<option value='" + profileList[pfnum] + "'></option>")
			.find("option:last").append("&nbsp;"
				+ FillText(eval(group+"_ENABLE"), 6, "left")
				+ FillText(nameCheck, 19, "left")
				+ FillText(descListCheck, 64, "left")
			);
		}
		
		if(parent.g_brand.doCount != 0)
		{
			if(eval(group+"_NOTIFICATION_ALARM_CH0_DURATION") == "0")
			{
				$("#formEventPFDuration:text").val('0');
				$("#formEventPFUnlimited:checkbox").attr("checked", "checked");
			}
			else
			{
				$("#formEventPFUnlimited:checkbox").attr("checked", "");
			}

			// Unlimited 설정
			$("#formEventPFUnlimited:checkbox").unbind().change(function() {
				if($("#formEventPFUnlimited:checkbox").attr("checked") == true)
				{
					$("#formEventPFDuration:text").val('0');
					$("#formEventPFDuration:text").parent().parent().find(".slider-bar").slider("value", '0');
				}
				else
				{
					if ($("#input_form").dialog("option", "mode") == "add")
					{
						$("#formEventPFDuration:text").val("1").focus();
						$("div#sliderEventPFDuration").slider("value", "1");
					}
					else
					{
						var durationVal = "";

						if(eval(group + "_NOTIFICATION_ALARM_CH0_DURATION") == 0)
						{
							durationVal = 1;
						}
						else
						{
							durationVal = eval(group + "_NOTIFICATION_ALARM_CH0_DURATION");
						}

						$("#formEventPFDuration:text").val(durationVal).focus();
						$("div#sliderEventPFDuration").slider("value", durationVal);
					}
				}
			});

			$("#formEventPFDuration:text").blur(function() {
				var inputValTexDuration = $("#formEventPFDuration:text").val()-0;
				$("#formEventPFDuration:text").val(inputValTexDuration);
				if($(this).val() == 0) return;
				if(inputValTexDuration < 0 || inputValTexDuration >600 || inputValTexDuration == "")
				{
					if ($("#input_form").dialog("option", "mode") == "add")
					{
						$("#formEventPFDuration:text").val('0').focus();
						$("div#sliderEventPFDuration").slider("value", "0");
						$("#formEventPFUnlimited:checkbox").attr("checked", "checked");
						alert(GetMsgLang("0403019905"));
					}
					else
					{
						$("#formEventPFDuration:text").val(eval(group + "_NOTIFICATION_ALARM_CH0_DURATION")).focus();
						$("div#sliderEventPFDuration").slider("value", eval(group + "_NOTIFICATION_ALARM_CH0_DURATION"));
						if($("#formEventPFDuration:text").val() == 0)
						{
							$("#formEventPFUnlimited:checkbox").attr("checked", "checked");
						}
						else
						{
							$("#formEventPFUnlimited:checkbox").attr("checked", "");
						}
						alert(GetMsgLang("0403019905"));
					}
				}
			});

			$("#textMinHoldOnTime:text").blur(function() {
				var inputVal = $("#textMinHoldOnTime:text").val()-0;
				$("#textMinHoldOnTime:text").val(inputVal);
				if($(this).val() == 0) return;
				if(inputVal < 1 || inputVal > 600 || inputVal == "")
				{
					if ($("#input_form").dialog("option", "mode") == "add")
					{
						$("#textMinHoldOnTime:text").val('1').focus();
						$("div#sliderMinHoldOnTime").slider("value", "1");
						alert(GetMsgLang("0403019905"));
					}
					else
					{
						$("#textMinHoldOnTime:text").val(eval(group + "_NOTIFICATION_ALARM_CH0_MINHOLDONTIME")).focus();
						$("div#sliderMinHoldOnTime").slider("value", eval(group + "_NOTIFICATION_ALARM_CH0_MINHOLDONTIME"));
						alert(GetMsgLang("0403019905"));
					}
				}
			});

			for(var i=1; i<parent.g_brand.doCount; i++)
			{
				if(eval(group+"_NOTIFICATION_ALARM_CH" + i + "_DURATION") == "0")
				{
					$("#formEventPFDuration" + "_ch" + eval(i+1) + ":text").val('0');
					$("#formEventPFUnlimited" + "_ch" + eval(i+1) + ":checkbox").attr("checked", "checked");
				}
				else
				{
					$("#formEventPFUnlimited" + "_ch" + eval(i+1) + ":checkbox").attr("checked", "");
				}

				// Unlimited 설정
				$("#formEventPFUnlimited" + "_ch" + eval(i+1) + ":checkbox").unbind().change(function() {
					var ch = $(this).attr('id').split("_")[1].substring(2,3);
					if($("#formEventPFUnlimited" + "_ch" + ch + ":checkbox").attr("checked") == true)
					{
						$("#formEventPFDuration" + "_ch" + ch + ":text").val('0');
						$("#formEventPFDuration" + "_ch" + ch + ":text").parent().parent().find(".slider-bar").slider("value", '0');
					}
					else
					{
						if ($("#input_form").dialog("option", "mode") == "add")
						{
							$("#formEventPFDuration" + "_ch" + ch + ":text").val("1").focus();
							$("div#sliderEventPFDuration" + "_ch" + ch).slider("value", "1");
						}
						else
						{
							var durationVal = "";
							if(eval(group + "_NOTIFICATION_ALARM_CH" + eval(ch-1) + "_DURATION") == 0)
							{
								durationVal = 1;
							}
							else
							{
								durationVal = eval(group + "_NOTIFICATION_ALARM_CH" + eval(ch-1) + "_DURATION");
							}

							$("#formEventPFDuration" + "_ch" + ch + ":text").val(durationVal).focus();
							$("div#sliderEventPFDuration" + "_ch" + ch).slider("value", durationVal);
						}
					}
				});

				$("#formEventPFDuration" + "_ch" + eval(i+1) + ":text").blur(function() {
					var ch = $(this).attr('id').split("_")[1].substring(2,3);
					var inputValTexDuration = $("#formEventPFDuration" + "_ch" + ch + ":text").val()-0;
					$("#formEventPFDuration" + "_ch" + ch + ":text").val(inputValTexDuration);
					if($(this).val() == 0) return;
					if(inputValTexDuration < 0 || inputValTexDuration > 600 || inputValTexDuration == "")
					{
						if ($("#input_form").dialog("option", "mode") == "add")
						{
							$("#formEventPFDuration" + "_ch" + ch + ":text").val('0').focus();
							$("div#sliderEventPFDuration" + "_ch" + ch).slider("value", "0");
							$("#formEventPFUnlimited" + "_ch" + ch + ":checkbox").attr("checked", "checked");
							alert(GetMsgLang("0403019905"));
						}
						else
						{
							$("#formEventPFDuration" + "_ch" + ch + ":text").val(eval(group + "_NOTIFICATION_ALARM_CH" + eval(ch-1) + "_DURATION")).focus();
							$("div#sliderEventPFDuration" + "_ch" + ch).slider("value", eval(group + "_NOTIFICATION_ALARM_CH" + eval(ch-1) + "_DURATION"));
							if($("#formEventPFDuration" + "_ch" + ch + ":text").val() == 0)
							{
								$("#formEventPFUnlimited" + "_ch" + ch + ":checkbox").attr("checked", "checked");
							}
							else
							{
								$("#formEventPFUnlimited" + "_ch" + ch + ":checkbox").attr("checked", "");
							}
							alert(GetMsgLang("0403019905"));
						}
					}
				});

				$("#textMinHoldOnTime" + "_ch" + eval(i+1) + ":text").blur(function() {
					var ch = $(this).attr('id').split("_")[1].substring(2,3);
					var inputVal = $("#textMinHoldOnTime" + "_ch" + ch + ":text").val()-0;
					$("#textMinHoldOnTime" + "_ch" + ch + ":text").val(inputVal);
					if(inputVal < 1 || inputVal > 600 || inputVal == "")
					{
						if ($("#input_form").dialog("option", "mode") == "add")
						{
							$("#textMinHoldOnTime" + "_ch" + ch + ":text").val('0').focus();
							$("div#sliderMinHoldOnTime" + "_ch" + ch).slider("value", "0");
							alert(GetMsgLang("0403019905"));
						}
						else
						{
							$("#textMinHoldOnTime" + "_ch" + ch + ":text").val(eval(group + "_NOTIFICATION_ALARM_CH" + eval(ch-1) + "_MINHOLDONTIME")).focus();
							$("div#sliderMinHoldOnTime" + "_ch" + ch).slider("value", eval(group + "_NOTIFICATION_ALARM_CH" + eval(ch-1) + "_MINHOLDONTIME"));
							alert(GetMsgLang("0403019905"));
						}
					}
				});
			}
		}

		$("#formEventPFRecurrencePeriod:text").blur(function() {
			var inputVal = $("#formEventPFRecurrencePeriod:text").val()-0;
			$("#formEventPFRecurrencePeriod:text").val(inputVal);
			if(inputVal < 1 || inputVal > 1440 || inputVal == "")
			{
				if ($("#input_form").dialog("option", "mode") == "add")
				{
					$("#formEventPFRecurrencePeriod:text").val('1').focus();
					alert(GetMsgLang("0403019905"));
				}
				else
				{
					$("#formEventPFRecurrencePeriod:text").val(eval(group + "_SOURCE_RECURRENCE_VALUE")).focus();
					alert(GetMsgLang("0403019905"));
				}
			}


		});
		$("#formEventPFRecPreInterval:text").blur(function() {
			var inputValTextPreInterval = $("#formEventPFRecPreInterval:text").val()-0;
			$("#formEventPFRecPreInterval:text").val(inputValTextPreInterval);
			if($(this).val() == 0) return;
			if(inputValTextPreInterval < 0 || inputValTextPreInterval > 5 || inputValTextPreInterval == "")
			{
				if ($("#input_form").dialog("option", "mode") == "add")
				{
					$("#formEventPFRecPreInterval:text").val('0').focus();
					$("div#sliderEventPFRecPreInterval").slider("value", "0");
					alert(GetMsgLang("0403019905"));
				}
				else
				{
					$("#formEventPFRecPreInterval:text").val(eval(group + "_NOTIFICATION_RECORDER_PREINTERVAL")).focus();
					$("div#sliderEventPFRecPreInterval").slider("value", eval(group + "_NOTIFICATION_RECORDER_PREINTERVAL"));
					alert(GetMsgLang("0403019905"));
				}
			}
		});
		$("#formEventPFRecPostInterval:text").blur(function() {
			var inputValTextPostInterval = $("#formEventPFRecPostInterval:text").val()-0;
			$("#formEventPFRecPostInterval:text").val(inputValTextPostInterval);
			if($(this).val() == 0) return;
			if(inputValTextPostInterval < 0 || inputValTextPostInterval > 60 || inputValTextPostInterval == "")
			{
				if ($("#input_form").dialog("option", "mode") == "add")
				{
					$("#formEventPFRecPostInterval:text").val('0').focus();
					$("div#sliderEventPFRecPostInterval").slider("value", "0");
					alert(GetMsgLang("0403019905"));
				}
				else
				{
					$("#formEventPFRecPostInterval:text").val(eval(group + "_NOTIFICATION_RECORDER_POSTINTERVAL")).focus();
					$("div#sliderEventPFRecPostInterval").slider("value", eval(group + "_NOTIFICATION_RECORDER_POSTINTERVAL"));
					alert(GetMsgLang("0403019905"));
				}
			}
		});


		$("#formEventPFDuration:text").keyup(function() {
			$("div#sliderEventPFDuration").slider("value", $("#formEventPFDuration:text").val());
			if($("#formEventPFDuration:text").val() == '0')
			{
				$("#formEventPFUnlimited:checkbox").attr("checked", "checked");
			}
			else
			{
				$("#formEventPFUnlimited:checkbox").attr("checked", "");
			}
		});

		$("#textMinHoldOnTime:text").keyup(function() {
			$("div#sliderMinHoldOnTime").slider("value", $("#textMinHoldOnTime:text").val());
		});

		for(var i=1; i<parent.g_brand.doCount; i++)
		{
			$("#formEventPFDuration"+"_ch" + eval(i+1) + ":text").keyup(function() {
				var ch = $(this).attr('id').split("_")[1].substring(2,3);

				$("div#sliderEventPFDuration" + "_ch" + ch).slider("value", $("#formEventPFDuration" + "_ch" + ch + ":text").val());
				if($("#formEventPFDuration" + "_ch" + ch + ":text").val() == '0')
				{
					$("#formEventPFUnlimited" + "_ch" + ch + ":checkbox").attr("checked", "checked");
				}
				else
				{
					$("#formEventPFUnlimited" + "_ch" + ch + ":checkbox").attr("checked", "");
				}
			});

			$("#textMinHoldOnTime"+"_ch" + eval(i+1) + ":text").keyup(function() {
				var ch = $(this).attr('id').split("_")[1].substring(2,3);
				$("div#sliderMinHoldOnTime" + "_ch" + ch).slider("value", $("#textMinHoldOnTime" + "_ch" + ch + ":text").val());
			});
		}

		$("#formEventPFRecPreInterval:text").keyup(function() {
			$("div#sliderEventPFRecPreInterval").slider("value", $("#formEventPFRecPreInterval:text").val());
		});
		$("#formEventPFRecPostInterval:text").keyup(function() {
			$("div#sliderEventPFRecPostInterval").slider("value", $("#formEventPFRecPostInterval:text").val());
		});

		$("#formEventPFPreImg:text").blur(function() {
			var inputValTextPre = $("#formEventPFPreImg:text").val()-0;
			$("#formEventPFPreImg:text").val(inputValTextPre);
			if($(this).val() == 0) return;
			if(inputValTextPre < 0 || inputValTextPre > 8 || inputValTextPre == "")
			{
				if ($("#input_form").dialog("option", "mode") == "add")
				{
					$("#formEventPFPreImg:text").val('2').focus();
					$("div#sliderEventPFPreImg").slider("value", "2");
					alert(GetMsgLang("0403019905"));
				}
				else
				{
					$("#formEventPFPreImg:text").val(eval(group + "_NOTIFICATION_EMAIL_NBROFPRE")).focus();
					$("div#sliderEventPFPreImg").slider("value", eval(group + "_NOTIFICATION_EMAIL_NBROFPRE"));
					alert(GetMsgLang("0403019905"));
				}
			}
		});

		$("#formEventPFPreImg:text").keyup(function() {
			$("div#sliderEventPFPreImg").slider("value", $("#formEventPFPreImg:text").val());
		});

		$("#formEventPFPostImg:text").blur(function() {
			var inputValTextPost = $("#formEventPFPostImg:text").val()-0;
			$("#formEventPFPostImg:text").val(inputValTextPost);
			if(inputValTextPost < 1 || inputValTextPost > 8 || inputValTextPost == "")
			{
				if ($("#input_form").dialog("option", "mode") == "add")
				{
					$("#formEventPFPostImg:text").val('1').focus();
					$("div#sliderEventPFPostImg").slider("value", "1");
					alert(GetMsgLang("0403019905"));
				}
				else
				{
					$("#formEventPFPostImg:text").val(eval(group + "_NOTIFICATION_EMAIL_NBROFPOST")).focus();
					$("div#sliderEventPFPostImg").slider("value", eval(group + "_NOTIFICATION_EMAIL_NBROFPOST"));
					alert(GetMsgLang("0403019905"));
				}
			}
		});
		$("#formEventPFPostImg:text").keyup(function() {
			$("div#sliderEventPFPostImg").slider("value", $("#formEventPFPostImg:text").val());
		});
	}
}

function SetRelation()
{
	// VCA Sub Menu
	$("#formEventPFVCA:checkbox").change(function() {
		if($("#formEventPFVCA:checkbox").attr("checked") == true)
		{
			//Show the sub menu
			$("#formEventPFSubVCA").css('display', 'block');
		}
		else
		{
			//Hide the sub menu
			$("#formEventPFSubVCA").css('display', 'none');
		}
		adjustSourcesPageSize();
	});
	
	//All Zones
	$("#formEventPFAllVCAZone").change(function(){
		if($("#formEventPFAllVCAZone:checkbox").attr("checked") == true)
		{
			$("#reclistVCAZone li :checkbox").attr("checked", "checked");
		}
		else
		{
			$("#reclistVCAZone li :checkbox").attr("checked", "");
		}
	});

	//If all Zones are checked, but someting is unchecked then unchecked all zones
	$("#reclistVCAZone").change(function(){
		var nextEntry = $("#reclistVCAZone")[0].firstChild;
		var ruleCount = 0;
		var ruleCheckedCount = 0;
		while(nextEntry != null && nextEntry.firstChild.firstChild != null)
		{	
			if(nextEntry.nodeName=="DIV")
			{	
				if(nextEntry.firstChild.firstChild.checked != true)
				{
					$("#formEventPFAllVCAZone:checkbox").attr("checked", "");
				}

				var nextRuleEntry = nextEntry.firstChild.firstChild.firstChild;
				while(nextRuleEntry != null)
				{
					ruleCount++;
					if(nextRuleEntry.firstChild.firstChild.checked == true)
					{	
						ruleCheckedCount++;
					}
					nextRuleEntry = nextRuleEntry.nextElementSibling;
				}
			}
			nextEntry = nextEntry.nextElementSibling;
		}
		if(ruleCount == ruleCheckedCount)
		{
			$("#formEventPFAllVCAZone:checkbox").attr("checked", "checked");
		}		
	});

	//Counter sub menu
	$("#formEventPFVCACount").change(function() {
		var nextEntry = $("#reclistVCACounter")[0].firstChild;
		if($("#formEventPFVCACount:checkbox").attr("checked") == true)
		{
			
			while(nextEntry != null)
			{
				nextEntry.firstChild.firstChild.checked = true;
				nextEntry = nextEntry.nextSibling;
			}
		}
		else
		{
			
			while(nextEntry != null)
			{
				nextEntry.firstChild.firstChild.checked = false;
				nextEntry = nextEntry.nextSibling;
			}
		}
	});

	//if all counters are checked, then check all counters checkbox.
	$("#reclistVCACounter").change(function() {
		var vcaCounterChecked = 0;
		var entryCounter = 0;
		var nextEntry = $("#reclistVCACounter")[0].firstChild;
		while(nextEntry != null)
		{	entryCounter++;
			if(nextEntry.firstChild.firstChild.checked != true)
			{
				$("#formEventPFVCACount:checkbox").attr("checked", "");
			}
			else
				vcaCounterChecked++;
			nextEntry = nextEntry.nextSibling;
		}
		if(vcaCounterChecked == entryCounter)
		{
			$("#formEventPFVCACount:checkbox").attr("checked", "checked");
		}
	});

	$("#httpActions:checkbox").change(function() {
		if($("#httpActions:checkbox").attr("checked") == true)
		{
			//Show the sub menu
			$("#subActions").css('display', 'block');
		}
		else
		{
			//Hide the sub menu
			$("#subActions").css('display', 'none');
		}
		$("#vcaEnableAction2:checkbox").change();
		adjustSourcesPageSize();
	});


	// 링크이동시 왼쪽 메뉴 이동
	$("#linkDi, .linkDi").click(function(){
		parent.$("#leftmenu .peripheral_Contents + div a[href='dido.html']").click();
		parent.$("#leftmenu .peripheral_Contents").click();
	});
	$("#linkDo, .linkDo").click(function(){
		parent.$("#leftmenu .peripheral_Contents + div a[href='dido.html']").click();
		parent.$("#leftmenu .peripheral_Contents").click();
	});
	$("#linkPir").click(function(){
		parent.$("#leftmenu .peripheral_Contents + div a[href='pir.html']").click();
		parent.$("#leftmenu .peripheral_Contents").click();
	});
	$("#linkMD").click(function(){
		parent.$("#leftmenu .eventConfContents + div a[href='motiondetection.html']").click();
	});
	$("#linkFaceDetection").click(function(){
		parent.$("#leftmenu .eventConfContents + div a[href='facedetection.html']").click();
	});
	$("#linkVCA").click(function(){
		parent.$("#leftmenu .vcaContents + div a[href='vcaenabledisable.html']").click();
		parent.$("#vcaMenuHeader").click();
	});
	$("#linkNetloss").click(function(){
		parent.$("#leftmenu .eventConfContents + div a[href='networkloss.html']").click();
	});
	$("#linkCamera").click(function(){
		parent.$("#leftmenu .videoaudioContents + div a[href='camera.html']").click();
	});
	$("#linkEmailRecipient").click(function(){
		parent.$("#leftmenu .eventConfContents + div a[href='emailrecipient.html']").click();
	});
	$("#linkFtpNotification").click(function(){
		parent.$("#leftmenu .eventConfContents + div a[href='ftpnotification.html']").click();
	});
	$("#linkHttpNotification").click(function(){

		parent.$("#leftmenu .eventConfContents + div a[href='httpnotification.html']").click();
	});
	$("#linkTcpNotification").click(function(){
		parent.$("#leftmenu .eventConfContents + div a[href='tcpnotification.html']").click();
	});
	$("#linkTcpServer").click(function(){
		parent.$("#leftmenu .eventConfContents + div a[href='tcpserver.html']").click();
	});
	$("#linkMulticastNotification").click(function(){
		parent.$("#leftmenu .eventConfContents + div a[href='multicastnotification.html']").click();
	});

	$("#linkRec").click(function(){
		parent.$("#leftmenu .storageContents + div a[href='configuration.html']").click();
		parent.$("#storageMenuHeader").click();
	});

	$("#linkComplexRl").click(function(){
		parent.$("#leftmenu .eventConfContents + div a[href='advancedrules.html']").click();
	});
	$(".linkStreamSnap").click(function(){
		parent.$("#leftmenu .videoaudioContents + div a[href='stream.html']").parent().addClass("ui-state-hover");
		parent.$("#leftmenu .eventConfContents + div a[href='eventrules.html']").parent().removeClass("ui-state-hover");
		parent.$("#leftmenu .videoaudioContents").click();
		location.href = "stream.html";
	});
	$("#linkSchedule").click(function(){
		parent.$("#leftmenu .eventConfContents + div a[href='eventschedule.html']").click();
	});
	$("#linkRecording").click(function(){
		parent.$("#leftmenu .storageContents + div a[href='configuration.html']").click();
		parent.$("#storageMenuHeader").click();
	});


	//callback function to bring a hidden box back
	function callback() {
		setTimeout(function() {
			$( "#effect:visible" ).removeAttr( "style" ).fadeOut();
			ResizePage(310);
		}, 10 );
	};

	// List Description tooltip
	$('a').tooltip();
}

function checkEnableDiDoTrigger()
{
	var tagName = "";

	for(var i=0; i<parent.g_brand.diCount; i++)
	{
		if(eval("DIDO_MAP_DI_CH"+i+"_DETECTIONTYPE") == "level")
		{
			tagName = "formEventPFSensorTriger";
			if(i != 0)
			{
				tagName += "_ch"+(i+1);
			}

			$("input[name='" + tagName + "']").parent().parent().remove();
		}
	}

	for(var i=0; i<parent.g_brand.doCount; i++)
	{
		if(eval("DIDO_MAP_DO_CH"+i+"_DETECTIONTYPE") == "level")
		{
			tagName = "formEventPFSourceAlarmTriger";
			if(i != 0)
			{
				tagName += "_ch"+(i+1);
			}

			$("input[name='" + tagName + "']").parent().parent().remove();
		}
	}
}

function setCheckboxState(checkbox, variable)
{
	if(eval(variable) == "yes")
	{
		checkbox.attr("checked","checked");
	}
	else
	{
		checkbox.attr("checked","");
	}
}

function SetInputForm(group)
{
	if(group == null)
	{
		alert(GetMsgLang("0403019906"));
		return;
	}

	var profile = "EVENTPROFILE" + "_P" + group;
	var enableListCountEmail = eval(profile + "_NOTIFICATION_EMAIL_ENABLELIST").split(",");
	var enableListCountFtp = eval(profile + "_NOTIFICATION_FTP_ENABLELIST").split(",");
	var enableListCountHttp = eval(profile + "_NOTIFICATION_HTTP_ENABLELIST").split(",");
	var enableListCountPTZ = "";

	if(g_ptzFlag == 1)
	{
		enableListCountPTZ = eval(profile + "_NOTIFICATION_PTZ_GOTOPRESET");
	}

	//var enableListCountHttp = 0;
	var toListVal ="";

	var eventName = eval(profile + "_NAME");		
	if($("#input_form").dialog("option", "mode") == "copy")
	{
		eventName += "_COPY";
	}
	$("#formEventPFName:text").val(eventName);

	setCheckboxState($("#formEventPFEnable:checkbox"),profile + "_ENABLE"); 
	setCheckboxState($("#formERPir:checkbox"),profile + "_SOURCE_PIR_ENABLE");
	setCheckboxState($("#formEventPFMotion:checkbox"),profile + "_SOURCE_MOTION_ENABLE");
	setCheckboxState($("#eventSrcFace:checkbox"),profile + "_SOURCE_FACE_ENABLE");
	setCheckboxState($("#formEventPFIPchange:checkbox"),profile + "_SOURCE_SYSTEM_NETCHGENABLE");
	setCheckboxState($("#formEventPFVideoStatus:checkbox"),profile + "_SOURCE_SYSTEM_VSIGNAL");
	$("input[name='formEventPFVideoTriger'][value='" + eval(profile + "_SOURCE_SYSTEM_VSIGNALTRIGGER") + "']:radio").attr("checked", "checked");
	//setCheckboxState($("#formEventPFTemperature:checkbox"),profile + "_SOURCE_SYSTEM_TEMPENABLE");
	setCheckboxState($("#storageStatus:checkbox"),profile + "_SOURCE_SYSTEM_STORAGEENABLE");
	setCheckboxState($("#apChangedStatus:checkbox"),profile + "_SOURCE_SYSTEM_APCHGENABLE");
	setCheckboxState($("#formEventPFVCA:checkbox"),profile + "_SOURCE_VCA_ENABLE");
	setCheckboxState($("#formEventPFAllVCAZone:checkbox"),profile + "_SOURCE_VCA_ALLZONEENABLE");
	setCheckboxState($("#formEventPFVCACount:checkbox"),profile + "_SOURCE_VCA_COUNTENABLE");
	setCheckboxState($("#formEventPFVCAConfig:checkbox"),profile + "_SOURCE_VCA_CONFIGENABLE");
	setCheckboxState($("#formEventPFVCATamper:checkbox"),profile + "_SOURCE_VCA_TAMPERENABLE");
	setCheckboxState($("#convertVcaToMD:checkbox"),profile + "_SOURCE_VCA_TRANSLATEMD");
	$("input[name='formEventPFVCATrigger'][value='" + eval(profile + "_SOURCE_VCA_ZONETRIGGER") + "']:radio").attr("checked", "checked");	
	setCheckboxState($("#formEventPFNetworkLossDetect:checkbox"),profile + "_SOURCE_SYSTEM_NETLOSSENABLE");
	setCheckboxState($("#formEventPFActiveRec:checkbox"),profile + "_NOTIFICATION_RECORDER_ENABLE");
	setCheckboxState($("#formEventPFEmail:checkbox"),profile + "_NOTIFICATION_EMAIL_ENABLE");
	setCheckboxState($("#emailSubSnapshot:checkbox"),profile + "_NOTIFICATION_EMAIL_SNAPSHOT");
	setCheckboxState($("#formEventPFFtp:checkbox"),profile + "_NOTIFICATION_FTP_ENABLE");
	setCheckboxState($("#ftpSubSnapshot:checkbox"),profile + "_NOTIFICATION_FTP_SNAPSHOT");
	setCheckboxState($("#ftpSubText:checkbox"),profile + "_NOTIFICATION_FTP_TEXT");
	setCheckboxState($("#formEventPFHttp:checkbox"),profile + "_NOTIFICATION_HTTP_ENABLE");
	setCheckboxState($("#formEventPFMulticast:checkbox"),profile + "_NOTIFICATION_MULTICAST_ENABLE");
	setCheckboxState($("#formEventPFTcp:checkbox"),profile + "_NOTIFICATION_TCP_ENABLE");
	setCheckboxState($("#formEventPFTcpPush:checkbox"),profile + "_NOTIFICATION_TCPPUSH_ENABLE");
	setCheckboxState($("#formEventPFSaveLog:checkbox"),profile + "_NOTIFICATION_LOGENABLE");
	setCheckboxState($("#emailSubThumbnail:checkbox"),profile + "_NOTIFICATION_EMAIL_THUMBNAIL");
	setCheckboxState($("#ftpSubThumbnail:checkbox"),profile + "_NOTIFICATION_FTP_THUMBNAIL");
	setCheckboxState($("#recSubThumbnail:checkbox"),profile + "_NOTIFICATION_RECORDER_THUMBNAIL");
	setCheckboxState($("#httpSubThumbnail:checkbox"),profile + "_NOTIFICATION_HTTP_POST_THUMBNAIL");
	setCheckboxState($("#httpSubSnapshot:checkbox"),profile + "_NOTIFICATION_HTTP_POST_SNAPSHOT");
	$("input[name='httpMethod'][value='" + eval(profile + "_NOTIFICATION_HTTP_METHOD") + "']:radio").attr("checked", "checked");
	$("input[name='httpMethod'][value='" + eval(profile + "_NOTIFICATION_HTTP_METHOD") + "']:radio").change();

	//DIDO Channel
	if(parent.g_brand.diCount != 0)
	{
		setCheckboxState($("#formEventPFSensor:checkbox"),profile + "_SOURCE_SENSOR_CH0_ENABLE");
		$("input[name='formEventPFSensorTriger'][value='" + eval(profile + "_SOURCE_SENSOR_CH0_TRIGGER") + "']:radio").attr("checked", "checked");

		for(var i=1; i<parent.g_brand.diCount; i++)
		{
			if(eval("DIDO_DI_CH" + i + "_ENABLE") == "yes")
			{
				Enable($("#formEventPFSensor" + "_ch" + eval(i+1)));
			}
			else
			{
				Disable($("#formEventPFSensor" + "_ch" + eval(i+1)));
			}

			setCheckboxState($("#formEventPFSensor" + "_ch" + eval(i+1) + ":checkbox"),profile + "_SOURCE_SENSOR_CH" + i + "_ENABLE");
			$("input[name='formEventPFSensorTriger" + "_ch" + eval(i+1) + "'][value='" + eval(profile + "_SOURCE_SENSOR_CH" + i + "_TRIGGER") + "']:radio").attr("checked", "checked");
		} 
	}

	if(parent.g_brand.doCount != 0) 
	{
		if(eval(profile + "_NOTIFICATION_ALARM_CH0_DURATION") == 0)
		{
			$("#formEventPFUnlimited:checkbox").attr("checked", "checked");
		}
		else
		{
			$("#formEventPFUnlimited:checkbox").attr("checked", "");
		}

		if(eval(profile + "_NOTIFICATION_ALARM_CH0_UNLIMITEDOFLEVEL") == "yes")
		{
			$("#minHoldOnTimeUnlimited:checkbox").attr("checked", "checked");
		}
		else
		{
			$("#minHoldOnTimeUnlimited:checkbox").attr("checked", "");
		}

		setCheckboxState($("#formEventPFSourceAlarm:checkbox"),profile + "_SOURCE_ALARM_CH0_ENABLE");
		$("input[name='formEventPFSourceAlarmTriger'][value='" + eval(profile + "_SOURCE_ALARM_CH0_TRIGGER") + "']:radio").attr("checked", "checked");
		setCheckboxState($("#formEventPFAlarm:checkbox"),profile + "_NOTIFICATION_ALARM_CH0_ENABLE");
		$("input[name='formEventPFActionAlarmTriger'][value='" + eval(profile + "_NOTIFICATION_ALARM_CH0_TRIGGER") + "']:radio").attr("checked", "checked");
		

		var objEdgeLevel = $("input[name='edgeLevelTrigger'][value='" + eval(profile + "_NOTIFICATION_ALARM_CH0_MODE") + "']:radio");
		objEdgeLevel.attr("checked", "checked");
		objEdgeLevel.change();

		$("#formEventPFDuration:text").val(eval(profile + "_NOTIFICATION_ALARM_CH0_DURATION"));
		$("#formEventPFDuration:text").parent().parent().find(".slider-bar").slider("value", eval(profile + "_NOTIFICATION_ALARM_CH0_DURATION"));
		$("#textMinHoldOnTime:text").val(eval(profile + "_NOTIFICATION_ALARM_CH0_MINHOLDONTIME"));
		$("#textMinHoldOnTime:text").parent().parent().find(".slider-bar").slider("value", eval(profile + "_NOTIFICATION_ALARM_CH0_MINHOLDONTIME"));

		for(var i=1; i<parent.g_brand.doCount; i++)
		{
			if(eval(profile + "_NOTIFICATION_ALARM_CH" + i + "_DURATION") == 0)
			{
				$("#formEventPFUnlimited" + "_ch" + eval(i+1) + ":checkbox").attr("checked", "checked");
			}
			else
			{
				$("#formEventPFUnlimited" + "_ch" + eval(i+1) + ":checkbox").attr("checked", "");
			}

			if(eval(profile + "_NOTIFICATION_ALARM_CH" + i + "_UNLIMITEDOFLEVEL") == "yes")
			{
				$("#minHoldOnTimeUnlimited" + "_ch" + eval(i+1) + ":checkbox").attr("checked", "checked");
			}
			else
			{
				$("#minHoldOnTimeUnlimited" + "_ch" + eval(i+1) + ":checkbox").attr("checked", "");
			}

			setCheckboxState($("#formEventPFSourceAlarm" + "_ch" + eval(i+1) + ":checkbox"),profile + "_SOURCE_ALARM_CH" + i + "_ENABLE");
			$("input[name='formEventPFSourceAlarmTriger" + "_ch" + eval(i+1) + "'][value='" + eval(profile + "_SOURCE_ALARM_CH" + i + "_TRIGGER") + "']:radio").attr("checked", "checked");

			setCheckboxState($("#formEventPFAlarm" + "_ch" + eval(i+1) + ":checkbox"),profile + "_NOTIFICATION_ALARM_CH" + i + "_ENABLE");
			$("input[name='formEventPFActionAlarmTriger" + "_ch" + eval(i+1) + "'][value='" + eval(profile + "_NOTIFICATION_ALARM_CH" + i + "_TRIGGER") + "']:radio").attr("checked", "checked");

			var objEdgeLevel_ch = $("input[name='edgeLevelTrigger" + "_ch" + eval(i+1) + "'][value='" + eval(profile + "_NOTIFICATION_ALARM_CH" + i + "_MODE") + "']:radio");
			objEdgeLevel_ch.attr("checked", "checked");
			objEdgeLevel_ch.change();
			$("#formEventPFDuration" + "_ch" + eval(i+1) + ":text").val(eval(profile + "_NOTIFICATION_ALARM_CH" + i + "_DURATION"));
			$("#formEventPFDuration" + "_ch" + eval(i+1) + ":text").parent().parent().find(".slider-bar").slider("value", eval(profile + "_NOTIFICATION_ALARM_CH" + i + "_DURATION"));
			$("#textMinHoldOnTime" + "_ch" + eval(i+1) + ":text").val(eval(profile + "_NOTIFICATION_ALARM_CH" + i + "_MINHOLDONTIME"));
			$("#textMinHoldOnTime" + "_ch" + eval(i+1) + ":text").parent().parent().find(".slider-bar").slider("value", eval(profile + "_NOTIFICATION_ALARM_CH" + i + "_MINHOLDONTIME"));
		}
	}

	if(g_ptzFlag == 1)
	{
		setCheckboxState($("#formEventPFPTZ:checkbox"),profile + "_NOTIFICATION_PTZ_ENABLE");
	}

	if(parent.g_support.dntModel == true)
	{
		setCheckboxState($("#formEventPFDayNightTransition:checkbox"),profile + "_SOURCE_DAYNIGHT_ENABLE");
		$("input[name='formEventPFFDayNightRadio'][value='" + eval(profile + "_SOURCE_DAYNIGHT_TRANSITION") + "']:radio").attr("checked", "checked");
	}
	
	setCheckboxState($("#httpActions:checkbox"), profile + "_ACTION_ENABLE");
	$("#formEventPFDesc:text").val(eval(profile + "_DESCRIPTION"));
	$("#emailSubSubject:text").val(eval(profile + "_NOTIFICATION_EMAIL_SUBJECT"));
	$("#formEventPFRecPreInterval:text").val(eval(profile + "_NOTIFICATION_RECORDER_PREINTERVAL"));
	$("#formEventPFRecPreInterval:text").parent().parent().find(".slider-bar").slider("value", eval(profile + "_NOTIFICATION_RECORDER_PREINTERVAL"));
	$("#formEventPFRecPostInterval:text").val(eval(profile + "_NOTIFICATION_RECORDER_POSTINTERVAL"));
	$("#formEventPFRecPostInterval:text").parent().parent().find(".slider-bar").slider("value", eval(profile + "_NOTIFICATION_RECORDER_POSTINTERVAL"));

	$("#formEventPFPreImg:text").val(eval(profile + "_NOTIFICATION_EMAIL_NBROFPRE"));
	$("#formEventPFPreImg:text").parent().parent().find(".slider-bar").slider("value", eval(profile + "_NOTIFICATION_EMAIL_NBROFPRE"));
	$("#formEventPFPostImg:text").val(eval(profile + "_NOTIFICATION_EMAIL_NBROFPOST"));
	$("div#sliderEventPFPostImg").slider("value", eval(profile + "_NOTIFICATION_EMAIL_NBROFPOST"));

	if(group != "")
	{
		// Email Enable Checked
		$("#reclistEmail li :checkbox").attr("checked", "");
		if(enableListCountEmail[0] != "")
		{
			for(var i=0;i<enableListCountEmail.length;i++)
			{
				$("#reclistEmail li input[type='checkbox'][value='" + enableListCountEmail[i] + "']").attr("checked", "checked");
				var toList = $("#reclistEmail li input[type='checkbox'][value='" + enableListCountEmail[i] + "']").parent().parent().find("li:eq(2) a").html();
				if(toList != null)
				{
					toListVal += toList + "; ";
				}
			}
			$("input#emailSubTo").val(toListVal);
		}

		// Ftp Enable Checked
		$("#reclistFtp li :checkbox").attr("checked", "");
		for(var i=0;i<enableListCountFtp.length;i++)
		{
			$("#reclistFtp li input[type='checkbox'][value='" + enableListCountFtp[i] + "']").attr("checked", "checked");
		}

		// Http Enable Checked
		$("#reclistHttp li :checkbox").attr("checked", "");
		for(var i=0;i<enableListCountHttp.length;i++)
		{
			$("#reclistHttp li input[type='checkbox'][value='" + enableListCountHttp[i] + "']").attr("checked", "checked");
		}

		// MD Enable checked
		var mdEnableList = eval(profile + "_SOURCE_MOTION_ENABLELIST").split(",");
		$("#reclistMD li :checkbox").attr("checked", "");
		for(var i=0;i<mdEnableList.length;i++)
		{
			$("#reclistMD li #mdEnableZone" + mdEnableList[i]).attr("checked", "checked");
		}

		var fdEnableList = eval(profile + "_SOURCE_FACE_ENABLELIST").split(",");
		$("#listFace li :checkbox").attr("checked", "");
		for(var i=0;i<fdEnableList.length;i++)
		{
			$("#listFace li #fdEnableZone" + fdEnableList[i]).attr("checked", "checked");
		}
		
		
		//$("#formEventPFVCACount").change();
		//$("#formEventPFAllVCAZone").change();
		//VCA Enable checked
		updateVCARuleList();
		updateVCACounterList();

		if($("#ptzlist").text() == "none" || $("#ptzlist").text() == undefined)
			enableListCountPTZ = "none";

		$("#ptzlist").val(enableListCountPTZ);
	}

	$("#formEventPFMotion:checkbox").change();
	$("#eventSrcFace:checkbox").change();
	$("#formEventPFVCA:checkbox").change();

	setCheckboxState($("#formEventPFSourceRecurrence:checkbox"),profile + "_SOURCE_RECURRENCE_ENABLE");
	$("#formEventPFRecurrencePeriod:text").val(eval(profile + "_SOURCE_RECURRENCE_VALUE"));
	$("#formRecurrenceUnit").val(eval(profile + "_SOURCE_RECURRENCE_UNIT"));
	var Ret = IsValidScheduleID(eval(profile + "_SOURCE_SCHEDULE_ENABLELIST"));
	if(Ret == true) 
	{
		setCheckboxState($("#formEventPFSourceSchedule:checkbox"),profile + "_SOURCE_SCHEDULE_ENABLE");
		$("select#formScheduleList").val(eval(profile + "_SOURCE_SCHEDULE_ENABLELIST"));
	}
	else
	{
		$("#formEventPFSourceSchedule:checkbox").attr("checked","");
	}
}

function IsValidScheduleID(id)
{
	var Result = false;

	$("select#formScheduleList option").each(function(){
		if($(this).val() == id)
		{
			Result = true;
		}
	});

	return Result;
}


function EventBind()
{
	var Req = new CGIRequest();
	var profile = "EVENTPROFILE";
	var resultSize = "";

	$("#btnApply").click(function() {
		var reqQString = "action=update&xmlschema";
		
		QString = makeQString();
		QString
			.set_action('update')
			.set_schema('xml')
			.add_list("EVENTPROFILE.enable", EVENTPROFILE_ENABLE, ($("#formEventRulesEnable:checkbox").attr("checked") == true) ? "yes":"no");
		reqQString = QString.get_qstring();
		if(!reqQString) {
			return ;
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
			_debug("update - " + reqQString);
			LoadParamJs(DefaultGroup, function() {
				ViewLoadingSave(false);
				InitSetting();
				$( "#effect" ).hide();
			});
			return;
		});
		Req.SetErrorFunc(function(){
			LoadParamJs(DefaultGroup, function() {
				alert(GetMsgLang("0501"));
				ViewLoadingSave(false);
				InitSetting();
				$( "#effect" ).hide();
			});
			return;
		});
		Req.Request(reqQString);
		_debug("start" + reqQString);
	});

	$("#btnAdd").click(function() {
		if(isCheckMaxList() == false)
		{
			alert(GetMsgLang("0403019942"));
			return;
		}
		$( "#effect" ).hide();
		var group = profile + "_P" + selectProfile.toUpperCase();
		if(selectProfile.toUpperCase() == "")
		{
			var motionEnableChk = "no";
		}

		else
		{
			var motionEnableChk = eval(group + "_SOURCE_MOTION_ENABLE");
		}

		$("#input_form").dialog("option", "title", GetMsgLang("0403019912"));
		$("#input_form").dialog("option", "mode", "add");
		$("#input_form").dialog('open');
		
		$("#formEventPFEnable:checkbox").attr("checked", "");
		$("#formEventPFName:text").val("");
		$("#formEventPFName:text").focus();
		$("#formEventPFDesc:text").val("");
		$("#formEventPFDuration:text").val(0);
		$("div#sliderEventPFDuration").slider("value", "0");
		$("#textMinHoldOnTime:text").val(1);
		$("div#sliderMinHoldOnTime").slider("value", "1");
		$("#formEventPFRecPreInterval:text").val(3);
		$("div#sliderEventPFRecPreInterval").slider("value", "3");
		$("#formEventPFRecPostInterval:text").val(10);
		$("div#sliderEventPFRecPostInterval").slider("value", "10");
		$("#formEventPFPreImg:text").val(2);
		$("div#sliderEventPFPreImg").slider("value", "2");
		$("div#sliderEventPFPostImg").slider("value", "1");
		$("#formEventPFPostImg:text").val(1);
		$("#emailSubTo:text").val("");
		$("#emailSubSubject:text").val("");
		$("#event_tab input[type='checkbox']").attr("checked", "");
		$("#formEventPFUnlimited").attr("checked", "checked");
		$("#minHoldOnTimeUnlimited").attr("checked", "");
		$("#formEventPFMotion:checkbox").change();
		$("#eventSrcFace:checkbox").change();
		$("#formEventPFVCA:checkbox").change();
		$("#formEventPFVCACount:checkbox").change();
		//$("#formEventPFDayNightTransition:checkbox").change();
		$("#formEventPFAlarm:checkbox").change();
		$("#formEventPFHttp:checkbox").change();
		$("#formEventPFPTZ:checkbox").change();
		$("#formEventPFFtp:checkbox").change();
		$("#formEventPFEmail:checkbox").change();
		$("#formEventPFActiveRec:checkbox").change();
		$("#formEventPFSubDisDo").css("display", "none");
		$("#formEventPFSubRecording").css("display", "none");
		$("#formEventPFSubDisEmail").css("display", "none");
		$("#formEventPFSubDisFtp").css("display", "none");
		$("#formEventPFSubDisHttp").css("display", "none");
		$("#formEventPFSubPTZ").css("display", "none");

		$("input[name='formEventPFSensorTriger'][value='active']:radio").attr("checked", "checked");
		$("#formEventPFSensor:checkbox").change();
		$("input[name='formEventPFSourceAlarmTriger'][value='active']:radio").attr("checked", "checked");
		$("#formEventPFSourceAlarm:checkbox").change();
		$("input[name='formEventPFActionAlarmTriger'][value='active']:radio").attr("checked", "checked");

		$("input[name='edgeLevelTrigger'][value='edge']:radio").attr("checked", "checked");
		$("input[name='edgeLevelTrigger'][value='edge']:radio").change();

		$("input[name='httpMethod'][value='GET']:radio").attr("checked", "checked");
		$("input[name='httpMethod'][value='GET']:radio").change();

		$("input[name='formEventPFFDayNightRadio'][value='both']:radio").attr("checked", "checked");
		$("#formEventPFDayNightTransition:checkbox").change();

		for(var i = 1; i<parent.g_brand.diCount; i++)
		{
			$("input[name='formEventPFSensorTriger" + "_ch" + eval(i+1) + "'][value='active']:radio").attr("checked", "checked");
			$("#formEventPFSensor" + "_ch" + eval(i+1) + ":checkbox").change();
		}

		for(var i=1; i<parent.g_brand.doCount; i++)
		{
			//source
			$("input[name='formEventPFSourceAlarmTriger" + "_ch" + eval(i+1) + "'][value='active']:radio").attr("checked", "checked");
			$("#formEventPFSourceAlarm" + "_ch" + eval(i+1) + ":checkbox").change();

			//action
			$("input[name='formEventPFActionAlarmTriger_ch" + eval(i+1) + "'][value='active']:radio").attr("checked", "checked");
			$("#formEventPFDuration" + "_ch" + eval(i+1) + ":text").val(0);
			$("div#sliderEventPFDuration" + "_ch" + eval(i+1)).slider("value", "0");
			$("#textMinHoldOnTime" + "_ch" + eval(i+1) + ":text").val(1);
			$("div#sliderMinHoldOnTime" + "_ch" + eval(i+1)).slider("value", "1");
			$("#formEventPFUnlimited" + "_ch" + eval(i+1)).attr("checked", "checked");
			$("#minHoldOnTimeUnlimited" + "_ch" + eval(i+1)).attr("checked", "");
			$("input[name='edgeLevelTrigger_ch" + eval(i+1) + "'][value='edge']:radio").attr("checked", "checked");
			$("input[name='edgeLevelTrigger_ch" + eval(i+1) + "'][value='edge']:radio").change();
		}

		$("input[name='formEventPFVCATrigger'][value='all']:radio").attr("checked", "checked");

		$("input[name='formEventPFVideoTriger'][value='all']:radio").attr("checked", "checked");

		$("#formEventPFRecurrencePeriod:text").val(1);
		$("#formRecurrenceUnit").val("day");
		$("#recSubThumbnail:checkbox").attr("checked", "checked");
		$("#emailSubThumbnail:checkbox").attr("checked", "checked");

		$(".ui-widget-overlay").height(resultSize);
		SetEventCheckRelation();
		InitEventCheckRelation();
		checkEnableDiDoTrigger();
	});
	$("#btnCopy").click(function(){
		if(isCheckMaxList() == false)
		{
			alert(GetMsgLang("0403019942"));
			return;
		}
		
		$( "#effect" ).hide();
		if($("#formProfileList").val() == null)
		{
			alert(GetMsgLang("0403019907"));
			return false;
		}
		var group = profile + "_P" + selectProfile.toUpperCase();
		if(selectProfile.toUpperCase() == "")
		{
			var motionEnableChk = "no";
		}
		else
		{
			var motionEnableChk = eval(group + "_SOURCE_MOTION_ENABLE");
		}
		$("#input_form").dialog("option", "title", GetMsgLang("0403019913"));
		$("#input_form").dialog("option", "mode", "copy");
		$("#input_form").dialog('open');
		$("#formEventPFName:text").focus();
		SetInputForm(selectProfile.toUpperCase());
		$("#formEventPFMotion:checkbox").change();
		$("#eventSrcFace:checkbox").change();
		$("#formEventPFVCA:checkbox").change();
		//$("#formEventPFVCACount:checkbox").change();
		//$("#formCompexRules").change();
		$("#formEventPFDayNightTransition:checkbox").change();
		$("#formEventPFAlarm:checkbox").change();
		$("#formEventPFHttp:checkbox").change();
		$("#formEventPFPTZ:checkbox").change();
		$("#formEventPFFtp:checkbox").change();
		$("#formEventPFEmail:checkbox").change();
		$("#formEventPFActiveRec:checkbox").change();
		$("#formEventPFSourceRecurrence:checkbox").change();
		$("#formEventPFSourceSchedule:checkbox").change();

		adjustSourcesPageSize();
		SetEventCheckRelation();
		InitEventCheckRelation();
		checkEnableDiDoTrigger();
	});
	$("#btnModify").click(function() {
		$( "#effect" ).hide();
		if($("#formProfileList").val() == null)
		{
			alert(GetMsgLang("0403019908"));
			return false;
		}
		var group = profile + "_P" + selectProfile.toUpperCase();
		if(selectProfile.toUpperCase() == "")
		{
			var motionEnableChk = "no";
		}
		else
		{
			var motionEnableChk = eval(group + "_SOURCE_MOTION_ENABLE");
		}
		$("#input_form").dialog("option", "title", GetMsgLang("0403019914"));
		$("#input_form").dialog("option", "mode", "modify");
		$("#input_form").dialog('open');
		$("#formEventPFName:text").focus();
		SetInputForm(selectProfile.toUpperCase());
		$("#formEventPFMotion:checkbox").change();
		$("#eventSrcFace:checkbox").change();
		$("#formEventPFVCA:checkbox").change();
		//$("#formEventPFVCACount:checkbox").change();
		//$("#formCompexRules").change();
		$("#formEventPFDayNightTransition:checkbox").change();
		$("#formEventPFAlarm:checkbox").change();
		$("#formEventPFHttp:checkbox").change();
		$("#formEventPFPTZ:checkbox").change();
		$("#formEventPFFtp:checkbox").change();
		$("#formEventPFEmail:checkbox").change();
		$("#formEventPFActiveRec:checkbox").change();
		$("#formEventPFSourceRecurrence:checkbox").change();
		$("#formEventPFSourceSchedule:checkbox").change();

		adjustSourcesPageSize();
		SetEventCheckRelation();
		InitEventCheckRelation();
		checkEnableDiDoTrigger();
	});
	$("select#formProfileList").change(function() {
		if($(this).val() == null) return;
		selectProfile = $(this).val();
	});
	$("select#formProfileList").dblclick(function() {
		if($(this).val() == null) return;
		$("#btnModify").click();
		$( "#effect" ).hide();
	});
	$("#btnRemove").click(function() {
		if($("#formProfileList").val() == null)
		{
			alert(GetMsgLang("0403019909"));
			return false;
		}

		var group = "EVENTPROFILE";
		var profileName = "";

		profileName = eval(group + "_P" + selectProfile + "_NAME");

		if (!confirm(GetMsgLang("0403019918")))
		{
			return false;
		}

		var Req = new CGIRequest();
		var reqQString = "action=remove&xmlschema&profile=P" + selectProfile;

		Req.SetStartFunc(ViewLoadingSave);
		Req.SetAddress("/uapi-cgi/evnprofile.cgi");

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

			_debug("remove - " + reqQString);
			LoadParamJs(DefaultGroup+"&cache", function() {
				InitSetting();

				ViewLoadingSave(false);
				$( "#effect" ).hide();

				_debug("reload");
				_debug("stop");
			});

			return;
		});

		_debug("start");
		Req.Request(reqQString);
	});

	$("select#formProfileList").click(function() {
		if($(this).val() == null) return;
		selectIdx = $(this).val();
		var ProfileGroup = "EVENTPROFILE" + "_P" + selectIdx.toUpperCase();
		var activePTZInfo = "";
		var informationDI = "";
		var informationDO = "";
		var informationRecording = "";
		var informationSaveEventLog = "";
		var informationSourceDO = "";
		var informationPIR = "";
		var informationFD = "";
		var informationStorageError = "";

		$("div#effect ul.box li.item li#infoEventPFEnable").html(eval(ProfileGroup + "_ENABLE"));
		$("div#effect ul.box li.item li#infoEventPFName").html(eval(ProfileGroup + "_NAME"));
		$("div#effect ul.box li.item li#infoEventPFDescription").html(FillText(eval(ProfileGroup+"_DESCRIPTION"), 64, "left"));

		// Sources
		if(parent.g_brand.diCount != 0)
		{
			informationDI = GetMsgLang("0403019964") + eval(ProfileGroup + "_SOURCE_SENSOR_CH0_ENABLE") + ", ";

			for(var i=1; i<parent.g_brand.diCount; i++)
			{
				informationDI += GetMsgLang("0403019965") + eval(i+1) + ")-" + eval(ProfileGroup + "_SOURCE_SENSOR_CH" + i + "_ENABLE") + ", ";
			}
		}
		if(parent.g_brand.doCount != 0)
		{
			informationDO = GetMsgLang("0403019966") + eval(ProfileGroup + "_NOTIFICATION_ALARM_CH0_ENABLE") + ", ";
			informationSourceDO = GetMsgLang("0403019967") + eval(ProfileGroup + "_SOURCE_ALARM_CH0_ENABLE") + ", ";
   
			for(var i=1; i<parent.g_brand.doCount; i++)
			{
				informationDO += GetMsgLang("0403019968") + eval(i+1) + ")-" + eval(ProfileGroup + "_NOTIFICATION_ALARM_CH" + i + "_ENABLE") + ", ";
				informationSourceDO += GetMsgLang("0403019969") + eval(i+1) + ")-" + eval(ProfileGroup + "_SOURCE_ALARM_CH" + i + "_ENABLE") + ", ";
			}
		}
		if(parent.g_brand.pir == 1)
		{
			informationPIR = GetMsgLang("0403019970") + eval(ProfileGroup + "_SOURCE_PIR_ENABLE") + ", ";
		}

		if(parent.g_brand.lensType != "fisheye" && parent.g_brand.imgDevice != "seek-thermal" && parent.g_support.tamarisk == false && parent.g_brand.soctype != "dm368" && parent.g_support.peopleTracker != true)
			informationFD = GetMsgLang("0403019971") + eval(ProfileGroup + "_SOURCE_FACE_ENABLE") + ", ";

		var videoLossDetectResult = "";
		if(parent.g_brand.cameraClass == "encoder")
		{
			videoLossDetectResult = GetMsgLang("0403019972") + eval(ProfileGroup + "_SOURCE_SYSTEM_VSIGNAL") + ", ";
		}

		if(parent.g_brand.sd != "0")
			informationStorageError = GetMsgLang("0403019973") + eval(ProfileGroup + "_SOURCE_SYSTEM_STORAGEENABLE") + ", ";

		var informationMD = GetMsgLang("0403019974") + eval(ProfileGroup + "_SOURCE_MOTION_ENABLE") + ", ";
		if("rs51c0b" == parent.g_brand.imgDevice ||
		"mdc200s" == parent.g_brand.imgDevice ||
		"mdc600s" == parent.g_brand.imgDevice)
			informationMD = "";

		var informationDayNightTransition = "";
		if(parent.g_support.dntModel == true)
			informationDayNightTransition = GetMsgLang("0403019975") + eval(ProfileGroup + "_SOURCE_DAYNIGHT_ENABLE") + ", ";

		$("div#effect ul.box li.item li#infoEventPFSources").html(
			informationDI +
			informationSourceDO +
			informationPIR +
			informationMD +
			GetMsgLang("0403019976") + eval(ProfileGroup + "_SOURCE_VCA_ENABLE") + ", " +
			informationFD + 
			GetMsgLang("0403019977") + eval(ProfileGroup + "_SOURCE_SYSTEM_NETLOSSENABLE") + ", " +
			videoLossDetectResult +
			informationDayNightTransition +
			GetMsgLang("0403019978") + eval(ProfileGroup + "_SOURCE_SYSTEM_NETCHGENABLE") + ", " +
			informationStorageError +
			GetMsgLang("0403019979") + eval(ProfileGroup + "_SOURCE_RECURRENCE_ENABLE") + ", " +
			GetMsgLang("0403019980") + eval(ProfileGroup + "_SOURCE_SCHEDULE_ENABLE")
		);

		if(g_ptzFlag == 1)
		{
			 activePTZInfo = ", " + GetMsgLang("0403019989") + eval(ProfileGroup + "_NOTIFICATION_PTZ_ENABLE")
		}

		if (parent.g_brand.sd != 0)
	{
	  informationRecording = GetMsgLang("0403019981") + eval(ProfileGroup + "_NOTIFICATION_RECORDER_ENABLE") + ", ";
	  informationSaveEventLog = GetMsgLang("0403019982") + eval(ProfileGroup + "_NOTIFICATION_LOGENABLE") + ", ";
	}

		// Notification
		$("div#effect ul.box li.item li#infoEventPFNotification").html(
			informationDO +
			informationRecording +
	  informationSaveEventLog +
			GetMsgLang("0403019983") + eval(ProfileGroup + "_NOTIFICATION_EMAIL_ENABLE") + ", " +
			GetMsgLang("0403019984") + eval(ProfileGroup + "_NOTIFICATION_FTP_ENABLE") + ", " +
			GetMsgLang("0403019985") + eval(ProfileGroup + "_NOTIFICATION_HTTP_ENABLE") + ", " +
			GetMsgLang("0403019986") + eval(ProfileGroup + "_NOTIFICATION_TCPPUSH_ENABLE") + ", " +
			GetMsgLang("0403019987") + eval(ProfileGroup + "_NOTIFICATION_TCP_ENABLE") + ", " +
			GetMsgLang("0403019988") + eval(ProfileGroup + "_NOTIFICATION_MULTICAST_ENABLE") + activePTZInfo
		);

		$( "#effect" ).show();
		ResizePage(600);
	}).keyup(function(){
		$(this).click();
	});
}

function snapshotDisable(isDis)
{
	if(isDis)
	{
		$("#emailSubSnapshot, #ftpSubSnapshot, #httpSubSnapshot").attr({"checked":"", "disabled": true});
		$("#emailSubThumbnail, #ftpSubThumbnail, #httpSubThumbnail").attr({"checked":"", "disabled": true});
	}
	else
	{
		$("#emailSubSnapshot, #ftpSubSnapshot, #httpSubSnapshot").attr("disabled", false);
		$("#emailSubThumbnail, #ftpSubThumbnail, #httpSubThumbnail").attr("disabled", false);
	}
}

////////////////////////////////////////////////////////////////////////////////
// Function Name: SetEventCheckRelation()
// Description	: Network setting changed, Fan/Heater operation changed, Video loss/detect 항목과
//								될때에 DI, MD, VDA, PIR, Recording 항목이 서로 같이 설정되지 
//								못하도록 적용한다.
//								Complex rules는 Event source의 다른 항목들과 같이 설정되지 
//								못하도록 적용한다.
////////////////////////////////////////////////////////////////////////////////
function SetEventCheckRelation()
{
	var EventList = g_eventList;
	var EventState = 0;
	var HealthState = 0;
	var RecurrenceState = 0;
	var ScheduleState = 0;
	var ActionState = 0;

	// Schedule
	$("#formEventPFSourceSchedule:checkbox").unbind().change(function() {
		ScheduleState = 0;
		if($("#formEventPFSourceSchedule:checkbox").attr("checked"))
		{
			ScheduleState = 1;
			
		}
		if(ScheduleState == 1)
		{
			var ActionFtpState = 0;
			Disable($("#formEventPFDayNightTransition"));
			var SourceList = EventList.concat(g_healthList, "formEventPFSourceRecurrence");
			for(var j=0; j<SourceList.length; j++)
			{
				if($("#" + SourceList[j]).attr("checked"))
					
					ActionFtpState = 1;
			}

			if(ActionFtpState == 1){
				$("#formEventPFFtp").attr({"disabled": false});
			}
			else{
				$("#formEventPFFtp").attr({"checked":"", "disabled": true});
			}
		}
		else
		{
	var EventState = 0;
			var SourceList = EventList.concat(g_healthList, "formEventPFSourceRecurrence");
			for(var j=0; j<SourceList.length; j++)
			{
				if(SourceList[j] == "formEventPFDayNightTransition")
					continue;
				if($("#" + SourceList[j]).attr("checked"))
					
					EventState = 1;
			}
			if(EventState == 0)
				Enable($("#formEventPFDayNightTransition"));
			else
				Disable($("#formEventPFDayNightTransition"));

			if($("#formEventPFDayNightTransition:checkbox").attr("checked"))
			{
				
				Disable($("#formEventPFSourceSchedule"));
				Disable($("#formEventPFFtp"));
			}
			else
			{

				var ScheduleList = eval("SCHEDULE_LIST").split(",");
				if(ScheduleList != "")
					Enable($("#formEventPFSourceSchedule"));
				Enable($("#formEventPFFtp"));
			}
			
		}

		if(IsContinuousRecording())
		{
			Disable($("#sliderEventPFRecPostInterval"));
			Disable($("#formEventPFRecPostInterval"));
		}
		else
		{
			Enable($("#sliderEventPFRecPostInterval"));
			Enable($("#formEventPFRecPostInterval"));
		}

		DisplaySubMenu($(this).attr('id'));
	});

	// Event List 체크
	var eventListCount = EventList.length;
	var EventID = "";
	for(var i=0; i<eventListCount; i++)
	{
		$("#" + EventList[i] + ":checkbox").unbind().change(function() {
			EventState = 0;
			for(var j=0; j<eventListCount; j++)
			{
				if($("#" + EventList[j]).attr("checked"))
				{
					EventState = 1;
					EventID = EventList[j];
					break;
				}
			}

			var curSelectorID = $(this).attr("id");
			if(EventState == 1)
			{
				for(var j=0; j<g_healthList.length; j++)
				{
					Disable($("#" + g_healthList[j]));
				}
				Disable($("#formEventPFSourceRecurrence"));
				if(EventID == "formEventPFDayNightTransition")
				{
					for(var j=0;j<g_eventList.length; j++)
					{
						if(g_eventList[j] != "formEventPFDayNightTransition")
						{
							$("#"+g_eventList[j]).attr({"checked":"", "disabled": true});
						}
					}
					for(var j=0;j<g_actionAllList.length;j++)
					{
						if(g_actionAllList[j] != "formEventPFAlarm" && g_actionAllList[j] != "formEventPFSaveLog" && g_actionAllList[j] != "formEventPFHttp")
							$("#"+g_actionAllList[j]).attr({"checked":"", "disabled": true});
					}
				}
				else
				{
					Disable($("#formEventPFDayNightTransition"));
					
				}
			}
			else
			{
				var HState = 0;
				var HealthID = "";
				for(var j=0; j<g_healthList.length; j++)
				{
					if($("#" + g_healthList[j] + ":checkbox").attr("checked") == true)
					{
						HState = 1;
						HealthID = g_healthList[j];
						break;
					}
				}
				if(HState == 0)
				{
					Enable($("#formEventPFSourceRecurrence"));
				}
				var EventID = "";
				for(var j=0;j<g_eventList.length; j++)
				{
					Enable($("#"+g_eventList[j]));
					if($("#" + g_eventList[j] + ":checkbox").attr("checked") == true)
					{
						EventID = g_eventList[j];
						break;
					}
				}
				if(curSelectorID == "formEventPFDayNightTransition")
				{
					for(var j=0;j<g_actionAllList.length;j++)
					{
						Enable($("#"+g_actionAllList[j]));
					}
				}

				ActionState = 0
				for(var j=0; j<g_actionList.length; j++)
				{
					if($("#" + g_actionList[j] + ":checkbox").attr("checked") == true)
					{
						ActionState = 1;
						break;
					}
				}
				if(ActionState != 1)
				{
					ListDisable(HealthID, g_healthList, HState);
				}
			}

			DisplaySubMenu($(this).attr('id'));
			$("#formEventPFSourceSchedule:checkbox").change();
			var curSelectorID = $(this).attr("id");
			if(curSelectorID == "formEventPFVCA")
			{
				$("#formEventPFVCAConfig:checkbox").change();
				$("#formEventPFActiveRec:checkbox").change();
			}
		});
	}

	// Health List 체크
	for(var i=0; i<g_healthList.length; i++)
	{
		$("#" + g_healthList[i] + ":checkbox").unbind().change(function() {
			HealthState = 0;
			var HealthID = 0;

			for(var j=0; j<g_healthList.length; j++)
			{
				if($("#" + g_healthList[j] + ":checkbox").attr("checked") == true)
				{
					HealthState = 1;
					HealthID = g_healthList[j];
					break;
				}
			}

			var curSelectorID = $(this).attr("id");
			var List = EventList.concat(g_actionList, "formEventPFSourceRecurrence");
			if(HealthState == 1)
			{
				for(var j=0; j<List.length; j++)
				{
					Disable($("#" + List[j]));
				}
				ListDisable(HealthID, g_healthList, HealthState);

				if(curSelectorID == "formEventPFTemperature")
					$("#formEventPFSaveLog").attr({"checked":"", "disabled": true});
				else
					$("#formEventPFSaveLog").attr({"checked":"checked", "disabled": true});

				var curChecked = $("#"+curSelectorID).attr("checked");
				if(curChecked)
				{
					if(curSelectorID == "formEventPFVideoStatus")
						snapshotDisable(false);
					else
						snapshotDisable(true);
				}
			}
			else
			{
				var RState = 0;
				if($("#formEventPFSourceRecurrence:checkbox").attr("checked") == true)
				{
					RState = 1;
				}
				if(RState == 0)
				{
					for(var j=0; j<eventListCount; j++)
					{
						if($("#formEventPFDayNightTransition:checkbox").attr("checked") == true)
						{
							if(EventList[j] != "formEventPFDayNightTransition")
							{
								Disable($("#" + EventList[j]));
							}
						}
						else
						{
							Enable($("#" + EventList[j]));
						}
					}
				}
				for(var j=0; j<g_actionList.length; j++)
				{
					if($("#formEventPFDayNightTransition:checkbox").attr("checked") == true)
						Disable($("#" + g_actionList[j]));
					else
						Enable($("#" + g_actionList[j]));
				}
				var EState = 0;
				for(var j=0; j<eventListCount; j++)
				{
					if($("#" + EventList[j] + ":checkbox").attr("checked") == true)
					{
						EState = 1;
						break;
					}
				}
				if(EState == 0)
				{
					Enable($("#formEventPFSourceRecurrence"));
				}

				if((RState == 0) && (EState == 0))
				{
					ListDisable($(this).attr('id'), g_healthList, HealthState);
				}

				snapshotDisable(false);
				if($("#formEventPFDayNightTransition:checkbox").attr("checked") == false)
					$("#formEventPFSaveLog").attr({"disabled": false});
			}

			DisplaySubMenu($(this).attr('id'));
			$("#formEventPFSourceSchedule:checkbox").change();
		});
	}

	// scheduling - Recurrence   
	$("#formEventPFSourceRecurrence:checkbox").unbind().change(function() {
		RecurrenceState = 0;

		if($("#formEventPFSourceRecurrence:checkbox").attr("checked") == true)
		{
			RecurrenceState = 1;
		}
		
		var EHList = EventList.concat(g_healthList);
		if(RecurrenceState == 1)
		{
			for(var j=0; j<EHList.length; j++)
			{
				Disable($("#" + EHList[j]));
			}
		}
		else
		{
			var List = EventList.concat(g_actionList);
			var State = 0;
			var HState = 0;
			var HealthID = "";
			for(var j=0; j<List.length; j++)
			{
				if($("#" + List[j] + ":checkbox").attr("checked") == true)
				{
					State = 1;
					break;
				}
			}
			for(var j=0; j<g_healthList.length; j++)
			{
				if($("#" + g_healthList[j] + ":checkbox").attr("checked") == true)
				{
					HState = 1;
					HealthID = g_healthList[j];
					break;
				}
			}
			if(State == 0)
			{
				ListDisable(HealthID, g_healthList, HState);
			}
			if(HState == 0)
			{
				for(var j=0; j<eventListCount; j++)
				{
					if($("#formEventPFDayNightTransition:checkbox").attr("checked") == false)
						Enable($("#" + EventList[j]));
				}
			}
		}
		DisplaySubMenu($(this).attr('id'));

		$("#formEventPFSourceSchedule:checkbox").change();
	});

	// Action
	for(var i=0; i<g_actionList.length; i++)
	{
		$("#" + g_actionList[i] + ":checkbox").unbind().change(function() {
			ActionState = 0;
			for(var j=0; j<g_actionList.length; j++)
			{
				if($("#" + g_actionList[j] + ":checkbox").attr("checked") == true)
				{
					ActionState = 1;
					break;
				}
			}

			if(ActionState == 1)
			{
				for(var j=0; j<g_healthList.length; j++)
				{
					Disable($("#" + g_healthList[j]));
				}
				Disable($("#formEventPFDayNightTransition"));
			}
			else
			{
				var List = EventList.concat("formEventPFSourceRecurrence");
				var State = 0;
				var HState = 0;
				var HealthID = "";
				var EState = 0;
				var EventID = "";
				for(var j=0; j<List.length; j++)
				{
					if($("#" + List[j] + ":checkbox").attr("checked") == true)
					{
						State = 1;
						break;
					}
				}
				for(var j=0; j<g_healthList.length; j++)
				{
					if($("#" + g_healthList[j] + ":checkbox").attr("checked") == true)
					{
						HState = 1;
						HealthID = g_healthList[j];
						break;
					}
				}

				if(State == 0 )
				{
				   ListDisable(HealthID, g_healthList, HState);
				}			
				
			}
			DisplaySubMenu($(this).attr('id'));

			//exception - recording
			var curSelectorID = $(this).attr("id");
			if(curSelectorID == "formEventPFActiveRec")
			{
				if($("#formEventPFVCA:checkbox").attr("checked") == true)
				{
					if($(this).attr("checked") == true && $("#formEventPFVCAConfig:checkbox").attr("checked") == false)
					{
						Disable($("#formEventPFVCAConfig"));
					}
					else
					{
						Enable($("#formEventPFVCAConfig"));
					}
				}
			}
		});
	}

	//vca-configuration 
	$("#formEventPFVCAConfig:checkbox").unbind().change(function() {
		if($("#formEventPFVCA:checkbox").attr("checked") == true && $(this).attr("checked") == true)
		{
			$("#formEventPFActiveRec").attr("checked", "");
			Disable($("#formEventPFActiveRec"));
		}
		else
		{
			var healthEventEnabled = 0;
			for(var j=0; j<g_healthList.length; j++)
			{
				if($("#" + g_healthList[j] + ":checkbox").attr("checked") == true)
				{
					healthEventEnabled = 1;
					break;
				}
			}

			if(healthEventEnabled == 0 && $("#formEventPFDayNightTransition:checkbox").attr("checked")==false)
			{
				Enable($("#formEventPFActiveRec"));
			}
		}
	});
}

function InitEventCheckRelation()
{
	var EventList = g_eventList;

	var ChangeEvent = EventList.concat(g_healthList, g_actionList, "formEventPFSourceRecurrence", "formEventPFSourceSchedule");

	for(var i=0; i < ChangeEvent.length; i++)
	{
		if(ChangeEvent[i] == "formEventPFSourceSchedule")
		{
			var ScheduleList = eval("SCHEDULE_LIST").split(",");
			if(ScheduleList == "")
			{
				Disable($("#formEventPFSourceSchedule"));
			}
		}
		else
		{
			Enable($("#" + ChangeEvent[i]));
		}
	}

	for(var j=0; j<ChangeEvent.length; j++)
	{
		$("#" + ChangeEvent[j] + ":checkbox").change();
	}

	$("#formEventPFVCAConfig:checkbox").change();
}

////////////////////////////////////////////////////////////////////////////////
// Function Name : DisplaySubMenu(id)
// Description	 : 서브메뉴를 활성화 / 비활성화 한다.
////////////////////////////////////////////////////////////////////////////////
function DisplaySubMenu(id)
{
	if(id == "formEventPFMotion")
	{
		if($("#" + id).attr("checked") == true)
		{
			$("#formEventPFSubMD").css('display', 'block');
		}
		else
		{
			$("#formEventPFSubMD").css('display', 'none');
		}
		adjustSourcesPageSize();
	}
	else if(id == "eventSrcFace")
	{
		if($("#" + id).attr("checked") == true)
		{
			$("#eventSrcFaceSub").css('display', 'none');
		}
		else
		{
			$("#eventSrcFaceSub").css('display', 'none');
		}
		adjustSourcesPageSize();
	}
	else if(id == "formEventPFVCA")
	{
		if($("#" + id).attr("checked") == true)
		{
			$("#formEventPFSubVCA").css('display', 'block');
		}
		else
		{
			$("#formEventPFSubVCA").css('display', 'none');
		}
		adjustSourcesPageSize();
	}
	else if(id == "formEventPFActiveRec")
	{
		if($("#" + id).attr("checked") == true)
		{
			$("#formEventPFSubRecording").css('display', 'block');
		}
		else
		{
			$("#formEventPFSubRecording").css('display', 'none');
		}
		adjustSourcesPageSize();
	}
	else if(id == "formEventPFPTZ")
	{
		if($("#" + id).attr("checked") == true)
		{
			$("#formEventPFSubPTZ").css('display', 'block');
		}
		else
		{
			$("#formEventPFSubPTZ").css('display', 'none');
		}
		adjustSourcesPageSize();
	}
	else if(id == "formEventPFSensor")
	{
		if($("#" + id).attr("checked") == true)
		{
		  $("#formEventPFSubSensor").css('display', 'block');
		}
		else
		{
		  $("#formEventPFSubSensor").css('display', 'none');
		}
		adjustSourcesPageSize();
	}
	else if(id == "formEventPFSourceAlarm")
	{
		if($("#" + id).attr("checked") == true)
		{
		  $("#formEventPFSubSourceAlarm").css('display', 'block');
		}
		else
		{
		  $("#formEventPFSubSourceAlarm").css('display', 'none');
		}
		adjustSourcesPageSize();
	}
	else if(id == "formEventPFSourceRecurrence")
	{
		if($("#" + id).attr("checked") == true)
		{
		  $("#formEventPFSubSourceRecurrence").css('display', 'block');
		}
		else
		{
	 	  $("#formEventPFSubSourceRecurrence").css('display', 'none');
		}
		adjustSourcesPageSize();
	}
	else if(id == "formEventPFSourceSchedule")
	{
		if($("#" + id).attr("checked") == true)
		{
		  $("#formEventPFSubSourceSchedule").css('display', 'block');
		}
		else
		{
		  $("#formEventPFSubSourceSchedule").css('display', 'none');
		}
		adjustSourcesPageSize();
	}
	else if(id == "formEventPFDayNightTransition")
	{
		if($("#" + id).attr("checked") == true)
		{
		  $("#formEventPFSubDayNightTransition").css('display', 'block');
		}
		else
		{
		  $("#formEventPFSubDayNightTransition").css('display', 'none');
		}
		adjustSourcesPageSize();
	}
  /*
	else if(id == "formCompexRules")
	{
	  if($("#formCompexRules:checkbox").attr("checked") == true)
		{
			//Show the sub menu
			$("#formSubComplexRules").css('display', 'block');
		}
		else
		{
			//Hide the sub menu
			$("#formSubComplexRules").css('display', 'none');
		}
		adjustSourcesPageSize();
	}
  */
	else if(id == "formEventPFVideoStatus")
	{
		if($("#" + id).attr("checked") == true)
		{
			$("#formEventPFSubVideo").css('display', 'block');
		}
		else
		{
			$("#formEventPFSubVideo").css('display', 'none');
		}
		adjustSourcesPageSize();
	}
	else
	{
		DIPrefix = "formEventPFSensor_ch";
		if(id.indexOf(DIPrefix) != -1)
		{
			DIIndex = id.charAt(DIPrefix.length);
			if($("#" + id).attr("checked") == true)
			{
				$("#formEventPFSubSensor" + "_ch" + DIIndex).css('display', 'block');
			}
			else
			{
				$("#formEventPFSubSensor" + "_ch" + DIIndex).css('display', 'none');
			}
			adjustSourcesPageSize();
		}

		DOPrefix = "formEventPFSourceAlarm_ch";
		if(id.indexOf(DOPrefix) != -1)
		{
			DOIndex = id.charAt(DOPrefix.length);
			if($("#" + id).attr("checked") == true)
			{
				$("#formEventPFSubSourceAlarm" + "_ch" + DOIndex).css('display', 'block');
			}
			else
			{
				$("#formEventPFSubSourceAlarm" + "_ch" + DOIndex).css('display', 'none');
			}
			adjustSourcesPageSize();
		}

	}
}


//////////////////////////////////////////////////////////////////////
// Function Name : InitPage()
// Description	 : 채널 개수에 따라 페이지를 Init 하여 준다.
//								 유동적으로 UI가 변경 되어야 하므로 ID값을 유동적으로 
//								 변경하여 주기위하여 페이지를 JS로 출력함
//////////////////////////////////////////////////////////////////////\
function InitPage()
{
	var DIFormStr = "";
	var DOFormStr = "";

	for(var i = 1; i < parent.g_brand.diCount; i++)
	{
		DIFormStr = "";
		DIFormStr += "<li class='item di_Contents'>";
		DIFormStr += "<ul class='detectorsContents'>";
		DIFormStr += "<li>";
		DIFormStr += "<input type='checkbox' class='formEventPFSensor' id='formEventPFSensor" + "_ch" + eval(i+1) + "' />";
		DIFormStr += "<label for='formEventPFSensor" + "_ch" + eval(i+1) + "'><span class='04030120'> Sensor(DI</span>" + "#" + eval(i+1) + ")</label>";
		DIFormStr += "</li>";
		DIFormStr += "<li class='float_r'>";
		DIFormStr += "<span>";
		DIFormStr += "<a id='linkDi" + "_ch" + eval(i+1) + "' href='#' class='04030121 linkDi'>Go to Sensor/Alarm Configuration</a>";
		DIFormStr += "</span>";
		DIFormStr += "</li>";
		DIFormStr += "</ul>";
		DIFormStr += "<div id='formEventPFSubSensor" + "_ch" + eval(i+1) + "' class='subsection'>";
		DIFormStr += "<ul>";
		DIFormStr += "<li>";
		DIFormStr += "<input type='radio' name='formEventPFSensorTriger_ch" + eval(i+1) + "' id='formEventPFSensorTriger_ch" + eval(i+1) + "_0' value='active' />";
		DIFormStr += "<label for='formEventPFSensorTriger_ch" + eval(i+1) + "_0' class='04030187'> Active</label>";
		DIFormStr += " <input type='radio' name='formEventPFSensorTriger_ch" + eval(i+1) + "' id='formEventPFSensorTriger_ch" + eval(i+1) + "_1' value='inactive' />";
		DIFormStr += "<label for='formEventPFSensorTriger_ch" + eval(i+1) + "_1' class='04030188'> Inactive</label>";
		DIFormStr += " <input type='radio' name='formEventPFSensorTriger_ch" + eval(i+1) + "' id='formEventPFSensorTriger_ch" + eval(i+1) + "_2' value='all' />";
		DIFormStr += "<label for='formEventPFSensorTriger_ch" + eval(i+1) + "_2' class='04030189'> Both</label>";
		DIFormStr += "</li>";
		DIFormStr += "</ul>";
		DIFormStr += "</div>";
		DIFormStr += "</li>";

		$("#di_append").append(DIFormStr);
	}

	for(var i = 1; i < parent.g_brand.doCount; i++)
	{
		//source
		DOFormStr = "";
		DOFormStr += "<li class='item do_Contents'>";
		DOFormStr += "<ul class='detectorsContents'>";
		DOFormStr += "<li>";
		DOFormStr += "<input type='checkbox' class='formEventPFSourceAlarm' id='formEventPFSourceAlarm" + "_ch" + eval(i+1) + "' />";
		DOFormStr += "<label for='formEventPFSourceAlarm" + "_ch" + eval(i+1) + "'><span class='0403019923'> Alarm(DO</span>" + "#" + eval(i+1) + ")</label>";
		DOFormStr += "</li>";
		DOFormStr += "<li class='float_r'>";
		DOFormStr += "<span>";
		DOFormStr += "<a id='linkDi" + "_ch" + eval(i+1) + "' href='#' class='04030121 linkDi'>Go to Sensor/Alarm Configuration</a>";
		DOFormStr += "</span>";
		DOFormStr += "</li>";
		DOFormStr += "</ul>";
		DOFormStr += "<div id='formEventPFSubSourceAlarm" + "_ch" + eval(i+1) + "' class='subsection'>";
		DOFormStr += "<ul>";
		DOFormStr += "<li>";
		DOFormStr += "<input type='radio' name='formEventPFSourceAlarmTriger_ch" + eval(i+1) + "' id='formEventPFSourceAlarmTriger_ch" + eval(i+1) + "_0' value='active' />";
		DOFormStr += "<label for='formEventPFSourceAlarmTriger_ch" + eval(i+1) + "_0' class='0403019924'> Active</label>";
		DOFormStr += " <input type='radio' name='formEventPFSourceAlarmTriger_ch" + eval(i+1) + "' id='formEventPFSourceAlarmTriger_ch" + eval(i+1) + "_1' value='inactive' />";
		DOFormStr += "<label for='formEventPFSourceAlarmTriger_ch" + eval(i+1) + "_1' class='0403019925'> Inactive</label>";
		DOFormStr += " <input type='radio' name='formEventPFSourceAlarmTriger_ch" + eval(i+1) + "' id='formEventPFSourceAlarmTriger_ch" + eval(i+1) + "_2' value='all' />";
		DOFormStr += "<label for='formEventPFSourceAlarmTriger_ch" + eval(i+1) + "_2' class='0403019926'> Both</label>";
		DOFormStr += "</li>";
		DOFormStr += "</ul>";
		DOFormStr += "</div>";
		DOFormStr += "</li>";

		$("#sourcedo_append").append(DOFormStr);

		//action
		DOFormStr = "";
		DOFormStr += "<li class='item do_Contents'>";
		DOFormStr += "<ul>";
		DOFormStr += "<li>";
		DOFormStr += "<input type='checkbox' id='formEventPFAlarm" + "_ch" + eval(i+1) + "' />";
		DOFormStr += "<label for='formEventPFAlarm" + "_ch" + eval(i+1) + "'><span class='04030138'> Active alarm(DO</span>" + "#" + eval(i+1) + ")</label>";
		DOFormStr += "</li>";
		DOFormStr += "<li id='listDoLink" + "_ch" + eval(i+1) + "' class='float_r'>";
		DOFormStr += "<span>";
		DOFormStr += "<a id='linkDo" + "_ch" + eval(i+1) + "' href='#' class='04030139 linkDo'>Go to DI/DO Configuration</a>";
		DOFormStr += "</span>";
		DOFormStr += "</li>";
		DOFormStr += "</ul>";
		DOFormStr += "<div id='formEventPFSubDisDo" + "_ch" + eval(i+1) + "' class='formEventPFSubDisDo'>";
		DOFormStr += "<ul>";
		DOFormStr += "<li>";
		DOFormStr += "<input type='radio' name='edgeLevelTrigger" + "_ch" + eval(i+1) + "' id='edgeLevelTrigger" + "_ch" + eval(i+1) + "_0' value='edge' />";
		DOFormStr += "<label for='edgeLevelTrigger_ch" + eval(i+1) + "_0' class='0403019954'> Hold the status for the duration</label>";
		DOFormStr += "<input type='radio' name='edgeLevelTrigger" + "_ch" + eval(i+1) + "' id='edgeLevelTrigger" + "_ch" + eval(i+1) + "_1' value='level' />";
		DOFormStr += "<label for='edgeLevelTrigger_ch" + eval(i+1) + "_1' class='0403019955'> Synchronize with the event source(s)</label>";
		DOFormStr += "</li>";
		DOFormStr += "</ul>";
		DOFormStr += "<ul class='activeInactiveContents" + eval(i+1) + "'>";
		DOFormStr += "<li class='margin_left_46 margin_top_small_step3 0403019956'>Status :</li>";
		DOFormStr += "<li class='margin_left_step4'>";
		DOFormStr += "<input type='radio' name='formEventPFActionAlarmTriger" + "_ch" + eval(i+1) + "' id='formEventPFActionAlarmTriger" + "_ch" + eval(i+1) + "_0' value='active' />";
		DOFormStr += "<label for='formEventPFActionAlarmTriger" + "_ch" + eval(i+1) + "_0' class='0403019939'> Active</label>";
		DOFormStr += " <input type='radio' name='formEventPFActionAlarmTriger" + "_ch" + eval(i+1) + "' id='formEventPFActionAlarmTriger" + "_ch" + eval(i+1) + "_1' value='inactive' />";
		DOFormStr += "<label for='formEventPFActionAlarmTriger" + "_ch" + eval(i+1) + "_1' class='0403019940'> Inactive</label>";
		DOFormStr += "</li>";
		DOFormStr += "</ul>";
		DOFormStr += "<ul class='edgeDurationContents" + eval(i+1) + "'>";
		DOFormStr += "<li class='04030140 durationTitle_contents margin_left_46'>Duration :</li>";
		DOFormStr += "<li><div id='sliderEventPFDuration" + "_ch" + eval(i+1) + "' class='slider-bar'></div></li>";
		DOFormStr += "<li>";
		DOFormStr += "<input type='text' size='5' id='formEventPFDuration" + "_ch" + eval(i+1) + "' class='formEventPFDuration text_cen'/>";
		DOFormStr += "<label class='04030141'> (0 ... 600 sec)</label>";
		DOFormStr += "</li>";
		DOFormStr += "<li class='margin_top_small_step2_reverse'>";
		DOFormStr += "<input type='checkbox' id='formEventPFUnlimited" + "_ch" + eval(i+1) + "'/>";
		DOFormStr += "<label for='formEventPFUnlimited" + "_ch" + eval(i+1) + "' class='04030142'> Unlimited</label>";
		DOFormStr += "</li>";
		DOFormStr += "</ul>";
		DOFormStr += "<ul class='levelMinHoldOnTimeContents" + eval(i+1) + "'>";
		DOFormStr += "<li class='margin_right_step2 margin_top_small_step3 margin_left_46 0403019953'>Min hold-on time :</li>";
		DOFormStr += "<li><div id='sliderMinHoldOnTime_ch" + eval(i+1) + "' class='slider-bar'></div></li>";
		DOFormStr += "<li>";
		DOFormStr += "<input type='text' size='5' id='textMinHoldOnTime_ch" + eval(i+1) + "' class='text_cen'/>";
		DOFormStr += "<label> (1 ... 600 sec)</label>";
		DOFormStr += "</li>";
		DOFormStr += "<li class='margin_top_small_step2_reverse'>";
		DOFormStr += "<input type='checkbox' id='minHoldOnTimeUnlimited_ch" + eval(i+1) + "'/>";
		DOFormStr += "<label for='minHoldOnTimeUnlimited_ch" + eval(i+1) + "' class='04030142'> Unlimited</label>";
		DOFormStr += "</li>";
		DOFormStr += "</ul>";
		DOFormStr += "</div>";
		DOFormStr += "</li>";

		$("#do_append").append(DOFormStr);
	}

	setLanguage(parent.g_configData.langPath, setup + maincontents + "eventrules", g_langData);
	EvenOdd(parent.g_configData.skin);

	if("rs51c0b" == parent.g_brand.imgDevice || "mdc200s" == parent.g_brand.imgDevice || "mdc600s" == parent.g_brand.imgDevice)
		$(".notTofDevice").toggle(false);
	else
		$(".notTofDevice").toggle(true);
}


////////////////////////////////////////////////////////////////////////////////
// Function name : ListDisable(checkedID, list, checkState)
// Description   : checkedID: 현재 체크된 ID, list: 비활성화할 ID, 
//	checkState: 1이면 체크, 1이 아니면 체크 아님
//	체크된 자신을 제외한 리스트를 비활성화 시키는 기능
////////////////////////////////////////////////////////////////////////////////
function ListDisable(checkedID, list, checkState)
{
	for(var i=0; i<list.length; i++)
	{
		if (checkedID == list[i])
			continue;

		if (checkState == 1)
			Disable($("#" + list[i]));
		else
			Enable($("#" + list[i]));
	}
}

function IsContinuousRecording()
{
	var resultState = false;

	var eventList = g_eventList;
	var checkList = eventList.concat(g_healthList, "formEventPFSourceRecurrence");
	checkList.splice(checkList.indexOf("formEventPFNetworkLossDetect"), 1);

	var netlossState = $("#formEventPFNetworkLossDetect:checkbox").attr("checked");
	var scheduleState = $("#formEventPFSourceSchedule:checkbox").attr("checked");

	if(netlossState == true || scheduleState == true)
	{
		resultState = true;
		for(var i=0; i<checkList.length; i++)
		{
			if($("#" + checkList[i] + ":checkbox").attr("checked") == true)
			{
				resultState = false;
				break;
			}
		}
	}

	return resultState;
}
