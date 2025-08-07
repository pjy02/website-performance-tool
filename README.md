# 🚀 网站性能检测工具

一个功能全面的网站性能检测工具，支持测试任意域名的连接类型、CDN状态、多地Ping检测、SSL证书和服务器性能分析。具备智能DNS服务器排序、优化检测速度和完善的部署支持。

## ✨ 主要功能

### 🎯 核心特性
- **智能连接类型检测**: 准确识别直连、CDN加速、代理、混合连接类型
- **多地Ping检测**: 全球40+个地区的DNS服务器并发检测，分析CDN地理覆盖
- **自定义域名测试**: 支持测试任意域名，无需固定配置
- **详细性能分析**: 提供DNS解析、TCP连接、SSL握手、TTFB等详细时间分析
- **SSL证书检测**: 获取SSL证书的详细信息，智能格式化域名范围显示
- **多界面支持**: Web界面、命令行工具、API接口三种使用方式

### 🔍 智能检测能力
- **CDN提供商识别**: 支持15+主流CDN服务商自动识别
- **连接类型分析**: 区分直连、CDN、代理、混合连接类型
- **置信度评估**: 提供高、中、低三级检测置信度
- **代理头检测**: 识别各种代理服务器和负载均衡器特征
- **地理分布分析**: 基于多地DNS检测结果分析CDN覆盖范围
- **智能排序**: 中国地区DNS服务器优先显示，失败服务器置底

### 📊 测试指标
- **DNS解析时间**: 域名解析到IP地址的时间
- **TCP连接时间**: 建立TCP连接的时间
- **SSL握手时间**: SSL/TLS握手时间（HTTPS）
- **首字节时间(TTFB)**: Time to First Byte
- **内容下载时间**: 下载响应内容的时间
- **总响应时间**: 完整的请求响应时间
- **服务器信息**: 服务器软件、响应头、状态码等
- **连接类型**: CDN加速、直连、代理、混合连接
- **SSL证书**: 证书颁发机构、有效期、域名范围
- **多地Ping**: 全球40+地区DNS解析结果和IP一致性分析

### 🛠️ 技术栈
- **前端**: Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
- **后端**: Next.js API Routes + Node.js
- **检测引擎**: 自定义HTTP请求库 + DNS解析 + 多维度特征分析
- **实时通信**: Socket.IO + WebSocket
- **数据库**: Prisma ORM + SQLite（可选）
- **界面组件**: Lucide图标 + Framer Motion动画

## 🚀 快速开始

### 环境要求
- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **内存**: >= 512MB
- **存储**: >= 1GB

### 安装和运行

```bash
# 克隆项目
git clone <repository-url>
cd website-performance-tester

# 安装依赖
npm install

# 初始化数据库（如果使用Prisma）
npx prisma generate
npx prisma db push

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看Web界面。

## 🚀 快速部署指南

本项目提供了 **一键部署脚本**，支持 Windows、Ubuntu/Debian 和 Docker 环境，让部署变得极其简单！

### 🎯 推荐部署方式

#### 🚀 一键部署脚本（最简单）
```bash
# 运行主部署脚本，会自动检测系统并推荐最佳部署方式
chmod +x deploy.sh
./deploy.sh
```

#### 🪟 Windows 用户
```cmd
# 方法1：使用主部署脚本（推荐）
# 在 Git Bash 或 WSL 中运行
deploy.sh

# 方法2：直接使用Windows部署脚本
# 右键点击 deploy-windows.bat，选择"以管理员身份运行"
deploy-windows.bat
```

#### 🐧 Linux 用户
```bash
# 方法1：使用主部署脚本（推荐）
./deploy.sh

# 方法2：直接使用Ubuntu部署脚本
chmod +x deploy-ubuntu.sh
sudo ./deploy-ubuntu.sh

