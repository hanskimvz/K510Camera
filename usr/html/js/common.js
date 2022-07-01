var paramjs_url = "/uapi-cgi/paramjs.fcgi";
var param_url = "/uapi-cgi/param.cgi";

// language depth info
var live = "live ";
var storage = "storage ";
var setup = "setup "
var menucontents = "menucontents ";
var maincontents = "maincontents ";

/* A polyfill for IE8 */
if (!Array.prototype.indexOf)
{
    Array.prototype.indexOf = function(elt /*, from*/)
    {
        var len = this.length >>> 0;

        var from = Number(arguments[1]) || 0;
            from = (from < 0)
                ? Math.ceil(from)
                : Math.floor(from);
        if (from < 0)
            from += len;

        for (; from < len; from++)
        {
            if (from in this &&
            this[from] === elt)
            return from;
        }
        return -1;
    };
}

var fDebug = "n";
if(fDebug === "y") {
    var _debugStartTime = 0;
    var _debugBeforeTime = 0;
    var _debugLoading = 0;
}

var makeQString = function () {
    var qstring = "";

    var basic = {
        // action: list, update, remove, add
        action : "list",
        // schema: text, xml, json
        schema : "text",
        group : ""
    };

    var entrylist = [];
    var nodelist = [];

    return {
        set_qstring: function (str) {
            this.clear();
            qstring = str;
            return this;
        },
        set_action: function (str) {
            if (str) {
                basic.action = str;
            }
            return this;
        },
        set_schema: function (str) {
            if (str) {
                basic.schema = str;
            }
            return this;
        },
        get_qstring: function () {
            var i;

            if (!basic.action) {
                return qstring;
            }

            if (entrylist.length) {
                qstring += "&group=" + basic.group;
                for (i = 0; i < entrylist.length; i++)
                {
                    qstring += "&";
                    if (typeof entrylist[i] === "object") {
                        qstring += entrylist[i].join('=');
                    }
                    else {
                        qstring += entrylist[i];
                    }
                }
            }

            if (nodelist.length) {
                for (i = 0; i < nodelist.length; i++)
                {
                    qstring += "&";
                    if (typeof nodelist[i] === "object") {
                        qstring += nodelist[i].join('=');
                    }
                    else {
                        qstring += nodelist[i];
                    }
                }
            }

            if(!qstring) {
                return;
            }

            qstring = "action=" + basic.action + qstring;

            if (basic.schema) {
                qstring += "&schema=" + basic.schema;
            }

            return qstring;
        },
        get_action: function () {
            return basic.action;
        },
        get_schema: function (str) {
            return basic.schema;
        },
        add_list: function (node, dbvalue, formvalue) {
            if (typeof dbvalue === "undefined") {
                nodelist.push(node);
            }
            else if (dbvalue !== decodeURIComponent(formvalue)) {
                if (typeof formvalue !== "undefined") {
                    nodelist.push([node, formvalue]);
                }
            }
            return this;
        },
        add_undecode_list:function(node, dbvalue, formvalue) {
        	 if (typeof dbvalue === "undefined") {
                	nodelist.push(node);
	            }
	            else if (dbvalue !== formvalue) {
	                if (typeof formvalue !== "undefined") {
	                    nodelist.push([node, formvalue]);
	                }
	            }
	            return this;
        },
        add_entry: function (group, entry, dbvalue, formvalue) {
            basic.group = group;
            if (typeof dbvalue === "undefined") {
                entrylist.push(entry);
            }
            else if (dbvalue !== formvalue) {
                if (typeof formvalue !== "undefined") {
                    entrylist.push([entry, formvalue]);
                }
            }
            return this;
        },
        delete_entry: function (entry) {
            var value;
            for (var i=0; i<entrylist.length; i++)
            {
                if (typeof entrylist[i] === "object") {
                    value = entrylist[i][0];
                }
                else {
                    value = entrylist[i];
                }

                if (value === entry) {
                    delete entrylist[i];
                    entrylist.splice(i, 1);
                    break;
                }
            }

            return this;
        },
        clear: function() {
            basic.action = "";
            basic.group = "";
            basic.schema = "";
            basic.qstring = "";
        }
    };
};

