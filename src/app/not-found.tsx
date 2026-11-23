import { ArrowRight, ArrowUpRight } from "lucide-react";
import SiteFooter from "./site-footer";
import "./not-found.css";

export default function NotFound() {
  return <>
    <header className="site-header not-found-header"><a className="brand" href="/" aria-label="G7X Studios home">G7X<span aria-hidden="true">✳</span><small>STUDIOS</small></a><nav aria-label="Main navigation"><a href="/">Home</a><a href="/#work">Work</a><a href="/#services">Services</a></nav><a className="header-cta" href="/#contact">Book a call <ArrowUpRight size={16}/></a></header>
    <main className="not-found-main">
      <section className="not-found-card" aria-labelledby="not-found-title">
        <div className="not-found-copy"><span>G7X STUDIOS / 404</span><h1 id="not-found-title">This page<br/>isn&apos;t here.</h1><p>The link may have moved, or the address may be mistyped. The rest of the studio is one click away.</p><a className="not-found-home" href="/">Back to home <ArrowRight size={19}/></a></div>
        <strong className="not-found-number" aria-hidden="true">404</strong>
      </section>
      <section className="not-found-next" aria-labelledby="not-found-next-title"><div><span>STILL LOOKING?</span><h2 id="not-found-next-title">Let&apos;s make something useful.</h2><p>Tell us about your project and book a time to talk.</p></div><a href="/#contact">Book your appointment <ArrowUpRight size={18}/></a></section>
    </main>
    <SiteFooter />
  </>;
}
