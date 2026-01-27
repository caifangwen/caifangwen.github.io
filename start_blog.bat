@echo off
echo [INFO] 正在启动 Hugo 预览服务器...
echo [INFO] 预览地址: http://localhost:1313
:: 调用 bin 目录下的程序，-D 表示显示草稿
".\bin\hugo.exe" server -D
pause