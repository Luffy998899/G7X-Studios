import { readFile, readdir, mkdir, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "out");
const distDir = path.join(root, "dist");
const assets = {};

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(absolute);
    else {
      const urlPath = "/" + path.relative(outDir, absolute).replaceAll(path.sep, "/");
      assets[urlPath] = (await readFile(absolute)).toString("base64");
    }
  }
}

if (process.env.SITE_URL) {
  const siteUrl = new URL(process.env.SITE_URL).origin;
  for (const name of ["robots.txt", "sitemap.xml"]) {
    const file = path.join(outDir, name);
    await writeFile(file, (await readFile(file, "utf8")).replaceAll("https://g7xstudio.com", siteUrl));
  }
}

await walk(outDir);
const source = await readFile(path.join(root, "worker", "index.js"), "utf8");
await mkdir(path.join(distDir, "server"), { recursive: true });
await mkdir(path.join(distDir, "cloudflare"), { recursive: true });
await mkdir(path.join(distDir, ".openai"), { recursive: true });
await writeFile(path.join(distDir, "server", "index.js"), source.replace("__ASSET_MAP__", JSON.stringify(assets)));
await writeFile(path.join(distDir, "cloudflare", "index.js"), source.replace("__ASSET_MAP__", "{}"));
await copyFile(path.join(root, ".openai", "hosting.json"), path.join(distDir, ".openai", "hosting.json"));
console.log(`Bundled ${Object.keys(assets).length} Next.js static assets into the Sites Worker.`);
