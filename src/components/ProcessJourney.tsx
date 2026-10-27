import type { CSSProperties } from "react";
import { Arrow } from "./Brand";

const steps = [
  ["Discover", "Every great build starts with a conversation. We get to know your business, your people, and your ambition.", "Clarity before anything.", "01 — LISTEN & UNDERSTAND"],
  ["Design", "We turn the idea into an intuitive experience, with thoughtful layouts and a visual language that feels like you.", "Purpose in every pixel.", "02 — EXPLORE & REFINE"],
  ["Develop", "We bring the design to life with responsive, reliable code and the integrations your business needs.", "Built to work beautifully.", "03 — BUILD & CONNECT"],
  ["Deliver", "We test the details, launch with care, and help your product find its feet in the real world.", "Ready for what’s next.", "04 — POLISH & LAUNCH"],
];

export default function ProcessJourney() {
  return <section className="process-section section-space container" id="process" aria-labelledby="process-title" data-depth-section="">
    <div className="process-stage">
      <div className="section-heading"><div><p className="eyebrow"><span className="section-dash" /> 05 / HOW WE GET THERE</p><h2 id="process-title">A clear path from<br />idea to <em>impact.</em></h2></div><p className="section-intro">One considered step at a time.<br />A shared ambition, brought to life.</p><div className="process-index" aria-hidden="true"><span>DISCOVER</span><span>DESIGN</span><span>DEVELOP</span><span>DELIVER</span></div></div>
      <div className="process-grid">{steps.map(([title, detail, caption, label], index) => <article className="process-step" key={title} style={{ "--step": index } as CSSProperties}>
        <div className="process-step-top"><span>0{index + 1}</span><Arrow /></div><span className="process-card-label">{label}</span><h3>{title}</h3><p>{detail}</p><small>{caption}</small><div className="process-card-art" aria-hidden="true"><span /><span /><span /></div>
      </article>)}</div>
    </div>
  </section>;
}
