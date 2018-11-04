/* 
 
 Autoreact data list and search form
 
*/

import * as autoutils from './autoutils.js';
import * as automodals from './automodals.js';
import * as autolang from './autolang.js';
import * as automain from './automain.js';
import * as autoedit from './autoedit.js';
import * as autoform from './autoform.js';
import * as autofldsrch from './autofldsrch.js';

// ====== module start =========
  
// styling buttons etc, default bootstap

var primaryBtnClass = "btn btn-primary btn-sm";  
var secondaryBtnClass = "btn btn-default btn-sm";  

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
      fieldlabel=autoform.fieldLabel(field);
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
      raw=ce(autofldsrch.AutoEditFldSearch,{
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

function filterFieldShow(field,op) { 
  if (autoutils.hasNegativeProperty(field,"filter")) return false; 
  return true;
}

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
    var i,extfilter=false,help=false;
    var canimport=false;
    if (this.props.viewdef && this.props.viewdef.object &&
        _.indexOf(["infosystem","area", "classifier", "xmlasset"], // "service", 
                  this.props.viewdef.object)>=0) {
      canimport=true;
    }
    if (this.props.viewdef.help) help=langelem(this.props.viewdef.help);    
    extfilter=_.some(this.props.viewdef["fields"],function(v) {return (v["extfilter"]===true) });  
    if (!this.props.searchbutton && !extfilter) {
      if (autoutils.hasNegativeProperty(this.props.viewdef,"edit")) {
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
          ((autoutils.userAllowedAdd(this.props.viewdef) && !autoutils.hasNegativeProperty(this.props.viewdef,"edit")) ?
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
            ((autoutils.userAllowedAdd(this.props.viewdef) && !autoutils.hasNegativeProperty(this.props.viewdef,"edit")) ?
              ce("input", {type:"submit", onClick:this.handleAdd, className:  secondaryBtnClass, value:trans("Add")})
              : ""),
            ((canimport &&
              autoutils.userAllowedAdd(this.props.viewdef) && !autoutils.hasNegativeProperty(this.props.viewdef,"edit")) ?
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
                               fieldlabel:autoform.fieldLabel(field),
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
        val=datarow[field.name];
        if (i==0) val=String(autoform.fieldValue(val,field,"list"));
        else val=fieldListValue(autoform.fieldValue(val,field,"list"),this.props.viewdef);       
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



  
/* ====== small utilities ====== */


function getLocalListLimit(viewdef) {
  if (_.has(viewdef,"listLimit")) return viewdef["listLimit"];
  else return autoutils.getListLimit();
}

function datarowKey(datarow,viewdef) {
  var key;
  var keyname="id";
  if (_.has(viewdef,"key")) keyname=viewdef["key"]; 
  key=datarow[keyname];
  if (!key) return autoutils.makeUniqueKey("datarow");
  else return key;
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

// ====== exported functions =========


export {
  AutoListForm,
  AutoFilterFld,
  
  AutoListButtons,
  AutoList,
  AutoListHeaderCol,
  AutoScrollButtons,
  AutoRow,

  getLocalListLimit,
}
