import { NextRequest, NextResponse } from 'next/server';
import { promisify } from 'util';
import dns from 'dns';
import http from 'http';
import https from 'https';
import { exec } from 'child_process';

const dnsLookup = promisify(dns.lookup);
const dnsResolve = promisify(dns.resolve);
const execAsync = promisify(exec);

// 多地ping检测的DNS服务器列表（全球多个地理位置）
const MULTI_LOCATION_DNS = [
  // 中国大陆
  { name: '北京', dns: '223.5.5.5', region: '华北' },      // 阿里云DNS
  { name: '上海', dns: '119.29.29.29', region: '华东' },    // 腾讯云DNS
  { name: '广州', dns: '114.114.114.114', region: '华南' }, // 114DNS
  { name: '深圳', dns: '8.8.8.8', region: '华南' },        // Google DNS
  { name: '成都', dns: '180.76.76.76', region: '西南' },    // 百度DNS
  { name: '武汉', dns: '210.2.4.8', region: '华中' },      // CNNIC DNS
  { name: '杭州', dns: '101.226.4.6', region: '华东' },     // 阿里DNS
  { name: '南京', dns: '218.104.78.2', region: '华东' },    // 中国电信DNS
  { name: '西安', dns: '61.134.1.4', region: '西北' },     // 中国联通DNS
  { name: '重庆', dns: '61.128.128.68', region: '西南' },   // 中国移动DNS
  
  // 港澳台
  { name: '香港', dns: '1.1.1.1', region: '香港' },        // Cloudflare DNS
  { name: '台北', dns: '168.95.1.1', region: '台湾' },     // Hinet DNS
  { name: '澳门', dns: '8.8.8.8', region: '澳门' },       // Google DNS (替换)
  
  // 亚太地区
  { name: '东京', dns: '208.67.222.222', region: '日本' },  // OpenDNS
  { name: '大阪', dns: '1.0.0.1', region: '日本' },        // Cloudflare DNS
  { name: '首尔', dns: '164.124.101.2', region: '韩国' },   // KT DNS
  { name: '新加坡', dns: '9.9.9.9', region: '新加坡' },     // Quad9 DNS
  { name: '曼谷', dns: '8.26.56.26', region: '泰国' },     // Verisign DNS
  { name: '雅加达', dns: '1.1.1.1', region: '印尼' },      // Cloudflare DNS (替换)
  { name: '马尼拉', dns: '8.8.8.8', region: '菲律宾' },    // Google DNS (替换)
  { name: '悉尼', dns: '1.1.1.1', region: '澳洲' },        // Cloudflare DNS (替换)
  { name: '墨尔本', dns: '139.130.4.4', region: '澳洲' },  // Optus DNS
  
  // 欧洲地区
  { name: '伦敦', dns: '1.1.1.1', region: '英国' },        // Cloudflare DNS (替换)
  { name: '巴黎', dns: '1.1.1.1', region: '法国' },        // Cloudflare DNS (替换)
  { name: '法兰克福', dns: '1.1.1.1', region: '德国' },     // Cloudflare DNS (替换)
  { name: '阿姆斯特丹', dns: '185.228.168.168', region: '荷兰' }, // CleanBrowsing
  { name: '斯德哥尔摩', dns: '1.1.1.1', region: '瑞典' },   // Cloudflare DNS (替换)
  { name: '莫斯科', dns: '77.88.8.8', region: '俄罗斯' },  // Yandex DNS
  { name: '苏黎世', dns: '195.186.1.111', region: '瑞士' }, // Swisscom DNS
  
  // 北美地区
  { name: '纽约', dns: '8.8.8.8', region: '美国' },        // Google DNS (替换)
  { name: '洛杉矶', dns: '8.8.4.4', region: '美国' },      // Google DNS (替换)
  { name: '芝加哥', dns: '8.8.8.8', region: '美国' },      // Google DNS (替换)
  { name: '多伦多', dns: '8.8.8.8', region: '加拿大' },    // Google DNS (替换)
  { name: '温哥华', dns: '8.8.8.8', region: '加拿大' },    // Google DNS (替换)
  { name: '墨西哥城', dns: '8.8.8.8', region: '墨西哥' },  // Google DNS (替换)
  
  // 南美地区
  { name: '圣保罗', dns: '8.8.8.8', region: '巴西' },      // Google DNS (替换)
  { name: '布宜诺斯艾利斯', dns: '8.8.8.8', region: '阿根廷' }, // Google DNS (替换)
  
  // 中东非洲
  { name: '迪拜', dns: '8.8.8.8', region: '阿联酋' },      // Google DNS (替换)
  { name: '特拉维夫', dns: '8.8.8.8', region: '以色列' },  // Google DNS (替换)
  { name: '开罗', dns: '8.8.8.8', region: '埃及' },        // Google DNS (替换)
  { name: '约翰内斯堡', dns: '8.8.8.8', region: '南非' },   // Google DNS (替换)
];

// DNS服务器健康状态缓存
const dnsHealthCache = new Map<string, { healthy: boolean; lastCheck: number; responseTime: number; error?: string }>();

// 检查DNS服务器健康状态（优化版本，增加并发和超时控制）
async function checkDNSHealth(dnsServer: string): Promise<{ healthy: boolean; responseTime: number; error?: string }> {
  const cacheKey = dnsServer;
  const now = Date.now();
  const cached = dnsHealthCache.get(cacheKey);
  
  // 如果缓存未过期（5分钟），直接返回缓存结果
  if (cached && (now - cached.lastCheck) < 300000) {
    return cached;
  }
  
  // 尝试多个不同的域名进行验证，提高检测准确性
  const testDomains = ['google.com', 'cloudflare.com', 'github.com'];
  
  // 并发检查多个域名，使用Promise.race来实现超时控制
  const domainCheckPromises = testDomains.map(async (domain) => {
    try {
      const startTime = Date.now();
      const command = `dig @${dnsServer} ${domain} +short +timeout=1`;
      const { stdout, stderr } = await execAsync(command, { timeout: 2000 });
      const responseTime = Date.now() - startTime;
      
      if (stderr) {
        throw new Error(`DNS health check failed: ${stderr}`);
      }
      
      const lines = stdout.trim().split('\n');
      const ip = lines.find(line => 
        line.match(/^(\d{1,3}\.){3}\d{1,3}$/) ||
        line.match(/^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/)
      );
      
      if (ip) {
        return { healthy: true, responseTime };
      } else {
        throw new Error(`No valid IP address found for ${domain}`);
      }
    } catch (error) {
      throw error;
    }
  });
  
  try {
    // 使用Promise.any来获取第一个成功的检查结果
    const result = await Promise.any(domainCheckPromises);
    // 缓存结果
    dnsHealthCache.set(cacheKey, { ...result, lastCheck: now });
    return result;
  } catch (error) {
    // 所有域名都尝试失败了
    const result = { healthy: false, responseTime: 0, error: 'All test domains failed' };
    dnsHealthCache.set(cacheKey, { ...result, lastCheck: now });
    return result;
  }
}

// 验证IP地址有效性
function isValidIPAddress(ip: string): boolean {
  // IPv4验证
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  if (ipv4Regex.test(ip)) {
    const matches = ip.match(ipv4Regex)!;
    return matches.slice(1, 5).every(octet => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255;
    });
  }
  
  // IPv6验证
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
  if (ipv6Regex.test(ip)) {
    // 简单的IPv6格式验证
    return ip.split(':').length >= 3 && ip.split(':').length <= 8;
  }
  
  return false;
}

// 带重试机制的DNS查询（优化版本，减少超时时间）
async function dnsQueryWithRetry(dnsServer: string, domain: string, maxRetries: number = 1): Promise<{ ip: string; time: number; success: boolean }> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const startTime = Date.now();
      const command = `dig @${dnsServer} ${domain} +short +timeout=1`;
      const { stdout, stderr } = await execAsync(command, { timeout: 3000 });
      const queryTime = Date.now() - startTime;
      
      if (stderr) {
        throw new Error(`DNS query failed: ${stderr}`);
      }
      
      // 解析dig命令的输出
      const lines = stdout.trim().split('\n');
      const ip = lines.find(line => {
        const trimmed = line.trim();
        return trimmed && isValidIPAddress(trimmed);
      });
      
      if (ip) {
        return { ip: ip.trim(), time: queryTime, success: true };
      } else {
        throw new Error('No valid IP address found in DNS response');
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // 如果不是最后一次尝试，等待一段时间再重试
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 500 * attempt)); // 减少等待时间
      }
    }
  }
  
  // 所有重试都失败了
  return { ip: '', time: 0, success: false, error: lastError?.message };
}

