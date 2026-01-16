const sequelize = require('./config/database');
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');

async function debugLogin() {
  try {
    console.log('=== 登录调试工具 ===\n');
    
    // 连接数据库
    await sequelize.authenticate();
    console.log('✓ 数据库连接成功\n');
    
    // 查询所有管理员账号
    const admins = await Admin.findAll();
    
    if (admins.length === 0) {
      console.log('✗ 没有找到管理员账号');
      return;
    }
    
    console.log(`找到 ${admins.length} 个管理员账号:\n`);
    
    // 显示每个管理员的信息
    for (const admin of admins) {
      console.log('--- 管理员信息 ---');
      console.log(`ID: ${admin.id}`);
      console.log(`邮箱: ${admin.email}`);
      console.log(`名称: ${admin.name}`);
      console.log(`角色: ${admin.role}`);
      console.log(`状态: ${admin.isActive ? '活跃' : '禁用'}`);
      console.log(`密码哈希: ${admin.password}`);
      console.log(`密码哈希长度: ${admin.password.length}`);
      
      // 测试密码验证
      const testPassword = 'admin123';
      console.log(`\n测试密码: ${testPassword}`);
      
      try {
        const isMatch = await bcrypt.compare(testPassword, admin.password);
        console.log(`密码验证结果: ${isMatch ? '✓ 匹配' : '✗ 不匹配'}`);
      } catch (error) {
        console.log(`✗ 密码验证出错: ${error.message}`);
      }
      
      // 测试其他可能的密码
      const possiblePasswords = ['admin', 'password', 'Admin123', 'ADMIN123'];
      console.log('\n尝试其他常见密码:');
      
      for (const pwd of possiblePasswords) {
        try {
          const isMatch = await bcrypt.compare(pwd, admin.password);
          console.log(`  ${pwd}: ${isMatch ? '✓ 匹配' : '✗ 不匹配'}`);
        } catch (error) {
          console.log(`  ${pwd}: ✗ 验证出错`);
        }
      }
      
      console.log('\n');
    }
    
    // 创建测试管理员账号
    console.log('=== 创建测试管理员账号 ===');
    const testEmail = 'test@example.com';
    const testPassword = 'test123';
    
    const existingTestAdmin = await Admin.findOne({ where: { email: testEmail } });
    if (existingTestAdmin) {
      console.log(`测试账号 ${testEmail} 已存在，正在删除...`);
      await existingTestAdmin.destroy();
    }
    
    const newAdmin = await Admin.create({
      email: testEmail,
      password: testPassword,
      name: '测试管理员',
      role: 'admin',
      isActive: true
    });
    
    console.log(`✓ 测试管理员账号创建成功`);
    console.log(`邮箱: ${testEmail}`);
    console.log(`密码: ${testPassword}`);
    console.log(`密码哈希: ${newAdmin.password}`);
    
    // 验证新创建的账号密码
    const verifyMatch = await bcrypt.compare(testPassword, newAdmin.password);
    console.log(`新账号密码验证: ${verifyMatch ? '✓ 成功' : '✗ 失败'}`);
    
  } catch (error) {
    console.error('✗ 调试过程出错:', error);
  } finally {
    await sequelize.close();
    console.log('\n=== 调试完成 ===');
  }
}

debugLogin();
