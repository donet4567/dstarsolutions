"use client";

import { useState } from "react";
import { Arrow, Star } from "./Brand";
import styles from "./ServiceShowcase.module.css";

const tasks = ["Shape the idea", "Make it feel right", "Bring it to life"];

export default function ServiceShowcase() {
  const [mobile, setMobile] = useState(false);
  const [completed, setCompleted] = useState([true, true, false]);
  return <div className={styles.showcase}>
    <article className={styles.service} data-reveal data-depth-card="">
      <div className={styles.copy}><span className={styles.index}>01 / WEBSITES</span><h3>A presence that<br />feels like <em>you.</em></h3><p>Distinctive websites with a point of view. Designed to make people feel something, and built to turn that feeling into a connection.</p><div className={styles.tags}><span>Business websites</span><span>Landing pages</span><span>Portfolios</span></div><button className={styles.link} type="button" data-open-brief="Website">Let’s build your website <Arrow diagonal /></button></div>
      <div className={styles.websiteStage}>
        <div className={`${styles.demoToolbar} ${styles.previewToolbar}`}>
          <div className={styles.previewIntro}><span>ONE IDEA. EVERY SCREEN.</span><h4>Explore the live preview</h4><p id="preview-help">Tap to switch between Desktop and Mobile views</p></div>
          <div className={styles.previewToggle} role="group" aria-label="Website preview size" aria-describedby="preview-help">
            <button type="button" aria-pressed={!mobile} onClick={() => setMobile(false)}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8m-4-4v4" /></svg>Desktop view</button>
            <button type="button" aria-pressed={mobile} onClick={() => setMobile(true)}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M11 18h2" /></svg>Mobile view</button>
          </div>
        </div>
        <div className={styles.website} data-mobile={mobile} aria-label={`${mobile ? "Mobile" : "Desktop"} website concept preview`}>
          <div className={styles.browser}><span>● ● ●</span><span>yourbrand.design</span><span>↗</span></div>
          <div className={styles.websiteNav}><strong>yourbrand®</strong><span>About &nbsp; Work &nbsp; Contact</span></div>
          <div className={styles.websiteContent}><small>EXCEPTIONAL BY DESIGN</small><strong>Make an<br /><em>impression.</em></strong><span className={styles.pill}>Discover something different ↗</span><div className={styles.orb} aria-hidden="true"><Star /></div></div>
          <div className={styles.websiteBottom}><span>MADE WITH INTENTION.</span><span>SCROLL TO EXPLORE ↓</span></div>
        </div>
        <div className={styles.stageCaption}><span className={styles.dot} /><span>A little personality. Everywhere you go.</span><span>↗</span></div>
      </div>
    </article>
    <article className={`${styles.service} ${styles.application}`} data-reveal data-depth-card="">
      <div className={styles.copy}><span className={styles.index}>02 / WEB APPLICATIONS</span><h3>Less busywork.<br />More <em>possibility.</em></h3><p>Bring your people, processes, and possibilities together. Custom applications that make the complicated feel effortless.</p><div className={styles.tags}><span>Dashboards</span><span>Booking systems</span><span>Custom platforms</span></div><button className={styles.link} type="button" data-open-brief="Web application">Let’s simplify your workflow <Arrow diagonal /></button></div>
      <div className={styles.appStage}>
        <div className={styles.demoToolbar}><span>YOUR WORK. BEAUTIFULLY CONNECTED.</span><span className={styles.tryHint}>Try completing a task ↘</span></div>
        <div className={styles.dashboard}>
          <aside className={styles.sidebar} aria-hidden="true"><strong><Star /> flow.</strong><span>◫ &nbsp; Overview</span><span>▤ &nbsp; Projects</span><span>◷ &nbsp; Schedule</span><small>MADE FOR YOUR<br />KIND OF BUSINESS.</small></aside>
          <div className={styles.workspace}><div className={styles.workspaceHeader}><span>YOUR WORKSPACE</span><span className={styles.avatar}>Y</span></div><h4>Everything, in flow.</h4><p>A little clarity. A lot more possibility.</p><div className={styles.metrics}><div><span>Your project</span><strong>Taking shape <i>↗</i></strong></div><div><span>Progress</span><strong aria-live="polite">{completed.filter(Boolean).length} / 3 <i>↗</i></strong></div></div><div className={styles.progressTrack} aria-hidden="true"><span style={{ width: `${completed.filter(Boolean).length / 3 * 100}%` }} /></div><div className={styles.tasks}><span>SMALL STEPS. BIG POSSIBILITIES.</span>{tasks.map((task, index) => <label className={styles.task} key={task}><input type="checkbox" checked={completed[index]} onChange={() => setCompleted((previous) => previous.map((value, item) => item === index ? !value : value))} /><span>{task}</span><small>{completed[index] ? "Complete" : "In progress"}</small></label>)}</div></div>
        </div>
        <div className={styles.stageCaption}><span className={styles.dot} /><span>Interactive concept. Built around you.</span><span>↗</span></div>
      </div>
    </article>
  </div>;
}
