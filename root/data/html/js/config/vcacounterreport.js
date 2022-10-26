/*	This file uses JsDoc Toolkit documentation.
 *	http://code.google.com/p/jsdoc-toolkit/
 */

/**	@fileOverview This file contains the control code for the VCA classification page.
 *	@author CAP Technology
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

	page.defines = 
	{	
		MAX_CLASSIFICATION_GROUPS : 5,
		MAX_CLASSIFIERS : 20
	};

	page.enums = {
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
		],

		gCounterID:[
			"active",
			"all"
		],

		gSortOrder:[
			"04050968",
			"04050969"
		],

		gTableStrId:
		[
			"04050964",
			"04050965",
			"04050966",
			"04050967",
		],

		gValueType:[
			"04050970",
			"04050971"
		],

		gSimplecmd:[
			["now-01:00", 0, "active"],		// one hour
		 	["today", 1, "active"],
			["yesterday", 1, "active"],
			["now-24:00", 2, "active"],	// one day
			["this_week", 2, "active"],
			["last_week", 2, "active"],
			["today-168:00", 3, "active"],
			["this_month", 3, "active"],
			["last_month", 3, "active"]
		],

		gWeekday:[
			"040501000",
			"040501001",
			"040501002",
			"040501003",
			"040501004",
			"040501005",
			"040501006"
		],
		
	};

	page.members =
	{
		gStorageDeviceFound: false,
		gDefaultGroup: "VCA.Ch0.Crpt",
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
				$("#waitmessage").hide(100, function() {
					$(this).remove();
				});

				
			}
			else
			{
				$("#waitmessage").each(function(){
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
			var sampling = page.enums.gSimplecmd[predefineIndex][1];
			var countObj = page.enums.gSimplecmd[predefineIndex][2];
			var from = page.enums.gSimplecmd[predefineIndex][0];
			var to = "now";
			if(predefineIndex == 2) 
			{				// yesterday
				to = "today";
			} 
			else if(predefineIndex == 5) 
			{				// last week
				to = "this_week";
			} 
			else if(predefineIndex == 8) 
			{				// last month
				to = "this_month";
			}
			$("#timefrom").val(from);
			$("#timeto").val(to);
			$("#countselect").val(countObj);
			$("#tableselect").attr("selectedIndex", sampling);
			
		},
		
		tableButtonClick:function(flag, message)
		{
			page.methods.submitRequest("table", 640);
		},

		barButtonClick:function(flag, message)
		{
			page.methods.submitRequest("bar", 640);
		},

		csvButtonClick:function(flag, message)
		{
			page.methods.submitRequest("csv", 640);
		},

		applyButtonClick:function(flag, message)
		{
			page.eventCallback.submit();
		},

		clearButtonClick:function(flag, message)
		{
			page.methods.clearDB();
		},

		bkupButtonClick:function(flag, message)
		{
			page.methods.backupDB();
		},

		addButtonClick:function(flag, message)
		{
			page.members.gOpenMode = "add";
	        $("#input_form").dialog("option", "title", GetMsgLang("04050983"));
	        $("#input_form").dialog("option", "mode", "add");
	        $("#input_form").dialog('open');
			$("input[name='triggerMode']").change();
		},

		modifyButtonClick:function(flag, message)
		{
			if($("#formNotifyList").val() == null)
	        {
	            alert(GetMsgLang("04050984"));
	            return false;
	        }
			page.members.gOpenMode = "modify";
			$("#input_form").dialog("option", "title", GetMsgLang("04050983"));
	        $("#input_form").dialog("option", "mode", "modify");
	        $("#input_form").dialog('open');
			try
			{
				var selectedIndex = $("#formNotifyList").attr("selectedIndex");
				var mailList = CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.list").split(",");
				var mailid = mailList[selectedIndex];

				//Mail
		        $("#mailname:text").val(CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.E" + mailid + ".name"));
		        $("#maildesc:text").val(CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.E" + mailid + ".description"));
		        $("#mailaddr:text").val(CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.E" + mailid + ".addr"));

				//Report
				if(CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.E" + mailid + ".reportall") == "yes")
				{
					$("#reportall").attr("checked", true);
				}
				else
				{
					$("#reportall").attr("checked", false);
				}
				
				
				$("#mailcountselect").val(CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.E" + mailid + ".counter"));
				var tableList = CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.E" + mailid + ".table");
				var tableArray = tableList.split(",");
				for(var i = 0; i < tableArray.length; i ++)
				{
					var tableObjId = "#table" + tableArray[i];
					$(tableObjId).attr("checked", true);
				}
		        $("input[name='formSort'][value='" + CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.E" + mailid + ".order") + "']:radio").attr("checked", "checked");
				$("input[name='formValue'][value='" + CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.E" + mailid + ".value") + "']:radio").attr("checked", "checked");
		        $("input[name='formFormat'][value='" + CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.E" + mailid + ".reportfmt") + "']:radio").attr("checked", "checked");

				//Schedule
				
				
				if(CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.E" + mailid + ".hourly") == "yes")
				{
					$("#triggerMode0").attr("checked", true);
				}
				else if(CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.E" + mailid + ".daily") == "yes")
				{
					$("#triggerMode1").attr("checked", true);
					var time = CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.E" + mailid + ".from").split(":");
					$("#mailtimefrom").attr("selectedIndex", parseInt(time[0]));

					time = CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.E" + mailid + ".to").split(":");
					$("#mailtimeto").attr("selectedIndex", parseInt(time[0]));
					$("#reportall").change();
				}
				else if(CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.E" + mailid + ".weekly") == "yes")
				{
					$("#triggerMode2").attr("checked", true);
					var time = CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.E" + mailid + ".from").split(":");
					$("#mailtimefrom").attr("selectedIndex", parseInt(time[0]));
					time = CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.E" + mailid + ".to").split(":");
					$("#mailtimeto").attr("selectedIndex", parseInt(time[0]));
					$("#reportall").change();
				}
				else if(CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.E" + mailid + ".monthly") == "yes")
				{
					$("#triggerMode3").attr("checked", true);
					var time = CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.E" + mailid + ".from").split(":");
					$("#mailtimefrom").attr("selectedIndex", parseInt(time[0]));
					time = CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.E" + mailid + ".to").split(":");
					$("#mailtimeto").attr("selectedIndex", parseInt(time[0]));
					$("#reportall").change();
				}
				$("input[name='triggerMode']").change();
				//$("#sendtime").attr("selectedIndex", CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.E" + mailid + ".time"));
			}catch(exception)
			{
				
			}
		},

		removeButtonClick:function(flag, message)
		{
			if($("#formNotifyList").val() == null)
	        {
	            alert(GetMsgLang("04050985"));
	            return false;
	        }

	        if (!confirm(GetMsgLang("04050986")))
	        {
	            return false;
	        }

			var idx = $("select#formNotifyList").attr("selectedIndex");
			var list = CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.list");
			var mailIdArray = list.split(",");
			var curId = parseInt(mailIdArray[idx]);

			var Req = new CGIRequest();
	        var reqQString = "action=remove&group=VCA.Ch0.Crpt.Email.E" + curId;
			Req.SetAddress("/nvc-cgi/admin/vca.cgi");
	        Req.SetStartFunc(ViewLoadingSave);
	        Req.SetCallBackFunc(function(xml){
	           	top.$(window.top).bind('capServerDataRefresh', page.methods.endRefresh);
		        page.methods.startRefresh();
	            return;
	        });


        	Req.Request(reqQString);
    
		},

		mailEnableClick:function(flag, message)
		{
			var actionReq = new CGIRequest();
			actionReq.SetAddress("/nvc-cgi/admin/vca.cgi");
			actionReq.SetStartFunc(ViewLoadingSave);
			actionReq.SetCallBackFunc(function(xml){
				top.$(window.top).bind('capServerDataRefresh', page.methods.endRefresh);
		        page.methods.startRefresh();
				
         	});
			var reqQString = "action=update&group=VCA.Ch0.Crpt.Email&enable=";
			if($("#mailNotifyEnable").attr("checked") == true)
			{
				reqQString += "yes";
			}
			else
			{
				reqQString += "no";
			}
			actionReq.Request(reqQString);
        	
			return;
		},

		enableDbServiceChange:function(flag, message)
		{
			var disable = $("#enabledbservice").attr("checked");
			for(var i = 0; i < 4; i ++)
			{
				var tableId = "#enabletbl" + i;
				var divId = "#divtable" + i;
				$(divId).attr("disabled",!disable);
				$(tableId).attr("disabled",!disable);
			}
		},

		table0Change:function()
		{
			page.methods.setRollOverTime(0);
			page.methods.initTableSelect();
			page.methods.calculateTotalDbSize();
		},

		table1Change:function()
		{
			page.methods.setRollOverTime(1);
			page.methods.initTableSelect();
			page.methods.calculateTotalDbSize();
		},

		table2Change:function()
		{
			page.methods.setRollOverTime(2);
			page.methods.initTableSelect();
			page.methods.calculateTotalDbSize();
		},

		table3Change:function()
		{
			page.methods.setRollOverTime(3);
			page.methods.initTableSelect();
			page.methods.calculateTotalDbSize();
		},

		storageChanage:function()
		{
			var storageDevice = $("#storedevice").val();
			if(storageDevice == "Internal Flash")
			{
				$("#dbtotalsize").val(page.members.gMaxStoreSize);
			}
			else if(storageDevice == "SD")
			{
				$("#dbtotalsize").val(page.members.gExternalSize);
			}
		},

		
		submit: function (event) 
		{
			var usedsize = parseFloat($("#dbusedsize").val());
			var totalsize = parseFloat($("#dbtotalsize").val());
			if(usedsize > totalsize)
			{
				alert("The database used size is bigger than total free size!");
				return;
			}
			QString = makeQString();
			QString.set_action('update')
				.add_list("VCA.Ch0.Crpt.Db.enable", "", ($("#enabledbservice:checkbox").attr("checked") == true) ? "yes" : "no");

			var storeDevice = $("#storedevice").val();
			if(storeDevice == "Internal Flash")
			{
				QString.add_list("VCA.Ch0.Crpt.Db.storage", "","iflash"); 
			}
			else if(storeDevice == "SD")
			{
				QString.add_list("VCA.Ch0.Crpt.Db.storage", "","sd"); 
			}
			
			for(var i = 0; i < 4; i ++)
			{
				var sz = "VCA.Ch0.Crpt.Db.Tb" + i + ".enable";
				var elementid = "#enabletbl" + i;
				QString.add_list(sz, "",  ($(elementid).attr("checked") == true) ? "yes" : "no");

				sz = "VCA.Ch0.Crpt.Db.Tb" + i + ".sampling";
				elementid = "#sampling" + i;
				QString.add_list(sz, "", parseInt($(elementid).val())*60);
				

				sz = "VCA.Ch0.Crpt.Db.Tb" + i + ".rollcount";
				elementid = "#rolloverct" + i;
				QString.add_list(sz, "", $(elementid).val());
			}

			reqQString = QString.get_qstring();
			var actionReq = new CGIRequest();
			actionReq.SetAddress("/nvc-cgi/admin/vca.cgi");
			actionReq.SetStartFunc(ViewLoadingSave);
			actionReq.SetCallBackFunc(function(xml){
				top.$(window.top).bind('capServerDataRefresh', page.methods.endRefresh);
		        page.methods.startRefresh();
				
         	});
			actionReq.Request(reqQString);
        	
			return;
		},

		pushserviceSubmit:function()
		{
			QString = makeQString();
			QString.set_action('update')
				.add_list("VCA.Ch0.Crpt.Push.enable", "", ($("#enablepushservice:checkbox").attr("checked") == true) ? "yes" : "no");

			var protocal = $("#protocaltype").val();
			if(protocal == "QXML")
			{
				QString.add_list("VCA.Ch0.Crpt.Push.protocol", "", "qxml");
			}

			var ip = $("#serveripform .ip_octet:eq(0)").val() + "."
					+ $("#serveripform .ip_octet:eq(1)").val() + "."
					+ $("#serveripform .ip_octet:eq(2)").val() + "."
					+ $("#serveripform .ip_octet:eq(3)").val();
			
			QString.add_list("VCA.Ch0.Crpt.Push.Qxml.ip", "", ip)
					.add_list("VCA.Ch0.Crpt.Push.Qxml.port", "", $("#serverport").val())
					.add_list("VCA.Ch0.Crpt.Push.Qxml.heartbeatinterval", "", $("#heartinter").val())
					.add_list("VCA.Ch0.Crpt.Push.Qxml.reportinterval", "", $("#reportinter").val());

			reqQString = QString.get_qstring();
			var actionReq = new CGIRequest();
			actionReq.SetAddress("/nvc-cgi/admin/vca.cgi");
			actionReq.SetStartFunc(ViewLoadingSave);
			actionReq.SetCallBackFunc(function(xml){
				ViewLoadingSave(false);
        	});
			actionReq.Request(reqQString);
       	
			return;
		},

		getStatus:function()
		{
			var reqQString = "action=reqpushstatus";
			var actionReq = new CGIRequest();
			actionReq.SetAddress("/cgi-bin/operator/countreport.cgi");
			actionReq.SetAsyn(false);
			actionReq.SetSuccessFunc(function(data){
				if(data)
				{
					$("#statuslabe").text(data);
				}
			});
			actionReq.Request(reqQString);
			
		},

		clearQue:function()
		{
			var reqQString = "action=clearqueue";
			var actionReq = new CGIRequest();
			actionReq.SetAddress("/cgi-bin/operator/countreport.cgi");
			actionReq.SetAsyn(false);
			actionReq.Request(reqQString);
		},


		enableTableChange:function()
		{
			page.methods.calculateTotalDbSize();
		},

		restoreDefaults: function (event) {
			try {
				var doRestore = confirm("WARNING: This will restore all object classifier settings to their default values. Are you sure you want to continue?");

				if(doRestore) {

					CAP.logging.verbose('Restore Defaults');
					CAP.ajax.restoreServerData(
						[
							{	group: 'VCA.Ch0.Crpt.Db'		}
						]);
				}
			} catch (exception) {
				CAP.logging.error('Failed to restore default settings: ' + exception);
				throw exception;
			}
		},

		updateData: function( event )
		{
			page.methods.initElements();
		},

		updateNotifyData: function( event )
		{
			page.methods.initNotifyList();
			Enable($("button#btnAddAddr"));
            Enable($("button#btnModifyAddr"));
            Enable($("button#btnRemoveAddr"));
			top.$(window.top).bind('capServerDataRefresh', page.eventCallback.updateData);
			top.$(window.top).unbind('capServerDataRefresh', page.eventCallback.updateNotifyData);
		}

	};

	page.methods = 
	{
		init: function () 
		{
			try 
			{
				var object	= 0;

				CAP.logging.verbose("Initialising counter report page...");
					
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
							$("#pushservice").toggle(false);
							$("#dbservice").toggle(false);
							$("#notifyservice").toggle(false);
							break;
							
						case 1:
							$("#reportservice").toggle(false);
							$("#pushservice").toggle(false);
 							$("#dbservice").toggle(true);
							$("#notifyservice").toggle(false);
							break;

						case 2:
							$("#reportservice").toggle(false);
							$("#pushservice").toggle(false);
 							$("#dbservice").toggle(false);
							$("#notifyservice").toggle(true);
							break;
							
						case 3:
 							$("#reportservice").toggle(false);
							$("#pushservice").toggle(true);
							$("#dbservice").toggle(false);
							$("#notifyservice").toggle(false);
							break;	
						}
					}
				});
					
				page.methods.initUriRequestElement();
				
				if(!CAP.VCA.initialized()) 
				{
					top.$(window.top).bind("capVcaInitialized", page.methods.init);
					CAP.logging.info("VCA not initialized.  Page initialization is waiting for \"capVcaInitialized\" event");
					return;
				}
				// Language
				var classNum = ["04050908", "04050909", "04050975", "04050983", 
								"04050984", "04050985", "04050986", "04050987",
								"04050988", "04050997", "040501000", "040501001",
								"040501002", "040501003","040501004", "040501005",
								"040501006", "040501007", "040501008",
								"0501"];
			  	InitMsgLang(classNum);
				getLangEnvironment("counterreport");
				
				ResizePage(700);
				$("#serverip:text").ipaddress();
				$("#serveripform .ip_octet").css("border", "0px");
				$("#serverport").numeric();
				$("#reportinter").numeric();
				$("#heartinter").numeric();
				$("#btnTable").button().click(page.eventCallback.tableButtonClick);
				$("#btnBar").button().click(page.eventCallback.barButtonClick);
				$("#btnCSV").button().click(page.eventCallback.csvButtonClick);
				$("#btnApply").button().click(page.eventCallback.applyButtonClick);
				$("#btnClear").button().click(page.eventCallback.clearButtonClick);
				$("#btnBackup").button().click(page.eventCallback.bkupButtonClick);
				$("#btnPSApply").button().click(page.eventCallback.pushserviceSubmit);
				$("#btnStatus").button().click(page.eventCallback.getStatus);
				$("#btnCQ").button().click(page.eventCallback.clearQue);
				$("#enabledbservice").change(page.eventCallback.enableDbServiceChange);
				$('#btnRestoreDefaults').button().click(page.eventCallback.restoreDefaults);
				$("#btnApplyEmailEnable").button().click(page.eventCallback.mailEnableClick);
				$("#btnAddAddr").button().click(page.eventCallback.addButtonClick);
				$("#btnModifyAddr").button().click(page.eventCallback.modifyButtonClick);
				$("#btnRemoveAddr").button().click(page.eventCallback.removeButtonClick);

				$("#enabletbl0").change(page.eventCallback.enableTableChange);
				$("#enabletbl1").change(page.eventCallback.enableTableChange);
				$("#enabletbl2").change(page.eventCallback.enableTableChange);
				$("#enabletbl3").change(page.eventCallback.enableTableChange);
				
				$("#predefinerequest").change(page.eventCallback.predefineChange);
				$("#linkStoreInfo").click(function(){
					parent.$("#leftmenu a[href='usbsdstorage.html']").click();
					parent.$("#leftmenu .storageContents").click();
				});
				$("#linkSmtp").click(function(){
			        parent.$("#leftmenu .networkConfContents + div a[href='smtp.html']").click();
			        parent.$("#leftmenu .networkConfContents").click();
			    });

				$("select#formNotifyList").dblclick(function() {
			        if($(this).val() == null) return;
			        $("#btnModifyAddr").click();
			    });

				$("input[name='triggerMode']").change(function(){
					var selectedIndex = $("#formNotifyList").attr("selectedIndex");
					var mailList = CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.list").split(",");
					var mailid = mailList[selectedIndex];
					
					$("#weekdaysel").toggle(false);
					$("#monthdaysel").toggle(false);
					$("#wdaypan").toggle(false);
					$("#mdaypan").toggle(false);
					
					if($("input[name='triggerMode']:checked:radio").val() == "hourly")
					{//
						page.methods.initHourlyInnnerHTML();
						page.methods.toggleDataPeriod(false);
					}
					else if($("input[name='triggerMode']:checked:radio").val() == "daily")
					{
						page.methods.initDailyInnerHtml();
						page.methods.toggleDataPeriod(true);
					}
					else if($("input[name='triggerMode']:checked:radio").val() == "weekly")
					{
						page.methods.initWeekdayInnerHtml();
						page.methods.toggleDataPeriod(true);
						$("#weekdaysel").toggle(true);
						$("#wdaypan").toggle(true);
					}
					else if($("input[name='triggerMode']:checked:radio").val() == "monthly")
					{
						page.methods.initMonthdayInnerHtml();
						page.methods.toggleDataPeriod(true);
						$("#monthdaysel").toggle(true);
						$("#mdaypan").toggle(true);
					}
			
				});

				$("#reportall").change(function(){
					var selectedIndex = $("#formNotifyList").attr("selectedIndex");
					var mailListStr = CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.list");
					
					if($(this).attr("checked") == true)
					{
						$("#mailtimefrom").attr("selectedIndex", 0);
						$("#mailtimeto").attr("selectedIndex", 0);
						Disable($("#mailtimefrom"));
						Disable($("#mailtimeto"));
					}
					else
					{
						if(page.members.gOpenMode == "modify")
						{
							if(mailListStr != null && mailListStr != "")
							{
								var mailList = mailListStr.split(",");
								var mailid = mailList[selectedIndex];
								var time = CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.E" + mailid + ".from").split(":");
								$("#mailtimefrom").attr("selectedIndex", parseInt(time[0]));
								time = CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.E" + mailid + ".to").split(":");
								$("#mailtimeto").attr("selectedIndex", parseInt(time[0]));
							}
						}
						Enable($("#mailtimefrom"));
						Enable($("#mailtimeto"));
					}
				});

				$("#btnDialogOK").button().click(function() {
					var bValid = true;

			        bValid = bValid && page.methods.checkLength($("#mailname:text"), GetMsgLang("04050987"),1 , 32);
			        bValid = bValid && page.methods.checkLength($("#mailaddr:text"), GetMsgLang("04050988"),1 , 48);

			        if(bValid == false)
			        {
			            return false;
			        }
					
					switch($("#input_form").dialog("option", "mode"))
					{
					case "add":
						page.methods.addEmailAddress();
						break;
					case "modify":
						page.methods.updateEmailAddress();
						break;
					}
					$("#input_form").dialog('close');
				});
				$("#btnDialogCancel").button().click(function() {
			        $("#input_form").dialog('close');
				});

				$("#btnDialogTest").button().click(page.methods.emailTest);
		   

				$("#storedevice").change(page.eventCallback.storageChanage);
				$("#sampling0").numeric();
				$("#rolloverct0").numeric();
				$("#sampling1").numeric();
				$("#rolloverct1").numeric();
				$("#sampling2").numeric();
				$("#rolloverct2").numeric();
				$("#sampling3").numeric();
				$("#rolloverct3").numeric();
				
				$("#sampling0").blur(page.eventCallback.table0Change);
				$("#rolloverct0").blur(page.eventCallback.table0Change);
				$("#sampling1").blur(page.eventCallback.table1Change);
				$("#rolloverct1").blur(page.eventCallback.table1Change);
				$("#sampling2").blur(page.eventCallback.table2Change);
				$("#rolloverct2").blur(page.eventCallback.table2Change);
				$("#sampling3").blur(page.eventCallback.table3Change);
				$("#rolloverct3").blur(page.eventCallback.table3Change);
				page.methods.toggleDataPeriod(false);
				page.methods.SetRelation();
				page.methods.initElements();
				top.$(window.top).bind('capServerDataRefresh', page.eventCallback.updateNotifyData);
				
				CAP.logging.info("Counter report page Initialisation...DONE!");
			}
			catch (exception) 
			{
				CAP.logging.error("Counter report page page Initialisation...FAILED: " + exception);
				return;
			}
		},

	
		specialChar: function(val){
		    pat = /[\\\/\@\#\$\%\^\&\*\=\<\>\n\r]+/; 

			if (val.match(pat)) { 
				return true; 
			} 
			else
			{
				return false;
			}
		},
		
		RTrim:function (str)
		{ 
			var i; 
			for(i=str.length-1;i>=0;i--){ 
			if(str.charAt(i)!=" ") break; 
			} 
			str = str.substring(0,i+1); 
			return str; 
		},

		unbund: function()
		{
			$("#btnApplyEmailEnable").unbind();
			$("#btnAddAddr").unbind();
			$("#btnModifyAddr").unbind();
			$("#btnRemoveAddr").unbind();
		},
		
		uninit: function () 
		{
			//Remove event handlers:
			top.$(window.top).unbind("capVcaInitialized", page.methods.init);
			top.$(window.top).unbind('capServerDataRefresh', page.eventCallback.updateData);
		},

		startRefresh: function()
		{
			CAP.ajax.reloadServerData();
		},

		endRefresh: function()
		{
			ViewLoadingSave(false);
			page.methods.initElements();
			top.$(window.top).unbind('capServerDataRefresh', page.methods.endRefresh);
		},

		

		initElements: function()
		{
			page.methods.initInputForm();
			page.methods.initPredefineReqList();
			page.methods.initTimeEdit();
			page.methods.initCounterId();
			page.methods.initSortingOrder();
			page.methods.initValueType();
			page.methods.initDbServiceInfo();
			page.methods.initTableEnabled();
			page.methods.initSampleRate();
			page.methods.initTableSelect();
			page.methods.initRolloverCount();
			page.eventCallback.predefineChange();
			page.methods.initStoreDevice();
			page.methods.initNotifyList();
			page.methods.initPushService();
		},

		initUriRequestElement: function()
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

		initTimeEdit: function()
		{
			var timeFromEditor = $("#timefrom");
			var timeToEditor = $("#timeto");
			timeFromEditor.val("today");
			timeToEditor.val("now");
		},

		initCounterId: function()
		{
			var counterIdList = $("#countselect");
			var i;
			counterIdList.empty();
			
			for(i = 0; i < page.enums.gCounterID.length; i ++)
			{
				var option = document.createElement("option");
				option.id = counterIdList[0].childElementCount;
				option.text = page.enums.gCounterID[i];
				counterIdList[0].options.add(option);
			}

			for(i = 0; i < 20; i ++)
			{
				var option = document.createElement("option");
				option.id = counterIdList[0].childElementCount; 
				option.text = "" + i;
				counterIdList[0].options.add(option);
			}
			
		},

		initTableSelect:function()
		{
			var tableList = $("#tableselect");
			
			tableList.empty();
			for(var i = 0; i < 4; i ++)
			{
				var samplingElementId = "#sampling" + i;
				var name = GetMsgLang(page.enums.gTableStrId[i]) + " (" + $(samplingElementId).val() + ")";
				var option = document.createElement("option");
				option.id = i; 
				option.text = name;
				tableList[0].options.add(option);
			}
		},

		initSortingOrder:function()
		{
			var orderList = $("#sortselect");
			orderList.empty();
			for(var i = 0; i < page.enums.gSortOrder.length; i ++)
			{
				var option = document.createElement("option");
				option.id = i; 
				option.text =  GetMsgLang(page.enums.gSortOrder[i]);
				orderList[0].options.add(option);
			}
		},

		initValueType:function()
		{
			var valueTypeList = $("#valuetypeselect");
			valueTypeList.empty();
			for(var i = 0; i < page.enums.gValueType.length; i ++)
			{
				var option = document.createElement("option");
				option.id = i; 
				option.text =  GetMsgLang(page.enums.gValueType[i]);
				valueTypeList[0].options.add(option);
			}
		},

		setStoreDevice: function()
		{
			var value = CAP.ajax.getServerData("VCA.Ch0.Crpt.Db.storage",true);
			if(value == "iflash")
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
				page.methods.toggleElements();
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
					page.members.gMaxStoreSize = parseInt(CAP.ajax.getServerData("VCA.Ch0.Crpt.Db.maxsize",true));
					if(page.members.gMaxStoreSize < 512)
					{
						page.members.gMaxStoreSize = 512;
					}
					page.methods.initDbFileSizeInfo();
					page.methods.toggleElements();
					page.members.gStorageDeviceFound = true;
				});
				actionReq.Request(reqQString);
				}
		},

		initDbFileSizeInfo: function()
		{
			if($("#storedevice").val() == "Internal Flash")
			{
				$("#dbtotalsize").val(page.members.gMaxStoreSize);
			}
			else if($("#storedevice").val() == "SD")
			{
				$("#dbtotalsize").val(page.members.gExternalSize);
			}

			page.methods.calculateTotalDbSize();
		},

		initDbServiceInfo: function()
		{
			var enable = CAP.ajax.getServerData("VCA.Ch0.Crpt.Db.enable",true);
			if(enable == "yes")
			{
				$("#enabledbservice").attr("checked", true);
			}
			else
			{
				$("#enabledbservice").attr("checked", false);
			}
		},

		
		initTableEnabled: function()
		{
			for(var i = 0; i < 4; i ++)
			{
				var enable = CAP.ajax.getServerData("VCA.Ch0.Crpt.Db.Tb" + i + ".enable",true);
				var elementid = "#enabletbl" + i;
				if(enable == "yes")
				{
					$(elementid).attr("checked", true);
				}
				else
				{
					$(elementid).attr("checked", false);
				}
			}
			return;
		},

		initSampleRate: function()
		{
			for(var i = 0; i < 4; i ++)
			{
				var value = CAP.ajax.getServerData("VCA.Ch0.Crpt.Db.Tb" + i + ".sampling",true);
				var elementid = "#sampling" + i;
				$(elementid).val(parseInt(value)/60);
			}
			return;
		},

		initRolloverCount: function()
		{
			for(var i = 0; i < 4; i ++)
			{
				var value = CAP.ajax.getServerData("VCA.Ch0.Crpt.Db.Tb" + i + ".rollcount",true);
				var elementid = "#rolloverct" + i;
				$(elementid).val(value);
				page.methods.setRollOverTime(i);
			}
			return;
		},

		initPushService:function()
		{
			var value = CAP.ajax.getServerData("VCA.Ch0.Crpt.Push.enable",true);
			if(value == "yes")
			{
				$("#enablepushservice").attr("checked", true);
			}
			else
			{
				$("#enablepushservice").attr("checked", false);
			}

			value = CAP.ajax.getServerData("VCA.Ch0.Crpt.Push.protocol",true);
			var deviceList = $("#protocaltype");
			deviceList.empty();
			var option = document.createElement("option");
			option.id = 0; 
			option.text =  "QXML";
			deviceList[0].options.add(option);
			if(value == "qxml")
			{
				deviceList.val("QXML")
			}
			value = CAP.ajax.getServerData("VCA.Ch0.Crpt.Push.Qxml.ip",true);
			var ipcont = value.split(".");
			$("#serveripform .ip_octet:eq(0)").val(ipcont[0]);
			$("#serveripform .ip_octet:eq(1)").val(ipcont[1]);
			$("#serveripform .ip_octet:eq(2)").val(ipcont[2]);
			$("#serveripform .ip_octet:eq(3)").val(ipcont[3]);
			
			$("#serverport").val(CAP.ajax.getServerData("VCA.Ch0.Crpt.Push.Qxml.port",true));
			$("#reportinter").val(CAP.ajax.getServerData("VCA.Ch0.Crpt.Push.Qxml.reportinterval",true));
			$("#heartinter").val(CAP.ajax.getServerData("VCA.Ch0.Crpt.Push.Qxml.heartbeatinterval",true));
		},

		initInputForm:function()
		{
			$("#input_form").dialog({
		        autoOpen: false,
		        width: 640,
		        modal: true,
		        resizable: false,
		        position: [115, 30],
		        open: function() {
		            $("#msg_status").removeClass('ui-state-error, ui-state-highlight').text("");
		            $(".formDialog:text").removeClass('ui-state-error');

					

		            $(".formDialog:text").val("");
		            $(".formDialog:checkbox").attr("checked", false);
					$("#triggerMode0").attr("checked", true);
					$("#formSort0").attr("checked", true);
					$("#formValue0").attr("checked", true);
					$("#formFormat0").attr("checked", true);

		            $("#formEmailName:text").focus();
		            $("#formEmailName:text").keyup(function(){
		                LimitCharac("formEmailName:text", 32);
		            });

		            $("#formEmailDes:text").keyup(function(){
		                LimitCharac("formEmailDes:text", 100);
		            });

		            $("#formEmailAddr:text").keyup(function(){
		                LimitCharac("formEmailAddr:text", 48);
		            });

		            LimitKor();
					
					$("select#mailtimefrom").empty();
					$("select#mailtimeto").empty();
					for(var i = 0; i < 24; i ++)
					{
						var time = i + ":00";
						$("select#mailtimefrom").append("<option value='" + time + "'></option>")
							.find("option").last().append(time);
						$("select#mailtimeto").append("<option value='" + time + "'></option>")
							.find("option").last().append(time);
					}

					$("select#weekdaysel").empty();
					for(var i = 0; i < 7; i ++)
					{
						$("select#weekdaysel").append("<option value='" + GetMsgLang(page.enums.gWeekday[i]) + "'></option>")
							.find("option").last().append(GetMsgLang(page.enums.gWeekday[i]));
					}

					$("select#monthdaysel").empty();
					for(var i = 0; i < 31; i ++)
					{
						$("select#monthdaysel").append("<option value='" + i + "'></option>")
							.find("option").last().append(i + 1);
					}

					$("select#mailcountselect").empty();
					for(var i = 0; i < page.enums.gCounterID.length; i ++)
					{
						$("select#mailcountselect").append("<option value='" + page.enums.gCounterID[i] + "'></option>")
							.find("option").last().append(page.enums.gCounterID[i]);
					}
					for(var i = 0; i < 20; i ++)
					{
						$("select#mailcountselect").append("<option value='" + i + "'></option>")
							.find("option").last().append(i);
					}

					$(".formDialog:checkbox").attr("checked", false);
					
					$("#reportall").attr("checked", false);
					$("#formSort0").attr("checked", true);
					$("#formValue0").attr("checked", true);
					$("#formFormat0").attr("checked", true);
					$("#triggerMode0").attr("checked", true);
					$("#enablehourly").attr("checked", false);
					$("#enabledaily").attr("checked", false);
					$("#enableweekly").attr("checked", false);
					$("#enablemonthly").attr("checked", false);
					
		            Disable($("button#btnAddAddr"));
		            Disable($("button#btnModifyAddr"));
		            Disable($("button#btnRemoveAddr"));
					$("#wdaypan").toggle(false);
					$("#mdaypan").toggle(false);
					$("#weekdaysel").toggle(false);
		            $("#monthdaysel").toggle(false);
					page.methods.ReflushDateTime();
					
		        },
		        close: function() {
		            Enable($("button#btnAddAddr"));
		            Enable($("button#btnModifyAddr"));
		            Enable($("button#btnRemoveAddr"));
		        }
		    });
		},

		initNotifyList:function()
		{
			if(CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.enable") == "yes")
			{
				$("#mailNotifyEnable").attr("checked", true);
			}
			else
			{
				$("#mailNotifyEnable").attr("checked", false);
			}

			$("select#formNotifyList").empty();
			var mailListLength = CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.nbrofmail");
			var mailList = CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.list").split(",");
			
			for(var i =0; i < mailListLength; i ++)
			{
				var valNum = i+1 + "";
				var mailid = mailList[i];
		        var valName = CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.E" + mailid + ".name");
				

		        var descListCheck = CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.E" + mailid + ".description");
		        var cnt = 0;

		        for(var j = 0; j < descListCheck.length; ++j)
		        {
		            if(descListCheck.charAt(j) != ' ')
		                ++cnt;
		        }

		        if(cnt == 0)
		        {
		            descListCheck = "";
		        }
		        else
		        {
		            descListCheck = CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.E" + mailid + ".description");
		        }
		        
		        var mailName = valName.replace(/</g, "&lt;");
		        descListCheck = descListCheck.replace(/</g, "&lt;");

				$("select#formNotifyList").append("<option value='" + valName + "'></option>")
	            .find("option").last().append("&nbsp;"
	                + FillText(valNum, 6, "left")
	                + FillText(mailName, 19, "left")
	                + FillText(descListCheck, 64, "left")
	            );
			}
			
			page.methods.initInputForm();
		},

		initHourlyInnnerHTML:function()
		{
			$(".triggertimecls").remove();
			var sendtimeInnerHtml = "<BR class='triggertimecls'><span class='sendtimepan 04050975 triggertimecls' id='sendtimespan'>";
			sendtimeInnerHtml += GetMsgLang("04050975") +  "</span><select id='sendtimefrom' class='triggertimecls'></select>";
			sendtimeInnerHtml += "<label class='triggertimecls'>" + GetMsgLang("040501007") + "</label>";
			sendtimeInnerHtml += "<select id='sendtimeto' class='triggertimecls innerfirst'></select>";
			sendtimeInnerHtml += "<label class='triggertimecls'>" + GetMsgLang("040501008") + "</label>";
			sendtimeInnerHtml += "<BR class='triggertimecls'>";
			sendtimeInnerHtml += "<BR class='triggertimecls'>";
			for(var i = 0 ; i < 7 ;i ++ )
			{
				var id = "weekday" + i;
				if(i == 0)
				{
					sendtimeInnerHtml += "<input type='checkbox' id='" + id + "' class='innerfirst triggertimecls weekdaylist' checked></input>";
				}
				else
				{
					sendtimeInnerHtml += "<input type='checkbox' id='" + id + "' class='innernormal triggertimecls weekdaylist' checked></input>";
				}
				sendtimeInnerHtml += "<label class='triggertimecls weekdaylab'>" + GetMsgLang(page.enums.gWeekday[i]) + "</label>";
			}
			$("li#hourlypan").first().append(sendtimeInnerHtml);
			$("select#sendtimefrom").empty();
			$("select#sendtimeto").empty();
			for(i = 0; i < 24; i ++)
			{
				var time = i + ":00";
				$("select#sendtimefrom").append("<option value='" + time + "'></option>")
					.find("option").last().append(time);
				$("select#sendtimeto").append("<option value='" + time + "'></option>")
					.find("option").last().append(time);
			}
			
			page.methods.initWeekday();
			if(page.members.gOpenMode == "modify")
			{
				var selectedIndex = $("#formNotifyList").attr("selectedIndex");
				var mailList = CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.list").split(",");
				var mailid = mailList[selectedIndex];
				var time = CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.E" + mailid + ".from").split(":");
				$("#sendtimefrom").attr("selectedIndex", parseInt(time[0]));
				time = CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.E" + mailid + ".to").split(":");
				$("#sendtimeto").attr("selectedIndex", parseInt(time[0]));
			}
		},

		initDailyInnerHtml:function()
		{
			$(".triggertimecls").remove();
			var sendtimeInnerHtml = "<BR class='triggertimecls'><span class='sendtimepan 04050975 triggertimecls' id='sendtimespan'>";
			sendtimeInnerHtml += GetMsgLang("04050975") +  "</span><select id='sendtime' class='triggertimecls'></select>";
			sendtimeInnerHtml += "<BR class='triggertimecls'>";
			sendtimeInnerHtml += "<BR class='triggertimecls'>";
			for(var i = 0 ; i < 7 ;i ++ )
			{
				var id = "weekday" + i;
				if(i == 0)
				{
					sendtimeInnerHtml += "<input type='checkbox' id='" + id + "' class='innerfirst triggertimecls weekdaylist' checked></input>";
				}
				else
				{
					sendtimeInnerHtml += "<input type='checkbox' id='" + id + "' class='innernormal triggertimecls weekdaylist' checked></input>";
				}
				sendtimeInnerHtml += "<label class='triggertimecls weekdaylab'>" + GetMsgLang(page.enums.gWeekday[i]) + "</label>";
			}
			$("li#dailypan").first().append(sendtimeInnerHtml);
			page.methods.initSendTime();
			page.methods.initWeekday();
			if(page.members.gOpenMode == "modify")
			{
				var selectedIndex = $("#formNotifyList").attr("selectedIndex");
				var mailList = CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.list").split(",");
				var mailid = mailList[selectedIndex];
				var time = CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.E" + mailid + ".time").split(":");
				$("#sendtime").attr("selectedIndex", parseInt(time[0]));
			}
		},

		initSendTime:function()
		{
			$("select#sendtime").empty();
			for(var i = 0; i < 24; i ++)
			{
				var time = i + ":00";
				$("select#sendtime").append("<option value='" + time + "'></option>")
					.find("option").last().append(time);
			}
		},

		initWeekday:function()
		{
			if(page.members.gOpenMode == "modify")
			{
				var selectedIndex = $("#formNotifyList").attr("selectedIndex");
				var mailList = CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.list").split(",");
				var mailid = mailList[selectedIndex];
				try
				{
					var weekdaylist = CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.E" + mailid + ".wdaylist");
					$(".weekdaylist").attr("checked", false);
					var weekdayarray = weekdaylist.split(",");
					for(var i = 0; i < weekdayarray.length; i ++)
					{
						$("#weekday" + weekdayarray[i]).attr("checked", true);
					}	
				}
				catch(exception)
				{
					$(".weekdaylist").attr("checked", false);
					page.members.gMissWdList = true;
					return;
				}
			}
		},

		initWeekdayInnerHtml:function()
		{
			$(".triggertimecls").remove();
			var sendtimeInnerHtml = "<span class='sendtimepan 04050975 triggertimecls' id='sendtimespan'>" + GetMsgLang("04050975") +  "</span><select id='sendtime' class='triggertimecls'></select>"
			$("li#weeklypan").last().append(sendtimeInnerHtml);
			page.methods.initSendTime();
			if(page.members.gOpenMode == "modify")
			{
				var selectedIndex = $("#formNotifyList").attr("selectedIndex");
				var mailList = CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.list").split(",");
				var mailid = mailList[selectedIndex];
				var time = CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.E" + mailid + ".time").split(":");
				$("#sendtime").attr("selectedIndex", parseInt(time[0]));
				$("#weekdaysel").attr("selectedIndex", CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.E" + mailid + ".wday"));
			}
		},

		initMonthdayInnerHtml:function()
		{
			$(".triggertimecls").remove();
			var sendtimeInnerHtml = "<span class='sendtimepan 04050975 triggertimecls' id='sendtimespan'>" + GetMsgLang("04050975") +  "</span><select id='sendtime' class='triggertimecls'></select>"
			$("li#monthlypan").first().append(sendtimeInnerHtml);
			page.methods.initSendTime();
			if(page.members.gOpenMode == "modify")
			{
				var selectedIndex = $("#formNotifyList").attr("selectedIndex");
				var mailList = CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.list").split(",");
				var mailid = mailList[selectedIndex];
				var time = CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.E" + mailid + ".time").split(":");
				$("#sendtime").attr("selectedIndex", parseInt(time[0]));
				$("#monthdaysel").attr("selectedIndex", CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.E" + mailid + ".mday") - 1);
			}
		},
		
		toggleElements: function () 
		{
			try 
			{
				var disable = $("#enabledbservice").attr("checked");
				page.eventCallback.enableDbServiceChange();
				$("#btnClear").button({disabled: disable});
				if($.browser.msie == true)
				{
					$("#restore").attr("disabled", disable);
				}
				else
				{
					if(disable == true)
					{
						$("#Filedata").attr("disabled", "disabled");
					}
					else
					{
						$("#Filedata").attr("disabled", false);
					}
					
				}
				if(disable == false)
				{
					$("#requesturi").val("");
				}
				$("#btnTable").button({disabled: !disable});
				$("#btnBar").button({disabled: !disable});
				$("#btnCSV").button({disabled: !disable});
				$("#servicedisabled").toggle(!disable);
				$(".servicedisablednotify").toggle(!disable);

				if(CAP.ajax.getServerData("VCA.Ch0.pushservice") == "yes")
				{
					$(".psenable").toggle(true);
				}
				page.methods.toogleNotify();
				
			} 
			catch (exception) 
			{
				CAP.logging.error("VCA Counter Report page element toggling...FAILED: " + exception);
				return;
			}
		},

		
		toogleNotify:function()
		{
			var enable = $("#enabledbservice").attr("checked");
			if(enable == false)
			{
				Disable($("#mailNotifyEnable"));
				$("#formNotifyList").attr("disabled", true);
				Disable($("#btnApplyEmailEnable"));
				Disable($("#btnAddAddr"));
	            Disable($("#btnModifyAddr"));
	            Disable($("#btnRemoveAddr"));
			}
			else
			{
				Enable($("#mailNotifyEnable"));
				Enable($("#btnApplyEmailEnable"));
				if(CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.enable") == "yes")
				{
					$("#formNotifyList").attr("disabled", false);
					Enable($("button#btnAddAddr"));
		            Enable($("button#btnModifyAddr"));
		            Enable($("button#btnRemoveAddr"));
				}
				else
				{
					$("#formNotifyList").attr("disabled", true);
					Disable($("#btnAddAddr"));
		            Disable($("#btnModifyAddr"));
		            Disable($("#btnRemoveAddr"));
				}
			}
		},

		toggleDataPeriod:function(enabled)
		{
			if(enabled == false)
			{
				Disable($("#reportall"));
				Disable($("#mailtimefrom"));
				Disable($("#mailtimeto"));
			}
			else
			{
				Enable($("#reportall"));
				if($("#reportall").attr("checked") == true)
				{
					Disable($("#mailtimefrom"));
					Disable($("#mailtimeto"));
				}
				else
				{
					Enable($("#mailtimefrom"));
					Enable($("#mailtimeto"));
				}
				
			}
			$(".disabledtimeperiod").toggle(!enabled);
			
		},
		
		setRollOverTime:function(index)
		{
			var rolloverctid = "#rolloverct" + index;
			var samplingId = "#sampling" + index;
			var rolloverTimeId = "#rollovertime" + index;
			var minutes = parseInt($(rolloverctid).val()) * parseInt($(samplingId).val());
			$(rolloverTimeId).val(page.methods.calculateRollOverTime(minutes));
		},

		calculateRollOverTime: function(minutes)
		{
			var m = minutes % 60;
			var h = parseInt(minutes / 60);
			var d = parseInt(h / 24);
			h = h%24;
			
			td = d?(d+" days "):"";
			th = h?(h+" hours "):"";
			minutes = m?(m+" minutes "):"";
			
			return td + th + minutes;
			
			if(minutes<60) {
				return m +" min";
			} else if(minutes<60*24) {
				return h +" hour "+(m?(m+ " min"):"");
			} else {
				return d+" day "+h +" hour "+m+ " min";
			}
		},

		calculateTotalDbSize: function()
		{
			var tableCnt = 0;
			var total = 0;
			if($("#enabletbl0").attr("checked") == true)
			{
				tableCnt ++;
				total += parseInt($("#rolloverct0").val());
			}
			if($("#enabletbl1").attr("checked") == true)
			{
				tableCnt ++;
				total += parseInt($("#rolloverct1").val());
			}
			if($("#enabletbl2").attr("checked") == true)
			{
				tableCnt ++;
				total += parseInt($("#rolloverct2").val());
			}
			if($("#enabletbl3").attr("checked") == true)
			{
				tableCnt ++;
				total += parseInt($("#rolloverct3").val());
			}
			total = (total * (20*4 + 8) + tableCnt*64) / 1024;
			$("#dbusedsize").val(total);
		},

		getEnableTableList:function()
		{
			var listStr = "";
			for(var i = 0; i < 4; i ++)
			{
				if($("#table" + i).attr("checked") == true)
				{
					if(i > 0 && listStr != "")
					{
						listStr += ","
					}
					listStr += "" + i;
				}
			}

			return listStr;
		},

		fileExtension_rev :function(fileValue)
		{
		  var lastIndex = -1;
		  var extension = "";

		  lastIndex  = fileValue.lastIndexOf('.');

		  if(lastIndex != -1)
		  {
		    extension = fileValue.substring( lastIndex+1, fileValue.len );
		  }
		  else
		  {
		    extension = "";
		  }

		  return extension;
		},

		fileExtension_chk: function(fileChk)
		{
		  if(fileChk.toLowerCase() != "tgz")
		  {
		    $("#btnStart").css("display", "none");
		    alert("Incorrect format of file for restore.");
		    return;
		  }
		  else if(fileChk.toLowerCase() == "tgz")
		  {
		    $("#btnStart").css("display", "inline");
		  }
		},

		SetRelation: function()
		{
		  $("#btnStart").css("display", "none");
		  $("input[type='submit']").button();
		  $("#Filedata").change(function(){
		    var fileData = $(this).val();
		    var fileEx = "";
		    $("#btnStart").css("display", "inline");

		    fileEx = page.methods.fileExtension_rev(fileData);
		    page.methods.fileExtension_chk(fileEx);
		  });
		  

		  $("form").submit(function(){
		    ViewLoadingSave(true);
			$("#btnStart").attr("disabled", true);
			var tClock;
			var reloadTime = 5;
			function write_time()
			{
			  if (reloadTime <= 1) {
			    clearInterval(tClock);
				$("#btnStart").attr("disabled", false);
				
			    ViewLoadingSave(false);
				page.methods.initElements();
			  }
			  else
			  {
			    reloadTime -= 1;
			  }
			}
		   tClock = setInterval(function(){
		     write_time();
		    },1000);
		  });
		},
		

		fillUri: function(addressStr, requestStr)
		{
			var sz = location.protocol+"//"+location.host;
			sz += addressStr;
			sz += "?";
			sz += requestStr;

			return sz;
		},

		checkLength: function(o,str,min,max)
	    {
	        if ( o.val().length > max || o.val().length < min ) {
	            o.addClass('ui-state-error');
	            $("#msg_status").text(str).addClass("ui-state-highlight");
	            o.focus();
	            return false;
	        } else {
	            return true;
	        }
	    },

		checkIdIsUsed: function(numId)
    	{
    		var list = CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.list");
			var mailIdArray = list.split(",");
			if(list.length == 0)
				return true;
			else
			{
				for(var i = 0; i < mailIdArray.length; i ++)
				{
					if(numId == parseInt(mailIdArray[i]))
					{
						return false;
					}
				}
			}

			return true;
    	},

		restartCountDog: function()
		{
			var actionReq = new CGIRequest();
			var reqQString = "action=restart";
			actionReq.SetAddress("/cgi-bin/operator/countreport.cgi");
			actionReq.Request(reqQString);
		},

		backupDB:function()
		{
			var href = page.methods.fillUri("/cgi-bin/operator/countreport.cgi", "action=backup");
			document.location.href=href;
		},

		clearDB: function()
		{
			var actionReq = new CGIRequest();
			var reqQString = "action=clear";
			actionReq.SetAddress("/cgi-bin/operator/countreport.cgi");
			actionReq.SetStartFunc(ViewLoadingSave)
			actionReq.Request(reqQString);
			$("#btnClear").button({disabled: true});
			var tClock;
			var reloadTime = 5;
			function write_time()
			{
				if (reloadTime <= 1) 
				{
					clearInterval(tClock);
					$("#btnClear").button({disabled: false});
					ViewLoadingSave(false);
					page.methods.initElements();
				}
				else
				{
					reloadTime -= 1;
				}
			}
			tClock = setInterval(function(){
		    	write_time();
		    },1000);
		  
		}, 

		//Submit actions
		submitRequest:function(type, width)
		{
			var actionReq = new CGIRequest();
			var reqQString = "reportfmt=" + type;
			reqQString += "&from="+$("#timefrom").val();
			reqQString += "&to="+$("#timeto").val();
			reqQString += "&counter="+$("#countselect").val();
			var index = $("#tableselect").attr("selectedIndex");
			var elementid = "#sampling" + index;
			var sampling = parseInt($(elementid).val())*60;
			reqQString += "&sampling="+sampling;
			if($("#sortselect").attr("selectedIndex") == 0)
				reqQString += "&order=Descending"
			else
				reqQString += "&order=Ascending"
			
			
			if($("#valuetypeselect").attr("selectedIndex") == 0)
				reqQString += "&value=abs";
			else
				reqQString += "&value=diff";
				

			
			if(type == "table" || type == "bar")
			{
				var href = page.methods.fillUri("/cgi-bin/operator/countreport.cgi", reqQString);
				var label = "Report" + type;
				var wparam = "width="+width+" height=400 resizable=1 scrollbars=1 ";
				$("#requesturi").val(href);
				var mywin = window.open(href,label,wparam);
				mywin.focus();
			}
			else
			{
				var href = page.methods.fillUri("/cgi-bin/operator/countreport.cgi", reqQString);
				$("#requesturi").val(href);
				document.location.href=href;
			}
			
		},

		generateWeekdayList:function()
		{
			var retList = "";
			for(var i = 0; i < 7; i ++)
			{
				var id = "#weekday" + i;
				if($(id).attr("checked") == true)
				{
					if(retList != "")
					{
						retList += ",";
					}
					retList += i;
				}
			}
			return retList;
		},

		generatJson:function(emailId, cgiaction)
		{
			var reportTime = $("input[name='triggerMode']:checked:radio").val();
			var enableHourly = "no";
			var enableDaily = "no";
			var enableWeekly = "no";
			var enableMonthly = "no";
			var timefrom;
			var timeto;
			var weekdaylist="";
			var grouppath = "";
			if(reportTime == "hourly")
			{
				enableHourly = "yes";
				timefrom = $("#sendtimefrom").attr("selectedIndex");
				timeto = $("#sendtimeto").attr("selectedIndex");
				weekdaylist = page.methods.generateWeekdayList();
			}
			else if(reportTime == "daily")
			{
				enableDaily = "yes";
				timefrom = $("#mailtimefrom").attr("selectedIndex");
				timeto = $("#mailtimeto").attr("selectedIndex");
				weekdaylist = page.methods.generateWeekdayList();
			}
			else if(reportTime == "weekly")
			{
				enableWeekly = "yes";
				timefrom = $("#mailtimefrom").attr("selectedIndex");
				timeto = $("#mailtimeto").attr("selectedIndex");
			}
			else if(reportTime == "monthly")
			{
				enableMonthly = "yes";
				timefrom = $("#mailtimefrom").attr("selectedIndex");
				timeto = $("#mailtimeto").attr("selectedIndex");
			}
			//patch
			
			var jsonArray = [];
			if(cgiaction == "update")
			{
				if(page.members.gMissWdList == true)
				{
					var tmpObj = 
						{
							action: "add",
							group:	"VCA.Ch0.Crpt.Email.E" + emailId,
							entries:[
								{id:'wdaylist', value:""}
							]
						}
					jsonArray.push(tmpObj);
					page.members.gMissWdList = false;
				}
				grouppath = "VCA.Ch0.Crpt.Email.E" + emailId;
			}
			else
			{
				grouppath = "VCA.Ch0.Crpt.Email";
			}
			
			var addObject = 
					{
						action: cgiaction,
						group:	grouppath,
						entries:[
									{id:'object', value: "Email"},
									{id:'id',value: ""+emailId},
									{id:'name',value:$("#mailname").val()},
									{id:'description',value:$("#maildesc").val()},
									{id:'addr',value:$("#mailaddr").val()},
									{id:'reportall', value: ($("#reportall").attr("checked")?"yes":"no")},
									{id:'from', value:"" + timefrom + ":00:00"},
									{id:'to', value:"" + timeto + ":00:00"},
									{id:'wdaylist', value: weekdaylist},
									{id:'counter',value:$("#mailcountselect").val()},
									{id:'table',value:page.methods.getEnableTableList()},
									{id:'order',value:$("input[name='formSort']:checked:radio").val()},
									{id:'value',value:$("input[name='formValue']:checked:radio").val()},
									{id:'reportfmt',value:$("input[name='formFormat']:checked:radio").val()},
									{id:'time',value: "" + $("#sendtime").attr("selectedIndex") + ":00:00"},
									{id:'hourly',value:enableHourly},
									{id:'daily',value:enableDaily},
									{id:'weekly',value:enableWeekly},
									{id:'wday',value:"" + $("#weekdaysel").attr("selectedIndex")},
									{id:'monthly',value:enableMonthly},
									{id:'mday',value: "" + ($("#monthdaysel").attr("selectedIndex") + 1)}
								]
					}
			jsonArray.push(addObject);

			return jsonArray;
		},

		addEmailAddress:function()
		{
			if($("select#formNotifyList").attr("length") == 8)
			{
				alert(GetMsgLang("04050997"));
			}
			
			for(var i = 0; i < 8; i ++)
			{
				if(page.methods.checkIdIsUsed(i) == true)
				{
					curId = i;
					break;
				}
			}
			
        	var jsonArray = page.methods.generatJson(curId, "add");
			Disable($("button#btnAddAddr"));
            Disable($("button#btnModifyAddr"));
            Disable($("button#btnRemoveAddr"));
			top.$(window.top).unbind('capServerDataRefresh', page.eventCallback.updateData);
			top.$(window.top).bind('capServerDataRefresh', page.eventCallback.updateNotifyData);
			CAP.ajax.setServerData(jsonArray);
			
		},

		updateEmailAddress:function()
		{
			var idx = $("select#formNotifyList").attr("selectedIndex");
			var list = CAP.ajax.getServerData("VCA.Ch0.Crpt.Email.list");
			var mailIdArray = list.split(",");
			var curId = parseInt(mailIdArray[idx]);
        	var jsonArray = page.methods.generatJson(curId, "update");
			Disable($("button#btnAddAddr"));
            Disable($("button#btnModifyAddr"));
            Disable($("button#btnRemoveAddr"));
			top.$(window.top).unbind('capServerDataRefresh', page.eventCallback.updateData);
			top.$(window.top).bind('capServerDataRefresh', page.eventCallback.updateNotifyData);
			CAP.ajax.setServerData(jsonArray);
		},

		emailTest:function()
		{ 
			var reportTime = $("input[name='triggerMode']:checked:radio").val();
			var enableHourly = "no";
			var enableDaily = "no";
			var enableWeekly = "no";
			var enableMonthly = "no";
			
			if(reportTime == "hourly")
				enableHourly = "yes";
			else if(reportTime == "daily")
				enableDaily = "yes";
			else if(reportTime == "weekly")
				enableWeekly = "yes";
			else if(reportTime == "monthly")
				enableMonthly = "yes";
			ViewLoadingSave(true);
			var reqStr = "/cgi-bin/operator/countreport.cgi?action=test&addr=" + $("#mailaddr:text").val();
				reqStr += "&name=" + $("#mailname").val();
				reqStr += "&from=" + $("#mailtimefrom").attr("selectedIndex");
				reqStr += "&to=" + $("#mailtimeto").attr("selectedIndex");
				reqStr += "&counter=" + $("#mailcountselect").val();
				reqStr += "&table=" + page.methods.getEnableTableList();
				reqStr += "&order=" + $("input[name='formSort']:checked:radio").val();
				reqStr += "&value=" + $("input[name='formValue']:checked:radio").val();
				reqStr += "&reportfmt=" + $("input[name='formFormat']:checked:radio").val();
				reqStr += "&reportall=" + ($("#reportall").attr("checked")?"yes":"no");
				reqStr += "&time=" + $("#sendtime").attr("selectedIndex");
				reqStr += "&hourly=" + enableHourly;
				reqStr += "&daily=" + enableDaily;
				reqStr += "&weekly=" + enableWeekly;
				reqStr += "&wday=" + $("#weekdaysel").attr("selectedIndex");
				reqStr += "&monthly=" + enableMonthly;
				reqStr += "&mday=" + ($("#monthdaysel").attr("selectedIndex") + 1);
			$.get(reqStr, 
			function(data) {
				var apiState = 0;
				var errordescription = "";

				//#200|OK|Mail send success
				//#403|ERR OPERATION|Mail send error|testaction.cgi error description|smtp server error description
				if(data.search("#200") == -1)
				{
					apiState = -1;
				}

				var retpart = data.split("|");
				
				if (apiState != 0) {
					alert(retpart[4]);
				}
				ViewLoadingSave(false);
				Enable($("#btnSendTest"));
			});
		},

		ReflushDateTime:function()
		{
		  $.getScript("/uapi-cgi/datetime.cgi?action=get&mode=js&_=" + (new Date()).getTime(), function() {
		    var sDateObj = new Date(DATETIME_DATE_YEAR, DATETIME_DATE_MONTH-1, DATETIME_DATE_DAY,
		            DATETIME_TIME_HOUR, DATETIME_TIME_MINUTE, DATETIME_TIME_SECOND);
		    var uDateObj = new Date();
		    var diffTime = Math.round(sDateObj.getTime()/1000) - Math.round(uDateObj.getTime()/1000);
		    if ($.epiclock("#server_clock")) {
		      $.epiclock("#server_clock").destroy();
		    }
		    

		    $("#server_clock").empty().epiclock({
		      //mode: $.epiclock.modes.explicit,
		      format: 'Y/m/d	G:i:s',
		      offset: {seconds: diffTime}
		    });
		    
		    delete sDateObj;
		    delete uDateObj;

		    
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
	if (w) curleft = obj.offsetWidth;
	if (obj.offsetParent) 
	{
		while (obj.offsetParent) 
        {
            curleft += obj.offsetLeft
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