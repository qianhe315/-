#!/bin/bash

echo "=== 前端重新构建脚本 ==="
echo ""

cd /var/www/11/0012/frontend

echo "1. 检查并修复依赖..."
echo ""

if [ ! -d "node_modules" ]; then
    echo "安装前端依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "✗ 依赖安装失败"
        exit 1
    fi
    echo "✓ 依赖安装成功"
else
    echo "✓ node_modules已存在"
fi

echo ""
echo "2. 清理旧的构建文件..."
echo ""

rm -rf dist
rm -rf .vite

if [ $? -eq 0 ]; then
    echo "✓ 旧构建文件已清理"
else
    echo "⚠ 清理失败，继续..."
fi

echo ""
echo "3. 检查环境变量..."
echo ""

if [ -f ".env.production" ]; then
    echo "✓ .env.production存在"
    echo "内容:"
    cat .env.production
else
    echo "⚠ .env.production不存在"
    echo "创建.env.production..."
    
    # 获取服务器IP
    SERVER_IP=$(hostname -I | awk '{print $1}')
    
    cat > .env.production << EOF
# 生产环境API配置
VITE_API_URL=http://$SERVER_IP:3001
EOF
    
    echo "✓ .env.production已创建"
    echo "⚠ 请检查并修改为正确的服务器地址"
fi

echo ""
echo "4. 开始构建前端..."
echo ""

NODE_ENV=production npm run build

if [ $? -eq 0 ]; then
    echo "✓ 构建成功"
else
    echo "✗ 构建失败"
    exit 1
fi

echo ""
echo "5. 验证构建结果..."
echo ""

if [ ! -d "dist" ]; then
    echo "✗ dist目录不存在"
    exit 1
fi

echo "dist目录内容:"
ls -la dist/
echo ""

echo "assets目录内容:"
ls -la dist/assets/ 2>/dev/null || echo "assets目录不存在"
echo ""

echo "查找JS文件:"
JS_COUNT=$(find dist -name "*.js" -type f | wc -l)
echo "找到 $JS_COUNT 个JS文件"

if [ "$JS_COUNT" -eq 0 ]; then
    echo "✗ 严重问题: 没有找到JS文件！"
    echo ""
    echo "检查index.html中的引用:"
    grep -o 'src="[^"]*"' dist/index.html | grep -i "\.js"
    
    if [ $? -ne 0 ]; then
        echo "✗ index.html中没有引用JS文件"
        echo "这可能是构建配置问题"
    fi
else
    echo "✓ 找到JS文件"
    find dist -name "*.js" -type f | head -3
fi

echo ""
echo "查找CSS文件:"
CSS_COUNT=$(find dist -name "*.css" -type f | wc -l)
echo "找到 $CSS_COUNT 个CSS文件"

if [ "$CSS_COUNT" -eq 0 ]; then
    echo "⚠ 没有找到CSS文件"
else
    echo "✓ 找到CSS文件"
    find dist -name "*.css" -type f | head -3
fi

echo ""
echo "6. 检查index.html..."
echo ""

if [ -f "dist/index.html" ]; then
    echo "✓ index.html存在"
    
    echo "检查JS引用:"
    JS_REFS=$(grep -o 'src="[^"]*"' dist/index.html | grep -i "\.js")
    if [ -z "$JS_REFS" ]; then
        echo "✗ 没有找到JS引用"
    else
        echo "$JS_REFS" | head -3
    fi
    
    echo "检查CSS引用:"
    CSS_REFS=$(grep -o 'href="[^"]*"' dist/index.html | grep -i "\.css")
    if [ -z "$CSS_REFS" ]; then
        echo "✗ 没有找到CSS引用"
    else
        echo "$CSS_REFS" | head -3
    fi
else
    echo "✗ index.html不存在"
fi

echo ""
echo "=== 构建验证完成 ==="
echo ""

if [ "$JS_COUNT" -eq 0 ]; then
    echo "⚠ 警告: 没有找到JS文件"
    echo "这可能导致前端功能异常"
    echo ""
    echo "可能的原因:"
    echo "1. 构建配置问题"
    echo "2. 依赖包版本不兼容"
    echo "3. 构建过程中出现错误"
    echo ""
    echo "建议操作:"
    echo "1. 检查vite.config.js配置"
    echo "2. 检查package.json中的构建脚本"
    echo "3. 查看构建过程中的错误信息"
    echo "4. 尝试清理node_modules并重新安装"
else
    echo "✓ 构建验证通过"
    echo "前端已准备就绪"
fi
