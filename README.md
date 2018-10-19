
Reactsdb
========

<b>NB! This is a work in progress, not a ready-to-use system!</b>

Reactsdb is a framework for easy creation of complex crud views and operations 
in single page web apps, by definining and describing views of database tables: 
what is shown and how.

The web views are based on reactjs and can be used directly, 
without any transpiling or packing, see `src/` folder. It should be easy to use
reactsdb in addition to any other components and structure in your web app.

The framework also contains a rest api server written in python, see `server/` folder.

Detailed documentation is in the README.md files in src, server and doc folders.

reactsdb demo
=============

You will create a database which you can then explore and modify using 
the reactsdb demo app.

Both the api and the html/css/js UI are served by Flask: no big
web server needed. You do need postgres to run the api, though.

## Installation

Enter the server folder.

First, create the database:

  * Install postgresql if you do not have it installed already
  * Log in as a user postgres
  * Run sql/createdb.sh and enter the password reactor124 when asked
  * Run sql/createschema.sh, sql/privileges.sh and sql/instestdata.sh  

Second, get the server-side api tool running:

  * install python if you do not have it already. Demo uses python 2 series.
  * install psycopg2: the standard library for connecting to postgresql from python.
  * install Flask if you do not have it already: sudo pip install Flask
  * check the app.cfg contents: is everything ok (database connection, logfile location)? If not, modify. 
  * run the flask app, like this:

    ./run.sh
        

You should now have the api tool running as as a flask app at

    http://127.0.0.1:5000/api

Try from the browser:

    http://127.0.0.1:5000/api/locations?token=test
    

This should produce a few rows of the locations table data in the json format.
You should also see output in the logfile /tmp/reactsdblog.txt

Third, try out the html UI in your browser, served by flask:

    http://127.0.0.1:5000/static/index.html

You should see a login page. Enter username `test` and password `pwd1` and click "Demo login".

You should now see a simple page with small top and left menus. The menu items should function,
searching, editing, adding and deleting records as well.

In case your api does not run on the url indicated above, please change 
these rows in the `src/data.js` file accordingly:

    "apiUrl": "http://127.0.0.1:5000/api", // normally used by api for fetching/storing data with a proxy 
    "localApiUrl": "http://127.0.0.1:5000/api",

The next place to explore is the `src/viewdefs.js` file: this defines how and what is shown on listings and record pages.

