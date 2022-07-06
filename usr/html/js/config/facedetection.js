var g_width = 608;
var g_height = 342;
var g_vcaEnableFlag = false;
var g_textRangeCheckID = "04020159";
var snapshot_url = "/uapi-cgi/snapshot.fcgi";
var snapshot_play = false;

var s_maxSizeW = 10000;
var s_maxSizeH = 10000;

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
	var classNum = [g_textRangeCheckID, "04031316", "0501"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "facedetection", 
				parent.g_langData[parent.g_configData.language]);
}

function initConfig()
{
	call_xmlData("/uapi-cgi/param.cgi?action=list&group=VCA.Ch0.enable&xmlschema", false, function(xml){
		if($('Ch0 > enable', xml).size() > 0)
			g_vcaEnableFlag = $('Ch0 > enable', xml).text().toLowerCase() == 'yes' ? true : false;
	});

	getDataConfig_UAPI("FD&NETWORK&ENCODER&EVENTPROFILE&VIDEOIN", function(data){
		initDataValue(data);
		initSetting();
		mainRun(data);
	});
}

function mainRun(data)
{
	var changeWidthHeight = adjustRatioWidthHeight(g_dataArray["videoin_ch0_cmos_ratio"], g_height);
	g_width = changeWidthHeight[0];
	g_height = changeWidthHeight[1];
	ContentShow();
	jqDisplayCtrl("#videoStab", parent.g_support.stabilization == true);
	if(startVideo())
	{
		setTimeout(function(){
			$("button").button();
			initSetting();
			eventBind();
			ViewLoadingSave(false);
		}, 50);
	}

        if(window.ActiveXObject == undefined)
        {
                $("button").button();
                initSetting();
                eventBind();
        }
	ResizePage();
	PostCustomize();
}

function calcPos(x, y, w, h)
{
	var ratio = g_dataArray["videoin_ch0_cmos_ratio"].split(",")[0].split(":");
        var virtualW = w * ratio[0];

        var virtualMaxW = s_maxSizeW * ratio[0];
        var virtualMaxH = s_maxSizeH * ratio[1];

        var virtualY = y * ratio[1];


        var virtualH = virtualW * 3 / 5;
        //virtualW = virtualH * 5 / 3;

        if(virtualH + virtualY > virtualMaxH)
        {
            virtualH = virtualMaxH;
            virtualW = virtualH * 5 / 3;
        }
        

        var realW = Math.round(virtualW / ratio[0]);
        var realH = Math.round(virtualH / ratio[1]);

        var realPosition = new Array();
        realPosition = [x, y, (x*1) + realW, (y*1) + realH];

        return realPosition;
}

function setSliderBar(selector, minRange, maxRange, slideFunc)
{
	$(selector).each(function(index, element) {
		var $obj = $(this).parent().parent().find("input[type='text']");
		$(this).slider({
			range: "min",
			min: minRange,
			max: maxRange,
			slide: function(event, ui) {
				$obj.val(ui.value);
				if (slideFunc)
				{
					slideFunc(event, ui);
				}
			}
		})
	});
}

function setTextSliderValue(selector, dbValue)
{
	$(selector).val(dbValue).parent().parent().find(".slider-bar").slider("value", dbValue);
}

function setTextBlur(selector, minRange, maxRange, setValue, langClassID)
{
	$(selector).blur(function() {
		var nowValue = $(selector).val()-0;
		if(minRange == 0 && nowValue == 0) return;
		if(nowValue < minRange || nowValue > maxRange || nowValue == "" || (!checkStringValidation($(selector).val(), g_defregexp.numberOnly, null, null, false)))
		{
			$(selector).val(setValue).focus();
			$(selector).parent().parent().find(".slider-bar").slider("value", setValue);
			alert(GetMsgLang(langClassID));
		}
	});
}

function syncTextBoxSliderBar(selector)
{
	$(selector).keyup(function() {
		$(selector).parent().parent().find(".slider-bar").slider("value", $(selector).val());
	});
}

