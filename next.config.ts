import type { NextConfig } from "next";

const apiUrl = process.env.API_URL || "http://localhost:4000";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/backend/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
      {
        source: "/backend/uploads/:path*",
        destination: `${apiUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
