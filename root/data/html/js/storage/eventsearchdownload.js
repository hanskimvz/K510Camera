var g_currentPageNumber = 1;
var g_totalPageCount = "";
var g_searchFlag = 0;
var g_searchCount = 0;
var g_searchToken = "";
var g_selectIndex = -1;
var g_cookieNameSearchToken = "cookie_SearchToken";
var g_cookieNameSelectIndex = "cookie_SelectIndex";
var g_cookieNameAutoPlayFlag = "cookie_AutoPlayFlag";	//1 : true, 0 : false
var g_cookieNameMuteAudioFlag = "cookie_MuteAudioFlag";	//1 : true, 0 : false
var g_cookieExdays = 365;
var g_playbackPopupWidth = 880;
var g_playbackPopupHeight = 700;
var g_handlePlayback;
var g_autoPlayFlag = 0;
var g_eventNo = 0;
var g_width = 864;
var g_height = 486;
var g_recordToken = "";
var g_samplespersec = "";
var g_bitspersample = "";
var g_streamURL = "";
var g_recordingState = false;
var g_authElevateState = "";
var g_recordingPercent = 0;
var g_eventRuleTime = "";
var g_maxViewGroup = 20;
var g_curUtcOffset = null;

var MAX_ITEM_COUNT = 20;
var MAX_SEARCH_TIME = 60*60;
var MAX_RECORDING_RUNNING_PERCENT = 80;
var MAX_RECORDING_ENDSTREAM_PERCENT = 90;
var MAX_RECORDING_MAKEEND_PERCENT = 100;
var REC_STATUS_START = 0;
var REC_STATUS_RECORDING = 1;
var REC_STATUS_STOP = 2;
var REC_STATUS_COMPLETE = 3;
var PLAYBACK_STATUS_ERROR = -1;
var PLAYBACK_STATUS_WAIT = 0;
var PLAYBACK_STATUS_PLAY = 1;
var PLAYBACK_STATUS_PAUSE = 2;
var PLAYBACK_STATUS_STOP = 3;
var PLAYBACKCTRL_START = 0;
var PLAYBACKCTRL_PAUSE = 1;
var PLAYBACKCTRL_STOP = 2;
var PLAYBACKCTRL_SNAPSHOT = 3;
var PLAYBACKCTRL_SAVE = 4;
var PLAYBACKCTRL_FULLSCREEN = 5;
var g_playbackStatus = PLAYBACK_STATUS_WAIT;

var g_adrdCmd_find = g_defpath.adrdownload + "?action=FindRecording";
var g_adrdCmd_getPlayUri = g_defpath.adrdownload + "?action=GetReplayUri";
var g_adrdCmd_down = g_defpath.adrdownload + "?action=Download";
var g_adrdCmd_getRecSearch = g_defpath.adrdownload + "?action=GetRecordingSearchResults";
var g_adrdCmd_getMediaAttr = g_defpath.adrdownload + "?action=GetMediaAttributes";

var g_recInfoList = new Array();
var g_player = null;

