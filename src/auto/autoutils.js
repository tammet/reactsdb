/* 
 
 Autoreact utilities

*/
  

import * as autolang from './autolang.js';
import * as autoreact from './autoreact.js';

// ====== module start =========

// ====== exported functions =========
  
// ------- logging and debugging --------

// use autoutils.debug instead of console.log
// document.ready in init.js removes logging if globalState.debug==false

function debug(x) {
  console.log.bind(window.console);
}

// debug = function(){};  // this turns debugging off 

// -- environment --


function isTouchDevice() {
  return 'ontouchstart' in window        // works on most browsers 
      || navigator.maxTouchPoints;       // works on IE10/11 and Surface
};

// ---- direct dom manipulation ------

function removeAlert() {
  //$("#alertmessage").remove();
  //$("#alertmessage").html("");
  $("#alertmessage").hide();
}


// --- react core ----

function makeKey(s) {
  return s;
}

function makeUniqueKey(s) {
  return _.uniqueId(s);
}


// ---- getting some defaults -------
  
// maximal number of rows shown on a page    
  
function getListLimit() {
  return globalState.listLimit;
}  

function getListValueLen() {
  return globalState.listValueLen;  
}  

// ------------- user access rights and info -----------
  
function userLoggedIn() {
  return true;
} 
  
function userAllowedEdit(viewdef, data) {
  //return isAccessRight(viewdef.object, data, 'update');
  if (hasNegativeProperty(viewdef,"edit")) return false;
  return true;
}

function userAllowedDelete(viewdef, data) {
  //return isAccessRight(viewdef.object, data, 'delete');
  if (hasNegativeProperty(viewdef,"delete")) return false;
  else return true;
}

function userAllowedView(viewdef, data) {
  //return isAccessRight(viewdef.object, data, 'read');
  return true;
}

function userAllowedAdd(viewdef) {
  //return isAccessRight(viewdef.object, null, 'create');
  return true;
}

function userName() {
  return globalState.userName;
}

function userCode() {
  return globalState.userCode;
}

function userOrganizationName() {
  return globalState.userOrganization;
}

function userOrganizationCode() {
  return globalState.userOrganizationCode;
}


function userInfo() {
  return {"username": "Suva Isik", "userOrganizationName": "Suva org"};
}

// lang etc
  
function changeLang(id) {  
  var lang=globalState.lang;
  if (lang=="est") {
    globalState.lang="eng";
    $("#"+id).attr("data-label",globalState.lang+"_switch");
  } else if (lang=="eng") {
    globalState.lang="est";
    $("#"+id).attr("data-label",globalState.lang+"_switch");
  }    
  autolang.initialTrans();
  ReactDOM.unmountComponentAtNode(document.getElementById('react-app'));
  initReact(globalState); 
}

// automatically build a trivial viewdef if missing 

function autoBuildViewdef(data) {
  var def={"name": "Data"};
  var id="id";
  var fields=[];  
  var row=null;
  var els=[];
  var found=false;
  if (data && _.isArray(data) && data.length!=0) {
    row=data[0];
    if (_.isObject(row) && _.keys(row).length!=0) {
      var keys=_.keys(row);
      // use id or key if exists in the first row
      if (keys.indexOf("id")>=0) id="id";
      else if (keys.indexOf("key")>=0) id="key";
      else {
        // else find a uniquely valued column
        for(var i=0;i<keys.length;i++) {        
          els=[];
          found=true;
          for(var j=0;j<data.length;j++) {
            if (els.indexOf(data[j][keys[i]])>=0) break;
            els.push(data[j][keys[i]]);
          }
          if (found) {id=keys[i]; break;}
        }  
      }
      // create the field list
      for(i=0;i<keys.length;i++) {
        fields.push({"name":keys[i]});
      }        
    }
  }
  if (!row || _.keys(row).length==0) fields={"id":id};
  def["key"]=id;
  def["fields"]=fields;
  return def;  
}


