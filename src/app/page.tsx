'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedButton } from '@/components/ui/animated-button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AnimatedTabs, AnimatedTabsList, AnimatedTabsTrigger, AnimatedTabsContent } from '@/components/ui/animated-tabs';
import { AnimatedLoader } from '@/components/ui/animated-loader';
import { AnimatedCard } from '@/components/ui/animated-card';
import { AnimatedContainer } from '@/components/ui/animated-container';
import { AnimatedGrid } from '@/components/ui/animated-container';
import { AnimatedList, AnimatedHistoryList } from '@/components/ui/animated-list';
import { AnimatedTime, AnimatedNumber, AnimatedBytes } from '@/components/ui/animated-number';
import { AnimatedStatus, AnimatedHttpStatus, AnimatedCDNStatus } from '@/components/ui/animated-status';
import { AnimatedCDNBreathing } from '@/components/ui/animated-cdn-breathing';
import { AnimatedPingWaveLoader } from '@/components/ui/animated-wave-loader';
import { AnimatedPageHeader, AnimatedInputSection } from '@/components/ui/animated-page-header';
import { InlineAnimatedMessage, MessageType } from '@/components/ui/animated-message';
import { Input } from '@/components/ui/input';
import { Clock, Network, Server, AlertCircle, CheckCircle, Activity, Globe, Shield, MapPin, Satellite, TrendingUp, Zap, AlertTriangle, Info, Target, Star, Lightbulb } from 'lucide-react';

interface DomainTestResult {
  timestamp: string;
  domain: string;
  testResults: {
    dns: {
      resolvedIPs: string[];
      resolutionTime: number;
      error?: string;
    };
    multiLocationPing?: {
      locations: string[];
      regions: string[];
      pingResults: {
        location: string;
        region: string;
        ip: string;
        time: number;
        success: boolean;
        error?: string;
      }[];
      uniqueIPs: string[];
      ipConsistency: 'consistent' | 'inconsistent' | 'mixed';
      analysis: string;
      geographicDistribution: {
        regions: string[];
        ipDistribution: Record<string, string[]>;
        coverage: string;
      };
      healthStats: {
        totalServers: number;
        healthyServers: number;
        successfulQueries: number;
        averageResponseTime: number;
      };
    };
    connection: {
      totalTime: number;
      dnsTime: number;
      tcpTime: number;
      sslTime?: number;
      ttfb: number;
      downloadTime: number;
      statusCode: number;
      error?: string;
    };
    server: {
      software: string;
      headers: Record<string, string>;
      responseSize: number;
      responseTime: number;
    };
    cdn: {
      isThroughCDN: boolean;
      hasProxyHeaders: boolean;
      provider?: string;
      headers: Record<string, string | null>;
      proxyHeaders: Record<string, string | null>;
      connectionType: 'direct' | 'cdn' | 'proxy' | 'mixed';
      confidence: 'high' | 'medium' | 'low';
      analysis: string[];
      multiLocationAnalysis?: {
        isCDNByIP: boolean;
        confidence: 'high' | 'medium' | 'low';
        reasoning: string;
      };
      advancedMetrics?: {
        cdnScore: number;
        detectionMethods: string[];
        ipAnalysisScore: number;
        headerAnalysisScore: number;
        serverAnalysisScore: number;
      };
    };
    ssl?: {
      issuer: string;
      validFrom: string;
      validTo: string;
      subjectAltName: string;
    };
    geo?: {
      country?: string;
      region?: string;
      city?: string;
      timezone?: string;
    };
    optimization?: {
      cdn: {
        status: 'excellent' | 'good' | 'needs_improvement' | 'critical';
        suggestions: string[];
        reasoning: string;
        priority: 'high' | 'medium' | 'low';
        estimatedImprovement: string;
      };
      performance: {
        status: 'excellent' | 'good' | 'needs_improvement' | 'critical';
        suggestions: string[];
        reasoning: string;
        priority: 'high' | 'medium' | 'low';
        estimatedImprovement: string;
      };
      ssl: {
        status: 'excellent' | 'good' | 'needs_improvement' | 'critical';
        suggestions: string[];
        reasoning: string;
        priority: 'high' | 'medium' | 'low';
        estimatedImprovement: string;
      };
      overall: {
        score: number;
        grade: 'A+' | 'A' | 'B' | 'C' | 'D';
        recommendations: string[];
        actionPlan: {
          immediate: string[];
          shortTerm: string[];
          longTerm: string[];
        };
        competitiveAnalysis: {
          ranking: string;
          industryAverage: number;
          improvementPotential: string;
        };
      };
    };
  };
  error?: string;
}

interface TestHistory {
  id: string;
  timestamp: string;
  domain: string;
  totalTime: number;
  statusCode: number;
  isThroughCDN: boolean;
  cdnProvider?: string;
  dnsResolutionTime: number;
  serverSoftware: string;
}

// 优化建议分级组件
interface OptimizationSuggestion {
  text: string;
  level: 1 | 2 | 3 | 4 | 5;
  category?: 'cdn' | 'performance' | 'ssl';
}

interface OptimizationLevelConfig {
  level: number;
  name: string;
  description: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive';
}

