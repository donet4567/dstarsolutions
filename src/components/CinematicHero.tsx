import { Arrow } from "./Brand";
import StudioWorld from "./StudioWorld";

export default function CinematicHero({showManifesto=true}:{showManifesto?:boolean}) {
  return <div className="orbit-story">
    <div className="flight-stage"><div className="flight-pin"><StudioWorld />
    <section className="orbit-hero container" id="top" aria-labelledby="hero-title">
      <div className="orbit-kicker"><span><i /> INDEPENDENT DIGITAL STUDIO</span><span>PALA, KERALA · INDIA</span></div>
      <p className="orbit-edition">WEB DESIGN / DEVELOPMENT / A DIFFERENT PERSPECTIVE</p>
      <div className="orbit-hero-main">
        <h1 id="hero-title" data-title-motion="arrival">Digital Excellence,<br /><span>Designed to <em>Impress.</em></span></h1>
        <div className="orbit-hero-bottom">
          <div className="orbit-hero-copy">
            <h2>Elevating Brands Through Digital Design.</h2>
            <p data-testid="hero-description">We craft exceptional websites that combine beautiful design, seamless experiences and thoughtful functionality, helping ambitious businesses stand out in the digital world.</p>
          </div>
          <div className="orbit-hero-actions">
            <a href="/pricing" className="orbit-package">Explore Website Packages <Arrow diagonal /></a>
            <a href="/work" className="orbit-round" aria-label="Explore selected work"><span>View work</span><Arrow diagonal /></a>
          </div>
        </div>
      </div>
      <div className="orbit-coordinate"><a href="#studio"><span className="orbit-scroll-line" aria-hidden="true" />SCROLL TO FIND YOUR ORBIT</a><span>01 — IDEAS INTO IMPACT ↓</span></div>
    </section></div></div>
    {showManifesto && <section className="orbit-manifesto container" id="studio" aria-labelledby="manifesto-title"><p className="eyebrow">01 / THE STUDIO</p><div><h2 id="manifesto-title" data-title-motion="turn">The world has enough<br />ordinary.<br /><em>Let’s make something<br />worth noticing.</em></h2><p>We’re D Star Solutions. An independent studio in Kerala bringing considered design and thoughtful development to businesses with somewhere to go.</p><a className="text-link" href="/services">Meet your next chapter <Arrow diagonal /></a></div><span className="orbit-note">ONE STAR.<br />ENDLESS DIRECTIONS.</span></section>}
  </div>;
}
