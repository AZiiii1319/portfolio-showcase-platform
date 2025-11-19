# Netlify 部署脚本 (PowerShell 版本)
# 用于自动化部署流程

param(
    [switch]$SkipTests,
    [switch]$SkipLint,
    [string]$Environment = "production"
)

# 设置错误处理
$ErrorActionPreference = "Stop"

Write-Host "🚀 开始 Netlify 部署流程..." -ForegroundColor Green

try {
    # 检查环境变量
    if (-not $env:VITE_SUPABASE_URL) {
        Write-Host "❌ 错误: VITE_SUPABASE_URL 环境变量未设置" -ForegroundColor Red
        exit 1
    }

    if (-not $env:VITE_SUPABASE_ANON_KEY) {
        Write-Host "❌ 错误: VITE_SUPABASE_ANON_KEY 环境变量未设置" -ForegroundColor Red
        exit 1
    }

    Write-Host "✅ 环境变量检查通过" -ForegroundColor Green

    # 检查 Node.js 和 npm
    $nodeVersion = node --version 2>$null
    $npmVersion = npm --version 2>$null
    
    if (-not $nodeVersion) {
        Write-Host "❌ 错误: Node.js 未安装或不在 PATH 中" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "📋 环境信息:" -ForegroundColor Cyan
    Write-Host "- Node.js 版本: $nodeVersion" -ForegroundColor Gray
    Write-Host "- npm 版本: $npmVersion" -ForegroundColor Gray
    Write-Host "- 部署环境: $Environment" -ForegroundColor Gray

    # 安装依赖
    Write-Host "📦 安装依赖..." -ForegroundColor Yellow
    npm ci
    if ($LASTEXITCODE -ne 0) {
        throw "依赖安装失败"
    }

    # 运行测试 (如果存在且未跳过)
    if (-not $SkipTests -and (Get-Content package.json | ConvertFrom-Json).scripts.test) {
        Write-Host "🧪 运行测试..." -ForegroundColor Yellow
        npm run test -- --run
        if ($LASTEXITCODE -ne 0) {
            throw "测试失败"
        }
    }

    # 运行 linting (如果存在且未跳过)
    if (-not $SkipLint -and (Get-Content package.json | ConvertFrom-Json).scripts.lint) {
        Write-Host "🔍 运行代码检查..." -ForegroundColor Yellow
        npm run lint
        if ($LASTEXITCODE -ne 0) {
            Write-Host "⚠️ 警告: 代码检查发现问题，但继续构建..." -ForegroundColor Yellow
        }
    }

    # 构建项目
    Write-Host "🏗️ 构建项目..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "构建失败"
    }

    # 检查构建输出
    if (-not (Test-Path "dist")) {
        throw "构建失败，dist 目录不存在"
    }

    Write-Host "✅ 构建成功" -ForegroundColor Green

    # 检查关键文件
    $criticalFiles = @("dist/index.html", "dist/assets")
    foreach ($file in $criticalFiles) {
        if (-not (Test-Path $file)) {
            Write-Host "⚠️ 警告: 关键文件 $file 不存在" -ForegroundColor Yellow
        }
    }

    # 显示构建统计
    $distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum
    $distSizeMB = [math]::Round($distSize / 1MB, 2)
    $fileCount = (Get-ChildItem -Path "dist" -Recurse -File).Count

    Write-Host "📊 构建统计:" -ForegroundColor Cyan
    Write-Host "- 构建目录大小: $distSizeMB MB" -ForegroundColor Gray
    Write-Host "- 文件数量: $fileCount" -ForegroundColor Gray
    Write-Host "- 构建时间: $(Get-Date)" -ForegroundColor Gray

    Write-Host "🎉 部署准备完成！" -ForegroundColor Green

} catch {
    Write-Host "❌ 部署失败: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}