# 服务器部署指南

## 问题分析

在本地开发环境中，Vite开发服务器通过代理配置将 `/api` 和 `/uploads` 请求转发到后端服务器（http://localhost:3001）。但在生产环境中，前端构建后没有这个代理功能，导致图片和API请求无法正常工作。

## 解决方案

### 方案A：配置前端API地址（推荐）

1. **修改前端API配置**

   我已经修改了 `frontend/src/services/api.js`，使其支持环境变量配置：
   ```javascript
   baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'
   ```

2. **创建生产环境配置文件**

   在服务器上创建 `frontend/.env.production` 文件：
   ```
   VITE_API_URL=http://your-server-ip:3001
   ```

3. **重新构建前端**
   ```bash
   cd /var/www/11/0012/frontend
   npm run build
   ```

4. **重启服务**
   ```bash
   # 如果使用PM2
   pm2 restart all
   
   # 或重启Nginx
   sudo systemctl restart nginx
   ```

### 方案B：配置Nginx反向代理（推荐用于生产环境）

1. **复制Nginx配置文件**

   我已经创建了 `nginx.conf.example` 配置文件，将其复制到Nginx配置目录：
   ```bash
   sudo cp nginx.conf.example /etc/nginx/sites-available/your-site
   ```

2. **修改配置文件**

   编辑 `/etc/nginx/sites-available/your-site`，修改以下内容：
   - `server_name`: 改为您的域名或服务器IP
   - `root`: 改为您的实际前端构建目录路径

3. **启用配置**
   ```bash
   sudo ln -s /etc/nginx/sites-available/your-site /etc/nginx/sites-enabled/
   sudo nginx -t  # 测试配置
   sudo systemctl reload nginx
   ```

4. **前端配置保持相对路径**

   使用此方案时，前端API配置可以保持为相对路径 `/api`，Nginx会自动代理到后端。

### 方案C：修改图片路径为完整URL

1. **使用图片工具函数**

   我已经创建了 `frontend/src/utils/imageUtils.js`，提供了处理图片URL的工具函数。

2. **在组件中使用**

   在需要显示图片的组件中导入并使用：
   ```javascript
   import { getImageUrl } from '../utils/imageUtils';
   
   // 使用示例
   <img src={getImageUrl(product.image_url)} alt={product.name} />
   ```

3. **确保数据库中的路径正确**

   确保数据库中的图片路径以 `/uploads` 开头，工具函数会自动处理完整URL的构建。

## 部署步骤

### 1. 上传文件到服务器

```bash
# 上传所有文件到服务器
scp -r . ubuntu@your-server-ip:/var/www/11/0012/
```

### 2. 安装依赖

```bash
# 后端依赖
cd /var/www/11/0012/backend
npm install

# 前端依赖
cd /var/www/11/0012/frontend
npm install
```

### 3. 配置环境变量

```bash
# 后端配置
cd /var/www/11/0012/backend
cp .env.example .env
nano .env  # 修改数据库等配置

# 前端配置
cd /var/www/11/0012/frontend
nano .env.production  # 设置API地址
```

### 4. 构建前端

```bash
cd /var/www/11/0012/frontend
npm run build
```

### 5. 初始化数据库

```bash
cd /var/www/11/0012/backend
node init-database.js  # 初始化数据库结构
node reset-password-mysql.js  # 重置管理员密码
```

### 6. 配置Nginx

```bash
sudo cp nginx.conf.example /etc/nginx/sites-available/your-site
sudo nano /etc/nginx/sites-available/your-site  # 修改配置
sudo ln -s /etc/nginx/sites-available/your-site /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. 启动服务

```bash
# 使用PM2（推荐）
cd /var/www/11/0012/backend
npm install -g pm2
pm2 start index.js --name star-leap-api
pm2 save
pm2 startup

# 或直接启动
node index.js
```

### 8. 诊断问题

如果遇到问题，运行诊断脚本：

```bash
cd /var/www/11/0012/backend
node diagnose-deployment.js  # 部署诊断
node diagnose-db.js  # 数据库诊断
```

## 常见问题

### 1. 图片无法显示

- 检查上传目录是否存在且有正确权限
- 检查数据库中的图片路径是否正确
- 检查API地址配置是否正确
- 运行诊断脚本查看详细信息

### 2. API请求失败

- 检查后端服务是否正常运行
- 检查Nginx配置是否正确
- 检查防火墙设置
- 查看浏览器控制台和网络请求

### 3. 数据库连接失败

- 检查MySQL服务是否运行
- 检查.env文件中的数据库配置
- 检查MySQL用户权限
- 运行数据库诊断脚本

## 维护建议

1. **定期备份数据库**
2. **监控服务器资源使用**
3. **定期更新依赖包**
4. **配置HTTPS证书**
5. **设置日志轮转**
6. **配置自动部署流程**

## 安全建议

1. 不要将.env文件提交到版本控制
2. 使用强密码
3. 配置防火墙规则
4. 定期更新系统和软件
5. 限制数据库访问权限
6. 使用HTTPS加密传输