function checkTextLimit(selector, minRange, maxRange)
{
	if($(selector).val() < minRange || $(selector).val() > maxRange || $(selector).val() == "")
	{
		return false;
	}
	return true;
}

function initSetting()
{
	AxUMF_areaInit();
	AxUMF_areaMouseRButtonDeleteRequest();
	AxUMF_areaMouseRButtonNone();
	AxUMF_areaClear();
	
	if(g_vcaEnableFlag 
	|| g_dataArray["videoin_ch0_vs_st0"] == "yes"
	|| g_dataArray["videoin_ch0_vs_st1"] == "yes" 
	|| g_dataArray["videoin_ch0_vs_snapshot"] == "yes"
	|| g_dataArray["videoin_ch0_rotate_direction"] != "none")
	{
		Disable($("#mdChannelEnable:checkbox"));
	}

	$("#users tbody").html("");
	$("#mdChannelEnable:checkbox").attr("checked", g_dataArray["fd_ch0_enable"] == "yes" ? "checked" : "");
	$("#osdEnable:checkbox").attr("checked", g_dataArray["fd_ch0_osd_enable"] == "yes" ? "checked" : "");

	if($("#mdChannelEnable:checkbox").attr("checked") != true)
	{
		$("#formFdConfSubSensor").css('display', 'none');
		Disable($("#osdEnable:checkbox"));
		Disable($("#formFdOsdSt0Enable:checkbox"));
		Disable($("#formFdOsdSt1Enable:checkbox"));
		Disable($("#formFdOsdSnapshotEnable:checkbox"));
		Disable($("#formFdOsdZoneEnable:checkbox"));
	}
	else
	{
		$("#formFdConfSubSensor").css('display', 'block');
	}

	if($("#osdEnable:checkbox").attr("checked") == true || $("#formFdOsdZoneEnable:checkbox").attr("checked") == true)
	{
		Enable($("#formFdOsdSt0Enable:checkbox"));
		Enable($("#formFdOsdSt1Enable:checkbox"));
		Enable($("#formFdOsdSnapshotEnable:checkbox"));
	}
	else
	{
		Disable($("#formFdOsdSt0Enable:checkbox"));
		Disable($("#formFdOsdSt1Enable:checkbox"));
		Disable($("#formFdOsdSnapshotEnable:checkbox"));
	}

	var posVal = g_dataArray["fd_ch0_da0_position"].split(",");
	var pos = calcPos(posVal[0], posVal[1], posVal[2], posVal[3]);
	var addOption = "ADD,0," + pos[0] + "," + pos[1] + "," + pos[2] + "," + pos[3];
	AxUMF_areaAdd(addOption);
	AxUMF_areaSelectHide(0);

	$("#users tbody").append("<tr id='listID_0'></tr>").find("tr").last()
					.append("<td><input type='checkbox'></input></td>")
					.append("<td>" + "0" + eval(1) + "</td>")
					.append("<td><input type='text' style='width:90px;'></input></td>")
					.append("<td><input type='text' style='width:220px;'></input></td>");
	ResizePage();

	if(g_dataArray["fd_ch0_da0_enable"] == "yes")
	{
		AxUMF_areaSelectShow(0);
		$("#listID_0 input[type='checkbox']").attr("checked", "checked");
	}

	$("#users tbody tr#listID_0 td:eq(2) input:text").val(g_dataArray["fd_ch0_da0_name"]);
	$("#users tbody tr#listID_0 td:eq(3) input:text").val(g_dataArray["fd_ch0_da0_description"]);

	setSliderBar("#fdConfidenceSlider", 0, 255);
	setTextSliderValue($("#formFdConfidence:text"), g_dataArray["fd_ch0_confidence"]);
	$("#formFdOsdSt0Enable:checkbox").attr("checked", (g_dataArray["fd_ch0_osd_st0"] == "yes") ? "checked" : "");
	$("#formFdOsdSt1Enable:checkbox").attr("checked", (g_dataArray["fd_ch0_osd_st1"] == "yes") ? "checked" : "");
	$("#formFdOsdSnapshotEnable:checkbox").attr("checked", (g_dataArray["fd_ch0_osd_snapshot"] == "yes") ? "checked" : "");
	$("#formFdOsdZoneEnable:checkbox").attr("checked", (g_dataArray["fd_ch0_osd_zone"] == "yes") ? "checked" : "");
}



