/* 
 
 Automain
 
*/

import * as autoutils from './autoutils.js';
import * as autolang from './autolang.js';
import * as autoapi from './autoapi.js';
import * as autoreact from './autoreact.js';
import * as autocomp from './autocomp.js';

// ====== module start =========
  
// convenient shorthands

var ce = React.createElement; 
var trans = autolang.trans; 
var fldtrans = autolang.fldtrans;
var langelem = autolang.langelem;  
   
  
// ===== react components ============   

  
// --- top level ----

/* call AutoResource like React.createElement(autoreact.AutoResource, props)
   where props is globalState; see init.js 
*/


class AutoResource extends React.Component{
 
  constructor(props) {
    super(props);
    autoutils.debug("getInitialState");   
    var state=this.prepareState(this.props);
    if (this.props.op=="list" || this.props.op=="view") {
      state["action"]="wait";    
    }  
    this.state = state;
    this.prepareState = this.prepareState.bind(this);
    this.simpleUpdateState = this.simpleUpdateState.bind(this);
    this.updateState = this.updateState.bind(this);
    this.loadDataFromServer = this.loadDataFromServer.bind(this);
  }
  
  // pepareState is an utility used by updateState 
  
  prepareState(input) { 
    autoutils.debug("prepareState with input");
    var viewdef=_.findWhere(input.viewdefs, {name:input.viewname});   
    var groups=autoreact.getGroups(viewdef,"view"); // default prepare groups for view
    var groupname=null;
    if (groups) {
      if (input.groupname) groupname=input.groupname;
      else groupname=groups[0]["name"];
    }
    var offset=input.offset;
    if (!offset) offset=0;
    var sortparams=getSortParams(viewdef,input.sortkey,input.down);    
    var sortkey=sortparams[0];
    var down=sortparams[1];
    return {data: [], viewdef:viewdef, parent:input.parent,
           op:input.op, rowid:input.rowid, 
           groups:groups, groupname:groupname, 
           viewallfields:input.viewallfields,
           offset: offset, sort:true, sortkey:sortkey, down: down, filter:input.filter,
           forcefilter:input.forcefilter, filterdata:input.filterdata,    
           refkey: input.refkey, prefill:null,                   
           simplemenuselectname: null, alert: false, alertmessage: ""};
  }
  
  // normally we call updateState, not simpleUpdateState (we do not directly call AutoResource.setState)
  
  simpleUpdateState(statechange) {
    
    this.setState(statechange);
  }
  
  // normally we call updateState (we do not directly call AutoResource.setState)
  
