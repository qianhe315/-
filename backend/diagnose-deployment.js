const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('=== 服务器部署诊断工具 ===\n');

// 1. 检查后端配置
console.log('1. 后端配置检查:');
console.log('   后端端口:', process.env.PORT || '3001');
console.log('   上传路径:', process.env.UPLOAD_PATH || './uploads');
console.log('   CORS配置:', process.env.CORS_ORIGIN || '未设置');
console.log('');

// 2. 检查上传目录
const uploadPath = process.env.UPLOAD_PATH || './uploads';
const absoluteUploadPath = path.resolve(__dirname, uploadPath);

console.log('2. 上传目录检查:');
console.log('   绝对路径:', absoluteUploadPath);

if (fs.existsSync(absoluteUploadPath)) {
  console.log('   ✓ 上传目录存在');
  
  try {
    const files = fs.readdirSync(absoluteUploadPath);
    console.log(`   ✓ 找到 ${files.length} 个文件`);
    
    if (files.length > 0) {
      console.log('   文件列表:');
      files.slice(0, 10).forEach(file => {
        const filePath = path.join(absoluteUploadPath, file);
        const stats = fs.statSync(filePath);
        console.log(`     - ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
      });
      
      if (files.length > 10) {
        console.log(`     ... 还有 ${files.length - 10} 个文件`);
      }
    }
  } catch (error) {
    console.log('   ✗ 读取目录失败:', error.message);
  }
} else {
  console.log('   ✗ 上传目录不存在');
  console.log('   建议创建目录: mkdir -p', absoluteUploadPath);
}
console.log('');

// 3. 检查前端构建配置
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
console.log('3. 前端构建检查:');
console.log('   构建目录:', frontendDistPath);

if (fs.existsSync(frontendDistPath)) {
  console.log('   ✓ 前端构建目录存在');
  
  const indexPath = path.join(frontendDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log('   ✓ index.html 存在');
    
    // 检查index.html中的API配置
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    console.log('\n   检查API配置:');
    if (indexContent.includes('/api')) {
      console.log('   ✓ 发现相对路径 /api');
      console.log('   ⚠ 生产环境需要配置API地址');
    }
    
    if (indexContent.includes('http://') || indexContent.includes('https://')) {
      console.log('   ✓ 发现绝对URL配置');
    }
  } else {
    console.log('   ✗ index.html 不存在');
  }
} else {
  console.log('   ✗ 前端构建目录不存在');
  console.log('   建议运行: cd ../frontend && npm run build');
}
console.log('');

// 4. 检查数据库中的图片路径
const mysql = require('mysql2/promise');

async function checkDatabaseImages() {
  console.log('4. 数据库图片路径检查:');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    console.log('   ✓ 数据库连接成功');
    
    // 检查轮播图
    try {
      const [carousels] = await connection.execute('SELECT id, image_url FROM carousels LIMIT 5');
      if (carousels.length > 0) {
        console.log(`   ✓ 找到 ${carousels.length} 个轮播图记录`);
        carousels.forEach(carousel => {
          console.log(`     - ID: ${carousel.id}, 图片路径: ${carousel.image_url}`);
        });
      } else {
        console.log('   ⚠ 没有找到轮播图记录');
      }
    } catch (error) {
      console.log('   ⚠ 查询轮播图失败:', error.message);
    }
    
    // 检查产品图片
    try {
      const [products] = await connection.execute('SELECT id, image_url FROM products LIMIT 5');
      if (products.length > 0) {
        console.log(`   ✓ 找到 ${products.length} 个产品记录`);
        products.forEach(product => {
          console.log(`     - ID: ${product.id}, 图片路径: ${product.image_url}`);
        });
      } else {
        console.log('   ⚠ 没有找到产品记录');
      }
    } catch (error) {
      console.log('   ⚠ 查询产品失败:', error.message);
    }
    
    await connection.end();
    
  } catch (error) {
    console.log('   ✗ 数据库连接失败:', error.message);
  }
  
  console.log('');
}

// 5. 提供解决方案
console.log('5. 部署解决方案:');
console.log('');
console.log('   问题分析:');
console.log('   - 开发环境: Vite代理 /api 和 /uploads 到 http://localhost:3001');
console.log('   - 生产环境: 前端构建后没有代理，需要配置API地址');
console.log('');
console.log('   解决方案:');
console.log('');
console.log('   方案A: 配置前端API地址');
console.log('   1. 在前端创建 .env.production 文件:');
console.log('      VITE_API_URL=http://your-server-ip:3001');
console.log('   2. 修改 api.js 使用环境变量:');
console.log('      baseURL: import.meta.env.VITE_API_URL + "/api"');
console.log('   3. 重新构建前端: npm run build');
console.log('');
console.log('   方案B: 配置Nginx反向代理');
console.log('   1. 配置Nginx代理 /api 到后端');
console.log('   2. 配置Nginx代理 /uploads 到后端');
console.log('   3. 示例配置见下文');
console.log('');
console.log('   方案C: 修改图片路径为完整URL');
console.log('   1. 确保数据库中的图片路径使用完整URL');
console.log('   2. 例如: http://your-server-ip:3001/uploads/image.jpg');
console.log('');
console.log('   Nginx配置示例:');
console.log('   location /api {');
console.log('       proxy_pass http://localhost:3001/api;');
console.log('       proxy_set_header Host $host;');
console.log('   }');
console.log('   location /uploads {');
console.log('       proxy_pass http://localhost:3001/uploads;');
console.log('       proxy_set_header Host $host;');
console.log('   }');
console.log('');

checkDatabaseImages().then(() => {
  console.log('=== 诊断完成 ===');
}).catch(console.error);
