# G7X Studios SEO Plan

Adapted from the technical, content, schema, and agency-planning checks in [Claude SEO](https://github.com/AgriciDaniel/claude-seo). Its Claude Code commands are not a Next.js dependency or a Codex plugin; this plan applies the useful checks directly to this repository. Baseline checked 23 November 2026 (IST).

## Current baseline

- The local export has one public landing page, a brand title, description, one H1, canonical URL, `ProfessionalService` JSON-LD, `robots.txt`, and a one-page sitemap. `/crm` has a noindex meta tag.
- The homepage, `/robots.txt`, and `/sitemap.xml` now return HTTP 200 over HTTPS. The earlier Cloudflare 525 blocker is resolved.
- Search Console URL Inspection confirms `https://g7xstudio.com/` **is indexed** and served over HTTPS. A public search may still favor the similarly named G7 Studios while the new G7X brand builds recognition. Search Console queries, real traffic, and field Core Web Vitals have not been measured.

## Priority 1 — Make the site crawlable

1. The homepage is indexed. Confirm the submitted sitemap status is **Success** and review **Performance → Search results** for branded queries such as `G7X Studios` and `g7xstudio.com`. Do not repeatedly request indexing of an unchanged page.
2. Verify both apex and `www` over HTTPS; redirect one host to `https://g7xstudio.com/` with a permanent redirect. The homepage, `/robots.txt`, and `/sitemap.xml` already return HTTP 200 over HTTPS. Keep `/crm` out of search.
3. After deploying changes, verify page source contains the title, description, canonical, H1, and JSON-LD without waiting for JavaScript. Run `npm run build && npm run test:seo` locally before deployment.

## Priority 2 — Publish useful service and project pages

The homepage currently has broad descriptions and three live project links. Add pages only when they can include distinct first-hand detail:

| Page | Search intent | Evidence to include |
| --- | --- | --- |
| `/website-design/` | Business website design | Discovery process, deliverables, design examples, typical questions |
| `/web-development/` | Next.js website development | Build process, responsive and performance approach, maintenance scope |
| `/work/formula-19/`, `/work/g7x/`, `/work/misty-meadows/` | Agency work and industry examples | Client-approved brief, role, screenshots, live link, measurable outcome only if verified |

Link these pages from the homepage, footer, and each relevant service page. Give each page its own descriptive title, summary, H1, canonical, and sitemap entry. Keep the homepage title **G7X Studios** as requested. Avoid location pages until the actual service areas and business location are confirmed.

## Priority 3 — Trust, performance, and measurement

- Add a short, factual About section or page naming the team and explaining the work process. Keep client testimonials and project claims tied to approval and evidence. Add a privacy notice covering the booking form's phone, email, and message data.
- Link to `https://g7xstudio.com/` from the studio's real, public business profiles and, where approved, client project credits. Use the exact name **G7X Studios** consistently. Do not create fake profiles or reviews to compete with the unrelated G7 Studios result.
- Measure the live mobile page in PageSpeed Insights and Search Console. Aim for Google's good thresholds: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1. The two large homepage PNG assets have been replaced by responsive WebP images locally; deploy and rerun the live audit before choosing the next performance fix.
- Track monthly Search Console impressions, clicks, queries, indexed pages, and branded versus service queries. Record appointment submissions separately; ranking gains matter only if they bring qualified enquiries.
- Review the sitemap and schema whenever pages are added. Structured data must match visible content. Do not add FAQ rich-result markup or an `llms.txt` file expecting a Google ranking benefit; Google's AI features use the same core SEO requirements.

## Review cadence

After launch: verify crawlability and submit the sitemap. At two weeks: check indexing and fix excluded pages. Monthly: compare search queries and bookings, improve one weak page using real project evidence, and rerun the technical and mobile checks.

## References

- [Cloudflare error 525](https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-5xx-errors/error-525/)
- [Google Search Console setup](https://developers.google.com/search/docs/monitor-debug/search-console-start)
- [Google Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals)
- [Google guidance for AI features](https://developers.google.com/search/docs/appearance/ai-features)
