/* 
 
 Autoreact api calls

*/
  
  
(function(exports) {
  "use strict";
  
// ====== module start =========

function convertParams(params) {
  var i,j,key,keys,tmp,lst,flt,res={};
  if (!params || _.isEmpty(params)) return params;
  keys=_.keys(params);
  //console.log(params);    
  for(i=0;i<keys.length;i++) {
    key=keys[i];
    if (key=="kind") continue;
    //else if (key=="path") res["table"]=params["path"];
    else if (key=="fields") res["fields"]=params["fields"].join();
    else if (key=="offset") res["start"]=params["offset"];
    else if (key=="limit") res["count"]=params["limit"];
    else if (key=="data") {
      if (_.isObject(params["data"])) res["data"]=[params["data"]];
      else res["data"]=params["data"];
    }  
    else if (key=="path") {
      lst=params["path"].split("/");
      if (lst.length<=1) res["table"]=params["path"];        
      else if (!lst[lst.length-1]) {
        res["table"]=lst[lst.length-2];
      } else if (lst.length>1) {        
        tmp=Number(lst[lst.length - 1]); 
        if (!_.isNaN(tmp)) {
          res["table"]=lst[lst.length-2];
          if (params["op"]=="delete")
            res["data"]=[tmp];
          else
            res["filter"]="id,=,"+tmp;
        }
      }
    }  
    else if (key=="op") {
      tmp=params["op"];
      if (tmp=="get") {
        res["op"]="list";    
      } else if (tmp=="put") {
        res["op"]="update"; 
        res["key"]="id";
      } else if (tmp=="post") {
        res["op"]="add"; 
      } else if (tmp=="delete") {
        res["op"]="delete";
      }  
      else res["op"]=tmp;      
    } else if (key=="filter") {      
      lst=[];
      flt=params["filter"];
      //console.log(flt);
      for (j=0;j<flt.length;j++) {
        if (flt[j][0]=="kind") continue;
        lst.push(flt[j][0]);
        if (flt[j][1]=="ilike") lst.push("like");
        else lst.push(flt[j][1]);
        lst.push(flt[j][2]);        
      }
      res["filter"]=lst.join(); 
    }  
    else res[key]=params[key];
  }  
  return res;
}
  
// ====== exported functions =========
  
// --- api calls --


// never actually use ctxt or viewdef here!

// In case of dummy data this var will be changed to 'GET'
var POST = 'POST';

function getApiUrl(ctxt,viewdef) { 
  if (window.location && 
           window.location.origin.indexOf("localhost")>=0)
    return globalState.localApiUrl;
  else return globalState.apiUrl;
}  

var getLogin = function(op,username,password,callback) {
  autoutils.debug("calling doLogin");
  $("#login-message").hide();
  if (!username || !password) {
    $("#login-message").html("Please fill the username and password fields!");
    $("#login-message").show();
    return false;
  }
  var url=getApiUrl(globalState);
  var params={"op": "password_login", "username": username, "password": password}; 
  console.log(params);   
  $.ajax({    
    url: url,
    dataType: 'json',
    type: POST,
    data: JSON.stringify(params),
    cache: false,
    timeout: globalState.ajaxTimeout,
    success: function(data) {    
      if (isErrResponse(data)) {
         $("#login-message").html("Wrong login name or password!");
         $("#login-message").show();      
      } else if (!data || !_.isObject(data) || !data.username) {
         $("#login-message").html("Technical error");
         $("#login-message").show();
      } else {                         
        console.log("do Login success with data");
        console.log(data);
        callback(data);
        //doLogin(data);
      }  
    },
    error: function(xhr, status, err) {
      var msg;
      if (err==="timeout") msg="Error: timeout";         
      else msg="Wrong login name or password 2!"; 
      $("#login-message").html(msg);
      $("#login-message").show();  
    }
  });
}

var invalidateToken = function(token) {
  autoutils.debug("calling invalidateToken");
  var url=getApiUrl(globalState);
  var params={"op": "invalidatetoken", "token": token}; 
  console.log(params);
  $.ajax({    
    url: url,
    dataType: 'json',
    type: POST,
    data: JSON.stringify(params),
    cache: false,
    timeout: globalState.ajaxTimeout,
    success: function(data) {console.log("invalidateToken call success")},        
    error: function(xhr, status, err) {console.log("invalidateToken call error")}
  });
}

var getUserFromToken = function(globalState,token,callback) {
  autoutils.debug("calling getUserFromToken");
  var url=getApiUrl(globalState,null);  
  if (globalState.dummyData) url=url+globalState.userDummyData;  
  else {
    url=url.replace("/api","/token") + "/" + token;
  }
  $.ajax({
    url: url,
    dataType: 'json',
    type: 'GET',   
    cache: true,
    timeout: globalState.shortAjaxTimeout,
    success: function(data) {    
      autoutils.debug("user data:");
      autoutils.debug(data);
      if (isErrResponse(data)) {
        initialError(url, data, "reading user info gave an error");
      } else if (!data || _.isEmpty(data)) {
        initialError(url, data, "received no user info");
      } else {
        if (!_.has(data,'role_right')) getRoleRights(data, callback);
        else callback(data);
      }  
    },
    error: function(xhr, status, err) {
      var msg;
      if (err==="timeout") msg="Error: timeout";         
      else msg="Error reading user info"; 
      initialError(url, err, msg);    
    }
  });
}   

var getRoleRights = function(userData, callback) {
  handleGetRequest("/table/role_right", function (userData, data) {
    var role = userData.role_name;
    var isAuthenticated = _.has(userData, 'token') && userData.token !== null && userData.token !== "";
    var roleRights = [];
    for (var i = 0; i < data.length; i++) {
      var dataRole = data[i].role_name;
      if (dataRole === 'DEFAULT' || (dataRole === 'AUTHENTICATED' && isAuthenticated) || dataRole === role) {
        roleRights.push(data[i]);
      }
    }
    userData.role_right = roleRights;
    callback(userData);
  }.bind(null, userData));
}

var handleGetRequest = function (urlSuffix, callback, isLong) {
  autoutils.debug("calling handleGetRequest");
  var url=getApiUrl(globalState,null);
  if (globalState.dummyData) url=url+globalState.userDummyData;
  else {
    url += urlSuffix;
  }
  var timeout = globalState.shortAjaxTimeout;
  if (isLong !== undefined && isLong) timeout = globalState.ajaxTimeout;
  $.ajax({
    url: url,
    dataType: 'json',
    type: 'GET',
    cache: true,
    timeout: timeout,
    success: function(data) {
      if (isErrResponse(data)) {
        initialError(url, data, "date reading gave an error");
      } else if (!data || _.isEmpty(data)) {
        initialError(url, data, "no data received");
      } else {
        callback(data);
      }
    },
    error: function(xhr, status, err) {
      var msg;
      if (err==="timeout") msg="Error: timeout";
      else msg="Error reading data";
      initialError(url, err, msg);
    }
  });
}

/**
 * Reads data from the server. If there is described multiple list templates in the template then there will be
 * executed request for each template separately.
 * @param ctx
 * @param op
 * @param viewdef
 * @param stateparams
 */

var getList = function(ctx, op, viewdef, stateparams) {
  //if (!_.has(viewdef, 'list_templates')) return getListSingle(ctx,op,viewdef,stateparams);
  if (!_.has(viewdef, 'list_templates')) return getCountedListSingle(ctx,op,viewdef,stateparams);

  // Query over multiple templates:
  var context = {
    ctx: ctx,
    ctxCount: viewdef.list_templates.length,
    op: op,
    viewdef: viewdef,
    offset: (stateparams.offset ? stateparams.offset : 0),
    limit: (stateparams.limit ? stateparams.limit : 0),
    stateparams: stateparams,
    sumCount: 0,
    sumData: [],
    sumAuxData: []
  };

  getListSingleItem(0, context);
};

var getListSingleItem = function (i, context) {
  var newCtx = {
    props: context.ctx.props,
    state: context.ctx.state,
    simpleUpdateState: getListUpdateState.bind(context, i)
  };
  var newViewdef = _.findWhere(globalState.viewdefs, {"name":context.viewdef.list_templates[i]});
  var newStateparams = _.clone(context.stateparams);

  var remainingOffset = context.offset - context.sumCount;
  if (remainingOffset < 0) remainingOffset = 0;
  var remainingLimit = context.limit - context.sumData.length;
  if (remainingLimit < 0) remainingLimit = 0;

  newStateparams.offset = remainingOffset;
  newStateparams.limit = (remainingLimit == 0 ? 1 : remainingLimit);
  getListSingle(newCtx, context.op, newViewdef, newStateparams);
};

var getListUpdateState = function (i, statechange) {
  // auxdata, data
  if (_.has(statechange, 'count')) {
    this.sumCount += statechange.count;
    statechange.count = this.sumCount;
    if (_.has(statechange, 'data') ) {
      if (statechange.data !== null) {
        // Set up all data
        var search_template = this.viewdef.list_templates[i];
        var viewdef = _.findWhere(globalState.viewdefs, {"name": search_template});
        var key = viewdef.key;
        for (var j = 0; j < statechange.data.length; j++) {
          statechange.data[j].key = viewdef.object + ':' + statechange.data[j][key];
        }
        this.sumData = this.sumData.concat(statechange.data);
      }
      statechange.data = this.sumData.slice(0, this.limit);
    }

    if (i < this.ctxCount - 1) {
      getListSingleItem(i + 1, this);
    }
  }
  if (_.has(statechange, 'auxdata')) {
    this.sumAuxData = this.sumAuxData.concat(statechange.auxdata);
    statechange.auxdata = this.sumAuxData;
  }
  if (_.has(statechange, 'offset')) statechange.offset = this.offset;
  if (_.has(statechange, 'limit')) statechange.limit = this.limit;
  return this.ctx.simpleUpdateState(statechange);
};

var joinArray = function (arr, offset, limit) {
  var dest = [];
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] != undefined && arr[i] != null) dest = dest.concat(arr[i]);
  }
  return dest;
};

