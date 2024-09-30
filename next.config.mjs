import withBundleAnalyzer from "@next/bundle-analyzer";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin();
import withPWAInit from "@ducanh2912/next-pwa";
const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: false,
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};
export default bundleAnalyzer(withPWA(withNextIntl(nextConfig)));