function eventBind()
{
	for(var i=0;i<g_dataArray["fd_ch0_nbrofzone"];i++)
	{
		limitMaxString("#users tbody tr:eq(" + i +") td:eq(2) input:text", 32);
		limitMaxString("#users tbody tr:eq(" + i +") td:eq(3) input:text", 100);
	}

	$("#formFdConfidence:text").numeric();
	setTextBlur("#formFdConfidence:text", 0, 255,  g_dataArray["fd_ch0_confidence"], g_textRangeCheckID);
	syncTextBoxSliderBar("#formFdConfidence:text");

	$("#mdChannelEnable:checkbox").unbind().change(function() {
		var idx = 0;
		var profileList;
		var sameCheckFlag = false;

		if(g_dataArray["eventprofile_nbrofcount"] > 0)
			profileList = g_dataArray["eventprofile_list"].split(",");

		if($(this).attr("checked") == true)
		{
			$("#formFdConfSubSensor").css('display', 'block');
			Enable($("#osdEnable:checkbox"));
			Enable($("#formFdOsdZoneEnable:checkbox"));
			if($("#osdEnable:checkbox").attr("checked") == true || $("#formFdOsdZoneEnable:checkbox").attr("checked") == true)
			{
				Enable($("#formFdOsdSt0Enable:checkbox"));
				Enable($("#formFdOsdSt1Enable:checkbox"));
				Enable($("#formFdOsdSnapshotEnable:checkbox"));
			}
			AxUMF_areaSelectShow(idx);
		}
		else
		{
			$("#formFdConfSubSensor").css('display', 'none');
			Disable($("#osdEnable:checkbox"));
			Disable($("#formFdOsdSt0Enable:checkbox"));
			Disable($("#formFdOsdSt1Enable:checkbox"));
			Disable($("#formFdOsdSnapshotEnable:checkbox"));
			Disable($("#formFdOsdZoneEnable:checkbox"));
			for(var i = 0; i < g_dataArray["eventprofile_nbrofcount"]; i++)
			{
				var enableList = g_dataArray["eventprofile_p" + profileList[i] + "_source_face_enablelist"].split(",");
				for(var j = 0; j < enableList.length; j++)
				{
					if(enableList[j] == idx)
						sameCheckFlag = true;
				}
			}
			
			if(sameCheckFlag)
				alert(GetMsgLang("04031316"));

			AxUMF_areaSelectHide(idx);
		}
		ResizePage();
	});

	$("#osdEnable:checkbox").unbind().change(function() {
		if($("#osdEnable:checkbox").attr("checked") == true || $("#formFdOsdZoneEnable:checkbox").attr("checked") == true)
		{
			Enable($("#formFdOsdSt0Enable:checkbox"));
			Enable($("#formFdOsdSt1Enable:checkbox"));
			Enable($("#formFdOsdSnapshotEnable:checkbox"));
		}
		else
		{
			Disable($("#formFdOsdSt0Enable:checkbox"));
			Disable($("#formFdOsdSt1Enable:checkbox"));
			Disable($("#formFdOsdSnapshotEnable:checkbox"));
		}
		ResizePage();
	});

	$("#formFdOsdZoneEnable:checkbox").unbind().change(function() {
		if($("#osdEnable:checkbox").attr("checked") == true || $("#formFdOsdZoneEnable:checkbox").attr("checked") == true)
		{
			Enable($("#formFdOsdSt0Enable:checkbox"));
			Enable($("#formFdOsdSt1Enable:checkbox"));
			Enable($("#formFdOsdSnapshotEnable:checkbox"));
		}
		else
		{
			Disable($("#formFdOsdSt0Enable:checkbox"));
			Disable($("#formFdOsdSt1Enable:checkbox"));
			Disable($("#formFdOsdSnapshotEnable:checkbox"));
		}
		ResizePage();
	});
	
	$("#users tbody tr").unbind().click(function(){
		var idx = $(this).attr('id').split('_')[1];
		if(g_dataArray["fd_ch0_da" + idx + "_enable"] == "yes")
			AxUMF_areaSelect(idx);

		$("#users tbody tr").not("#users tbody tr#listID_" + idx).css('background-color', '#FFFFFF');
		$("#users tbody tr input[type='text']").css('background-color', '#FFFFFF');
		$("#users tbody tr#listID_" + idx).css('background-color', '#FFEBD8');
		$("#users tbody tr#listID_" + idx + " input[type='text']").css('background-color', '#FFEBD8');
	});

	$("#btnApply").unbind().click(function(){
		if(!checkTextLimit("#formFdConfidence:text", 0, 255)) return;
		if(window.ActiveXObject !== undefined)
		{
			AxUMF_areaList();
		}
		else
		{
			var daPosition = g_dataArray["fd_ch0_da0_position"].split(",");
			var pos = calcPos(daPosition[0], daPosition[1], daPosition[2], daPosition[3]);
			var posVal = "";
			for(var i = 0, index = 0; i<1; i++)
			{
				posVal += "da" + i + ",";
				posVal += pos;
				posVal += ";";
		    }
		    setArea(posVal);
		}
		
	});

	$(".linkVCA").click(function(){
		parent.$("#leftmenu .vcaContents + div a[href='vcaenabledisable.html']").click();
		parent.$("#vcaMenuHeader").click();
	});

	$(".linkStabilization").click(function(){
		var cameraLinkNode = "#Camera_Contents";
		if(parent.g_brand.cameraClass == "encoder") cameraLinkNode = "#Videoin_Contents";
		parent.$("#leftmenu " + cameraLinkNode + " a[href='camera.html']").click();
		parent.$("#videoAudioMenuHeader").click();
	});
}

