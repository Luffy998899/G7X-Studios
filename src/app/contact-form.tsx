"use client";

import { useState, type FormEvent } from "react";

type FormState = "idle" | "sending" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    setMessage("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(data.entries())),
      });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message || "We couldn't send your message. Please try again.");
      form.reset();
      setStatus("success");
      setMessage("Thanks for reaching out. Your message has been received.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  return <form className="contact-form" onSubmit={handleSubmit}>
    <h3>Let&apos;s talk about your project.</h3>
    <p>Share the basics and we&apos;ll be in touch.</p>
    <div className="form-row"><label>Full name <span>*</span><input name="name" type="text" autoComplete="name" placeholder="Your name" maxLength={100} required /></label><label>Email address <span>*</span><input name="email" type="email" autoComplete="email" placeholder="you@company.com" maxLength={254} required /></label></div>
    <div className="form-row"><label>Company / brand<input name="company" type="text" autoComplete="organization" placeholder="Your company" maxLength={120} /></label><label>What do you need?<select name="service" defaultValue=""><option value="" disabled>Select a service</option><option value="Website design">Website design</option><option value="Web development">Web development</option><option value="Design + development">Design + development</option><option value="Something else">Something else</option></select></label></div>
    <label>Tell us about your project <span>*</span><textarea name="message" placeholder="What are you looking to build?" rows={4} maxLength={3000} required /></label>
    <label className="honeypot" aria-hidden="true">Leave this field empty<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
    <label className="consent"><input type="checkbox" name="consent" value="yes" required /><span>I agree to be contacted about my enquiry. My details will be used only to respond to this request.</span></label>
    <button className="button button-lime" type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending..." : "Send enquiry"}</button>
    <div className={`form-status ${status}`} role="status" aria-live="polite">{message}</div>
  </form>;
}
