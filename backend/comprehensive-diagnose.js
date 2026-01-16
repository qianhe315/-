const os = require('os');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config();

console.log('=== 全面环境诊断工具 ===\n');

// 1. 系统环境信息
console.log('1. 系统环境信息:');
console.log('   操作系统:', os.type(), os.release());
console.log('   平台:', os.platform());
console.log('   架构:', os.arch());
console.log('   主机名:', os.hostname());
console.log('   CPU核心数:', os.cpus().length);
console.log('   总内存:', (os.totalmem() / 1024 / 1024 / 1024).toFixed(2), 'GB');
console.log('   空闲内存:', (os.freemem() / 1024 / 1024 / 1024).toFixed(2), 'GB');
console.log('');

// 2. Node.js环境
console.log('2. Node.js环境:');
console.log('   Node版本:', process.version);
console.log('   npm版本:', execSync('npm -v').toString().trim());
console.log('   工作目录:', process.cwd());
console.log('   用户:', os.userInfo().username);
console.log('   用户主目录:', os.userInfo().homedir);
console.log('');

// 3. 环境变量检查
console.log('3. 环境变量检查:');
console.log('   NODE_ENV:', process.env.NODE_ENV || '未设置');
console.log('   PORT:', process.env.PORT || '未设置');
console.log('   DB_HOST:', process.env.DB_HOST || '未设置');
console.log('   DB_PORT:', process.env.DB_PORT || '未设置');
console.log('   DB_USER:', process.env.DB_USER || '未设置');
console.log('   DB_NAME:', process.env.DB_NAME || '未设置');
console.log('   DB_PASSWORD:', process.env.DB_PASSWORD ? '***已设置***' : '未设置');
console.log('   UPLOAD_PATH:', process.env.UPLOAD_PATH || '未设置');
console.log('   CORS_ORIGIN:', process.env.CORS_ORIGIN || '未设置');
console.log('');

// 4. 文件系统检查
console.log('4. 文件系统检查:');

const uploadPath = process.env.UPLOAD_PATH || './uploads';
const absoluteUploadPath = path.resolve(__dirname, uploadPath);

console.log('   上传目录:', absoluteUploadPath);

if (fs.existsSync(absoluteUploadPath)) {
  try {
    const stats = fs.statSync(absoluteUploadPath);
    console.log('   ✓ 目录存在');
    console.log('   权限:', stats.mode.toString(8));
    console.log('   所有者:', stats.uid);
    console.log('   组:', stats.gid);
    
    const files = fs.readdirSync(absoluteUploadPath);
    console.log(`   文件数量: ${files.length}`);
    
    if (files.length > 0) {
      console.log('   前5个文件:');
      files.slice(0, 5).forEach(file => {
        const filePath = path.join(absoluteUploadPath, file);
        const fileStats = fs.statSync(filePath);
        console.log(`     - ${file} (${(fileStats.size / 1024).toFixed(2)} KB, 权限: ${fileStats.mode.toString(8)})`);
      });
    }
  } catch (error) {
    console.log('   ✗ 读取目录失败:', error.message);
  }
} else {
  console.log('   ✗ 目录不存在');
}
console.log('');

// 5. 前端构建检查
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
console.log('5. 前端构建检查:');
console.log('   构建目录:', frontendDistPath);

if (fs.existsSync(frontendDistPath)) {
  console.log('   ✓ 构建目录存在');
  
  const indexPath = path.join(frontendDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log('   ✓ index.html 存在');
    
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // 检查API配置
    console.log('   API配置检查:');
    if (indexContent.includes('VITE_API_URL')) {
      console.log('   ✓ 发现 VITE_API_URL 配置');
    } else {
      console.log('   ⚠ 未发现 VITE_API_URL 配置');
    }
    
    if (indexContent.includes('/api')) {
      console.log('   ✓ 发现相对路径 /api');
    }
    
    // 检查JS文件
    const jsFiles = fs.readdirSync(frontendDistPath).filter(f => f.endsWith('.js'));
    console.log(`   JS文件数量: ${jsFiles.length}`);
    
    if (jsFiles.length > 0) {
      const mainJs = jsFiles[0];
      const mainJsPath = path.join(frontendDistPath, mainJs);
      const jsContent = fs.readFileSync(mainJsPath, 'utf8');
      
      console.log('   主JS文件检查:');
      if (jsContent.includes('baseURL')) {
        console.log('   ✓ 发现 baseURL 配置');
      }
      
      if (jsContent.includes('VITE_API_URL')) {
        console.log('   ✓ 发现 VITE_API_URL 引用');
      }
    }
  } else {
    console.log('   ✗ index.html 不存在');
  }
} else {
  console.log('   ✗ 构建目录不存在');
}
console.log('');

// 6. 网络连接检查
console.log('6. 网络连接检查:');

const backendPort = process.env.PORT || 3001;
console.log(`   后端端口: ${backendPort}`);

