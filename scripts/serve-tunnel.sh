#!/usr/bin/env bash
#
# Serve the Django backend from a home/residential machine and expose it
# publicly through a Cloudflare Tunnel. Because yt-dlp runs on this machine's
# residential IP (with cookies.txt exported from the same network), YouTube
# trusts the requests and the "Sign in to confirm you're not a bot" wall does
# not trigger. Visitors hit the public tunnel URL; only this machine ever
# talks to YouTube. See DEPLOY_HOME_TUNNEL.md for the full runbook.
#
# Usage:  ./scripts/serve-tunnel.sh
# Stop:   Ctrl-C  (kills both gunicorn and cloudflared)

set -euo pipefail

# Resolve project root (parent of this script's directory) and move there so
# relative paths (env/, .env, cookies.txt) resolve regardless of CWD.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

BIND="${BIND:-127.0.0.1:8000}"

# --- preflight checks --------------------------------------------------------
if [[ ! -d env ]]; then
  echo "error: virtualenv 'env/' not found. Run: python -m venv env && source env/bin/activate && pip install -r requirements.txt" >&2
  exit 1
fi
# shellcheck disable=SC1091
source env/bin/activate

for bin in cloudflared ffmpeg node; do
  if ! command -v "$bin" >/dev/null 2>&1; then
    echo "error: '$bin' is not on PATH." >&2
    [[ "$bin" == cloudflared ]] && echo "  install: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/" >&2
    [[ "$bin" == ffmpeg ]] && echo "  ffmpeg is required to merge video+audio streams." >&2
    [[ "$bin" == node ]] && echo "  node is required by yt-dlp-ejs to solve YouTube's JS challenges." >&2
    exit 1
  fi
done

if [[ ! -f cookies.txt && -z "${DJANGO_COOKIES_FILE:-}" ]]; then
  echo "warning: cookies.txt not found and DJANGO_COOKIES_FILE is unset." >&2
  echo "         YouTube downloads will hit the bot-check without valid cookies." >&2
fi

# --- launch ------------------------------------------------------------------
# --timeout 0 disables gunicorn's worker timeout: yt-dlp downloads + ffmpeg
# merges can easily exceed the 30s default, which would otherwise kill the
# request mid-download. Threads let multiple visitors download concurrently.
echo ">> starting gunicorn on $BIND"
gunicorn Video.wsgi:application \
  --bind "$BIND" \
  --workers "${WEB_WORKERS:-2}" \
  --threads "${WEB_THREADS:-4}" \
  --timeout 0 &
GUNICORN_PID=$!

# Ensure gunicorn dies when this script exits (Ctrl-C, cloudflared exit, error).
cleanup() {
  echo ""
  echo ">> shutting down"
  kill "$GUNICORN_PID" 2>/dev/null || true
  wait "$GUNICORN_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo ">> starting Cloudflare Tunnel -> http://$BIND"
echo ">> copy the printed https://<random>.trycloudflare.com URL into your frontend's API base."
echo ">> (DJANGO_ALLOWED_HOSTS=.trycloudflare.com already accepts any quick-tunnel subdomain)"
cloudflared tunnel run videomaster
