/* 
 
 Autoreact edit and incremental (autocomplete) search field

*/

import * as autoutils from './autoutils.js';
import * as autoformdata from './autoformdata.js';
import * as autolang from './autolang.js';
import * as autoapi from './autoapi.js';

// ====== module start =========
  
// convenient shorthands

var ce = React.createElement; 
var trans = autolang.trans; 
  
// ===== react components ============  


class AutoEditFldSearch extends React.Component{  
  
  constructor(props) {
    super(props);
    var fldtype;
    var fld=null;
    if (this.props.viewdef) fld = _.findWhere(this.props.viewdef.fields, {name:this.props.name});
    if (this.props.fldtype) {
      fldtype=this.props.fldtype;
    } else {
      fldtype=fld.type;
    }
    var kind=getDynamicSearchKind(fldtype);
    var idfldname=getDynamicSearchIdFieldName(fldtype);
    var namefldname=getDynamicSearchNameFieldName(fldtype);
    var searchValue;
    if (this.props.searchValue) 
      searchValue=this.props.searchValue;
    else if (this.props.datarow && this.props.datarow[name+"__joinReplaced"])
      searchValue=this.props.datarow[name+"__joinReplaced"];
    else
      searchValue=this.props.value;
    //searchValue="names:"+name+","+idfldname+","+namefldname;
    if (this.props.value && this.props.value===searchValue) searchValue="";
    this.state = {value:this.props.value, searchValue: searchValue, dynoptions:null,
            fld:fld, fldtype:fldtype, selindex:null,
            kind:kind, idfldname:idfldname, namefldname:namefldname};
    this.handleChange = this.handleChange.bind(this);        
    this.handleDynamicSearchFieldChange = this.handleDynamicSearchFieldChange.bind(this);         
    this.handleDynamicOptionsChange = this.handleDynamicOptionsChange.bind(this);         
    this.handleDynamicOptionsClick = this.handleDynamicOptionsClick.bind(this);        
  }
  // called when id field content is changed by user
  handleChange(e) {   
    var input=e.target; 
    autoutils.removeAlert();   
    this.setState({value:input.value, searchValue: "", dynoptions:null, selindex:null});
    if (this.props.complexCallback) this.props.complexCallback(input.value); 
  }
  // called when search field content is changed by user
  handleDynamicSearchFieldChange(e) { 
    var input=e.target;
    //console.log(" handleDynamicSearchFieldChange changed to: "+input.value)
    if (autoutils.isSearchType(this.state.fldtype)) {
      if (!input.value) {
        if (this.props.show=="searchfield")
          this.setState({dynoptions: null, value:"", selindex:null});
        else 
          this.setState({dynoptions: null, selindex:null});
      } else {
        var filter = null;
        if (_.has(this.state.fld, 'restriction')) {
          var restriction = this.state.fld.restriction;
          filter=autoformdata.makeFilterFromRestriction(restriction,this.props.datarow);
        }

        autoapi.dynamicSearchByName(this,this.state.fldtype,input.value,
                                  this.state.kind,this.state.idfldname,
                                  this.state.namefldname, filter);
      }        
    }        
    //console.log("cp2: "+input.value+","+this.state.value);
    if (input.value=="") this.setState({value:""});
    this.setState({searchValue:input.value});  
  }  
  /*
  handleKey:function(e) {
    var index=this.state.selindex;
    if (index===null) index=3;
    else if (index<this.state.dynoptions.length-1) index++;
    console.log("handleKey");
    console.log(e);
    this.setState({selindex:index});
  },
  */  
  // callback for the api for dynamic options search      
  handleDynamicOptionsChange(options) {
    this.setState({dynoptions: options});
  }
  // called when a dynamically built option is clicked
  handleDynamicOptionsClick(name,value,event) {
    this.setState({searchValue: name, value:value, dynoptions:null});    
    if (this.props.complexCallback) this.props.complexCallback(value);
  }  
  render() {
    var fld,params1,params2,val1,val2,raw,outerkey,internal;
    fld=this.state.fld;
    val1=this.state.value;
    if (!val1) val1="";
    val2=this.state.searchValue;
    if (!val2) val2="";
    params1={type:"text",name:this.props.name,className:'fldinput',
             onChange:this.handleChange,key:name+"_dynfieldsfinal"+this.props.parentName+this.props.arrayIndex,
             value:val1};      
    if (this.props.id) params1["id"]=this.props.id; 
    else if (this.props.autoid) params1["id"]=this.props.autoid;              
    if (this.props["data-filter"]) params1["data-filter"]=this.props["data-filter"];                   
    if (!this.props.nosave) params1["data-save"]="value";
    if (fld && fld["mustFill"]===true) params1["data-mustfill"]="true";                       
    if (this.props.parentName) params1["data-parentname"]=this.props.parentName;             
    if (this.props.arrayIndex || this.props.arrayIndex===0) params1["data-arrayindex"]=this.props.arrayIndex;                
    if (this.props.show=="searchfield") params1["type"]="hidden";         
    params2={type:"text",className:'fldinput',key:autoutils.makeKey("autosearch"+name),
             onChange:this.handleDynamicSearchFieldChange,
             //onKeyDown:this.handleKey, 
             value:val2};    
    if (!val2) params2["placeholder"]=trans("name");
    raw=ce("div",{key:autoutils.makeKey(name+"_dynfieldswrap"+this.props.parentName+this.props.arrayIndex)},
          ce("div",{className:"nowrap searchfieldiddiv",key:autoutils.makeKey(name+"_dynfieldsinwrap"+this.props.parentName+this.props.arrayIndex)},
            ce("input",params1),
            ((this.props.show=="searchfield") ? "" : ce("span",{className: "dynamicSearchLabel"},trans("code")))
          ),    
          ce("div",{className:"nowrap searchfieldnamediv"},
            ce("input",params2),
            ce("span",{className: "dynamicSearchLabel"},trans("search"))
          )            
    );                 
    outerkey=this.props.parentName+this.props.arrayIndex;            
    raw=embedFieldDynamicOptions(this,raw,this.state.dynoptions,this.props.name,outerkey,
                                 this.state.idfldname, this.state.namefldname,this.props.show,
                                 this.state.selindex);              
    return raw;        
  }
};  


