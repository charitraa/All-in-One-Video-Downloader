# PythonAnywhere WSGI configuration for VideoMaster.
#
# Copy the contents of this file into the WSGI file linked from your
# PythonAnywhere "Web" tab (e.g. /var/www/videomaster_pythonanywhere_com_wsgi.py).
#
# This setup reads secrets from the project's .env file (upload .env.production
# to the server as ".env"). settings.py loads it automatically via python-dotenv,
# so no secrets need to live in this file.

import sys

# --- Adjust if your repo lives elsewhere on the server ---
PROJECT_ROOT = '/home/videomaster/All-in-One-Video-Downloader'

if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'Video.settings'

# If you prefer NOT to upload a .env file, uncomment and set these instead:
# os.environ['DJANGO_SECRET_KEY'] = '<your-secret-key>'
# os.environ['DJANGO_DEBUG'] = '0'
# os.environ['DJANGO_ALLOWED_HOSTS'] = 'videomaster.pythonanywhere.com'
# os.environ['DJANGO_CORS_ALLOWED_ORIGINS'] = 'https://video-master.netlify.app'
# os.environ['DJANGO_CSRF_TRUSTED_ORIGINS'] = 'https://videomaster.pythonanywhere.com'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
