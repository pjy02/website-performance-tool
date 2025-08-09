import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestTime = new Date().toISOString();
  
  // 获取请求头信息
  const headers = Object.fromEntries(request.headers.entries());
  
  // 检测是否通过CDN访问 - 只检测明确的CDN头信息
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
  
  // 检测代理头信息（可能由CDN、代理服务器或负载均衡器添加）
  const proxyHeaders = {
    'x-forwarded-for': headers['x-forwarded-for'] || null,
    'x-real-ip': headers['x-real-ip'] || null,
    'via': headers['via'] || null,
    'x-forwarded-proto': headers['x-forwarded-proto'] || null,
  };
  
  const isThroughCDN = Object.values(cdnHeaders).some(value => value !== null);
  const hasProxyHeaders = Object.values(proxyHeaders).some(value => value !== null);
  
  // 模拟一些处理时间来测试服务器响应
  await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
  
  const endTime = Date.now();
  const processingTime = endTime - startTime;
  
  return NextResponse.json({
    timestamp: requestTime,
    serverProcessingTime: processingTime,
    cdnDetection: {
      isThroughCDN,
      hasProxyHeaders,
      headers: cdnHeaders,
      proxyHeaders: proxyHeaders,
    },
    requestInfo: {
      method: request.method,
      url: request.url,
      userAgent: headers['user-agent'] || 'Unknown',
    },
    serverInfo: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    },
  });
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestTime = new Date().toISOString();
  
  try {
    const body = await request.json();
    
    // 获取请求头信息
    const headers = Object.fromEntries(request.headers.entries());
    
    // 检测是否通过CDN访问 - 只检测明确的CDN头信息
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
    
    // 检测代理头信息（可能由CDN、代理服务器或负载均衡器添加）
    const proxyHeaders = {
      'x-forwarded-for': headers['x-forwarded-for'] || null,
      'x-real-ip': headers['x-real-ip'] || null,
      'via': headers['via'] || null,
      'x-forwarded-proto': headers['x-forwarded-proto'] || null,
    };
    
    const isThroughCDN = Object.values(cdnHeaders).some(value => value !== null);
    const hasProxyHeaders = Object.values(proxyHeaders).some(value => value !== null);
    
    // 模拟一些处理时间来测试服务器响应
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    return NextResponse.json({
      timestamp: requestTime,
      serverProcessingTime: processingTime,
      cdnDetection: {
        isThroughCDN,
        hasProxyHeaders,
        headers: cdnHeaders,
        proxyHeaders: proxyHeaders,
      },
      requestData: body,
      requestInfo: {
        method: request.method,
        url: request.url,
        userAgent: headers['user-agent'] || 'Unknown',
      },
      serverInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    });
  } catch (error) {
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    return NextResponse.json({
      timestamp: requestTime,
      serverProcessingTime: processingTime,
      error: 'Invalid JSON body',
      errorDetails: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 400 });
  }
}