function PreCustomize() {
    $.ajax({
        type: "GET",
        url: "/cust/customize.js",
        datatype: "script",
        async: false,
        success: function(data){
            PreCustomizeRun();
        }
    });
}

function PostCustomize() {
    $.ajax({
        type: "GET",
        url: "/cust/customize.js",
        datatype: "script",
        async: false,
        success: function(data){
            PostCustomizeRun();
        }
    });
}

function CallBackCustomize() {
    $.ajax({
        type: "GET",
        url: "/cust/customize.js",
        datatype: "script",
        async: false,
        success: function(data){
            CallBackCustRun();
        }
    });
}

function _debug(msg)
{
    if (fDebug !== "y")
    {
        return;
    }

    if (!window.console)
    {
        return;
    }

    var time = new Date().getTime();

    function cvSecond(time) {
        var cvTime;

        if (time < 10) cvTime =    ".00" + time;
        else if ( time < 100) cvTime = ".0" + time;
        else cvTime = Math.floor(time/1000) + "." + time%1000;

        return cvTime;
    }

     function proctime() {
        var diff = time - _debugBeforeTime;

        return "+" + cvSecond(diff);
     }

    switch(msg)
    {
        case "start":
            console.log("");
            console.log("URL: " + window.location.pathname);
//            console.log("[START]" + cvSecond(time));
            _debugStartTime = time;
            _debugBeforeTime = time;
            break;
        case "stop":
//            console.log("[STOP]" + cvSecond(time));
            console.log("Precess SEC: " + cvSecond(time-_debugStartTime));

            break;
        default:
            console.log("[" + proctime() + "]" + msg + "(" + cvSecond(time) + ")");
            _debugBeforeTime = time;
            break;
    }
}

function InitThemes()
{
    var brandReq = new CGIRequest();
    var brandReqQString = "";
    var theme = "";

    brandReq.SetAddress("/environment.xml");
    brandReq.SetCallBackFunc(function(xml){
        if($('skin', xml).size() > 0)
        {
            theme = $('skin', xml).text();
            ChangeThemes(theme);
            EvenOdd(theme);
        }
        else if($('skin', xml).size() == 0)
        {
            theme = "noline-silver";
            ChangeThemes(theme);
            EvenOdd(theme);
        }
        return;
    });
    brandReq.Request(brandReqQString);
}

function ChangeThemes(theme)
{
    if(!theme) theme = "noline-silver";
    var url = "/css/themes/" + theme + "/jquery-ui.css";
    $("head").append("<link type='text/css' href='" + url + "' rel='stylesheet' />");

    //$("#brandname, #pagename").removeClass();
    $("#brandname, #pagename").addClass(theme);
}

function FillText(str, nSize, align)
{
    var newStr = "";
    var strLength = "";

    strLength = str.replace(/&lt;/g, "<");

    if(strLength.length > nSize)
    {
        if (align == "right") {
            newStr = "..." + str.substring(0, nSize-3);
        }
        else {
            newStr = str.substring(0, nSize-3) + "...";
        }
    }
    else
    {
        switch(align)
        {
        case "left":
            newStr = str;
            for(var j = strLength.length; j < nSize; j++)
                newStr += "&nbsp;";
            break;
        case "right":
            for(var j = strLength.length; j < nSize; j++)
                newStr += "&nbsp;";
            newStr += str;
            break;
        case "center":
            for(var j = 0; j < (nSize-strLength.length)/2; j++)
                newStr += "&nbsp;";
            newStr += str;
            strLength = newStr.replace(/&lt;/g, "<");
            for(j = strLength.length; j < nSize; j++)
                newStr += "&nbsp;";
            break;
        default:
            newStr = str;
            break;
        }
    }
    return newStr;
}

function ContentShow()
{
    if($(".box").hasClass("ui-widget") == false) $(".box").addClass("ui-widget");
    if($(".box-title").hasClass("ui-widget-header") == false) $(".box-title").addClass("ui-widget-header");
    if($(".box-subtitle").hasClass("ui-widget-header") == false) $(".box-subtitle").addClass("ui-widget-header");
    if($(".box-content").hasClass("ui-widget-content") == false) $(".box-content").addClass("ui-widget-content");

    $("body").show();
    ResizePage();
}

