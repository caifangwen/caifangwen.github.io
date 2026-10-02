@echo off
chcp 65001
cd /d "%~dp0"
echo [INFO] 正在启动 Astro 开发服务器...
echo [INFO] 预览地址: http://localhost:4321
call npm run dev
pause