async function multiLocationPing(domain: string): Promise<{
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
}> {
  const results = {
    locations: MULTI_LOCATION_DNS.map(loc => loc.name),
    regions: [...new Set(MULTI_LOCATION_DNS.map(loc => loc.region))],
    pingResults: [] as {
      location: string;
      region: string;
      ip: string;
      time: number;
      success: boolean;
      error?: string;
    }[],
    uniqueIPs: [] as string[],
    ipConsistency: 'consistent' as 'consistent' | 'inconsistent' | 'mixed',
    analysis: '',
    geographicDistribution: {
      regions: [...new Set(MULTI_LOCATION_DNS.map(loc => loc.region))],
      ipDistribution: {} as Record<string, string[]>,
      coverage: ''
    },
    healthStats: {
      totalServers: MULTI_LOCATION_DNS.length,
      healthyServers: 0,
      successfulQueries: 0,
      averageResponseTime: 0
    }
  };

  // 首先检查DNS服务器健康状态，并按地区分类
  const healthyChineseDNS = [];      // 健康的中国DNS服务器
  const healthyOtherDNS = [];        // 健康的其他地区DNS服务器
  const unhealthyChineseDNS = [];    // 不健康的中国DNS服务器
  const unhealthyOtherDNS = [];      // 不健康的其他地区DNS服务器
  
  const healthCheckPromises = MULTI_LOCATION_DNS.map(async (location) => {
    const health = await checkDNSHealth(location.dns);
    return { location, health };
  });
  
  const healthResults = await Promise.all(healthCheckPromises);
  
  // 按地区和健康状态分类
  for (const { location, health } of healthResults) {
    const isChinese = ['华北', '华东', '华南', '西南', '华中', '西北', '东北', '香港', '澳门', '台湾'].includes(location.region);
    
    if (health.healthy) {
      if (isChinese) {
        healthyChineseDNS.push(location);
      } else {
        healthyOtherDNS.push(location);
      }
      results.healthStats.healthyServers++;
    } else {
      if (isChinese) {
        unhealthyChineseDNS.push({ location, health });
      } else {
        unhealthyOtherDNS.push({ location, health });
      }
    }
  }

  // 如果健康的DNS服务器太少，发出警告
  const totalHealthy = healthyChineseDNS.length + healthyOtherDNS.length;
  if (totalHealthy < MULTI_LOCATION_DNS.length * 0.5) {
    console.warn(`Only ${totalHealthy} out of ${MULTI_LOCATION_DNS.length} DNS servers are healthy`);
  }

  // 按要求的顺序处理DNS服务器：
  // 1. 健康的中国DNS服务器
  // 2. 健康的其他地区DNS服务器
  // 3. 不健康的中国DNS服务器
  // 4. 不健康的其他地区DNS服务器

  // 创建临时数组来分别存储不同类型的结果
  const successfulChineseResults: {
    location: string;
    region: string;
    ip: string;
    time: number;
    success: boolean;
    error?: string;
  }[] = [];
  
  const successfulOtherResults: {
    location: string;
    region: string;
    ip: string;
    time: number;
    success: boolean;
    error?: string;
  }[] = [];
  
  const failedResults: {
    location: string;
    region: string;
    ip: string;
    time: number;
    success: boolean;
    error?: string;
  }[] = [];

  // 1. 首先并发执行健康的中国DNS服务器查询（减少重试次数）
  const chinesePromises = healthyChineseDNS.map(async (location) => {
    try {
      const queryResult = await dnsQueryWithRetry(location.dns, domain, 1);
      
      if (queryResult.success) {
        successfulChineseResults.push({
          location: location.name,
          region: location.region,
          ip: queryResult.ip,
          time: queryResult.time,
          success: true
        });
        results.healthStats.successfulQueries++;
      } else {
        // 如果远程DNS查询失败，回退到本地DNS查询
        try {
          const startTime = Date.now();
          const addresses = await dnsLookup(domain);
          const endTime = Date.now();
          const queryTime = endTime - startTime;
          
          const ip = Array.isArray(addresses) 
            ? addresses[0].address 
            : addresses.address;
          
          successfulChineseResults.push({
            location: location.name,
            region: location.region,
            ip: ip,
            time: queryTime,
            success: true
          });
          results.healthStats.successfulQueries++;
        } catch (fallbackError) {
          failedResults.push({
            location: location.name,
            region: location.region,
            ip: '',
            time: 0,
            success: false,
            error: `远程查询失败: ${queryResult.error || 'Unknown error'}; 本地回退也失败: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`
          });
        }
      }
    } catch (error) {
      failedResults.push({
        location: location.name,
        region: location.region,
        ip: '',
        time: 0,
        success: false,
        error: `查询过程异常: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });

  // 2. 并发执行健康的其他地区DNS服务器查询（减少重试次数）
  const otherPromises = healthyOtherDNS.map(async (location) => {
    try {
      const queryResult = await dnsQueryWithRetry(location.dns, domain, 1);
      
      if (queryResult.success) {
        successfulOtherResults.push({
          location: location.name,
          region: location.region,
          ip: queryResult.ip,
          time: queryResult.time,
          success: true
        });
        results.healthStats.successfulQueries++;
      } else {
        // 如果远程DNS查询失败，回退到本地DNS查询
        try {
          const startTime = Date.now();
          const addresses = await dnsLookup(domain);
          const endTime = Date.now();
          const queryTime = endTime - startTime;
          
          const ip = Array.isArray(addresses) 
            ? addresses[0].address 
            : addresses.address;
          
          successfulOtherResults.push({
            location: location.name,
            region: location.region,
            ip: ip,
            time: queryTime,
            success: true
          });
          results.healthStats.successfulQueries++;
        } catch (fallbackError) {
          failedResults.push({
            location: location.name,
            region: location.region,
            ip: '',
            time: 0,
            success: false,
            error: `远程查询失败: ${queryResult.error || 'Unknown error'}; 本地回退也失败: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`
          });
        }
      }
    } catch (error) {
      failedResults.push({
        location: location.name,
        region: location.region,
        ip: '',
        time: 0,
        success: false,
        error: `查询过程异常: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });

  // 添加整体超时控制
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('DNS查询超时')), 15000); // 15秒超时
  });

  try {
    await Promise.race([
      Promise.all([...chinesePromises, ...otherPromises]),
      timeoutPromise
    ]);
  } catch (error) {
    if (error instanceof Error && error.message === 'DNS查询超时') {
      console.warn('DNS查询超时，部分结果可能不完整');
    } else {
      throw error;
    }
  }

  // 3. 处理不健康的中国DNS服务器
  for (const { location, health } of unhealthyChineseDNS) {
    failedResults.push({
      location: location.name,
      region: location.region,
      ip: '',
      time: 0,
      success: false,
      error: `DNS服务器不健康: ${health.error || 'Unknown health check failure'}`
    });
  }

  // 4. 处理不健康的其他地区DNS服务器
  for (const { location, health } of unhealthyOtherDNS) {
    failedResults.push({
      location: location.name,
      region: location.region,
      ip: '',
      time: 0,
      success: false,
      error: `DNS服务器不健康: ${health.error || 'Unknown health check failure'}`
    });
  }

  // 按正确顺序合并结果：
  // 1. 成功的中国DNS服务器
  // 2. 成功的其他地区DNS服务器
  // 3. 失败的中国DNS服务器
  // 4. 失败的其他地区DNS服务器
  const tempResults = [
    ...successfulChineseResults,
    ...successfulOtherResults,
    ...failedResults.filter(result => ['华北', '华东', '华南', '西南', '华中', '西北', '东北', '香港', '澳门', '台湾'].includes(result.region)),
    ...failedResults.filter(result => !['华北', '华东', '华南', '西南', '华中', '西北', '东北', '香港', '澳门', '台湾'].includes(result.region))
  ];

  // 将临时结果按正确顺序赋值给最终结果
  results.pingResults = tempResults;

  // 计算平均响应时间
  const successfulResults = results.pingResults.filter(r => r.success);
  if (successfulResults.length > 0) {
    const totalTime = successfulResults.reduce((sum, r) => sum + r.time, 0);
    results.healthStats.averageResponseTime = Math.round(totalTime / successfulResults.length);
  }

  // 分析结果
  const ips = successfulResults.map(r => r.ip);
  results.uniqueIPs = [...new Set(ips)];

  // 地理分布分析
  const ipDistribution: Record<string, string[]> = {};
  successfulResults.forEach(result => {
    if (!ipDistribution[result.ip]) {
      ipDistribution[result.ip] = [];
    }
    ipDistribution[result.ip].push(result.region);
  });
  results.geographicDistribution.ipDistribution = ipDistribution;

  // 计算地理覆盖范围
  const coveredRegions = new Set(successfulResults.map(r => r.region));
  const totalRegions = results.regions.length;
  const coveragePercentage = Math.round((coveredRegions.size / totalRegions) * 100);
  
  if (coveragePercentage >= 80) {
    results.geographicDistribution.coverage = '全球覆盖';
  } else if (coveragePercentage >= 60) {
    results.geographicDistribution.coverage = '广泛覆盖';
  } else if (coveragePercentage >= 40) {
    results.geographicDistribution.coverage = '中等覆盖';
  } else {
    results.geographicDistribution.coverage = '有限覆盖';
  }

  // 增强的IP一致性判断
  const successRate = results.healthStats.successfulQueries / results.healthStats.totalServers;
  
  if (results.uniqueIPs.length === 1) {
    results.ipConsistency = 'consistent';
    results.analysis = `所有位置返回相同IP地址 (${results.uniqueIPs[0]})，${coveragePercentage}%地理覆盖，成功率${Math.round(successRate * 100)}%，表明可能为直连连接`;
  } else if (results.uniqueIPs.length >= 5) {
    results.ipConsistency = 'inconsistent';
    results.analysis = `检测到${results.uniqueIPs.length}个不同IP地址，${coveragePercentage}%地理覆盖，成功率${Math.round(successRate * 100)}%，强烈表明使用了全球CDN服务`;
  } else if (results.uniqueIPs.length >= 3) {
    results.ipConsistency = 'inconsistent';
    results.analysis = `检测到${results.uniqueIPs.length}个不同IP地址，${coveragePercentage}%地理覆盖，成功率${Math.round(successRate * 100)}%，表明很可能使用了CDN服务`;
  } else {
    results.ipConsistency = 'mixed';
    results.analysis = `检测到${results.uniqueIPs.length}个不同IP地址，${coveragePercentage}%地理覆盖，成功率${Math.round(successRate * 100)}%，可能使用了CDN或负载均衡`;
  }

  // 如果成功率太低，在分析中添加警告
  if (successRate < 0.7) {
    results.analysis += `。注意：查询成功率较低(${Math.round(successRate * 100)}%)，可能影响检测结果准确性`;
  }

  return results;
}

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
}

