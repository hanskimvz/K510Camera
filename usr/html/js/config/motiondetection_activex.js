function MotionDetection_ActiveX_Event(szType, szValue)
{
	var MSG = document.getElementById("msg");
	var listNum = "";
	var AxUMF = document.getElementById("VideoScreen");

	// 화면에 드래그 영역 추가
	if(szType == "MOTION_AREA_ADD")
	{
		var s = szValue.split(',');
		nSelectedIDX = parseInt(s[0]);

		listNum = $("#users tbody tr").size() + 1;
		$("#users tbody").append("<tr id='listID_" + nSelectedIDX + "'></tr>").find("tr").last()
						.append("<td><input type='checkbox' checked></input></td>")
						.append("<td>" + "0" + listNum + "</td>")
						.append("<td><input type='text' style='width:90px;' value='default'></input></td>")
						.append("<td><input type='text' style='width:220px;' value=''></input></td>")
						.append("<td><input type='text' style='width:30px;' value='128'></input></td>")
						.append("<td><input type='text' style='width:30px;' value='128'></input></td>")
						.append("<td><span class='del' style='width:5px;'>x</span></td>");
		$("#users tbody tr").not("#users tbody tr#listID_" + nSelectedIDX).css('background-color', '#FFFFFF');
		$("#users tbody tr input[type='text']").css('background-color', '#FFFFFF');
		$("#users tbody tr#listID_" + nSelectedIDX).css('background-color', '#FFEBD8');
		$("#users tbody tr#listID_" + nSelectedIDX + " input[type='text']").css('background-color', '#FFEBD8');
		ResizePage();
		$("input").blur();

		if(listNum == 8)
		{
			MotionMouseLButtonNone();
		}
		SetRelation();
		EventTable(); // 추가시 EventTable
		++actStart;
	}
	// 영역 선택
	else if(szType == "MOTION_SELECTED_INDEX")
	{
		var s = szValue.split(',');
		nSelectedIDX = parseInt(s[0]);

		$("#users tbody tr").not("#users tbody tr#listID_" + nSelectedIDX).css('background-color', '#FFFFFF');
		$("#users tbody tr input[type='text']").css('background-color', '#FFFFFF');
		$("#users tbody tr#listID_" + nSelectedIDX).css('background-color', '#FFEBD8');
		$("#users tbody tr#listID_" + nSelectedIDX + " input[type='text']").css('background-color', '#FFEBD8');
		$("input").blur();

		AxUMF.SetParam("CONTROL", "MOTIONGRAPH_OBJSIZE", eval("MD_CH0_Z" + nSelectedIDX + "_OBJECTSIZE"));
	}
	// 우클릭 삭제
	else if (szType == "MOTION_AREA_DELETE_REQUEST")
	{
		var s = szValue.split(',');
		var remList = $("#users tbody").find("tr").size();
		nSelectedIDX = parseInt(s[0]);

		$("#users tbody tr").not("#users tbody tr#listID_" + nSelectedIDX).css('background-color', '#FFFFFF');
		$("#users tbody tr input[type='text']").css('background-color', '#FFFFFF');
		$("#users tbody tr#listID_" + nSelectedIDX).css('background-color', '#FFEBD8');
		$("#users tbody tr#listID_" + nSelectedIDX + " input[type='text']").css('background-color', '#FFEBD8');

		if(confirm("Do you want to delete this zone?"))
		{
			var profileList;
			var profile_cnt = EVENTPROFILE_NBROFCOUNT;	
			var sameCheckFlag = 'n';   // 사용중인 리스트가 있는지 유무 확인	

			if(profile_cnt > 0)
				profileList = EVENTPROFILE_LIST.split(",");

			for(var i = 0; i < profile_cnt; i++)
			{
				var enableList = eval("EVENTPROFILE_P" + profileList[i].toUpperCase() + "_SOURCE_MOTION_ENABLELIST").split(",");
				
				// 사용중인 리스트가 있는지 체크 
				for(var j = 0; j < enableList.length; j++)
				{
					if(enableList[j] == nSelectedIDX)
					{
						sameCheckFlag = 'y';
						sameMotionList = enableList[j];
					}
				}
			}	
			if(sameCheckFlag == 'y')
			{
				if(!confirm("It is currently in use by the event notification. Are you sure to remove?"))
				{
					return false;
				}
			}
			
			AxUMF.SetParam("CONTROL", "MOTIONAREA", "DEL," + nSelectedIDX);
			$("#listID_" + nSelectedIDX).remove();
			ResizePage();
			for(var count=1;count<remList;count++)
			{
				var fst = "";
				for(fst=0;fst<count;fst++)
				{
					$("#users tbody tr:eq(" + fst +") td:eq(1)").text("0" + (fst+1));
				}
			}
		}
		if(fst < 8)
		{
			MotionMouseLButtonAdd();
		}
	}
	if(szType == "MOTION_AREA_LIST")
	{
		MotionSave(szValue);
	}
}