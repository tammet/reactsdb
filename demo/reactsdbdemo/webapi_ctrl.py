#!/usr/bin/python
# -*- coding: utf-8 -*-
  
import sys,psycopg2,string,time,os
import Cookie,types,random,signal,datetime,logging
#import cgi, cgitb

from ConfigParser import SafeConfigParser

from webapi_model import *
from webapi_common import *
from webapi_ddef import *

#cgitb.enable(format='text')

# ====== globals =========

class Request:
  flask=True
  debug=False # True: cgitb, less early catching, sparse json formatting
  timeoutsecs=10 # seconds until timeout
  mime='Content-Type: text/plain' # all outputs are json with this content-type
  inmethod=None # GET,PUT,POST
  dtables={} # taken from api_ddef
  con=None # postgres connection
  inparams=None # result of cgi.FieldStorage()
  stdparams={} # dict of all standard params op, table, ..., token
  sid=None # session id as passed
  username=None # as found from session
  userid=None  # as found from session
  userfullname=None  # as found from session
  userlevel=10  # as found from session: 0 super, 1 admin, 2 write, 3 read, 4+ not authenticates        
  outstr=None # successful data / result string to be returned by api
  op='list' # op, table, ... , token are given as class vars as well
  table='settings' # ...
  start=0
  count=100
  rowstart=0 # ...
  rowend=0 # ...
  sort_field='id' # ...
  sort_dir='desc' # ...
  filters={} # ...
  key='id'
  callback=None


# ====== code =========

# ----------- top level functions, login, authent, read indata -------------


def ctrl_main(configfile,inmethod=None,inparams=None):
  req=Request() 
  req.dtables=dtables # from api_ddef

  if req.flask:
    req.inparams=flask_parse_std_parameters(req,inmethod,inparams) 
  else:
    req.inparams=cgi_parse_std_parameters(req)
    signal.signal(signal.SIGALRM, alarmhandler)  
    signal.alarm(req.timeoutsecs)   

  try:
    conf=get_conf(req,configfile)
    req.conf=conf
  except:
    handle_error(req,1,'cannot read system configuration') 
  try:  
    set_logging(req.conf)               
  except:
    handle_error(req,1,'cannot setup logging')
  try:
    req.con=psycopg2.connect(host=req.conf["db_host"],
      database=req.conf["db_name"],user=req.conf["db_user"],
      password=req.conf["db_password"])
  except Exception as e:
    handle_error(req,1,'cannot connect to database, exiting:'+str(e.pgerror))
  if not req.op:
    handle_error(req,3,'op parameter missing')  
  if req.op=='check_token':
    handle_check_token(req)    
  elif authenticate(req): 
    db_update_sessioninfo_end(req,req.sid)
    if req.debug:
      dispatch(req)
    else:      
      try:
        dispatch(req)      
      except TimeoutExc:
        try:
          if req.con:
            req.con.cancel()
            req.con.close()
        except:
          pass
        handle_error(req,7,'timeout after '+str(req.timeoutsecs)+' seconds')   
      except Error:
        pass  # our own error handling class in webapi_common
      except Exception as e:
        import traceback
        handle_error(req,8,'unexpected error: '+traceback.format_exc()) # full traceback
        #handle_error(req,8,'unexpected error: '+str(e)) # short version
  else:        
    #parse_std_parameters(req)
    if req.stdparams["op"]=='password_login': handle_password_login(req)
    else:
      handle_error(req,2,'authentication failure')    
  try:
    req.con.close()
  except:
    handle_error(req,1,'cannot close db connection')     
  #print(req.mime+'\r\n')   
  #print(req.outstr)
  if not req.flask:
    signal.alarm(0)
  return req.outstr


def flask_parse_std_parameters(req,inmethod,inparams):  
  invalues={"op":"list","table":None,"view":None,"fields":None,"filter":None,"sort":None,
            "id":None,"start":0,"count":100,"data":None,"key":"id","token":None,"callback": None,
            "name":None,"tags":None,"description":None,"username":None,"password":None,
            "user_id":None,"userid":None, "country": None, "city": None,
            "lat0":None,"lat1":None,"lng0":None,"lng1":None,"sortkey":None,"join":None,
            "to":None,"password":None}
  res={}  
  req.inmethod=inmethod
  if not inparams:
    handle_error(req,4,"no parameters given")
  for key in inparams.keys():
    if not invalues.has_key(key):
      handle_error(req,4,"unknown parameter name: "+str(key))
  for param in invalues.keys():
    if inparams.has_key(param) and inparams[param]:
      res[param]=inparams[param]
    else:
      res[param]=invalues[param]
    setattr(req,param,res[param])
  req.stdparams=res
  return inparams


