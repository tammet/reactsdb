

html UI for the reactsdb demo: 
=============================

Main part of the demo: automatic generation of crud views and actions.

Assumes the api runs ok on the database: check the topmost README.md for instructions.

The reactsdb javascript files are all in the js folder along with the reactjs and other utilities.

No transpiling or packing necessary: assuming the Flask server is running,
just open the browser at

    http://127.0.0.1:5000/static/index.html

and log in using an arbitrary username and password.

In case your url for the api is different than the assumed

   http://127.0.0.1:5000/api

please change these rows in the js/data.js file accordingly:

  "apiUrl": "http://127.0.0.1:5000/api", // normally used by api for fetching/storing data with a proxy 
  "localApiUrl": "http://127.0.0.1:5000/api",

  

