var CGIRequest = function()
{
  if (!param_url)
  {
    param_url = "/uapi-cgi/param.cgi"
  }

  var qString;
  var cbFunc;
  var reqUrl = param_url;
  var reqType = "GET";
  var isAsyn = true;
  var isCache = false;
  var startFunc;
  var errorFunc;
  var successFunc;
  var contentsType = "xml";

  this.SetAddress = function(addr) {
    this.reqUrl = addr;
  }
  this.SetType = function(type) {
    this.reqType = type;
  }
  this.SetStartFunc = function(func) {
    this.startFunc = func;
  }
  this.SetErrorFunc = function(func) {
    this.errorFunc = func;
  }
  this.SetAsyn = function(asyn) {
    this.isAsyn = asyn;
  }
  this.SetCache = function(cache) {
    this.isCache = cache;
  }
  this.SetCallBackFunc = function(func) {
    this.cbFunc = func;
  }

  this.SetSuccessFunc = function(func)
  	{  		  		
  		this.successFunc = func;
  	}

  this.SetContentsType = function(type) {
    this.contentsType = type;
  }

  
  this.Request = function(qString)
  {
//    qString += "&timekey=" + (new Date()).getTime();

    cbFunc = this.cbFunc;
    startFunc = this.startFunc;
    errorFunc = this.errorFunc;
    successFunc = this.successFunc;
    if(this.contentsType) contentsType = this.contentsType;
    if(this.reqUrl) reqUrl = this.reqUrl;
    if(this.reqType) reqType = this.reqType;
    if(this.isAsyn == false) isAsyn = this.isAsyn;

    $.ajax({
      url: reqUrl,
      type: reqType,
      dataType: "text",
      async: isAsyn,
      data: qString,
      cache: isCache,
      beforeSend: (startFunc) ? startFunc:null,
      error: (errorFunc) ? function(xhr, textStatus) {errorFunc(xhr, textStatus)}:function(xhr,textStatus) {return},
      success: (successFunc) ? (successFunc) : function(data) {
        var resultData = data;

        if(contentsType =="xml" && typeof data == 'string')
        {
          if (browserCheck() == "msie")
          {
            resultData = new ActiveXObject( 'Microsoft.XMLDOM');
            resultData.async = false;
            resultData.loadXML(data);
          }
          else
          {
            parser = new DOMParser();
            resultData = parser.parseFromString(data,"text/xml");
          }
        }

        if (cbFunc)
        {
          cbFunc(resultData);
        }
      }
    });
  }
}
