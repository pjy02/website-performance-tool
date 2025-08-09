#!/bin/bash

# 项目回退脚本
# 用于快速回退到备份快照状态

echo "=== 项目回退脚本 ==="
echo "正在检查当前状态..."

# 检查是否在git仓库中
if [ ! -d ".git" ]; then
    echo "错误: 当前目录不是git仓库"
    exit 1
fi

# 显示当前状态
echo "当前分支: $(git branch --show-current)"
echo "当前提交: $(git rev-parse --short HEAD)"

# 显示可用标签
echo ""
echo "可用备份标签:"
git tag | grep -E "(backup|snapshot)" | nl -v 1

# 询问用户选择
echo ""
echo "请选择回退方式:"
echo "1) 使用最新的备份快照标签"
echo "2) 使用 backup-working-state 标签"
echo "3) 使用 fae60f5 标签"
echo "4) 查看所有标签并手动选择"
echo "5) 退出"

read -p "请输入选择 (1-5): " choice

case $choice in
    1)
        # 获取最新的备份标签
        latest_tag=$(git tag | grep -E "(backup|snapshot)" | sort -V | tail -1)
        if [ -z "$latest_tag" ]; then
            echo "错误: 未找到备份标签"
            exit 1
        fi
        echo "将回退到标签: $latest_tag"
        git reset --hard "$latest_tag"
        ;;
    2)
        echo "将回退到 backup-working-state 标签"
        git reset --hard backup-working-state
        ;;
    3)
        echo "将回退到 fae60f5 标签"
        git reset --hard fae60f5
        ;;
    4)
        echo "所有可用标签:"
        git tag | nl -v 1
        read -p "请输入标签编号或直接输入标签名称: " tag_choice
        
        # 检查输入是否为数字
        if [[ "$tag_choice" =~ ^[0-9]+$ ]]; then
            # 如果是数字，获取对应标签
            selected_tag=$(git tag | sed -n "${tag_choice}p")
        else
            # 如果不是数字，直接使用作为标签名
            selected_tag=$tag_choice
        fi
        
        if [ -z "$selected_tag" ]; then
            echo "错误: 无效的选择"
            exit 1
        fi
        
        echo "将回退到标签: $selected_tag"
        git reset --hard "$selected_tag"
        ;;
    5)
        echo "退出脚本"
        exit 0
        ;;
    *)
        echo "错误: 无效选择"
        exit 1
        ;;
esac

# 清理构建文件
echo "清理构建文件..."
rm -rf .next 2>/dev/null || true

# 显示回退结果
echo ""
echo "=== 回退完成 ==="
echo "当前提交: $(git rev-parse --short HEAD)"
echo "当前分支: $(git branch --show-current)"
echo ""
echo "下一步操作:"
echo "1. 安装依赖: npm install"
echo "2. 启动项目: npm run dev"
echo "3. 访问: http://localhost:3000"
echo ""
echo "如果需要查看备份详情，请阅读 BACKUP-SNAPSHOT.md 文件"