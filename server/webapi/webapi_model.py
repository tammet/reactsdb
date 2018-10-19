#!/usr/bin/python
# -*- coding: utf-8 -*-

# main database funs of webapi

import sys,json,psycopg2,re,string,hashlib

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
    handle_error(req,6,'db_get_row query error',str(e.pgerror))
    
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
    handle_error(req,6,'db_get_row_with_colnames query error',str(e)+" query: "+str(query)+" args: "+str(args))   

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
    handle_error(req,6,'db_get_rows_with_colnames query error',str(e)+" query: "+str(query)+" args: "+str(args))
    

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
    handle_error(req,6,'db_delete_rows query error',str(e.pgerror))
    
    
def db_update(req,query,args):
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
    handle_error(req,6,'db_update query error',str(e))


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
    handle_error(req,6,'db_add query error',str(e))
    return str(e)


def db_add_list(req,query,arglist):
  reslst=[]
  try:
    cur=req.con.cursor()
  except Exception as e:
    cur.close()
    req.con.rollback()  
    handle_error(req,6,'db_add_list cursor error',str(e))
  for args in arglist:
    try: 
      cur.execute(query,args)
      res=cur.fetchone()    
      reslst.append(res)     
    except Exception as e:
      if not cur.closed: cur.close()
      req.con.rollback()
      handle_error(req,6,'db_add_list query error',str(e))
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



def get_count_data(req,table,groupcheck=True,extraflds=None):
  """
  start=req.start
  count=req.count
  rfields=req.fields
  if rfields: 
    rfields=rfields.strip()
    if rfields:
      rfields=rfields.split(",")
      rfields=[x.strip() for x in rfields] 
  flds=req.dtables[table]['fields']
  if req.dtables[table].has_key('table'):
    table=req.dtables[table]['table']
  fldset="" 
  """
  qs="select count(*) "
  qs+=" from "+table  
  flt=parse_filter(req,req.filter,table,extraflds)
  params=None
  if groupcheck: 
    if table=="networks": grpfield="id"
    else: grpfield=req.group_field      
    grpcl=groupclause(req,table,grpfield,False) # only readgroups
  else: grpcl=False
  if grpcl:
    if "()" in grpcl: return []    
    qs+=" where "+grpcl
    if flt: qs+=" and "+str(flt)
  else:    
    if flt: qs+=" where "+str(flt)
  #qs+=" where "+table+".groupid in "+groupclause(req)  
  #if flt: qs+=" and "+str(flt)
  #if flt: qs+=" where "+str(flt)    
  data=db_get_rows_with_colnames(req,qs,params,0,1)
  if data and len(data)>0: return data[0]
  else: return {}

def get_estimated_count_data(req,table,extraflds=None):
  flt=parse_filter(req,req.filter,table,extraflds) 
  fullest=0  
  try:
    #qs="select reltuples::bigint as estimate from pg_class where relname="
    qs="select n_live_tup as estimated from pg_stat_user_tables where relname="
    qs+="'"+str(table)+"'"   
    data=db_get_rows_with_colnames(req,qs,None,0,1)
    fullest=data[0]["estimated"]
    #print("data: ",str(fullest))
  except:
    #print "failed!"
    est=1000000  # query failed: just assume a big table  
  # was it a small table overall?
  if fullest:     
    est=fullest
    if est<10000:
      # small table: do exact count
      qs="select count(*) as nr from "+table  
      if flt: qs+=" where "+str(flt) 
      data=db_get_rows_with_colnames(req,qs,None,0,1)
      if data and len(data)>0: return {"count": data[0]["nr"]}
      else: return {"estimated": 0}
    else:      
      # a big table: do estimate  
      if not flt:
        # no filter: return estimated size of the whole table
        return {"estimated": est}
      else:
        # filter present in case of a big table
        return {"estimated": est}
  else: 
    # query failed
    return {"estimated": 0}

# see also
"""
CREATE FUNCTION count_estimate(query text) RETURNS integer AS $$
DECLARE
  rec   record;
  rows  integer;
BEGIN
  FOR rec IN EXECUTE 'EXPLAIN ' || query LOOP
    rows := substring(rec."QUERY PLAN" FROM ' rows=([[:digit:]]+)');
    EXIT WHEN rows IS NOT NULL;
  END LOOP;
  RETURN rows;
END;
$$ LANGUAGE plpgsql VOLATILE STRICT;

SELECT count_estimate('SELECT 1 FROM items WHERE n < 1000');
"""

