# 快速部署指南

## 🚀 一键部署脚本

本项目提供了三个自动化部署脚本，支持在 Windows、Ubuntu/Debian 和 Docker 环境中快速部署。

### 📋 系统要求

- **内存**: 至少 512MB
- **存储**: 至少 1GB
- **网络**: 稳定的互联网连接
- **权限**: 管理员/root权限

---

## 🪟 Windows 部署

### 方法一：使用自动部署脚本（推荐）

```cmd
# 1. 右键点击 deploy-windows.bat，选择"以管理员身份运行"
# 2. 按照提示操作，脚本会自动完成所有部署步骤

# 或者手动运行
deploy-windows.bat
```

### 方法二：手动部署

```cmd
# 1. 安装 Node.js
# 下载地址：https://nodejs.org/zh-cn/download/

# 2. 安装项目依赖
npm install

# 3. 初始化数据库
npx prisma generate
npx prisma db push

# 4. 启动开发服务器
npm run dev

# 5. 访问 http://localhost:3000
```

### 方法三：Windows 服务部署

```cmd
# 1. 安装 PM2
npm install -g pm2

# 2. 安装 PM2 Windows 服务
pm2-service-install -n DomainTest

# 3. 启动应用
pm2 start server.ts --name "domain-test"
pm2 save
pm2 startup

# 4. 管理服务
pm2 status          # 查看状态
pm2 logs domain-test # 查看日志
pm2 restart domain-test # 重启服务
pm2 stop domain-test    # 停止服务
```

---

## 🐧 Ubuntu/Debian 部署

### 方法一：使用自动部署脚本（推荐）

```bash
# 1. 下载并运行部署脚本
chmod +x deploy-ubuntu.sh
sudo ./deploy-ubuntu.sh

# 2. 按照提示操作，脚本会自动完成所有部署步骤
```

### 方法二：手动部署

```bash
# 1. 更新系统
sudo apt update && sudo apt upgrade -y

# 2. 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. 安装项目依赖
npm install

# 4. 初始化数据库
npx prisma generate
npx prisma db push

# 5. 启动服务
npm run dev

# 6. 访问 http://localhost:3000
```

### 方法三：Systemd 服务部署

```bash
# 1. 创建应用用户
sudo useradd -r -s /bin/false domain-test

# 2. 创建应用目录
sudo mkdir -p /var/www/domain-test
sudo chown -R domain-test:domain-test /var/www/domain-test

# 3. 复制项目文件
sudo cp -r ./* /var/www/domain-test/
sudo chown -R domain-test:domain-test /var/www/domain-test

# 4. 安装依赖
cd /var/www/domain-test
sudo -u domain-test npm install
sudo -u domain-test npx prisma generate

# 5. 创建 systemd 服务
sudo nano /etc/systemd/system/domain-test.service
```

服务配置文件内容：
```ini
[Unit]
Description=Domain Test Application
After=network.target

[Service]
Type=simple
User=domain-test
WorkingDirectory=/var/www/domain-test
ExecStart=/usr/bin/node server.ts
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

```bash
# 6. 启动服务
sudo systemctl daemon-reload
sudo systemctl enable domain-test
sudo systemctl start domain-test

# 7. 查看状态
sudo systemctl status domain-test
```

---

## 🐳 Docker 部署（跨平台）

### 方法一：使用自动部署脚本（推荐）

```bash
# 1. 确保已安装 Docker 和 Docker Compose
# Docker 安装：https://docs.docker.com/get-docker/
# Docker Compose 安装：https://docs.docker.com/compose/install/

# 2. 运行部署脚本
chmod +x deploy-docker.sh
./deploy-docker.sh

# 3. 按照提示操作，脚本会自动完成所有部署步骤
```

### 方法二：手动部署

```bash
# 1. 构建镜像
docker build -t domain-test .

# 2. 运行容器
docker run -d \
  --name domain-test \
  -p 3000:3000 \
  -v $(pwd)/logs:/app/logs \
  -v $(pwd)/db:/app/db \
  --restart unless-stopped \
  domain-test

# 3. 查看状态
docker ps
docker logs domain-test

# 4. 访问 http://localhost:3000
```

### 方法三：使用 Docker Compose

```bash
# 1. 启动服务
docker-compose up -d

# 2. 查看状态
docker-compose ps

# 3. 查看日志
docker-compose logs -f

# 4. 停止服务
docker-compose down

# 5. 启用 Nginx 反向代理
docker-compose --profile nginx up -d
```

---

## 🔧 部署后配置

### 环境变量配置

创建 `.env` 文件：
```bash
# 应用配置
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# 数据库配置
DATABASE_URL="file:./db/dev.db"

# 日志配置
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# 安全配置
CORS_ORIGIN=http://localhost:3000,https://your-domain.com
```

### 防火墙配置

#### Ubuntu/Debian (UFW)
```bash
# 启用防火墙
sudo ufw enable

