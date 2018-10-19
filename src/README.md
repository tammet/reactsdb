reactsdb source, utils and demo parts for a browser
===================================================

Files and folders:

* index.html - directly usable demo html, does not require transpiling or packing
* viewdefs.js - defined views for the demo
* init.js - initialization funs for the demo
* data.js - initialization data for the demo
* auto/ - main auto*.js files for reactsdb
* utils/ - utility js files for reactsdb
* css/ - css files for reactsdb and demo
* img/ - images for reactsdb and demo
* react/ - original unchanged react.js files

Open index.html
================

Main part of the demo: automatic generation of crud views and actions.

Assumes the api runs ok on the database: check the server/README.md for instructions.

No transpiling or packing necessary: assuming the Flask server is running,
just open the browser at

    http://127.0.0.1:5000/static/index.html

and log in with a username tst1 and password pwd1

In case your url for the api is different than the assumed

   http://127.0.0.1:5000/api

please change these rows in the data.js file accordingly:

  "apiUrl": "http://127.0.0.1:5000/api", // normally used by api for fetching/storing data with a proxy 
  "localApiUrl": "http://127.0.0.1:5000/api",

  

