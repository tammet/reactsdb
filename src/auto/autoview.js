/* 
 
 Autoreact view one record

*/

import * as autoutils from './autoutils.js';
import * as automodals from './automodals.js';
import * as autolang from './autolang.js';
import * as autoapi from './autoapi.js';
import * as automain from './automain.js';
import * as autoform from './autoform.js';


// ====== module start =========
  
// styling buttons etc, default bootstap

var primaryBtnClass = "btn btn-primary btn-sm";  
var secondaryBtnClass = "btn btn-default btn-sm";  

// convenient shorthands

var ce = React.createElement; 
var trans = autolang.trans; 
  
// ===== react components ============  


// ---- view record -----


class AutoView extends React.Component{  

  constructor(props) {
    super(props);
    this.handleButton = this.handleButton.bind(this);
    this.handleFormGroupButton = this.handleFormGroupButton.bind(this);

    console.log("AutoView constructor ends");

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
    var builtgroup;
    var groupBlocks = [];
    var usedFormGroups=[];
    if (!groups) {
      builtgroup=
          ce(autoform.AutoHandleFormGroup, {key:autoutils.makeKey("group"), 
                             datarow: datarow, auxdata:this.props.auxdata,
                             viewdef: viewdef, op:this.props.op,
                             group: null, groupname: null,
                             rowid: this.props.rowid, callback:this.props.callback, 
                             viewallfields:this.props.viewallfields});
      if (builtgroup) groupBlocks.push(builtgroup); 
    } else {
      for (var i=0; i<groups.length; i++) {
        builtgroup=ce(autoform.AutoHandleFormGroup, {key:autoutils.makeKey("group_"+i+this.props.groupname), 
                       datarow: datarow, auxdata:this.props.auxdata,
                       viewdef: viewdef, op:this.props.op,
                       group: groups[i], groupname: this.props.groupname,
                       rowid: this.props.rowid, callback:this.props.callback,
                      viewallfields:this.props.viewallfields});                    
        if (!isEmptyFormGroup(viewdef,groups[i],datarow,this.props.viewallfields)) {
          groupBlocks.push(builtgroup);                               
          usedFormGroups.push(groups[i].name);
        }  
      }
    }  
    return (
      ce("div",{className: "autoviewgroups"},       
        ce(automain.AutoAlertMessage,{alert:this.props.alert, alertmessage: this.props.alertmessage, internal:true}),
        ((datarow && !(autoutils.hasNegativeProperty(this.props.viewdef,"buttons"))) ?
          ce(AutoViewButtons, {viewdef:this.props.viewdef, 
                               callback: this.handleButton, 
                               rowid:this.props.rowid,
                               datarow: datarow,
                               viewallfields:this.props.viewallfields})
          :
          ""
        ),
        ((groups && viewdef["groupMenu"]!=="left") ? 
          ce(autoform.AutoFormGroupMenu, {viewdef:this.props.viewdef, groupname:this.props.groupname,op:this.props.op,
                            usedgroups:usedFormGroups,
                            callback: this.handleFormGroupButton}) 
           : 
           ""
        ),
        ((!groups) ? ce("div",{className: "smallSpacerDiv"},"") : ""),
        ((!_.isEmpty(groupBlocks)) ? groupBlocks : "") 
      )        
    );  
  }
};

function isEmptyFormGroup(viewdef,group,datarow,viewallfields) {       
  var val,i,field;
  var fields=autoutils.orderFields(viewdef.fields);
  for (var i=0, field=""; i<fields.length; i++) {
    field=fields[i];
    if (group && group["name"] && group["name"]!==field["group"]) continue;
    if (group && !group["name"] && field["group"]) continue;                
    if (_.has(datarow,field.name)) val=datarow[field.name];   
    else val="";           
    if (!autoutils.fieldShow(field,"view")) continue;
    if (!viewallfields && 
            (val===null || val==="" || (_.isArray(val) && _.isEmpty(val)))) 
          continue;   
    if (autoform.conditionalHideField(field,val,datarow)) continue;    
    return false;   
  }    
  return true;   
}

class AutoViewButtons extends React.Component{  

