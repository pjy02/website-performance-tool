# 🚀 网站性能检测工具 - Docker 部署指南

本项目提供完整的 Docker 部署方案，支持 GitHub Actions 自动构建和推送到 Docker Hub。

## 📋 项目信息

- **GitHub 仓库**: https://github.com/233bit/website-performance-tool
- **Docker Hub 镜像**: `docker.io/233bit/website-performance-tool`
- **支持平台**: linux/amd64, linux/arm64

## 🎯 部署流程

### 1. 配置 Docker Hub Secrets

在您的 GitHub 仓库中配置以下 Secrets：

1. **DOCKERHUB_USERNAME**: `233bit`
2. **DOCKERHUB_TOKEN**: 您的 Docker Hub Access Token

#### 获取 Docker Hub Access Token:
1. 登录 [Docker Hub](https://hub.docker.com/)
2. 点击右上角头像 → Account Settings
3. 左侧菜单选择 Security
4. 在 "Access Tokens" 部分点击 "New Access Token"
5. 输入描述（如：github-actions-token）
6. 点击 "Generate" 并复制生成的 Token

### 2. 推送代码自动构建

推送代码到 GitHub 仓库后，GitHub Actions 会自动：

- ✅ 构建 Docker 镜像
- ✅ 推送到 Docker Hub
- ✅ 支持多平台架构（linux/amd64, linux/arm64）
- ✅ 自动生成标签（latest, 版本号等）

### 3. 服务器部署

#### 快速部署
```bash
# 在 Ubuntu 服务器上
git clone https://github.com/233bit/website-performance-tool.git
cd website-performance-tool

# 启动生产环境
docker-compose -f docker-compose.prod.yml up -d

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f
```

#### 直接使用 Docker Hub 镜像
```bash
# 拉取镜像
docker pull 233bit/website-performance-tool:latest

# 运行容器
docker run -d \
  --name website-performance-tool \
  -p 3000:3000 \
  --restart unless-stopped \
  233bit/website-performance-tool:latest
```

## 📁 文件结构

```
website-performance-tool/
├── .github/
│   └── workflows/
│       └── docker-publish.yml        # GitHub Actions 工作流
├── Dockerfile                        # 生产环境 Dockerfile
├── Dockerfile.dev                    # 开发环境 Dockerfile
├── docker-compose.prod.yml           # 生产环境编排
├── docker-compose.dev.yml            # 开发环境编排
├── .env.prod                         # 环境变量模板
├── .dockerignore                     # Docker 构建排除
├── docker-manager.sh                 # Docker 管理脚本
└── README.md                         # 项目说明
```

## 🛠️ 使用方法

### 开发环境
```bash
# 启动开发环境
docker-compose -f docker-compose.dev.yml up -d

# 查看日志
docker-compose -f docker-compose.dev.yml logs -f

# 停止开发环境
docker-compose -f docker-compose.dev.yml down
```

### 生产环境
```bash
# 启动生产环境
docker-compose -f docker-compose.prod.yml up -d

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 停止生产环境
docker-compose -f docker-compose.prod.yml down

# 重启生产环境
docker-compose -f docker-compose.prod.yml restart
```

### 使用管理脚本
```bash
# 启动开发环境
./docker-manager.sh dev start

# 启动生产环境
./docker-manager.sh prod start

# 查看日志
./docker-manager.sh dev logs

# 停止服务
./docker-manager.sh prod stop

# 检查环境
./docker-manager.sh check
```

## 🔧 环境变量配置

### 生产环境 (.env.prod)
```bash
# Docker Hub 配置
DOCKERHUB_USERNAME=233bit
REPO_NAME=website-performance-tool
IMAGE_TAG=latest

# 应用配置
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
```

## 📊 监控和管理

### 查看容器状态
```bash
docker ps
docker-compose -f docker-compose.prod.yml ps
```

### 查看资源使用
```bash
docker stats
```

### 健康检查
```bash
# 检查容器健康状态
docker inspect --format='{{.State.Health.Status}}' website-performance-tool

# 手动健康检查
curl -f http://localhost:3000/ || echo "Health check failed"
```

### 日志管理
```bash
# 实时日志
docker-compose -f docker-compose.prod.yml logs -f

# 导出日志
docker-compose -f docker-compose.prod.yml logs > app.log

# 查看最近100行日志
docker-compose -f docker-compose.prod.yml logs --tail=100
```

## 🔄 自动更新

### 手动更新
```bash
# 拉取最新镜像
docker-compose -f docker-compose.prod.yml pull

# 重新构建并启动
docker-compose -f docker-compose.prod.yml up -d --force-recreate
```

### 自动更新脚本
```bash
#!/bin/bash
# update.sh
echo "更新应用..."
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d --force-recreate
echo "更新完成!"
```

## 🚨 故障排除

### 常见问题

#### 1. 镜像拉取失败
```bash
# 检查 Docker Hub 登录状态
docker login

# 手动拉取测试
docker pull 233bit/website-performance-tool:latest
```

#### 2. 端口冲突
```bash
# 检查端口占用
netstat -tulpn | grep :3000

# 修改端口映射
# 编辑 docker-compose.prod.yml 中的端口配置
```

#### 3. 容器启动失败
```bash
# 查看容器日志
docker logs website-performance-tool

# 检查容器状态
docker inspect website-performance-tool

# 进入容器调试
docker exec -it website-performance-tool sh
```

#### 4. 权限问题
```bash
# 检查 Docker 权限
docker info

# 添加用户到 docker 组
sudo usermod -aG docker $USER
# 需要重新登录生效
```

### 调试技巧
```bash
# 进入容器
docker exec -it website-performance-tool sh

# 查看详细信息
docker inspect website-performance-tool

# 查看资源使用
docker stats website-performance-tool

# 清理资源
docker system prune -a
```

## 🔒 安全建议

### 1. 容器安全
- 使用非 root 用户运行容器（已配置）
- 定期更新基础镜像
- 限制容器权限

### 2. 网络安全
```yaml
# 只允许本地访问
ports:
  - "127.0.0.1:3000:3000"

# 使用自定义网络
networks:
  app-network:
    driver: bridge
    internal: true
```

### 3. 资源限制
```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
    reservations:
      cpus: '0.25'
      memory: 256M
```

## 📈 性能优化

### 1. 构建优化
- 使用多阶段构建（已配置）
- 利用 Docker 构建缓存
- 优化镜像大小

### 2. 运行优化
- 设置适当的资源限制
- 使用健康检查（已配置）
- 配置自动重启（已配置）

### 3. 网络优化
- 使用自定义网络
- 优化 DNS 解析
- 配置负载均衡

## 🎯 最佳实践

### 1. 版本管理
- 使用语义化版本号
- 为重要版本创建 Git 标签
- 保持 latest 标签的稳定性

### 2. 监控
- 启用健康检查
- 监控资源使用
- 设置日志轮转

### 3. 备份
- 定期备份重要数据
- 备份 Docker 配置
- 保存重要版本

## 📞 支持

如果遇到问题，请：
1. 检查 GitHub Actions 构建日志
2. 查看 Docker 容器日志
3. 确认环境变量配置
4. 验证网络连接

**项目地址**: https://github.com/233bit/website-performance-tool

---

## 🚀 快速开始

```bash
# 1. 克隆项目
git clone https://github.com/233bit/website-performance-tool.git
cd website-performance-tool

# 2. 启动生产环境
docker-compose -f docker-compose.prod.yml up -d

# 3. 访问应用
# 浏览器打开: http://localhost:3000
```

**⭐ 如果这个项目对您有帮助，请给个 Star！**