#!/bin/bash

# 部署脚本 - 修复图片上传功能
# 使用方法: bash deploy-fix.sh

echo "=========================================="
echo "Star Leap 图片上传功能修复部署脚本"
echo "=========================================="
echo ""

# 配置变量
SERVER_USER="your_username"
SERVER_HOST="www.starleap.xin"
SERVER_PATH="/path/to/backend"  # 请修改为实际路径
BACKUP_DIR="/tmp/star-leap-backup-$(date +%Y%m%d%H%M%S)"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 步骤1: 备份现有文件
echo -e "${YELLOW}[步骤 1/6] 备份现有文件...${NC}"
ssh ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${BACKUP_DIR}"
ssh ${SERVER_USER}@${SERVER_HOST} "cp ${SERVER_PATH}/routes/mediaRoutes.js ${BACKUP_DIR}/mediaRoutes.js.backup"
echo -e "${GREEN}✓ 备份完成${NC}"
echo ""

# 步骤2: 上传修复后的文件
echo -e "${YELLOW}[步骤 2/6] 上传修复后的文件...${NC}"
scp routes/mediaRoutes.js ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/routes/mediaRoutes.js
echo -e "${GREEN}✓ 文件上传完成${NC}"
echo ""

# 步骤3: 检查uploads目录权限
echo -e "${YELLOW}[步骤 3/6] 检查uploads目录权限...${NC}"
ssh ${SERVER_USER}@${SERVER_HOST} "ls -la ${SERVER_PATH}/uploads" || echo "目录不存在，将创建"
ssh ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${SERVER_PATH}/uploads && chmod 755 ${SERVER_PATH}/uploads"
echo -e "${GREEN}✓ 目录权限检查完成${NC}"
echo ""

# 步骤4: 重启后端服务
echo -e "${YELLOW}[步骤 4/6] 重启后端服务...${NC}"
ssh ${SERVER_USER}@${SERVER_HOST} "pm2 restart star-leap-backend || pm2 restart all"
echo -e "${GREEN}✓ 服务重启完成${NC}"
echo ""

# 步骤5: 等待服务启动
echo -e "${YELLOW}[步骤 5/6] 等待服务启动...${NC}"
sleep 5
echo -e "${GREEN}✓ 服务应该已启动${NC}"
echo ""

# 步骤6: 验证修复
echo -e "${YELLOW}[步骤 6/6] 验证修复...${NC}"
echo "测试上传API..."
UPLOAD_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://${SERVER_HOST}/api/media/upload \
  -F "file=@test-image.jpg" \
  -H "Authorization: Bearer YOUR_TOKEN")

HTTP_CODE=$(echo "$UPLOAD_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$UPLOAD_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "201" ]; then
    echo -e "${GREEN}✓ 上传功能正常！${NC}"
    echo "响应: $RESPONSE_BODY"
else
    echo -e "${RED}✗ 上传功能异常${NC}"
    echo "HTTP状态码: $HTTP_CODE"
    echo "响应: $RESPONSE_BODY"
    echo ""
    echo "请查看服务器日志："
    echo "  ssh ${SERVER_USER}@${SERVER_HOST} 'pm2 logs star-leap-backend --lines 50'"
fi

echo ""
echo "=========================================="
echo "部署完成！"
echo "=========================================="
echo ""
echo "下一步："
echo "1. 访问 http://${SERVER_HOST}/admin/categories"
echo "2. 尝试上传图片"
echo "3. 如果仍有问题，查看服务器日志："
echo "   ssh ${SERVER_USER}@${SERVER_HOST} 'pm2 logs star-leap-backend --lines 100'"
echo ""
echo "回滚命令："
echo "  ssh ${SERVER_USER}@${SERVER_HOST} 'cp ${BACKUP_DIR}/mediaRoutes.js.backup ${SERVER_PATH}/routes/mediaRoutes.js && pm2 restart star-leap-backend'"