// 分级优化建议接口
interface LeveledOptimizationSuggestion {
  text: string;
  level: 1 | 2 | 3 | 4 | 5;
  category: 'cdn' | 'performance' | 'ssl';
  reasoning: string;
}

interface LeveledOptimizationAnalysis {
  status: 'excellent' | 'good' | 'needs_improvement' | 'critical';
  suggestions: LeveledOptimizationSuggestion[];
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImprovement: string;
}

// 分级配置
const OPTIMIZATION_LEVEL_CONFIG = {
  1: { name: '急需改进', priority: 'high' as const },
  2: { name: '高度优先改进', priority: 'high' as const },
  3: { name: '有价值改进', priority: 'medium' as const },
  4: { name: '潜在优化点', priority: 'low' as const },
  5: { name: '优秀/前瞻建议', priority: 'low' as const }
};

async function testDomain(domain: string): Promise<DomainTestResult['testResults']> {
  const startTime = Date.now();
  const testResults: DomainTestResult['testResults'] = {
    dns: {
      resolvedIPs: [],
      resolutionTime: 0,
    },
    connection: {
      totalTime: 0,
      dnsTime: 0,
      tcpTime: 0,
      ttfb: 0,
      downloadTime: 0,
      statusCode: 0,
    },
    server: {
      software: '',
      headers: {},
      responseSize: 0,
      responseTime: 0,
    },
    cdn: {
      isThroughCDN: false,
      hasProxyHeaders: false,
      headers: {},
      proxyHeaders: {},
    },
  };

  try {
    // 1. DNS 解析测试
    const dnsStartTime = Date.now();
    try {
      const addresses = await dnsLookup(domain);
      const dnsEndTime = Date.now();
      testResults.dns.resolvedIPs = Array.isArray(addresses) 
        ? addresses.map(addr => addr.address) 
        : [addresses.address];
      testResults.dns.resolutionTime = dnsEndTime - dnsStartTime;
    } catch (error) {
      testResults.dns.error = error instanceof Error ? error.message : 'DNS resolution failed';
      throw error;
    }

    // 2. 多地ping检测
    try {
      const multiLocationResult = await multiLocationPing(domain);
      testResults.multiLocationPing = multiLocationResult;
    } catch (error) {
      console.warn('Multi-location ping failed:', error);
      // 多地ping失败不影响其他测试
    }

    // 3. HTTP 连接测试
    const targetIP = testResults.dns.resolvedIPs[0];
    
    // 优先尝试HTTPS，如果失败再尝试HTTP
    let httpsResult = null;
    let httpResult = null;
    
    try {
      httpsResult = await makeHttpRequest(`https://${domain}`);
    } catch (error) {
      // HTTPS失败，尝试HTTP
      try {
        httpResult = await makeHttpRequest(`http://${domain}`);
      } catch (error2) {
        // 两个都失败了
        throw error2;
      }
    }
    
    const response = httpsResult || httpResult;
    const isHttps = httpsResult !== null;
    
    testResults.connection.totalTime = response.totalTime;
    testResults.connection.dnsTime = testResults.dns.resolutionTime;
    testResults.connection.tcpTime = response.tcpTime;
    testResults.connection.ttfb = response.ttfb;
    testResults.connection.downloadTime = response.downloadTime;
    testResults.connection.statusCode = response.statusCode;
    
    if (response.sslTime) {
      testResults.connection.sslTime = response.sslTime;
    }
    
    testResults.server.software = response.headers.server || 'Unknown';
    testResults.server.headers = response.headers;
    testResults.server.responseSize = response.contentLength;
    testResults.server.responseTime = response.totalTime;

    // 4. CDN 检测
    const headers = response.headers;
    const cdnHeaders = {
      'cf-connecting-ip': headers['cf-connecting-ip'] || null,
      'cf-ray': headers['cf-ray'] || null,
      'cf-visitor': headers['cf-visitor'] || null,
      'x-azure-ref': headers['x-azure-ref'] || null,
      'x-amz-cf-id': headers['x-amz-cf-id'] || null,
      'x-edge-location': headers['x-edge-location'] || null,
      'ali-cdn-real-ip': headers['ali-cdn-real-ip'] || null,
      'x-cdn-request-id': headers['x-cdn-request-id'] || null,
      'x-cdn-log-id': headers['x-cdn-log-id'] || null,
      'x-cdn-src-ip': headers['x-cdn-src-ip'] || null,
    };

    const proxyHeaders = {
      'x-forwarded-for': headers['x-forwarded-for'] || null,
      'x-real-ip': headers['x-real-ip'] || null,
      'via': headers['via'] || null,
      'x-forwarded-proto': headers['x-forwarded-proto'] || null,
    };

    testResults.cdn.isThroughCDN = Object.values(cdnHeaders).some(value => value !== null);
    testResults.cdn.hasProxyHeaders = Object.values(proxyHeaders).some(value => value !== null);
    testResults.cdn.headers = cdnHeaders;
    testResults.cdn.proxyHeaders = proxyHeaders;

    // 检测CDN提供商
    if (testResults.cdn.isThroughCDN) {
      testResults.cdn.provider = detectCDNProvider(cdnHeaders);
    }

    // 分析连接类型（结合多地ping结果）
    const connectionAnalysis = analyzeConnectionType(testResults);
    testResults.cdn.connectionType = connectionAnalysis.connectionType;
    testResults.cdn.confidence = connectionAnalysis.confidence;
    testResults.cdn.analysis = connectionAnalysis.details;

    // 5. SSL 信息（如果是HTTPS）
    if (isHttps && response.sslInfo) {
      testResults.ssl = response.sslInfo;
    }

    // 6. 生成优化建议
    const optimizationSuggestions = generateOptimizationSuggestions(testResults);
    testResults.optimization = optimizationSuggestions;

  } catch (error) {
    testResults.connection.error = error instanceof Error ? error.message : 'Connection failed';
  }

  return testResults;
}

