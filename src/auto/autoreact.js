/* 
 
 Autoreact
 
 Build React components from data and viewdefs
 
 Requires just the basic react without jsx plus underscore
 
 react.min.js
 react-dom.min.js
 underscore-min.js
 
 plus autoreact own utils:
 
 autoutils.js
 automodals.js
 autoapi.js
 autolang.js
 
 uses globalState object for configuration and
 global non-react state management

 
*/

import * as autoutils from './autoutils.js';
import * as autoformdata from './autoformdata.js';
import * as automodals from './automodals.js';
import * as autolang from './autolang.js';
import * as autoapi from './autoapi.js';
import * as automain from './automain.js';
import * as autocomp from './autocomp.js';
import * as autoedit from './autoedit.js';


// ====== module start =========
  
// styling buttons etc, default bootstap

var defaultBtnClass = "btn btn-default btn-sm"; 
var disabledDefaultBtnClass = "btn btn-default btn-sm disabled";
var primaryBtnClass = "btn btn-primary btn-sm";  
var secondaryBtnClass = "btn btn-default btn-sm";  
var fieldSearchBtnClass = "btn btn-default btn-xs"; 
var disabledPrimaryBtnClass = "btn btn-primary btn-sm disabled";
var disabledSecondaryBtnClass = "btn btn-default btn-sm disabled";
var helpBtnClass = "btn btn-default help";

var alertClass = "alert autoalert";
var internalAlertClass = "alert autointernalalert";
var alertClassPrefix = "alert-";
/*
var alertSuccessClass= "alert-success";
var alertInfoClass= "alert-info";
var alertWarningClass= "alert-danger";
var alertDangerClass= "alert-danger";  
*/

// styling tooltip help for hover and click, default autoreact css
  
var shownTipClass = "showntip";
var hiddenTipClass = "hiddentip";  

// for help modal, if helptype set to "modal"
  
var helpModalContentId = "helpcontents"; // inset help text here
var helpModalId = "helpModal"; // show this

// images

var sortimage = "img/sort01a.png";
var sortdownimage = "img/sort02a.png";
var sortupimage = "img/sort03a.png";

// convenient shorthands

var ce = React.createElement; 
var trans = autolang.trans; 
var fldtrans = autolang.fldtrans;
var langelem = autolang.langelem;
  
// ===== react components ============  


// ---- filter records -----

class AutoListForm extends React.Component{

