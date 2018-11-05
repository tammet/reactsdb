/* 
 
 Autoreact form groups for viewing, editing and adding records

*/

import * as autoutils from './autoutils.js';
import * as autoformdata from './autoformdata.js';
import * as autolang from './autolang.js';
import * as autoapi from './autoapi.js';
import * as autoedit from './autoedit.js';

// ====== module start =========
  
// styling buttons etc, default bootstap

var primaryBtnClass = "btn btn-primary btn-sm";  

var alertClass = "alert autoalert";
var internalAlertClass = "alert autointernalalert";
var alertClassPrefix = "alert-";

// convenient shorthands

var ce = React.createElement; 
var trans = autolang.trans; 
var fldtrans = autolang.fldtrans;
var langelem = autolang.langelem;
  
// ===== react components ============  


// ---- common form group handling for view, edit, add record -----


class AutoFormGroupMenu extends React.Component{  

  constructor(props) {
    super(props);
    this.handleButton = this.handleButton.bind(this);  
  }
  handleButton(name,e) {
    e.preventDefault();
    this.props.callback({groupname:name});
  } 
  render() {   
    var viewdef=this.props.viewdef;
    if (!viewdef["groupMenu"]) return ce("span",{},"");
    var datarow=this.props.datarow;  
    var groups=getFormGroups(viewdef,this.props.op);
    //console.log("groups");
    //console.log(groups);
    if (!groups) return "";
    var group,grouplabel,groupclass,linkclass;
    var groupBlocks = [];
    for (var i=0; i<groups.length; i++) {
      group=groups[i];
      if (this.props.usedgroups && this.props.usedgroups.indexOf(group.name)<0) 
         continue;
      grouplabel=fieldLabel(group);
      if (this.props.groupname==group["name"]) {
        groupclass="nav-item";
        linkclass="nav-link active autotablink";
      }  else {
        groupclass="nav-item";
        linkclass="nav-link autotablink";
      }  
      groupBlocks.push(
        /*
        ce("button", {key:i+group["name"], className: "btn btn-default btn-sm",                      
                      onClick:this.handleButton.bind(this,group["name"])}, grouplabel)
        */ 
        ce("li", {key:autoutils.makeKey("groupmenu"+i), className: groupclass,                     
                      onClick:this.handleButton.bind(this,group["name"])}, 
          ce("a", {href: "#", className: linkclass,  role: "tab"}, grouplabel)
        )
      );    
    }
    if (viewdef["groupMenu"]=="left") groupclass="autoFormGroupLeftMenu";
    else groupclass="nav nav-tabs autoFormGroupMenuTabs";
    return (
      ce("ul",{className:groupclass, "role":"tablist"},
        groupBlocks
      )      
    );     
  }
};



class AutoHandleFormGroup extends React.Component{  
 
