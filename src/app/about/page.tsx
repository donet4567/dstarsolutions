import type {Metadata} from "next";
import PageFrame,{PageIntro} from "@/components/PageFrame";
import FounderNote from "@/components/FounderNote";
import {WhyDStar} from "@/components/WebsiteSales";
export const metadata:Metadata={title:"About the Studio | D Star Solutions",description:"Meet D Star Solutions, an independent design and development studio in Bharananganam, Pala, Kerala.",alternates:{canonical:"/about"}};
export default function AboutPage(){return <PageFrame><PageIntro title="About D Star Solutions."><p>An independent design and development studio in Bharananganam, Pala, Kerala.</p></PageIntro><WhyDStar/><FounderNote/></PageFrame>;}
