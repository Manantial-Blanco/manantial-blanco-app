import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  productionBrowserSourceMaps: false, // Disable source maps in production for smaller bundles
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.builder.io',
        pathname: '/api/v1/image/assets/**',
      },
    ],
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-slot',
      '@supabase/supabase-js',
    ],
  },
  webpack: (config, { isServer }) => {
    // External packages that shouldn't be bundled
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    
    // Resolve fallbacks
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@react-native-async-storage/async-storage': false,
    };

    // Optimize chunk splitting for better caching
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for node_modules
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Common chunk for shared code
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
            // Separate chunks for large libraries
            reown: {
              test: /[\\/]node_modules[\\/]@reown[\\/]/,
              name: 'reown',
              chunks: 'all',
              priority: 40,
            },
            wagmi: {
              test: /[\\/]node_modules[\\/](wagmi|viem)[\\/]/,
              name: 'wagmi',
              chunks: 'all',
              priority: 35,
            },
            lib: {
              test: /[\\/]node_modules[\\/](@supabase|@tanstack)[\\/]/,
              name: 'lib',
              chunks: 'all',
              priority: 30,
            },
          },
        },
      };
    }

    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
