import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure native binary from ffmpeg-static is included and not bundled away
  serverExternalPackages: ["ffmpeg-static", "fluent-ffmpeg"],
  // Include ffmpeg-static binary in the server/serverless bundle for this route
  outputFileTracingIncludes: {
    "/api/generate-video": ["node_modules/ffmpeg-static/**"],
  },
};

export default nextConfig;
