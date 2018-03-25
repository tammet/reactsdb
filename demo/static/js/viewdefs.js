(function(exports) {

var viewdefs = [

    // "users": no "groupMenu" set, differently from tabbed_users below
    {
    "name" : "users",
    "table" : "users",
    "key" : "id",      
    "refField" : "id",
    "nameField" : "username",
    "groups":[{"name":"main","label":"Main fields"},
              {"name": "fancy", "label": "Fancy fields"},
              {"name":"other", "label":"Other fields"}],
    "fields" : [
      {"name":"id", "type":"integer", "auto":1, "edit":0, "addShow":0,"listShow":1,"filter":1, "group":"main"},  
      {"name":"username", "type":"string", "mustFill":1, "listShow":1, "filter":1,  "group":"main", "help": " std username or facebook:0013230 or google:233320111"},
      {"name":"service", "type":"string", "listShow":0, "filter":0,  "group":"main", "help": " null or facebook or google"},
      {"name":"service_uid", "type":"string", "listShow":0, "filter":1, "group":"other", "help": " null or user id in facebook or google"},
      {"name":"password", "type":"string", "listShow":0, "filter":0,  "group":"other", "help": " not used for facebook or google case"},
      {"name":"fullname", "type":"string", "listShow":0, "filter":0,  "group":"other", "help": "- used for facebook and google"},
      {"name":"phone", "type":"string", "listShow":0, "filter":0, "group":"other"},
      {"name":"email", "type":"string", "listShow":0, "filter":0, "group":"other"},
      {"name":"address", "type":"string", "listShow":0, "filter":0, "editWidget":"textarea", "group":"fancy"},
      {"name":"locationid", "type":"ref:locations", "listShow":1, "filter":0, "group":"fancy"},        
      {"name":"country", "type":"string", "listShow":0, "filter":0, "group":"other"},
        // "type":"array:string"}, 
      {"name":"lang", "label": "Language", "type":"string", "listShow":0, "filter":0,
        "values":["est","eng"], "group":"fancy", "filter":1},
      {"name":"remarks", "type":"string", "listShow":0, "filter":0, "group":"fancy",
        "showOnlyWhen" : {
          "lang" : "est"
        }, "help":"appears and disappears according to lang value"},
      {"name":"level", "type":"integer", "listShow":0, "filter":0, "group":"fancy", 
         "mustFill":1,
         "values": [["0","superuser"],["1","admin"],["2","write"],["3","social media"],["10","anonymous"]],
         "help": "- 0 superuser, 1 admin, 2 data write/change, 3 social media login, 10 unauthenticated"},
      {"name":"status", "type":"string", "listShow":1, "filter":0, 
         "values": [["A","active"],["W","waiting"],["D","deleted"]],
         "group":"fancy",
         "help": "- A: active, D: deleted, W: waiting for activation "},
      {"name":"scores", "type":"string", "listShow":0, "filter":0, "group":"other", "help": " jsonb yet unknown structure for storing scores"},
      //{"name":"extra jsonb", "type":"string", "listShow":0, "filter":0, "help": " jsonb yet unknown structure for storing additional information"},
      {"name":"instid", "type":"string", "listShow":0, "filter":0, "group":"other", "help": " last installation textual id"},
      {"name":"activity_at", "type":"date", "listShow":0, "filter":0, "group":"fancy", "help": " last major user activity time (not all requests update this)"},
      {"name":"created_at", "type":"datetime", "listShow":1, "filter":1, "group":"other"},
      {"name":"updated_at", "type":"datetime", "listShow":0, "filter":0, "group":"other"},
      {"name":"updated_by", "type":"string", "listShow":0, "filter":0, "group":"other", "help": " username or systemname creating/updating"}
    ]  
   },   

    // "tabbed_users": there is  "groupMenu": "tabs" set!
    {
      "name" : "tabbed users",
      "table" : "users",
      "key" : "id",      
      "refField" : "id",
      "nameField" : "username",
      "groupMenu": "tabs",
      "groups":[{"name":"main","label":"Main fields"},
                {"name": "fancy", "label": "Fancy fields"},
                {"name":"other", "label":"Other fields"}],
      "fields" : [
        {"name":"id", "type":"integer", "auto":1, "edit":0, "addShow":0,"listShow":1,"filter":1, "group":"main"},  
        {"name":"username", "type":"string", "mustFill":1, "listShow":1, "filter":1,  "group":"main", "help": " std username or facebook:0013230 or google:233320111"},
        {"name":"service", "type":"string", "listShow":0, "filter":0,  "group":"main", "help": " null or facebook or google"},
        {"name":"service_uid", "type":"string", "listShow":0, "filter":1, "group":"other", "help": " null or user id in facebook or google"},
        {"name":"password", "type":"string", "listShow":0, "filter":0,  "group":"other", "help": " not used for facebook or google case"},
        {"name":"fullname", "type":"string", "listShow":0, "filter":0,  "group":"other", "help": "- used for facebook and google"},
        {"name":"phone", "type":"string", "listShow":0, "filter":0, "group":"other"},
        {"name":"email", "type":"string", "listShow":0, "filter":0, "group":"other"},
        {"name":"address", "type":"string", "listShow":0, "filter":0, "editWidget":"textarea", "group":"fancy"},
        {"name":"locationid", "type":"ref:locations", "listShow":0, "filter":0, "group":"fancy"},        
        {"name":"country", "type":"string", "listShow":0, "filter":0, "group":"other"},
          // "type":"array:string"}, 
        {"name":"lang", "label": "Language", "type":"string", "listShow":0, "filter":0,
          "values":["est","eng"], "group":"fancy", "filter":1},
        {"name":"remarks", "type":"string", "listShow":0, "filter":0, "group":"fancy",
          "showOnlyWhen" : {
            "lang" : "est"
          }, "help":"appears and disappears according to lang value"},
        {"name":"level", "type":"integer", "listShow":0, "filter":0, "group":"fancy", 
           "mustFill":1,
           "values": [["0","superuser"],["1","admin"],["2","write"],["3","social media"],["10","anonymous"]],
           "help": "- 0 superuser, 1 admin, 2 data write/change, 3 social media login, 10 unauthenticated"},
        {"name":"status", "type":"string", "listShow":1, "filter":0, 
           "values": [["A","active"],["W","waiting"],["D","deleted"]],
           "group":"fancy",
           "help": "- A: active, D: deleted, W: waiting for activation "},
        {"name":"scores", "type":"string", "listShow":0, "filter":0, "group":"other", "help": " jsonb yet unknown structure for storing scores"},
        //{"name":"extra jsonb", "type":"string", "listShow":0, "filter":0, "help": " jsonb yet unknown structure for storing additional information"},
        {"name":"instid", "type":"string", "listShow":0, "filter":0, "group":"other", "help": " last installation textual id"},
        {"name":"activity_at", "type":"date", "listShow":0, "filter":0, "group":"fancy", "help": " last major user activity time (not all requests update this)"},
        {"name":"created_at", "type":"datetime", "listShow":1, "filter":1, "group":"other"},
        {"name":"updated_at", "type":"datetime", "listShow":0, "filter":0, "group":"other"},
        {"name":"updated_by", "type":"string", "listShow":0, "filter":0, "group":"other", "help": " username or systemname creating/updating"}
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
      {"name":"id", "type":"integer", "auto":1, "edit":0, "addShow":0,"listShow":1,"filter":1}, 
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
      {"name":"types", "type":"string", "listShow":0, "filter":0, "help": " main type   "},
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
      {"name":"id", "type":"integer", "auto":1, "edit":0, "addShow":0,"listShow":1,"filter":1}, 
      {"name":"locationid", "type":"integer", "listShow":1, "filter":1, "help": " location which is described"},
      {"name":"userid", "type":"integer", "listShow":1, "filter":1, "help": " user id who sent this info "},
      {"name":"score", "type":"integer", "listShow":0, "filter":0, "help": " score given by user"},
      {"name":"status", "type":"string", "listShow":0, "filter":0, "help": "- A: active, D: deleted"},
      {"name":"created_at", "type":"datetime", "listShow":0, "filter":0}
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
   },

     // "menulocations": # all identified locations without a menu and a different layout
     {
      "name" : "menulocations",
      "table" : "locations",  
      "key" : "id",      
      "refField" : "id",
      "nameField" : "name",
      
      "simplemenu": false,
      "filterstyle": "horizontal",
      "staticfilter":[["status","=","A"]],
      "edit": false,
      "sort": true,
      "onclick": function(x) {alert(x)},

      "fields" : [  
        {"name":"id", "type":"integer", "auto":1, "edit":0, "addShow":0,"listShow":0,"filter":0}, 
        {"name":"lat", "type":"float", "listShow":0, "filter":0, "help": " latitude"},
        {"name":"lng", "type":"float", "listShow":0, "filter":0, "help": " longitude "},
        {"name":"zoom", "type":"integer", "listShow":0, "filter":0, "help": " map zoom level at which shown"},
        {"name":"pop", "type":"integer", "listShow":0, "filter":0, "help": " main popularity number"},
        {"name":"score", "type":"integer", "listShow":1, "filter":1},
        {"name":"vispop", "type":"integer", "listShow":0, "filter":0, "help": " initial visual popularity "},
        {"name":"knownpop", "type":"integer", "listShow":0, "filter":0, "help": " initial wellknowedness number"},
        {"name":"extvisits", "type":"integer", "listShow":0, "filter":0, "help": " initial known external visits"},
        {"name":"visits", "type":"integer", "listShow":1, "filter":0, "help": " visits known from our system"},
        {"name":"country", "type":"string", "listShow":0, "filter":0, "help": " country name if known"},
        {"name":"city", "type":"string", "listShow":0, "filter":0, "help": " city/village/area name if known"},
        {"name":"radius", "type":"string", "listShow":0, "filter":0, "help": " radius of the object, if known"},
        {"name":"vradius","type":"float", "listShow":0, "filter":0, "help": " visible radius of the object,if known"},
        {"name":"name", "type":"string", "listShow":1, "filter":0, "order":1, "help": " main name"},
        {"name":"thumb", "type":"string", "listShow":0, "filter":0, "help": "  main thumbnail filename or url part"},
        {"name":"photo", "type":"string", "listShow":0, "filter":0, "help": " main large photo filename or url part"},
        {"name":"types", "type":"string", "listShow":0, "filter":0, "help": " main type   "},
        {"name":"desctext", "type":"string", "listShow":0, "filter":0, "help": " main description"},
        {"name":"descsrc", "type":"string", "listShow":0, "filter":0, "help": " source of the main description"},
        {"name":"links", "type":"string", "listShow":0, "filter":0, "help": " jsonb main links as a string list"},
        {"name":"tags", "type":"string", "listShow":0, "filter":0, "help": " jsonb main tags as a tag:importance dict"},
        {"name":"systsource", "type":"string", "listShow":0, "filter":0, "help": " system source from which known"},
        {"name":"userid", "type":"integer", "listShow":0, "filter":0, "help": " user id if originates from this user"},
        {"name":"version", "type":"string", "listShow":0, "filter":0, "help": " sender software version"},
        {"name":"locinfocache", "type":"string", "listShow":0, "filter":0, "help": " jsonb cached selective list of locinfo dicts, each sent from a user"},
        {"name":"status", "type":"string", "listShow":0, "filter":0, "help": " A: active, D: deleted"},
        {"name":"created_at", "type":"datetime", "listShow":1, "filter":0},
        {"name":"updated_at", "type":"datetime", "listShow":0, "filter":0},
        {"name":"updated_by", "type":"string", "listShow":0, "filter":0, "help": " username or systemname creating/updating"}
      ]  
     }, 

]   
  
   
exports.viewdefs = viewdefs;
if (window) window.viewdefs = viewdefs;

})(typeof exports === 'undefined'? this.viewdefs = {} : exports);
