

reactsdb demo
=============

You will create a database, install a server-side api tool and then
you can explore and modify the database using the reactsdb ui.

Both the api and the html/css/js UI are served by Flask: no big
web server needed. You do need postgres to run the api, though.

## Installation

Enter the demo folder.

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

        export FLASK_APP=app.py
        export FLASK_DEBUG=1  # optional
        flask run

You should now have the api tool running as as a flask app at

    http://127.0.0.1:5000/api

Try from the browser with cgi parameters:

    http://127.0.0.1:5000/api?op=list&table=users&token=test

and using curl and posted json:

    curl 'http://127.0.0.1:5000/api' -d '{"op":"list", "table":"users", "token":"test"}'      

Both tests should produce a few rows of the users table data in the json format.
You should also see output in the logfile /tmp/reactsdblog.

Third, try out the html UI in your browser, served by flask:

    http://127.0.0.1:5000/static/index.html

You should see a login page. Enter an arbitrary username and password and click "Demo login".

You should now see a simple page with small top and left menus. The menu items should function,
searching, editing, adding and deleting records as well.

In case your api does not run on the url indicated above, please change 
these rows in the js/data.js file accordingly:

    "apiUrl": "http://127.0.0.1:5000/api", // normally used by api for fetching/storing data with a proxy 
    "localApiUrl": "http://127.0.0.1:5000/api",

The next place to explore is the viewdefs.js file: this defines how and what is shown on listings and record pages.

