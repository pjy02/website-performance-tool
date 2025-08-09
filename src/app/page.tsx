'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedButton } from '@/components/ui/animated-button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AnimatedContainer } from '@/components/ui/animated-container';
import { Globe, Network, Server, Shield, MapPin, Zap, AlertCircle, CheckCircle, Activity, TrendingUp, Lightbulb, Star } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center space-y-2 pt-8">
            <h1 className="text-3xl font-bold">网站性能检测工具</h1>
            <p className="text-muted-foreground">
              全面的域名性能分析，包括CDN状态、网络延迟、SSL证书和服务器性能检测
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                静态演示版本
              </CardTitle>
              <CardDescription>
                此为EdgeOne Pages静态部署版本，仅展示功能介绍和部署说明
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  当前为静态部署版本，完整的检测功能需要在支持后端服务的平台上运行。
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  连接类型检测
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  智能识别直连、CDN、代理等连接类型，分析网络架构和性能特征。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  多地Ping检测
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  全球多个节点同时检测，分析IP一致性和地理分布情况。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  性能分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  全面的性能指标分析，包括响应时间、下载速度和服务器性能。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  SSL证书检测
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  检查SSL证书状态、有效期和安全配置，确保网站安全性。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  优化建议
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  基于检测结果提供分级优化建议，帮助提升网站性能。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  实时监控
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  支持实时监控和自动测试，持续跟踪网站性能变化。
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                技术栈
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium mb-2">前端技术</h4>
                  <div className="space-y-1">
                    <Badge variant="outline">Next.js</Badge>
                    <Badge variant="outline">React</Badge>
                    <Badge variant="outline">TypeScript</Badge>
                    <Badge variant="outline">Tailwind CSS</Badge>
                    <Badge variant="outline">Framer Motion</Badge>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">后端技术</h4>
                  <div className="space-y-1">
                    <Badge variant="outline">Node.js</Badge>
                    <Badge variant="outline">Next.js API Routes</Badge>
                    <Badge variant="outline">Socket.IO</Badge>
                    <Badge variant="outline">Prisma</Badge>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">检测引擎</h4>
                  <div className="space-y-1">
                    <Badge variant="outline">DNS解析</Badge>
                    <Badge variant="outline">Ping检测</Badge>
                    <Badge variant="outline">HTTP分析</Badge>
                    <Badge variant="outline">SSL证书验证</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                完整功能部署指南
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">推荐部署平台</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <h5 className="font-medium">Vercel</h5>
                      <p className="text-sm text-muted-foreground mt-1">
                        完全兼容Next.js全栈功能，支持API路由和数据库连接
                      </p>
                    </Card>
                    <Card className="p-4">
                      <h5 className="font-medium">Railway</h5>
                      <p className="text-sm text-muted-foreground mt-1">
                        支持全栈应用部署，提供数据库和实时通信功能
                      </p>
                    </Card>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">国内平台选择</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <h5 className="font-medium">腾讯云CloudBase</h5>
                      <p className="text-sm text-muted-foreground mt-1">
                        支持Next.js全栈应用，提供完整的云开发能力
                      </p>
                    </Card>
                    <Card className="p-4">
                      <h5 className="font-medium">自建服务器 + Docker</h5>
                      <p className="text-sm text-muted-foreground mt-1">
                        完全控制部署环境，支持所有功能特性
                      </p>
                    </Card>
                  </div>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    如需体验完整功能，请将项目部署到支持后端服务的平台。
                    当前EdgeOne Pages版本仅用于功能展示和说明。
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}