  constructor(props) {
    super(props);
    this.handleButton = this.handleButton.bind(this);  
    this.handleChange = this.handleChange.bind(this);  
  }
  handleButton(op) {
    this.props.callback({op:op,rowid:this.props.rowid});
  } 
  handleChange(op) {
    if (op)  this.props.callback(op);
    else this.props.callback({alert:false});
  }
  render() {
    var viewdef=this.props.viewdef;
    var group=this.props.group;
    var groupname=this.props.groupname;
    var op=this.props.op;      
    var datarow=this.props.datarow;         
    var fields=autoutils.orderFields(viewdef.fields);
    var field,val,grouplabel="",groupclass="",valueclass="",mustfill=false,fieldlabel="",autoid;   
    if (group) {
      var groupmenu=viewdef["groupMenu"];
      if (!groupmenu || groupmenu=="left") grouplabel=fieldLabel(group);
      else grouplabel=null;
      if (!groupmenu) 
        groupclass="autoviewgroup";
      else if ((groupmenu=="tabs" || groupmenu=="left") && groupname===group["name"]) 
        groupclass="autoviewsinglegroup";
      else 
        groupclass="autohidegroup";
    }
    var dataFields = []; 
    for (var i=0, field=""; i<fields.length; i++) {
      field=fields[i];
      if (group && group["name"] && group["name"]!==field["group"]) continue;
      if (group && !group["name"] && field["group"]) continue; 
      autoid="autoid-edit-"+field.name+"-"+i;      
      if (_.has(datarow,field.name)) val=datarow[field.name];   
      else val="";      
      if (val && val.length>100) valueclass="fldvalue fldvalue_large";
      else if (isComplexValue(val)) valueclass="fldvalue_complex";
      else valueclass="fldvalue";
      if (dataFields.length % 2 == 0) valueclass+=" evenvalue";
      else valueclass+=" oddvalue";  
      if (op==="view") {
        // view form, no edit
        if (!autoutils.fieldShow(field,"view")) continue;
        if (!this.props.viewallfields && 
            (val===null || val==="" || (_.isArray(val) && _.isEmpty(val)))) 
          continue;
        if (conditionalHideField(field,val,datarow)) {
          continue;
        }  
        if (field.viewClass) valueclass+=" "+field.viewClass;
        dataFields.push(
          ce("div",{key:autoutils.makeKey("group_vfld"+i), className: "row fldrow"},
            ce("div", {className: "col-md-4 fldlabel"}, fieldLabel(field)),
            ce("div", {className: "col-md-8 "+valueclass}, fieldValue(val,field,null,datarow, this.props.auxdata))
          )  
        );
      } else {   
        // edit form        
        if (this.props.rowid===null && !autoutils.fieldShow(field,"add")) continue;
        if (!autoutils.fieldShow(field,"edit")) {
          dataFields.push(
            ce(autoedit.AutoHiddenFld,{key:autoutils.makeKey("group_hiddenfld"+field.name+"_"+i),
                             name:field.name, rowid:this.props.rowid, value:val, 
                             viewdef:this.props.viewdef})
          ); 
        } else if (conditionalHideField(field,val,datarow)) {
          dataFields.push(
            ce(autoedit.AutoHiddenFld,{key:autoutils.makeKey("group_hiddenfld"+field.name+"_"+i),
                             name:field.name, rowid:this.props.rowid, value:val, 
                             viewdef:this.props.viewdef})
          );           
        } else if (autoutils.hasNegativeProperty(field,"edit")) {
          dataFields.push(
            ce("div",{key:autoutils.makeKey("group_hfld"+field.name+"_"+i), className: "row fldrow"},
              ce(autoedit.AutoHiddenFld,{name:field.name, rowid:this.props.rowid, value:val, 
                               viewdef:this.props.viewdef}),              
              ce("div", {className: "col-md-4 fldlabel"}, fieldLabel(field)),
              ce("div", {className: "col-md-8 "+"fldvalue"}, fieldValue(val,field, null, datarow, this.props.auxdata))
            )  
          );                                          
        } else {
          fieldlabel=fieldLabel(field);
          if (_.has(field,"mustFill") && field["mustFill"]) {
            fieldlabel=ce("span",{},fieldlabel,ce("span",{className: "mustFill"},"*"));
          } 
          dataFields.push(
            ce("div",{key:autoutils.makeKey("group_efld"+i), className: "row fldrow"},                                                                      
              ce("div", {className: "col-md-4 fldlabel"}, 
                ce("label",{className: "fldlabel", htmlFor: autoid},fieldlabel) ),                     
              ce("div", {className: "col-md-8 fldinputcol"}, 
                ce(autoedit.AutoEditFld, {name:field.name, rowid:this.props.rowid, value:val,
                                 auxdata:this.props.auxdata, fieldlabel:fieldlabel, 
                                 autoid:autoid, parent:this.props.parent,
                                 viewdef:this.props.viewdef, callback:this.handleChange, datarow: this.props.datarow})
              )                        
              /*
              ce("div", {className: "col-md-4 fldlabel"}, fieldlabel),
              ce("div", {className: "col-md-8 fldinputcol"}, 
                ce(autoedit.AutoEditFld, {name:field.name, rowid:this.props.rowid, value:val,
                                 auxdata:this.props.auxdata, fieldlabel:fieldlabel,                 
                                 viewdef:this.props.viewdef, callback:this.handleChange, datarow: this.props.datarow})
              )
              */
            )              
          );                       
        }
      }  
    }    
    if (_.isEmpty(dataFields)) return null; 
    return (
      ce("div",{className:groupclass},
        ((grouplabel) ?  ce("div", {className: "autoviewgrouplabel"}, grouplabel) : ""),         
        ce("div", {className:((op==="view") ? "viewtable" : "edittable")},          
            dataFields          
        )          
      )  
    );                              
  }
};

  
/* ====== small utilities ====== */

function getFormGroups(viewdef,op) {
  var groups=[];  
  if (!viewdef) return null;
  if (_.has(viewdef,"groups")) 
    groups=viewdef.groups;
  else
    // create groups if not given in viewdef
    _.each(viewdef.fields, function(x) {
      if (_.has(x,"group") && _.every(groups, function(y) {return y["name"]!==x["group"]})) 
        groups.push({"name":x["group"]}); 
    });
  // remove empty groups, ie containing only non-shown elems
  groups=_.filter(groups,function(group) {
    return  _.some(viewdef.fields,function(field) {
      return (field["group"] && field["group"]===group["name"] && autoutils.fieldShow(field,op));
    });    
  });
  if (groups.length==0) return null;
  else return groups;     
}


