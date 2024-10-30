import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: 'docs',
  basePath: '/bjornclind.github.io',
  assetPrefix: '/bjornclind.github.io',
  /* You can add more config options here as needed */
};

export default nextConfig;