# 方法3：使用Docker部署
chmod +x deploy-docker.sh
./deploy-docker.sh
```

#### 🐳 Docker 用户（跨平台）
```bash
# 方法1：使用主部署脚本
./deploy.sh

# 方法2：直接使用Docker部署脚本
chmod +x deploy-docker.sh
./deploy-docker.sh
```

### 📋 详细部署文档

完整的部署指南请查看：[📖 部署文档](./DEPLOYMENT.md)

包含以下详细内容：
- 🪟 Windows 部署（自动脚本 + 手动部署 + 服务部署）
- 🐧 Ubuntu/Debian 部署（自动脚本 + 手动部署 + Systemd 服务）
- 🐳 Docker 部署（自动脚本 + 手动部署 + Docker Compose）
- 🔧 部署后配置（环境变量、防火墙、反向代理）
- 🔍 监控和维护（服务管理、日志管理、性能监控）
- 🚨 故障排除（常见问题、调试模式）
- 📚 更新和维护（应用更新、系统更新、数据备份）
- 🎯 最佳实践（安全建议、性能优化、生产环境建议）

### ⚡ 快速开始（开发模式）

如果您只是想快速试用：

```bash
# 1. 安装依赖
npm install

# 2. 初始化数据库
npx prisma generate
npx prisma db push

# 3. 启动开发服务器
npm run dev

# 4. 访问 http://localhost:3000
```

### 🏗️ 生产环境部署

对于生产环境，强烈建议使用：

1. **一键部署脚本**: `./deploy.sh` - 自动检测系统并推荐最佳部署方式
2. **Windows**: 使用 `deploy-windows.bat` 自动部署脚本
3. **Linux**: 使用 `deploy-ubuntu.sh` 自动部署脚本
4. **Docker**: 使用 `deploy-docker.sh` 自动部署脚本

这些脚本会自动处理：
- ✅ 环境检查和依赖安装
- ✅ 用户权限和目录创建
- ✅ 服务配置和启动
- ✅ 防火墙和安全配置
- ✅ 监控和日志设置
- ✅ 系统优化和性能调优
- ✅ 智能错误处理和回滚

### 🎯 部署后访问

部署完成后，您可以通过以下地址访问：

- **本地访问**: http://localhost:3000
- **局域网访问**: http://your-ip:3000
- **域名访问**: http://your-domain.com（需要配置域名）

### 🔧 管理命令

#### Linux (Systemd)
```bash
# 查看服务状态
sudo systemctl status domain-test

# 查看日志
sudo journalctl -u domain-test -f

# 重启服务
sudo systemctl restart domain-test
```

#### Windows (NSSM/PM2)
```cmd
# 查看服务状态
nssm status DomainTest

# 查看日志
nssm dump DomainTest

# 重启服务
nssm restart DomainTest
```

#### Docker
```bash
# 查看容器状态
docker ps

# 查看日志
docker logs -f domain-test

# 重启容器
docker restart domain-test
```

---

## 📦 完整部署指南

### Windows 部署

#### 方法一：开发模式部署（推荐用于测试）

```cmd
# 1. 打开PowerShell或命令提示符
# 2. 进入项目目录
cd C:\path\to\your-project

# 3. 安装依赖
npm install

# 4. 直接启动开发服务器
npm run dev

# 5. 访问 http://localhost:3000
```

#### 方法二：IIS 部署（生产环境）

##### 1. 安装 IIS
以管理员身份运行 PowerShell：
```powershell
# 安装 IIS 和相关组件
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServer
Enable-WindowsOptionalFeature -Online -FeatureName IIS-ApplicationDevelopment
Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpLogging
Enable-WindowsOptionalFeature -Online -FeatureName IIS-Security