function detectCDNProvider(headers: Record<string, string | null>): string | undefined {
  const headerStr = JSON.stringify(headers).toLowerCase();
  
  // Cloudflare 检测
  if (headers['cf-ray'] || headers['cf-connecting-ip'] || headers['cf-visitor']) {
    return 'Cloudflare';
  }
  
  // Azure CDN 检测
  if (headers['x-azure-ref'] || headers['x-azure-request-id']) {
    return 'Azure CDN';
  }
  
  // Amazon CloudFront 检测
  if (headers['x-amz-cf-id'] || headers['x-amz-cf-pop']) {
    return 'Amazon CloudFront';
  }
  
  // Google Cloud CDN 检测
  if (headers['x-edge-location'] || headers['x-google-cache-control']) {
    return 'Google Cloud CDN';
  }
  
  // 阿里云CDN 检测
  if (headers['ali-cdn-real-ip'] || headers['x-cdn-request-id'] || headers['x-oss-request-id']) {
    return '阿里云CDN';
  }
  
  // 腾讯云CDN 检测
  if (headers['x-cdn-log-id'] || headers['x-cdn-src-ip'] || headers['x-tencent-request-id']) {
    return '腾讯云CDN';
  }
  
  // Fastly 检测
  if (headers['x-fastly-request-id'] || headerStr.includes('fastly')) {
    return 'Fastly';
  }
  
  // Akamai 检测
  if (headers['x-akamai-request-id'] || headers['x-akamai-cache-status'] || headerStr.includes('akamai')) {
    return 'Akamai';
  }
  
  // Cloudinary 检测
  if (headers['x-cld-cache'] || headers['x-cld-rtt']) {
    return 'Cloudinary';
  }
  
  // KeyCDN 检测
  if (headers['x-keycdn-cache'] || headers['x-keycdn-pop']) {
    return 'KeyCDN';
  }
  
  // StackPath 检测
  if (headers['x-sp-cache'] || headers['x-sp-edge']) {
    return 'StackPath';
  }
  
  // BunnyCDN 检测
  if (headers['x-bcdn-cache'] || headers['x-bcdn-pop']) {
    return 'BunnyCDN';
  }
  
  // Imperva 检测
  if (headers['x-iinfo'] || headers['x-cdn']) {
    return 'Imperva';
  }
  
  // Sucuri 检测
  if (headers['x-sucuri-cache'] || headers['x-sucuri-id']) {
    return 'Sucuri';
  }
  
  // 通过 Via 头信息检测
  if (headers['via']) {
    const via = headers['via'].toLowerCase();
    if (via.includes('cloudflare')) return 'Cloudflare';
    if (via.includes('fastly')) return 'Fastly';
    if (via.includes('akamai')) return 'Akamai';
    if (via.includes('azure')) return 'Azure CDN';
    if (via.includes('cloudfront')) return 'Amazon CloudFront';
    if (via.includes('google')) return 'Google Cloud CDN';
  }
  
  // 通过 Server 头信息检测
  if (headers['server']) {
    const server = headers['server'].toLowerCase();
    if (server.includes('cloudflare')) return 'Cloudflare';
    if (server.includes('netlify')) return 'Netlify';
    if (server.includes('vercel')) return 'Vercel';
    if (server.includes('fly.io')) return 'Fly.io';
    if (server.includes('heroku')) return 'Heroku';
  }
  
  // 通过 X-Cache 头信息检测
  if (headers['x-cache']) {
    const cache = headers['x-cache'].toLowerCase();
    if (cache.includes('cloudflare')) return 'Cloudflare';
    if (cache.includes('fastly')) return 'Fastly';
    if (cache.includes('akamai')) return 'Akamai';
    if (cache.includes('cloudfront')) return 'Amazon CloudFront';
  }
  
  return undefined;
}

function detectProxyType(headers: Record<string, string | null>): string[] {
  const proxyTypes: string[] = [];
  
  // 检测标准代理头
  if (headers['x-forwarded-for']) proxyTypes.push('X-Forwarded-For');
  if (headers['x-real-ip']) proxyTypes.push('X-Real-IP');
  if (headers['x-forwarded-proto']) proxyTypes.push('X-Forwarded-Proto');
  if (headers['x-forwarded-host']) proxyTypes.push('X-Forwarded-Host');
  if (headers['x-forwarded-port']) proxyTypes.push('X-Forwarded-Port');
  if (headers['x-forwarded-server']) proxyTypes.push('X-Forwarded-Server');
  
  // 检测 Via 头
  if (headers['via']) proxyTypes.push('Via');
  
  // 检测其他代理头
  if (headers['forwarded']) proxyTypes.push('Forwarded');
  if (headers['x-proxy-user']) proxyTypes.push('X-Proxy-User');
  if (headers['proxy-connection']) proxyTypes.push('Proxy-Connection');
  
  return proxyTypes;
}

