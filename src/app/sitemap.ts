import type { MetadataRoute } from "next";
import { SITE_URL } from "@/components/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...["work","services","pricing","about","contact"].map(path=>({url:`${SITE_URL}/${path}`,changeFrequency:"monthly" as const,priority:.8})),
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/small-business-websites`, changeFrequency: "monthly", priority: .9 },
  ];
}
