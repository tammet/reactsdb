
webapi server used by reactsdb
===============================

This doc will give a quick overview of what is here and how to run the server.

Files/folders
-------------

* app.cfg: configuration file in for app.py
* app.py: Flask app for web api: web api is used by the user interface
* run.sh: flask-based web api startup script only for debugging/developing
* webapi/: web api software imported by the server flask-based top-level `app.py`, see [README.md](webapi/README.md) in the folder
* apache/: apache integration helpers

Installation and startup
-------------------------

First, create the database via `sql` folder,
see `sql/README.md`

Second, get the server-side api tool running:

* install `python` if you do not have it already. Currently we assume `python 2.7` series.
* install `psycopg2`: the standard library for connecting to postgresql from python.
* install `Flask` if you do not have it already: `sudo pip install Flask` or see http://flask.pocoo.org/
* check the `app.cfg` contents: is everything ok (database connection, logfile location)? If not, modify. 
* check that the logfile defined in `app.cfg` (default `/tmp/reactsdblog.txt`)
  is writable by everybody. If `/tmp/reactsdblog.txt` does not exist, do
```
sudo mkdir /tmp/reactsdblog.txt
sudo chmod a+rw /tmp/reactsdblog.txt
```  
* for development/debugging run the flask app, like this:
```
        ./run.sh
```
or equivalently as
```
        export FLASK_APP=app.py
        export FLASK_DEBUG=1  # optional
        flask run
```
You should now have the api tool running as as a flask app at
```
    http://127.0.0.1:5000/api
```
The input and output formats are as described in the `doc/rest-api` folder.

* For production, put the flask wsgi app behind a full-fledged web server like Apache.



