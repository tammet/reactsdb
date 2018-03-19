/* 
 
 Autoreact
 
 Build React components from data and viewdefs
 
 Requires just the basic react without jsx plus underscore
 
 react.min.js
 react-dom.min.js
 underscore-min.js
 
 plus autoreact own utils:
 
 autoutils.js
 autoapi.js
 autolang.js
 
 uses globalState object for configuration and
 global non-react state management

 Built using react 15.1.0
 
*/


(function(exports) {
  "use strict";
  
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

// NB! Exports are at the end of the block  


// ---- filter records -----

var AutoListForm = React.createClass({
  displayName: 'AutoListForm',
  getInitialState: function() {
    return {text: '', extfilter: false};
  },
  handleFilterChange: function(e) {
    this.setState({text: e.target.value});
  }, 
  handleExtFilterChange: function(e) {
    this.setState({extfilter: !this.state.extfilter});
  }, 
  handleSubmit: function(e) {
    e.preventDefault();
    var text = this.state.text.trim();
    this.props.onDataSubmit({text: text});
    this.setState({text: ''});
  },  
  render: function() {
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
          raw=ce(AutoEditFldHelp, {viewdef:viewdef, field:field, name:field.name, raw:raw, fieldlabel:fieldlabel});
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
});


var AutoFilterFld = React.createClass({
  displayName: 'AutoFilterFld',
  getInitialState: function() {
    return {value:this.props.value};
  },
  handleChange: function(e) {
    this.setState({value:e.target.value});
  },
  componentWillMount: function() {
    var fld=_.findWhere(this.props.viewdef.fields, {name:this.props.name});
    if (fld && (fld["type"]==="date" || fld["type"]==="datetime")) // this.setState({id: makeUniqueKey("autocmp-")});
      this.setState({id: this.props.autoid});
  },
  componentDidMount: function() {
    var fld=_.findWhere(this.props.viewdef.fields, {name:this.props.name});
    if (fld && (fld["type"]==="date" || fld["type"]==="datetime")) autoutils.setupDatePicker(this);
  },
  render: function() {        
    var name=this.props.name;
    var autoid=this.props.autoid;    
    var fld=_.findWhere(this.props.viewdef.fields, {name:this.props.name});
    var fldtype;
    var raw;
    var filterstyle=this.props.viewdef.filterstyle;
    if (_.has(fld,"type")) fldtype=fld.type;
    else fldtype="string";
    if (fldtype=="boolean") {             
      raw=ce(AutoEditFldBoolean, {defaultValue:"", rowid:null, name:name, 
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
      raw=ce(AutoEditFldOption, {defaultValue:null, rowid:null, name:name, field:fld, 
                                filtertype: this.props.filtertype, datatype: fldtype, autoid:autoid,
                                callback:this.handleChange}); 
    } else if (_.has(fld,"values") && fld["values"] && _.isArray(fld["values"])) {
      raw=ce(AutoEditFldOption, {defaultValue:null, rowid:null, name:name, field:fld,
                                filtertype: this.props.filtertype,
                                datatype: fldtype, autoid:autoid, callback:this.handleChange});    
    } else if (fldtype=="integer") {      
      raw=ce("input", {type:"text", className: "fldinput_int", "data-filter": this.props.filtertype, autoComplete:"off",
                      name:name, value:this.state.value, "data-type": fldtype, id:autoid, //key:"search_"+name+"_"+this.state.id,
                      onChange:this.handleChange});      
    } else if (isSearchType(fldtype)) {
      raw=ce(AutoEditFldSearch,{
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
      return ce(AutoEditFldHelp, {viewdef:this.props.viewdef, field:fld, name:name, raw:raw});
    } 
    return raw;    
  }  
});

// ---- list records -----

var AutoListButtons = React.createClass({
  displayName: 'AutoListButtons',
  handleSearch: function(e) {
    e.preventDefault();
    this.props.callback({op:"list",action:"search",rowid:null});
  },
  handleExtfilter: function(e) {   
    e.preventDefault();
    this.props.handleExtFilterChange();
  },
  handleAdd: function(e) {   
    e.preventDefault();
    if (this.props.viewdef.addWizard) this.handleAddWizard(e);   
    else this.props.callback({op:"add",rowid:null});
  }, 
  handleAddWizard: function(e) {   
    e.preventDefault();
    //console.log("addWizard called");    
    autoutils.modalWizard(this.props.viewdef.addWizard,this.handleDoSubmitWizard);
  }, 
  handleDoSubmitWizard: function(val) {  
    //console.log("wizard returns: ");
    //console.log(val);
    if (!val || val=="false") return;
    this.props.callback({op:"add",rowid:null,prefill:JSON.parse(val)}); 
  },    
  handleHelp: function(txt,e) {   
    e.preventDefault();
    $('#'+helpModalContentId).html(txt);
    $('#'+helpModalId).modal('show');
  }, 
  handleImport: function(e) {   
    e.preventDefault();
    autoutils.showImportModal();
  }, 
  render: function() {
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
});


var AutoScrollButtons = React.createClass({
  displayName: 'AutoScrollButtons',
  handlePrevious: function(e) {
    e.preventDefault();
    if (this.props.offset>0)
      this.props.callback({op:"list",action:"previous",rowid:null});
  }, 
  handleNext: function(e) {   
    e.preventDefault();
    this.props.callback({op:"list",action:"next",rowid:null});
    //if (this.props.data.length >= (this.props.offset+getListLimit(this.props.viewdef)))
    //      this.props.callback({op:"list",action:"next",rowid:null});
  }, 
  handleFirst: function(e) {   
    e.preventDefault();
    if (this.props.offset>0)
      this.props.callback({op:"list",action:"first",rowid:null});
  }, 
  handleLast: function(e) {   
    e.preventDefault();
    this.props.callback({op:"list",action:"last",rowid:null});
    //if (this.props.data.length >= (this.props.offset+getListLimit(this.props.viewdef)))
    //      this.props.callback({op:"list",action:"next",rowid:null});
  },
  handleAll: function(e) {   
    e.preventDefault();
    this.props.callback({op:"list",action:"all",rowid:null});
    //if (this.props.data.length >= (this.props.offset+getListLimit(this.props.viewdef)))
    //      this.props.callback({op:"list",action:"next",rowid:null});
  },
  render: function() {
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
});


var AutoList = React.createClass({
  displayName: 'AutoList',
  getInitialState: function() {
    return {sort:false, sortkey:"creation_date", down: true};
  },
  handleSort: function(x,y) {    
    //this.setState({sort:true, sortkey:x, down:y});
    this.props.callback({op:"list",action:"sort",sortkey:x, down:y, rowid:null});
  },
  render: function() {   
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
});

var AutoListHeaderCol = React.createClass({
  displayName: 'AutoListHeaderCol',
  getInitialState: function() {
    return {hovered:false};
  },
  handleClick: function(e) {
    this.props.callback(this.props.name, !this.props.down);
  }, 
  mouseOver: function(e) {
    this.setState({ hovered:true });
  },
  mouseOut: function(e) {
    this.setState({ hovered:false });
  },    
  colStyle: function() {
    var tmp;
    if (this.props.nosort) tmp="colheadernosort";
    else if (this.state.hovered) tmp="colheaderhover";
    else tmp="colheader";
    if (!this.props.isfirst) return tmp+" widelistcol";
    else return tmp+" maincol";
  },
  render: function() {        
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
});

function okCoords(lat,lng) {
  if (!lat || !lng) return false;
  if (lat>90 || lat<(0-90)) return false;
  return true;
}

var AutoRow = React.createClass({
  displayName: 'AutoRow',
  handleClick: function(x) {
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
  }, 
  handleRowBtnClick: function(e) {
    e.preventDefault();
    //menuMap(this.props.id);
    menuMap(this.props.datarow.device_id);
  }, 
  render: function() {
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
});

// ---- view plain text -----

var AutoText = React.createClass({
  displayName: 'AutoText',
  /*
  handleButton: function(statechange) {
    this.props.callback(statechange);
  }, 
  handleGroupButton: function(statechange) {
    this.props.callback({rowid:this.props.rowid, groupname:statechange["groupname"]});
  },
  */ 
  render: function() {
    var datarow=this.props.datarow;    
    return (
      ce("div",{className: "autoviewgroups"},         
        ce(automain.AutoAlertMessage,{alert:this.props.alert, alertmessage: this.props.alertmessage, internal:true}),
        ce("div",{className: "smallSpacerDiv"},""),
        ce("pre",{className: "autoPlainText"},String(datarow))              
      )  
    );  
  }
});

// ---- view record -----

var AutoView = React.createClass({
  displayName: 'AutoView',
  handleButton: function(statechange) {
    this.props.callback(statechange);
  }, 
  handleGroupButton: function(statechange) {
    this.props.callback({rowid:this.props.rowid, groupname:statechange["groupname"]});
  }, 
  render: function() {
    var viewdef=this.props.viewdef;
    var datarow=this.props.datarow;    
    var groups=getGroups(viewdef,this.props.op);
    var builtgroup;
    var groupBlocks = [];
    var usedGroups=[];
    var inapproval=false;
    if (datarow.inapproval) inapproval=true;
    if (this.props.parent && this.props.parent.data && _.has(this.props.parent.data,"inapproval") &&
        this.props.parent.data.inapproval) inapproval=true;
    if (!groups) {
      builtgroup=
          ce(AutoHandleGroup, {key:makeKey("group"), 
                             datarow: datarow, auxdata:this.props.auxdata,
                             viewdef: viewdef, op:this.props.op,
                             group: null, groupname: null,
                             rowid: this.props.rowid, callback:this.props.callback, 
                             viewallfields:this.props.viewallfields});
      if (builtgroup) groupBlocks.push(builtgroup); 
    } else {
      for (var i=0; i<groups.length; i++) {
        builtgroup=ce(AutoHandleGroup, {key:makeKey("group_"+i+this.props.groupname), 
                       datarow: datarow, auxdata:this.props.auxdata,
                       viewdef: viewdef, op:this.props.op,
                       group: groups[i], groupname: this.props.groupname,
                       rowid: this.props.rowid, callback:this.props.callback,
                      viewallfields:this.props.viewallfields});                    
        if (!isEmptyGroup(viewdef,groups[i],datarow,this.props.viewallfields)) {
          groupBlocks.push(builtgroup);                               
          usedGroups.push(groups[i].name);
        }  
      }
    }  
    return (
      ce("div",{className: "autoviewgroups"},       
        /*
        ((this.props.viewtitle) ?
          ce("div",{className: "autoviewparttitle"},
           ((this.props.rowid) ? "" : ce("h2", {}, automain.getObjectLabel(null,viewdef))),                 
           //ce("div", {}, trans("Main data")), //???? !!!!!
           ce(automain.AutoAlertMessage,{alert:this.props.alert, alertmessage: this.props.alertmessage, internal:true})
          )  // !!!????                                
          //ce("h2",{className: "autoviewparttitle"}, this.props.viewtitle)
          : ""),                   
        */
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
          ce(AutoGroupMenu, {viewdef:this.props.viewdef, groupname:this.props.groupname,op:this.props.op,
                            usedgroups:usedGroups,
                            callback: this.handleGroupButton}) 
           : 
           ""
        ),
        ((!groups) ? ce("div",{className: "smallSpacerDiv"},"") : ""),
        ((!_.isEmpty(groupBlocks)) ? groupBlocks : "") 
      )  
    );  
  }
});

var AutoViewButtons = React.createClass({
  displayName: 'AutoViewButtons',
  handleEdit: function(e) {
    e.preventDefault();
    removeAlert();
    this.props.callback({op:"edit",rowid:this.props.rowid, alert:false});
  }, 
  handleViewAllFields: function(e) {   
    e.preventDefault();
    this.props.callback({op:"view",rowid:this.props.rowid, action:"showallfields"});
  },
  handleHideEmptyFields: function(e) {   
    e.preventDefault();
    this.props.callback({op:"view",rowid:this.props.rowid, action:"hideemptyfields"});
  },
  handleNewVersion: function(e) {   
    var thisValue=this;
    e.preventDefault();
    removeAlert();
    autoutils.modalGetValue(trans("New version name or number"),this.handleMakeVersion);   
  },
  handleMakeVersion: function(val) {                 
    if (!val) return;
    autoutils.debug(val);
    this.props.callback({op:"view",action:"newversion","versionNr":val});
  },
  /*
  handleSubmitApproval: function(e) {
    e.preventDefault();
    autoutils.modalConfirm(trans("Submit to approval?"),this.handleDoSubmitApproval);
  },
  handleDoSubmitApproval: function(val) {  
    if (val!="true") return;
    this.props.callback({op:"view",action:"submitapproval"});    
  },
  */
  handleDelete: function(e) {   
    e.preventDefault();
    removeAlert();
    autoutils.modalConfirm(trans("Delete the item?"),this.handleDoDelete);   
  },  
  handleDoDelete: function(val) { 
    if (val!="true") return;  
    this.props.callback({op:"edit",action:"delete", rowid:this.props.rowid, alert:false});    
  },
  handleExport: function(val) { 
    console.log("handleExport");   
  },
  handleAutorefresh: function(val) { 
    console.log("handleAutorefresh");
    this.props.callback({op:"view",rowid:this.props.rowid, action:"startautorefresh"});       
  },
  render: function() {    
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
                          trans("View also empty fields")) )),
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
});

// ---- common form group handling for view, edit, add record -----


var AutoGroupMenu = React.createClass({
  displayName: 'AutoGroupMenu',
  handleButton: function(name,e) {
    e.preventDefault();
    this.props.callback({groupname:name});
  }, 
  render: function() {   
    var viewdef=this.props.viewdef;
    if (!viewdef["groupMenu"]) return ce("span",{},"");
    var datarow=this.props.datarow;  
    var groups=getGroups(viewdef,this.props.op);
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
        ce("li", {key:makeKey("groupmenu"+i), className: groupclass,                      
                      onClick:this.handleButton.bind(this,group["name"])}, 
          ce("a", {href: "#", className: "autotablink"}, grouplabel)
        )
      );    
    }
    if (viewdef["groupMenu"]=="left") groupclass="autoGroupLeftMenu";
    else groupclass="nav nav-tabs autoGroupMenuTabs";
    return (
      ce("ul",{className:groupclass},
        groupBlocks
      )      
    );     
  }
});


var AutoHandleGroup = React.createClass({
  displayName: 'AutoHandleGroup',
  /*
  getInitialState: function() {
    var val=this.props.datarow;
    val=autoutils.cloneObject(val);  
    return {datarow:val};
  },
  */  
  handleButton: function(op) {
    this.props.callback({op:op,rowid:this.props.rowid});
  }, 
  handleChange: function(op) {
    if (op)  this.props.callback(op);
    else this.props.callback({alert:false});
  },
  render: function() {
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
        // Now aux replacement is done inside fieldValue() method
        /*
        if (isSearchType(field.type)) {
          val=autoutils.replaceWithAux(val,this.props.auxdata,field.type,"both");
        }
        */
        dataFields.push(
          ce("div",{key:makeKey("group_vfld"+i), className: "row fldrow"},
            ce("div", {className: "col-md-4 fldlabel"}, fieldLabel(field)),
            ce("div", {className: "col-md-8 "+valueclass}, fieldValue(val,field,null,datarow, this.props.auxdata))
          )  
        );
      } else {   
        // edit form        
        if (this.props.rowid===null && !autoutils.fieldShow(field,"add")) continue;
        if (!autoutils.fieldShow(field,"edit")) {
          dataFields.push(
            ce(AutoHiddenFld,{key:makeKey("group_hiddenfld"+field.name+"_"+i),
                             name:field.name, rowid:this.props.rowid, value:val, 
                             viewdef:this.props.viewdef})
          ); 
        } else if (conditionalHideField(field,val,datarow)) {
          dataFields.push(
            ce(AutoHiddenFld,{key:makeKey("group_hiddenfld"+field.name+"_"+i),
                             name:field.name, rowid:this.props.rowid, value:val, 
                             viewdef:this.props.viewdef})
          );           
        } else if (autoutils.hasNegativeProperty(field,"edit") || 
                   (field["name"] === "owner" && !autoutils.canChangeOwner(viewdef['object'], datarow))) {
          dataFields.push(
            ce("div",{key:makeKey("group_hfld"+field.name+"_"+i), className: "row fldrow"},
              ce(AutoHiddenFld,{name:field.name, rowid:this.props.rowid, value:val, 
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
            ce("div",{key:makeKey("group_efld"+i), className: "row fldrow"},                                                                      
              ce("div", {className: "col-md-4 fldlabel"}, 
                ce("label",{className: "fldlabel", htmlFor: autoid},fieldlabel) ),                     
              ce("div", {className: "col-md-8 fldinputcol"}, 
                ce(AutoEditFld, {name:field.name, rowid:this.props.rowid, value:val,
                                 auxdata:this.props.auxdata, fieldlabel:fieldlabel, 
                                 autoid:autoid, parent:this.props.parent,
                                 viewdef:this.props.viewdef, callback:this.handleChange, datarow: this.props.datarow})
              )                        
              /*
              ce("div", {className: "col-md-4 fldlabel"}, fieldlabel),
              ce("div", {className: "col-md-8 fldinputcol"}, 
                ce(AutoEditFld, {name:field.name, rowid:this.props.rowid, value:val,
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
});


function isEmptyGroup(viewdef,group,datarow,viewallfields) {       
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


// ---- edit/add record -----


var AutoEdit = React.createClass({
  displayName: 'AutoEdit',
  handleButton: function(statechange) {
    this.props.callback(statechange);
  }, 
  handleGroupButton: function(statechange) {    
    this.props.callback({rowid:this.props.rowid, groupname:statechange["groupname"]});
  },        
  render: function() {
    var viewdef=this.props.viewdef;
    var datarow=this.props.datarow;     
    var groups=getGroups(viewdef,this.props.op);    
    var groupBlocks = [];
    if (!groups) groupBlocks.push(
          ce(AutoHandleGroup, {key:makeKey("group_edit"), 
                             datarow: datarow, auxdata:this.props.auxdata,
                             viewdef: viewdef, op:this.props.op,
                             group: null, groupname: null,
                             parent:this.props.parent,
                             rowid: this.props.rowid, callback:this.props.callback})
        );
    else                            
      for (var i=0; i<groups.length; i++) {
        groupBlocks.push(
          ce(AutoHandleGroup, {key:makeKey("group_edit"+i), 
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
          ce(AutoGroupMenu, {viewdef:this.props.viewdef, groupname:this.props.groupname,op:this.props.op,
                            callback: this.handleGroupButton}) 
           : 
           ""
        ),
        groupBlocks
      )  
    );  
  }
});

var AutoEditButtons = React.createClass({
  displayName: 'AutoEditButtons',
  handleSave: function(e) {
    e.preventDefault();    
    removeAlert();
    this.props.callback({action:"save",rowid:this.props.rowid});
    return false;
  },
  handleCancel: function(e) { 
    e.preventDefault(); 
    removeAlert();
    if (this.props.rowid===null) this.props.callback({op:"list", action:"fresh", alert:false});
    else this.props.callback({op:"view", alert:false});
    return false;
  },
  render: function() {    
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
});

var AutoEditFld = React.createClass({
  displayName: 'AutoEditFld',
  // Notes:
  // * if this.props.rowid===null, we add a new row, otherwise edit an existing row  
  // * this.props.value is the original value (for editing), this.state.value is the changed value
  // * hovered indicates whether help is currently shown (due to hover or click on the ? mark)
  getInitialState: function() {
    return {value:this.props.value}; //, searchValue: "", dynoptions:null};
  },  
  handleChange: function(e) {  
    //autoutils.debug("handleChange");    
    var thisfld,fld,val,i,found,flddata;
    var input=e.target; 
    removeAlert();
    
    //autoutils.debug("field changed to "+input.value);
    // check if the changed field is a condition in some showOnlyWhen condition
    // if yes, callback to redraw the whole resource
    if (!this.props.complexCallback && this.props.viewdef) {
      thisfld=_.findWhere(this.props.viewdef.fields, {name:this.props.name});
      found=false;
      // TODO: Ask from Tanel why it is not good idea to always change the global state:
      /*for(i=0; i<this.props.viewdef.fields.length; i++) {
        fld=this.props.viewdef.fields[i];
        if (!fld.showOnlyWhen) continue;
        if (_.has(fld.showOnlyWhen,this.props.name)) { 
          val=autoutils.formvalueToJson(input.value,thisfld.type);    
          this.props.callback({"action":"redraw","setFieldKey":thisfld.name, 
                             "setFieldValue":val, "alert": false});
          break; 
        }        
      }*/
      val=autoutils.formvalueToJson(input.value,thisfld.type);
      this.props.callback({"action":"redraw","setFieldKey":thisfld.name,
        "setFieldValue":val, "alert": false});
    }
    // change visible field locally
    if (input.getAttribute("data-type")==="json") {
      this.setState({value:JSON.parse(input.value)});
    } else {
      this.setState({value:input.value});
    }  
    // if field is a part of a complex value
    if (this.props.complexCallback) this.props.complexCallback(input.value);      
  },
  handleFileChange: function(e) { 
    removeAlert();
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
  },
  handleFileChangeFinal: function(widget,fname,fcontent) {
    widget.setAttribute("data-filecontent",fcontent);    
  },
  handleMultipleChange: function(e) {
    autoutils.debug("handleMultipleChange called");
    removeAlert();
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
  },
  handleComplexChange: function(e) {
    var name=this.props.name;    
    this.setState({value:e});
    if (this.props.complexCallback) this.props.complexCallback(e.target.value); 
  },
  componentWillMount: function() {
    if (this.props.viewdef) {
      var fld=_.findWhere(this.props.viewdef.fields, {name:this.props.name});    
      if (fld && fld["type"]==="date") {
        if (this.props.autoid) this.setState({id: this.props.autoid}); 
        else this.setState({id: makeUniqueKey("autocmp-")});    
      }  
    }  
  },
  componentDidMount: function() {
    if (this.props.viewdef) {
      var fld=_.findWhere(this.props.viewdef.fields, {name:this.props.name});
      if (fld && fld["type"]==="date") autoutils.setupDatePicker(this);
    }    
  },
  render: function() { 
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
      raw = ce(AutoEditFldComplex, params);
      // TODO: FIX THIS!
    /*} else if ((!autoutils.isArrayType(fldtype) && !autoutils.isSimpleType(fldtype))) {
      // complex: one object
      params["callback"] = this.handleComplexChange;
      params['single'] = true;
      raw = ce(AutoEditFldComplex, params);*/
    } else if (fldtype==="base64") {
      var widgetparams={type:"file", className:'btn btn-default btn-xsm', 
                        //value: filename,
                        name:name, "data-type": "base64", "data-encoding": "base64",                               
                       "data-save":'value', "autoComplete":"off", onChange:this.handleFileChange};
      if (autoid) widgetparams.id = autoid;                       
      raw=ce("input", widgetparams); 
    } else if (isSearchType(fldtype)) {
      raw=ce(AutoEditFldSearch,{
             //handleChange:this.handleChange,
             value:this.props.value,
             viewdef:this.props.viewdef,
             name:this.props.name,
             parentName:this.props.parentName,
             arrayIndex:this.props.arrayIndex,
             complexCallback: this.props.complexCallback,  
             //searchValue:this.state.searchValue,
             datarow: this.props.datarow,
             autoid: autoid, 
             parent:this.props.parent,
             auxdata: this.props.auxdata}
      );             
    } else { 
      // default case
      if (fldtype==="json") {
        value=JSON.stringify(value);
        widget="textarea";        
      }  
      var widgetparams={type:"text", className:cssclass, name:name, value:value, "data-type": fldtype,                               
                       "data-save":'value', onChange:this.handleChange};
      if (autoid) widgetparams.id=autoid;                       
      if (fldtype==="json") widgetparams["data-encoding"]="json";                
      if (widgetparams.value===null) widgetparams.value="";                       
      if (fld && fld["mustFill"]===true) widgetparams["data-mustfill"]="true";                       
      if (this.props.parentName) widgetparams["data-parentname"]=this.props.parentName;
      if (this.props.arrayIndex || this.props.arrayIndex===0) widgetparams["data-arrayindex"]=this.props.arrayIndex;                
      if (this.props.id) widgetparams["id"]=this.props.id;                       
      if (this.props.className) widgetparams["className"]=this.props.className;
      if (widget==="url") widget="input";
      raw=ce(widget, widgetparams);                            
    }       
    // finally, embed the field (regardless of type) into help
    if (_.has(fld,"help")) {
      raw=ce(AutoEditFldHelp, 
             {viewdef:this.props.viewdef, field:fld, name:name, raw:raw, fieldlabel:this.props.fieldlabel});
    }
    return raw;
  }  
});

function isSearchType(fldtype) {
  return autoutils.isRefType(fldtype);
  /*
  if (fldtype=="ref:infosystem") return true;
  if (fldtype=="ref:service") return true;
  if (fldtype=="ref:classifier") return true;
  if (fldtype=="ref:infosystem_by_id") return true;
  if (fldtype=="ref:function") return true;
  if (fldtype=="ref:organization") return true;
  //if (fldtype=="ref:person") return true;

  return false;
  */
}

  /*

        "refField" : "uri",
        "nameField" : "name",
  */

var AutoEditFldSearch= React.createClass({
  displayName: 'AutoEditFldSearch',
  /*
  propTypes: {
    viewdef: React.PropTypes.object.isRequired,
    value: React.PropTypes.string,
    fldtype: React.PropTypes.string,
    name: React.PropTypes.string,
    complexCallback: React.PropTypes.func,
    show: React.PropTypes.string,
    datarow: React.PropTypes.object,
    auxdata: React.PropTypes.object,
    parentName: React.PropTypes.string,
    arrayIndex: React.PropTypes.number
  },
  */
  getInitialState: function() {
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
    var searchValue = autoutils.replaceWithAux(this.props.value, this.props.auxdata, fldtype);
    if (this.props.value && this.props.value===searchValue) searchValue="";
    return {value:this.props.value, searchValue: searchValue, dynoptions:null,
            fld:fld, fldtype:fldtype, selindex:null,
            kind:kind, idfldname:idfldname, namefldname:namefldname};
  }, 
  // called when id field content is changed by user
  handleChange: function(e) {   
    var input=e.target; 
    removeAlert();
    this.setState({value:input.value, searchValue: "", dynoptions:null, selindex:null});
    if (this.props.complexCallback) this.props.complexCallback(input.value); 
  },
  // called when search field content is changed by user
  handleDynamicSearchFieldChange: function(e) { 
    var input=e.target;
    if (isSearchType(this.state.fldtype)) {
      if (!input.value) {
        if (this.props.show=="searchfield")
          this.setState({dynoptions: null, value:"", selindex:null});
        else 
          this.setState({dynoptions: null, selindex:null});
      } else {
        var filter = null;
        if (_.has(this.state.fld, 'restriction')) {
          var restriction = this.state.fld.restriction;
          filter=autoutils.makeFilterFromRestriction(restriction,this.props.datarow,this.props.parent);
        }

        autoapi.dynamicSearchByName(this,this.state.fldtype,input.value,
                                  this.state.kind,this.state.idfldname,
                                  this.state.namefldname, filter);
      }        
    }        
    this.setState({searchValue:input.value});  
  },  
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
  handleDynamicOptionsChange: function(options) {
    this.setState({dynoptions: options});
  },
  // called when a dynamically built option is clicked
  handleDynamicOptionsClick: function(name,value,event) {
    this.setState({searchValue: name, value:value, dynoptions:null});
    if (this.props.auxdata) autoutils.addToAux(value, name, this.props.auxdata, this.props.fldtype);
    if (this.props.complexCallback) this.props.complexCallback(value);
  },  
  render: function() {
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
    params2={type:"text",className:'fldinput',key:makeKey("autosearch"+name),
             onChange:this.handleDynamicSearchFieldChange,
             //onKeyDown:this.handleKey, 
             value:val2};    
    if (!val2) params2["placeholder"]=trans("name");
    raw=ce("div",{key:makeKey(name+"_dynfieldswrap"+this.props.parentName+this.props.arrayIndex)},
          ce("div",{className:"nowrap",key:makeKey(name+"_dynfieldsinwrap"+this.props.parentName+this.props.arrayIndex)},
            ce("input",params1),
            ((this.props.show=="searchfield") ? "" : ce("span",{className: "dynamicSearchLabel"},trans("code")))
          ),    
          ce("div",{className:"nowrap"},
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
});  


function embedFieldDynamicOptions(ctxt,fields,options,name,outerkey,idfldname,namefldname,showtype,selindex) { 
  var i,val,shownoptions=[],cls;
  if (!options) options=[];
  for (i=0; options && i<options.length && i<100; i++) {      
    val=options[i][namefldname];
    if (options[i]["eesnimi"]) {
      val=val+", "+options[i]["eesnimi"];
    }
    shownoptions.push(
      ce("li",{key:makeKey(name+"_dynopt"+i), 
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
    ce("div",{className: cls,key:makeKey("outersearchfield"+name+outerkey)}, 
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


// edit a complex (non-atomic) field

var AutoEditFldComplex= React.createClass({
  displayName: 'AutoEditFldComplex',
  handleChange: function(i,key,v) {
    removeAlert();
    var val=this.props.value;                       
    val[i][key]=v;
  },
  handleAdd: function(e) {
    removeAlert();
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
  },
  handleDelete: function(i,e) {
    removeAlert();
    var j,val,newval;
    val=this.props.value;
    newval=[];
    for(j=0;j<val.length;j++) {
      if (j===i) continue;
      newval.push(val[j]);
    }
    this.props.callback(newval);        
  },
  render: function() {
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
        label=fieldLabel(_.findWhere(subflds,{"name":key}));
        fld=ce(AutoEditFld, {key: makeUniqueKey("complex"), //makeKey("complex"+key+i+"_"+j),
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
              ce("tr",{key:makeKey("complex_tr_"+key+i+"_"+j)},
                ce("td",{className: "autoEditTableKey"}, label),
                ce("td",{}, fld)
              )
        );   
      }
      tmp=ce("tr",{key: makeUniqueKey("complex_tr")}, //key:makeKey("complex_xtr_"+this.props.field["name"]+i)},         
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
    tmp=ce("tr",{key: makeUniqueKey("complex")}, //{key:makeKey("complex_toptr"+fld["name"])},         
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
});      

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

var AutoEditFldStringArray= React.createClass({
  displayName: 'AutoEditFldStringArray',
  getInitialState: function() {
    return {value:this.props.value};
  },
  handleAdd: function(e) {  
    var id="#"+this.props.name+"__addelfld";
    var av=$(id).val();
    var nv;
    if (!av) return;
    if (!this.state.value) nv=[av];    
    else nv=this.state.value.concat(av);    
    this.setState({value:nv});
  },
  handleDelete: function(i,e) {
    var v=this.state.value, nv=[];
    for(var j=0; j<v.length; j++) {
      if (j!==i) nv.push(v[j]);
    }    
    this.setState({value:nv});
  }, 
  handleHiddenChange: function(e) {
  },
  render: function() {
    var value=this.state.value;      
    var val=value, rows=[], row, i, modval;      
    var fld=this.props.field;
    var arraysubtype=autoutils.arraySubtype(fld.type);
    var isSearchSubtype = isSearchType(arraysubtype);
    if (val) {    
      for(i=0;i<val.length;i++) {
        if (isSearchSubtype) modval=autoutils.replaceWithAux(val[i],this.props.auxdata,arraysubtype,"value");
        else modval=val[i];
        if (_.isObject(modval)) continue;
        row=ce("div",{key:makeKey("complex_carr"+i), className: "autoSimpleArrayRow"},         
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
      enterblock=ce(AutoEditFldSearch,{           
             value:"",
             fldtype:arraysubtype,
             id: this.props.name+"__addelfld",
             nosave: true,
             name:this.props.name,
             auxdata: this.props.auxdata
      }
      );             
    } else {
      enterblock=ce(AutoEditFld, {key: makeKey("complex_rowx"),
                     value:"",
                     id: this.props.name+"__addelfld"}
      );
    }        
    row=ce("div",{key:makeKey("complex_carr"), className: "autoSimpleArrayRow"},
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
});

var AutoEditFldBoolean= React.createClass({
  displayName: 'AutoEditFldBoolean',
  render: function() {
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
});

var AutoEditFldOption= React.createClass({
  displayName: 'AutoEditFldOption',
  render: function() {
    var values=this.props.field["values"];
    var options = [], ovalue="", svalue="", found=false, i=0, altvalue=null;
    if (_.isNumber(this.props.value)) altvalue=this.props.value.toString();    
    if (this.props.filtertype) {
      if (values && values[0][0]) {
        options.push(ce("option",{key:makeKey("option"), value:""},""));
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
      options.push(ce("option",{key:makeKey("option_el"+ovalue+"_"+i), value:ovalue},svalue));
    }
    if (this.props.rowid!==null && !found) {
      // original value in edit not given in values list in viewdef: add as the first element
      options.unshift(ce("option",{key:makeKey("option_extra"), 
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
});

var AutoEditFldMultiple= React.createClass({
  displayName: 'AutoEditFldMultiple',
  render: function() {
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
      options.push(ce("option",{key:makeKey("multiple_option"+i+"_"+ovalue), value:ovalue},svalue));
    }
    for(j=0; j<datavalues.length; j++) {
      if (valuespure.indexOf(datavalues[j])<0) 
        options.push(ce("option",{key:makeKey("option_el"+String(i)+"_"+String(j)+datavalues[j]), 
                                  value:datavalues[j]},datavalues[j]));
    }
    /*
    if (this.props.rowid!==null && !found && false) {
      // original value in edit not given in values list in viewdef: add as the last element
      options.push(ce("option",{key:makeKey("multiple_extra"), 
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
});

var AutoEditFldHelp= React.createClass({
  displayName: 'AutoEditFldHelp',
  getInitialState: function() {
    return {hovered:false, fixed: false};
  },
  getHelpText: function() {    
    var fld=_.findWhere(this.props.viewdef.fields, {name:this.props.name});
    return langelem(fld["help"]);    
  },
  handleModalHelp: function(e) {
    e.preventDefault();
    $('#'+helpModalContentId).html(this.getHelpText());
    $('#'+helpModalId).modal('show');
  },  
  handleClickHelp: function(e) {
    e.preventDefault();
    if (this.state.fixed)  this.setState({ fixed:false });
    else this.setState({ fixed:true });
  },   
  mouseOverTip: function(e) {
    this.setState({ hovered:true });
  },
  mouseOutTip: function(e) {
    this.setState({ hovered:false });
  },    
  helpStyle: function() {
    if (this.state.fixed || this.state.hovered) return shownTipClass;
    else return hiddenTipClass;    
  },
  render: function() {
    var fld=this.props.field;
    var help,helptext=this.getHelpText();
    if (this.props.fieldlabel==helptext) {
      return this.props.raw;
    }
    if (fld["helptype"]=="modal" || (_.isString(helptext) && 
                                     helptext.length>autoutils.getModalHelpLengthLimit)) {
      help=ce("div", {className: "helpblock"},
              ce("button", {className:helpBtnClass, onClick:this.handleModalHelp, 
                           onMouseOver: this.mouseOverTip, onMouseOut: this.mouseOutTip,
                           "aria-label": "help", type: "button"}, "?"),
              ce("div",  {className: this.helpStyle()}, 
                  helptext.substring(0,autoutils.getModalHelpLengthLimit())+" ...") 
            );
    } else if (fld["helptype"]==="click" || isTouchDevice()) {
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
});


var AutoHiddenFld = React.createClass({
  displayName: 'AutoHiddenFld',
  // Notes:
  // * if this.props.rowid===null, we add a new row, otherwise edit an existing row  
  // * this.props.value is the original value (for editing), this.state.value is the changed value
  render: function() { 
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
});
  
/* ====== small utilities ====== */

function getGroups(viewdef,op) {
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
  //console.log(val);
  //console.log(fld);
  //if (_.has(field,"label")) return fldtrans(field["label"]);
  /*
  if (fld && fld.name=="access_restriction") {
    console.log("access_restriction: ");
    console.log(fld);
    console.log(val);
    console.log(showcontext);
    console.log(auxdata);
  }
  */
  /*
  if (fld && fld.name=="organizations") {
    console.log("organizations: ");
    console.log(fld);
    console.log(val);
    console.log(showcontext);
    console.log(auxdata);
  }
  */  
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
    return autoutils.formatDate(String(val));    
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
  } else if (isSearchType(fldtype)) {
    return ce(ShowRefField, {type: fldtype, auxdata: auxdata}, val);
  } else {
    return String(val);
  }  
}

var ShowRefField = React.createClass({
  displayName: 'ShowRefField',
  propTypes: {
    type: React.PropTypes.string,
    auxdata: React.PropTypes.object,
    children: React.PropTypes.any
  },

  render: function () {
    var uriValue = String(this.props.children);
    var link = autoutils.getLinkForUri(uriValue);
    var value = autoutils.replaceWithAux(uriValue, this.props.auxdata, this.props.type, "value");
    if (link !== null) return ce(AutoLink, {href: link}, value);
    return ce("span", {}, String(value));
  }
});

var AutoLink = React.createClass({
  displayName: 'AutoLink',
  propTypes: {
    href: React.PropTypes.string.isRequired,
    children: React.PropTypes.any
  },

  render: function () {
    // TODO: Replace with inner navigation?
    //return ce("a", {href: this.props.href, target: "external"}, this.props.children);
    return ce("span", {}, this.props.children);
  }
});

function makeDocumentUrl(id,val) {
  var url; // "http://192.168.50.106:8080/rest/api/file/99567?token=testToken";
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
    if (isSearchType(itemType)) s = ce(ShowRefField, {type: itemType, auxdata: auxdata}, s);
    row=ce("div",{key:makeKey("slvalue"+i), className: "autoSimpleArrayRowView"},         
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
        ce("tr",{key:makeKey("scomp_tr"+i*1000+j+String(keys[j]))},
          ce("td",{className: "autoValTableKey"}, label),
          ce("td",{className: "autoValTableVal"},
                   //fieldValue(val[i][keys[j]],null))
                   fieldValue(val[i][keys[j]],subfld, null, null, auxdata))
        )
      );   
    }
    if (i<val.length-1) {
      tmp.push(
        ce("tr",{key:makeKey("scomp_tr_val"+i*1000+j+String(keys[j])), className: "autoValTableSep"},
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
  if (!key) return makeUniqueKey("datarow");
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

function isTouchDevice() {
  return 'ontouchstart' in window        // works on most browsers 
      || navigator.maxTouchPoints;       // works on IE10/11 and Surface
};

function makeKey(s) {
  return s;
}

function makeUniqueKey(s) {
  return _.uniqueId(s);
}

function removeAlert() {
  //$("#alertmessage").remove();
  //$("#alertmessage").html("");
  $("#alertmessage").hide();
}

// ====== exported functions =========

exports.AutoListForm = AutoListForm;
exports.AutoFilterFld = AutoFilterFld;
exports.AutoListButtons = AutoListButtons;
exports.AutoList = AutoList;
exports.AutoListHeaderCol = AutoListHeaderCol;
exports.AutoScrollButtons = AutoScrollButtons;
exports.AutoRow = AutoRow;
exports.AutoText = AutoText;
exports.AutoView = AutoView;
exports.AutoViewButtons = AutoViewButtons;
exports.AutoGroupMenu = AutoGroupMenu;
exports.AutoHandleGroup = AutoHandleGroup;
exports.AutoEdit = AutoEdit;
exports.AutoEditButtons = AutoEditButtons;
exports.AutoEditFld = AutoEditFld;
exports.AutoEditFldSearch = AutoEditFldSearch;
exports.AutoEditFldBoolean = AutoEditFldBoolean;
exports.AutoEditFldOption = AutoEditFldOption;
exports.AutoEditFldMultiple = AutoEditFldMultiple;
exports.AutoEditFldHelp = AutoEditFldHelp;
exports.internalAlertClass = internalAlertClass;

exports.fieldLabel = fieldLabel;
exports.fieldValue = fieldValue;
exports.getLocalListLimit = getLocalListLimit;
exports.getGroups = getGroups;

exports.alertClass = alertClass;
exports.internalAlertClass = internalAlertClass ;
exports.alertClassPrefix = alertClassPrefix;

// ====== module end ==========

})(typeof exports === 'undefined'? this.autoreact = {} : exports);
