import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight, Asterisk, Clock3, LockKeyhole, Mail } from "lucide-react";
import Faq from "./faq";
import GsapMotion from "./gsap-motion";
import ContactForm from "./contact-form";
import SiteFooter from "./site-footer";
import { siteUrl } from "./site-url";
import "./booking.css";
import "./testimonials.css";
import { ProjectDeck, type Project } from "../components/ui/scroll-stacking-cards";
import TestimonialDrafts, { type DraftTestimonial } from "../components/ui/testimonial-drafts";

const title = "G7X Studios";
const description = "G7X Studios provides website design and Next.js development for businesses. Explore live automotive, hospitality, and events projects, then book a website consultation.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${siteUrl}/` },
  openGraph: {
    title,
    description,
    url: `${siteUrl}/`,
    siteName: "G7X Studios",
    type: "website",
    locale: "en_IN",
    images: [{ url: "/hero-laptop.webp", width: 1200, height: 800, alt: "G7X Studios website design preview" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/hero-laptop.webp"] },
  robots: { index: true, follow: true },
};

const businessSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "G7X Studios",
  url: `${siteUrl}/`,
  description,
  email: "contact@g7xstudio.com",
  image: `${siteUrl}/hero-laptop.webp`,
  serviceType: ["Website design", "Website development"],
};

function Brand() {
  return <a className="brand" href="#top" aria-label="G7X Studios home">G7X<span aria-hidden="true">✳</span><small>STUDIOS</small></a>;
}

const projects: Project[] = [
  { name: "Formula 19", summary: "Performance tires and wheels with product discovery and service booking in Kelowna.", url: "https://formula19.ca/", display: "formula19.ca", image: "/projects/formula19-site.webp", accent: "#e11d2a", objectPosition: "left top" },
  { name: "G7X", summary: "An influencer marketing and brand activation site for stores, brands, and creators.", url: "https://g7x.in/", display: "g7x.in", image: "/projects/g7x-site.webp", accent: "#6421a8", objectPosition: "center top", mobileObjectPosition: "78% top", objectFit: "contain", imageBackground: "#160b2b" },
  { name: "Misty Meadows Resorts", summary: "A hospitality site for stays, rooms, dining, and booking enquiries in the Kasauli hills.", url: "https://mistymeadowsresorts.com/", display: "mistymeadowsresorts.com", image: "/projects/misty-meadows-site.webp", accent: "#0e7044", objectPosition: "center top" },
];

const draftTestimonials: DraftTestimonial[] = [
  { attribution: "Misty Meadows Resorts", quote: "Beautiful design, smooth experience, and a website that perfectly reflects our brand. Great work by G7X Studios!" },
  { attribution: "Formula 19", quote: "Professional, modern, and easy to navigate. G7X Studios understood our vision and delivered beyond expectations." },
  { attribution: "Sandeep Rana", quote: "Great team to work with! They transformed our ideas into a clean, functional, and professional website." },
  { attribution: "G7X", quote: "Excellent design and seamless execution. The team made the entire website development process effortless." },
];

export default function Home() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema).replace(/</g, "\\u003c") }} />
    <GsapMotion />
    <header className="site-header" id="top"><Brand /><nav aria-label="Main navigation"><a href="#top">Home</a><a href="#services">Services</a><a href="#work">Work</a><a href="#faq">FAQ</a><a href="#contact">Book an appointment</a></nav><a className="header-cta" href="#contact">Book a call <ArrowUpRight size={16}/></a></header>
    <main>
      <section className="hero" aria-labelledby="hero-title"><div className="hero-inner">
        <div className="hero-content">
          <div className="hero-badge"><span>WEB DESIGN STUDIO</span><i aria-hidden="true"/><small>Design and development for businesses</small></div>
          <h1 id="hero-title"><span className="hero-line"><span>Websites</span></span><span className="hero-line"><span>that grow</span></span><span className="hero-line"><span><em>your business.</em></span></span></h1>
          <p className="hero-copy">G7X Studios designs and develops custom business websites in Next.js. We make your services clear, your site easy to use on any screen, and enquiries easy to send.</p>
          <div className="hero-actions"><a className="button button-light" href="#contact">Start your project <ArrowUpRight size={18}/></a><a className="hero-work-link" href="#work"><span><ArrowRight size={18}/></span> Explore our work</a></div>
          <div className="hero-signals" aria-label="What we offer"><div><strong>Design</strong><span>Clear direction</span></div><div><strong>Build</strong><span>Responsive by default</span></div><div><strong>Contact</strong><span>Simple enquiries</span></div></div>
        </div>
        <div className="hero-art" role="img" aria-label="Laptop showing the live Formula 19 website"><div className="hero-art-disc"/><div className="hero-device"><picture><source media="(max-width: 760px)" srcSet="/hero-laptop-mobile.webp"/><img className="hero-laptop" src="/hero-laptop.webp" width="1200" height="800" fetchPriority="high" alt=""/></picture><div className="hero-screen" aria-hidden="true"><img className="hero-screen-capture" src="/projects/formula19-site.webp" alt=""/></div></div><div className="hero-float hero-float-top"><span>G7X / STUDIO</span><strong>Made for clarity <ArrowUpRight size={17}/></strong></div><div className="hero-float hero-float-side"><span>01 / LIVE PROJECT</span><strong>Formula 19</strong></div></div>
      </div></section>

      <section id="work" className="work-section" aria-labelledby="work-title"><div className="work-intro section-shell"><div className="section-heading"><span className="eyebrow"><Asterisk size={15}/> 01 / SELECTED WORK</span><div><h2 id="work-title">Work you can open.<br/><em>And explore.</em></h2><p>Explore our published website projects for an automotive business, an events platform, and a resort. Each project links to the live site.</p></div></div></div>
        <ProjectDeck projects={projects} />
      </section>

      <section id="services" className="services-section section-shell" aria-labelledby="services-title"><div className="section-heading"><span className="eyebrow"><Asterisk size={15}/> 02 / WHAT WE DO</span><div><h2 id="services-title">Built with purpose,<br/><em>from first click to contact.</em></h2><p>Website design, Next.js development, and contact flows planned together so visitors can understand your business and take the next step.</p></div></div><div className="services-list"><div><span>01</span><h3>Website design</h3><p>We plan page structure, navigation, and visual direction around your services and the questions your visitors bring.</p></div><div><span>02</span><h3>Web development</h3><p>We build responsive Next.js websites and check how the design and content work on desktop and mobile.</p></div><div><span>03</span><h3>Enquiries &amp; booking</h3><p>We connect clear calls to action with contact forms and appointment booking, with private records of incoming leads.</p></div></div></section>

      <section className="draft-section" aria-labelledby="draft-title"><div className="draft-inner"><div className="draft-intro"><span className="eyebrow"><Asterisk size={15}/> 03 / CLIENT VOICES</span><div><h2 id="draft-title">Good work,<br/><em>in their words.</em></h2><p>What our clients say about working with G7X Studios.</p></div></div><TestimonialDrafts items={draftTestimonials}/></div></section>

      <section id="faq" className="faq-section section-shell" aria-labelledby="faq-title"><div className="faq-intro"><span className="eyebrow faq-badge"><Asterisk size={14}/> 04 / FAQ</span><h2 id="faq-title">A few things<br/><em>worth knowing.</em></h2><p>Clear answers before we start talking about your project. If yours isn&apos;t here, <a href="mailto:contact@g7xstudio.com">write to us.</a></p></div><Faq /></section>

      <section id="contact" className="booking-section" aria-labelledby="contact-title"><div className="booking-shell"><div className="booking-intro"><span className="eyebrow"><Asterisk size={15}/> 05 / BOOK YOUR APPOINTMENT</span><div><h2 id="contact-title">Book your<br/><em>appointment.</em></h2><p>Tell us about your project, choose a time, and we’ll come prepared for the conversation.</p></div></div><div className="booking-layout"><aside className="booking-aside"><span>BEFORE WE MEET</span><h3>A good place<br/>to start.</h3><p>We’ll talk through what you need and find a clear next step for your website.</p><div className="booking-aside-facts"><div><Clock3 size={19}/><span>30-minute conversation</span></div><div><Mail size={19}/><span>Follow-up by email</span></div><div><LockKeyhole size={19}/><span>Your details stay private</span></div></div><div className="booking-aside-line"/><strong>Prefer to write?</strong><a href="mailto:contact@g7xstudio.com">contact@g7xstudio.com <ArrowUpRight size={16}/></a><small>Appointments are available Monday–Friday at 11:00 AM, 4:30 PM, 6:30 PM, and 9:00 PM IST.</small></aside><ContactForm /></div></div></section>

    </main>
    <SiteFooter />
  </>;
}