  updateState(statechange)  { // {op:.., action: ... rowid:..., group:...,)    
    var tmpstate,filter,refkey,stateprams,useViewdef,tmpdata,isParentView=false,tst=false,wait=false,viewdef;

    
    // ------ showing all or only filled fields ----
    
    if (this.state.op=="view" && statechange.op=="view" && statechange.action=="showallfields") {
      this.setState({viewallfields:true});
      return;
    } else if (this.state.op=="view" && statechange.op=="view" && statechange.action=="hideemptyfields") {
      this.setState({viewallfields:false});
      return;
    }
    
    // --- redraw with a changed field value and no alert ----
    
    if (statechange["action"]=="redraw") {
      //autoutils.debug("redraw");
      if (statechange.setFieldKey) {
        var tmp=this.state.data;
        if (!tmp) tmp={};
        tmp[statechange.setFieldKey]=statechange.setFieldValue;
        this.setState({data: tmp, alert: false});
      } else {
        this.forceUpdate();
      }  
      return;
    }
    
    // --- add new record ----
    
    if (statechange["op"]==="add") {  
      //autoutils.debug("statechange.op==add");
      //autoutils.debug("prefill:");
      //autoutils.debug(statechange.prefill);
      this.setState({"data":{}, "prefill":statechange.prefill});   
    }
    
    // --- simple menu select action ----
    
    if (statechange["action"]=="simplemenuselect") {
      var mname=statechange.simplemenuselectname;
      autoutils.debug("simplemenuselect: !"+mname+"!");
      viewdef=autoutils.getViewdef(statechange.simplemenuselectname);     
      stateparams={"op":"list","action":"sort","viewdef":viewdef, "preaction":"reset",
                    "simplemenuselectname":statechange.simplemenuselectname,
                    "menuselectname":statechange.simplemenuselectname,
                    "offset":0, "limit":autoreact.getLocalListLimit(viewdef),
                    "sortkey":"id","down":true, "parent":null}; 
      //autoutils.debug(statechange.simplemenuselectname); 
      if (_.indexOf(["wearables","web","longpoll","cron","disk","processes"],mname)>=0) {        
        var logfilename;
        if (mname=="wearables") logfilename="devicelogfile";
        else if (mname=="web") logfilename="admlogfile";
        else if (mname=="longpoll") logfilename="polllogfile";
        else if (mname=="cron") logfilename="monitorlogfile";
        else if (mname=="disk") logfilename="diskstats";
        else if (mname=="processes") logfilename="procstats";
        autoutils.debug("simplemenuselect2: "+mname);
        autoapi.getLog(this,"getlog",logfilename,stateparams);
        return;     
      } else {         
        autoapi.getListSingle(this,"get",viewdef,stateparams);
        return; 
      }  
    }
    
    // --- complex menu select action ---
        
    if (statechange["action"]==="menuselect") {
      if (this.state.rowid || this.state.parent) {
        this.setState({"menuselectname":statechange.menuselectname});      // ??
      } else {
        this.setState({"alert":"warning","alertmessage":trans("Please save main data first")});
        return;
      }
    }

    // --- change to parent record view ----
    
    if (this.state.parent && //statechange.viewname!==this.state.viewdef["name"] &&
        statechange.viewname==this.state.parent["viewdef"]["name"] &&
        statechange.component!=="table") {
      autoutils.debug("viewdef changed to parent record view");
 
      isParentView=true;    
      globalState.viewname=statechange.viewname;                  
      globalState.op="view";
      globalState.rowid=this.state.parent.rowid;   
      globalState.parent=null;    
          
      tmpdata=this.state.parent.data;    
      statechange=this.prepareState(globalState);  
      statechange["data"]=tmpdata;  
          
     // --- change viewdef, except to the first el (parent) of the menu ----      
          
    } else if (statechange.action=="menuselect" && statechange.viewname!==statechange.viewmenu) {
              //statechange.viewname &&  statechange.viewname!==this.state.viewdef["name"]) {               
      autoutils.debug("viewdef changed to "+statechange.viewname);
      // globalState changes
      globalState.viewname=statechange.viewname;                  
      globalState.op="list";
      globalState.action="wait";
      globalState.rowid=null;
      // local stuff
      filter=statechange.filter;
      //autoutils.debug("filter cp1");
      //autoutils.debug(filter);
      refkey=statechange.refkey;
      var viewmenu=statechange.viewmenu;
      statechange=this.prepareState(globalState);
      if (viewmenu) statechange.viewmenu=viewmenu;
      else statechange.viewmenu=null;      
      if (!this.state.parent) { 
        statechange.parent={"viewdef":this.state.viewdef, 
                           "filter": filter, "refkey": refkey,
                            "data":this.state.data, "rowid": this.state.rowid};    
      }               
      statechange.offset=0;
      statechange.limit=autoreact.getLocalListLimit(statechange.viewdef);
      statechange.sortkey="name";
      statechange.down=true;
      statechange.filter=filter;
      //autoutils.debug("filter cp2");
      //autoutils.debug(statechange.filter);
      if (statechange.parent) statechange.parent.filter=filter;
      var stateparams={"offset":statechange.offset, "limit":statechange.limit, "sortkey":statechange.sortkey,
                       "down":statechange.down,
                       "menuselectname": statechange.menuselectname,
                       "parent": statechange.parent, "forcefilter": null};
      if (statechange.filter) stateparams["filter"]=filter;    
      //autoutils.debug("stateparams before getlist in menuselect:");
      //autoutils.debug(stateparams);
      autoapi.getList(this,statechange.op,statechange.viewdef,stateparams);                 
    }
    
    // -- list actions --

    if (statechange.op==="list" && statechange.action==="initialsearch") {      
      statechange.offset=0;
      //wait=true;
      stateparams={"offset":statechange.offset, //limit: 20,
                   "limit":autoreact.getLocalListLimit(this.props.viewdef),
                   "sortkey":statechange.sortkey,"down":statechange.down, "parent":null,
                   "preaction":"reset",
                   "action":"search"};                     
      autoapi.getList(this,"get",statechange.viewdef,stateparams);    
    } else if (statechange.op==="list" && (statechange.action==="search" || statechange.action==="fresh")) {      
      statechange.offset=0;
      //wait=true;
      stateparams={"offset":statechange.offset, "limit":autoreact.getLocalListLimit(this.props.viewdef),
                   "sortkey":this.state.sortkey,"down":this.state.down, "parent":this.state.parent};  
      autoapi.getList(this,"get",this.state.viewdef,stateparams);
    } else if (statechange.op==="list" && statechange.action==="sort") { 
      statechange.offset=0; 
      //wait=true;
      stateparams={"offset":statechange.offset, "limit":autoreact.getLocalListLimit(this.props.viewdef),
                   "sortkey":statechange.sortkey,"down":statechange.down, "parent":this.state.parent};                   
      //autoutils.debug("about to call getlist");                  
      autoapi.getList(this,"get",this.state.viewdef,stateparams); 
      this.state.op="wait";                   
    } else if (statechange.op==="list" && statechange.action==="next") {      
      statechange.offset=this.state.offset + autoreact.getLocalListLimit(this.props.viewdef);
      if (statechange.offset>=this.state.count) statechange.offset=this.state.count-autoreact.getLocalListLimit(this.props.viewdef);
      if (statechange.offset < 0) statechange.offset=0;      
      wait=true;
      stateparams={"offset":statechange.offset, "limit":autoreact.getLocalListLimit(this.props.viewdef),
                   "sortkey":this.state.sortkey,"down":this.state.down, "parent":this.state.parent};          
      autoapi.getList(this,"get",this.state.viewdef,stateparams);             
    } else if (statechange.op==="list" && statechange.action==="previous") {      
      statechange.offset=this.state.offset - autoreact.getLocalListLimit(this.props.viewdef);
      if (statechange.offset < 0) statechange.offset=0;
      wait=true;
      stateparams={"offset":statechange.offset, "limit":autoreact.getLocalListLimit(this.props.viewdef),
                   "sortkey":this.state.sortkey,"down":this.state.down, "parent":this.state.parent};
      autoapi.getList(this,"get",this.state.viewdef,stateparams);
     } else if (statechange.op==="list" && statechange.action==="first") {      
      statechange.offset=0;
      wait=true;
      stateparams={"offset":statechange.offset, "limit":autoreact.getLocalListLimit(this.props.viewdef),
                   "sortkey":this.state.sortkey,"down":this.state.down, "parent":this.state.parent};
      autoapi.getList(this,"get",this.state.viewdef,stateparams); 
    } else if (statechange.op==="list" && statechange.action==="last") {      
      statechange.offset=this.state.count-autoreact.getLocalListLimit(this.props.viewdef);
      if (statechange.offset < 0) statechange.offset=0;
      wait=true;
      stateparams={"offset":statechange.offset, "limit":autoreact.getLocalListLimit(this.props.viewdef),
                   "sortkey":this.state.sortkey,"down":this.state.down, "parent":this.state.parent};   
      autoapi.getList(this,"get",this.state.viewdef,stateparams);       
    } else if (statechange.op==="list" && statechange.action==="all") {      
      statechange.offset=0;
      wait=true;
      stateparams={"offset":0, "limit":1000,
                   "sortkey":this.state.sortkey,"down":this.state.down, "parent":this.state.parent};
      autoapi.getList(this,"get",this.state.viewdef,stateparams);   
     // -- record view actions --  
  
    } else if (statechange.op=="view") {  
      //autoutils.debug("view, to get record?");
      //autoutils.debug(isParentView);
      //autoutils.debug(statechange);
      if (!isParentView) {        
        var useRowid=((statechange.rowid) ? statechange.rowid : this.state.rowid);
        var useViewdef=((statechange.viewdef) ? statechange.viewdef : this.state.viewdef);
        autoapi.getRecord(this,"view",useViewdef,useRowid,statechange.future);   
      }  
      
     // -- record edit actions -- 
      
    } else if (statechange.op=="edit" && statechange.action!="delete") {  
      statechange.parent=this.state.parent;            
   
    // -- save actions --
      
    } else if (statechange.action=="save") {
      //autoutils.debug("statechange.action==save");
      useViewdef=((statechange.viewdef) ? statechange.viewdef : this.state.viewdef);
      autoapi.saveRecord(this,"save",useViewdef,this.state.parent);
      statechange.action="apiwait";
      
    // -- delete actions --
      
    } else if (statechange.action=="delete") {     
      useViewdef=((statechange.viewdef) ? statechange.viewdef : this.state.viewdef);      
      autoapi.deleteRecord(this,"delete",useViewdef,this.state.rowid,this.state.parent);
    }
    
    // --- finally: store to history and actually change state ----

    if (statechange.action!="save" && statechange.action!="delete" && 
        statechange.action!="apiwait") {
      if (statechange.op=="view" && !statechange.parent) { //(statechange.action!="wait" && this.state.op!="list" && !this.statechange.parent) {
        autoutils.storeHistory(this.state,stateparams);
      }  
      _.extendOwn(globalState,statechange);
      //autoutils.debug("setState to be called with statechange:");
      if (!wait) this.setState(statechange);
      //this.setState(statechange);
    }  
  }
  