function makeListFilterParams(ctxt,op,viewdef,stateparams) {
  var origforcefilter=stateparams.forcefilter;
  var filter=autoutils.getStateParamsFilter(stateparams);   
  var params=autoutils.makeFilterParams(ctxt,op,viewdef);
  var tmp;
  if (stateparams.preaction=="reset") params["filter"]=[];
  if (filter && params) {    
    if (params["filter"] && _.isArray(params["filter"]))
      params["filter"]=params["filter"].concat(filter);
    else
      params["filter"]=filter; 
  }    
  if (origforcefilter && !_.isEmpty(origforcefilter)) params.filter=origforcefilter;
  if (!origforcefilter) {
    if (params) stateparams.forcefilter=params.filter;
    var filterdata=autoutils.getFilterData(ctxt,op,viewdef);
    stateparams.filterdata=filterdata;
    autoutils.storeHistory(ctxt.state,stateparams);
  }  
  if (viewdef.staticfilter) {
    //tmp=[["status","=","A"]]; //"status,=,'A'"; //
    if (params["filter"] && _.isArray(params["filter"]))
      params["filter"]=params["filter"].concat(viewdef.staticfilter);
    else
      params["filter"]=viewdef.staticfilter;
  }
  // temporary fix to rest api!!!  
  if (params && params["filter"]) {
    var tmp=params["filter"];
    var tmp2=_.map(tmp,function(el) { return [el[0],el[1],String(el[2])] });
    params["filter"]=tmp2;    
  } 
  // fix ended 
  return params;
}  

function makeListNextState(oldstate,changes) {
  var key,nextstate={}
  //var changes={data: data, op:"list", action: null, alert:false}
  for (key in oldstate) nextstate[key]=oldstate[key]; 
  for (key in changes) nextstate[key]=changes[key];  
  if (oldstate.preaction=="reset") {
    nextstate.filterdata=null;
    nextstate.preaction==null;
  }
  if (_.has(nextstate,"filter") && nextstate.preaction=="reset")
    nextstate.preaction=null;
  return nextstate;
}



// getCountedListSingle first gets an answer containing both count and list data

var getCountedListSingle = function(ctxt,op,viewdef,stateparams) {
  autoutils.debug("calling getCountedListSingle");
  var auxDataNeed,tmp,key,nextstate;
  var offset=stateparams["offset"];
  var limit=stateparams["limit"];
  var sortkey=stateparams["sortkey"];
  var down=stateparams["down"];  
  var count=0;
  var params=makeListFilterParams(ctxt,op,viewdef,stateparams);  
  if (!params) return;
  params["offset"]=offset;
  params["limit"]=limit;
  params["op"]="countedlist";
  if (sortkey) {
    if (down) params["sort"]="-"+sortkey;
    else params["sort"]=sortkey;
  } 
  var url=getApiUrl(ctxt,viewdef);
  if (ctxt.props.dummyData) url=url+ctxt.props.listDummyData;    
  params=convertParams(params);
  $.ajax({    
    url: url,
    dataType: 'json',
    type: POST,
    data: JSON.stringify(params),
    cache: false,
    timeout: globalState.ajaxTimeout,
    success: function(data) {    
      if (isErrResponse(data)) {
        console.error(url, data.toString());
        ctxt.simpleUpdateState(
          makeListNextState(stateparams,{op:"list", action: null, alert:"danger", alertmessage: autolang.trans(data["errmsg"])}));
      } else {                             
        if (!viewdef) {
          viewdef=autoutils.autoBuildViewdef(data);
          ctxt.simpleUpdateState(
            makeListNextState(stateparams,{data: data.list, op:"list", action: null, count: data.count, viewdef: viewdef}));
        } else {               
          var i,tmp=[];
          count=data.count;
          data=data.list;
          if (viewdef.name=="main_alerts") {
            for(i=0;i<data.length;i++) {
              if (data[i]["msg_type"]!="usercommand") tmp.push(data[i]);
            }
            data=tmp;
          }          
          if (viewdef.name=="main_media") {
            for(i=0;i<data.length;i++) {
              //console.log("|"+data[i]["duration"]+"|");
              if (data[i]["duration"]=="00:00:00") data[i]["duration"]="";
            }
          } 
          auxDataNeed=autoutils.auxDataNeed(data,viewdef,{});          
          nextstate=makeListNextState(stateparams,
             {data: data, op:"list", action: null, count: count, alert:false, offset:offset, limit:limit});                   
          if (!_.isEmpty(auxDataNeed)) {
            autoutils.debug("getPureList to do getAuxData");
            getAuxData(ctxt,url,auxDataNeed,nextstate); 
          } else {
            //autoutils.debug("getPureList to do ctxt.simpleUpdateState");                        
            ctxt.simpleUpdateState(nextstate);
          }  
        }        
      }  
    }.bind(ctxt),
    error: function(xhr, status, err) {
      listError(ctxt,xhr,status,err); 
    }.bind(ctxt)
  });
}    
  

