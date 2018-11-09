/* 
 
 Autoreact edit/add form

*/

import * as autoutils from './autoutils.js';
import * as autoformdata from './autoformdata.js';
import * as automodals from './automodals.js';
import * as autolang from './autolang.js';
import * as automain from './automain.js';
import * as autocomp from './autocomp.js';
import * as autoform from './autoform.js';
import * as autofldsrch from './autofldsrch.js';
import * as autofldcmplx from './autofldcmplx.js';

// ====== module start =========
  
// styling buttons etc, default bootstap

var defaultBtnClass = "btn btn-default btn-sm"; 
var primaryBtnClass = "btn btn-primary btn-sm";  
var helpBtnClass = "btn btn-default help";

// styling tooltip help for hover and click, default autoreact css
  
var shownTipClass = "showntip";
var hiddenTipClass = "hiddentip";  

// for help modal, if helptype set to "modal"
  
var helpModalContentId = "helpcontents"; // inset help text here
var helpModalId = "helpModal"; // show this

// convenient shorthands

var ce = React.createElement; 
var trans = autolang.trans; 
var langelem = autolang.langelem;
  
// ===== react components ============  

class AutoEdit extends React.Component{  

  constructor(props) {
    super(props);
    this.handleButton = this.handleButton.bind(this);  
    this.handleFormGroupButton = this.handleFormGroupButton.bind(this);  
  }
  handleButton(statechange) {
    this.props.callback(statechange);
  } 
  handleFormGroupButton(statechange) {    
    this.props.callback({rowid:this.props.rowid, groupname:statechange["groupname"]});
  }        
  render() {
    var viewdef=this.props.viewdef;
    var datarow=this.props.datarow;     
    var groups=autoform.getFormGroups(viewdef,this.props.op);    
    var groupBlocks = [];
    if (!groups) groupBlocks.push(
          ce(autoform.AutoHandleFormGroup, {key:autoutils.makeKey("group_edit"), 
                             datarow: datarow, auxdata:this.props.auxdata,
                             viewdef: viewdef, op:this.props.op,
                             group: null, groupname: null,
                             parent:this.props.parent,
                             rowid: this.props.rowid, callback:this.props.callback})
        );
    else                            
      for (var i=0; i<groups.length; i++) {
        groupBlocks.push(
          ce(autoform.AutoHandleFormGroup, {key:autoutils.makeKey("group_edit"+i), 
                             datarow: datarow, auxdata:this.props.auxdata,
                             viewdef: viewdef, op:this.props.op,
                             group: groups[i], groupname: this.props.groupname,
                             parent:this.props.parent,
                             rowid: this.props.rowid, callback:this.props.callback})
        );    
      }
    return (
      ce("div",{className: "autoviewgroups"},       
        ce(automain.AutoAlertMessage,{alert:this.props.alert, alertmessage: this.props.alertmessage, internal:true}),
        ce(AutoEditButtons, {viewdef:this.props.viewdef, rowid:this.props.rowid, callback: this.handleButton}),
        ((groups && viewdef["groupMenu"]!=="left") ? 
          ce(autoform.AutoFormGroupMenu, {viewdef:this.props.viewdef, groupname:this.props.groupname,op:this.props.op,
                            callback: this.handleFormGroupButton}) 
           : 
           ""
        ),
        groupBlocks
      )  
    );  
  }
};


class AutoEditButtons extends React.Component{  

