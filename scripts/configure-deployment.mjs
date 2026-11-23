import { writeFile } from "node:fs/promises";

const [domain, databaseId] = process.argv.slice(2);
if (!/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i.test(domain || "") || !/^[a-f0-9-]{36}$/i.test(databaseId || "")) {
  console.error("Usage: node scripts/configure-deployment.mjs <domain> <D1 database UUID>");
  process.exit(1);
}

const config = {
  name: "g7x-studios",
  main: "dist/cloudflare/index.js",
  compatibility_date: "2026-11-23",
  workers_dev: false,
  routes: [{ pattern: domain.toLowerCase(), custom_domain: true }],
  assets: {
    directory: "out",
    not_found_handling: "404-page",
    run_worker_first: ["/api/*"],
  },
  d1_databases: [{ binding: "DB", database_name: "g7x-studios-bookings", database_id: databaseId, migrations_dir: "drizzle" }],
};

await writeFile("wrangler.jsonc", JSON.stringify(config, null, 2) + "\n");
console.log(`Configured Cloudflare deployment for ${domain.toLowerCase()}.`);
