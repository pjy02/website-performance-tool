#!/bin/bash

# ===========================================
# 网站性能检测工具 - Ubuntu/Debian 自动部署脚本
# ===========================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# 检查是否为root用户
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "此脚本需要root权限运行"
        print_info "请使用: sudo ./deploy-ubuntu.sh"
        exit 1
    fi
}

# 检查系统版本
check_system() {
    if [[ ! -f /etc/os-release ]]; then
        print_error "无法检测系统版本"
        exit 1
    fi
    
    source /etc/os-release
    if [[ "$ID" != "ubuntu" && "$ID" != "debian" ]]; then
        print_error "此脚本仅支持 Ubuntu 和 Debian 系统"
        print_info "当前系统: $PRETTY_NAME"
        exit 1
    fi
    
    print_success "系统检测通过: $PRETTY_NAME"
}

# 更新系统
update_system() {
    print_info "正在更新系统包..."
    apt update
    apt upgrade -y
    print_success "系统更新完成"
}

# 安装Node.js
install_nodejs() {
    print_info "正在安装Node.js..."
    
    # 检查是否已安装Node.js
    if command -v node &> /dev/null; then
        local current_version=$(node -v | cut -d'v' -f2)
        print_info "检测到已安装的Node.js版本: $current_version"
        
        # 检查版本是否满足要求
        if [[ "$(printf '%s\n' "18.0.0" "$current_version" | sort -V | head -n1)" = "18.0.0" ]]; then
            print_success "Node.js版本满足要求，跳过安装"
            return
        else
            print_warning "Node.js版本过低，需要升级到18.0.0以上"
        fi
    fi
    
    # 使用NodeSource仓库安装Node.js 18
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    
    # 验证安装
    if command -v node &> /dev/null; then
        local node_version=$(node -v)
        local npm_version=$(npm -v)
        print_success "Node.js安装成功: $node_version"
        print_success "npm安装成功: $npm_version"
    else
        print_error "Node.js安装失败"
        exit 1
    fi
}

# 安装其他依赖
install_dependencies() {
    print_info "正在安装系统依赖..."
    
    # 安装基本工具
    apt install -y curl wget git build-essential python3
    
    # 安装dig命令（用于DNS查询）
    apt install -y dnsutils
    
    print_success "系统依赖安装完成"
}

# 创建应用用户
create_app_user() {
    print_info "正在创建应用用户..."
    
    # 创建专用用户（如果不存在）
    if ! id "domain-test" &>/dev/null; then
        useradd -r -s /bin/false domain-test
        print_success "用户 'domain-test' 创建成功"
    else
        print_info "用户 'domain-test' 已存在"
    fi
}

# 创建应用目录
setup_app_directory() {
    print_info "正在设置应用目录..."
    
    local app_dir="/var/www/domain-test"
    
    # 创建目录
    mkdir -p $app_dir
    mkdir -p $app_dir/logs
    mkdir -p $app_dir/db
    
    # 设置权限
    chown -R domain-test:domain-test $app_dir
    chmod -R 755 $app_dir
    
    print_success "应用目录设置完成: $app_dir"
}

# 复制项目文件
copy_project_files() {
    print_info "正在复制项目文件..."
    
    local app_dir="/var/www/domain-test"
    local current_dir=$(pwd)
    
    # 复制项目文件
    cp -r . $app_dir/
    
    # 设置权限
    chown -R domain-test:domain-test $app_dir
    chmod -R 755 $app_dir
    
    print_success "项目文件复制完成"
}

# 安装项目依赖
install_project_dependencies() {
    print_info "正在安装项目依赖..."
    
    local app_dir="/var/www/domain-test"
    
    # 切换到应用目录
    cd $app_dir
    
    # 使用应用用户安装依赖
    sudo -u domain-test npm install
    
    # 初始化数据库
    sudo -u domain-test npx prisma generate
    
    print_success "项目依赖安装完成"
}

# 创建环境配置文件
create_env_file() {
    print_info "正在创建环境配置文件..."
    
    local app_dir="/var/www/domain-test"
    local env_file="$app_dir/.env"
    
    cat > $env_file << EOF
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
EOF
    
    # 设置权限
    chown domain-test:domain-test $env_file
    chmod 600 $env_file
    
    print_success "环境配置文件创建完成: $env_file"
}

# 创建systemd服务
create_systemd_service() {
    print_info "正在创建systemd服务..."
    
    local service_file="/etc/systemd/system/domain-test.service"
    
    cat > $service_file << EOF
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
Environment=HOST=0.0.0.0

# 安全设置
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=/var/www/domain-test/logs /var/www/domain-test/db
ProtectHome=true
RemoveIPC=true

# 资源限制
LimitNOFILE=65536
MemoryMax=512M

[Install]
WantedBy=multi-user.target
EOF
    
    # 重新加载systemd
    systemctl daemon-reload
    
    print_success "systemd服务创建完成"
}

