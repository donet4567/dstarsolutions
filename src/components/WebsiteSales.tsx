import Link from "next/link";
import { Arrow, Brand, Star } from "./Brand";
import { defaultWhatsApp, DISPLAY_PHONE, PHONE, whatsappUrl } from "./site";
import { exclusions, faqs, packages, packageWhatsApp } from "./website-content";
export { default as FloatingWhatsApp } from "./FloatingWhatsApp";

export function WebsiteBenefits() {
  return <section className="sales-benefits container" id="services" aria-labelledby="benefits-title">
    <div><p className="eyebrow"><span className="section-dash" /> MADE FOR YOUR EVERYDAY BUSINESS</p><h2 id="benefits-title">A small investment.<br /><em>A stronger first impression.</em></h2></div>
    <div className="benefit-grid">{[["Look the part.", "Give customers a professional place to discover your business, services and work."], ["Be easy to reach.", "Turn interest into a conversation with WhatsApp enquiries, contact details and directions."], ["Feel right on every screen.", "A fast, mobile-friendly website that makes browsing your business simple."]].map(([title, text], index) => <article key={title}><span className="sales-number">0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
  </section>;
}

export function WebsitePackages({ showGuide = true }: { showGuide?: boolean }) {
  return <section className="sales-section pricing-section" id="packages" aria-labelledby="packages-title"><div className="container">
    <div className="sales-heading"><div><p className="eyebrow"><span className="section-dash" /> THOUGHTFUL WEBSITES. CLEAR PACKAGES.</p><h2 id="packages-title">Premium in feel.<br /><em>Practical in price.</em></h2></div><p>Choose a starting point that fits your business.<br />We’ll take care of the details, together.</p></div>
    <div className="pricing-grid">{packages.map((plan, index) => <article className={`price-card ${index === 0 ? "price-card-featured" : ""}`} key={plan.id} aria-labelledby={`plan-${plan.id}`}>
      <div className="plan-kicker"><span>0{index + 1} / {index === 0 ? "YOUR STARTING POINT" : index === 1 ? "ROOM TO GROW" : "DISTINCTIVELY YOURS"}</span><Star /></div>
      <h3 id={`plan-${plan.id}`}>{plan.name}</h3><p className="plan-audience">{plan.audience}</p><p className="plan-price">{plan.price}<span>starting development fee</span></p><a className={`button ${index === 0 ? "sales-primary" : "sales-secondary"}`} href={packageWhatsApp(plan)} target="_blank" rel="noreferrer" aria-label={`Choose This Package: ${plan.name}`}>Choose This Package <Arrow diagonal /></a>
      <p className="plan-note">{plan.note}</p><ul>{plan.features.map((feature) => <li key={feature}><span aria-hidden="true">✓</span>{feature}</li>)}</ul>
    </article>)}</div>
    <div className="pricing-disclosure"><Star /><div><h3>A clear scope, from the start.</h3><p>{exclusions}</p></div></div>
    {showGuide && <Link className="text-link sales-package-link" href="/small-business-websites">Explore the small business website guide <Arrow diagonal /></Link>}
  </div></section>;
}

export function WhyDStar() {
  return <section className="studio-section sales-studio" id="engineering" aria-labelledby="studio-title"><div className="container studio-grid">
    <div className="studio-copy"><p className="eyebrow"><span className="section-dash" /> THE D STAR DIFFERENCE</p><h2 id="studio-title">Small by choice.<br />Personal<br /><em>by design.</em></h2><p>A focused studio in Bharananganam, Pala, working with businesses across Kottayam, Kerala and beyond. You speak directly with the person shaping your website.</p><a className="text-link" href="#contact">Tell us about your business <Arrow /></a></div>
    <div className="principles">{[["Design that feels like your business.", "Considered typography, responsive layouts and details that help customers find what they need."], ["Clear prices. Honest conversations.", "An agreed scope, defined revision rounds and a clear explanation of additional costs before work begins."], ["One studio, from brief to launch.", "A direct conversation throughout design, development and launch. Your business stays at the centre."]].map(([title, text], index) => <article key={title}><span className="principle-number">0{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div><Star /></article>)}</div>
  </div></section>;
}

export function CustomApplications() {
  return <section className="custom-apps container" id="custom-applications" aria-labelledby="custom-apps-title"><div className="custom-apps-art" aria-hidden="true"><span>BUILT AROUND YOUR WORK</span><div><i /><i /><i /></div><Star /><p>A clearer way<br />to work.</p></div><div><p className="eyebrow"><span className="section-dash" /> NEED SOMETHING MORE?</p><h2 id="custom-apps-title">Beyond a website.<br /><em>Built around you.</em></h2><p>Booking workflows, dashboards, customer logins or a connected business platform. We also design and develop custom web applications, with scope and pricing tailored to your requirements.</p><p className="custom-note">Custom applications are quoted separately from website packages.</p><button className="button sales-secondary" type="button" data-open-brief="Web application" data-package="Custom web application">Request Custom Quote <Arrow diagonal /></button></div></section>;
}

export function SimpleProcess() {
  return <section className="sales-section container simple-process" id="process" aria-labelledby="process-title"><div className="sales-heading"><div><p className="eyebrow"><span className="section-dash" /> FROM HELLO TO ONLINE</p><h2 id="process-title">Four steps.<br /><em>One clear path.</em></h2></div><p>You bring your business.<br />We help give it a home online.</p></div><ol className="simple-process-grid">{[["Let’s talk", "Tell us about your business. We agree on the package, scope, costs and what you need to supply."], ["Shape the design", "We arrange your content into a considered visual design and review it with you."], ["Build & refine", "We develop your responsive website and make changes within your included revision rounds."], ["Check & launch", "We check layouts, links and enquiries, then connect your domain and agreed hosting."]].map(([title, detail], index) => <li key={title}><span className="sales-number">0{index + 1}</span><h3>{title}</h3><p>{detail}</p></li>)}</ol></section>;
}

export function WebsiteFAQ() {
  return <section className="sales-section faq-section container" id="faq" aria-labelledby="faq-title"><div><p className="eyebrow"><span className="section-dash" /> A LITTLE MORE CLARITY</p><h2 id="faq-title">Good questions.<br /><em>Straight answers.</em></h2><p>Still weighing things up?<br /><a className="text-link" href={defaultWhatsApp} target="_blank" rel="noreferrer">Ask us on WhatsApp <Arrow diagonal /></a></p></div><div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>;
}

export function EnquirySection() {
  return <section className="contact-section container" id="contact" aria-labelledby="contact-title"><div className="contact-panel"><div className="contact-panel-top"><p className="eyebrow"><span className="status-dot" /> YOUR BUSINESS DESERVES A BEAUTIFUL WEBSITE</p><Star /></div><div className="contact-content"><h2 id="contact-title">Your next customer<br />could start <em>here.</em></h2><div><p>Tell us what you do. We’ll help you find the right website package, starting at ₹8,000.</p><button className="button button-dark" type="button" data-open-brief="Website">Get a Free Quote <Arrow diagonal /></button></div></div><div className="contact-panel-bottom"><span>ONE-TIME DEVELOPMENT FEE. DOMAIN & HOSTING EXTRA.</span><a href={whatsappUrl("Hello D Star, I would like a free quote for a business website. Please help me choose a package.")} target="_blank" rel="noreferrer">Get a Free Quote on WhatsApp <Arrow diagonal /></a></div></div></section>;
}

export function SiteFooter() {
  return <footer className="footer container"><div className="footer-grid"><div className="footer-identity"><Link className="brand-link" href="/" title="D Star home"><Brand footer /></Link><p>Thoughtfully designed.<br />Beautifully engineered. From Kerala.</p></div><nav className="footer-explore" aria-label="Footer navigation"><p className="footer-label">Explore</p><Link href="/small-business-websites">Website packages</Link><a href="#business-websites">Business examples</a><a href="#selected-work">Selected work</a><a href="#process">Our process</a></nav><div className="footer-contact"><p className="footer-label">Let’s build your business website</p><a className="footer-contact-phone" href={`tel:+${PHONE}`}>{DISPLAY_PHONE} <Arrow diagonal /></a><a className="footer-whatsapp" href={defaultWhatsApp} target="_blank" rel="noreferrer"><span className="footer-contact-dot" /> Talk to us on WhatsApp <Arrow diagonal /></a><address>Bharananganam, Pala<br />Kerala, India</address></div></div><div className="footer-meta"><span>© {new Date().getFullYear()} D Star IT Solutions. Made with intention.</span><a href="#top">Back to top <span aria-hidden="true">↑</span></a></div></footer>;
}
