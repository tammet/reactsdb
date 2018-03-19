(function(exports) {

var viewdefs = [

    // "users": # all users are here: both admins and mobile users
    {
    "name" : "users",
    "table" : "users",
    "key" : "id",      
    "refField" : "id",
    "nameField" : "username",
    "fields" : [
      {"name":"id", "type":"integer", "auto":1, "edit":0, "addShow":0,"listShow":1,"filter":1},  
      {"name":"username", "type":"string", "listShow":1, "filter":1, "help": " std username or facebook:0013230 or google:233320111"},
      {"name":"service", "type":"string", "listShow":0, "filter":0, "help": " null or facebook or google"},
      {"name":"service_uid", "type":"string", "listShow":0, "filter":1, "help": " null or user id in facebook or google"},
      {"name":"password", "type":"string", "listShow":0, "filter":0, "help": " not used for facebook or google case"},
      {"name":"fullname", "type":"string", "listShow":0, "filter":0, "help": "- used for facebook and google"},
      {"name":"phone", "type":"string", "listShow":0, "filter":0},
      {"name":"email", "type":"string", "listShow":0, "filter":0},
      {"name":"address", "type":"string", "listShow":0, "filter":0},
      {"name":"country", "type":"string", "listShow":0, "filter":0}, 
      {"name":"lang", "type":"string", "listShow":0, "filter":0},
      {"name":"remarks", "type":"string", "listShow":0, "filter":0},
      {"name":"level", "type":"integer", "listShow":0, "filter":0, "help": "- 0 superuser, 1 admin, 2 data write/change, 3 social media login, 10 unauthenticated"},
      {"name":"status", "type":"string", "listShow":0, "filter":0, "help": "- A: active, D: deleted, W: waiting for activation "},
      {"name":"scores", "type":"string", "listShow":0, "filter":0, "help": " jsonb yet unknown structure for storing scores"},
      //{"name":"extra jsonb", "type":"string", "listShow":0, "filter":0, "help": " jsonb yet unknown structure for storing additional information"},
      {"name":"instid", "type":"string", "listShow":0, "filter":0, "help": " last installation textual id"},
      {"name":"activity_at", "type":"datetime", "listShow":0, "filter":0, "help": " last major user activity time (not all requests update this)"},
      {"name":"created_at", "type":"datetime", "listShow":1, "filter":1},
      {"name":"updated_at", "type":"datetime", "listShow":0, "filter":0},
      {"name":"updated_by", "type":"string", "listShow":0, "filter":0, "help": " username or systemname creating/updating"}
    ]  
   },   

    // "installations": # a new mobile installation is stored here solely for bookkeeping
    {
    "name" : "installations",
    "table" : "installations",  
    "key" : "id",      
    "refField" : "id",
    "nameField" : "instid",
    "fields" : [  
      {"name":"id", "type":"integer","edit":0, "addShow":0,"listShow":1,"filter":1},  
      {"name":"instid", "type":"string", "listShow":1, "filter":1, "help": " installation textual id generated by mobile"},
      {"name":"userid", "type":"integer", "listShow":1, "filter":1, "help": " user creating the installation"},
      {"name":"version", "type":"string", "listShow":0, "filter":0, "help": " software version of the originally created installation"},
      // {"name":"extra jsonb", "type":"string", "listShow":0, "filter":0, "help": " jsonb yet unknown structure for storing info about the installation"},
      {"name":"status", "type":"string", "listShow":0, "filter":0, "help": "- A: active, D: installation deleted"},
      {"name":"created_at", "type":"datetime", "listShow":1, "filter":1},
      {"name":"updated_at", "type":"datetime", "listShow":0, "filter":0},
      {"name":"deleted_at", "type":"datetime", "listShow":0, "filter":0, "help": " if user deleted the installation"},
      {"name":"updated_by", "type":"string", "listShow":0, "filter":0, "help": " username or systemname creating/updating"}
    ]  
   }, 

   // "locations": # all identified locations, small and large
    {
    "name" : "locations",
    "table" : "locations",  
    "key" : "id",      
    "refField" : "id",
    "nameField" : "name",
    "fields" : [  
      {"name":"id", "type":"integer","edit":0, "addShow":0,"listShow":1,"filter":1}, 
      {"name":"lat", "type":"float", "listShow":1, "filter":1, "help": " latitude"},
      {"name":"lng", "type":"float", "listShow":1, "filter":1, "help": " longitude "},
      {"name":"zoom", "type":"integer", "listShow":1, "filter":1, "help": " map zoom level at which shown"},
      {"name":"pop", "type":"integer", "listShow":0, "filter":0, "help": " main popularity number"},
      {"name":"score", "type":"integer", "listShow":1, "filter":1, "help": " main score number (0 ... N)"},
      {"name":"vispop", "type":"integer", "listShow":0, "filter":0, "help": " initial visual popularity "},
      {"name":"knownpop", "type":"integer", "listShow":0, "filter":0, "help": " initial wellknowedness number"},
      {"name":"extvisits", "type":"integer", "listShow":0, "filter":0, "help": " initial known external visits"},
      {"name":"visits", "type":"integer", "listShow":1, "filter":1, "help": " visits known from our system"},
      {"name":"country", "type":"string", "listShow":0, "filter":0, "help": " country name if known"},
      {"name":"city", "type":"string", "listShow":0, "filter":0, "help": " city/village/area name if known"},
      {"name":"radius", "type":"string", "listShow":0, "filter":0, "help": " radius of the object, if known"},
      {"name":"vradius","type":"float", "listShow":0, "filter":0, "help": " visible radius of the object,if known"},
      {"name":"name", "type":"string", "listShow":1, "filter":1, "help": " main name"},
      {"name":"thumb", "type":"string", "listShow":0, "filter":0, "help": "  main thumbnail filename or url part"},
      {"name":"photo", "type":"string", "listShow":0, "filter":0, "help": " main large photo filename or url part"},
      {"name":"type", "type":"string", "listShow":0, "filter":0, "help": " main type   "},
      {"name":"desctext", "type":"string", "listShow":0, "filter":0, "help": " main description"},
      {"name":"descsrc", "type":"string", "listShow":0, "filter":0, "help": " source of the main description"},
      {"name":"links", "type":"string", "listShow":0, "filter":0, "help": " jsonb main links as a string list"},
      {"name":"tags", "type":"string", "listShow":0, "filter":0, "help": " jsonb main tags as a tag:importance dict"},
      {"name":"systsource", "type":"string", "listShow":0, "filter":0, "help": " system source from which known"},
      {"name":"userid", "type":"integer", "listShow":0, "filter":0, "help": " user id if originates from this user"},
      {"name":"version", "type":"string", "listShow":0, "filter":0, "help": " sender software version"},
      {"name":"locinfocache", "type":"string", "listShow":0, "filter":0, "help": " jsonb cached selective list of locinfo dicts, each sent from a user"},
      {"name":"status", "type":"string", "listShow":0, "filter":0, "help": " A: active, D: deleted"},
      {"name":"created_at", "type":"datetime", "listShow":1, "filter":1},
      {"name":"updated_at", "type":"datetime", "listShow":0, "filter":0},
      {"name":"updated_by", "type":"string", "listShow":0, "filter":0, "help": " username or systemname creating/updating"}
    ]  
   }, 

   // "checkins": # all checkins of users without added data, except ratings
    {
    "name" : "checkins",
    "table" : "checkins",  
    "key" : "id",
    "refField" : "id",
    "nameField" : "userid",
    "fields" : [  
      {"name":"id", "type":"integer","edit":0, "addShow":0,"listShow":1,"filter":1}, 
      {"name":"locationid", "type":"integer", "listShow":1, "filter":1, "help": " location which is described"},
      {"name":"userid", "type":"integer", "listShow":1, "filter":1, "help": " user id who sent this info "},
      {"name":"score", "type":"integer", "listShow":0, "filter":0, "help": " score given by user"},
      {"name":"status", "type":"string", "listShow":0, "filter":0, "help": "- A: active, D: deleted"},
      {"name":"created_at", "type":"datetime", "listShow":0, "filter":0}
    ]  
   }, 

   // "uploads": # all incoming location info from users: photos, ratings etc
    {
    "name" : "uploads",
    "table" : "uploads",  
    "key" : "id",      
    "refField" : "id",
    "nameField" : "userid",
    "fields" : [  
      {"name":"id", "type":"integer","edit":0, "addShow":0,"listShow":1,"filter":1}, 
      {"name":"locationid", "type":"integer", "listShow":1, "filter":1, "help": " location which is described"},
      {"name":"userid", "type":"integer", "listShow":1, "filter":1, "help": " user id who sent this info"},
      {"name":"lat", "type":"float", "listShow":0, "filter":0, "help": " latitude of the sender"},
      {"name":"lng", "type":"float", "listShow":0, "filter":0, "help": " longitude of the sender"},
      {"name":"radius", "type":"float", "listShow":0, "filter":0, "help": " estimated radius of the sender location (exactness)"},
      {"name":"photos", "type":"string", "listShow":0, "filter":0, "help": " jsonb list of photo ids or filename or url parts"},
      {"name":"text", "type":"string", "listShow":0, "filter":0, "help": " text given by user"},
      {"name":"score", "type":"integer", "listShow":0, "filter":0, "help": " score given by user"},
      {"name":"status", "type":"string", "listShow":0, "filter":0, "help": "- A: active, D: deleted"},
      {"name":"created_at", "type":"datetime", "listShow":1, "filter":1},
      {"name":"updated_at", "type":"datetime", "listShow":0, "filter":0},
      {"name":"updated_by", "type":"string", "listShow":0, "filter":0, "help": " username or systemname creating/updating"}
    ]  
   }, 

  //  "photos": # technical info about photos in uploads
    {
    "name" : "photos",
    "table" : "photos",  
    "key" : "id",      
    "refField" : "id",
    "nameField" : "uploadid",
    "fields" : [  
      {"name":"id", "type":"integer","edit":0, "addShow":0,"listShow":1,"filter":1},
      {"name":"uploadid", "type":"integer", "listShow":1, "filter":1, "help": " upload which contains the photo"},
      {"name":"originalid", "type":"integer", "listShow":1, "filter":1, "help": " original un-modified photo if separate"},
      {"name":"width", "type":"integer", "listShow":0, "filter":0, "help": " pixel width"},
      {"name":"height", "type":"integer", "listShow":0, "filter":0, "help": " pixel height"},
      {"name":"filesize", "type":"integer", "listShow":0, "filter":0, "help": " size in bytes"},
      {"name":"mime", "type":"string", "listShow":0, "filter":0, "help": " mime type"},
      {"name":"quality", "type":"integer", "listShow":0, "filter":0, "help": " quality if computed "},
      {"name":"filename", "type":"string", "listShow":1, "filter":1, "help": " filename or url part"},
      {"name":"status", "type":"string", "listShow":0, "filter":0, "help": "- A: active, N: noshow, D: deleted"}
    ]  
   }, 

   // "settings": # name:value settings for server
    {
    "name" : "settings",
    "table" : "settings",  
    "key" : "id",      
    "refField" : "id",
    "nameField" : "name",
    "fields" : [  
      {"name":"id", "type":"integer","edit":0, "addShow":0,"listShow":1,"filter":1},   
      {"name":"name", "type":"string", "listShow":1, "filter":1},
      {"name":"value", "type":"string", "listShow":1, "filter":1},
      {"name":"created_at", "type":"datetime", "listShow":1, "filter":1},
      {"name":"updated_at", "type":"datetime", "listShow":0, "filter":0},
      {"name":"updated_by", "type":"string", "listShow":0, "filter":0, "help": " username or systemname creating/updating"}
    ]  
   }, 

   // "sessions": # used only if/when login sessions needed
    {
    "name" : "sessions",
    "table" : "sessions",  
    "key" : "id",
    "refField" : "id",
    "nameField" : "userid",
    "fields" : [  
      {"name":"id", "type":"integer","edit":0, "addShow":1,"listShow":0,"filter":1},
      {"name":"sid", "type":"string", "listShow":1, "filter":1, "help": " client-generated session id"},
      {"name":"userid", "type":"integer", "listShow":1, "filter":1},
      {"name":"endts", "type":"datetime", "listShow":1, "filter":1},
    ]  
   }
]   
  
/*  
  
[
   {
      "name" : "users",
      "label" : "Users",
      "table" : "users",
      "key" : "id",      
      "refField" : "id",
      "nameField" : "username",
      "refTemplate" : "ref:users",
      "fields" : [
        {"name":"id", "type":"integer","edit":0, "addShow":0,"listShow":0,"filter":0},
        {"name":"username", "label":"username", "type":"string", "listShow":1 },
        {"name":"password", "label":"password", "type":"string", "listShow":0, "filter":0},
        {"name":"firstname", "label":"first name", "type":"string", "listShow":1 },
        {"name":"lastname", "label":"last name", "type":"string", "listShow":2 },
        {"name":"phone", "type":"string", "listShow":0, "filter":0 },
        {"name":"email", "type":"string", "listShow":0, "filter":0 },
        {"name":"address", "type":"string", "listShow":0, "filter":0 },
        {"name":"remarks", "type":"string", "listShow":0, "filter":0 },
        {"name":"level", "type":"integer", "listShow":1 },
        {"name":"status", "type":"string", "values":[["a","active"],["d","deleted"]], "listShow":1 },
        {"name":"lang", "label":"language", "type":"string", "listShow":0, "filter":0 },
        {"name":"uistyle", "label":"ui style", "type":"string", "listShow":0, "filter":0 },
        {"name":"created_at", "label":"created at", "type":"datetime", "auto":"now()", "edit":0, "addShow":0,"listShow":1,"filter":1,"filterRange":1,"viewClass":"fldvalue_noedit"},
        {"name":"updated_at", "label":"updated at", "type":"datetime", "auto":"now()", "edit":0, "addShow":0,"listShow":0,"filter":0,"filterRange":1,"viewClass":"fldvalue_noedit"},
        {"name":"updated_by", "label":"updated by", "type":"string", "auto":"req.username", "edit":0, "addShow":0,"listShow":0,"filter":0,"filterRange":1,"viewClass":"fldvalue_noedit"}         
      ] 
   },

   {
      "name" : "devices",
      "label" : "Devices",
      "table" : "devices",
      "key" : "id",      
      "refField" : "id",
      "nameField" : "nr",
      "refTemplate" : "ref:devices",
      "fields" : [
        {"name":"id", "type":"integer", "auto":1, "edit":0, "addShow":0,"listShow":0,"filter":0},
        {"name":"nr", "type":"string", "listShow":1 },
        {"name":"description", "type":"string", "listShow":0,"filter":0},
        {"name":"type", "type":"string", "listShow":1,"filter":0},
        {"name":"user_name", "label":"last user", "type":"string", "listShow":0,"filter":1},
        {"name":"user_id", "label":"last user id", "type":"string", "listShow":0,"filter":0},
        {"name":"user_at", "label":"last user store time", "type":"timestamp", "listShow":0,"filter":0},
        {"name":"ip", "type":"string", "listShow":0,"filter":0},
        {"name":"lat", "label":"last latitude", "type":"float", "listShow":0,"filter":0},
        {"name":"lng", "label":"last longitude", "type":"float", "listShow":0,"filter":0},
        {"name":"location_at", "label":"last location store time", "type":"timestamp", "listShow":0,"filter":0},
        {"name":"comm_at", "label":"last communication time", "type":"timestamp", "listShow":1,"filter":1},
        {"name":"attached", "label":"attached devices", "type":"string", "listShow":0,"filter":0},
        {"name":"attached_at", "label":"attached devices store time", "type":"timestamp", "listShow":0,"filter":0},
        {"name":"real_conf", "label":"stored configuration", "type":"string", "listShow":0,"filter":0},
        {"name":"conf_at", "label":"stored configuration info time", "type":"timestamp", "listShow":0,"filter":0},
        {"name":"set_conf", "label":"configuration to store", "type":"string", "listShow":0,"filter":0},
        {"name":"conf_send_status", "label":"configuration sending status", "type":"string", "values":[[0,"sent"],[1,"not sent"]], "listShow":0,"filter":0 },
        {"name":"sync_at", "label":"last sync time", "type":"timestamp", "listShow":0,"filter":0 },
        {"name":"software_version", "label":"software version", "type":"string", "listShow":0,"filter":0},
        {"name":"software_version_at", "label":"software version info time", "type":"timestamp", "listShow":0,"filter":0 },
        {"name":"status", "type":"string", "values":[["a","in use"],["d","not used"]], "listShow":1 },
        {"name":"created_at", "label":"created at", "type":"datetime", "auto":"now()", "edit":0, "addShow":0,"listShow":1,"filter":1,"filterRange":1,"viewClass":"fldvalue_noedit"},
        {"name":"updated_at", "label":"updated at", "type":"datetime", "auto":"now()", "edit":0, "addShow":0,"listShow":0,"filter":0,"filterRange":1,"viewClass":"fldvalue_noedit"},
        {"name":"updated_by", "label":"updated by", "type":"string", "auto":"req.username", "edit":0, "addShow":0,"listShow":0,"filter":0,"filterRange":1,"viewClass":"fldvalue_noedit"}         
      ] 
   },
   {
      "name" : "Devices in use",
      "label" : "Devices",
      "table" : "devices",
      "key" : "id",      
      "refField" : "id",
      "nameField" : "nr",
      "refTemplate" : "ref:alldevices",
      "filter": false,
      "listLimit": 1000, 
      "fields" : [
        {"name":"id", "type":"integer", "auto":1, "edit":0, "addShow":0,"listShow":0,"filter":0},
        {"name":"nr", "type":"string", "listShow":1 },
        {"name":"description", "type":"string", "listShow":0,"filter":0},
        {"name":"type", "type":"string", "listShow":0,"filter":0},
        {"name":"user_name", "label":"user", "type":"string", "listShow":1,"filter":1},
        {"name":"user_id", "label":"last user id", "type":"string", "listShow":0,"filter":0},
        {"name":"user_at", "label":"last user store time", "type":"timestamp", "listShow":0,"filter":0},
        {"name":"ip", "type":"string", "listShow":0,"filter":0},
        {"name":"lat", "label":"last latitude", "type":"float", "listShow":0,"filter":0},
        {"name":"lng", "label":"last longitude", "type":"float", "listShow":0,"filter":0},
        {"name":"location_at", "label":"last location store time", "type":"timestamp", "listShow":0,"filter":0},
        {"name":"comm_at", "label":"last communication time", "type":"timestamp", "listShow":1,"filter":1},
        {"name":"attached", "label":"attached devices", "type":"string", "listShow":0,"filter":0},
        {"name":"attached_at", "label":"attached devices store time", "type":"timestamp", "listShow":0,"filter":0},
        {"name":"real_conf", "label":"stored configuration", "type":"string", "listShow":0,"filter":0},
        {"name":"conf_at", "label":"stored configuration info time", "type":"timestamp", "listShow":0,"filter":0},
        {"name":"set_conf", "label":"configuration to store", "type":"string", "listShow":0,"filter":0},
        {"name":"conf_send_status", "label":"configuration sending status", "type":"string", "values":[[0,"sent"],[1,"not sent"]], "listShow":0,"filter":0 },
        {"name":"sync_at", "label":"last sync time", "type":"timestamp", "listShow":0,"filter":0 },
        {"name":"software_version", "label":"software version", "type":"string", "listShow":0,"filter":0},
        {"name":"software_version_at", "label":"software version info time", "type":"timestamp", "listShow":0,"filter":0 },
        {"name":"status", "type":"string", "values":[["a","in use"],["d","not used"]], "listShow":1 },
        {"name":"created_at", "label":"created at", "type":"datetime", "auto":"now()", "edit":0, "addShow":0,"listShow":0,"filter":1,"filterRange":1,"viewClass":"fldvalue_noedit"},
        {"name":"updated_at", "label":"updated at", "type":"datetime", "auto":"now()", "edit":0, "addShow":0,"listShow":0,"filter":0,"filterRange":1,"viewClass":"fldvalue_noedit"},
        {"name":"updated_by", "label":"updated by", "type":"string", "auto":"req.username", "edit":0, "addShow":0,"listShow":0,"filter":0,"filterRange":1,"viewClass":"fldvalue_noedit"}         
      ] 
   },
   {
      "name" : "locations",
      "label" : "locations",
      "table" : "locations",
      "key" : "id",      
      "refField" : "id",
      "nameField" : "lat",
      "refTemplate" : "ref:location",
      "fields" : [
        {"name":"id", "type":"integer", "auto":1, "edit":0, "addShow":0,"listShow":0,"filter":0},
        {"name":"device_id", "label":"device", "type":"integer", "listShow":1 },
        {"name":"user_name", "label":"last user", "type":"string", "listShow":0,"filter":1},
        {"name":"user_id", "label":"last user id", "type":"integer", "listShow":0,"filter":0},
        {"name":"lat", "label":"latitude", "type":"float", "listShow":1,"filter":0},
        {"name":"lng", "label":"longitude", "type":"float", "listShow":1,"filter":0},
        {"name":"radius", "label":"location radius estimate", "type":"integer", "listShow":0 },
        {"name":"created_at", "label":"created at", "type":"datetime", "auto":"now()", "edit":0, "addShow":0,"listShow":1,"filter":1,"filterRange":1,"viewClass":"fldvalue_noedit"},
        {"name":"updated_at", "label":"updated at", "type":"datetime", "auto":"now()", "edit":0, "addShow":0,"listShow":0,"filter":0,"filterRange":1,"viewClass":"fldvalue_noedit"},
        {"name":"updated_by", "label":"updated by", "type":"string", "auto":"req.username", "edit":0, "addShow":0,"listShow":0,"filter":0,"filterRange":1,"viewClass":"fldvalue_noedit"}         
      ] 
   },
   {
      "name" : "feeds",
      "label" : "feeds",
      "table" : "feeds",
      "key" : "id",      
      "refField" : "did",
      "nameField" : "user_name",
      "refTemplate" : "ref:",
      "fields" : [
        {"name":"id", "type":"integer", "auto":1, "edit":0, "addShow":0,"listShow":0,"filter":0},
        {"name":"port",  "label":"port nr", "type":"integer", "listShow":0, "filter":0 },
        {"name":"device_id", "label":"device", "type":"integer", "listShow":1 },
        {"name":"user_name", "label":"last user", "type":"string", "listShow":1,"filter":1},
        {"name":"user_id", "label":"last user id", "type":"string", "listShow":0,"filter":0},
        {"name":"type", "type":"string", "values":[["movie","movie"],["audio","audio"]], "listShow":1,"filter":1 },
        {"name":"params", "label":"tech parameters", "type":"string", "listShow":0,"filter":0},
        {"name":"start_lat", "label":"start latitude", "type":"float", "listShow":0,"filter":0},
        {"name":"start_lng", "label":"start longitude", "type":"float", "listShow":0,"filter":0},
        {"name":"start_radius", "label":"start location radius estimate", "type":"integer", "listShow":0,"filter":0},
        {"name":"start_at", "label":"start time", "type":"timestamp", "listShow":0,"filter":1, "listShow":1},
        {"name":"end_lat", "label":"end latitude", "type":"float", "listShow":0,"filter":0},
        {"name":"end_lng", "label":"end longitude", "type":"float", "listShow":0,"filter":0},
        {"name":"end_radius", "label":"end location radius estimate", "type":"integer", "listShow":0,"filter":0},
        {"name":"end_at", "label":"end time", "type":"timestamp", "listShow":0,"filter":0},        
        {"name":"description", "type":"string", "listShow":0, "filter":0},
        {"name":"file_id", "label":"main file", "type":"string", "listShow":0,"filter":0},
        {"name":"part_files", "label":"part files", "type":"string", "listShow":0,"filter":0},
        {"name":"created_at", "label":"created at", "type":"datetime", "auto":"now()", "edit":0, "addShow":0,"listShow":0,"filter":0,"filterRange":1,"viewClass":"fldvalue_noedit"},
        {"name":"updated_at", "label":"updated at", "type":"datetime", "auto":"now()", "edit":0, "addShow":0,"listShow":0,"filter":0,"filterRange":1,"viewClass":"fldvalue_noedit"},
        {"name":"updated_by", "label":"updated by", "type":"string", "auto":"req.username", "edit":0, "addShow":0,"listShow":0,"filter":0,"filterRange":1,"viewClass":"fldvalue_noedit"}         
      ] 
   },
   {
      "name" : "messages",
      "label" : "messages",
      "table" : "messages",
      "key" : "id",      
      "refField" : "id",
      "nameField" : "msg",
      "refTemplate" : "ref:",
      "fields" : [
        {"name":"id", "type":"integer", "auto":1, "edit":0, "addShow":0,"listShow":0,"filter":0},
        {"name":"msg_type", "label":"message type", "type":"string", "values":[["person","person"],["information","information"],["barcode","barcode"]],"listShow":1 },
        {"name":"msg", "label":"contents", "type":"string", "listShow":1 },
        {"name":"file_id", "label":"main file", "type":"string", "listShow":0,"filter":0},
        {"name":"device_id", "label":"device", "type":"integer", "listShow":1 },
        {"name":"user_name", "label":"last user", "type":"string", "listShow":1,"filter":1},
        {"name":"user_id", "label":"last user id", "type":"string", "listShow":0,"filter":0},
        {"name":"sender_id", "label":"sender", "type":"integer", "listShow":1 },
        {"name":"lat", "label":"latitude", "type":"float", "listShow":0,"filter":0},
        {"name":"lng", "label":"longitude", "type":"float", "listShow":0,"filter":0},
        {"name":"sent_at", "label":"send time", "type":"timestamp", "listShow":1,"filter":1},
        {"name":"sendstatus", "label":"status", "type":"integer", "values":[[0,"received"],[1,"sent"],[2,"waiting"]], "listShow":1,"filter":1 },
        {"name":"created_at", "label":"created at", "type":"datetime", "auto":"now()", "edit":0, "addShow":0,"listShow":0,"filter":0,"filterRange":1,"viewClass":"fldvalue_noedit"},
        {"name":"updated_at", "label":"updated at", "type":"datetime", "auto":"now()", "edit":0, "addShow":0,"listShow":0,"filter":0,"filterRange":1,"viewClass":"fldvalue_noedit"},
        {"name":"updated_by", "label":"updated by", "type":"string", "auto":"req.username", "edit":0, "addShow":0,"listShow":0,"filter":0,"filterRange":1,"viewClass":"fldvalue_noedit"}         
      ] 
   },
   {
      "name" : "Last messages",
      "label" : "Last messages",
      "table" : "messages",
      "key" : "id",      
      "refField" : "id",
      "nameField" : "msg",
      "refTemplate" : "ref:",
      "filter":false,
      "fields" : [
        {"name":"id", "type":"integer", "auto":1, "edit":0, "addShow":0,"listShow":0,"filter":0},
        {"name":"msg", "label":"contents", "type":"string", "listShow":1 },
        {"name":"msg_type", "label":"message type", "type":"string", "values":[["person","person"],["information","information"],["barcode","barcode"]],"listShow":1 },       
        {"name":"file_id", "label":"main file", "type":"string", "listShow":0,"filter":0},
        {"name":"device_id", "label":"device", "type":"integer", "listShow":1 },
        {"name":"user_name", "label":"last user", "type":"string", "listShow":1,"filter":1},
        {"name":"user_id", "label":"last user id", "type":"string", "listShow":0,"filter":0},
        {"name":"sender_id", "label":"sender", "type":"integer", "listShow":1 },
        {"name":"lat", "label":"latitude", "type":"float", "listShow":0,"filter":0},
        {"name":"lng", "label":"longitude", "type":"float", "listShow":0,"filter":0},
        {"name":"sent_at", "label":"send time", "type":"timestamp", "listShow":1,"filter":1},
        {"name":"sendstatus", "label":"status", "type":"integer", "values":[[0,"received"],[1,"sent"],[2,"waiting"]], "listShow":1,"filter":1 },
        {"name":"created_at", "label":"created at", "type":"datetime", "auto":"now()", "edit":0, "addShow":0,"listShow":0,"filter":0,"filterRange":1,"viewClass":"fldvalue_noedit"},
        {"name":"updated_at", "label":"updated at", "type":"datetime", "auto":"now()", "edit":0, "addShow":0,"listShow":0,"filter":0,"filterRange":1,"viewClass":"fldvalue_noedit"},
        {"name":"updated_by", "label":"updated by", "type":"string", "auto":"req.username", "edit":0, "addShow":0,"listShow":0,"filter":0,"filterRange":1,"viewClass":"fldvalue_noedit"}         
      ] 
   },
      {
      "name" : "files",
      "label" : "files",
      "table" : "files",
      "key" : "id",      
      "refField" : "id",
      "nameField" : "fpath",
      "refTemplate" : "ref:",
      "fields" : [
        {"name":"id", "type":"integer", "auto":1, "edit":0, "addShow":0,"listShow":0,"filter":0},
        {"name":"device_id", "label":"device", "type":"integer", "listShow":1 },
        {"name":"user_name", "label":"last user", "type":"string", "listShow":1,"filter":1},
        {"name":"user_id", "label":"last user id", "type":"string", "listShow":0,"filter":0},
        {"name":"fpath", "label":"file path", "type":"string", "listShow":0, "filter":0},
        {"name":"type", "label":"type", "type":"string", "values":[["photo","photo"],["movie","movie"],["audio","audio"]], "listShow":1,"filter":1 },
        {"name":"format", "label":"file format", "type":"string", "listShow":0, "filter":0 },
        {"name":"xwidth", "label":"width", "type":"integer", "listShow":0,"filter":0 },
        {"name":"ywidth", "label":"height", "type":"integer", "listShow":0,"filter":0 },
        {"name":"length", "label":"length", "type":"integer", "listShow":0,"filter":0 },
        {"name":"start_lat", "label":"start latitude", "type":"float", "listShow":0,"filter":0},
        {"name":"start_lng", "label":"start longitude", "type":"float", "listShow":0,"filter":0},
        {"name":"start_radius", "label":"start location radius estimate", "type":"integer", "listShow":0,"filter":0},
        {"name":"start_at", "label":"start time", "type":"timestamp", "listShow":0,"filter":1, "listShow":1},
        {"name":"end_lat", "label":"end latitude", "type":"float", "listShow":0,"filter":0},
        {"name":"end_lng", "label":"end longitude", "type":"float", "listShow":0,"filter":0},
        {"name":"end_radius", "label":"end location radius estimate", "type":"integer", "listShow":0,"filter":0},
        {"name":"end_at", "label":"end time", "type":"timestamp", "listShow":0,"filter":0},   
        {"name":"status", "type":"string", "values":[["a","available"],["r","archived"],["d","deleted"]], "listShow":1 },
        {"name":"created_at", "label":"created at", "type":"datetime", "auto":"now()", "edit":0, "addShow":0,"listShow":1,"filter":1,"filterRange":1,"viewClass":"fldvalue_noedit"},
        {"name":"updated_at", "label":"updated at", "type":"datetime", "auto":"now()", "edit":0, "addShow":0,"listShow":0,"filter":0,"filterRange":1,"viewClass":"fldvalue_noedit"},
        {"name":"updated_by", "label":"updated by", "type":"string", "auto":"req.username", "edit":0, "addShow":0,"listShow":0,"filter":0,"filterRange":1,"viewClass":"fldvalue_noedit"}         
      ] 
   },
      {
      "name" : "x",
      "label" : "",
      "table" : "",
      "key" : "id",      
      "refField" : "id",
      "nameField" : "name",
      "refTemplate" : "ref:",
      "fields" : [
        {"name":"id", "type":"integer", "auto":1, "edit":0, "addShow":0,"listShow":0,"filter":0},
        {"name":"", "type":"string", "listShow":1 },
        {"name":"", "type":"string", "listShow":0 },
        {"name":"", "type":"string", "listShow":0 },
        {"name":"", "type":"string", "listShow":0 },
        {"name":"", "type":"string", "listShow":0 },
        {"name":"", "type":"string", "listShow":0 },
        {"name":"", "type":"string", "listShow":0 },
        {"name":"", "type":"string", "listShow":0 },
        {"name":"", "type":"string", "listShow":0 },
        {"name":"", "type":"string", "listShow":0 },
        {"name":"", "type":"string", "listShow":0 },
        {"name":"created_at", "label":"created at", "type":"datetime", "auto":"now()", "edit":0, "addShow":0,"listShow":1,"filter":1,"filterRange":1,"viewClass":"fldvalue_noedit"},
        {"name":"updated_at", "label":"updated at", "type":"datetime", "auto":"now()", "edit":0, "addShow":0,"listShow":0,"filter":0,"filterRange":1,"viewClass":"fldvalue_noedit"},
        {"name":"updated_by", "label":"updated by", "type":"string", "auto":"req.username", "edit":0, "addShow":0,"listShow":0,"filter":0,"filterRange":1,"viewClass":"fldvalue_noedit"}         
      ] 
   },
      {
      "name" : "x",
      "label" : "",
      "table" : "",
      "key" : "id",      
      "refField" : "id",
      "nameField" : "name",
      "refTemplate" : "ref:",
      "fields" : [
        {"name":"id", "type":"integer", "auto":1, "edit":0, "addShow":0,"listShow":0,"filter":0},
        {"name":"", "type":"string", "listShow":1 },
        {"name":"", "type":"string", "listShow":0 },
        {"name":"", "type":"string", "listShow":0 },
        {"name":"", "type":"string", "listShow":0 },
        {"name":"", "type":"string", "listShow":0 },
        {"name":"", "type":"string", "listShow":0 },
        {"name":"", "type":"string", "listShow":0 },
        {"name":"", "type":"string", "listShow":0 },
        {"name":"", "type":"string", "listShow":0 },
        {"name":"", "type":"string", "listShow":0 },
        {"name":"", "type":"string", "listShow":0 },
        {"name":"created_at", "label":"created at", "type":"datetime", "auto":"now()", "edit":0, "addShow":0,"listShow":1,"filter":1,"filterRange":1,"viewClass":"fldvalue_noedit"},
        {"name":"updated_at", "label":"updated at", "type":"datetime", "auto":"now()", "edit":0, "addShow":0,"listShow":0,"filter":0,"filterRange":1,"viewClass":"fldvalue_noedit"},
        {"name":"updated_by", "label":"updated by", "type":"string", "auto":"req.username", "edit":0, "addShow":0,"listShow":0,"filter":0,"filterRange":1,"viewClass":"fldvalue_noedit"}         
      ] 
   },
      {
      "name" : "x",
      "label" : "",
      "table" : "",
      "key" : "id",      
      "refField" : "id",
      "nameField" : "name",
      "refTemplate" : "ref:",
      "fields" : [
        {"name":"id", "type":"integer", "auto":1, "edit":0, "addShow":0,"listShow":0,"filter":0},
        {"name":"", "type":"string", "listShow":1 },
        {"name":"", "type":"string", "listShow":0 },
        {"name":"", "type":"string", "listShow":0 },
        {"name":"", "type":"string", "listShow":0 },
        {"name":"", "type":"string", "listShow":0 },
        {"name":"", "type":"string", "listShow":0 },
        {"name":"", "type":"string", "listShow":0 },
        {"name":"", "type":"string", "listShow":0 },
        {"name":"", "type":"string", "listShow":0 },
        {"name":"", "type":"string", "listShow":0 },
        {"name":"", "type":"string", "listShow":0 },
        {"name":"created_at", "label":"created at", "type":"datetime", "auto":"now()", "edit":0, "addShow":0,"listShow":1,"filter":1,"filterRange":1,"viewClass":"fldvalue_noedit"},
        {"name":"updated_at", "label":"updated at", "type":"datetime", "auto":"now()", "edit":0, "addShow":0,"listShow":0,"filter":0,"filterRange":1,"viewClass":"fldvalue_noedit"},
        {"name":"updated_by", "label":"updated by", "type":"string", "auto":"req.username", "edit":0, "addShow":0,"listShow":0,"filter":0,"filterRange":1,"viewClass":"fldvalue_noedit"}         
      ] 
   },
   
  
   {
      "name" : "x",
      "label" : "",
      "table" : "",
      "key" : "id",      
      "refField" : "id",
      "nameField" : "name",
      "refTemplate" : "ref:",
      "fields" : [
        {"name":"id", "type":"integer","edit":0, "addShow":0,"listShow":0,"filter":0},
        {"name":"", "label":"", "type":"string", "listShow":1 },
        {"name":"created_at", "type":"datetime"," edit":0, "addShow":0,"listShow":1,"filter":1,"filterRange":1,"viewClass":"fldvalue_noedit"},
        {"name":"updated_at", "type":"datetime"," edit":0, "addShow":0,"listShow":1,"filter":1,"filterRange":1,"viewClass":"fldvalue_noedit","auto":"now()"},
        {"name":"updated_by", "type":"string"," edit":0, "addShow":0,"listShow":1,"filter":1,"filterRange":1,"viewClass":"fldvalue_noedit","auto":"req.username"}         
      ]
   },
   
   {
      "name" : "settings",
      "label" : "Settings",
      "table" : "settings",
      "key" : "id", 
      "fields" : [
         {
            "name" : "id",
            "type" : "integer",
            "edit":false, "addShow":false,"listShow": false,"filter": true,"filterRange": true,
            "viewClass": "fldvalue_noedit"           
         },
         {
            "name" : "name",
            "type" : "string",
            "listshow": false
         },
         {
            "name" : "value",
            "type" : "string",
            "listShow": 1
         },
         {
            "name" : "created_at",
            "type" : "date",
            "edit":false, "addShow":false,"listShow": true,"filter": true,
            "filterRange": true,
            "viewClass": "fldvalue_noedit"              
         },
         {
            "name" : "updated_at",
            "type" : "date",
            "edit":false, "addShow":false,"listShow": true,"filter": true,
            "filterRange": true, 
            "viewClass": "fldvalue_noedit"           
         },
         {
            "name" : "updated_by",
            "type" : "string",
            "edit":false, "addShow":false,"listShow": false,"filter": true,
            "viewClass": "fldvalue_noedit"           
         }
      ]
   }     
]
;
*/
   
exports.viewdefs = viewdefs;
if (window) window.viewdefs = viewdefs;

})(typeof exports === 'undefined'? this.viewdefs = {} : exports);
