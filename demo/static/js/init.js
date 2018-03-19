/* 
 
 reactsdb initialization calls
 
*/

var isTest=true;

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

function menuHideShow(selected) { 
  $("#top").show();
  setMenuBackgrounds(selected);
}  

function setMenuBackgrounds(selected) {
  var i,el;
  var menuList=["data"];
  for (var i=0; i<menuList.length; i++) {   
    el=menuList[i];
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
  var rootElement = React.createElement(automain.AutoResource, state);
  ReactDOM.render(rootElement, document.getElementById('react-app'));
}  


