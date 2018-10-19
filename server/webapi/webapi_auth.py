#!/usr/bin/python
# -*- coding: utf-8 -*-

# authentication and authorization funs of webapi 
  
import sys,psycopg2,string,time,os,base64
import types,random,signal,datetime,logging,hashlib,subprocess
import smtplib # for email
from email.mime.text import MIMEText # for email
from configparser import SafeConfigParser

from .webapi_model import *
from .webapi_common import *
from .webapi_ddef import *

# ---- authentication and authorization ---- 

def authenticate(req):
  # not already authenticated  
  if 'token' in req.stdparams and req.stdparams['token']: 
    sid=req.stdparams['token']
  else: 
    sid=None    
  if not sid and req.authentication:
    return False  
  tmp=sid.split(" ")
  if len(tmp)<2: sid=tmp[0]
  else: sid=tmp[1]  
  if (req.test_auth and sid=="test") or not req.authentication:
    #return False
    req.userid=1
    req.username="testuser"  
    req.userlevel=1
    req.usergroups=None
    req.usertopgroup=None
    return True
  else:
    req.sid=sid        
    session=db_get_sessioninfo_row(req,sid)
    if not session: return False
    # if userdata not found, will return error
    print("about to call get_userdata_by_username req.table: ",req.table)
    udata=get_userdata_by_username(req,session[1])
    print("** cpu udata, req.op, req.table:",udata,req.op,req.table)
    #logging.info("UDATA: "+str(udata))
    req.userid=udata["id"]
    req.username=udata["username"]  
    req.userlevel=udata["level"]
    req.usergroups=udata["networks"]
    req.useremail=udata["email"]
    req.usertopgroup=None
    if req.usergroups:
      rd=[]
      wr=[]
      grps=req.usergroups
      for grp in grps:
        try:
          if grps[grp]==1: rd.append(int(grp)) # viewer          
          elif grps[grp]==2: wr.append(int(grp)) # admin
        except:
          handle_error(req,8,'group data wrong','noninteger group values in db')
      req.user_read_groups=rd
      req.user_write_groups=wr
      #print("groups:",req.user_read_groups,req.user_write_groups)          
    #get_set_req_groups(req)
    logging.info("AUT "+str(req.clientip)+" "+str(sid)+" as "
                "id: "+str(req.userid)+" name: "+str(req.username)+" level: "+str(req.userlevel))
    if udata["lang"]: req.userlang=udata["lang"]
    if udata["uistyle"]: req.useruistyle=udata["uistyle"]
    if udata["email"]: req.useremail=udata["email"]
    req.userfullname=''
    if udata["first_name"]: req.userfullname=udata["first_name"]+" "
    if udata["last_name"]: req.userfullname=req.userfullname+udata["last_name"]+" "
    if not req.userfullname: req.userfullname=req.username    
    #if data[8]: req.login_service=data[8]
    #if data[9]: req.token=data[9]
    #elif req.username and req.username.startswith("google:"):
    #  req.login_service="google"
    #elif req.username and req.username.startswith("facebook:"):           
    #  req.login_service="facebook"
    return True   

def get_userdata_by_username(req,username):
  #print("cp get_userdata_by_username called req.table: ",req.table)
  (tmp_table,tmp_filter,tmp_sort,tmp_start,tmp_count,tmp_fields)=(req.table,req.filter,req.sort,req.start,req.count,req.fields)
  req.table="users"
  req.filter=["username","=",username]
  req.sort=None
  req.start=0
  req.count=100
  req.rfields=None
  req.fields=None
  userdata=get_list_data(req,"users",False) # no group check   
  #print("userdata:",userdata)
  (req.table,req.filter,req.sort,req.start,req.count,req.fields)=(tmp_table,tmp_filter,tmp_sort,tmp_start,tmp_count,tmp_fields)   
  #(req.table,req.filter)=(tmp_table,tmp_filter)
  #print("cp get_userdata_by_username after reset req.table: ",req.table)   
  if not userdata:
    handle_error(req,2,'authentication failure','username not found in db')
  userdata=userdata[0]  
  return userdata


def get_set_req_groups(req):    
  groups=db_get_usergroups(req,req.userid,req.usergroup,req.usertopgroup)
  req.usernamedgroups=groups
  req.usergroups= req.usergroups=[x["id"] for x in groups]


def authorize_show(req,table,op):
  if authorize(req,table,op): 
    return True
  else:
    handle_error(req,5,"Not enough rights for this operation")
 