  constructor(props) {
    super(props);
    this.state = {text: '', extfilter: false};
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleExtFilterChange = this.handleExtFilterChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleFilterChange(e) {
    this.setState({text: e.target.value});
  } 
  handleExtFilterChange(e) {
    this.setState({extfilter: !this.state.extfilter});
  } 
  handleSubmit(e) {
    e.preventDefault();
    var text = this.state.text.trim();
    this.props.onDataSubmit({text: text});
    this.setState({text: ''});
  }  
  render() {
    var viewdef=this.props.viewdef;
    var datarow=this.props.datarow;   
    var fields=autoutils.orderFields(viewdef.fields);
    var i, field, val, params, raw, stdfields=[], extfields=[];
    var fieldlabel, autoid, key, filterstyle, viewname;
    var dataFields = [];
    if (viewdef.name) viewname=viewdef.name;
    else viewname="dummy";
    for (i=0; i<fields.length; i++) {
      field=fields[i];
      if (!filterFieldShow(field) && !field["extfilter"]) continue;
      if (field["extfilter"]===true) extfields.push(field);
      else stdfields.push(field);
    }
    if (this.state.extfilter) fields=stdfields.concat(extfields); 
    else fields=stdfields;    
    for (i=0, field=""; i<fields.length; i++) {
      field=fields[i];      
      if (_.has(datarow,field.name)) val=datarow[field.name];   
      else val="";
      key="search_"+field.name+"_"+i;
      //autoid="autoid-search-"+viewdef.name+"-"+field.name+"-"+i;
      autoid="autoid-search-"+viewname+"-"+field.name+"-"+i;
      fieldlabel=fieldLabel(field);
      params={name:field.name, rowid:this.props.rowid, value:val, 
              viewdef:this.props.viewdef, key:key};
      if (field["filterRange"] || field["type"]=="date" || field["type"]=="datetime") {
        raw=ce("div",{className:"fldrange"}, 
              ce(AutoFilterFld, _.extend(params, {filtertype: 'minvalue', autoid: autoid})),             
              ce("span", {className: "fldrangeseparator"}, " - "),
              ce(AutoFilterFld, _.extend(params, {filtertype: 'maxvalue', autoid: autoid+"-max", key: key+"_max"}))
            );
        if (_.has(field,"help")) {
          raw=ce(autoedit.AutoEditFldHelp, {viewdef:viewdef, field:field, name:field.name, raw:raw, fieldlabel:fieldlabel});
        }       
      } else {
        raw=ce(AutoFilterFld, _.extend(params, {filtertype: 'value', autoid: autoid}));
      }         
      var c1="row fldrow", c2="col-md-4 fldlabel", c3="fldlabel", c4="col-md-8 fldinputcol";
      if (viewdef.filterstyle==="horizontal") {
        c1="inlineblock";c2="inlineblock fldlabelHorizontal";
        c3="fldlabelHorizontal";c4="inlineblock fldinputcolHorizontal";
      }  
      dataFields.push(
        ce("div",{key:viewname+"-filter-list_tr"+i, className:c1},
          // ce("div", {className: "col-md-4 fldlabel"}, fieldlabel),
          ce("div", {className: c2},
            ce("label",{className: c3, htmlFor: autoid},fieldlabel) ),
          ce("div", {className: c4}, raw)
        )  
      );            
    }        
    return (
      ce("form", {className:"autoForm", onSubmit:this.handleDataSubmit},
        ((viewdef.filterstyle==="horizontal") ?       
          ce("span",{className:""},          
           dataFields          
          ) :
          ce("div",{className:"container-fluid"},          
           dataFields          
          )
        ),  
        //ce("p",{}),  
        ce(AutoListButtons, {viewdef:this.props.viewdef, callback:this.props.callback,
                             extfilter: this.state.extfilter,
                             handleExtFilterChange: this.handleExtFilterChange,
                             offset:this.props.offset, data:this.props.data,
                             datarow:datarow,
                             searchbutton: (dataFields && dataFields.length>0),
                             parent:this.props.parent})
           
      )    
    );  
  }
};



class AutoFilterFld extends React.Component{  