const OPTIMIZATION_LEVELS: OptimizationLevelConfig[] = [
  {
    level: 1,
    name: '急需改进',
    description: '存在严重缺陷或风险，不立即处理将导致严重后果',
    color: 'text-red-600',
    icon: AlertCircle,
    badgeVariant: 'destructive'
  },
  {
    level: 2,
    name: '高度优先改进',
    description: '存在显著问题或瓶颈，严重影响效率、体验或核心目标达成',
    color: 'text-orange-600',
    icon: AlertTriangle,
    badgeVariant: 'outline'
  },
  {
    level: 3,
    name: '有价值改进',
    description: '存在明确优化空间，改进后能带来明显提升',
    color: 'text-blue-600',
    icon: Target,
    badgeVariant: 'secondary'
  },
  {
    level: 4,
    name: '潜在优化点',
    description: '有优化方向但收益有限，或实施成本较高，需权衡',
    color: 'text-gray-600',
    icon: Info,
    badgeVariant: 'outline'
  },
  {
    level: 5,
    name: '优秀/前瞻建议',
    description: '具有创新性、前瞻性，能带来显著竞争优势或质的飞跃',
    color: 'text-purple-600',
    icon: Star,
    badgeVariant: 'default'
  }
];

function OptimizationSuggestionItem({ suggestion }: { suggestion: OptimizationSuggestion }) {
  const levelConfig = OPTIMIZATION_LEVELS.find(config => config.level === suggestion.level);
  if (!levelConfig) return null;

  const IconComponent = levelConfig.icon;

  return (
    <div className="flex items-start gap-2 text-xs">
      <IconComponent className={`h-3 w-3 ${levelConfig.color} mt-0.5 flex-shrink-0`} />
      <div className="flex-1">
        <span>{suggestion.text}</span>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant={levelConfig.badgeVariant} className="text-xs px-1 py-0">
            Level {suggestion.level}
          </Badge>
          <span className={`text-xs ${levelConfig.color}`}>
            {levelConfig.name}
          </span>
        </div>
      </div>
    </div>
  );
}

