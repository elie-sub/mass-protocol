import type { NextConfig } from "next";

// Identifies this build; the installed app compares it with /api/version to pick up new deployments.
const BUILD_ID = process.env.VERCEL_DEPLOYMENT_ID || String(Date.now());

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_BUILD_ID: BUILD_ID },
  turbopack: {
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
