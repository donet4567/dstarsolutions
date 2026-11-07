import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "D Star IT Solutions",
    short_name: "D Star",
    description: "Website and web app development studio.",
    start_url: "/",
    display: "standalone",
    background_color: "#100d15",
    theme_color: "#100d15",
    icons: [
      {
        src: "/brand/dstar-icon-256.png",
        sizes: "256x256",
        type: "image/png",
      },
    ],
  };
}