  // --------- loading initial data before mounting ------
  
  componentWillMount() {    
    //autoutils.debug("autoResource componentWillMount");
    //this.loadDataFromServer();
  }
  
  componentDidMount() {    
    //autoutils.debug("autoResource componentWillMount");
    console.log("componentDidMount");
    this.loadDataFromServer();
  }
  
  // loadDataFromServer is only used by componentWillMount for initial data loading
  
  loadDataFromServer() { 
    var stateparams;
    if (this.state.op==="list") {    
      stateparams={"offset":this.state.offset, "limit":autoreact.getLocalListLimit(this.props.viewdef),
                   "sortkey":this.state.sortkey,"down":this.state.down,"forcefilter":this.state.forcefilter};
      autoapi.getList(this,"get",this.state.viewdef,stateparams);                   
    } else if (this.state.op==="view") {
      autoapi.getRecord(this,this.state.op,this.state.viewdef,this.state.rowid);
    }    
  } 
  
  // --- whether to update and what to do finally after update ----
  
  shouldComponentUpdate(nextProps, nextState) {  
    if (nextState.action=="initialsearch") return false;    
    return true;
    /*
    if (nextState.action=="save") {
      return false;
    }  
    return true;
    */
  } 
  
  componentDidUpdate(prevProps, prevState) {
    //autoutils.debug("componentDidUpdate");
    //autoutils.debug(prevState);
    //autoutils.debug(this.state);
    //if (prevState.alert && prevState.alertmessage && this.state.alert) {
    if (this.state.alert && this.state.action!="apiwait") {
      $("#alertmessage").html(this.state.alertmessage);
      $("#alertmessage").show();  
    }
    // If component resides inside old auto then recalculate IFRAME height:
    if (parent.resizeIframe && parent.iframeChild) parent.resizeIframe(parent.iframeChild);
  }
  