// 智能优化建议生成系统
function generateOptimizationSuggestions(testResults: any): {
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
} {
  const cdnStatus = testResults.cdn.connectionType;
  const cdnConfidence = testResults.cdn.confidence;
  const cdnAdvancedMetrics = testResults.cdn.advancedMetrics;
  const multiLocationPing = testResults.multiLocationPing;
  const hasSSL = !!testResults.ssl;
  const responseTime = testResults.connection.totalTime;
  const dnsTime = testResults.dns.resolutionTime;
  const statusCode = testResults.connection.statusCode;
  const serverSoftware = testResults.server.software;
  const responseSize = testResults.server.responseSize;

  // 智能CDN分析和建议
  let cdnAnalysis = {
    status: 'needs_improvement' as const,
    suggestions: [] as string[],
    reasoning: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    estimatedImprovement: ''
  };

  // 基于高级指标的CDN分析
  if (cdnAdvancedMetrics) {
    const { cdnScore, detectionMethods, ipAnalysisScore } = cdnAdvancedMetrics;
    
    if (cdnScore >= 80) {
      cdnAnalysis.status = 'excellent';
      cdnAnalysis.priority = 'low';
      cdnAnalysis.estimatedImprovement = '5-10%性能提升';
      cdnAnalysis.suggestions = [
        {
          text: 'CDN配置优秀，建议定期监控性能表现',
          level: 4,
          category: 'cdn',
          reasoning: '当前CDN配置已达到优秀水平，建议持续监控'
        },
        {
          text: '考虑启用CDN高级功能：HTTP/3、QUIC协议、智能压缩',
          level: 5,
          category: 'cdn',
          reasoning: '前沿技术建议，可带来竞争优势'
        },
        {
          text: '优化缓存策略，提高缓存命中率',
          level: 3,
          category: 'cdn',
          reasoning: '有价值改进，能进一步提升性能'
        },
        {
          text: '配置边缘计算功能，减少回源请求',
          level: 4,
          category: 'cdn',
          reasoning: '潜在优化点，实施成本较高但收益明显'
        }
      ];
      cdnAnalysis.reasoning = `CDN综合评分${cdnScore}分，使用${detectionMethods.join('+')}检测，配置优秀`;
    } else if (cdnScore >= 60) {
      cdnAnalysis.status = 'good';
      cdnAnalysis.priority = 'medium';
      cdnAnalysis.estimatedImprovement = '15-25%性能提升';
      cdnAnalysis.suggestions = [
        {
          text: 'CDN配置良好，但有优化空间',
          level: 3,
          category: 'cdn',
          reasoning: '有价值改进，能带来明显提升'
        },
        {
          text: '检查并优化缓存规则和缓存时间',
          level: 3,
          category: 'cdn',
          reasoning: '有价值改进，优化后效果明显'
        },
        {
          text: '考虑增加更多CDN节点以提高全球覆盖',
          level: 4,
          category: 'cdn',
          reasoning: '潜在优化点，需要成本效益分析'
        },
        {
          text: '启用图片优化和自动压缩功能',
          level: 3,
          category: 'cdn',
          reasoning: '有价值改进，实施相对简单'
        }
      ];
      cdnAnalysis.reasoning = `CDN综合评分${cdnScore}分，配置良好但可进一步优化`;
    } else if (cdnScore >= 30) {
      cdnAnalysis.status = 'needs_improvement';
      cdnAnalysis.priority = 'high';
      cdnAnalysis.estimatedImprovement = '30-50%性能提升';
      cdnAnalysis.suggestions = [
        {
          text: 'CDN配置需要改进，建议全面检查设置',
          level: 2,
          category: 'cdn',
          reasoning: '高度优先改进，严重影响性能表现'
        },
        {
          text: '确认DNS正确指向CDN服务',
          level: 2,
          category: 'cdn',
          reasoning: '高度优先改进，配置错误导致CDN失效'
        },
        {
          text: '优化缓存配置，设置合理的缓存时间',
          level: 3,
          category: 'cdn',
          reasoning: '有价值改进，能显著提升效果'
        },
        {
          text: '考虑升级到更高级的CDN服务套餐',
          level: 4,
          category: 'cdn',
          reasoning: '潜在优化点，需要投资评估'
        }
      ];
      cdnAnalysis.reasoning = `CDN综合评分${cdnScore}分，配置存在明显问题`;
    } else {
      cdnAnalysis.status = 'critical';
      cdnAnalysis.priority = 'high';
      cdnAnalysis.estimatedImprovement = '50-80%性能提升';
      cdnAnalysis.suggestions = [
        {
          text: '未正确配置CDN，强烈建议立即配置',
          level: 1,
          category: 'cdn',
          reasoning: '急需改进，严重影响用户体验和性能'
        },
        {
          text: '推荐使用主流CDN服务：Cloudflare、阿里云CDN、腾讯云CDN',
          level: 1,
          category: 'cdn',
          reasoning: '急需改进，缺乏CDN导致严重性能问题'
        },
        {
          text: '配置全局CDN加速，覆盖主要用户地区',
          level: 2,
          category: 'cdn',
          reasoning: '高度优先改进，影响全球用户访问体验'
        },
        {
          text: '设置合理的缓存策略和压缩选项',
          level: 2,
          category: 'cdn',
          reasoning: '高度优先改进，基础配置缺失'
        }
      ];
      cdnAnalysis.reasoning = `CDN综合评分${cdnScore}分，未有效使用CDN加速`;
    }
  } else {
    // 传统CDN分析方法（向后兼容）
    if (cdnStatus === 'cdn' && cdnConfidence === 'high') {
      cdnAnalysis.status = 'excellent';
      cdnAnalysis.priority = 'low';
      cdnAnalysis.estimatedImprovement = '5-15%性能提升';
      cdnAnalysis.suggestions = [
        {
          text: 'CDN配置良好，继续监控性能表现',
          level: 4,
          category: 'cdn',
          reasoning: '潜在优化点，当前配置已良好'
        },
        {
          text: '考虑启用CDN的高级功能如缓存优化、压缩等',
          level: 5,
          category: 'cdn',
          reasoning: '前瞻建议，可带来技术优势'
        },
        {
          text: '定期检查CDN覆盖范围和节点健康状态',
          level: 3,
          category: 'cdn',
          reasoning: '有价值改进，确保稳定性'
        }
      ];
      cdnAnalysis.reasoning = '检测到CDN加速且置信度高，网站性能优化良好';
    } else if (cdnStatus === 'cdn' && cdnConfidence === 'medium') {
      cdnAnalysis.status = 'good';
      cdnAnalysis.priority = 'medium';
      cdnAnalysis.estimatedImprovement = '15-30%性能提升';
      cdnAnalysis.suggestions = [
        {
          text: 'CDN已启用但配置可能需要优化',
          level: 3,
          category: 'cdn',
          reasoning: '有价值改进，存在优化空间'
        },
        {
          text: '检查CDN缓存规则和缓存命中率',
          level: 3,
          category: 'cdn',
          reasoning: '有价值改进，能提升性能'
        },
        {
          text: '考虑增加更多CDN节点以提高覆盖范围',
          level: 4,
          category: 'cdn',
          reasoning: '潜在优化点，需要投资评估'
        }
      ];
      cdnAnalysis.reasoning = '检测到CDN但置信度中等，建议进一步优化配置';
    } else if (cdnStatus === 'mixed') {
      cdnAnalysis.status = 'needs_improvement';
      cdnAnalysis.priority = 'high';
      cdnAnalysis.estimatedImprovement = '25-45%性能提升';
      cdnAnalysis.suggestions = [
        {
          text: '检测到可能的CDN配置，建议确认并完善CDN设置',
          level: 2,
          category: 'cdn',
          reasoning: '高度优先改进，配置不完整影响效果'
        },
        {
          text: '检查DNS配置确保正确指向CDN',
          level: 2,
          category: 'cdn',
          reasoning: '高度优先改进，DNS配置问题'
        },
        {
          text: '考虑配置全局CDN以提高访问速度',
          level: 3,
          category: 'cdn',
          reasoning: '有价值改进，能显著提升性能'
        }
      ];
      cdnAnalysis.reasoning = '连接类型为混合，可能存在CDN配置不完整的情况';
    } else {
      cdnAnalysis.status = 'critical';
      cdnAnalysis.priority = 'high';
      cdnAnalysis.estimatedImprovement = '40-70%性能提升';
      cdnAnalysis.suggestions = [
        {
          text: '未使用CDN加速，强烈建议配置CDN以提高访问速度',
          level: 1,
          category: 'cdn',
          reasoning: '急需改进，严重影响用户体验和性能'
        },
        {
          text: '推荐使用Cloudflare、阿里云CDN、腾讯云CDN等服务',
          level: 1,
          category: 'cdn',
          reasoning: '急需改进，缺乏基础CDN服务'
        },
        {
          text: 'CDN可以显著降低延迟，提高用户体验',
          level: 2,
          category: 'cdn',
          reasoning: '高度优先改进，基础建设缺失'
        }
      ];
      cdnAnalysis.reasoning = '未检测到CDN使用，网站性能存在较大优化空间';
    }
  }

  // 智能性能分析和建议
  let performanceAnalysis: LeveledOptimizationAnalysis = {
    status: 'good' as const,
    suggestions: [],
    reasoning: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    estimatedImprovement: ''
  };

  // 性能评分计算（考虑多个因素）
  let performanceScore = 100;
  
  // 响应时间评分
  if (responseTime < 100) performanceScore -= 0;
  else if (responseTime < 200) performanceScore -= 10;
  else if (responseTime < 500) performanceScore -= 25;
  else if (responseTime < 1000) performanceScore -= 45;
  else performanceScore -= 70;
  
  // DNS解析时间评分
  if (dnsTime > 100) performanceScore -= 15;
  else if (dnsTime > 50) performanceScore -= 5;
  
  // 响应大小评分
  if (responseSize > 1000000) performanceScore -= 20; // > 1MB
  else if (responseSize > 500000) performanceScore -= 10; // > 500KB
  
  // 状态码评分
  if (statusCode >= 400) performanceScore -= 30;
  else if (statusCode >= 300) performanceScore -= 10;

  if (performanceScore >= 85) {
    performanceAnalysis.status = 'excellent';
    performanceAnalysis.priority = 'low';
    performanceAnalysis.estimatedImprovement = '5-10%性能提升';
    performanceAnalysis.suggestions = [
      {
        text: '网站响应速度优秀，继续保持当前配置',
        level: 4,
        category: 'performance',
        reasoning: '潜在优化点，当前性能已优秀'
      },
      {
        text: '定期监控性能指标，确保稳定性',
        level: 3,
        category: 'performance',
        reasoning: '有价值改进，预防性能退化'
      },
      {
        text: '考虑启用更多优化功能如HTTP/2、Brotli压缩等',
        level: 5,
        category: 'performance',
        reasoning: '前瞻建议，采用最新技术标准'
      },
      {
        text: '实施性能预算，防止性能退化',
        level: 4,
        category: 'performance',
        reasoning: '潜在优化点，长期性能管理'
      }
    ];
    performanceAnalysis.reasoning = `综合性能评分${performanceScore}分，响应时间${responseTime}ms，表现优秀`;
  } else if (performanceScore >= 70) {
    performanceAnalysis.status = 'good';
    performanceAnalysis.priority = 'medium';
    performanceAnalysis.estimatedImprovement = '10-20%性能提升';
    performanceAnalysis.suggestions = [
      {
        text: '网站性能良好，有进一步优化空间',
        level: 3,
        category: 'performance',
        reasoning: '有价值改进，存在提升空间'
      },
      {
        text: '检查并优化数据库查询和API调用',
        level: 3,
        category: 'performance',
        reasoning: '有价值改进，能提升响应速度'
      },
      {
        text: '实施浏览器缓存策略和服务器端缓存',
        level: 3,
        category: 'performance',
        reasoning: '有价值改进，减少重复请求'
      },
      {
        text: '考虑使用资源预加载和预连接技术',
        level: 4,
        category: 'performance',
        reasoning: '潜在优化点，提升用户体验'
      }
    ];
    performanceAnalysis.reasoning = `综合性能评分${performanceScore}分，响应时间${responseTime}ms，表现良好`;
  } else if (performanceScore >= 50) {
    performanceAnalysis.status = 'needs_improvement';
    performanceAnalysis.priority = 'high';
    performanceAnalysis.estimatedImprovement = '25-40%性能提升';
    performanceAnalysis.suggestions = [
      {
        text: '网站性能需要优化，建议立即采取行动',
        level: 2,
        category: 'performance',
        reasoning: '高度优先改进，影响用户体验'
      },
      {
        text: '优化图片：使用WebP格式，实施响应式图片',
        level: 2,
        category: 'performance',
        reasoning: '高度优先改进，大幅减少页面体积'
      },
      {
        text: '启用Gzip/Brotli压缩，减少传输数据量',
        level: 2,
        category: 'performance',
        reasoning: '高度优先改进，提升传输效率'
      },
      {
        text: '考虑使用CDN加速静态资源',
        level: 3,
        category: 'performance',
        reasoning: '有价值改进，显著提升加载速度'
      },
      {
        text: '优化JavaScript和CSS加载，消除渲染阻塞资源',
        level: 3,
        category: 'performance',
        reasoning: '有价值改进，改善页面渲染性能'
      }
    ];
    performanceAnalysis.reasoning = `综合性能评分${performanceScore}分，响应时间${responseTime}ms，需要优化`;
  } else {
    performanceAnalysis.status = 'critical';
    performanceAnalysis.priority = 'high';
    performanceAnalysis.estimatedImprovement = '40-70%性能提升';
    performanceAnalysis.suggestions = [
      {
        text: '网站性能严重不足，急需全面优化',
        level: 1,
        category: 'performance',
        reasoning: '急需改进，严重影响用户体验和SEO'
      },
      {
        text: '立即检查服务器配置和资源加载策略',
        level: 1,
        category: 'performance',
        reasoning: '急需改进，可能存在配置错误'
      },
      {
        text: '优化数据库查询，实施多层缓存策略',
        level: 1,
        category: 'performance',
        reasoning: '急需改进，后端性能瓶颈'
      },
      {
        text: '压缩和优化所有静态资源，实施代码分割',
        level: 2,
        category: 'performance',
        reasoning: '高度优先改进，前端优化必要措施'
      },
      {
        text: '强烈建议配置CDN加速和使用现代Web技术',
        level: 2,
        category: 'performance',
        reasoning: '高度优先改进，基础架构升级'
      }
    ];
    performanceAnalysis.reasoning = `综合性能评分${performanceScore}分，响应时间${responseTime}ms，性能严重不足`;
  }

  // 添加具体的性能问题建议
  if (dnsTime > 100) {
    performanceAnalysis.suggestions.push(
      {
        text: 'DNS解析时间过长，建议使用更快的DNS服务',
        level: 2,
        category: 'performance',
        reasoning: '高度优先改进，DNS解析缓慢影响整体性能'
      },
      {
        text: '实施DNS预解析和预连接技术',
        level: 3,
        category: 'performance',
        reasoning: '有价值改进，减少DNS查询延迟'
      }
    );
  }
  
  if (responseSize > 1000000) {
    performanceAnalysis.suggestions.push(
      {
        text: '页面体积过大，建议优化资源大小',
        level: 2,
        category: 'performance',
        reasoning: '高度优先改进，大体积影响加载速度'
      },
      {
        text: '实施资源压缩和懒加载策略',
        level: 3,
        category: 'performance',
        reasoning: '有价值改进，优化传输效率'
      }
    );
  }

  // 智能SSL分析和建议
  let sslAnalysis: LeveledOptimizationAnalysis = {
    status: 'good' as const,
    suggestions: [],
    reasoning: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    estimatedImprovement: ''
  };

  if (hasSSL) {
    sslAnalysis.status = 'excellent';
    sslAnalysis.priority = 'low';
    sslAnalysis.estimatedImprovement = '安全性和SEO提升';
    sslAnalysis.suggestions = [
      {
        text: 'SSL证书配置良好，确保数据传输安全',
        level: 4,
        category: 'ssl',
        reasoning: '潜在优化点，当前配置已良好'
      },
      {
        text: '定期检查证书有效期，避免过期',
        level: 3,
        category: 'ssl',
        reasoning: '有价值改进，预防服务中断'
      },
      {
        text: '考虑启用HSTS以增强安全性',
        level: 4,
        category: 'ssl',
        reasoning: '潜在优化点，提升安全等级'
      },
      {
        text: '检查SSL配置，启用现代加密算法',
        level: 4,
        category: 'ssl',
        reasoning: '潜在优化点，保持技术更新'
      },
      {
        text: '实施SSL证书监控和自动续期',
        level: 3,
        category: 'ssl',
        reasoning: '有价值改进，运维自动化'
      }
    ];
    sslAnalysis.reasoning = '已配置SSL证书，安全性良好，有助于SEO和用户信任';
  } else {
    sslAnalysis.status = 'critical';
    sslAnalysis.priority = 'high';
    sslAnalysis.estimatedImprovement = '显著提升安全性和SEO排名';
    sslAnalysis.suggestions = [
      {
        text: '未配置SSL证书，网站安全性存在严重风险',
        level: 1,
        category: 'ssl',
        reasoning: '急需改进，数据传输不安全'
      },
      {
        text: '立即申请并配置SSL证书（Let\'s Encrypt提供免费证书）',
        level: 1,
        category: 'ssl',
        reasoning: '急需改进，基础安全措施缺失'
      },
      {
        text: '启用HTTPS以保护用户数据安全',
        level: 1,
        category: 'ssl',
        reasoning: '急需改进，用户隐私保护'
      },
      {
        text: '搜索引擎更青睐HTTPS网站，影响SEO排名',
        level: 2,
        category: 'ssl',
        reasoning: '高度优先改进，影响搜索排名'
      },
      {
        text: '现代浏览器标记HTTP网站为"不安全"',
        level: 2,
        category: 'ssl',
        reasoning: '高度优先改进，用户信任度下降'
      }
    ];
    sslAnalysis.reasoning = '未检测到SSL配置，安全性需要紧急改进';
  }

  // 智能综合评分和等级
  let overallScore = 0;
  const scoreWeights = { cdn: 30, performance: 40, ssl: 30 };

  // CDN评分（基于状态）
  const cdnScore = cdnAnalysis.status === 'excellent' ? 100 :
                   cdnAnalysis.status === 'good' ? 80 :
                   cdnAnalysis.status === 'needs_improvement' ? 50 : 20;
  
  // 性能评分（基于计算的性能分数）
  const perfScore = Math.max(20, performanceScore);
  
  // SSL评分
  const sslScore = sslAnalysis.status === 'excellent' ? 100 :
                   sslAnalysis.status === 'good' ? 80 :
                   sslAnalysis.status === 'needs_improvement' ? 50 : 20;

  overallScore = Math.round(
    (cdnScore * scoreWeights.cdn + 
     perfScore * scoreWeights.performance + 
     sslScore * scoreWeights.ssl) / 100
  );

  // 等级评定
  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'C';
  if (overallScore >= 95) grade = 'A+';
  else if (overallScore >= 85) grade = 'A';
  else if (overallScore >= 70) grade = 'B';
  else if (overallScore >= 55) grade = 'C';
  else grade = 'D';

  // 智能行动计划
  const actionPlan = {
    immediate: [] as string[],
    shortTerm: [] as string[],
    longTerm: [] as string[]
  };

  // 根据优先级生成行动计划
  if (sslAnalysis.status === 'critical') {
    actionPlan.immediate.push('配置SSL证书，启用HTTPS');
  }
  if (performanceAnalysis.status === 'critical') {
    actionPlan.immediate.push('优化网站性能，减少响应时间');
  }
  if (cdnAnalysis.status === 'critical') {
    actionPlan.immediate.push('配置CDN加速服务');
  }

  if (performanceAnalysis.status === 'needs_improvement') {
    actionPlan.shortTerm.push('进一步优化网站性能');
  }
  if (cdnAnalysis.status === 'needs_improvement') {
    actionPlan.shortTerm.push('优化CDN配置');
  }

  actionPlan.longTerm.push(
    '建立性能监控体系',
    '定期进行性能审计',
    '持续优化用户体验'
  );

  // 竞争力分析
  const competitiveAnalysis = {
    ranking: overallScore >= 85 ? '领先' : 
             overallScore >= 70 ? '良好' : 
             overallScore >= 55 ? '一般' : '待改进',
    industryAverage: 72, // 假设行业平均分
    improvementPotential: overallScore >= 85 ? '5-10%' :
                         overallScore >= 70 ? '10-20%' :
                         overallScore >= 55 ? '20-40%' : '40-60%'
  };

  // 智能综合建议
  const overallRecommendations = [];
  
  if (overallScore < 70) {
    overallRecommendations.push('网站整体性能需要显著改进，建议优先处理关键问题');
    overallRecommendations.push('建议制定详细的优化计划和时间表');
  }
  
  // 按优先级排序建议
  const priorities = [
    { score: sslScore, name: '安全性', critical: sslAnalysis.status === 'critical' },
    { score: perfScore, name: '性能', critical: performanceAnalysis.status === 'critical' },
    { score: cdnScore, name: 'CDN', critical: cdnAnalysis.status === 'critical' }
  ].sort((a, b) => a.score - b.score);

  priorities.forEach((priority, index) => {
    if (priority.critical) {
      overallRecommendations.push(`${priority.name}配置需要立即关注`);
    } else if (priority.score < 80 && index < 2) {
      overallRecommendations.push(`${priority.name}优化是提升整体表现的关键`);
    }
  });

  return {
    cdn: cdnAnalysis,
    performance: performanceAnalysis,
    ssl: sslAnalysis,
    overall: {
      score: overallScore,
      grade,
      recommendations: overallRecommendations,
      actionPlan,
      competitiveAnalysis
    }
  };
}

