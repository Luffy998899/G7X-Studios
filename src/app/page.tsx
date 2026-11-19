import { Code2, Layers3, MousePointer2, Sparkles } from "lucide-react";
import ContactForm from "./contact-form";

const services = [
  {
    number: "01",
    icon: <Layers3 size={26} strokeWidth={1.7} />,
    title: "Website design",
    description: "A distinct, easy-to-use experience shaped around your brand and the people you want to reach.",
    tags: ["Brand-led design", "Responsive layouts"],
  },
  {
    number: "02",
    icon: <Code2 size={26} strokeWidth={1.7} />,
    title: "Web development",
    description: "Fast, polished websites built with care so every interaction feels effortless.",
    tags: ["Next.js", "Clean implementation"],
  },
  {
    number: "03",
    icon: <MousePointer2 size={26} strokeWidth={1.7} />,
    title: "Conversion focus",
    description: "Clear journeys and strong calls to action that make it simple for visitors to get in touch.",
    tags: ["Lead generation", "Thoughtful UX"],
  },
];

const concepts = [
  { category: "E-commerce concept", name: "Forma", subtitle: "An expressive storefront for everyday objects.", className: "forma" },
  { category: "Hospitality concept", name: "Solace", subtitle: "A calm digital home for a boutique retreat.", className: "solace" },
  { category: "SaaS concept", name: "Orbit", subtitle: "A focused interface for a modern team platform.", className: "orbit" },
];

function Brand({ light = false }: { light?: boolean }) {
  return (
    <a className={`brand ${light ? "brand-light" : ""}`} href="#top" aria-label="G7X Studios home">
      <span className="brand-mark">G<span>7</span>X<span className="brand-dot">.</span></span>
      <span className="brand-name">STUDIOS</span>
    </a>
  );
}

