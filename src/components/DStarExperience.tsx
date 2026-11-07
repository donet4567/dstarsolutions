import StudioMotion from "./StudioMotion";
import SelectedWork from "./SelectedWork";
import CinematicHero from "./CinematicHero";
import ExperienceMotion from "./ExperienceMotion";
import SiteHeader from "./SiteHeader";
import ProjectBrief from "./ProjectBrief";
import FounderNote from "./FounderNote";
import BusinessShowcase from "./BusinessShowcase";
import { CustomApplications, EnquirySection, FloatingWhatsApp, SimpleProcess, SiteFooter, WebsiteBenefits, WebsiteFAQ, WebsitePackages, WhyDStar } from "./WebsiteSales";

export default function DStarExperience() {
  return <ProjectBrief><a href="#main" className="skip-link">Skip to content</a><SiteHeader /><ExperienceMotion /><StudioMotion /><main id="main"><CinematicHero /><div className="orbit-ticker" aria-hidden="true"><span>IDEAS WITH AMBITION</span><b>✳</b><span>DIGITAL WITH CHARACTER</span><b>✳</b><span>MADE TO MATTER</span></div><SelectedWork /><WebsiteBenefits /><BusinessShowcase /><CustomApplications /><WhyDStar /><SimpleProcess /><WebsitePackages /><FounderNote /><WebsiteFAQ /><EnquirySection /></main><SiteFooter /><FloatingWhatsApp /></ProjectBrief>;
}
