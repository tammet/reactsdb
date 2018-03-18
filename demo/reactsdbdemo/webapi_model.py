#!/usr/bin/python
# -*- coding: utf-8 -*-

import sys, json, psycopg2, re, string
from webapi_common import *

# ----------- universal database functions -------------

def db_get_row(req,query,args):
  try:
    cur=req.con.cursor()  
    cur.execute(query,args) 
    data=cur.fetchone()
    cur.close()     
    return data
  except Exception as e:
    handle_error(req,6,'db_get_row query error: '+str(e.pgerror))
    
def db_get_row_with_colnames(req,query,args):
  try:
    cur=req.con.cursor()  
    cur.execute(query,args) 
    data=cur.fetchone()
    desc=cur.description
    cur.close()
    res={}
    i=0
    if not desc or not data:
      return {}
    descl=len(desc)
    datal=len(data)   
    while i<descl:     
      if i<datal:
        res[str(desc[i][0])]=data[i]
      i+=1     
    return res
  except Exception as e:
    if not cur.closed: cur.close()
    req.con.rollback()
    handle_error(req,6,'db_get_row_with_colnames query error: '+str(e)+" query: "+str(query)+" args: "+str(args))   

def db_get_rows_with_colnames(req,query,args,start,count,changereq=True):
  try:
    data=[]
    cur=req.con.cursor()  
    cur.execute(query,args) 
    desc=cur.description
    descl=len(desc)
    read=0
    stored=0
    for row in cur:
      if read>=start:        
        res={}
        i=0
        rowl=len(row)   
        while i<descl:     
          if i<rowl:
            res[str(desc[i][0])]=row[i]
          i+=1             
        data.append(res)
        stored+=1
      read+=1
      if stored>=count:
        break
    cur.close()
    if changereq:
      req.rowstart=start
      req.rowend=read
    return data
  except psycopg2.Error as e:
    if not cur.closed: cur.close()
    req.con.rollback()
    handle_error(req,6,'db_get_rows_with_colnames query error: '+str(e)+" query: "+str(query)+" args: "+str(args))
    

def db_delete_rows(req,query,keys,replacearg=None):
  ptempl="("
  cnt=0
  if not keys:
    #handle_error(req,6,'no keys given for deletion '+str(e.pgerror))
    return 0
  for el in keys:
    if cnt>0: ptempl+=","
    ptempl+="%s"  
    cnt+=1
  ptempl+=")"
  if replacearg:      
    query=query.replace(replacearg,ptempl) 
  else:
    query=query+ptempl   
  try:
    cur=req.con.cursor()  
    cur.execute(query,tuple(keys)) 
    rowcount = cur.rowcount
    req.con.commit()    
    cur.close()
    return rowcount
  except Exception as e:
    if not cur.closed: cur.close()
    req.con.rollback()
    handle_error(req,6,'db_delete_rows query error: '+str(e.pgerror))
    
    
def db_update(req,query,args):
  """
  print "content-type: text/plain\n\n"
  print query
  print args
  sys.exit(0)
  """
  try:
    cur=req.con.cursor()
    cur.execute(query,args)
    rowcount = cur.rowcount
    req.con.commit()    
    cur.close()
    return rowcount
  except Exception as e:
    if not cur.closed: cur.close()
    req.con.rollback()
    """
    print "content-type: text/plain\n\n"
    print query
    print args
    print e
    sys.exit(0)
    """
    handle_error(req,6,'db_update query error: '+str(e))


def db_add(req,query,args):
  try:
    cur=req.con.cursor()
    cur.execute(query,args)
    res=cur.fetchone()    
    req.con.commit()    
    cur.close()
    return res
  except Exception as e:
    if not cur.closed: cur.close()
    req.con.rollback()
    handle_error(req,6,'db_add query error: '+str(e))
    return str(e)


def db_add_list(req,query,arglist):
  reslst=[]
  try:
    cur=req.con.cursor()
  except Exception as e:
    cur.close()
    req.con.rollback()  
    handle_error(req,6,'db_add_list cursor error: '+str(e))
  for args in arglist:
    try: 
      cur.execute(query,args)
      res=cur.fetchone()    
      reslst.append(res)     
    except Exception as e:
      if not cur.closed: cur.close()
      req.con.rollback()
      handle_error(req,6,'db_add_list query error: '+str(e))
  req.con.commit()    
  if not cur.closed: cur.close()  
  return None    


