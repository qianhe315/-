# 本地与服务器环境差异问题解决方案

## 问题分析

您遇到的问题很可能是由于本地开发环境和服务器生产环境的配置差异导致的。以下是常见的环境差异和对应的解决方案。

## 环境差异对比

### 1. 开发环境 vs 生产环境

| 项目 | 开发环境 | 生产环境 | 影响 |
|------|---------|---------|------|
| **前端服务器** | Vite开发服务器 | Nginx静态文件服务 | API代理配置不同 |
| **API请求** | 通过Vite代理到localhost:3001 | 需要配置完整URL或Nginx代理 | API请求失败 |
| **图片路径** | 相对路径通过代理访问 | 需要完整URL或Nginx代理 | 图片无法显示 |
| **环境变量** | .env.development | .env.production | 配置不一致 |
| **构建方式** | 实时编译 | 预编译打包 | 代码可能不一致 |

### 2. 操作系统差异

| 项目 | Windows (本地) | Linux (服务器) | 影响 |
|------|--------------|--------------|------|
| **文件路径** | 反斜杠 `\` | 正斜杠 `/` | 路径解析问题 |
| **大小写敏感** | 不敏感 | 敏感 | 文件找不到 |
| **文件权限** | 宽松 | 严格 | 文件访问失败 |
| **环境变量** | 系统变量 | .env文件 | 配置不一致 |

## 具体问题和解决方案

### 问题1: API请求失败

**症状**: 浏览器控制台显示API请求404或连接失败

**原因**: 前端构建后，Vite代理不再工作，API请求发送到错误地址

**解决方案A: 配置API地址（推荐）**

1. **创建生产环境配置文件**
   ```bash
   # 在服务器上
   cd /var/www/11/0012/frontend
   nano .env.production
   ```

2. **添加API地址配置**
   ```
   VITE_API_URL=http://your-server-ip:3001
   # 或使用域名
   # VITE_API_URL=https://your-domain.com
   ```

3. **重新构建前端**
   ```bash
   npm run build
   ```

**解决方案B: 使用Nginx反向代理（推荐用于生产环境）**

1. **配置Nginx代理API请求**
   ```nginx
   location /api {
       proxy_pass http://localhost:3001/api;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
   }
   ```

2. **前端保持相对路径配置**
   ```javascript
   // api.js
   baseURL: '/api'  // 保持相对路径
   ```

### 问题2: 图片无法显示

**症状**: 轮播图和产品图片显示为空白或加载失败

**原因**: 图片路径配置不正确，无法访问上传的文件

**解决方案A: 配置图片URL处理**

1. **使用图片工具函数**
   ```javascript
   // 在组件中
   import { getImageUrl } from '../utils/imageUtils';
   
   <img src={getImageUrl(product.image_url)} alt={product.name} />
   ```

2. **确保数据库路径格式正确**
   - 使用 `/uploads/filename.jpg` 格式
   - 避免使用绝对路径或相对路径 `./uploads/`

**解决方案B: 配置Nginx代理图片请求**

```nginx
location /uploads {
    proxy_pass http://localhost:3001/uploads;
    proxy_set_header Host $host;
    
    # 缓存图片
    location ~* \.(jpg|jpeg|png|gif|svg|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 问题3: CORS跨域问题

**症状**: 浏览器控制台显示CORS错误

**原因**: 后端没有配置允许的前端域名

**解决方案:**

1. **检查后端CORS配置**
   ```javascript
   // backend/index.js
   const corsOptions = {
     origin: process.env.CORS_ORIGIN.split(','),
     credentials: true,
   };
   ```

2. **配置环境变量**
   ```bash
   # backend/.env
   CORS_ORIGIN=http://localhost:3000,http://your-server-ip,https://your-domain.com
   ```

3. **重启后端服务**
   ```bash
   pm2 restart star-leap-api
   ```

### 问题4: 文件权限问题

**症状**: 图片上传失败或无法访问

**原因**: Linux文件权限严格，目录权限不正确

**解决方案:**

1. **检查目录权限**
   ```bash
   ls -la /var/www/11/0012/backend/uploads
   ```

2. **设置正确的权限**
   ```bash
   chmod 755 /var/www/11/0012/backend/uploads
   chown www-data:www-data /var/www/11/0012/backend/uploads
   ```

3. **确保Nginx用户有读取权限**
   ```bash
   chown -R www-data:www-data /var/www/11/0012/backend/uploads
   ```

### 问题5: 数据库连接问题

**症状**: 后端无法连接数据库

**原因**: 数据库配置不正确或权限问题

**解决方案:**

1. **检查MySQL服务状态**
   ```bash
   sudo systemctl status mysql
   sudo systemctl start mysql
   ```

2. **验证数据库配置**
   ```bash
   cd /var/www/11/0012/backend
   node diagnose-db.js
   ```

3. **检查MySQL用户权限**
   ```bash
   sudo mysql -u root -p
   GRANT ALL PRIVILEGES ON star_leap.* TO 'root'@'localhost';
   FLUSH PRIVILEGES;
   ```

## 诊断步骤

### 1. 运行全面诊断脚本

```bash
cd /var/www/11/0012/backend
node comprehensive-diagnose.js
```

这会检查：
- 系统环境信息
- Node.js和npm版本
- 环境变量配置
- 文件系统权限
- 前端构建状态
- 网络连接
- 数据库连接
- 关键包版本

### 2. 运行网络测试脚本

```bash
cd /var/www/11/0012/backend
node test-network.js
```

这会测试：
- 本地后端服务
- API端点访问
- 图片文件访问
- CORS配置
- 数据库图片路径

### 3. 检查浏览器开发者工具

1. **打开开发者工具** (F12)
2. **查看Network标签**：
   - 检查失败的请求（红色）
   - 查看请求URL是否正确
   - 检查响应状态码
3. **查看Console标签**：
   - 查看JavaScript错误
   - 查看网络请求错误

### 4. 检查后端日志

```bash
# 如果使用PM2
pm2 logs star-leap-api

# 或查看应用日志
tail -f /var/www/11/0012/backend/logs/app.log
```

## 快速修复流程

### 步骤1: 配置前端API地址

```bash
cd /var/www/11/0012/frontend
nano .env.production
```

添加：
```
VITE_API_URL=http://your-server-ip:3001
```

### 步骤2: 重新构建前端

```bash
npm run build
```

### 步骤3: 配置后端CORS

```bash
cd /var/www/11/0012/backend
nano .env
```

修改：
```
CORS_ORIGIN=http://localhost:3000,http://your-server-ip
```

### 步骤4: 重启服务

```bash
pm2 restart all
# 或
sudo systemctl restart nginx
```

### 步骤5: 测试

```bash
cd /var/www/11/0012/backend
node test-network.js
```

## 最佳实践

### 开发环境

1. 使用Vite代理配置
2. 使用相对路径 `/api` 和 `/uploads`
3. 使用 `.env.development` 配置

### 生产环境

1. 配置完整的API地址
2. 使用Nginx反向代理
3. 使用 `.env.production` 配置
4. 配置HTTPS
5. 设置适当的缓存策略

### 部署检查清单

- [ ] 前端已正确构建
- [ ] 环境变量已正确配置
- [ ] 数据库连接正常
- [ ] 上传目录权限正确
- [ ] Nginx配置正确
- [ ] CORS配置正确
- [ ] 防火墙规则已设置
- [ ] HTTPS证书已配置（如需要）
- [ ] 日志记录已启用
- [ ] 备份策略已设置

## 常见错误和解决方案

### 错误1: "Network Error"

**原因**: API地址配置错误或后端服务未运行

**解决方案**:
1. 检查后端服务是否运行: `pm2 status`
2. 检查API地址配置: `cat frontend/.env.production`
3. 检查网络连接: `curl http://localhost:3001/api`

### 错误2: "404 Not Found"

**原因**: API路径不正确或路由配置错误

**解决方案**:
1. 检查API路径是否正确
2. 检查后端路由配置
3. 检查Nginx代理配置

### 错误3: "CORS Policy Error"

**原因**: 跨域配置不正确

**解决方案**:
1. 检查后端CORS配置
2. 检查环境变量CORS_ORIGIN
3. 重启后端服务

### 错误4: "Image Load Failed"

**原因**: 图片路径不正确或文件不存在

**解决方案**:
1. 检查数据库中的图片路径
2. 检查上传目录是否存在
3. 检查文件权限
4. 使用图片工具函数处理URL

## 联系支持

如果问题仍然存在，请提供以下信息：

1. 诊断脚本的完整输出
2. 浏览器开发者工具的截图
3. 后端日志的错误信息
4. 环境配置信息（隐藏敏感信息）

这将帮助更快地定位和解决问题。
