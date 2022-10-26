var DefaultGroup = "MD";
var nMotionIDX	 = 0;
var nSelectedIDX = 0;
var rtspPort = "";
var nSavingIDX = 0;
var zoneList = "";
var nAddCnt = 0;
var szValue = "";
var actStart = 0;
var actIndex = [];
var sameMotionList = "";
var useZoneList = "";
var snapshot_play = false;
var snapshot_url = "/uapi-cgi/snapshot.fcgi";
var BlobFlag = 1;
var Width = 608;
var Height = 342;

$(function () {
	PreCustomize();
	initEnvironment();
	LoadParamJs("MD&NETWORK&ENCODER&EVENTPROFILE&VIDEOIN", Run);
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum = ["04030218", "04030219", "0501"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "motiondetection", 
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
			MotionOn();
			MotionMouseRButtonDeleteRequest();
			MotionMouseRButtonNone();
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

	if(window.ActiveXObject !== undefined)
	{
		AxUMF_create(Width,
								 Height,
								 StartSnapshot,
								 function () {
									 playChk = 1;		
									 AxUMF.SetParam("CONTROL", "AUDIO", "OFF");
									 if(MD_METADATA_BLOB_ENABLE == 'yes')
									 {
										 BlobOn();
									 }
									 else
									 {
										 BlobOff();
									 }
								 }, 
									MotionDetection_ActiveX_Event,
									null);
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
					if(qtime_start(streamUri, Width, Height) == false) 
						return false;
				}
				break;
		}
	}
	return true;
}

function BlobOn()
{
	if(AxUMF !== undefined)
	{
		AxUMF.SetParam("CONTROL", "BLOBDATA", "ON");
		BlobFlag = 1;
	}
}

function BlobOff()
{
	if(AxUMF !== undefined)
	{
		AxUMF.SetParam("CONTROL", "BLOBDATA", "OFF");
		BlobFlag = 0;
	}
}

function MotionOn()
{
	if(AxUMF !== undefined)
	{
		AxUMF.SetParam("CONTROL", "MOTION", "ON");
	}
}

function MotionMouseLButtonAdd()
{
	if(AxUMF !== undefined)
	{
		AxUMF.SetParam("CONTROL", "MOTIONAREA", "SET_MLBUTTON_ACTION,ADD");
	}
}
function MotionMouseLButtonNone()
{
	if(AxUMF !== undefined)
	{
		AxUMF.SetParam("CONTROL", "MOTIONAREA", "SET_MLBUTTON_ACTION,NONE");
	}
}
function MotionMouseRButtonNone()
{
	if(AxUMF !== undefined)
	{
		AxUMF.SetParam("CONTROL", "MOTIONAREA", "SET_MRBUTTON_ACTION,NONE");
	}
}
function MotionMouseRButtonDeleteRequest()
{
	if(AxUMF !== undefined)
	{
		AxUMF.SetParam("CONTROL", "MOTIONAREA", "SET_MRBUTTON_ACTION,DELETE_REQUEST");
	}
}
function MotionList()
{
	if(AxUMF !== undefined)
	{
		AxUMF.SetParam("CONTROL", "MOTIONAREA", "LIST");
	}
}
function MotionGetSelectIndex()
{
	if(AxUMF !== undefined)
	{
		AxUMF.SetParam("CONTROL", "MOTIONAREA", "GET_SELECTED_INDEX");
	}
}
function MotionSelectShow(nSelectedIDX)
{
	if(AxUMF !== undefined)
	{
		AxUMF.SetParam("CONTROL", "MOTIONAREA", "SHOW," + nSelectedIDX);
	}
}
function MotionSelectHide(nSelectedIDX)
{
	if(AxUMF !== undefined)
	{
		AxUMF.SetParam("CONTROL", "MOTIONAREA", "HIDE," + nSelectedIDX);
	}
}