  // ---- actual render -----
  
  render() {    
    //autoutils.debug("AutoResource render");        
    //autoutils.debug(this.state.op);  
    //autoutils.debug(this.state.action); 
    //autoutils.debug(this.state.preaction); 
    //autoutils.debug(this.state.data); 
    //autoutils.debug(this.state.filterdata);    
    //autoutils.debug(this.state.viewdef);
    
    //autoutils.debug("this.state.prefill:");   
    //autoutils.debug(this.state.prefill);  
    //autoutils.debug("this.state.data:");   
    //autoutils.debug(this.state.data); 
    //autoutils.debug(this.state.parent);
    //autoutils.debug(this.state.auxdata);
    //autoutils.debug(this.state.alert);
    //autoutils.debug(this.state.alertmessage);
    //if (this.state.op==="block") return null;
    var leftmenu=false, simplemenu=true, label="", limit, max, datarow; 
    var filterdata=this.state.filterdata;
    globalState.op=this.state.op  
    globalState.rowid=this.state.rowid;
    
    if (this.state.action=="initialsearch") {
      return ce("div",{});
    }    
    
    if (this.state.op=="messages") {
      if (this.state.action=="loaddata") {
         return ce("div",{});
      } else {
        return ce(automessages.AutoMessages,
          {data:this.state.data,alert:this.state.alert,alertmessage:this.state.alertmessage,
           callback:this.updateState});
      } 
      //if (!this.state.data) return ce("div","ha");
      // else return ce(autooverview.AutoOverview,{data:this.state.data});
    }
    
    if (!this.state.viewdef) {
      if (this.state.alert) {
        return ce("div", {className:"alert alert-"+this.state.alert+" loaddata"}, this.state.alertmessage);
      } else {
        return ce("div", {className:"alert alert-danger loaddata"}, trans("no data and no view definition"));
      }  
    }  
    if (this.state.viewdef["menu"] && this.state.op!=="list") leftmenu=true;
    if (this.state.viewmenu) leftmenu=true; 
    
    if (this.state.viewdef["simplemenu"]===false) {
      simplemenu=false;      
    } else if (this.state.parent) {
      label=getObjectLabel(this.state.parent.data,null);     
    } else if (this.state.op==="view" || this.state.op==="edit") {
      if (this.state.data) label=getObjectLabel(this.state.data,this.state.viewdef);  
      else label="";
    } else if (this.state.op==="add")  {
      label=getObjectLabel(null,this.state.viewdef)+": "+trans("add");
    } else if (this.state.op==="list") {           
      label=getObjectLabel(null,this.state.viewdef);
    } else if (this.state.data && !_.isArray(this.state.data)) {  
      label=this.state.data["name"];         
    } else { 
      label=fldtrans(autoreact.fieldLabel(this.state.viewdef)); //+": "+trans(this.state.op);    
    }      
    return(     
      ce("div", {className: "container autoBox"},
        /*
        ((this.state.alert) ?
          ce("div", {className: "row"},
            ce("div", {className: "col-md-12"}, 
              ce(AutoAlertMessage,{alert:this.state.alert, alertmessage: this.state.alertmessage})
            )  
          )
          : ""              
        ),
        */
        /*    
        ((leftmenu) ?
          ce("div", {className: "row singleResourseTitleRow"},
            ce("h1",{className: "resourcetitle"}, label)
          )  
          :
          ce("div", {className: "row listTitleRow"}, //{className: "row listTitleRow"},
            ce("h1",{className: "listresourcetitle"}, label) 
          )  
        ),
        */      
        (this.state.op=="list" ? ce(AutoAlertMessage,{alert:this.state.alert, alertmessage: this.state.alertmessage}) : ""),    
        ce("div", {className: "row"},
          ((simplemenu) ?            
            ce("div", {className: "col-md-2 leftMenuCol"},           
              ce(AutoSimpleMenu, {viewdef: this.state.viewdef,
                                  groupname:this.state.groupname, 
                                  simplemenuselectname:this.state.simplemenuselectname,
                                  menuselectname:this.state.menuselectname,
                                  op: (this.state.op=="list" ? "view" : this.state.op),
                                  data: this.state.data,                                         
                                  parent:this.state.parent,
                                  callback:this.updateState})
            )  
            :
            ""
          ),   
          ((leftmenu) ?            
            ce("div", {className: "col-md-2 leftMenuCol"},           
              ce(AutoLeftMenu, {viewdef:((this.state.viewmenu) ? 
                                         _.findWhere(globalState.viewdefs, {name:this.state.viewmenu})
                                         : this.state.viewdef),
                                groupname:this.state.groupname, 
                                menuselectname:this.state.menuselectname,
                                op: (this.state.op=="list" ? "view" : this.state.op),
                                data: this.state.data,                                         
                                parent:this.state.parent,
                                callback:this.updateState})
            )  
            :
            ""
          ),        
          (false ? //(this.state.op=="wait") ?
           ""
           :                                
          ce("div", {className: ((leftmenu || simplemenu) ? "col-md-10 singleResourseBodyRow " : "col-md-12")},                              
            ce("div", {className: "innerContainer"},         
              ce("div", {className: "row"},
                ce("div", {className: ((leftmenu || simplemenu) ? "col-md-12" : "col-md-12")}, 
                  ce(AutoMain, {
                    //data: this.state.data,                    
                    data: ((!this.state.prefill || (this.state.data && !_.isEmpty(this.state.data))) 
                           ? this.state.data : 
                           this.state.prefill),                    
                    auxdata: this.state.auxdata,
                    //prefill: this.state.prefill,
                    viewdef: this.state.viewdef,
                    count: this.state.count,
                    sort: this.state.sort, sortkey: this.state.sortkey, down: this.state.down,
                    op: this.state.op, rowid: this.state.rowid, offset:this.state.offset,
                    callback:this.updateState, alert:this.state.alert, alertmessage:this.state.alertmessage,
                    viewallfields:this.state.viewallfields,
                    groupname: this.state.groupname,
                    filterdata:filterdata,
                    parent:this.state.parent})
                )
              )
            )                    
          ))          
        )
      )            
    );
  }
};