# 安装 URL Rewrite 模块
# 下载：https://www.iis.net/downloads/microsoft/url-rewrite
```

##### 2. 安装 IISNode
```powershell
# 下载并安装 IISNode
# https://github.com/azure/iisnode/wiki/iisnode-releases
```

##### 3. 创建 Web.config 文件
在项目根目录创建 `web.config`：
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="server.ts" verb="*" modules="iisnode" />
    </handlers>
    <rewrite>
      <rules>
        <rule name="StaticFiles">
          <action type="None" stopProcessing="true" />
          <conditions>
            <add input="REQUEST_URI" pattern="^/(static|_next|favicon.ico)" />
          </conditions>
        </rule>
        <rule name="DynamicContent">
          <conditions>
            <add input="REQUEST_FILENAME" matchType="IsFile" negate="True" />
          </conditions>
          <action type="Rewrite" url="server.ts" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

##### 4. 部署到 IIS
```powershell
# 创建网站目录
New-Item -ItemType Directory -Path "C:\inetpub\wwwroot\domain-test" -Force

# 复制项目文件
Copy-Item -Path "C:\path\to\your-project\*" -Destination "C:\inetpub\wwwroot\domain-test" -Recurse -Force

# 创建 IIS 网站
New-Website -Name "DomainTest" -Port 3000 -PhysicalPath "C:\inetpub\wwwroot\domain-test"
```

#### 方法三：Windows 服务部署

##### 1. 使用 PM2
```cmd
# 安装 PM2
npm install -g pm2

# 安装 PM2 Windows 服务
pm2-service-install -n DomainTest

# 启动应用
pm2 start server.ts --name "domain-test"
pm2 save
pm2 startup
```

##### 2. 使用 NSSM
```cmd
# 下载 NSSM
# https://nssm.cc/download

# 安装为 Windows 服务
nssm install DomainTest "C:\Program Files\nodejs\node.exe" "C:\path\to\your-project\server.ts"
nssm start DomainTest
```

### Linux 部署

#### 方法一：直接运行（开发/测试）

```bash
# 1. 更新系统
sudo apt update && sudo apt upgrade -y  # Ubuntu/Debian
# 或
sudo yum update -y  # CentOS/RHEL

# 2. 安装 Node.js
# 使用 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. 安装项目依赖
npm install

# 4. 初始化数据库
npx prisma generate
npx prisma db push

# 5. 启动服务
npm run dev
```

#### 方法二：Systemd 服务部署（生产环境推荐）

##### 1. 创建服务文件
```bash
sudo nano /etc/systemd/system/domain-test.service
```

##### 2. 服务配置
```ini
[Unit]
Description=Domain Test Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/domain-test
ExecStart=/usr/bin/node server.ts
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

##### 3. 部署和启动
```bash
# 创建应用目录
sudo mkdir -p /var/www/domain-test
sudo useradd -r -s /bin/false domain-test

# 复制项目文件
sudo cp -r /path/to/your-project/* /var/www/domain-test/
sudo chown -R domain-test:domain-test /var/www/domain-test

# 安装依赖
cd /var/www/domain-test
sudo -u domain-test npm install
sudo -u domain-test npx prisma generate

# 启动服务
sudo systemctl daemon-reload
sudo systemctl enable domain-test
sudo systemctl start domain-test

# 查看状态
sudo systemctl status domain-test
```

#### 方法三：Docker 部署（跨平台推荐）

##### 1. 创建 Dockerfile
```dockerfile
# 多阶段构建
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# 生产镜像
FROM node:18-alpine AS runner
WORKDIR /app

# 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/package.json ./package.json

# 安装 Prisma 客户端
RUN npx prisma generate

EXPOSE 3000

CMD ["node", "server.ts"]
```

##### 2. 创建 docker-compose.yml
```yaml
version: '3.8'
services:
  domain-test:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
      - ./db:/app/db
```

##### 3. 启动 Docker 服务
```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 更新并重启
docker-compose build --no-cache
docker-compose up -d
```

#### 方法四：Nginx 反向代理

##### 1. 安装 Nginx
```bash
# Ubuntu/Debian
sudo apt install nginx -y

# CentOS/RHEL
sudo yum install nginx -y
```

