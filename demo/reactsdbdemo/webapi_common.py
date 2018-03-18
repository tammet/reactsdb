#!/usr/bin/python
# -*- coding: utf-8 -*-

import sys,json

# ---------------- output formatting and error handling -------------

def out_format_list(req,data):
  tmp=json.dumps(data,indent=req.debug)
  if req.callback:
    tmp=req.callback+"("+tmp+");"
  req.outstr=tmp
  return tmp

class Error(Exception):
  status_code = 400

  def __init__(self, message, code=8, status_code=None, payload=None):
    Exception.__init__(self)
    self.message = message
    self.code = code
    if status_code is not None:
        self.status_code = status_code        
    self.payload = payload

  def to_dict(self):
    rv = dict(self.payload or ())
    rv['errmsg'] = self.message
    rv['errcode'] = self.code
    return rv

def handle_error(req,code,msg):
  """ 
  errcode:
    1: conf or database connection error
    2: authentication failure
    3: missing api parameters
    4: unknown or wrong api parameter values
    5: insufficient rights
    6: database operation error
    7: timeout
    8: unexpected error
    9: database query format error
  """    
  tmp=out_format_list(req,{"errcode": code, "errmsg": msg})
  if req.con and not req.con.closed:
    req.con.cancel()
    req.con.close()
  if req.flask:     
    raise Error(msg, code, status_code=410)
  else:  
    print('Content-Length: '+str(len(tmp)))  
    print(req.mime+'\r\n')
    print(tmp)
    if req.con:
      req.con.cancel()
      req.con.close()
    sys.exit()


class TimeoutExc(Exception):
    """this exception is raised when there's a timeout"""
    def __init__(self): Exception.__init__(self)

def alarmhandler(signame,frame):
    "sigalarm handler.  raises a Timeout exception"""
    raise TimeoutExc()
    