function getObjectLabel(data,viewdef) {
  var label="";
  if (!data) label=""; 
  else if (data && viewdef.nameField) label=data[viewdef.nameField];    
  else if (_.has(data,"name")) label=data["name"];
  else if ( _.has(data,"short_name")) label=data["short_name"];
  if (!label  && viewdef) {
    //if (viewdef["label"]) label=viewdef["label"];
    //else label=trans(viewdef["name"]);
    label=trans(viewdef["name"]);
  }
  return label;
}

//var AutoMain = React.createClass
class AutoMain extends React.Component{
  //displayName: 'AutoMain',
  render() {
    var onepage=false;
    if (!this.props.op || this.props.op=="list" || this.props.op=="wait") { // use list if initial op missing altogether
      //autoutils.debug("size "+this.props.offset+" "+this.props.count+" "+this.props.data.length);
      if (this.props.data && this.props.offset===0 && this.props.count<=this.props.data.length) onepage=true;
      return (
        ce("div", {className: "autoMain"},
          ((!autoutils.hasNegativeProperty(this.props.viewdef,"filter")) ?        
            ce(autoreact.AutoListForm, {viewdef: this.props.viewdef, onDataSubmit:this.handleDataSubmit, 
                             callback:this.props.callback,
                             offset:this.props.offset, data:this.props.data,
                             datarow: this.props.filterdata,
                             parent:this.props.parent})
            :
            ce("span",{}) 
          ),         
          ce("p"),
          ((this.props.op=="wait") ?
           ""
           :              
           ce(autoreact.AutoList, {data: this.props.data, auxdata: this.props.auxdata, viewdef: this.props.viewdef, 
                        sort: this.props.sort, sortkey: this.props.sortkey, down: this.props.down,
                        count: this.props.count,
                        op:this.props.op, callback:this.props.callback})
          ),              
          ((onepage) ? "" :                      
            ce(autoreact.AutoScrollButtons, {viewdef:this.props.viewdef, callback:this.props.callback,
                             count: this.props.count,
                             offset:this.props.offset, data:this.props.data, parent:this.props.parent}))                              
        )  
      );
    } else if (this.props.op=="view") {
      var datarow = this.props.data;
      var viewtitle = "";
      return (
        ce("div", {className: "autoMain"},
          ce(autoreact.AutoView, {datarow: datarow, auxdata: this.props.auxdata, 
                        viewdef: this.props.viewdef, rowid: this.props.rowid,                         
                        groupname: this.props.groupname, viewtitle:viewtitle,
                        viewallfields:this.props.viewallfields,  
                        alert:this.props.alert,alertmessage: this.props.alertmessage, 
                        op:this.props.op, callback:this.props.callback, parent:this.props.parent})              
        )  
      );
    } else if (this.props.op=="edit" || this.props.op=="add") {
      //var datarow = autoreact.findRowByKey(this.props.data,this.props.viewdef,this.props.rowid);      
      var datarow;
      //if (this.props.op=="edit") datarow = this.props.data;
      //else datarow = null;
      datarow = this.props.data;
      return (
        ce("div", {className: "autoMain"},
          ce(autoreact.AutoEdit, {datarow: datarow, auxdata: this.props.auxdata,
                        prefill:this.props.prefill,
                        viewdef: this.props.viewdef, rowid: this.props.rowid,
                        groupname: this.props.groupname, 
                        alert:this.props.alert,alertmessage: this.props.alertmessage,            
                        op:this.props.op, callback:this.props.callback, parent:this.props.parent})
        )  
      );
    } else if (this.props.op=="plain") {
      //var datarow = autoreact.findRowByKey(this.props.data,this.props.viewdef,this.props.rowid);      
      var datarow;
      //if (this.props.op=="edit") datarow = this.props.data;
      //else datarow = null;
      datarow = this.props.data;
      return (
        ce("div", {className: "autoMain"},
          ce(autoreact.AutoText, {datarow: datarow, auxdata: this.props.auxdata, 
                        viewdef: this.props.viewdef, rowid: this.props.rowid,                         
                        groupname: this.props.groupname, viewtitle:viewtitle,
                        viewallfields:this.props.viewallfields,  
                        alert:this.props.alert,alertmessage: this.props.alertmessage, 
                        op:this.props.op, callback:this.props.callback, parent:this.props.parent})
        )  
      );       
    } else {
      autoutils.debug("unknown props.op in AutoMain");
      return ( ce("div", {className: "autoMain"}, "unknown props.op in AutoMain") );
    }
  }
};

