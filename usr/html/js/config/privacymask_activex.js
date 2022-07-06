function PrivacyMask_ActiveX_Event(szType, szValue)
{
	var AxUMF = document.getElementById("VideoScreen");

	// 영역 선택
	if(szType == "PRIVACYZONE_SELECTED_INDEX")
	{
		var s = szValue.split(',');
		nSelectedIDX = parseInt(s[0]);

		$("#users tbody tr").not("#users tbody tr#listID_" + nSelectedIDX).css('background-color', '#FFFFFF');
		$("#users tbody tr input[type='text']").css('background-color', '#FFFFFF');
		$("#users tbody tr#listID_" + nSelectedIDX).css('background-color', '#FFEBD8');
		$("#users tbody tr#listID_" + nSelectedIDX + " input[type='text']").css('background-color', '#FFEBD8');
		$("input").blur();
	}
	if(szType == "PRIVACYZONE_AREA_LIST")
	{
		PrivacySave(szValue);
	}
}