  constructor(props) {
    super(props);
    this.handleSave= this.handleSave.bind(this);  
    this.handleCancel = this.handleCancel.bind(this);  
  }
  handleSave(e) {
    e.preventDefault();    
    autoutils.removeAlert();
    this.props.callback({action:"save",rowid:this.props.rowid});
    return false;
  }
  handleCancel(e) { 
    e.preventDefault(); 
    autoutils.removeAlert();
    if (this.props.rowid===null) this.props.callback({op:"list", action:"fresh", alert:false});
    else this.props.callback({op:"view", alert:false});
    return false;
  }
  render() {    
    if (autoutils.hasNegativeProperty(this.props.viewdef,"edit")) {
      return ce("div",{},"");
    } else {
      return (      
        ce("div", {className:"autoButtons"}, 
          ce("button", {className: primaryBtnClass, onClick:this.handleSave, type: "submit"}, trans("Save")),
          ce("button", {className: defaultBtnClass, onClick:this.handleCancel, type: "button"}, trans("Cancel"))
        )
      );
    }
  }
};


class AutoEditFld extends React.Component{  

  constructor(props) {
    super(props);
    //console.log("this.props.value:",this.props.value);
    this.state = {value:this.props.value}; //, searchValue: "", dynoptions:null};
    this.handleChange = this.handleChange.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
    this.handleMultipleChange = this.handleMultipleChange.bind(this);
    this.handleComplexChange = this.handleComplexChange.bind(this);
  }
  handleChange(e) {  
    //autoutils.debug("handleChange");    
    var thisfld,fld,val,i,found,flddata;
    var input=e.target; 
    autoutils.removeAlert();
    
    //autoutils.debug("field changed to "+input.value);
    // check if the changed field is a condition in some showOnlyWhen condition
    // if yes, callback to redraw the whole resource
    if (!this.props.complexCallback && this.props.viewdef) {
      thisfld=_.findWhere(this.props.viewdef.fields, {name:this.props.name});
      found=false;
      // TODO:  why it is not good idea to always change the global state:
      /*for(i=0; i<this.props.viewdef.fields.length; i++) {
        fld=this.props.viewdef.fields[i];
        if (!fld.showOnlyWhen) continue;
        if (_.has(fld.showOnlyWhen,this.props.name)) { 
          val=autoformdata.formvalueToJson(input.value,thisfld.type);    
          this.props.callback({"action":"redraw","setFieldKey":thisfld.name, 
                             "setFieldValue":val, "alert": false});
          break; 
        }        
      }*/
      val=autoformdata.formvalueToJson(input.value,thisfld.type);
      this.props.callback({"action":"redraw","setFieldKey":thisfld.name,
        "setFieldValue":val, "alert": false});
    }
    // change visible field locally
    if (input.getAttribute("data-type")==="json") {
      this.setState({value:input.value});
      /*
      var tmp;
      try {
        tmp=JSON.parse(input.value);
      } catch (err) {
        tmp=input.value;
      }  
      this.setState({value:tmp});
      */
    } else {
      this.setState({value:input.value});
    }  
    // if field is a part of a complex value
    if (this.props.complexCallback) this.props.complexCallback(input.value);      
  }
  handleFileChange(e) { 
    autoutils.removeAlert();
    var input=e.target; 
    if (!input.files || input.files.length<1) return;
    var file = input.files[0];
    var filecontent="";        
    var reader = new FileReader();
    var parentThis = this;
    reader.onload = function(out){
      parentThis.handleFileChangeFinal(input,input.value,out.target.result);
    }    
    reader.readAsDataURL(file);
    this.setState({value:e.target.value});   
  }
  handleFileChangeFinal(widget,fname,fcontent) {
    widget.setAttribute("data-filecontent",fcontent);    
  }
  handleMultipleChange(e) {
    autoutils.debug("handleMultipleChange called");
    autoutils.removeAlert();
    var options = e.target.options;
    var value = [];
    for (var i=0; i<options.length; i++) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
    autoutils.debug(options);
    autoutils.debug(value);
    this.setState({value:value});
  }
  handleComplexChange(e) {
    var name=this.props.name;    
    this.setState({value:e});
    if (this.props.complexCallback) this.props.complexCallback(e.target.value); 
  }
  componentWillMount() {
    if (this.props.viewdef) {
      var fld=_.findWhere(this.props.viewdef.fields, {name:this.props.name});    
      if (fld && fld["type"]==="date") {
        if (this.props.autoid) this.setState({id: this.props.autoid}); 
        else this.setState({id: autoutils.makeUniqueKey("autocmp-")});    
      }  
    }  
  }
  componentDidMount() {
    if (this.props.viewdef) {
      var fld=_.findWhere(this.props.viewdef.fields, {name:this.props.name});
      if (fld && fld["type"]==="date") autoutils.setupDatePicker(this);
    }    
  }
  render() { 
    var fld,pre;
    var name=this.props.name;
    var autoid=this.props.autoid;
    if (this.props.viewdef) fld=_.findWhere(this.props.viewdef.fields, {name:this.props.name});
    var value=this.state.value;
    var fldtype,widget,cssclass,raw;
    if (_.has(fld,"type")) fldtype=fld.type;
    else fldtype="string";
    if (_.has(fld,"editWidget")) widget=fld.editWidget;
    else widget="input";
    if (_.has(fld,"editClass")) cssclass=fld.editClass;
    else cssclass="fldinput";
    if (widget=="input" && value && value.length>35) {
      cssclass="fldinput_large";
      if (value.length>80) {
        widget="textarea";
        if (value.length>400) cssclass="fldinput_textarea_400";
        else if (value.length>200) cssclass="fldinput_textarea_200";
      }  
    }  
    var raw;
    var arraysubtype=autoutils.arraySubtype(fldtype);
    var params={value: value, name:name, datatype: fldtype, field:fld, 
                parentName: this.props.parentName, arrayIndex:this.props.arrayIndex,  
                callback:this.handleChange};                    
    if (fld && fld["mustFill"]===true) params["data-mustfill"]="true";
    if (_.has(fld, "editWidget") && _.has(autocomp, fld.editWidget)) {
      // Custom widget:
      params["auxdata"] = this.props.auxdata;
      params["viewdef"] = this.props.viewdef;
      params["datarow"] = this.props.datarow;
      if (autoid) params.id = autoid;
      raw=ce(autocomp[fld.editWidget], params);
    } else if (_.has(fld,"edit") && !fld.edit) {
      raw=ce("span", {className: "fldvalue"}, value);     
    } else if (fldtype=="date") {   
      var html="<input type='text' class='fldinput_date' data-save='value' size='10' data-date-format='dd.mm.yyyy'";
      if (value) html+=" value='"+autoutils.dateToLocal(value)+"' ";      
      if (this.props.parentName) html+=" data-parentname='"+this.props.parentName+"' ";
      if (this.props.arrayIndex || this.props.arrayIndex===0) html+=" data-arrayindex='"+this.props.arrayIndex+"' ";
      html+=" data-type='date' ";
      if (fld["mustFill"]===true) html+=" data-mustfill='true' "; 
      //if (value) html+=" value='"+value+"' ";   
      html+=" id='"+this.state.id+"' name='"+name+"'></input>"     
      raw=ce("div", {dangerouslySetInnerHTML: {__html:html}});      
    } else if (fldtype=="boolean") {
      if (autoid) params.autoid = autoid;        
      raw=ce(AutoEditFldBoolean, params);
    } else if ((autoutils.isArrayType(fldtype) && arraysubtype=="string") &&
                (!_.has(fld,"values") || !fld["values"]) ) {
      // array of strings
      params["datatype"]="array:string";                  
      params["callback"]=this.handleComplexChange; 
      params["auxdata"]=this.props.auxdata;
      if (autoid) params.autoid = autoid;                  
      raw=ce(AutoEditFldStringArray, params);                          
    } else if ((autoutils.isArrayType(fldtype) && arraysubtype=="string") &&
                (_.has(fld,"values") && fld["values"] && _.isArray(fld["values"])) ) {
      // multiple select
      params["datatype"]="array:string";
      params["callback"]=this.handleMultipleChange;
      if (autoid) params.autoid = autoid;                  
      raw=ce(AutoEditFldMultiple, params);  
    } else if (!autoutils.isArrayType(fldtype) && 
               _.has(fld,"values") && fld["values"] && _.isArray(fld["values"]) ) {
      // single select
      if (autoid) params.autoid = autoid;                 
      raw=ce(AutoEditFldOption, params); 
    } else if (autoutils.isArrayType(fldtype) && autoutils.isRefType(arraysubtype)) {
      // array of references
      params["datatype"]="array:string";
      params["callback"]=this.handleComplexChange;
      params["auxdata"]=this.props.auxdata;
      if (autoid) params.autoid = autoid;
      raw=ce(AutoEditFldStringArray, params);                 
    } else if ((autoutils.isArrayType(fldtype) && arraysubtype) ||
               (value && _.isArray(value) && value[0] && _.isObject(value[0]) && !_.isArray(value[0])) ) {
      // complex: array of objects
      params["callback"] = this.handleComplexChange;
      params["auxdata"] = this.props.auxdata;
      if (autoid) params.autoid = autoid;
      raw = ce(autofldcmplx.AutoEditFldComplex, params);
      // TODO: FIX THIS!
    /*} else if ((!autoutils.isArrayType(fldtype) && !autoutils.isSimpleType(fldtype))) {
      // complex: one object
      params["callback"] = this.handleComplexChange;
      params['single'] = true;
      raw = ce(autofldcmplxx.AutoEditFldComplex, params);*/
    } else if (fldtype==="base64") {
      var widgetparams={type:"file", className:'btn btn-default btn-xsm', 
                        //value: filename,
                        name:name, "data-type": "base64", "data-encoding": "base64",                               
                       "data-save":'value', "autoComplete":"off", onChange:this.handleFileChange};
      if (autoid) widgetparams.id = autoid;                       
      raw=ce("input", widgetparams); 
    } else if (autoutils.isSearchType(fldtype)) {
      raw=ce(autofldsrch.AutoEditFldSearch,{
             //handleChange:this.handleChange,
             value: autoutils.origRawValue(this.props.name,this.props.datarow), //this.props.value
             viewdef:this.props.viewdef,
             name:this.props.name,
             parentName:this.props.parentName,
             arrayIndex:this.props.arrayIndex,
             complexCallback: this.props.complexCallback,  
             searchValue: this.props.value,//this.state.searchValue,
             datarow: this.props.datarow,
             autoid: autoid, 
             parent: this.props.parent,
             auxdata: this.props.auxdata}
      );             
    } else { 
      // default case
      if (fldtype==="json") {
        if (value===null) value="";
        else value=value; //JSON.stringify(value);
        widget="textarea";        
      }  
      var widgetparams={type:"text", className:cssclass, name:name, value:value, "data-type": fldtype,                               
                       "data-save":'value', onChange:this.handleChange};
      //console.log("widgetparams1:",widgetparams);
      if (autoid) widgetparams.id=autoid;                       
      if (fldtype==="json") widgetparams["data-encoding"]="json";                
      if (widgetparams.value===null) widgetparams.value="";                       
      if (fld && fld["mustFill"]===true) widgetparams["data-mustfill"]="true";                       
      if (this.props.parentName) widgetparams["data-parentname"]=this.props.parentName;
      if (this.props.arrayIndex || this.props.arrayIndex===0) widgetparams["data-arrayindex"]=this.props.arrayIndex;                
      if (this.props.id) widgetparams["id"]=this.props.id;                       
      if (this.props.className) widgetparams["className"]=this.props.className;
      if (widget==="url") widget="input";
      //console.log("widget:",widget);
      //console.log("widgetparams2:",widgetparams);
      raw=ce(widget, widgetparams);                            
    }       
    // finally, embed the field (regardless of type) into help
    if (_.has(fld,"help")) {
      raw=ce(AutoEditFldHelp, 
             {viewdef:this.props.viewdef, field:fld, name:name, raw:raw, fieldlabel:this.props.fieldlabel});
    }
    return raw;
  }  
};


