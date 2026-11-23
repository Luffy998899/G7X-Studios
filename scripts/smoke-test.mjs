import assert from "node:assert/strict";
import worker from "../dist/server/index.js";

const leads = [];
const limits = new Map();
const db = {
  prepare(sql) {
    let values = [];
    return {
      bind(...args) { values = args; return this; },
      async first() {
        if (sql.startsWith("SELECT window_start")) return limits.get(values[0]) || null;
        throw new Error(`Unexpected query: ${sql}`);
      },
      async all() {
        if (sql.startsWith("SELECT appointment_at")) return { results: leads.filter(lead => lead.status === "booked" && lead.appointment_at && lead.appointment_at >= values[0] && lead.appointment_at <= values[1]).map(lead => ({ appointment_at: lead.appointment_at })) };
        if (sql.startsWith("SELECT id, created_at")) return { results: [...leads].reverse() };
        throw new Error(`Unexpected query: ${sql}`);
      },
      async run() {
        if (sql.startsWith("INSERT INTO submission_limits")) limits.set(values[0], { window_start: values[1], count: 1 });
        else if (sql.startsWith("UPDATE submission_limits")) limits.get(values[0]).count++;
        else if (sql.startsWith("INSERT INTO leads")) {
          if (leads.some(lead => lead.status === "booked" && lead.appointment_at === values[10])) throw new Error("UNIQUE constraint failed: leads.appointment_at");
          leads.push({ id: values[0], created_at: values[1], name: values[2], email: values[3], phone: values[4], service: values[6], message: values[7], consent_at: values[8], notification_status: values[9], appointment_at: values[10], status: values[11], completed_at: null });
        }
        else if (sql.startsWith("UPDATE leads SET notification_status")) leads.find(lead => lead.id === values[1]).notification_status = values[0];
        else if (sql.startsWith("UPDATE leads SET status")) {
          const lead = leads.find(lead => lead.id === values[1] && lead.status === "booked");
          if (!lead) return { meta: { changes: 0 } };
          lead.status = "completed"; lead.completed_at = values[0];
          return { meta: { changes: 1 } };
        }
        else throw new Error(`Unexpected query: ${sql}`);
      },
    };
  },
};
const env = { DB: db, RATE_LIMIT_SALT: "test-salt", ADMIN_PASSWORD: "test-admin-password", ADMIN_SESSION_SECRET: "test-session-secret" };
const ctx = { waitUntil() {} };
const url = "https://g7x.example/api/contact";
function nextWeekday(daysAhead = 1) {
  const value = new Date(Date.now() + 330 * 60000);
  value.setUTCHours(0, 0, 0, 0);
  value.setUTCDate(value.getUTCDate() + daysAhead);
  while (value.getUTCDay() === 0 || value.getUTCDay() === 6) value.setUTCDate(value.getUTCDate() + 1);
  return new Date(value.getTime() + (660 - 330) * 60000).toISOString();
}
const appointmentAt = nextWeekday();
const secondAppointmentAt = new Date(Date.parse(appointmentAt) + (990 - 660) * 60000).toISOString();
const body = { name: "Test Visitor", email: "VISITOR@example.com", phone: "+91 98765 43210", company: "Test Co", service: "Website design", message: "I need a new website for my business.", consent: "yes", website: "", appointmentAt };
const submit = (payload, targetEnv = env) => worker.fetch(new Request(url, { method: "POST", headers: { Origin: "https://g7x.example", "Content-Type": "application/json" }, body: JSON.stringify(payload) }), targetEnv, ctx);