def get_list_data(req,table,groupcheck=True):
  start=req.start
  count=req.count
  rfields=req.fields
  if rfields: 
    rfields=rfields.strip()
    if rfields:
      rfields=rfields.split(",")
      rfields=[x.strip() for x in rfields] 
  flds=req.dtables[table]['fields']
  if req.dtables[table].has_key('table'):
    table=req.dtables[table]['table']
  fldset=""
  #fldlst=[]
  for el in flds:    
    if el.has_key("dummy") and el["dummy"]: continue
    if el.has_key('name'): 
      name=el['name']      
      if rfields:
        if not(name in rfields): continue
      if fldset!="": fldset+=", "
      if el.has_key('type'):
        if el['type']=='timestamp' or el['type']=='datetime': 
          fldset+="to_char("+table+"."+name+""",'YYYY-MM-DD"T"HH24:MI:SS') as """
          fldset+=name
        elif el['type']=='date': 
          fldset+="to_char("+table+"."+name+",'YYYY-MM-DD') as "
          fldset+=name
        elif el['type']=='hourminute': 
          fldset+="to_char("+table+"."+name+",'HH24:MI') as "
          fldset+=name  
        else: 
          fldset+=table+"."+name
        #fldlst.append(table+"."+name)
      else:
        fldset+=table+"."+name
  qs="select "+fldset  
  #select users.id,users.username,locations.name from users left join locations on users.locationid=locations.id where users.id>0;
  joins=parse_joins(req,req.join,table)

  if table=="nodes":
    qs+=""" , last_comment.msg as last_comment """
    
  if joins: qs+=joins[2]
  qs+=" from "+table
  if joins: qs+=joins[0]

  if table=="nodes":
    qs+=" left outer join (select * from comments where id in (select max(id) from comments group by node_nr, network_id) ) as last_comment on nodes.nr = last_comment.node_nr and nodes.network_id = last_comment.network_id "

  flt=parse_filter(req,req.filter,table)  
  params=None
  if groupcheck: 
    if table=="networks": grpfield="id"
    else: grpfield=req.group_field      
    grpcl=groupclause(req,table,grpfield,False) # only readgroups
  else: grpcl=False
  if grpcl:
    if "()" in grpcl: return []    
    qs+=" where "+grpcl
    if flt: qs+=" and "+str(flt)
  else:    
    if flt: qs+=" where "+str(flt)
  if req.sort:
    #print("req.sort",req.sort)
    tmp=req.sort.strip()
    if tmp[0]=="-": 
      order="desc"
      tmp=tmp[1:]
    else:
      order="asc"
    #print("tmp:",tmp)       
    #print("is_known_field(req,tmp):",is_known_field(req,tmp))   
    #print("req.table",req.table)
    if not (is_known_field(req,tmp) or (rfields and (tmp in rfields))):
      handle_error(req,9,'unknown field in sort, check ddef')       
  if req.sort:
    qs+=" order by "+dbs(tmp)+" "+order+" nulls last"
  qs+=" offset "+str(int(start))+" limit "+str(int(count))
  #handle_error(req,9,qs) 
  #data=db_get_rows_with_colnames(req,qs,params,start,count)
  #print("qs: ",qs)
  #print("params: ",params)
  data=db_get_rows_with_colnames(req,qs,params,0,100000)
  return data