// getList first gets a count, then calls getPureList to get list data

var getListSingle = function(ctxt,op,viewdef,stateparams) {
  autoutils.debug("calling getCountedListSingle from getListSingle");
  return getCountedListSingle(ctxt,op,viewdef,stateparams);
  /*
  var offset=stateparams["offset"];
  var limit=stateparams["limit"];
  var sortkey=stateparams["sortkey"];
  var down=stateparams["down"];  
  var nextstate;
  var params=makeListFilterParams(ctxt,op,viewdef,stateparams);
  //console.log(JSON.stringify(params));
  if (!params) return;
  params["op"]="count";
  var url=getApiUrl(ctxt,viewdef);
  if (ctxt.props.dummyData) url=url+ctxt.props.countDummyData;  
  //autoutils.debug("url");
  //autoutils.debug(url);
  var timeout=globalState.ajaxTimeout;
  //if (viewdef && viewdef.name && viewdef.name=="infosystem") timeout=globalState.shortAjaxTimeout;
  params=convertParams(params);
  $.ajax({    
    url: url,
    dataType: 'json',
    type: POST,
    data: JSON.stringify(params),
    cache: false,
    timeout: timeout,
    success: function(data) {    
      if (isErrResponse(data)) {
        console.error(url, data.toString());
        ctxt.simpleUpdateState(
          makeListNextState(stateparams,{op:"list", action: null, alert:"danger", alertmessage: autolang.trans(data["errmsg"])}));
      } else if (!data || !_.isObject(data) || !_.has(data,"count")) {
        console.error(url, data.toString());
        ctxt.simpleUpdateState(
          makeListNextState(stateparams,{op:"list", action: null, alert:"danger", alertmessage: autolang.trans("wrong count")}));        
      } else {                         
        if (data && data["count"]===0) {
          autoutils.debug("getList to do ctxt.simpleUpdateState");
          ctxt.simpleUpdateState(
            makeListNextState(stateparams,{data: null, op:"list", action: null, count: 0, alert:false}));
        } else {  
          //stateparams["count"]=data["ok"];
          stateparams["count"]=data["count"];
          nextstate=makeListNextState(stateparams);
          getPureList(ctxt,op,viewdef,nextstate);              
        }  
      }  
    }.bind(ctxt),
    error: function(xhr, status, err) {     
      listError(ctxt,xhr,status,err);   
    }.bind(ctxt)
  });
  */
}    

// normally we have got a count first; pureList gets data
// then call getAuxData (if necessary) to translate codes to names

var getPureList = function(ctxt,op,viewdef,stateparams) {
  //autoutils.debug("calling getPureList with stateparams['count'] "+stateparams['count']);
  //console.log(stateparams.filterdata);
  var auxDataNeed,tmp,key,nextstate;
  var offset=stateparams["offset"];
  var limit=stateparams["limit"];
  var sortkey=stateparams["sortkey"];
  var down=stateparams["down"];  
  var count=stateparams["count"];
  var params=makeListFilterParams(ctxt,op,viewdef,stateparams);  
  if (!params) return;
  params["offset"]=offset;
  params["limit"]=limit;
  if (sortkey) {
    if (down) params["sort"]="-"+sortkey;
    else params["sort"]=sortkey;
  } 
  var url=getApiUrl(ctxt,viewdef);
  if (ctxt.props.dummyData) url=url+ctxt.props.listDummyData;    
  params=convertParams(params);
  $.ajax({    
    url: url,
    dataType: 'json',
    type: POST,
    data: JSON.stringify(params),
    cache: false,
    timeout: globalState.ajaxTimeout,
    success: function(data) {    
      if (isErrResponse(data)) {
        console.error(url, data.toString());
        ctxt.simpleUpdateState(
          makeListNextState(stateparams,{op:"list", action: null, alert:"danger", alertmessage: autolang.trans(data["errmsg"])}));
      } else {                             
        if (!viewdef) {
          viewdef=autoutils.autoBuildViewdef(data);
          ctxt.simpleUpdateState(
            makeListNextState(stateparams,{data: data, op:"list", action: null, count: count, viewdef: viewdef}));
        } else {     
          
          var i,tmp=[];
          if (viewdef.name=="main_alerts") {
            for(i=0;i<data.length;i++) {
              if (data[i]["msg_type"]!="usercommand") tmp.push(data[i]);
            }
            data=tmp;
          }
          if (viewdef.name=="main_media") {
            for(i=0;i<data.length;i++) {
              console.log("|"+data[i]["duration"]+"|");
              if (data[i]["duration"]=="00:00") data[i]["duration"]="";
            }
            //data=tmp;
          } 
          
          auxDataNeed=autoutils.auxDataNeed(data,viewdef,{});          
          nextstate=makeListNextState(stateparams,
             {data: data, op:"list", action: null, count: count, alert:false, offset:offset, limit:limit});                   
          if (!_.isEmpty(auxDataNeed)) {
            autoutils.debug("getPureList to do getAuxData");
            getAuxData(ctxt,url,auxDataNeed,nextstate); 
          } else {
            //autoutils.debug("getPureList to do ctxt.simpleUpdateState");                        
            ctxt.simpleUpdateState(nextstate);
          }  
        }        
      }  
    }.bind(ctxt),
    error: function(xhr, status, err) {
      listError(ctxt,xhr,status,err); 
    }.bind(ctxt)
  });
}    

// get data to translate codes to names

var getAuxData = function(ctxt,url,need,statepart,future) {
  autoutils.debug("calling getAuxData");
  //if (ctxt.props.dummyData) url=url+ctxt.props.auxDummyData;  
  var args=need;
  args["op"]="getnames";
  args["token"]=autoutils.getAuthToken();
  params=convertParams(params);
  $.ajax({    
    url: url,
    dataType: 'json',
    type: POST,
    data: JSON.stringify(args),   
    cache: false,
    timeout: globalState.ajaxTimeout,
    success: function(data) {    
      if (isErrResponse(data)) {
        console.error(url, data.toString());
        ctxt.simpleUpdateState({op:"list", action: null, alert:"danger", alertmessage: autolang.trans(data["errmsg"])});
      } else {
        statepart["auxdata"]=data;        
        if (future && future.alert) {
          statepart.alert=future.alert;
          statepart.alertmessage=future.alertmessage;
        } 
        statepart.data=autoutils.processReadRecord(statepart.data,statepart.viewdef,data); 
        ctxt.simpleUpdateState(statepart);        
      }        
    }.bind(ctxt),
    error: function(xhr, status, err) {
      listError(ctxt,xhr,status,err);
    }.bind(ctxt)
  });
}    


// get data to translate infosystem id or uri to name

