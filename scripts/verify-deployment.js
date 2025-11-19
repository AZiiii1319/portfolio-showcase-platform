#!/usr/bin/env node

// Deployment configuration verification script
import fs from 'fs';
import path from 'path';

console.log('🔍 验证 Netlify 部署配置...\n');

const checks = [];

// Check netlify.toml exists and has required sections
function checkNetlifyToml() {
  const netlifyTomlPath = 'netlify.toml';
  
  if (!fs.existsSync(netlifyTomlPath)) {
    checks.push({ name: 'netlify.toml 文件', status: 'error', message: '文件不存在' });
    return;
  }

  const content = fs.readFileSync(netlifyTomlPath, 'utf8');
  
  const requiredSections = [
    '[build]',
    '[[redirects]]',
    '[[headers]]',
    'command = "npm run build"',
    'publish = "dist"'
  ];

  const missingSections = requiredSections.filter(section => !content.includes(section));
  
  if (missingSections.length === 0) {
    checks.push({ name: 'netlify.toml 配置', status: 'success', message: '所有必需配置已存在' });
  } else {
    checks.push({ 
      name: 'netlify.toml 配置', 
      status: 'warning', 
      message: `缺少配置: ${missingSections.join(', ')}` 
    });
  }
}

// Check _redirects file
function checkRedirectsFile() {
  const redirectsPath = 'public/_redirects';
  
  if (fs.existsSync(redirectsPath)) {
    checks.push({ name: '_redirects 文件', status: 'success', message: '备用重定向文件已存在' });
  } else {
    checks.push({ name: '_redirects 文件', status: 'info', message: '可选文件不存在（使用 netlify.toml 配置）' });
  }
}

// Check Netlify Functions
function checkNetlifyFunctions() {
  const functionsDir = 'netlify/functions';
  
  if (!fs.existsSync(functionsDir)) {
    checks.push({ name: 'Netlify Functions', status: 'warning', message: '函数目录不存在' });
    return;
  }

  const functionFiles = fs.readdirSync(functionsDir).filter(file => 
    file.endsWith('.ts') || file.endsWith('.js')
  );

  if (functionFiles.length > 0) {
    checks.push({ 
      name: 'Netlify Functions', 
      status: 'success', 
      message: `找到 ${functionFiles.length} 个函数: ${functionFiles.join(', ')}` 
    });
  } else {
    checks.push({ name: 'Netlify Functions', status: 'info', message: '没有函数文件' });
  }
}

// Check environment variables template
function checkEnvExample() {
  const envExamplePath = '.env.example';
  
  if (!fs.existsSync(envExamplePath)) {
    checks.push({ name: '环境变量模板', status: 'error', message: '.env.example 文件不存在' });
    return;
  }

  const content = fs.readFileSync(envExamplePath, 'utf8');
  const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_APP_NAME'];
  const missingVars = requiredVars.filter(varName => !content.includes(varName));

  if (missingVars.length === 0) {
    checks.push({ name: '环境变量模板', status: 'success', message: '所有必需变量已定义' });
  } else {
    checks.push({ 
      name: '环境变量模板', 
      status: 'error', 
      message: `缺少变量: ${missingVars.join(', ')}` 
    });
  }
}

// Check package.json build script
function checkPackageJson() {
  const packageJsonPath = 'package.json';
  
  if (!fs.existsSync(packageJsonPath)) {
    checks.push({ name: 'package.json', status: 'error', message: '文件不存在' });
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (packageJson.scripts && packageJson.scripts.build) {
    checks.push({ name: '构建脚本', status: 'success', message: `构建命令: ${packageJson.scripts.build}` });
  } else {
    checks.push({ name: '构建脚本', status: 'error', message: '缺少 build 脚本' });
  }

  // Check for Netlify Functions types
  const hasNetlifyTypes = packageJson.devDependencies && packageJson.devDependencies['@netlify/functions'];
  if (hasNetlifyTypes) {
    checks.push({ name: 'Netlify 类型定义', status: 'success', message: '@netlify/functions 已安装' });
  } else {
    checks.push({ name: 'Netlify 类型定义', status: 'warning', message: '建议安装 @netlify/functions' });
  }
}

// Check deployment scripts
function checkDeploymentScripts() {
  const scripts = ['scripts/deploy.sh', 'scripts/deploy.ps1'];
  const existingScripts = scripts.filter(script => fs.existsSync(script));

  if (existingScripts.length > 0) {
    checks.push({ 
      name: '部署脚本', 
      status: 'success', 
      message: `找到脚本: ${existingScripts.join(', ')}` 
    });
  } else {
    checks.push({ name: '部署脚本', status: 'info', message: '没有自定义部署脚本' });
  }
}

// Check deployment documentation
function checkDocumentation() {
  const docFiles = ['DEPLOYMENT.md', 'README.md'];
  const existingDocs = docFiles.filter(doc => fs.existsSync(doc));

  if (existingDocs.includes('DEPLOYMENT.md')) {
    checks.push({ name: '部署文档', status: 'success', message: 'DEPLOYMENT.md 已存在' });
  } else {
    checks.push({ name: '部署文档', status: 'warning', message: '建议创建 DEPLOYMENT.md' });
  }
}

// Run all checks
checkNetlifyToml();
checkRedirectsFile();
checkNetlifyFunctions();
checkEnvExample();
checkPackageJson();
checkDeploymentScripts();
checkDocumentation();

// Display results
console.log('检查结果:\n');

const statusIcons = {
  success: '✅',
  warning: '⚠️',
  error: '❌',
  info: 'ℹ️'
};

const statusColors = {
  success: '\x1b[32m', // Green
  warning: '\x1b[33m', // Yellow
  error: '\x1b[31m',   // Red
  info: '\x1b[36m',    // Cyan
  reset: '\x1b[0m'     // Reset
};

checks.forEach(check => {
  const icon = statusIcons[check.status];
  const color = statusColors[check.status];
  const reset = statusColors.reset;
  
  console.log(`${icon} ${color}${check.name}${reset}: ${check.message}`);
});

// Summary
const successCount = checks.filter(c => c.status === 'success').length;
const warningCount = checks.filter(c => c.status === 'warning').length;
const errorCount = checks.filter(c => c.status === 'error').length;

console.log('\n📊 总结:');
console.log(`- 成功: ${successCount}`);
console.log(`- 警告: ${warningCount}`);
console.log(`- 错误: ${errorCount}`);

if (errorCount > 0) {
  console.log('\n❌ 存在错误，请修复后再部署');
  process.exit(1);
} else if (warningCount > 0) {
  console.log('\n⚠️ 存在警告，建议修复以获得最佳体验');
} else {
  console.log('\n🎉 所有检查通过，可以开始部署！');
}

console.log('\n📝 下一步:');
console.log('1. 在 Netlify 控制台中设置环境变量');
console.log('2. 连接 Git 仓库或手动上传构建文件');
console.log('3. 配置自定义域名（可选）');
console.log('4. 测试部署结果');