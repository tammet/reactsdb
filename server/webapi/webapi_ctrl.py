#!/usr/bin/python
# -*- coding: utf-8 -*-

# top level of webapi: 
# main function ctrl_main, dispatch, standard ops handling

import sys,psycopg2,string,time,os,base64
import types,random,signal,datetime,hashlib,subprocess

from .webapi_auth import *
from .webapi_special import *
from .webapi_model import *
from .webapi_common import *
from .webapi_viewdefs import *

#import cgi, cgitb
#cgitb.enable(format='text')

# ----------- top level functions, login, authent, read indata -------------


def ctrl_main(configfile,inmethod=None,inparams=None,subpath=None,headers=None,clientip=None):
  req=Request() 

  conf=get_conf(req,configfile)
  print("viewdefs",viewdefs)
  req.clientip=clientip
  req.dtables=viewdefs # from viewdefs.py
  req.count=req.max_rows # set default
  if type(inparams)== dict and "op" in inparams and inparams["op"]=="gwreport":
    # handle raw posted report
    res=handle_raw_posted_report(req,configfile,subpath,inparams["data"],headers)
    return res 
  if req.flask:
    inparams=flask_parse_std_parameters(req,inmethod,inparams)
    req.inparams=make_restful_inparams(req,inmethod,inparams,subpath,headers)
    print(("req.inparams:",str(req.inparams)))
    #print("req.start",req.start)
    #print("req.count",req.count)
    #print("req.filters",req.filters)
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
    handle_error(req,1,'cannot connect to database, exiting',str(e.pgerror))   
  if not req.op:
    handle_error(req,3,'op parameter missing')  
  #print("req.op:",req.op)  
  #if req.op=='check_token':
  #  handle_check_token(req)   
  if req.op=='auth':
    # print("req.stdparams:",req.stdparams)
    handle_password_login(req)    
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
        handle_error(req,8,'unexpected error','unknown',traceback.format_exc()) # full traceback
        #handle_error(req,8,'unexpected error: '+str(e)) # short version
  else:    
    handle_error(req,2,'authentication failure')    
    #parse_std_parameters(req)
    #if req.stdparams["op"]=='password_login': handle_password_login(req)
    #else:
    #  handle_error(req,2,'authentication failure')    
  try:
    req.con.close()
  except:
    handle_error(req,1,'cannot close db connection')     
  #print(req.mime+'\r\n')   
  #print(req.outstr)
  if not req.flask:
    signal.alarm(0) 
  if req.flask:    
    return [req.status_code,req.outstr]
  else:
    return req.outstr  


def flask_parse_std_parameters(req,inmethod,inparams):  
  invalues={"op":"list","table":None,"view":None,"fields":None,"filter":None,"sort":None,
            "id":None,"start":0,"count":req.max_rows,"data":None,"key":"id","token":None,"callback": None,
            "name":None,"tags":None,"description":None,"username":None,"password":None,
            "user_id":None,"userid":None, "country": None, "city": None,
            "lat0":None,"lat1":None,"lng0":None,"lng1":None,"sortkey":None,"join":None,
            "to":None,"password":None,"resource":None,"start":0,"limit":req.max_rows}
  res={}  
  req.inmethod=inmethod
  #print("inparams:",inparams)
  #print("invalues:",invalues)
  # check if we recognize all params passed in request
  if inparams:   
    for key in list(inparams.keys()):
      if key not in invalues:
        handle_error(req,4,"unknown parameter name: "+str(key))
  #print("cp2") 
  # loop over all recognizable invalues given above in the function   
  for param in list(invalues.keys()):
    #print("param:",param)
    if param in inparams and inparams[param]:
      #print("invalues[param]:",invalues[param])
      # real value from request: maybe have to convert to int
      if type(invalues[param])==type(2): # integer, must convert
        try:
          res[param]=int(inparams[param])
        except:
          handle_error(req,4,"non-integer value given to parameter "+param)
      else:  
        res[param]=inparams[param]
    else:
      # default from invalues above
      res[param]=invalues[param] 
    setattr(req,param,res[param])
  #print("res:",res)
  req.stdparams=res
  return inparams


