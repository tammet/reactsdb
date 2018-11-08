#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#
# call as:
# 
# sql2json myfile.sql
#
# Parses an sql file containing create table commands (ddl)
# and prints the json viewdef file describing the database
# used by the server and client of reactsdb.
# 
# The end result is meant for manual modification for reactsb.
#
# In case of errors an error text is printed and parsing is halted.
#
# The sql file should have the following structure:
# 
# * each create table, column declaration and block end );
#   should be on a separate line
# * the comments after -- at the end of column declaration are stored
#   as the help text for the column
# 
# Notice that:
#  
# * file may contain several table definitions
# * the lines not understood are simply ignored
# * upper and lower case for keywords are both ok
# * case of table and column names is preserved
# * concrete amount of whitespace does not matter
# 

# ----- only sys and json are imported, no other dependencies -----

import sys, json

# --- configuration for final viewdef json creation ---

# if server_only is True, html-only keys are not generated:
# only keys useful for the server are generated

server_only=False

# if auto_filter is not None, filter=<value> will be added to 
# put (value 1) or remove (value 0) everything to/from filter
# if auto_filter is None, no filter keys will be added

auto_filter=1 # set to 1, 0 or None

# if auto_list is not None, filter=<value> will be added to 
# put (value 1) or remove (value 0) everything to/from filter
# if auto_filter is None, no filter keys will be added

auto_list=1 # set to 1, 0 or None

# if auto_order is True automatic order keys will be added to fields, 
# to be modified manually after

auto_order=True

# if auto_groups is not false and there are more than auto_group_column_limit
# columns, automatic group keys will be added to fields, prefixed by value,
# to be modified manually after

auto_groups="grp"
auto_group_column_limit=5


# --- example: set value to None to avoid parsing automatic example if no file given ---

example = """

create sequence mytable_id_seq; -- non-table-creation lines are ignored

CREATE TABLE mytable (
  id integer PRIMARY KEY default nextval('mytable_id_seq'),
  name varchar(100) not null, -- name of the item
  -- lines starting with comment or empty are ignored
  connected_product integer references products('id'), -- associated product
  amount integer default 0,
  size decimal(5,1), 
  lastdate datetime,
  extras jsonb,
  created_at timestamp default now(), -- automatically registered
  UNIQUE(name) -- this is ignored by the parser
);

  CREATE TABLE second_table (
    id integer PRIMARY KEY default nextval('mytable_id_seq'),
    name varchar(100) not null, -- name of the item
    -- lines starting with comment or empty are ignored
    connected_product integer references products('id'), -- associated product
    amount integer default 0,
    size decimal(5,1), 
    lastdate datetime,
    extras jsonb,
    created_at timestamp default now(), -- automatically registered
    UNIQUE(name) -- this is ignored by the parser
  );

"""

# --- top level functions ----

# main is the first function called (call the end of the source)

def main():
  global example
  args=sys.argv
  inputstr=None
  if len(args)>1:
    try:
      fp=open(args[1],"r")
    except:
      handle_err("could not open input file "+str(args[1]))
    try:    
      inputstr=fp.read()
    except:
      handle_err("could not read input file "+str(args[1]))  
    fp.close()  
  if inputstr:
    parseres=parse_sql(inputstr)
  else:
    # no input given
    if example:
      parseres=parse_sql(example)  
    else:
      handle_err("no input received")  
  if not parseres:
    handle_err("no table definitions found")
  #print("parseres:")  
  #print(json.dumps(parseres,indent=True))
  js=convert_to_json(parseres)
  if js:
    print(js)
  else:
    handle_err("converting to viewdef json failed")  

# parse the full sql ddl string

def parse_sql(ddl):
  if not ddl: return None
  split=ddl.splitlines()
  curtable=None
  err=None
  tables=[]
  for line in split:
    #print(line)
    if is_create_line(line):
      # new table starts
      curtable=get_table_name(line)
      tablerows=[]
      if not curtable:
        handle_err("table name not found in create table line: "+line)
    elif curtable and is_create_end_line(line):
      # table ends      
      tables.append([curtable,tablerows])
      curtable=None
    elif curtable:
       # a line inside table def
       parsed=parse_col_line(line)
       if parsed: tablerows.append(parsed)
  return tables