def update_data(req,table,keyfield,datalist,groupcheck=True):
  if not is_known_field(req,keyfield):
    handle_error(req,11,'unknown key field given: '+str(keyfield)) 
  if not datalist or type(datalist)!=type([1]) or len(datalist)<1: 
    handle_error(req,4,'no data given for updating')    
  flds=req.dtables[table]['fields']
  if req.dtables[table].has_key('tablename'):
    table=req.dtables[table]['tablename']
  if table=="networks": grpfield="id"
  else: grpfield=req.group_field  
  #print("cp table,grpfield,op",table,grpfield,req.op)
  if groupcheck:
    grpcl=groupclause(req,table,grpfield,True) # writegroups
  else:
    grpcl=""  
  #print("cp grpcl",grpcl)
  check=[]
  for el in flds:
    if el.has_key('name'): check.append(el['name'])   
  reslst=[]  
  for data in datalist:   
    tmp=data_contains_unknown_fields(req,data,check)
    if tmp:
      handle_error(req,11,'unknown fields in data: '+str(tmp))  
    salt="salty"                         
    for x in flds:
      if x.has_key('name'): name=x['name']
      else: continue  
      # force add new salt if "auto":"salt" present in fields
      # and "password" present in data
      if "password" in data and "auto" in x and x["auto"]=="salt": 
        salt=safe_random_string(8)    
        data[name]=salt 
      if data.has_key(name) and data[name] and x.has_key('type'):
        try:
          if x['type']=='integer': data[name]=int(data[name])          
          elif x['type']=='float': data[name]=float(data[name])
          elif x['type']=='json': data[name]=json.dumps(data[name])
        except:
          handle_error(req,10,'data with wrong type given for field '+str(name))
      else: continue  
    # second loop just for hashing password if given          
    for x in flds:
      if x.has_key('name'): name=x['name']
      else: continue       
      if "auto" in x and x["auto"]=="password":
        if name in data and data[name]:
          pwd=hashlib.sha512(data[name]+salt).hexdigest()
          data[name]=pwd 
          grpcl=""     
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
            fldsets+=name+"=to_timestamp(%("+name
            fldsets+=")s, 'YYYY-MM-DD HH24:MI:SS')"
          elif x['type']=='date': 
            fldsets+=name+"=to_date(%("+name
            fldsets+=")s, 'YYYY-MM-DD')"
          elif x['type']=='hourminute': 
            fldsets+=name+"=to_timestamp(%("+name
            fldsets+=")s, 'HH24:MI')"  
          else: fldsets+=name+"=%("+name+")s"
        else:
          fldsets+=name+"=%("+name+")s"        
    qs="update "+table+" set "+fldsets
    qs+=" where "+keyfield+"=%("+keyfield+")s"
    if grpcl:
      if "()" in grpcl: 
        handle_error(req,5,'no rights to change this item','not enough group rights')      
      qs+=" and "+grpcl
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
  #print("cpy1 datalist:",str(datalist))
  for data in datalist:   
    if not data:
      handle_error(req,9,'no data given')
    tmp=data_contains_unknown_fields(req,data,check)
    if tmp:
      handle_error(req,11,'unknown fields in data: '+str(tmp))
    #data=set_missing_input_data_nullvalues(req,data,check)
    salt="salty"
    for x in flds:
      if x.has_key('name'): name=x['name']
      else: continue   
      # force add salt if "auto":"salt" present in fields
      if "auto" in x and x["auto"]=="salt": 
        salt=safe_random_string(8)    
        data[name]=salt
      if name in data and data[name]!=None and x.has_key('type'):
        try:
          if x['type']=='integer': data[name]=int(data[name])          
          elif x['type']=='float': data[name]=float(data[name])
          elif x['type']=='json': data[name]=json.dumps(data[name])
        except:
          handle_error(req,10,'data with wrong type given for field '+str(name))
    # second loop just for hashing password if given          
    for x in flds:
      if x.has_key('name'): name=x['name']
      else: continue       
      if "auto" in x and x["auto"]=="password":
        if name in data and data[name]:
          pwd=hashlib.sha512(data[name]+salt).hexdigest()
          data[name]=pwd
    fldnames=""
    fldsets=""
    for x in flds:
      name=None
      # wrong fld format?
      if x.has_key('name'): name=x['name']
      else: continue  
      # name key in data?
      if not (name in data):
        # no corresponding key in data
        if x.has_key('auto') and x['auto']=='now()':
          if fldnames!="": fldnames+=", "
          if fldsets!="": fldsets+=", "
          fldnames+=name
          fldsets+="now()" 
        elif x.has_key('auto') and x['auto']=='req.username':
          if fldnames!="": fldnames+=", "
          if fldsets!="": fldsets+=", "
          fldnames+=name
          fldsets+="%("+name+")s"
          data[name]=req.username
        elif x.has_key('default'):
          if fldnames!="": fldnames+=", "
          if fldsets!="": fldsets+=", "
          fldnames+=name
          if x['default']=='now()': fldsets+="now()"
          elif x['default'] in ['DEFAULT','default']: fldsets+="DEFAULT"
          else: fldsets+="'"+str(x['default'])+"'" 
            
        else:
          continue
      else:
        # key present in data       
        if fldnames!="": fldnames+=", "
        if fldsets!="": fldsets+=", "
        fldnames+=name
        if x.has_key('type'):
          if x['type']=='timestamp' or x['type']=='datetime': fldsets+='to_timestamp(%('+name+")s, 'YYYY-MM-DD HH24:MI:SS')"
          elif x['type']=='date': fldsets+='to_date(%('+name+")s, 'YYYY-MM-DD')"
          elif x['type']=='hourminute': fldsets+='to_timestamp(%('+name+")s, 'HH24:MI')"
          elif x['type']=='time': data[name]=float(data[name])
          else: fldsets+="%("+name+")s"
        else:
          fldsets+="%("+name+")s"
    qs="insert into "+table+" ("+fldnames+") values ("+fldsets+")"
    qs+=" returning id"  
    #print("cpy2 qs:",qs)
    #print("cpy2 data:",data)
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

