import { Arrow } from "./Brand";
import styles from "./FounderNote.module.css";

export default function FounderNote() {
  return <section className={`${styles.section} container`} aria-labelledby="founder-title">
    <div className={styles.note} data-reveal>
      <p className={`eyebrow ${styles.label}`}><span className="section-dash" /> A NOTE FROM THE FOUNDER</p>
      <div className={styles.editorial}>
        <h2 id="founder-title" className={styles.reveal}>Great ideas deserve to become <em>something real.</em></h2>
        <div className={styles.body}>
          <blockquote className={styles.reveal}>“I started D Star IT Solutions with a simple belief: technology should make things easier, not more complicated. Every project is an opportunity to turn an idea into something useful, thoughtful, and built to last.”</blockquote>
          <div className={`${styles.signature} ${styles.reveal}`}><span className={styles.monogram} aria-hidden="true">DJ</span><p><span>Donet Joseph</span><small>Founder · D Star IT Solutions</small></p></div>
          <div className={`${styles.invitation} ${styles.reveal}`}><p>Have an idea worth building?</p><button type="button" data-open-brief="" className={styles.cta}>Let’s build it <Arrow /></button></div>
        </div>
      </div>
    </div>
  </section>;
}