  constructor(props) {
    super(props);
    this.state = {value:this.props.value};
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(e) {
    this.setState({value:e.target.value});
  }
  componentWillMount() {
    var fld=_.findWhere(this.props.viewdef.fields, {name:this.props.name});
    if (fld && (fld["type"]==="date" || fld["type"]==="datetime")) // this.setState({id: autoutils.makeUniqueKey("autocmp-")});
      this.setState({id: this.props.autoid});
  }
  componentDidMount() {
    var fld=_.findWhere(this.props.viewdef.fields, {name:this.props.name});
    if (fld && (fld["type"]==="date" || fld["type"]==="datetime")) autoutils.setupDatePicker(this);
  }
  render() {        
    var name=this.props.name;
    var autoid=this.props.autoid;    
    var fld=_.findWhere(this.props.viewdef.fields, {name:this.props.name});
    var fldtype;
    var raw;
    var filterstyle=this.props.viewdef.filterstyle;
    if (_.has(fld,"type")) fldtype=fld.type;
    else fldtype="string";
    if (fldtype=="boolean") {             
      raw=ce(autoedit.AutoEditFldBoolean, {defaultValue:"", rowid:null, name:name, 
                                  filtertype: this.props.filtertype, datatype: "boolean", autoid:autoid,
                                  callback:this.handleChange});
    } else if (fldtype=="date" || fldtype=="datetime") {   
      var html="<input type='text' class='fldinput calfldinput' size='10' data-date-format='dd.mm.yyyy' ";
      html+=" data-type='date' data-filter='"+this.props.filtertype+"' ";
      html+=" id='"+this.state.id+"' name='"+name+"'></input>"     
      raw=ce("div", {className: "flddatediv", dangerouslySetInnerHTML: {__html:html}});      
    } else if (_.has(fld,"values") && fld["values"] && _.isArray(fld["values"]) && autoutils.isArrayType(fld["type"])) { 
      if (fld["values"].length>0 && fld["values"][0]) { 
        fld=_.clone(fld);
        fld["values"]=[""].concat(fld["values"]);
      }  
      raw=ce(autoedit.AutoEditFldOption, {defaultValue:null, rowid:null, name:name, field:fld, 
                                filtertype: this.props.filtertype, datatype: fldtype, autoid:autoid,
                                callback:this.handleChange}); 
    } else if (_.has(fld,"values") && fld["values"] && _.isArray(fld["values"])) {
      raw=ce(autoedit.AutoEditFldOption, {defaultValue:null, rowid:null, name:name, field:fld,
                                filtertype: this.props.filtertype,
                                datatype: fldtype, autoid:autoid, callback:this.handleChange});    
    } else if (fldtype=="integer") {      
      raw=ce("input", {type:"text", className: "fldinput_int", "data-filter": this.props.filtertype, autoComplete:"off",
                      name:name, value:this.state.value, "data-type": fldtype, id:autoid, //key:"search_"+name+"_"+this.state.id,
                      onChange:this.handleChange});      
    } else if (autoutils.isSearchType(fldtype)) {
      raw=ce(autoedit.AutoEditFldSearch,{
             handleChange:this.handleChange,             
             value:this.state.value,
             viewdef:this.props.viewdef,
             name:this.props.name, 
             "data-filter": "value",
             show: "searchfield",
             autoid: autoid,        
             searchValue:""}
      );                           
    } else {
      raw=ce("input", {type:"text", 
                       className: ((filterstyle==="horizontal") ? "fldinputHorizontal" : "fldinput"), 
                      "data-filter": this.props.filtertype, autoComplete:"off",
                      name:name, value:this.state.value, "data-type": fldtype, id:autoid,
                      onChange:this.handleChange});      
                     
    }
    if (_.has(fld,"help") && this.props.filtertype!=="minvalue" && this.props.filtertype!=="maxvalue") {      
      // wrap input into help
      return ce(autoedit.AutoEditFldHelp, {viewdef:this.props.viewdef, field:fld, name:name, raw:raw});
    } 
    return raw;    
  }  
};

// ---- list records -----


class AutoListButtons extends React.Component{