def db_get_sessioninfo_row(req,sid):
  qs="""select id,username from sessions where sid=%s
        and sessions.endts>=now()""" 
  return db_get_row(req,qs,(sid,))

def old_db_get_sessioninfo_row(req,sid):
  qs="""select users.id,users.username,users.first_name,users.last_name,users.level,
        users.lang, users.uistyle, -- users.fullname, users.service, 
        sessions.token
        from users,sessions where 
        users.status='A' and users.username=sessions.username and sessions.sid=%s
        and sessions.endts>=now()""" 
  return db_get_row(req,qs,(sid,))
  
def db_update_sessioninfo_end(req,sid):
  qs="update sessions set endts=now()+interval '60 minutes' where sid=%s"
  return db_execute(req,qs,(sid,))


# - - - - - - login-logout specific - - - -

def get_user_by_username(req,username):
  qs="""select id, username, level, networks, first_name,
          last_name, phone, email, address, remarks, lang,
           varchar(10), -- preferred UI language as a two-letter code
  uistyle varchar(10), -- preferred UI style

  -- computed/cached information about the user
  last_login timestamptz default now(), -- last login time (not activity)
  
  -- standard administrative information
  status char(1) not null default 'A', --- A: active, D: deleted
  created_at timestamptz default now(), -- when was created
  created_by varchar(100), -- username or systemname creating
  updated_at timestamptz default now(), -- when was last updated
  updated_by varchar(100) -- username or systemname last updating
       from users where status='A' and username=%s"""
  return db_get_rows_with_colnames(req,qs,(username,),0,1)


def db_get_userlogininfo_row(req,username,password):
  qs="""select id,username,first_name,last_name,level,lang,uistyle, -- fullname,service,email 
        from users where status='A' and username=%s and password=%s"""
  #qs="select id,username,firstname,lastname from users where username='tanel.tammet@gmail.com' and password='abc'"
  return db_get_row(req,qs,(username,password))   


def logout_sessions(req,sid,username):
  cur=req.con.cursor()
  qs="delete from sessions where sid=%s and username=%s"      
  cur.execute(qs,(sid,username))
  req.con.commit()
  cur.close()
  

def create_login_session(req,sid,username,token):
  """ Insert a new session and return the resulting record. """
  try:
    cur=req.con.cursor()
    # first delete old sessions
    qs="delete from sessions where endts<now()"
    res=cur.execute(qs,None)
    req.con.commit()  
    cur.close()  
  except:
    handle_error(req,8,'internal error','could not delete old sessions')     
  # insert a new session, returning the result
  qs="""insert into sessions (id,sid,username,endts,token) values 
          (default,%s,%s,now()+ interval '"""+str(req.session_minutes)+""" minutes',%s) 
        returning id,sid,username,
                  to_char(created_at,'YYYY-MM-DD"T"HH24:MI:SS'),
                  to_char(endts,'YYYY-MM-DD"T"HH24:MI:SS')""" 
  tmp=db_add(req,qs,(sid,username,token))
  if not tmp:
    handle_error(req,8,'internal error','could not store session')
  res={"id":tmp[0],"sid":tmp[1],"username":tmp[2],"created":tmp[3],"endts":tmp[4]}  
  return res

def update_user_login_time(req,username):
  try:
    cur=req.con.cursor()
    qs="update users set last_login=now() where username=%s"      
    cur.execute(qs,(username,))
    req.con.commit()
    cur.close()
  except:
    handle_error(req,8,'internal error','could not update user.last_login')  


