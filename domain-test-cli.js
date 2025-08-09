#!/usr/bin/env node

const https = require('https');
const http = require('http');
const url = require('url');

class DomainPerformanceTester {
    constructor(options) {
        this.targetDomain = options.domain || 'example.com';
        this.testCount = options.count || 5;
        this.interval = options.interval || 1000;
        this.apiUrl = options.apiUrl || 'http://localhost:3000/api/test-domain';
        this.results = [];
    }

    async testDomain(domain) {
        try {
            const testUrl = `${this.apiUrl}?domain=${encodeURIComponent(domain)}`;
            const startTime = Date.now();
            
            const response = await this.makeRequest(testUrl);
            const endTime = Date.now();
            
            const result = {
                success: true,
                domain: domain,
                totalTime: endTime - startTime,
                apiResponseTime: endTime - startTime,
                data: response
            };
            
            this.results.push(result);
            return result;
            
        } catch (error) {
            const result = {
                success: false,
                domain: domain,
                totalTime: 0,
                error: error.message
            };
            
            this.results.push(result);
            return result;
        }
    }

    async makeRequest(urlString) {
        return new Promise((resolve, reject) => {
            const parsedUrl = url.parse(urlString);
            
            const options = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || 80,
                path: parsedUrl.path,
                method: 'GET',
                headers: {
                    'User-Agent': 'Domain-Latency-Tester/1.0'
                }
            };

            const req = http.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        try {
                            const responseData = JSON.parse(data);
                            resolve(responseData);
                        } catch (e) {
                            reject(new Error('Failed to parse JSON response'));
                        }
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.setTimeout(30000, () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            req.end();
        });
    }

