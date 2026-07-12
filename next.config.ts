import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets phones/other devices on the same LAN connect to the dev server's
  // HMR websocket during local testing — otherwise Next.js silently blocks
  // cross-origin dev requests and the page never becomes interactive.
  allowedDevOrigins: ["192.168.1.76"],
};

export default nextConfig;