function setupDatePicker(thisctxt) {
  var id="#"+thisctxt.state.id;
  $(id).datepicker({'weekStart':1, 'format':'dd.mm.yyyy', 'globalState': globalState});
  //$(id).datepicker({'weekStart':1, 'format':'dd.mm.yyyy'});
  $(id).datepicker('place');
  $(id).datepicker('hide');
  $(id).datepicker().on('changeDate', function(e){ 
    //thisctxt.setState({value:$(id).val()});
    thisctxt.handleChange(e);
    $(id).datepicker('hide');  
  }.bind(thisctxt));
} 

function dateToLocal(date) {
  var tmp,res,n;
  if (!_.isString(date)) return date;
  if (!date || date.length<10) return date;
  n=date.lastIndexOf("."); 
  if (date.length>n+4 && date.length<n+6) return date;
  //if (date[2]=="." && date[5]==".") return date;
  tmp=date.substring(0, 10); 
  // "2016-10-20"
  //  0123456789"
  //  20.10.2016
  res=tmp.substring(8,10)+"."+tmp.substring(5,7)+"."+tmp.substring(0,4);
  return res;  
}


function dateToIso(date) {
  var tmp,res;
  if (!date || date.length<5) return date;
  tmp=date.split(".");
  if (tmp.length!=3) return date;
  res=tmp[2]+"-";
  if (tmp[1].length<2) res=res+"0"+tmp[1];
  else res=res+tmp[1];
  res=res+"-";
  if (tmp[0].length<2) res=res+"0"+tmp[0];
  else res=res+tmp[0]; 
  res=res+"T00:00:00";  
  return res; 
}


function setupFieldSearch(thisctxt) {
  var id="#"+thisctxt.state.id;
  $(id).on('change', function(){ 
    thisctxt.setState({value:"897"});
    $(id).modal('hide');  
  }.bind(thisctxt));
} 


function cloneObject(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  } 
  var temp = obj.constructor(); // give temp the original obj's constructor
  for (var key in obj) {
    temp[key] = cloneObject(obj[key]);
  }
  return temp;
}

function htmlEscape(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}


function getTable(viewdef) {
  if (viewdef && viewdef["table"]) return viewdef["table"];
  return null;
}

function getPath(viewdef) {
  var table=getTable(viewdef);
  if (table === null) return null;
  return table;          
  //return table;
}

function getLink(kind, id) {
  var link = "#" + kind;
  if (id) link += "/" + id.toString();
  return link;
}

function getLinkForUri(uri) {
  return null;
}

function getKind(viewdef,data) {
  var kind=null;
  //if (viewdef["table"]=="data_object") return "entity";
  if (viewdef["object"]) kind=viewdef["object"];    
  else if (data["kind"]) kind=data["kind"];  
  return kind;
}

function getAuthToken() {
  if (globalState.token) return globalState.token;
  else return null;
}

function getViewdef(name) {
  var viewdefs=globalState.viewdefs;
  for (var i=0;i<viewdefs.length;i++) {
    if (viewdefs[i]["name"]==name) {
      return viewdefs[i];
    }
  }
  return null;
}



// ------------ process data read from api ------------------

function processReadRecord(data,viewdef,auxdata) {
  //debug("processReadRecord");
  //debug(data);
  //debug(viewdef);  
  if (!data || _.isEmpty(data) || _.isArray(data) || !_.isObject(data) || !viewdef) return data;  
  var res={},keys=_.keys(data),i,j,key,fld,type,val,el,conv,lst,person,org,founddict;  
  for(i=0;i<keys.length;i++) {
    key=keys[i];    
    val=data[key];
    fld=_.findWhere(viewdef.fields, {name:key});
    if (fld) type=fld.type;
    if (!val || !_.isArray(val) || !fld)  {
      conv=data[key];
    } else {
      conv=data[key];
    }
    res[key]=conv;
  }
  return res;
}

// ------------ auxiliary data ------------------

