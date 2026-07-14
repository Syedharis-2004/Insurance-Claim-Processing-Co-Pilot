import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from mangum import Mangum
from app.main import app

handler = Mangum(app)
