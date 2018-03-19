/* 
 
 Autoreact utilities

*/
  
  
(function(exports) {
  "use strict";
  
// ====== module start =========

// ====== exported functions =========
  
// ------- logging and debugging --------

// use autoutils.debug instead of console.log
// document.ready in init.js removes logging if globalState.debug==false

var debug = console.log.bind(window.console);
// debug = function(){};  // this turns debugging off 
  
// ---- getting some defaults -------
  
// maximal number of rows shown on a page    
  
function getListLimit() {
  return globalState.listLimit;
}  

function getListValueLen() {
  return globalState.listValueLen;  
}  

function getModalHelpLengthLimit() {
  return globalState.modalHelpLengthLimit;
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
  
exports.changeLang = function(id) {  
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

exports.autoBuildViewdef = function(data) {
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


exports.setupDatePicker = function(thisctxt) {
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

exports.dateToLocal = function(date) {
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


exports.dateToIso = function(date) {
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


exports.setupFieldSearch = function(thisctxt) {
  var id="#"+thisctxt.state.id;
  $(id).on('change', function(){ 
    thisctxt.setState({value:"897"});
    $(id).modal('hide');  
  }.bind(thisctxt));
} 

exports.cloneObject = function (x) {
  return cloneObject(x);
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

exports.htmlEscape = function (str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/*
exports.handleClickRow = function(x) {
  console.log("click "+x);
}

exports.capitalizeFirstLetter(s) {
  if (!s) return "";
  return s[0].toUpperCase() + s.slice(1);
}

*/



function makeFilterParams(ctxt,op,viewdef) { 
  //debug("makeFilterParams");
  var i=0,input,name,type,value,cond,deffields,field,fields=[],key,date,fieldtype;
  var args={},filter=[], kind, token;
  var valueInputs=$.find("[data-filter='value']");  
  var minvalueInputs=$.find("[data-filter='minvalue']");  
  var maxvalueInputs=$.find("[data-filter='maxvalue']");
  args={"op":"get","path": getPath(viewdef)};
  filter=[];
  if (!viewdef) return null;
  //debug("viewdef");
  //debug(viewdef);
  //kind=getKind(viewdef,{});
  //debug("kind");
  //debug(kind);    
  /*
  if (kind!==null) {
    args["kind"]=kind;
    filter.push(["kind","=",kind]);
  } 
  */  
  token=getAuthToken();
  if (token) args["token"]=token;  
  // create a filter
  for(i=0;i<valueInputs.length;i++) {
    input=valueInputs[i];
    name=input["name"];
    type=input.getAttribute("data-type");
    value=formvalueToJson(input["value"],type);
    
    //if (!name || (!value && value!==false && value!==0) || _.isObject(value) ) continue;
    if (!name || (!value && value!==false && value!==0)) continue;
    if (_.isObject(value) && !_.isArray(value)) continue;
    if (_.isArray(value) && value.length<1) continue;
    if (value && _.isString(value)) value=value.trim();
        
    field=_.findWhere(viewdef["fields"], {"name":name});
    if (field && field.type) fieldtype=field.type;    
    //console.log(name+" "+type+" "+fieldtype);    
    if (type==="string" && !(field && field["values"] && _.isArray(field["values"]))) {
      cond=[name,"ilike","%"+value+"%"];       
    } else if (type=="array:string") {
      if (_.isArray(value)) cond=[name,"?&",value];      
      else cond=[name,"?&",[value]]; 
    } else if (fieldtype && fieldtype.startsWith("array:ref:")) {
      if (_.isArray(value)) cond=[name,"?&",value];                  
      //"[\"urn:fdc:riha.eesti.ee:2016:area:519048\"]"]]
      //else cond=[name,"?&",[value]];      
      else cond=[name,"?&",JSON.stringify([value])];
    } else {    
      cond=[name,"=",value];
    }  
    filter.push(cond);
  }
  for(i=0;i<minvalueInputs.length;i++) {
    input=minvalueInputs[i];
    name=input["name"];
    type=input.getAttribute("data-type");
    value=formvalueToJson(input["value"],type);
    if (!name || (!value && value!==false && value!==0) || _.isObject(value)) continue;
    //args+="&"+name+"="+encodeURIComponent(value);  
    cond=[name,">=",value];
    filter.push(cond);
  }
  for(i=0;i<maxvalueInputs.length;i++) {
    input=maxvalueInputs[i];
    name=input["name"];
    type=input.getAttribute("data-type");
    value=formvalueToJson(input["value"],type);
    if (!name || (!value && value!==false && value!==0) || _.isObject(value)) continue;
    //args+="&"+name+"="+encodeURIComponent(value);  
    cond=[name,"<=",value];
    filter.push(cond);
  }
  // extend filter to exclude old versions
  if (viewdef.name=="infosystem") {
    date=localDateTimeISO(); //!!!
    //cond=["end_date","null_or_>",date]; 
    cond=["end_date","isnull",""];
    filter.push(cond);    
  }
  // select fields to ask for
  deffields=viewdef["fields"];
  if (deffields) {
    for (i=0; i<deffields.length; i++) {
      if (deffields[i]["listShow"]!==false) fields.push(deffields[i]["name"]);
    }
  }  
  key=viewdef["key"];
  if (key && _.indexOf(deffields,key)<0) fields.push(key);
  if (_.has(viewdef,"uri")) fields.push("uri");
  args["fields"]=fields;  
  if (filter.length!=0) args["filter"]=filter; 
  return args;  
}


function getFilterData(ctxt,op,viewdef) { 
  var i=0,input,name,type,value, res;  
  var valueInputs=$.find("[data-filter='value']");  
  var minvalueInputs=$.find("[data-filter='minvalue']");  
  var maxvalueInputs=$.find("[data-filter='maxvalue']");  
  res={};
  for(i=0;i<valueInputs.length;i++) {
    input=valueInputs[i];
    name=input["name"];
    value=input["value"];
    //console.log("value"+"!"+value+"|");
    if (!value && value!==0) value="";
    else value=value.trim();  
    //console.log("2value"+"!"+value+"|");    
    res[name]=value;
  }       
  return res;  
}



// parent is used only for connecting to the parent

function makeSaveParams(ctxt,viewdef,parent) { 
  var i=0,input,name,type,value,content,encoding,j,options,opt,tmp;
  var token,key,keyValue,mustfill,filledok;
  //debug("makeSaveParams");
  //debug("parent:");
  //debug(parent);
  var args={},save=[];
  var emptyInputs=$.find("[data-save='empty']");
  var valueInputs=$.find("[data-save='value']");
  var table="infosystem";      
  args={"op":"get","path": getPath(viewdef)};
  token=getAuthToken();
  if (token) args["token"]=token; 
  save={};
  var complexes={}, complexel, complexsubel, parentname, arrayindex, keys;
  key=viewdef["key"];  
  filledok=true;  
  for(i=0;i<emptyInputs.length;i++) { 
    input=emptyInputs[i];
    name=input["name"];
    save[name]=null;
  }    
  for(i=0;i<valueInputs.length;i++) {
    input=valueInputs[i];
    name=input["name"];
    type=input.getAttribute("data-type");
    encoding=input.getAttribute("data-encoding");    
    value=formvalueToJson(input["value"],type,encoding);
    parentname=input.getAttribute("data-parentname");
    arrayindex=input.getAttribute("data-arrayindex");
    mustfill=input.getAttribute("data-mustfill");
    if (name===key) keyValue=value;
    if (parentname && arrayindex) {
      if (!complexes[parentname]) complexes[parentname]=[];
      complexel=complexes[parentname];
      if (!complexel[parseInt(arrayindex)]) complexel[parseInt(arrayindex)]={};
      complexsubel=complexel[parseInt(arrayindex)];
      complexsubel[name]=value;     
    } else if (type=="base64") {   
      content=removeBase64Header(input.getAttribute("data-filecontent"));
      if (content) {
        save["filename"]=value.replace(/^.*\\/, "");
        save["content"]=content;
        save["mime"]=getMimeFromName(value);
      }  
      //save["kind"]="document";      
      args["path"]="db/document/";
      //args["kind"]="document";
    } else if (type=="array:string" && input.options) {
      options=input.options;
      //debug(options);
      value=[];
      for (j=0; j<options.length; j++) {
        opt = options[j];
        if (opt.selected) {
          value.push(opt.value);          
        }
      }       
      save[name]=value;
    } else {
      if (!name) continue;
      if (!value && (value!==0 && value!==false && value!==[])) value=null;       
      save[name]=value;
    }      
    if (mustfill==="true" && !input["value"]) filledok=false;
  }
  keys=_.keys(complexes);
  for(i=0;i<keys.length;i++) {
    save[keys[i]]=complexes[keys[i]];
  }
  /*
  if (ctxt.state.rowid) args["key"]=ctxt.state.rowid;
  else {
    // Insertion of the new record. We should set owner field:
    //if (!save["owner"]) save["owner"]=userOrganizationCode();
  }
  */
  //if (!save["creation_date"]) save["creation_date"]=localDateTimeISO();

  // Apply filters (they contain also parent key assignement):
  /*
  if (false) { // (parent && parent.filter) {
    var filter = parent.filter;
    for (var i = 0; i < filter.length; i++) {
      if (filter[i][1] === "=") {
        save[filter[i][0]] = filter[i][2];
      }
    }
  } else {
    // No parent. We should set "owner" field, if this is not update:
  }
  */
  args["data"]=save;
  if (!filledok) return false;
  return args;  
}

function localDateTimeISO() {
  var s,d=new Date();
  s=d.getFullYear()+"-"+pad0(d.getMonth()+1)+"-"+pad0(d.getDate())+"T";
  s+=pad0(d.getHours())+":"+pad0(d.getMinutes())+":"+pad0(d.getSeconds());
  return s;
}

function formatDate(isotimestr) {
  var res,datestr=localDateTimeISO().slice(0,10);
  if (isotimestr && isotimestr.startsWith(datestr)) res=isotimestr.slice(10);
  else res=isotimestr;
  return res; 
}

function formatDateEnd(start,end) {  
  if (!start || start.length<14 || end.length<14) return end;
  if (start.slice(0,10)===end.slice(0,10)) {
    return end.slice(11);
  } else {
    return end;
  }
}

/*
function commonPrefix(array) {
  var A=array.concat().sort(), 
      a1=A[0], a2=A[A.length-1], L=a1.length, i=0;
  while(i<L && a1.charAt(i)===a2.charAt(i)) i++;
  return a1.substring(0,i);
}
*/

function pad0(num) {
  var norm = Math.abs(Math.floor(num));
  return (norm < 10 ? '0' : '') + norm;
};

function formvalueToJson(value,type,encoding) {
  var tmp,i;
  if (encoding==="json") {
    if (value==="") return null;
    return JSON.parse(value);
  }  
  if (type=="date") {
    return autoutils.dateToIso(value);
  } else if (type=="boolean") {
    if (value==="true") return true;
    else if (value==="false") return false;
    else return null;
  } else if (type=="integer") {
    if (!value && value!==0) return null;
    tmp=parseInt(value);
    if (tmp || tmp===0) return tmp;    
    else return null;
  } else if (type=="number") {
    if (!value && value!==0) return null;
    tmp=Number(value);
    if (isNaN(value)) return null;    
    else return tmp;  
  } else if (type=="xxxxxfile") {  
    var fileCount,i;
    //debug(value);
    //for (i=0, fileCount=uploadInput.files.length; i < fileCount; i++) {
    //debug("start"+uploadInput.files[i]+"end");  
  } else if (type=="array:string") {
    if (!value) return [];
    tmp=value.split(",");
    tmp=_.map(tmp,function(x) { return x.trim() });    
    return tmp;
  } 
  else return value;  
}
  
function getStateParamsFilter(stateparams) {
  if (!stateparams) return null;
  if (stateparams["filter"]) return stateparams["filter"];
  if (!stateparams["parent"]) return null;
  return stateparams["parent"]["filter"];
}


function getTable(viewdef) {
  if (viewdef && viewdef["table"]) return viewdef["table"];
  return null;
}

function getPath(viewdef) {
  var table=getTable(viewdef);
  if (table === null) return null;
  return "db/"+table+"/";          
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

function calcTestRights(viewdefs) {
  var rights = {};
  for (var i = 0; i < viewdefs.length; i++) {
    rights[viewdefs[i].object] = {
      '10' : {
        'read' : 2,
        'create' : 2,
        'update': 2,
        'delete' : 2
      }
    };
  }
  return rights;
}

  /**
   * Translates user rights data into user rights object
   * @param data User rights array
   * @returns {object} User rights object
   */
function calcRights(data) {
  if (data === null || data === undefined) return null;
  var rights = {};
  for (var i = 0; i < data.length; i++) {
    var kind = data[i].kind;
    var access_restriction = data[i].access_restriction.toString();
    if (!_.has(rights, kind)) rights[kind] = {};
    if (!_.has(rights[kind], access_restriction)) {
      rights[kind][access_restriction] = data[i];
    } else {
      rights[kind][access_restriction].read =   Math.max(rights[kind][access_restriction].read,   data[i].read);
      rights[kind][access_restriction].create = Math.max(rights[kind][access_restriction].create, data[i].create);
      rights[kind][access_restriction].update = Math.max(rights[kind][access_restriction].update, data[i].update);
      rights[kind][access_restriction].delete = Math.max(rights[kind][access_restriction].delete, data[i].delete);
    }
  }
  return rights;
}

  /**
   * Checks if user has right to perfom specified action.
   * @param rights User rights object
   * @param kind Object kind
   * @param access_restriction Object access restriction
   * @param action Action
   * @returns {number} Returns action level for specified action
   */
function getActionLevel(rights, kind, access_restriction, action) {
  var objectAccess = parseInt(access_restriction);
  if (isNaN(objectAccess)) objectAccess = 0;

  if (rights === null || !_.has(rights, kind)) {
    // Special case: read-only access for all objects is always granted (in case of restricted objects the server is
    // filtering restricted content out):
    if (action === "read") return 2;
    return 0;
  }

  var keys = _.keys(rights[kind]);
  var selectedRightAccess = null;
  var actionLevel = 0;
  // Read access is always granted:
  if (action === "read") actionLevel = 2;
  for (var i = 0; i < keys.length; i++) {
    var rightAccess = parseInt(keys[i]);
    if (rightAccess >= objectAccess) {
      var rightActionLevel = parseInt(rights[kind][keys[i]][action]);
      if (!isNaN(rightActionLevel)) actionLevel = Math.max(actionLevel, rightActionLevel);
    }
  }
  return actionLevel;
}

  /**
   * Checks if user has right to perform specified action
   * @param kind Object kind
   * @param data Object data(should contin fields "owner" and "access_right").
   *    Can be null if the action is not for the specific object.
   * @param action Action
   * @returns {boolean} True if user has right to perform the action
   */
function isAccessRight(kind, data, action) {
  var access_right = (_.has(data, 'access_right') ? data.access_right : 0);
  var isOwner = false;
  if (_.has(data, 'owner')) {
    isOwner = (data.owner === globalState.userOrganizationCode);
  }
  var actionLevel = getActionLevel(globalState.rights, kind, access_right, action);
  return actionLevel >= 2 || (isOwner && actionLevel >= 1);
}

function canChangeOwner(kind, data) {
  var access_right = (_.has(data, 'access_right') ? data.access_right : 0);
  var actionLevel = getActionLevel(globalState.rights, kind, access_right, "update");
  return actionLevel >= 2;
}

function makeFilterFromRestriction(r,data,parent) {
  var pairs,keyvals,i,el,kval,dval,res=[];
  if (!r) return [];
  pairs=r.split("&");
  for (i=0; i<pairs.length; i++) {
    keyvals=pairs[i].split("=");
    if (!keyvals || keyvals.length!=2) continue;
    //if (keyvals[0]=="main_resource_id") continue;
    kval=keyvals[1];
    if (kval.charAt(0)=="{" && kval.charAt(kval.length-1)=="}" && data!=null) {
      kval=kval.substring(1);
      kval=kval.substring(0,kval.length-1);
      dval=data[kval];
    } else {
      dval=kval;
    }
    el=[keyvals[0],"=",dval];
    if (el[0]==="main_resource_id" && !el[2] && parent && parent.refkey===el[0] && parent.rowid) {
      el[2]=parent.rowid;
    }
    res.push(el);
  }
  return res;
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
    } else if (type=="array:linked_organization") {
      //debug("processReadRecord found organization list");
      conv=[];
      founddict={};
      for (j=0; j<val.length; j++) {
        el=val[j];        
        org=el;
        if (org.date_to) continue;  
        conv.push(org);
        /*
        if (org && !founddict[org.organization]) {
          founddict[org.organization]=org;
          conv.push(org);
        } 
        */         
      }      
    } else if (type=="array:linked_person") {
      //debug("processReadRecord found person list");
      conv=[];
      founddict={};
      for (j=0; j<val.length; j++) {
        el=val[j];   
        if (el.date_to) continue;          
        person=processReadRecordContactPerson(el,auxdata);
        if (person && !founddict[person.person]) {
          founddict[person.person]=person;
          conv.push(person);
        }  
      }
    } else {
      conv=data[key];
    }
    res[key]=conv;
  }
  return res;
}

function processReadRecordContactPerson(person,auxdata) {
  //debug("processReadRecordContactPerson");
  //debug(person);
  var name="",desc="",org="",res={}; 
  //if (person.date_to) return null;  
  if (person.organization) org=person.organization;  
  if (person.person) name=person.person;   
  if (person.description) desc=person.description;         
  if (person.occupation) desc=addPersonText(desc,"amet: "+person.occupation); 
  if (person.role) desc=addPersonText(desc,"roll: "+person.role);     
  if (person.type) desc=addPersonText(desc,"tüüp: "+person.type);   
  if (person.contact_level) desc=addPersonText(desc,"tase: "+person.contact_level);   
  res={person:name,description:desc,organization:org};  
  //debug(res);
  return res;  
  //return person;
}
  
function addPersonText(pre,add) {
  if (!add) return pre;
  if (!pre) return add.replace(/_/g," ");
  else return pre+"; "+add.replace(/_/g," ");
}

function processReadRecordForInfosystem(data,auxdata) {
  /*
  console.log("processReadRecordForInfosystem");
  console.log(data);
  console.log(auxdata);
  */
  if (!data || _.isEmpty(data) || _.isArray(data) || !(_.isObject(data))) return data; 
  //console.log("cp1");   
  if (!auxdata || _.isEmpty(auxdata) || !(_.isArray(auxdata)) || !(_.isObject(auxdata[0]))) return data; 
  data["infosystem"]="foo";
  //console.log("cp");
  data.infosystem=auxdata[0].name;
  return data;    
}

// ------------ auxiliary data ------------------

// determine aux data needed

function auxDataNeed(data,viewdef,currentAuxData) {
  var fields,part,i,j,keys,key,val,fld,type,subtype,subviewdef;
  if (!data) return null;
  fields=viewdef.fields;
  if (_.isArray(data)) {
    part=currentAuxData;
    for(i=0;i<data.length;i++) {      
      part=auxDataNeed(data[i],viewdef,part); 
    }
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
    return part;
  }
  return {};  
}

function auxDataNeedSingle(val,type,part) {
  if (val === undefined || val === null || val === "" || val === 0) return part;
  if (type=="ref:person") {
    if (!part.persons) part.persons=[val];
    else if (part.persons.indexOf(val)<0) part.persons.push(val);
  } else if (type=="ref:organization") {
    if (!part.organizations) part.organizations=[val];
    else if (part.organizations.indexOf(val)<0) part.organizations.push(val);        
  } else if (type=="ref:infosystem" ||  type=="ref:classifier" || type=="ref:service" || type=="ref:function") {
    if (!part.uris) part.uris=[val];
    else if (part.uris.indexOf(val)<0) part.uris.push(val);
  } else if (type == "id:infosystem") {
    if (!part.ids) part.ids = [val];
    else if (part.ids.indexOf(val) < 0) part.ids.push(val);  
  } else if (type == "ref:area") {
    if (!part.uris) part.uris = [val];
    else if (part.uris.indexOf(val) < 0) part.uris.push(val);
  }
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
    subtype=autoutils.arraySubtype(type); 
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

/* -------- modal confirmation and input and wizard -------- */

function modalGetValue(desc,callback) {
  $("#inputModalDescription").html(desc);
  $("#inputModal").on('hidden.bs.modal', function (e) {      
    $('#inputModal').unbind('hidden.bs.modal');    
    callback($("#inputModalInput").val());
  })
  $("#inputModalInput").val("");
  $("#inputModal").modal('show');
}

function modalConfirm(desc,callback) {
  $("#confirmModalDescription").html(desc);
  $("#confirmModal").on('hidden.bs.modal', function (e) {      
    $('#confirmModal').unbind('hidden.bs.modal');    
    callback($("#confirmModalInput").val());
  })
  $("#confirmModalInput").val("");
  $("#confirmModal").modal('show');
}

function modalWizard(rules,callback) {
  var show=makeWizardHtml(rules,{});
  $("#wizardModalDescription").html(show);
  $("#wizardModal").on('hidden.bs.modal', function (e) {      
    $('#wizardModal').unbind('hidden.bs.modal');    
    callback($("#wizardModalInput").val());
  })
  //$("#wizardModalInput").val("");
  $("#wizardModal").modal('show');
  makeWizardReact();
}

function makeWizardHtml(rules,prefill) {
  //console.log(rules);
  var html,case1,case2,v,v1,v2,tmp;
  if (prefill===null) {
    return null;
  }
  if (!rules || !_.isArray(rules)) {
    html="<div class='wizardinner'>";
    var txt="Jätkamiseks vajuta palun ok: ";
    txt+=" seepeale avatakse osaliselt eeltäidetud vorm, mille täitmist ";
    txt+=" tuleb jätkata. Kohustuslikud väljad on märgitud punase tärniga.";
    txt+=" Osaliselt täidetud vormi saad vahepeal salvestada.";   
    html+=autolang.trans(txt);
    //html+="<p>+"+JSON.stringify(prefill)+"<p>";
    case1='';    
    prefill.infosystem_status="asutamine_sisestamisel";
    $("#wizardModalInput").val(JSON.stringify(prefill));
    html+="<p><button onclick='"+case1+"' class='btn btn-primary btn-sm trans' ";
    html+=" data-dismiss='modal'>"
    html+=autolang.trans("ok")+"</button>";    
    html+="</div>";
  } else {  
    if (rules[3]) {
      prefill=JSON.parse(JSON.stringify(prefill));
      prefill=_.extend(prefill,rules[3]);
    }  
    html="<div class='wizardinner'>";
    html+=rules[0]+"<p>";
    //html+=JSON.stringify(prefill);
    if (rules[2]=="boolean") {
      v1=JSON.parse(JSON.stringify(prefill));
      v1[rules[1]]=true;
      v2=JSON.parse(JSON.stringify(prefill));
      v2[rules[1]]=false;
      case1='autoutils.replaceWizardHtml('+JSON.stringify(rules[4])+', ';
      case1+=JSON.stringify(v1)+')';
      case2='autoutils.replaceWizardHtml('+JSON.stringify(rules[5])+', ';
      case2+=JSON.stringify(v2)+')';
      html+="<button onclick='"+case1+"' class='btn btn-primary btn-sm trans'>";
      html+=autolang.trans("yes")+"</button>";
      html+=" ";
      html+="<button onclick='"+case2+"' class='btn btn-primary btn-sm trans'>";
      html+=autolang.trans("no")+"</button>";      
    } else if (rules[2] && rules[2].startsWith("ref:")) {
      v1=JSON.stringify(prefill);
      case1='autoutils.useWizardSelection('+JSON.stringify(rules[1])+', ';
      case1+=JSON.stringify(rules[4])+', ';
      case1+=v1+');';
      html+="<button onclick='"+case1+"' class='btn btn-primary btn-sm trans'>";
      html+=autolang.trans("ok")+"</button>";
      html+="<span id='wizardReactSwitch' style='display: none'>";
      html+=JSON.stringify([rules[1],rules[2]]);
      html+="</span>";
    } else {
      v1=JSON.stringify(prefill);
      case1='autoutils.replaceWizardHtml('+JSON.stringify(rules[4])+', ';
      tmp='autoutils.wizardGetValue('+v1+',"'+rules[1]+'")';
      case1=case1+tmp+");";
      html+="<input type='text' class='fldinput' name='"+rules[1]+"'";
      html+=" id='wizard_"+rules[1]+"' >";
      html+="<br><button onclick='"+case1+"' class='btn btn-primary btn-sm trans'>";
      html+=autolang.trans("ok")+"</button>";            
    }  
    html+="</div>";
  }  
  return html;
}


function tmptst(x) {
  console.log("tmptst");
  console.log(x);
}

function wizardGetValue(prefill,varname) {
  var tmp,v;
  v=JSON.parse(JSON.stringify(prefill));
  tmp=$("#wizard_"+varname).val();
  if (!tmp) {
    var err=autolang.trans("Please enter value");
    $("#wizardModalErr").html(err);
    return null;
  }  
  v[varname]=tmp;
  return v;
}

function replaceWizardHtml(rules,prefill) {
  var show=makeWizardHtml(rules,prefill);
  var err=autolang.trans("Please enter value");
  if (show!==null) {
    $("#wizardModalErr").html("");
    $("#wizardModalDescription").html(show);  
    makeWizardReact();
  } else {
    $("#wizardModalErr").html(err);
  }    
}

var wizardReactElement=null;

function makeWizardReact() {
  var inputs,viewname,fldname,viewdef;
  if (document.getElementById('wizardModalReact').innerHtml!=="" &&
      document.getElementById('wizardReactSwitch') &&
      $("#wizardReactSwitch").html()!=="") {
    inputs=$("#wizardReactSwitch").html();
    inputs=JSON.parse(inputs); 
    fldname=inputs[0];        
    viewname=inputs[1];
    if (!viewname || !viewname.startsWith("ref:")) return;
    viewname=viewname.substr(4);        
    console.log(fldname);
    console.log(viewname);
    if (wizardReactElement) {
      ReactDOM.unmountComponentAtNode(document.getElementById('wizardModalReact'));
      wizardReactElement=null;
    }          
    viewdef=_.findWhere(globalState.viewdefs, {"name":viewname});
    wizardReactElement=React.createElement(autoreact.AutoEditFldSearch,{
             handleChange:tmptst,             
             value:"",
             viewdef:viewdef,
             name:fldname, 
             "data-filter": "value",
             show: "searchfield",       
             searchValue:""});     
    ReactDOM.render(wizardReactElement, document.getElementById('wizardModalReact'));
  } else {
    if (wizardReactElement) {
      ReactDOM.unmountComponentAtNode(document.getElementById('wizardModalReact'));
      wizardReactElement=null;
    } 
  }    
}

function useWizardSelection(mainfld,next,vals) {
  var rfieldsel,tmp,v;
  rfieldsel="#wizardModalReact"+" input[name='"+mainfld+"']";
  tmp=$(rfieldsel).val();
  if (tmp) {
    $("#wizard_"+mainfld).val(tmp);
  }
  if (!tmp) {
    var err=autolang.trans("Please enter value");
    $("#wizardModalErr").html(err);
    return null;
  }  
  v=JSON.parse(JSON.stringify(vals));
  v[mainfld]=tmp;
  autoutils.replaceWizardHtml(next,v);
}


/* -------- import -------- */

function showImportModal() {
  $("#importModalOK").hide();
  $("#importModalImport").show();
  $("#importModalCancel").show();
  $("#importModalResult").html("");
  $("#importModalValue").val("");
  $("#importModalFile").val("");
  $('#importModal').modal('show');
}

function showImportModalResult(txt) {
  $("#importModalResult").html(txt);
  $("#importModalOK").show();
  $("#importModalImport").hide();
  $("#importModalCancel").hide();
}

function sendImportModal() {
  var val,parsed;
  val=$("#importModalValue").val();
  if (!val) {
    showImportModalResult(autolang.trans("Please select a proper file"));
    return;
  }
  try {
    parsed=JSON.parse(val);
  } catch (e) {
    showImportModalResult(autolang.trans("File does not contain correct json"));
    return;
  }  
  autoapi.postImport(parsed);
}

function importFileChange(e) {
  var input=e.target; 
  if (!input.files || input.files.length<1) return;
  var file = input.files[0];
  var filecontent="";        
  var reader = new FileReader();
  reader.onload = function(out){
    importFileChangeFinal(input,input.value,out.target.result);
  }    
  reader.readAsText(file);
}
  
function importFileChangeFinal(input,value,result) {
  $("#importModalValue").val(result);
  $("#importModalImport").show();
}  

/* ------- parse uri ------- */

// Based on parseUri 1.2.2 by
// (c) Steven Levithan <stevenlevithan.com>
// MIT License

exports.parseUri = function (str) {
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

exports.debug=debug;  
  
exports.getListLimit=getListLimit;
exports.getListValueLen=getListValueLen;
exports.getModalHelpLengthLimit=getModalHelpLengthLimit;

exports.userLoggedIn = userLoggedIn;
exports.userAllowedEdit = userAllowedEdit;
exports.userAllowedDelete = userAllowedDelete;
exports.userAllowedView = userAllowedView;
exports.userAllowedAdd = userAllowedAdd;
exports.userName = userName;
exports.userOrganizationName = userOrganizationName;
exports.userOrganizationCode = userOrganizationCode;
exports.userInfo = userInfo;

exports.makeFilterParams = makeFilterParams;
exports.getFilterData = getFilterData;
exports.makeSaveParams = makeSaveParams;
exports.getStateParamsFilter = getStateParamsFilter;
exports.formvalueToJson = formvalueToJson;
exports.localDateTimeISO = localDateTimeISO;
exports.formatDate = formatDate;
exports.formatDateEnd = formatDateEnd;
//exports.commonPrefix = commonPrefix;

exports.processReadRecord = processReadRecord;
exports.processReadRecordForInfosystem = processReadRecordForInfosystem;

exports.auxDataNeed = auxDataNeed;
exports.replaceWithAux = replaceWithAux;
exports.addToAux = addToAux;

exports.hasNegativeProperty = hasNegativeProperty;
exports.orderFields = orderFields;
exports.fieldShow = fieldShow;

exports.versionableViewdef = versionableViewdef;
exports.isRefType = isRefType;
exports.isArrayType = isArrayType;
exports.arraySubtype = arraySubtype;
exports.refSubtype = refSubtype;
exports.isSimpleType = isSimpleType;

exports.getTable = getTable;
exports.getPath = getPath;
exports.getLink = getLink;
exports.getLinkForUri = getLinkForUri;
exports.getKind = getKind;
exports.getAuthToken = getAuthToken;


exports.modalGetValue = modalGetValue;
exports.modalConfirm = modalConfirm;
exports.modalWizard = modalWizard;
exports.replaceWizardHtml = replaceWizardHtml;
exports.wizardGetValue = wizardGetValue;
exports.useWizardSelection = useWizardSelection;

exports.storeHistory = storeHistory;
exports.restoreHistory = restoreHistory;
exports.copyData = copyData;

exports.getViewdef = getViewdef;
exports.makeFilterFromRestriction = makeFilterFromRestriction;

exports.calcTestRights = calcTestRights;
exports.calcRights = calcRights;
exports.isAccessRight = isAccessRight;
exports.canChangeOwner = canChangeOwner;

// ====== module end ==========

})(typeof exports === 'undefined'? this.autoutils = {} : exports);


