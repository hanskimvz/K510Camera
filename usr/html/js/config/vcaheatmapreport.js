/*	This file uses JsDoc Toolkit documentation.
 *	http://code.google.com/p/jsdoc-toolkit/
 */

/**	@fileOverview This file contains the control code for the VCA heatmap report page.
 *	@author VCA Technology
 */

/*jslint
	devel:		true,
	browser:	true,
	es5:		true,
	vars:		true,
	plusplus:	true,
	maxerr:		50,
	indent:		4,
 */

/*global
	CAP,
	CAP.VCA,
 */
/*
$(function () {
});*/

(function (CAP, VCA, window, undefined)
{
	//"use strict";
	// Local copies of the window objects for speed
	var document	= window.document;
	var navigator	= window.navigator;
	var location	= window.location;
	var $ = window.$;

	// Check the CAP namespace has been included
	if ((CAP === undefined) || (VCA === undefined) || ($ === undefined))
	{
		console.error("CAP.VCA: Error: You must include the base CAP library, VCA and jQuery");
		return;
	}

	var page = {};

	page.enums =
	{
		gHeatmapSize:[
			["160 * 90", 160, 90],
			["320 * 180", 320, 180],
			["480 * 270", 480, 270],
			["640 * 360", 640, 360]
		],
	};

	page.members =
	{
		gStorageDeviceFound: false,
		gDefaultGroup: "VCA.Ch0.Hm",
		gExternalSize: 0,
		gMaxStoreSize: 0,
		gOpenMode: "",
		gMissWdList: false
	};

	page.eventCallback =
	{
		WaitLoadingSave:function(flag, message)
		{
			if(flag == false)
			{
				$("#waitmessage").hide(100, function()
				{
					$(this).remove();
				});
			}
			else
			{
				$("#waitmessage").each(function()
				{
					$(this).remove();
				});
				// ViewLoading Message show ???? button ????
				$("#config-page").append("<div id='waitmessage' style='position: absolute; top:30%; left:30%'><img src='/images/loading.gif'></img>"+ message +"</div>\n");
				$("#waitmessage").show("fast");
			}
			return;
		},

		annotateframeChange:function(flag, message)
		{
			$("#heatmapsize").attr("disabled", $("#annotateframe").attr("checked"));
			$("#annotateframelabel").toggle($("#annotateframe").attr("checked"));
		},

		pngButtonClick:function(flag, message)
		{
			page.methods.submitRequest("png");
		},

		applyButtonClick:function(flag, message)
		{
			page.eventCallback.submit();
		},

		enableDbServiceChange:function(flag, message)
		{
			var movobjenable = CAP.ajax.getServerData("VCA.Ch0.enablemovobj", true);
			if ($("#enabledbservice").attr("checked") == true)
			{
				if (movobjenable == "no")
				{
					alert("Object tracking must be enabled at the VCA Enable/Disable page in order to enable heatmap feature.");
					$("#enabledbservice").attr("checked", false);
				}
				else
				{
					$("#btnApply").button({disabled: false});
				}
			}
			else
			{
				$("#btnApply").button({disabled: false});
			}
		},

		submit:function (event)
		{
			QString = makeQString();
			QString.set_action('update').add_list("group=VCA.Ch0.Hm&enable", "", ($("#enabledbservice:checkbox").attr("checked") == true) ? "yes" : "no");

			reqQString = QString.get_qstring();
			var actionReq = new CGIRequest();
			actionReq.SetAddress("/uapi-cgi/param.cgi");
			actionReq.SetStartFunc(ViewLoadingSave);
			actionReq.SetCallBackFunc(function(xml)
			{
				top.$(window.top).bind('capServerDataRefresh', page.methods.endRefresh);
				page.methods.startRefresh();
			});
			actionReq.Request(reqQString);

			return;
		},

		updateData:function(event)
		{
			page.methods.initElements();
		}
	};

	page.methods =
	{
		init:function()
		{
			try
			{
				var object = 0;
				CAP.logging.verbose("Initialising heatmap page...");

				//Start loading the config if necessary:
				CAP.loadConfig();

				// Attach new listeners
				top.$(window.top).bind('capServerDataRefresh', page.eventCallback.updateData);

				// Call the common functions to show the page
				// TODO: This should be phased out in future releases.
				CAP.page.show(window);

				page.methods.initUriRequestElement();

				if (!CAP.VCA.initialized())
				{
					top.$(window.top).bind("capVcaInitialized", page.methods.init);
					CAP.logging.info("VCA not initialized.  Page initialization is waiting for \"capVcaInitialized\" event");
					return;
				}

				// Language
				var classNum = ["04051436", "04051437", "04051438", "04051439",
								"040501000", "040501001", "040501002", "040501003",
								"040501004", "040501005", "040501006", "0501"];
				InitMsgLang(classNum);
				getLangEnvironment("heatmapreport");

				ResizePage(700);
				$("#usecolor").change(page.eventCallback.colorChange);
				$("#annotateframe").change(page.eventCallback.annotateframeChange);
				$("#heatmapwidth").numeric();
				$("#heatmapheight").numeric();
				$("#btnPNG").button().click(page.eventCallback.pngButtonClick);
				$("#enabledbservice").change(page.eventCallback.enableDbServiceChange);
				$("#btnApply").button().click(page.eventCallback.applyButtonClick);
				page.methods.initElements();
				CAP.logging.info("Heatmap report page Initialisation...DONE!");
			}
			catch (exception)
			{
				CAP.logging.error("Heatmap report page initialisation...FAILED: " + exception);
				return;
			}
		},

		uninit:function ()
		{
			//Remove event handlers:
			top.$(window.top).unbind("capVcaInitialized", page.methods.init);
			top.$(window.top).unbind('capServerDataRefresh', page.eventCallback.updateData);
		},

		startRefresh:function()
		{
			CAP.ajax.reloadServerData();
		},

		endRefresh:function()
		{
			ViewLoadingSave(false);
			page.methods.initElements();
			top.$(window.top).unbind('capServerDataRefresh', page.methods.endRefresh);
		},

		initElements:function()
		{
			page.eventCallback.annotateframeChange();
			page.methods.setButtons();
			page.methods.initEnableDbService();
			page.methods.initHeatmapSize();
		},

		initUriRequestElement:function()
		{
			if($.browser.msie == true)
			{
				$("#requesturi").attr("cols", 75);
			}
			else if($.browser.mozilla == true)
			{
				$("#requesturi").attr("cols", 55);
			}
			else
			{
				$("#requesturi").attr("cols", 50);
			}
		},

		initEnableDbService:function()
		{
			var enable = CAP.ajax.getServerData("VCA.Ch0.Hm.enable", true);
			if (enable == "yes")
			{
				$("#enabledbservice").attr("checked", true);
			}
			else
			{
				$("#enabledbservice").attr("checked", false);
			}
		},

		initHeatmapSize:function()
		{
			var sizeList = $("#heatmapsize");
			sizeList.empty();
			for(var i = 0; i < page.enums.gHeatmapSize.length; i++)
			{
				var name = page.enums.gHeatmapSize[i][0];
				var option = document.createElement("option");
				option.id = i;
				option.text = name;
				sizeList[0].options.add(option);
			}
		},

		setButtons:function()
		{
			$("#btnApply").button({disabled: true});
			var enable = CAP.ajax.getServerData("VCA.Ch0.Hm.enable", true);
			if (enable == "no")
			{
				$("#btnPNG").button({disabled: true});
				$("#servicedisabled").toggle(true);
			}
			else
			{
				var tableId = $("#tableselect").attr("selectedIndex");
				enable = CAP.ajax.getServerData("VCA.Ch0.Hm.Tb3.enable",true);
				if (enable == "yes")
				{
					$("#btnPNG").button({disabled: false});
					$("#servicedisabled").toggle(false);
				}
				else
				{
					$("#btnPNG").button({disabled: true});
					$("#servicedisabled").toggle(true);
				}
			}
		},

		fillUri: function(addressStr, requestStr)
		{
			var sz = location.protocol+"//"+location.host;
			sz += addressStr;
			sz += "?";
			sz += requestStr;

			return sz;
		},

		submitRequest:function(type)
		{
			ViewLoadingSave(true);
			var actionReq = new CGIRequest();
			var reqQString = "reportfmt=" + type;
			reqQString += "&table=3";
			reqQString += "&from=yesterday";
			reqQString += "&to=today";
			if ($("#annotateframe").attr("checked") == true)
				reqQString += "&annotateframe=0";
			else
				reqQString += "&annotateframe=none";
			if ($("#usecolor").attr("checked") == true)
				reqQString += "&colorheatmap=yes";
			else
				reqQString += "&colorheatmap=no";
			var heatmapSize = $("#heatmapsize").attr("selectedIndex");
			reqQString += "&heatmapwidth=" + page.enums.gHeatmapSize[heatmapSize][1];
			reqQString += "&heatmapheight=" + page.enums.gHeatmapSize[heatmapSize][2];

			var href = page.methods.fillUri("/uapi-cgi/reporthm.cgi", reqQString);
			var then = new Date();
			$.ajax({
				url: href,
				success: function() {
					var now = new Date();
					var duration = now - then + 2000;
					document.location.href = href;
					window.setTimeout(function() {
						ViewLoadingSave(false);
					}, duration);
				}
			});
		}
	};
	// Initialise the page when the DOM loads
	$(document).ready(page.methods.init);
	// Finalise the page when the DOM unloads
	$(window).unload(page.methods.uninit);
}(CAP, CAP.VCA, window));

//XSToolTip
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
			curtop += obj.offsetTop
			obj = obj.offsetParent;
		}
	}
	else if (obj.y)
		curtop += obj.y;
	return curtop;
}

function xtooltip_show(tooltipId, parentId, posX, posY)
{
	it = document.getElementById(tooltipId);

	if (it.style.first)
	{
		it.style.first = 0;
		// need to fixate default size (MSIE problem)
		it.style.width = it.offsetWidth + 'px';
		it.style.height = it.offsetHeight + 'px';
	}

	{
		img = document.getElementById(parentId);

		// if tooltip is too wide, shift left to be within parent
		//if (posX + it.offsetWidth > img.offsetWidth) posX = img.offsetWidth - it.offsetWidth;
		//if (posX < 0 ) posX = 0;

		var x = xstooltip_findPosX(img,1) + posX;
		var y = xstooltip_findPosY(img,0) + posY;

		it.style.top = y + 'px';
		it.style.left = x + 'px';
	}

	it.style.visibility = 'visible';
}

function xtooltip_hide(tooltipId)
{
	it = document.getElementById(tooltipId);
	it.style.visibility = 'hidden';
}
