import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 启用静态导出
  output: 'export',
  
  // 静态导出配置
  trailingSlash: true,
  distDir: 'out',
  
  // 禁用图片优化（静态导出不支持）
  images: {
    unoptimized: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  reactStrictMode: false,
  
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