var getInfosystemAuxData = function(ctxt,url,need,statepart,future) {
  autoutils.debug("calling getInfosystemAuxData");
  //if (ctxt.props.dummyData) url=url+ctxt.props.auxDummyData;  
  var args={};
  args["op"]="get";
  args["path"]="db/main_resource/";
  args["token"]=autoutils.getAuthToken();
  args["offset"]=0;
  args["limit"]=1;
  args["fields"]=["uri","name","main_resource_id"];
  args["filter"]=[["kind","=","infosystem"]];
  args["filter"].push(need);
  $.ajax({    
    url: url,
    dataType: 'json',
    type: POST,
    data: JSON.stringify(args),   
    cache: false,
    timeout: globalState.ajaxTimeout,
    success: function(data) {    
      if (isErrResponse(data)) {
        console.error(url, data.toString());
        ctxt.simpleUpdateState({op:"list", action: null, alert:"danger", alertmessage: autolang.trans(data["errmsg"])});
      } else {
        if (data && _.isArray(data) && data.length>0) statepart["auxdata"]=data[0];    
        else statepart["auxdata"]=null;        
        if (future && future.alert) {
          statepart.alert=future.alert;
          statepart.alertmessage=future.alertmessage;
        } 
        statepart.data=autoutils.processReadRecordForInfosystem(statepart.data,data); 
        ctxt.simpleUpdateState(statepart);        
      }        
    }.bind(ctxt),
    error: function(xhr, status, err) {
      listError(ctxt,xhr,status,err);
    }.bind(ctxt)
  });
}    

// get a single record, then call getAuxData

var getRecord = function(ctxt,op,viewdef,id,future) {
  var auxDataNeed,statepart;
  //autoutils.debug("calling getRecord with id "+id);
  // Special handling for templates with "list_templates" element:
  if (_.has(viewdef, 'list_templates')) {
    // Get id parts:
    var idParts = id.split(':');
    if (idParts.length > 1) {
      viewdef = _.findWhere(globalState.viewdefs, {"name":idParts[0]});
      id = idParts[1];
    }
  }
  var url=getApiUrl(ctxt,viewdef);
  if (ctxt.props.dummyData) url=url+ctxt.props.recordDummyData;  
  var args={"op":"get","path": autoutils.getPath(viewdef)+id, "token":autoutils.getAuthToken()};
  args=convertParams(args);
  $.ajax({    
    url: url,
    dataType: 'json',
    type: POST,
    data: JSON.stringify(args),   
    cache: false,
    timeout: globalState.ajaxTimeout,
    success: function(data) {    
      if (isErrResponse(data)) {
        console.error(url, data.toString());
        ctxt.simpleUpdateState({op:"list", action: null, alert:"danger", alertmessage: autolang.trans(data["errmsg"])});
      } else if (viewdef.name=="service") {
        console.log("special for "+   viewdef.name);
        if (data && _.isObject(data) && data.parent_uri) auxDataNeed=["uri","=",data.parent_uri];
        else auxDataNeed=null;
        statepart={data: data, op:"view", viewdef:viewdef, action:null, alert:false};
        if (future && future.alert) {
          statepart.alert=future.alert;
          statepart.alertmessage=future.alertmessage;
        }                              
        if (!_.isEmpty(auxDataNeed)) {
          //autoutils.debug("getRecord to do getAuxData");
          //autoutils.debug(future);
          getInfosystemAuxData(ctxt,url,auxDataNeed,statepart,future); 
        } else {
          //autoutils.debug("getRecord to do ctxt.simpleUpdateState");
          //statepart.data=autoutils.processReadRecordForInfosystem(statepart.data,viewdef);    
          ctxt.simpleUpdateState(statepart);
        }    
      } else if (viewdef.name=="infosystem_dataObjects") {
        console.log("special for "+   viewdef.name);
        if (data && _.isObject(data) && data.main_resource_id) auxDataNeed=["main_resource_id","=",data.main_resource_id];
        else auxDataNeed=null;
        statepart={data: data, op:"view", viewdef:viewdef, action:null, alert:false};
        if (future && future.alert) {
          statepart.alert=future.alert;
          statepart.alertmessage=future.alertmessage;
        }                              
        if (!_.isEmpty(auxDataNeed)) {
          //autoutils.debug("getRecord to do getAuxData");
          //autoutils.debug(future);
          getInfosystemAuxData(ctxt,url,auxDataNeed,statepart,future); 
        } else {
          //autoutils.debug("getRecord to do ctxt.simpleUpdateState");
          //statepart.data=autoutils.processReadRecordForInfosystem(statepart.data,viewdef);    
          ctxt.simpleUpdateState(statepart);
        }                        
      } else {  
        if (_.isArray(data) && !_.isEmpty(data)) data=data[0];        
        auxDataNeed=autoutils.auxDataNeed(data,viewdef,{});  
        statepart={data: data, op:"view", viewdef:viewdef, action:null, alert:false};
        if (future && future.alert) {
          statepart.alert=future.alert;
          statepart.alertmessage=future.alertmessage;
        }                              
        if (!_.isEmpty(auxDataNeed)) {
          //autoutils.debug("getRecord to do getAuxData");
          //autoutils.debug(future);
          getAuxData(ctxt,url,auxDataNeed,statepart,future); 
        } else {
          //autoutils.debug("getRecord to do ctxt.simpleUpdateState");
          statepart.data=autoutils.processReadRecord(statepart.data,viewdef);    
          ctxt.simpleUpdateState(statepart);
        }         
      }        
    }.bind(ctxt),
    error: function(xhr, status, err) {
      listError(ctxt,xhr,status,err);       
    }.bind(ctxt)
  });
}    

// universal error handler for api functions resumed in ui by showing a list

function listError(ctxt,xhr,status,err) {
  var msg;
  if (err==="timeout") {
    ctxt.simpleUpdateState({op:"list", action: null, alert:"danger", alertmessage: autolang.trans("Error: timeout")}); 
  } else if (xhr && _.isObject(xhr) && xhr["responseJSON"]) {
    if (xhr["responseJSON"]) msg=xhr["responseJSON"]["errmsg"];
    if (!msg || msg=="Viga") msg="tehniline probleem andmeserveris";
    ctxt.simpleUpdateState({op:"list", action: null, alert:"danger", 
                   alertmessage: autolang.trans("Error")+": "+msg}); 
  } else {
    autoutils.debug("errcall");
    if (err) msg=autolang.trans("Connection error")+": "+autolang.trans(err);
    else msg=autolang.trans("Connection error");
    ctxt.simpleUpdateState({op:"list", action: null, alert:"danger", 
                 alertmessage: msg});       
  } 
}

// save one record: used for both new records and changing old ones

