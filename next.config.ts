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
export default nextConfig;
