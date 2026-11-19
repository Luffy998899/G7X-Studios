const ASSETS = __ASSET_MAP__;

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

async function notifyByEmail(env, lead) {
  if (!env.RESEND_API_KEY || !env.CONTACT_FROM_EMAIL || !env.CONTACT_TO_EMAIL) return "not_configured";
  const lines = [
    `New G7X Studios enquiry`, `Received: ${lead.createdAt}`, `Lead ID: ${lead.id}`, "",
    `Name: ${lead.name}`, `Email: ${lead.email}`, `Company: ${lead.company || "—"}`,
    `Service: ${lead.service || "—"}`, "", "Message:", lead.message,
  ];
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.CONTACT_FROM_EMAIL, to: [env.CONTACT_TO_EMAIL], subject: `New website enquiry from ${lead.name}`, text: lines.join("\n"), reply_to: lead.email }),
  });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
  return "sent";
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
  const company = clean(body.company, 120);
  const service = clean(body.service, 50);
  const message = clean(body.message, 3000);
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10 || body.consent !== "yes") {
    return json({ message: "Please complete the required fields and agree to be contacted." }, 400);
  }
  if (service && !["Website design", "Web development", "Design + development", "Something else"].includes(service)) return json({ message: "Please choose a valid service." }, 400);
  const now = Date.now();
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
    const lead = { id: crypto.randomUUID(), createdAt: new Date(now).toISOString(), name, email, company, service, message };
    await env.DB.prepare("INSERT INTO leads (id, created_at, name, email, company, service, message, consent_at, notification_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(lead.id, lead.createdAt, name, email, company || null, service || null, message, lead.createdAt, "pending").run();
    ctx.waitUntil((async () => {
      let status = "failed";
      try { status = await notifyByEmail(env, lead); } catch (error) { console.error("Email notification failed:", error instanceof Error ? error.message : "unknown error"); }
      await env.DB.prepare("UPDATE leads SET notification_status = ? WHERE id = ?").bind(status, lead.id).run();
    })());
    return json({ message: "Thanks for reaching out. Your message has been received." }, 201);
  } catch (error) {
    console.error("Lead submission failed:", error instanceof Error ? error.message : "unknown error");
    return json({ message: "We couldn't send your message. Please try again shortly." }, 500);
  }
}

function serveAsset(pathname) {
  const path = pathname === "/" ? "/index.html" : pathname;
  const content = ASSETS[path] || ASSETS[`${path}.html`] || ASSETS["/404.html"];
  if (!content) return new Response("Not found", { status: 404 });
  const extension = (path.split(".").pop() || "html").toLowerCase();
  const mime = MIME[extension] || "application/octet-stream";
  const bytes = Uint8Array.from(atob(content), char => char.charCodeAt(0));
  const isAsset = path.startsWith("/_next/static/");
  return new Response(bytes, {
    status: ASSETS[path] || ASSETS[`${path}.html`] ? 200 : 404,
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
    if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed", { status: 405 });
    return serveAsset(url.pathname);
  },
};
