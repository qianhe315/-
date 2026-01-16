const http = require('http');
require('dotenv').config();

console.log('=== 轮播图API测试工具 ===\n');

const backendPort = process.env.PORT || 3001;
const backendHost = process.env.DB_HOST === 'localhost' ? 'localhost' : '0.0.0.0';

console.log(`后端地址: http://${backendHost}:${backendPort}`);
console.log('');

// 测试1: 测试根API
function testRootAPI() {
  return new Promise((resolve) => {
    console.log('1. 测试根API...');
    
    const options = {
      hostname: backendHost,
      port: backendPort,
      path: '/',
      method: 'GET',
      timeout: 5000,
      headers: {
        'Accept': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('   ✓ 根API成功');
          console.log('   响应:', data);
        } else {
          console.log(`   ✗ 根API失败 (状态码: ${res.statusCode})`);
          console.log('   响应:', data);
        }
        resolve();
      });
    });
    
    req.on('error', (err) => {
      console.log(`   ✗ 根API错误: ${err.message}`);
      resolve();
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log('   ⚠ 根API超时');
      resolve();
    });
    
    req.end();
  });
}

// 测试2: 测试轮播图API
function testCarouselAPI() {
  return new Promise((resolve) => {
    console.log('\n2. 测试轮播图API...');
    
    const options = {
      hostname: backendHost,
      port: backendPort,
      path: '/api/carousels',
      method: 'GET',
      timeout: 5000,
      headers: {
        'Accept': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`   状态码: ${res.statusCode}`);
        console.log(`   Content-Type: ${res.headers['content-type']}`);
        
        if (res.statusCode === 200) {
          try {
            const jsonData = JSON.parse(data);
            console.log(`   ✓ 轮播图API成功`);
            console.log(`   返回数据数量: ${jsonData.length}`);
            
            if (jsonData.length > 0) {
              console.log('\n   轮播图数据:');
              jsonData.forEach((item, index) => {
                console.log(`   ${index + 1}. ID: ${item.id}`);
                console.log(`      标题: ${item.title}`);
                console.log(`      图片: ${item.image_url}`);
                console.log(`      状态: ${item.is_active ? '活跃' : '禁用'}`);
                console.log('');
              });
            } else {
              console.log('   ⚠ 没有轮播图数据');
            }
          } catch (error) {
            console.log('   ✗ JSON解析失败:', error.message);
            console.log('   原始数据:', data.substring(0, 200));
          }
        } else {
          console.log(`   ✗ 轮播图API失败 (状态码: ${res.statusCode})`);
          console.log('   响应:', data.substring(0, 200));
        }
        resolve();
      });
    });
    
    req.on('error', (err) => {
      console.log(`   ✗ 轮播图API错误: ${err.message}`);
      console.log('   错误代码:', err.code);
      resolve();
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log('   ⚠ 轮播图API超时');
      resolve();
    });
    
    req.end();
  });
}

// 测试3: 测试活跃轮播图API
function testActiveCarouselAPI() {
  return new Promise((resolve) => {
    console.log('\n3. 测试活跃轮播图API...');
    
    const options = {
      hostname: backendHost,
      port: backendPort,
      path: '/api/carousels?active=true',
      method: 'GET',
      timeout: 5000,
      headers: {
        'Accept': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const jsonData = JSON.parse(data);
            console.log(`   ✓ 活跃轮播图API成功`);
            console.log(`   返回数据数量: ${jsonData.length}`);
            
            if (jsonData.length > 0) {
              console.log('\n   活跃轮播图数据:');
              jsonData.forEach((item, index) => {
                console.log(`   ${index + 1}. ID: ${item.id}`);
                console.log(`      标题: ${item.title}`);
                console.log(`      图片: ${item.image_url}`);
                console.log('');
              });
            }
          } catch (error) {
            console.log('   ✗ JSON解析失败:', error.message);
          }
        } else {
          console.log(`   ✗ 活跃轮播图API失败 (状态码: ${res.statusCode})`);
        }
        resolve();
      });
    });
    
    req.on('error', (err) => {
      console.log(`   ✗ 活跃轮播图API错误: ${err.message}`);
      resolve();
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log('   ⚠ 活跃轮播图API超时');
      resolve();
    });
    
    req.end();
  });
}