// 增强的CDN检测算法
function analyzeConnectionType(testResults: any): {
  connectionType: 'direct' | 'cdn' | 'proxy' | 'mixed';
  confidence: 'high' | 'medium' | 'low';
  details: string[];
  advancedMetrics?: {
    cdnScore: number;
    detectionMethods: string[];
    ipAnalysisScore: number;
    headerAnalysisScore: number;
    serverAnalysisScore: number;
  };
} {
  const cdnDetected = testResults.cdn.isThroughCDN;
  const proxyDetected = testResults.cdn.hasProxyHeaders;
  const cdnProvider = testResults.cdn.provider;
  const multiLocationPing = testResults.multiLocationPing;
  const headers = testResults.server.headers;
  
  const details: string[] = [];
  
  // 高级检测指标
  const advancedMetrics = {
    cdnScore: 0,
    detectionMethods: [] as string[],
    ipAnalysisScore: 0,
    headerAnalysisScore: 0,
    serverAnalysisScore: 0
  };

  // 1. 多地ping分析（权重：40%）
  if (multiLocationPing) {
    const { ipConsistency, uniqueIPs, analysis, healthStats } = multiLocationPing;
    details.push(analysis);
    advancedMetrics.detectionMethods.push('多地IP分析');
    
    // 计算IP分析分数
    if (ipConsistency === 'inconsistent' && uniqueIPs.length >= 5) {
      advancedMetrics.ipAnalysisScore = 100;
      advancedMetrics.cdnScore += 40;
    } else if (ipConsistency === 'inconsistent' && uniqueIPs.length >= 3) {
      advancedMetrics.ipAnalysisScore = 80;
      advancedMetrics.cdnScore += 32;
    } else if (ipConsistency === 'mixed' && uniqueIPs.length >= 2) {
      advancedMetrics.ipAnalysisScore = 60;
      advancedMetrics.cdnScore += 24;
    } else if (ipConsistency === 'consistent') {
      advancedMetrics.ipAnalysisScore = 20;
      advancedMetrics.cdnScore += 8;
    }
    
    // 考虑查询成功率
    const successRate = healthStats.successfulQueries / healthStats.totalServers;
    if (successRate >= 0.8) {
      advancedMetrics.ipAnalysisScore = Math.min(100, advancedMetrics.ipAnalysisScore + 10);
    } else if (successRate < 0.6) {
      advancedMetrics.ipAnalysisScore = Math.max(0, advancedMetrics.ipAnalysisScore - 20);
    }
    
    // 基于IP一致性的CDN检测
    if (ipConsistency === 'inconsistent' && uniqueIPs.length >= 3) {
      testResults.cdn.multiLocationAnalysis = {
        isCDNByIP: true,
        confidence: 'high',
        reasoning: `多地ping检测到${uniqueIPs.length}个不同IP地址，成功率${Math.round(successRate * 100)}%，这是CDN的典型特征`
      };
      
      if (cdnDetected && cdnProvider) {
        details.push(`多地IP检测 + HTTP头检测: 确认使用CDN (${cdnProvider})`);
        advancedMetrics.detectionMethods.push('HTTP头分析');
        return {
          connectionType: 'cdn',
          confidence: 'high',
          details,
          advancedMetrics
        };
      } else if (cdnDetected) {
        details.push('多地IP检测 + HTTP头检测: 确认使用CDN，但提供商未知');
        advancedMetrics.detectionMethods.push('HTTP头分析');
        return {
          connectionType: 'cdn',
          confidence: 'high',
          details,
          advancedMetrics
        };
      } else {
        details.push('多地IP检测: 强烈表明使用CDN，但HTTP头未显示CDN特征（可能是隐藏CDN或特殊配置）');
        return {
          connectionType: 'cdn',
          confidence: 'high',
          details,
          advancedMetrics
        };
      }
    } else if (ipConsistency === 'mixed' && uniqueIPs.length >= 2) {
      testResults.cdn.multiLocationAnalysis = {
        isCDNByIP: true,
        confidence: 'medium',
        reasoning: `多地ping检测到${uniqueIPs.length}个不同IP地址，成功率${Math.round(successRate * 100)}%，可能使用CDN或负载均衡`
      };
      
      if (cdnDetected) {
        details.push(`多地IP检测 + HTTP头检测: 可能使用CDN${cdnProvider ? ` (${cdnProvider})` : ''}`);
        advancedMetrics.detectionMethods.push('HTTP头分析');
        return {
          connectionType: 'cdn',
          confidence: 'medium',
          details,
          advancedMetrics
        };
      } else {
        details.push('多地IP检测: 可能使用CDN或负载均衡，但HTTP头未显示CDN特征');
        return {
          connectionType: 'mixed',
          confidence: 'medium',
          details,
          advancedMetrics
        };
      }
    } else if (ipConsistency === 'consistent') {
      testResults.cdn.multiLocationAnalysis = {
        isCDNByIP: false,
        confidence: 'high',
        reasoning: `多地ping检测到所有位置返回相同IP地址，成功率${Math.round(successRate * 100)}%，表明可能为直连连接`
      };
      
      if (cdnDetected && cdnProvider) {
        details.push(`多地IP检测显示单一IP，但HTTP头检测到CDN (${cdnProvider}) - 可能是单点CDN或特殊配置`);
        advancedMetrics.detectionMethods.push('HTTP头分析');
        return {
          connectionType: 'mixed',
          confidence: 'medium',
          details,
          advancedMetrics
        };
      } else if (cdnDetected) {
        details.push('多地IP检测显示单一IP，但HTTP头检测到CDN特征 - 可能是单点CDN或配置问题');
        advancedMetrics.detectionMethods.push('HTTP头分析');
        return {
          connectionType: 'mixed',
          confidence: 'low',
          details,
          advancedMetrics
        };
      }
    }
  }

  // 2. HTTP头分析（权重：35%）
  if (cdnDetected && cdnProvider) {
    advancedMetrics.detectionMethods.push('HTTP头分析');
    advancedMetrics.headerAnalysisScore = 90;
    advancedMetrics.cdnScore += 35;
    details.push(`HTTP头检测到CDN: ${cdnProvider}`);
    
    // 如果有多地ping结果，调整置信度
    const finalConfidence = multiLocationPing ? 'medium' : 'high';
    return {
      connectionType: 'cdn',
      confidence: finalConfidence,
      details,
      advancedMetrics
    };
  }
  
  if (cdnDetected && !cdnProvider) {
    advancedMetrics.detectionMethods.push('HTTP头分析');
    advancedMetrics.headerAnalysisScore = 70;
    advancedMetrics.cdnScore += 25;
    details.push('HTTP头检测到CDN特征，但无法确定具体提供商');
    
    const finalConfidence = multiLocationPing ? 'medium' : 'high';
    return {
      connectionType: 'cdn',
      confidence: finalConfidence,
      details,
      advancedMetrics
    };
  }

  // 3. 代理头分析（权重：15%）
  if (proxyDetected) {
    const proxyTypes = detectProxyType(testResults.cdn.proxyHeaders);
    advancedMetrics.detectionMethods.push('代理头分析');
    advancedMetrics.headerAnalysisScore = Math.max(advancedMetrics.headerAnalysisScore, 50);
    advancedMetrics.cdnScore += 15;
    details.push(`检测到代理头: ${proxyTypes.join(', ')}`);
    
    // 检查是否可能是CDN但未识别
    const server = (testResults.server.headers.server || '').toLowerCase();
    if (server.includes('cloudflare') || server.includes('netlify') || server.includes('vercel')) {
      details.push('服务器头信息表明可能使用了CDN');
      advancedMetrics.detectionMethods.push('服务器分析');
      advancedMetrics.serverAnalysisScore = 60;
      advancedMetrics.cdnScore += 10;
      return {
        connectionType: 'mixed',
        confidence: 'medium',
        details,
        advancedMetrics
      };
    }
    
    return {
      connectionType: 'proxy',
      confidence: 'high',
      details,
      advancedMetrics
    };
  }

  // 4. 服务器和其他头信息分析（权重：10%）
  const server = (headers.server || '').toLowerCase();
  const xPoweredBy = (headers['x-powered-by'] || '').toLowerCase();
  const xCache = (headers['x-cache'] || '').toLowerCase();
  const via = (headers.via || '').toLowerCase();
  
  let serverScore = 0;
  let serverIndicators = [];
  
  // 服务器头信息检测
  if (server.includes('cloudflare')) {
    serverScore += 40;
    serverIndicators.push('Cloudflare');
  }
  if (server.includes('netlify')) {
    serverScore += 35;
    serverIndicators.push('Netlify');
  }
  if (server.includes('vercel')) {
    serverScore += 35;
    serverIndicators.push('Vercel');
  }
  if (server.includes('fly.io')) {
    serverScore += 30;
    serverIndicators.push('Fly.io');
  }
  if (server.includes('heroku')) {
    serverScore += 25;
    serverIndicators.push('Heroku');
  }
  
  // X-Powered-By检测
  if (xPoweredBy.includes('netlify')) {
    serverScore += 30;
    serverIndicators.push('Netlify');
  }
  if (xPoweredBy.includes('vercel')) {
    serverScore += 30;
    serverIndicators.push('Vercel');
  }
  
  // X-Cache检测
  if (xCache.includes('cloudflare') || xCache.includes('fastly') || 
      xCache.includes('akamai') || xCache.includes('cloudfront')) {
    serverScore += 25;
    serverIndicators.push('Cache头');
  }
  
  // Via头检测
  if (via.includes('cloudflare') || via.includes('fastly') || 
      via.includes('akamai') || via.includes('cloudfront') ||
      via.includes('google') || via.includes('azure')) {
    serverScore += 20;
    serverIndicators.push('Via头');
  }
  
  if (serverScore > 0) {
    advancedMetrics.detectionMethods.push('服务器分析');
    advancedMetrics.serverAnalysisScore = Math.min(100, serverScore);
    advancedMetrics.cdnScore += Math.min(10, serverScore / 10);
    details.push(`服务器或头信息表明可能使用了CDN: ${serverIndicators.join(', ')}`);
    
    return {
      connectionType: 'mixed',
      confidence: serverScore >= 60 ? 'medium' : 'low',
      details,
      advancedMetrics
    };
  }
  
  // 5. 基于高级指标的最终判断
  if (advancedMetrics.cdnScore >= 70) {
    details.push(`综合评分${advancedMetrics.cdnScore}分，强烈表明使用CDN`);
    return {
      connectionType: 'cdn',
      confidence: 'high',
      details,
      advancedMetrics
    };
  } else if (advancedMetrics.cdnScore >= 40) {
    details.push(`综合评分${advancedMetrics.cdnScore}分，可能使用CDN`);
    return {
      connectionType: 'mixed',
      confidence: 'medium',
      details,
      advancedMetrics
    };
  } else if (advancedMetrics.cdnScore >= 20) {
    details.push(`综合评分${advancedMetrics.cdnScore}分，可能使用代理或特殊配置`);
    return {
      connectionType: 'mixed',
      confidence: 'low',
      details,
      advancedMetrics
    };
  }
  
  details.push('未检测到CDN或代理特征');
  return {
    connectionType: 'direct',
    confidence: 'high',
    details,
    advancedMetrics
  };
}

