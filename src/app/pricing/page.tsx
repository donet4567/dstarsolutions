import type {Metadata} from "next";
import PageFrame,{PageIntro} from "@/components/PageFrame";
import {WebsitePackages,WebsiteFAQ} from "@/components/WebsiteSales";
export const metadata:Metadata={title:"Website Pricing from ₹8,000 | D Star Solutions",description:"Compare business website packages from ₹8,000, ₹15,000 and ₹25,000. Domain and hosting extra.",alternates:{canonical:"/pricing"}};
export default function PricingPage(){return <PageFrame><PageIntro title="Website pricing."><p>One-time development fees. Domain, hosting and renewals are additional.</p></PageIntro><WebsitePackages/><WebsiteFAQ/></PageFrame>;}