function SectionLabel({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <span className={`section-label ${light ? "section-label-light" : ""}`}><span className="label-square" />{children}</span>;
}

export default function Home() {
  return (
    <main id="top">
      <div className="announcement"><span className="announcement-spark">✳</span> YOUR NEXT BIG IDEA DESERVES A GREAT WEBSITE <span className="announcement-spark">✳</span></div>
      <header className="site-header wrap">
        <Brand />
        <nav aria-label="Main navigation" className="desktop-nav">
          <a href="#services">Services</a><a href="#work">Our work</a><a href="#approach">Approach</a>
        </nav>
        <a className="header-cta" href="#contact">Let&apos;s talk</a>
      </header>

      <section className="hero wrap" aria-labelledby="hero-title">
        <div className="hero-copy">
          <SectionLabel>INDEPENDENT WEB DESIGN & DEVELOPMENT STUDIO</SectionLabel>
          <h1 id="hero-title">Websites that <span>look sharp.</span><br />Work harder.</h1>
          <p>We build striking, purposeful websites that help ambitious businesses stand out, earn trust, and turn visitors into conversations.</p>
          <div className="hero-actions"><a className="button button-dark" href="#contact">Start a project</a><a className="text-link" href="#work">Explore our work</a></div>
          <div className="hero-note"><span className="note-line" /> Design with intent. Built for impact.</div>
        </div>
        <div className="hero-visual" aria-label="Illustrative website design mockups">
          <div className="visual-orbit visual-orbit-one" /><div className="visual-orbit visual-orbit-two" />
          <div className="visual-caption">CREATIVE THINKING<br />MEETS CLEAN CODE <Sparkles size={20} /></div>
          <div className="mockup main-mockup">
            <div className="mockup-top"><span className="mockup-dots"><i /><i /><i /></span><span className="mockup-url">g7x.studio / possibilities</span><span>↗</span></div>
            <div className="mockup-content"><div className="mockup-nav"><strong>MODERN<span>FORM</span></strong><span>Menu&nbsp; ☰</span></div><div className="mockup-product"><span className="mockup-kicker">OBJECTS FOR LIVING</span><span className="mockup-heading">MAKE<br />ROOM FOR<br /><em>BETTER.</em></span><span className="mockup-small">Curated pieces for a life well lived.</span><div className="product-shape product-shape-one" /><div className="product-shape product-shape-two" /></div></div>
          </div>
          <div className="floating-card"><span className="floating-badge"><Sparkles size={16} /></span><strong>Built to<br />stand out.</strong><small>DESIGN + DEVELOPMENT</small></div>
          <span className="visual-side-text">G7X / DIGITAL EXPERIENCES</span>
        </div>
      </section>

      <div className="marquee" aria-hidden="true"><div className="marquee-track">DESIGN THAT CONNECTS <span>✳</span> DEVELOPMENT THAT DELIVERS <span>✳</span> IDEAS THAT MOVE FORWARD <span>✳</span> DESIGN THAT CONNECTS <span>✳</span> DEVELOPMENT THAT DELIVERS <span>✳</span></div></div>

      <section id="services" className="services section-pad wrap">
        <div className="section-intro"><div><SectionLabel>WHAT WE DO</SectionLabel><h2>Your vision, <em>built better.</em></h2></div><p>From first impression to final click, we bring design and development together to create websites with a job to do.</p></div>
        <div className="service-grid">{services.map(service => <article className="service-card" key={service.number}><div className="service-card-top"><span>{service.number} /</span><span className="service-icon">{service.icon}</span></div><h3>{service.title}</h3><p>{service.description}</p><div className="service-tags">{service.tags.map(tag => <span key={tag}>{tag}</span>)}</div></article>)}</div>
      </section>

      <section id="work" className="work-section section-pad">
        <div className="wrap"><div className="section-intro work-intro"><div><SectionLabel light>SELECTED CONCEPTS</SectionLabel><h2>Good ideas deserve<br /><em>great execution.</em></h2></div><div className="work-intro-right"><p>A look at the kind of thoughtful, tailored experiences we love creating.</p><span>Illustrative concepts — project portfolio coming soon.</span></div></div>
          <div className="work-grid">{concepts.map((project, index) => <article className={`project-card ${project.className}`} key={project.name}><div className="project-art"><div className="project-browser"><span /><span /><span /></div>{index === 0 ? <div className="project-forma"><small>FORMA / OBJECTS FOR LIFE</small><strong>Everyday,<br /><em>elevated.</em></strong><div className="forma-object"><div /></div><span>Discover the collection</span></div> : index === 1 ? <div className="project-solace"><small>SOLACE&nbsp;&nbsp; • &nbsp;&nbsp;STAYS</small><strong>Pause.<br />You&apos;re here.</strong><span>Escape to somewhere slower.</span><div className="solace-sun" /><div className="solace-hill solace-hill-one" /><div className="solace-hill solace-hill-two" /></div> : <div className="project-orbit"><div className="orbit-sidebar"><span>◉</span><span>▦</span><span>◫</span><span>⚙</span></div><div className="orbit-content"><small>GOOD MORNING, TEAM</small><strong>Work in<br />your orbit.</strong><div className="orbit-chart"><i /><i /><i /><i /><i /><i /><i /></div><div className="orbit-pills"><span>Projects</span><span>Overview</span></div></div></div>}</div><div className="project-info"><div><span>{project.category}</span><h3>{project.name}</h3><p>{project.subtitle}</p></div><span className="project-icon"><Sparkles size={19} /></span></div></article>)}</div>
        </div>
      </section>

      <section id="approach" className="approach section-pad wrap"><div className="approach-copy"><SectionLabel>HOW WE WORK</SectionLabel><h2>Small studio.<br /><em>Big-picture thinking.</em></h2><p>Good websites begin with good questions. We learn what matters to your business, then shape the design and build around a clear goal.</p><a href="#contact" className="button button-dark">Tell us your idea</a></div><div className="steps"><div><span>01</span><div><h3>Discover</h3><p>We get to know your goals, audience, and the experience you want to create.</p></div></div><div><span>02</span><div><h3>Design</h3><p>We turn the strategy into a visual direction that feels unmistakably yours.</p></div></div><div><span>03</span><div><h3>Develop</h3><p>We build, refine, and prepare your site for a confident launch.</p></div></div></div></section>

      <section className="contact-section" id="contact"><div className="wrap contact-grid"><div className="contact-copy"><SectionLabel light>LET&apos;S MAKE SOMETHING GREAT</SectionLabel><h2>Have a project<br />in <em>mind?</em></h2><p>Tell us a little about what you&apos;re building. We&apos;ll take it from there.</p><div className="contact-deco">LET&apos;S<br /><span>BUILD</span><br />IT.</div></div><ContactForm /></div></section>
      <footer className="footer"><div className="wrap footer-main"><div><Brand light /><p>Thoughtful websites for people going places.</p></div><div className="footer-links"><a href="#services">Services</a><a href="#work">Concepts</a><a href="#approach">Approach</a><a href="#contact">Contact</a></div></div><div className="wrap footer-bottom"><span>© {new Date().getFullYear()} G7X Studios. Made with purpose.</span><a href="#top">Back to top</a></div></footer>
    </main>
  );
}