//var AutoSimpleMenu = React.createClass({
class AutoSimpleMenu extends React.Component{  
  //displayName: 'AutoSimpleMenu',
   handleButton(menuitem,e) {
    e.preventDefault();
    var params={"action": "simplemenuselect", simplemenuselectname:menuitem};   
    this.props.callback(params);
  }
  
  render() { 
    var viewdef=this.props.viewdef;
    var menuitems=['users','tabbed users','locations','checkins','sessions'];  
    if (!menuitems) return "";     
    var menuitem,menulabel,menuclass;
    var menuBlocks = [];
    for (var i=0; i<menuitems.length; i++) {
      menuitem=menuitems[i];
      menulabel=menuitem;
      menuclass="autoleftmenubutton";
      if (this.props.simplemenuselectname) {
        if (this.props.simplemenuselectname==menuitem) menuclass+=" autoleftmenubuttonSelected";
      } else if (i==0) menuclass+=" autoleftmenubuttonSelected";                 
      if (menuitem=='Server' || menuitem=='Logs' || menuitem=='Data') {
        menuclass="autoleftmenuseparator";
        menuBlocks.push(
          ce("li", {key:i+menulabel, className: menuclass}, menulabel)
        );    
      } else {
        menuBlocks.push(
          ce("li", {key:i+menulabel, 
                        className: menuclass,
                        onClick:this.handleButton.bind
                          (this,menuitem)}, 
            ce("a", {href: "#", className: "autoleftmenubuttonlink"},
                menulabel)
          )
        );    
      }
    }
    return (
      ce("div",{},
        ce("ul",{className:"autoleftmenu"},
          menuBlocks
        )      
      )  
    );     
  }
};  


