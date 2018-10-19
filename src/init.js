/* 
 
 reactsdb initialization calls
 
*/

import * as autoutils from './auto/autoutils.js';
import * as autolang from './auto/autolang.js';
import * as autoapi from './auto/autoapi.js';
import * as autoreact from './auto/autoreact.js';
import * as automain from './auto/automain.js';

var isTest=true;
var topMenuList=["data","locations"];

var rootElement=null;
var reactInstance=null;


function doLogin(userdata) {
  console.log("doLogin");
  //console.log(userdata.fullname);
  $("#body").css("background-image","none");
  $("#body").css("background-color", "#f9f9fb");
  $("#userfullname").html(userdata.fullname);
  $("#login-page").hide();
  $("#body").css("overflow-y", "scroll");
  //menuHideShow("overview")
  $("#main-page").show();  
  globalState.token="test";
  initMain();  
}

function menuLogOut() {
  //console.log("menuLogout");
  $("#main-page").hide(); 
  $("#userfullname").html("Not logged in");  
  //$("#body").css("background-image","url('img/20_1000.jpg')");
  $("#body").css("overflow-y", "none");
  $("#login-page").show();
}

function initMain() {  
  if (!globalState.debug) autoutils.debug = function(){};  
  autolang.initialTrans(); // translate static UI  
  loadTemplates();   
  setupHistory();
  finishInit() ;
  mainMenuView('users');  
};

function loadTemplates() {
  globalState.viewdefs=viewdefs;     
}

function setupHistory() {
  // handle back button
  //window.addEventListener('popstate', function(event) {
  window.onpopstate = function(event) {
    autoutils.debug('popstate fired!');
    autoutils.debug(window.history.length);    
    if (event.state !== null) {
      autoutils.debug('popstate fired with event state!');
      //globalState=event.state; 
      autoutils.restoreHistory(event.state);
      ReactDOM.unmountComponentAtNode(document.getElementById('react-app'));
      initReact(globalState); 
    }  
  };     
}

function finishInit() { 
  //window.setTimeout("hideLoading()", 3000);
  $('.navbar-collapse a').click(function(){
    $(".navbar-collapse").collapse('hide');
  });
  /*
  gid('fileinput').addEventListener('change', handleFileSelect, false);  
  uploadInput = gid('fileinput');
  uploadInput.addEventListener('change', function() {
    //console.log(uploadInput.files); // File listing!
    for (var i = 0, fileCount = uploadInput.files.length; i < fileCount; i++) {
      //console.log("start"+uploadInput.files[i]+"end");
      renderImage(uploadInput.files[i]);
    }
  });  
  */
}


// -- top bar menu handling ---


function menuData() {
  console.log("menuData"); 
  menuHideShow("data");
  mainMenuView('users');
}


function menuLocations() {
  console.log("menuLocations");  
  menuHideShow("locations");
  var viewdef=autoutils.getViewdef("menulocations");  
  var state={op:"list",action:"initialsearch",viewdef:viewdef, data:null, sortkey:"id", preaction:"reset"};
  if (reactInstance) reactInstance.updateState(state);
}

function menuHideShow(selected) { 
  $("#top").show();
  setMenuBackgrounds(selected);
}  

function setMenuBackgrounds(selected) {
  var i,el;
  for (var i=0; i<topMenuList.length; i++) {   
    el=topMenuList[i];
    if (el==selected) $("#menu"+selected).css("background-color","#666"); 
    else $("#menu"+el).css("background-color","#333");
  }  
}


// ----- select main menu item and run react ------


function mainMenuView(viewname) {    
  ReactDOM.unmountComponentAtNode(document.getElementById('react-app'));
  globalState=autoutils.copyData(globalState,rawInit);
  globalState.viewname=viewname;
  globalState.parent=null;
  globalState.op='list';
  globalState.sortkey="id";
  globalState.down=true; 
  initReact(globalState);
}

// create the react app and insert into html

function initReact(state) {
  var viewdefs=globalState.viewdefs, viewdef, i;
  for (i=0;i<viewdefs.length;i++) {
    if (viewdefs[i]["name"]==state.viewname) {
      viewdef=viewdefs[i];
      state["viewdef"]=viewdef;
      break;
    }
  }    
  rootElement = React.createElement(automain.AutoResource, state);
  reactInstance = ReactDOM.render(rootElement, document.getElementById('react-app'));
}  

export {
  doLogin,
  menuLocations,
  menuData,
  mainMenuView,
  menuLogOut
  //menuHideShow,
  //setMenuBackgrounds
}
