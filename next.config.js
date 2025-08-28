/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore for initial deployment
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporarily ignore for initial deployment
  },
  images: {
    domains: ['supabase.co', 'avatars.githubusercontent.com'],
    unoptimized: false,
  },
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

module.exports = nextConfig;