def make_restful_inparams(req,inmethod,inparams,subpath,headers):
  #print("inmethod,inparams,subpath:",inmethod,inparams,subpath)
  if not subpath:
    return inparams
  override={} 
  token=None 
  if headers:
    if "Authorization" in headers:
      token=headers["Authorization"]
    elif "X-Authorization" in headers:
      token=headers["X-Authorization"]  
  if token: override["token"]=token
  s=subpath.split("/")
  if len(s)<2:
    override["table"]=s[0]
    if inmethod=="GET":
      override["op"]="countedlist"
      if "limit" in inparams:      
        override["count"]=int(inparams["limit"])
    elif inmethod in ["POST"]:
      if not "resource" in inparams:
        handle_error(req,3,'wrong input format','do post resource as {"resource":{...}}"')
      if s[0]=="auth":
        data=inparams["resource"]
        if not "username" in data or not "password" in data:
          handle_error(req,3,'wrong input format','resource must contain username and password')
        override["op"]="auth"
        override["username"]=data["username"]
        override["password"]=data["password"]
        #override["data"]=[inparams["resource"]]
      else:  
        override["op"]="add"
        override["data"]=[inparams["resource"]]
        #del inparams["data"]
    else:
      handle_error(req,4,'wrong input method','only GET and POST allowed for a collection')  
  elif len(s)==2:
    if s[1]=="":
      handle_error(req,3,'wrong input format','use /api/resource?params not /api/resource/?params')
    override["table"]=s[0]
    req.keyval=s[1]
    if inmethod=="GET":        
      override["op"]="list"
      filter="id,=,"+str(s[1])
      override["filter"]=filter        
    elif inmethod=="PUT":  
      if not "resource" in inparams:
          handle_error(req,3,'wrong input format','do put resource as {"resource":{...}}"')    
      override["op"]="update"
      res=inparams["resource"]
      if type(res)!=type({"a":1}):
        handle_error(req,3,'wrong input format','resource must be an object {...}')
      key="id"     
      res[key]=s[1]
      override["data"]=[res]   
      del inparams["resource"]
    elif inmethod=="DELETE":     
      override["op"]="delete"
      override["data"]=[s[1]]
      #req.key="id"
    else:
      handle_error(req,4,'wrong input method','only GET, PUT and DELETE allowed for a single resource')  
  elif len(s)==3 and s[0]=="networks" and s[2]=="image":  
    override["table"]="networks"
    override["op_modifier"]="image"
    try:
      id=int(s[1])
    except:
      handle_error(req,3,'wrong input format','noninteger id')  
    #req.key="id"
    if inmethod=="GET":
      override["op"]="list"
      override["data"]=[id]        
    elif inmethod=="POST":
      if not "resource" in inparams or not type(inparams["resource"])==dict:
        handle_error(req,3,'wrong input format','do post resource as {"resource":{...}}"')      
      override["op"]="add"
      res=inparams["resource"]            
      res["id"]=id 
      override["data"]=[res]
    elif inmethod=="DELETE":
      override["op"]="delete"         
      override["data"]=[id]
    else:
      handle_error(req,4,'wrong input method for image')
  else:
    handle_error(req,4,'too many items on the url path')  
  for key in override:
    inparams[key]=override[key]
    setattr(req,key,override[key])     
  #print("cp2 inparams updated to:",inparams)
  #print("cp3 req.count",req.count)
  req.stdparams=inparams  
  return inparams


def cgi_parse_std_parameters(req):  
  inparams=None #cgi.FieldStorage()
  invalues={"op":"list","table":None,"view":None,"fields":None,"filter":None,"sort":None,
            "id":None,"start":0,"count":req.max_rows,"data":None,"key":"id","token":None,"callback": None,
            "name":None,"tags":None,"description":None,"username":None,"password":None,
            "user_id":None,"userid":None, "country": None, "city": None,
            "lat0":None,"lat1":None,"lng0":None,"lng1":None,"sortkey":None,"join":None,
            "to":None,"password":None,"resource":None,"start":0,"limit":req.max_rows,
            "mime":None,"base64":None,"op_modifier":None}
  res={}  
  req.inmethod=os.environ['REQUEST_METHOD']
  if req.inmethod in ['POST','PUT'] :
    # post case      
    indata=sys.stdin.read()
    try:
      data=json.loads(indata)
    except:
      handle_error(req,3,"received data is not correct json")  
    if not data or (type(data)!=type({"a":1})):
      handle_error(req,3,"received data is not a json object {...}")
    for key in list(data.keys()):
      if key not in invalues:
        handle_error(req,4,"unknown parameter name: "+str(key))
    for param in list(invalues.keys()):
      if param in data and data[param]:
        res[param]=data[param]
      else:
        res[param]=invalues[param]
      setattr(req,param,res[param])
  else:  
    # get case
    inparams=cgi.FieldStorage()   
    for key in list(inparams.keys()):
      if key not in invalues:
        handle_error(req,4,"unknown parameter name: "+str(key))  
    for param in list(invalues.keys()):
      if param in inparams and inparams[param].value:
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


