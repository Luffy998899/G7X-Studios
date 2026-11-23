#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

read -r -p "Domain [g7xstudio.com]: " domain
domain=${domain:-g7xstudio.com}
domain=${domain,,}
if [[ ! $domain =~ ^[a-z0-9]([a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$ ]]; then
  echo "Enter a hostname such as g7xstudio.com (without https://)." >&2
  exit 1
fi

if [[ -f wrangler.jsonc ]]; then
  saved_domain=$(node -e 'process.stdout.write(JSON.parse(require("node:fs").readFileSync("wrangler.jsonc", "utf8")).routes[0].pattern)')
  if [[ $saved_domain != "$domain" ]]; then
    echo "This checkout is configured for $saved_domain. Use a fresh checkout for a different domain." >&2
    exit 1
  fi
fi

read -r -s -p "Resend API key: " resend_key
echo
if [[ -z $resend_key ]]; then
  echo "A Resend API key is required for booking confirmations." >&2
  exit 1
fi
read -r -p "Verified Resend sender [G7X Studios <bookings@$domain>]: " from_email
from_email=${from_email:-G7X Studios <bookings@$domain>}
read -r -p "Owner notification inbox [contact@$domain]: " to_email
to_email=${to_email:-contact@$domain}

export SITE_URL="https://$domain"
npm ci
npm run build
npm run test:seo
npm run test:smoke

whoami_output=$(npx wrangler whoami 2>&1)
if [[ $whoami_output == *"not authenticated"* ]]; then
  npx wrangler login --device --browser=false
fi

if [[ ! -f wrangler.jsonc ]]; then
  database_name=g7x-studios-bookings
  find_database() {
    npx wrangler d1 list --json | node -e 'let input=""; process.stdin.on("data", chunk => input += chunk); process.stdin.on("end", () => { const data=JSON.parse(input); const list=Array.isArray(data) ? data : data.result; const found=list.find(item => item.name === process.argv[1]); if (found) process.stdout.write(found.uuid || found.id); });' "$database_name"
  }
  database_id=$(find_database)
  if [[ -z $database_id ]]; then
    npx wrangler d1 create "$database_name" --location apac
    database_id=$(find_database)
  fi
  if [[ -z $database_id ]]; then
    echo "Could not find the new D1 database. No site was deployed." >&2
    exit 1
  fi
  node scripts/configure-deployment.mjs "$domain" "$database_id"
fi

npx wrangler d1 migrations apply DB --remote --config wrangler.jsonc

admin_password=$(node -e 'process.stdout.write(require("node:crypto").randomBytes(24).toString("base64url"))')
session_secret=$(node -e 'process.stdout.write(require("node:crypto").randomBytes(32).toString("hex"))')
rate_salt=$(node -e 'process.stdout.write(require("node:crypto").randomBytes(32).toString("hex"))')
mkdir -p .local
secret_file=$(mktemp .local/g7x-secrets.XXXXXX)
check_file=$(mktemp .local/g7x-check.XXXXXX)
trap 'rm -f "$secret_file" "$check_file"' EXIT
chmod 600 "$secret_file"
export RESEND_API_KEY="$resend_key" CONTACT_FROM_EMAIL="$from_email" CONTACT_TO_EMAIL="$to_email" ADMIN_PASSWORD="$admin_password" ADMIN_SESSION_SECRET="$session_secret" RATE_LIMIT_SALT="$rate_salt"
node -e 'const fs=require("node:fs"); const names=["RESEND_API_KEY","CONTACT_FROM_EMAIL","CONTACT_TO_EMAIL","ADMIN_PASSWORD","ADMIN_SESSION_SECRET","RATE_LIMIT_SALT"]; fs.writeFileSync(process.argv[1], JSON.stringify(Object.fromEntries(names.map(name => [name, process.env[name]]))), {mode:0o600});' "$secret_file"
unset resend_key session_secret rate_salt RESEND_API_KEY CONTACT_FROM_EMAIL CONTACT_TO_EMAIL ADMIN_PASSWORD ADMIN_SESSION_SECRET RATE_LIMIT_SALT

if ! npx wrangler deploy --config wrangler.jsonc --secrets-file "$secret_file"; then
  echo "Deployment did not finish. If Cloudflare reported DNS error 100117, remove the existing A, AAAA, or CNAME record for $domain in Cloudflare DNS, then rerun bash deploy.sh." >&2
  echo "Keep MX and TXT records, including email routing and Resend verification records. The existing D1 database and migrations will be reused." >&2
  exit 1
fi
echo "Private CRM password (save this now): $admin_password"
unset admin_password

for attempt in {1..12}; do
  if curl -fsS --max-time 10 "https://$domain/" -o "$check_file" && grep -q '<title>G7X Studios</title>' "$check_file" && curl -fsS --max-time 10 "https://$domain/api/availability" | grep -q '"booked"'; then
    echo "HTTPS and booking availability verified at https://$domain/"
    exit 0
  fi
  sleep 10
done
echo "Deployment finished, but HTTPS verification has not passed. Check the Custom Domain certificate and any conflicting DNS records in Cloudflare." >&2
exit 1
