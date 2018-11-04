/* 
 
 Autoreact edit a complex non-atomic field

*/

import * as autoutils from './autoutils.js';
import * as autolang from './autolang.js';
import * as autoform from './autoform.js';

// ====== module start =========
  
// convenient shorthands

var ce = React.createElement; 
var trans = autolang.trans; 
  
// ===== react components ============  

// edit a complex (non-atomic) field

class AutoEditFldComplex extends React.Component{  

  constructor(props) {
    super(props);
    this.handleChange= this.handleChange.bind(this);  
    this.handleAdd = this.handleAdd.bind(this);  
    this.handleDelete= this.handleDelete.bind(this);  
  }
  handleChange(i,key,v) {
    autoutils.removeAlert();
    var val=this.props.value;                       
    val[i][key]=v;
  }
  handleAdd(e) {
    autoutils.removeAlert();
    var val=this.props.value;
    var fld=this.props.field;
    var type=this.props.datatype;
    var arraysubtype=autoutils.arraySubtype(type);
    var subviewdef=getSubtypeViewdef(arraysubtype,val);
    var fields=getSubtypeViewdefComplexFields(subviewdef);
    if (!fields) return;    
    var j,newelem={};
    for(j=0;j<fields.length;j++) {    
      newelem[fields[j]["name"]]="";
    }
    if (!val) val=[newelem];
    else val.push(newelem);
    this.props.callback(val);    
  }
  handleDelete(i,e) {
    autoutils.removeAlert();
    var j,val,newval;
    val=this.props.value;
    newval=[];
    for(j=0;j<val.length;j++) {
      if (j===i) continue;
      newval.push(val[j]);
    }
    this.props.callback(newval);        
  }
  render() {
    var i,j,valel,subval,keys,key,fldvalue,editfld,viewdef,label,tmp=[],outerrows=[];    
    var val=this.props.value;
    if (this.props.single) {
      val = [val];
    }
    var fld=this.props.field;
    var type=this.props.datatype;
    var arraysubtype=autoutils.arraySubtype(type);
    var subviewdef=getSubtypeViewdef(arraysubtype,val);  
    var subflds=autoutils.orderFields(subviewdef.fields);      
    if (val===null) {
      //autoutils.debug("AutoEditFldComplex render null value");
      //autoutils.debug(val);
      //autoutils.debug(fld);
      //autoutils.debug(type);
      val=[];
    }
    for(i=0;i<val.length;i++) {
      valel=val[i];
      //keys=_.keys(valel);
      //keys=_.map(subviewdef.fields, function(x){ return x["name"]; });
      keys=_.map(subflds, function(x){ return x["name"]; });
      tmp=[];            
      for(j=0; j<keys.length; j++) {        
        key=keys[j];
        subval=valel[key];        
        label=autoform.fieldLabel(_.findWhere(subflds,{"name":key}));
        fld=ce(AutoEditFld, {key: autoutils.makeUniqueKey("complex"), //autoutils.makeKey("complex"+key+i+"_"+j),
                             name:key, 
                             fieldlabel:label,
                             rowid:12341234, 
                             value:subval, 
                             viewdef:subviewdef,
                             parentName: this.props.name,
                             arrayIndex: i,          
                             complexCallback:this.handleChange.bind(this,i,key),
                             callback:this.handleChange.bind(this,i,key),
                             auxdata: this.props.auxdata})
        tmp.push(        
              ce("tr",{key:autoutils.makeKey("complex_tr_"+key+i+"_"+j)},
                ce("td",{className: "autoEditTableKey"}, label),
                ce("td",{}, fld)
              )
        );   
      }
      tmp=ce("tr",{key: autoutils.makeUniqueKey("complex_tr")}, //key:autoutils.makeKey("complex_xtr_"+this.props.field["name"]+i)},         
            ce("td",{className: "autoValTd"},
              ce("table",{className: "autoValTable"}, ce("tbody",{},tmp))
            ),
            ce("td",{className: "autoValCrossTd"},
              (this.props.single ? '' : ce("button",{className: "btn btn-default btn-xs", "aria-label": "delete",
                           onClick: this.handleDelete.bind(this,i)},                                            
                ce("span", {className:"glyphicon glyphicon-remove lightGlyphicon", "aria-hidden":"true"})
              ))
            )
      );               
      outerrows.push(tmp);      
    }
    if (_.isEmpty(outerrows)) {
      return (
        ce("div",{},
          ce("input", {type:"hidden",name:this.props.name, "data-save":"empty"}),
          ce("button",{className: "btn btn-default btn-sm btn_add_element",
                      onClick: this.handleAdd},trans("add element")) )              
      );
    }
    tmp=ce("tr",{key: autoutils.makeUniqueKey("complex")}, //{key:autoutils.makeKey("complex_toptr"+fld["name"])},         
            ce("td",{colSpan:2, className:"autoValAddTd"},
                (this.props.single ? '' : ce("button",{className: "btn btn-default btn-sm btn_add_element",
                            onClick: this.handleAdd},trans("add element")))
            )
    ); 
    outerrows.push(tmp);                            
    return (
     ce("table",{className: "autoInnerEditTable"}, 
        ce("tbody",{},outerrows)  )
    );             
  }     
};      

// find a viewdef for a complex (non-atomic) field

function getSubtypeViewdef(name,val) {
  var subviewdef=_.findWhere(globalState.viewdefs, {"name":name}); 
  if (!subviewdef) subviewdef=_.findWhere(globalState.viewdefs, {"object":name});     
  if (!subviewdef) {
    var flds=[],valel,i,j,keys,key,type,keyval;
    for(i=0;i<val.length;i++) {
      valel=val[i];
      keys=_.keys(valel);
      for(j=0; j<keys.length; j++) {
        key=keys[j];
        if (_.findWhere(flds,{"name":key})) continue;
        if (valel[key]!==null) keyval=valel[key];
        if (keyval==null) type="string";        
        else if (_.isBoolean(keyval)) type="boolean";
        else if (_.isString(keyval) && 	keyval.length=="2008-06-10T18:18:27".length &&
                 keyval[4]=="-" && keyval[7]=="-" && keyval[10]=="T") type="date";
        else type="string";
        flds.push({"name": key, "type":type});
      }        
    }
    subviewdef={"name":"builtdummy","fields":flds};
  }
  return subviewdef;
}  

// return fields of a viewdef for a complex (non-atomic) field

function getSubtypeViewdefComplexFields(subviewdef) {
  if (!subviewdef ||
      !_.has(subviewdef,"fields") || 
      !_.isArray(subviewdef["fields"]) ||
      subviewdef["fields"].length<1 ||
      !_.isObject(subviewdef["fields"][0]) ||
      _.isArray(subviewdef["fields"][0]) )
      return null;
  return subviewdef["fields"];
}

 
// ====== exported functions =========


export {
 
  AutoEditFldComplex

}