function fieldLabel(field) {
  if (!field) return "";
  if (_.has(field,"label")) return langelem(field["label"]);
  else return fldtrans(field["name"]);
}

function conditionalHideField(field,val,datarow) {  
  var cond,i,keys,key,keyval;
  if (val!=null && val!=[] && val!={} && val!="") return false;
  cond=field.showOnlyWhen;
  if (!cond || _.isEmpty(cond)) return false;
  if (!datarow) return true;
  keys=_.keys(cond);
  for (i=0; i<keys.length; i++) {
    key=keys[i];
    keyval=cond[key];
    // just a fix for viewdef string rep
    if (keyval==="true") keyval=true;
    else if (keyval==="false") keyval=false;
    if (_.isArray(keyval)) {
      for (var i = 0; i < keyval.length; i++) {
        if (keyval[i]==datarow[key]) return false;
      }
      return true;
    } else {
      if (keyval!=datarow[key]) return true;
    }
  }
  return false;
}

// showcontext and datarow are normally missing

function fieldValue(val,fld,showcontext,datarow, auxdata) {
  var tmp,i,j,fldtype,keys,values;
  
  if (_.isBoolean(val)) {
    if (val) tmp="yes";
    else tmp="no";
    return trans(tmp);
  } else if (val===null || val===undefined) {
    return "";
  }  
  if (_.has(fld,"type")) fldtype=fld.type;
  else fldtype="string"; 
  if (fldtype==="date") {
    val=autoutils.dateToLocal(val); 
    //datestr=new Date().toJSON().slice(0,10);
    //console.log("datestr "+datestr);
    //if (val && val.startsWith(datestr)) val=val.slice(10);
    return String(val);
  } else if (fldtype==="datetime" || fldtype==="timestamp") {
    return autoformdata.formatDate(String(val));    
  } else if (fldtype==="json") {
    val=JSON.stringify(val);
    //val=autoutils.htmlEscape(val);
    return val;    
  } else if (fldtype==="base64" && fld["name"]=="content") {
    // file content
    if (!val) return "";
    if (datarow && datarow["document_id"]) {
      if (!datarow["mime"]) return "";
      val=makeDocumentUrl(datarow["document_id"],val);
      var filename;
      if (datarow["filename"]) filename=datarow["filename"];
      else filename="";
      return (
        ce("div",{},
          ce("a",{href:val, target:"autoreact_external", className: primaryBtnClass}, 
                trans("Open document")),
          ce("span",{className:"filename"}," "+filename)
        )
      );      
    } else return val;
  } else if (_.isArray(val)) {
    if (val.length==0) return [];
    else if (_.isString(val[0])) {
      /*
      tmp="";
      _.each(_.initial(val),function(x) {tmp=tmp+fieldValue(x,null)+", "});
      tmp=tmp+fieldValue(_.last(val),null);
      */
      tmp=getShownListValue(val,fld,fldtype, auxdata);
      return tmp;
    } else if (_.isObject(val[0]) && !_.isArray(val[0])) {
      tmp=getShownComplexValue(val,fldtype, auxdata);
      return tmp;   
    } else {                  
      return String(val);
    }
  } else if (_.has(fld,"values")) {
    values=fld.values;    
    if (_.isArray(values) && values.length>0 && _.isArray(values[0])) {
      val=getShownOptionValue(val,values);  
      return String(val);         
    } else {
      return String(val);
    }
  } else if (_.isString(val) && 
             showcontext!=="list" &&
             (val.startsWith("http://") || val.startsWith("https://"))) {
    return ce("a", {href: val, target:"autoreact_external"}, val);
  } else if (autoutils.isSearchType(fldtype)) {
    return ce(ShowRefField, {type: fldtype, auxdata: auxdata}, val);
  } else {
    return String(val);
  }  
}


class ShowRefField extends React.Component{  

  render() {
    var uriValue = String(this.props.children);
    var link = autoutils.getLinkForUri(uriValue);
    var value = uriValue;
    if (link !== null) return ce(AutoLink, {href: link}, value);
    return ce("span", {}, String(value));
  }
};


class AutoLink extends React.Component{  
  
  render() {
    // TODO: Replace with inner navigation?
    //return ce("a", {href: this.props.href, target: "external"}, this.props.children);
    return ce("span", {}, this.props.children);
  }
};