  constructor(props) {
    super(props);    
    this.handleSearch = this.handleSearch.bind(this);
    this.handleExtfilter = this.handleExtfilter.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
  }
  handleSearch(e) {
    e.preventDefault();
    this.props.callback({op:"list",action:"search",rowid:null});
  }
  handleExtfilter(e) {   
    e.preventDefault();
    this.props.handleExtFilterChange();
  }
  handleAdd(e) {   
    e.preventDefault();
    if (this.props.viewdef.addWizard) this.handleAddWizard(e);   
    else this.props.callback({op:"add",rowid:null});
  } 
  handleAddWizard(e) {   
    e.preventDefault();
    //console.log("addWizard called");    
    automodals.modalWizard(this.props.viewdef.addWizard,this.handleDoSubmitWizard);
  } 
  handleDoSubmitWizard(val) {  
    //console.log("wizard returns: ");
    //console.log(val);
    if (!val || val=="false") return;
    this.props.callback({op:"add",rowid:null,prefill:JSON.parse(val)}); 
  }    
  handleHelp(txt,e) {   
    e.preventDefault();
    $('#'+helpModalContentId).html(txt);
    $('#'+helpModalId).modal('show');
  } 
  handleImport(e) {   
    e.preventDefault();
    autoutils.showImportModal();
  } 
  render() {
    var i,extfilter=false,help=false,inapproval=false;
    var canimport=false;
    if (this.props.viewdef && this.props.viewdef.object &&
        _.indexOf(["infosystem","area", "classifier", "xmlasset"], // "service", 
                  this.props.viewdef.object)>=0) {
      canimport=true;
    }
    if (this.props.viewdef.help) help=langelem(this.props.viewdef.help);    
    extfilter=_.some(this.props.viewdef["fields"],function(v) {return (v["extfilter"]===true) });  
    if (this.props.parent && this.props.parent.data && _.has(this.props.parent.data,"inapproval") &&
        this.props.parent.data.inapproval) inapproval=true;
    if (!this.props.searchbutton && !extfilter) {
      if (autoutils.hasNegativeProperty(this.props.viewdef,"edit") || inapproval) {
        return (
          ce("div", {className: "autoButtons"}, 
               ((help) ? 
                 ce("input", {type:"submit", onClick:this.handleHelp.bind(this,help), 
                           className:  secondaryBtnClass, value:trans("What is this?")})
                 : "")             
          )
        );        
      }  
      return (
        ce("div", {className: "autoButtons"}, 
          ((help) ? 
             ce("input", {type:"submit", onClick:this.handleHelp.bind(this,help), 
                         className:  secondaryBtnClass, value:trans("What is this?")})
             : ""),
          ((autoutils.userAllowedAdd(this.props.viewdef) && !autoutils.hasNegativeProperty(this.props.viewdef,"edit") &&
          !inapproval) ?
              ce("input", {type:"submit", onClick:this.handleAdd, className:  secondaryBtnClass, value:trans("Add")})
              : "")
        )
      );                    
    } else {
      var c1="row", c2="col-md-4", c3="col-md-8 autoListButtons";
      if (this.props.viewdef.filterstyle==="horizontal") {
        c1="inlineblock",c2="inlineblock",c3="inlineblock";
      }  
      return (
        ce("div",{className: c1},
          ce("div",{className: c2}),
          ce("div",{className: c3},
            ((this.props.searchbutton) ?
              ce("input", {type:"submit", onClick:this.handleSearch, className:  primaryBtnClass, value:trans("Search")})
              : ""),
            ((extfilter) ? 
              ce("input", {type:"submit", onClick:this.handleExtfilter, className:  secondaryBtnClass, 
                          value:trans((this.props.extfilter) ? "Close extended search" : "Open extended search") })          
              : ""), 
            ((help) ? 
              ce("input", {type:"submit", onClick:this.handleHelp.bind(this,help),
                         className:  secondaryBtnClass, value:trans("What is this?")})
             : ""),                         
            ((autoutils.userAllowedAdd(this.props.viewdef) && !autoutils.hasNegativeProperty(this.props.viewdef,"edit") &&
              !inapproval) ?
              ce("input", {type:"submit", onClick:this.handleAdd, className:  secondaryBtnClass, value:trans("Add")})
              : ""),
            ((canimport &&
              autoutils.userAllowedAdd(this.props.viewdef) && !autoutils.hasNegativeProperty(this.props.viewdef,"edit") &&
              !inapproval) ?
              ce("input", {type:"submit", onClick:this.handleImport, className:  secondaryBtnClass, value:trans("Import data")})
              : "")  
            /*  
            ((autoutils.userAllowedAdd(this.props.viewdef) && !autoutils.hasNegativeProperty(this.props.viewdef,"edit") &&
              !inapproval) ?
              ce("input", {type:"submit", onClick:this.handleAddWizard, className:  secondaryBtnClass, value:trans("Add with a wizard")})
              : "")             
             */ 
          )  
        )
      );  
    }          
  }
};


//var AutoScrollButtons = React.createClass({
class AutoScrollButtons extends React.Component{  

