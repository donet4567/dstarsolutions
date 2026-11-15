import type {Metadata} from "next";
import PageFrame from "@/components/PageFrame";
import SelectedWork from "@/components/SelectedWork";
import BusinessShowcase from "@/components/BusinessShowcase";
export const metadata:Metadata={title:"Work & Website Demos | D Star Solutions",description:"Explore D Star Solutions web applications and website design previews.",alternates:{canonical:"/work"}};
export default function WorkPage(){return <PageFrame><div id="top"/><SelectedWork standalone/><BusinessShowcase source="work"/></PageFrame>;}
