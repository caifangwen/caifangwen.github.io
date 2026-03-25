@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: Hugo 版本（可修改）
set HUGO_VERSION=0.146.0
set HUGO_EXTENDED_VERSION=hugo_extended_%HUGO_VERSION%

:: 下载 URL
set DOWNLOAD_URL=https://github.com/gohugoio/hugo/releases/download/v%HUGO_VERSION%/hugo_extended_%HUGO_VERSION%_windows-amd64.zip
set DOWNLOAD_FILE=hugo_extended_%HUGO_VERSION%_windows-amd64.zip

echo ========================================
echo Hugo Extended %HUGO_VERSION% 下载器
echo ========================================
echo.
echo 下载链接：%DOWNLOAD_URL%
echo.

:: 检查是否已安装 curl 或 powershell
where powershell >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 PowerShell，无法下载
    pause
    exit /b 1
)

:: 使用 PowerShell 下载
echo [信息] 正在下载 Hugo Extended %HUGO_VERSION%...
powershell -Command "Invoke-WebRequest -Uri '%DOWNLOAD_URL%' -OutFile '%DOWNLOAD_FILE%' -UseBasicParsing"

if %errorlevel% neq 0 (
    echo [错误] 下载失败
    pause
    exit /b 1
)

echo [信息] 下载完成！

:: 解压
echo [信息] 正在解压...
powershell -Command "Expand-Archive -Path '%DOWNLOAD_FILE%' -DestinationPath 'bin' -Force"

if %errorlevel% neq 0 (
    echo [错误] 解压失败
    pause
    exit /b 1
)

:: 清理下载文件
del %DOWNLOAD_FILE%

:: 验证
echo [信息] 验证 Hugo 版本...
.\bin\hugo.exe version

echo.
echo ========================================
echo Hugo Extended %HUGO_VERSION% 安装完成！
echo ========================================
pause
