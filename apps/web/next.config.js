import path from 'path';
import { fileURLToPath } from 'url';
import nextEnv from '@next/env';

const repoRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
nextEnv.loadEnvConfig(repoRoot, process.env.NODE_ENV !== 'production');

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