def db_execute(req,query,args):
  try:
    cur=req.con.cursor()
    cur.execute(query,args)
    req.con.commit()    
    cur.close()
  except Exception as e:
    if not cur.closed: cur.close() 
    req.con.rollback()
    handle_error(req,6,'db_execute error: '+str(e))


    

# ------------- generic table functions --------------------


def get_count_data(req,table):
  start=req.start
  count=req.count
  rfields=req.fields
  if rfields: 
    rfields=rfields.strip()
    if rfields:
      rfields=rfields.split(",")
      rfields=[x.strip() for x in rfields] 
  flds=req.dtables[table]['fields']
  if req.dtables[table].has_key('tablename'):
    table=req.dtables[table]['tablename']
  fldset="" 
  qs="select count(*) "
  qs+=" from "+table  
  flt=parse_filter(req,req.filter,table)
  params=None
  if flt: qs+=" where "+str(flt)    
  #print "content-type: text\n\n"
  #print qs
  #sys.exit(0)  
  data=db_get_rows_with_colnames(req,qs,params,0,1)
  if data and len(data)>0: return data[0]
  else: return {}

def get_list_data(req,table):
  start=req.start
  count=req.count
  rfields=req.fields
  if rfields: 
    rfields=rfields.strip()
    if rfields:
      rfields=rfields.split(",")
      rfields=[x.strip() for x in rfields] 
  flds=req.dtables[table]['fields']
  if req.dtables[table].has_key('tablename'):
    table=req.dtables[table]['tablename']
  fldset=""
  for el in flds:    
    if el.has_key('name'): 
      name=el['name']      
      if rfields:
        if not(name in rfields): continue
      if fldset!="": fldset+=", "
      if el.has_key('type'):
        if el['type']=='timestamp' or el['type']=='datetime': 
          fldset+="to_char("+table+"."+name+",'YYYY-MM-DD HH24:MI:SS') as "
          fldset+=name
        elif el['type']=='date': 
          fldset+="to_char("+table+"."+name+",'YYYY-MM-DD') as "
          fldset+=name
        elif el['type']=='hourminute': 
          fldset+="to_char("+table+"."+name+",'HH24:MI') as "
          fldset+=name  
        else: 
          fldset+=table+"."+name
      else:
        fldset+=table+"."+name
  qs="select "+fldset
  qs+=" from "+table  
  flt=parse_filter(req,req.filter,table)
  params=None
  if flt: qs+=" where "+str(flt)
  if req.sort:
    tmp=req.sort.strip()
    if tmp[0]=="-": 
      order="desc"
      tmp=tmp[1:]
    else:
      order="asc"      
    if not is_known_field(req,tmp):
      handle_error(req,9,'unknown field in sort, check ddef')       
  if req.sort:
    qs+=" order by "+dbs(tmp)+" "+order
  qs+=" limit "+dbs(str(start+count))
  data=db_get_rows_with_colnames(req,qs,params,start,count)
  return data

