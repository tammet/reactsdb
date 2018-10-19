#!/usr/bin/python
# -*- coding: utf-8 -*-

# common global Request object, err handling and common funs of webapi

import sys,json,os,logging, random, string
from configparser import SafeConfigParser
from flask import send_file


class Request:

  # -- configuration --

  flask=True
  debug=False # True: cgitb, less early catching, sparse json formatting
  authentication=True # False only for debugging: will not require auth token
  test_auth=True # MUST set to False for production: True means session-id "test" is always superuser
  timeoutsecs=10 # seconds until timeout, not used for flask
  #mime='Content-Type: text/plain' # all outputs are json with this content-type
  mime='Content-Type: application/json'
  #datetime_out_format='YYYY-MM-DD HH24:MI:SS'
  status_code=200 # default ok, changed if error or special cases
  estimate_count_tables=["reports","events"] # only estimate the count from these tables
  max_rows=100 # do not return more rows from select
  session_minutes=60 # newly created session length
  users_table="users"
  restricted_fields={"users":["password","salt"]}
  user_changable_fields=["id","password","new_password",
                         "first_name","last_name","phone","email","address","lang","uistyle"]
  group_field="network_id"

  # --- globals changed during operation ---

  inmethod=None # GET,PUT,POST
  clientip=None
  inparams=None # result of cgi.FieldStorage()
  dtables={} # taken from api_ddef  
  stdparams={} # dict of all standard params op, table, ..., token
  sid=None # session id as passed
  callback=None  
  op='countedlist' # op, table, ... , token are given as class vars as well
  op_modifier=None # possible value "image"
  table='conf' # ..
  con=None # postgres connection
  outstr=None # successful data / result string to be returned by api

  # - user info from authentication -

  username=None # as found from session
  userid=None  # as found from session
  userfullname=None  # as found from session
  useremail=None  # as found from session
  userlevel=0  # as found from session: 1 super, 0 ordinary
  usergroups=None # optionally set to access data structure, like {"3":1."2":0}
  usertopgroup=None # optionally set to main group of the user
  user_read_groups=None # optionally set to a list of gropus with read access like [1,2,5]
  user_write_groups=None # optionally set to a list of groups with write access like [2,5]
  
  # - id keys, pagination, filtering, sorting, limits -

  key='id'
  keyval=None
  start=0
  count=None # is initialised to max_rows above
  rowstart=0 # ...
  rowend=0 # ...
  sort_field='id' # ...
  sort_dir='desc' # ...
  filters={} # ...

  

# ---------------- output formatting and error handling -------------

def out_format_list(req,data):
  if not req: req=Request()
  nd=data
  if data and "error" in data:
    nd=data
  elif req.op=="countedlist":
    rc={"@limit":req.count, "@start":req.start, "resource":data["list"]}        
    if "count" in data: rc["@total"]=data["count"]
    else: rc["@estimated"]=data["estimated"]    
    nd={"resourceCollection": rc}
  elif req.op=="list":
    if data:
      nd={"resource":data[0]}     
    else:
      nd={"resource":None}  
  tmp=json.dumps(nd,indent=req.debug)
  if req.callback:
    tmp=req.callback+"("+tmp+");"
  req.outstr=tmp
  return tmp

def out_format_empty(req):
  if not req: req=Request() 
  req.outstr=""
  return ""

# ----- random strings -----

def safe_random_string(l):
  s=''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(l))
  """
  charset="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  random_bytes = os.urandom(l)
  len_charset = len(charset)
  indices = [int(len_charset * (ord(byte) / 256.0)) for byte in random_bytes]
  s="".join([charset[index] for index in indices])
  """
  return s

# ---- error handling -------


def handle_error(req,code,msg,reason=None,trace=None):
  """ 
  input code to be translated to official http 4xx and 5xx codes:
    1: conf or database connection error
    2: authentication failure
    3: missing api parameters
    4: unknown or wrong api parameter values
    5: insufficient rights
    6: database operation error
    7: timeout
    8: unexpected error
    9: database query format error
    10: database input type error
  """  
  if not req: req=Request()  
  errcode=errcode_trans(code)
  errdict={
    "status": errcode,
    "description": msg,
    "internalDescription": code,
    #"reason": reason,    
    #"trace": trace
  }
  if trace: errdict["trace"]=trace
  if reason: errdict["reason"]=reason
  tmp=out_format_list(req,{"error": errdict})
  if req.con and not req.con.closed:
    req.con.cancel()
    req.con.close()
  req.status_code=errcode  
  if req.flask:     
    raise Error(errdict, errcode)
  else:  
    print('Content-Length: '+str(len(tmp)))  
    print(req.mime+'\r\n')
    print(tmp)
    sys.exit()


def handle_unchanged_error(req,code,msg,reason=None,trace=None):
  if not req: req=Request()  
  errcode=204
  errdict={
    "status": errcode,
    "description": msg,
    "internalDescription": code,
    #"reason": reason,    
    #"trace": trace
  }
  if trace: errdict["trace"]=trace
  if reason: errdict["reason"]=reason
  tmp=out_format_list(req,{"error": errdict})
  if req.con and not req.con.closed:
    req.con.cancel()
    req.con.close()
  req.status_code=errcode  
  if req.flask:     
    raise Error({}, errcode)
  else:  
    print('Content-Length: '+str(len(tmp)))  
    print(req.mime+'\r\n')
    print(tmp)    
    sys.exit()


def handle_output_file(req,filename,mime):
  if req.con and not req.con.closed:
    req.con.cancel()
    req.con.close()
  if req.flask:     
    res=send_file(filename_or_fp=filename,
                  mimetype=mime,
                  as_attachment=False)
                  # attachment_filename=filename)
    req.status_code=0 # this indicates that we have an image output
    req.outstr=res    # this will be returned by flask app
    return res # returned value unimportant              
  else:  
    contents=filename # dummy!!!!!
    print('Content-Length: '+str(len(contents)))  
    print(mime+'\r\n')
    print(contents) 
    sys.exit()


def errcode_trans(incode):
  tbl={
    1: 503, # conf or database connection error
    2: 401, # authentication failure
    3: 400, # missing api parameters
    4: 400, # unknown or wrong api parameter values
    5: 403, # insufficient rights
    6: 500, # database operation error
    7: 408, # timeout
    8: 500, # unexpected error
    9: 400, # database query format error
   10: 400  # database input type error
  }   
  if incode in tbl:
    return tbl[incode]
  else:
    return 500  


class Error(Exception):
  status_code = 400
  errdict={}

  def __init__(self, errdict, status_code=None):
    Exception.__init__(self)   
    self.errdict = errdict
    if status_code is not None:       
        self.status_code = status_code          

  def to_dict(self):
    rv = self.errdict
    return {"error":rv}


class TimeoutExc(Exception):
    """this exception is raised when there's a timeout"""
    def __init__(self): Exception.__init__(self)

def alarmhandler(signame,frame):
    "sigalarm handler.  raises a Timeout exception"""
    raise TimeoutExc()


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

  if not cp.has_section("Images"): cp.add_section("Images")   
  try:
    conf["imagepath"]=cp.get('Images', 'imagepath')    
  except:
    handle_error(req,1,'Problems reading Images section of the configuration file '+configfile) 

  if not cp.has_section("Email"): cp.add_section("Email")   
  try:
    conf["smtpserver"]=cp.get('Email', 'smtpserver')    
    conf["smtpport"]=cp.get('Email', 'smtpport')
    conf["email"]=cp.get('Email', 'email')
  except:
    handle_error(req,1,'Problems reading Email section of the configuration file '+configfile)
       
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
