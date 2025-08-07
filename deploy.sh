#!/bin/bash

# ===========================================
# 网站性能检测工具 - 一键部署启动脚本
# ===========================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

print_header() {
    echo -e "${CYAN}"
    echo "=========================================="
    echo "  $1"
    echo "=========================================="
    echo -e "${NC}"
}

# 检测操作系统
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [[ -f /etc/debian_version ]] || [[ -f /etc/lsb-release ]] || grep -q "Debian" /etc/os-release 2>/dev/null; then
            OS="ubuntu"
        elif [[ -f /etc/redhat-release ]] || grep -q "CentOS\|Red Hat\|Fedora" /etc/os-release 2>/dev/null; then
            OS="centos"
        else
            OS="linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
        OS="windows"
    else
        OS="unknown"
    fi
    echo "$OS"
}

# 显示欢迎信息
show_welcome() {
    print_header "网站性能检测工具 - 一键部署脚本"
    
    echo -e "${GREEN}🚀 欢迎使用网站性能检测工具一键部署脚本！${NC}"
    echo
    echo -e "${CYAN}📋 支持的部署方式：${NC}"
    echo "   1. Ubuntu/Debian 自动部署"
    echo "   2. Docker 容器化部署"
    echo "   3. Windows 自动部署"
    echo "   4. 手动部署指南"
    echo
    echo -e "${YELLOW}💡 提示：脚本会自动检测您的操作系统并推荐最佳部署方式${NC}"
    echo
}

# 检查系统要求
check_requirements() {
    print_info "正在检查系统要求..."
    
    # 检查内存
    if [[ "$OS" == "linux" ]] || [[ "$OS" == "macos" ]]; then
        local total_memory=$(free -m | awk 'NR==2{printf "%.0f", $2}')
        if [[ $total_memory -lt 512 ]]; then
            print_warning "系统内存不足512MB，可能会影响性能"
        else
            print_success "内存检查通过 (${total_memory}MB)"
        fi
    fi
    
    # 检查磁盘空间
    if [[ "$OS" == "linux" ]] || [[ "$OS" == "macos" ]]; then
        local available_space=$(df . | awk 'NR==2{print $4}')
        if [[ $available_space -lt 1048576 ]]; then # 1GB in KB
            print_warning "可用磁盘空间不足1GB"
        else
            print_success "磁盘空间检查通过"
        fi
    fi
    
    print_success "系统要求检查完成"
}

# 显示部署选项
show_deployment_options() {
    echo -e "${CYAN}"
    echo "请选择部署方式："
    echo -e "${NC}"
    
    if [[ "$OS" == "ubuntu" ]]; then
        echo -e "${GREEN}1. Ubuntu/Debian 自动部署 (推荐)${NC}"
        echo "   - 自动安装所有依赖"
        echo "   - 配置系统服务"
        echo "   - 设置防火墙和安全"
        echo "   - 优化系统性能"
        echo
    fi
    
    echo -e "${GREEN}2. Docker 容器化部署 (跨平台)${NC}"
    echo "   - 环境隔离，易于迁移"
    echo "   - 一键启动和停止"
    echo "   - 自动扩容和负载均衡"
    echo "   - 适用于所有平台"
    echo
    
    if [[ "$OS" == "windows" ]]; then
        echo -e "${GREEN}3. Windows 自动部署${NC}"
        echo "   - 自动安装Node.js和依赖"
        echo "   - 配置Windows服务"
        echo "   - 设置防火墙规则"
        echo "   - 安装监控工具"
        echo
    fi
    
    echo -e "${YELLOW}4. 查看详细部署文档${NC}"
    echo "   - 完整的手动部署指南"
    echo "   - 故障排除和优化建议"
    echo "   - 生产环境最佳实践"
    echo
    
    echo -e "${RED}5. 退出${NC}"
    echo
}