$(function () {
	PreCustomize();
	initEnvironment();
	initBrand();
	initPlayer();
	mainLoad();
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum = ["03030226", "03030232", "03030233", "0501"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, storage + maincontents + "eventsearchdownload",
				parent.g_langData[parent.g_configData.language]);
}

function mainLoad()
{
	ViewLoadingSave(true);
	$("button").button();
	ContentShow();
	getDataConfig_UAPI("NETWORK&ENCODER&SYSTEM", function(data){
		initDataValue(data);
		initSetting();
		eventBind();
		PostCustomize();
	});
}

function initPlayer()
{
	g_player = new uPlayer("view", "rec01", player_version);
	g_player.setScreenSize(g_width, g_height);
	g_player.setCallbackFunc(activexEvent);
}

function initSetting()
{
	var searchType = getSearchCondition();
	var event_Num = 0;

	$("#eventlist").empty();
	$("#thumbnailList").empty();

	call_xmlData(g_adrdCmd_find + "&Type=" + searchType[0].type + "&StartRuleTime=" + searchType[0].startDate +
		"&EndRuleTime=" + searchType[0].endDate + "&KeepAliveTime=" + MAX_SEARCH_TIME, false, function(xml) {
			if(CGIResponseCheck(1, xml) != 0)
			{
				ViewLoadingSave(false);
				return;
			}
			g_searchCount = parseInt(jqGetXmlData('RecordingResult RecordingCount', xml));
			g_totalPageCount = Math.ceil(g_searchCount/MAX_ITEM_COUNT);
			g_searchToken = parseInt(jqGetXmlData('RecordingResult SearchToken', xml));
			g_currentPageNumber = Number(g_currentPageNumber);
			event_Num = (g_currentPageNumber * 20 - 19) - 1;
	});

	$.get(g_adrdCmd_getRecSearch +"&SearchToken=" + g_searchToken + "&MaxResult=" + g_searchCount +"&schema=text", function(cbData) {
		var infoList = new Array();
		var originData = cbData;
		var lineData = originData.split("\n");
		var recTextHead = "";
		$.each(lineData, function(index, val){
			var lineVal = $.trim(val);
			if(lineVal != null && lineVal != undefined)
			{
				if(lineVal.charAt(0) == '[')
				{
					recTextHead = lineVal;
					if(recTextHead == "[Recording]")
					{
						infoList.push(new Object());
					}
					else if(recTextHead == "[Event]")
					{
						var lastIndex = infoList.length - 1;
						var obgEventOfRec = infoList[lastIndex]["eventOfRec"];
						if(undefined == obgEventOfRec)
							infoList[lastIndex]["eventOfRec"] = [];

						infoList[lastIndex]["eventOfRec"].push(new Object);
					}
				}
				else
				{
					var delimPos = lineVal.indexOf("=");
					var resultName = lineVal.substring(0, delimPos);
					var resultValue = lineVal.substring(delimPos+1);
					var lastIndex = infoList.length - 1;

					if(recTextHead == "[Recording]")
					{
						infoList[lastIndex][resultName] = resultValue;
					}
					else if(recTextHead == "[Event]")
					{
						var lastEvent = infoList[lastIndex]["eventOfRec"].length - 1;
						infoList[lastIndex]["eventOfRec"][lastEvent][resultName] = resultValue;
					}
				}
			}
		});

		for(var i = 0; i < infoList.length; ++i)
		{
			event_Num++;
			var event_Name = infoList[i]["RuleName"];

			var ruleTime = makeISOStringToDateFormat(infoList[i]["RuleTime"]);
			var recUtcOffset = infoList[i]["UtcOffset"];
			ruleTime.setTime(ruleTime.getTime() + (recUtcOffset * 1000));
			var event_RuleTime = MakeDateString(ruleTime);
			var eventRecordingToken = infoList[i]["RecordingToken"];

			var sourceCount = infoList[i]["eventOfRec"].length ;

			var FromDate = makeISOStringToDateFormat(infoList[i]["DateFrom"]);
			FromDate.setTime(FromDate.getTime() + (recUtcOffset * 1000));
			var ToDate = makeISOStringToDateFormat(infoList[i]["DateTo"]);
			ToDate.setTime(ToDate.getTime() + (recUtcOffset * 1000));
			var gDurationSeconds = Math.round((ToDate.getTime() - FromDate.getTime())/1000);

			var durationValue = convertSeconds2HHMMSS(gDurationSeconds);

			var timeline_content = "";
			var timeline_classname = "";
			var event_Description = "";
			var downButtonText = "";

			for(var j=0; j<sourceCount; j++)
			{
				var eventType = infoList[i]["eventOfRec"][j]["Type"];
				var eventType2 = infoList[i]["eventOfRec"][j]["Type2"];
				var Value = infoList[i]["eventOfRec"][j]["Value"];
				var Value2 = infoList[i]["eventOfRec"][j]["Value2"];
				var ChannelValue = eval(infoList[i]["eventOfRec"][j]["Ch"]) + 1;
				event_Description += getEventDescrptionInfo(eventType, eventType2, Value, Value2, ChannelValue);

				if(eventType == "temperature")
					event_Name = "-";

				if(event_Name == "undefined" || event_Name == null)
					event_Name = "";

				if(downButtonText == "" || downButtonText == "-")
					downButtonText = getDownButtonTextInfo(eventType);

				timeline_content = "<div title='" + eventType + "'name='timelineBar' " +
								   "id='timetooltip_" + event_Num + "' " +
								   "recindex='" + event_Num + "' " +
								   "rectoken='" + eventRecordingToken + "'>" +
								   "</div>";
				timeline_classname = "timeline_" + eventType;
			}

			g_recInfoList.push(
			{
				start:ruleTime,
				end:ToDate,
				offset:recUtcOffset,
				content:timeline_content,
				className:timeline_classname,
				idx:event_Num,
				name:event_Name,
				time:event_RuleTime,
				desc:event_Description,
				tokenid:eventRecordingToken,
				duration:durationValue,
				downBtn:downButtonText
			});
		}
		setPageNumber(g_totalPageCount);
		gridSearchList();
		drawTimeLine(searchType[0].startDate);
		outputCurrentPage(1);
		reSearchEventBind();
		ResizePage();
	});

	var autoFlag = getCookie(g_cookieNameAutoPlayFlag);
	g_autoPlayFlag = (autoFlag == 1 ? 1 : 0);
	$("#formAutoPlay").attr("checked", autoFlag == 1 ? "checked" : "");
	$("#formAutoPlay").change();

	var muteAudioFlag = getCookie(g_cookieNameMuteAudioFlag);
	$("#formMuteAudio").attr("checked", (muteAudioFlag == 1) ? "checked" : "");
	$("#formShowProgressbar").attr("checked", "checked");

	playControlToolbar();
}

var timeline;
function drawTimeLine(startDate) {
	var options = {
		'width':  '100%',
		'height': '63px',
		'editable': false,   // enable dragging and editing events
		'style': 'box',
		'zoomMin': 1000 * 20, //최소 5초 단위 1초 단위는 1000 * 10
		'zoomMax': 1000 * 60 * 60 * 24,// 하루 데이터
		'showCustomTime' : false,
		'showCurrentTime' : false,
		'showButtonNew' : true,
		"stackEvents": false
	};

	var startTimeValue = startDate;
	var startYear = startTimeValue.substr(0,4);
	var startMonth = startTimeValue.substr(4,2);
	var startDay = startTimeValue.substr(6,2);

	timeline = new links.Timeline(document.getElementById('mytimeline'), options);

	function onRangeChanged(properties)
	{
		var timelineStartTime = new Date(startYear, startMonth-1, startDay);
		var timelineEndTime   = new Date(startYear, startMonth-1, startDay, 23, 59, 59);

		var timelineVisibleTimeRange = timeline.getVisibleChartRange();
		var timelineVisibleStartTime = timelineVisibleTimeRange.start;
		var timelineVisibleEndTime   = timelineVisibleTimeRange.end;

		var startDiffTime = timelineVisibleStartTime.getTime() - timelineStartTime.getTime();
		var endDiffTime   = timelineVisibleEndTime.getTime() - timelineEndTime.getTime();

		if(startDiffTime < 0 || endDiffTime > 0)
		{
			var visibleStartTime = timelineStartTime;
			var visibleEndTime   = timelineEndTime;
			if(startDiffTime < 0)
			{
				visibleEndTime.setTime(timelineVisibleEndTime.getTime() + Math.abs(startDiffTime));
			}
			else
			{
				visibleStartTime.setTime(timelineVisibleStartTime.getTime() - Math.abs(endDiffTime));
			}
			timeline.setVisibleChartRange(visibleStartTime, visibleEndTime, true);
		}
	}

	$("#mytimeline").click(function(){
		var timeX = timeline.getScreenPositionX();
		var timeDate = timeline.screenToTime(timeX);
		timeline.setCustomTime(timeDate);
	});

	links.events.addListener(timeline, 'rangechanged', onRangeChanged);
	timeline.draw(g_recInfoList);
	$("#btnShowThumbnail").parent().show();

	timeline.setVisibleChartRange(new Date(startYear,startMonth-1,startDay,00,00,00), new Date(startYear,startMonth-1,startDay,23,59,59), true);
}

function setThumbnailImage(pageIdx)
{
	for(var i=0; i<g_maxViewGroup;i++)
	{
		var firstID = pageIdx * g_maxViewGroup - (g_maxViewGroup-1);
		var tokenid = $("div[recindex='"+eval(firstID+i)+"']").attr("rectoken");

		var thumbnailQuery = g_adrdCmd_down + "&key=" + tokenid + "&type=thumbnail";
		$("div[rectoken='" + tokenid + "'] .image img")
			.attr("src", thumbnailQuery).attr("onError", "this.src='../images/defaultthumbnail.jpg'");
	}
}

function gridSearchList()
{
	var addQuery = "";
	var pageIdx = 1;
	var pageCountBuffer = 0;

	for(var i=0; i< g_recInfoList.length;i++)
	{
		pageCountBuffer++;
		if((pageCountBuffer > MAX_ITEM_COUNT) && (pageCountBuffer % MAX_ITEM_COUNT == 1))
		{
			pageIdx++;
		}

		addQuery += "<div class='searchList pageIdx_" + pageIdx + "' recindex='" + g_recInfoList[i].idx + "' rectoken='" + g_recInfoList[i].tokenid + "' recOffset='" + g_recInfoList[i].offset + "'>" +
					"	<div class='image'>" +
					"		<img src='../images/defaultthumbnail.jpg' />" +
					"	</div>"+
					"	<div class='info'>" +
					"		<div class='ruleName' title='" + g_recInfoList[i].name + "'>" + g_recInfoList[i].name + "</div>" +
					"		<div class='ruleTime'>" + g_recInfoList[i].time + "</div>" +
					"	</div>" +
					"	<div class='info_button'>" +
					"		<span class='recdownload'>" + g_recInfoList[i].downBtn + "</span>" +
					"		<span class='defaultPlay'><img src='../images/play_in_search.gif' /></span>" +
					"		<span id='tooltip_" + g_recInfoList[i].idx + "' class='recdestooltip'><img src='../images/description.png' /></span>" +
					"	</div>" +
					"	<div id='description' class='dsp_hide'>" +
					"		<ul class='box'>" +
					"			<li class='box-title'><h2>Recording File Information</h2></li>"+
					"			<li class='box-content'>" +
					"				<ul>" +
					"					<li class='item'>" +
					"						<ul>" +
					"							" + g_recInfoList[i].desc +
					"							<li>Duration: " + g_recInfoList[i].duration + "</li>" +
					"						</ul>" +
					"					</li>" +
					"				</ul>" +
					"			</li>" +
					"		</ul>" +
					"	</div>" +
					"</div>";
	}

	$("#thumbnailList").append(addQuery);
	ViewLoadingSave(false);
	ResizePage(document.body.clientHeight + 200);
}

function recPlay(recToken, recIndex)
{
	if(recToken == undefined || recIndex == undefined) return;
	g_curUtcOffset = $("#thumbnailList div[rectoken='" + recToken + "'").attr("recoffset");

	g_searchToken = recToken;
	var ipaddress = getCurAddress();
	var rtspPort = NETWORK_RTSP_PORT;
	var rtspUrl = "rtsp://"+ipaddress+":"+rtspPort+"/recordingid=" + recToken;
	g_eventNo = recIndex;
	setInfoOfRecTokenData(g_searchToken);
	g_streamURL = rtspUrl;

	g_player.srtpEnable(g_dataArray["network_srtp_enable"]);
	g_player.srtpMasterKey(g_dataArray["network_srtp_key_master"]);
	g_player.srtpSaltKey(g_dataArray["network_srtp_key_salt"]);
	g_player.srtpProtectionProfile(g_dataArray["network_srtp_protectionprofile"]);

	g_player.setLoginInfo(PLAYER_UST, PLAYER_PST);
	g_player.play(rtspUrl);

	if($("#formMuteAudio").attr("checked") == true)
		g_player.audioMute(true);
	else
		g_player.audioMute(false);

	g_player.showProgress(true);
	displayPauseButton(true);
	g_playbackStatus = PLAYBACK_STATUS_PLAY;
	ResizePage();

	$("#playback-main").show();
}

function convertSeconds2HHMMSS(timeinseconds)
{
	var HH = Math.floor(timeinseconds/(60*60));
	if(HH < 10)
	{
		HH = "0" + HH;
	}

	var MM = Math.floor((timeinseconds - (HH*(60*60)))/60);
	if(MM < 10)
	{
		MM = "0" + MM;
	}

	var SS = timeinseconds - (HH*(60*60) + MM*60);
	if(SS < 10)
	{
		SS = "0" + SS;
	}

	return HH + ":" + MM + ":" + SS;
}

function getDownButtonTextInfo(evnType)
{
	var downButtonText = "<img class='download_contents' src='../images/save_in_search.gif' />";

	if((evnType == "schedule" || evnType == "netloss"))
		downButtonText = "-";

	if(evnType == "manual")
		downButtonText = "-";

	return downButtonText;
}

function getNoButtonClassInfo(evnType, evnSourceCnt, nextEvnType)
{
	var className = "";

	if((evnType == "schedule" || evnType == "netloss") && evnSourceCnt == 1)
		className = " noDown";

	if((evnType == "schedule" || evnType == "netloss") && evnSourceCnt == 2)
	{
		if(nextEvnType == "schedule" || nextEvnType == "netloss")
			className = " noDown";
	}

	if(evnType == "manual")
		className = " noDown";

	return className;
}

function getEventDescrptionInfo(evnType, evnType2, resultVal1, resultVal2, channel)
{
	var description = "<li>Description(" + evnType + "): ";
	switch(evnType)
	{
		case "di":
			description += "channel=" + channel + ", ";
			description += "type=" + resultVal1 + ", ";
			description += "status=" + resultVal2;
			break;
		case "do":
			description += "channel=" + channel + ", ";
			description += "status=" + resultVal2;
			break;
		case "vsignal":
			description += "channel=" + channel + ", ";
			description += "status=" + resultVal1;
			resultVal1 = vsignalChannelConvert(resultVal1);
			break;
		case "pir":
			description += "status=" + resultVal1;
			break;

		case "netloss":
			if (resultVal1 != "") description += "status=" + resultVal1;
			else description += "-";
			break;
		case "md":
			resultVal1 = mDChannelConvert(resultVal1);
			description += resultVal1 + ", " + "status=detect";
			break;
		case "health":
		case "config":
		case "vca":
			description += evnType2 + ", ";
			if (evnType2 == "event")
			{
				if (resultVal1 == "tamper")
				{
					description += "type=" + resultVal1;
					if (resultVal2 != "") description += ", " + resultVal2;
				}
				else
				{
					description += resultVal1 + ", ";
					description += resultVal2;
				}
			}
			else if (evnType2 == "counting")
			{
				description += resultVal1 + ", ";
				description += resultVal2;
			}
			break;
		case "face":
			description += resultVal1;
			break;
		default:
			description += "-";
			break;
	}

	return description + "</li><br/>";
}

function onSelectDatePicker()
{
	g_searchFlag = 1;
	ViewLoadingSave(true);
	g_recInfoList = new Array();
	initSetting();
}

function eventBind()
{
	var isShowThumbnail = false;
	$("#btnShowThumbnail").click(function() {
		if(isShowThumbnail == false)
		{
			$(".thumbnailContents").show();
			isShowThumbnail = true;
			ResizePage();
		}
		else
		{
			$(".thumbnailContents").hide();
			isShowThumbnail = false;
			ResizePage();
		}
	});

	$("#formEventTypeAll:checkbox").change(function() {
		$(".noAll:checkbox").attr("checked", $(this).attr("checked") == true ? "checked" : "");
	});

	$(".noAll:checkbox").change(function() {
		$("#formEventTypeAll:checkbox").attr("checked", "checked");
		$(".noAll:checkbox").each(function(){
			if($(this).attr("checked") == false && $(this).css("display") != "none")
			{
				$("#formEventTypeAll:checkbox").attr("checked", "");
				return;
			}
		});
	});

	$("#searchDate").datepicker({
		showOn: "button",
		buttonImage: "../images/calendar.png",
		buttonImageOnly: true,
		buttonText: "Select",
		changeMonth: true,
		changeYear: true,
		showOtherMonths: true,
		selectOtherMonths: true,
		dateFormat: "yy-mm-dd",
		beforeShow: function() {
			setTimeout(function() {
				$("#ui-datepicker-div").before("<iframe id='ui-datepicker-div-bg-iframe' frameborder='0' scrolling='no' style='filter:alpha(opacity=0); position:absolute; "
					+ "left: " + $("#ui-datepicker-div").css("left") + ";"
					+ "top: " + $("#ui-datepicker-div").css("top") + ";"
					+ "width: " + $("#ui-datepicker-div").outerWidth(true) + "px;"
					+ "height: " + $("#ui-datepicker-div").outerHeight(true) + "px;'></iframe>");
			}, 50);
		},
		onSelect: onSelectDatePicker,
		onClose: function() {
			$("#ui-datepicker-div-bg-iframe").remove();
		},
		yearRange: '1990:2050'
	}).datepicker("setDate", new Date());

	$("#reload").click(function(){
		var day = setCustomDay($("#searchDate").val(), 0);
		$("#searchDate").datepicker("setDate", day);
		onSelectDatePicker();
	});
	$(".reloadContents").css("display", "inline-block");

	$("#btnPageFirst").click(function(){
		if(g_totalPageCount == 0 || Number(g_currentPageNumber) == 1) return;
		outputCurrentPage(1);
	});

	$("#btnPagePrev").click(function(){
		if(g_totalPageCount == 0 || Number(g_currentPageNumber) == 1) return;
		outputCurrentPage(Number(g_currentPageNumber)-1);
	});

	$("#btnPageNext").click(function(){
		if(g_totalPageCount == 0 || Number(g_currentPageNumber) == g_totalPageCount) return;
		outputCurrentPage(Number(g_currentPageNumber)+1);
	});

	$("#btnPageLast").click(function(){
		if(Number(g_currentPageNumber) == g_totalPageCount || g_totalPageCount == 0) return;
		outputCurrentPage(g_totalPageCount);
	});
}

function setPageNumber(pageCount)
{
	$(".pageNumberGroup").empty();
	var viewGroup = 1;
	for(var i=0; i<pageCount; i++)
	{
		if(((i+1) > g_maxViewGroup) && ((i+1) % g_maxViewGroup == 1))
			viewGroup++;

		$(".pageNumberGroup").append("<span class='pageNumber_" + (i+1) + " viewGroup_"+viewGroup+"'>" + (i+1) + "</span>");
	}
}

function outputCurrentPage(idx)
{
	var quotient = parseInt(idx / g_maxViewGroup);
	var remainder = parseInt(idx % g_maxViewGroup);
	var curViewGroup = (remainder == 0 ? quotient:quotient+1);
	ViewLoadingSave(true);
	g_currentPageNumber = idx;
	$(".searchList").css("display", "none");
	$(".pageNumberGroup span").css("font-weight", "normal").css("display", "none");;

	setTimeout(function(){
		$(".pageIdx_" + idx).css("display", "block");
		$(".viewGroup_" +  curViewGroup).css("display", "inline-block");
		$(".pageNumber_" + idx).css("font-weight", "bold");
		ViewLoadingSave(false);
		ResizePage();
	}, 50);

	setThumbnailImage(idx);
}

function addPreFixString(oriString, prefix, newString)
{
	if(oriString == "")
		return newString;
	else
		return prefix + newString;
}

function getSearchCondition()
{
	var typeResult = [];
	var eventCheckBox = "";
	var todayDate = getTodayDate();

	var starD = "";
	var endD = "";

	starD = todayDate+"000000";
	endD = todayDate+"235959";

	checkVal_md = ($("#formEventTypeMotion").attr("checked") == true) ? "md" : "";
	checkVal_fd = ($("#eventTypeFace").attr("checked") == true) ? "face" : "";
	checkVal_di = ($("#formEventTypeDi").attr("checked") == true) ? "di" : "";
	checkVal_do = ($("#formEventTypeDo").attr("checked") == true) ? "do" : "";
	checkVal_recurrence = ($("#formEventTypeRecurrence").attr("checked") == true) ? "recurrence" : "";
	checkVal_schedule = ($("#formEventTypeSchedule").attr("checked") == true) ? "schedule" : "";
	checkVal_vca = ($("#formEventTypeVca").attr("checked") == true) ? "vca" : "";
	checkVal_pir = ($("#formEventTypePir").attr("checked") == true) ? "pir" : "";
	checkVal_config = ($("#formEventTypeConfig").attr("checked") == true) ? "config" : "";
	checkVal_netloss = ($("#formEventTypeNetloss").attr("checked") == true) ? "netloss" : "";
	checkVal_manual = ($("#EventTypeMamual").attr("checked") == true) ? "manual" : "";
	checkVal_all = ($("#formEventTypeAll").attr("checked") == true) ? "all" : "";
	checkVal_startDate = $("#searchDate").val();
	checkVal_endDate = $("#searchDate").val();


	if(checkVal_startDate != "" && g_searchFlag == 1)
	{
		starD = reDateformat(checkVal_startDate + " 00:00:00");
		endD = reDateformat(checkVal_endDate + " 23:59:59");
	}

	eventCheckBox += checkVal_md;

	if(checkVal_fd == "face")
		eventCheckBox += (eventCheckBox == "" ? checkVal_fd : ","+checkVal_fd);
	if(checkVal_di == "di")
		eventCheckBox += (eventCheckBox == "" ? checkVal_di : ","+checkVal_di);
	if(checkVal_do == "do")
		eventCheckBox += (eventCheckBox == "" ? checkVal_do : ","+checkVal_do);
	if(checkVal_recurrence == "recurrence")
		eventCheckBox += (eventCheckBox == "" ? checkVal_recurrence : ","+checkVal_recurrence);
	if(checkVal_schedule == "schedule")
		eventCheckBox += (eventCheckBox == "" ? checkVal_schedule : ","+checkVal_schedule);
	if(checkVal_vca == "vca")
		eventCheckBox += (eventCheckBox == "" ? checkVal_vca : ","+checkVal_vca);
	if(checkVal_pir == "pir")
		eventCheckBox += (eventCheckBox == "" ? checkVal_pir : ","+checkVal_pir);
	if(checkVal_config == "config")
		eventCheckBox += (eventCheckBox == "" ? checkVal_config : ","+checkVal_config);
	if(checkVal_netloss == "netloss")
		eventCheckBox += (eventCheckBox == "" ? checkVal_netloss : ","+checkVal_netloss);
	if(checkVal_manual == "manual")
		eventCheckBox += (eventCheckBox == "" ? checkVal_manual : ","+checkVal_manual);
	if(checkVal_all == "all") eventCheckBox = "all";

	typeResult.push({type: eventCheckBox, startDate: starD, endDate: endD});
	return typeResult;
}

function setCustomDay(date, custDayNum)
{
	var selectDate = date.split("-");
	var changeDate = new Date();
	changeDate.setFullYear(selectDate[0], selectDate[1]-1, eval((selectDate[2]*1)  + custDayNum));

	var y = changeDate.getFullYear();
	var m = changeDate.getMonth() + 1;
	var d = changeDate.getDate();
	if(m < 10)    { m = "0" + m; }
	if(d < 10)    { d = "0" + d; }

	var resultDate = y + "-" + m + "-" + d;
	return resultDate;
}

function thumbnailPlay(idx, token)
{
	$(".searchList").css("border", "2px solid #FFFFFF");
	$("div.timeline-event").removeClass("selectedItem");
	$("div[rectoken='" + token + "']div[name='timelineBar']").parent().parent().addClass("selectedItem");
	$("div[rectoken='" + token + "'].searchList").css("border", "2px solid #0054FF");

	recPlay(token, idx);
}

function reSearchEventBind()
{
	$("#preday").unbind().click(function(){
		var day = setCustomDay($("#searchDate").val(), -1);
		$("#searchDate").datepicker("setDate", day);
		onSelectDatePicker();
	});

	$("#nextday").unbind().click(function(){
		var day = setCustomDay($("#searchDate").val(), 1);
		$("#searchDate").datepicker("setDate", day);
		onSelectDatePicker();
	});

	$(".timeline-event").unbind().click(function(){
		var thisTimeline = $(this).children(".timeline-event-content").children('div[name="timelineBar"]');
		var recToken = thisTimeline.attr("rectoken");
		var recIndex = thisTimeline.attr("recindex");

		$(".searchList").css("border", "2px solid #FFFFFF");
		$("div[rectoken='" + recToken + "'].searchList").css("border", "2px solid #0054FF");
		$("div.timeline-event").removeClass("selectedItem");
		$("div[rectoken='" + recToken + "']div[name='timelineBar']").parent().parent().addClass("selectedItem");

		recPlay(recToken, recIndex);
	}).mouseover(function(){
		var thisTimeline = $(this).children(".timeline-event-content").children('div[name="timelineBar"]');
		var recToken = thisTimeline.attr("rectoken");
		var recIndex = thisTimeline.attr("recindex");
		var type = thisTimeline.attr("title");
		var hPos = -83;
		var imgWidth = 100;
		var imgHeight = 57;

		if(type == "face")
		{
			hPos = -127;
			imgHeight = 100;
		}

		var img = "<img width=" + imgWidth + " height="+imgHeight+" onerror=\"this.src='../images/defaultthumbnail.jpg'\" src=\"/nvc-cgi/admin/adrdownload.cgi?action=Download&amp;key=" + recToken + "&amp;type=thumbnail\">";
		xtooltip_show("timetooltip_"+recIndex, img, 0, hPos);
	}).mouseout( function() {
		xtooltip_hide("tooltip");
	});

	$(".searchList .image").unbind().click(function(){
		var parentSelect = $(this).parent();
		g_selectIndex = parentSelect.attr("recindex");
		g_searchToken = parentSelect.attr("rectoken");

		thumbnailPlay(g_selectIndex, g_searchToken);
	});

	$(".searchList .defaultPlay").unbind().click(function(){
		var parentSelect = $(this).parent().parent();
		g_selectIndex = parentSelect.attr("recindex");
		g_searchToken = parentSelect.attr("rectoken");

		thumbnailPlay(g_selectIndex, g_searchToken);
	});

	$(".searchList .recdownload").unbind().click(function(){
		if($(this).text() == "-") return;
		g_searchToken = $(this).parent().parent().attr("rectoken");
		Disable($(".download_contents").css("cursor", "progress"));

		$.fileDownload(g_adrdCmd_down + "&key=" + g_searchToken + "&timekey=" + (new Date()).getTime(), {
			successCallback: function (url) {
				Enable($(".download_contents").css("cursor", "pointer"));
			},
			failCallback: function (responseHtml, url) {
				Enable($(".download_contents").css("cursor", "pointer"));
				alert(GetMsgLang("03030226"));
			}
		});
	});

	$(".searchList .recdestooltip").unbind().mouseover(function(){
		var parentSelect = $(this).parent().parent();
		var index = parentSelect.attr("recindex");
		var msg = parentSelect.children("#description").html();
		var xPosition = -100;
		if(index*1%3 == 0)
			xPosition = -200;

		xtooltip_show("tooltip_"+index, msg, xPosition,0);
	}).mouseout( function() {
		xtooltip_hide("tooltip");
	});

	$(".pageNumberGroup span").unbind().click(function(){
		var curPage = $(this).text();
		if(Number(g_currentPageNumber) == curPage ||
			g_totalPageCount == 0)
			return;

		outputCurrentPage(curPage);
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
			curleft += obj.offsetLeft;
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
			curtop += obj.offsetTop;
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
		it.style.first = 0;
		it.style.width = it.offsetWidth + 'px';
		it.style.height = it.offsetHeight + 'px';
	}
	it.innerHTML = message;

	{
		var x = xstooltip_findPosX(_parent,0) + posX;
		var y = xstooltip_findPosY(_parent,1) + posY;
		it.style.top = y + 'px';
		it.style.left = x + 'px';
	}

	it.style.visibility = 'visible';
	$("#tooltip").show();
}


function xtooltip_hide()
{
	it = document.getElementById("tooltip");
	it.style.visibility = 'hidden';
}

function getDecriptionOfKeyword(keyword)
{
	var sz = "";
	var kid = "#" + keyword;
	sz += $(kid).text();
	return sz;
}


function reDateformat(date)
{
	var yyyy = date.split(" ")[0].split("-")[0];
	var mm = date.split(" ")[0].split("-")[1];
	var dd = date.split(" ")[0].split("-")[2];
	var hh = date.split(" ")[1].split(":")[0];
	var mn = date.split(" ")[1].split(":")[1];
	var ss = date.split(" ")[1].split(":")[2];

	return yyyy + mm + dd + hh + mn + ss;
}

function getPageNumFromPreClick(curNum)
{
	var outputPageNumber;
	var divQuotient = parseInt(curNum / 10);
	var divRemainder = parseInt(curNum % 10);

	if(divRemainder != 0)
		outputPageNumber = ((divQuotient-1)*10)+1;
	else if(divRemainder == 0)
		outputPageNumber = ((divQuotient-2)*10)+1;

	return outputPageNumber;
}

function getPageNumFromPostClick(curNum, totalPage)
{
	var outputPageNumber;
	var divQuotient = parseInt(curNum / 10);
	var divRemainder = parseInt(curNum % 10);

	if(divRemainder != 0)
		outputPageNumber = ((divQuotient+1)*10)+1;
	else if(divRemainder == 0)
		outputPageNumber = (divQuotient*10)+1;

	return outputPageNumber;
}

function mDChannelConvert(type)
{
	var zoneRet = "";
	var i = 0;
	var zoneValue = type.split(" ");

	for (i = 0; i < zoneValue.length; i++)
	{
		if (zoneRet == "")
			zoneRet = "zone" + eval(eval(zoneValue[i].charAt(zoneValue[i].length - 1)) + 1);
		else
			zoneRet += " zone" + eval(eval(zoneValue[i].charAt(zoneValue[i].length - 1)) + 1);
	}

	return zoneRet;
}

function vsignalChannelConvert(type)
{
	var vsignalRet = "";
	var lossdetect = "";

	if (type.indexOf(" ") != -1)
	{
		var i = 0;

		var channelValue = type.split(" ");
		for (i = 0; i < channelValue.length; i++)
		{
			if (channelValue[i].indexOf("Channel") != -1)
			{
				if (channelValue[i].substr(0,7) == "Channel")
				{
					if (vsignalRet == "")
						vsignalRet = "Channel" + eval(eval(channelValue[i].charAt(channelValue[i].length - 1)) + 1);
					else
						vsignalRet += " Channel" + eval(eval(channelValue[i].charAt(channelValue[i].length - 1)) + 1);
				}
			}
			else
				lossdetect = channelValue[i];
		}
	}
	vsignalRet = vsignalRet + " " + lossdetect;

	return vsignalRet;
}

function clickPlaybackBtn()
{
	var PlaybackSrc = "/storage/playback.html";
	var PlaybackParam = "scrollbars=yes,toolbar=0,location=no,directories=0,status=0,menubar=0,resizable=1,width=" + g_playbackPopupWidth + ",height=" + g_playbackPopupHeight;

	var PopupClose = function() {
		if(g_handlePlayback)
		{
			g_handlePlayback.close();
			g_handlePlayback = null;
		}
	}
	PopupClose();

	setCookie(g_cookieNameSearchToken, g_searchToken, g_cookieExdays);
	setCookie(g_cookieNameSelectIndex, g_selectIndex, g_cookieExdays);
	g_handlePlayback = window.open(PlaybackSrc, "Playback", PlaybackParam);
	if (g_handlePlayback.attachEvent) {
		g_handlePlayback.attachEvent('onload', function(){
			g_selectIndex = -1;
		});
	}
	else
	{
		g_handlePlayback.addEventListener('load', function(){
			g_selectIndex = -1;
		}, false);
	}

	g_handlePlayback.focus();
	if(document.all)
		window.attachEvent("onunload",PopupClose);
	else
		window.addEventListener("unload",PopupClose,false);
}


function setInfoOfRecTokenData(token)
{
	call_xmlData(g_adrdCmd_getMediaAttr + "&RecordingToken=" + token, false,
		function(xml) {
			//error check
			var ret = CGIResponseCheck(0, xml);
			if(ret != 0) {
				alert(GetMsgLang("0501") + "\n" + ret);
				g_playbackStatus = PLAYBACK_STATUS_ERROR;
				return;
			}

			g_width = $("MediaAttirubtes Width", xml).text();
			g_height = $("MediaAttirubtes Height", xml).text();
			g_samplespersec	= $("MediaAttirubtes AudioSamples", xml).text();
			g_bitspersample	= $("MediaAttirubtes AudioBits", xml).text();
		}
	)
}

function displayPauseButton(flag)
{
	if(flag)
	{
		jqDisplayCtrl(".startContents", false, "none");
		jqDisplayCtrl(".pauseContents", true, "inline-block");

	}
	else
	{
		jqDisplayCtrl(".startContents", true, "inline-block");
		jqDisplayCtrl(".pauseContents", false, "none");
	}
}

function playControlCursor(selectID, State)
{
	$(selectID).unbind().hover(function(){
		var cursorValue = "pointer";
		if(!isUseAbleControl(State))
			cursorValue = "no-drop";

		$(this).css("cursor", cursorValue);
	});
}

function playControlToolbar()
{
	$("#plyerctrl span#start").unbind().click(function() {
		if(!isUseAbleControl(PLAYBACKCTRL_START)) return;

		if(g_playbackStatus != PLAYBACK_STATUS_PAUSE)
		{
			g_player.setLoginInfo(PLAYER_UST, PLAYER_PST);
			g_player.play();
			g_player.showProgress(true);
			displayPauseButton(true);
		}
		else
		{
			g_player.resume();
			displayPauseButton(true);
		}
		g_playbackStatus = PLAYBACK_STATUS_PLAY;
	});
	playControlCursor("#plyerctrl span#start img", PLAYBACKCTRL_START);

	$("#plyerctrl span#pause").unbind().click(function() {
		g_player.pause();
		displayPauseButton(false);
		g_playbackStatus = PLAYBACK_STATUS_PAUSE;
	});

	$("#plyerctrl span#stop").unbind().click(function() {
		g_player.stop();
		displayPauseButton(false);
		if(g_playbackStatus == PLAYBACK_STATUS_PLAY)
			g_playbackStatus = PLAYBACK_STATUS_STOP;
	});
	playControlCursor("#plyerctrl span#stop img", PLAYBACKCTRL_STOP);

	$("#plyerctrl span#snapshot").unbind().click(function() {
		if(!isUseAbleControl(PLAYBACKCTRL_SNAPSHOT)) return;
		g_player.authElevate(getCurAddress(), getCurPort());
		g_authElevateState = "snapshot";
	});
	playControlCursor("#plyerctrl span#snapshot img", PLAYBACKCTRL_SNAPSHOT);

	$("#plyerctrl span#save").unbind().click(function() {
		if(!isUseAbleControl(PLAYBACKCTRL_SAVE)) return;
		g_player.authElevate(getCurAddress(), getCurPort());
		g_authElevateState = "save";
	});
	playControlCursor("#plyerctrl span#save img", PLAYBACKCTRL_SAVE);

	$("#plyerctrl span#fullscreen").unbind().click(function() {
		g_player.fullScreen(true);
	});
	playControlCursor("#plyerctrl span#fullscreen img", PLAYBACKCTRL_FULLSCREEN);

	$("#formAutoPlay").unbind().change(function() {
		g_autoPlayFlag = ($(this).attr("checked") == true ? 1 : 0);
		setCookie(g_cookieNameAutoPlayFlag, g_autoPlayFlag, g_cookieExdays);
	});

	$("#formMuteAudio").unbind().change(function() {
		var MuteAudioState = $(this).attr("checked");
		if(MuteAudioState == true)
			g_player.audioMute(true);
		else
			g_player.audioMute(false);
		setCookie(g_cookieNameMuteAudioFlag, (MuteAudioState == true) ? 1 : 0, g_cookieExdays);
	});
}

function getSession()
{
	var session = "";
	var trans = "UNICAST";

	if(g_dataArray["network_rtp_st0_unicast_enable"] == "yes" && g_dataArray["encoder_ch0_videocodec_st0_enable"] == "yes")
		trans = "UNICAST";
	else if(g_dataArray["network_rtp_st0_multicast_enable"] == "yes" && g_dataArray["encoder_ch0_videocodec_st0_enable"] == "yes")
		trans = "MULTICAST";
	else if(g_dataArray["network_rtp_st1_unicast_enable"] == "yes" && g_dataArray["encoder_ch0_videocodec_st1_enable"] == "yes")
		trans = "UNICAST";
	else if(g_dataArray["network_rtp_st1_multicast_enable"] == "yes" && g_dataArray["encoder_ch0_videocodec_st1_enable"] == "yes")
		trans = "MULTICAST";

	if(trans == "MULTICAST")
		session = "multicast";
	else if(trans == "UNICAST")
		session = "tcp";

	return session;
}

function convertFiletime2Unixtime(ft)
{
	var epochDiff = 116444736000000000;
	var rateDiff = 10000000;

	return parseInt((ft - epochDiff) / rateDiff);
}

function snapshotActiveXPlayer()
{
	var localTime = new Date();
	var localTime_year = localTime.getFullYear();
	var localTime_month = localTime.getMonth()+1;
	if(localTime_month < 10)
		localTime_month = ("0" + localTime_month);

	var localTime_date = localTime.getDate();
	if(localTime_date < 10)
		localTime_date = ("0" + localTime_date);

	var localTime_hours = localTime.getHours();
	if(localTime_hours < 10)
		localTime_hours = ("0" + localTime_hours);

	var localTime_minutes = localTime.getMinutes();
	if(localTime_minutes < 10)
		localTime_minutes = ("0" + localTime_minutes);

	var localTime_seconds = localTime.getSeconds();
	if(localTime_seconds < 10)
		localTime_seconds = ("0" + localTime_seconds);

	var filename = "PLAYBACKSNAPSHOT_" +
					localTime_year + localTime_month + localTime_date + "_" +
					localTime_hours + "-" + localTime_minutes + "-" + localTime_seconds +
					".jpg";
	g_player.snapshot(filename);
}

function saveActiveXPlayer()
{
	var fps = 30;
	var gop = 30;
	var ruleTime = $("div[recindex='"+g_eventNo+"'].searchList div.ruleTime").text();
	var tempRuleTimeString = ruleTime.split(" ");
	var tempDate = tempRuleTimeString[0].split("-");
	var tempTime = tempRuleTimeString[1].split(":");
	var filename = "PLAYBACK_" + tempDate[0] + tempDate[1] + tempDate[2] + "_" + tempTime[0] + "-" + tempTime[1] + "-" + tempTime[2] + ".avi";
	var audio = 1;
	var caption = 0;
	var sync = 0;
	var url = g_streamURL + "&speed=4.0";
	var session = getSession();

	if(g_samplespersec == -1 || g_bitspersample == -1)
	{
		audio = 0;
		g_samplespersec = 0;
		g_bitspersample = 0;
	}

	var szMsg = "fps:" + fps + ",gop:" + gop + ",filename:" + filename + ",audio:" + audio + ",samplespersec:" + g_samplespersec + ",bitspersample:" + g_bitspersample +",caption:" + caption
	+ ",sync:" + sync + ",url:" + url + ",session:" + session + ",port:" + g_dataArray["network_rtsp_port"] + ",width:" + g_width + ",height:" + g_height + ",id:" + PLAYER_UST + ",pw:" + PLAYER_PST;
	g_player.save(szMsg);
}

function setRecordingContents(state, percent)
{
	if(state == REC_STATUS_STOP)
	{
		$("#recordingStatusMsg").text("Stop recording.");
		g_recordingState = false;
		return 0;
	}

	var statusText = "";
	var recordingState = false;
	switch(state)
	{
		case REC_STATUS_START :
		case REC_STATUS_RECORDING :
			statusText = "Recording...";
			recordingState = true;
			break;
		case REC_STATUS_COMPLETE :
			statusText = "Complete.";
			recordingState = false;
			break;
	}

	if((percent >=0) && (percent <= 100))
	{
		g_recordingPercent = percent;

		$("#image-progress").progression({
			Current: percent,
			Maximum: 100,
			Animate: (percent == 0) ? false : true,
			aBackground: "#A9D7E9",
			endFct: function() {
				if(g_recordingState == true || percent == 0)
				{
					g_recordingState = recordingState;
					$("#recordingStatusMsg").text(statusText);
				}
			}
		});
	}
}

function deleteRecordingContents()
{
	$("#recordingStatus_contents").css("display", "none");
	$("#image-progress").empty();
}

function isUseAbleControl(control)
{
	var ret = true;
	if(g_playbackStatus == PLAYBACK_STATUS_WAIT || g_playbackStatus == PLAYBACK_STATUS_ERROR)
	{
		ret = false;
	}
	else
	{
		switch(control)
		{
			case PLAYBACKCTRL_START:
				if(g_playbackStatus == PLAYBACK_STATUS_PLAY) ret = false;
				break;
			case PLAYBACKCTRL_PAUSE:
				if(g_playbackStatus == PLAYBACK_STATUS_PAUSE || g_playbackStatus == PLAYBACK_STATUS_STOP)
					ret = false;
				break;
			case PLAYBACKCTRL_STOP:
			case PLAYBACKCTRL_SNAPSHOT:
			case PLAYBACKCTRL_FULLSCREEN:
				if(g_playbackStatus == PLAYBACK_STATUS_STOP) ret = false;
				break;
			case PLAYBACKCTRL_SAVE:
				if(g_playbackStatus == PLAYBACK_STATUS_STOP || g_recordingState == true)
					ret = false;
				break;
		}
	}
	return ret;
}

function outputTime()
{
	var d = new Date();
	var m = d.getMinutes();
	var s = d.getSeconds();

	return m+":"+s;
}

function initBrand()
{
	jqDisplayCtrl(".diContents", parent.g_brand.diCount != "0", "inline-block");
	jqDisplayCtrl(".doContents", parent.g_brand.doCount != "0", "inline-block");
	jqDisplayCtrl(".pirContents", parent.g_brand.pir != "0", "inline-block");
	jqDisplayCtrl("#playbackconfig", browserCheck() == "msie", "block");
	jqDisplayCtrl(".audioContents", ($("#playbackconfig").css("display") == "none" || parent.g_brand.audioInOut != "0/0"), "inline-block");
	$("#formEventTypeAll").attr("checked", "checked");
	$(".noAll").attr("checked", "checked");

	if("rs51c0b" == parent.g_brand.imgDevice ||
		"mdc200s" == parent.g_brand.imgDevice ||
		"mdc600s" == parent.g_brand.imgDevice)
	{
		$(".motionContents, .faceContents").css("display","none");
	}

	if(parent.g_support.tamarisk || "dm368" == parent.g_brand.soctype || parent.g_brand.lensType == "fisheye")
	{
		$(".faceContents").css("display","none");
	}
}

function activexEvent(type, value)
{
	if(type == "RTSP_STATUS")
	{
		var resVal = value.split(":");
		if(resVal[0] == "ENDOFSTREAM" || resVal[0] == "RECONNECTING")
		{
			if(g_recordingState == false)
			{
				g_playbackStatus = PLAYBACK_STATUS_STOP;
				displayPauseButton(false);

				if(g_autoPlayFlag == 1 && g_eventNo != 0)
				{
					g_eventNo -= 1;
					if(g_eventNo != 0)
					{
						var nextToken = $("div[name='timelineBar'][recindex='" + g_eventNo + "']").attr("rectoken");
						thumbnailPlay(g_eventNo, nextToken);
					}
				}
			}
		}
	}
	else if(type == "AUTH_ELEVATE")
	{
		if(value == "ALREADY_ELEVATED")
		{
			if(g_authElevateState == "snapshot")
			{
				snapshotActiveXPlayer();
			}
			else if(g_authElevateState == "save")
			{
				saveActiveXPlayer();
			}
		}
	}
	else if(type == "PLAYBACK_STATUS")
	{
		var resVal = value.split(":");
		if(resVal[0] == "RUNNING")
		{
			if(g_recordingPercent < MAX_RECORDING_RUNNING_PERCENT)
			{
				setRecordingContents(REC_STATUS_RECORDING, (g_recordingPercent + 10));
			}
		}
		else if(resVal[0] == "ENDOFSTREAM")
		{
			setRecordingContents(REC_STATUS_RECORDING, MAX_RECORDING_ENDSTREAM_PERCENT);
		}
		else if(resVal[0] == "AVI_MAKE_START")
		{
			$("#recordingStatus_contents").css("display", "block");
			ResizePage();
			setRecordingContents(REC_STATUS_START, 0);
		}
		else if(resVal[0] == "AVI_MAKE_END")
		{
			setRecordingContents(REC_STATUS_COMPLETE, MAX_RECORDING_MAKEEND_PERCENT);
			deleteRecordingContents();
		}
	}
}
