
// configuration and global vars are all in globalState
// requires a few configuration vars in the html page

/* conf in html

var send_url="/cgi-bin/send"
var ask_url="/cgi-bin/ask"

var DEFAULT_MAP_CENTER_LAT=58.87;
var DEFAULT_MAP_CENTER_LNG=25.41;
var DEFAULT_INITIAL_ZOOM=8;

*/

var username=null;

var MAP_CENTER_LAT=DEFAULT_MAP_CENTER_LAT;
var MAP_CENTER_LNG=DEFAULT_MAP_CENTER_LNG;
var INITIAL_ZOOM=DEFAULT_INITIAL_ZOOM;

var addflag=true;
var marker=false;
var uploadInput;
var markers=[];
var messages=[];

var lat=0;
var lnt=0;
var imageUrl="";
var infoWindow;
var sendrequest;
var successflag=false;
var cancelflag=false;
var messagefilter=false;

var tags={
  "test 1": "test 1",
  "test 2": "test 2",
}  

var globalState = {
  
  // the first block is configuration: not normally changed while app running

  "debug": true, // set true to enable autoutils.debug perform console.log; false to turn logging off
  "lang": "eng", // for ui translation
  //"apiUrl": "http://localhost/cgi-bin/api", // normally used by api for fetching/storing data with a proxy

  "apiUrl": "http://127.0.0.1:5000/api", // normally used by api for fetching/storing data with a proxy
  //"apiUrl": "http://localhost/cgi-bin/gtwebapi", //"../cgi-bin/gtwebapi",
  "localApiUrl": "http://127.0.0.1:5000/api", // instead of apiUrl if page opened from localhost
  
  //"apiUrl": "http://localhost/cgi-bin/gtwebapi", //"../cgi-bin/gtwebapi",
  //"localApiUrl": "http://localhost/cgi-bin/gtwebapi", // instead of apiUrl if page opened from localhost
  //"apiUrl": "http://triinu.girf.ee:8010/rest/api", // used by api for fetching/storing data without proxy
  "listLimit":20,     // default maximal number of rows shown on a page    
  "dynamicSearchLimit": 20, // maximal number of rows in a dynamic typeahead
  "listValueLen": 30, // max len of a field value part shown in list    
  "modalHelpLengthLimit":100, // longer helps will be shown as a modal, not inline  
  "ajaxTimeout":10000,  // milliseconds until the data query timeouts: normal use
  "shortAjaxTimeout":3000,  // milliseconds until the data query timeouts: only should-be-quick cases    

  // test data
  
  "dummyData": false,
  "dummyUrl": "./",
  "countDummyData": "countdata.json",
  "listDummyData" : "listdata.json",
  "recordDummyData" : "recorddata.json",
  "updateDummyData" : "updatedata.json",
  "saveDummyData" : "savedata.json",
  "userDummyData" : "userdata.json",
  
  // viewdefs initially read and processed will be stored here
  
  "viewdefs": null, // template list, should be initialised before autoreact call
 
  // user data read to be read and stored by api from initial token
  
  "userCode": null,
  "userName": null,
  "userOrganizationCode": null,
  "userOrganization": null,
  "roleCode" : null,
  "roleName" : null,
  "rights" : null,
  "token": null, // actual token to use later
  
  // initially default values, later modified/restored from history when going back
  
  "maploaded": false,
  "mapinitialized": false,
  "data": null, 
  "viewname": "devices", 
  "viewdef": null, 
  "parent": null,           
  "op":"list", 
  "rowid":null, 
  "groups":null, 
  "groupname":null, 
  "sort":true, 
  "sortkey":"id", 
  "down": true, 
  "filter":null, 
  "forcefilter":null,  
  "filterdata":null,
  "offset": 0, 
  "alert": false, 
  "alertmessage": "" 
  
};

// these are changed while app is running  

var globalHistory = {   
  "data": [], 
  "viewname": "devices",
  "viewdef": null, 
  "parent": null,           
  "op":"view", 
  "rowid":350109, 
  "groups":null, 
  "groupname":null, 
  "sort":true, 
  "sortkey":"ccreated_at", 
  "down": true, 
  "filter":null,           
  "forcefilter":null,
  "filterdata":null,
  "offset": 0, 
  "alert": false, 
  "alertmessage": "" 
};

var rawInit = {   
  "data": [], 
  "viewname": "devices",
  "viewdef": null, 
  "parent": null,           
  "op":"list", 
  "rowid":null, //350109, 
  "groups":null, 
  "groupname":null, 
  "sort":true, 
  "sortkey":"created_at", 
  "down": true, 
  "forcefilter":null,
  "filterdata":null,   
  "offset": 0, 
  "alert": false, 
  "alertmessage": "" 
};

var xcount=0;