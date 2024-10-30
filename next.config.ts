import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: 'docs',
  /* You can add more config options here as needed */
};

export default nextConfig;