def cgi_parse_std_parameters(req):  
  inparams=None #cgi.FieldStorage()
  invalues={"op":"list","table":None,"view":None,"fields":None,"filter":None,"sort":None,
            "id":None,"start":0,"count":100,"data":None,"key":"id","token":None,"callback": None,
            "name":None,"tags":None,"description":None,"username":None,"password":None,
            "user_id":None,"userid":None, "country": None, "city": None,
            "lat0":None,"lat1":None,"lng0":None,"lng1":None,"sortkey":None,"join":None,
            "to":None,"password":None}
  res={}  
  req.inmethod=os.environ['REQUEST_METHOD']
  if req.inmethod in ['POST','PUT'] :
    # post case      
    indata=sys.stdin.read()
    try:
      data=json.loads(indata)
    except:
      handle_error(req,3,"received data is not correct json 5")  
    if not data or (type(data)!=type({"a":1})):
      handle_error(req,3,"received data is not a json object {...}")
    for key in data.keys():
      if not invalues.has_key(key):
        handle_error(req,4,"unknown parameter name: "+str(key))
    for param in invalues.keys():
      if data.has_key(param) and data[param]:
        res[param]=data[param]
      else:
        res[param]=invalues[param]
      setattr(req,param,res[param])
  else:  
    # get case
    inparams=cgi.FieldStorage()   
    for key in inparams.keys():
      if not invalues.has_key(key):
        handle_error(req,4,"unknown parameter name: "+str(key))  
    for param in invalues.keys():
      if inparams.has_key(param) and inparams[param].value:
        if type(invalues[param])==type(2): # integer, must convert
          try:
            res[param]=int(inparams[param].value)
          except:
            handle_error(req,4,"non-integer value given to parameter "+param)
        else:  
          res[param]=inparams[param].value
      else:
        res[param]=invalues[param] 
      setattr(req,param,res[param])
  req.stdparams=res
  return inparams


def authenticate(req):
  if req.stdparams['token']: sid=req.stdparams['token']
  else: sid=None
  if not sid:
    return False
  elif sid=="test":
    #return False
    req.userid=1
    req.username="testuser"  
    req.userlevel=0
    req.usergroup=1
    req.usergroups=[1]
    return True
  else:
    req.sid=sid        
    data=db_get_sessioninfo_row(req,sid)
    if not data:      
      return False
    else:  
      req.userid=data[0]
      req.username=data[1]  
      req.userlevel=data[4]
      req.usergroup=data[8]
      req.usertopgroup=data[9]
      get_set_req_groups(req)
      logging.info("AUT "+str(req.ipaddress)+" "+str(sid)+" as "
                  "id: "+str(req.userid)+" name: "+str(req.username)+" level: "+str(req.userlevel))
      if data[5]: req.userlang=data[5]
      if data[6]: req.useruistyle=data[6]
      req.userfullname=''     
      if data[7]: 
        req.userfullname=data[7]
      elif not data[2] and not data[3]: 
        req.userfullname=str(req.userid) 
      else:  
        if data[2]: req.userfullname+=data[2]
        if data[3]: req.userfullname+=" "+data[3]
      if data[8]: req.login_service=data[8]
      if data[9]: req.token=data[9]
      elif req.username and req.username.startswith("google:"):
        req.login_service="google"
      elif req.username and req.username.startswith("facebook:"):           
        req.login_service="facebook"
      return True   

def get_set_req_groups(req):    
  groups=db_get_usergroups(req,req.userid,req.usergroup,req.usertopgroup)
  req.usernamedgroups=groups
  req.usergroups=map(lambda x: x["id"], groups)


def dispatch(req):  
  if req.op=='count':                  
    if dtables.has_key(req.table):
      handle_count(req,req.table)       
    else:
      handle_error(req,4,"unknown table parameter")    
  elif req.op=='list':            
    #if req.table=='users':
    #  handle_list_users(req)  
    #elif req.table=='sessions':
    #  handle_list_sessions(req)      
    if dtables.has_key(req.table):
      handle_list(req,req.table)       
    else:
      handle_error(req,4,"unknown table parameter")   
  elif req.op=='countedlist':       
    #if req.table=='users':
    #  handle_counted_list_users(req)  
    #elif req.table=='sessions':
    #  handle_counted_list_sessions(req)         
    if dtables.has_key(req.table):
      handle_counted_list(req,req.table)       
    else:
      handle_error(req,4,"unknown table parameter")      
  elif req.op=='update':
    #if req.table=='users':
    #  handle_update_users(req)
    if dtables.has_key(req.table):
      handle_update(req,req.table)  
    else:
      handle_error(req,4,"unknown table parameter")         
  elif req.op=='add':
    #if req.table=='users':
    #  handle_add_users(req)    
    if dtables.has_key(req.table):
      handle_add(req,req.table)  
    else:
      handle_error(req,4,"unknown table parameter") 
  elif req.op=='delete':
    #if req.table=='users':
    #  handle_delete_users(req)  
    if dtables.has_key(req.table):
      handle_delete(req,req.table)  
    else:
      handle_error(req,4,"unknown table parameter")       
  else:
    handle_error(req,4,"unknown op parameter value")
          

