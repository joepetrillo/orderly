/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["www.gravatar.com", "images.clerk.dev"],
  },
};

module.exports = nextConfig;