  constructor(props) {
    super(props);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleViewAllFields = this.handleViewAllFields.bind(this);
    this.handleHideEmptyFields = this.handleHideEmptyFields.bind(this);
    this.handleDelete = this.handleDelete.bind(this);    
    this.handleDoDelete = this.handleDoDelete.bind(this);
    this.handleExport = this.handleExport.bind(this);
    this.handleAutorefresh = this.handleAutorefresh.bind(this);
  }
  handleEdit(e) {
    e.preventDefault();
    autoutils.removeAlert();
    this.props.callback({op:"edit",rowid:this.props.rowid, alert:false});
  } 
  handleViewAllFields(e) {   
    e.preventDefault();
    this.props.callback({op:"view",rowid:this.props.rowid, action:"showallfields"});
  }
  handleHideEmptyFields(e) {   
    e.preventDefault();
    this.props.callback({op:"view",rowid:this.props.rowid, action:"hideemptyfields"});
  }
  handleDelete(e) {   
    e.preventDefault();
    autoutils.removeAlert();
    automodals.modalConfirm(trans("Delete the item?"),this.handleDoDelete);   
  }  
  handleDoDelete(val) { 
    if (val!="true") return;  
    this.props.callback({op:"edit",action:"delete", rowid:this.props.rowid, alert:false});    
  }
  handleExport(val) { 
    console.log("handleExport");   
  }
  handleAutorefresh(val) { 
    console.log("handleAutorefresh");
    this.props.callback({op:"view",rowid:this.props.rowid, action:"startautorefresh"});       
  }
  render() {    
    var canedit = autoutils.userAllowedEdit(this.props.viewdef, this.props.datarow);
    var candelete = autoutils.userAllowedDelete(this.props.viewdef, this.props.datarow);
    var expurl=autoapi.getApiUrl()+"/resource/"+this.props.rowid;
    var canexport=false;
    var canrefresh=false;
    if (this.props.viewdef.autorefresh) canrefresh=true;
    if (this.props.viewdef && this.props.viewdef.object &&
        _.indexOf(["infosystem", "service", "area", "classifier", "xmlasset"],
                  this.props.viewdef.object)>=0) {
      canexport=true;
    }  
    if (autoutils.hasNegativeProperty(this.props.viewdef,"edit")) {
      return ce("div",{},"");
    } else {
      return (      
        ce("div", {className:"autoButtons"}, 
          ((canedit) ?
            ce("button", {className: primaryBtnClass, onClick:this.handleEdit, type: "button"}, trans("Edit"))
            :
            ""),
          ((autoutils.hasNegativeProperty(this.props.viewdef,"allFieldsButton")) ?
            ""
            :
            ((this.props.viewallfields) ?
              ce("button", {className: secondaryBtnClass, onClick:this.handleHideEmptyFields, type: "button"},
                          trans("Hide empty fields"))
              :
              ce("button", {className: secondaryBtnClass, onClick:this.handleViewAllFields, type: "button"},
                          trans("Show empty fields")) )),
          ((autoutils.versionableViewdef(this.props.viewdef) && canedit) ?
            ce("button", {className: secondaryBtnClass, onClick:this.handleNewVersion, type: "button"}, trans("Create a new version"))
            :
            ""),         
          ((this.props.viewdef && this.props.viewdef.approve && canedit)
            ?
            ce("button", {className: secondaryBtnClass, onClick:this.handleSubmitApproval, type: "button"}, trans("Submit to approval"))
            :
            ""),              
          ((candelete) ?
            ce("button", {className: secondaryBtnClass, onClick:this.handleDelete, type: "button"}, trans("Delete"))
            :
            ""),
          ((canexport) ?                        
            ce("a",{href:expurl, target:"external", className: secondaryBtnClass, type: "button"}, 
                  trans("Export data"))            
            //ce("button", {className: secondaryBtnClass, onClick:this.handleExport, type: "button"}, trans("Export"))
            :
            ""),
          ((canrefresh) ?                        
            ce("button",{className: secondaryBtnClass, onClick:this.handleAutorefresh, type: "button"},
                  trans("Update automatically"))            
            //ce("button", {className: secondaryBtnClass, onClick:this.handleExport, type: "button"}, trans("Export"))
            :
            "")                 
        )
      );
    }
  }
};



class AutoText extends React.Component{  

  render() {
    var datarow=this.props.datarow;    
    return (
      ce("div",{className: "autoviewgroups"},         
        ce(automain.AutoAlertMessage,{alert:this.props.alert, alertmessage: this.props.alertmessage, internal:true}),
        ce("div",{className: "smallSpacerDiv"},""),
        ce("pre",{className: "autoPlainText"},String(datarow))              
      )  
    );  
  }
};

// ====== exported functions =========


export {
  AutoView,
  //AutoViewButtons,
  AutoText
}
