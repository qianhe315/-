const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config();

console.log('=== 环境自动修复工具 ===\n');

let fixesApplied = 0;

// 1. 检查并修复上传目录权限
function fixUploadPermissions() {
  console.log('1. 检查上传目录权限...');
  
  const uploadPath = process.env.UPLOAD_PATH || './uploads';
  const absoluteUploadPath = path.resolve(__dirname, uploadPath);
  
  if (!fs.existsSync(absoluteUploadPath)) {
    console.log('   创建上传目录...');
    fs.mkdirSync(absoluteUploadPath, { recursive: true });
    fixesApplied++;
  }
  
  try {
    // 尝试设置权限
    const stats = fs.statSync(absoluteUploadPath);
    const currentMode = stats.mode.toString(8);
    
    if (currentMode !== '755') {
      console.log('   修复目录权限...');
      fs.chmodSync(absoluteUploadPath, 0o755);
      fixesApplied++;
      console.log('   ✓ 权限已修复为 755');
    } else {
      console.log('   ✓ 权限正确');
    }
    
    // 检查文件权限
    const files = fs.readdirSync(absoluteUploadPath);
    files.forEach(file => {
      const filePath = path.join(absoluteUploadPath, file);
      const fileStats = fs.statSync(filePath);
      const fileMode = fileStats.mode.toString(8);
      
      if (fileMode !== '644') {
        fs.chmodSync(filePath, 0o644);
        fixesApplied++;
      }
    });
    
    console.log(`   ✓ 文件权限已检查 (${files.length} 个文件)`);
    
  } catch (error) {
    console.log('   ✗ 权限修复失败:', error.message);
    console.log('   建议: 手动运行以下命令:');
    console.log(`     chmod 755 ${absoluteUploadPath}`);
    console.log(`     chmod 644 ${absoluteUploadPath}/*`);
  }
}

// 2. 检查并创建前端环境配置
function fixFrontendEnv() {
  console.log('\n2. 检查前端环境配置...');
  
  const frontendEnvPath = path.resolve(__dirname, '../frontend/.env.production');
  
  if (!fs.existsSync(frontendEnvPath)) {
    console.log('   创建 .env.production 文件...');
    
    // 获取服务器IP
    let serverIP = 'localhost';
    try {
      const networkInterfaces = require('os').networkInterfaces();
      for (const name of Object.keys(networkInterfaces)) {
        for (const iface of networkInterfaces[name]) {
          if (iface.family === 'IPv4' && !iface.internal) {
            serverIP = iface.address;
            break;
          }
        }
        if (serverIP !== 'localhost') break;
      }
    } catch (error) {
      console.log('   ⚠ 无法自动获取服务器IP');
    }
    
    const envContent = `# 生产环境API配置
# 请将以下URL替换为您的服务器地址
VITE_API_URL=http://${serverIP}:3001
`;
    
    fs.writeFileSync(frontendEnvPath, envContent);
    fixesApplied++;
    console.log(`   ✓ .env.production 已创建 (API_URL: http://${serverIP}:3001)`);
    console.log('   ⚠ 请手动检查并修改为正确的服务器地址');
  } else {
    console.log('   ✓ .env.production 已存在');
    
    // 检查配置内容
    const envContent = fs.readFileSync(frontendEnvPath, 'utf8');
    if (envContent.includes('your-server-ip')) {
      console.log('   ⚠ 请修改 .env.production 中的服务器地址');
    }
  }
}

// 3. 检查并修复后端CORS配置
function fixBackendCORS() {
  console.log('\n3. 检查后端CORS配置...');
  
  const corsOrigin = process.env.CORS_ORIGIN;
  
  if (!corsOrigin) {
    console.log('   ⚠ CORS_ORIGIN 未设置');
    console.log('   建议在 .env 文件中添加:');
    console.log('   CORS_ORIGIN=http://localhost:3000,http://your-server-ip');
    
    // 尝试自动修复
    const envPath = path.resolve(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      try {
        let envContent = fs.readFileSync(envPath, 'utf8');
        
        if (!envContent.includes('CORS_ORIGIN')) {
          envContent += `\n# CORS Configuration\nCORS_ORIGIN=http://localhost:3000,http://localhost:5173\n`;
          fs.writeFileSync(envPath, envContent);
          fixesApplied++;
          console.log('   ✓ CORS_ORIGIN 已添加到 .env 文件');
        }
      } catch (error) {
        console.log('   ✗ 自动修复失败:', error.message);
      }
    }
  } else {
    console.log('   ✓ CORS_ORIGIN 已配置:', corsOrigin);
  }
}