# --- analyze create table start, end, table name ----

# check if a line is a create table line

def is_create_line(s):
  if not s: return False
  spl=s.split()
  if len(spl)>2 and spl[0].lower()=="create" and spl[1].lower()=="table":
    return True
  else:
    return False

# check if a line ends a create table command 

def is_create_end_line(s):
  if not s: return False 
  s2=s.replace(" ", "")  
  if s2.startswith(");"): return True
  else: return False

# get the name of the table created on the create table line

def get_table_name(s):
  rpl=s.replace("("," ( ")
  rpl=rpl.replace(")"," ) ")
  rpl=rpl.replace("--"," -- ")
  spl=rpl.split()
  if len(spl)<3:
    return None
  name=spl[2]
  return name

# --- parse a column line in the create table block ----

# parse a line in the create table block

def parse_col_line(s):  
  if not s: return None
  rpl=s.replace(","," , ")
  rpl=rpl.replace("("," ( ")
  rpl=rpl.replace(")"," ) ")  
  rpl=rpl.replace("--"," -- ")
  spl=rpl.split()
  if not spl: return None
  if spl[0]=="--": return None # pure comment line
  if spl[0].lower() in ["check","constraint","unique"]: return None
  if len(spl)>1 and spl[0].lower() in ["primary","foreign"] and spl[1].lower()=="key": 
    return None
  res={}
  res["name"]=spl[0]
  spl=spl[1:]
  if not spl: return res      
  cpos=closeparpos(spl)
  if len(spl)>3 and spl[1]=="(" and spl[3]==")":
    res["type"]=spl[0].lower()
    res["typequalifier"]=spl[2].lower()
    spl=spl[4:]
  elif len(spl)>3 and spl[1]=="(" and cpos>1:
    res["type"]=spl[0].lower()
    res["typequalifier"]=" ".join(spl[2:cpos])
    spl=spl[cpos+1:]
  else:
    res["type"]=spl[0].lower()
    spl=spl[1:]  
  if not spl: return res
  shortened=True        
  while spl and shortened:
    shortened=False
    cpos=closeparpos(spl)
    if len(spl)>0 and spl[0].lower()=="unique":
      res["unique"]=True
      spl=spl[1:]
      shortened=True
      if not spl: return res
    if len(spl)>1 and spl[0].lower()=="not" and spl[1].lower()=="null":
      res["notnull"]=True
      spl=spl[2:]
      shortened=True
      if not spl: return res
    if len(spl)>1 and spl[0].lower()=="primary" and spl[1].lower()=="key":
      res["primarykey"]=True
      spl=spl[2:]
      shortened=True
      if not spl: return res  
    if len(spl)>4 and spl[0].lower()=="default" and spl[2]=="(" and spl[4]==")":
      res["default"]=[sqlstr(spl[1]),sqlstr(spl[3])]
      spl=spl[5:]
      shortened=True
      if not spl: return res  
    if len(spl)>3 and spl[0].lower()=="default" and spl[2]=="(" and spl[3]==")":
      res["default"]=[sqlstr(spl[1])]
      spl=spl[4:]
      shortened=True
      if not spl: return res        
    if len(spl)>1 and spl[0].lower()=="default":
      res["default"]=sqlstr(spl[1])
      spl=spl[2:]
      shortened=True
      if not spl: return res   
    if len(spl)>4 and spl[0].lower()=="references" and spl[2]=="(" and spl[4]==")":
      res["references"]=[spl[1],spl[3]]
      spl=spl[5:]
      shortened=True
      if not spl: return res 
    if len(spl)>1 and spl[0].lower()=="references" and cpos<0:
      res["references"]=[spl[1]]
      spl=spl[2:]
      shortened=True
      if not spl: return res     
    if len(spl)>4 and spl[0].lower()=="check" and spl[1]=="(" and cpos>1:  
      res["check"]=" ".join(spl[2:cpos])
      spl=spl[cpos+1:]
      shortened=True
      if not spl: return res    
    if len(spl)>1 and spl[0].lower()=="constraint":      
      spl=spl[2:]
      shortened=True
      if not spl: return res
    if len(spl)>0 and spl[0]==",":      
      spl=spl[1:]
      shortened=True
      if not spl: return res
    if len(spl)>1 and spl[0]=="--":
      comm=" ".join(spl[1:])      
      comm=comm.replace(" , ",",")
      comm=comm.replace(" ( ","(")
      comm=comm.replace(" ) ",")")
      comm=comm.replace(" -- ","--")
      res["comment"]=comm
      return res
  return res


