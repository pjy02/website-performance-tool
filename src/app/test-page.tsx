'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Clock } from 'lucide-react';

// 简化的测试组件
export default function TestPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const simulateTest = () => {
    setIsLoading(true);
    setTimeout(() => {
      setTestResult({
        testResults: {
          dns: {
            resolutionTime: 150
          },
          connection: {
            totalTime: 500,
            tcpTime: 100,
            ttfb: 200,
            downloadTime: 50
          },
          server: {
            responseTime: 300,
            software: 'nginx/1.18.0',
            responseSize: 1024
          }
        }
      });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button onClick={simulateTest} disabled={isLoading}>
          {isLoading ? '加载中...' : '模拟测试'}
        </Button>
      </div>

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                测试结果
              </CardTitle>
            </CardHeader>
            <CardContent>
              {testResult ? (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>DNS解析时间:</span>
                    <span className="font-mono">
                      {testResult.testResults.dns.resolutionTime}ms
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>总响应时间:</span>
                    <span className="font-mono">
                      {testResult.testResults.connection.totalTime}ms
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-pulse" />
                    <p className="text-muted-foreground">
                      {isLoading ? '正在加载测试数据...' : '暂无测试数据'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}