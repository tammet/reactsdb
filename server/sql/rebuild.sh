#!/usr/bin/env bash
# 
# Rebuild the database and insert testdata: run as the user postgres.
# Assumes database and user exist before: see createdb.sh for this.

# createdb.sh 
./createschema.sh
./privileges.sh
#./indexes.sh
./instestdata.sh
