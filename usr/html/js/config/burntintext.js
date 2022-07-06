var DefaultGroup = "BITXT";
var playChk = 0;
var nSelectedStream = 0;
var snapshot_play = false;
var snapshot_url = "/uapi-cgi/snapshot.fcgi";
var Width = 608;
var Height = 342;
var g_flagView = true;

$(function () {
	PreCustomize();
	initEnvironment();
	LoadParamJs("BITXT&ENCODER&NETWORK&VIDEOIN", Run);
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum = ["04020439", "0501"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "burntintext", 
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

function Run()
{
	var changeWidthHeight = adjustRatioWidthHeight(VIDEOIN_CH0_CMOS_RATIO, Height);
	Width = changeWidthHeight[0];
	Height = changeWidthHeight[1];

	InitForm();
	InitSetting(nSelectedStream);
	EventBind();
	ContentShow();
	InitStartVideo();
	PostCustomize();
}

function InitForm_Each(idx)
{
	$this = $("#stream_tab > div").eq(idx);

	if(!$this.html())
	{
		$this.html($("#stream_source").html());

		SetRelation(idx);
	}
	else
	{
		return false;
	}
	return $this;
}

function InitForm()
{
	$("#stream_tab").tabs({
		select: function(event, ui)
		{
			nSelectedStream = ui.index;
			InitForm_Each(nSelectedStream)
			InitSetting(nSelectedStream);
		}
	});
	InitForm_Each(nSelectedStream);

	$("#formBitxtName:text").keyup(function(){
		LimitCharac("formBitxtName:text", 48);
	});
	$("button#btnApply").button();
	$("button#btnView").button();
	$("button#btnPopup").button();
}

function InitSetting(idx)
{
	$this = $("#stream_tab > div").eq(idx);
	var group = "BITXT" + "_CH0_ST"+ idx;

	if(eval(group+"_ENABLE") == "yes")
	{
		$("#formBitxtEnable:checkbox", $this).attr("checked", "checked");
	}
	else
	{
		$("#formBitxtEnable:checkbox", $this).attr("checked", "");
	}
	if(eval(group+"_DATE_ENABLE") == "yes")
	{
		$("#formBitxtDateEnable:checkbox", $this).attr("checked", "checked");
	}
	else
	{
		$("#formBitxtDateEnable:checkbox", $this).attr("checked", "");
	}
	if(eval(group+"_TIME_ENABLE") == "yes")
	{
		$("#formBitxtTimeEnable:checkbox", $this).attr("checked", "checked");
	}
	else
	{
		$("#formBitxtTimeEnable:checkbox", $this).attr("checked", "");
	}
	if(eval(group+"_NAME_ENABLE") == "yes")
	{
		$("#formBitxtNameEnable:checkbox", $this).attr("checked", "checked");
	}
	else
	{
		$("#formBitxtNameEnable:checkbox", $this).attr("checked", "");
	}

	if(eval(group+"_TIME_MILLISEC") == "yes")
	{
		$("#formBitxtTimeMillisec:checkbox", $this).attr("checked", "checked");
	}

	// Select의 Option값중에서 존재하지 않는 경우(custom) 처리하기 위해서 each문을 이용한다.
	// Date Position
	var arr = String(eval(group+"_DATE_POSITION")).split(":");
	$("select#formBitxtDatePosition option[value='custom']", $this).attr("selected", "selected");
	$("select#formBitxtDatePosition", $this).children().each(function() {
		if($(this).attr("value") == parseInt(arr[0], 10) + ":" + parseInt(arr[1], 10))
		{
			$(this).attr("selected", "selected");
			return;
		}
	});
	$("select#formBitxtDatePosition", $this).change();
	$("#formBitxtDatePositionX:text", $this).val(parseInt(arr[0], 10));
	$("#formBitxtDatePositionY:text", $this).val(parseInt(arr[1], 10));

	// Time Position
	var arr = String(eval(group+"_TIME_POSITION")).split(":");
	$("select#formBitxtTimePosition option[value='custom']", $this).attr("selected", "selected");
	$("select#formBitxtTimePosition", $this).children().each(function() {
		if($(this).attr("value") == parseInt(arr[0], 10) + ":" + parseInt(arr[1], 10))
		{
			$(this).attr("selected", "selected");
			return;
		}
	});
	$("select#formBitxtTimePosition", $this).change();
	$("#formBitxtTimePositionX:text", $this).val(parseInt(arr[0], 10));
	$("#formBitxtTimePositionY:text", $this).val(parseInt(arr[1], 10));

	// Name
	$("#formBitxtName:text", $this).val(eval(group+"_NAME_TEXT"));

	// NamePosition
	var arr = String(eval(group+"_NAME_POSITION")).split(":");
	$("select#formBitxtNamePosition option[value='custom']", $this).attr("selected", "selected");
	$("select#formBitxtNamePosition", $this).children().each(function() {
		if($(this).attr("value") == parseInt(arr[0], 10) + ":" + parseInt(arr[1], 10))
		{
			$(this).attr("selected", "selected");
			return;
		}
	});
	$("select#formBitxtNamePosition", $this).change();
	$("#formBitxtNamePositionX:text", $this).val(parseInt(arr[0], 10));
	$("#formBitxtNamePositionY:text", $this).val(parseInt(arr[1], 10));
}

function validatePosition(id, defaultVal)
{
	var positionText = $(id).val();
	var positionVal = positionText - 0;

	$(id).val(positionVal);
	if(positionText === "" || positionVal < 0 || positionVal > 100)
	{
		$(id).val(parseInt(defaultVal, 10)).focus();
		alert(GetMsgLang("04020439"));
	}
}

function SetRelation(idx)
{
	$this = $("#stream_tab > div").eq(idx);
	var group = "BITXT" + "_CH0_ST"+ idx;

	// Date Position
	$("select#formBitxtDatePosition", $this).change(function() {
		if($(this).val() == "custom")
		{
			Enable($("#formBitxtDatePositionX:text", $this));
			Enable($("#formBitxtDatePositionY:text", $this));
		}
		else
		{
			var arr = $(this).val().split(":");
			$("#formBitxtDatePositionX:text", $this).val(arr[0]);
			$("#formBitxtDatePositionY:text", $this).val(arr[1]);

			Disable($("#formBitxtDatePositionX:text", $this));
			Disable($("#formBitxtDatePositionY:text", $this));
		}
	});

	// Time Position
	$("select#formBitxtTimePosition", $this).change(function() {
		if($(this).val() == "custom")
		{
			Enable($("#formBitxtTimePositionX:text", $this));
			Enable($("#formBitxtTimePositionY:text", $this));
		}
		else
		{
			var arr = $(this).val().split(":");
			$("#formBitxtTimePositionX:text", $this).val(arr[0]);
			$("#formBitxtTimePositionY:text", $this).val(arr[1]);

			Disable($("#formBitxtTimePositionX:text", $this));
			Disable($("#formBitxtTimePositionY:text", $this));
		}
	});

	// Name Position
	$("select#formBitxtNamePosition", $this).change(function() {
		if($(this).val() == "custom")
		{
			Enable($("#formBitxtNamePositionX:text", $this));
			Enable($("#formBitxtNamePositionY:text", $this));
		}
		else
		{
			var arr = $(this).val().split(":");
			$("#formBitxtNamePositionX:text", $this).val(arr[0]);
			$("#formBitxtNamePositionY:text", $this).val(arr[1]);

			Disable($("#formBitxtNamePositionX:text", $this));
			Disable($("#formBitxtNamePositionY:text", $this));
		}
	});

	// Number only
	$("#formBitxtDatePositionX:text").numeric();
	$("#formBitxtDatePositionY:text").numeric();
	$("#formBitxtTimePositionX:text").numeric();
	$("#formBitxtTimePositionY:text").numeric();
	$("#formBitxtNamePositionX:text").numeric();
	$("#formBitxtNamePositionY:text").numeric();

	var arrDate = String(eval(group+"_DATE_POSITION")).split(":");
	var arrTime = String(eval(group+"_TIME_POSITION")).split(":");
	var arrName = String(eval(group+"_NAME_POSITION")).split(":");

	// Text box 숫자범위
	$("#formBitxtDatePositionX:text").blur(function() {
		validatePosition("#formBitxtDatePositionX:text", arrDate[0]);
	});
	$("#formBitxtDatePositionY:text").blur(function() {
		validatePosition("#formBitxtDatePositionY:text", arrDate[1]);
	});
	$("#formBitxtTimePositionX:text").blur(function() {
		validatePosition("#formBitxtTimePositionX:text", arrTime[0]);
	});
	$("#formBitxtTimePositionY:text").blur(function() {
		validatePosition("#formBitxtTimePositionY:text", arrTime[1]);
	});
	$("#formBitxtNamePositionX:text").blur(function() {
		validatePosition("#formBitxtNamePositionX:text", arrTime[0]);
	});
	$("#formBitxtNamePositionY:text").blur(function() {
		validatePosition("#formBitxtNamePositionY:text", arrTime[1]);
	});
}

function EventBind()
{
	var Req = new CGIRequest();
	var playStatus = "STOP";
	var preSize = "";

	Enable($("button#btnApply"));

	$("button#btnApply").click(function() {
		var reqQString = "action=update&xmlschema";
		if($("#formBitxtDatePositionX:text", $this).val() < 0 || $("#formBitxtDatePositionX:text", $this).val() >100 || $("#formBitxtDatePositionX:text", $this).val() == "") return;
		if($("#formBitxtDatePositionY:text", $this).val() < 0 || $("#formBitxtDatePositionY:text", $this).val() >100 || $("#formBitxtDatePositionY:text", $this).val() == "") return;
		if($("#formBitxtTimePositionX:text", $this).val() < 0 || $("#formBitxtTimePositionX:text", $this).val() >100 || $("#formBitxtTimePositionX:text", $this).val() == "") return;
		if($("#formBitxtTimePositionY:text", $this).val() < 0 || $("#formBitxtTimePositionY:text", $this).val() >100 || $("#formBitxtTimePositionY:text", $this).val() == "") return;
		if($("#formBitxtNamePositionX:text", $this).val() < 0 || $("#formBitxtNamePositionX:text", $this).val() >100 || $("#formBitxtNamePositionX:text", $this).val() == "") return;
		if($("#formBitxtNamePositionY:text", $this).val() < 0 || $("#formBitxtNamePositionY:text", $this).val() >100 || $("#formBitxtNamePositionY:text", $this).val() == "") return;

		$this = $("#stream_tab > div").eq(nSelectedStream);

		QString = makeQString();
		QString
			.set_action('update')
			.set_schema('xml')
			.add_list("BITXT.Ch0.St0.enable", BITXT_CH0_ST0_ENABLE, ($("#formBitxtEnable:checkbox", $this).attr("checked") == true) ? "yes":"no")
			.add_list("BITXT.Ch0.St0.Date.enable", BITXT_CH0_ST0_DATE_ENABLE, ($("#formBitxtDateEnable:checkbox", $this).attr("checked") == true) ? "yes":"no")
			.add_list("BITXT.Ch0.St0.Time.enable", BITXT_CH0_ST0_TIME_ENABLE, ($("#formBitxtTimeEnable:checkbox", $this).attr("checked") == true) ? "yes":"no")
			.add_list("BITXT.Ch0.St0.Name.enable", BITXT_CH0_ST0_NAME_ENABLE, ($("#formBitxtNameEnable:checkbox", $this).attr("checked") == true) ? "yes":"no")
			.add_list("BITXT.Ch0.St0.Time.millisec", BITXT_CH0_ST0_TIME_MILLISEC, ($("#formBitxtTimeMillisec:checkbox", $this).attr("checked") == true) ? "yes":"no")
			.add_list("BITXT.Ch0.St0.Date.position", encodeURIComponent(BITXT_CH0_ST0_DATE_POSITION), $("#formBitxtDatePositionX:text", $this).val() + "%25" + "%3A" + $("#formBitxtDatePositionY:text", $this).val()+ "%25")
			.add_list("BITXT.Ch0.St0.Time.position", encodeURIComponent(BITXT_CH0_ST0_TIME_POSITION), $("#formBitxtTimePositionX:text", $this).val() + "%25" + "%3A" + $("#formBitxtTimePositionY:text", $this).val()+ "%25")
			.add_list("BITXT.Ch0.St0.Name.position", encodeURIComponent(BITXT_CH0_ST0_NAME_POSITION), $("#formBitxtNamePositionX:text", $this).val() + "%25" + "%3A" + $("#formBitxtNamePositionY:text", $this).val()+ "%25")
			.add_list("BITXT.Ch0.St0.Name.text", encodeURIComponent(BITXT_CH0_ST0_NAME_TEXT), encodeURIComponent($("#formBitxtName:text", $this).val()));
		reqQString = QString.get_qstring();

		if(!reqQString) {
			return;
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

			_debug("update - " + reqQString);

			LoadParamJs(DefaultGroup+"&cache", function() {
				InitSetting(nSelectedStream);
				ViewLoadingSave(false);
			});
			return;
		});

		_debug("start " + reqQString);
		Req.Request(reqQString);
	});
	$("#btnView").toggle(
		function(){
			g_flagView = false;
			preSize = parent.document.getElementById("contentFrame").height - (Height + 15);
			playStatus = "STOP";
			if(browserCheck() == "msie")
			{
				if(playChk != 0)
				{
					player_start(playStatus);
				}

				$("#viewToggle").css("display", "none");
				ResizePage(preSize);
			}
			else
			{
				if(playChk != 0)
				{
					qtime_start(playStatus);
				}

				$("#viewToggle").css("display", "none");
				ResizePage(preSize);
			}
		},
		function(){
			g_flagView = true;
			playStatus = "PLAY";
			if(browserCheck() == "msie")
			{
				if(playChk != 1)
				{
					player_start(playStatus);
				}

				$("#viewToggle").css("display", "block");
				ResizePage();
				parent.$('html, body').animate({scrollTop:10000}, 0);
			}
			else
			{
				if(playChk != 1)
				{
					qtime_start(playStatus);
				}

				$("#viewToggle").css("display", "block");
				ResizePage();
				parent.$('html, body').animate({scrollTop:10000}, 0);
			}
		}
	);

	$("#btnPopup").click(function()
	{
		if(g_flagView == true)
		{
			$("#btnView").click();
		}

		var pageWidth=670;
		var pageHeight = 460;
		if(Width < Height)
		{
			pageHeight = 730;
		}
			 
		var previewSrc = "/config/popup.html"
		var previewParam = "scrollbars=yes,toolbar=0,location=no,directories=0,status=0,menubar=0,resizable=1,width="+pageWidth+",height="+pageHeight;
		window.open(previewSrc, "Popup", previewParam);
	});
}

function player_start(playStatus)
{
	if(playStatus == "STOP")
	{
		playChk = 0;
		AxUMF_stop();
	}
	else if(playStatus == "PLAY")
	{
		playChk = 1;
		AxUMF_play();
	}
}

function qtime_start(playStatus)
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

	// stream Name select
	var streamNum = 0;
	var trans = "UNICAST";
	var rtspPort = NETWORK_RTSP_PORT;
	var ipAddr = document.domain;
	var firstStreamEnable = eval("ENCODER_CH0_VIDEOCODEC_ST0_ENABLE");
	var secondStreamEnable = eval("ENCODER_CH0_VIDEOCODEC_ST1_ENABLE");
	var streamUri = "rtsp://" + ipAddr + ":" + rtspPort +"/";

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
	objStr += "</object>";
	objStr += "</div>";

	$("#screen").html(objStr);

	if(haveqt == false)
	{
		qtime_error();
		return;
	}
}

function InitStartVideo()
{
	playChk = 1;
	playStatus = "PLAY";
	snapshot_play = false;

	SetRotateSize();

	if(browserCheck() == "msie")
	{
		AxUMF_create(Width,
								 Height,
								 StartSnapshot,
								 function () {
									 playChk = 1;		
									 if(AxUMF !== undefined)
									{
										AxUMF.SetParam("CONTROL", "AUDIO", "OFF");
									}
								 }, 
								 null);
		ResizePage();
	}
	else
	{
	if(NETWORK_SRTP_ENABLE=="yes")
	{
		StartSnapshot();
	}
	else
	{
		qtime_start(playStatus);
	}
	ResizePage();
	}
}

function qtime_error()
{
	setTimeout(StartSnapshot, 1000);
}

function activex_error()
{
	StartSnapshot();
}

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