const home = await worker.fetch(new Request("https://g7x.example/"), env, ctx);
assert.equal(home.status, 200);
assert.match(await home.text(), /G7X Studios/);
const missingPage = await worker.fetch(new Request("https://g7x.example/contact-us"), env, ctx);
assert.equal(missingPage.status, 404);
assert.match(await missingPage.text(), /This page/);
assert.equal((await worker.fetch(new Request("https://g7x.example/start-project"), env, ctx)).status, 404);
assert.equal((await worker.fetch(new Request("https://g7x.example/crm"), env, ctx)).status, 200);
assert.equal((await worker.fetch(new Request("https://g7x.example/api/availability"), env, ctx)).status, 200);
assert.equal((await submit({ ...body, email: "bad" })).status, 400);
assert.equal((await submit({ ...body, phone: "abc" })).status, 400);
assert.equal((await submit({ ...body, projectTypes: ["Unsupported service"] })).status, 400);
assert.equal((await submit({ ...body, appointmentAt: new Date(Date.now() - 60000).toISOString() })).status, 400);
assert.equal((await submit({ ...body, appointmentAt: new Date(Date.parse(appointmentAt) - 60 * 60000).toISOString() })).status, 400);
assert.equal((await submit({ ...body, appointmentAt: new Date(Date.parse(appointmentAt) + 30 * 60000).toISOString() })).status, 400);
assert.equal((await submit(body)).status, 201);
assert.equal((await submit(body)).status, 409);
assert.equal((await submit({ ...body, appointmentAt: secondAppointmentAt, projectTypes: ["Website design", "Web app"] })).status, 201);
assert.equal(leads.length, 2);
assert.equal(leads[0].email, "visitor@example.com");
assert.equal(leads[0].phone, "+91 98765 43210");
assert.equal(leads[1].service, "Website design, Web app");
assert.match(leads[0].created_at, /^\d{4}-\d{2}-\d{2}T.*Z$/);
assert.equal(leads[0].consent_at, leads[0].created_at);
assert.equal(leads[0].notification_status, "not_configured");
assert.equal(leads[0].appointment_at, appointmentAt);
const availability = await worker.fetch(new Request("https://g7x.example/api/availability"), env, ctx);
assert.deepEqual((await availability.json()).booked.sort(), [appointmentAt, secondAppointmentAt].sort());
const adminUrl = "https://g7x.example/api/admin";
assert.equal((await worker.fetch(new Request(adminUrl + "/appointments"), env, ctx)).status, 401);
assert.equal((await worker.fetch(new Request(adminUrl + "/login", { method: "POST", headers: { Origin: "https://evil.example", "Content-Type": "application/json" }, body: JSON.stringify({ password: env.ADMIN_PASSWORD }) }), env, ctx)).status, 403);
assert.equal((await worker.fetch(new Request(adminUrl + "/login", { method: "POST", headers: { Origin: "https://g7x.example", "Content-Type": "application/json" }, body: JSON.stringify({ password: "wrong" }) }), env, ctx)).status, 401);
const login = await worker.fetch(new Request(adminUrl + "/login", { method: "POST", headers: { Origin: "https://g7x.example", "Content-Type": "application/json" }, body: JSON.stringify({ password: env.ADMIN_PASSWORD }) }), env, ctx);
assert.equal(login.status, 200);
const cookie = login.headers.get("Set-Cookie").split(";")[0];
assert.equal((await worker.fetch(new Request(adminUrl + "/appointments", { headers: { Cookie: cookie + "tampered" } }), env, ctx)).status, 401);
const adminRequest = (path, method = "GET") => worker.fetch(new Request(adminUrl + path, { method, headers: { Cookie: cookie, Origin: "https://g7x.example" } }), env, ctx);
assert.equal((await adminRequest("/session")).status, 200);
const adminList = await adminRequest("/appointments");
assert.equal((await adminList.json()).appointments.length, 2);
assert.equal((await adminRequest(`/appointments/${leads[0].id}/complete`, "POST")).status, 200);
assert.equal(leads[0].status, "completed");
const afterComplete = await worker.fetch(new Request("https://g7x.example/api/availability"), env, ctx);
assert.deepEqual((await afterComplete.json()).booked, [secondAppointmentAt]);
assert.equal((await submit(body)).status, 201);
assert.equal(leads[2].appointment_at, appointmentAt);
assert.equal(leads[0].status, "completed");

const sentEmails = [];
const originalFetch = globalThis.fetch;
globalThis.fetch = async (_url, options) => { sentEmails.push(JSON.parse(options.body)); return new Response("{}", { status: 200 }); };
try {
  const emailEnv = { ...env, RESEND_API_KEY: "test-key", CONTACT_FROM_EMAIL: "hello@g7x.example", CONTACT_TO_EMAIL: "owner@g7x.example" };
  const emailSlot = new Date(Date.parse(appointmentAt) + (1260 - 660) * 60000).toISOString();
  const response = await submit({ ...body, appointmentAt: emailSlot }, emailEnv);
  assert.equal(response.status, 201);
  assert.equal((await response.json()).emailStatus, "sent");
  assert.equal(sentEmails.length, 2);
  assert.deepEqual(sentEmails.map(email => email.to[0]), ["visitor@example.com", "owner@g7x.example"]);
  assert.match(sentEmails[0].html, /Your appointment is booked/);
assert.match(sentEmails[1].html, /Phone/);
assert.match(sentEmails[1].text, /Phone: \+91 98765 43210/);
  assert.match(sentEmails[0].text, /Date and time:.*IST/);
  assert.match(sentEmails[0].html, /Project note/);
} finally { globalThis.fetch = originalFetch; }
assert.equal((await submit(body)).status, 429);
console.log("Worker smoke test passed: booking, structured email, private CRM, completion and slot release, validation, timestamps, and rate limits.");