class AutoEditFldStringArray extends React.Component{  

  constructor(props) {
    super(props);
    this.state = {value:this.props.value};
    this.handleAdd = this.handleAdd.bind(this);
    this.handleDelete = this.handleDelete.bind(this);   
  }
  handleAdd(e) {  
    var id="#"+this.props.name+"__addelfld";
    var av=$(id).val();
    var nv;
    if (!av) return;
    if (!this.state.value) nv=[av];    
    else nv=this.state.value.concat(av);    
    this.setState({value:nv});
  }
  handleDelete(i,e) {
    var v=this.state.value, nv=[];
    for(var j=0; j<v.length; j++) {
      if (j!==i) nv.push(v[j]);
    }    
    this.setState({value:nv});
  } 
  handleHiddenChange(e) {
  }
  render() {
    var value=this.state.value;      
    var val=value, rows=[], row, i, modval;      
    var fld=this.props.field;
    var arraysubtype=autoutils.arraySubtype(fld.type);
    var isSearchSubtype = autoutils.isSearchType(arraysubtype);
    if (val) {    
      for(i=0;i<val.length;i++) {
        modval=val[i];
        if (_.isObject(modval)) continue;
        row=ce("div",{key:autoutils.makeKey("complex_carr"+i), className: "autoSimpleArrayRow"},         
              ce("div",{className: "autoSimpleArrayValue"}, modval),
              ce("div",{className: "inlineblock"},
                ce("button",{type: "button", className: "btn btn-default btn-xs  autoSimpleArrayBtn",
                              "aria-label": "delete", onClick: this.handleDelete.bind(this,i)},
                  ce("span", {className:"glyphicon glyphicon-remove lightGlyphicon", "aria-hidden":"true"})
                )             
              )
        );               
        rows.push(row);      
      }
    }      
    var enterblock;
    if (isSearchSubtype) {
      enterblock=ce(autofldsrch.AutoEditFldSearch,{           
             value:"",
             fldtype:arraysubtype,
             id: this.props.name+"__addelfld",
             nosave: true,
             name:this.props.name,
             auxdata: this.props.auxdata
      }
      );             
    } else {
      enterblock=ce(AutoEditFld, {key: autoutils.makeKey("complex_rowx"),
                     value:"",
                     id: this.props.name+"__addelfld"}
      );
    }        
    row=ce("div",{key:autoutils.makeKey("complex_carr"), className: "autoSimpleArrayRow"},
            ce("input", {type:"text", className: "hiddenfld",
                        name:this.props.name, value:this.state.value, 
                        "data-type":"array:string", "data-save":'value',                      
                        onChange:this.handleHiddenChange}
            ),                                    
            enterblock,                 
            ce("button",{className: "btn btn-default btn-sm  autoSimpleArrayBtn", 
                         onClick: this.handleAdd},
                trans("add"))                                        
          );    
    rows.push(row);
    return (
     ce("div",{className: "autoInnerEditArray"}, rows)
    );      
    
  }  
};