# 启动服务
start_service() {
    print_info "正在启动服务..."
    
    # 启用服务
    systemctl enable domain-test
    
    # 启动服务
    systemctl start domain-test
    
    # 等待服务启动
    sleep 3
    
    # 检查服务状态
    if systemctl is-active --quiet domain-test; then
        print_success "服务启动成功"
    else
        print_error "服务启动失败"
        systemctl status domain-test
        exit 1
    fi
}

# 配置防火墙
configure_firewall() {
    print_info "正在配置防火墙..."
    
    # 检查UFW是否可用
    if command -v ufw &> /dev/null; then
        # 启用UFW
        ufw --force enable
        
        # 允许SSH
        ufw allow 22/tcp
        
        # 允许HTTP
        ufw allow 80/tcp
        
        # 允许HTTPS
        ufw allow 443/tcp
        
        # 允许应用端口（3000）
        ufw allow 3000/tcp
        
        print_success "防火墙配置完成"
    else
        print_warning "UFW未安装，跳过防火墙配置"
    fi
}

# 系统优化
optimize_system() {
    print_info "正在优化系统配置..."
    
    # 增加文件描述符限制
    cat >> /etc/security/limits.conf << EOF
# Domain Test Application Limits
* soft nofile 65536
* hard nofile 65536
domain-test soft nofile 65536
domain-test hard nofile 65536
EOF
    
    # 优化网络参数
    cat >> /etc/sysctl.conf << EOF
# Network Optimization for Domain Test
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 16384 16777216
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_congestion_control = bbr
EOF
    
    # 应用系统配置
    sysctl -p
    
    print_success "系统优化完成"
}

# 安装监控工具
install_monitoring() {
    print_info "正在安装监控工具..."
    
    # 安装htop
    apt install -y htop
    
    # 安装PM2（可选）
    if ! command -v pm2 &> /dev/null; then
        npm install -g pm2
        print_success "PM2安装完成"
    fi
    
    print_success "监控工具安装完成"
}

# 显示部署结果
show_deployment_result() {
    print_success "=========================================="
    print_success "部署完成！"
    print_success "=========================================="
    
    echo -e "${GREEN}服务信息:${NC}"
    echo -e "  服务状态: $(systemctl is-active domain-test)"
    echo -e "  服务地址: http://localhost:3000"
    echo -e "  日志文件: /var/www/domain-test/logs"
    
    echo -e "\n${GREEN}管理命令:${NC}"
    echo -e "  查看状态: sudo systemctl status domain-test"
    echo -e "  查看日志: sudo journalctl -u domain-test -f"
    echo -e "  重启服务: sudo systemctl restart domain-test"
    echo -e "  停止服务: sudo systemctl stop domain-test"
    
    echo -e "\n${GREEN}应用目录:${NC}"
    echo -e "  应用路径: /var/www/domain-test"
    echo -e "  配置文件: /var/www/domain-test/.env"
    echo -e "  数据库文件: /var/www/domain-test/db"
    
    echo -e "\n${GREEN}故障排除:${NC}"
    echo -e "  查看详细日志: sudo tail -f /var/www/domain-test/logs/app.log"
    echo -e "  检查端口占用: sudo netstat -tulpn | grep :3000"
    echo -e "  重启服务: sudo systemctl restart domain-test"
    
    echo -e "\n${YELLOW}注意:${NC}"
    echo -e "  请确保防火墙已正确配置端口3000"
    echo -e "  建议配置域名和SSL证书用于生产环境"
    echo -e "  可以使用Nginx作为反向代理"
}

# 主函数
main() {
    echo -e "${BLUE}"
    echo "=========================================="
    echo "  网站性能检测工具 - Ubuntu/Debian 部署脚本"
    echo "=========================================="
    echo -e "${NC}"
    
    # 检查运行环境
    check_root
    check_system
    
    # 确认部署
    echo -e "${YELLOW}此脚本将部署网站性能检测工具到您的系统${NC}"
    echo -e "${YELLOW}部署过程将修改系统配置和安装软件包${NC}"
    read -p "是否继续? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "部署已取消"
        exit 0
    fi
    
    # 执行部署步骤
    update_system
    install_nodejs
    install_dependencies
    create_app_user
    setup_app_directory
    copy_project_files
    install_project_dependencies
    create_env_file
    create_systemd_service
    start_service
    configure_firewall
    optimize_system
    install_monitoring
    
    # 显示部署结果
    show_deployment_result
}

# 运行主函数
main "$@"