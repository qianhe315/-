#!/bin/bash

# 服务器诊断脚本
# 在服务器上运行此脚本来诊断图片上传问题

echo "=========================================="
echo "Star Leap 服务器诊断脚本"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 获取当前目录
CURRENT_DIR=$(pwd)
echo -e "${BLUE}当前目录:${NC} $CURRENT_DIR"
echo ""

# 步骤1: 查找uploads目录
echo -e "${YELLOW}[步骤 1/8] 查找uploads目录...${NC}"
UPLOAD_DIRS=$(find /var/www -type d -name "uploads" 2>/dev/null | head -10)

if [ -n "$UPLOAD_DIRS" ]; then
    echo -e "${GREEN}找到以下uploads目录:${NC}"
    echo "$UPLOAD_DIRS" | while read dir; do
        echo "  - $dir"
        ls -la "$dir" 2>/dev/null | head -5
    done
else
    echo -e "${RED}未找到uploads目录${NC}"
fi
echo ""

# 步骤2: 检查当前目录结构
echo -e "${YELLOW}[步骤 2/8] 检查当前目录结构...${NC}"
echo "目录内容:"
ls -la | head -20
echo ""

# 步骤3: 查找backend目录
echo -e "${YELLOW}[步骤 3/8] 查找backend目录...${NC}"
BACKEND_DIRS=$(find /var/www -type d -name "backend" 2>/dev/null | head -10)

if [ -n "$BACKEND_DIRS" ]; then
    echo -e "${GREEN}找到以下backend目录:${NC}"
    echo "$BACKEND_DIRS" | while read dir; do
        echo "  - $dir"
        # 检查是否有uploads目录
        if [ -d "$dir/uploads" ]; then
            echo -e "    ${GREEN}✓ 存在uploads目录${NC}"
            ls -la "$dir/uploads" | head -5
        else
            echo -e "    ${RED}✗ 不存在uploads目录${NC}"
        fi
        # 检查routes目录
        if [ -f "$dir/routes/mediaRoutes.js" ]; then
            echo -e "    ${GREEN}✓ 存在mediaRoutes.js${NC}"
        else
            echo -e "    ${RED}✗ 不存在mediaRoutes.js${NC}"
        fi
    done
else
    echo -e "${RED}未找到backend目录${NC}"
fi
echo ""

# 步骤4: 检查PM2进程
echo -e "${YELLOW}[步骤 4/8] 检查PM2进程...${NC}"
if command -v pm2 &> /dev/null; then
    pm2 list
    echo ""
    echo -e "${GREEN}PM2日志:${NC}"
    pm2 logs --lines 20 --nostream
else
    echo -e "${RED}PM2未安装${NC}"
    echo "检查systemd服务:"
    systemctl list-units --type=service | grep -i node
fi
echo ""

# 步骤5: 检查Nginx配置
echo -e "${YELLOW}[步骤 5/8] 检查Nginx配置...${NC}"
NGINX_CONF="/etc/nginx/sites-available/starleap.xin"
if [ -f "$NGINX_CONF" ]; then
    echo -e "${GREEN}找到Nginx配置:${NC} $NGINX_CONF"
    echo ""
    echo "关键配置:"
    grep -E "(client_max_body_size|proxy_pass|location /api|location /uploads)" "$NGINX_CONF" | head -20
else
    echo -e "${RED}未找到Nginx配置文件${NC}"
    echo "尝试查找其他配置文件:"
    find /etc/nginx -name "*.conf" -type f 2>/dev/null | head -10
fi
echo ""

# 步骤6: 检查数据库连接
echo -e "${YELLOW}[步骤 6/8] 检查数据库连接...${NC}"
if command -v mysql &> /dev/null; then
    echo -e "${GREEN}MySQL已安装${NC}"
    echo "尝试连接数据库..."
    mysql -u root -p -e "SELECT 1;" 2>&1 | grep -v "Enter password:" | head -5
    echo ""
    echo "检查media表:"
    mysql -u root -p -e "DESCRIBE star_leap.media;" 2>&1 | grep -v "Enter password:" | head -10
else
    echo -e "${RED}MySQL未安装${NC}"
fi
echo ""

# 步骤7: 检查磁盘空间
echo -e "${YELLOW}[步骤 7/8] 检查磁盘空间...${NC}"
df -h | grep -E "(/var|/home)"
echo ""

# 步骤8: 测试API端点
echo -e "${YELLOW}[步骤 8/8] 测试API端点...${NC}"
echo "测试GET /api/media:"
curl -s -w "\nHTTP Status: %{http_code}\n" http://localhost:3001/api/media 2>&1 | head -10
echo ""

echo "=========================================="
echo "诊断完成！"
echo "=========================================="
echo ""
echo -e "${BLUE}建议操作:${NC}"
echo ""
echo "1. 如果uploads目录不存在，创建它："
echo "   mkdir -p /var/www/11/0012/backend/uploads"
echo "   chmod 755 /var/www/11/0012/backend/uploads"
echo ""
echo "2. 如果mediaRoutes.js路径有问题，修复它："
echo "   cd /var/www/11/0012/backend/routes"
echo "   nano mediaRoutes.js"
echo "   确保第10行是: const uploadPath = path.join(__dirname, process.env.UPLOAD_PATH);"
echo ""
echo "3. 重启服务:"
echo "   pm2 restart star-leap-backend"
echo ""
echo "4. 查看实时日志:"
echo "   pm2 logs star-leap-backend"
echo ""