def update_data(req,table,keyfield,datalist):
  if not is_known_field(req,keyfield):
    handle_error(req,11,'unknown key field given: '+str(keyfield)) 
  if not datalist or type(datalist)!=type([1]) or len(datalist)<1: 
    handle_error(req,4,'no data given for updating')    
  flds=req.dtables[table]['fields']
  if req.dtables[table].has_key('tablename'):
    table=req.dtables[table]['tablename']
  check=[]
  for el in flds:
    if el.has_key('name'): check.append(el['name'])   
  reslst=[]  
  for data in datalist:   
    tmp=data_contains_unknown_fields(req,data,check)
    if tmp:
      handle_error(req,11,'unknown fields in data: '+str(tmp))                         
    for x in flds:
      if x.has_key('name'): name=x['name']
      else: continue   
      if data.has_key(name) and data[name] and x.has_key('type'):
        try:
          if x['type']=='integer': data[name]=int(data[name])          
          if x['type']=='float': data[name]=float(data[name])
        except:
          handle_error(req,10,str(x)+" "+str(data)) 
          errstr='data with wrong type given for field '+str(name)
          errstr+=' of type '+x['type']+': '+str(data[name])
          handle_error(req,10,errstr)
      else: continue    
    fldnames=""
    fldsets=""
    for x in flds:
      name=None
      if x.has_key('name'): name=x['name']
      else: continue
      if name==keyfield: continue
      if not data.has_key(name): continue
      if x.has_key('auto') and x['auto']==1: continue
      if fldsets!="": fldsets+=", "    
      if  x.has_key('auto') and x['auto']=='now()':
        fldsets+=name+"="+"now()" 
        if data.has_key(name): del data[name] 
      elif  x.has_key('auto') and x['auto']=='req.username':
        fldsets+=name+"=%("+name+")s"
        data[name]=req.username        
      elif x.has_key('default') and not data[name]:
        if x['default']=='now()': fldsets+=name+"=now()"
        else: fldsets+=name+"='"+str(x['default'])+"'"     
        if data.has_key(name): del data[name] 
      else:
        if x.has_key('type'):
          if x['type']=='timestamp' or x['type']=='datetime': 
            fldsets+=name+"=date_trunc('seconds',to_timestamp(%("+name
            fldsets+=")s, 'YYYY-MM-DD HH24:MI:SS'))"
          elif x['type']=='date': 
            fldsets+=name+"=date_trunc('seconds',to_date(%("+name
            fldsets+=")s, 'YYYY-MM-DD'))"
          elif x['type']=='hourminute': 
            fldsets+=name+"=date_trunc('seconds',to_timestamp(%("+name
            fldsets+=")s, 'HH24:MI'))"  
          else: fldsets+=name+"=%("+name+")s"
        else:
          fldsets+=name+"=%("+name+")s"
    
    
    qs="update "+table+" set "+fldsets
    qs+=" where "+keyfield+"=%("+keyfield+")s"
    #print('Content-type: text/html\n\n')
    #print(qs+"<p>"+str(data))
    res=db_update(req,qs,data)
    reslst.append(res)
  return reslst


def add_data(req,table,datalist):
  if not datalist: 
    handle_error(req,4,'no data given for adding')
  flds=req.dtables[table]['fields']
  if req.dtables[table].has_key('tablename'):
    table=req.dtables[table]['tablename']
  check=[]
  for el in flds:
    if el.has_key('name'): check.append(el['name'])
  reslst=[]  
  for data in datalist:   
    tmp=data_contains_unknown_fields(req,data,check)
    if tmp:
      handle_error(req,11,'unknown fields in data: '+str(tmp))
    data=set_missing_input_data_nullvalues(req,data,check)
    for x in flds:
      if x.has_key('name'): name=el['name']
      else: continue   
      if data[name] and x.has_key('type'):
        try:
          if x['type']=='integer': data[name]=int(data[name])          
          if x['type']=='float': data[name]=float(data[name])
        except:
          handle_error(req,10,'data with wrong type given for field '+str(name))
    fldnames=""
    fldsets=""
    for x in flds:
      name=None
      if x.has_key('name'): name=x['name']
      else: continue  
      if x.has_key('auto') and x['auto']==1: continue
      if fldnames!="": fldnames+=", "
      if fldsets!="": fldsets+=", "
      fldnames+=name          
      if  x.has_key('auto') and x['auto']=='now()':
        fldsets+="now()" 
        del data[name]
      elif  x.has_key('auto') and x['auto']=='req.username':
        fldsets+="%("+name+")s"
        data[name]=req.username
      elif x.has_key('default') and not data[name]:
        if x['default']=='now()': fldsets+="now()"
        elif x['default']=='DEFAULT': fldsets+="DEFAULT"
        else: fldsets+="'"+str(x['default'])+"'" 
        del data[name]  
      else:
        if x.has_key('type'):
          if x['type']=='timestamp' or x['type']=='datetime': fldsets+='to_timestamp(%('+name+")s, 'YYYY-MM-DD HH24:MI:SS')"
          elif x['type']=='date': fldsets+='to_date(%('+name+")s, 'YYYY-MM-DD')"
          elif x['type']=='hourminute': fldsets+='to_timestamp(%('+name+")s, 'HH24:MI')"
          #elif x['type']=='date': data[name]=float(data[name])
          elif x['type']=='time': data[name]=float(data[name])
          else: fldsets+="%("+name+")s"
        else:
          fldsets+="%("+name+")s"
    qs="insert into "+table+" ("+fldnames+") values ("+fldsets+")"
    qs+=" returning id"  
    res=db_add(req,qs,data)
    if res and len(res)>0:
      res=res[0]
    reslst.append(res)
  return reslst


