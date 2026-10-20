"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./SelectedWork.module.css";

const projects = [
  {
    name: "Mecardee Rental Management",
    slug: "mecardee-autocraft",
    category: "Automotive · Digital experience",
    description: "An automotive service and digital brand experience.",
    alt: "Mecardee Rental Management web application concept preview",
  },
  {
    name: "Mecardee Manager",
    slug: "mecardee-manager",
    category: "Expense & work management",
    description: "A web app for expenses, budgets and work management.",
    alt: "Mecardee Manager expense and work-management app concept preview",
  },
  {
    name: "HireVify",
    slug: "hirevify",
    category: "Recruitment · Digital platform",
    description: "A digital platform for recruitment and skills-based hiring.",
    alt: "HireVify recruitment and skills-based hiring platform concept preview",
  },
] as const;

type Frame = { left: number; top: number; width: number };

function ProjectArtwork({ index, sizes, onLoad, onError }: {
  index: number;
  sizes: string;
  onLoad?: () => void;
  onError?: () => void;
}) {
  const project = projects[index];
  const sourceSet = (format: string) => [640, 960, 1440]
    .map((width) => `/selected-work/${project.slug}-${width}.${format} ${width}w`).join(", ");

  // The pack already supplies optimized, correctly sized encodings. Preserve them
  // with picture sources; mount only after an explicit preview interaction.
  return <picture>
    <source type="image/avif" srcSet={sourceSet("avif")} sizes={sizes} />
    <source type="image/webp" srcSet={sourceSet("webp")} sizes={sizes} />
    <Image src={`/selected-work/${project.slug}-960.webp`} alt={project.alt}
      width={960} height={540} unoptimized loading="eager" decoding="async"
      onLoad={onLoad} onError={onError} />
  </picture>;
}

function PreviewArrow() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" /></svg>;
}

