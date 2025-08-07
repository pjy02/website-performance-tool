# 多阶段构建 - 构建阶段
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装系统依赖（用于Prisma）
RUN apk add --no-cache python3 make g++

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装项目依赖
RUN npm ci

# 复制项目文件
COPY . .

# 生成Prisma客户端
RUN npx prisma generate

# 构建应用
RUN npm run build

# 生产阶段
FROM node:18-alpine AS runner

# 设置工作目录
WORKDIR /app

# 创建非root用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制package.json和package-lock.json
COPY package*.json ./

# 从构建阶段复制构建结果
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/server.js ./

# 切换到非root用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# 启动应用
CMD ["node", "server.js"]