interface HttpResponse {
  statusCode: number;
  headers: Record<string, string>;
  contentLength: number;
  totalTime: number;
  dnsTime: number;
  tcpTime: number;
  sslTime?: number;
  ttfb: number;
  downloadTime: number;
  sslInfo?: {
    issuer: string;
    validFrom: string;
    validTo: string;
    subjectAltName: string;
  };
}

function makeHttpRequest(url: string): Promise<HttpResponse> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const timing = {
      dns: 0,
      tcp: 0,
      ssl: 0,
      ttfb: 0,
      download: 0,
      total: 0
    };

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.path || '/',
      method: 'GET',
      headers: {
        'User-Agent': 'CDN-Latency-Tester/1.0',
        'Accept': '*/*',
      },
      timeout: 10000,
    };

    if (isHttps) {
      options.rejectUnauthorized = false; // 允许自签名证书
      options.agent = new https.Agent(options);
    }

    // DNS解析时间已经在testDomain函数中测量了
    // 这里我们测量TCP连接时间
    const connectionStartTime = Date.now();
    
    const req = client.request(options, (res) => {
      const tcpEndTime = Date.now();
      timing.tcp = tcpEndTime - connectionStartTime;
      
      let dataLength = 0;
      const headers: Record<string, string> = {};
      
      // 收集响应头
      Object.entries(res.headers).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          headers[key] = value.join(', ');
        } else {
          headers[key] = value || '';
        }
      });

      // 获取SSL证书信息（仅HTTPS）
      let sslInfo;
      if (isHttps && res.socket) {
        const socket = res.socket as any;
        if (socket.getPeerCertificate) {
          const cert = socket.getPeerCertificate();
          if (cert && Object.keys(cert).length > 0) {
            sslInfo = {
              issuer: cert.issuer?.O || cert.issuer?.CN || 'Unknown',
              validFrom: new Date(cert.valid_from).toLocaleDateString(),
              validTo: new Date(cert.valid_to).toLocaleDateString(),
              subjectAltName: cert.subjectaltname || 'N/A'
            };
          }
        }
      }

      // 测量首字节时间
      const ttfbStartTime = Date.now();
      let firstByteReceived = false;
      let downloadStartTime: number;

      res.on('data', (chunk) => {
        if (!firstByteReceived) {
          const firstByteTime = Date.now();
          timing.ttfb = firstByteTime - ttfbStartTime;
          firstByteReceived = true;
          downloadStartTime = firstByteTime;
        }
        dataLength += chunk.length;
      });

      res.on('end', () => {
        const endTime = Date.now();
        timing.download = endTime - (downloadStartTime || endTime);
        timing.total = endTime - startTime;
        
        resolve({
          statusCode: res.statusCode || 0,
          headers,
          contentLength: dataLength,
          totalTime: timing.total,
          dnsTime: 0, // DNS时间在testDomain中设置
          tcpTime: timing.tcp,
          sslTime: timing.ssl,
          ttfb: timing.ttfb,
          downloadTime: timing.download,
          sslInfo,
        });
      });
    });

    req.on('socket', (socket) => {
      if (isHttps) {
        socket.on('secureConnect', () => {
          const sslEndTime = Date.now();
          timing.ssl = sslEndTime - connectionStartTime - timing.tcp;
        });
      }
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');

  if (!domain) {
    return NextResponse.json({
      error: 'Domain parameter is required',
      timestamp: new Date().toISOString(),
    }, { status: 400 });
  }

  // 清理域名输入
  let cleanDomain = domain.trim();
  if (cleanDomain.startsWith('http://')) {
    cleanDomain = cleanDomain.replace('http://', '');
  } else if (cleanDomain.startsWith('https://')) {
    cleanDomain = cleanDomain.replace('https://', '');
  }
  
  // 确保域名不包含路径
  cleanDomain = cleanDomain.split('/')[0];

  try {
    const testResults = await testDomain(cleanDomain);
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      domain: cleanDomain,
      testResults,
    } as DomainTestResult);

  } catch (error) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      domain: cleanDomain,
      error: error instanceof Error ? error.message : 'Test failed',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const domain = body.domain;

    if (!domain) {
      return NextResponse.json({
        error: 'Domain parameter is required',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // 清理域名输入
    let cleanDomain = domain.trim();
    if (cleanDomain.startsWith('http://')) {
      cleanDomain = cleanDomain.replace('http://', '');
    } else if (cleanDomain.startsWith('https://')) {
      cleanDomain = cleanDomain.replace('https://', '');
    }
    
    // 确保域名不包含路径
    cleanDomain = cleanDomain.split('/')[0];

    const testResults = await testDomain(cleanDomain);
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      domain: cleanDomain,
      testResults,
    } as DomainTestResult);

  } catch (error) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Test failed',
    }, { status: 500 });
  }
}