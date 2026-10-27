import SelectedWork from "./SelectedWork";
import SiteHeader from "./SiteHeader";
import ProjectBrief from "./ProjectBrief";
import { Arrow, Star, ServiceIcon, Brand } from "./Brand";
import { defaultWhatsApp } from "./site";

const steps = [
  ["Discover", "Every great build starts with a conversation. We get to know your business, your people, and your ambition.", "Clarity before anything."],
  ["Design", "We turn the idea into an intuitive experience, with thoughtful layouts and a visual language that feels like you.", "Purpose in every pixel."],
  ["Develop", "We bring the design to life with responsive, reliable code and the integrations your business needs.", "Built to work beautifully."],
  ["Deliver", "We test the details, launch with care, and help your product find its feet in the real world.", "Ready for what’s next."],
];

function HeroPreview() {
 return <div className="hero-art premium-art" aria-label="A soft sculptural bloom representing ideas coming to life">
 <div className="art-grid" aria-hidden="true" />
 <div className="orbit-label"><span className="status-dot" /> DESIGN MEETS ENGINEERING</div>
 <div className="bloom-sculpture" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <span className={`bloom-petal petal-${index}`} key={index} />)}<span className="bloom-center" /></div><div className="idea-chip"><span /> A little idea. Endless possibility.</div>
 <div className="art-spec"><span>THOUGHTFULLY SHAPED</span><span>MADE FOR YOU ↗</span></div>
 <div className="floating-note"><span className="note-icon"><ServiceIcon app /></span><div><strong>Made to feel right.</strong><span>In every little detail.</span></div><Arrow diagonal /></div>
 </div>;
}