function MotionSave(szValue)
{
	var Req = new CGIRequest();
	var saveZoneCnt = $("#users tbody tr").size();
	var group = "MD";
	var max_cnt = eval(group + "_CH0_NBROFZONE");
	var staticList = szValue.split(";");
	var cnt = 0;
	var chgCnt = 0;
	var profileList;
	var profile_cnt = EVENTPROFILE_NBROFCOUNT;
	var useZoneLoad = "";
	var resultMotionList = ""; // 최종 저장할 enablelist
	
	//var reqQString = "action=update&xmlschema&group=MD.Ch0";
	var reqQString = "action=update&xmlschema";
	var Req = new CGIRequest();	
	
	//var enableListReqQString = "action=update&group=EVENTPROFILE&schema=xml";
	var enableListReqQString = "";
	var enableListReq = new CGIRequest();

	if(profile_cnt > 0)
	{
		profileList = EVENTPROFILE_LIST.split(",");
	}

	for(var i = 0; i < profile_cnt; i++)
	{
		var enableList = eval("EVENTPROFILE_P" + profileList[i].toUpperCase() + "_SOURCE_MOTION_ENABLELIST").split(",");
		
		// Profile 지정
		//enableListReqQString += "&P" + profileList[i].toUpperCase() + ".Source.Motion.enablelist=";
		enableListReqQString += "&EVENTPROFILE.P" + profileList[i].toUpperCase() + ".Source.Motion.enablelist=";
		
		resultMotionList = "";
		
		useZoneLoad = useZoneList.split(",");
		for(var j=0; j<useZoneLoad.length; j++)
		{
			for(var k=0; k<enableList.length; k++)
			{			
				if(useZoneLoad[j] == enableList[k])
				{
					if(resultMotionList == "")
					{
						resultMotionList = useZoneLoad[j];
					}
					else if(resultMotionList != "")
					{
						resultMotionList += "," + useZoneLoad[j];
					} 
				}
			}
		}
		
		// 저장할 LIST 추가
		enableListReqQString += resultMotionList;
	}
	
	reqQString += enableListReqQString;

	var motionZoneEnabled = false;
	for(var i=0; i<max_cnt; i++)
	{
		if(staticList.length - 1 <= i)
		{
			reqQString += "&MD.Ch0.Z" + i + ".enable=no";
			continue;
		}
		var listId = staticList[i].split(",");
		var useStatus = "yes";
		
		if($("#listID_" + i + " input[type='checkbox']").attr("checked") == true)
		{
			useStatus = "yes";
			motionZoneEnabled = true;
		}
		else
		{
			useStatus = "no";
		}

		reqQString += "&MD.Ch0.Z" + i + ".enable=" + useStatus;

		if(eval("MD_CH0_Z" + i + "_NAME") != $("#users tbody tr#listID_" + listId[0] + " td:eq(2) input:text").val())
		{
			reqQString += "&MD.Ch0.Z" + i + ".name=" + encodeURIComponent($("#users tbody tr#listID_" + listId[0] + " td:eq(2) input:text").val());
		}
		if(eval("MD_CH0_Z" + i + "_DESCRIPTION") != $("#users tbody tr#listID_" + listId[0] + " td:eq(3) input:text").val())
		{
			reqQString += "&MD.Ch0.Z" + i + ".description=" + encodeURIComponent($("#users tbody tr#listID_" + listId[0] + " td:eq(3) input:text").val());
		}
		if(eval("MD_CH0_Z" + i + "_SENSITIVITY") != $("#users tbody tr#listID_" + listId[0] + " td:eq(4) input:text").val())
		{
			reqQString += "&MD.Ch0.Z" + i + ".sensitivity=" + $("#users tbody tr#listID_" + listId[0] + " td:eq(4) input:text").val();
		}
		if(eval("MD_CH0_Z" + i + "_OBJECTSIZE") != $("#users tbody tr#listID_" + listId[0] + " td:eq(5) input:text").val())
		{
			reqQString += "&MD.Ch0.Z" + i + ".objectsize=" + $("#users tbody tr#listID_" + listId[0] + " td:eq(5) input:text").val();
		}
		if(eval("MD_CH0_Z" + i + "_POSITION") != (listId[1] + "," + listId[2] + "," + listId[3] + "," + listId[4]))
		{
			reqQString += "&MD.Ch0.Z" + i + ".position=" + listId[1] + "," + listId[2] + "," + listId[3] + "," + listId[4];
		}
		if(eval("MD_CH0_Z" + i + "_NUMBER") != i)
		{
			reqQString += "&MD.Ch0.Z" + i + ".number=" + i;
		}
	}
	
	reqQString += "&MD.Metadata.Blob.enable=" + (($("#metadataBlobenable:checkbox").attr("checked") == true) ? "yes":"no");

	if($("#metadataBlobenable:checkbox").attr("checked") == true && motionZoneEnabled)
	{
		if(BlobFlag == 0)
		{
			BlobOn();	
		}
	}
	else
	{
		if(BlobFlag == 1)
		{
			BlobOff();
		}
	}

	Req.SetStartFunc(ViewLoadingSave);
	Req.SetCallBackFunc(function(xml){
		LoadParamJs(DefaultGroup, function () {
			var ret = CGIResponseCheck(0, xml);
			if(ret != 0) {
				var errormessage = "";
				if(ret != -2) {
					errormessage = "\n" + ret;
				}
				alert(GetMsgLang("0501") + errormessage);
			}
			else
			{
				if(eval("MD_CH0_Z" + nSelectedIDX + "_ENABLE") == "yes")
				{
					AxUMF.SetParam("CONTROL", "MOTIONGRAPH_OBJSIZE", eval("MD_CH0_Z" + nSelectedIDX + "_OBJECTSIZE"));
				}
			}
			ViewLoadingSave(false);
		});
	});
	Req.SetType("POST");
	Req.Request(reqQString);
}

