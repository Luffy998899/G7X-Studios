const ASSETS = __ASSET_MAP__;
const APPOINTMENT_MINUTES = [660, 990, 1110, 1260];

const MIME = {
  html: "text/html; charset=utf-8", css: "text/css; charset=utf-8", js: "text/javascript; charset=utf-8",
  json: "application/json; charset=utf-8", svg: "image/svg+xml", png: "image/png", jpg: "image/jpeg",
  jpeg: "image/jpeg", webp: "image/webp", ico: "image/x-icon", woff2: "font/woff2", txt: "text/plain; charset=utf-8",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}

function clean(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

async function hashIp(ip, salt) {
  const bytes = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function emailHtml({ heading, intro, rows, message, footnote }) {
  const rowHtml = rows.map(([label, value]) => `<tr><td style="padding:11px 0;color:#66766b;font-size:13px;vertical-align:top;width:130px">${escapeHtml(label)}</td><td style="padding:11px 0;color:#202b28;font-size:14px;font-weight:600">${escapeHtml(value)}</td></tr>`).join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head><body style="margin:0;padding:32px 16px;background:#f0f2ed;font-family:Arial,sans-serif;color:#202b28"><div style="max-width:600px;margin:auto;background:#fff;border:1px solid #d9e1d8"><div style="padding:24px 32px;background:#202b28;color:#fff;font-size:17px;font-weight:700;letter-spacing:1px">G7X STUDIOS</div><div style="padding:32px"><h1 style="margin:0 0 14px;font-size:28px;line-height:1.15">${escapeHtml(heading)}</h1><p style="margin:0 0 28px;color:#526257;line-height:1.5">${escapeHtml(intro)}</p><table role="presentation" style="width:100%;border-collapse:collapse;border-top:1px solid #d9e1d8;border-bottom:1px solid #d9e1d8">${rowHtml}</table>${message ? `<div style="margin-top:26px"><strong style="font-size:13px">Project note</strong><p style="white-space:pre-wrap;line-height:1.5;color:#526257">${escapeHtml(message)}</p></div>` : ""}<p style="margin:30px 0 0;color:#526257;line-height:1.5">${escapeHtml(footnote)}</p></div><div style="padding:20px 32px;background:#f6f3ed;font-size:12px;color:#66766b">G7X Studios · <a href="mailto:contact@g7xstudio.com" style="color:#2d5944">contact@g7xstudio.com</a></div></div></body></html>`;
}

async function notifyByEmail(env, lead) {
  if (!env.RESEND_API_KEY || !env.CONTACT_FROM_EMAIL || !env.CONTACT_TO_EMAIL) return "not_configured";
  const appointment = new Intl.DateTimeFormat("en-IN", { dateStyle: "full", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(lead.appointmentAt));
  const rows = [["Date and time", `${appointment} IST`], ["Duration", "30 minutes"], ["Reference", lead.id]];
  const customerText = `Hi ${lead.name},\n\nYour appointment with G7X Studios is booked.\n\nDate and time: ${appointment} IST\nDuration: 30 minutes\nReference: ${lead.id}\n\nYou can continue the conversation on WhatsApp from your booking confirmation page. If you need to change the time, reply to this email.\n\nYour project note:\n${lead.message}\n\nG7X Studios\ncontact@g7xstudio.com`;
  const ownerText = `New appointment booked\n\nDate and time: ${appointment} IST\nDuration: 30 minutes\nReference: ${lead.id}\nName: ${lead.name}\nEmail: ${lead.email}\nPhone: ${lead.phone}\nCompany: ${lead.company || "—"}\nService: ${lead.service || "—"}\n\nProject note:\n${lead.message}`;
  async function send(to, subject, text, html, replyTo) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env.CONTACT_FROM_EMAIL, to: [to], subject, text, html, reply_to: replyTo }),
    });
    if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
  }
  await send(lead.email, "Your G7X Studios appointment is booked", customerText, emailHtml({
    heading: "Your appointment is booked.",
    intro: `Hi ${lead.name}, thanks for booking a conversation with us. Here are the details for your records.`,
    rows,
    message: lead.message,
    footnote: "You can continue the conversation on WhatsApp from your booking confirmation page. Need to change the time? Reply to this email.",
  }), env.CONTACT_TO_EMAIL);
  try {
    await send(env.CONTACT_TO_EMAIL, `New appointment: ${lead.name}`, ownerText, emailHtml({
      heading: "A new appointment is booked.",
      intro: `${lead.name} has booked a 30-minute call with G7X Studios.`,
      rows: [...rows, ["Name", lead.name], ["Email", lead.email], ["Phone", lead.phone], ["Company", lead.company || "—"], ["Service", lead.service || "—"]],
      message: lead.message,
      footnote: "Reply to this email to contact the visitor.",
    }), lead.email);
  } catch (error) {
    console.error("Owner notification failed:", error instanceof Error ? error.message : "unknown error");
    return "customer_sent_owner_failed";
  }
  return "sent";
}

function validAppointment(value, now) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\.000Z$/.test(value)) return false;
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString() !== value || timestamp <= now + 3600000 || timestamp > now + 31 * 86400000) return false;
  const local = new Date(timestamp + 330 * 60000);
  const day = local.getUTCDay();
  const minutes = local.getUTCHours() * 60 + local.getUTCMinutes();
  const today = new Date(now + 330 * 60000).toISOString().slice(0, 10);
  const horizon = new Date(`${today}T00:00:00Z`);
  horizon.setUTCDate(horizon.getUTCDate() + 30);
  return local.toISOString().slice(0, 10) > today && local.toISOString().slice(0, 10) <= horizon.toISOString().slice(0, 10) && day >= 1 && day <= 5 && APPOINTMENT_MINUTES.includes(minutes);
}

async function availability(env) {
  if (!env.DB) return json({ message: "Availability is temporarily unavailable." }, 503);
  try {
    const now = new Date().toISOString();
    const end = new Date(Date.now() + 31 * 86400000).toISOString();
    const result = await env.DB.prepare("SELECT appointment_at FROM leads WHERE status = 'booked' AND appointment_at IS NOT NULL AND appointment_at >= ? AND appointment_at <= ?").bind(now, end).all();
    return json({ booked: result.results.map(row => row.appointment_at) });
  } catch (error) {
    console.error("Availability lookup failed:", error instanceof Error ? error.message : "unknown error");
    return json({ message: "Availability is temporarily unavailable." }, 503);
  }
}

async function submit(request, env, ctx) {
  if (!env.DB) return json({ message: "The contact form is temporarily unavailable." }, 503);
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin) return json({ message: "Request origin is not allowed." }, 403);
  if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) return json({ message: "Invalid request format." }, 415);
  if (Number(request.headers.get("Content-Length") || 0) > 10000) return json({ message: "Your message is too long." }, 413);
  let body;
  try {
    const raw = await request.text();
    if (raw.length > 10000) return json({ message: "Your message is too long." }, 413);
    body = JSON.parse(raw);
  } catch { return json({ message: "Please check your details and try again." }, 400); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return json({ message: "Please check your details and try again." }, 400);
  if (clean(body.website, 200)) return json({ message: "Thanks for reaching out. Your message has been received." }, 201);
  const name = clean(body.name, 100);
  const email = clean(body.email, 254).toLowerCase();
  const phone = clean(body.phone, 22);
  const company = clean(body.company, 120);
  const projectTypes = ["Website design", "Website development", "E-commerce", "Web app", "Existing site", "Not sure yet"];
  let service = clean(body.service, 50);
  if (body.projectTypes !== undefined) {
    if (!Array.isArray(body.projectTypes) || body.projectTypes.length > projectTypes.length || body.projectTypes.some(type => typeof type !== "string" || !projectTypes.includes(type)) || new Set(body.projectTypes).size !== body.projectTypes.length) {
      return json({ message: "Please choose valid project types." }, 400);
    }
    service = body.projectTypes.join(", ");
  } else if (service && !["Website design", "Web development", "Design + development", "Something else"].includes(service)) {
    return json({ message: "Please choose a valid service." }, 400);
  }
  const message = clean(body.message, 3000);
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\+?[0-9 ()-]+$/.test(phone) || phone.replace(/\D/g, "").length < 8 || phone.replace(/\D/g, "").length > 15 || message.length < 10 || body.consent !== "yes") {
    return json({ message: "Please complete the required fields and agree to be contacted." }, 400);
  }
  const now = Date.now();
  const appointmentAt = body.appointmentAt;
  if (!validAppointment(appointmentAt, now)) return json({ message: "Please choose a valid available call time." }, 400);
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const ipHash = await hashIp(ip, env.RATE_LIMIT_SALT || "g7x-studios-default-rate-limit");
  try {
    const limit = await env.DB.prepare("SELECT window_start, count FROM submission_limits WHERE ip_hash = ?").bind(ipHash).first();
    if (limit && now - limit.window_start < 3600000 && limit.count >= 5) return json({ message: "Too many messages. Please try again later." }, 429);
    if (!limit || now - limit.window_start >= 3600000) {
      await env.DB.prepare("INSERT INTO submission_limits (ip_hash, window_start, count) VALUES (?, ?, 1) ON CONFLICT(ip_hash) DO UPDATE SET window_start = excluded.window_start, count = 1").bind(ipHash, now).run();
    } else {
      await env.DB.prepare("UPDATE submission_limits SET count = count + 1 WHERE ip_hash = ?").bind(ipHash).run();
    }
    const lead = { id: crypto.randomUUID(), createdAt: new Date(now).toISOString(), name, email, phone, company, service, message, appointmentAt };
    try {
      await env.DB.prepare("INSERT INTO leads (id, created_at, name, email, phone, company, service, message, consent_at, notification_status, appointment_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(lead.id, lead.createdAt, name, email, phone, company || null, service || null, message, lead.createdAt, "pending", appointmentAt, "booked").run();
    } catch (error) {
      if (String(error).includes("UNIQUE") || String(error).includes("unique")) return json({ message: "That time was just booked. Please choose another slot." }, 409);
      throw error;
    }
    let notificationStatus = "failed";
    try { notificationStatus = await notifyByEmail(env, lead); } catch (error) { console.error("Email confirmation failed:", error instanceof Error ? error.message : "unknown error"); }
    try { await env.DB.prepare("UPDATE leads SET notification_status = ? WHERE id = ?").bind(notificationStatus, lead.id).run(); }
    catch (error) { console.error("Notification status update failed:", error instanceof Error ? error.message : "unknown error"); }
    return json({ message: "Your appointment is booked.", appointmentId: lead.id, emailStatus: notificationStatus }, 201);
  } catch (error) {
    console.error("Lead submission failed:", error instanceof Error ? error.message : "unknown error");
    return json({ message: "We couldn't send your message. Please try again shortly." }, 500);
  }
}

function sameOrigin(request) {
  const origin = request.headers.get("Origin");
  return !origin || origin === new URL(request.url).origin;
}

async function sessionSignature(expires, secret) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const bytes = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(expires));
  return [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function equalStrings(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index++) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

async function isAdmin(request, env) {
  if (!env.ADMIN_SESSION_SECRET) return false;
  const cookie = request.headers.get("Cookie")?.split(";").map(value => value.trim()).find(value => value.startsWith("g7x_admin="))?.slice(10);
  if (!cookie) return false;
  const [expires, signature] = cookie.split(".");
  if (!/^\d+$/.test(expires || "") || !/^[a-f0-9]{64}$/.test(signature || "") || Number(expires) < Date.now()) return false;
  return equalStrings(signature, await sessionSignature(expires, env.ADMIN_SESSION_SECRET));
}

async function adminLogin(request, env) {
  if (!env.DB || !env.ADMIN_PASSWORD || !env.ADMIN_SESSION_SECRET) return json({ message: "Admin access is not configured." }, 503);
  if (!sameOrigin(request)) return json({ message: "Request origin is not allowed." }, 403);
  let body;
  try { body = await request.json(); } catch { return json({ message: "Enter your admin password." }, 400); }
  if (!body || typeof body.password !== "string" || body.password.length > 200) return json({ message: "Enter your admin password." }, 400);
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const ipHash = await hashIp(ip, `admin:${env.RATE_LIMIT_SALT || env.ADMIN_SESSION_SECRET}`);
  const now = Date.now();
  try {
    const limit = await env.DB.prepare("SELECT window_start, count FROM submission_limits WHERE ip_hash = ?").bind(ipHash).first();
    if (limit && now - limit.window_start < 3600000 && limit.count >= 5) return json({ message: "Too many attempts. Try again later." }, 429);
    const valid = equalStrings(await hashIp(body.password, "admin-password"), await hashIp(env.ADMIN_PASSWORD, "admin-password"));
    if (!valid) {
      if (!limit || now - limit.window_start >= 3600000) await env.DB.prepare("INSERT INTO submission_limits (ip_hash, window_start, count) VALUES (?, ?, 1) ON CONFLICT(ip_hash) DO UPDATE SET window_start = excluded.window_start, count = 1").bind(ipHash, now).run();
      else await env.DB.prepare("UPDATE submission_limits SET count = count + 1 WHERE ip_hash = ?").bind(ipHash).run();
      return json({ message: "Incorrect password." }, 401);
    }
    const expires = String(now + 8 * 3600000);
    const signature = await sessionSignature(expires, env.ADMIN_SESSION_SECRET);
    const response = json({ authenticated: true });
    response.headers.set("Set-Cookie", `g7x_admin=${expires}.${signature}; HttpOnly; Secure; SameSite=Strict; Path=/api/admin; Max-Age=28800`);
    return response;
  } catch (error) {
    console.error("Admin login failed:", error instanceof Error ? error.message : "unknown error");
    return json({ message: "Admin access is temporarily unavailable." }, 503);
  }
}

async function adminRoute(request, env, path) {
  if (path === "/login") return request.method === "POST" ? adminLogin(request, env) : json({ message: "Method not allowed." }, 405);
  if (!env.DB) return json({ message: "Admin access is temporarily unavailable." }, 503);
  if (!await isAdmin(request, env)) return json({ message: "Please sign in." }, 401);
  if (path === "/session" && request.method === "GET") return json({ authenticated: true });
  if (path === "/logout" && request.method === "POST") {
    if (!sameOrigin(request)) return json({ message: "Request origin is not allowed." }, 403);
    const response = json({ authenticated: false });
    response.headers.set("Set-Cookie", "g7x_admin=; HttpOnly; Secure; SameSite=Strict; Path=/api/admin; Max-Age=0");
    return response;
  }
  if (path === "/appointments" && request.method === "GET") {
    try {
      const result = await env.DB.prepare("SELECT id, created_at, appointment_at, name, email, phone, company, service, message, status, completed_at, notification_status FROM leads WHERE appointment_at IS NOT NULL ORDER BY appointment_at DESC LIMIT 200").all();
      return json({ appointments: result.results });
    } catch (error) {
      console.error("Admin appointment lookup failed:", error instanceof Error ? error.message : "unknown error");
      return json({ message: "Appointments could not be loaded." }, 503);
    }
  }
  const complete = path.match(/^\/appointments\/([a-f0-9-]{36})\/complete$/);
  if (complete && request.method === "POST") {
    if (!sameOrigin(request)) return json({ message: "Request origin is not allowed." }, 403);
    try {
      const result = await env.DB.prepare("UPDATE leads SET status = 'completed', completed_at = ? WHERE id = ? AND status = 'booked'").bind(new Date().toISOString(), complete[1]).run();
      if (!result.meta?.changes) return json({ message: "Appointment not found or already completed." }, 404);
      return json({ message: "Appointment marked complete. Its time is available again if the date is still bookable." });
    } catch (error) {
      console.error("Admin appointment update failed:", error instanceof Error ? error.message : "unknown error");
      return json({ message: "Appointment could not be updated." }, 503);
    }
  }
  return json({ message: "Not found." }, 404);
}

function serveAsset(pathname) {
  const path = pathname === "/" ? "/index.html" : pathname;
  const resolvedPath = ASSETS[path] ? path : ASSETS[`${path}.html`] ? `${path}.html` : "/404.html";
  const content = ASSETS[resolvedPath];
  if (!content) return new Response("Not found", { status: 404 });
  const extension = (resolvedPath.split(".").pop() || "html").toLowerCase();
  const mime = MIME[extension] || "application/octet-stream";
  const bytes = Uint8Array.from(atob(content), char => char.charCodeAt(0));
  const isAsset = path.startsWith("/_next/static/");
  return new Response(bytes, {
    status: resolvedPath === "/404.html" && path !== "/404.html" ? 404 : 200,
    headers: {
      "Content-Type": mime,
      "Cache-Control": isAsset ? "public, max-age=31536000, immutable" : "public, max-age=60",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Frame-Options": "DENY",
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/api/contact") {
      if (request.method !== "POST") return json({ message: "Method not allowed." }, 405);
      return submit(request, env, ctx);
    }
    if (url.pathname === "/api/availability") {
      if (request.method !== "GET") return json({ message: "Method not allowed." }, 405);
      return availability(env);
    }
    if (url.pathname.startsWith("/api/admin/")) return adminRoute(request, env, url.pathname.slice("/api/admin".length));
    if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed", { status: 405 });
    return serveAsset(url.pathname);
  },
};
