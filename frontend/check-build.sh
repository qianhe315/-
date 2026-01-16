#!/bin/bash

echo "=== 前端构建诊断脚本 ==="
echo ""

cd /var/www/11/0012/frontend

echo "1. 检查当前目录结构:"
echo ""
echo "dist目录内容:"
ls -la dist/
echo ""

echo "assets目录内容:"
ls -la dist/assets/
echo ""

echo "2. 检查JS文件:"
echo ""
echo "查找所有JS文件:"
find dist -name "*.js" -type f
echo ""

echo "查找所有CSS文件:"
find dist -name "*.css" -type f
echo ""

echo "3. 检查index.html中的引用:"
echo ""
grep -o 'href="[^"]*"' dist/index.html | head -5
grep -o 'src="[^"]*"' dist/index.html | head -5
echo ""

echo "4. 检查package.json中的构建脚本:"
echo ""
cat package.json | grep -A 5 '"scripts"'
echo ""

echo "5. 检查vite.config.js:"
echo ""
cat vite.config.js
echo ""

echo "6. 检查node_modules:"
echo ""
if [ -d "node_modules" ]; then
    echo "✓ node_modules存在"
    echo "关键包版本:"
    npm list react vite 2>/dev/null | grep -E "react|vite" | head -5
else
    echo "✗ node_modules不存在"
fi

echo ""
echo "=== 诊断完成 ==="
