# G7X Studios landing page

A Next.js 16 landing page for G7X Studios. It includes responsive service and concept sections plus a contact form. Concept cards are illustrative until real project details are supplied.

## Run locally

```bash
npm install
npm run dev
```

The development server previews the page at `http://localhost:3000`. The contact API is provided by the Sites Worker, so test form submissions against a deployed version or a local Worker preview rather than `next dev`.

## Build and verify

```bash
npm run db:generate
npm run build
npm run test:smoke
```

The build exports the Next.js page and bundles it into `dist/server/index.js` for Sites. The D1 schema and generated migration live in `db/` and `drizzle/`.

## Contact form setup

- Leads are stored in the Site's private D1 database with a UTC `created_at` timestamp and consent timestamp. The public site exposes no lead listing endpoint.
- `CONTACT_TO_EMAIL` is configured as `g7x@velfix.space` on the Site. To send notifications, set `RESEND_API_KEY` as a secret and `CONTACT_FROM_EMAIL` as an address on a verified sending domain in Sites settings, then redeploy. Until then, leads are saved and marked `not_configured` for email status.
- `RATE_LIMIT_SALT` is configured as a Site secret. The form also checks a honeypot field, requires consent, validates inputs, rejects cross-origin browser submissions, and limits submissions per hashed IP.
- Before replacing the concept cards with real projects, add actual client names, images, and outcomes with permission.
