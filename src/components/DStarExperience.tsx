import SelectedWork from "./SelectedWork";
import CinematicHero from "./CinematicHero";
import ExperienceMotion from "./ExperienceMotion";
import SiteHeader from "./SiteHeader";
import ProjectBrief from "./ProjectBrief";
import FounderNote from "./FounderNote";
import BusinessShowcase from "./BusinessShowcase";
import { CustomApplications, EnquirySection, FloatingWhatsApp, SimpleProcess, SiteFooter, WebsiteBenefits, WebsiteFAQ, WebsitePackages, WhyDStar } from "./WebsiteSales";

export default function DStarExperience() {
  return <ProjectBrief><a href="#main" className="skip-link">Skip to content</a><SiteHeader /><ExperienceMotion /><main id="main"><CinematicHero /><WebsiteBenefits /><WebsitePackages /><BusinessShowcase /><WhyDStar /><SelectedWork /><CustomApplications /><SimpleProcess /><WebsiteFAQ /><EnquirySection /><FounderNote /></main><SiteFooter /><FloatingWhatsApp /></ProjectBrief>;
}
