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
/*\
|*|	
|*|	polyfilling the subset of iso8601 dates used by JavaScript (ECMAScript-262 v5.1)
|*|	- ck 02/07/2012 
|*|	- ck 01/21/2013 - updated with stuff about the upcoming ES6.0 shift (see other version of this file)
|*|	testing ground: http://jsbin.com/akagim/10
|*|		ref:
|*|			http://dev.w3.org/html5/spec/common-microsyntaxes.html
|*|			http://www.ecma-international.org/ecma-262/5.1/#sec-15.9.1.15
|*|			http://msdn.microsoft.com/en-us/library/windows/apps/ff743760(v=vs.94).aspx
|*|			http://msdn.microsoft.com/en-us/library/windows/apps/wz6stk2z(v=vs.94).aspx
|*|			http://msdn.microsoft.com/en-us/library/windows/apps/k4w173wk(v=vs.94).aspx
|*|			https://connect.microsoft.com/IE/feedback/details/723740/date-parse-and-new-date-fail-on-valid-formats
|*|	
\*/

(function() {

	var d = window.Date,
		regexIso8601 = /^(\d{4}|\+\d{6})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(?:Z|([\-+])(\d{2}):?(\d{2}))?)?)?)?$/;

	if (d.parse('2011-11-29T15:52:30.5') !== 1322581950500 ||
		d.parse('2011-11-29T15:52:30.52') !== 1322581950520 ||
		d.parse('2011-11-29T15:52:18.867') !== 1322581938867 ||
		d.parse('2011-11-29T15:52:18.867Z') !== 1322581938867 ||
		d.parse('2011-11-29T15:52:18.867-03:30') !== 1322594538867 ||
		d.parse('2011-11-29T15:52:18.867-0330') !== 1322594538867 ||
		d.parse('2011-11-29') !== 1322524800000 ||
		d.parse('2011-11') !== 1320105600000 ||
		d.parse('2011') !== 1293840000000) {

		console.log("Polyfill for MSIE Date handling in operation.");
		d.__parse = d.parse;

		d.parse = function(v) {

			var m = regexIso8601.exec(v);

			if (m) {
				return Date.UTC(
					m[1],
					(m[2] || 1) - 1,
					m[3] || 1,
					m[4] - (m[8] ? m[8] + m[9] : 0) || 0,
					m[5] - (m[8] ? m[8] + m[10] : 0) || 0,
					m[6] || 0,
					((m[7] || 0) + '00').substr(0, 3)
				);
			}

			console.log("Polyfill failed, value = " + v);
			return d.__parse.apply(this, arguments);

		};
	}

	d.__fromString = d.fromString;

	d.fromString = function(v) {

		if (!d.__fromString || regexIso8601.test(v)) {
			return new d(d.parse(v));
		}

		return d.__fromString.apply(this, arguments);
	};

})();

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

	$.urlParam = function(name){
		var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
		return results[1] || 0;
	};

	Date.prototype.toLocalISOString = function () {
		var now = this,
			tzo = -now.getTimezoneOffset(),
			dif = tzo >= 0 ? '+' : '-',
			pad = function(num) {
					var norm = Math.abs(Math.floor(num));
					return (norm < 10 ? '0' : '') + norm;
			};
		return now.getFullYear() 
			+ '-' + pad(now.getMonth()+1)
			+ '-' + pad(now.getDate())
			+ 'T' + pad(now.getHours())
			+ ':' + pad(now.getMinutes()) 
			+ ':' + pad(now.getSeconds()) 
			+ '.' + (this.getMilliseconds() / 1000).toFixed(3).slice(2, 5)
			+ dif + pad(tzo / 60) + pad(tzo % 60);
	};

	var page = {};

	page.enums =
	{
		gPredefineReqTime:[
			"one hour",
			"today",
			"yesterday",
			"one day",
			"this week",
			"last week",
			"one week",
			"this month",
			"last month"
		]
	};

	page.members =
	{
		gStorageDeviceFound: false,
		gDefaultGroup: "VCA.Ch0.Rd",
		gExternalSize: 0,
		gMaxStoreSize: 2560,
		gPrimaryTablesInDatabase: 3,
		gSecondaryTablesInDatabase: 0,
		gLoadListBoxes: false,
		gTypeOfData: "",
		gCAPTypeOfData: "",
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

		predefineChange:function(flag, message)
		{
			var predefineIndex = $("#predefinerequest").attr("selectedIndex");

			var oneMinute = 60000; //ms
			var oneHour = 60 * oneMinute; //ms
			var oneDay = 24 * oneHour;
			var oneWeek = 7 * oneDay;

			var now = Date.now();

			var date = new Date();
			date.setTime(now);

			/*var today = new Date(now
			 - date.getHours() * oneHour
			 - date.getMinutes() * oneMinute
			 - date.getSeconds() * 1000
			 - date.getMilliseconds());*/
			var today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
			var thisWeek = new Date(today - date.getDay() * oneDay);
			var thisMonth = new Date(today - (date.getDate()-1) * oneDay);
			var lastMonth = new Date(date.getFullYear(), date.getMonth()-1, 1);
			
			var from_values = [
				now - oneHour,				// one hour
				today,								// today
				today - oneDay,				// yesterday
				now - oneDay,				  // one day
				thisWeek,				      // this week
				thisWeek - oneWeek,		// last week
				now - oneWeek,				// one week
				thisMonth,						// this month
				lastMonth							// last month
			];

			var to_values = [
				now,
				now,
				today,
				now,
				now,
				thisWeek,
				now,
				now,
				thisMonth
			];

			var from_ = new Date(from_values[predefineIndex]).toLocalISOString();
			var to_ = new Date(to_values[predefineIndex]).toLocalISOString();
			$("#from-ts").val(from_);
			$("#to-ts").val(to_);
		},

		retrieveButtonClick:function(flag, message)
		{
			page.methods.submitRequest("csv");
		},

		applyButtonClick:function(flag, message)
		{
			page.eventCallback.submit();
		},

	  AllButtonClick:function(flag, message)
		{
			$('#lstAll option').appendTo('#lstIn');
		},

		AddButtonClick:function(flag, message)
		{
			$('#lstAll option:selected').appendTo('#lstIn');
		},

		RemoveButtonClick:function(flag, message)
		{
			$('#lstIn option:selected').appendTo('#lstAll');
		},

		ClearButtonClick:function(flag, message)
		{
			$('#lstIn option').appendTo('#lstAll');
		},

		enableDbServiceChange:function(flag, message)
		{
			console.log("changed!");
			// $("#btnApply").prop("disabled", false);
			Enable($("#btnApply"));
		},

		storageSelectionChange:function(flat, message)
		{
			page.methods.initDbMaxSizeInfo();
			Enable($('#btnApply'));
		},

		submit:function (event)
		{
			var total = parseInt($("#dbusersize").val());
      var allowed = parseInt($("#dbtotalsize").val());
      if(total > allowed) {
				alert(GetMsgLang("04051531"));
				return;
			}

			var cap_elm = page.members.gCAPTypeOfData;
			var cap_filesize = "VCA.Ch0.Rd." + cap_elm + ".filesize";
			var cap_numfiles = "VCA.Ch0.Rd." + cap_elm + ".numfiles";
			var filesize = CAP.ajax.getServerData(cap_filesize, true) / 1024;
			var cnumfiles = parseInt(CAP.ajax.getServerData(cap_numfiles, true));
			
			// Solved this by calculating total_space (old 'actual' used space), and finding ratio with new value.

			var primary_tables_space = cnumfiles*page.members.gPrimaryTablesInDatabase;
			var secondary_table_space = cnumfiles*page.members.gSecondaryTablesInDatabase;
			var total_space =  (primary_tables_space + secondary_table_space) * filesize;

			var ratio = total / total_space;

			// var total_primary = total - (page.members.gSecondaryTablesInDatabase*cnumfiles*filesize);
			// var total_primary = primary_tables_space * filesize;
			// var numfiles = Math.floor((total_primary*ratio) / (filesize*page.members.gPrimaryTablesInDatabase));

			var numfiles = Math.round(ratio*cnumfiles)

			if(numfiles < 2) {
				alert(GetMsgLang("04051530"));
				return;
			}

			// Read the value of the selected storage:
			var eStorage = 'flash';
			if($("#storedevice").val() == "SD")
				eStorage = 'sd';

			// Modify the events service parameters accordingly.
			QString = makeQString();
			QString.set_action('update')
			.add_list("group=VCA.Ch0.Rd." + cap_elm + "&enable", "",
			($("#enabledbservice:checkbox").attr("checked") == true) ? "yes" : "no")
			.add_list("&numfiles", "", numfiles)
			.add_list("&storage", "", eStorage)

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
				CAP.logging.verbose("Initialising event reporting page...");

				//Start loading the config if necessary:
				CAP.loadConfig();

				// Attach new listeners
				top.$(window.top).bind('capServerDataRefresh', page.eventCallback.updateData);

				// Call the common functions to show the page
				// TODO: This should be phased out in future releases.
				CAP.page.show(window);

				$("#stream_tab").tabs({
					select: function(event, ui)
					{
						switch(ui.index)
						{
						case 0:
							$("#reportservice").toggle(true);
							$("#dbservice").toggle(false);
							break;
							
						case 1:
							$("#reportservice").toggle(false);
 							$("#dbservice").toggle(true);
							break;
						}
					}
				});

				page.methods.initUriRequestElement();

				if (!CAP.VCA.initialized())
				{
					top.$(window.top).bind("capVcaInitialized", page.methods.init);
					CAP.logging.info("VCA not initialized.  Page initialization is waiting for \"capVcaInitialized\" event");
					return;
				}

				// Language
				var classNum = ["04051530", "04051531", "04051502"];
				InitMsgLang(classNum);
				getLangEnvironment("eventstracksreport");

				ResizePage(700);

				$("#linkStoreInfo").click(function(){
					parent.$("#leftmenu a[href='usbsdstorage.html']").click();
					parent.$("#leftmenu .storageContents").click();
				});

				$("#from-ts").datetimepicker({
					showTimezone: true,
					showSecond: true,
					timeFormat: 'HH:mm:ss.lz',
					separator: 'T',
					dateFormat: 'yy-mm-dd'
				});
				$("#to-ts").datetimepicker({
					showTimezone: true,
					showSecond: true,
					timeFormat: 'HH:mm:ss.lz',
					separator: 'T',
					dateFormat: 'yy-mm-dd'
				});

				// $("#btnCSV").prop("disabled", true);
				// $("#btnApply").prop("disabled", true);
				Disable($("btnCSV"));
				Disable($("btnApply"));
				$("#dbusersize").numeric();

				$("#btnCSV").button().click(page.eventCallback.retrieveButtonClick);

				$("#btnAll").button().click(page.eventCallback.AllButtonClick);
				$("#btnAdd").button().click(page.eventCallback.AddButtonClick);
				$("#btnRem").button().click(page.eventCallback.RemoveButtonClick);
				$("#btnClr").button().click(page.eventCallback.ClearButtonClick);
				
				$("#dbusersize").keypress(page.eventCallback.enableDbServiceChange);
				$("#enabledbservice").change(page.eventCallback.enableDbServiceChange);
				$("#dbusersize").change(page.eventCallback.enableDbServiceChange);
				$("#storedevice").change(page.eventCallback.storageSelectionChange);
				$("#btnApply").button().click(page.eventCallback.applyButtonClick);
				
				$("#predefinerequest").change(page.eventCallback.predefineChange);
				
				page.methods.initElements();
				// page.methods.initRulesListBox();

				CAP.logging.info("Event reporting page initialisation...DONE!");
			}
			catch (exception)
			{
				CAP.logging.error("Event reporting page initialisation...FAILED: " + exception);
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
			page.methods.initFormType();
			page.methods.initEnableDbService();
			// page.methods.initFirstLastRecord();
			page.methods.initDbSizeParams();
			// page.methods.initRulesListBox();
			page.methods.initStoreDevice();
			page.methods.initPredefineReqList();
			page.eventCallback.predefineChange();
		},

		initFormType: function()
		{
			if($.urlParam('ref') == 'events') {
				$('#pagename').text('Event reporting');
				$('#pagename').addClass("04051502");
				$('#labeldbservice').text('Enable events database service');
				$('#labeldbservice').addClass("04051515");
				page.members.gLoadListBoxes = true;
				page.members.gTypeOfData = "events";
				page.members.gCAPTypeOfData = "Ev";
				page.members.gMaxStoreSize = 3072;  // new default: 3MiB ; old default: 2.5 MiB for events.
				page.members.gPrimaryTablesInDatabase = 3;
				page.members.gSecondaryTablesInDatabase = 1;
			} else if ($.urlParam('ref') == 'tracks') {
				$('#pagename').text('Track reporting'); // TODO(pau-climent): translate string.
				$('#pagename').addClass("04051602");
				$('#labeldbservice').text('Enable tracks database service');
				$('#labeldbservice').addClass("04051615");
				page.members.gLoadListBoxes = false;
				page.members.gTypeOfData = "tracks";
				page.members.gCAPTypeOfData = "Tr";
				page.members.gMaxStoreSize = 12288; // 6.0 MiB for tracks/points.
				page.members.gPrimaryTablesInDatabase = 3;
				page.members.gSecondaryTablesInDatabase = 9;
				$('#rulesfilter').toggle(false);
			} else {
				// TODO(pau-climent): change this to a "page toggle(false)" that hides everything.
				throw new UserException('Invalid form type passed (?ref={events|tracks}).');
			}
		},

		initPredefineReqList: function()
		{
			var i;
			var predefineReqList = $("#predefinerequest");
			predefineReqList.empty();
			for(i = 0; i < page.enums.gPredefineReqTime.length; i ++ )
			{
				var option = document.createElement("option");
				option.id = i;
				option.text = page.enums.gPredefineReqTime[i];
				predefineReqList[0].options.add(option);
			}
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
			var cap_elm = page.members.gCAPTypeOfData;
			var cap_enable = "VCA.Ch0.Rd." + cap_elm + ".enable";
			var enable = CAP.ajax.getServerData(cap_enable, true);
			if (enable == "yes")
			{
				$("#enabledbservice").attr("checked", true);
				page.methods.initFirstLastRecord();
			}
			else
			{				
				$("#enabledbservice").attr("checked", false);
				page.methods.setButtons();
			}
		},

		// Called by initFirstLastRecord (daisy-chained):
		initRulesListBox:function()
		{
			var dtype = page.members.gTypeOfData;
			if(dtype == 'events') {
				$.ajax({
					url: "/uapi-cgi/metadata.cgi?what=rules",
					dataType: 'json',
					success: function( data, items ) {
						$("#lstAll").empty();
						$("#lstIn").empty();
						var items = [];	
						$.each( data, function( key, value ) {
							items.push("<option value='" + value.id + "'>" + value.id + " - " + value.name + "</option>")
						});
						$("#lstAll").append(items.join(""));
					},
					error: function(data) {
						// TODO(pau-climent): Most likely a 503 from server (busy).
						$('#pagestatus').toggle(true);
					},
					complete: function() {
						page.methods.setButtons();
					}
				});
			}
		},

		initFirstLastRecord:function()
		{
			var dtype = page.members.gTypeOfData;
			$.ajax({
				url: "/uapi-cgi/metadata.cgi?what=" + dtype + "&info=true",
				dataType: 'json',
				success: function( data ) {
					var date_from = new Date(window.Date.parse(data.first));
					var date_to = new Date(window.Date.parse(data.last));
					// alert(data.from + " --> " + date_from);
					$("#firstrecord").val(date_from.toLocaleString());
					$("#lastrecord").val(date_to.toLocaleString());

					page.methods.initRulesListBox();
				},
				error: function (data) {
					// TODO(pau-climent): Most likely a 503 from server (busy).
					$('#pagestatus').toggle(true);
				},
				complete: function() {
					page.methods.setButtons();
				}
			})
		},

		setButtons:function()
		{
			// $("#btnApply").prop("disabled", true);
			Disable($("#btnApply"));
			var cap_elm = page.members.gCAPTypeOfData;
			var cap_enable = "VCA.Ch0.Rd." + cap_elm + ".enable";
			var enable = CAP.ajax.getServerData(cap_enable, true);
			// var enable = $("#dbservice").attr("checked") == true;
			if (enable == "no")
			{
				//$("#btnCSV").prop("disabled", true);
				Disable($("#btnCSV"));
				$("#servicedisabled").toggle(true);
			}
			else
			{
				// $("#btnCSV").prop("disabled", false);
				Enable($("#btnCSV"));
				$("#servicedisabled").toggle(false);
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

		submitRequest:function(format)
		{
			var cap_elm = page.members.gCAPTypeOfData;
			var cap_enable = "VCA.Ch0.Rd." + cap_elm + ".enable";
			var enable = CAP.ajax.getServerData(cap_enable, true);
			if(enable == "no") {
				alert ("Cannot proceed, database is disabled.");
				return;
			}

			ViewLoadingSave(true);
			var dtype = page.members.gTypeOfData;
			var request = "what=" + dtype + "&as=file&count=65535&page=0&format=" + format;
			request += "&from=" + encodeURIComponent($("#from-ts").val());
			request += "&to=" + encodeURIComponent($("#to-ts").val());

			var cnt = 0;
			$("#lstIn > option").each(function() {
				if(cnt == 0) {
					request += "&rules="
				}
				if(cnt > 0)
				  request += ","
				request += this.value
				cnt++;
			});
			

			var href = page.methods.fillUri("/uapi-cgi/metadata.cgi", request);

			var then = new Date();

			//setRequestHeader('Accept','text/csv; charset=utf-8');

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
		},

		initDbSizeParams: function()
		{
			var cap_elm = page.members.gCAPTypeOfData;
			var cap_filesize = "VCA.Ch0.Rd." + cap_elm + ".filesize";
			var cap_numfiles = "VCA.Ch0.Rd." + cap_elm + ".numfiles";

			var filesize_bytes = CAP.ajax.getServerData(cap_filesize, true);
			var filesize = filesize_bytes / 1024;
			var numfiles = CAP.ajax.getServerData(cap_numfiles, true);
			
			// Database space calculation.
			var primary_tables_space = numfiles*page.members.gPrimaryTablesInDatabase;
			var secondary_table_space = numfiles*page.members.gSecondaryTablesInDatabase;
			var total_space =  (primary_tables_space + secondary_table_space) * filesize;
			$("#dbusersize").val(total_space);
		},

		setStoreDevice: function()
		{
			var cap_elm = page.members.gCAPTypeOfData;
			var cap_storage = "VCA.Ch0.Rd." + cap_elm + ".storage";
			var value = CAP.ajax.getServerData(cap_storage, true);
			if(value == "flash")
			{
				$("#storedevice").val("Internal Flash");
			}
			else if(value == "sd")
			{
				$("#storedevice").val("SD");
			}
		},


		initStoreDevice: function()
		{
			if(page.members.gStorageDeviceFound == true)
			{
				page.methods.setStoreDevice();
				//page.methods.toggleElements();
			}
			else
			{
				var deviceList = $("#storedevice");
				deviceList.empty();
				var option = document.createElement("option");
				option.id = 0; 
				option.text =  "Internal Flash";
				deviceList[0].options.add(option);
				var actionReq = new CGIRequest();
				var reqQString = "action=get";
				actionReq.SetAddress("/uapi-cgi/storage.cgi");
				actionReq.SetStartFunc(ViewLoadingSave);
				actionReq.SetCallBackFunc(function(xml){
					ViewLoadingSave(false);
					if($.browser.msie == true)
					{
						var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
						xmlDoc.async = "false";
						xmlDoc.loadXML(xml.xml);
						var node = xmlDoc.selectSingleNode("storage/s0/mounted");
						if(node != null && node.firstChild.text == "yes")
						{
							option = document.createElement("option");
							option.id = 1; 
							option.text =  "SD";
							deviceList[0].options.add(option);
							page.methods.setStoreDevice();

							var sizeNode = xmlDoc.selectSingleNode("storage/s0/free");
							if(sizeNode != null)
							{
								page.members.gExternalSize = parseInt(sizeNode.firstChild.text);
							}
						}
						
					}
					else
					{
						//var xmlDoc = new DOMParser().parseFromString(xml,"text/xml");
						var mountedNodes = xml.getElementsByTagName("mounted");
						if(mountedNodes != null && mountedNodes.length > 0)
						{
							var mounted = mountedNodes[0].firstChild.nodeValue;
							if(mounted == "yes")
							{
								option = document.createElement("option");
								option.id = 1; 
								option.text =  "SD";
								deviceList[0].options.add(option);
								page.methods.setStoreDevice();

								var sizeNode = xml.getElementsByTagName("free");
								if(sizeNode != null && sizeNode.length > 0)
								{
									page.members.gExternalSize = parseInt(sizeNode[0].firstChild.nodeValue);
								}
							}
						}
						
					}
					page.methods.initDbMaxSizeInfo();
					page.members.gStorageDeviceFound = true;
				});
				actionReq.Request(reqQString);
				}
		},

		initDbMaxSizeInfo: function()
		{
			if($("#storedevice").val() == "Internal Flash")
			{
				$("#dbtotalsize").val(page.members.gMaxStoreSize);
			}
			else if($("#storedevice").val() == "SD")
			{
				$("#dbtotalsize").val(page.members.gExternalSize);
			}			
		}
	};
	// Initialise the page when the DOM loads
	$(document).ready(page.methods.init);
	// Finalise the page when the DOM unloads
	$(window).unload(page.methods.uninit);
}(CAP, CAP.VCA, window));
