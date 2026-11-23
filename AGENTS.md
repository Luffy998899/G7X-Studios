# Repository Guidelines

> Whatever Action You Can Do Yourself , Please Do yourself , this includes starting apps and verification

## Project Structure & Module Organization

`src/app/` contains the landing page (`page.tsx`), stepped booking form (`contact-form.tsx`), shared footer (`site-footer.tsx`), branded 404 page (`not-found.tsx`), private appointment manager (`crm/`), root layout, and CSS. `worker/index.js` serves the static export, exposes available booking times, and handles submissions and admin actions. The D1 schema lives in `db/schema.ts`, with generated migrations in `drizzle/`. Build and smoke-test scripts are in `scripts/`. Do not edit generated `.next/`, `out/`, or `dist/` files.

## Build, Test, and Development Commands

- `npm install`: install dependencies.
- `npm run dev`: preview the page at `http://localhost:3000`. Form submissions require the Sites Worker; they do not run in this dev server.
- `npm run preview:local`: build and run the Worker with a private local SQLite database at `http://localhost:3000` for booking and CRM testing. Stop `npm run dev` first.
- `npm run typecheck`: check TypeScript.
- `npm run build`: export Next.js and bundle `dist/server/index.js`.
- `npm run test:smoke`: verify the built Worker and booking flow.
- `npm run db:generate`: generate SQL after editing `db/schema.ts`; review and commit the migration.
- `bash deploy.sh`: configure the first Cloudflare deployment and its private secrets.
- `bash update.sh`: pull committed changes, apply pending migrations, and redeploy.

## Coding Style & Naming Conventions

Use two-space indentation and TypeScript for Next.js components. Name components in PascalCase and functions in camelCase. Follow Next.js route names such as `page.tsx` and `layout.tsx`. Use semantic HTML and labeled form controls. No formatter or linter is configured; match nearby code and run the build.

## Testing Guidelines

There is no coverage target or dedicated test framework. Add focused checks to `scripts/smoke-test.mjs` for Worker or contact changes. Run `npm run build` before the smoke test, which imports the generated Worker. Review desktop and mobile layouts for visual changes.

## Commit & Pull Request Guidelines

The single existing commit does not establish a convention. Write short, imperative subjects, such as `Improve contact validation`. Pull requests should summarize the change, list checks run, include screenshots for UI changes, and flag schema or visitor-data changes.

## Security & Configuration

Keep credentials out of Git. `deploy.sh` sends `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`, `RATE_LIMIT_SALT`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` as Cloudflare Worker secrets. CRM data requires an authenticated admin session; the public availability endpoint returns times only, never visitor details. Booking hours are Monday–Friday at 11:00 AM, 4:30 PM, 6:30 PM, and 9:00 PM IST.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
