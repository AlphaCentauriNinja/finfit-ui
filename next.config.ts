import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["http://192.168.1.193", "192.168.1.193"],
};

export default nextConfig;