//var AutoLeftMenu = React.createClass({
class AutoLeftMenu extends React.Component{  
  //displayName: 'AutoLeftMenu',
  handleButton(name,viewmenu,restriction,component,menuselectname,e) {
    var usedata;
    e.preventDefault();
    var params={"action": "menuselect", viewname:name, viewmenu:viewmenu, component:component, menuselectname:menuselectname};
    var filter;
    if (this.props.parent && this.props.parent.data && _.isObject(this.props.parent.data))
      usedata=this.props.parent.data;
    else 
      usedata=this.props.data;
    filter=makeFilterFromRestriction(restriction,usedata);
    /*
    autoutils.debug("made filter from restr "+restriction);
    autoutils.debug(this.props.parent);
    autoutils.debug(usedata);
    autoutils.debug(filter);
    */
    var refkey;
    refkey=getRefKeyFromRestriction(restriction);
    params["filter"]=filter;
    params["refkey"]=refkey;
    params["parent"]=this.props.parent;
    this.props.callback(params);
  }
  
  render() {    
    var viewdef=this.props.viewdef;
    var groups=viewdef["menu"];
    if (!groups) return "";
    if (this.props.op==="list") return ce("span",{},"");     
    var group,grouplabel,menuclass;
    var groupBlocks = [];
    for (var i=0; i<groups.length; i++) {
      group=groups[i];
      grouplabel=autoreact.fieldLabel(group);
      menuclass="autoleftmenubutton";
      if (this.props.menuselectname) {
        if (this.props.menuselectname==group["name"]) menuclass+=" autoleftmenubuttonSelected";
      } else if (i==0) menuclass+=" autoleftmenubuttonSelected";                 
      groupBlocks.push(
        ce("li", {key:i+group["name"], 
                      className: menuclass,
                      onClick:this.handleButton.bind
                        (this,group["viewname"],group["viewmenu"],group["restriction"],group["component"],group["name"])}, 
          ce("a", {href: "#", className: "autoleftmenubuttonlink"},
              grouplabel)
        )
      );    
    }
    return (
      ce("ul",{className:"autoleftmenu"},
        groupBlocks
      )      
    );     
  }
};

