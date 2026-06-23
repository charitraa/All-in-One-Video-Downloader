# Deploying from a home machine via Cloudflare Tunnel

## Why this setup

A YouTube downloader needs to make its requests from a **residential IP** with
**valid cookies from that same IP**. Datacenter hosts (free PythonAnywhere,
most VPS/PaaS) get hit with *"Sign in to confirm you're not a bot"* because
YouTube flags their IP ranges — no code or cookie change fixes that on a
flagged IP. (Free PythonAnywhere is worse still: it blocks the outbound traffic
entirely, so it can never work.)

Running the backend on your **home machine** solves this for free: your home
internet is a residential IP YouTube trusts. A **Cloudflare Tunnel** then gives
that machine a public HTTPS URL your Netlify frontend can call — no port
forwarding, no static IP needed.

```
Visitor (any IP, anywhere)
   │  HTTPS to the public tunnel URL
   ▼
Cloudflare Tunnel ──► your home machine (gunicorn + Django)
                          │  yt-dlp + cookies.txt + your home IP
                          ▼
                       YouTube  ✅ (IP + cookies match → no bot check)
```

Only this machine ever talks to YouTube. Visitors never do — their IP, cookies,
and login status are irrelevant.

## Trade-offs (read before relying on it)

- **Your machine must stay on** — if it sleeps/shuts down, the site is down.
- **Every download uses *your* cookies/account.** Use a **throwaway Google
  account** for `cookies.txt`, never your personal one — heavy use can get the
  account rate-limited or locked.
- **Your home bandwidth is the bottleneck.** Fine for personal/demo use; not a
  public-scale service.
- Consider adding rate limiting before sharing the link publicly.

---

## 1. One-time setup

Install the prerequisites (`ffmpeg`, `node`, and `cloudflared`) and the Python
deps:

```bash
cd All-in-One-Video-Downloader
python -m venv env && source env/bin/activate
pip install -r requirements.txt
python manage.py migrate
```

- `ffmpeg` — merges separate video/audio streams into mp4.
- `node` — required by `yt-dlp-ejs` to solve YouTube's JS challenges.
- `cloudflared` — https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/

## 2. Export fresh cookies (the part that actually matters)

1. Open a **private/incognito window** on this machine.
2. Log into a **throwaway** Google account and open YouTube.
3. Export cookies in **Netscape format** to `cookies.txt` in the project root
   (e.g. the "Get cookies.txt LOCALLY" browser extension).
4. **Close the incognito window immediately** without browsing further — this
   stops YouTube from rotating the session and invalidating the export.

Re-export whenever downloads start failing again. This is the only recurring
maintenance.

## 3. Configure `.env`

```bash
cp .env.example .env
python -c "import secrets; print(secrets.token_urlsafe(64))"   # paste into DJANGO_SECRET_KEY
```

Set in `.env`:

```ini
DJANGO_SECRET_KEY=<generated value>
DJANGO_DEBUG=0
DJANGO_ALLOWED_HOSTS=.trycloudflare.com
DJANGO_CORS_ALLOWED_ORIGINS=https://video-master.netlify.app
DJANGO_CSRF_TRUSTED_ORIGINS=https://*.trycloudflare.com
# YTDLP_PROXY stays EMPTY — you're on a residential IP, no proxy needed
```

The `.trycloudflare.com` wildcard means you don't have to edit `.env` each time
the quick-tunnel URL changes.

## 4. Run it

```bash
./scripts/serve-tunnel.sh
```

This launches gunicorn (with worker timeouts disabled, since downloads are slow)
and the Cloudflare Tunnel together. It prints a URL like:

```
https://random-words.trycloudflare.com
```

Ctrl-C stops both.

## 5. Point the frontend at the tunnel

On the `frontend` branch / Netlify, set the API base URL to the printed tunnel
URL (so it calls `https://random-words.trycloudflare.com/download/youtube/`) and
redeploy. Verify end-to-end from `https://video-master.netlify.app`.

> The quick `trycloudflare` URL changes on every restart. For a stable URL,
> create a free Cloudflare account and a **named tunnel**
> (`cloudflared tunnel create`) bound to a subdomain you own, then set
> `DJANGO_ALLOWED_HOSTS`/`DJANGO_CSRF_TRUSTED_ORIGINS` to that hostname and the
> frontend to it once.

## Troubleshooting

- **Still getting the bot check** → cookies are stale or were exported from a
  different network. Re-do step 2 *on this machine*.
- **400 Bad Request / DisallowedHost** → the tunnel hostname isn't in
  `DJANGO_ALLOWED_HOSTS` (named tunnel: add your exact hostname).
- **CORS error in the browser console** → frontend origin missing from
  `DJANGO_CORS_ALLOWED_ORIGINS`.
- **Download cut off after ~30s** → you're not using `serve-tunnel.sh`; plain
  gunicorn defaults to a 30s worker timeout. The script passes `--timeout 0`.