class AutoEditFldBoolean extends React.Component{  

  render() {
    var properties={value: this.props.value, name:this.props.name, "data-type":"boolean", "data-save":'value',
                   onChange:this.props.callback, className: "autoSelect"};
    if (this.props.filtertype) properties["data-filter"]=this.props.filtertype;
    if (this.props.name) properties["name"]=this.props.name;
    if (this.props.parentName) properties["data-parentname"]=this.props.parentName;
    if (this.props.autoid) properties["id"]=this.props.autoid;                   
    if (this.props.arrayIndex || this.props.arrayIndex===0) properties["data-arrayindex"]=this.props.arrayIndex; 
    if (properties.value===null) properties.value="";
    return (
      ce("select", properties,
        ce("option",{value:""},""),
        ce("option",{value:true},trans("true")),
        ce("option",{value:false},trans("false"))
      ) 
    );      
  }  
};


class AutoEditFldOption extends React.Component{  

  render() {
    var values=this.props.field["values"];
    var options = [], ovalue="", svalue="", found=false, i=0, altvalue=null;
    if (_.isNumber(this.props.value)) altvalue=this.props.value.toString();    
    if (this.props.filtertype) {
      if (values && values[0][0]) {
        options.push(ce("option",{key:autoutils.makeKey("option"), value:""},""));
      }
    }
    for (i=0; i<values.length; i++) {
      ovalue=values[i];
      if (_.isArray(ovalue)) {                  
        svalue=langelem(_.rest(ovalue));
        ovalue=ovalue[0];
      } else {  
        svalue=ovalue;
      }   
      if (ovalue===this.props.value || (altvalue && ovalue===altvalue)) found=true; // initial value was found in list
      options.push(ce("option",{key:autoutils.makeKey("option_el"+ovalue+"_"+i), value:ovalue},svalue));
    }
    if (this.props.rowid!==null && !found) {
      // original value in edit not given in values list in viewdef: add as the first element
      options.unshift(ce("option",{key:autoutils.makeKey("option_extra"), 
                                value:this.props.value},this.props.value));     
    }        
    var properties={onChange:this.props.callback, name:this.props.name, defaultValue:this.props.value, 
                "data-save":'value', "data-type": this.props.datatype,
                className: "autoSelect"};
    if (this.props.filtertype) properties["data-filter"]=this.props.filtertype;            
    if (this.props.parentName) properties["data-parentname"]=this.props.parentName;
    if (this.props.arrayIndex || this.props.arrayIndex===0) properties["data-arrayindex"]=this.props.arrayIndex; 
    if (properties.defaultValue===null) properties.defaultValue=""; 
    if (this.props.autoid) properties.id=this.props.autoid;                
    return ce("select", properties, options);
  }  
};