# Ubuntu/Debian 部署
deploy_ubuntu() {
    print_header "Ubuntu/Debian 自动部署"
    
    # 检查是否为root用户
    if [[ $EUID -ne 0 ]]; then
        print_error "Ubuntu/Debian 部署需要root权限"
        print_info "请使用: sudo ./deploy.sh"
        read -p "按回车键继续..."
        return
    fi
    
    # 检查部署脚本是否存在
    if [[ ! -f "deploy-ubuntu.sh" ]]; then
        print_error "找不到部署脚本: deploy-ubuntu.sh"
        read -p "按回车键继续..."
        return
    fi
    
    print_info "即将开始Ubuntu/Debian自动部署..."
    print_warning "此过程将修改系统配置和安装软件包"
    
    read -p "确认继续? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "部署已取消"
        return
    fi
    
    # 执行部署脚本
    print_info "正在执行Ubuntu/Debian部署脚本..."
    bash ./deploy-ubuntu.sh
    
    print_success "Ubuntu/Debian 部署完成！"
    read -p "按回车键返回主菜单..."
}

# Docker 部署
deploy_docker() {
    print_header "Docker 容器化部署"
    
    # 检查Docker是否安装
    if ! command -v docker &> /dev/null; then
        print_error "Docker未安装"
        echo
        echo "请先安装Docker："
        echo "  - Ubuntu/Debian: curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh"
        echo "  - CentOS/RHEL: yum install -y docker-ce docker-ce-cli containerd.io"
        echo "  - macOS: 下载 Docker Desktop from https://www.docker.com/products/docker-desktop"
        echo "  - Windows: 下载 Docker Desktop from https://www.docker.com/products/docker-desktop"
        echo
        read -p "按回车键继续..."
        return
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose未安装"
        echo
        echo "请先安装Docker Compose："
        echo "  - 安装指南: https://docs.docker.com/compose/install/"
        echo
        read -p "按回车键继续..."
        return
    fi
    
    # 检查部署脚本是否存在
    if [[ ! -f "deploy-docker.sh" ]]; then
        print_error "找不到部署脚本: deploy-docker.sh"
        read -p "按回车键继续..."
        return
    fi
    
    print_info "即将开始Docker部署..."
    print_warning "此过程将下载Docker镜像并创建容器"
    
    read -p "确认继续? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "部署已取消"
        return
    fi
    
    # 执行部署脚本
    print_info "正在执行Docker部署脚本..."
    bash ./deploy-docker.sh
    
    print_success "Docker 部署完成！"
    read -p "按回车键返回主菜单..."
}

# Windows 部署
deploy_windows() {
    print_header "Windows 自动部署"
    
    if [[ "$OS" != "windows" ]]; then
        print_error "Windows 部署只能在 Windows 系统上运行"
        print_info "请在 Windows 系统上右键点击 deploy-windows.bat，选择'以管理员身份运行'"
        read -p "按回车键继续..."
        return
    fi
    
    print_info "Windows 部署指南："
    echo
    echo "1. 在 Windows 资源管理器中找到 deploy-windows.bat 文件"
    echo "2. 右键点击该文件"
    echo "3. 选择'以管理员身份运行'"
    echo "4. 按照提示完成部署"
    echo
    echo "或者您可以："
    echo "1. 双击 deploy-windows.bat 文件"
    echo "2. 如果提示权限问题，请以管理员身份运行"
    echo
    print_warning "Windows 部署需要管理员权限"
    
    read -p "按回车键继续..."
}