// determine aux data needed

function auxDataNeed(data,viewdef,currentAuxData) {
  var fields,part,i,j,keys,key,val,fld,type,subtype,subviewdef;
  debug("calling auxDataNeed");
  console.log(data);
  console.log(viewdef);
  console.log(currentAuxData);
  if (!data) return null;
  fields=viewdef.fields;
  if (_.isArray(data)) {
    part=currentAuxData;
    for(i=0;i<data.length;i++) {      
      part=auxDataNeed(data[i],viewdef,part); 
    }
    console.log("auxDataNeed res for isArray");
    console.log(part);
    return part;
  }  
  else if (_.isObject(data)) {
    keys=_.keys(data);
    part=currentAuxData;    
    for(i=0;i<keys.length;i++) {      
      key=keys[i];
      val=data[key];
      if (!val) continue;
      fld=_.findWhere(fields, {name:key});
      if (!fld) continue;
      type=fld.type;
      subtype=arraySubtype(type);
      console.log("fld, key, type, subtype, val");
      console.log(fld);
      console.log(key);
      console.log(type);
      console.log(subtype);
      console.log(val);      
      if (subtype && _.isArray(val)) {
        if (isRefType(subtype)) {        
          for(j=0;j<val.length;j++) {      
            part=auxDataNeedSingle(val[j],subtype,part); 
          }
        } else  {
          subviewdef=_.findWhere(globalState.viewdefs, {"name":subtype});
          if (subviewdef) {
            part=auxDataNeed(val,subviewdef,part);          
          }  
        }  
      } else {
        part=auxDataNeedSingle(val,type,part)
      }
    }
    console.log("auxDataNeed res for isObject");
    console.log(part);
    return part;
  }
  return {};  
}

function auxDataNeedSingle(val,type,part) {
  /*
  console.log("auxDataNeedSingle");
  console.log(val);
  console.log(type);
  console.log(part);
  */
  if (val === undefined || val === null || val === "" || val === 0) return part;
  if (isRefType(type)) {
    var tname=refSubtype(type);
    if (!part[tname]) part[tname]=[val];
    else if (part[tname].indexOf(val)<0) part[tname].push(val);
  }  
  //console.log(part);
  return part;  
}

// create an enhanced copy of the data element, using auxiliary data

function replaceWithAux(val,auxdata,type,replacestyle) {
  /*
  debug("replaceWithAux");
  debug(val);
  debug(type);
  debug(auxdata);
  */
  var lst,tmp,subtype,subviewdef;  
  if (!val || !auxdata || !type) return val;  
  if (_.isArray(val) && !_.isEmpty(val)) {
    subtype=arraySubtype(type); 
    //debug("type: "+type);   
    //debug("subtype: "+subtype);    
    if (!subtype || subtype=="string") return val;    
    if (isRefType(subtype)) {
      return _.map(val,function(el) {
        return replaceWithAux(el,auxdata,subtype,replacestyle);
      });
    } else  {
      subviewdef=_.findWhere(globalState.viewdefs, {"name":subtype});
      //debug("subviewdef: ");  
      //debug(subviewdef);      
      if (!subviewdef) return val;
      return _.map(val,function(el) {
        return replaceWithAuxObject(el,auxdata,subviewdef,replacestyle);
      }); 
    }  
  } else {
    var auxType = getAuxDataType(type);
    if (auxType === null) return val;
    lst = auxdata[auxType];
  }
  if (!lst || !lst[val]) return val;  
  else if (type=="ref:person") return lst[val];
  else if (replacestyle=="both") return lst[val]+" ("+val+")";
  else return lst[val];  
}

function addToAux(val, replacement, auxdata, type) {
  if (val === undefined || val === null || val === "" || replacement === undefined || replacement === null || replacement === "") return;
  var auxType = getAuxDataType(type);
  if (!_.has(auxdata, auxType)) auxdata[auxType] = {};
  auxdata[auxType][val] = replacement;
}