# detect the first occurrence of ) in a list of strings

def closeparpos(lst):
  if not lst: return -1
  n=0
  while n<len(lst):
    if lst[n]==")": return n
    n=n+1
  return -1

# convert apostrophed string like 'ab' to non-apostrophed like ab

def sqlstr(s):
  if not s: return s
  if s.startswith("'") and s.endswith("'"):
    return s[1:-1]
  else:
    return s

# ---- convert the parse result datastructure to viewdef json ---

def convert_to_json(parseres):
  # the next line outpust assignment of json to a variable
  res="dtables={\n"
  tablecount=len(parseres)
  tablenr=0
  for table in parseres:
    # first, table prefix
    name=table[0]    
    ts="""
  %s : {
    "name" : %s,
    "table" : %s,""" % (jstr(name),jstr(name),jstr(name))  
    # second, table special descriptions    
    label=getlabel(name)
    if label!=name:
      ts+="""
    "label": %s,""" % jstr(label)
    fields=table[1]    
    tkey=get_tablekey(fields) 
    if tkey:
      ts+="""
    "key": %s,
    "refField": %s,""" % (jstr(tkey),jstr(tkey))
    namefield=get_namefield(fields,name)
    if namefield:
      ts+="""    
    "nameField": %s,""" % jstr(namefield)
    # third, table fields
    ts+="""\n    "fields" : [\n"""   
    fieldnr=0
    fieldcount=len(fields)
    fs=""
    for field in fields:
      fres=field_to_json(field,fieldnr,fieldcount,"       ")
      if fres:
        fs+="      "+fres
      if fieldnr<fieldcount-1:
        fs+=",\n"
      else:
        fs+="\n    ]\n"
      fieldnr+=1
    # add fully built field block to table string  
    ts+=fs
    # fourth, table end
    ts+="""  }"""
    if tablenr<tablecount-1:
      ts+=","
    ts+="\n"
    tablenr+=1
    # add fully built table string to result string
    res+=ts
  res+="\n}\n"
  return res

# find a probable primary key from the fields

def get_tablekey(fields):
  for field in fields:
    if not ("name" in field): continue
    if "primarykey" in field and field["primarykey"]:
      return field["name"]  
  return None    

# find a probable main name field from the fields

def get_namefield(fields,tablename):
  bestsname=None # best shortened version of name
  bestname=None # best original version of name
  for field in fields:
    if not ("name" in field): continue
    name=field["name"]    
    sname=name.lower()  
    sname=sname.replace(tablename.lower(),"")
    # sname is shortened lowercase name
    if ("name" in sname):
      if (not bestsname) or len(bestsname)>len(sname):
        bestsname=sname
        bestname=name
    if ("title" in sname):
      if (not bestsname) or len(bestsname)>len(sname):
        bestsname=sname
        bestname=name      
  return bestname


# make a json string of one field description
# fieldnr: column nr from 0,1,..
# fieldcount: total nr of columns
# spaces: spaces string to prepend to new lines if line too long