// 4. 检查前端构建状态
function checkFrontendBuild() {
  console.log('\n4. 检查前端构建状态...');
  
  const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
  
  if (!fs.existsSync(frontendDistPath)) {
    console.log('   ✗ 前端构建目录不存在');
    console.log('   建议: 运行以下命令构建前端');
    console.log('   cd ../frontend && npm run build');
    return;
  }
  
  const indexPath = path.join(frontendDistPath, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.log('   ✗ index.html 不存在');
    console.log('   建议: 重新构建前端');
    return;
  }
  
  console.log('   ✓ 前端构建目录存在');
  
  // 检查构建时间
  const stats = fs.statSync(indexPath);
  const buildTime = new Date(stats.mtime);
  const now = new Date();
  const daysSinceBuild = Math.floor((now - buildTime) / (1000 * 60 * 60 * 24));
  
  console.log(`   构建时间: ${buildTime.toLocaleString()}`);
  
  if (daysSinceBuild > 7) {
    console.log(`   ⚠ 构建时间较旧 (${daysSinceBuild} 天前)`);
    console.log('   建议: 重新构建前端');
  } else {
    console.log('   ✓ 构建时间正常');
  }
}

// 5. 检查数据库连接
async function checkDatabaseConnection() {
  console.log('\n5. 检查数据库连接...');
  
  const mysql = require('mysql2/promise');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectTimeout: 5000
    });
    
    console.log('   ✓ 数据库连接成功');
    
    // 检查关键表
    const [tables] = await connection.execute('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    const requiredTables = ['Admins', 'carousels', 'products', 'categories'];
    requiredTables.forEach(tableName => {
      if (tableNames.includes(tableName)) {
        console.log(`   ✓ 表 ${tableName} 存在`);
      } else {
        console.log(`   ✗ 表 ${tableName} 不存在`);
        console.log('   建议: 运行数据库初始化脚本');
        console.log('   node init-database.js');
      }
    });
    
    // 检查数据
    try {
      const [carousels] = await connection.execute('SELECT COUNT(*) as count FROM carousels');
      const [products] = await connection.execute('SELECT COUNT(*) as count FROM products');
      
      console.log(`   轮播图数量: ${carousels[0].count}`);
      console.log(`   产品数量: ${products[0].count}`);
      
      if (carousels[0].count === 0) {
        console.log('   ⚠ 没有轮播图数据');
      }
      
      if (products[0].count === 0) {
        console.log('   ⚠ 没有产品数据');
      }
      
    } catch (error) {
      console.log('   ⚠ 查询数据失败:', error.message);
    }
    
    await connection.end();
    
  } catch (error) {
    console.log('   ✗ 数据库连接失败:', error.message);
    console.log('   建议: 检查数据库配置和服务状态');
    console.log('   node diagnose-db.js');
  }
}

// 6. 检查后端服务状态
function checkBackendService() {
  console.log('\n6. 检查后端服务状态...');
  
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
      console.log('   建议: 启动后端服务');
      console.log('   pm2 start index.js --name star-leap-api');
      console.log('   或: node index.js');
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

// 7. 生成修复报告
function generateReport() {
  console.log('\n=== 修复报告 ===\n');
  
  if (fixesApplied > 0) {
    console.log(`✓ 已应用 ${fixesApplied} 项自动修复`);
  } else {
    console.log('✓ 没有发现需要自动修复的问题');
  }
  
  console.log('\n建议后续操作:');
  console.log('1. 检查并修改 frontend/.env.production 中的服务器地址');
  console.log('2. 重新构建前端: cd ../frontend && npm run build');
  console.log('3. 重启后端服务: pm2 restart all');
  console.log('4. 运行网络测试: node test-network.js');
  console.log('5. 检查浏览器开发者工具查看详细错误');
  
  console.log('\n如果问题仍然存在，请运行:');
  console.log('  node comprehensive-diagnose.js  # 全面诊断');
  console.log('  node test-network.js            # 网络测试');
}

// 运行所有检查和修复
async function runAutoFix() {
  fixUploadPermissions();
  fixFrontendEnv();
  fixBackendCORS();
  checkFrontendBuild();
  await checkDatabaseConnection();
  checkBackendService();
  generateReport();
  
  console.log('\n=== 自动修复完成 ===');
}

runAutoFix().catch(console.error);
