import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "D Star",
    short_name: "D Star",
    description: "Website and web app development studio.",
    start_url: "/",
    display: "standalone",
    background_color: "#fcfcfa",
    theme_color: "#fcfcfa",
    icons: [
      {
        src: "/dstar-mark-v2.png",
        sizes: "420x353",
        type: "image/png",
      },
    ],
  };
}

