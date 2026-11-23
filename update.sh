#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
if [[ ! -f wrangler.jsonc ]]; then
  echo "Run ./deploy.sh first on this checkout." >&2
  exit 1
fi
if [[ -n $(git status --porcelain) ]]; then
  echo "Commit or stash local changes before updating." >&2
  exit 1
fi

git pull --ff-only
npm ci
whoami_output=$(npx wrangler whoami 2>&1)
if [[ $whoami_output == *"not authenticated"* ]]; then
  npx wrangler login --device --browser=false
fi
domain=$(node -e 'process.stdout.write(JSON.parse(require("node:fs").readFileSync("wrangler.jsonc", "utf8")).routes[0].pattern)')
export SITE_URL="https://$domain"
npm run build
npm run test:seo
npm run test:smoke
npx wrangler d1 migrations apply DB --remote --config wrangler.jsonc
npx wrangler deploy --config wrangler.jsonc

mkdir -p .local
check_file=$(mktemp .local/g7x-check.XXXXXX)
trap 'rm -f "$check_file"' EXIT
for attempt in {1..12}; do
  if curl -fsS --max-time 10 "https://$domain/" -o "$check_file" && grep -q '<title>G7X Studios</title>' "$check_file" && curl -fsS --max-time 10 "https://$domain/api/availability" | grep -q '"booked"'; then
    echo "Updated site, HTTPS, and booking availability verified at https://$domain/"
    exit 0
  fi
  sleep 10
done
echo "Update deployed, but live HTTPS verification has not passed. Check Cloudflare Custom Domain status." >&2
exit 1
