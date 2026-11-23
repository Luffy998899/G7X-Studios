import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const base = process.env.TEST_PREVIEW_URL || "http://localhost:3001";
const secrets = JSON.parse(await readFile(process.env.TEST_PREVIEW_SECRETS || ".local/integration-test/preview-secrets.json", "utf8"));
const local = new Date(Date.now() + 330 * 60000);
local.setUTCHours(0, 0, 0, 0);
local.setUTCDate(local.getUTCDate() + 1);
while (local.getUTCDay() === 0 || local.getUTCDay() === 6) local.setUTCDate(local.getUTCDate() + 1);
const appointmentAt = new Date(local.getTime() + (660 - 330) * 60000).toISOString();
const payload = { name: "Local Preview Test", email: "preview@example.com", phone: "+91 98765 43210", company: "", service: "Website design", message: "Testing the complete appointment flow.", consent: "yes", website: "", appointmentAt };
const submit = () => fetch(base + "/api/contact", { method: "POST", headers: { Origin: base, "Content-Type": "application/json" }, body: JSON.stringify(payload) });

assert.equal((await fetch(base + "/")).status, 200);
assert.equal((await fetch(base + "/crm")).status, 200);
const booked = await submit();
assert.equal(booked.status, 201);
const result = await booked.json();
assert.equal(result.emailStatus, "not_configured");
assert.ok(result.appointmentId);
assert.equal((await submit()).status, 409);
assert.deepEqual((await (await fetch(base + "/api/availability")).json()).booked, [appointmentAt]);

const login = await fetch(base + "/api/admin/login", { method: "POST", headers: { Origin: base, "Content-Type": "application/json" }, body: JSON.stringify({ password: secrets.adminPassword }) });
assert.equal(login.status, 200);
const cookie = login.headers.get("set-cookie").split(";")[0];
const list = await fetch(base + "/api/admin/appointments", { headers: { Cookie: cookie } });
assert.equal(list.status, 200);
const appointment = (await list.json()).appointments[0];
assert.equal(appointment.id, result.appointmentId);
assert.equal(appointment.phone, payload.phone);
const complete = await fetch(base + `/api/admin/appointments/${result.appointmentId}/complete`, { method: "POST", headers: { Cookie: cookie, Origin: base } });
assert.equal(complete.status, 200);
assert.deepEqual((await (await fetch(base + "/api/availability")).json()).booked, []);
assert.equal((await submit()).status, 201);
console.log("Local preview passed: SQLite persistence, booking, duplicate rejection, admin completion, slot release, and rebooking.");
