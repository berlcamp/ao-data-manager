/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jwpaamhdlufycuopiguy.supabase.co',
      },
    ],
  },
};

export default nextConfig;
