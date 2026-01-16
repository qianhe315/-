const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('=== 网络连接测试工具 ===\n');

// 1. 测试本地后端服务
console.log('1. 测试本地后端服务:');

const backendPort = process.env.PORT || 3001;
const backendHost = process.env.DB_HOST === 'localhost' ? 'localhost' : '0.0.0.0';

function testLocalConnection() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: backendPort,
      path: '/',
      method: 'GET',
      timeout: 5000
    };
    
    console.log(`   测试连接: http://localhost:${backendPort}/`);
    
    const req = http.request(options, (res) => {
      console.log(`   ✓ 本地连接成功 (状态码: ${res.statusCode})`);
      console.log(`   响应头:`, JSON.stringify(res.headers, null, 2));
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log(`   ✗ 本地连接失败: ${err.message}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log('   ⚠ 本地连接超时');
      resolve(false);
    });
    
    req.end();
  });
}

// 2. 测试API端点
async function testAPIEndpoints() {
  console.log('\n2. 测试API端点:');
  
  const endpoints = [
    { path: '/api', description: '根API' },
    { path: '/api/categories', description: '分类API' },
    { path: '/api/products', description: '产品API' },
    { path: '/api/carousels', description: '轮播图API' },
    { path: '/api/clients', description: '客户API' }
  ];
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint.path, endpoint.description);
  }
}

function testEndpoint(path, description) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: backendPort,
      path: path,
      method: 'GET',
      timeout: 5000,
      headers: {
        'Accept': 'application/json'
      }
    };
    
    console.log(`   测试 ${description}: ${path}`);
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`   ✓ ${description} 成功 (状态码: ${res.statusCode})`);
          try {
            const jsonData = JSON.parse(data);
            if (Array.isArray(jsonData)) {
              console.log(`     返回数据数量: ${jsonData.length}`);
            }
          } catch (e) {
            // 不是JSON数据
          }
        } else {
          console.log(`   ⚠ ${description} 返回状态码: ${res.statusCode}`);
        }
        resolve();
      });
    });
    
    req.on('error', (err) => {
      console.log(`   ✗ ${description} 失败: ${err.message}`);
      resolve();
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log(`   ⚠ ${description} 超时`);
      resolve();
    });
    
    req.end();
  });
}

// 3. 测试图片访问
async function testImageAccess() {
  console.log('\n3. 测试图片访问:');
  
  const uploadPath = process.env.UPLOAD_PATH || './uploads';
  const absoluteUploadPath = path.resolve(__dirname, uploadPath);
  
  if (!fs.existsSync(absoluteUploadPath)) {
    console.log('   ✗ 上传目录不存在');
    return;
  }
  
  const files = fs.readdirSync(absoluteUploadPath);
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(f));
  
  if (imageFiles.length === 0) {
    console.log('   ⚠ 没有找到图片文件');
    return;
  }
  
  console.log(`   找到 ${imageFiles.length} 个图片文件`);
  
  // 测试前3个图片
  for (let i = 0; i < Math.min(3, imageFiles.length); i++) {
    const imageFile = imageFiles[i];
    const imagePath = `/uploads/${imageFile}`;
    await testImageAccess(imagePath, imageFile);
  }
}

function testImageAccess(path, filename) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: backendPort,
      path: path,
      method: 'GET',
      timeout: 5000
    };
    
    console.log(`   测试图片: ${path}`);
    
    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        console.log(`   ✓ 图片访问成功 (状态码: ${res.statusCode})`);
        console.log(`     Content-Type: ${res.headers['content-type']}`);
        console.log(`     Content-Length: ${res.headers['content-length']}`);
      } else {
        console.log(`   ✗ 图片访问失败 (状态码: ${res.statusCode})`);
      }
      resolve();
    });
    
    req.on('error', (err) => {
      console.log(`   ✗ 图片访问失败: ${err.message}`);
      resolve();
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log(`   ⚠ 图片访问超时`);
      resolve();
    });
    
    req.end();
  });
}

// 4. 测试跨域请求
async function testCORS() {
  console.log('\n4. 测试跨域请求:');
  
  const options = {
    hostname: 'localhost',
    port: backendPort,
    path: '/api',
    method: 'OPTIONS',
    timeout: 5000,
    headers: {
      'Origin': 'http://localhost:3000',
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'Content-Type'
    }
  };
  
  const req = http.request(options, (res) => {
    console.log('   ✓ CORS预检请求成功');
    console.log('   响应头:');
    console.log(`     Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin'] || '未设置'}`);
    console.log(`     Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods'] || '未设置'}`);
    console.log(`     Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers'] || '未设置'}`);
  });
  
  req.on('error', (err) => {
    console.log(`   ✗ CORS预检请求失败: ${err.message}`);
  });
  
  req.on('timeout', () => {
    req.destroy();
    console.log('   ⚠ CORS预检请求超时');
  });
  
  req.end();
}

