import type { NextConfig } from 'next';

const config: NextConfig = {
  poweredByHeader: false,
  outputFileTracingIncludes: { '/api/export': ['./public/fonts/*.ttf'] },
  ...(process.env.PILOT_BUILD_DIR ? { distDir: process.env.PILOT_BUILD_DIR } : {}),
};
export default config;