# - - - - - extensions to data - - - - - - -

def get_networks_nodes_count(req,keys):
  if not keys: return []
  qs="""select network_id,count(*) as count from nodes 
        where 
        status='A' and 
        network_id in $replace$ 
        group by network_id"""  
  ptempl=make_key_list_str(keys)  
  qs=qs.replace("$replace$",ptempl)
  data=db_get_rows_with_colnames(req,qs,None,0,10000)
  return data

def make_key_list_str(keys):
  s="("
  cnt=0
  for el in keys:
    if cnt>0: s+=","
    s+=str(el)
    cnt+=1
  s+=")"
  return s


# ----------------- parsing filters -------------------


def parse_filter(req,filter,table,extraflds=None):  
  if filter:
    if type(filter)==type([1]):
      lst=filter
    else:
      lst=filter.split(",")
  else:
    return None           
  #handle_error(req,9,str(filter))     
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
    #print("table,fld,filter,lst",table,fld,filter,lst)
    if not is_known_field(req,fld,extraflds):
      print("failed!")
      handle_error(req,9,'unknown field in filter, check ddef')     
    if extraflds and extraflds.has_key(fld):
      fld=extraflds[fld]      
    op=lst[i*3+1].strip()
    if not op in ["=",">","<","<=",">=","!=","like","ilike","in"]:
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
        elif op=="in":
          val=lst[i*3+2].strip()
          handle_error(req,9,str(val))
          if val: val=val.replace("$comma$",",")
          break            
    if not val: 
      val=lst[i*3+2].strip()
      val=process_sql_val_str(val)  
    #print("flt el:",fld,op,val)        
    res+=[str(table+"."+fld),str(op),str(val)]
    i+=1
  #handle_error(req,9,str(res))  
  sres=" ".join(res)
  return sres
  

# ----------------- parsing joins -----------------------------
# origfield,tablename1.table1joinfield,tablename1.tablej1newfield,
#select users.id,users.username,locations.name from users left join locations on users.locationid=locations.id where users.id>1;


def parse_joins(req,joins,table):
  if joins:
    lst=joins.split(",")
  else:
    return None  
  if len(lst)<3:
    handle_error(req,9,'joins must contain at least 3 elements')    
  if len(lst) % 3 != 0:
    handle_error(req,9,'joins length must divide by 3')    
  fldres=""  
  tres=""
  fres=""  
  i=0
  #handle_error(req,9,str(req.dtables))   
  #handle_error(req,9,str(req.dtables["locations"])) 
  jointables=[]
  joinflds=[]
  foundnew=False
  while i*3<len(lst):   
    mainfld=lst[i*3].strip()     
    joinfld=lst[i*3+1].strip()    
    newfld=lst[i*3+2].strip()
    tmp=joinfld.split(".")
    if len(tmp)!=2:
      handle_error(req,9,'joined field in join without table, use table.field')
    tbl=tmp[0]  
    joinfld=tmp[1]
    tmp=newfld.split(".")
    if len(tmp)==1:
      newfld=tmp[0]
    else:
      newfld=tmp[1]     
    if not req.dtables[tbl]:
      handle_error(req,9,'unknown table in join, check ddef')
    if not is_known_field(req,mainfld):
      handle_error(req,9,'unknown main table field in join, check ddef')     
    flds=req.dtables[tbl]['fields']
    foundjoin=None
    for el in flds:    
      if el.has_key('name') and el["name"]==joinfld:
        foundjoin=el["name"] 
        break
    if not foundjoin:
      handle_error(req,9,'unknown joined table field in join, check ddef')   
    found=None
    for el in flds:    
      if el.has_key('name') and el["name"]==newfld:
        foundnew=el["name"] 
        break
    if not foundnew:
      handle_error(req,9,'unknown joined table new field in join, check ddef')     
    if not tbl in jointables:
      tres+=" left join "+tbl+" on "+table+"."+mainfld+"="+tbl+"."+joinfld     
      jointables.append(tbl)
    if not tbl+"."+newfld in joinflds:  
      fldres+=", "+tbl+"."+newfld+" as "+tbl+"__"+newfld
      joinflds.append(tbl+"."+newfld)
    i+=1  
  #handle_error(req,9,str( [tres,fres,fldres] )) 
  return [tres,fres,fldres]

