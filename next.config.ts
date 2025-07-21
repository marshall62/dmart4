import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'onyiu0ia9ls1l1ol.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

// I put this here because Vercel was complaining about missing Suspense in conjunction with useSearchParams
module.exports = {
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

export default nextConfig;
