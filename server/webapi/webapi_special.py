#!/usr/bin/python
# -*- coding: utf-8 -*-

# special user-defined (non-standard-crud) operations for webapi
  
import sys,psycopg2,string,time,os,base64
import types,random,signal,datetime,logging,hashlib,subprocess
import smtplib # for email
from email.mime.text import MIMEText # for email

from webapi_auth import *
from webapi_model import *
from webapi_common import *
from webapi_ddef import *

  