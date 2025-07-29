/** @type {import('next').NextConfig} */
const nextConfig = {
 
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/api/**',
      },
      // ভবিষ্যতে অন্য কোনো ডোমেইন প্রয়োজন হলে এখানে যোগ করতে পারেন
      // যেমন, Supabase Storage-এর জন্য:
      {
        protocol: 'https',
        hostname: 'xyzabc.supabase.co', // আপনার Supabase প্রজেক্ট URL-এর হোস্টনেম
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

module.exports = nextConfig;