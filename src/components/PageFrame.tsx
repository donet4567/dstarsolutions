import type { ReactNode } from "react";
import SiteHeader from "./SiteHeader";
import ProjectBrief from "./ProjectBrief";
import ExperienceMotion from "./ExperienceMotion";
import { SiteFooter, FloatingWhatsApp } from "./WebsiteSales";

export default function PageFrame({children,home=false}:{children:ReactNode;home?:boolean}) {
  return <ProjectBrief><a href="#main" className="skip-link">Skip to content</a><SiteHeader/><ExperienceMotion/><main id="main" className={home?undefined:"page-main"}>{children}</main><SiteFooter/><FloatingWhatsApp/></ProjectBrief>;
}
export function PageIntro({title,children}:{title:string;children?:ReactNode}) {
  return <section id="top" className="page-intro container"><h1>{title}</h1>{children}</section>;
}
