# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

VideoMaster is an all-in-one video downloader: a Django REST Framework backend that wraps
`yt-dlp` to fetch videos from YouTube, Instagram, Facebook, Twitter/X, TikTok, and Reddit, plus a
separate Vite + React + TypeScript frontend.

## Commands

### Backend (Django, run from repo root)

```bash
python -m venv env && source env/bin/activate   # virtualenv lives in env/ (see .gitignore)
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver        # serves API at http://127.0.0.1:8000
python manage.py createsuperuser  # optional, for /admin
python manage.py test             # run all tests
python manage.py test youtube     # run one app's tests
```

`ffmpeg` must be on PATH — `yt-dlp` shells out to it to merge separate video/audio streams into mp4.

### Frontend (run from `downloads_video/`)

```bash
npm install
npm run dev      # vite dev server (default port 5173)
npm run build    # tsc -b && vite build
npm run lint     # eslint
```

## Architecture

### Backend: one Django app per platform

The Django project is `Video/` (settings, urls, wsgi/asgi). Each supported platform is its own Django
app — `youtube/`, `instagram/`, `facebook/`, `twitter/`, `tiktok/`, `reddit/` — and they are
near-identical clones:

- `views.py` — an `APIView` subclass with a single `post()` that validates the URL, runs `yt-dlp`
  into a temp location, and returns the file via `FileResponse(as_attachment=True)`, or a JSON
  `{"error": ...}` on failure.
- `serializers.py` — a `VideoDownloadSerializer` with one `url = serializers.URLField()`.
- `models.py` is empty (no persistence); the SQLite DB is only used by Django's built-in
  auth/admin/sessions tables.

There are **no per-app `urls.py` files**. All routing is centralized in `Video/urls.py`, which imports
each app's views and maps `POST /download/<platform>/`. When adding a platform, wire the route there.

Because the apps are duplicated, fixing a bug in the download/serve logic usually means applying the
same change across multiple `views.py` files. Note they are not perfectly consistent: `youtube/views.py`
is the most complete (uses `tempfile.mkdtemp()`, `merge_output_format`, post-merge mp4 path fixup, and
`cookiefile`), while the others use a simpler `outtmpl: '%(temp_filename)s'` pattern and hardcode the
output filename (e.g. `instagram_video.mp4`).

### Cookies

Authenticated/private content relies on a Netscape-format `cookies.txt` in the repo root. Only
`youtube/views.py` currently passes `'cookiefile': 'cookies.txt'` (a path relative to the server's
working directory) to `yt-dlp`; other apps don't, so they will fail on content requiring login.

### Frontend

`downloads_video/` is a minimal Vite/React/TS app. `src/main.tsx` → `App.tsx` →
`src/Router/Route.tsx`, which currently defines only the `/` route rendering `Home.tsx`. It is wired
with `react-router-dom` but otherwise mostly scaffolding.

### CORS

`Video/settings.py` sets `CORS_ALLOW_ALL_ORIGINS = True` (overriding the `CORS_ALLOWED_ORIGINS` list
above it). Tighten this for any non-local deployment.

## Important discrepancies to be aware of

The README/API.md are partly out of date or aspirational — trust the code over the docs:

- **`reddit` is missing from `INSTALLED_APPS`** in `Video/settings.py` even though its route is
  registered in `Video/urls.py`. Add it to `INSTALLED_APPS` if the Reddit endpoint misbehaves.
- The frontend directory is **`downloads_video/`**, not `downloads/` as the README says; the README
  also lists Material-UI, Tailwind, and Axios — none are actually installed. `package.json` lists a
  `axois` dependency (a typo/placeholder security package), not real `axios`.
- README claims React 18.3 / react-router 6.26 and a dev port of 3000; the actual stack is React 19 /
  react-router-dom 7 on Vite's default port 5173 (no port override in `vite.config.ts`).
- `DEBUG = True` and the dev `SECRET_KEY` are committed; `db.sqlite3` and `cookies.txt` are tracked in
  git. These are dev defaults, not production-safe.