def authorize(req,table,op): 
  if not req.authentication:
    return True    
  if req.userlevel==1:
    # superuser
    return True
  # from here on not a superuser  
  #print("authorize(req,table,op)",table,op)
  if table in ["sessions"]: return False
  if table in ["users"] and op in ["count","list","countedlist","update"]:
    #print("req.keyval,req.userid:",req.keyval,req.userid)
    if req.keyval==str(req.userid):
      # user lists or updates own account data
      if op=="update" and "data" in req.inparams and req.inparams["data"]:
        data=req.inparams["data"][0]
        for key in data:
          if not key in req.user_changable_fields:
            handle_error(req,5,"Not enough rights to change these fields")    
      return True
    elif op in ["count","list","countedlist"]:
      # not same user, but admin may list own network users: filtered specially
      return True   
    elif op in ["update"]:
      # not same user, but admin may update own network users: filtered specially
      return True      
    else:
      return False
  if op in ["count","list","countedlist"]:
    return True
  elif op in ["update"] and table in ["nodes","networks","comments"]:
    return True  
  elif op in ["add"] and table in ["comments"]:
    return True   
  else:
    return False      

    
def handle_check_token(req):
  if req.test_auth and req.token=="test":
    odata={"ok": 1}
  else:  
    data=db_get_sessioninfo_row(req,req.token)
    if not data: odata={"ok": 0}
    else: odata={"ok": 1}
  tmp=out_format_list(req,odata)
  return tmp
    
  
def handle_password_login(req):  
  """ Assumes username, salt and password fields in db where
      password in db must be hashlib.sha512(<givenpwd>+<user salt in db>).hexdigest()
  """
  if not ("username" in req.stdparams and "password" in req.stdparams and 
           req.stdparams["username"] and req.stdparams["password"]):
    handle_error(req,3,'username and password parameters missing') 
  else:    
    username=req.stdparams["username"]
    givenpassword=req.stdparams["password"]
    # get user by given username (no pwd check yet)    
    #userdata=get_user_by_username(req,username)
    req.table="users"
    req.filter=["username","=",username]
    userdata=get_list_data(req,"users",False)    
    #print("userdata:",userdata)
    req.table=None
    req.filter=None      
    if not userdata:
      handle_error(req,2,'authentication failure','username not found in db')
    userdata=userdata[0]  
    # get salt and calculate hash as hashlib.sha512(<givenpwd>+<user salt in db>).hexdigest()
    print("userdata:",userdata)
    if not "salt" in userdata or not "password" in userdata:
      handle_error(req,2,'authentication failure','no salt or password found in db')
    salt=str(userdata["salt"])
    storedpassword=str(userdata["password"])

    #passhash=hashlib.sha512(givenpassword+salt).hexdigest()  # python2
    passhash=hashlib.sha512((givenpassword+salt).encode('utf-8')).hexdigest()   # python3
    

    #print("salt:",salt)
    #print("storedpassword:",storedpassword)  
    #print("passhash      :",passhash)
    if passhash!=storedpassword:
      handle_error(req,2,'authentication failure','incorrect password')
    del userdata["salt"]
    del userdata["password"]
    # success, create a new random session id sid
    sid=safe_random_string(32)   
    #print("sid:",sid)    
    # create a new session storing the sid
    session=create_login_session(req,sid,username,None)
    # update user last login time
    req.table="users"
    if is_known_field(req,"last_login"):
      update_user_login_time(req,username)
    req.table=None
    # return output    
    session["user"]=userdata
    tmp=out_format_list(req,{"resource":session})
    return tmp         

def check_password(req,username,givenpassword):
  """Check password match of an existing user."""
  userdata=get_userdata_by_username(req,username)
  #print("userdata:",str(userdata))
  salt="salty"
  if "salt" in userdata: salt=str(userdata["salt"])
  if not "password" in userdata:
    handle_error(req,5,'password mismatch','no password found in db')
  storedpassword=userdata["password"]   
  passhash=hashlib.sha512(givenpassword+salt).hexdigest()
  if passhash!=storedpassword: return False
  else: return True   

def handle_logout(req):  
  """  
  """
  #import urllib2
  if req.sid and req.username:
    try:
      logout_sessions(req,req.sid,req.username)  
    except:
      req.warning="problem logging out" 
      req.op="home"
      dispatch(req)  
      return      
  """    
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
  """    
  req.username=""
  req.login_service=None
  req.op="home"
  dispatch(req)  
  return

  
def handle_change_password(req):
  encpwd=hashlib.sha1(req.password).hexdigest() # encrypt pwd
  #encpwd=req.password
  res=update_password(req,req.username,encpwd)
  tmp=out_format_list(req,res)
  return tmp

