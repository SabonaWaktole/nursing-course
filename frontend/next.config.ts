import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone output to bundle all required files into .next/standalone
  // This is required to properly run 'next start' or host on Node.js/Hostinger
  // without missing chunk/asset 404 errors.
  output: 'standalone',
  
  images: {
    // Uploaded images are resized to WebP by the backend at upload time and rendered
    // with `unoptimized`, so they never reach the optimizer. Only the remaining
    // third-party placeholder images are optimized here — hence the explicit host list
    // rather than the previous `hostname: '**'`, which let any URL queue a transcode.
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
        protocol: 'https',
        hostname: 'api.excelcommunityliving.website',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    // Those placeholders never change; cache each transcode for a year instead of
    // re-running it every 4 hours.
    minimumCacheTTL: 31536000,
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
