import os
import sys
sys.path.insert(0, '/opt/reactsdb/server')

if 'PYTHON_DEBUG' in os.environ:
    import pydevd
    params = os.environ['PYTHON_DEBUG'].split(':')
    pydevd.settrace(params[0], port=int(params[1]), stdoutToServer=True, stderrToServer=True)

from app import app as application