export default function SelectedWork() {
  const [active, setActive] = useState<number | null>(null);
  const [displayed, setDisplayed] = useState<number | null>(null);
  const [visited, setVisited] = useState(0);
  const [failed, setFailed] = useState(0);
  const [frame, setFrame] = useState<Frame | null>(null);
  const [modalProject, setModalProject] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const rows = useRef<(HTMLButtonElement | null)[]>([]);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const hovered = useRef<number | null>(null);
  const focused = useRef<number | null>(null);
  const pending = useRef<number | null>(null);
  const ready = useRef(0);
  const suppressFocus = useRef(false);
  const scrollPosition = useRef({ x: 0, y: 0 });

  const dismissPreview = useCallback(() => {
    hovered.current = null;
    focused.current = null;
    pending.current = null;
    setActive(null);
  }, []);

  const showPreview = (index: number) => {
    const row = rows.current[index];
    if (!row || modalProject !== null || dialog.current?.open || document.querySelector("dialog[open]")) return;
    if (!window.matchMedia("(min-width: 761px)").matches) return;

    const bounds = row.getBoundingClientRect();
    const viewport = window.visualViewport;
    const viewportLeft = viewport?.offsetLeft ?? 0;
    const viewportTop = viewport?.offsetTop ?? 0;
    const viewportWidth = viewport?.width ?? window.innerWidth;
    const viewportHeight = viewport?.height ?? window.innerHeight;
    const safeTop = Math.max(viewportTop + 16, (document.querySelector("header")?.getBoundingClientRect().bottom ?? 92) + 16);
    const bottom = viewportTop + viewportHeight - 16;
    const above = bounds.top - safeTop - 14;
    const below = bottom - bounds.bottom - 14;
    const placeAbove = above >= below;
    const room = Math.max(above, below);
    const width = Math.floor(Math.min(480, viewportWidth * .42, (room - 52) * 16 / 9));

    // At high zoom or in short landscape windows, activation still opens the
    // accessible dialog instead of squeezing art over a row or the fixed header.
    if (width < 240) { dismissPreview(); return; }
    const height = width * 9 / 16 + 52;
    setFrame({
      left: Math.max(viewportLeft + 16, Math.min(bounds.right - width, viewportLeft + viewportWidth - width - 16)),
      top: placeAbove ? bounds.top - height - 14 : bounds.bottom + 14,
      width,
    });
    pending.current = index;
    setVisited((value) => value | (1 << index));
    if (ready.current & (1 << index)) setDisplayed(index);
    setActive(index);
  };

  useEffect(() => {
    if (active === null) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") dismissPreview(); };
    window.addEventListener("scroll", dismissPreview, true);
    window.addEventListener("resize", dismissPreview);
    window.addEventListener("blur", dismissPreview);
    window.visualViewport?.addEventListener("resize", dismissPreview);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", dismissPreview, true);
      window.removeEventListener("resize", dismissPreview);
      window.removeEventListener("blur", dismissPreview);
      window.visualViewport?.removeEventListener("resize", dismissPreview);
      document.removeEventListener("keydown", onKey);
    };
  }, [active, dismissPreview]);

  useEffect(() => {
    if (modalProject === null) return;
    dialog.current?.showModal();
  }, [modalProject]);

  const openProject = (index: number, button: HTMLButtonElement) => {
    dismissPreview();
    trigger.current = button;
    scrollPosition.current = { x: window.scrollX, y: window.scrollY };
    setModalProject(index);
  };

  const returnFocus = () => {
    dismissPreview();
    setModalProject(null);
    setExpanded(false);
    suppressFocus.current = true;
    trigger.current?.focus({ preventScroll: true });
    suppressFocus.current = false;
    // Native modal focus restoration should not move the page on touch browsers.
    window.scrollTo({ left: scrollPosition.current.x, top: scrollPosition.current.y, behavior: "instant" });
  };

  const changeProject = (direction: number) => {
    setModalProject((index) => index === null ? null : (index + direction + projects.length) % projects.length);
  };

  return <>
    <section className={`${styles.section} container`} id="selected-work" aria-labelledby="selected-work-title">
      <div className={styles.heading}>
        <div><p className="eyebrow"><span className="section-dash" /> A FEW THINGS WE’VE MADE</p><h2 id="selected-work-title">Selected work.</h2></div>
        <p className={styles.intro}>Distinct ideas.<br />Thoughtfully brought to life.</p>
      </div>
      <p className={styles.srOnly} id="selected-work-help">Open a project to view its illustrative concept artwork. Screen content and figures are illustrative.</p>
      <ol className={styles.list}>
        {projects.map((project, index) => <li key={project.slug}>
          <button className={styles.row} type="button" ref={(node) => { rows.current[index] = node; }}
            aria-label={`Preview ${project.name}`} aria-describedby="selected-work-help" aria-haspopup="dialog"
            data-active={active === index || undefined}
            onPointerEnter={(event) => {
              if (event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
              hovered.current = index;
              showPreview(index);
            }}
            onPointerLeave={() => {
              hovered.current = null;
              if (focused.current !== null) showPreview(focused.current); else dismissPreview();
            }}
            onFocus={(event) => {
              if (suppressFocus.current || modalProject !== null || !event.currentTarget.matches(":focus-visible")) return;
              focused.current = index;
              showPreview(index);
            }}
            onBlur={() => {
              focused.current = null;
              if (hovered.current !== null) showPreview(hovered.current); else dismissPreview();
            }}
            onClick={(event) => openProject(index, event.currentTarget)}>
            <span className={styles.number} aria-hidden="true">0{index + 1}</span>
            <span className={styles.name}>{project.name}</span>
            <span className={styles.category}>{project.category}</span>
            <span className={styles.arrow}><PreviewArrow /></span>
          </button>
        </li>)}
      </ol>
    </section>

    {frame && createPortal(<div className={styles.preview} aria-hidden="true"
      data-open={active !== null && (displayed !== null || (failed & (1 << active)) !== 0)}
      style={{ left: frame.left, top: frame.top, width: frame.width }}>
      <div className={styles.artwork}>
        {projects.map((project, index) => (visited & (1 << index)) !== 0 && <div
          className={styles.layer} data-visible={displayed === index} key={project.slug}>
          <ProjectArtwork index={index} sizes={`${frame.width}px`}
            onLoad={() => { ready.current |= 1 << index; if (pending.current === index) setDisplayed(index); }}
            onError={() => { ready.current |= 1 << index; setFailed((value) => value | (1 << index)); if (pending.current === index) setDisplayed(index); }} />
        </div>)}
        {displayed !== null && (failed & (1 << displayed)) !== 0 && <p className={styles.fallback}>Artwork is unavailable.<br />Open the project for its description.</p>}
      </div>
      <div className={styles.caption}><span>{projects[displayed ?? active ?? 0].name}</span><small>CONCEPT PREVIEW</small></div>
    </div>, document.body)}

    {modalProject !== null && createPortal(<dialog className={styles.dialog} ref={dialog}
      data-expanded={expanded || undefined}
      aria-labelledby="work-dialog-title" aria-describedby="work-dialog-description work-dialog-note" onClose={returnFocus}
      onKeyDown={(event) => {
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          changeProject(event.key === "ArrowRight" ? 1 : -1);
        }
      }}
      onClick={(event) => {
        if (event.target !== dialog.current) return;
        const bounds = dialog.current.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.current.close();
      }}>
      <div className={styles.dialogHeader}><p className="eyebrow"><span className="section-dash" /> SELECTED WORK</p><button className={styles.close} type="button" autoFocus aria-label="Close project preview" onClick={() => dialog.current?.close()}><span>Close</span><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button></div>
      <div className={styles.dialogBody}>
        <div className={styles.dialogArtwork}>
          <ProjectArtwork key={projects[modalProject].slug} index={modalProject}
            sizes={expanded ? "(max-width: 760px) calc(100vw - 48px), (max-width: 1440px) calc(100vw - 68px), 1364px" : "(max-width: 900px) calc(100vw - 72px), (max-width: 1208px) calc(100vw - 378px), 830px"}
            onLoad={() => setFailed((value) => value & ~(1 << modalProject))}
            onError={() => setFailed((value) => value | (1 << modalProject))} />
          {(failed & (1 << modalProject)) !== 0 && <p className={styles.fallback}>Artwork is unavailable.<br />Project details are below.</p>}
          <button className={styles.expand} type="button" aria-pressed={expanded} onClick={() => setExpanded((value) => !value)}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={expanded ? "M4 9h5V4m11 11h-5v5M9 9 4 4m11 11 5 5" : "M9 4H4v5m11 11h5v-5M4 4l6 6m10 10-6-6"} /></svg><span>{expanded ? "Fit view" : "Expand image"}</span></button>
        </div>
        <div className={styles.dialogCopy} aria-live="polite" aria-atomic="true"><p className={styles.dialogCategory}>{projects[modalProject].category}</p><h2 id="work-dialog-title">{projects[modalProject].name}</h2><p id="work-dialog-description">{projects[modalProject].description}</p><small id="work-dialog-note">Illustrative concept artwork. Screen content and figures are illustrative.</small></div>
      </div>
      <div className={styles.dialogNavigation}>
        <button type="button" className={styles.previous} aria-label="Previous project" onClick={() => changeProject(-1)}><PreviewArrow /><span>Previous</span></button>
        <span className={styles.projectCount} aria-label={`Project ${modalProject + 1} of ${projects.length}`}><strong>0{modalProject + 1}</strong><span>/</span>0{projects.length}</span>
        <button type="button" className={styles.next} aria-label="Next project" onClick={() => changeProject(1)}><span>Next project</span><PreviewArrow /></button>
      </div>
    </dialog>, document.body)}
  </>;
}