function InitSetting()
{
	var group = "MD";
	var max_cnt = eval(group + "_CH0_NBROFZONE");
	var number_list = new Array(max_cnt);
	var cnt = 0;
	
	Enable($("#save"));

	if(eval(group+"_METADATA_BLOB_ENABLE") == "yes")
	{
		$("#metadataBlobenable:checkbox").attr("checked", "checked");
	}
	else
	{
		$("#metadataBlobenable:checkbox").attr("checked", "");
	}
	$("#motionGraphEnable:checkbox").attr("checked", "checked");
	
	if(AxUMF !== undefined)
	{
		AxUMF.SetParam("CONTROL", "MOTIONAREA", "CLEAR");
	}
	$("#users tbody").html("");

// -1 초기화
	for(var i = 0; i < max_cnt; ++i)
	{
		number_list[i] = -1;
	}

// 추가할	zone 정보 입력
	for(var i = 0; i < max_cnt; ++i)
	{
//		if(eval(group + "_CH0_Z" + i + "_ENABLE") == "no")
//		{
//			continue;
//		}
		
		var num = parseInt(eval(group + "_CH0_Z" + i + "_NUMBER"));
		
		if(num < max_cnt)
		{
			number_list[num] = i;
			++cnt;
		}
	}
	
// Zone 8개 일때, 좌클릭 Disable
	if(cnt == 8)
	{
		MotionMouseLButtonNone();
	}
	
	for(var i = 0, index = 0; i<max_cnt; i++)
	{
		if(number_list[i] == -1)
			continue;

		var posVal = eval(group + "_CH0_Z" + number_list[i] + "_POSITION").split(",");

		// Position 범위
		szValue = "ADD," + i + ","
		+ posVal[0] + ","
		+ posVal[1] + ","
		+ posVal[2] + ","
		+ posVal[3];
		if(AxUMF !== undefined)
		{
			AxUMF.SetParam("CONTROL", "MOTIONAREA", szValue);
		}
		MotionSelectHide(i);

		// 하단 리스트에 추가
		$("#users tbody").append("<tr id='listID_" + i + "'></tr>").find("tr").last()
						.append("<td><input type='checkbox'></input></td>")
						.append("<td>" + "0" + eval(index+1) + "</td>")
						.append("<td><input type='text' style='width:90px;''></input></td>")
						.append("<td><input type='text' style='width:220px;'></input></td>")
						.append("<td><input type='text' style='width:30px;'></input></td>")
						.append("<td><input type='text' style='width:30px;'></input></td>");
						//.append("<td><span class='del' style='width:5px;'>x</span></td>");
		ResizePage();
		
		if(eval(group + "_CH0_Z" + i + "_ENABLE") == "yes")
		{
			MotionSelectShow(i);
			$("#listID_" + i + " input[type='checkbox']").attr("checked", "checked");
		}
		
		// 값 받아오기
		$("#users tbody tr#listID_" + i + " td:eq(2) input:text").val(eval(group + "_CH0_Z" + number_list[i] + "_NAME"));
		$("#users tbody tr#listID_" + i + " td:eq(3) input:text").val(eval(group + "_CH0_Z" + number_list[i] + "_DESCRIPTION"));
		$("#users tbody tr#listID_" + i + " td:eq(4) input:text").val(eval(group + "_CH0_Z" + number_list[i] + "_SENSITIVITY"));
		$("#users tbody tr#listID_" + i + " td:eq(5) input:text").val(eval(group + "_CH0_Z" + number_list[i] + "_OBJECTSIZE"));
		++index;
	}
	
	useZoneList = UseEnableListCheck();
	motionGrephOnOff("on");
}

