#!/bin/bash

# Docker 管理脚本 - 开发环境

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函数定义
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    log_success "Docker 环境检查通过"
}

# 检查Docker服务是否运行
check_docker_running() {
    if ! docker info &> /dev/null; then
        log_error "Docker 服务未运行，请启动 Docker 服务"
        exit 1
    fi
    log_success "Docker 服务正在运行"
}

# 开发环境操作
dev_start() {
    log_info "启动开发环境..."
    docker-compose -f docker-compose.dev.yml up -d
    log_success "开发环境已启动"
    log_info "访问地址: http://localhost:3000"
}

dev_stop() {
    log_info "停止开发环境..."
    docker-compose -f docker-compose.dev.yml down
    log_success "开发环境已停止"
}

dev_restart() {
    log_info "重启开发环境..."
    docker-compose -f docker-compose.dev.yml restart
    log_success "开发环境已重启"
}

dev_logs() {
    log_info "查看开发环境日志..."
    docker-compose -f docker-compose.dev.yml logs -f
}

dev_status() {
    log_info "查看开发环境状态..."
    docker-compose -f docker-compose.dev.yml ps
}

# 生产环境操作
prod_start() {
    log_info "启动生产环境..."
    
    # 检查环境变量文件
    if [ ! -f .env.prod ]; then
        log_warning "环境变量文件 .env.prod 不存在，使用默认配置"
    fi
    
    docker-compose -f docker-compose.prod.yml up -d
    log_success "生产环境已启动"
    log_info "访问地址: http://localhost:3000"
}

prod_stop() {
    log_info "停止生产环境..."
    docker-compose -f docker-compose.prod.yml down
    log_success "生产环境已停止"
}

prod_restart() {
    log_info "重启生产环境..."
    docker-compose -f docker-compose.prod.yml restart
    log_success "生产环境已重启"
}

prod_logs() {
    log_info "查看生产环境日志..."
    docker-compose -f docker-compose.prod.yml logs -f
}

prod_status() {
    log_info "查看生产环境状态..."
    docker-compose -f docker-compose.prod.yml ps
}

# 构建镜像
build_image() {
    log_info "构建 Docker 镜像..."
    docker build -t website-performance-tool:latest .
    log_success "Docker 镜像构建完成"
}

# 清理资源
cleanup() {
    log_info "清理未使用的 Docker 资源..."
    docker system prune -f
    log_success "Docker 资源清理完成"
}

# 显示帮助信息
show_help() {
    echo "Docker 管理脚本"
    echo ""
    echo "用法: $0 [命令] [选项]"
    echo ""
    echo "命令:"
    echo "  dev [start|stop|restart|logs|status]  开发环境操作"
    echo "  prod [start|stop|restart|logs|status] 生产环境操作"
    echo "  build                                构建 Docker 镜像"
    echo "  cleanup                              清理 Docker 资源"
    echo "  check                                检查 Docker 环境"
    echo "  help                                 显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 dev start          # 启动开发环境"
    echo "  $0 prod start         # 启动生产环境"
    echo "  $0 dev logs          # 查看开发环境日志"
    echo "  $0 prod stop         # 停止生产环境"
    echo "  $0 build             # 构建镜像"
    echo "  $0 cleanup           # 清理资源"
}

# 主函数
main() {
    case "${1:-}" in
        "dev")
            case "${2:-}" in
                "start")
                    check_docker
                    check_docker_running
                    dev_start
                    ;;
                "stop")
                    check_docker
                    check_docker_running
                    dev_stop
                    ;;
                "restart")
                    check_docker
                    check_docker_running
                    dev_restart
                    ;;
                "logs")
                    check_docker
                    check_docker_running
                    dev_logs
                    ;;
                "status")
                    check_docker
                    check_docker_running
                    dev_status
                    ;;
                *)
                    log_error "未知的开发环境命令: ${2:-}"
                    show_help
                    exit 1
                    ;;
            esac
            ;;
        "prod")
            case "${2:-}" in
                "start")
                    check_docker
                    check_docker_running
                    prod_start
                    ;;
                "stop")
                    check_docker
                    check_docker_running
                    prod_stop
                    ;;
                "restart")
                    check_docker
                    check_docker_running
                    prod_restart
                    ;;
                "logs")
                    check_docker
                    check_docker_running
                    prod_logs
                    ;;
                "status")
                    check_docker
                    check_docker_running
                    prod_status
                    ;;
                *)
                    log_error "未知的生产环境命令: ${2:-}"
                    show_help
                    exit 1
                    ;;
            esac
            ;;
        "build")
            check_docker
            check_docker_running
            build_image
            ;;
        "cleanup")
            check_docker
            cleanup
            ;;
        "check")
            check_docker
            check_docker_running
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        "")
            log_error "请指定命令"
            show_help
            exit 1
            ;;
        *)
            log_error "未知的命令: $1"
            show_help
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"