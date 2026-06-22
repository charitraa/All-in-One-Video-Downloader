# Deploying to PythonAnywhere

## ⚠️ Read this first: outbound network

yt-dlp must reach YouTube/Instagram/Facebook/etc. **PythonAnywhere free accounts
block all outbound internet except a small whitelist**, so downloads will fail on
a free plan. A **paid** plan (which lifts the proxy whitelist) is required for this
app to actually fetch videos.

## 1. Get the code on the server

In a Bash console:

```bash
git clone <your-repo-url> All-in-One-Video-Downloader
cd All-in-One-Video-Downloader
python -m venv env
source env/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser   # optional, for /admin
```

`ffmpeg` and `node` are already on PATH on PythonAnywhere (yt-dlp needs ffmpeg to
merge video+audio, and node to solve YouTube's JS challenges).

## 2. Web tab → add a new web app

- **Manual configuration** (not the Django wizard), matching your Python version.
- **Virtualenv:** `/home/<user>/All-in-One-Video-Downloader/env`
- **Source code / working dir:** `/home/<user>/All-in-One-Video-Downloader`
- **Static files:** map URL `/static/` → `/home/<user>/All-in-One-Video-Downloader/staticfiles`

## 3. WSGI file

Two options:

**A — use a `.env` file (recommended).** Upload `.env.production` to the project
root on the server, renamed to `.env`. Then the WSGI file only needs the path:

```python
import os
import sys

path = '/home/videomaster/All-in-One-Video-Downloader'
if path not in sys.path:
    sys.path.insert(0, path)

os.environ['DJANGO_SETTINGS_MODULE'] = 'Video.settings'
# settings.py loads /.env automatically via python-dotenv.

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

A ready-to-copy version of this file lives at `pythonanywhere_wsgi.py` in the repo.

**B — put the variables in the WSGI file** (no `.env` upload):

```python
os.environ['DJANGO_SETTINGS_MODULE'] = 'Video.settings'
os.environ['DJANGO_SECRET_KEY'] = '<a long random value>'
os.environ['DJANGO_DEBUG'] = '0'
os.environ['DJANGO_ALLOWED_HOSTS'] = 'videomaster.pythonanywhere.com'
os.environ['DJANGO_CSRF_TRUSTED_ORIGINS'] = 'https://videomaster.pythonanywhere.com'
os.environ['DJANGO_CORS_ALLOWED_ORIGINS'] = 'https://video-master.netlify.app'
```

Generate a secret key with:
`python -c "import secrets; print(secrets.token_urlsafe(64))"`

## 4. Cookies (for private/authenticated content)

`cookies.txt` is **not** in git (it holds live session cookies). Upload a fresh
Netscape-format `cookies.txt` to the project root on the server, or point
`DJANGO_COOKIES_FILE` at another path. YouTube/Instagram/Facebook use it; Twitter,
TikTok, and Reddit work without it for public content.

## 5. Reload

Hit **Reload** in the Web tab after any change. Verify with:

```bash
DJANGO_ALLOWED_HOSTS=videomaster.pythonanywhere.com python manage.py check --deploy
```

It should report **no issues**.