function getAuxDataType(type) {
  if (!type) return null;
  if (!type.startsWith("ref:")) return null;
  switch (type) {
    case 'ref:person':
      return 'persons';
    case 'ref:organization':
      return 'organizations';
    default:
      return 'uris';
  }
}

function replaceWithAuxObject(obj,auxdata,viewdef,replacestyle) {
  var i,res={},keys=_.keys(obj),key,fld,conv;  
  for(i=0;i<keys.length;i++) {
    key=keys[i];    
    fld=_.findWhere(viewdef.fields, {name:key});
    if (!fld) conv=obj[key];
    else conv=replaceWithAux(obj[key],auxdata,fld.type,replacestyle);
    res[key]=conv;
  }
  return res;  
}

// ------------- creating and using joins ------------------------------


function makeListJoinParams(ctxt,op,viewdef,stateparams) { 
  //console.log("makeListJoinParams "+viewdef.name);
  var i,key,fld,fldname,tbl,tblidfld,tblnamefld,joinstr="";
  var flds=viewdef.fields;  
  //console.log("flds: "+flds);
  //var keys=_.keys(flds); 
  //console.log("keys: "+keys);
  for(i=0;i<flds.length;i++) {    
    fld=flds[i];    
    fldname=fld.name;
    //console.log("fldname: "+fldname);
    if (isRefType(fld.type)) {
      var tname=refSubtype(fld.type);
      //console.log("tname: "+tname);
      tbl=getViewdef(tname);
      if (!tbl) continue;
      //console.log("namefield,refffield "+" "+tbl["nameField"]+" "+tbl["refField"]);
      if (!(tbl && tbl["nameField"] && tbl["refField"])) continue; 
      if (joinstr) joinstr+=","
      joinstr+=fldname+","+tbl.name+"."+tbl["refField"]+","+tbl.name+"."+tbl["nameField"];
    } else if (isOfType(fld.type)) {
      var ofname=ofSubtype(fld.type);
      tbl=tableNamePart(fldname);
      tbl=getViewdef(tbl);
      if (!tbl) continue;
      if (!(tbl && tbl["refField"])) continue;      
      if (joinstr) joinstr+=",";
      joinstr+=ofname+","+tbl.name+"."+tbl["refField"]+","+fldname;
    }          
  }
  //console.log("returning "+joinstr);
  //locationid,locations.id,locations.name
  return joinstr;      
}

function replaceWithJoin(viewdef,joinparams,data,op) {
  console.log("replaceWithJoin op "+op);
  var i,j,rec,join,jobj={},jpart,jfld,jnewfld,keys,key,tmp,modkey,flds;
  if (!data || !joinparams || !viewdef) return data;
  flds=viewdef.fields;
  join=joinparams.split(",");
  for(j=0;j*3<join.length;j++) {
    tmp=join[j*3+2].split(".");
    //console.log(j+" "+tmp)
    if (!viewHasReftyped(viewdef,join[j*3])) continue;
    //modkey=tmp[0]+"__"+tmp[1];
    jobj[join[j*3]]=tmp[0]+"__"+tmp[1];
    /*
    if (_.has(data,modkey)) {
    } else {
      jobj[join[j*3]]=tmp[0]+"__"+tmp[1];
    } 
    */ 
  }
  console.log(jobj);
  if (_.isArray(data) && !_.isEmpty(data)) {
    for(i=0;i<data.length;i++) {
      rec=data[i];
      keys=_.keys(rec);
      for(j=0;j<keys.length;j++) {
        key=keys[j];
        if (key.indexOf("__")>0) {
          data[i][key.replace("__",".")]=rec[key];
        } else if (jobj[key]) {
          data[i][key]=rec[jobj[key]];
        }
      }
    }
  } else if (op==="edit")  {
  
  } else {
    // locationid,locations.id,locations.name
    rec=data;
    keys=_.keys(rec);
    for(j=0;j<keys.length;j++) {
      key=keys[j];
      if (key.indexOf("__")>0) {
        data[key.replace("__",".")]=data[key];
      } else if (jobj[key]) {
        data[key+"__joinReplaced"]=rec[jobj[key]];
        data[key+"__origRaw"]=data[key];        
        data[key]=rec[jobj[key]];        
      }
    }
  }  
  return data;
}

