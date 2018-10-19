#!/usr/bin/python

import sys,cgi,psycopg2,string,time,os,types
import signal,datetime,logging

# send_from_directory is for changing static dir
from flask import Flask, request, jsonify, make_response #, send_from_directory

from webapi.webapi_ctrl import *
from webapi.webapi_auth import *
from webapi.webapi_special import *
from webapi.webapi_common import *
from webapi.webapi_ddef import *

# change static dir
#static_file_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'static')
app = Flask(__name__,static_url_path='/static',static_folder='static')
#app = Flask(__name__)

#configfile=os.path.dirname(os.path.realpath(__file__))+"/app.cfg"
configfile="/opt/reactsdb/demo3/app.cfg"

# next one was on all the time before static changing experiments
app.config["APPLICATION_ROOT"] = "/api"



@app.route('/api/',methods=['POST','GET','PUT'])
@app.route('/api',methods=['POST','GET','PUT'])
@app.route('/',methods=['POST','GET','PUT'])
def index():
  handle_error(None,3,"path should be " + app.config["APPLICATION_ROOT"] + "/resource")


@app.route("/api/<path:subpath>",methods=['OPTIONS'])
@app.route("/<path:subpath>",methods=['OPTIONS'])
def options_main(subpath):
  resp=make_response("")
  resp.headers['Access-Control-Allow-Origin']='*'
  resp.headers['Access-Control-Allow-Headers']="X-Authorization, Content-Type"
  resp.headers['Access-Control-Allow-Methods']="POST, GET, PUT, DELETE, OPTIONS, HEAD"
  return resp, 200, {'Content-Type': 'application/json'}


@app.route("/api/<path:subpath>",methods=['POST','GET','PUT','DELETE'])
@app.route("/<path:subpath>",methods=['POST','GET','PUT','DELETE'])
def main(subpath):
  inmethod=request.method #os.environ['REQUEST_METHOD']"
  #print("subpath: ",subpath)
  if inmethod in ['POST','PUT'] and subpath and subpath.startswith("gwreport/"):
    # special: raw report posted
    try:
      request.get_data()      
      inparams={"op":"gwreport","data":request.data}
    except:
      handle_error(None,8,"cannot access posted report") 
  elif inmethod in ['POST','PUT']:
    # post or put
    try:
      inparams=request.get_json(force=True)
    except:
      handle_error(None,3,"received data is not correct json")  
    if not inparams or (type(inparams)!=type({"a":1})):
      handle_error(None,3,"received data is not a json object {...}")  
  else:
    # get or delete
    inparams={}
    keys=request.args.keys()
    for key in keys:
      inparams[key]=request.args.get(key)
  #print("headers: ",request.headers)       
  result=ctrl_main(configfile,inmethod,inparams,subpath,request.headers,request.remote_addr)
  code=result[0]
  data=result[1] 
  # this is for image output
  if code==0: # special image code
    return data
  # this is for cors header
  resp=make_response(data)
  resp.headers['Access-Control-Allow-Origin']='*'
  resp.headers['Access-Control-Allow-Headers']="X-Authorization, Content-Type"
  resp.headers['Access-Control-Allow-Methods']="POST, GET, PUT, DELETE, OPTIONS, HEAD"
  return resp, code, {'Content-Type': 'application/json'}
  """    
  try:
    result=ctrl_main(configfile,inmethod,inparams,subpath)
    code=result[0]
    data=result[1]
  except:
    import traceback
    tb=traceback.format_exc()
    #print("tb: ",tb)
    e=sys.exc_info()
    handle_error(None,8,"internal error",str(e[0]),tb)        
  """    
  #return data, code, {'Content-Type': 'application/json'}


@app.errorhandler(Error)
def handle_invalid_usage(error):
  response = jsonify(error.to_dict())
  response.status_code = error.status_code
  resp=make_response(response)
  if error.status_code==401:
    resp.headers['WWW-Authenticate']='Bearer error=\"invalid_token\"'
  # this is for cors header  
  resp.headers['Access-Control-Allow-Origin']='*'
  resp.headers['Access-Control-Allow-Headers']="X-Authorization, Content-Type"
  resp.headers['Access-Control-Allow-Methods']="POST, GET, PUT, DELETE, OPTIONS, HEAD"
  return resp
  #return response
