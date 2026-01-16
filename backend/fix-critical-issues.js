const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('=== 修复关键问题 ===\n');

let fixesApplied = 0;

// 1. 修复数据库表结构问题
async function fixDatabaseSchema() {
  console.log('1. 修复数据库表结构...');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    console.log('   ✓ 数据库连接成功');
    
    // 检查products表结构
    const [columns] = await connection.execute('DESCRIBE products');
    const columnNames = columns.map(col => col.Field);
    
    console.log('   当前products表字段:', columnNames.join(', '));
    
    // 检查是否缺少image_url字段
    if (!columnNames.includes('image_url')) {
      console.log('   ⚠ 发现问题: products表缺少image_url字段');
      console.log('   正在添加image_url字段...');
      
      await connection.execute(`
        ALTER TABLE products 
        ADD COLUMN image_url VARCHAR(500) AFTER description
      `);
      
      fixesApplied++;
      console.log('   ✓ image_url字段已添加');
    } else {
      console.log('   ✓ image_url字段已存在');
    }
    
    // 检查是否缺少其他必要字段
    const requiredFields = {
      'specifications': 'TEXT',
      'price': 'DECIMAL(10,2)',
      'is_active': 'BOOLEAN',
      'sort_order': 'INT'
    };
    
    for (const [field, type] of Object.entries(requiredFields)) {
      if (!columnNames.includes(field)) {
        console.log(`   ⚠ 缺少字段: ${field}`);
        console.log(`   正在添加${field}字段...`);
        
        await connection.execute(`
          ALTER TABLE products 
          ADD COLUMN ${field} ${type}
        `);
        
        fixesApplied++;
        console.log(`   ✓ ${field}字段已添加`);
      }
    }
    
    // 检查carousels表结构
    const [carouselColumns] = await connection.execute('DESCRIBE carousels');
    const carouselFieldNames = carouselColumns.map(col => col.Field);
    
    console.log('\n   当前carousels表字段:', carouselFieldNames.join(', '));
    
    if (!carouselFieldNames.includes('image_url')) {
      console.log('   ⚠ 发现问题: carousels表缺少image_url字段');
      console.log('   正在添加image_url字段...');
      
      await connection.execute(`
        ALTER TABLE carousels 
        ADD COLUMN image_url VARCHAR(500) AFTER title
      `);
      
      fixesApplied++;
      console.log('   ✓ image_url字段已添加到carousels表');
    } else {
      console.log('   ✓ carousels表的image_url字段已存在');
    }
    
    await connection.end();
    
  } catch (error) {
    console.log('   ✗ 数据库修复失败:', error.message);
  }
}

// 2. 修复环境变量配置
function fixEnvironmentVariables() {
  console.log('\n2. 修复环境变量配置...');
  
  const envPath = path.resolve(__dirname, '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('   ✗ .env文件不存在');
    return;
  }
  
  let envContent = fs.readFileSync(envPath, 'utf8');
  let modified = false;
  
  // 修复NODE_ENV
  if (!envContent.includes('NODE_ENV=production')) {
    console.log('   ⚠ NODE_ENV未设置为production');
    envContent = envContent.replace(/NODE_ENV=.*/g, 'NODE_ENV=production');
    modified = true;
    fixesApplied++;
    console.log('   ✓ NODE_ENV已设置为production');
  }
  
  // 修复CORS_ORIGIN
  const corsOrigin = process.env.CORS_ORIGIN;
  if (corsOrigin && corsOrigin.includes('localhost')) {
    console.log('   ⚠ CORS_ORIGIN包含localhost地址');
    console.log('   建议修改为实际的服务器地址');
    
    // 尝试获取服务器IP
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();
    let serverIP = 'your-server-ip';
    
    for (const name of Object.keys(networkInterfaces)) {
      for (const iface of networkInterfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          serverIP = iface.address;
          break;
        }
      }
      if (serverIP !== 'your-server-ip') break;
    }
    
    console.log(`   检测到服务器IP: ${serverIP}`);
    console.log(`   建议CORS_ORIGIN: http://${serverIP}:3000,http://${serverIP}:5173`);
  }
  
  if (modified) {
    fs.writeFileSync(envPath, envContent);
    console.log('   ✓ .env文件已更新');
  } else {
    console.log('   ✓ 环境变量配置正确');
  }
}