function viewHasReftyped(viewdef,key) {
  console.log("viewHasReftyped");
  console.log(viewdef);
  console.log(key);
  var i,flds=viewdef.fields;
  for(i=0;i<flds.length;i++) {
    var fld=flds[i];
    if (fld.name==key && _.has(fld,"type") && isRefType(fld.type)) return true;
  }
  return false;
}

function origRawValue(name,rec) {
  var oname=name+"__origRaw";
  return rec[oname];
}

// ------------- handling fields ---------------------------

function hasNegativeProperty(obj,key) {
  if (_.has(obj,key) && !obj[key]) return true;
  return false;
}

function fieldShow(field,op) { 
  if (hasNegativeProperty(field,"show")) return false; 
  if (hasNegativeProperty(field,op+"Show")) return false;  
  return true;
}

function orderFields(fields) {
  var haveorder=[], havebigorder=[], rest=[], ordered=[], bigordered=[], res=[];
  _.each(fields, function(x) {
      if (_.has(x,"order")) {
        if (x.order>=1000) havebigorder.push(x);
        else haveorder.push(x); 
      }   
      else rest.push(x); 
  });
  ordered=_.sortBy(haveorder, function(x){ return x["order"]});
  bigordered=_.sortBy(havebigorder, function(x){ return x["order"]});
  res=ordered.concat(rest).concat(bigordered);
  return res;
}

// -------- kind of viewdef and fieldtype, their subtypes -----------

function versionableViewdef(viewdef) {
  if (!viewdef) return false;
  if (_.indexOf(["infosystem","service","classifier","xmlasset"],viewdef.name)>=0) return true;
  return false;  
}  

function isRefType(type) {
  if (!type) return false;
  if (type.indexOf("ref:")===0) return true;
  else return false;
}

function isSearchType(fldtype) {
  return isRefType(fldtype); 
}

function isOfType(type) {
  if (!type) return false;
  if (type.indexOf("of:")===0) return true;
  else return false;
}

function isIdType(type) {
    if (!type) return false;
    if (type.indexOf("id:")===0) return true;
    return false;
}

function refSubtype(type) {  
  if (!type) return null;
  if (type.indexOf("ref:")!==0) return null;
  else return type.substring(4);  // length of ref:
}

function ofSubtype(type) {  
  if (!type) return null;
  if (type.indexOf("of:")!==0) return null;
  else return type.substring(3);  // length of of:
}

function tableNamePart(name) {
  if (!name) return null;
  if (name.indexOf(".")<=0) return null;
  else return name.substring(0,name.indexOf("."));  // table from table.field
}

function isArrayType(type) {
  if (!type) return false;
  if (type==="array") return true;
  if (type.indexOf("array:")===0) return true;
  else return false;
}

function arraySubtype(type) {
  if (!type) return null;
  if (type.indexOf("array:")!==0) return null;
  else return type.substring(6);  // length of array:
}

function isSimpleType(type) {
    switch(type.toLowerCase()) {
        case 'boolean':
        case 'integer':
        case 'number':
        case 'string':
        case 'date':
        case 'time':
        case 'datetime':
        case 'base64':
        case 'url':
            return true;
    }
    return false;
}

/* ------- parse uri ------- */

// Based on parseUri 1.2.2 by
// (c) Steven Levithan <stevenlevithan.com>
// MIT License

function parseUri(str) {
  var     o   = parseUri_options,
          m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
          uri = {},
          i   = 14;
  while (i--) uri[o.key[i]] = m[i] || "";
  uri[o.q.name] = {};
  uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
          if ($1) uri[o.q.name][$1] = $2;
  });
  return uri;
};

