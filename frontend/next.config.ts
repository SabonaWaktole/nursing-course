import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone output to bundle all required files into .next/standalone
  // This is required to properly run 'next start' or host on Node.js/Hostinger
  // without missing chunk/asset 404 errors.
  output: 'standalone',
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**', // Allow production API domains if needed
      },
    ],
  },

  // Required for react-pdf: alias canvas to false to prevent SSR bundling errors
  turbopack: {
    resolveAlias: {
      canvas: { browser: './empty-module.js' },
    },
  },
  
  // NOTE: If your app is deployed to a subdirectory on Hostinger (e.g., domain.com/frontend)
  // uncomment the basePath below and set it to your subdirectory name:
  // basePath: '/frontend',
  // assetPrefix: '/frontend',
};

export default nextConfig;