// 检查端口是否被占用
try {
  const net = require('net');
  const server = net.createServer();
  
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`   ⚠ 端口 ${backendPort} 已被占用`);
    } else {
      console.log('   ✓ 端口可用');
    }
  });
  
  server.once('listening', () => {
    console.log('   ✓ 端口可用');
    server.close();
  });
  
  server.listen(backendPort);
} catch (error) {
  console.log('   ✗ 端口检查失败:', error.message);
}

// 检查本地连接
try {
  const http = require('http');
  const options = {
    hostname: 'localhost',
    port: backendPort,
    path: '/',
    method: 'GET',
    timeout: 5000
  };
  
  const req = http.request(options, (res) => {
    console.log(`   ✓ 本地HTTP连接成功 (状态码: ${res.statusCode})`);
  });
  
  req.on('error', (err) => {
    console.log('   ✗ 本地HTTP连接失败:', err.message);
  });
  
  req.on('timeout', () => {
    req.destroy();
    console.log('   ⚠ 本地HTTP连接超时');
  });
  
  req.end();
} catch (error) {
  console.log('   ✗ 网络检查失败:', error.message);
}
console.log('');

// 7. 数据库连接检查
console.log('7. 数据库连接检查:');

const mysql = require('mysql2/promise');

async function checkDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectTimeout: 10000
    });
    
    console.log('   ✓ 数据库连接成功');
    
    // 检查表
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`   数据库表数量: ${tables.length}`);
    
    // 检查关键表
    const keyTables = ['Admins', 'carousels', 'products', 'categories'];
    keyTables.forEach(tableName => {
      const exists = tables.some(t => Object.values(t)[0] === tableName);
      console.log(`   ${exists ? '✓' : '✗'} 表 ${tableName} ${exists ? '存在' : '不存在'}`);
    });
    
    // 检查轮播图数据
    try {
      const [carousels] = await connection.execute('SELECT id, image_url FROM carousels LIMIT 3');
      if (carousels.length > 0) {
        console.log(`   ✓ 找到 ${carousels.length} 个轮播图`);
        carousels.forEach(c => {
          console.log(`     - ID: ${c.id}, 图片: ${c.image_url}`);
        });
      } else {
        console.log('   ⚠ 没有轮播图数据');
      }
    } catch (error) {
      console.log('   ⚠ 查询轮播图失败:', error.message);
    }
    
    // 检查产品数据
    try {
      const [products] = await connection.execute('SELECT id, image_url FROM products LIMIT 3');
      if (products.length > 0) {
        console.log(`   ✓ 找到 ${products.length} 个产品`);
        products.forEach(p => {
          console.log(`     - ID: ${p.id}, 图片: ${p.image_url}`);
        });
      } else {
        console.log('   ⚠ 没有产品数据');
      }
    } catch (error) {
      console.log('   ⚠ 查询产品失败:', error.message);
    }
    
    await connection.end();
    
  } catch (error) {
    console.log('   ✗ 数据库连接失败:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('   建议: 检查MySQL服务是否运行');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('   建议: 检查数据库用户名和密码');
    }
  }
}

// 8. 包版本检查
console.log('8. 关键包版本检查:');

const packageJson = require('./package.json');
const keyPackages = ['express', 'mysql2', 'sequelize', 'bcryptjs', 'multer', 'cors'];

keyPackages.forEach(pkg => {
  const version = packageJson.dependencies[pkg] || packageJson.devDependencies[pkg];
  if (version) {
    console.log(`   ${pkg}: ${version}`);
  } else {
    console.log(`   ${pkg}: 未安装`);
  }
});
console.log('');

// 9. 环境差异分析
console.log('9. 环境差异分析:');
console.log('   本地 vs 服务器常见差异:');
console.log('   - 操作系统: Windows vs Linux');
console.log('   - 文件路径: 反斜杠 vs 正斜杠');
console.log('   - 大小写敏感: 不敏感 vs 敏感');
console.log('   - 文件权限: 不严格 vs 严格');
console.log('   - 网络配置: localhost vs 公网IP');
console.log('   - 环境变量: 开发 vs 生产');
console.log('');

// 10. 建议检查项
console.log('10. 建议检查项:');
console.log('   [ ] 检查前端构建是否包含最新的API配置');
console.log('   [ ] 检查上传目录权限是否正确');
console.log('   [ ] 检查数据库中的图片路径格式');
console.log('   [ ] 检查Nginx配置（如果使用）');
console.log('   [ ] 检查防火墙规则');
console.log('   [ ] 检查浏览器控制台的网络请求');
console.log('   [ ] 检查后端日志文件');
console.log('');

checkDatabase().then(() => {
  console.log('=== 诊断完成 ===');
  console.log('');
  console.log('建议操作:');
  console.log('1. 将此脚本的输出与本地环境对比');
  console.log('2. 检查浏览器开发者工具的Network和Console标签');
  console.log('3. 检查后端日志文件查看错误信息');
  console.log('4. 确认前端构建文件是否正确上传');
}).catch(console.error);