var saveRecord = function(ctxt,op,viewdef,parent) {
  autoutils.debug("calling saveRecord");
  var updateExisting, rowid, params; 
  params=autoutils.makeSaveParams(ctxt,viewdef,parent);
  if (!params) {    
    ctxt.simpleUpdateState({op:"edit", action: null, alert:"danger", 
                   alertmessage: autolang.trans("Please fill all fields marked with *")});
    return;               
  }
  rowid=ctxt.state.rowid;
  if (rowid) {
    updateExisting=true;
    params["op"]="put";
    params["path"]+=String(rowid);
    //params["data"]=_.omit(params["data"],'version')
  } else {
    updateExisting=false;
    params["op"]="post";
    //if (!params["data"]["version"]) params["data"]["version"]="1";
    //if (!params["data"]["creator"]) params["data"]["creator"]="testkasutaja";
  }  
  var url=getApiUrl(ctxt,viewdef);
  if (ctxt.props.dummyData) {
    if (updateExisting) url=url+ctxt.props.updateDummyData;   
    else url=url+ctxt.props.saveDummyData;   
  }  
  params=convertParams(params);
  $.ajax({
    url: url,
    dataType: 'json',
    type: POST,
    contentType:"application/json; charset=utf-8",
    timeout: globalState.ajaxTimeout,
    data: JSON.stringify(params),
    success: function(data) {
      if (isErrResponse(data)) {
        console.error(url, data.toString());
        ctxt.simpleUpdateState({op:"edit", action: null, alert:"danger", 
                       alertmessage: autolang.trans("Error saving")+": "+autolang.trans(data["errmsg"])});
      } else if (data && _.isObject(data) && !_.isArray(data) && !data["ok"]) {
        console.error(url, data.toString());
        ctxt.simpleUpdateState({op:"edit", action: null, alert:"danger", 
                       alertmessage: autolang.trans("Error saving")});
      } else {    
        if (updateExisting) {          
          var tmp=params["data"];     
          var key=viewdef["key"]; 
          tmp[key]=rowid;                    
          //ctxt.simpleUpdateState({op:"edit", action: null, alert:"success", alertmessage:autolang.trans("Saved")});
          ctxt.updateState({op:"edit", action: null, data:tmp, alert:"success", alertmessage:autolang.trans("Saved")});
        } else {
          // save new
          if (!data || !_.isArray(data) || data.length<1) {
            // not stored ok
            ctxt.simpleUpdateState({op:"edit", action: null, alert:"danger", 
                       alertmessage: autolang.trans("Error saving")});
          } else {
            // stored ok
            var keyname="main_resource_id",newdata={};
            if (_.has(ctxt.viewdef,"key")) keyname=ctxt.viewdef["key"]; 
            newdata[keyname]=data[0];
            newdata["name"]="newname";
            if (!ctxt.state.parent) {  
              ctxt.updateState({op:"view",rowid:data[0],action:null,
                           alert:"success", alertmessage:autolang.trans("Saved")});   
            } else {
              ctxt.simpleUpdateState({op:"edit",rowid:data[0],action:null,data:[newdata],
                           alert:"success", alertmessage:autolang.trans("Saved")});
            }                       
          }                           
        }           
      }    
    }.bind(ctxt),
    error: function(xhr, status, err) {
      var alertmessage;
      if (err==="timeout") 
        alertmessage=autolang.trans("Error: timeout"); 
      else if (xhr && _.isObject(xhr) && xhr["responseJSON"]) 
        alertmessage=autolang.trans("Error")+": "+xhr["responseJSON"]["errmsg"]; 
      else 
        alertmessage=autolang.trans("Connection error")+": "+autolang.trans(err);        
      ctxt.simpleUpdateState({op:"edit", action: null, alert:"danger", alertmessage: alertmessage});        
    }.bind(ctxt)
  });
}

// delete one record

var deleteRecord = function(ctxt,op,viewdef,id,parent) {
  autoutils.debug("calling deleteRecord");
  var url=getApiUrl(ctxt,viewdef);
  if (ctxt.props.dummyData) url=url+ctxt.props.recordDummyData;  
  var args={"op":"delete","path": autoutils.getPath(viewdef)+id, "token":autoutils.getAuthToken()};
  args=convertParams(args);
  $.ajax({    
    url: url,
    dataType: 'json',
    type: POST,
    contentType:"application/json; charset=utf-8",
    data: JSON.stringify(args),   
    cache: false,
    timeout: globalState.ajaxTimeout,
    success: function(data) {    
      if (isErrResponse(data)) {
        console.error(url, data.toString());
        ctxt.updateState({op:"edit", action: null, alert:"danger", parent:parent,
                       alertmessage: autolang.trans("Error deleting")+": "+autolang.trans(data["errmsg"])});
      } else if (data && _.isObject(data) && !_.isArray(data) && !data["ok"]) {
        console.error(url, data.toString());                
        ctxt.updateState({op:"edit", action: null, alert:"danger", parent:parent,
                       alertmessage: autolang.trans("Error deleting")});
      } else {          
        ctxt.updateState({op:"list", action:"fresh", parent:parent});
      }        
    }.bind(ctxt),
    error: function(xhr, status, err) {
      console.error("error deleting with url "+url);
      var alertmessage;
      if (err==="timeout") 
        alertmessage=autolang.trans("Error: timeout"); 
      else if (xhr && _.isObject(xhr) && xhr["responseJSON"]) 
        alertmessage=autolang.trans("Error")+": "+xhr["responseJSON"]["errmsg"]; 
      else        
        alertmessage=autolang.trans("Connection error")+": "+autolang.trans(err);                  
      ctxt.updateState({op:"list", action: "fresh", alert:"danger",  parent:parent,
                      alertmessage: alertmessage});
    }.bind(ctxt)
  });
}  


// submit to approval

var submitApproval = function(ctxt,viewdef,data,parent) {
  autoutils.debug("calling submitApproval");
  var url=getApiUrl(ctxt,viewdef);
  if (ctxt.props.dummyData) url=url+ctxt.props.recordDummyData;  
  var id=data.main_resource_id;
  if (!id) return;
  var args={"op":"put","path": autoutils.getPath(viewdef)+id,
            "kind":"infosystem", 
            "token":autoutils.getAuthToken(),
            "data": {"main_resource_id":id, 
                     "kind": "infosystem", "inapproval": true}};
  //args["new_version"]=newnr;
  //args["uri"]=uri;  
  args=convertParams(args);
  $.ajax({    
    //url: url,+
    dataType: 'json',
    type: 'POST',
    contentType:"application/json; charset=utf-8",
    data: JSON.stringify(args),   
    cache: false,
    timeout: globalState.ajaxTimeout,
    success: function(data) {    
      if (isErrResponse(data)) {
        console.error(url, data.toString());
        ctxt.updateState({op:"view", action: null, alert:"danger", parent:parent,
                       alertmessage: autolang.trans("Error submitting to approval")+": "+autolang.trans(data["errmsg"])});                                              
      } else {    
        var future={alert:"success", alertmessage:autolang.trans("Submitted to approval")};    
        ctxt.updateState({op:"view", action:null, parent:parent,  
                          alert:"success", alertmessage:autolang.trans("Submitted to approval"),
                          future:future});
      }        
    }.bind(ctxt),
    error: function(xhr, status, err) {
      console.error("error submitting to approval");
      var alertmessage;
      if (err==="timeout") 
        alertmessage=autolang.trans("Error: timeout"); 
      else if (xhr && _.isObject(xhr) && xhr["responseJSON"]) 
        alertmessage=autolang.trans("Error")+": "+xhr["responseJSON"]["errmsg"]; 
      else        
        alertmessage=autolang.trans("Connection error")+": "+autolang.trans(err);                  
      var future;
      if (alertmessage) {
        future={alert:"danger",  alertmessage: alertmessage};
      } else {
        future={alert:"success",  alertmessage: "Submitted to approval"};
      }
      ctxt.updateState({op:"view", action: null, alert:"danger",  parent:parent,
                      alertmessage: alertmessage, future: future});
    }.bind(ctxt)
  });
}  

// launch creating a new version

