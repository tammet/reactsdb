/* 
 
 gtour initialization calls
 
*/

var isTest=true;

function doLogin(userdata) {
  console.log("doLogin");
  console.log(userdata.fullname);

  $("#body").css("background-image","none");
  $("#body").css("background-color", "#f9f9fb");
  $("#userfullname").html(userdata.fullname);
  $("#login-page").hide();
  $("#body").css("overflow-y", "scroll");
  menuHideShow("overview")
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
  // turn logging off if so indicated by globalState
  if (!globalState.debug) autoutils.debug = function(){};  
  autolang.initialTrans(); // translate static UI  
  loadTemplates();
  //initReact(globalState);   
  setupHistory();
  finishInit() ;
  //menuHideShow("users");
  mainMenuView('users');  
};


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


function getSessionId(queryStr) {
  var queryArr = queryStr.split('&');
  for (var i = 0; i < queryArr.length; i++) {
    var items = queryArr[i].split('=');
    if (items.length > 1 && items[0] === "sessionId") return items[1];
  }
  return null;
}

function authenticate(token, callback) {
  autoapi.getUserFromToken(globalState,token,function(data) {
    receivedUser(data);
    if (callback) callback();
  });
}

function loadTemplates() {
  globalState.viewdefs=viewdefs;     
}

// Create filter from query params:
function createFilter(queryStr) {
  var queryArr = queryStr.split('&');
  var filter = [];
  for (var i = 0; i < queryArr.length; i++) {
    var items = queryArr[i].split('=');
    if (items.length > 1 && items[0] !== "sessionId") 
      filter.push([items[0], 'ilike', '%' + decodeURIComponent(items[1]) + '%']);
  }
  return filter;
}

// select main menu item 

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