function OptimizationLevelLegend() {
  return (
    <div className="mb-4 p-3 bg-muted rounded-lg">
      <h4 className="text-sm font-medium mb-2">优化建议分级说明</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
        {OPTIMIZATION_LEVELS.map((config) => {
          const IconComponent = config.icon;
          return (
            <div key={config.level} className="flex items-center gap-2">
              <IconComponent className={`h-3 w-3 ${config.color} flex-shrink-0`} />
              <div>
                <span className="font-medium">Level {config.level}:</span>
                <span className="ml-1">{config.name}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Home() {
  const [domain, setDomain] = useState('example.com');
  const [isLoading, setIsLoading] = useState(false);
  const [isPingLoading, setIsPingLoading] = useState(false);
  const [testResult, setTestResult] = useState<DomainTestResult | null>(null);
  const [testHistory, setTestHistory] = useState<TestHistory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAutoTesting, setIsAutoTesting] = useState(false);
  const [autoTestInterval, setAutoTestInterval] = useState<NodeJS.Timeout | null>(null);
  const [testProgress, setTestProgress] = useState<{
    stage: 'dns' | 'connection' | 'cdn' | 'ssl' | 'geo' | 'optimization' | 'completed';
    progress: number;
    message: string;
  } | null>(null);

  const runDomainTest = async () => {
    if (!domain.trim()) {
      setError('请输入要测试的域名');
      return;
    }

    setIsLoading(true);
    setIsPingLoading(true);
    setError(null);
    setTestProgress({
      stage: 'dns',
      progress: 0,
      message: '正在解析域名...'
    });
    
    try {
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setTestProgress(prev => {
          if (!prev) return null;
          
          switch (prev.stage) {
            case 'dns':
              if (prev.progress < 20) {
                return { ...prev, progress: Math.min(prev.progress + 2, 20) };
              } else {
                return { stage: 'connection', progress: 20, message: '正在测试连接...' };
              }
            case 'connection':
              if (prev.progress < 50) {
                return { ...prev, progress: Math.min(prev.progress + 3, 50) };
              } else {
                return { stage: 'cdn', progress: 50, message: '正在检测CDN...' };
              }
            case 'cdn':
              if (prev.progress < 70) {
                return { ...prev, progress: Math.min(prev.progress + 2, 70) };
              } else {
                return { stage: 'ssl', progress: 70, message: '正在检查SSL证书...' };
              }
            case 'ssl':
              if (prev.progress < 85) {
                return { ...prev, progress: Math.min(prev.progress + 2, 85) };
              } else {
                return { stage: 'geo', progress: 85, message: '正在获取地理位置...' };
              }
            case 'geo':
              if (prev.progress < 95) {
                return { ...prev, progress: Math.min(prev.progress + 1, 95) };
              } else {
                return { stage: 'optimization', progress: 95, message: '正在生成优化建议...' };
              }
            case 'optimization':
              if (prev.progress < 100) {
                return { ...prev, progress: Math.min(prev.progress + 1, 100) };
              } else {
                return { stage: 'completed', progress: 100, message: '测试完成' };
              }
            default:
              return prev;
          }
        });
      }, 200);

      const response = await fetch(`/api/test-domain?domain=${encodeURIComponent(domain.trim())}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data: DomainTestResult = await response.json();
      setTestResult(data);
      setTestProgress({ stage: 'completed', progress: 100, message: '测试完成' });
      
      // 添加到历史记录
      const historyItem: TestHistory = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        domain: data.domain,
        totalTime: data.testResults.connection.totalTime,
        statusCode: data.testResults.connection.statusCode,
        isThroughCDN: data.testResults.cdn.isThroughCDN,
        cdnProvider: data.testResults.cdn.provider,
        dnsResolutionTime: data.testResults.dns.resolutionTime,
        serverSoftware: data.testResults.server.software,
      };
      
      setTestHistory(prev => [historyItem, ...prev].slice(0, 20)); // 保留最近20条记录
      
      // 清理进度更新定时器
      clearInterval(progressInterval);
      
      // 3秒后清除进度显示
      setTimeout(() => {
        setTestProgress(null);
      }, 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setTestProgress(null);
    } finally {
      setIsLoading(false);
      setIsPingLoading(false);
    }
  };

  const startAutoTest = () => {
    if (isAutoTesting) {
      if (autoTestInterval) {
        clearInterval(autoTestInterval);
        setAutoTestInterval(null);
      }
      setIsAutoTesting(false);
      setTestProgress(null);
    } else {
      if (!domain.trim()) {
        setError('请输入要测试的域名');
        return;
      }
      setIsAutoTesting(true);
      runDomainTest(); // 立即运行一次
      const interval = setInterval(runDomainTest, 5000); // 每5秒测试一次
      setAutoTestInterval(interval);
    }
  };

  useEffect(() => {
    return () => {
      if (autoTestInterval) {
        clearInterval(autoTestInterval);
      }
    };
  }, [autoTestInterval]);

  const formatTime = (time: number) => {
    return `${time.toFixed(2)}ms`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化SSL证书域名范围
  const formatDomainScope = (subjectAltName: string) => {
    if (!subjectAltName) return '';
    
    try {
      // 尝试解析SAN字段，通常格式为：DNS:example.com, DNS:www.example.com, DNS:*.example.com
      const domains = subjectAltName.split(',').map(item => item.trim()).filter(item => item);
      
      if (domains.length <= 3) {
        // 如果域名数量少，直接显示
        return subjectAltName;
      }
      
      // 如果域名数量多，分组显示
      const normalDomains = domains.filter(d => !d.includes('*') && d.startsWith('DNS:'));
      const wildcardDomains = domains.filter(d => d.includes('*') && d.startsWith('DNS:'));
      const otherDomains = domains.filter(d => !d.startsWith('DNS:'));
      
      const result = [];
      
      if (wildcardDomains.length > 0) {
        result.push(
          <div key="wildcard" className="mb-2">
            <div className="text-xs font-medium text-blue-600 mb-1">通配符域名:</div>
            <div className="font-mono text-xs bg-blue-50 p-2 rounded">
              {wildcardDomains.map(d => d.replace('DNS:', '')).join(', ')}
            </div>
          </div>
        );
      }
      
      if (normalDomains.length > 0) {
        result.push(
          <div key="normal" className="mb-2">
            <div className="text-xs font-medium text-green-600 mb-1">普通域名:</div>
            <div className="font-mono text-xs bg-green-50 p-2 rounded max-h-20 overflow-y-auto">
              {normalDomains.slice(0, 10).map(d => d.replace('DNS:', '')).join(', ')}
              {normalDomains.length > 10 && <span className="text-gray-500">... 等{normalDomains.length}个域名</span>}
            </div>
          </div>
        );
      }
      
      if (otherDomains.length > 0) {
        result.push(
          <div key="other" className="mb-2">
            <div className="text-xs font-medium text-orange-600 mb-1">其他记录:</div>
            <div className="font-mono text-xs bg-orange-50 p-2 rounded max-h-16 overflow-y-auto">
              {otherDomains.slice(0, 5).join(', ')}
              {otherDomains.length > 5 && <span className="text-gray-500">... 等{otherDomains.length}个记录</span>}
            </div>
          </div>
        );
      }
      
      return result;
    } catch (error) {
      // 如果解析失败，返回原始内容但限制长度
      if (subjectAltName.length > 200) {
        return (
          <div className="font-mono text-xs max-h-24 overflow-y-auto bg-gray-50 p-2 rounded">
            {subjectAltName}
          </div>
        );
      }
      return subjectAltName;
    }
  };

  const getStatusBadge = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
      return <Badge variant="default">{statusCode}</Badge>;
    } else if (statusCode >= 300 && statusCode < 400) {
      return <Badge variant="secondary">{statusCode}</Badge>;
    } else if (statusCode >= 400 && statusCode < 500) {
      return <Badge variant="destructive">{statusCode}</Badge>;
    } else {
      return <Badge variant="outline">{statusCode}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <AnimatedPageHeader>
          <div className="text-center space-y-2 pt-8">
            <h1 className="text-3xl font-bold">网站性能检测工具</h1>
            <p className="text-muted-foreground">
              全面的域名性能分析，包括CDN状态、网络延迟、SSL证书和服务器性能检测
            </p>
          </div>
        </AnimatedPageHeader>

        <AnimatedInputSection>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                域名性能检测
              </CardTitle>
              <CardDescription>
                输入要测试的域名，支持 HTTP/HTTPS 协议，获取全面的性能分析报告
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="输入域名，如：example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && runDomainTest()}
                  disabled={isLoading}
                />
                <AnimatedButton 
                  onClick={runDomainTest} 
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <AnimatedLoader 
                      size="sm" 
                      variant="spin" 
                      text="测试中..."
                      icon={<Activity className="h-4 w-4" />}
                    />
                  ) : (
                    <>
                      <Activity className="h-4 w-4" />
                      开始测试
                    </>
                  )}
                </AnimatedButton>
                
                <AnimatedButton 
                  variant={isAutoTesting ? "destructive" : "outline"}
                  onClick={startAutoTest}
                  className="flex items-center gap-2"
                  disabled={isLoading}
                >
                  {isAutoTesting ? (
                    <AnimatedLoader 
                      size="sm" 
                      variant="spin" 
                      text=""
                      icon={<Clock className="h-4 w-4" />}
                    />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                  {isAutoTesting ? '停止自动测试' : '自动测试'}
                </AnimatedButton>
              </div>
              
              {/* 测试进度指示器 */}
              {testProgress && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-800">检测进度</span>
                    <span className="text-xs text-blue-600">
                      {testProgress.progress}% - {testProgress.message}
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <motion.div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                      initial={{ width: "0%" }}
                      animate={{ width: `${testProgress.progress}%` }}
                      transition={{ 
                        duration: 0.3,
                        ease: "easeOut"
                      }}
                    />
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-blue-700">
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${testProgress.stage === 'dns' || testProgress.progress > 0 ? 'bg-blue-500 animate-pulse' : 'bg-blue-300'}`}></div>
                      <span className={testProgress.stage === 'dns' || testProgress.progress > 0 ? 'font-medium' : ''}>DNS解析</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${testProgress.stage === 'connection' || testProgress.progress > 20 ? 'bg-blue-500 animate-pulse' : 'bg-blue-300'}`} style={{ animationDelay: '0.1s' }}></div>
                      <span className={testProgress.stage === 'connection' || testProgress.progress > 20 ? 'font-medium' : ''}>连接测试</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${testProgress.stage === 'cdn' || testProgress.progress > 50 ? 'bg-blue-500 animate-pulse' : 'bg-blue-300'}`} style={{ animationDelay: '0.2s' }}></div>
                      <span className={testProgress.stage === 'cdn' || testProgress.progress > 50 ? 'font-medium' : ''}>CDN检测</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${testProgress.stage === 'ssl' || testProgress.progress > 70 ? 'bg-blue-500 animate-pulse' : 'bg-blue-300'}`} style={{ animationDelay: '0.3s' }}></div>
                      <span className={testProgress.stage === 'ssl' || testProgress.progress > 70 ? 'font-medium' : ''}>SSL证书</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${testProgress.stage === 'geo' || testProgress.progress > 85 ? 'bg-blue-500 animate-pulse' : 'bg-blue-300'}`} style={{ animationDelay: '0.4s' }}></div>
                      <span className={testProgress.stage === 'geo' || testProgress.progress > 85 ? 'font-medium' : ''}>地理位置</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${testProgress.stage === 'optimization' || testProgress.progress > 95 ? 'bg-blue-500 animate-pulse' : 'bg-blue-300'}`} style={{ animationDelay: '0.5s' }}></div>
                      <span className={testProgress.stage === 'optimization' || testProgress.progress > 95 ? 'font-medium' : ''}>优化建议</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </AnimatedInputSection>

        <InlineAnimatedMessage 
          type="error" 
          message={error} 
          isVisible={!!error} 
        />

        {testResult && (
          <AnimatedTabs defaultValue="overview" className="space-y-4">
            <AnimatedTabsList className="grid w-full grid-cols-8">
              <AnimatedTabsTrigger value="overview">概览</AnimatedTabsTrigger>
              <AnimatedTabsTrigger value="performance">性能</AnimatedTabsTrigger>
              <AnimatedTabsTrigger value="multi-location">多地Ping</AnimatedTabsTrigger>
              <AnimatedTabsTrigger value="cdn">CDN分析</AnimatedTabsTrigger>
              <AnimatedTabsTrigger value="optimization">优化建议</AnimatedTabsTrigger>
              <AnimatedTabsTrigger value="server">服务器</AnimatedTabsTrigger>
              <AnimatedTabsTrigger value="ssl">SSL证书</AnimatedTabsTrigger>
              <AnimatedTabsTrigger value="history">历史记录</AnimatedTabsTrigger>
            </AnimatedTabsList>

            <AnimatedTabsContent value="overview">
              <AnimatedContainer animationType="slideUp" delay={0.1}>
                <AnimatedGrid 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                  animationType="stagger"
                  staggerDelay={0.1}
                >
                  <AnimatedCard hoverEffect="lift">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">总响应时间</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        <AnimatedTime 
                          time={testResult?.testResults?.connection?.totalTime || 0} 
                          animationType="bounce"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        从发起请求到收到响应
                      </p>
                    </CardContent>
                  </AnimatedCard>

                  <AnimatedCard hoverEffect="lift">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">DNS解析时间</CardTitle>
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        <AnimatedTime 
                          time={testResult?.testResults?.dns?.resolutionTime || 0} 
                          animationType="bounce"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        域名解析耗时
                      </p>
                    </CardContent>
                  </AnimatedCard>

                  <AnimatedCard hoverEffect="lift">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">HTTP状态</CardTitle>
                      <AnimatedHttpStatus 
                        statusCode={testResult?.testResults?.connection?.statusCode || 0}
                        size="sm"
                      />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        <AnimatedHttpStatus 
                          statusCode={testResult?.testResults?.connection?.statusCode || 0}
                          showCode={true}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        服务器响应状态
                      </p>
                    </CardContent>
                  </AnimatedCard>

                  <AnimatedCard hoverEffect="lift">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">连接类型</CardTitle>
                      <AnimatedCDNBreathing 
                        isThroughCDN={testResult?.testResults?.cdn?.connectionType === 'cdn'}
                        provider={testResult?.testResults?.cdn?.provider}
                        confidence={testResult?.testResults?.cdn?.confidence}
                        size="sm"
                      />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {testResult?.testResults?.cdn?.connectionType === 'cdn' && 'CDN加速'}
                        {testResult?.testResults?.cdn?.connectionType === 'direct' && '直连'}
                        {testResult?.testResults?.cdn?.connectionType === 'proxy' && '代理'}
                        {testResult?.testResults?.cdn?.connectionType === 'mixed' && '混合'}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {testResult?.testResults?.cdn?.provider || '未知提供商'} 
                        ({testResult?.testResults?.cdn?.confidence === 'high' ? '高置信度' : 
                          testResult?.testResults?.cdn?.confidence === 'medium' ? '中等置信度' : '低置信度'})
                      </p>
                      {testResult?.testResults?.cdn?.hasProxyHeaders && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            检测到代理头信息
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </AnimatedCard>
                </AnimatedGrid>
              </AnimatedContainer>
            </AnimatedTabsContent>

            <AnimatedTabsContent value="performance">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatedCard hoverEffect="lift">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        时间分析
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>DNS解析:</span>
                        <span className="font-mono">
                          <AnimatedTime 
                            time={testResult?.testResults?.dns?.resolutionTime || 0} 
                            animationType="slide"
                            showUnit={true}
                          />
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>TCP连接:</span>
                        <span className="font-mono">
                          <AnimatedTime 
                            time={testResult?.testResults?.connection?.tcpTime || 0} 
                            animationType="slide"
                            showUnit={true}
                          />
                        </span>
                      </div>
                      {testResult?.testResults?.connection?.sslTime && (
                        <div className="flex justify-between text-sm">
                          <span>SSL握手:</span>
                          <span className="font-mono">
                            <AnimatedTime 
                              time={testResult?.testResults?.connection?.sslTime} 
                              animationType="slide"
                              showUnit={true}
                            />
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span>首字节(TTFB):</span>
                        <span className="font-mono">
                          <AnimatedTime 
                            time={testResult?.testResults?.connection?.ttfb || 0} 
                            animationType="slide"
                            showUnit={true}
                          />
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>内容下载:</span>
                        <span className="font-mono">
                          <AnimatedTime 
                            time={testResult?.testResults?.connection?.downloadTime || 0} 
                            animationType="slide"
                            showUnit={true}
                          />
                        </span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between text-sm font-medium">
                          <span>总计:</span>
                          <span className="font-mono">
                            <AnimatedTime 
                              time={testResult?.testResults?.connection?.totalTime || 0} 
                              animationType="bounce"
                              showUnit={true}
                            />
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </AnimatedCard>

                  <AnimatedCard hoverEffect="lift">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Network className="h-4 w-4" />
                        网络信息
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>解析IP:</span>
                        <span className="font-mono text-xs">
                          {testResult?.testResults?.dns?.resolvedIPs?.join(', ') || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>响应大小:</span>
                        <span className="font-mono">
                          <AnimatedBytes 
                            bytes={testResult?.testResults?.server?.responseSize || 0} 
                            animationType="bounce"
                          />
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>服务器响应:</span>
                        <span className="font-mono">
                          <AnimatedTime 
                            time={testResult?.testResults?.server?.responseTime || 0} 
                            animationType="slide"
                            showUnit={true}
                          />
                        </span>
                      </div>
                    </CardContent>
                  </AnimatedCard>

                  <AnimatedCard hoverEffect="lift">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Server className="h-4 w-4" />
                        服务器信息
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>服务器软件:</span>
                        <span className="font-mono text-xs">{testResult?.testResults?.server?.software || '未知'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>测试时间:</span>
                        <span>{formatTimestamp(testResult.timestamp)}</span>
                      </div>
                    </CardContent>
                  </AnimatedCard>
                </div>
            </AnimatedTabsContent>

            <AnimatedTabsContent value="multi-location">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Satellite className="h-4 w-4" />
                      多地Ping分析
                    </CardTitle>
                    <CardDescription>
                      通过全球多个DNS服务器解析域名，根据IP地址一致性判断CDN使用情况
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {testResult?.testResults?.multiLocationPing ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="text-sm font-medium">检测位置</div>
                            <div className="text-lg font-bold">
                              {testResult?.testResults?.multiLocationPing?.locations.length || 0} 个地点
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm font-medium">IP一致性</div>
                            <div className="text-lg font-bold">
                              {testResult?.testResults?.multiLocationPing?.ipConsistency === 'consistent' && '一致'}
                              {testResult?.testResults?.multiLocationPing?.ipConsistency === 'inconsistent' && '不一致'}
                              {testResult?.testResults?.multiLocationPing?.ipConsistency === 'mixed' && '混合'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm font-medium">唯一IP地址</div>
                          <div className="text-lg font-bold">
                            {testResult?.testResults?.multiLocationPing?.uniqueIPs.length || 0} 个
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {testResult?.testResults?.multiLocationPing?.uniqueIPs.join(', ') || '无'}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm font-medium">地理覆盖</div>
                          <div className="text-lg font-bold">
                            {testResult?.testResults?.multiLocationPing?.geographicDistribution.coverage || '未知'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            检测区域: {testResult?.testResults?.multiLocationPing?.regions.join(', ') || '无'}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm font-medium">分析结果</div>
                          <div className="text-sm p-3 bg-muted rounded-md">
                            {testResult?.testResults?.multiLocationPing?.analysis}
                          </div>
                        </div>

                        {testResult?.testResults?.cdn?.multiLocationAnalysis && (
                          <div className="space-y-2">
                            <div className="text-sm font-medium">CDN检测结果</div>
                            <div className="text-sm p-3 bg-muted rounded-md">
                              <div className="flex items-center gap-2 mb-2">
                                {testResult?.testResults?.cdn?.multiLocationAnalysis?.isCDNByIP ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-red-500" />
                                )}
                                <span className="font-medium">
                                  {testResult?.testResults?.cdn?.multiLocationAnalysis?.isCDNByIP ? '检测到CDN' : '未检测到CDN'}
                                </span>
                                <Badge variant={
                                  testResult?.testResults?.cdn?.multiLocationAnalysis?.confidence === 'high' ? 'default' :
                                  testResult?.testResults?.cdn?.multiLocationAnalysis?.confidence === 'medium' ? 'secondary' : 'outline'
                                }>
                                  {testResult?.testResults?.cdn?.multiLocationAnalysis?.confidence === 'high' ? '高置信度' :
                                   testResult?.testResults?.cdn?.multiLocationAnalysis?.confidence === 'medium' ? '中等置信度' : '低置信度'}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {testResult?.testResults?.cdn?.multiLocationAnalysis?.reasoning || '无分析结果'}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <Satellite className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>多地Ping检测失败或暂无数据</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      详细Ping结果
                    </CardTitle>
                    <CardDescription>
                      各个地理位置的DNS解析结果详情
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isPingLoading ? (
                      <AnimatedPingWaveLoader 
                        isLoading={true}
                        locations={['北京', '上海', '广州', '深圳', '成都', '杭州', '南京', '武汉']}
                        currentLocation="正在检测..."
                      />
                    ) : testResult?.testResults?.multiLocationPing ? (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {testResult?.testResults?.multiLocationPing?.pingResults?.map((result, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              {result?.success ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              )}
                              <div>
                                <div className="font-medium text-sm">{result?.location}</div>
                                <div className="text-xs text-muted-foreground">
                                  {result?.region} • {result?.success ? `${result?.time}ms` : '检测失败'}
                                </div>
                                {!result?.success && result?.error && (
                                  <div className="text-xs text-red-600 mt-1">
                                    失败原因: {result?.error}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-mono text-sm">
                                {result?.success ? result?.ip : 'N/A'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {result?.success ? '解析成功' : '解析失败'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>暂无详细的Ping结果数据</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </AnimatedTabsContent>

            <AnimatedTabsContent value="cdn">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>CDN 检测信息</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">连接类型:</span>
                      <Badge variant={
                        testResult?.testResults?.cdn?.connectionType === 'cdn' ? 'default' :
                        testResult?.testResults?.cdn?.connectionType === 'direct' ? 'secondary' :
                        testResult?.testResults?.cdn?.connectionType === 'proxy' ? 'outline' : 'destructive'
                      }>
                        {testResult?.testResults?.cdn?.connectionType === 'cdn' && 'CDN加速'}
                        {testResult?.testResults?.cdn?.connectionType === 'direct' && '直连'}
                        {testResult?.testResults?.cdn?.connectionType === 'proxy' && '代理'}
                        {testResult?.testResults?.cdn?.connectionType === 'mixed' && '混合'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">检测置信度:</span>
                      <Badge variant={
                        testResult?.testResults?.cdn?.confidence === 'high' ? 'default' :
                        testResult?.testResults?.cdn?.confidence === 'medium' ? 'outline' : 'secondary'
                      }>
                        {testResult?.testResults?.cdn?.confidence === 'high' && '高置信度'}
                        {testResult?.testResults?.cdn?.confidence === 'medium' && '中等置信度'}
                        {testResult?.testResults?.cdn?.confidence === 'low' && '低置信度'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">CDN 提供商:</span>
                      <Badge variant="outline">
                        {testResult?.testResults?.cdn?.provider || '未检测到'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">代理头信息:</span>
                      <Badge variant={testResult?.testResults?.cdn?.hasProxyHeaders ? "outline" : "secondary"}>
                        {testResult?.testResults?.cdn?.hasProxyHeaders ? '检测到' : '未检测到'}
                      </Badge>
                    </div>

                    {/* 多地Ping分析结果 */}
                    {testResult?.testResults?.multiLocationPing && (
                      <>
                        <div className="border-t pt-3 mt-3">
                          <div className="text-sm font-medium mb-2">多地Ping检测结果:</div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">IP一致性:</span>
                              <Badge variant={
                                testResult?.testResults?.multiLocationPing?.ipConsistency === 'consistent' ? 'secondary' :
                                testResult?.testResults?.multiLocationPing?.ipConsistency === 'inconsistent' ? 'default' : 'outline'
                              }>
                                {testResult?.testResults?.multiLocationPing?.ipConsistency === 'consistent' && '一致'}
                                {testResult?.testResults?.multiLocationPing?.ipConsistency === 'inconsistent' && '不一致'}
                                {testResult?.testResults?.multiLocationPing?.ipConsistency === 'mixed' && '混合'}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">唯一IP数量:</span>
                              <span className="text-sm font-mono">
                                {testResult?.testResults?.multiLocationPing?.uniqueIPs.length || 0} 个
                              </span>
                            </div>
                          </div>
                        </div>

                        {testResult?.testResults?.cdn?.multiLocationAnalysis && (
                          <div className="border-t pt-3 mt-3">
                            <div className="text-sm font-medium mb-2">IP分析结论:</div>
                            <div className="text-xs p-2 bg-muted rounded">
                              <div className="flex items-center gap-2 mb-1">
                                {testResult?.testResults?.cdn?.multiLocationAnalysis.isCDNByIP ? (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                ) : (
                                  <AlertCircle className="h-3 w-3 text-red-500" />
                                )}
                                <span className="font-medium text-xs">
                                  {testResult?.testResults?.cdn?.multiLocationAnalysis.isCDNByIP ? 'IP分析表明使用CDN' : 'IP分析表明直连'}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {testResult?.testResults?.cdn?.multiLocationAnalysis.reasoning || '无分析结果'}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    
                    {/* 分析结果 */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">分析结果:</h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {testResult?.testResults?.cdn?.analysis?.map((analysis, index) => (
                          <div key={index} className="text-xs text-muted-foreground">
                            • {analysis}
                          </div>
                        )) || <div className="text-xs text-muted-foreground">无分析结果</div>}
                      </div>
                    </div>
                    
                    {testResult?.testResults?.cdn?.isThroughCDN && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">CDN 头信息:</h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {Object.entries(testResult?.testResults?.cdn?.headers || {}).map(([key, value]) => (
                            value && (
                              <div key={key} className="flex justify-between text-sm">
                                <span className="font-mono text-xs">{key}:</span>
                                <span className="font-mono text-xs break-all">{value}</span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {testResult?.testResults?.cdn?.hasProxyHeaders && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">代理头信息:</h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {Object.entries(testResult?.testResults?.cdn?.proxyHeaders || {}).map(([key, value]) => (
                            value && (
                              <div key={key} className="flex justify-between text-sm">
                                <span className="font-mono text-xs">{key}:</span>
                                <span className="font-mono text-xs break-all">{value}</span>
                              </div>
                            )
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          这些头信息可能由代理服务器、负载均衡器或反向代理添加
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>性能分析</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="text-sm font-medium mb-2">CDN 性能评估</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>总响应时间:</span>
                          <span className="font-mono">{formatTime(testResult?.testResults?.connection?.totalTime || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>DNS解析时间:</span>
                          <span className="font-mono">{formatTime(testResult?.testResults?.dns?.resolutionTime || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>网络传输时间:</span>
                          <span className="font-mono">
                            {formatTime((testResult?.testResults?.connection?.totalTime || 0) - (testResult?.testResults?.dns?.resolutionTime || 0))}
                          </span>
                        </div>
                      </div>
                    </div>
                    
  
                  </CardContent>
                </Card>
              </div>
            </AnimatedTabsContent>

            <AnimatedTabsContent value="optimization">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {testResult?.testResults?.optimization ? (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          综合评分
                        </CardTitle>
                        <CardDescription>
                          基于CDN、性能、安全性的综合评估
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center space-y-2">
                          <div className="text-4xl font-bold">
                            {testResult?.testResults?.optimization?.overall.score || 0}
                            <span className="text-2xl text-muted-foreground">/100</span>
                          </div>
                          <Badge variant={
                            testResult?.testResults?.optimization?.overall.grade === 'A+' ? 'default' :
                            testResult?.testResults?.optimization?.overall.grade === 'A' ? 'default' :
                            testResult?.testResults?.optimization?.overall.grade === 'B' ? 'secondary' :
                            testResult?.testResults?.optimization?.overall.grade === 'C' ? 'outline' : 'destructive'
                          } className="text-lg px-3 py-1">
                            等级: {testResult?.testResults?.optimization?.overall.grade || 'N/A'}
                          </Badge>
                        </div>

                        {testResult?.testResults?.optimization?.overall?.recommendations && testResult?.testResults?.optimization?.overall?.recommendations?.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">优先改进建议:</h4>
                            <div className="space-y-1">
                              {testResult?.testResults?.optimization?.overall?.recommendations?.map((rec, index) => (
                                <div key={index} className="flex items-start gap-2 text-sm">
                                  <AlertCircle className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                                  <span>{rec}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          详细优化建议
                        </CardTitle>
                        <CardDescription>
                          基于五个分级的具体改进方案，从急需改进到前瞻建议
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <OptimizationLevelLegend />
                        
                        {/* 直接使用后端返回的分级建议 */}
                        {(() => {
                          // 将所有建议合并并按级别排序
                          const allSuggestions: OptimizationSuggestion[] = [];
                          
                          // 添加CDN建议
                          testResult?.testResults?.optimization?.cdn?.suggestions?.forEach((suggestion: any) => {
                            allSuggestions.push({
                              text: suggestion.text,
                              level: suggestion.level,
                              category: 'cdn'
                            });
                          });
                          
                          // 添加性能建议
                          testResult?.testResults?.optimization?.performance?.suggestions?.forEach((suggestion: any) => {
                            allSuggestions.push({
                              text: suggestion.text,
                              level: suggestion.level,
                              category: 'performance'
                            });
                          });
                          
                          // 添加安全建议
                          testResult?.testResults?.optimization?.ssl?.suggestions?.forEach((suggestion: any) => {
                            allSuggestions.push({
                              text: suggestion.text,
                              level: suggestion.level,
                              category: 'ssl'
                            });
                          });
                          
                          // 按级别排序（Level 1在最前）
                          const sortedSuggestions = allSuggestions.sort((a, b) => a.level - b.level);
                          
                          return (
                            <div className="space-y-4">
                              {/* 按级别分组显示 */}
                              {OPTIMIZATION_LEVELS.map(levelConfig => {
                                const levelSuggestions = sortedSuggestions.filter(s => s.level === levelConfig.level);
                                
                                if (levelSuggestions.length === 0) return null;
                                
                                const IconComponent = levelConfig.icon;
                                
                                return (
                                  <div key={levelConfig.level} className="space-y-2">
                                    <div className="flex items-center gap-2 pb-2 border-b">
                                      <IconComponent className={`h-4 w-4 ${levelConfig.color}`} />
                                      <h5 className="font-medium text-sm">
                                        Level {levelConfig.level}: {levelConfig.name}
                                      </h5>
                                      <Badge variant={levelConfig.badgeVariant} className="text-xs">
                                        {levelSuggestions.length} 项
                                      </Badge>
                                    </div>
                                    <div className="space-y-2 pl-6">
                                      {levelSuggestions.map((suggestion, index) => (
                                        <OptimizationSuggestionItem 
                                          key={`${suggestion.level}-${index}`} 
                                          suggestion={suggestion} 
                                        />
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card className="col-span-2">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">暂无优化建议数据</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </AnimatedTabsContent>

            <AnimatedTabsContent value="server">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>服务器信息</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>服务器软件:</span>
                      <span className="font-mono text-xs">{testResult?.testResults?.server?.software || '未知'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>响应大小:</span>
                      <span className="font-mono">{formatBytes(testResult?.testResults?.server?.responseSize || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>服务器响应时间:</span>
                      <span className="font-mono">{formatTime(testResult?.testResults?.server?.responseTime || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>测试域名:</span>
                      <span className="font-mono text-xs break-all">{testResult.domain}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>测试时间:</span>
                      <span>{formatTimestamp(testResult.timestamp)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>响应头信息</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {Object.entries(testResult?.testResults?.server?.headers || {}).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="font-mono text-xs font-medium">{key}:</span>
                          <span className="font-mono text-xs break-all max-w-[60%] text-right">{value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </AnimatedTabsContent>

            <AnimatedTabsContent value="ssl">
              {testResult?.testResults?.ssl ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        SSL证书信息
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>颁发机构:</span>
                        <span className="font-mono text-xs">{testResult?.testResults?.ssl?.issuer || '未知'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>生效时间:</span>
                        <span className="font-mono text-xs">{testResult?.testResults?.ssl?.validFrom || '未知'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>过期时间:</span>
                        <span className="font-mono text-xs">{testResult?.testResults?.ssl?.validTo || '未知'}</span>
                      </div>
                      <div className="text-sm">
                        <span className="block mb-2">域名范围:</span>
                        <div className="space-y-1">
                          {formatDomainScope(testResult?.testResults?.ssl?.subjectAltName || '')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>证书状态</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="text-sm font-medium mb-2">证书有效性</h4>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>• 证书已正确安装并生效</p>
                          <p>• 证书链完整，受信任的颁发机构</p>
                          <p>• 证书域名与访问域名匹配</p>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="text-sm font-medium mb-2">安全建议</h4>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>• 定期检查证书过期时间</p>
                          <p>• 使用强加密算法和密钥长度</p>
                          <p>• 启用HSTS头部增强安全性</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">无SSL证书信息</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      该域名使用HTTP协议或未提供SSL证书信息
                    </p>
                  </CardContent>
                </Card>
              )}
            </AnimatedTabsContent>

            <AnimatedTabsContent value="history">
              <AnimatedCard hoverEffect="lift">
                  <CardHeader>
                    <CardTitle>测试历史记录</CardTitle>
                    <CardDescription>
                      显示最近 20 次测试结果
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AnimatedHistoryList 
                      items={testHistory}
                      onItemClick={(item) => {
                        setDomain(item.domain);
                        runDomainTest();
                      }}
                      maxItems={20}
                    />
                  </CardContent>
                </AnimatedCard>
            </AnimatedTabsContent>
          </AnimatedTabs>
        )}

        {!testResult && !isLoading && !error && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Globe className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">开始域名性能检测</h3>
              <p className="text-muted-foreground text-center mb-4">
                输入要测试的域名，获取详细的性能分析报告，包括CDN状态、网络延迟、SSL证书和服务器信息
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}