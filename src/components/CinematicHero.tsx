import { Arrow } from "./Brand";
import OrbitSculpture from "./OrbitSculpture";

export default function CinematicHero() {
  return <div className="orbit-story">
    <OrbitSculpture />
    <section className="orbit-hero container" id="top" aria-labelledby="hero-title">
      <div className="orbit-kicker"><span><i /> INDEPENDENT DIGITAL STUDIO</span><span>PALA, KERALA · INDIA</span></div>
      <p className="orbit-edition">D STAR 2.0 / A NEW PERSPECTIVE</p>
      <h1 id="hero-title">Small studio.<br /><span>Stellar</span><br /><em>possibilities.</em></h1>
      <div className="orbit-hero-bottom"><p data-testid="hero-description">We turn ambitious ideas into<br />distinctive websites and web applications.<br /><span>Thoughtfully designed. Beautifully built.</span></p><a href="#selected-work" className="orbit-round" aria-label="Explore selected work"><Arrow diagonal /></a><a href="#packages" className="orbit-package">Explore Website Packages <Arrow diagonal /></a></div>
      <div className="orbit-coordinate"><span>SCROLL TO FIND YOUR ORBIT</span><span>01 — IDEAS INTO IMPACT ↓</span></div>
    </section>
    <section className="orbit-manifesto container" aria-labelledby="manifesto-title"><p className="eyebrow">01 / THE STUDIO</p><div><h2 id="manifesto-title">The world has enough<br />ordinary.<br /><em>Let’s make something<br />worth noticing.</em></h2><p>We’re D Star IT Solutions. An independent studio in Kerala bringing considered design and thoughtful development to businesses with somewhere to go.</p><a className="text-link" href="#services">Meet your next chapter <Arrow diagonal /></a></div><span className="orbit-note">ONE STAR.<br />ENDLESS DIRECTIONS.</span></section>
  </div>;
}