function ResizePage(size)
{
    if (parent.document.getElementById("contentFrame"))
    {
        if(size)
        {
            parent.document.getElementById("contentFrame").height = size;
        }
        else
        {
            //if(document.body.scrollHeight < 300)
            if(document.body.clientHeight < 300)
            {
                parent.document.getElementById("contentFrame").height = 300;
            }
            else
            {
                //parent.document.getElementById("contentFrame").height = document.body.scrollHeight + 50;
                parent.document.getElementById("contentFrame").height = document.body.clientHeight + 50;
            }
        }
    }
}

function identifyGroup(func)
{
    var username = "";
//    var usergroup = "guest";
    var usergroup = "operator";

/*
    if (usergroup) {
        paramjs_url = "/uapi-cgi/" + usergroup + "/paramjs.cgi";
        param_url = "/uapi-cgi/" + usergroup + "/param.cgi";
    }
    func();
    return;
*/
    if(!$.cookie("username") || (!$.cookie("usergroup")))
    {
             var Req = new CGIRequest();

        Req.SetAddress("/cgi-bin/authinfo.cgi");
//        Req.SetAsyn(true);
        Req.SetCallBackFunc(function(xml){
            // xml data 받아옴
            if($('username', xml).size() > 0)
            {
                username = $('username', xml).text();
            }
            if($('usergroup', xml).size() > 0)
            {
                usergroup = $('usergroup', xml).text();
            }

            $.cookie("username", username);
            $.cookie("usergroup", usergroup);

            group = $.cookie("usergroup");
            if (group) {
                paramjs_url = "/uapi-cgi/" + group + "/paramjs.cgi";
                param_url = "/uapi-cgi/" + group + "/param.cgi";
            }
            else
            {
                paramjs_url = "/uapi-cgi/paramjs.cgi";
                param_url = "/uapi-cgi/param.cgi";
            }
            alert(paramjs_url + " / " + param_url);
            if(func) func(group);
        });
        Req.SetErrorFunc(function() {
            $.cookie("username", null);
            $.cookie("usergroup", null);
        });

        Req.Request();
    }
    else
    {
        group = $.cookie("usergroup");
        if (group) {
            paramjs_url = "/uapi-cgi/" + group + "/paramjs.cgi";
            param_url = "/uapi-cgi/" + group + "/param.cgi";
        }
        else
        {
            paramjs_url = "/uapi-cgi/paramjs.cgi";
            param_url = "/uapi-cgi/param.cgi";
        }
        if(func) func(group);
    }
}

function LoadParamJs(group, cbFunc)
{
    $.getScript(paramjs_url+ "?" + group + "&_=" + (new Date()).getTime(), function() {
        if (cbFunc)
        {
            cbFunc();
        }
    });
}

function ErrorCheck(xml)
{
    if ($('ERROR', xml).size() > 0)
    {
        alert($('ERROR', xml).text());
        return false;
    }

    return true;
}

////////////////////////////////////////////////////////////////////////////////
// Function name : CGIResponseCheck(option, resultxml)
// Description     : return value according to response of cgi
// Argument            : option(0 : return error message, 1: return error state), resultxml
// Return Value    : 0(success), -1 or error message(error), -2(invalid argument),
////////////////////////////////////////////////////////////////////////////////
function CGIResponseCheck(option, resultData, contentsType)
{
    if(option == undefined)
    {
        return -2;
    }
    if(resultData == undefined)
    {
        return -2;
    }

    var ret = 0;
    var contentsTypeResult = "xml";
    if(contentsType) contentsTypeResult = contentsType;
    if(contentsTypeResult == "xml")
    {
        if ($('ERROR', resultData).size() > 0)
        {
            //according to cgi/common/message.h
            //format : #code|message|description...
            var errormessage = "";
            errormessage = $('ERROR', resultData).text();

            ret = (option == 0) ? errormessage : -1;
        }
    }
    else
    {
        var resultData = resultData.split("|");
        if(resultData[0] != "#200")
            ret = (option == 0) ? resultData[1] : -1;
    }

    return ret;
}

