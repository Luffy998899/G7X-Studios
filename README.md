# G7X Studios landing page

A Next.js 16 landing page for G7X Studios with real project links, a three-step appointment form, and a private appointment manager.

## Run locally

```bash
npm install
npm run dev
```

The development server previews the page at `http://localhost:3000`. Booking and admin APIs are provided by the Worker, so submissions and sign-in require a Worker preview or deployment.

To test a complete booking locally, run `npm run preview:local` instead. This builds the site, serves the Worker at `http://localhost:3000`, applies migrations to a private `.local/bookings.sqlite` database, and prints a local-only CRM password. Stop any running `npm run dev` process before using the same port. No real email is sent in this preview; the thank-you screen reports that honestly.

## Build and verify

```bash
npm run db:generate
npm run build
npm run test:smoke
npm run test:seo
```

The build exports the Next.js page and bundles it into `dist/server/index.js` for Sites. The D1 schema and generated migration live in `db/` and `drizzle/`.
The SEO check verifies the exported homepage and private CRM metadata against the sitemap and robots file. See `SEO_PLAN.md` for the launch and content roadmap.

## Deploy to Cloudflare

Run `bash deploy.sh` in a terminal (Git Bash on Windows). It asks for the domain, a Resend API key, a verified Resend sender, and the owner notification inbox. The script installs dependencies, builds and checks the site, creates or reuses the D1 bookings database, applies pending migrations, deploys the Worker, and prints a newly generated private CRM password once. Save that password immediately. Credentials are sent as Worker secrets and are not committed. The local `wrangler.jsonc` stores only the domain and database ID and is ignored by Git.

On a remote VPS, the script uses Wrangler's device login when Cloudflare authentication is missing. Open the verification URL it prints on your own computer, enter its short code, and leave the VPS terminal running until Wrangler confirms login. The normal OAuth callback uses `localhost` on the browser's computer and can time out on a VPS. A `CLOUDFLARE_API_TOKEN` already set in the VPS environment is also supported by Wrangler and skips browser login.

The domain must already be an active zone in the Cloudflare account used by Wrangler. Remove any conflicting parked-site CNAME before attaching the Worker Custom Domain. Cloudflare creates DNS records and the HTTPS certificate for that Custom Domain; Certbot is not used because there is no separate origin server. The script checks HTTPS and booking availability before reporting success. Verify the sender domain in Resend first so customer and owner emails can actually be delivered.

For later releases, run `bash update.sh` from the same checkout. It requires a clean Git tree, pulls the latest commits, rebuilds, runs checks, applies only pending D1 migrations, and redeploys while preserving existing appointments and Worker secrets. If deploying from a new machine, run `bash deploy.sh` there to recreate its local config, using the same Cloudflare account and existing D1 database.

## Booking and admin setup

- Apply all migrations in `drizzle/` to D1 before using bookings. Active appointments have unique time slots. Completing an appointment in `/crm` releases its slot if the date is still bookable; the completed record remains.
- The form asks for a contact phone number, saves it privately with the appointment, and includes it in the owner notification and CRM. After booking, visitors can open a prefilled WhatsApp message to the owner. The WhatsApp link uses the owner's existing number in `src/app/contact-form.tsx` without displaying it as page text.
- Set `ADMIN_PASSWORD` and a separate, random `ADMIN_SESSION_SECRET` as Worker secrets. The CRM uses a signed, HttpOnly session cookie; its data endpoint requires authentication.
- Set `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` (a verified sender), and `CONTACT_TO_EMAIL` (`contact@g7xstudio.com`) to send structured customer confirmations and owner notifications. The booking response reports email delivery status; without these values, the time is saved but no email is sent.
- Set `RATE_LIMIT_SALT` as a secret. Submission and admin sign-in are rate limited. The form validates inputs, checks a honeypot, requires consent, and rejects cross-origin requests.
- Calls are available Monday–Friday at 11:00 AM, 4:30 PM, 6:30 PM, and 9:00 PM IST. Keep the times in `src/app/contact-form.tsx` and `worker/index.js` in sync when the schedule changes.

## Domain, search, and email

- The public page uses `https://g7xstudio.com/` as its canonical URL. `public/robots.txt` and `public/sitemap.xml` list only the landing page; `/crm` remains private and marked noindex. Update these URLs together if the preferred domain changes.
- Cloudflare Email Routing forwards `contact@g7xstudio.com` to the owner's verified Gmail destination. Send a message from a separate account to confirm the routing rule works end to end. The website and email templates now publish `contact@g7xstudio.com`.
- Customer confirmations require sending to arbitrary recipients. The Worker already integrates Resend's HTTP API; verify `g7xstudio.com` there, configure the three email secrets above, and book a test appointment to confirm both messages arrive. Cloudflare's free Email Routing handles incoming mail, but its arbitrary-recipient Email Sending requires Workers Paid.