def authorize_show(req,table,op):
  if authorize(req,table,op): #in common.py
    return True
  else:
    handle_error(req,5,"Not enough rights for this operation")
 

def authorize(req,table,op):
  #req.debug+="userlevel, op, table: "+str(req.userlevel)+" "+op+" "+table+"<br>"
  return True
  if req.userlevel==0 or req.userlevel==1:   
    tbls2=['sessions','users']
    if table in tbls2:
      if op in ['delete']: return False
      else: return True
    else:
      return True      
  elif req.userlevel==2:
    if op in ['sessions','users']: return False
    return True
  elif req.userlevel==3:
    if op in ["ssearch","csearch","ksearch"]: return True
    if op in ["viewrec","list"] and table in ["objects","sobjects","dobjects","lobjects","myalbums"]: return True    
    if op in ["add"] and table in ["comments","in_photos","myalbums"]: return True     
    if op in ["saveadd"] and table in ["myalbums"]: return True
    if op in ["delete"] and table in ["in_photos","myalbums"]: return True 
    return False
  else: 
    if op in ["ssearch","csearch","ksearch"]: return True
    if op in ["viewrec","list"] and table in ["objects","sobjects","dobjects","lobjects","myalbums"]: return True    
    return False        
    
def handle_check_token(req):
  if req.token=="test":
    odata={"ok": 1}
  else:  
    data=db_get_sessioninfo_row(req,req.token)
    if not data: odata={"ok": 0}
    else: odata={"ok": 1}
  tmp=out_format_list(req,odata)
  return tmp
    
  
def handle_password_login(req):  
  """
  """
  if not (req.stdparams.has_key("username") and req.stdparams.has_key("password") and 
          req.stdparams["username"] and req.stdparams["password"]):
    handle_error(req,3,'username and password parameters missing') 
  else:
    import hashlib
    passhash=hashlib.sha1(req.stdparams["password"]).hexdigest()    
    odata={"id":123,"username":"testuser",
           "level":0,"fullname":"Test User"}
    tmp=out_format_list(req,odata)
    return tmp         
    
    data=db_get_userlogininfo_row(req,req.stdparams["username"],passhash)
    if not (data and data[1]==req.stdparams['username']):
      handle_error(req,2,'wrong username or password') 
    else:  
      req.userid=data[0]
      req.username=data[1]
      req.userlevel=data[4]
      req.userfullname=''
      odata={"id":req.userid,"username":req.username,
             "level":req.userlevel,"fullname":req.userfullname}
      if data[2]: 
        odata["firstname"]=data[2]
      if data[3]: 
        odata["lastname"]=data[3]
      if data[5]: 
        req.userlang=data[5]
        odata["lang"]=req.userlang
      if data[6]: 
        req.useruistyle=data[6]    
        odata["uistyle"]=req.useruistyle
      if data[7]: 
        req.userfullname=data[7]       
      elif not data[2] and not data[3]: 
        req.userfullname=str(req.userid) 
      else:  
        if data[2]: req.userfullname+=data[2]
        if data[3]: req.userfullname+=" "+data[3]
      if req.userfullname:  
        odata["fullname"]=req.userfullname
      if data[8]: 
        req.login_service=data[8] 
        odata["service"]=req.login_service
      if data[9]: 
        odata["email"]=data[9] 
      try:              
        dgst = hashlib.sha1(str(time.time())+str(os.urandom(8))+str(req.userid)).hexdigest()          
        create_login_session(req,dgst,data[1],None)
      except:
        handle_error(req,1,'error creating login session')             
      odata["token"]=dgst 
      tmp=out_format_list(req,odata)
      return tmp


