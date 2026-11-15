import type {Metadata} from "next";
import Link from "next/link";
import PageFrame,{PageIntro} from "@/components/PageFrame";
import {WebsiteBenefits,CustomApplications,SimpleProcess} from "@/components/WebsiteSales";
export const metadata:Metadata={title:"Website & Web Application Services | D Star Solutions",description:"Business website design, development and custom web applications from Pala, Kerala.",alternates:{canonical:"/services"}};
export default function ServicesPage(){return <PageFrame><PageIntro title="Websites & web applications."><p>Design and development for your business, from your first website to a custom platform.</p><Link className="button sales-primary" href="/pricing">View website packages</Link></PageIntro><WebsiteBenefits/><CustomApplications/><SimpleProcess/></PageFrame>;}
