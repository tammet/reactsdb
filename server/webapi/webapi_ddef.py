#!/usr/bin/python
# -*- coding: utf-8 -*-

# data / view descriptions for webapi

# ====== data/view descriptions ========

#!/usr/bin/python
# -*- coding: utf-8 -*-


# ====== basic data/view description ========

viewdefs={

    "users": # all users are here: both admins and mobile users
    {
    "name" : "users",
    "table" : "users",
    "key" : "id",      
    "refField" : "id",
    "nameField" : "username",
    "fields" : [
      {"name":"id", "type":"integer","auto":1, "edit":0, "addShow":0,"listShow":0,"filter":0},  
      {"name":"username", "type":"string", "listShow":0, "filter":0, "help": " std username or facebook:0013230 or google:233320111"},
      {"name":"service", "type":"string", "listShow":0, "filter":0, "help": " null or facebook or google"},
      {"name":"service_uid", "type":"string", "listShow":0, "filter":0, "help": " null or user id in facebook or google"},
      {"name":"password", "type":"string", "listShow":0, "filter":0, "help": " not used for facebook or google case"},
      {"name":"salt", "type":"string", "listShow":0, "filter":0, "help": " password salt: appended to password before hash"},
      {"name":"fullname", "type":"string", "listShow":0, "filter":0, "help": "- used for facebook and google"},
      {"name":"phone", "type":"string", "listShow":0, "filter":0},
      {"name":"email", "type":"string", "listShow":0, "filter":0},
      {"name":"address", "type":"string", "listShow":0, "filter":0},
      {"name":"country", "type":"string", "listShow":0, "filter":0}, 
      {"name":"locationid", "type":"ref:locations", "listShow":0, "filter":0, "group":"fancy"},
      {"name":"lang", "type":"string", "listShow":0, "filter":0},
      {"name":"remarks", "type":"string", "listShow":0, "filter":0},
      {"name":"level", "type":"integer", "listShow":0, "filter":0, "help": "- 0 superuser, 1 admin, 2 data write/change, 3 social media login, 10 unauthenticated"},
      {"name":"status", "type":"string", "listShow":0, "filter":0, "help": "- A: active, D: deleted, W: waiting for activation "},
      {"name":"scores", "type":"string", "listShow":0, "filter":0, "help": " jsonb yet unknown structure for storing scores"},
      #{"name":"extra jsonb", "type":"string", "listShow":0, "filter":0, "help": " jsonb yet unknown structure for storing additional information"},
      {"name":"instid", "type":"string", "listShow":0, "filter":0, "help": " last installation textual id"},
      {"name":"activity_at", "type":"datetime", "listShow":0, "filter":0, "help": " last major user activity time (not all requests update this)"},
      {"name":"created_at", "type":"datetime", "listShow":0, "filter":0},
      {"name":"updated_at", "type":"datetime", "listShow":0, "filter":0},
      {"name":"updated_by", "type":"string", "listShow":0, "filter":0, "help": " username or systemname creating/updating"}
    ]  
   },   

    "locations": # all identified locations, small and large
    {
    "name" : "locations",
    "key" : "id",      
    "refField" : "id",
    "nameField" : "name",
    "fields" : [  
      {"name":"id", "type":"integer", "auto":1,"edit":0, "addShow":0,"listShow":0,"filter":0}, 
      {"name":"lat", "type":"float", "listShow":0, "filter":0, "help": " latitude"},
      {"name":"lng", "type":"float", "listShow":0, "filter":0, "help": " longitude "},
      {"name":"zoom", "type":"integer", "listShow":0, "filter":0, "help": " map zoom level at which shown"},
      {"name":"pop", "type":"integer", "listShow":0, "filter":0, "help": " main popularity number"},
      {"name":"score", "type":"integer", "listShow":0, "filter":0, "help": " main score number (0 ... N)"},
      {"name":"vispop", "type":"integer", "listShow":0, "filter":0, "help": " initial visual popularity "},
      {"name":"knownpop", "type":"integer", "listShow":0, "filter":0, "help": " initial wellknowedness number"},
      {"name":"extvisits", "type":"integer", "listShow":0, "filter":0, "help": " initial known external visits"},
      {"name":"visits", "type":"integer", "listShow":0, "filter":0, "help": " visits known from our system"},
      {"name":"country", "type":"string", "listShow":0, "filter":0, "help": " country name if known"},
      #{"name":"locationid", "type":"ref:locations", "listShow":0, "filter":0, "group":"fancy"},
      {"name":"city", "type":"string", "listShow":0, "filter":0, "help": " city/village/area name if known"},
      {"name":"radius", "type":"string", "listShow":0, "filter":0, "help": " radius of the object, if known"},
      {"name":"vradius","type":"float", "listShow":0, "filter":0, "help": " visible radius of the object,if known"},
      {"name":"name", "type":"string", "listShow":0, "filter":0, "help": " main name"},
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
      {"name":"created_at", "type":"datetime", "listShow":0, "filter":0},
      {"name":"updated_at", "type":"datetime", "listShow":0, "filter":0},
      {"name":"updated_by", "type":"string", "listShow":0, "filter":0, "help": " username or systemname creating/updating"}
    ]  
   }, 

    "checkins": # all checkins of users without added data, except ratings
    {
    "name" : "checkins",
    "key" : "id",
    "refField" : "id",
    "nameField" : "userid",
    "fields" : [  
      {"name":"id", "type":"integer", "auto":1, "edit":0, "addShow":0,"listShow":0,"filter":0}, 
      {"name":"locationid", "type":"integer", "listShow":0, "filter":0, "help": " location which is described"},
      {"name":"userid", "type":"integer", "listShow":0, "filter":0, "help": " user id who sent this info "},
      {"name":"score", "type":"integer", "listShow":0, "filter":0, "help": " score given by user"},
      {"name":"status", "type":"string", "listShow":0, "filter":0, "help": "- A: active, D: deleted"},
      {"name":"created_at", "type":"datetime", "listShow":0, "filter":0}
    ]  
   }, 

    "sessions": # used only if/when login sessions needed
    {
    "name" : "sessions",
    "key" : "id",
    "refField" : "id",
    "nameField" : "userid",
    "fields" : [  
      {"name":"id", "type":"integer", "auto":1, "edit":0, "addShow":0,"listShow":0,"filter":0},
      {"name":"sid", "type":"string", "listShow":0, "filter":0, "help": " client-generated session id"},
      {"name":"userid", "type":"integer", "listShow":0, "filter":0},
      {"name":"endts", "type":"datetime", "listShow":0, "filter":0},
    ]  
   }
}   