def dispatch(req):  
  if req.op=='count':                  
    if req.table in req.dtables:
      handle_count(req,req.table)       
    else:
      handle_error(req,4,"unknown table parameter")    
  elif req.op=='list':                
    if req.op_modifier=="image":
      handle_show_image(req,req.inparams["data"][0])
    elif req.table in req.dtables:
      handle_list(req,req.table)       
    else:
      handle_error(req,4,"unknown table parameter")   
  elif req.op=='countedlist':        
    if req.table in req.dtables:
      handle_counted_list(req,req.table)       
    else:
      handle_error(req,4,"unknown table parameter")      
  elif req.op=='update':
    if req.table in req.dtables:
      handle_update(req,req.table)  
    else:
      handle_error(req,4,"unknown table parameter")         
  elif req.op=='add': 
    if req.op_modifier=="image" and req.inparams["data"][0]:
      handle_add_image(req, req.inparams["data"][0]) 
    elif req.table in req.dtables:
      handle_add(req,req.table)     
    else:
      handle_error(req,4,"unknown table parameter") 
  elif req.op=='delete':
    if req.op_modifier=="image":
      handle_delete_image(req, req.inparams["data"][0])
    elif req.table in req.dtables:
      handle_delete(req,req.table)  
    else:
      handle_error(req,4,"unknown table parameter")       
  else:
    handle_error(req,4,"unknown op parameter value")


# ----------- generic table functions -------------


def handle_list(req,table,groupcheck=True):
  """
  """          
  if not authorize_show(req,table,'list'): return  
  rawdata=get_list_data(req,table,groupcheck)
  if rawdata and table in req.restricted_fields:
    data=[]
    for el in rawdata:
      row={}
      for key in el:
        if not key in req.restricted_fields[table]: 
          row[key]=el[key]
      data.append(row)    
  else:
    data=rawdata
  out_format_list(req,data)
  return


def handle_count(req,table,extraflds=None):
  """
  """          
  if not authorize_show(req,table,'list'): return  
  data=get_count_data(req,table,True,extraflds)
  out_format_list(req,data)
  return  

def handle_counted_list(req,table,extraflds=None):
  """
  """          
  if not authorize_show(req,table,'list'): return
  # first get data, then count later only if needed 
  rawdata=get_list_data(req,table)
  if rawdata and table in req.restricted_fields:
    data=[]
    for el in rawdata:
      row={}
      for key in el:
        if not key in req.restricted_fields[table]: 
          row[key]=el[key]
      data.append(row)    
  else:
    data=rawdata
  if len(data)+req.start<req.count:
    # actual result smaller than limit: use len as exact count
    out_format_list(req,{"count": len(data),"list":data})
    return
  # from here on actual result exactly at limit, ie cutoff:
  # need to separately count          
  if table in req.estimate_count_tables:
    # only estimate count
    estimate=get_estimated_count_data(req,table,extraflds) 
    # estimate contains either "estimate":N or "count":N 
    if "count" in estimate:
      out_format_list(req,{"count": estimate["count"],"list":data})
    else:
      out_format_list(req,{"estimated": estimate["estimated"],"list":data})
  else:   
    # get the real count
    countdata=get_count_data(req,table,True,extraflds) 
    if not countdata or ("count" not in countdata) or countdata["count"]<1:
      out_format_list(req,{"count":0,"list":[]})
      return
    out_format_list(req,{"count": countdata["count"],"list":data})
  return

