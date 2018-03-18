/* 
 
 autoreact demo top menu functions
 
*/

// ======== top menu actions =====================




// -------- main menus ------

function menuOverview() {
  console.log("menuOverview");  
  menuHideShow("overview");
  mainMenuView('devices');
}

function menuMap() {
  console.log("menuMap");  
  $("#top").hide();
  $("#videotop").hide();
  setMenuBackgrounds("map");
  if (!globalState.mapinitialized) {
    initializeMaps();
    console.log("map initialized");
    globalState.mapinitialized=true;
    // google.maps.event.addDomListener(window,'load',hideLoading); 
    google.maps.event.addListener(googleMap, 'click', function(event) {
      if(mapClickHandler != null && addflag) mapClickHandler(event.latLng);
    });
  }    
  $("#map_canvas").show();
  initializeMaps();
}

function menuAlerts() {
  console.log("menuAlerts");  
  menuHideShow("alerts");
  mainMenuView('devices');
}

function menuDevices() {
  console.log("menuDevices");  
  menuHideShow("devices");
  mainMenuView('devices');
}

function menuManage() {
  console.log("menuManage"); 
  menuHideShow("manage");
  mainMenuView('users');
}


// ----- admin menus -------

function adminMenuFeeds() {
  console.log("menuFeeds");
  $("#map_canvas").hide();
  $("#videotop").hide();
  $("#top").show();
  mainMenuView('feeds');
}

function adminMenuDevices() {
  console.log("menuallDevices");
  $("#map_canvas").hide();
  $("#videotop").hide();
  $("#top").show();
  mainMenuView('Devices in use');
}

function adminMenuDevices() {
  console.log("menuDevices");
  $("#map_canvas").hide();
  $("#videotop").hide();
  $("#top").show();
  mainMenuView('devices');
}

function adminMenuMessages() {
  console.log("menuMessages");
  $("#map_canvas").hide();
  $("#videotop").hide();
  $("#top").show();
  mainMenuView('messages');
}

function adminMenulastMessages() {
  console.log("menulastMessages");
  $("#map_canvas").hide();
  $("#videotop").hide();
  $("#top").show();
  mainMenuView('Last messages');
}

function adminMenuLocations() {
  console.log("menuLocations");
  $("#map_canvas").hide();
  $("#videotop").hide();
  $("#top").show();
  mainMenuView('locations');
}

function adminMenuFiles() {
  console.log("menuFiles");
  $("#map_canvas").hide();
  $("#videotop").hide();
  $("#top").show();
  mainMenuView('files');
}

function adminMenuUsers() {
  console.log("menuUsers");
  $("#map_canvas").hide();
  $("#videotop").hide();
  $("#top").show();
  mainMenuView('users');
}

function adminMenuSettings() {
  console.log("menuSettings");
  $("#map_canvas").hide();
  $("#videotop").hide();
  $("#top").show();
  mainMenuView('settings');
}

function adminMenuMonitor() {
  console.log("menuFeeds");
  $("#map_canvas").hide();
  $("#videotop").hide();
  $("#top").hide();
}

// -------------

function menuHideShow(selected) { 
  $("#map_canvas").hide();
  $("#videotop").hide();
  $("#top").show();
  setMenuBackgrounds(selected);
}  



function setMenuBackgrounds(selected) {
  var i,el;
  var menuList=["map","manage"];
  for (var i=0; i<menuList.length; i++) {   
    el=menuList[i];
    if (el==selected) $("#menu"+selected).css("background-color","#666"); 
    else $("#menu"+el).css("background-color","#333");
  }  
}

// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License

function parseUri (str) {
	var	o   = parseUri.options,
		m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i   = 14;
	while (i--) uri[o.key[i]] = m[i] || "";
	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});
	return uri;
};