function setArea(addOption)
{
	var optionList = addOption.split(";");
	var reqQString = "action=update&xmlschema";
	var fdEnableList = "";
	var isEnableChange = false;
	var isZoneChange = false;

	var chEnableValue = $("#mdChannelEnable:checkbox").attr("checked") == true ? "yes" : "no";
	if(g_dataArray["fd_ch0_enable"] != chEnableValue)
	{
		reqQString += "&FD.Ch0.enable=" + chEnableValue;
		isEnableChange = true;
	}

	var chConfidenceValue = g_dataArray["fd_ch0_confidence"];
	var formConfidenceValue = $("#formFdConfidence:text").val();
	if(chConfidenceValue != formConfidenceValue)
	{
		reqQString += "&FD.Ch0.confidence=" + formConfidenceValue;
		isEnableChange = true;
	}

	var chOsdEnableValue = $("#osdEnable:checkbox").attr("checked") == true ? "yes" : "no";
	if(g_dataArray["fd_ch0_osd_enable"] != chOsdEnableValue)
	{
		reqQString += "&FD.Ch0.osd.enable=" + chOsdEnableValue;
		isEnableChange = true;
	}

	var chOsdSt0EnableValue = $("#formFdOsdSt0Enable:checkbox").attr("checked") == true ? "yes" : "no";
	if(g_dataArray["fd_ch0_osd_st0"] != chOsdSt0EnableValue)
	{
		reqQString += "&FD.Ch0.osd.st0=" + chOsdSt0EnableValue;
		isEnableChange = true;
	}

	var chOsdSt1EnableValue = $("#formFdOsdSt1Enable:checkbox").attr("checked") == true ? "yes" : "no";
	if(g_dataArray["fd_ch0_osd_st1"] != chOsdSt1EnableValue)
	{
		reqQString += "&FD.Ch0.osd.st1=" + chOsdSt1EnableValue;
		isEnableChange = true;
	}

	var chOsdSnapEnableValue = $("#formFdOsdSnapshotEnable:checkbox").attr("checked") == true ? "yes" : "no";
	if(g_dataArray["fd_ch0_osd_snapshot"] != chOsdSnapEnableValue)
	{
		reqQString += "&FD.Ch0.osd.snapshot=" + chOsdSnapEnableValue;
		isEnableChange = true;
	}

	var chOsdZoneEnableValue = $("#formFdOsdZoneEnable:checkbox").attr("checked") == true ? "yes" : "no";
	if(g_dataArray["fd_ch0_osd_zone"] != chOsdZoneEnableValue)
	{
		reqQString += "&FD.Ch0.osd.zone=" + chOsdZoneEnableValue;
		isEnableChange = true;
	}

	for(var i=0; i<1; i++)
	{
		var dbEnableValue = g_dataArray["fd_ch0_da" + i + "_enable"];
		var formEnabelValue = ($("#listID_" + i + " input[type='checkbox']").attr("checked") == true ? "yes" : "no");

		/*if(dbEnableValue != formEnabelValue)
		{
			reqQString += "&FD.Ch0.Da" + i + ".enable=" + formEnabelValue;
			isEnableChange = true;
		}*/
		if(chEnableValue != dbEnableValue){
				reqQString += "&FD.Ch0.Da0.enable=" + chEnableValue;
				isEnableChange = true;
		}

		var listId;
		
		if(optionList !== undefined){
			listId = optionList[i].split(",");
		}
		if(g_dataArray["fd_ch0_da" + i + "_name"] != $("#users tbody tr#listID_" + i + " td:eq(2) input:text").val())
		{
			reqQString += "&FD.Ch0.Da" + i + ".name=" + encodeURIComponent($("#users tbody tr#listID_" + i + " td:eq(2) input:text").val());
		}

		if(g_dataArray["fd_ch0_da" + i + "_description"] != $("#users tbody tr#listID_" + i + " td:eq(3) input:text").val())
		{
			reqQString += "&FD.Ch0.Da" + i + ".description=" + encodeURIComponent($("#users tbody tr#listID_" + i + " td:eq(3) input:text").val());
		}
			
		if(g_dataArray["fd_ch0_da" + i + "_position"] != (listId[1] + "," + listId[2] + "," + (listId[3]-listId[1]) + "," + listId[4]))
		{
			isZoneChange = true;
			reqQString += "&FD.Ch0.Da" + i + ".position=" + listId[1] + "," + listId[2] + "," + (listId[3]-listId[1]) + "," + listId[4];
		}

		if(formEnabelValue == "yes")
			fdEnableList += (fdEnableList == "" ? i : ("," + i));
	}

	if(isEnableChange)
		reqQString += makeQueryEventRuleList(fdEnableList);

	if(g_vcaEnableFlag && chEnableValue == "yes")
		return;

	if(reqQString == "action=update&xmlschema") return;

	var req = new CGIRequest();
	req.SetStartFunc(ViewLoadingSave);
	req.SetCallBackFunc(function(xml){
		getDataConfig_UAPI("FD&NETWORK&ENCODER&EVENTPROFILE&VIDEOIN", function(data){
			var ret = CGIResponseCheck(0, xml);
			if(ret != 0) {
				var errormessage = "";
				if(ret != -2) {
					errormessage = "\n" + ret;
				}
				alert(GetMsgLang("0501") + errormessage);
			}
			ViewLoadingSave(false);
			initDataValue(data);
		});
	});
	req.SetType("POST");
	req.Request(reqQString);
        //for BIA reload
        if(isZoneChange == true || isEnableChange == true)
            window.location.reload(true);
}