function IsEmpty(s)
{
        var pt = /[\S]/;
        return !pt.test(s);
}

function ViewLoadingSave(flag)
{
    if(flag == false)
    {
        $("#loading_msg").hide(100, function() {
            $(this).remove();
        });

        // ViewLoading Message hide 상태에서 button 활성화
        $("button").attr("disabled", "").removeClass("ui-button-disabled ui-state-disabled");
        $("input[type='button']").attr("disabled", "").removeClass("ui-button-disabled ui-state-disabled");

    }
    else
    {
        $("#loading_msg").each(function(){
            $(this).remove();
        });

        // ViewLoading Message show 상태에서 button 비활성화
        $("button").attr("disabled", "disabled").addClass("ui-button-disabled ui-state-disabled");
        $("input[type='button']").attr("disabled", "disabled").addClass("ui-button-disabled ui-state-disabled");

        //$("body").append("<div id='loading_msg'><p>This configuration is being saved now.</p><p>Please wait...</p></div>");
        $("body").append("<div id='loading_msg'><img src='/images/loading.gif'></img></div>");
        $("#loading_msg").show("fast");
    }

    return;
}

function viewLoading(flag)
{
    if(flag == false)
    {
        $("html").css("cursor", "default");
        $("button").attr("disabled", "").removeClass("ui-button-disabled ui-state-disabled");
        $("input[type='button']").attr("disabled", "").removeClass("ui-button-disabled ui-state-disabled");
    }
    else
    {
        $("html").css("cursor", "wait");
        $("button").attr("disabled", "disabled").addClass("ui-button-disabled ui-state-disabled");
        $("input[type='button']").attr("disabled", "disabled").addClass("ui-button-disabled ui-state-disabled");
    }

    return;
}

function Disable(obj)
{
    obj.attr("disabled", "disabled");

    var objType = obj.attr("type");
    if(objType == "button" || objType == "submit" || objType == "reset")
    {
        obj.addClass("ui-button-disabled ui-state-disabled");
    }
    else if(objType == "text")
    {
        obj.css("background-color", "#EEEEEE");
    }
    else if(objType == "password")
    {
        obj.css("background-color", "#EEEEEE");
    }

    if(obj.has(".slider-bar"))
    {
        obj.slider("option", "disabled", true);
    }

}
function Enable(obj)
{
    obj.attr("disabled", "");

    var objType = obj.attr("type");
    if(objType == "button" || objType == "submit" || objType == "reset")
    {
		obj.removeClass("ui-button-disabled ui-state-disabled");
    }
    else if(objType == "text")
    {
        obj.css("background-color", "#FFFFFF");
    }
    else if(objType == "password")
    {
        obj.css("background-color", "#FFFFFF");
    }

    if(obj.has(".slider-bar"))
    {
        obj.slider("option", "disabled", false);
    }
}

// Even, Odd 선택 함수
function EvenOdd(flag)
{
    var value = 0;
    var evenoddCnt = 0;

    if (!flag) {
        value = 1;
    }
    $(".box").each(function() {
        if ($(this).hasClass("evenInit")    == true)
            evenoddCnt = 1;
        else
            evenoddCnt = 0;

        $(".item", $(this)).each(function(idx){
            if ($(this).is(".nocolor"))
            {
                return;
            }
            if (flag == 'noline-silver' || flag == 'user') {
                $(this).removeClass("odd even");
                if($(this).hasClass("hidden_contents") == false && $(this).css("display") != "none")
                {
                    if (evenoddCnt % 2 == value) {
                        $(this).addClass("odd");
                    }
                    else {
                        $(this).addClass("even");
                    }
                    evenoddCnt++;
                }
            }
            else
            {
                $(this).removeClass("odd");
                $(this).removeClass("even");
            }
        });
    });
}

function LimitCharac(nameId, limit)
{
    var text = $('#' + nameId).val();

    if(text.length > limit)
    {
        $('#' + nameId).val(text.substr(0,limit));
            return false;
    }
    else
    {
        return true;
    }
}
function LimitKor()
{
    $(":text").keydown(function(){
        if($.browser.safari)
        {
            if(event.which == 229)
            {
                event.returnValue = false;
            }
        }
    });
    $(":password").keydown(function(){
        if($.browser.safari)
        {
            if(event.which == 229)
            {
                event.returnValue = false;
            }
        }
    });
}

