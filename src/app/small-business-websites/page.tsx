import type { Metadata } from "next";
import BusinessShowcase from "@/components/BusinessShowcase";
import ExperienceMotion from "@/components/ExperienceMotion";
import FounderNote from "@/components/FounderNote";
import ProjectBrief from "@/components/ProjectBrief";
import SelectedWork from "@/components/SelectedWork";
import SiteHeader from "@/components/SiteHeader";
import { Arrow } from "@/components/Brand";
import { CustomApplications, EnquirySection, FloatingWhatsApp, SimpleProcess, SiteFooter, WebsiteBenefits, WebsiteFAQ, WebsitePackages, WhyDStar } from "@/components/WebsiteSales";
import { whatsappUrl } from "@/components/site";

const title = "Small Business Websites from ₹8,000 in Kerala | D Star Solutions";
const description = "Compare ₹8,000, ₹15,000 and ₹25,000 business website packages. Responsive design, WhatsApp enquiries and personal service from Pala, Kottayam. Domain and hosting extra.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/small-business-websites" }, openGraph: { title, description, url: "/small-business-websites" }, twitter: { title, description } };

export default function SmallBusinessWebsites() {
  return <ProjectBrief><a href="#main" className="skip-link">Skip to content</a><SiteHeader /><ExperienceMotion /><main id="main"><section id="top" className="package-hero container" aria-labelledby="package-page-title"><p className="eyebrow"><span className="section-dash" /> SMALL BUSINESS WEBSITES · KERALA & BEYOND</p><h1 id="package-page-title">A beautiful website.<br /><em>A confident next step.</em></h1><p>For your shop, your service, your new beginning. Professional, mobile-friendly websites that tell customers what you do and make it easy to get in touch.</p><div className="package-hero-actions"><a href="#packages" className="button sales-primary">Compare Website Packages <Arrow diagonal /></a><a href={whatsappUrl("Hello D Star, I would like a quote for a small business website. Please help me choose between your Essential, Growth and Premium packages.")} target="_blank" rel="noreferrer" className="button sales-secondary">Get a Free Quote on WhatsApp <Arrow diagonal /></a></div></section><WebsiteBenefits /><WebsitePackages showGuide={false} /><BusinessShowcase source="guide" /><WhyDStar /><SelectedWork /><CustomApplications /><SimpleProcess /><WebsiteFAQ /><EnquirySection /><FounderNote /></main><SiteFooter /><FloatingWhatsApp /></ProjectBrief>;
}