function makeQueryEventRuleList(fdEnableList)
{
	var retQuery = "";
	var profileList;

	if(g_dataArray["eventprofile_nbrofcount"] > 0)
		profileList = g_dataArray["eventprofile_list"].split(",");

	for(var i = 0; i < g_dataArray["eventprofile_nbrofcount"]; i++)
	{
		var enableList = g_dataArray["eventprofile_p" + profileList[i] + "_source_face_enablelist"].split(",");
		retQuery += "&EVENTPROFILE.P" + profileList[i] + ".Source.Face.enablelist=";

		var resultMotionList = "";
		var useZoneLoad = fdEnableList.split(",");
		for(var j=0; j<useZoneLoad.length; j++)
		{
			for(var k=0; k<enableList.length; k++)
			{			
				if(useZoneLoad[j] == enableList[k])
					resultMotionList += (resultMotionList == "" ? useZoneLoad[j] : ("," + useZoneLoad[j]));
			}
		}
		retQuery += resultMotionList;
	}

	return retQuery;
}

function setRotateSize()
{
	switch(g_dataArray["videoin_ch0_rotate_direction"])
	{
		case "left":
		case "right":
			var result = ExchangeValues(g_width, g_height);
			g_width = result.value1;
			g_height = result.value2;
			break;
		case "none":
			break;
	}
}

