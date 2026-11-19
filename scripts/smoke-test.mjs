import assert from "node:assert/strict";
import worker from "../dist/server/index.js";

const leads = [];
const limits = new Map();
const pending = [];
const db = {
  prepare(sql) {
    let values = [];
    return {
      bind(...args) { values = args; return this; },
      async first() {
        if (sql.startsWith("SELECT window_start")) return limits.get(values[0]) || null;
        throw new Error(`Unexpected query: ${sql}`);
      },
      async run() {
        if (sql.startsWith("INSERT INTO submission_limits")) limits.set(values[0], { window_start: values[1], count: 1 });
        else if (sql.startsWith("UPDATE submission_limits")) limits.get(values[0]).count++;
        else if (sql.startsWith("INSERT INTO leads")) leads.push({ id: values[0], created_at: values[1], name: values[2], email: values[3], message: values[6], consent_at: values[7], notification_status: values[8] });
        else if (sql.startsWith("UPDATE leads")) leads.find(lead => lead.id === values[1]).notification_status = values[0];
        else throw new Error(`Unexpected query: ${sql}`);
      },
    };
  },
};
const env = { DB: db, RATE_LIMIT_SALT: "test-salt" };
const ctx = { waitUntil(promise) { pending.push(promise); } };
const url = "https://g7x.example/api/contact";
const body = { name: "Test Visitor", email: "VISITOR@example.com", company: "Test Co", service: "Website design", message: "I need a new website for my business.", consent: "yes", website: "" };
const submit = payload => worker.fetch(new Request(url, { method: "POST", headers: { Origin: "https://g7x.example", "Content-Type": "application/json" }, body: JSON.stringify(payload) }), env, ctx);

const home = await worker.fetch(new Request("https://g7x.example/"), env, ctx);
assert.equal(home.status, 200);
assert.match(await home.text(), /G7X Studios/);
assert.equal((await submit({ ...body, email: "bad" })).status, 400);
assert.equal((await submit(body)).status, 201);
await Promise.all(pending);
assert.equal(leads.length, 1);
assert.equal(leads[0].email, "visitor@example.com");
assert.match(leads[0].created_at, /^\d{4}-\d{2}-\d{2}T.*Z$/);
assert.equal(leads[0].consent_at, leads[0].created_at);
assert.equal(leads[0].notification_status, "not_configured");
for (let i = 0; i < 4; i++) assert.equal((await submit(body)).status, 201);
assert.equal((await submit(body)).status, 429);
console.log("Worker smoke test passed: static page, validation, lead storage, UTC timestamp, notification state, and rate limit.");