def handle_add(req,table):
  """
  """ 
  if not authorize_show(req,table,'add'): return
  res=add_data(req,table,req.data)
  if res:
    # get a modified record
    """
    req.op="list"
    req.keyval=res[0]
    req.filter="id,=,"+str(req.keyval)
    res2=get_list_data(req,table)
    req.status_code=201
    out_format_list(req,res2)
    """
    req.op="list"
    req.keyval=res[0]
    req.filter="id,=,"+str(req.keyval)
    req.status_code=201
    handle_list(req,table)
  else:
    handle_unchanged_error(req,9,'could not add the resource')
  return   

def handle_update(req,table):
  """
  """         
  if not authorize_show(req,table,'update'): return
  # print("cp0 update")  
  #print("cpx req.inparams",str(req.inparams))
  # special new_password case: to change own, present both password and new_password
  groupcheck=True
  if req.table in ["users"] and req.op in ["update"] and \
     "data" in req.inparams and req.inparams["data"]: 
    if req.keyval==str(req.userid): # user updating own data   
      groupcheck=False
      if len(req.inparams["data"])>1:
        handle_error(req,5,"Not enough rights to change these fields","only one record allowed for changing")
      data=req.inparams["data"][0]
      if "password" in data or "new_password" in data:
        # about to change password
        if not ("password" in data and "new_password" in data):          
          handle_error(req,5,"Not enough rights to change these fields","include password and new_password") 
        if check_password(req,req.username,data["password"]):
          data["password"]=data["new_password"]
          del data["new_password"]    
          req.data=[data]
          req.inparams["data"]=req.data
        else:
          handle_error(req,5,"Not enough rights to change these fields","password mismatch")       
  # normal operation continues
  res=update_data(req,table,req.key,req.data,groupcheck)
  #print("cp0 update res:",str(res))
  if res and res[0]:
    # get a modified record
    req.op="list"
    req.filter="id,=,"+str(req.keyval)
    handle_list(req,table,groupcheck)
    #out_format_list(req,res2)
  else:
    handle_unchanged_error(req,9,'could not update the resource')
    #handle_error(req,9,'could not update the resource')    
  return 
  
def handle_delete(req,table):
  """
  """          
  if not authorize_show(req,table,'delete'): return
  res=delete_data(req,table,req.key,req.data)
  out_format_empty(req)
  return 


# ==== restful examples =========

# %25 is urlencoded %, %2c is urlencoded, %65 is e encoded

# curl 'http://127.0.0.1:5000/api/nodes?filter=notes,ilike,%25desc%25'  # filter value %desc% urlencoded
# curl 'http://127.0.0.1:5000/api/nodes?filter=notes,ilike,%25%2c%25'
# curl 'http://127.0.0.1:5000/api/nodes?filter=notes,ilike,%25a%25'  # filter value %a% urlencoded
# curl 'http://127.0.0.1:5000/api/nodes?filter=not%65s,ilike,%25a%25'  # e urlencoded in fieldname notes
# curl 'http://127.0.0.1:5000/api/nodes?filter=notes%2Cilike,'%25desc%25'' # , is urlencoded

# ========= old-style examples ===========

# get listing:
# http://127.0.0.1:5000/api?token=test&table=nodes&start=1&count=2&sort=-id

# post for listing:
# {"op":"list","table":"nodes","token":"test"}
# {"op":"list","table":"nodes","token":"test", "start":2, "count":2, "sort":"-id"}
# {"op":"countedlist","table":"nodes","token":"test", "start":2, "count":2, "sort":"-id"}

# get record:
# http://127.0.0.1:5000/api?token=test&table=nodes&filter=id,=,1006

# post for record:
# {"op":"list","table":"nodes","filter":"id,=,1006",token":"test"}

# post for add, update, delete:
# {"op":"add","table":"nodes", "data":[{"network_id":1,"nr":1112,"last_state_at":"2020-10-12T14:50:20"}],"token":"test"}
# {"op":"update","table":"nodes", "key":"id", "data":[{"id":1010,"network_id":1,"nr":2222,"last_state_at":"2021-10-12T14:50:20"}],"token":"test"}
# {"op":"delete","table":"nodes", "key":"id", "data":[1008,1009],"token":"test"}

# join proto
# {"op":"countedlist","table":"users","token":"test",
# "fields":"id,username,service,service_uid,password,fullname,phone,email,address,
# locationid,country,lang,remarks,level,status,scores,instid,activity_at,created_at,updated_at,updated_by,id",
#  "join":"locationid,locations.id,locations.name","start":0,"count":20,"sort":"-id"}