function startVideo()
{
	setRotateSize();
	var streamNum = 0;
	var trans = "unicast";
	var streamUri = "rtsp://" + document.domain + ":" + g_dataArray["network_rtsp_port"] + "/";
	var firstStreamEnable = g_dataArray["encoder_ch0_videocodec_st0_enable"];
	var secondStreamEnable = g_dataArray["encoder_ch0_videocodec_st1_enable"];

	if(g_dataArray["network_rtp_st0_unicast_enable"] == "yes" && firstStreamEnable == "yes")
	{
		streamNum = 0;
		trans = "unicast";
	}
	else if(g_dataArray["network_rtp_st0_multicast_enable"] == "yes" && firstStreamEnable == "yes")
	{
		streamNum = 0;
		trans = "multicast";
	}
	else if(g_dataArray["network_rtp_st1_unicast_enable"] == "yes" && secondStreamEnable == "yes")
	{
		streamNum = 1;
		trans = "unicast";
	}
	else if(g_dataArray["network_rtp_st1_multicast_enable"] == "yes" && secondStreamEnable == "yes")
	{
		streamNum = 1;
		trans = "multicast";
	}

	streamUri += g_dataArray["network_rtp_st" + streamNum + "_" + trans + "_name"];
	if(window.ActiveXObject !== undefined)
	{
		AxUMF_create(g_width, g_height, startSnapshot,AxUMF_audioOff, activeX_Event, null);
		$(".ratioMsg").css("display", "inline");
	}
	else
	{
		switch($.browser.name)
		{
			case "chrome":
			case "safari":
			case "firefox":
			case "opera":
			default:
				$(".noIEMsg").css("display", "inline");
				$(".noIEContents").css("display", "none");
				if(NETWORK_SRTP_ENABLE == "yes")
				{
					StartSnapshot();
				}
				else
				{
					if(qtime_start(streamUri, g_width, g_height) == false) 
						return false;
				}
				break;
		}
	}
	return true;
}
function StartSnapshot()
{
	$("#screen").empty();
	$("#screen").append("<img>").find("img:last").attr("id", "snapshotArea");
	$("#snapshotArea").attr({
		width: g_width,
		height: g_height
	});
	snapshot_play = true;
	
	$("#snapshotArea").hide();
	reflashImage();
}

var flag = false;
function reflashImage() {
	loadImage = function() {
		if(snapshot_play === false) {
			return;
		}
		$("#snapshotArea").attr("src", ImageBuf.src);
		$("#snapshotArea").show();
		if(flag == false)
		{
			ResizePage();
			flag = true;
		}
		
		setTimeout(function() {
			ImageBuf.src = snapshot_url + "?_=" + (new Date()).getTime();
		}, 200);
	}
	var ImageBuf = new Image();
	$(ImageBuf).load(loadImage);
	$(ImageBuf).error(function() {
		setTimeout(function() {
			ImageBuf.src = snapshot_url + "?_=" + (new Date()).getTime();
			}, 1000);
	});
	ImageBuf.src = snapshot_url;
}
