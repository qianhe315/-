# 线上服务器诊断和修复指南

## 问题分析

从错误信息来看：
- **请求**: POST `http://www.starleap.xin/api/media/upload`
- **响应**: 500 Internal Server Error
- **响应内容**: `{"message":"Media not found"}`

**关键问题**: "Media not found" 这个消息来自 `GET /:id` 路由，不是 `POST /upload` 路由。这表明可能存在路由冲突或nginx配置问题。

## 可能的原因

### 1. 路由冲突
- 可能nginx配置错误，导致POST请求被路由到错误的处理程序
- 可能存在中间件冲突

### 2. 文件系统权限
- uploads目录没有写权限
- Node.js进程没有创建目录的权限

### 3. 数据库连接问题
- Sequelize连接失败
- Media模型无法创建记录

### 4. Nginx配置问题
- 请求体大小限制
- 超时设置
- 代理配置错误

## 诊断步骤

### 步骤1: 检查服务器日志

```bash
# 查看应用日志
tail -f /var/log/star-leap/app.log

# 或使用PM2查看日志
pm2 logs star-leap-backend --lines 100

# 查看nginx错误日志
tail -f /var/log/nginx/error.log

# 查看nginx访问日志
tail -f /var/log/nginx/access.log
```

**预期看到**:
```
Upload request received: { hasFile: true, fileName: 'xxx.jpg', fileSize: 34033, mimetype: 'image/jpeg' }
File upload check: { originalname: 'xxx.jpg', extname: '.jpg', mimetype: 'image/jpeg', extnameValid: true, mimetypeValid: true }
Media created successfully: { id: 1, fileName: 'xxx.jpg', filePath: '/uploads/file-xxx.jpg', ... }
```

**如果看到错误**:
- `EACCES: permission denied` → 权限问题
- `ENOENT: no such file or directory` → 目录不存在
- `SequelizeConnectionError` → 数据库连接问题

### 步骤2: 检查uploads目录权限

```bash
# 检查uploads目录
ls -la /path/to/backend/uploads

# 如果不存在，创建它
mkdir -p /path/to/backend/uploads

# 设置正确的权限（确保Node.js进程可以写入）
chmod 755 /path/to/backend/uploads
chown -R nodejs:nodejs /path/to/backend/uploads
```

### 步骤3: 检查Nginx配置

```bash
# 查看nginx配置
cat /etc/nginx/sites-available/starleap.xin

# 或
cat /etc/nginx/conf.d/starleap.conf
```

**关键配置**:
```nginx
# 确保client_max_body_size足够大
client_max_body_size 10M;

# 确保代理配置正确
location /api {
    proxy_pass http://localhost:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # 重要：允许大文件上传
    proxy_request_buffering off;
    proxy_buffering off;
}

location /uploads {
    proxy_pass http://localhost:3001/uploads;
    proxy_set_header Host $host;
}
```

### 步骤4: 检查数据库连接

```bash
# 连接数据库测试
mysql -u root -p star_leap

# 检查media表
DESCRIBE media;

# 检查是否有数据
SELECT * FROM media ORDER BY created_at DESC LIMIT 5;
```

### 步骤5: 测试API端点

```bash
# 测试GET请求（应该返回媒体列表）
curl -X GET http://localhost:3001/api/media

# 测试POST请求（上传文件）
curl -X POST http://localhost:3001/api/media/upload \
  -F "file=@/path/to/test.jpg" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 修复方案

### 修复1: 更新mediaRoutes.js路径

**问题**: 上传路径和静态文件服务路径不一致

**修复前**:
```javascript
// mediaRoutes.js
const uploadPath = path.join(__dirname, '..', process.env.UPLOAD_PATH);
// 结果: backend/../uploads

// index.js
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_PATH)));
// 结果: backend/uploads
```

**修复后**:
```javascript
// mediaRoutes.js
const uploadPath = path.join(__dirname, process.env.UPLOAD_PATH);
// 结果: backend/uploads

// index.js
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_PATH)));
// 结果: backend/uploads
```

### 修复2: 添加详细日志

在 `mediaRoutes.js` 的upload路由中添加：
```javascript
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('Upload request received:', {
      hasFile: !!req.file,
      fileName: req.file?.originalname,
      fileSize: req.file?.size,
      mimetype: req.file?.mimetype
    });
    
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const media = await Media.create({
      fileName: req.file.originalname,
      filePath: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      size: req.file.size,
      description: req.body.description || ''
    });

    console.log('Media created successfully:', media);
    res.status(201).json(media);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: err.message });
  }
});
```

### 修复3: 确保错误处理正确

```javascript
// 在index.js中
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});
```

## 部署修复

### 方式1: 使用PM2（推荐）

```bash
# 1. 停止服务
pm2 stop star-leap-backend

# 2. 备份当前文件
cp routes/mediaRoutes.js routes/mediaRoutes.js.backup

# 3. 上传修复后的文件（使用SCP/SFTP）
# scp routes/mediaRoutes.js user@server:/path/to/backend/routes/

# 4. 重启服务
pm2 restart star-leap-backend

# 5. 查看日志
pm2 logs star-leap-backend --lines 50
```

### 方式2: 使用Git（如果使用版本控制）

```bash
# 1. 拉取最新代码
cd /path/to/backend
git pull origin main

# 2. 重启服务
pm2 restart star-leap-backend

# 3. 查看日志
pm2 logs star-leap-backend --lines 50
```

## 验证修复

### 测试1: 上传小图片

1. 准备一个小于1MB的JPG图片
2. 登录后台管理系统
3. 进入Categories管理
4. 添加/编辑分类
5. 上传图片
6. 检查是否成功

### 测试2: 查看服务器日志

```bash
# 应该看到：
# Upload request received: { hasFile: true, fileName: 'test.jpg', fileSize: 12345, mimetype: 'image/jpeg' }
# File upload check: { originalname: 'test.jpg', extname: '.jpg', mimetype: 'image/jpeg', extnameValid: true, mimetypeValid: true }
# Media created successfully: { id: 1, fileName: 'test.jpg', filePath: '/uploads/file-xxx.jpg', ... }
```

### 测试3: 验证文件存在

```bash
# 检查文件是否上传成功
ls -lh /path/to/backend/uploads/

# 检查数据库记录
mysql -u root -p star_leap -e "SELECT * FROM media ORDER BY created_at DESC LIMIT 1;"
```

## 常见问题

### Q1: 仍然返回500错误

**检查**:
1. 服务器日志中的具体错误信息
2. uploads目录权限
3. 数据库连接是否正常
4. Node.js版本是否兼容

### Q2: 文件上传但无法访问

**检查**:
1. 静态文件服务路径是否正确
2. Nginx代理配置是否正确
3. 文件权限是否正确

### Q3: 数据库错误

**检查**:
1. 数据库连接配置
2. media表是否存在
3. 表结构是否正确

## 紧急回滚

如果修复后问题更严重：

```bash
# 1. 停止服务
pm2 stop star-leap-backend

# 2. 恢复备份
cp routes/mediaRoutes.js.backup routes/mediaRoutes.js

# 3. 重启服务
pm2 restart star-leap-backend
```

## 联系支持

如果以上步骤都无法解决问题，请提供：
1. 完整的服务器日志（最近100行）
2. Nginx错误日志
3. 数据库连接测试结果
4. uploads目录权限信息