var createNewVersion = function(ctxt,op,viewdef,id,uri,newnr,parent) {
  autoutils.debug("calling createNewVersion");
  var url=getApiUrl(ctxt,viewdef);
  if (ctxt.props.dummyData) url=url+ctxt.props.recordDummyData;  
  var args={"op":"newversion","path": autoutils.getPath(viewdef)+id,
            "kind":"infosystem",
             "token":autoutils.getAuthToken()};
  args["new_version"]=newnr;
  args["uri"]=uri;  
  $.ajax({    
    url: url,
    dataType: 'json',
    type: POST,
    contentType:"application/json; charset=utf-8",
    data: JSON.stringify(args),   
    cache: false,
    timeout: globalState.ajaxTimeout,
    success: function(data) {    
      if (isErrResponse(data)) {
        console.error(url, data.toString());
        ctxt.updateState({op:"view", action: null, alert:"danger", parent:parent,
                       alertmessage: autolang.trans("Error creating new version")+": "+autolang.trans(data["errmsg"])});                                              
      } else {    
        var future={alert:"success", alertmessage:autolang.trans("New version created")};
        ctxt.updateState({op:"view", action:null, parent:parent,  
                          alert:"success", alertmessage:autolang.trans("New version created"),
                          future:future});
      }        
    }.bind(ctxt),
    error: function(xhr, status, err) {
      console.error("error creating new version with url "+url);
      var alertmessage;
      if (err==="timeout") 
        alertmessage=autolang.trans("Error: timeout"); 
      else if (xhr && _.isObject(xhr) && xhr["responseJSON"]) 
        alertmessage=autolang.trans("Error")+": "+xhr["responseJSON"]["errmsg"]; 
      else        
        alertmessage=autolang.trans("Connection error")+": "+autolang.trans(err);                  
      var future;
      if (alertmessage) {
        future={alert:"danger",  alertmessage: alertmessage};
      } else {
        future={alert:"success",  alertmessage: "New version created"};
      }
      ctxt.updateState({op:"view", action: null, alert:"danger",  parent:parent,
                      alertmessage: alertmessage, future: future});
    }.bind(ctxt)
  });
}  


// used for filling a dynamic search box as the user types in a name

var dynamicSearchByName = function(ctxt,type,name,kind,idfldname,namefldname, filter) {
  //autoutils.debug("calling dynamicSearchByName");
  //autoutils.debug(kind,idfldname,namefldname);
  var params;
  var url=getApiUrl(ctxt);
  if (globalState.dummyData) url=url+globalState.listDummyData;   
  //autoutils.debug(url);  
  params={"op":"get", "token":autoutils.getAuthToken()};
  params.offset=0;
  params.limit=globalState.dynamicSearchLimit;
  params.sortkey=namefldname;
  params.fields=[idfldname,namefldname];  
  params.filter=[[namefldname,"ilike","%"+name+"%"]];
  if (type=="ref:organization") {
    params.path="db/asutus";
  } else if (type=="ref:person") {
    params.path="db/isik";
    params.fields=[idfldname,namefldname,"eesnimi"];  
  }  else {
    // Find table from template:
    var type = autoutils.refSubtype(type);
    var viewdef = autoutils.getViewdef(type);

    params.filter.push(["kind","=",kind]);
    if (filter !== undefined && filter !== null && filter.length > 0) {
      for (var i = 0; i < filter.length; i++)
        params.filter.push(filter[i]);
    }
    params.path="db/" + viewdef.table;
  }  
  params=convertParams(params);
  $.ajax({    
    url: url,
    dataType: 'json',
    type: POST,
    contentType:"application/json; charset=utf-8",
    data: JSON.stringify(params),
    cache: false,
    timeout: globalState.ajaxTimeout,
    success: function(data) {    
      if (isErrResponse(data)) {
        console.error(url, data.toString());
        ctxt.simpleUpdateState({op:"edit", action: null, alert:"danger", alertmessage: autolang.trans(data["errmsg"])});
      } else {                                               
        //autoutils.debug("dynamicSearchByName got data");
        //autoutils.debug(data);
        ctxt.handleDynamicOptionsChange(data);        
      }  
    }.bind(ctxt),
    error: function(xhr, status, err) {
       var alertmessage;
      if (err==="timeout") 
        alertmessage=autolang.trans("Error: timeout"); 
      else if (xhr && _.isObject(xhr) && xhr["responseJSON"]) 
        alertmessage=autolang.trans("Error")+": "+xhr["responseJSON"]["errmsg"]; 
      else 
        alertmessage=autolang.trans("Connection error")+": "+autolang.trans(err);        
      ctxt.simpleUpdateState({op:"edit", action: null, alert:"danger", alertmessage: alertmessage});
    }.bind(ctxt)
  });
}    

// ====== overview functions =======


var getOverview = function(ctxt) {
  autoutils.debug("calling getOverview");
  //var statepart,params = {"op":"overview","token":autoutils.getAuthToken()};
  var statepart,params = {"op":"overview","token":autoutils.getAuthToken()};
  autoutils.debug(params); 
  var url=getApiUrl(ctxt,null);
  if (ctxt.props.dummyData) url=url+ctxt.props.listDummyData;    
  params=convertParams(params);
  $.ajax({    
    url: url,
    dataType: 'json',
    type: POST,
    contentType:"application/json; charset=utf-8",
    data: JSON.stringify(params),
    cache: false,
    timeout: globalState.ajaxTimeout,
    success: function(data) {
      if (isErrResponse(data)) {
        autoutils.debug("api error");
        console.error(url, data.toString());
        ctxt.updateState({op:"overview", action: null, alert:"danger", alertmessage: autolang.trans(data["errmsg"])});
      } else {                                                          
        statepart={data: data, op:"overview", action: null, alert:false};          
        autoutils.debug("getOverview successful");                        
        console.log(url, data.toString());
        ctxt.simpleUpdateState(statepart); 
        //ctxt.updateState({op:"overview", action: null, alert:"danger", alertmessage: autolang.trans(data["errmsg"])});        
      }  
    }.bind(ctxt),
    error: function(xhr, status, err) {
      listError(ctxt,xhr,status,err); 
    }.bind(ctxt)
  });
}    


// ====== devices functions =======


var getDevices = function(ctxt) {
  autoutils.debug("calling getDevices");
  //var statepart,params = {"op":"devices","token":autoutils.getAuthToken()};
  var statepart,params = {"op":"devices","token":autoutils.getAuthToken()};
  //autoutils.debug(params); 
  var url=getApiUrl(ctxt,null);
  if (ctxt.props.dummyData) url=url+ctxt.props.listDummyData;    
  params=convertParams(params);
  $.ajax({    
    url: url,
    dataType: 'json',
    type: POST,
    contentType:"application/json; charset=utf-8",
    data: JSON.stringify(params),
    cache: false,
    timeout: globalState.ajaxTimeout,
    success: function(data) {
      if (isErrResponse(data)) {
        autoutils.debug("api error");
        console.error(url, data.toString());
        ctxt.updateState({op:"devices", action: null, alert:"danger", alertmessage: autolang.trans(data["errmsg"])});
      } else {                                                          
        statepart={data: data, op:"devices", action: null, alert:false};          
        autoutils.debug("getDevices successful");                        
        console.log(url, data.toString());
        ctxt.simpleUpdateState(statepart); 
        //ctxt.updateState({op:"devices", action: null, alert:"danger", alertmessage: autolang.trans(data["errmsg"])});        
      }  
    }.bind(ctxt),
    error: function(xhr, status, err) {
      listError(ctxt,xhr,status,err); 
    }.bind(ctxt)
  });
}    