  constructor(props) {
    super(props);    
    this.handlePrevious = this.handlePrevious.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handleFirst = this.handleFirst.bind(this);
    this.handleLast = this.handleLast.bind(this);
    this.handleAll = this.handleAll.bind(this);   
  }
  handlePrevious(e) {
    e.preventDefault();
    if (this.props.offset>0)
      this.props.callback({op:"list",action:"previous",rowid:null});
  } 
  handleNext(e) {   
    e.preventDefault();
    this.props.callback({op:"list",action:"next",rowid:null});
    //if (this.props.data.length >= (this.props.offset+getListLimit(this.props.viewdef)))
    //      this.props.callback({op:"list",action:"next",rowid:null});
  } 
  handleFirst(e) {   
    e.preventDefault();
    if (this.props.offset>0)
      this.props.callback({op:"list",action:"first",rowid:null});
  } 
  handleLast(e) {   
    e.preventDefault();
    this.props.callback({op:"list",action:"last",rowid:null});
    //if (this.props.data.length >= (this.props.offset+getListLimit(this.props.viewdef)))
    //      this.props.callback({op:"list",action:"next",rowid:null});
  }
  handleAll(e) {   
    e.preventDefault();
    this.props.callback({op:"list",action:"all",rowid:null});
    //if (this.props.data.length >= (this.props.offset+getListLimit(this.props.viewdef)))
    //      this.props.callback({op:"list",action:"next",rowid:null});
  }
  render() {
    if (!_.isArray(this.props.data) || this.props.data.length==0) {
      return null;
    }  
    //var lastrownr=this.props.offset+getLocalListLimit(this.props.viewdef)-1;
    var lastrownr=this.props.offset+this.props.count;
    if (lastrownr>this.props.offset+this.props.data.length-1) {
      lastrownr=this.props.offset+this.props.data.length-1;
    }      
    return (
      ce("div",{className: "row"},
        ce("div",{className: "autoScrollButtons"},
          ce("div",{className: "autoScrollButtonsInner"},
            ce("button", {type:"button", onClick:this.handleFirst, 
                         className: secondaryBtnClass,"aria-label":"first"}, 
                         //trans("First")),
              ce("span", {className:"glyphicon glyphicon-fast-backward lightGlyphicon", "aria-hidden":"true"}) ),
            ce("button", {type:"button", onClick:this.handlePrevious, 
                          className:secondaryBtnClass, "aria-label":"previous"},
                         //trans("Previous")),        
              ce("span", {className:"glyphicon glyphicon-backward lightGlyphicon", "aria-hidden":"true"}) ),
            ce("button", {type:"button", onClick:this.handleNext, 
                         className: secondaryBtnClass, "aria-label":"next"}, 
                         //trans("Next")),                          
              ce("span", {className:"glyphicon glyphicon-forward lightGlyphicon", "aria-hidden":"true"}) ),       
            ce("button", {type:"button", onClick:this.handleLast, 
                         className: secondaryBtnClass, "aria-label":"last"}, 
                         //trans("Last"))
              ce("span", {className:"glyphicon glyphicon-fast-forward lightGlyphicon", "aria-hidden":"true"}) ),
            ((this.props.count && this.props.count<=globalState.showAllLimit && this.props.count>globalState.listLimit) ?
              ce("button", {type:"button", onClick:this.handleAll, 
                         className: secondaryBtnClass, "aria-label":"all"}, 
                         //trans("Last"))
                ce("span", {"aria-hidden":"true"}, trans("Show all")) ) : ""  
            )              
            
          ),
          ce("div",{className: "autoScrollInfoRight"}, 
            ce("div", {className: "autoScrollInfoRightElem"}, 
               trans("rows")+" "+(this.props.offset+1)+" - "+(lastrownr+1)),
            ce("div", {className: "autoScrollInfoRightSep"}, "  "),
            ce("div", {className: "autoScrollInfoRightElem"}, 
              trans("count")+" "+String(this.props.count)),
            ce("div", {className: "autoScrollInfoRightSep"}, "  ")
            /*
            ce("button", {type:"button", className: secondaryBtnClass, "aria-label":"export"}, 
                         trans("Export"))
            */
          )  
        )
      )    
    );  
  }
};



class AutoList extends React.Component{  

