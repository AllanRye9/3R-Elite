/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '**.railway.app' },
      { protocol: 'https', hostname: '**.onrender.com' },
      { protocol: 'https', hostname: '**.up.railway.app' },
      { protocol: 'https', hostname: 'randomuser.me' },
      { protocol: 'https', hostname: '**.randomuser.me' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
    ],
  },
};

module.exports = nextConfig;
