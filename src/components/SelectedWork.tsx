"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import SelectedWorkVideoCard from "./SelectedWorkVideoCard";
import styles from "./SelectedWork.module.css";
import scene from "./SelectedWorkShowcase.module.css";

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

function ProjectArtwork({ index, sizes, onLoad, onError }: {
  index: number;
  sizes: string;
  onLoad?: () => void;
  onError?: () => void;
}) {
  const project = projects[index];
  const sourceSet = (format: string) => [640, 960, 1440]
    .map((width) => `/selected-work/${project.slug}-${width}.${format} ${width}w`).join(", ");

  // Preserve the supplied optimized encodings. Gallery art mounts near the
  // viewport; dialog and hover layers mount after a preview interaction.
  return <picture>
    <source type="image/avif" srcSet={sourceSet("avif")} sizes={sizes} />
    <source type="image/webp" srcSet={sourceSet("webp")} sizes={sizes} />
    <img src={`/selected-work/${project.slug}-960.webp`} alt={project.alt}
      width={960} height={540} loading="eager" decoding="async"
      onLoad={onLoad} onError={onError} />
  </picture>;
}


const labels = ["Mecardee Rental", "Mecardee Manager", "HireVify"];
const words = ["Drive.", "Organise.", "Connect."];

export default function SelectedWork({standalone=false}:{standalone?:boolean}) {
  const Heading=standalone?"h1":"h2";
  const [selected,setSelected]=useState(0);
  const [modalProject,setModalProject]=useState<number|null>(null);
  const [expanded,setExpanded]=useState(false);
  const [failed,setFailed]=useState(0);
  const [artVisible,setArtVisible]=useState(false);
  const [inView,setInView]=useState(false);
  const [paused,setPaused]=useState(false);
  const section=useRef<HTMLElement>(null);
  const dialog=useRef<HTMLDialogElement>(null);
  const trigger=useRef<HTMLButtonElement|null>(null);
  const tabs=useRef<(HTMLButtonElement|null)[]>([]);
  const swipe=useRef<{x:number;y:number}|null>(null);
  const scrollPosition=useRef({x:0,y:0});
  useEffect(()=>{
    const element=section.current;if(!element)return;
    const observer=new IntersectionObserver(([entry])=>{
      setInView(entry.isIntersecting);
      if(entry.isIntersecting)setArtVisible(true);
    },{rootMargin:"120px"});
    observer.observe(element);
    const syncHash=()=>{const index=projects.findIndex(p=>location.hash===`#work-${p.slug}`);if(index>=0)setSelected(index);};
    syncHash();addEventListener("hashchange",syncHash);
    return()=>{observer.disconnect();removeEventListener("hashchange",syncHash);};
  },[]);
  useEffect(()=>{if(modalProject!==null)dialog.current?.showModal();},[modalProject]);
  const select=(index:number,focus=false)=>{
    const next=(index+projects.length)%projects.length;
    setSelected(next);
    if(focus)tabs.current[next]?.focus({preventScroll:true});
  };
  const openProject=(index:number,button:HTMLButtonElement)=>{
    trigger.current=button;scrollPosition.current={x:scrollX,y:scrollY};setModalProject(index);
  };
  const returnFocus=()=>{
    setModalProject(null);setExpanded(false);trigger.current?.focus({preventScroll:true});
    window.scrollTo({left:scrollPosition.current.x,top:scrollPosition.current.y,behavior:"instant"});
  };
  const changeProject=(direction:number)=>setModalProject(index=>index===null?null:(index+direction+projects.length)%projects.length);
  return <>
    <section ref={section} className={scene.section} id="selected-work" aria-labelledby="selected-work-title" data-project={selected} data-running={inView&&!paused}>
      <div className={scene.inner}>
        <div className={scene.heading}><div><p className="eyebrow">DIGITAL WITH CHARACTER</p><Heading id="selected-work-title">Selected work.</Heading></div></div>
        <div className={scene.layout}>
          <div className={scene.showcase}>
            <div className={scene.tabs} role="tablist" aria-label="Selected project index">{projects.map((project,index)=><button key={project.slug} ref={node=>{tabs.current[index]=node;}} type="button" role="tab" id={`work-tab-${index}`} aria-selected={selected===index} aria-controls={`work-${project.slug}`} tabIndex={selected===index?0:-1} onClick={()=>select(index)} onKeyDown={event=>{let next:number|undefined;if(event.key==="ArrowRight")next=selected+1;if(event.key==="ArrowLeft")next=selected-1;if(event.key==="Home")next=0;if(event.key==="End")next=projects.length-1;if(next!==undefined){event.preventDefault();select(next,true);}}}><span className={scene.tabImage} aria-hidden="true">{artVisible&&<ProjectArtwork index={index} sizes="100px"/>}</span><span>{labels[index]}</span></button>)}</div>
            <div className={scene.stage} onPointerDown={event=>{if(event.pointerType!=="mouse")swipe.current={x:event.clientX,y:event.clientY};}} onPointerCancel={()=>{swipe.current=null;}} onPointerUp={event=>{const start=swipe.current;swipe.current=null;if(start&&Math.abs(event.clientX-start.x)>55&&Math.abs(event.clientX-start.x)>Math.abs(event.clientY-start.y)*1.5)select(selected+(event.clientX<start.x?1:-1));}}>
              {projects.map((project,index)=><article className={scene.panel} role="tabpanel" id={`work-${project.slug}`} aria-labelledby={`work-tab-${index}`} aria-hidden={selected!==index} inert={selected!==index} data-active={selected===index} key={project.slug}>
                <div className={scene.composition}>
                  <span className={scene.word} aria-hidden="true">{words[index]}</span>
                  <span className={scene.halo} aria-hidden="true"/>
                  <div className={scene.satelliteLeft} aria-hidden="true"><div className={scene.float}>{artVisible&&<ProjectArtwork index={index} sizes="220px"/>}</div></div>
                  <button className={scene.mainArtwork} type="button" aria-label={`Open ${project.name} project preview`} aria-haspopup="dialog" onClick={event=>openProject(index,event.currentTarget)}><span className={scene.float}>{artVisible&&<ProjectArtwork index={index} sizes="(max-width:760px) 85vw, 55vw"/>}</span><span className={scene.artworkCta}>Explore project</span></button>
                  <div className={scene.satelliteRight} aria-hidden="true"><div className={scene.float}><span className={scene.phoneCamera}/>{artVisible&&<ProjectArtwork index={index} sizes="220px"/>}</div></div>
                  <span className={scene.orbitDot} aria-hidden="true"/>
                </div>
                <div className={scene.copy}><div><p>{project.category}</p><h3>{project.name}</h3></div><p>{project.description}</p></div>
              </article>)}
            </div>
            <div className={scene.controls}><button type="button" aria-label="Previous selected project" onClick={()=>select(selected-1)}>Previous</button><span aria-live="polite" aria-atomic="true">{selected+1} / {projects.length}</span><button type="button" aria-label="Next selected project" onClick={()=>select(selected+1)}>Next</button><button type="button" className={scene.pause} aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?"Play motion":"Pause motion"}</button></div>

          </div>
          <SelectedWorkVideoCard/>
        </div>
      </div>
    </section>
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
        <button type="button" className={styles.previous} aria-label="Previous project" onClick={() => changeProject(-1)}><span>Previous</span></button>
        <span className={styles.projectCount} aria-label={`Project ${modalProject + 1} of ${projects.length}`}><strong>0{modalProject + 1}</strong><span>/</span>0{projects.length}</span>
        <button type="button" className={styles.next} aria-label="Next project" onClick={() => changeProject(1)}><span>Next project</span></button>
      </div>
    </dialog>, document.body)}
  </>;
}

