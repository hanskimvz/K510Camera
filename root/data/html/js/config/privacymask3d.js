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
var chk = 0;
var resChk = 0;
var Width = 480;
var Height = 270;

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
	var classNum = ["04020916", "04020917", "04020918", "04020919", "04020920", "04020921", "04020923", "04020924", "04020928", "0501"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "privacymask3d", 
				parent.g_langData[parent.g_configData.language]);
}

function Run()
{
	var changeWidthHeight = adjustRatioWidthHeight(VIDEOIN_CH0_CMOS_RATIO, Height);
	Width = changeWidthHeight[0];
	Height = changeWidthHeight[1];

	InitForm();
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
			GetCurPTZInfo();		 
			
			InitSetting();
			SetRelation();
			EventBind();
			ViewLoadingSave(false);
		}, 50);
	}
	ResizePage();
}



function InitForm()
{
	$("button").button();
	
	//ptz panel UI
	$("#ptz_panel dd").each(function(index, element) {
		ptzImageName = "../images/"+$(this).attr("id")+".gif";
		$(this).css("background", "url('" + ptzImageName + "')	no-repeat center");
	});

	 // ptz speedbar
	$("#ptz_speedbar #slider_speedbar").each(function(index, element) {
		var $obj = $(this).parent().parent().find("input[type='text']");
		$(this).slider({
			range: "min",
			min: 1,
			max: 100,
			value: 20,
			slide: function(event, ui) {
				$obj.val(ui.value);
			}
		})
	});

	$("#text_speedbar").val(20);

	// speed range
	$("#text_speedbar:text").blur(function(){
		var inputValSpeed = $("#text_speedbar:text").val();
		if(inputValSpeed < 1 || inputValSpeed > 100 || inputValSpeed == "")
		{
			$("#text_speedbar:text").val(1).focus();
			$("#slider_speedbar").slider("value", 1);
			alert(GetMsgLang("04020916"));
		}
	});
	// speed Text box, Slider-bar 동기화
	$("#text_speedbar:text").keyup(function() {
			$("#slider_speedbar").slider("value", $("#text_speedbar:text").val());
	});
	$("#preset_number").val(1);
}