  constructor(props) {
    super(props);
    this.state = {sort:false, sortkey:"creation_date", down: true}; 
    this.handleSort = this.handleSort.bind(this);  
  }
  handleSort(x,y) {    
    //this.setState({sort:true, sortkey:x, down:y});
    this.props.callback({op:"list",action:"sort",sortkey:x, down:y, rowid:null});
  }
  render() {   
    //console.log("AutoList props.data: ");
    //console.log(this.props.data);
    if (this.props.data==null) {
      return ce(automain.AutoAlertMessage,{alert:"nodata", alertmessage:trans("no data"), internal:false})
    }
    if (_.isArray(this.props.data) && this.props.data.length==0) {
      return null; // ce("div",{className: "nodata"},trans("currently none"));
    }
    if (!_.isArray(this.props.data)) {
      return null;
    }
    var dataHeaderCols = [];
    var viewdef=this.props.viewdef;
    var tablestyle=null;
    if (viewdef.style) tablestyle=viewdef.style;
    var fields=autoutils.orderFields(viewdef.fields);
    for (var i=0, field=""; i<fields.length; i++) {
      field=fields[i];
      if (!autoutils.fieldShow(field,"list")) continue;
      dataHeaderCols.push(
        ce(AutoListHeaderCol, {key:"list_headercol"+field.name+i, 
                               name:field.name, 
                               fieldlabel:fieldLabel(field),
                               nosort: (autoutils.hasNegativeProperty(this.props.viewdef,"sort") ||
                                        autoutils.hasNegativeProperty(field,"sort")),
                               sorted: (field["name"]==this.props.sortkey),
                               down: this.props.down,
                               isfirst: (dataHeaderCols.length<1),
                               callback:this.handleSort})
      );     
    }
    var callback=this.props.callback;
    var auxdata=this.props.auxdata;
    var dataNodes = this.props.data.map(function(datarow) {
      var key=datarowKey(datarow,viewdef);
      return (
        ce(AutoRow, {key:key, id:key, viewdef:viewdef, fields:fields, 
                    datarow:datarow, auxdata:auxdata, callback:callback})
      );
    });
    return (
      ce("table", {className:"datatable", style:tablestyle}, 
        ((autoutils.hasNegativeProperty(this.props.viewdef,"headerrow")) ?
          ce("tbody", {},          
            dataNodes
          )   
          :
          ce("tbody", {}, 
            ce("tr", {className: "tabletop"}, dataHeaderCols),
            dataNodes
          )
        )
      )  
    );  
  }
};


class AutoListHeaderCol extends React.Component{  

