import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@virtual-studio/contracts", "@virtual-studio/i18n"],
};

export default nextConfig;
