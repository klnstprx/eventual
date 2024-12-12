from mangum import Mangum
from main import app

# Create the Mangum handler that will interface with Vercel
handler = Mangum(app)
