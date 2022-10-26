$(function () {
	PreCustomize();
	TopMenuDisplay();
	initEnvironment();
	eventBind();
	PostCustomize();
});

function initEnvironment()
{
	getLangXml(g_configData.langPath, setup + menucontents);
}

function eventBind()
{
	$("ul#list li").click(function(){
		if($(this).children().attr("href"))
		{
			$("ul#list li").each(function(index, element){
				$(this).removeClass("ui-state-hover-top");
			});
			$(this).addClass("ui-state-hover-top");
		}
	});
}