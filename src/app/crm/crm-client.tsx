"use client";

import { useEffect, useState, type FormEvent } from "react";

type Appointment = {
  id: string;
  created_at: string;
  appointment_at: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  service: string | null;
  message: string;
  status: "booked" | "completed";
  completed_at: string | null;
  notification_status: string;
};

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(value)) + " IST";
}

export default function CrmClient() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  async function loadAppointments() {
    const response = await fetch("/api/admin/appointments", { cache: "no-store" });
    if (!response.ok) throw new Error("Appointments could not be loaded.");
    const data = await response.json() as { appointments: Appointment[] };
    setAppointments(data.appointments);
  }

  useEffect(() => {
    let active = true;
    fetch("/api/admin/session", { cache: "no-store" })
      .then(async response => {
        if (active && response.ok) { setAuthenticated(true); await loadAppointments(); }
      })
      .catch(() => { if (active) setError("The appointment manager is unavailable in this preview."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const password = String(new FormData(form).get("password") || "");
    setBusy("login"); setError("");
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const data = await response.json().catch(() => ({})) as { message?: string };
      if (response.status === 404) throw new Error("The admin manager works in the published Worker preview, not the Next.js development server.");
      if (!response.ok) throw new Error(data.message || "Sign in failed.");
      form.reset(); setAuthenticated(true); await loadAppointments();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Sign in failed."); }
    finally { setBusy(""); }
  }

  async function complete(appointment: Appointment) {
    setBusy(appointment.id); setError("");
    try {
      const response = await fetch(`/api/admin/appointments/${appointment.id}/complete`, { method: "POST" });
      const data = await response.json() as { message?: string };
      if (!response.ok) throw new Error(data.message || "Could not update this appointment.");
      await loadAppointments();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update this appointment."); }
    finally { setBusy(""); }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false); setAppointments([]);
  }

  const upcoming = appointments.filter(item => item.status === "booked" && new Date(item.appointment_at).getTime() >= Date.now());
  const other = appointments.filter(item => !upcoming.includes(item));

  return <main className="crm-page">
    <header className="crm-header"><a href="/" className="crm-brand">G7X <span>STUDIOS</span></a>{authenticated && <button type="button" onClick={logout}>Sign out</button>}</header>
    <div className="crm-shell">
      <div className="crm-title"><span>G7X / PRIVATE</span><h1>Appointments.</h1><p>Review bookings and mark completed calls. Completed times become available again if their date is still open for booking.</p></div>
      {loading ? <p>Loading…</p> : !authenticated ? <form className="crm-login" onSubmit={login}><h2>Admin sign in</h2><label>Password<input type="password" name="password" autoComplete="current-password" required /></label><button type="submit" disabled={busy === "login"}>{busy === "login" ? "Signing in…" : "Sign in"}</button></form> : <>
        <div className="crm-toolbar"><strong>{upcoming.length} upcoming</strong><button type="button" onClick={() => { setError(""); void loadAppointments().catch(() => setError("Appointments could not be refreshed.")); }}>Refresh</button></div>
        <section aria-labelledby="crm-upcoming"><h2 id="crm-upcoming">Upcoming</h2>{upcoming.length ? <div className="crm-list">{upcoming.map(item => <AppointmentCard key={item.id} item={item} busy={busy === item.id} onComplete={() => complete(item)} />)}</div> : <p className="crm-empty">No upcoming appointments.</p>}</section>
        <section aria-labelledby="crm-history"><h2 id="crm-history">History</h2>{other.length ? <div className="crm-list">{other.map(item => <AppointmentCard key={item.id} item={item} busy={busy === item.id} onComplete={() => complete(item)} />)}</div> : <p className="crm-empty">No past appointments.</p>}</section>
      </>}
      {error && <p className="crm-error" role="alert">{error}</p>}
    </div>
  </main>;
}

function AppointmentCard({ item, busy, onComplete }: { item: Appointment; busy: boolean; onComplete: () => void }) {
  return <article className="crm-card"><div className="crm-card-head"><div><span>{item.status.toUpperCase()} / {dateLabel(item.appointment_at)}</span><h3>{item.name}</h3></div>{item.status === "booked" && <button type="button" disabled={busy} onClick={onComplete}>{busy ? "Updating…" : "Mark completed"}</button>}</div><div className="crm-card-details"><p><strong>Email</strong><a href={`mailto:${item.email}`}>{item.email}</a></p><p><strong>Phone</strong>{item.phone || "—"}</p><p><strong>Company</strong>{item.company || "—"}</p><p><strong>Service</strong>{item.service || "—"}</p><p><strong>Email status</strong>{item.notification_status.replaceAll("_", " ")}</p></div><div className="crm-card-note"><strong>Project note</strong><p>{item.message}</p></div><small>Booked {dateLabel(item.created_at)} · Reference {item.id}{item.completed_at ? ` · Completed ${dateLabel(item.completed_at)}` : ""}</small></article>;
}