    formatTime(ms) {
        return `${ms.toFixed(2)}ms`;
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getStatusBadge(statusCode) {
        if (statusCode >= 200 && statusCode < 300) return '✅';
        if (statusCode >= 300 && statusCode < 400) return '🔄';
        if (statusCode >= 400 && statusCode < 500) return '❌';
        return '⚠️';
    }

    printResult(result, index) {
        console.log(`\\n=== 测试 ${index + 1}: ${result.domain} ===`);
        
        if (result.success) {
            const data = result.data.testResults;
            
            console.log(`API响应时间: ${this.formatTime(result.apiResponseTime)}`);
            console.log(`HTTP状态: ${data.connection.statusCode} ${this.getStatusBadge(data.connection.statusCode)}`);
            console.log(`总响应时间: ${this.formatTime(data.connection.totalTime)}`);
            console.log(`DNS解析时间: ${this.formatTime(data.dns.resolutionTime)}`);
            console.log(`首字节时间(TTFB): ${this.formatTime(data.connection.ttfb)}`);
            console.log(`内容下载时间: ${this.formatTime(data.connection.downloadTime)}`);
            console.log(`响应大小: ${this.formatBytes(data.server.responseSize)}`);
            console.log(`服务器软件: ${data.server.software}`);
            console.log(`连接类型: ${data.cdn.connectionType}`);
            console.log(`检测置信度: ${data.cdn.confidence}`);
            console.log(`CDN提供商: ${data.cdn.provider || '无'}`);
            console.log(`代理头信息: ${data.cdn.hasProxyHeaders ? '检测到' : '未检测到'}`);
            
            if (data.dns.resolvedIPs.length > 0) {
                console.log(`解析IP地址: ${data.dns.resolvedIPs.join(', ')}`);
            }
            
            // 显示分析结果
            if (data.cdn.analysis && data.cdn.analysis.length > 0) {
                console.log('\\n分析结果:');
                data.cdn.analysis.forEach(analysis => {
                    console.log(`  • ${analysis}`);
                });
            }
            
            if (data.cdn.isThroughCDN) {
                console.log('\\nCDN头信息:');
                Object.entries(data.cdn.headers).forEach(([key, value]) => {
                    if (value) {
                        console.log(`  ${key}: ${value}`);
                    }
                });
            }
            
            if (data.cdn.hasProxyHeaders) {
                console.log('\\n代理头信息:');
                Object.entries(data.cdn.proxyHeaders).forEach(([key, value]) => {
                    if (value) {
                        console.log(`  ${key}: ${value}`);
                    }
                });
            }
            
            if (data.ssl) {
                console.log('\\nSSL证书信息:');
                console.log(`  颁发机构: ${data.ssl.issuer}`);
                console.log(`  生效时间: ${data.ssl.validFrom}`);
                console.log(`  过期时间: ${data.ssl.validTo}`);
            }
            
        } else {
            console.log(`❌ 测试失败: ${result.error}`);
        }
    }

    printSummary() {
        if (this.results.length === 0) {
            console.log('没有测试结果');
            return;
        }

        const successfulResults = this.results.filter(r => r.success);
        const failedResults = this.results.filter(r => !r.success);

        console.log('\\n\\n=== 测试总结 ===');
        console.log(`总测试次数: ${this.results.length}`);
        console.log(`成功次数: ${successfulResults.length}`);
        console.log(`失败次数: ${failedResults.length}`);

        if (successfulResults.length > 0) {
            const totalTimes = successfulResults.map(r => r.data.testResults.connection.totalTime);
            const dnsTimes = successfulResults.map(r => r.data.testResults.dns.resolutionTime);
            const ttfbTimes = successfulResults.map(r => r.data.testResults.connection.ttfb);
            const responseSizes = successfulResults.map(r => r.data.testResults.server.responseSize);

            const avgTotal = totalTimes.reduce((a, b) => a + b, 0) / totalTimes.length;
            const avgDns = dnsTimes.reduce((a, b) => a + b, 0) / dnsTimes.length;
            const avgTtfb = ttfbTimes.reduce((a, b) => a + b, 0) / ttfbTimes.length;
            const avgSize = responseSizes.reduce((a, b) => a + b, 0) / responseSizes.length;

            const minTotal = Math.min(...totalTimes);
            const maxTotal = Math.max(...totalTimes);

            console.log(`\\n--- 性能统计 ---`);
            console.log(`平均总响应时间: ${this.formatTime(avgTotal)}`);
            console.log(`平均DNS解析时间: ${this.formatTime(avgDns)}`);
            console.log(`平均首字节时间: ${this.formatTime(avgTtfb)}`);
            console.log(`平均响应大小: ${this.formatBytes(avgSize)}`);
            console.log(`最快响应时间: ${this.formatTime(minTotal)}`);
            console.log(`最慢响应时间: ${this.formatTime(maxTotal)}`);

            const cdnCount = successfulResults.filter(r => r.data.testResults.cdn.connectionType === 'cdn').length;
            const directCount = successfulResults.filter(r => r.data.testResults.cdn.connectionType === 'direct').length;
            const proxyCount = successfulResults.filter(r => r.data.testResults.cdn.connectionType === 'proxy').length;
            const mixedCount = successfulResults.filter(r => r.data.testResults.cdn.connectionType === 'mixed').length;
            const proxyHeadersCount = successfulResults.filter(r => r.data.testResults.cdn.hasProxyHeaders).length;
            const sslCount = successfulResults.filter(r => r.data.testResults.ssl).length;
            
            console.log(`\\n--- 连接类型统计 ---`);
            console.log(`CDN加速: ${cdnCount}/${successfulResults.length} (${((cdnCount / successfulResults.length) * 100).toFixed(1)}%)`);
            console.log(`直连: ${directCount}/${successfulResults.length} (${((directCount / successfulResults.length) * 100).toFixed(1)}%)`);
            console.log(`代理: ${proxyCount}/${successfulResults.length} (${((proxyCount / successfulResults.length) * 100).toFixed(1)}%)`);
            console.log(`混合: ${mixedCount}/${successfulResults.length} (${((mixedCount / successfulResults.length) * 100).toFixed(1)}%)`);
            
            console.log(`\\n--- 代理头信息统计 ---`);
            console.log(`检测到代理头的请求: ${proxyHeadersCount}/${successfulResults.length}`);
            console.log(`代理头检测率: ${((proxyHeadersCount / successfulResults.length) * 100).toFixed(1)}%`);
            
            console.log(`\\n--- SSL 统计 ---`);
            console.log(`启用SSL的请求: ${sslCount}/${successfulResults.length}`);
            console.log(`SSL启用率: ${((sslCount / successfulResults.length) * 100).toFixed(1)}%`);

            // 性能评级
            console.log(`\\n--- 性能评级 ---`);
            if (avgTotal < 200) {
                console.log('🟢 优秀: 平均响应时间小于200ms');
            } else if (avgTotal < 500) {
                console.log('🟡 良好: 平均响应时间在200-500ms之间');
            } else if (avgTotal < 1000) {
                console.log('🟠 一般: 平均响应时间在500-1000ms之间');
            } else {
                console.log('🔴 较慢: 平均响应时间超过1000ms');
            }

            if (avgDns < 50) {
                console.log('🟢 DNS解析优秀: 小于50ms');
            } else if (avgDns < 100) {
                console.log('🟡 DNS解析良好: 50-100ms');
            } else {
                console.log('🔴 DNS解析较慢: 超过100ms');
            }
        }
    }

    async runSingleTest() {
        console.log(`正在测试域名: ${this.targetDomain}`);
        const result = await this.testDomain(this.targetDomain);
        this.printResult(result, this.results.length - 1);
    }

    async runMultipleTests() {
        console.log(`开始执行 ${this.testCount} 次域名延迟测试...`);
        console.log(`测试域名: ${this.targetDomain}`);
        console.log(`测试间隔: ${this.interval}ms\\n`);

        for (let i = 0; i < this.testCount; i++) {
            await this.runSingleTest();
            
            if (i < this.testCount - 1) {
                console.log(`\\n等待 ${this.interval}ms 后进行下一次测试...`);
                await new Promise(resolve => setTimeout(resolve, this.interval));
            }
        }

        this.printSummary();
    }

    setTargetDomain(domain) {
        this.targetDomain = domain;
    }

    setTestCount(count) {
        this.testCount = count;
    }

    setInterval(interval) {
        this.interval = interval;
    }

    setApiUrl(url) {
        this.apiUrl = url;
    }
}

// 命令行参数解析
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        domain: 'example.com',
        count: 5,
        interval: 1000,
        apiUrl: 'http://localhost:3000/api/test-domain',
        help: false
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        if (arg === '--help' || arg === '-h') {
            options.help = true;
        } else if (arg === '--domain' || arg === '-d') {
            options.domain = args[i + 1];
            i++;
        } else if (arg === '--count' || arg === '-c') {
            options.count = parseInt(args[i + 1]);
            i++;
        } else if (arg === '--interval' || arg === '-i') {
            options.interval = parseInt(args[i + 1]);
            i++;
        } else if (arg === '--api-url' || arg === '-a') {
            options.apiUrl = args[i + 1];
            i++;
        }
    }

    return options;
}