export default function DStarExperience() {
  return <ProjectBrief>
    <a href="#main" className="skip-link">Skip to content</a>
    <SiteHeader />
      <main id="main">
        <section className="hero container" id="top" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow"><span className="status-dot" /> INDEPENDENT DIGITAL STUDIO · KERALA</p>
            <h1 id="hero-title">Your next<br />big thing.<br /><em>Built different.</em></h1>
            <p className="hero-description">We turn ambitious ideas into distinctive websites and powerful web apps. Thoughtfully designed. Precisely engineered. Entirely yours.</p>
            <div className="hero-actions"><button className="button button-gold" type="button" data-open-brief="">Start your project <Arrow diagonal /></button><a className="text-link" href="#services">Discover our expertise <Arrow /></a></div>
          </div>
          <HeroPreview />
          <div className="hero-bottom"><span><i className="location-dot" /> ROOTED IN KERALA. BUILT FOR EVERYWHERE.</span><a href="#services">SCROLL TO EXPLORE <span>↓</span></a></div>
        </section>
        <div className="discipline-strip" aria-label="Our disciplines"><div className="container"><span>Thoughtful design</span><Star /><span>Purposeful engineering</span><Star /><span>Seamless experiences</span><Star /><span>Lasting impact</span><Star /></div></div>
        <section className="services section-space container" id="services" aria-labelledby="services-title">
          <div className="section-heading" data-reveal><div><p className="eyebrow"><span className="section-dash" /> 01 / WHAT WE DO</p><h2 id="services-title">Digital experiences.<br /><span className="muted">Real-world impact.</span></h2></div><p className="section-intro">We keep our focus sharp, so every detail gets the attention it deserves. From your first impression to your everyday operations.</p></div>
          <div className="service-grid">
            <article className="service-card" data-reveal>
              <div className="service-card-top"><span className="service-icon"><ServiceIcon /></span><span className="card-number">01 — WEBSITES</span></div><h3>A presence that<br />feels like <em>you.</em></h3><p>Beautiful, fast, intuitive websites that tell your story and turn a first visit into a lasting connection.</p><div className="service-tags"><span>Business websites</span><span>Landing pages</span><span>Portfolios</span></div>
              <div className="website-preview" aria-hidden="true"><div className="preview-browser"><span><i /><i /><i /></span><small>your next chapter</small><span>↗</span></div><div className="preview-website"><div className="preview-site-nav"><strong>yourbrand<span>®</span></strong><span>About &nbsp; Work &nbsp; Contact</span></div><div className="preview-site-content"><small>EXCEPTIONAL BY DESIGN</small><strong>Make an<br /><em>impression.</em></strong><span className="preview-site-button">Discover something different <span>↗</span></span></div><Star className="preview-site-star" /></div></div>
              <button className="service-link" type="button" data-open-brief="Website"><span>Let’s build your website</span><span className="circle-arrow"><Arrow diagonal /></span></button>
            </article>
            <article className="service-card app-card" data-reveal>
              <div className="service-card-top"><span className="service-icon"><ServiceIcon app /></span><span className="card-number">02 — WEB APPLICATIONS</span></div><h3>Less busywork.<br />More <em>possibility.</em></h3><p>Custom web applications that simplify the complex and work the way your business actually works.</p><div className="service-tags"><span>Dashboards</span><span>Booking systems</span><span>Custom platforms</span></div>
              <div className="app-preview" aria-hidden="true"><div className="app-sidebar"><span className="app-logo"><Star /> workspace</span><span className="app-sidebar-active">◫ &nbsp; Overview</span><span>▤ &nbsp; Projects</span><span>◷ &nbsp; Schedule</span><span>⚙ &nbsp; Settings</span><small>BUILT AROUND YOU</small></div><div className="app-window"><div className="app-window-top"><strong>Everything, in flow.</strong><span className="app-avatar">Y</span></div><small>A little clarity. A lot more possibility.</small><div className="app-metrics"><div><span>Plan</span><strong>Stay focused <i>↗</i></strong></div><div><span>Progress</span><strong>Keep moving <i>↗</i></strong></div></div><div className="app-tasks"><span>YOUR WORK, CONNECTED <i>•••</i></span><div><b className="task-check">✓</b><span>One clear overview</span><small>Complete</small></div><div><b className="task-check">✓</b><span>A smoother workflow</span><small>Complete</small></div><div><b className="task-current" /><span>Your next big thing</span><small className="task-progress">In progress</small></div></div></div></div>
              <button className="service-link" type="button" data-open-brief="Web application"><span>Let’s simplify your workflow</span><span className="circle-arrow"><Arrow diagonal /></span></button>
            </article>
          </div><p className="services-note"><Star /> From the first sketch to the final launch. One team, every detail.</p>
        </section>
        <SelectedWork />
        <section className="studio-section" id="engineering" aria-labelledby="studio-title"><div className="container studio-grid">
          <div className="studio-copy" data-reveal><p className="eyebrow"><span className="section-dash" /> 02 / THE D STAR DIFFERENCE</p><h2 id="studio-title">Small by choice.<br />Exceptional<br /><em>by intention.</em></h2><p>You work directly with the people building your product. No layers, no lost-in-translation moments. Just a focused studio that cares about your business as much as the build.</p><a className="text-link" href="#process">Get to know our approach <Arrow /></a></div>
          <div className="principles" data-reveal><article><span className="principle-number">01</span><div><h3>Design with a purpose.</h3><p>Every layout, interaction, and detail works towards a clearer, more enjoyable experience.</p></div><Star /></article><article><span className="principle-number">02</span><div><h3>Beauty, backed by substance.</h3><p>Responsive interfaces, accessible interactions, and maintainable code. A strong foundation beneath the surface.</p></div><Star /></article><article><span className="principle-number">03</span><div><h3>Your ambition. Our attention.</h3><p>A considered process, honest conversations, and care that carries through to launch.</p></div><Star /></article><div className="stack-block"><p>MODERN TOOLS. MEANINGFUL OUTCOMES.</p><div>{["Next.js", "React", "TypeScript", "PostgreSQL"].map((item, i) => <span key={item}><b>{["N", "⚛", "TS", "P"][i]}</b>{item}</span>)}</div></div></div>
        </div></section>
        <section className="process-section section-space container" id="process" aria-labelledby="process-title"><div className="section-heading" data-reveal><div><p className="eyebrow"><span className="section-dash" /> 03 / HOW WE GET THERE</p><h2 id="process-title">A clear path from<br />idea to <em>impact.</em></h2></div><p className="section-intro">Good things don’t happen by accident.<br />Here’s how we make them happen, together.</p></div><div className="process-grid">{steps.map(([title, detail, caption], index) => <article className="process-step" key={title} data-reveal><div className="process-step-top"><span>0{index + 1}</span><Arrow /></div><h3>{title}</h3><p>{detail}</p><small>{caption}</small></article>)}</div></section>
        <section className="contact-section container" id="contact" aria-labelledby="contact-title"><div className="contact-panel" data-reveal><div className="contact-panel-top"><p className="eyebrow"><span className="status-dot" /> YOUR NEXT CHAPTER STARTS HERE</p><Star /></div><div className="contact-content"><h2 id="contact-title">Have a good idea?<br />Let’s make it <em>great.</em></h2><div><p>A rough idea. A fresh start. A problem worth solving.<br />Whatever it is, we’d love to hear it.</p><button className="button button-dark" type="button" data-open-brief="">Start a conversation <Arrow diagonal /></button></div></div><div className="contact-panel-bottom"><span>GOOD WORK BEGINS WITH A HELLO.</span><a href={defaultWhatsApp} target="_blank" rel="noreferrer">Say hello on WhatsApp <Arrow diagonal /></a></div></div></section>
      </main>
      <footer className="footer container">
        <div className="footer-grid">
          <div className="footer-identity"><a className="brand-link" href="#top" aria-label="D Star IT Solutions home"><Brand footer /></a><p>Thoughtfully designed.<br />Beautifully engineered. From Kerala.</p></div>
          <nav className="footer-explore" aria-label="Footer navigation"><p className="footer-label">Explore</p><a href="#services">What we do</a><a href="#selected-work">Selected work</a><a href="#process">Our process</a><a href="#engineering">The studio</a></nav>
          <div className="footer-contact"><p className="footer-label">Let’s make something great</p><a className="footer-contact-phone" href="tel:+917558920076">+91 75589 20076 <Arrow diagonal /></a><a className="footer-whatsapp" href={defaultWhatsApp} target="_blank" rel="noreferrer"><span className="footer-contact-dot" /> Talk to us on WhatsApp <Arrow diagonal /></a><address>Bharananganam, Pala<br />Kerala, India</address></div>
        </div>
        <div className="footer-meta"><span>© {new Date().getFullYear()} D Star IT Solutions. Made with intention.</span><a href="#top">Back to top <span aria-hidden="true">↑</span></a></div>
      </footer>
  </ProjectBrief>;
}