def old_parse_joins(req,joins,table):
  if joins:
    lst=joins.split(",")
  else:
    return None  
  if len(lst)<3:
    handle_error(req,9,'joins must contain at least 3 elements')    
  if len(lst) % 3 != 0:
    handle_error(req,9,'joins length must divide by 3')    
  fldres=""  
  tres=""
  fres=""  
  i=0
  #handle_error(req,9,str(req.dtables))   
  #handle_error(req,9,str(req.dtables["locations"])) 
  while i*3<len(lst):   
    mainfld=lst[i*3].strip()     
    joinfld=lst[i*3+1].strip()    
    newfld=lst[i*3+2].strip()
    tmp=joinfld.split(".")
    if len(tmp)!=2:
      handle_error(req,9,'joined field in join without table, use table.field')
    tbl=tmp[0]  
    joinfld=tmp[1]
    tmp=newfld.split(".")
    if len(tmp)==1:
      newfld=tmp[0]
    else:
      newfld=tmp[1]     
    if not req.dtables[tbl]:
      handle_error(req,9,'unknown table in join, check ddef')
    if not is_known_field(req,mainfld):
      handle_error(req,9,'unknown main table field in join, check ddef')     
    flds=req.dtables[tbl]['fields']
    foundjoin=None
    for el in flds:    
      if el.has_key('name') and el["name"]==joinfld:
        foundjoin=el["name"] 
        break
    if not foundjoin:
      handle_error(req,9,'unknown joined table field in join, check ddef')   
    found=None
    for el in flds:    
      if el.has_key('name') and el["name"]==newfld:
        foundnew=el["name"] 
        break
    if not foundnew:
      handle_error(req,9,'unknown joined table new field in join, check ddef')     
    tres+=", "+tbl
    if fres: fres+=" and "
    fres+=table+"."+mainfld+"="+tbl+"."+joinfld      
    fldres+=", "+tbl+"."+newfld
    i+=1  
  #handle_error(req,9,str( [tres,fres,fldres] )) 
  return [tres,fres,fldres]


# --------------- groups --------------------------

def groupclause(req,table,field,writeflag=False):
  #print("groupclause:",table,field,writeflag,req.userlevel)
  if req.userlevel==1: return "" # access all
  # first check if group field present in table
  flds=req.dtables[table]['fields']
  #print("cpx flds:",flds)
  found=False
  for fld in flds:
    if "name" in fld and fld["name"]==req.group_field: 
      found=True
      break
  if not found and not table in ["networks","users"]:
    return ""   
  # group field present  
  if not req.usergroups: return " () " # no access anywhere
  if table=="users":
    # block writing
    if writeflag: return " () "
    # special case for filtering out users
    grplst=[]
    if req.user_read_groups: grplst+=req.user_read_groups
    if req.user_write_groups: grplst+=req.user_write_groups
    if not grplst: return " () "  
    lst=[]
    for el in req.user_write_groups:
      lst.append(str(el))     
    if not lst: return " () "
    #res="networks::jsonb ?| array['1'];"
    res="networks::jsonb ?| array"+str(lst)
    #print("cp0 groupclause: "+res)
    return res 
  if not writeflag:
    # make groups for reading, thus containing also writegroups
    grplst=[]
    if req.user_read_groups: grplst+=req.user_read_groups
    if req.user_write_groups: grplst+=req.user_write_groups
    if not grplst: return " () "
    res=str(table)+"."+str(field)+" in (" + ",".join(map(str,grplst)) + ") "  
    #print("cp1 groupclause: "+res)
    return res
  # from here on only writegroups
  grplst=req.user_write_groups  
  if not grplst: return " () "
  res=str(table)+"."+str(field)+" in (" + ",".join(map(str,grplst)) + ") "  
  #res=" (" + ",".join(map(str,grplst)) + ") "  
  #print("cp2 groupclause: "+res)
  return res


# ---------------- small db utilities --------------------------


def is_known_field(req,fld,extraflds=None):  
  if extraflds and extraflds.has_key(fld): return True
  try:
    tmp=req.dtables[req.table]["fields"]
    for el in tmp:
      if fld==el["name"]: return True
  except:
    handle_error(req,9,'table not specified enough in ddef')        
  return False

def data_contains_unknown_fields(req,data,check):
  #print("cpx1: ",str(data))
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
