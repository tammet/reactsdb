# run webapi as a flask app
export FLASK_APP=app.py
export FLASK_ENV=development # remove this line for production
#export FLASK_DEBUG=1  # for debugging in older version of Flask
#flask run
python3 -m flask run
