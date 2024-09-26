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
  // output: "standalone",
  reactStrictMode: true,
};
export default withPWA(withNextIntl(nextConfig));