##### 2. 配置 Nginx
```bash
sudo nano /etc/nginx/sites-available/domain-test
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # 静态文件缓存
    location /_next/static/ {
        alias /var/www/domain-test/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 启用 gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

##### 3. 启用配置
```bash
sudo ln -s /etc/nginx/sites-available/domain-test /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 环境变量配置

创建 `.env` 文件：
```bash
# 应用配置
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# 数据库配置（如果使用）
DATABASE_URL="file:./dev.db"

# 日志配置
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# 安全配置
CORS_ORIGIN=http://localhost:3000,https://your-domain.com
```

### 性能优化

#### PM2 集群模式
```bash
# 安装 PM2
npm install -g pm2

# 启动集群模式（根据CPU核心数）
pm2 start server.ts -i max --name "domain-test"

# 设置内存限制
pm2 start server.ts --max-memory-restart 500M

# 保存 PM2 配置
pm2 save
pm2 startup
```

#### 系统优化
```bash
# Linux 系统优化（需要 root 权限）
# 增加文件描述符限制
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf

# 优化网络参数
cat >> /etc/sysctl.conf << EOF
# 网络优化
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 16384 16777216
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_congestion_control = bbr
EOF

sysctl -p
```

### 监控和日志

#### PM2 监控
```bash
# 安装 PM2 监控面板
pm2 install pm2-web

# 查看实时监控
pm2 monit

# 查看日志
pm2 logs domain-test

# 安装日志轮转
pm2 install pm2-logrotate
```

#### 系统监控
```bash
# 使用 htop 监控系统资源
sudo apt install htop -y
htop

# 监控应用日志
tail -f /var/log/domain-test/app.log

# 监控系统日志
journalctl -u domain-test -f
```

### 安全配置

#### 防火墙配置
```bash
# Ubuntu/Debian (UFW)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# CentOS/RHEL (Firewalld)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

#### SSL 证书配置（Let's Encrypt）
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期
sudo crontab -e
# 添加以下行：
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🎯 使用方法

### Web 界面使用

#### 1. 基本测试
- 打开浏览器访问 `http://localhost:3000`
- 在输入框中输入要测试的域名（如：example.com）
- 点击"开始测试"按钮

#### 2. 自动测试
- 输入域名后点击"自动测试"按钮
- 系统会每5秒自动测试一次
- 再次点击可停止自动测试

#### 3. 查看详细结果
- **概览面板**: 关键指标快速查看
- **性能面板**: 详细的性能分析
- **多地Ping面板**: 全球40+地区DNS检测结果
- **CDN分析面板**: 连接类型和CDN检测详情
- **优化建议面板**: 分级优化建议
- **服务器面板**: 服务器信息和响应头
- **SSL证书面板**: SSL证书详细信息
- **历史记录面板**: 测试历史记录

### 命令行工具使用

```bash
# 基本测试（默认域名）
node domain-test-cli.js

# 测试指定域名
node domain-test-cli.js --domain example.com
# 或
node domain-test-cli.js -d example.com

# 批量测试
node domain-test-cli.js --domain example.com --count 10
# 或
node domain-test-cli.js -d example.com -c 10

# 自定义测试间隔
node domain-test-cli.js --domain example.com --count 5 --interval 2000
# 或
node domain-test-cli.js -d example.com -c 5 -i 2000

# 自定义API地址
node domain-test-cli.js --domain example.com --api-url http://your-server:3000/api/test-domain
# 或
node domain-test-cli.js -d example.com -a http://your-server:3000/api/test-domain

# 查看帮助
node domain-test-cli.js --help
# 或
node domain-test-cli.js -h
```

### API 接口使用