// get all one device data

var getOneDevice = function(ctxt,viewdef,id) {
  var auxDataNeed,statepart;
  var url=getApiUrl(ctxt,viewdef);  
  var args={"op":"get","path": autoutils.getPath(viewdef)+id,            
            "token":autoutils.getAuthToken()};
  args=convertParams(args);
  $.ajax({    
    url: url,
    dataType: 'json',
    type: POST,
    contentType:"application/json; charset=utf-8",
    data: JSON.stringify(args),   
    cache: false,
    timeout: globalState.ajaxTimeout,
    success: function(data) {    
      if (isErrResponse(data)) {
        console.error(url, data.toString());
        ctxt.simpleUpdateState({op:"list", action: null, alert:"danger", alertmessage: autolang.trans(data["errmsg"])});                    
      } else {  
        //autoutils.debug("getOneDevice to do ctxt.simpleUpdateState");
        statepart={data: data, op:"onedevice", rowid: id, action: null, alert:false, viewdef:viewdef};          
        ctxt.simpleUpdateState(statepart);
      }                       
    }.bind(ctxt),
    error: function(xhr, status, err) {
      listError(ctxt,xhr,status,err);       
    }.bind(ctxt)
  });
}    

// ====== alerts functions =======


var getAlerts = function(ctxt) {
  autoutils.debug("calling getAlerts");
  //var statepart,params = {"op":"alerts","token":autoutils.getAuthToken()};
  var statepart,params = {"op":"alerts","token":autoutils.getAuthToken()};
  //autoutils.debug(params); 
  var url=getApiUrl(ctxt,null);
  if (ctxt.props.dummyData) url=url+ctxt.props.listDummyData;    
  params=convertParams(params);
  $.ajax({    
    url: url,
    dataType: 'json',
    type: POST,
    data: JSON.stringify(params),
    cache: false,
    timeout: globalState.ajaxTimeout,
    success: function(data) {
      if (isErrResponse(data)) {
        autoutils.debug("api error");
        console.error(url, data.toString());
        ctxt.updateState({op:"alerts", action: null, alert:"danger", alertmessage: autolang.trans(data["errmsg"])});
      } else {                                                          
        statepart={data: data, op:"alerts", action: null, alert:false};          
        autoutils.debug("getAlerts successful");                        
        console.log(url, data.toString());
        ctxt.simpleUpdateState(statepart); 
        //ctxt.updateState({op:"alerts", action: null, alert:"danger", alertmessage: autolang.trans(data["errmsg"])});        
      }  
    }.bind(ctxt),
    error: function(xhr, status, err) {
      listError(ctxt,xhr,status,err); 
    }.bind(ctxt)
  });
}    

// ====== messages functions =======


var getMessages = function(ctxt,oldstate) {
  autoutils.debug("calling getMessages");
  console.log(JSON.stringify(oldstate));
  //var statepart,params = {"op":"overview","token":autoutils.getAuthToken()};
  var statepart,params = {"op":"overview","token":autoutils.getAuthToken()};
  //autoutils.debug(params); 
  var url=getApiUrl(ctxt,null);
  if (ctxt.props.dummyData) url=url+ctxt.props.listDummyData;    
  params=convertParams(params);
  $.ajax({    
    url: url,
    dataType: 'json',
    type: POST,
    data: JSON.stringify(params),
    cache: false,
    timeout: globalState.ajaxTimeout,
    success: function(data) {
      if (isErrResponse(data)) {
        autoutils.debug("api error");
        console.error(url, data.toString());
        ctxt.updateState({op:"messages", action: null, alert:"danger", alertmessage: autolang.trans(data["errmsg"])});
      } else {                                                          
        statepart={data: data, op:"messages", action: null, alert:false}; 
        console.log("oldstate2: "+JSON.stringify(oldstate));        
        if (oldstate.alert) {
          statepart.alert=oldstate.alert;
          statepart.alertmessage=oldstate.alertmessage;
        }     
        autoutils.debug("getMessages successful");                        
        ctxt.simpleUpdateState(statepart); 
        //ctxt.updateState({op:"overview", action: null, alert:"danger", alertmessage: autolang.trans(data["errmsg"])});        
      }  
    }.bind(ctxt),
    error: function(xhr, status, err) {
      listError(ctxt,xhr,status,err); 
    }.bind(ctxt)
  });
}    



var sendMessages = function(ctxt,update) {
  autoutils.debug("calling sendMessages");
  //var statepart,params = {"op":"overview","token":autoutils.getAuthToken()};
  var statepart,params = {"op":"sendmessage","token":autoutils.getAuthToken(), 
     "deviceid": update.deviceid, "text":update.text};
  autoutils.debug(params); 
  var url=getApiUrl(ctxt,null);
  if (ctxt.props.dummyData) url=url+ctxt.props.listDummyData;    
  params=convertParams(params);
  $.ajax({    
    url: url,
    dataType: 'json',
    type: POST,
    data: JSON.stringify(params),
    cache: false,
    timeout: globalState.ajaxTimeout,
    success: function(data) {      
      if (isErrResponse(data)) {
        autoutils.debug("api error");
        console.error(url, JSON.stringify(data));
        statepart={data: data, op:"messages", action: "showsentandload", 
                   alert: "danger", alertmessage:"error: "+JSON.stringify(data)};
        ctxt.updateState(statepart);        
      } else {                                                          
        //statepart={data: data, op:"messages", action: "loaddata", alert:false};          
        autoutils.debug("sendMessages successful");                                       
        console.log(url, JSON.stringify(data));
        statepart={op:"onedevice", action: "showsent", 
                  alert: "info", alertmessage:"message queued for sending",
                  viewdef: autoutils.getViewdef("onedevice"),
                  id:update.deviceid};
                  //data: null};
        ctxt.updateState(statepart); 
        //ctxt.updateState({op:"overview", action: null, alert:"danger", alertmessage: autolang.trans(data["errmsg"])});        
      }  
    }.bind(ctxt),
    error: function(xhr, status, err) {
      listError(ctxt,xhr,status,err); 
    }.bind(ctxt)
  });
}    

// ====== deviceConf functions =======


var getDeviceConf = function(ctxt,oldstate) {
  autoutils.debug("calling getDeviceConf");
  console.log(JSON.stringify(oldstate));
  //var statepart,params = {"op":"overview","token":autoutils.getAuthToken()};
  var statepart,params = {"op":"overview","token":autoutils.getAuthToken()};
  //autoutils.debug(params); 
  var url=getApiUrl(ctxt,null);
  if (ctxt.props.dummyData) url=url+ctxt.props.listDummyData;    
  params=convertParams(params);
  $.ajax({    
    url: url,
    dataType: 'json',
    type: POST,
    data: JSON.stringify(params),
    cache: false,
    timeout: globalState.ajaxTimeout,
    success: function(data) {
      if (isErrResponse(data)) {
        autoutils.debug("api error");
        console.error(url, data.toString());
        ctxt.updateState({op:"deviceconf", action: null, alert:"danger", alertmessage: autolang.trans(data["errmsg"])});
      } else {                                                          
        statepart={data: data, op:"deviceconf", action: null, alert:false}; 
        console.log("oldstate2: "+JSON.stringify(oldstate));        
        if (oldstate.alert) {
          statepart.alert=oldstate.alert;
          statepart.alertmessage=oldstate.alertmessage;
        }     
        autoutils.debug("getDeviceConf successful");                        
        ctxt.simpleUpdateState(statepart); 
        //ctxt.updateState({op:"overview", action: null, alert:"danger", alertmessage: autolang.trans(data["errmsg"])});        
      }  
    }.bind(ctxt),
    error: function(xhr, status, err) {
      listError(ctxt,xhr,status,err); 
    }.bind(ctxt)
  });
}    