def delete_data(req,table,keyfield,keys):
  if not is_known_field(req,keyfield):
    handle_error(req,11,'unknown key field given: '+str(keyfield)) 
  if not keys or type(keys)!=type([1]) or len(keys)<1: 
    handle_error(req,4,'no keys given for deletion')   
  qs="delete from "+table+" where "+keyfield+" in "
  res=db_delete_rows(req,qs,keys)  
  return res 


# ------------- specific table functions --------------------

def db_read_settings(req):
  qs="select name,value from settings"
  data=db_get_rows_with_colnames(req,qs,None,0,10000)
  return data
  

#def db_get_userlogininfo_row(req,username,password):
#  qs="""select id,username,firstname,lastname,level,lang,uistyle,fullname,service,email 
#        from users where status='A' and username=%s and password=%s"""
#  #qs="select id,username,firstname,lastname from users where username='tanel.tammet@gmail.com' and password='abc'"
#  return db_get_row(req,qs,(username,password))

def db_get_sessioninfo_row(req,sid):
  qs="""select users.id,users.username,users.firstname,users.lastname,users.level,
        users.lang, users.uistyle, users.fullname, users.service, sessions.token
        from users,sessions where 
        users.status='A' and users.username=sessions.username and sessions.sid=%s
        and sessions.endts>=now()""" 
  return db_get_row(req,qs,(sid,))
  
def db_update_sessioninfo_end(req,sid):
  qs="update sessions set endts=now()+interval '60 minutes' where sid=%s"
  return db_execute(req,qs,(sid,))
  

# - - - - - users - - - - 


def get_list_users_data(req):
  start=req.rowstart
  count=req.conf['shown_rows']
  qs="select id,service,service_uid,username,firstname,lastname,fullname,level,status,lang,uistyle,"
  qs+=" to_char(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at, "
  qs+=" to_char(updated_at, 'YYYY-MM-DD HH24:MI:SS') as updated_at "
  qs+=" from users "  
  flt=make_sql_filter(req)
  params=None
  if flt:
    cond=flt[0]
    params=flt[1]
    qs+="where "+str(cond)
  if req.sort_field and req.sort_dir:
    qs+=" order by "+dbs(req.sort_field)+" "+dbs(req.sort_dir)
  qs+=" limit "+dbs(str(start+count))  
  data=db_get_rows_with_colnames(req,qs,params,start,count)
  return data
  
def get_viewrec_users_data(req):
  id=req.rowid
  qs="select id,service,service_uid,username,password,firstname,lastname,fullname,phone,email,address,remarks,level,status,lang,uistyle,"
  qs+=" to_char(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at, "
  qs+=" to_char(updated_at, 'YYYY-MM-DD HH24:MI:SS') as updated_at "
  qs+=" from users where id=%s"
  data=db_get_row_with_colnames(req,qs,(id,))
  data['password']=''
  return data 

def update_users_data(req,data):
  import hashlib
  id=req.rowid
  if req.userlevel>0:
    qslevel=""
  else:
    qslevel=" level=%(level)s, "
  check=['username','password','firstname','lastname','fullname','phone','email','address','remarks','level','status','lang','uistyle']
  data=set_missing_input_data_nullvalues(req,data,check)
  data['id']=int(id)
  if not data['password']:
    qs="update users set firstname=%(firstname)s, lastname=%(lastname)s, fullname=%(fullname)s," 
    qs+=" phone=%(phone)s, email=%(email)s, address=%(address)s, remarks=%(remarks)s,  status=%(status)s, "
    qs+=qslevel
    qs+=" lang=%(lang)s, uistyle=%(uistyle)s, "
    qs+=" updated_at=now() "
    qs+=" where id=%(id)s"
    del data['password']    
  else:
    data['password']=hashlib.sha1(str(data['password'])).hexdigest()    
    qs="update users set password=%(password)s, firstname=%(firstname)s, lastname=%(lastname)s,  fullname=%(fullname)s," 
    qs+=" phone=%(phone)s, email=%(email)s, address=%(address)s, remarks=%(remarks)s,  status=%(status)s, "
    qs+=qslevel
    qs+=" lang=%(lang)s, uistyle=%(uistyle)s, "
    qs+=" updated_at=now() "
    qs+=" where id=%(id)s"
  res=db_update(req,qs,data)
  return res
 
def update_password(req,username,password):
  qs="update users set password=%(password)s where username=%(username)s"
  data={"username": username,"password": password}
  res=db_update(req,qs,data)
  return res
  
