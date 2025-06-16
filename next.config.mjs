/** @type {import('next').NextConfig} */
const nextConfig = {
    // Only use static export for production builds
    ...(process.env.NODE_ENV === 'production' && {
        output: 'export',
        distDir: 'dist'
    }),
    // Enable trailing slash for static export compatibility
    trailingSlash: true,
    // Disable image optimization for static export
    images: {
        unoptimized: true
    }
};

export default nextConfig;
