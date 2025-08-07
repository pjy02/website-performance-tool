# 🚀 快速开始指南

网站性能检测工具 - 5分钟快速部署

## 📋 前置条件

- Docker 已安装
- Docker Compose 已安装
- 互联网连接

## 🎯 快速部署

### 方法一：使用 Docker Compose（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/233bit/website-performance-tool.git
cd website-performance-tool

# 2. 启动生产环境
docker-compose -f docker-compose.prod.yml up -d

# 3. 访问应用
# 浏览器打开: http://localhost:3000
```

### 方法二：直接运行 Docker 镜像

```bash
# 1. 拉取镜像
docker pull 233bit/website-performance-tool:latest

# 2. 运行容器
docker run -d \
  --name website-performance-tool \
  -p 3000:3000 \
  --restart unless-stopped \
  233bit/website-performance-tool:latest

# 3. 访问应用
# 浏览器打开: http://localhost:3000
```

## 🔧 管理命令

### 查看状态
```bash
# 查看容器状态
docker ps

# 查看应用状态
docker-compose -f docker-compose.prod.yml ps
```

### 查看日志
```bash
# 实时日志
docker-compose -f docker-compose.prod.yml logs -f

# 最近100行日志
docker-compose -f docker-compose.prod.yml logs --tail=100
```

### 停止应用
```bash
# 停止容器
docker-compose -f docker-compose.prod.yml down

# 或者
docker stop website-performance-tool
```

### 重启应用
```bash
# 重启容器
docker-compose -f docker-compose.prod.yml restart

# 或者
docker restart website-performance-tool
```

### 更新应用
```bash
# 拉取最新镜像
docker-compose -f docker-compose.prod.yml pull

# 重新构建并启动
docker-compose -f docker-compose.prod.yml up -d --force-recreate
```

## 🚨 故障排除

### 端口冲突
```bash
# 检查端口占用
netstat -tulpn | grep :3000

# 修改端口（编辑 docker-compose.prod.yml）
ports:
  - "8080:3000"  # 改为8080端口
```

### 容器启动失败
```bash
# 查看错误日志
docker logs website-performance-tool

# 重新启动
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### 网络问题
```bash
# 检查Docker网络
docker network ls

# 清理网络
docker network prune
```

## 🎉 完成！

恭喜！您已经成功部署了网站性能检测工具。

- **访问地址**: http://localhost:3000
- **功能**: 测试任意域名的性能、CDN、SSL证书等
- **管理**: 使用上述命令管理您的应用

## 📚 更多信息

- **完整文档**: [DOCKER-DEPLOYMENT.md](./DOCKER-DEPLOYMENT.md)
- **GitHub仓库**: https://github.com/233bit/website-performance-tool
- **Docker镜像**: 233bit/website-performance-tool

---

**⭐ 如果这个项目对您有帮助，请给个 Star！**