parseUri.options = {
	strictMode: false,
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:   {
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};


function hideLoading() {  
  $("#onload_info_outer").hide();
}

function placeMarked() {
  var ffield,mform;
  if (lat==0 || lng==0) return;
  $('#problem').val("");
  $('#showfile').html("");
  $('.file-input-name').html("");
  $('#fileinput').prop('value',null);  
  ffield=gid('fileinput');  
  try {
    ffield.value = null;
  } catch(e) { }
  if (ffield.value) {
    ffield.parentNode.replaceChild(ffield.cloneNode(true), ffield);
  }
  imageUrl="";
  
  $('#newmarkerhelp').hide(); 
  
  $("#formsendingmsg").hide();
  $("#formerrmsg").hide();
  $("#progress").hide();
  $("#formokmsg").hide();
  $("#formerrmsg2").hide();
  $('#senddatabtn').prop('disabled', false);
  
  //grecaptcha.reset();  
  if(window.FormData===undefined || typeof(window.FileReader)=='undefined') {
    $("#formerrmsg").html("See veebibrauser on sõnumi saatmiseks liiga vana!");
    $("#formerrmsg").show();
    $('#senddatabtn').prop('disabled', true);
  }  
  $('#addModal').modal('show');  
}  

function clearMarker() {
  if (marker) {
    marker.setMap(null);
  }
  /*
  lat=0;
  lng=0;
  */
}  

function setProgress(val) {
  //console.log("setting progressbar "+val);
  $("#progressbar").html(val+"%");
  $("#progressbar").attr("aria-valuenow",val);
  $("#progressbar").css("width",val+"%");  
}

function showSendingresult(x) {
  var msg,okflag;
  okflag=true;
  try {
    msg=x["msg"];
    if (x["code"]!=0) okflag=false;    
  } catch(e) {
    okflag=false;
    msg="Tehniline viga sõnumi saatmisel";
  }
  //console.log(msg);
  $("#formsendingmsg").hide();
  $("#progress").hide();
  $("#formerrmsg").hide();
  //$('#senddatabtn').prop('disabled', false);
  if (okflag) {
    $("#formokmsg").html(msg);
    $("#formokmsg").show();
    $("#formerrmsg2").hide();        
    askData();
  } else {
    $("#formerrmsg2").html(msg);
    $("#formerrmsg2").show();
    $("#formokmsg").hide();
  }      
  window.setTimeout("clearSuccess()", 6000);
  return;
} 

function showSendingerror(x) {
  $("#formsendingmsg").hide();
  $("#formerrmsg").hide();
  $("#progress").hide();
  $("#formokmsg").hide();
  $("#formerrmsg2").html(String(x))
  $("#formerrmsg2").show();
  $('#senddatabtn').prop('disabled', false);
  window.setTimeout("clearSuccess()", 6000);
  return;
} 

function clearSuccess() {
  $("#addModal").modal('hide');
}  

function resetFormElement(input) {
  //e.wrap('<form>').closest('form').get(0).reset();
  //e.unwrap();
  input.replaceWith(input.val('').clone(true));
}

function markCancelled() {
  $('#newmarkerhelp').hide();  
  unhideMarkers();
}  

function notificationSubmit() {
  try { saveLocation();}
  catch (e) { };
  return false;
}  



// ============= utilities ================

function gid(x) { return document.getElementById(x); }


// universal ajax error handlers for non-autoapi

function isDataError(data) {
  return (data && _.isObject(data) && data["errcode"]);
}

function ajaxError(xhr,status,err) {
  var msg;
  $("#errorcontents").html(err);
  $("#errorModal").modal('show');
}

// file selection and upload

function handleFileSelect(evt) {
 //console.log("ok");
 return;
 /* 
  var files = evt.target.files; 
  for (var i = 0, f; f = files[i]; i++) {
    var reader = new FileReader();
    reader.onload = (function(theFile) {
      return function(e) { gid('names').value=e.target.result; };
    })(f);
    reader.readAsText(f);
  }
 */ 
}