function printHelp() {
    console.log(`
网站性能检测工具

用法: node domain-test-cli.js [选项]

选项:
  -d, --domain DOMAIN     测试目标域名 (默认: example.com)
  -c, --count COUNT       测试次数 (默认: 5)
  -i, --interval MS       测试间隔毫秒数 (默认: 1000)
  -a, --api-url URL        API服务器地址 (默认: http://localhost:3000/api/test-domain)
  -h, --help              显示帮助信息

示例:
  node domain-test-cli.js
  node domain-test-cli.js --domain example.com
  node domain-test-cli.js -d example.com -c 10 -i 2000
  node domain-test-cli.js --domain https://example.com --count 5

支持的检测指标:
  • DNS解析时间
  • TCP连接时间
  • SSL握手时间 (HTTPS)
  • 首字节时间 (TTFB)
  • 内容下载时间
  • CDN状态检测
  • 服务器信息
  • SSL证书信息
  • 响应头分析
`);
}

async function main() {
    const options = parseArgs();

    if (options.help) {
        printHelp();
        return;
    }

    const tester = new DomainPerformanceTester({
        domain: options.domain,
        count: options.count,
        interval: options.interval,
        apiUrl: options.apiUrl
    });

    try {
        await tester.runMultipleTests();
    } catch (error) {
        console.error('测试执行失败:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = DomainPerformanceTester;