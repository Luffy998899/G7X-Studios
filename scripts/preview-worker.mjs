import { createServer } from "node:http";
import { DatabaseSync } from "node:sqlite";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import worker from "../dist/server/index.js";

const root = process.cwd();
const localDir = process.env.LOCAL_DATA_DIR ? path.resolve(process.env.LOCAL_DATA_DIR) : path.join(root, ".local");
const port = Number(process.env.PORT || 3000);
await mkdir(localDir, { recursive: true });

const database = new DatabaseSync(path.join(localDir, "bookings.sqlite"));
database.exec("PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;");
database.exec("CREATE TABLE IF NOT EXISTS local_migrations (name TEXT PRIMARY KEY)");
for (const name of (await readdir(path.join(root, "drizzle"))).filter(name => /^\d+_.*\.sql$/.test(name)).sort()) {
  if (database.prepare("SELECT name FROM local_migrations WHERE name = ?").get(name)) continue;
  const sql = await readFile(path.join(root, "drizzle", name), "utf8");
  database.exec("BEGIN");
  try {
    for (const statement of sql.split("--> statement-breakpoint").map(part => part.trim()).filter(Boolean)) database.exec(statement);
    database.prepare("INSERT INTO local_migrations (name) VALUES (?)").run(name);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

const db = {
  prepare(sql) {
    let statement = database.prepare(sql);
    let args = [];
    return {
      bind(...values) { args = values; return this; },
      async first() { return statement.get(...args) || null; },
      async all() { return { results: statement.all(...args) }; },
      async run() { const result = statement.run(...args); return { meta: { changes: Number(result.changes) } }; },
    };
  },
};

const secretsPath = path.join(localDir, "preview-secrets.json");
let secrets;
try { secrets = JSON.parse(await readFile(secretsPath, "utf8")); }
catch {
  secrets = {
    adminPassword: randomBytes(18).toString("base64url"),
    sessionSecret: randomBytes(32).toString("hex"),
    rateSalt: randomBytes(32).toString("hex"),
  };
  await writeFile(secretsPath, JSON.stringify(secrets, null, 2), { mode: 0o600 });
}
const env = {
  DB: db,
  ADMIN_PASSWORD: secrets.adminPassword,
  ADMIN_SESSION_SECRET: secrets.sessionSecret,
  RATE_LIMIT_SALT: secrets.rateSalt,
};
const ctx = { waitUntil(promise) { promise.catch(error => console.error("Background task failed:", error)); } };

const server = createServer(async (incoming, outgoing) => {
  const url = new URL(incoming.url || "/", `http://localhost:${port}`);
  const headers = new Headers();
  for (const [key, value] of Object.entries(incoming.headers)) {
    if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(", ") : value);
  }
  headers.set("CF-Connecting-IP", incoming.socket.remoteAddress || "local");
  const chunks = [];
  for await (const chunk of incoming) chunks.push(chunk);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;
  try {
    const request = new Request(url, { method: incoming.method, headers, body });
    const response = await worker.fetch(request, env, ctx);
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    outgoing.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error("Local preview request failed:", error);
    outgoing.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    outgoing.end("Local preview error");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`G7X booking preview: http://localhost:${port}/#contact`);
  console.log(`Private appointment manager: http://localhost:${port}/crm`);
  console.log(`Local admin password: ${secrets.adminPassword}`);
  console.log("Bookings persist in .local/bookings.sqlite. Email delivery is not configured in the local preview.");
});