def db_get_userlogininfo_row(req,username,password):
  qs="""select id,username,firstname,lastname,level,lang,uistyle,fullname,service,email 
        from users where status='A' and username=%s and password=%s"""
  #qs="select id,username,firstname,lastname from users where username='tanel.tammet@gmail.com' and password='abc'"
  return db_get_row(req,qs,(username,password))  
 
def add_users_data(req,data):
  import hashlib
  id=req.rowid
  check=['username','password','firstname','lastname','fullname','phone','email',
        'address','remarks','level','status','lang','uistyle'] 
  data=set_missing_input_data_nullvalues(req,data,check) 
  data['password']=hashlib.sha1(str(data['password'])).hexdigest()  
  qs="""insert into users (id,username,password,firstname,lastname,fullname,phone,
        email,address,remarks,level,status,lang,uistyle) values (DEFAULT, """
  qs+=""" %(username)s,%(password)s,%(firstname)s,%(lastname)s,%(fullname)s,%(phone)s,
          %(email)s,%(address)s,%(remarks)s,%(level)s,%(status)s,%(lang)s,%(uistyle)s """ 
  qs+=") returning id"
  res=db_add(req,qs,data)
  return res

def delete_users(req):
  keys=req.deletekeys  
  if req.rowid: keys.append(req.rowid)
  qs="delete from sessions where username in (select users.username from users where users.id in _REPLACE_)"
  res=db_delete_rows(req,qs,keys,replacearg='_REPLACE_')  
  qs="delete from users where id in "
  res=db_delete_rows(req,qs,keys)  
  return res 
  
  
# - - - - - sessions - - - - 


def get_list_sessions_data(req):
  start=req.rowstart
  count=req.conf['shown_rows']
  qs="select id,sid,username,"
  qs+=" to_char(endts, 'YYYY-MM-DD HH24:MI:SS') as endts, "
  qs+=" to_char(ts, 'YYYY-MM-DD HH24:MI:SS') as ts "
  qs+=" from sessions "
  flt=make_sql_filter(req)
  params=None
  if flt:
    cond=flt[0]
    params=flt[1]
    qs+="where "+str(cond)
  if req.sort_field and req.sort_dir:
    qs+=" order by "+dbs(req.sort_field)+" "+dbs(req.sort_dir)
  qs+=" limit "+dbs(str(start+count))  
  data=db_get_rows_with_colnames(req,qs,params,start,count)
  return data  

def get_viewrec_sessions_data(req):
  id=req.rowid
  qs="select id,sid,username,"
  qs+=" to_char(endts, 'YYYY-MM-DD HH24:MI:SS') as endts, "
  qs+=" to_char(ts, 'YYYY-MM-DD HH24:MI:SS') as ts "
  qs+=" from sessions where id=%s"
  data=db_get_row_with_colnames(req,qs,(id,))
  if req.useinputasdata:
    for el in data.keys():
      if req.inparams.has_key(el):
        data[el]=req.inparams[el].value       
  return data 
  
def update_sessions_data(req,data):
  id=req.rowid
  check=['sid','username','endts']
  data=set_missing_input_data_nullvalues(req,data,check)    
  qs="update sessions set sid=%(sid)s, username=%(username)s, " 
  qs+=" endts=to_timestamp(%(endts)s, 'YYYY-MM-DD HH24:MI:SS'), "
  qs+=" ts=now() "
  qs+=" where id=%(id)s"
  data['id']=int(id)
  res=db_update(req,qs,data)
  return res
 
def add_sessions_data(req,data):
  id=req.rowid
  check=['sid','username','endts']  
  data=set_missing_input_data_nullvalues(req,data,check)    
  qs="insert into sessions (id,sid,username,endts) values (DEFAULT, "
  qs+=" %(sid)s, %(username)s, " 
  qs+=" to_timestamp(%(endts)s, 'YYYY-MM-DD HH24:MI:SS') "
  qs+=") returning id"
  res=db_add(req,qs,data)
  return res
  
def delete_sessions(req):
  keys=req.deletekeys  
  if req.rowid: keys.append(dbs(req.rowid))
  qs="delete from sessions where id in "
  res=db_delete_rows(req,qs,keys)
  return res 



# - - - - - - login-logout specific - - - - 

def logout_sessions(req,sid,username):
  cur=req.con.cursor()
  qs="delete from sessions where sid=%s and username=%s"      
  cur.execute(qs,(sid,username))
  req.con.commit()
  cur.close()
  
