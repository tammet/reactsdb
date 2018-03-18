#!/usr/bin/python

from flask import Flask, request, jsonify
from reactsdbdemo.webapi_ctrl import *
from reactsdbdemo.webapi_common import *
from reactsdbdemo.webapi_ddef import *

import sys,cgi,psycopg2,string,time,os,Cookie,types, random
import signal,datetime,logging


app = Flask(__name__)
configfile="/opt/reactsdb/demo/app.cfg"

@app.route("/api",methods=['POST', 'GET'])
def hello():

  s="start "
  inmethod=request.method #os.environ['REQUEST_METHOD']
  s+=str(inmethod)+" "
  if inmethod in ['POST','PUT']:
    # post
    inparams=request.get_json(force=True)
    s+=str(type(inparams))
    s+=str(inparams)+" "
  else:
    # get      
    inparams={}
    keys=request.args.keys()
    for key in keys:
      inparams[key]=request.args.get(key)
    #s+=str(request.args.keys())+" "
    #inparams=request.args.get("a")
    #if inparams=="2":
    #  raise Error('found a==2', 10, status_code=410)
    #s+=str(inparams) #['a']+" "    
    #s+=str(inparams.keys())+" "  
  #s+=" end"  
  #return s
  result=""
  result=ctrl_main(configfile,inmethod,inparams)
  return result



@app.errorhandler(Error)
def handle_invalid_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response