function makeDocumentUrl(id,val) {
  var url; // "http://xxxx/rest/api/file/yyy?token=testToken";
  url=autoapi.getApiUrl()+"/file/"+String(id)+"?token="+autoutils.getAuthToken();
  return url;
}


function getShownListValue(val,fld,fldtype, auxdata) {
  var i,j,s,row,mapping,valel,rows=[];    
  mapping=fld.values;
  if (!mapping) mapping=[];
  for(i=0;i<val.length;i++) {    
    valel=val[i];
    for(j=0; j<mapping.length; j++) {
      if (mapping[j] && mapping[j][0]==valel) {
        valel=mapping[j][1];
        break;
      }
    }
    s=String(valel);
    var itemType = fldtype;
    if (autoutils.isArrayType(fldtype)) itemType = autoutils.arraySubtype(fldtype);
    if (autoutils.isSearchType(itemType)) s = ce(ShowRefField, {type: itemType, auxdata: auxdata}, s);
    row=ce("div",{key:autoutils.makeKey("slvalue"+i), className: "autoSimpleArrayRowView"},         
          ce("div",{className: "autoSimpleArrayValueView"}, s)                  
    );               
    rows.push(row);     
  }    
  return ( 
    ce("div",{className: "autoInnerViewArray"}, rows)
  );   
} 

function getShownOptionValue(val,values) {
  var sval=null;
  if (_.isNumber(val)) sval=val.toString();
  for (var i=0; i<values.length; i++) {
    if (_.isArray(values[i]) && (val===values[i][0] || (sval && sval===values[i][0]))) { 
      val=values[i][1]; 
      break;
    }
  }
  return val;
}

function isComplexValue(val) {
  if (!val || !_.isArray(val)) return false;
  if (val.length>0 && _.isObject(val[0])) return true;
  return false;
}

function getShownComplexValue(val,fldtype, auxdata) {
  var i,j,valel,keys,key,fldvalue,editfld,viewdef,label,tmp=[],outerrows=[];
  var arraysubtype,subviewdef,subflds,subfld;
  arraysubtype=autoutils.arraySubtype(fldtype);
  subviewdef=getSubtypeViewdef(arraysubtype,val);
  if (subviewdef) subflds=autoutils.orderFields(subviewdef["fields"]);  
  var i,j,keys,tmp=[];
  for(i=0;i<val.length;i++) {
    keys=_.keys(val[i]);
    keys=sortSubObjectKeys(keys,subflds);
    for(j=0; j<keys.length; j++) {
      subfld=_.findWhere(subflds, {name:keys[j]});            
      if (subfld) label=fieldLabel(subfld);
      else label=fldtrans(fieldValue(keys[j],null));    
      tmp.push(
        ce("tr",{key:autoutils.makeKey("scomp_tr"+i*1000+j+String(keys[j]))},
          ce("td",{className: "autoValTableKey"}, label),
          ce("td",{className: "autoValTableVal"},
                   //fieldValue(val[i][keys[j]],null))
                   fieldValue(val[i][keys[j]],subfld, null, null, auxdata))
        )
      );   
    }
    if (i<val.length-1) {
      tmp.push(
        ce("tr",{key:autoutils.makeKey("scomp_tr_val"+i*1000+j+String(keys[j])), className: "autoValTableSep"},
          ce("td",{className: "autoValTableSep autoValTableKey"}, " "),
          ce("td",{className: "autoValTableSep autoValTableVal"}, " ")
        )
      );   
    }      
  }
  return (
    ce("div",{className: "inlineblock"}, 
      ce("table",{className: "autoValTable"}, ce("tbody",{}, tmp)) 
    )    
  ); 
} 

function sortSubObjectKeys(keys,subflds) {
  var i,fld,sorted=[];
  //autoutils.debug("sortSubObjectKeys");
  if (!keys || _.isEmpty(keys)) return keys;
  if (!subflds || _.isEmpty(subflds)) {
    keys.sort();
    return keys;
  }    
  for(i=0;i<subflds.length;i++) {
    fld=subflds[i];
    if (keys.indexOf(fld.name)>=0) sorted.push(fld.name);
  }
  if (sorted.length==keys.length) return sorted;
  for(i=0;i<keys.length;i++) {
    if (sorted.indexOf(keys[i])<0) sorted.push(keys[i]);
  }
  return sorted;
}


// ====== exported functions =========


export { 
  AutoFormGroupMenu,
  AutoHandleFormGroup,

  fieldLabel,
  fieldValue,
  getFormGroups,
  conditionalHideField,

  alertClass,
  internalAlertClass,
  alertClassPrefix
}