function embedFieldDynamicOptions(ctxt,fields,options,name,outerkey,idfldname,namefldname,showtype,selindex) { 
  var i,val,shownoptions=[],cls;
  if (!options) options=[];
  for (i=0; options && i<options.length && i<100; i++) {      
    val=options[i][namefldname];
    if (options[i]["eesnimi"]) {
      val=val+", "+options[i]["eesnimi"];
    }
    shownoptions.push(
      ce("li",{key:autoutils.makeKey(name+"_dynopt"+i), 
               className:((selindex!==i) ? "dynamicSearchOption" : "dynamicSearchOption dynamicSearchOption_selected"),
               onClick:ctxt.handleDynamicOptionsClick.bind(
                          ctxt,
                          options[i][namefldname],
                          options[i][idfldname])}, 
               val)
    );
  }      
  if (showtype=="searchfield") cls="";
  else cls="outerDynamicSearchBlock";
  return (
    ce("div",{className: cls,key:autoutils.makeKey("outersearchfield"+name+outerkey)}, 
      fields,       
      ((i>0) ? ce("ul", {className: "dynamicSearchBlock"}, shownoptions) : "")
    )
  );
}  

function getDynamicSearchKind(fldtype) {
  return getDynamicSearchParamFieldName(fldtype,"object","infosystem");
}

function getDynamicSearchIdFieldName(fldtype) {
  if (autoutils.isIdType(fldtype)) return getDynamicSearchParamFieldName(fldtype,"key","main_resource_id");
  return getDynamicSearchParamFieldName(fldtype,"refField","uri");
}

function getDynamicSearchNameFieldName(fldtype) {
  return getDynamicSearchParamFieldName(fldtype,"nameField","name");
}

function getDynamicSearchParamFieldName(fldtype,viewfld,deflt) {
  var n,viewname,viewdef;
  if (!fldtype) return deflt;
  n=fldtype.lastIndexOf(":");
  if (n<0) return deflt;
  viewname=fldtype.substring(n+1);
  viewdef=_.findWhere(globalState.viewdefs, {"name":viewname});
  if (!viewdef) return deflt;
  if (!viewdef[viewfld]) return deflt;
  return viewdef[viewfld];
}


 
// ====== exported functions =========


export {
  
  AutoEditFldSearch

}
