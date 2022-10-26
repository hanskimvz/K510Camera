var nowListNumber = 1;
var maxListNumber = 0;

$(function () {
	PreCustomize();
	initEnvironment();
	$.getScript("/uapi-cgi/simple_reclistjs.cgi?action=get&timekey=" + (new Date()).getTime(), function() {
		mainRun();
	});
});

function initEnvironment()
{
	initLanguage();
	ChangeThemes(parent.g_configData.skin);
	EvenOdd(parent.g_configData.skin);
}

function initLanguage()
{
	var classNum = ["04140109","04140110"];
	InitMsgLang(classNum);
	setLanguage(parent.g_configData.langPath, setup + maincontents + "filedownload", 
				parent.g_langData[parent.g_configData.language]);
}

function mainRun()
{
	ViewLoadingSave(true);
	InitForm();
	ContentShow();
	InitSetting();
	EventBind();
	PostCustomize();
}

function InitSetting(date)
{
	var num = 0;
	var viewListNumber = 1;
	
	if(List.recArray.length == 0)
	{
		ViewLoadingSave(false);
	}
	
	for(var i=List.recArray.length;i>0;i-=1)
	{
		try
		{
			var dateStr = "";
			fileArray = List.recArray[i-1].name.split("-");

			if(fileArray[1].length == 8)
			{
				dateStr = fileArray[1].substr(4, 2) + "/"
								+ fileArray[1].substr(6, 2) + "/"
								+ fileArray[1].substr(0, 4);
			}
			else
			{
				dateStr = fileArray[1].substr(5, 2) + "/"
								+ fileArray[1].substr(7, 2) + "/"
								+ fileArray[1].substr(1, 4);
			}
			
			var timeStr = fileArray[2].substr(0, 2) + ":"
						+ fileArray[2].substr(2, 2) + ":"
						+ fileArray[2].substr(4, 2);
		}catch(e)
		{
			continue;
		}

		if(date != null)
		{
			if(date != dateStr)
			{
				continue;
			}
		}
		
		num++;

		var downloadEnable = "";

		if(List.recArray[i-1].used == true)
		{
			downloadEnable = "<li style='color: #FF0000'>[Recording]</li>";
		}
		else
		{
			downloadEnable ="<li><a href='/uapi-cgi/download.cgi?filename=" + List.recArray[i-1].name + "'>[Download]</a></li>";
		}

		if((num > 40) && (num % 40 == 1))
		{
			viewListNumber++;
			maxListNumber = viewListNumber;
		}
		
		$("#reclist").append("<ul class='page_" + viewListNumber + "'></ul>").find("ul").last()
			.append("<li style='width:40px;'>" + num + "</li>")
			.append("<li style='width:280px;'>" + List.recArray[i-1].name.split("/")[3]	+ "</li>")
			.append("<li style='width:200px;'>" + dateStr + " " + timeStr + "</li>")
			.append("<li style='width:70px;'>" + List.recArray[i-1].size + "</li>")
			.append(downloadEnable);
	}
	
	PageNumberListOutput(viewListNumber);
	InitListOutput();
	ViewLoadingSave(false);
	ResizePage();
}

function InitForm()
{
	var currentYear = 2012;
	var minYear = currentYear - 12;
	var maxYear = currentYear + 25;
	var yearCheck = ("'" + minYear + ":" + maxYear + "'").toString();
	
	$("#formFileDownCalendar0").datetimepicker({
		showSecond: true,
		timeFormat: 'hh:mm:ss'
	});
	$("#formFileDownCalendar1").datetimepicker({
		showSecond: true,
		timeFormat: 'hh:mm:ss'
	});
	$("#formSearchDate").datepicker({
		changeMonth: true,
		changeYear: true,
		showOtherMonths: true,
		selectOtherMonths: true,
		onSelect: function(dateText, inst) {
			$("#reclist").empty();
			$(".pageNumberGroup").empty();
			$(".pageNumberGroup").append("| <span class='pageNumber_1'>1</span> |");

			InitSetting(dateText);
			searchPageMove();
		},
		yearRange: '1990:2050'
	});

	$("#allSearch").click( function(){
		if($("#formSearchDate").val() == "") return;
		$("#formSearchDate").val("");
		$("#reclist").empty();
		$(".pageNumberGroup").empty();
		$(".pageNumberGroup").append("| <span class='pageNumber_1'>1</span> |");

		InitSetting();
		searchPageMove();
	}).mouseover( function() {
		$(this).css("cursor", "pointer");
	})
}

function searchPageMove()
{
	$(".pageNumberGroup span").click(function(){
		nowListNumber = $(this).text();
		if(maxListNumber == 0)
			return;

		NowListOutput(nowListNumber);
	});
}

function EventBind()
{
	$("#btnSearch").button().click(function() {
		alert(GetMsgLang("04140109"));
	});
	
	$("#btnDelete").button().click(function(){
		alert(GetMsgLang("04140110"));
	});
	
	$("#btnPageFirst").click(function(){
		if(maxListNumber == 0)
		{
			return;
		}
		NowListOutput("1");
		nowListNumber = 1;
	});
	
	$("#btnPagePrev").click(function(){
		if(maxListNumber == 0)
		{
			return;
		}
		if(nowListNumber == 1)
		{
			return;
		}
		NowListOutput(nowListNumber-1);
		nowListNumber--;
	});
	
	$("#btnPageNext").click(function(){
		if(maxListNumber == 0)
		{
			return;
		}
		if(nowListNumber == maxListNumber)
		{
			return;
		}

		NowListOutput(parseInt(nowListNumber)+1);
		nowListNumber++;
	});
	
	$("#btnPageLast").click(function(){
		if(maxListNumber == 0)
		{
			return;
		}
		NowListOutput(maxListNumber);
		nowListNumber = maxListNumber;
	});

	searchPageMove();
}

function PageNumberListOutput(pageCount)
{
	$(".pageNumberGroup").empty();
	$(".pageNumberGroup").append("| <span class='pageNumber_1'>1</span> |");
	
	for(var i = 1; i < pageCount; i++)
	{
		$(".pageNumberGroup").append(" <span class='pageNumber_" + (i+1) + "'>" + (i+1) + "</span> |");
	}

	return;
}

function InitListOutput()
{
	$(".page_1").css("display", "block");
}

function NowListOutput(selectList)
{
	$("#reclist ul").css("display", "none");
	$(".pageNumberGroup span").css("font-weight", "normal");

	$(".page_" +	selectList).css({"display":"block", "text-align":"center"});
	$(".pageNumber_" + selectList).css("font-weight", "bold");
}