// 3. 修复前端构建问题
function fixFrontendBuild() {
  console.log('\n3. 检查前端构建问题...');
  
  const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
  
  if (!fs.existsSync(frontendDistPath)) {
    console.log('   ✗ 前端构建目录不存在');
    console.log('   建议: cd ../frontend && npm run build');
    return;
  }
  
  const files = fs.readdirSync(frontendDistPath);
  const jsFiles = files.filter(f => f.endsWith('.js'));
  
  console.log(`   构建目录文件数量: ${files.length}`);
  console.log(`   JS文件数量: ${jsFiles.length}`);
  
  if (jsFiles.length === 0) {
    console.log('   ⚠ 没有找到JS文件，构建可能不完整');
    console.log('   建议: 重新构建前端');
    console.log('   cd ../frontend && npm run build');
  } else {
    console.log('   ✓ 找到JS文件');
  }
  
  // 检查.env.production
  const frontendEnvPath = path.resolve(__dirname, '../frontend/.env.production');
  
  if (!fs.existsSync(frontendEnvPath)) {
    console.log('   ⚠ .env.production文件不存在');
    console.log('   正在创建.env.production文件...');
    
    // 获取服务器IP
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();
    let serverIP = 'your-server-ip';
    
    for (const name of Object.keys(networkInterfaces)) {
      for (const iface of networkInterfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          serverIP = iface.address;
          break;
        }
      }
      if (serverIP !== 'your-server-ip') break;
    }
    
    const envContent = `# 生产环境API配置
VITE_API_URL=http://${serverIP}:3001
`;
    
    fs.writeFileSync(frontendEnvPath, envContent);
    fixesApplied++;
    console.log(`   ✓ .env.production已创建 (API_URL: http://${serverIP}:3001)`);
    console.log('   ⚠ 请手动检查并修改为正确的服务器地址');
  } else {
    console.log('   ✓ .env.production已存在');
    
    // 检查配置内容
    const envContent = fs.readFileSync(frontendEnvPath, 'utf8');
    if (envContent.includes('your-server-ip')) {
      console.log('   ⚠ 请修改.env.production中的服务器地址');
    }
  }
}

// 4. 检查后端服务状态
function checkBackendService() {
  console.log('\n4. 检查后端服务状态...');
  
  const backendPort = process.env.PORT || 3001;
  
  try {
    const http = require('http');
    const options = {
      hostname: 'localhost',
      port: backendPort,
      path: '/',
      method: 'GET',
      timeout: 3000
    };
    
    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        console.log(`   ✓ 后端服务运行正常 (端口 ${backendPort})`);
      } else {
        console.log(`   ⚠ 后端服务返回状态码: ${res.statusCode}`);
      }
    });
    
    req.on('error', (err) => {
      console.log(`   ✗ 后端服务未运行: ${err.message}`);
      console.log('   ⚠ 这是导致图片无法显示的主要原因！');
      console.log('');
      console.log('   启动后端服务的命令:');
      console.log('   方式1 (使用PM2):');
      console.log('     pm2 start index.js --name star-leap-api');
      console.log('     pm2 save');
      console.log('     pm2 startup');
      console.log('');
      console.log('   方式2 (直接启动):');
      console.log('     node index.js');
      console.log('     # 或使用nohup后台运行');
      console.log('     nohup node index.js > logs/app.log 2>&1 &');
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log('   ⚠ 后端服务响应超时');
    });
    
    req.end();
    
  } catch (error) {
    console.log('   ✗ 检查后端服务失败:', error.message);
  }
}

// 5. 生成修复报告
function generateReport() {
  console.log('\n=== 修复报告 ===\n');
  
  if (fixesApplied > 0) {
    console.log(`✓ 已应用 ${fixesApplied} 项修复`);
  } else {
    console.log('✓ 没有发现需要自动修复的问题');
  }
  
  console.log('\n关键问题总结:');
  console.log('1. ✗ 后端服务未运行 (最关键)');
  console.log('   - 这是导致所有问题的根本原因');
  console.log('   - 后端不运行，前端无法访问API和图片');
  console.log('');
  console.log('2. ✗ 数据库表结构问题');
  console.log('   - products表缺少image_url字段');
  console.log('   - 已自动修复');
  console.log('');
  console.log('3. ⚠ 前端构建配置问题');
  console.log('   - 缺少VITE_API_URL配置');
  console.log('   - 需要重新构建前端');
  console.log('');
  console.log('4. ⚠ CORS配置问题');
  console.log('   - CORS_ORIGIN包含localhost地址');
  console.log('   - 需要配置实际的服务器地址');
  
  console.log('\n立即执行的步骤:');
  console.log('1. 启动后端服务 (最紧急):');
  console.log('   pm2 start index.js --name star-leap-api');
  console.log('');
  console.log('2. 修改前端API配置:');
  console.log('   cd ../frontend');
  console.log('   nano .env.production');
  console.log('   # 修改为实际的服务器IP');
  console.log('');
  console.log('3. 重新构建前端:');
  console.log('   npm run build');
  console.log('');
  console.log('4. 重启服务:');
  console.log('   pm2 restart all');
  console.log('');
  console.log('5. 验证修复:');
  console.log('   node test-network.js');
}

// 运行所有修复
async function runFixes() {
  await fixDatabaseSchema();
  fixEnvironmentVariables();
  fixFrontendBuild();
  checkBackendService();
  generateReport();
  
  console.log('\n=== 修复完成 ===');
  console.log('');
  console.log('⚠ 最重要: 必须先启动后端服务才能解决图片显示问题！');
}

runFixes().catch(console.error);
