import { ArrowRight, ArrowUpRight } from "lucide-react";
import "./footer.css";

export default function SiteFooter() {
  return <footer className="site-footer">
    <div className="footer-top">
      <div className="footer-intro">
        <a className="footer-brand" href="/#top" aria-label="G7X Studios home">G7X<span aria-hidden="true">✳</span><small>STUDIOS</small></a>
        <p>Considered websites for businesses ready to be seen, understood, and contacted.</p>
      </div>
      <nav className="footer-links" aria-label="Footer navigation">
        <div><h2>Explore</h2><a href="/#work">Selected work</a><a href="/#services">Services</a><a href="/#faq">Questions</a></div>
        <div><h2>Projects</h2><a href="https://formula19.ca/" target="_blank" rel="noreferrer">Formula 19 <ArrowUpRight size={13}/></a><a href="https://g7x.in/" target="_blank" rel="noreferrer">G7X <ArrowUpRight size={13}/></a><a href="https://mistymeadowsresorts.com/" target="_blank" rel="noreferrer">Misty Meadows <ArrowUpRight size={13}/></a></div>
        <div><h2>Connect</h2><a href="/#contact">Book an appointment</a><a href="mailto:contact@g7xstudio.com">Email the studio <ArrowUpRight size={13}/></a></div>
      </nav>
    </div>
    <div className="footer-meta"><span>WEB DESIGN &amp; DEVELOPMENT</span><span>© {new Date().getFullYear()} G7X STUDIOS</span><a href="/#top">BACK TO TOP <ArrowRight size={14}/></a></div>
    <div className="footer-landscape" role="img" aria-label="G7X Studios wordmark over green rolling hills beneath a blue sky"><div className="footer-wordmark" aria-hidden="true"><strong>G7X</strong><span>STUDIOS</span></div></div>
  </footer>;
}
