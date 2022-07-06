function call_xmlData(setAddress, isAsync, runFunc)
{
	if (!runFunc) return;

	var req = new CGIRequest();
	req.SetAsyn(isAsync);
	req.SetAddress(setAddress);
	req.SetCallBackFunc(runFunc);
	req.Request();
}