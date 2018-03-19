

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
  * install Flask if you do not have it already: sudo pip install Flask
  * check the app.cfg contents: is everything ok? if not, modify.
  * run the flask app, like this:

    export FLASK_APP=app.py
    export FLASK_DEBUG=1  # optional
    flask run

You should now have the api tool running as as a flask app at

    http://127.0.0.1:5000/api

Try from the browser with cgi parameters:

    http://127.0.0.1:5000/api?op=list&table=locations&token=test

and using curl and posted json:

    curl 'http://127.0.0.1:5000/api' -d '{"op":"list", "table":"users", "token":"test"}'      

Both tests should produce a few rows of the users table data in the json format.
You should also see output in the logfile /tmp/reactsdblog.

Third, try out the html UI in your browser, served by flask:

    http://127.0.0.1:5000/static/index.html

You should see a login page. Enter arbitrary username and password, click "Demo login"

You should now see a simple page with a small left menu. The "Users" selection should function.
Editing users should be possible, adding currently not.

In case your api does not run on the url indicated before, please change 
these rows in the js/data.js file accordingly:

  "apiUrl": "http://127.0.0.1:5000/api", // normally used by api for fetching/storing data with a proxy 
  "localApiUrl": "http://127.0.0.1:5000/api",



