# reactsdb database user and database creation

# should be run as a user postgres
# asks for password for reactor, use reactor124 for a password

createuser -P -e reactor
createdb -O reactor -E 'UTF8' -l 'en_US.utf8' -T template0 reactsdb



