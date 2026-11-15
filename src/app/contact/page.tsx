import type {Metadata} from "next";
import PageFrame,{PageIntro} from "@/components/PageFrame";
import {EnquirySection} from "@/components/WebsiteSales";
import {PHONE,DISPLAY_PHONE,whatsappUrl} from "@/components/site";
export const metadata:Metadata={title:"Contact | D Star Solutions",description:"Talk to D Star Solutions about your website or custom application. Based in Bharananganam, Pala, Kerala.",alternates:{canonical:"/contact"}};
export default function ContactPage(){return <PageFrame><PageIntro title="Let’s talk."><div className="contact-details"><a href={`tel:+${PHONE}`}>{DISPLAY_PHONE}</a><a href={whatsappUrl("Hello D Star, I would like to discuss a project.")} target="_blank" rel="noreferrer">Message on WhatsApp</a><address>Bharananganam, Pala<br/>Kerala, India</address></div></PageIntro><EnquirySection/></PageFrame>;}
