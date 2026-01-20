#!/bin/bash

# 前端构建错误诊断和修复脚本
# 在服务器上运行此脚本来诊断和修复构建问题

echo "=========================================="
echo "Star Leap 前端构建诊断脚本"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置变量
FRONTEND_PATH="/var/www/11/0012/frontend"
BACKUP_DIR="/tmp/star-leap-frontend-backup-$(date +%Y%m%d%H%M%S)"

# 步骤1: 检查antd依赖
echo -e "${YELLOW}[步骤 1/8] 检查antd依赖...${NC}"
cd "$FRONTEND_PATH"
if [ -f "node_modules/antd/package.json" ]; then
    echo -e "${GREEN}✓ antd依赖已安装${NC}"
else
    echo -e "${RED}✗ antd依赖未安装${NC}"
    echo "请运行: npm install"
    exit 1
fi
echo ""

# 步骤2: 清理构建缓存
echo -e "${YELLOW}[步骤 2/8] 清理构建缓存...${NC}"
rm -rf node_modules/.vite
rm -rf dist
echo -e "${GREEN}✓ 构建缓存已清理${NC}"
echo ""

# 步骤3: 检查TypeScript配置
echo -e "${YELLOW}[步骤 3/8] 检查TypeScript配置...${NC}"
if [ -f "tsconfig.json" ]; then
    echo -e "${GREEN}✓ tsconfig.json存在${NC}"
else
    echo -e "${YELLOW}⚠ tsconfig.json不存在${NC}"
fi
echo ""

# 步骤4: 检查vite配置
echo -e "${YELLOW}[步骤 4/8] 检查vite配置...${NC}"
if [ -f "vite.config.js" ]; then
    echo -e "${GREEN}✓ vite.config.js存在${NC}"
    echo "检查代理配置:"
    grep -A 5 "proxy:" vite.config.js || echo "未找到代理配置"
else
    echo -e "${YELLOW}⚠ vite.config.js不存在${NC}"
fi
echo ""

# 步骤5: 备份当前构建
echo -e "${YELLOW}[步骤 5/8] 备份当前构建...${NC}"
if [ -d "dist" ]; then
    mkdir -p "$BACKUP_DIR"
    cp -r dist "$BACKUP_DIR/dist-backup"
    echo -e "${GREEN}✓ 构建已备份到 $BACKUP_DIR${NC}"
else
    echo -e "${YELLOW}⚠ dist目录不存在${NC}"
fi
echo ""

# 步骤6: 重新构建
echo -e "${YELLOW}[步骤 6/8] 重新构建前端...${NC}"
npm run build 2>&1 | tee /tmp/build-output.log
BUILD_STATUS=${PIPESTATUS[0]}

if [ $BUILD_STATUS -eq 0 ]; then
    echo -e "${GREEN}✓ 构建成功${NC}"
    echo ""
    echo "构建结果:"
    ls -lh dist/ | head -20
    echo ""
    echo "检查关键文件:"
    [ -f "dist/index.html" ] && echo -e "${GREEN}✓ index.html存在${NC}" || echo -e "${RED}✗ index.html不存在${NC}"
    [ -f "dist/assets/index-xxx.js" ] && echo -e "${GREEN}✓ 主JS存在${NC}" || echo -e "${YELLOW}⚠ 主JS不存在${NC}"
    [ -f "dist/assets/index-xxx.css" ] && echo -e "${GREEN}✓ 主CSS存在${NC}" || echo -e "${YELLOW}⚠ 主CSS不存在${NC}"
else
    echo -e "${RED}✗ 构建失败${NC}"
    echo ""
    echo "构建错误:"
    tail -50 /tmp/build-output.log
fi
echo ""

# 步骤7: 检查构建产物
echo -e "${YELLOW}[步骤 7/8] 检查构建产物...${NC}"
if [ -d "dist" ]; then
    FILE_COUNT=$(find dist -type f | wc -l)
    echo -e "${BLUE}文件总数: $FILE_COUNT${NC}"
    
    echo ""
    echo "关键文件检查:"
    [ -f "dist/index.html" ] && echo -e "${GREEN}✓ index.html${NC}" || echo -e "${RED}✗ index.html缺失${NC}"
    [ -f "dist/assets" ] && echo -e "${GREEN}✓ assets目录${NC}" || echo -e "${RED}✗ assets目录缺失${NC}"
    
    if [ -d "dist/assets" ]; then
        JS_COUNT=$(find dist/assets -name "*.js" | wc -l)
        CSS_COUNT=$(find dist/assets -name "*.css" | wc -l)
        echo -e "${BLUE}JS文件: $JS_COUNT${NC}"
        echo -e "${BLUE}CSS文件: $CSS_COUNT${NC}"
    fi
else
    echo -e "${RED}✗ dist目录不存在${NC}"
fi
echo ""

# 步骤8: 检查常见错误
echo -e "${YELLOW}[步骤 8/8] 检查常见构建错误...${NC}"
if [ -f "dist/index.html" ]; then
    echo "检查index.html内容:"
    head -30 dist/index.html
    echo ""
    
    # 检查是否有未定义的变量引用
    if grep -q "getImageUrl\|getClientLogoUrl\|getProductImageUrl" dist/index.html; then
        echo -e "${GREEN}✓ imageUtils函数已引用${NC}"
    else
        echo -e "${YELLOW}⚠ 可能缺少imageUtils函数引用${NC}"
    fi
    
    # 检查Card、Row、Col组件引用
    if grep -q "from 'antd'" dist/index.html; then
        echo -e "${GREEN}✓ antd组件已导入${NC}"
    else
        echo -e "${RED}✗ 可能缺少antd组件导入${NC}"
    fi
fi
echo ""

# 步骤9: 重启前端服务
echo -e "${YELLOW}[步骤 9/8] 重启前端服务...${NC}"
pm2 restart star-leap-frontend
sleep 3

# 检查服务状态
if pm2 describe star-leap-frontend | grep -q "online"; then
    echo -e "${GREEN}✓ 前端服务已重启${NC}"
else
    echo -e "${YELLOW}⚠ 前端服务状态异常${NC}"
    pm2 logs star-leap-frontend --lines 20
fi
echo ""

echo "=========================================="
echo "诊断完成！"
echo "=========================================="
echo ""
echo -e "${BLUE}下一步操作:${NC}"
echo ""
echo "1. 访问网站: http://www.starleap.xin"
echo "2. 按F12打开开发者工具"
echo "3. 查看Console标签是否有错误"
echo "4. 按Ctrl+Shift+R强制刷新浏览器缓存"
echo ""
echo -e "${YELLOW}如果仍然白屏，请提供:${NC}"
echo "1. 浏览器控制台的完整错误信息"
echo "2. 网络标签中的请求详情"
echo "3. 构建输出的最后50行: cat /tmp/build-output.log | tail -50"
echo ""
echo -e "${BLUE}回滚命令:${NC}"
echo "如果构建失败，可以快速回滚:"
echo "  cp -r $BACKUP_DIR/dist-backup dist"
echo "  pm2 restart star-leap-frontend"