def create_login_session(req,sid,username,token):
  cur=req.con.cursor()
  qs="""insert into sessions (sid,username,endts,token) values (%s,%s,now()+ interval '60 minutes',%s); 
        delete from sessions where endts<now()"""      
  #qs="insert into sessions (sid,username) values (%s,%s)" #; delete from sessions where endts<now()"  
  cur.execute(qs,(sid,username,token))
  req.con.commit()
  cur.close()       


# ----------- monitor ------------

def get_postgres_size(req):
  qs="""SELECT pg_database.datname, pg_size_pretty(pg_database_size(pg_database.datname)) AS size FROM pg_database"""
  data=db_get_rows_with_colnames(req,qs,{},0,1000)
  return data

def get_postgres_status(req):
  qs="""select * from pg_stat_all_tables order by schemaname desc,relname desc;"""
  data=db_get_rows_with_colnames(req,qs,{},0,1000)
  return data    
  

# ----------------- parsing filters -------------------

def parse_filter(req,filter,table):
  if filter:
    lst=filter.split(",")
  else:
    return None    
  """
  slst=[]
  for el in sf:    
  for   
  try:
    lst=json.loads(slst)
  except:
    handle_error(req,9,'filter not proper json')      
  if type(lst)!=type([1]):  
    handle_error(req,9,'filter not a json list')   
  """      
  if len(lst)<3:
    handle_error(req,9,'filter must contain at least 3 elements')    
  if len(lst) % 3 != 0:
    handle_error(req,9,'filter length must divide by 3')    
  res=[]
  i=0
  while i*3<len(lst):    
    if i>0: res.append(" and ")
    fld=lst[i*3].strip()
    if not is_known_field(req,fld):
      handle_error(req,9,'unknown field in filter, check ddef')     
    op=lst[i*3+1].strip()
    if not op in ["=",">","<","<=",">=","!=","like","ilike"]:
      handle_error(req,9,'unknown comparison op in filter')
    val=None    
    flds=req.dtables[table]['fields']
    for el in flds:    
      if el.has_key('name') and el["name"]==fld and el.has_key('type'):
        if el['type']=='timestamp' or el['type']=='datetime':
          val=string.replace(lst[i*3+2].strip(),'T',' ')
          val="to_timestamp('"+val+"','YYYY-MM-DD HH24:MI:SS')"
          break
        elif el['type']=='date': 
          val=string.replace(lst[i*3+2].strip(),'T',' ')
          val="to_date('"+val+"','YYYY-MM-DD')"          
          break
    if not val: 
      val=lst[i*3+2].strip()
      val=process_sql_val_str(val)          
    res+=[str(fld),str(op),str(val)]
    i+=1
  sres=" ".join(res)
  return sres
  
# ---------------- small db utilities --------------------------

def is_known_field(req,fld):
  try:
    tmp=req.dtables[req.table]["fields"]
    for el in tmp:
      if fld==el["name"]: return True
  except:
    handle_error(req,9,'table not specified enough in ddef')        
  return False

def data_contains_unknown_fields(req,data,check):
  for key in data.keys():
    if not key in check:
      return key
  return False    

def set_missing_input_data_nullvalues(req,data,check):  
  for el in check:
    if not data.has_key(el):
      data[el]=None
  return data                

def process_sql_val_str(val):    
  if not val: return "''"  
  ticked=False
  if val[0]=="'" and val[-1]=="'": 
    ticked=True
    val=val[1:-1]
  val=dbs(val)
  if ticked:
    val="'"+val+"'" 
    return val
  try:
    nf=float(val)
  except:
    nf=None
    pass
  try:
    ni=int(val)
  except:
    ni=None  
  if ni or ni==0: return ni
  if nf: return nf
  return "'"+val+"'"
  handle_error(req,9,'value in filter not understood: '+str(val))

def dbs(str):    
  """
  """
  p = re.compile(r"[\\/[,{}:;\"\'\[\]()=<>!?]")
  str = p.sub('', str)
  return str

def dbfs(str):    
  """
  """
  p = re.compile(r"[\\/[{}.\"\'\[\]()=<>!?]")
  res = p.sub('', str)
  return res

def dbfargp(n):    
  """
  """
  res="%("+dbfarg(n)+")s"
  return res

def dbfarg(n):    
  """
  """
  res="arg"+str(n)
  return res
