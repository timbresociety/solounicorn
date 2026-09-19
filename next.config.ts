import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Keep Next inside this repository when nearby checkouts have lockfiles.
  turbopack: {
    root: path.resolve('.'),
  },
};

export default nextConfig;