class AutoEditFldMultiple extends React.Component{  

  render() {
    var values=this.props.field["values"];
    var valuespure=[];
    var datavalues=this.props.value;
    if (!datavalues) datavalues=[];
    var options = [], ovalue="", svalue="", found=false, i=0, j=0;
    for (i=0; i<values.length; i++) {
      ovalue=values[i];
      if (_.isArray(ovalue)) {                  
        svalue=langelem(_.rest(ovalue));
        ovalue=ovalue[0];
      } else {  
        svalue=ovalue;        
      }  
      valuespure.push(ovalue);      
      options.push(ce("option",{key:autoutils.makeKey("multiple_option"+i+"_"+ovalue), value:ovalue},svalue));
    }
    for(j=0; j<datavalues.length; j++) {
      if (valuespure.indexOf(datavalues[j])<0) 
        options.push(ce("option",{key:autoutils.makeKey("option_el"+String(i)+"_"+String(j)+datavalues[j]), 
                                  value:datavalues[j]},datavalues[j]));
    }
    /*
    if (this.props.rowid!==null && !found && false) {
      // original value in edit not given in values list in viewdef: add as the last element
      options.push(ce("option",{key:autoutils.makeKey("multiple_extra"), 
                                value:this.props.value},this.props.value));
    } 
    */       
    var properties={multiple:true, name:this.props.name, onChange:this.props.callback, defaultValue:datavalues,
                   "data-save":'value', "data-type": this.props.datatype,
                   className: "autoMultiple"};
    if (this.props.parentName) properties["data-parentname"]=this.props.parentName;
    if (this.props.arrayIndex || this.props.arrayIndex===0) properties["data-arrayindex"]=this.props.arrayIndex;
    if (properties.defaultValue===null) properties.defaultValue="";
    if (this.props.autoid) properties.id=this.props.autoid;                   
    return ce("select",properties, options);
  }  
};


