import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DemoShowroom from "@/components/DemoShowroom";
import { businessExamples } from "@/components/website-content";

export function generateStaticParams() { return businessExamples.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const example = businessExamples.find((item) => item.slug === slug);
  return { title: example ? `${example.brand} — Website Demo Concept | D Star Solutions` : "Demo not found", robots: { index: false, follow: true }, alternates: { canonical: `/website-demos/${slug}` } };
}

export default async function WebsiteDemo({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const example = businessExamples.find((item) => item.slug === slug);
  if (!example) notFound();
  return <DemoShowroom key={example.slug} example={example} />;
}
