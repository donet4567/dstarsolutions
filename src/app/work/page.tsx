import type {Metadata} from "next";
import PageFrame from "@/components/PageFrame";
import SelectedWork from "@/components/SelectedWork";
export const metadata:Metadata={title:"Work & Website Demos | D Star Solutions",description:"Explore D Star Solutions web applications and website design previews.",alternates:{canonical:"/work"}};
export default function WorkPage(){return <PageFrame><div id="top"/><SelectedWork standalone/></PageFrame>;}
