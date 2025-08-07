#!/bin/bash

# ===========================================
# 网站性能检测工具 - Docker 部署脚本
# ===========================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 打印带颜色的信息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Docker是否安装
check_docker() {
    print_info "正在检查Docker..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker未安装"
        print_info "请先安装Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose未安装"
        print_info "请先安装Docker Compose: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    print_success "Docker检查通过"
}

# 检查Docker服务是否运行
check_docker_service() {
    print_info "正在检查Docker服务..."
    
    if ! docker info &> /dev/null; then
        print_error "Docker服务未运行"
        print_info "请启动Docker服务"
        exit 1
    fi
    
    print_success "Docker服务运行正常"
}

# 创建Dockerfile
create_dockerfile() {
    print_info "正在创建Dockerfile..."
    
    cat > Dockerfile << 'EOF'
# 多阶段构建
FROM node:18-alpine AS builder

# 安装构建依赖
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产镜像
FROM node:18-alpine AS runner

# 安装必要的系统依赖
RUN apk add --no-cache \
    bind-tools \
    curl \
    bash

# 创建应用用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 设置工作目录
WORKDIR /app

# 复制构建产物
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/server.ts ./
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json

# 生成Prisma客户端
RUN npx prisma generate

# 创建必要的目录
RUN mkdir -p logs db && chown -R nextjs:nodejs logs db

# 切换到非root用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# 启动应用
CMD ["node", "server.ts"]
EOF

    print_success "Dockerfile创建完成"
}

# 创建docker-compose.yml
create_docker_compose() {
    print_info "正在创建docker-compose.yml..."
    
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  domain-test:
    build: 
      context: .
      dockerfile: Dockerfile
    container_name: domain-test
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - HOST=0.0.0.0
      - DATABASE_URL=file:./db/dev.db
      - LOG_LEVEL=info
      - LOG_FILE=./logs/app.log
    volumes:
      - ./logs:/app/logs
      - ./db:/app/db
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - domain-test-network

  # 可选：Nginx反向代理
  nginx:
    image: nginx:alpine
    container_name: domain-test-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - domain-test
    restart: unless-stopped
    networks:
      - domain-test-network
    profiles:
      - nginx

networks:
  domain-test-network:
    driver: bridge

volumes:
  domain-test-logs:
    driver: local
  domain-test-db:
    driver: local
EOF

    print_success "docker-compose.yml创建完成"
}

# 创建Nginx配置文件
create_nginx_config() {
    print_info "正在创建Nginx配置文件..."
    
    cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream domain-test {
        server domain-test:3000;
    }

    # HTTP服务器
    server {
        listen 80;
        server_name localhost;

        # 重定向到HTTPS（生产环境）
        # return 301 https://$server_name$request_uri;

        # 开发环境直接代理
        location / {
            proxy_pass http://domain-test;
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
            proxy_pass http://domain-test;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # 健康检查
        location /health {
            proxy_pass http://domain-test/api/health;
            access_log off;
        }
    }

    # HTTPS服务器（生产环境）
    # server {
    #     listen 443 ssl http2;
    #     server_name localhost;
    #     
    #     ssl_certificate /etc/nginx/ssl/cert.pem;
    #     ssl_certificate_key /etc/nginx/ssl/key.pem;
    #     
    #     ssl_protocols TLSv1.2 TLSv1.3;
    #     ssl_ciphers HIGH:!aNULL:!MD5;
    #     ssl_prefer_server_ciphers on;
    #     
    #     location / {
    #         proxy_pass http://domain-test;
    #         proxy_http_version 1.1;
    #         proxy_set_header Upgrade $http_upgrade;
    #         proxy_set_header Connection 'upgrade';
    #         proxy_set_header Host $host;
    #         proxy_set_header X-Real-IP $remote_addr;
    #         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    #         proxy_set_header X-Forwarded-Proto $scheme;
    #         proxy_cache_bypass $http_upgrade;
    #     }
    # }
}
EOF

    print_success "Nginx配置文件创建完成"
}

