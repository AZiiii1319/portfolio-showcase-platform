#!/bin/bash

# Netlify 部署脚本
# 用于自动化部署流程

set -e  # 遇到错误时退出

echo "🚀 开始 Netlify 部署流程..."

# 检查环境变量
if [ -z "$VITE_SUPABASE_URL" ]; then
    echo "❌ 错误: VITE_SUPABASE_URL 环境变量未设置"
    exit 1
fi

if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ 错误: VITE_SUPABASE_ANON_KEY 环境变量未设置"
    exit 1
fi

echo "✅ 环境变量检查通过"

# 安装依赖
echo "📦 安装依赖..."
npm ci

# 运行测试 (如果存在)
if [ -f "package.json" ] && grep -q '"test"' package.json; then
    echo "🧪 运行测试..."
    npm run test -- --run
fi

# 运行 linting
if [ -f "package.json" ] && grep -q '"lint"' package.json; then
    echo "🔍 运行代码检查..."
    npm run lint
fi

# 构建项目
echo "🏗️ 构建项目..."
npm run build

# 检查构建输出
if [ ! -d "dist" ]; then
    echo "❌ 错误: 构建失败，dist 目录不存在"
    exit 1
fi

echo "✅ 构建成功"

# 检查关键文件
CRITICAL_FILES=("dist/index.html" "dist/assets")
for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -e "dist/$file" ] && [ ! -e "$file" ]; then
        echo "⚠️ 警告: 关键文件 $file 不存在"
    fi
done

# 显示构建统计
echo "📊 构建统计:"
echo "- 构建目录大小: $(du -sh dist | cut -f1)"
echo "- 文件数量: $(find dist -type f | wc -l)"

# 如果是 CI 环境，显示更多信息
if [ "$CI" = "true" ]; then
    echo "🔧 CI 环境信息:"
    echo "- Node.js 版本: $(node --version)"
    echo "- npm 版本: $(npm --version)"
    echo "- 构建时间: $(date)"
fi

echo "🎉 部署准备完成！"