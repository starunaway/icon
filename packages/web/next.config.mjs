/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  basePath: '/icon',
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