//"main_resource_parent_id={main_resource_id}&service_type=mitteelektrooniline_teenus"

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

function getRefKeyFromRestriction(r) {
  var pairs,keyvals,i,kval;
  if (!r) return [];
  pairs=r.split("&");
  for (i=0; i<pairs.length; i++) {
    keyvals=pairs[i].split("=");
    if (!keyvals || keyvals.length!=2) continue;      
    kval=keyvals[1];
    if (kval.charAt(0)=="{" && kval.charAt(kval.length-1)=="}") {
      return keyvals[0];
    }             
  }
  return null;  
}


//var AutoAlertMessage = React.createClass({
class AutoAlertMessage extends React.Component{  
  //displayName: 'AutoAlertMessage',
  render() {
    var type;
    if (this.props.alert===true) type="danger";
    else type=this.props.alert;
    if (!this.props.alert || !this.props.alertmessage) return ce("span",{},"");
    else return ( 
      ce("div", 
        {id: "alertmessage", className: (this.props.internal ? autoreact.internalAlertClass : autoreact.alertClass)+
         " "+autoreact.alertClassPrefix+type},
        this.props.alertmessage)
    );
  }
};  

function getSortParams(viewdef,proposedkey,proposeddown) {
  var i,flds,fld,first,key=proposedkey,down=proposeddown;
  if (!key) key="name";
  if (!viewdef || !viewdef.fields) return [key,down];
  flds=autoutils.orderFields(viewdef.fields);
  first=false;
  for (i=0;i<flds.length;i++) {
    fld=flds[i];
    if (!autoutils.fieldShow(fld,"list")) continue;
    if (fld.name==key) return [key,down];
    if (!first) first=fld.name;
  }
  if (first) return [first,false];
  return key;
}

// ====== exported functions =========

export {
  AutoResource,
  AutoMain,
  getObjectLabel,
  AutoLeftMenu,
  AutoAlertMessage
}  