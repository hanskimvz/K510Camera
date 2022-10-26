var g_dataArray = [];
var NETWORK_RTSP_PORT;

var capUIProtocol = function(data, cbFunc)
{
	var dataResult = new dataList();
	var dataTokenLine = data.split("\n");
	for(var i=0; i<dataTokenLine.length; i++)
	{
		if(dataTokenLine[i] == "" || dataTokenLine[i] == undefined) break;

		var dataTokenValue = $.trim(dataTokenLine[i]).split("=");
		dataResult.dataArray.push(new dataArray(dataTokenValue[0].replace(/\./gi, "_").toLowerCase(), dataTokenValue[1]));
	}

	if(cbFunc != null)
		cbFunc(dataResult);
}

var capUIProtocolJS = function(data, cbFunc)
{
	var dataResult = new dataList();
	var dataTokenLine = data.split("\n");
	for(var i=0; i<dataTokenLine.length; i++)
	{
		if(dataTokenLine[i] == "" || dataTokenLine[i] == undefined) break;

		var dataTokenValue = $.trim(dataTokenLine[i]).split("=");
		dataResult.dataArray.push(new dataArray(dataTokenValue[0].toLowerCase(), dataTokenValue[1].slice(20, -3)));
	}

	if(cbFunc != null)
		cbFunc(dataResult);
}

var dataList = function()
{
	this.dataArray =[];
}

var dataArray = function(group, val, name)
{
	this.group = group;
	this.val = val;
}

var initDataValue = function(data)
{
	for(var i=0; i<data.dataArray.length; i++)
	{
		g_dataArray[data.dataArray[i].group] = data.dataArray[i].val;

		if(data.dataArray[i].group== "network_rtsp_port")
			NETWORK_RTSP_PORT = data.dataArray[i].val;

		if(data.dataArray[i].group== "encoder_ch0_videocodec_st0_enable")
			ENCODER_CH0_VIDEOCODEC_ST0_ENABLE = data.dataArray[i].val;

		if(data.dataArray[i].group== "encoder_ch0_videocodec_st1_enable")
			ENCODER_CH0_VIDEOCODEC_ST1_ENABLE = data.dataArray[i].val;

		if(data.dataArray[i].group== "network_rtp_st0_unicast_enable")
			NETWORK_RTP_ST0_UNICAST_ENABLE = data.dataArray[i].val;

		if(data.dataArray[i].group== "network_rtp_st0_multicast_enable")
			NETWORK_RTP_ST0_MULTICAST_ENABLE = data.dataArray[i].val;

		if(data.dataArray[i].group== "network_rtp_st1_unicast_enable")
			NETWORK_RTP_ST1_UNICAST_ENABLE = data.dataArray[i].val;

		if(data.dataArray[i].group== "network_rtp_st1_multicast_enable")
			NETWORK_RTP_ST1_MULTICAST_ENABLE = data.dataArray[i].val;

		if(data.dataArray[i].group== "network_rtp_st0_unicast_name")
			NETWORK_RTP_ST0_UNICAST_NAME = data.dataArray[i].val;

		if(data.dataArray[i].group== "network_rtp_st0_multicast_name")
			NETWORK_RTP_ST0_MULTICAST_NAME = data.dataArray[i].val;

		if(data.dataArray[i].group== "network_rtp_st1_unicast_name")
			NETWORK_RTP_ST1_UNICAST_NAME = data.dataArray[i].val;

		if(data.dataArray[i].group== "network_rtp_st1_multicast_name")
			NETWORK_RTP_ST1_MULTICAST_NAME = data.dataArray[i].val;

		if(data.dataArray[i].group== "network_srtp_enable")
			NETWORK_SRTP_ENABLE = data.dataArray[i].val;

		if(data.dataArray[i].group== "network_srtp_key_master")
			NETWORK_SRTP_KEY_MASTER = data.dataArray[i].val;

		if(data.dataArray[i].group== "network_srtp_key_salt")
			NETWORK_SRTP_KEY_SALT = data.dataArray[i].val;

		if(data.dataArray[i].group== "network_srtp_protectionprofile")
			NETWORK_SRTP_PROTECTIONPROFILE = data.dataArray[i].val;
	}
}

var getDataConfig = function(group, cbFunc)
{
	$.get(g_defpath.param + "?action=list&group=" + group + "&_=" + (new Date()).getTime(), function(cbData) {
		capUIProtocol(cbData, cbFunc);
	});
}

var getDataConfig_UAPI = function(group, cbFunc)
{
	$.get(g_defpath.paramuapi + "?action=list&" + group + "&_=" + (new Date()).getTime(), function(cbData) {
		capUIProtocol(cbData, cbFunc);
	});
}

var getDataConfig_UAPI_JS = function(group, cbFunc)
{
	$.get(g_defpath.paramuapijs + "?action=list&" + group + "&_=" + (new Date()).getTime(), function(cbData) {
		capUIProtocolJS(cbData, cbFunc);
	});
}

var setDataValue = function(data)
{
	var setArray = [];
	for(var i=0; i<data.dataArray.length; i++)
	{
		var groupObj_general = $("#" + data.dataArray[i].group);
		var groupObj_input = $("input[name='" + data.dataArray[i].group + "']");
		var groupStr = data.dataArray[i].group.replace(/\_/gi, ".");
		var dbValue = data.dataArray[i].val;

		if(groupObj_general.size() > 0)
		{
			var groupType = groupObj_general.attr("type");
			var formValue = groupObj_general.val();

			if(groupType == "checkbox")
				formValue = groupObj_general.attr("checked") == true ? "yes" : "no";

			setArray.push({"group":groupStr, "dbValue":dbValue, "formValue":formValue});
		}

		if(groupObj_input.size() > 0)
		{
			var groupType = groupObj_input.attr("type");
			var formValue = $("input[name='" + data.dataArray[i].group + "']:checked:radio").val();

			setArray.push({"group":groupStr, "dbValue":dbValue, "formValue":formValue});
		}
	}

	return setArray;
}