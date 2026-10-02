@echo off
chcp 65001
cd /d "%~dp0"
echo [INFO] 正在构建 Astro 静态站点...
call npm run build
if errorlevel 1 exit /b 1
echo [INFO] 构建完成！生成的网页在 dist 文件夹中。
pause
