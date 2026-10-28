import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // This single-page site benefits from painting its existing styles directly
  // from the HTML instead of waiting for a second render-blocking request.
  experimental: { inlineCss: true },
};

export default nextConfig;
