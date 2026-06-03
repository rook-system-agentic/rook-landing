/** @type {import('next').NextConfig} */
const nextConfig = {
  // Using default SSR/SSG mode (not static export) because we have API routes
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Headers for GEO: allow AI crawlers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
          },
        ],
      },
    ]
  },
}

export default nextConfig