def handle_logout(req):  
  """  
  """
  import urllib2
  if req.sid and req.username:
    try:
      logout_sessions(req,req.sid,req.username)  
    except:
      req.warning="problem logging out" 
      req.op="home"
      dispatch(req)  
      return      
  if req.login_service=="google":
    if req.token:    
      gurl="https://accounts.google.com/o/oauth2/revoke?token="+req.token
      try:
        ureq = urllib2.Request(gurl)
        uresp=urllib2.urlopen(ureq)
        jsonstr = uresp.read()          
      except:
        req.warning="Please go to <a href='https://plus.google.com/apps'>this page</a>!" 
        req.op="home"
        dispatch(req)  
        return        
    else:    
      req.warning="Please go to  <a href='https://plus.google.com/apps'>this page</a>!" 
      req.op="home"
      dispatch(req)  
      return
  req.username=""
  req.login_service=None
  req.op="home"
  dispatch(req)  
  return

  
def handle_change_password(req):
  import hashlib
  encpwd=hashlib.sha1(req.password).hexdigest() # encrypt pwd
  #encpwd=req.password
  res=update_password(req,req.username,encpwd)
  tmp=out_format_list(req,res)
  return tmp


# ----------- generic table functions -------------


def handle_list(req,table):
  """
  """          
  if not authorize_show(req,table,'list'): return  
  data=get_list_data(req,table)
  out_format_list(req,data)
  return


def handle_count(req,table,extraflds=None):
  """
  """          
  if not authorize_show(req,table,'list'): return  
  data=get_count_data(req,table,extraflds)
  out_format_list(req,data)
  return  

def handle_counted_list(req,table,extraflds=None):
  """
  """          
  if not authorize_show(req,table,'list'): return 
  countdata=get_count_data(req,table,extraflds) 
  if not countdata or (not countdata.has_key("count")) or countdata["count"]<1:
    out_format_list(req,{"count":0,"list":[]})
    return
  data=get_list_data(req,table)
  out_format_list(req,{"count": countdata["count"],"list":data})
  return

def handle_add(req,table):
  """
  """ 
  if not authorize_show(req,table,'add'): return
  res=add_data(req,table,req.data)
  out_format_list(req,res)
  return   

def handle_update(req,table):
  """
  """         
  if not authorize_show(req,table,'update'): return
  res=update_data(req,table,req.key,req.data)
  out_format_list(req,res)
  return 
  
def handle_delete(req,table):
  """
  """          
  if not authorize_show(req,table,'delete'): return
  res=delete_data(req,table,req.key,req.data)
  out_format_list(req,res)
  return 
  
  

# ----------- specific table functions -------------
  

# -------- conf and logging ------------------


def get_conf(req,configfile):   
  conf={}
  defaults={ 
          "host":"localhost"
        , "objects_db": 1001
        , "objects_dbsize": 0
        , "name_occurrence_limit" : '10'
        , 'shown_rows': '50'}
  cp = SafeConfigParser(defaults)
  try:
    cp.read(configfile)
  except:
    handle_error(req,1,'Cannot read configuration file '+configfile)
  if not cp.sections():
    handle_error(req,1,'Cannot parse configuration file '+configfile)
    
  if not cp.has_section("Database"): cp.add_section("Database")  
  try:
    conf["db_host"]=cp.get('Database', 'host')
    conf["db_name"]=cp.get('Database', 'dbname')
    conf["db_user"]=cp.get('Database', 'user')
    conf["db_password"]=cp.get('Database', 'password')      
  except:
    handle_error(req,1,'Problems reading Database section of the configuration file '+configfile) 
  if not cp.has_section("View"): cp.add_section("View")   
  try:
    conf["shown_rows"]=int(cp.get('View', 'shown_rows'))
  except:
    handle_error(req,1,'Problems reading View section of the configuration file '+configfile)    
    
  if not cp.has_section("Logging"): cp.add_section("Logging")   
  try:
    conf["admlogfile"]=cp.get('Logging', 'admlogfile') 
    conf["loglevel"]=cp.get('Logging', 'loglevel')    
  except:
    handle_error(req,1,'Problems reading Logging section of the configuration file '+configfile)

  return conf
        

def set_logging(conf):
  if not conf['admlogfile'] or not conf['loglevel']:
    logger = logging.getLogger()
    logger.disabled=True
    return
  if conf['loglevel'] in ("NONE","OFF","FALSE"):
    logger = logging.getLogger()
    logger.disabled=True
    return    
  if conf['loglevel'] in ("DEBUG"): level=logging.DEBUG
  elif conf['loglevel'] in ("INFO"): level=logging.INFO
  elif conf['loglevel'] in ("WARNING"): level=logging.WARNING
  elif conf['loglevel'] in ("ERROR"): level=logging.ERROR
  elif conf['loglevel'] in ("CRITICAL"): level=logging.CRITICAL
  else: level=logging.INFO
  format='%(asctime)s # %(levelname)s # %(message)s'
  logging.basicConfig(filename=conf['admlogfile'],level=level,format=format)
  return  


