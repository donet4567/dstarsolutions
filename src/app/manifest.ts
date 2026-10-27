import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "D Star IT Solutions",
    short_name: "D Star",
    description: "Website and web app development studio.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffefd",
    theme_color: "#fffefd",
    icons: [
      {
        src: "/dstar-mark-v2.png",
        sizes: "854x718",
        type: "image/png",
      },
    ],
  };
}