# 显示部署文档
show_documentation() {
    print_header "详细部署文档"
    
    echo -e "${CYAN}📖 完整部署文档：${NC}"
    echo
    echo "请查看 DEPLOYMENT.md 文件，包含以下内容："
    echo
    echo -e "${GREEN}🪟 Windows 部署${NC}"
    echo "   - 自动部署脚本使用方法"
    echo "   - 手动部署步骤"
    echo "   - Windows 服务配置"
    echo "   - IIS 反向代理配置"
    echo
    echo -e "${GREEN}🐧 Ubuntu/Debian 部署${NC}"
    echo "   - 自动部署脚本使用方法"
    echo "   - 手动部署步骤"
    echo "   - Systemd 服务配置"
    echo "   - Nginx 反向代理配置"
    echo
    echo -e "${GREEN}🐳 Docker 部署${NC}"
    echo "   - 自动部署脚本使用方法"
    echo "   - 手动部署步骤"
    echo "   - Docker Compose 配置"
    echo "   - 容器管理和监控"
    echo
    echo -e "${GREEN}🔧 部署后配置${NC}"
    echo "   - 环境变量配置"
    echo "   - 防火墙配置"
    echo "   - 反向代理配置"
    echo "   - SSL 证书配置"
    echo
    echo -e "${GREEN}🔍 监控和维护${NC}"
    echo "   - 服务管理命令"
    echo "   - 日志管理"
    echo "   - 性能监控"
    echo "   - 备份和恢复"
    echo
    echo -e "${GREEN}🚨 故障排除${NC}"
    echo "   - 常见问题解决"
    echo "   - 调试模式"
    echo "   - 性能问题排查"
    echo
    echo -e "${YELLOW}💡 提示：${NC}"
    echo "  - 使用文本编辑器打开 DEPLOYMENT.md 文件"
    echo "  - 或使用命令: cat DEPLOYMENT.md | less"
    echo "  - 或在浏览器中打开该文件"
    echo
    read -p "按回车键继续..."
}

# 显示系统信息
show_system_info() {
    print_header "系统信息"
    
    echo -e "${CYAN}操作系统:${NC} $OS"
    
    if [[ "$OS" == "linux" ]]; then
        if [[ -f /etc/os-release ]]; then
            source /etc/os-release
            echo -e "${CYAN}系统版本:${NC} $PRETTY_NAME"
        fi
    fi
    
    # 检查 Node.js
    if command -v node &> /dev/null; then
        local node_version=$(node --version)
        echo -e "${CYAN}Node.js:${NC} $node_version"
    else
        echo -e "${RED}Node.js:${NC} 未安装"
    fi
    
    # 检查 npm
    if command -v npm &> /dev/null; then
        local npm_version=$(npm --version)
        echo -e "${CYAN}npm:${NC} $npm_version"
    else
        echo -e "${RED}npm:${NC} 未安装"
    fi
    
    # 检查 Docker
    if command -v docker &> /dev/null; then
        local docker_version=$(docker --version)
        echo -e "${CYAN}Docker:${NC} $docker_version"
    else
        echo -e "${RED}Docker:${NC} 未安装"
    fi
    
    # 检查 Docker Compose
    if command -v docker-compose &> /dev/null; then
        local compose_version=$(docker-compose --version)
        echo -e "${CYAN}Docker Compose:${NC} $compose_version"
    elif docker compose version &> /dev/null; then
        local compose_version=$(docker compose version)
        echo -e "${CYAN}Docker Compose:${NC} $compose_version"
    else
        echo -e "${RED}Docker Compose:${NC} 未安装"
    fi
    
    # 检查 Git
    if command -v git &> /dev/null; then
        local git_version=$(git --version)
        echo -e "${CYAN}Git:${NC} $git_version"
    else
        echo -e "${RED}Git:${NC} 未安装"
    fi
    
    echo
    read -p "按回车键继续..."
}

# 主菜单
main_menu() {
    while true; do
        clear
        show_welcome
        
        show_system_info
        echo
        
        show_deployment_options
        
        read -p "请选择 (1-5): " choice
        
        case $choice in
            1)
                if [[ "$OS" == "ubuntu" ]]; then
                    deploy_ubuntu
                else
                    print_error "当前系统不支持 Ubuntu/Debian 自动部署"
                    read -p "按回车键继续..."
                fi
                ;;
            2)
                deploy_docker
                ;;
            3)
                if [[ "$OS" == "windows" ]]; then
                    deploy_windows
                else
                    print_error "当前系统不是 Windows，无法使用 Windows 部署"
                    read -p "按回车键继续..."
                fi
                ;;
            4)
                show_documentation
                ;;
            5)
                print_info "感谢使用网站性能检测工具一键部署脚本！"
                exit 0
                ;;
            *)
                print_error "无效选择，请重新输入"
                sleep 2
                ;;
        esac
    done
}

# 主函数
main() {
    # 检测操作系统
    OS=$(detect_os)
    
    # 检查系统要求
    check_requirements
    
    # 显示主菜单
    main_menu
}

# 运行主函数
main "$@"