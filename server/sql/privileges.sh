# reactsdb privileges creation

# should be run as a user postgres
# user and database should have been created before, see create.sh

psql reactsdb -f privileges.sql