```bash
# GET 请求
curl "http://localhost:3000/api/test-domain?domain=example.com"

# POST 请求
curl -X POST "http://localhost:3000/api/test-domain" \
  -H "Content-Type: application/json" \
  -d '{"domain": "example.com"}'

# 查看响应头
curl -I "http://localhost:3000/api/test-domain?domain=example.com"
```

## 🔍 多地Ping检测详解

### 检测原理
工具通过全球40+个地区的DNS服务器并发查询目标域名，分析：

1. **DNS解析结果**: 不同地区返回的IP地址
2. **响应时间**: 各地区DNS查询的响应速度
3. **IP一致性**: 检测是否使用CDN的地理分布
4. **健康状态**: DNS服务器的可用性

### DNS服务器来源
- **国际公共DNS**: Google DNS (8.8.8.8), Cloudflare DNS (1.1.1.1), Quad9 (9.9.9.9)
- **中国ISP DNS**: 阿里云DNS (223.5.5.5), 腾讯云DNS (119.29.29.29), 中国电信114DNS (114.114.114.114)
- **亚太地区**: 日本、韩国、新加坡、泰国、印尼、菲律宾、澳洲等
- **欧美地区**: 英国、法国、德国、荷兰、瑞典、俄罗斯、美国、加拿大等

### 智能排序机制
1. **成功的中国DNS服务器**（优先显示）
2. **成功的其他地区DNS服务器**
3. **失败的中国DNS服务器**
4. **失败的其他地区DNS服务器**（置底显示）

### 地理分布分析
- **全球覆盖**: 80%以上地区有响应
- **广泛覆盖**: 60-80%地区有响应
- **中等覆盖**: 40-60%地区有响应
- **有限覆盖**: 低于40%地区有响应

## 🔧 故障排除

### 常见问题

#### 1. 安装依赖失败
```bash
# 清除缓存重新安装
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Linux 下缺少编译工具
# Ubuntu/Debian
sudo apt install build-essential python3

# CentOS/RHEL
sudo yum groupinstall "Development Tools"
sudo yum install python3
```

#### 2. 端口占用
```bash
# 查看端口占用
# Linux/macOS
sudo lsof -i :3000
sudo netstat -tulpn | grep :3000

# Windows
netstat -ano | findstr :3000

# 结束进程
# Linux/macOS
sudo kill -9 <PID>

# Windows
taskkill /PID <PID> /F
```

#### 3. DNS解析失败
- 检查域名是否正确
- 检查网络连接
- 检查DNS服务器设置
- 检查防火墙是否阻止DNS查询

#### 4. 连接超时
- 检查目标服务器是否可访问
- 检查防火墙设置
- 增加超时时间配置
- 检查网络稳定性

#### 5. SSL证书错误
- 检查证书是否有效
- 检查系统时间是否正确
- 检查证书链是否完整
- 更新根证书库

#### 6. 权限问题
```bash
# Linux 下修改文件权限
sudo chown -R $USER:$USER /path/to/project
chmod -R 755 /path/to/project

# 创建专用用户运行服务
sudo useradd -r -s /bin/false domain-test
sudo chown -R domain-test:domain-test /var/www/domain-test
```

### 调试模式

```bash
# 查看详细日志
tail -f dev.log

# PM2 调试
pm2 logs domain-test
pm2 monit

# 系统服务调试
sudo journalctl -u domain-test -f

# Docker 调试
docker-compose logs -f domain-test

# 网络调试
curl -v "http://localhost:3000/api/test-domain?domain=example.com"
```

### 性能问题

#### 1. 检测速度慢
- 检查网络延迟
- 优化DNS服务器列表
- 调整并发查询数量
- 启用缓存机制

#### 2. 内存使用过高
```bash
# 查看内存使用
free -h
htop

# PM2 内存限制
pm2 start server.ts --max-memory-restart 500M

# 系统级别内存优化
echo 'vm.swappiness=10' >> /etc/sysctl.conf
sysctl -p
```