var parseUri_options = {
  strictMode: false,
  key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
  q:   {
          name:   "queryKey",
          parser: /(?:^|&)([^&=]*)=?([^&]*)/g
  },
  parser: {
          strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
          loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
  }
};

// ====== local functions =======

function removeBase64Header(str) {
  var n;
  if (!str) return str;
  n=str.indexOf(","); 
  if (n<0) n=str.indexOf(";"); 
  if (n<0) return str;
  return str.substring(n+1);
}

function getMimeFromName(str) {
  var n,suffix;
  if (!str) return "application/octet-stream";
  n=str.lastIndexOf(".");
  if (n<0) return "application/octet-stream";
  suffix=str.substring(n+1);
  if (suffix=="doc" || suffix=="docx" || suffix=="xls" || suffix=="xlsx") {
    return "application/vnd.ms-word";
  } else if (suffix=="xml") {
    return "application/xml";
  } else if (suffix=="txt") {
    return "text/plain";
  } else {
    return "application/octet-stream";
  }    
}  

// -------- history ----------

function storeHistory(state,params) {
  //debug("storeHistory");
  if (!state.viewdef) return;
  var name=state.viewdef.name;
  if (state.parent && state.parent.viewdef) name=state.parent.viewdef.name;        
  var store={"viewname":name, "op":state.op, "rowid":state.rowid};  
  if (state.op=="list") {
    if (params && params.offset) store["offset"]=params.offset;
    else store["offset"]=0;          
    if (params && params.sortkey) store["sortkey"]=params.sortkey;
    else store["sortkey"]="id";
    if (params && params.down) store["down"]=params.down;
    else store["down"]=false;
    if (params && params.filter) store["filter"]=params.filter;
    else store["filter"]=null;
    if (params && params.forcefilter) store["forcefilter"]=params.forcefilter;
    else store["forcefilter"]=null;
    if (params && params.filterdata) store["filterdata"]=params.filterdata;
    else store["filterdata"]=null;
    
  }  
  //debug("store");
  //debug(store);
  //globalHistory=_.extendOwn(globalHistory,store);
  history.pushState(store,null,location.href);
}

function restoreHistory(props) {
  debug("restoreHistory");
  //globalHistory=_.extendOwn(globalHistory,props);
  globalHistory=copyData(cloneObject(globalHistory),cloneObject(props));
  //globalState=_.extendOwn(globalState,globalHistory);
  globalState=copyData(globalState,globalHistory);
}

function copyData(target,source) {
  var i,keys=_.keys(source);
  for(i=0;i<keys.length;i++) {
    target[keys[i]]=source[keys[i]];
  }
  return target;
}


// ====== exported functions =========

export {
  debug,
  isTouchDevice,
  removeAlert,

  makeKey,
  makeUniqueKey,

  getListLimit, getListValueLen,

  userLoggedIn,
  userAllowedEdit,
  userAllowedDelete,
  userAllowedView,
  userAllowedAdd,
  userName,
  userOrganizationName,
  userOrganizationCode,
  userInfo,

  changeLang,
  autoBuildViewdef,
  setupDatePicker,
  dateToLocal,
  dateToIso,
  setupFieldSearch,
  cloneObject,
  htmlEscape,

  parseUri,
  
  processReadRecord,

  auxDataNeed,
  replaceWithAux,
  addToAux,

  makeListJoinParams,
  replaceWithJoin,
  origRawValue,

  hasNegativeProperty,
  orderFields,
  fieldShow,

  versionableViewdef,
  isRefType,
  isSearchType,
  isIdType,
  isArrayType,
  arraySubtype,
  refSubtype,
  isSimpleType,

  getTable,
  getPath,
  getLink,
  getLinkForUri,
  getKind,
  getAuthToken,

  storeHistory,
  restoreHistory,
  copyData,

  getViewdef
  
};
  