def field_to_json(field,fieldnr,fieldcount,spaces):
  if not field: return None
  if not ("name" in field): return None
  breaklen=80 # comment formatted on a separate line if total strlen is longer
  fs=""
  name=field["name"]    
  fs="""{"name":%s""" % (jstr(name))
  label=getlabel(name)
  if label!=name and not server_only:
    fs+=""", "label":%s""" % (jstr(label))
  if "type" in field:
    ts=typestr(field["type"])
    fs+=""", "type":%s""" % (jstr(ts))
    if ts in ["date","float"]:
      fs+=""", "filterRange":1"""      
  else:
    ts=None  
  if ts=="string" and "typequalifier" in field and type(field["typequalifier"]==int):
    fs+=""", "length":%s""" % (field["typequalifier"])
  if "primarykey" in field and field["primarykey"]:
    fs+=""", "key":1"""  
  if "default" in field:
    df=field["default"]
    dt=type(df)
    if dt==int:
      fs+=""", "default":%d""" % df
    elif dt==float:      
      fs+=""", "default"":%f""" % df
    elif dt==str:      
      fs+=""", "default"":%s""" % jstr(df)
    elif dt==list and df and df[0]=="nextval": # NB! setting auto:1 and edit:0 for default nextval()
      fs+=""", "default":"DEFAULT\""""
      fs+=""", "auto":1"""
      fs+=""", "edit":0"""
    elif dt==list and df and df[0]=="now": # NB! setting auto:1 and edit:0 for default now()
      fs+=""", "default":"now()\""""
      fs+=""", "auto":1"""
      fs+=""", "edit":0"""
    elif dt==list and df and type(df[0])=="str":
      fs+=""", "default":%s""" % jstr(dt[0])
  
  #"""
  #"key" : "id",      
  #"refField" : "id",
  #"nameField" : "username",
  #"""

  fs2="" # second line, initially empty
  if not server_only:     
    # next block goes on the second line
    if auto_groups or auto_order or auto_filter!=None or auto_list!=None:
      # new line
      fs+=",\n"+spaces
    if auto_groups and fieldcount>auto_group_column_limit:
      nr=groupnr(fieldnr,fieldcount)
      gs=jstr(str(auto_groups)+str(nr))
      if fs2: fs2+=", "
      fs2+="""\"group":%s""" % gs
    if auto_order:
      nr=(fieldnr+1)*10
      if fs2: fs2+=", "
      fs2+="""\"order":%d""" % nr
    if auto_filter!=None:
      if fs2: fs2+=", "
      fs2+="""\"filter":%x""" % auto_filter
    if auto_list!=None:
      if fs2: fs2+=", "
      fs2+="""\"listShow":%x""" % auto_list          

    if "comment" in field and field["comment"]:
      if fs2:
        # already on the next line
        fs2+=""", "help":%s""" % (jstr(field["comment"]))
      else:
        # just one line so far
        if breaklen>len(fs)+11+len(field["comment"]):
          # on the same line
          fs+=""", "help":%s""" % (jstr(field["comment"]))
        else:
          # on a separate line
          fs+=",\n"+spaces+"""\"help":%s""" % (jstr(field["comment"]))  
  # if next line nonempty, add that
  if fs2: fs=fs+fs2     
  fs+="}"
  return fs

# get a label: nice-looking name for showing to user

def getlabel(str):
  if not str: return ""
  label=str.replace("_"," ")
  label=label.replace("."," ")
  if str==label: 
    return str
  else: 
    return label

# convert sql type to viewdef type

def typestr(type):
  if not type: return "string" # default: fix these cases manually
  types={"varchar":"string","char":"string",
         "int":"integer","integer":"integer",
         "decimal":"number",
         "json":"json","jsonb":"json",
         "date":"date","datetime":"date","timestamp":"date",
         "timestamptz":"date"}
  if type.lower() in types:
    return types[type.lower()]
  else:
    return "string" # default: fix these cases manually

# make a json string

def jstr(s):
  if not s: return ""
  if type(s)==int: return s
  if type(s)==float: return s  
  rs=s.replace("\""," ") # no quotation marks in result
  rs="\""+rs+"\""
  return rs

# get a default group nr

def groupnr(fieldnr,fieldcount):
  global auto_group_column_limit
  n=int(fieldnr / auto_group_column_limit)+1
  return n

# ----- utilities -----

# called when an error is detected

def handle_err(e):
  print(e)
  sys.exit()

# ---- launch the program ----

main()
