
web api imported software 
=========================

This folder contains the api files imported by the app.py in the server folder above.

The api uses the database and log file as configured in the app.cfg file in the folder above.

Files:

* webabi_ctrl.py: main entry ctrl_main called by flask app.py, dispatch, std crud ops
* webapi_auth.py: authentication and authorization funs 
* webapi_special.py: special user-defined (non-standard-crud) operations
* webapi_model.py: database hnadling: generic tools, crud operations, some special operations
* webapi_common.py: universal global Request class, output formatting, error handling, conf, logging
* webapi_ddef.py: database schema definitions