function ReloadCache(apiurl)
{
    var frm = "ApiLoadingFrame";

    if ($("#" + frm).size())
    {
        $("#" + frm).remove();
    }

    $("body").append("<iframe id=\"" + frm +"\" width=\"0\" height=\"0\"></ifrmae>");
    $("#" + frm).contents().append("<script type=\"text/javascript\" src=\"" + apiurl + "\"></script>");
}

function getLangXml(lang, depth, run)
{
    var langReq = new CGIRequest();
    var langOption = "English";

    langOption = lang.split("/");
    langOption = langOption[2].split(".");
    langOption = langOption[0];

    //set direction and language tag according to language
    var dirValue = getLanguageDirection(langOption);
    var langValue = getLanguageCode(langOption);
    $("html").attr({
        dir: dirValue,
        lang: langValue
    });


    langReq.SetAsyn(false);
    langReq.SetAddress(lang);
    langReq.SetCallBackFunc(function(xml){
        $(xml).find(langOption + " topmenu").children().each(function(){
            var id = $(this).attr('id');
            var text = $(this).text();

            $("." + id).html(text);
        });

        $(xml).find(langOption + " vcageneric").children().each(function(){
            var id = $(this).attr('id');
            var text = $(this).text();

            $("." + id).html(text);
        });

        var processChild = function (child) {
            var id = child.attr('id');
            var text = child.text();

            if(typeof(id) === "string" && typeof(text) === "string") {
                var obj = $("." + id);
                if(obj[0] && obj[0].tagName === "BUTTON")
                    obj.button({ label: text});
                else
                    obj.html(text);

                //BB: Search in the top level frame for dymanic translation 'div' elements:
                window.top.$("div." + id).html(text);
            }
        };

        $(xml).find(langOption + " " + depth).children().each(function(){
            processChild($(this));
        });

        $(xml).find(langOption + " cgiresponse").children().each(function(){
            var id = $(this).attr('id');
            var text = $(this).text();

            $("." + id).html(text);
        });

	if(run != undefined)
        {
            run();
	}

        $(".main").show();
        $("#top").show();
        parent.$("#frame").show();
        parent.$("#frame_search").show();
        return;
    });
    langReq.SetErrorFunc(function(){
    	if(run != undefined)
        {
            run();
	}

        $(".main").show();
        $("#top").show();
        parent.$("#frame").show();
        parent.$("#frame_search").show();
        return;
    });
    langReq.Request();
}

function setLanguage(lang, pagePath, xmlData, run)
{
    var langOption = lang.split("/");
    langOption = langOption[2].split(".");
    langOption = langOption[0];

    //set direction and language tag according to language
    var dirValue = getLanguageDirection(langOption);
    var langValue = getLanguageCode(langOption);
    $("html").attr({
        dir: dirValue,
        lang: langValue
    });

    $(xmlData).find(langOption + " topmenu").children().each(function(){
        var id = $(this).attr('id');
        var text = $(this).text();

        $("." + id).html(text);
    });

    $(xmlData).find(langOption + " vcageneric").children().each(function(){
        var id = $(this).attr('id');
        var text = $(this).text();

        $("." + id).html(text);
    });

    var processChild = function (child) {
        var id = child.attr('id');
        var text = child.text();

        if(typeof(id) === "string" && typeof(text) === "string") {
            var obj = $("." + id);
            if(obj[0] && obj[0].tagName === "BUTTON")
                obj.button({ label: text});
            else
                obj.html(text);

            //BB: Search in the top level frame for dymanic translation 'div' elements:
            window.top.$("div." + id).html(text);
        }
    };

    $(xmlData).find(langOption + " " + pagePath).children().each(function(){
        processChild($(this));
    });

    $(xmlData).find(langOption + " cgiresponse").children().each(function(){
        var id = $(this).attr('id');
        var text = $(this).text();

        $("." + id).html(text);
    });

    if(run != undefined)
    {
        run();
    }

    $(".main").show();
    $("#top").show();
    parent.$("#frame").show();
    parent.$("#frame_search").show();
}