function InitSetting()
{
	var group = DefaultGroup;
	var max_cnt = eval(group + "_CH0_NBROFZONE");
	
	if(browserCheck() == "msie")
	{
		Enable($("#save"));
	}

	$("#users tbody").html("");
	szValue = "PRIVACYZONE_ADD,0,2500,2500,4999,4999";

	if(AxUMF !== undefined)
	{
		AxUMF.SetParam("CONTROL", "PRIVACYZONEAREA", "PRIVACYZONE_CLEAR");
	//AxUMF.SetParam("CONTROL", "PRIVACYZONEAREA", "PRIVACYZONE_NONUMBER");	
	//AxUMF.SetParam("CONTROL", "PRIVACYZONEAREA", szValue);
	}

	for(var i = 0, index = 0; i<max_cnt; i++)
	{
		//var posVal = eval(group + "_CH0_Z" + i + "_POSITION").split(",");

		// Position 범위
		// szValue = "PRIVACYZONE_ADD," + i + ","
		// + posVal[0] + ","
		// + posVal[1] + ","
		// + posVal[2] + ","
		// + posVal[3];

		//if(AxUMF !== undefined)
		//{
		//	AxUMF.SetParam("CONTROL", "PRIVACYZONEAREA", szValue);
		//}
		//	PrivacySelectHide(i);


		// 하단 리스트에 추가
		$("#users tbody").append("<tr id='listID_" + i + "'></tr>").find("tr").last()
						.append("<td><input type='checkbox'></input></td>")
						.append("<td>" + "0" + eval(index+1) + "</td>")
						.append("<td><input id='txtName' type='text' size=35></input></td>")
						.append("<td>P:<input id='txtP' type='text' size=3 value=0></input> T:<input id='txtT' type='text' size=3 value=0></input> "+
												"W:<input id='txtW' type='text' size=3 value=10></input> H:<input id='txtH' type='text' size=3 value=10></input></td>")
						.append("<td><button class='goContents' id='btnGo_" + eval(index+1) + "'>" + GetMsgLang("04020923") + "</button><button class='saveContents' id='btnSave_" + eval(index+1) + "'>" + GetMsgLang("04020924") + "</button></td>");
		ResizePage();
		
		if(eval(group + "_CH0_Z" + i + "_ENABLE") == "yes")
		{
			PrivacySelectShow(i);
			$("#listID_" + i + " input[type='checkbox']").attr("checked", "checked");
		}
		
		$("button").button();

		var dynamicData = eval(group + "_CH0_Z" + i + "_DYNAMIC");

		if(dynamicData == "" || dynamicData == null)
		{
			dynamicData = "0,0,10,10";
		}

		dynamicData = dynamicData.split(",");

		// Name 값 받아오기
		$("#users tbody tr#listID_" + i + " td:eq(2) #txtName").val(eval(group + "_CH0_Z" + i + "_NAME"));

		// Position 값 받아오기
		$("#users tbody tr#listID_" + i + " td:eq(3) #txtP").val(dynamicData[0]);
		$("#users tbody tr#listID_" + i + " td:eq(3) #txtT").val(dynamicData[1]);
		$("#users tbody tr#listID_" + i + " td:eq(3) #txtW").val(dynamicData[2]);
		$("#users tbody tr#listID_" + i + " td:eq(3) #txtH").val(dynamicData[3]);

		++index;
	}

	// List 클릭시 선택 구분 표시
	$("#users tbody tr").unbind().click(function(){
		var idxList = $(this).attr('id').split('_')[1];

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

	for(var i=0;i<remList;i++)
	{
		// 글자수 제한
		// name
		$("#users tbody tr:eq(" + i +") td:eq(2) input:text").keyup(function() {
			var text = $(this).val();

			if(text.length > 30)
			{
				$(this).val(text.substr(0,30));
					return false;
			}
			else
			{
				return true;
			}
		});
	}
}

function EventBind()
{
	var opStrPtzStop = "cpantiltzoommove=0,0,0";
	var opStrFocusStop = "cfocusmove=0";
	//ViewLoadingSave(true);
	$("input[type='button']").attr("disabled", "");
	
	$("#loading_msg").css({
		top: "100px",
		left: "50%"
	});

	/* PTZ */
	// Left up
	$("#pt_lu").mousedown(function(){
		var opStr = "cpantiltzoommove=" + "-" + $("#text_speedbar").val() + "," + $("#text_speedbar").val() + ",0";
		if(resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		resChk = 1;
	}).mouseup(function(){
		actionStop(opStrPtzStop);
	}).mouseout(function(){
		actionStop(opStrPtzStop);
	});
	// Center up
	$("#pt_cu").mousedown(function(){
		var opStr = "cpantiltzoommove=" + "0," + $("#text_speedbar").val() + ",0";
		if(resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		resChk = 1;
	}).mouseup(function(){
		actionStop(opStrPtzStop);
	}).mouseout(function(){
		actionStop(opStrPtzStop);
	});
	// Right up
	$("#pt_ru").mousedown(function(){
		var opStr = "cpantiltzoommove=" + $("#text_speedbar").val() + "," + $("#text_speedbar").val() + ",0";
		if(resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		resChk = 1;
	}).mouseup(function(){
		actionStop(opStrPtzStop);
	}).mouseout(function(){
		actionStop(opStrPtzStop);
	});
	// Left middle
	$("#pt_lm").mousedown(function(){
		var opStr = "cpantiltzoommove=" + "-" + $("#text_speedbar").val() + ",0,0";
		if(resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		resChk = 1;
	}).mouseup(function(){
		actionStop(opStrPtzStop);
	}).mouseout(function(){
		actionStop(opStrPtzStop);
	});
	// Center middle - Stop
	$("#pt_cm").mousedown(function(){
		chk = 1;
		actionStop(opStrPtzStop);
	});
	// Right middle
	$("#pt_rm").mousedown(function(){
		var opStr = "cpantiltzoommove=" + $("#text_speedbar").val() + ",0,0";
		if(resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		resChk = 1;
	}).mouseup(function(){
		actionStop(opStrPtzStop);
	}).mouseout(function(){
		actionStop(opStrPtzStop);
	});
	// Left down
	$("#pt_ld").mousedown(function(){
		var opStr = "cpantiltzoommove=" + "-" + $("#text_speedbar").val() + "," + "-" + $("#text_speedbar").val() + ",0";
		if(resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		resChk = 1;
	}).mouseup(function(){
		actionStop(opStrPtzStop);
	}).mouseout(function(){
		actionStop(opStrPtzStop);
	});
	// Center down
	$("#pt_cd").mousedown(function(){
		var opStr = "cpantiltzoommove=" + "0," + "-" + $("#text_speedbar").val() + ",0";
		if(resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		resChk = 1;
	}).mouseup(function(){
		actionStop(opStrPtzStop);
	}).mouseout(function(){
		actionStop(opStrPtzStop);
	});
	// Right down
	$("#pt_rd").mousedown(function(){
		var opStr = "cpantiltzoommove=" + $("#text_speedbar").val() + "," + "-" + $("#text_speedbar").val() + ",0";
		if(resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		resChk = 1;
	}).mouseup(function(){
		actionStop(opStrPtzStop);
	}).mouseout(function(){
		actionStop(opStrPtzStop);
	});

	// Zoom
	$("#_zIn").mousedown(function(){
		var opStr = "cpantiltzoommove=0,0," + $("#text_speedbar").val();
		if(resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		resChk = 1;
	}).mouseup(function(){
		actionStop(opStrPtzStop);
	}).mouseout(function(){
		actionStop(opStrPtzStop);
	});
	$("#_zOut").mousedown(function(){
		var opStr = "cpantiltzoommove=0,0," + "-" + $("#text_speedbar").val();
		if(resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		resChk = 1;
	}).mouseup(function(){
		actionStop(opStrPtzStop);
	}).mouseout(function(){
		actionStop(opStrPtzStop);
	});

	// Focus
	$("#_fNear").mousedown(function(){
		var opStr = "cfocusmove=" + $("#text_speedbar").val();
		if(resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		resChk = 1;
	}).mouseup(function(){
		actionStop(opStrFocusStop);
	}).mouseout(function(){
		actionStop(opStrFocusStop);
	});
	$("#_fFar").mousedown(function(){
		var opStr = "cfocusmove=" + "-" + $("#text_speedbar").val();
		if(resChk == 1)
			return;
		actionMove(opStr);
		chk = 1;
		resChk = 1;
	}).mouseup(function(){
		actionStop(opStrFocusStop);
	}).mouseout(function(){
		actionStop(opStrFocusStop);
	});

	$(".goContents").click(function(){
		var number = $(this).attr("id").split("_")[1];
		var pan = encodeURIComponent($("#listID_"+ eval(number-1) +" #txtP").val());
		var tilt = encodeURIComponent($("#listID_"+ eval(number-1) +" #txtT").val());
		var width = encodeURIComponent($("#listID_"+ eval(number-1) +" #txtW").val());
		var height = encodeURIComponent($("#listID_"+ eval(number-1) +" #txtH").val());
		var positionResult = "0,0";

		if (RangeCheck(parseInt(pan), parseInt(tilt), parseInt(width), parseInt(height)) < 0)
		{
			return;
		}

		if(tilt < -5) tilt = -5;

		$.get("/nvc-cgi/ptz/ptz2.fcgi?apantiltzoommove=" + pan + "," + tilt +"&_=" + (new Date()).getTime(), function(data) {
		});
		setTimeout(GetCurPTZInfo, 1000);
	});

	$(".saveContents").click(function(){
		GetCurPTZInfo();

		var Req = new CGIRequest();
		var reqQString = "action=update&xmlschema";
		var number = $(this).attr("id").split("_")[1];
		var positionResult = "0,0,0,0";
		var pan = encodeURIComponent($("#listID_"+ eval(number-1) +" #txtP").val());
		var tilt = encodeURIComponent($("#listID_"+ eval(number-1) +" #txtT").val());
		var width = encodeURIComponent($("#listID_"+ eval(number-1) +" #txtW").val());
		var height = encodeURIComponent($("#listID_"+ eval(number-1) +" #txtH").val());

		if (RangeCheck(parseInt(pan), parseInt(tilt), parseInt(width), parseInt(height)) < 0)
		{
			return;
		}
		else if(!checkStringValidation($("#listID_"+ eval(number-1) +" #txtName").val(), g_defregexp.noKorean, null, 30, true))
		{
		alert(GetMsgLang("04020928"));
		return;
		}
		
		positionResult = pan + "," + tilt + "," + width + "," + height;

		QString = makeQString();
		QString
			.set_action('update')
			.set_schema('xml')
			.add_list("PRIVACYZONE.Ch0.Z"+ eval(number-1) +".enable", eval("PRIVACYZONE_CH0_Z"+ eval(number-1) +"_ENABLE"), ($("#listID_"+ eval(number-1) +" input[type='checkbox']").attr("checked") == true) ? "yes":"no")
			.add_list("PRIVACYZONE.Ch0.Z"+ eval(number-1) +".name", eval("PRIVACYZONE_CH0_Z"+ eval(number-1) +"_NAME"), encodeURIComponent($("#listID_"+ eval(number-1) +" #txtName").val()))
			.add_list("PRIVACYZONE.Ch0.Z"+ eval(number-1) +".dynamic", eval("PRIVACYZONE_CH0_Z"+ eval(number-1) +"_DYNAMIC"), positionResult);
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

			LoadParamJs(DefaultGroup + "&cache", function() {
				ViewLoadingSave(false);
			});

			return;
		});
		Req.Request(reqQString);
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
		
	$("#snapshotArea").attr("style" , "width:" + Width + "px; height:" + Height + "px;");		

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
// Function name : StartVideo()
// Description	 : 영상 재생
// Return value	: 
////////////////////////////////////////////////////////////////////////////////
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
								PrivacyMask3D_ActiveX_Event,
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

////////////////////////////////////////////////////////////////////////////////
// Function name : Privacy.. 
// Description	 : ActiveX Set 명령 함수 모음
// Return value	: 
////////////////////////////////////////////////////////////////////////////////
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
// Function name : actionMove(opString) 
// Description	 : PTZ 이동
// Return value	: 
////////////////////////////////////////////////////////////////////////////////
function actionMove(opString)
{
	var actionReq = new CGIRequest();
	var reqQString = "";

	reqQString += opString;
	//actionReq.SetAddress("/uapi-cgi/uptz.fcgi");
	actionReq.SetAddress("/nvc-cgi/ptz/ptz2.fcgi");
	actionReq.SetCallBackFunc(function(xml){
		resChk = 0;
		ViewLoadingSave(false);
		GetCurPTZInfo();
		return;
	});
	actionReq.Request(reqQString);
}

////////////////////////////////////////////////////////////////////////////////
// Function name : actionStop(opStr) 
// Description	 : PTZ 정지
// Return value	: 
////////////////////////////////////////////////////////////////////////////////
function actionStop(opStr)
{
	if(chk == 1)
	{
		var t=0;
		t = setInterval(function(){
			if(resChk == 0)
			{
				actionMove(opStr);
				clearInterval(t);
			}
		}, 10);
		chk = 0;
	}
}

////////////////////////////////////////////////////////////////////////////////
// Function Name : GetCurPTZInfo()
// Description	 : PTZ 정보를 얻어온다
// Return value	:
////////////////////////////////////////////////////////////////////////////////
function GetCurPTZInfo()
{
	$.get("/nvc-cgi/ptz/ptz2.fcgi?getcurfov" + "&_=" + (new Date()).getTime(), function(data) {
		if(data.substring(0,2) != "#4")
		{
			$("#default_range").text(data.split("\n")[1].split("=")[1].split(",")[0] + ", " + data.split("\n")[1].split("=")[1].split(",")[1]);
			$("#default_center").text(data.split("\n")[1].split("=")[1].split(",")[2] + ", " + data.split("\n")[1].split("=")[1].split(",")[3]);
		}
	});
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

////////////////////////////////////////////////////////////////////////////////
// Function name : RangeCheck(pan, tilt, width, height)
// Description	 : range check 
// Return value	: success 0, fail -1
////////////////////////////////////////////////////////////////////////////////
function RangeCheck(pan, tilt, width, height)
{
	if (pan < 0 || pan > 360)
	{
			alert(GetMsgLang("04020917"));
			return -1;
	}
	if (tilt < -25 || tilt > 70)
	{
			alert(GetMsgLang("04020918"));
			return -1;
	}
	if (width < 1 || width > 40)
	{
			alert(GetMsgLang("04020919"));
			return -1;
	}
	if (height < 1 || height > 30)
	{
			alert(GetMsgLang("04020920"));
			return -1;
	}

	if (tilt + height > 70)
	{
			alert(GetMsgLang("04020921"));
			return -1;	
	}
	return 0;
}
