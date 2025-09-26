import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: '/checkout/success',
        destination: '/checkout/success/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