function getLangEnvironment(langMenuName)
{
    var environmentReq = new CGIRequest();
    var environmentReqQString = "";
    var langDepth = setup + maincontents + langMenuName;
    environmentReq.SetAddress("/environment.xml");
    environmentReq.SetCallBackFunc(function(xml){
        var revLang = "/language/English.xml";

        if($('lang', xml).size() > 0)
        {
            revLang = $('lang', xml).text();
            getLangXml(revLang, langDepth);
        }
    });
    environmentReq.Request(environmentReqQString);
}

function TopMenuDisplay()
{
    InitCornerSet();
}

function InitCornerSet()
{
    $("#topmenu").corner("bottom 10px").css("display", "block");
}

function InitMsgLang(classNum)
{
    var tagStr = "";
    var i = 0;

    for(i=0; i<classNum.length; i++)
    {
        tagStr += "<div class='hidden_contents dsp_hide " + classNum[i] + "'></div>";
    }

    $("body").append(tagStr);
}

////////////////////////////////////////////////////////////////////////////////
// Function Name : GetMsgLang(classNum)
// Description     : Get language for message
// Return Value    : langString
////////////////////////////////////////////////////////////////////////////////
function GetMsgLang(classNum)
{
    var langString = "";

    langString = $("." + classNum).first().text();

    return langString;
}

////////////////////////////////////////////////////////////////////////////////
// Function Name : ExchangeValues(value1, value2)
// Description     : Value1 and value2 are exchanged
// Return Value    : Value list of the exchange(ret.value1, ret.value2)
////////////////////////////////////////////////////////////////////////////////
function ExchangeValues(value1, value2)
{
    var result = {};

    result.value1 = value2;
    result.value2 = value1;

    return result;
}

function getCookie(cname)
{
    var i,x,y,arrCookies = document.cookie.split(";");

    for (i=0; i<arrCookies.length; i++)
    {
        x = arrCookies[i].substr(0, arrCookies[i].indexOf("="));
        y = arrCookies[i].substr(arrCookies[i].indexOf("=") + 1);
        x = x.replace(/^\s+|\s+$/g, "");

        if (x == cname) return unescape(y);
    }
}

function setCookie(cname, value, exdays)
{
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var cvalue = escape(value) + ((exdays==null) ? "" : "; expires=" + exdate.toUTCString());
    document.cookie = cname + "=" + cvalue;
}

function getLanguageDirection(language)
{
    var dirValue = "ltr";

    switch(language.toLowerCase()) {
        case "arabic":
            dirValue = "rtl";
            break;
        default:
            break;
    }

    return dirValue;
}

function getLanguageCode(language)
{
    var langValue = "en";

    switch(language.toLowerCase()) {
        case "arabic":
            langValue = "ar";
            break;
        default:
            break;
    }

    return langValue;
}

function browserCheck()
{
    var nameResult = "msie";
    var currentBrowser = undefined;
    if($.browser)
      var currentBrowser = $.browser.msie;

    if (currentBrowser == true)
    {
        nameResult = "msie";
    }
    else
    {
        var isTrident = !!navigator.userAgent.match(/Trident\/7/);
        var isRv = !!navigator.userAgent.match(/rv:11/);

        if (window.ActiveXObject || (isTrident == true && isRv == true))
        {
            nameResult = "msie";
        }
        else
        {
            nameResult = "etc";
        }
    }

    return nameResult;
}

