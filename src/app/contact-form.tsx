"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";

const hours = [660, 990, 1110, 1260];
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const todayIst = () => new Date(Date.now() + 330 * 60_000).toISOString().slice(0, 10);
function toIso(day: string, minutes: number) {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, minutes - 330)).toISOString();
}
function timeLabel(minutes: number) {
  const hour = Math.floor(minutes / 60);
  return `${hour % 12 || 12}:${String(minutes % 60).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`;
}

export default function ContactForm() {
  const [step, setStep] = useState<"details" | "time" | "thanks">("details");
  const [details, setDetails] = useState<Record<string, string>>({});
  const [confirmation, setConfirmation] = useState<{ slot: string; email: string; reference: string; emailStatus: string } | null>(null);
  const [today, setToday] = useState("");
  const [autoSelected, setAutoSelected] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);
  const [day, setDay] = useState("");
  const [slot, setSlot] = useState("");
  const [booked, setBooked] = useState<string[]>([]);
  const [availability, setAvailability] = useState<"loading" | "ready" | "unavailable">("loading");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => { setToday(todayIst()); }, []);
  useEffect(() => {
    if (!today || autoSelected) return;
    const candidate = new Date(`${today}T00:00:00Z`);
    for (let offset = 1; offset <= 30; offset++) {
      candidate.setUTCDate(candidate.getUTCDate() + 1);
      if (candidate.getUTCDay() > 0 && candidate.getUTCDay() < 6) {
        setDay(candidate.toISOString().slice(0, 10));
        setAutoSelected(true);
        const start = new Date(`${today}T00:00:00Z`);
        setMonthOffset((candidate.getUTCFullYear() - start.getUTCFullYear()) * 12 + candidate.getUTCMonth() - start.getUTCMonth());
        break;
      }
    }
  }, [today, autoSelected]);
  useEffect(() => {
    let active = true;
    fetch("/api/availability", { cache: "no-store" })
      .then(response => { if (!response.ok) throw new Error(); return response.json() as Promise<{ booked: string[] }>; })
      .then(data => { if (active) { setBooked(data.booked); setAvailability("ready"); } })
      .catch(() => { if (active) setAvailability("unavailable"); });
    return () => { active = false; };
  }, []);

  const calendar = useMemo(() => {
    if (!today) return { title: "", days: [] as { date: string; day: number; enabled: boolean }[], canNext: false };
    const [y, m] = today.split("-").map(Number);
    const first = new Date(Date.UTC(y, m - 1 + monthOffset, 1));
    const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0));
    const horizon = new Date(`${today}T00:00:00Z`);
    horizon.setUTCDate(horizon.getUTCDate() + 30);
    const days = Array.from({ length: first.getUTCDay() }, (_, index) => ({ date: `blank-${index}`, day: 0, enabled: false }));
    for (let number = 1; number <= last.getUTCDate(); number++) {
      const value = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), number));
      const date = value.toISOString().slice(0, 10);
      days.push({ date, day: number, enabled: date > today && value <= horizon && value.getUTCDay() > 0 && value.getUTCDay() < 6 });
    }
    return { title: new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "UTC" }).format(first), days, canNext: new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 1)) <= horizon };
  }, [today, monthOffset]);
  const slots = day && availability === "ready" ? hours.map(minutes => ({ minutes, iso: toIso(day, minutes) })).filter(item => new Date(item.iso).getTime() > Date.now() + 60 * 60_000) : [];
  const dateLabel = day ? new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${day}T00:00:00Z`)) : "";

  function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDetails(Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>);
    setMessage(""); setStatus("idle"); setStep("time");
  }

  async function submit() {
    if (!slot) { setStatus("error"); setMessage("Choose a date and time first."); return; }
    const selected = slot;
    setStatus("sending"); setMessage("");
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...details, appointmentAt: selected }) });
      const result = await response.json().catch(() => ({})) as { message?: string; appointmentId?: string; emailStatus?: string };
      if (!response.ok) {
        if (response.status === 404) throw new Error("Bookings aren’t available in this local preview. Please email contact@g7xstudio.com.");
        if (response.status === 409) { setBooked(previous => [...previous, slot]); setSlot(""); }
        throw new Error(result.message || "We couldn’t save your booking. Please try again.");
      }
      setBooked(previous => [...previous, selected]);
      setConfirmation({ slot: selected, email: details.email, reference: result.appointmentId || "", emailStatus: result.emailStatus || "failed" });
      setStatus("success"); setStep("thanks");
    } catch (error) { setStatus("error"); setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again."); }
  }

  return <div className="booking-panel">
    {step !== "thanks" && <div className="booking-progress" aria-label="Booking progress"><span className={step === "details" ? "is-current" : "is-done"}>01 <i/> Details</span><span className={step === "time" ? "is-current" : ""}>02 <i/> Time</span><span>03 <i/> Confirm</span></div>}
    {step === "time" && <>
    <div className="booking-head"><div><span className="booking-kicker">02 / CHOOSE A TIME</span><h3>Pick a time that works.</h3><p>For {details.name} · {details.email}</p></div><span className="booking-duration"><Clock3 size={16}/> 30 MIN CALL</span></div>
    <div className="booking-picker">
      <div className="booking-calendar" aria-label="Appointment date calendar">
        <div className="booking-month"><strong>{calendar.title || "Loading calendar"}</strong><div><button type="button" aria-label="Previous month" disabled={monthOffset === 0} onClick={() => { setMonthOffset(value => value - 1); setDay(""); setSlot(""); }}><ChevronLeft size={18}/></button><button type="button" aria-label="Next month" disabled={!calendar.canNext} onClick={() => { setMonthOffset(value => value + 1); setDay(""); setSlot(""); }}><ChevronRight size={18}/></button></div></div>
        <div className="booking-days">{weekdays.map(value => <span key={value}>{value}</span>)}{calendar.days.map(value => value.day ? <button key={value.date} type="button" disabled={!value.enabled} aria-label={new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value.date}T00:00:00Z`))} aria-pressed={day === value.date} className={day === value.date ? "is-selected" : ""} onClick={() => { setDay(value.date); setSlot(""); }}>{value.day}</button> : <span key={value.date} aria-hidden="true" />)}</div>
        <p>Monday–Friday · 11:00 AM, 4:30 PM, 6:30 PM &amp; 9:00 PM IST.</p>
      </div>
      <div className="booking-times"><strong>{day ? dateLabel : "Select a date"}</strong><p>{day ? "All times are in India Standard Time (IST)." : "Choose a day to see the available call times."}</p>{availability === "loading" && <small className="availability-note">Checking available times…</small>}{availability === "unavailable" && <small className="availability-note">We can’t check availability right now. Please try again shortly or email contact@g7xstudio.com.</small>}{day && availability === "ready" && <div className="booking-slot-list">{slots.map(item => <button key={item.iso} type="button" disabled={booked.includes(item.iso)} aria-pressed={slot === item.iso} className={slot === item.iso ? "is-selected" : ""} onClick={() => setSlot(item.iso)}>{timeLabel(item.minutes)}{booked.includes(item.iso) && <span>Booked</span>}</button>)}{slots.length === 0 && <span className="no-slots">No times left on this day. Try another date.</span>}</div>}</div>
    </div>
    <div className="booking-step-actions"><button type="button" className="booking-back" onClick={() => { setStep("details"); setMessage(""); }}>← Back to details</button><button type="button" className="button booking-confirm" onClick={submit} disabled={!slot || status === "sending"}>{status === "sending" ? "BOOKING…" : "CONFIRM APPOINTMENT"}<ArrowRight size={18}/></button></div>
    <div className={`form-status ${status}`} role="status" aria-live="polite">{message}</div>
    </>}
    {step === "details" && <form className="contact-form" onSubmit={next}>
      <div className="booking-form-heading"><span className="booking-kicker">01 / YOUR DETAILS</span><h3>Tell us what you’re building.</h3><p>Share the basics, then choose a time for your 30-minute call.</p></div>
      <div className="form-row"><label>Full name <span>*</span><input name="name" type="text" autoComplete="name" placeholder="Your name" maxLength={100} defaultValue={details.name || ""} required /></label><label>Email address <span>*</span><input name="email" type="email" autoComplete="email" placeholder="you@company.com" maxLength={254} defaultValue={details.email || ""} required /></label></div>
      <div className="form-row"><label>Phone number <span>*</span><input name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="Your contact number" minLength={8} maxLength={22} defaultValue={details.phone || ""} required /></label><label>Company / brand<input name="company" type="text" autoComplete="organization" placeholder="Your company (optional)" maxLength={120} defaultValue={details.company || ""} /></label></div>
      <label>What do you need?<select name="service" defaultValue={details.service || ""}><option value="">Select a service</option><option value="Website design">Website design</option><option value="Web development">Web development</option><option value="Design + development">Design + development</option><option value="Something else">Something else</option></select></label>
      <label>Tell us about your project <span>*</span><textarea name="message" placeholder="A few lines about your business and what you’d like to build…" rows={3} minLength={10} maxLength={3000} defaultValue={details.message || ""} required /></label>
      <label className="honeypot" aria-hidden="true">Leave this field empty<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
      <label className="consent"><input type="checkbox" name="consent" value="yes" defaultChecked={details.consent === "yes"} required /><span>I agree to be contacted about my enquiry. My details will only be used to respond and arrange this call.</span></label>
      <button className="button" type="submit">NEXT: PICK A TIME<ArrowRight size={18} aria-hidden="true" /></button>
    </form>}
      {step === "thanks" && confirmation && <div className="booking-thanks" role="status" aria-live="polite"><span className="booking-check"><Check size={34}/></span><span className="booking-kicker">03 / CONFIRMED</span><h3>Thank you,<br/>{details.name.split(" ")[0]}.</h3><p>Your appointment with G7X Studios is booked.</p><div className="booking-receipt"><div><small>DATE &amp; TIME</small><strong>{new Intl.DateTimeFormat("en-IN", { dateStyle: "full", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(confirmation.slot))} IST</strong></div><div><small>DURATION</small><strong>30 minutes</strong></div><div><small>REFERENCE</small><strong className="booking-reference">{confirmation.reference}</strong></div></div><p className="booking-email-note">{confirmation.emailStatus === "sent" || confirmation.emailStatus === "customer_sent_owner_failed" ? <>We sent the appointment details to <strong>{confirmation.email}</strong>.</> : <>Your time is reserved, but the confirmation email could not be sent yet. Please keep these details and contact <a href="mailto:contact@g7xstudio.com">contact@g7xstudio.com</a> if needed.</>}</p><a className="booking-whatsapp" href={`https://wa.me/919814802635?text=${encodeURIComponent(`Hi G7X Studios, I booked a call for ${new Intl.DateTimeFormat("en-IN", { dateStyle: "full", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(confirmation.slot))} IST. My booking reference is ${confirmation.reference}.`)}`} target="_blank" rel="noopener noreferrer">Continue on WhatsApp <ArrowRight size={18} aria-hidden="true" /></a><small className="booking-whatsapp-note">WhatsApp opens in a new tab. Send the message there to start the conversation.</small></div>}
  </div>;
}
