import type {NextConfig} from 'next';

const repoName = 'MyWorkoutAppFire';

const nextConfig: NextConfig = {
  output: 'export',
  assetPrefix: `/${repoName}/`,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