// 测试4: 测试其他API（对比）
function testOtherAPIs() {
  return new Promise((resolve) => {
    console.log('\n4. 测试其他API（对比）...');
    
    const endpoints = [
      { path: '/api/categories', name: '分类API' },
      { path: '/api/products', name: '产品API' },
      { path: '/api/clients', name: '客户API' }
    ];
    
    let completed = 0;
    
    endpoints.forEach((endpoint) => {
      const options = {
        hostname: backendHost,
        port: backendPort,
        path: endpoint.path,
        method: 'GET',
        timeout: 5000,
        headers: {
          'Accept': 'application/json'
        }
      };
      
      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const jsonData = JSON.parse(data);
              console.log(`   ✓ ${endpoint.name}成功 (数据量: ${jsonData.length})`);
            } catch (error) {
              console.log(`   ✗ ${endpoint.name}JSON解析失败`);
            }
          } else {
            console.log(`   ✗ ${endpoint.name}失败 (状态码: ${res.statusCode})`);
          }
          
          completed++;
          if (completed === endpoints.length) {
            resolve();
          }
        });
      });
      
      req.on('error', (err) => {
        console.log(`   ✗ ${endpoint.name}错误: ${err.message}`);
        completed++;
        if (completed === endpoints.length) {
          resolve();
        }
      });
      
      req.on('timeout', () => {
        req.destroy();
        console.log(`   ⚠ ${endpoint.name}超时`);
        completed++;
        if (completed === endpoints.length) {
          resolve();
        }
      });
      
      req.end();
    });
  });
}

// 测试5: 测试图片文件访问
function testImageAccess() {
  return new Promise((resolve) => {
    console.log('\n5. 测试图片文件访问...');
    
    // 测试几个常见的图片文件
    const testImages = [
      '/uploads/02.jpg',
      '/uploads/image-1768379827069-262266929.jpg',
      '/uploads/image-1768379907762-461449403.jpg'
    ];
    
    let completed = 0;
    
    testImages.forEach((imagePath) => {
      const options = {
        hostname: backendHost,
        port: backendPort,
        path: imagePath,
        method: 'GET',
        timeout: 5000
      };
      
      const req = http.request(options, (res) => {
        if (res.statusCode === 200) {
          console.log(`   ✓ 图片可访问: ${imagePath}`);
          console.log(`     Content-Type: ${res.headers['content-type']}`);
          console.log(`     Content-Length: ${res.headers['content-length']}`);
        } else {
          console.log(`   ✗ 图片不可访问: ${imagePath} (状态码: ${res.statusCode})`);
        }
        
        completed++;
        if (completed === testImages.length) {
          resolve();
        }
      });
      
      req.on('error', (err) => {
        console.log(`   ✗ 图片访问错误: ${imagePath} - ${err.message}`);
        completed++;
        if (completed === testImages.length) {
          resolve();
        }
      });
      
      req.on('timeout', () => {
        req.destroy();
        console.log(`   ⚠ 图片访问超时: ${imagePath}`);
        completed++;
        if (completed === testImages.length) {
          resolve();
        }
      });
      
      req.end();
    });
  });
}

// 生成测试报告
function generateReport() {
  console.log('\n=== 测试报告 ===\n');
  
  console.log('建议操作:');
  console.log('1. 如果轮播图API成功但前端不显示数据:');
  console.log('   - 检查前端构建是否正确');
  console.log('   - 检查浏览器控制台是否有错误');
  console.log('   - 检查网络请求是否成功');
  console.log('');
  console.log('2. 如果轮播图API失败:');
  console.log('   - 检查后端服务是否运行');
  console.log('   - 检查数据库连接是否正常');
  console.log('   - 检查CORS配置');
  console.log('');
  console.log('3. 如果其他API成功但轮播图API失败:');
  console.log('   - 检查轮播图路由配置');
  console.log('   - 检查数据库表结构');
  console.log('   - 检查轮播图数据');
}

// 运行所有测试
async function runAllTests() {
  await testRootAPI();
  await testCarouselAPI();
  await testActiveCarouselAPI();
  await testOtherAPIs();
  await testImageAccess();
  generateReport();
  
  console.log('\n=== 测试完成 ===');
}

runAllTests().catch(console.error);