class AutoEditFldHelp extends React.Component{  

  constructor(props) {
    super(props);
    this.state = {hovered:false, fixed: false};
    this.handleModalHelp = this.handleModalHelp.bind(this);
    this.handleClickHelp = this.handleClickHelp.bind(this);
    this.mouseOverTip = this.mouseOverTip.bind(this);
    this.mouseOutTip = this.mouseOutTip.bind(this);
    this.helpStyle = this.helpStyle.bind(this);
  }
  getHelpText() {    
    var fld=_.findWhere(this.props.viewdef.fields, {name:this.props.name});
    return langelem(fld["help"]);    
  }
  handleModalHelp(e) {
    e.preventDefault();
    $('#'+helpModalContentId).html(this.getHelpText());
    $('#'+helpModalId).modal('show');
  }  
  handleClickHelp(e) {
    e.preventDefault();
    if (this.state.fixed)  this.setState({ fixed:false });
    else this.setState({ fixed:true });
  }   
  mouseOverTip(e) {
    this.setState({ hovered:true });
  }
  mouseOutTip(e) {
    this.setState({ hovered:false });
  }    
  helpStyle() {
    if (this.state.fixed || this.state.hovered) return shownTipClass;
    else return hiddenTipClass;    
  }
  render() {
    var fld=this.props.field;
    var help,helptext=this.getHelpText();
    if (this.props.fieldlabel==helptext) {
      return this.props.raw;
    }
    if (fld["helptype"]=="modal" || (_.isString(helptext) && 
                                     helptext.length>automodals.getModalHelpLengthLimit)) {
      help=ce("div", {className: "helpblock"},
              ce("button", {className:helpBtnClass, onClick:this.handleModalHelp, 
                           onMouseOver: this.mouseOverTip, onMouseOut: this.mouseOutTip,
                           "aria-label": "help", type: "button"}, "?"),
              ce("div",  {className: this.helpStyle()}, 
                  helptext.substring(0,automodals.getModalHelpLengthLimit())+" ...") 
            );
    } else if (fld["helptype"]==="click" || autoutils.isTouchDevice()) {
      help= ce("div", {className: "helpblock"},
              ce("button", {className:helpBtnClass, onClick:this.handleClickHelp, 
                           "aria-label": "help", type: "button"}, "?"),
              ce("div",  {className: this.helpStyle()}, helptext, "") 
            );
    } else {
      // default: hover, except for touch devices
      help=ce("div", {className: "helpblock"},
              ce("button", {className:helpBtnClass, type: "button",
                            onClick:this.handleClickHelp, "aria-label": "help", 
                            onMouseOver: this.mouseOverTip, onMouseOut: this.mouseOutTip}, "?"),
              ce("div",  {className: this.helpStyle()}, helptext)
            );
    }
    return(        
      ce("div",{className: "outerhelpblock"}, this.props.raw, help)
    );      
  }  
};



class AutoHiddenFld extends React.Component{  
  //displayName: 'AutoHiddenFld',
  // Notes:
  // * if this.props.rowid===null, we add a new row, otherwise edit an existing row  
  // * this.props.value is the original value (for editing), this.state.value is the changed value
  render() { 
    var fld;
    var name=this.props.name;
    if (this.props.viewdef) fld=_.findWhere(this.props.viewdef.fields, {name:this.props.name});
    var value=this.props.value;
    var fldtype;
    if (_.has(fld,"type")) fldtype=fld.type;
    else fldtype="string";    
    var params={type:"hidden",name:name, value:JSON.stringify(value), "data-type": fldtype,                               
                "data-save":'value','data-encoding':'json'};                
    if (this.props.id) params["id"]=this.props.id;    
    if (params.value===null) params.value="";                
    return (
      ce("input", params)
    );            
  }  
};
 
// ====== exported functions =========


export {
 
  AutoEdit,
  AutoEditButtons,
  AutoEditFld,
  AutoEditFldBoolean,
  AutoEditFldOption,
  AutoEditFldMultiple,
  AutoEditFldHelp,
  AutoHiddenFld

}