// 5. 测试数据库中的图片路径
async function testDatabaseImagePaths() {
  console.log('\n5. 测试数据库中的图片路径:');
  
  const mysql = require('mysql2/promise');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    // 测试轮播图图片路径
    try {
      const [carousels] = await connection.execute('SELECT id, image_url FROM carousels LIMIT 3');
      if (carousels.length > 0) {
        console.log(`   测试 ${carousels.length} 个轮播图图片路径:`);
        
        for (const carousel of carousels) {
          const imagePath = carousel.image_url;
          console.log(`   - ID: ${carousel.id}, 路径: ${imagePath}`);
          
          // 分析路径格式
          if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            console.log(`     ✓ 完整URL格式`);
          } else if (imagePath.startsWith('/uploads/')) {
            console.log(`     ✓ 相对路径格式`);
            
            // 测试访问
            await testImageAccess(imagePath, `carousel-${carousel.id}`);
          } else {
            console.log(`     ⚠ 路径格式异常`);
          }
        }
      } else {
        console.log('   ⚠ 没有轮播图数据');
      }
    } catch (error) {
      console.log('   ✗ 查询轮播图失败:', error.message);
    }
    
    // 测试产品图片路径
    try {
      const [products] = await connection.execute('SELECT id, image_url FROM products LIMIT 3');
      if (products.length > 0) {
        console.log(`   测试 ${products.length} 个产品图片路径:`);
        
        for (const product of products) {
          const imagePath = product.image_url;
          console.log(`   - ID: ${product.id}, 路径: ${imagePath}`);
          
          if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            console.log(`     ✓ 完整URL格式`);
          } else if (imagePath.startsWith('/uploads/')) {
            console.log(`     ✓ 相对路径格式`);
            await testImageAccess(imagePath, `product-${product.id}`);
          } else {
            console.log(`     ⚠ 路径格式异常`);
          }
        }
      } else {
        console.log('   ⚠ 没有产品数据');
      }
    } catch (error) {
      console.log('   ✗ 查询产品失败:', error.message);
    }
    
    await connection.end();
    
  } catch (error) {
    console.log('   ✗ 数据库连接失败:', error.message);
  }
}

// 6. 环境变量建议
console.log('6. 环境配置建议:');

const apiBaseUrl = process.env.API_URL || '未设置';
const corsOrigin = process.env.CORS_ORIGIN || '未设置';

console.log(`   API_URL: ${apiBaseUrl}`);
console.log(`   CORS_ORIGIN: ${corsOrigin}`);

if (corsOrigin === '未设置') {
  console.log('   ⚠ 建议设置 CORS_ORIGIN 环境变量');
  console.log('   示例: CORS_ORIGIN=http://localhost:3000,http://your-server-ip');
}

console.log('');
console.log('7. 常见环境差异问题:');
console.log('   - 本地开发环境: Vite代理 /api 和 /uploads 到 localhost:3001');
console.log('   - 生产环境: 需要配置API地址或使用Nginx代理');
console.log('   - 图片路径: 确保使用 /uploads/ 开头的相对路径');
console.log('   - CORS配置: 确保允许前端域名访问');
console.log('');

// 运行所有测试
async function runAllTests() {
  await testLocalConnection();
  await testAPIEndpoints();
  await testImageAccess();
  await testCORS();
  await testDatabaseImagePaths();
  
  console.log('\n=== 测试完成 ===');
  console.log('');
  console.log('建议操作:');
  console.log('1. 检查所有测试结果，找出失败的项');
  console.log('2. 对比本地和服务器环境的差异');
  console.log('3. 检查浏览器开发者工具的Network标签');
  console.log('4. 确认前端构建是否包含正确的API配置');
  console.log('5. 检查Nginx配置（如果使用）');
}

runAllTests().catch(console.error);
