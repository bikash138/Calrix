import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-auth"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/login", destination: "/signin", permanent: true },
      { source: "/signup", destination: "/signin", permanent: true },
      { source: "/register", destination: "/signin", permanent: true },
      { source: "/auth", destination: "/signin", permanent: true },
      { source: "/sign-in", destination: "/signin", permanent: true },
      { source: "/sign-up", destination: "/signin", permanent: true },
      { source: "/logout", destination: "/signin", permanent: false },
      { source: "/signout", destination: "/signin", permanent: false },
      { source: "/sign-out", destination: "/signin", permanent: false },
    ];
  },
};

export default nextConfig;
