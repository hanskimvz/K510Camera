var g_snapshotUrl = "/nvc-cgi/admin/snapshot.fcgi";

function qtime_start(streamUri, width, height)
{
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
	objStr += "</object>";
	objStr += "</div>";

	$("#screen").html(objStr);

	if(haveqt == false)
	{
		qtime_error();
		return false;
	}
}

function qtime_error()
{
	setTimeout(startSnapshot, 1000);
}

function activex_error()
{
	startSnapshot();
}

function startSnapshot()
{
	$("#screen").empty();
	$("#screen").append("<img>")
		.find("img:last").attr("id", "snapshotArea");
		
	$("#snapshotArea").attr({
		width: g_width,
		height: g_height
	});

	$("#snapshotArea").hide();
	reflashImage();
}

function reflashImage() 
{
	var flag = false;
	loadImage = function() {
		$("#snapshotArea").attr("src", ImageBuf.src);
		$("#snapshotArea").show();
		if(flag == false)
		{
			ResizePage();
			flag = true;
		}
		
		setTimeout(function() {
			ImageBuf.src = g_snapshotUrl + "?_=" + (new Date()).getTime();
		}, 200);
	}
	var ImageBuf = new Image();
	$(ImageBuf).load(loadImage);
	$(ImageBuf).error(function() {
		setTimeout(function() {
			ImageBuf.src = g_snapshotUrl + "?_=" + (new Date()).getTime();
		}, 1000);
	});
	ImageBuf.src = g_snapshotUrl;
}