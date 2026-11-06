import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConceptArtwork } from "@/components/BusinessShowcase";
import { businessExamples } from "@/components/website-content";
import { whatsappUrl } from "@/components/site";
import { Arrow } from "@/components/Brand";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export function generateStaticParams() { return businessExamples.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const example = businessExamples.find((item) => item.slug === slug);
  return { title: example ? `${example.brand} — Website Demo Concept | D Star IT Solutions` : "Demo not found", robots: { index: false, follow: true }, alternates: { canonical: `/website-demos/${slug}` } };
}

export default async function WebsiteDemo({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const example = businessExamples.find((item) => item.slug === slug);
  if (!example) notFound();
  const enquiry = whatsappUrl(`Hello D Star, I would like a ${example.category.toLowerCase()} website inspired by your ${example.brand} demo concept. Please help me with a quote.`);
  return <main className="demo-page container"><a href="#demo-content" className="skip-link">Skip to demo</a><div className="demo-page-top"><Link href="/small-business-websites#business-websites">← Back to D Star website examples</Link><p>DEMO CONCEPT · FICTIONAL BUSINESS</p><div className="demo-theme"><ThemeSwitcher /></div></div><p className="demo-intro">{example.brand} is a design demonstration by D Star, not a client business. Explore the layout below. Enquiry buttons contact D Star about building a similar website.</p><div className="demo-website" id="demo-content"><nav className="demo-website-nav" aria-label="Demo navigation"><strong>{example.brand}</strong><a href="#demo-services">Discover</a><a href="#demo-contact">Enquire</a></nav><h1 className="demo-accessible-heading">{example.brand}: {example.line}</h1><ConceptArtwork example={example} /><section className="demo-services" id="demo-services"><p className="demo-label">A LITTLE ABOUT THE CONCEPT</p><h2>Made for the way you do business.</h2><p>{example.detail}</p><div className="demo-service-grid">{example.items.map((item, index) => <article key={item}><span className="sales-number">0{index + 1}</span><h3>{item}</h3><p>Space for your own services, photographs and business story. Final content is supplied by you and shaped to suit your website.</p></article>)}</div></section><section className="demo-contact" id="demo-contact"><h2>Picture your business here.</h2><p>Like this direction? Talk to D Star about a website for your business. Packages start at ₹8,000; domain and hosting are additional.</p><a className="button sales-primary" href={enquiry} target="_blank" rel="noreferrer">Enquire for a Similar Website <Arrow diagonal /></a></section></div><p className="demo-intro">Design concept only. No real menu, product inventory, appointment service or booking system is provided by this fictional business. Additional functionality needs a separate scope and quote.</p></main>;
}
