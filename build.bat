@echo off
chcp 65001
echo [INFO] 正在清理旧文件并生成静态网页...
:: --gc 自动清理不用的缓存，--minify 压缩代码体积
".\bin\hugo.exe" --gc --minify
echo [INFO] 构建完成！生成的网页在 public 文件夹中。
pause