////////////////////////////////////////////////////////////////////////////////
// Function Name: translateResolution(videoStandard, resolutionName)
////////////////////////////////////////////////////////////////////////////////
function translateResolution(videoStandard, resolutionName)
{
    if(typeof(resolutionName) != "string" && resolutionName != null)
    {
        if(window.console)
            console.log("[Weblog] '" + resolutionName + "' is not string type.");

        resolutionName = resolutionName.toString();
    }

    if(videoStandard != "pal" && videoStandard != "ntsc" && videoStandard != "cmos")
        videoStandard = "ntsc";

    if(videoStandard == "pal")
    {
        switch(resolutionName)
        {
            case "d1":    return "720x576";
            case "4cif":  return "704x576";
            case "2cif":  return "704x288";
            case "vga":   return "640x480";
            case "cif":   return "352x288";
            case "qvga":  return "320x240";
            case "qcif":  return "176x144";
        }
    }
    else if (videoStandard == "ntsc")
    {
        switch(resolutionName)
        {
            case "d1":    return "720x480";
            case "4cif":  return "704x480";
            case "2cif":  return "704x240";
            case "vga":   return "640x480";
            case "cif":   return "352x240";
            case "qvga":  return "320x240";
            case "qcif":  return "176x120";
        }
    }
    else if(videoStandard == "cmos")
    {
        switch(resolutionName)
        {
            case "qxga":   return "2048x1536";
            case "uxga":   return "1600x1200";
            case "sxga":   return "1280x960";
            case "xga":    return "1024x768";
            case "svga":   return "800x600";
            case "pal":   return "720x576";
            case "ntsc":   return "720x480";
            case "vga":    return"640x480";
            case "qvga":   return "320x240";
            case "qqvga":   return "160x120";
        }
    }

    return resolutionName;
}

function isLimitFPS14(aspectRatioValue, modelID)
{
    if((modelID == "b010" || modelID == "b011" || modelID == "b01b") && aspectRatioValue == "4:3")
    {
        return true;
    }

    return false;
}

function transrationMaxRange(aspectRatioValue, modelID)
{
    if(isLimitFPS14(aspectRatioValue, modelID))
        return 14;

    return 30;
}

function adjustRatioWidthHeight(curRatio, baseHeight)
{
    var width;
    if(curRatio == "4:3")
        width = baseHeight/3*4;
    else
        width = baseHeight/9*16;

    return [width, baseHeight];
}

function isIPV6()
{
    var result = false;
    var host = window.location.host;

    var regExp = /[:]/g;
    var resultArray = host.match(regExp);
    if(resultArray != null)
    {
        if(resultArray.length > 1 )
        {
            result = true;
        }
    }

    return result;
}


function makeISOStringToDateFormat(isoString)
{
  var retDate = null;

  //[YYYY]-[MM]-[DD]T[HH]:[mm]:[ss].[milliseconds]Z
  var dateExp  = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).(\d{3})Z/g
  var dateArray = dateExp.exec(isoString);
  if(dateArray != null) {
    retDate = new Date(dateArray[1], (dateArray[2] - 1), dateArray[3], dateArray[4], dateArray[5], dateArray[6], dateArray[7]);
  }

  return retDate;
}

function MakeDateString(dateFormat)
{
  var ruleTime = "";

  if(dateFormat)
  {
    var year = dateFormat.getFullYear();
    var month = dateFormat.getMonth() + 1;
    if(month < 10)
    {
      month = "0" + month;
    }
    var date = dateFormat.getDate();
    if(date < 10)
    {
      date = "0" + date;
    }
    var hour = dateFormat.getHours();
    if(hour < 10)
    {
      hour = "0" + hour;
    }
    var min = dateFormat.getMinutes();
    if(min < 10)
    {
      min = "0" + min;
    }
    var sec = dateFormat.getSeconds();
    if(sec < 10)
    {
      sec = "0" + sec;
    }

    ruleTime = year + "-" + month + "-" + date + " " +
      hour + ":" + min + ":" + sec;
  }

  return ruleTime;
}

var authElevateRequest = function()
{
    AxUMF.SetParam("CONTROL", "AUTH_ELEVATE", getCurAddress() + ","+ getCurPort());
}

function parseTestActionResponse(cbData)
{
  if(cbData == null || cbData == undefined) return;

  var retPart = cbData.split("|");
  var httpCode = retPart[0].trim();
  var urlMsg = retPart[2].trim();
  var desMsg = retPart[3].trim();
  var errorString = "";

  if(httpCode == "#200")
  {
    errorString = "Test success.";
  }
  else if(httpCode == "#403")
  {
    errorString = GetMsgLang("0501");
  }
  else
  {
    errorString = desMsg + "\r\n" + urlMsg;

    if(httpCode == "#409")
    {
      errorString = GetMsgLang("0503") + "\r\n" + urlMsg;
    }
  }

  alert(errorString);
  return;
}
