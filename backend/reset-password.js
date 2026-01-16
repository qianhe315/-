const sequelize = require('./config/database');
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  try {
    console.log('=== 管理员密码重置工具 ===\n');
    
    // 连接数据库
    await sequelize.authenticate();
    console.log('✓ 数据库连接成功\n');
    
    // 查询所有管理员账号
    const admins = await Admin.findAll();
    
    if (admins.length === 0) {
      console.log('✗ 没有找到管理员账号，正在创建新的管理员账号...');
      
      const newAdmin = await Admin.create({
        email: 'admin@starleap.com',
        password: 'admin123',
        name: '超级管理员',
        role: 'super_admin',
        isActive: true
      });
      
      console.log('✓ 新管理员账号创建成功');
      console.log(`邮箱: ${newAdmin.email}`);
      console.log(`密码: admin123`);
      console.log(`名称: ${newAdmin.name}`);
      console.log(`角色: ${newAdmin.role}`);
      
      // 验证新创建的密码
      const verifyMatch = await bcrypt.compare('admin123', newAdmin.password);
      console.log(`\n密码验证测试: ${verifyMatch ? '✓ 成功' : '✗ 失败'}`);
      
    } else {
      console.log(`找到 ${admins.length} 个管理员账号:\n`);
      
      // 显示所有管理员
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.email} (${admin.name}) - ${admin.role}`);
      });
      
      // 重置第一个管理员的密码
      const admin = admins[0];
      console.log(`\n正在重置管理员: ${admin.email} 的密码...`);
      
      // 使用模型的update方法，这会触发beforeUpdate hook自动哈希密码
      await admin.update({ password: 'admin123' });
      
      console.log('✓ 密码重置成功');
      console.log(`邮箱: ${admin.email}`);
      console.log(`新密码: admin123`);
      console.log(`名称: ${admin.name}`);
      console.log(`角色: ${admin.role}`);
      
      // 验证重置后的密码
      const verifyMatch = await bcrypt.compare('admin123', admin.password);
      console.log(`\n密码验证测试: ${verifyMatch ? '✓ 成功' : '✗ 失败'}`);
      
      // 删除其他管理员账号（可选）
      if (admins.length > 1) {
        console.log(`\n发现 ${admins.length - 1} 个额外的管理员账号，是否删除？`);
        console.log('建议只保留一个管理员账号以确保安全。');
        
        for (let i = 1; i < admins.length; i++) {
          await admins[i].destroy();
          console.log(`✓ 已删除管理员: ${admins[i].email}`);
        }
      }
    }
    
    console.log('\n=== 重置完成 ===');
    console.log('请使用以下凭据登录:');
    console.log('邮箱: admin@starleap.com');
    console.log('密码: admin123');
    
  } catch (error) {
    console.error('✗ 重置过程出错:', error);
  } finally {
    await sequelize.close();
  }
}

resetPassword();