# 创建.dockerignore文件
create_dockerignore() {
    print_info "正在创建.dockerignore文件..."
    
    cat > .dockerignore << 'EOF'
# Dependencies
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Next.js build output
.next
out

# Environment variables
.env*.local
.env.development
.env.production

# Logs
*.log
logs/

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/
.idea
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Git
.git
.gitignore

# Docker
Dockerfile
docker-compose.yml
.dockerignore

# Documentation
README.md
*.md

# Scripts
*.sh
*.bat

# Test files
**/*.test.*
**/*.spec.*
test/
tests/
__tests__/

# Coverage reports
coverage/
.nyc_output/

# Temporary files
*.tmp
*.temp
EOF

    print_success ".dockerignore文件创建完成"
}

# 创建必要的目录
create_directories() {
    print_info "正在创建必要的目录..."
    
    mkdir -p logs
    mkdir -p db
    mkdir -p ssl
    
    print_success "目录创建完成"
}

# 构建和启动服务
build_and_start() {
    print_info "正在构建Docker镜像..."
    
    # 构建镜像
    docker-compose build --no-cache
    
    if [ $? -eq 0 ]; then
        print_success "Docker镜像构建成功"
    else
        print_error "Docker镜像构建失败"
        exit 1
    fi
    
    print_info "正在启动服务..."
    
    # 启动服务（不包含Nginx）
    docker-compose up -d domain-test
    
    if [ $? -eq 0 ]; then
        print_success "服务启动成功"
    else
        print_error "服务启动失败"
        exit 1
    fi
    
    # 等待服务启动
    print_info "等待服务启动..."
    sleep 10
    
    # 检查服务状态
    if docker-compose ps domain-test | grep -q "Up"; then
        print_success "服务运行正常"
    else
        print_error "服务启动失败"
        docker-compose logs domain-test
        exit 1
    fi
}

# 显示部署结果
show_deployment_result() {
    print_success "=========================================="
    print_success "Docker部署完成！"
    print_success "=========================================="
    
    echo -e "${GREEN}服务信息:${NC}"
    echo -e "  容器名称: domain-test"
    echo -e "  服务地址: http://localhost:3000"
    echo -e "  日志目录: $(pwd)/logs"
    echo -e "  数据库目录: $(pwd)/db"
    
    echo -e "\n${GREEN}管理命令:${NC}"
    echo -e "  查看状态: docker-compose ps"
    echo -e "  查看日志: docker-compose logs -f domain-test"
    echo -e "  重启服务: docker-compose restart domain-test"
    echo -e "  停止服务: docker-compose down"
    echo -e "  删除容器: docker-compose down -v"
    
    echo -e "\n${GREEN}启用Nginx反向代理:${NC}"
    echo -e "  启动Nginx: docker-compose --profile nginx up -d"
    echo -e "  查看Nginx日志: docker-compose logs -f nginx"
    
    echo -e "\n${GREEN}故障排除:${NC}"
    echo -e "  查看容器状态: docker ps -a"
    echo -e "  进入容器: docker exec -it domain-test sh"
    echo -e "  查看资源使用: docker stats domain-test"
    echo -e "  检查健康状态: docker inspect domain-test --format='{{.State.Health.Status}}'"
    
    echo -e "\n${YELLOW}注意:${NC}"
    echo -e "  确保端口3000未被占用"
    echo -e "  生产环境建议配置域名和SSL证书"
    echo -e "  可以使用docker-compose logs查看详细日志"
}

# 主函数
main() {
    echo -e "${BLUE}"
    echo "=========================================="
    echo "  网站性能检测工具 - Docker 部署脚本"
    echo "=========================================="
    echo -e "${NC}"
    
    # 检查运行环境
    check_docker
    check_docker_service
    
    # 确认部署
    echo -e "${YELLOW}此脚本将使用Docker部署网站性能检测工具${NC}"
    echo -e "${YELLOW}部署过程将创建Docker镜像和容器${NC}"
    read -p "是否继续? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "部署已取消"
        exit 0
    fi
    
    # 执行部署步骤
    create_dockerignore
    create_dockerfile
    create_docker_compose
    create_nginx_config
    create_directories
    build_and_start
    
    # 显示部署结果
    show_deployment_result
}

# 运行主函数
main "$@"