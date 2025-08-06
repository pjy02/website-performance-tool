# CDN 延迟测试工具

这个工具可以帮助您测试域名 `example.com` 经过 CDN 到源服务器的响应时间。

## 功能特性

### 1. Web 界面测试
- 访问 `http://localhost:3000` 即可使用 Web 界面
- 提供实时测试、自动测试、历史记录等功能
- 显示详细的 CDN 检测信息和服务器信息

### 2. 命令行测试
使用 Node.js 脚本进行命令行测试：

```bash
# 基本测试
node cdn-test-cli.js

# 测试指定域名
node cdn-test-cli.js --url https://example.com/api/cdn-latency

# 自定义测试参数
node cdn-test-cli.js -u https://example.com/api/cdn-latency -c 10 -i 2000
```

### 3. 其他测试方法

#### 使用 curl 命令
```bash
# 基本测试
curl -w "总时间: %{time_total}s\\nDNS解析: %{time_namelookup}s\\n连接: %{time_connect}s\\n传输: %{time_starttransfer}s\\n" -o /dev/null -s https://example.com/api/cdn-latency

# 查看响应头
curl -I https://example.com/api/cdn-latency

# 详细测试
curl -v https://example.com/api/cdn-latency
```

#### 使用 ping 命令
```bash
# 测试网络延迟
ping example.com

# 连续测试
ping -c 10 example.com
```

#### 使用 traceroute 命令
```bash
# 查看路由路径
traceroute example.com

# 或使用 mtr (需要安装)
mtr example.com
```

## 测试结果说明

### 关键指标
1. **总响应时间**: 从发起请求到收到响应的总时间
2. **服务器处理时间**: 服务器端处理请求的时间
3. **网络传输时间**: CDN 到源服务器的网络传输时间
4. **CDN 状态**: 检测请求是否经过 CDN

### CDN 检测
工具会检测以下 CDN 头信息：
- `cf-ray`: Cloudflare
- `x-azure-ref`: Azure CDN
- `x-amz-cf-id`: Amazon CloudFront
- `x-edge-location`: Google Cloud CDN
- `via: Fastly`: Fastly
- `x-cache: Akamai`: Akamai

## 使用建议

### 1. 基准测试
- 在不同时间段进行测试（早上、中午、晚上）
- 从不同地理位置进行测试
- 记录测试结果进行对比分析

### 2. 性能优化
- 如果发现 CDN 延迟较高，可以：
  - 检查 CDN 配置
  - 更换 CDN 节点
  - 优化源服务器性能
  - 检查网络连接

### 3. 监控建议
- 设置定时测试，监控 CDN 性能
- 设置告警阈值，当延迟过高时通知
- 定期分析测试报告，优化 CDN 配置

## 常见问题

### Q: 如何判断请求是否经过 CDN？
A: 工具会自动检测 CDN 头信息，如果发现 CDN 相关头信息，会显示"通过 CDN"。

### Q: 为什么有时候测试结果显示"直连"？
A: 可能是因为：
- CDN 配置问题
- DNS 解析问题
- CDN 节点故障
- 本地网络问题

### Q: 如何提高测试准确性？
A: 建议：
- 多次测试取平均值
- 在不同时间段测试
- 从不同网络环境测试
- 使用多种测试方法验证

## 技术实现

### 后端 API
- 文件: `src/app/api/cdn-latency/route.ts`
- 功能: 提供延迟测试接口，返回服务器处理时间和 CDN 检测信息

### 前端界面
- 文件: `src/app/page.tsx`
- 功能: 提供用户友好的测试界面，支持实时测试和历史记录

### 命令行工具
- 文件: `cdn-test-cli.js`
- 功能: 提供命令行测试能力，支持批量测试和统计分析

## 扩展功能

您可以根据需要扩展以下功能：
1. 添加更多 CDN 提供商的检测
2. 集成第三方 CDN 监控服务
3. 添加性能报告生成功能
4. 集成告警通知功能
5. 添加地理位置测试功能

---

如有问题或建议，请随时反馈。