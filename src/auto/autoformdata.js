/* 
 
 Autoreact form data handling: getting from form and converting

*/
  

import * as autoutils from './autoutils.js';


// ====== module start =========

// ====== exported functions =========
  
function makeFilterParams(ctxt,op,viewdef) { 
  //debug("makeFilterParams");
  var i=0,input,name,type,value,cond,deffields,field,fields=[],key,date,fieldtype;
  var args={},filter=[], kind, token;
  var valueInputs=$.find("[data-filter='value']");  
  var minvalueInputs=$.find("[data-filter='minvalue']");  
  var maxvalueInputs=$.find("[data-filter='maxvalue']");
  args={"op":"get","path": autoutils.getPath(viewdef)};
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
  token=autoutils.getAuthToken();
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
  autoutils.debug("makeSaveParams");
  //debug("parent:");
  //debug(parent);
  var args={},save=[];
  var emptyInputs=$.find("[data-save='empty']");
  var valueInputs=$.find("[data-save='value']");
  var table="infosystem";      
  args={"op":"get","path": autoutils.getPath(viewdef)};
  token=autoutils.getAuthToken();
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
    //console.log(name);
    if (name.indexOf(".")>0) continue; 
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
    key=keys[i];
    save[key]=complexes[key];
  }
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


function makeFilterFromRestriction(r,data) {
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
    res.push(el);
  }
  return res;
}




// ====== exported functions =========

export {

  makeFilterParams,
  getFilterData,
  makeSaveParams,
  getStateParamsFilter,
  formvalueToJson,
  formatDate,
  makeFilterFromRestriction
  
};
  