# 允许必要端口
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # 应用端口
```

#### Windows (防火墙)
```cmd
# 允许端口3000
netsh advfirewall firewall add rule name="Domain Test" dir=in action=allow protocol=TCP localport=3000
```

### 反向代理配置

#### Nginx 配置
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
}
```

#### IIS 配置 (Windows)
1. 安装 IIS 和 URL Rewrite 模块
2. 创建网站目录
3. 配置反向代理规则

---

## 🔍 监控和维护

### 服务管理

#### Systemd (Linux)
```bash
# 查看服务状态
sudo systemctl status domain-test

# 查看日志
sudo journalctl -u domain-test -f

# 重启服务
sudo systemctl restart domain-test

# 停止服务
sudo systemctl stop domain-test
```

#### PM2 (跨平台)
```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs domain-test

# 重启服务
pm2 restart domain-test

# 停止服务
pm2 stop domain-test

# 监控面板
pm2 monit
```

#### Docker
```bash
# 查看容器状态
docker ps

# 查看日志
docker logs -f domain-test

# 重启容器
docker restart domain-test

# 停止容器
docker stop domain-test
```

### 日志管理

```bash
# 查看应用日志
tail -f logs/app.log

# 日志轮转配置 (Linux)
sudo nano /etc/logrotate.d/domain-test
```

日志轮转配置：
```
/var/www/domain-test/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 domain-test domain-test
}
```

### 性能监控

```bash
# 系统资源监控
htop
glances

# 应用性能监控
pm2 monit
docker stats

# 网络监控
netstat -tulpn | grep :3000
ss -tulpn | grep :3000
```

---

## 🚨 故障排除

### 常见问题

#### 1. 端口占用
```bash
# Linux/macOS
sudo lsof -i :3000
sudo netstat -tulpn | grep :3000

# Windows
netstat -ano | findstr :3000

# 解决方案：修改端口或停止占用进程
```

#### 2. 权限问题
```bash
# Linux 文件权限
sudo chown -R $USER:$USER /path/to/project
chmod -R 755 /path/to/project

# Windows 权限
# 右键文件夹 -> 属性 -> 安全 -> 编辑权限
```

#### 3. 依赖安装失败
```bash
# 清除缓存重新安装
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Linux 缺少编译工具
# Ubuntu/Debian
sudo apt install build-essential python3

# CentOS/RHEL
sudo yum groupinstall "Development Tools"
```

#### 4. 服务启动失败
```bash
# 查看详细错误日志
sudo journalctl -u domain-test -n 50
pm2 logs domain-test --lines 50
docker logs domain-test --tail 50

# 检查配置文件
sudo nano /etc/systemd/system/domain-test.service
```

#### 5. 网络连接问题
```bash
# 测试网络连接
curl -I http://localhost:3000

# 检查防火墙状态
sudo ufw status
sudo firewall-cmd --list-all

# 检查端口监听
sudo netstat -tulpn | grep :3000
```

### 调试模式

```bash
# 启用调试日志
export LOG_LEVEL=debug
npm run dev

# 或修改 .env 文件
echo "LOG_LEVEL=debug" >> .env
```

---

## 📚 更新和维护

### 应用更新

```bash
# 1. 备份数据
cp -r db db.backup
cp -r logs logs.backup

# 2. 拉取最新代码
git pull origin main

# 3. 更新依赖
npm install

# 4. 重新构建
npm run build

# 5. 重启服务
sudo systemctl restart domain-test
```

### 系统更新

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# Windows
# 使用 Windows Update
```

### 数据备份

```bash
# 备份数据库
cp db/dev.db db/dev.db.backup.$(date +%Y%m%d)

# 备份日志
tar -czf logs.backup.$(date +%Y%m%d).tar.gz logs/

# 备份配置
cp .env .env.backup.$(date +%Y%m%d)
```

---

## 🎯 最佳实践

### 安全建议

1. **使用非root用户运行应用**
2. **配置防火墙规则**
3. **启用SSL证书**
4. **定期更新系统和依赖**
5. **监控日志文件**
6. **定期备份数据**

### 性能优化

1. **使用PM2集群模式**
2. **配置Nginx反向代理**
3. **启用Gzip压缩**
4. **配置静态文件缓存**
5. **监控资源使用情况**

### 生产环境建议

1. **使用域名访问**
2. **配置SSL证书**
3. **设置监控告警**
4. **配置日志轮转**
5. **定期备份策略**
6. **负载均衡（高并发场景）**

---

## 📞 技术支持

如果在部署过程中遇到问题：

1. **查看日志文件**：`logs/app.log`
2. **检查服务状态**：使用相应的管理命令
3. **查看系统资源**：`htop`、`glances`
4. **网络诊断**：`curl`、`telnet`
5. **查看文档**：`README.md`、`使用说明.md`

如有更多问题，请查看项目的故障排除部分或提交Issue。