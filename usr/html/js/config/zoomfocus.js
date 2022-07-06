var chk = 0;
var resChk = 0;

$(function () {
	PreCustomize();
	initEnvironment();
	initBrand();
	LoadParamJs("VIDEOIN.Ch0.Rotate.direction", mainRun);
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	InitMsgLang("0501");
	setLanguage(parent.g_configData.langPath, setup + maincontents + "zoomfocus", 
				parent.g_langData[parent.g_configData.language]);
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

function mainRun()
{
	Disable($("button").button());
	ContentShow();
	EventBind();
	initResize();
	PostCustomize();
}

function initResize()
{
	if(VIDEOIN_CH0_ROTATE_DIRECTION != "none")
	{
		var controlMenu = $(".controlMenu").height();
		var viewFrame = $("#viewFrame").width();

		ResizePage(controlMenu + viewFrame);
		$("#viewFrame").height(viewFrame);
	}
}

function actionMove(opString)
{
	var req = new CGIRequest();
	var reqQString = "&xmlschema";

	reqQString += opString;
	req.SetAddress("/uapi-cgi/uptz.cgi");
	req.SetCallBackFunc(function(xml){});
	req.Request(reqQString);
}

function actionMove2(opString)
{
	var actionReq = new CGIRequest();
	var reqQString = "";

	reqQString += opString;
	actionReq.SetAddress("/nvc-cgi/ptz/ptz2.fcgi");
	actionReq.SetCallBackFunc(function(xml){
		resChk = 0;
		ViewLoadingSave(false);
		return;
	});
	actionReq.Request(reqQString);
}

function actionStop(opStr)
{
	if(chk == 1)
	{
		var t=0;
		t = setInterval(function(){
			if(resChk == 0)
			{
				actionMove2(opStr);
				clearInterval(t);
			}
		}, 10);
		chk = 0;
	}
}

function EventBind()
{
	Enable($("button"));
	if( parent.g_brand.mfzCtrl == "en773v")
	{
		var opStrPtzStop = "cpantiltzoommove=0,0,0";
		var opStrFocusStop = "cfocusmove=0";
		// Zoom
		$("#tele_l3").mousedown(function(){
			var opStr = "cpantiltzoommove=0,0," + 100;
			if(resChk == 1)
				return;
			actionMove2(opStr);

			chk = 1;
			resChk = 1;
		}).mouseup(function(){
			actionStop(opStrPtzStop);
		}).mouseout(function(){
			actionStop(opStrPtzStop);
		});
		$("#tele_l2").mousedown(function(){
			var opStr = "cpantiltzoommove=0,0," + 50;
			if(resChk == 1)
				return;
			actionMove2(opStr);

			chk = 1;
			resChk = 1;
		}).mouseup(function(){
			actionStop(opStrPtzStop);
		}).mouseout(function(){
			actionStop(opStrPtzStop);
		});
		$("#tele_l1").mousedown(function(){
			var opStr = "cpantiltzoommove=0,0," + 1;
			if(resChk == 1)
				return;
			actionMove2(opStr);

			chk = 1;
			resChk = 1;
		}).mouseup(function(){
			actionStop(opStrPtzStop);
		}).mouseout(function(){
			actionStop(opStrPtzStop);
		});
		$("#zoom_r3").mousedown(function(){
			var opStr = "cpantiltzoommove=0,0," + "-" + 100;
			if(resChk == 1)
				return;
			actionMove2(opStr);
			chk = 1;
			resChk = 1;
		}).mouseup(function(){
			actionStop(opStrPtzStop);
		}).mouseout(function(){
			actionStop(opStrPtzStop);
		});
		$("#zoom_r2").mousedown(function(){
			var opStr = "cpantiltzoommove=0,0," + "-" + 50;
			if(resChk == 1)
				return;
			actionMove2(opStr);
			chk = 1;
			resChk = 1;
		}).mouseup(function(){
			actionStop(opStrPtzStop);
		}).mouseout(function(){
			actionStop(opStrPtzStop);
		});
		$("#zoom_r1").mousedown(function(){
			var opStr = "cpantiltzoommove=0,0," + "-" + 1;
			if(resChk == 1)
				return;
			actionMove2(opStr);
			chk = 1;
			resChk = 1;
		}).mouseup(function(){
			actionStop(opStrPtzStop);
		}).mouseout(function(){
			actionStop(opStrPtzStop);
		});

		// Focus
		$("#focus_l3").mousedown(function(){
			var opStr = "cfocusmove=" + 100;
			if(resChk == 1)
				return;
			actionMove2(opStr);
			chk = 1;
			resChk = 1;
		}).mouseup(function(){
			actionStop(opStrFocusStop);
		}).mouseout(function(){
			actionStop(opStrFocusStop);
		});
		$("#focus_l2").mousedown(function(){
			var opStr = "cfocusmove=" + 50;
			if(resChk == 1)
				return;
			actionMove2(opStr);
			chk = 1;
			resChk = 1;
		}).mouseup(function(){
			actionStop(opStrFocusStop);
		}).mouseout(function(){
			actionStop(opStrFocusStop);
		});
		$("#focus_l1").mousedown(function(){
			var opStr = "cfocusmove=" + 1;
			if(resChk == 1)
				return;
			actionMove2(opStr);
			chk = 1;
			resChk = 1;
		}).mouseup(function(){
			actionStop(opStrFocusStop);
		}).mouseout(function(){
			actionStop(opStrFocusStop);
		});
		$("#far_r3").mousedown(function(){
			var opStr = "cfocusmove=" + "-" + 100;
			if(resChk == 1)
				return;
			actionMove2(opStr);
			chk = 1;
			resChk = 1;
		}).mouseup(function(){
			actionStop(opStrFocusStop);
		}).mouseout(function(){
			actionStop(opStrFocusStop);
		});
		$("#far_r2").mousedown(function(){
			var opStr = "cfocusmove=" + "-" + 50;
			if(resChk == 1)
				return;
			actionMove2(opStr);
			chk = 1;
			resChk = 1;
		}).mouseup(function(){
			actionStop(opStrFocusStop);
		}).mouseout(function(){
			actionStop(opStrFocusStop);
		});
		$("#far_r1").mousedown(function(){
			var opStr = "cfocusmove=" + "-" + 1;
			if(resChk == 1)
				return;
			actionMove2(opStr);
			chk = 1;
			resChk = 1;
		}).mouseup(function(){
			actionStop(opStrFocusStop);
		}).mouseout(function(){
			actionStop(opStrFocusStop);
		});
		$("#btnAF").click(function() {actionMove2("&autofocus=0")});
		$("#btnZoomFocus").click(function(){actionMove2("&aux=calibration")});
	}
	else
	{
		$("#tele_l3").mousedown(function(){actionMove("&stepmove=zoomtele&step=3")});
		$("#tele_l2").mousedown(function(){actionMove("&stepmove=zoomtele&step=2")});
		$("#tele_l1").mousedown(function(){actionMove("&stepmove=zoomtele&step=1")});
		$("#zoom_r3").mousedown(function(){actionMove("&stepmove=zoomwide&step=3")});
		$("#zoom_r2").mousedown(function(){actionMove("&stepmove=zoomwide&step=2")});
		$("#zoom_r1").mousedown(function(){actionMove("&stepmove=zoomwide&step=1")});

		$("#focus_l3").mousedown(function(){actionMove("&stepmove=focusnear&step=3")});
		$("#focus_l2").mousedown(function(){actionMove("&stepmove=focusnear&step=2")});
		$("#focus_l1").mousedown(function(){actionMove("&stepmove=focusnear&step=1")});
		$("#far_r3").mousedown(function(){actionMove("&stepmove=focusfar&step=3")});
		$("#far_r2").mousedown(function(){actionMove("&stepmove=focusfar&step=2")});
		$("#far_r1").mousedown(function(){actionMove("&stepmove=focusfar&step=1")});

		$("#btnAF").click(function() {actionMove("&autofocus")});
		$("#btnZoomFocus").click(function(){actionMove("&calibrate=zoom,focus")});
	}
}
