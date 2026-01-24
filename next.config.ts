import { NextConfig } from 'next';

export default {
  pageExtensions: ['tsx', 'ts'],
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  output: 'standalone'
} satisfies NextConfig;
