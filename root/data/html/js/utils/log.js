function uconlog(str, isShow)
{
	if(!window.console) return;

	if(isShow == true || isShow == undefined)
		console.log("*** " + str);
}