#### 3. CPU 使用率高
- 检查是否有死循环
- 优化算法复杂度
- 增加缓存机制
- 考虑负载均衡

## 📁 项目结构

```
website-performance-tester/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API 路由
│   │   │   ├── test-domain/          # 域名测试 API
│   │   │   ├── cdn-latency/          # CDN 延迟测试 API
│   │   │   └── health/               # 健康检查 API
│   │   ├── page.tsx                  # 主页面
│   │   ├── layout.tsx                # 布局组件
│   │   └── globals.css               # 全局样式
│   ├── components/                   # React 组件
│   │   └── ui/                       # shadcn/ui 组件
│   ├── hooks/                        # 自定义 hooks
│   └── lib/                          # 工具库
│       ├── utils.ts                  # 通用工具函数
│       ├── db.ts                     # 数据库配置
│       └── socket.ts                 # WebSocket 配置
├── prisma/
│   └── schema.prisma                 # 数据库模式
├── public/                           # 静态资源
├── examples/
│   └── websocket/                    # WebSocket 示例
├── domain-test-cli.js               # 命令行测试工具
├── server.ts                        # 服务器入口文件
├── next.config.ts                   # Next.js 配置
├── tailwind.config.ts              # Tailwind CSS 配置
├── tsconfig.json                    # TypeScript 配置
├── package.json                     # 项目依赖
├── README.md                       # 项目文档
├── 使用说明.md                      # 详细使用说明
└── CDN测试说明.md                    # CDN 测试说明
```

## 🔄 更新日志

### v2.3.0 (当前版本)
- ✅ 修复中国地区DNS服务器排序问题，确保优先显示
- ✅ 优化检测速度，实现并发处理和超时控制
- ✅ 替换失效的DNS服务器（澳门、雅加达、马尼拉、悉尼）
- ✅ 修复SSL证书域名范围排版问题，支持智能分组显示
- ✅ 增加完整的部署指南，支持Windows和Linux多平台部署
- ✅ 完善README文档，添加详细的故障排除和性能优化

### v2.2.0
- ✅ 重构工具名称为"网站性能检测工具"
- ✅ 完善连接类型检测逻辑，支持CDN、直连、代理、混合类型
- ✅ 增加15+主流CDN提供商识别
- ✅ 添加检测置信度评估
- ✅ 提供详细的分析结果和建议
- ✅ 更新命令行工具和文档

### v2.1.0
- ✅ 修复SSL证书获取问题
- ✅ 修复性能时间分析统计缺陷
- ✅ 完善时间测量逻辑（DNS、TCP、SSL、TTFB、下载）
- ✅ 更新README为中文版本

### v2.0.0
- ✅ 支持自定义域名测试
- ✅ 增加更多检测数据（DNS、TCP、SSL、TTFB等）
- ✅ 重新设计Web界面，增加8个分析面板
- ✅ 更新命令行工具，支持更多参数
- ✅ 修复CDN检测逻辑，提高准确性
- ✅ 增加SSL证书信息检测
- ✅ 增加性能评级功能

### v1.0.0
- ✅ 基础CDN检测功能
- ✅ Web界面测试
- ✅ 命令行工具
- ✅ API接口

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

### 贡献指南
1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 开发规范
- 遵循 TypeScript 严格模式
- 使用 ESLint 和 Prettier 格式化代码
- 编写清晰的注释和文档
- 确保所有测试通过

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 📞 支持

如果您在使用过程中遇到问题或有改进建议，请：

1. 查看[故障排除](#-故障排除)部分
2. 搜索现有的 [Issues](https://github.com/your-repo/issues)
3. 创建新的 Issue 描述问题
4. 联系维护团队

---

**免责声明**: 本工具仅供学习和测试使用，请勿用于非法用途。使用者需自行承担使用风险。

---

如有问题或建议，请随时反馈。这个工具旨在帮助开发者更好地理解和优化他们的网站性能、CDN配置和网络架构。