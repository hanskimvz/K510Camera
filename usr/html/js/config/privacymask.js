var DefaultGroup = "PRIVACYZONE";
var nSelectedIDX = 0;
var rtspPort = "";
var nSavingIDX = 0;
var zoneList = "";
var nAddCnt = 0;
var szValue = "";
var actStart = 0;
var actIndex = [];
var snapshot_play = false;
var snapshot_url = "/uapi-cgi/snapshot.fcgi";
var Width = 608;
var Height = 342;

$(function () {
	PreCustomize();
	initEnvironment();
	initBrand();
	LoadParamJs("PRIVACYZONE&NETWORK&ENCODER&EVENTPROFILE&VIDEOIN", Run);
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum = ["04020711", "0501"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "privacymask", 
				parent.g_langData[parent.g_configData.language]);
}

function Run()
{ 
	var changeWidthHeight = adjustRatioWidthHeight(VIDEOIN_CH0_CMOS_RATIO, Height);
	Width = changeWidthHeight[0];
	Height = changeWidthHeight[1];
	EventBind();
	ContentShow();
	Load();
	PostCustomize();
}

function Load()
{
	if (StartVideo() == true)
	{
		setTimeout( function() {
			PrivacyOn();
			PrivacyMouseRButtonDeleteRequest();
			PrivacyMouseLButtonNone();
			PrivacyMouseRButtonNone();
			InitSetting();
			SetRelation();
			ViewLoadingSave(false);
		}, 50);
	}
	ResizePage();
}

function StartVideo()
{
	SetRotateSize();

	// stream Name select
	var streamNum = 0;
	var trans = "UNICAST";
	var rtspPort = NETWORK_RTSP_PORT;
	var streamUri = "rtsp://" + document.domain + ":" + rtspPort + "/";
	var firstStreamEnable = eval("ENCODER_CH0_VIDEOCODEC_ST0_ENABLE");
	var secondStreamEnable = eval("ENCODER_CH0_VIDEOCODEC_ST1_ENABLE");

	if(eval("NETWORK_RTP_ST0_UNICAST_ENABLE") == "yes" && firstStreamEnable == "yes")
	{
		streamNum = 0;
		trans = "UNICAST";
	}
	else if(eval("NETWORK_RTP_ST0_MULTICAST_ENABLE") == "yes" && firstStreamEnable == "yes")
	{
		streamNum = 0;
		trans = "MULTICAST";
	}
	else if(eval("NETWORK_RTP_ST1_UNICAST_ENABLE") == "yes" && secondStreamEnable == "yes")
	{
		streamNum = 1;
		trans = "UNICAST";
	}
	else if(eval("NETWORK_RTP_ST1_MULTICAST_ENABLE") == "yes" && secondStreamEnable == "yes")
	{
		streamNum = 1;
		trans = "MULTICAST";
	}
	streamUri += eval("NETWORK_RTP_ST" + streamNum + "_" + trans + "_NAME");

	snapshot_play = false;

	if (browserCheck() == "msie")
	{
		AxUMF_create(Width,
									 Height,
									 StartSnapshot,
									 function () {
										 AxUMF.SetParam("CONTROL", "AUDIO", "OFF");
									 }, 
									 PrivacyMask_ActiveX_Event,
									null);
	}
	else
	{
		$(".noIEMsg").css("display", "inline");
		$(".noIEContents").css("display", "none");
		if(NETWORK_SRTP_ENABLE == "yes")
		{
			StartSnapshot();
		}
		else
		{
			if(qtime_start(streamUri, Width, Height) == false) 
				return false;
		}
	}
	return true;
}

/* Privacy Mask */
function PrivacyOn()
{
	if(AxUMF !== undefined)
	{
		AxUMF.SetParam("CONTROL", "PRIVACYZONE", "ON");
	}
}
function PrivacyMouseLButtonAdd()
{
	if(AxUMF !== undefined)
	{
		AxUMF.SetParam("CONTROL", "PRIVACYZONEAREA", "PRIVACYZONE_SET_MLBUTTON_ACTION,PRIVACYZONE_ADD");
	}
}
function PrivacyMouseLButtonNone()
{
	if(AxUMF !== undefined)
	{
		AxUMF.SetParam("CONTROL", "PRIVACYZONEAREA", "PRIVACYZONE_SET_MLBUTTON_ACTION,PRIVACYZONE_NONE");
	}
}
function PrivacyMouseRButtonNone()
{
	if(AxUMF !== undefined)
	{
		AxUMF.SetParam("CONTROL", "PRIVACYZONEAREA", "PRIVACYZONE_SET_MRBUTTON_ACTION,PRIVACYZONE_NONE");
	}
}
function PrivacyMouseRButtonDeleteRequest()
{
	if(AxUMF !== undefined)
	{
		AxUMF.SetParam("CONTROL", "PRIVACYZONEAREA", "PRIVACYZONE_SET_MRBUTTON_ACTION,PRIVACYZONE_DELETE_REQUEST");
	}
}
function PrivacyList()
{
	if(AxUMF !== undefined)
	{
		AxUMF.SetParam("CONTROL", "PRIVACYZONEAREA", "PRIVACYZONE_LIST");
	}
}
function PrivacySelectShow(nSelectedIDX)
{
	if(AxUMF !== undefined)
	{
		AxUMF.SetParam("CONTROL", "PRIVACYZONEAREA", "PRIVACYZONE_SHOW," + nSelectedIDX);
	}
}
function PrivacySelectHide(nSelectedIDX)
{
	if(AxUMF !== undefined)
	{
		AxUMF.SetParam("CONTROL", "PRIVACYZONEAREA", "PRIVACYZONE_HIDE," + nSelectedIDX);
	}
}

////////////////////////////////////////////////////////////////////////////////
// Function name : PrivacySave(szValue)
// Description	 : save button 기능
// Return value	: 
////////////////////////////////////////////////////////////////////////////////
function PrivacySave(szValue)
{
	var group = DefaultGroup;
	var max_cnt = eval(group + "_CH0_NBROFZONE");
	var staticList = szValue.split(";");	
	var reqQString = "action=update&xmlschema";
	var Req = new CGIRequest();	

	max_cnt = 4;

	for(var i=0; i<max_cnt; i++)
	{
		if(staticList.length - 1 <= i)
		{
			reqQString += "&PRIVACYZONE.Ch0.Z" + i + ".enable=no";
			continue;
		}
		var listId = staticList[i].split(",");
		var useStatus = "yes";
		
		if($("#listID_" + i + " input[type='checkbox']").attr("checked") == true)
		{
			useStatus = "yes";
		}
		else
		{
			useStatus = "no";
		}

		reqQString += "&PRIVACYZONE.Ch0.Z" + i + ".enable=" + useStatus;

		if(eval("PRIVACYZONE_CH0_Z" + i + "_NAME") != $("#users tbody tr#listID_" + listId[0] + " td:eq(2) input:text").val())
		{
			reqQString += "&PRIVACYZONE.Ch0.Z" + i + ".name=" + encodeURIComponent($("#users tbody tr#listID_" + listId[0] + " td:eq(2) input:text").val());
		}
		if(eval("PRIVACYZONE_CH0_Z" + i + "_POSITION") != (listId[1] + "," + listId[2] + "," + listId[3] + "," + listId[4]))
		{
			reqQString += "&PRIVACYZONE.Ch0.Z" + i + ".position=" + listId[1] + "," + listId[2] + "," + listId[3] + "," + listId[4];
		}
	}
	Req.SetStartFunc(ViewLoadingSave);
	Req.SetCallBackFunc(function(xml){
		LoadParamJs(DefaultGroup+"&cache", function () {
			var ret = CGIResponseCheck(0, xml);
			if(ret != 0) {
				var errormessage = "";
				if(ret != -2) {
					errormessage = "\n" + ret;
				}
				alert(GetMsgLang("0501") + errormessage);
			}
			
			ViewLoadingSave(false);
		});
	});
	Req.SetType("POST");
	Req.Request(reqQString);
}

function InitSetting()
{
	var group = DefaultGroup;
	var max_cnt = eval(group + "_CH0_NBROFZONE");

	max_cnt = 4;

	if($.browser.msie == true)
	{
		Enable($("#save"));
	}

	if(AxUMF !== undefined)
	{
		AxUMF.SetParam("CONTROL", "PRIVACYZONEAREA", "PRIVACYZONE_CLEAR");
	}
	$("#users tbody").html("");

	for(var i = 0, index = 0; i<max_cnt; i++)
	{
		var posVal = eval(group + "_CH0_Z" + i + "_POSITION").split(",");

		// Position 범위
		szValue = "PRIVACYZONE_ADD," + i + ","
		+ posVal[0] + ","
		+ posVal[1] + ","
		+ posVal[2] + ","
		+ posVal[3];
		if(AxUMF !== undefined)
		{
			AxUMF.SetParam("CONTROL", "PRIVACYZONEAREA", szValue);
		}
		PrivacySelectHide(i);

		// 하단 리스트에 추가
		$("#users tbody").append("<tr id='listID_" + i + "'></tr>").find("tr").last()
						.append("<td><input type='checkbox'></input></td>")
						.append("<td>" + "0" + eval(index+1) + "</td>")
						.append("<td><input type='text' size=35></input></td>");
		ResizePage();
		
		if(eval(group + "_CH0_Z" + i + "_ENABLE") == "yes")
		{
			PrivacySelectShow(i);
			$("#listID_" + i + " input[type='checkbox']").attr("checked", "checked");
		}
		
		// 값 받아오기
		$("#users tbody tr#listID_" + i + " td:eq(2) input:text").val(eval(group + "_CH0_Z" + i + "_NAME"));
		++index;
	}

	// List 클릭시 선택 구분 표시
	$("#users tbody tr").unbind().click(function(){
		var idxList = $(this).attr('id').split('_')[1];
		if(AxUMF !== undefined)
		{
			AxUMF.SetParam("CONTROL", "PRIVACYZONEAREA", "PRIVACYZONE_SELECT," + idxList);
		}

		$("#users tbody tr").not("#users tbody tr#listID_" + idxList).css('background-color', '#FFFFFF');
		$("#users tbody tr input[type='text']").css('background-color', '#FFFFFF');
		$("#users tbody tr#listID_" + idxList).css('background-color', '#FFEBD8');
		$("#users tbody tr#listID_" + idxList + " input[type='text']").css('background-color', '#FFEBD8');
	});
}

function initBrand()
{
	var pathPageNameAll = "inline";
	var pathPageNameVideo = "none";

	if(parent.g_brand.productID != "d001" &&
		parent.g_brand.audioInOut == "0/0")
	{
		pathPageNameAll = "none";
		pathPageNameVideo = "inline";
	}

	$("#parentpagename").css("display", pathPageNameAll);
	$("#parentpagename_video").css("display", pathPageNameVideo);
}

function SetRelation()
{
	var group = DefaultGroup;
	var remList = $("#users tbody tr").size();
	var textValExist = new Array();
	for(var i=0;i<remList;i++)
	{
		// 글자수 제한
		// name
		$("#users tbody tr:eq(" + i +") td:eq(2) input:text").keydown(function(){
			textValExist[i] = $(this).val();
		}).keyup(function() {
			var text = $(this).val();

			if(text.length > 30)
			{
				$(this).val(text.substr(0,30));
			}
		});
	}
	EventTable();
}

function EventTable()
{
	// check 상태에 따른 show, hide
	$("#users :checkbox").unbind().change(function() {
		var idxList = $(this).parent().parent().attr('id').split('_')[1];

		if($(this).attr("checked") == true)
		{
			if(AxUMF !== undefined)
			{
				AxUMF.SetParam("CONTROL", "PRIVACYZONEAREA", "PRIVACYZONE_SHOW," + idxList);
			}
		}
		else
		{
			if(AxUMF !== undefined)
			{
				AxUMF.SetParam("CONTROL", "PRIVACYZONEAREA", "PRIVACYZONE_HIDE," + idxList);
			}
		}
	});

	// 선택된 영역 하위 List 에 구분 표시
	$("#users tbody tr").unbind().click(function(){
		var idxList = $(this).attr('id').split('_')[1];
		if(AxUMF !== undefined)
		{
			AxUMF.SetParam("CONTROL", "PRIVACYZONEAREA", "PRIVACYZONE_SELECT," + idxList);
		}

		$("#users tbody tr").not("#users tbody tr#listID_" + idxList).css('background-color', '#FFFFFF');
		$("#users tbody tr input[type='text']").css('background-color', '#FFFFFF');
		$("#users tbody tr#listID_" + idxList).css('background-color', '#FFEBD8');
		$("#users tbody tr#listID_" + idxList + " input[type='text']").css('background-color', '#FFEBD8');
	});
}

function EventBind()
{
	Disable($("#save").button());
	$("#save").click(function(){
		var listNum = $("#users tbody tr").size();
		for(var i=0; i<listNum; i++)
		{
			var inputVal = $("#users tbody tr:eq(" + i +") td:eq(2) input:text").val();
			if(!checkStringValidation($("#users tbody tr:eq(" + i +") td:eq(2) input:text").val(), g_defregexp.noKorean, null, 30, true))
			{
				alert(GetMsgLang("04020711"));
				return;
			}
		}
		PrivacyList();
	});
	
	//ViewLoadingSave(true);
	$("input[type='button']").attr("disabled", "");
	
	$("#loading_msg").css({
		top: "100px",
		left: "50%"
	});
}

////////////////////////////////////////////////////////////////////////////////
// Function name : qtime_start(streamUri, width, height)
// Description	 : quicktime 영상 재생
// Return value	: 
////////////////////////////////////////////////////////////////////////////////
function qtime_start(streamUri, width, height)
{
	//Enable($("button#btnView"));
	var objStr = "";
	var haveqt = false;

	if (navigator.plugins) {
		for (i=0; i < navigator.plugins.length; i++ ) {
			console.log(navigator.plugins[i].name);
			if (navigator.plugins[i].name.indexOf("QuickTime") >= 0) {
				haveqt = true;
			}
		}
	}
	
	objStr += "<div id='objVideoScreen' style='width:" + width + "px; height:" + height + "px;'>"
	objStr += "<object width=100% height=100%";
	objStr += " CODEBASE='http://www.apple.com/qtactivex/qtplugin.cab' ONERROR='qtime_error();'>";
	//objStr += "<param name='src' value='/images/qtposter.mov'>";
	objStr += "<param name='qtsrc' value='" + streamUri + "'>";
	objStr += "<param name='autoplay' value='true'>";
	objStr += "<param name='controller' value='false'>";
	objStr += "<param name='type' value='video/quicktime'>";
	objStr += "<param name='scale' value='tofit'>";
	objStr += "<param name='target' value='myself'>";
	objStr += "<embed id='VideoScreen'";
	objStr += " width=100% height=100%";
	objStr += " type='video/quicktime'"
	objStr += " src='/images/qtposter.mov'";
	objStr += " src='" + streamUri + "'";
	objStr += " qtsrc='" + streamUri + "'";
	objStr += " autoplay='true'";
	objStr += " controller='false'";
	objStr += " type='video/quicktime'";
	objStr += " scale='tofit'";
	objStr += " target='myself'";
	objStr += " plugin='quicktimeplugin'";
	objStr += " cache='false'";
	objStr += " pluginspage='http://www.apple.com/quicktime/download/'";
	objStr += " loop='false'";
	objStr += "/>"
//			objStr += "<p>fail to loading...</p>";
	objStr += "</object>";
	objStr += "</div>";	

	$("#screen").html(objStr);

	if(haveqt == false)
	{
		qtime_error();
		return;
	}
}
////////////////////////////////////////////////////////////////////////////////
// Function name : qtime_error()
// Description	 : 퀵타임 설치 에러시 동작
// Return value	: 
////////////////////////////////////////////////////////////////////////////////
function qtime_error()
{
	setTimeout(StartSnapshot, 1000);
}

////////////////////////////////////////////////////////////////////////////////
// Function name : activex_error()
// Description	 : ActiveX 설치 에러시 동작
// Return value	: 
////////////////////////////////////////////////////////////////////////////////
function activex_error()
{
	StartSnapshot();
}

////////////////////////////////////////////////////////////////////////////////
// Function name : StartSnapshot()
// Description	 : Snapshot 출력, 영상 설치전
// Return value	: 
////////////////////////////////////////////////////////////////////////////////
function StartSnapshot()
{
	$("#screen").empty();
	$("#screen").append("<img>")
		.find("img:last").attr("id", "snapshotArea");
		
	$("#snapshotArea").attr({
		width: Width,
		height: Height
	});

	snapshot_play = true;
	$("#snapshotArea").hide();
	reflashImage();
}

////////////////////////////////////////////////////////////////////////////////
// Function name : reflashImage()
// Description	 : Snapshot 이미지 로드
// Return value	: 
////////////////////////////////////////////////////////////////////////////////
var flag = false;
function reflashImage() 
{
	loadImage = function() {
		if(snapshot_play === false) 
		{
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

////////////////////////////////////////////////////////////////////////////////
// Function name : SetRotateSize()
// Description	 : Set width and height according to rotate state.
// Return value	: 
////////////////////////////////////////////////////////////////////////////////
function SetRotateSize()
{
	var rotateValue = VIDEOIN_CH0_ROTATE_DIRECTION;

	switch(rotateValue)
	{
		case "left":
		case "right":
			var result = ExchangeValues(Width, Height);
			Width = result.value1;
			Height = result.value2;
			break;
		case "none":
			break;
	}
}