  constructor(props) {
    super(props);
    this.state = {hovered:false};
    this.handleClick = this.handleClick.bind(this);
    this.mouseOver = this.mouseOver.bind(this);
    this.mouseOut = this.mouseOut.bind(this);
    this.colStyle = this.colStyle.bind(this);
  }
  handleClick(e) {
    this.props.callback(this.props.name, !this.props.down);
  } 
  mouseOver(e) {
    this.setState({ hovered:true });
  }
  mouseOut(e) {
    this.setState({ hovered:false });
  }    
  colStyle() {
    var tmp;
    if (this.props.nosort) tmp="colheadernosort";
    else if (this.state.hovered) tmp="colheaderhover";
    else tmp="colheader";
    if (!this.props.isfirst) return tmp+" widelistcol";
    else return tmp+" maincol";
  }
  render() {        
    if (this.props.nosort) {      
      return ( 
        ce("th", {className: this.colStyle()}, this.props.fieldlabel)
      );
    } else {
      return ( 
        ce("td", {className: this.colStyle(), onClick: this.handleClick, 
                  onMouseOver: this.mouseOver, onMouseOut: this.mouseOut},    
          this.props.fieldlabel,                  
          ((!this.props.sorted) ?                                             
            // ce("span", {className:"clearsortmark", dangerouslySetInnerHTML:{__html:'&uarr;'}})  
            // ce("span", {className:"arrow-clear"})                     
            ce("img", {className: "sortimg", "aria-label":"sort", src: sortimage})                              
            :              
            // ce("span", {className:"sortmark", 
            //         dangerouslySetInnerHTML:{__html: ((this.props.down) ? '&uarr;':'&darr;')}})
            // ce("span", {className: ((this.props.down) ? "arrow-down" : "arrow-up")})             
            ce("img", {className: "sortimg", "aria-label":"sort", 
                       src: ((this.props.down) ? sortdownimage : sortupimage)}) 
          )                          
        )    
      );
    }    
  }  
};

function okCoords(lat,lng) {
  if (!lat || !lng) return false;
  if (lat>90 || lat<(0-90)) return false;
  return true;
}


class AutoRow extends React.Component{  

  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleRowBtnClick = this.handleRowBtnClick.bind(this);
  }
  handleClick(x) {
    if (autoutils.hasNegativeProperty(this.props.viewdef,"onclick")) {
    } else if (this.props.viewdef.onclick) {
      if (this.props.viewdef.name=='main_alerts') {
        this.props.viewdef.onclick(this.props.datarow.device_id);
      } else {  
        this.props.viewdef.onclick(this.props.id);
      }  
    } else if (this.props.viewdef.onclickRow) {
      this.props.viewdef.onclickRow(this.props.datarow);
    } else if (this.props.viewdef.name=='overview_alerts') {
      menuMap(this.props.datarow.device_id);  
    } else {
      this.props.callback({op:"view",rowid:this.props.id});
    }  
  } 
  handleRowBtnClick(e) {
    e.preventDefault();
    //menuMap(this.props.id);
    menuMap(this.props.datarow.device_id);
  } 
  render() {
    var dataCols = [];
    var fields=this.props.fields;
    var datarow=this.props.datarow;
    var rowclass="datarow";
    var name;
    var val;
    var isbutton;
    if (autoutils.hasNegativeProperty(this.props.viewdef,"onclick")) {
      rowclass="datarowNoclick"; 
    }
    //rowclass+=" redtext"
    //console.log(this.props.viewdef.name);    
    for (var i=0, field=""; i<fields.length; i++) {
      field=fields[i];
      isbutton=false;
      if (!autoutils.fieldShow(field,"list")) continue;
      var btntest=true;
      //console.log(field.name);
      //console.log(datarow[field.name]);
      if (this.props.viewdef.name=="main_media") {
        if (field.name=="start_lat" || field.name=="start_lng") {
          //console.log(datarow[field.name]);

        } 
        if (!okCoords(datarow.start_lat,datarow.start_lng)) btntest=false;
      }
      if (field["type"]=="button" && btntest) {
        isbutton=true;
        val=ce("button",{key:"listbtn"+i, className:"btn btn-default btn-xs rowbutton",
                         onClick:this.handleRowBtnClick  },
              field["label"]);
      } else if (!_.has(datarow,field.name)) {
        val="";
      } else {
        val=autoutils.replaceWithAux(
              datarow[field.name],this.props.auxdata,field.type,"value");
        if (i==0) val=String(fieldValue(val,field,"list"));
        else val=fieldListValue(fieldValue(val,field,"list"),this.props.viewdef);       
      }  
      
      if (field.name=="msg_type" && (val=="man down" || val=="need assistance")) rowclass+=" redtext";
      
      dataCols.push(ce("td", {key:"data_col"+i, 
                              className: ((dataCols.length<1) ?  
                                          "datacol" : 
                                          "datacol "+"widelistcol"), 
                              onClick:((isbutton) ? null : this.handleClick)}, 
                        val));
    }        
    return (
      ce("tr", {className: rowclass},
        dataCols
      )  
    );              
  }
};

// ---- view plain text -----


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

// ---- view record -----


class AutoView extends React.Component{  

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
    var groups=getFormGroups(viewdef,this.props.op);
    var builtgroup;
    var groupBlocks = [];
    var usedFormGroups=[];
    var inapproval=false;
    if (datarow.inapproval) inapproval=true;
    if (this.props.parent && this.props.parent.data && _.has(this.props.parent.data,"inapproval") &&
        this.props.parent.data.inapproval) inapproval=true;
    if (!groups) {
      builtgroup=
          ce(AutoHandleFormGroup, {key:autoutils.makeKey("group"), 
                             datarow: datarow, auxdata:this.props.auxdata,
                             viewdef: viewdef, op:this.props.op,
                             group: null, groupname: null,
                             rowid: this.props.rowid, callback:this.props.callback, 
                             viewallfields:this.props.viewallfields});
      if (builtgroup) groupBlocks.push(builtgroup); 
    } else {
      for (var i=0; i<groups.length; i++) {
        builtgroup=ce(AutoHandleFormGroup, {key:autoutils.makeKey("group_"+i+this.props.groupname), 
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
                               inapproval:inapproval,
                               viewallfields:this.props.viewallfields})
          :
          ""
        ),
        ((groups && viewdef["groupMenu"]!=="left") ? 
          ce(AutoFormGroupMenu, {viewdef:this.props.viewdef, groupname:this.props.groupname,op:this.props.op,
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
      if (this.props.inapproval) {
        canedit=false;
        candelete = false;
      }
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
    var group,grouplabel,groupclass;
    var groupBlocks = [];
    for (var i=0; i<groups.length; i++) {
      group=groups[i];
      if (this.props.usedgroups && this.props.usedgroups.indexOf(group.name)<0) 
         continue;
      grouplabel=fieldLabel(group);
      if (this.props.groupname==group["name"]) groupclass="active";
      else groupclass="";
      groupBlocks.push(
        /*
        ce("button", {key:i+group["name"], className: "btn btn-default btn-sm",                      
                      onClick:this.handleButton.bind(this,group["name"])}, grouplabel)
        */ 
        ce("li", {key:autoutils.makeKey("groupmenu"+i), className: groupclass,                      
                      onClick:this.handleButton.bind(this,group["name"])}, 
          ce("a", {href: "#", className: "autotablink"}, grouplabel)
        )
      );    
    }
    if (viewdef["groupMenu"]=="left") groupclass="autoFormGroupLeftMenu";
    else groupclass="nav nav-tabs autoFormGroupMenuTabs";
    return (
      ce("ul",{className:groupclass},
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
    if (conditionalHideField(field,val,datarow)) continue;    
    return false;   
  }    
  return true;   
}

  
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

function getLocalListLimit(viewdef) {
  if (_.has(viewdef,"listLimit")) return viewdef["listLimit"];
  else return autoutils.getListLimit();
}

function filterFieldShow(field,op) { 
  if (autoutils.hasNegativeProperty(field,"filter")) return false; 
  return true;
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
    var value = autoutils.replaceWithAux(uriValue, this.props.auxdata, this.props.type, "value");
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

function fieldListValue(val,viewdef) {
  var n=autoutils.getListValueLen();
  if (viewdef["listValueLen"]) n=viewdef["listValueLen"]; 
  if (_.isString(val) && val.length > n) {
    return val.substring(0,n)+"...";
  } else {
    return val;
  }  
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

function datarowKey(datarow,viewdef) {
  var key;
  var keyname="id";
  if (_.has(viewdef,"key")) keyname=viewdef["key"]; 
  key=datarow[keyname];
  if (!key) return autoutils.makeUniqueKey("datarow");
  else return key;
}

function keyName(viewdef) {
  var keyname="id";
  if (_.has(viewdef,"key")) keyname=viewdef["key"]; 
  return keyname;
}


function getAutoFilterFld(formfldname,fields) {
  var name=formfldname;
  var fld=_.findWhere(fields, {name:name});
  if (!fld && (name.endsWith("_automin") || name.endsWith("_automax"))) {
    name=name.substring(0,name.length-"_automin".length);
    fld=_.findWhere(fields, {name:name});
  }
  return fld;  
}



// ====== exported functions =========


export {
  AutoListForm,
  AutoFilterFld,
  AutoListButtons,
  AutoList,
  AutoListHeaderCol,
  AutoScrollButtons,
  AutoRow,
  AutoText,
  AutoView,
  AutoViewButtons,
  AutoFormGroupMenu,
  AutoHandleFormGroup,

  fieldLabel,
  fieldValue,
  getLocalListLimit,
  getFormGroups,

  alertClass,
  internalAlertClass,
  alertClassPrefix
}
