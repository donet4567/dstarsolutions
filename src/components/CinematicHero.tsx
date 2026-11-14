import { Arrow } from "./Brand";
import StudioWorld from "./StudioWorld";

export default function CinematicHero() {
  return <div className="orbit-story">
    <div className="flight-stage"><StudioWorld />
    <section className="orbit-hero container" id="top" aria-labelledby="hero-title">
      <div className="orbit-kicker"><span><i /> INDEPENDENT DIGITAL STUDIO</span><span>PALA, KERALA · INDIA</span></div>
      <p className="orbit-edition">WEB DESIGN / DEVELOPMENT / A DIFFERENT PERSPECTIVE</p>
      <h1 id="hero-title" data-title-motion="arrival">Small studio.<br /><span>Stellar <em>possibilities.</em></span></h1>
      <div className="orbit-hero-bottom"><p data-testid="hero-description">We turn ambitious ideas into<br />distinctive websites and web applications.<br /><span>Thoughtfully designed. Beautifully built.</span></p><a href="#selected-work" className="orbit-round" aria-label="Explore selected work"><Arrow diagonal /></a><a href="#packages" className="orbit-package">Explore Website Packages <Arrow diagonal /></a></div>
      <div className="orbit-coordinate"><a href="#studio"><span className="orbit-scroll-line" aria-hidden="true" />SCROLL TO FIND YOUR ORBIT</a><span>01 — IDEAS INTO IMPACT ↓</span></div>
    </section></div>
    <section className="orbit-manifesto container" id="studio" aria-labelledby="manifesto-title"><p className="eyebrow">01 / THE STUDIO</p><div><h2 id="manifesto-title" data-title-motion="turn">The world has enough<br />ordinary.<br /><em>Let’s make something<br />worth noticing.</em></h2><p>We’re D Star IT Solutions. An independent studio in Kerala bringing considered design and thoughtful development to businesses with somewhere to go.</p><a className="text-link" href="#services">Meet your next chapter <Arrow diagonal /></a></div><span className="orbit-note">ONE STAR.<br />ENDLESS DIRECTIONS.</span></section>
  </div>;
}
