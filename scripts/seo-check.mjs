import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [home, crm, sitemap, robots] = await Promise.all([
  readFile("out/index.html", "utf8"),
  readFile("out/crm.html", "utf8"),
  readFile("out/sitemap.xml", "utf8"),
  readFile("out/robots.txt", "utf8"),
]);

const canonical = home.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
const sitemapUrl = sitemap.match(/<loc>([^<]+)<\/loc>/)?.[1];
const siteUrl = new URL(process.env.SITE_URL || "https://g7xstudio.com").origin;
assert.equal(new URL(canonical).href, `${siteUrl}/`);
assert.equal(new URL(sitemapUrl).href, new URL(canonical).href);
assert.match(home, /<title>G7X Studios<\/title>/);
assert.match(home, /<meta name="description" content="[^"]+"/);
assert.match(home, /<html[^>]+lang="en"/);
assert.match(home, /<h1\b/);
assert.match(home, /<script type="application\/ld\+json">/);
assert.match(crm, /<meta name="robots" content="noindex, nofollow"/);
assert.match(robots, /Disallow: \/crm/);
assert.ok(robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`));

console.log("SEO build check passed: canonical, sitemap, metadata, schema, language, and private CRM indexing.");