var sendDeviceConf = function(ctxt,update) {
  autoutils.debug("calling sendDeviceConf");
  //var statepart,params = {"op":"overview","token":autoutils.getAuthToken()};
  var statepart,params = {"op":"senddeviceconf","token":autoutils.getAuthToken(), 
     "deviceid": update.deviceid, "struct":update.conf};
  autoutils.debug(params); 
  var url=getApiUrl(ctxt,null);
  if (ctxt.props.dummyData) url=url+ctxt.props.listDummyData;    
  params=convertParams(params);
  $.ajax({    
    url: url,
    dataType: 'json',
    type: POST,
    data: JSON.stringify(params),
    cache: false,
    timeout: globalState.ajaxTimeout,
    success: function(data) {      
      if (isErrResponse(data)) {
        autoutils.debug("api error");
        console.error(url, JSON.stringify(data));
        //statepart={data: data, op:"deviceconf", action: "showsentandload", 
        //           alert: "danger", alertmessage:"error: "+JSON.stringify(data)};
        statepart={op:"onedevice", action: "showsent", 
                  alert: "danger", alertmessage:"error: "+JSON.stringify(data),
                  viewdef: autoutils.getViewdef("onedevice"),
                  id:update.deviceid};                        
        ctxt.updateState(statepart);        
      } else {                                                          
        //statepart={data: data, op:"messages", action: "loaddata", alert:false};          
        autoutils.debug("sendDeviceConf successful");                                       
        console.log(url, JSON.stringify(data));
        statepart={op:"onedevice", action: "showsent", 
                  alert: "info", alertmessage:"device conf queued for sending",
                  viewdef: autoutils.getViewdef("onedevice"),
                  id:update.deviceid};
                  //data: null};
        ctxt.updateState(statepart); 
        //ctxt.updateState({op:"overview", action: null, alert:"danger", alertmessage: autolang.trans(data["errmsg"])});        
      }  
    }.bind(ctxt),
    error: function(xhr, status, err) {
      listError(ctxt,xhr,status,err); 
    }.bind(ctxt)
  });
}    

// ======= logs and processes etc =========

var getLog = function(ctxt,op,logname,stateparams) {
  autoutils.debug("calling getLog");
  var nextstate;
  var params = {"op":"getlog","name":logname,"token":autoutils.getAuthToken()};
  var url=getApiUrl(null,null);
  $.ajax({    
    url: url,
    dataType: 'json',
    type: POST,
    data: JSON.stringify(params),
    cache: false,
    timeout: globalState.ajaxTimeout,
    success: function(data) {
      if (isErrResponse(data)) {
        console.log("getLog error 1");
        ajaxError(null,null,"error reading logs from server");     
      } else {                     
        nextstate=makeListNextState(stateparams,
          {data: data, op:"plain", action: null, alert:false, viewdef:"dummy"});
        ctxt.simpleUpdateState(nextstate);  
      }  
    },
    error: function(xhr, status, err) {
      console.log("getLog error 2");
      ajaxError(null,null,"cannot read logs from server");
    }
  });
}   

// ====== settings =======



var getSettings = function(callback) {
  autoutils.debug("calling getSettings");
  var statepart,params = {"op":"getsettings","token":autoutils.getAuthToken()};
  var url=getApiUrl(null,null);
  $.ajax({    
    url: url,
    dataType: 'json',
    type: POST,
    data: JSON.stringify(params),
    cache: false,
    timeout: globalState.ajaxTimeout,
    success: function(data) {
      if (isErrResponse(data)) {
        console.log("getSettings error 1");
        ajaxError(null,null,"error reading settings from server");
        callback();       
      } else {                     
        //console.log("getSettings ok!");
        //console.log(data);
        globalState.initialSettings=data;
        callback();        
      }  
    },
    error: function(xhr, status, err) {
      console.log("gtSettings error 2");
      ajaxError(null,null,"cannot read settings from server");
      callback();
    }
  });
}    

var setGroup = function(id) {
  autoutils.debug("calling setGroup");
  var nextstate;
  var params = {"op":"setgroup","id":id,"token":autoutils.getAuthToken()};
  var url=getApiUrl(null,null);
  $.ajax({    
    url: url,
    dataType: 'json',
    type: POST,
    data: JSON.stringify(params),
    cache: false,
    timeout: globalState.ajaxTimeout,
    success: function(data) {
      if (isErrResponse(data)) {
        console.log("setGroup error 1");
        ajaxError(null,null,"error setting groups in server");     
      } else {                     
        /*
        nextstate=makeListNextState(stateparams,
          {data: data, op:"plain", action: null, alert:false, viewdef:"dummy"});
        ctxt.simpleUpdateState(nextstate);  
        */
      }  
    },
    error: function(xhr, status, err) {
      console.log("setGroup error 2");
      ajaxError(null,null,"cannot set group in server");
    }
  });
}   

// ====== local functions =======

// used for checking answer with a non-error code

function isErrResponse(data) {
  if (data && _.isObject(data) && data["errcode"]) {
    checkAndProcessAuthError(data);
    return true;
  }
  else return false;
}

// called in case of early errors prohibiting launching of react app

function initialError(url,data,errmsg) {  
  console.log("err");
  console.log(url);
  console.log(data);
  console.log(errmsg);
  return;
  /*
  console.error(url.toString(), data.toString());
  debug(url.toString(), data.toString());
  var str="<div class='alert alert-danger loaddata'>"+autolang.trans(errmsg)+"</div>"
  $('#react-app').html(str); 
  */
}  

function checkAndProcessAuthError(data) {
  switch(data["errcode"]) {
    case 52:
    case 53:
    case 54:
      // Authentication error, clear user info:
      receivedUser({});
      break;
  }
}

function debug(a,b,c,d,e) {
  autoutils.debug(a,b,c,d,e);
}

// ====== exported functions =========

exports.getApiUrl = getApiUrl;
exports.getLogin = getLogin;
exports.getUserFromToken = getUserFromToken;
exports.isErrResponse = isErrResponse;
exports.getList = getList;
exports.getListSingle = getListSingle;
exports.getPureList = getPureList;
exports.getRecord = getRecord;
exports.saveRecord = saveRecord;
exports.deleteRecord = deleteRecord;
exports.submitApproval = submitApproval;
exports.createNewVersion = createNewVersion;
exports.dynamicSearchByName = dynamicSearchByName;
exports.getOverview = getOverview;
exports.getAlerts = getAlerts;
exports.getDevices = getDevices;
exports.getOneDevice = getOneDevice;
exports.getMessages = getMessages;
exports.sendMessages = sendMessages;
exports.sendDeviceConf = sendDeviceConf;
exports.getDeviceConf = getDeviceConf;
exports.getLog = getLog;
exports.getSettings = getSettings;
exports.convertParams = convertParams;
exports.setGroup = setGroup;

// ====== module end ==========

})(typeof exports === 'undefined'? this.autoapi = {} : exports);



