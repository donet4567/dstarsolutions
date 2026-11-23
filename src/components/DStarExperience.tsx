import Link from "next/link";
import { Arrow } from "./Brand";
import CinematicHero from "./CinematicHero";
import PageFrame from "./PageFrame";
import BusinessShowcase from "./BusinessShowcase";

export default function DStarExperience() {
  return <PageFrame home>
    <CinematicHero showManifesto={false} />
    <section className="home-directory-section container" aria-label="Explore D Star Solutions">
      <div className="home-directory-header">
        <p className="eyebrow"><span className="section-dash" /> 01 / STUDIO DIRECTORY</p>
        <p className="home-directory-lead">Websites, web applications and honest pricing, made by one small studio in Pala, Kerala.</p>
      </div>

      <ol className="studio-index">
        <li>
          <Link href="/work" prefetch={false} className="index-row index-row--work">
            <span className="index-num">01</span>
            <span className="index-label">Selected work</span>
            <h2 className="index-title">See our work.</h2>
            <p className="index-note">Live case studies, from rental platforms and hiring tools to local business sites.</p>
            <span className="index-arrow" aria-hidden="true"><Arrow diagonal /></span>
            <span className="index-peek" aria-hidden="true">
              <img src="/selected-work/hirevify-640.webp" alt="" width={640} height={360} loading="lazy" decoding="async" />
            </span>
          </Link>
        </li>
        <li>
          <Link href="/services" prefetch={false} className="index-row index-row--services">
            <span className="index-num">02</span>
            <span className="index-label">Capabilities</span>
            <h2 className="index-title">Websites &amp; web apps.</h2>
            <p className="index-note">Business websites, booking flows, dashboards and customer portals, designed and built in-house.</p>
            <span className="index-arrow" aria-hidden="true"><Arrow diagonal /></span>
          </Link>
        </li>
        <li>
          <Link href="/pricing" prefetch={false} className="index-row index-row--pricing">
            <span className="index-num">03</span>
            <span className="index-label">Pricing</span>
            <h2 className="index-title">Websites from <span className="inr">₹</span>8,000.</h2>
            <p className="index-note">One-time development fee. Domain and hosting extra. Every package scoped in writing.</p>
            <span className="index-arrow" aria-hidden="true"><Arrow diagonal /></span>
          </Link>
        </li>
      </ol>

      <div className="home-links">
        <Link href="/about" prefetch={false}><span>Meet the studio</span><Arrow diagonal /></Link>
        <Link href="/contact" prefetch={false}><span>Start a conversation</span><Arrow diagonal /></Link>
      </div>
    </section>
    <BusinessShowcase source="home" />
  </PageFrame>;
}