function SetRelation()
{
	var group = "MD";
	var max_cnt = eval(group + "_CH0_NBROFZONE");
	var remList = $("#users tbody tr").size();

	for(var i=0;i<remList;i++)
	{
		// 글자수 제한
		// name
		$("#users tbody tr:eq(" + i +") td:eq(2) input:text").keyup(function() {
			var text = $(this).val();

			if(text.length > 32)
			{
				$(this).val(text.substr(0,32));
					return false;
			}
			else
			{
				return true;
			}
		});
		// description
		$("#users tbody tr:eq(" + i +") td:eq(3) input:text").keyup(function() {
			var text = $(this).val();

			if(text.length > 100)
			{
				$(this).val(text.substr(0,100));
					return false;
			}
			else
			{
				return true;
			}
		});
		// sencitivity 0~255 범위
		$("#users tbody tr:eq(" + i +") td:eq(4) input:text").numeric().blur(function() {
			var inputValText = $(this).val()-0;
			$(this).val(inputValText);
			if($(this).val() == 0) return;
			if(inputValText < 0 || inputValText >255 || inputValText == "")
			{
				$(this).val(128).focus();
				alert(GetMsgLang("04030218"));
			}
		});
		//objectsize 0~255 범위
		$("#users tbody tr:eq(" + i +") td:eq(5) input:text").numeric().blur(function() {
			var inputValText = $(this).val()-0;
			$(this).val(inputValText);
			if($(this).val() == 0) return;
			if(inputValText < 0 || inputValText >255 || inputValText == "")
			{
				$(this).val(128).focus();
				alert(GetMsgLang("04030218"));
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
		var profileList;
		var profile_cnt = EVENTPROFILE_NBROFCOUNT;	
		var sameCheckFlag = 'n';	 // 사용중인 리스트가 있는지 유무 확인 

		if(profile_cnt > 0)
			profileList = EVENTPROFILE_LIST.split(",");

		if($(this).attr("checked") == true)
		{
			if(AxUMF !== undefined)
			{
				AxUMF.SetParam("CONTROL", "MOTIONAREA", "SHOW," + idxList);
			}
		}
		else
		{
			for(var i = 0; i < profile_cnt; i++)
			{
				var enableList = eval("EVENTPROFILE_P" + profileList[i].toUpperCase() + "_SOURCE_MOTION_ENABLELIST").split(",");
				
				// 사용중인 리스트가 있는지 체크 
				for(var j = 0; j < enableList.length; j++)
				{
					if(enableList[j] == idxList)
					{
						sameCheckFlag = 'y';
					}
				}
			}
			
			if(sameCheckFlag == 'y')
			{
				alert(GetMsgLang("04030219"));
				if(AxUMF !== undefined)
				{
					AxUMF.SetParam("CONTROL", "MOTIONAREA", "HIDE," + idxList);
				}
			}
			else
			{
				if(AxUMF !== undefined)
				{
					AxUMF.SetParam("CONTROL", "MOTIONAREA", "HIDE," + idxList);
				}
			}
		}
		
		useZoneList = UseEnableListCheck();
	});

	// 선택된 영역 하위 List 에 구분 표시
	$("#users tbody tr").unbind().click(function(){
		var idxList = $(this).attr('id').split('_')[1];
		if(AxUMF !== undefined)
		{
			if(eval("MD_CH0_Z" + idxList + "_ENABLE") == "yes")
			{
				nSelectedIDX = idxList;
				AxUMF.SetParam("CONTROL", "MOTIONAREA", "SELECT," + idxList);
				AxUMF.SetParam("CONTROL", "MOTIONGRAPH_OBJSIZE", eval("MD_CH0_Z" + idxList + "_OBJECTSIZE"));
			}
		}

		$("#users tbody tr").not("#users tbody tr#listID_" + idxList).css('background-color', '#FFFFFF');
		$("#users tbody tr input[type='text']").css('background-color', '#FFFFFF');
		$("#users tbody tr#listID_" + idxList).css('background-color', '#FFEBD8');
		$("#users tbody tr#listID_" + idxList + " input[type='text']").css('background-color', '#FFEBD8');
	});
}

// 현재 Enable 된 Zone List 확인
function UseEnableListCheck()
{
	var useList = "";
	var zoneCnt = 8;
	var useResultFlag = 0;
	
	for(var i=0; i<zoneCnt; i++)
	{
		userResultFlag = ($("#listID_" + i + " :checkbox").attr("checked") == true) ? 1 : 0;		
		
		if(userResultFlag == 1)
		{
			if(useList == "")
			{
				useList += i;
			}
			else if(userResultFlag != "")
			{
				useList += "," + i;
			}
		}
	}
	
	return useList;
}

function EventBind()
{
	Disable($("#save").button());
	$("#save").click(function(){
		MotionList();
	});
	
	//ViewLoadingSave(true);
	$("input[type='button']").attr("disabled", "");
	
	$("#loading_msg").css({
		top: "100px",
		left: "50%"
	});
	$("#rtsprtpLink a").click(function(){
		parent.$("#leftmenu .networkConfContents + div a[href='rtsprtp.html']").click();
		parent.$("#leftmenu .networkConfContents").click();
	});

	$("#motionGraphEnable:checkbox").click(function() {
		if($(this).attr("checked") == true)
		{
			motionGrephOnOff("on");
		}
		else
		{
			motionGrephOnOff("off");
		}
	})
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

	objStr += "<div id='objVideoScreen' style='width:" + Width + "px; height:" + Height + "px;'>"
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

function motionGrephOnOff(graphFlag)
{
	if(AxUMF !== undefined)
	{
		if(graphFlag == "on")
		{
			AxUMF.SetParam("CONTROL", "MOTIONGRAPH", "ON");
		}
		else
		{
			AxUMF.SetParam("CONTROL", "MOTIONGRAPH", "OFF");
		}
	}
}
