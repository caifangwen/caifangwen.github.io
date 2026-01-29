@echo off
chcp 65001 >nul
echo ========================================
echo Hugo 博客移动端优化部署脚本
echo ========================================
echo.

REM 设置项目路径
set PROJECT_DIR=E:\Fr-hugo
cd /d %PROJECT_DIR%

echo [1/10] 创建必要目录...
mkdir content\discussions 2>nul
mkdir layouts\discussions 2>nul
mkdir layouts\_partials\content 2>nul
mkdir static\css 2>nul
mkdir archetypes 2>nul
echo ✓ 目录创建完成

echo.
echo [2/10] 复制头像文件...
if exist "assets\头像.jpg" (
    copy /Y "assets\头像.jpg" "static\头像.jpg" >nul
    echo ✓ 头像复制成功
) else (
    echo ✗ 警告: assets\头像.jpg 不存在
)

echo.
echo [3/10] 备份配置文件...
if exist "config\_default\params.yaml" (
    copy /Y "config\_default\params.yaml" "config\_default\params.yaml.bak" >nul
    echo ✓ params.yaml 已备份
)
if exist "config\_default\menus.yaml" (
    copy /Y "config\_default\menus.yaml" "config\_default\menus.yaml.bak" >nul
    echo ✓ menus.yaml 已备份
)

echo.
echo ========================================
echo 部署准备完成！
echo ========================================
echo.
echo 接下来请手动完成以下步骤：
echo.
echo 1. 复制以下文件到对应位置：
echo    - discussions-single-giscus.html → layouts\discussions\single.html
echo    - discussions-list.html → layouts\discussions\list.html
echo    - discussions-index.md → content\discussions\_index.md
echo    - discussions.md → archetypes\discussions.md
echo.
echo 2. 复制CSS文件：
echo    - mobile-optimizations-enhanced.css → static\css\mobile-optimizations.css
echo.
echo 3. 复制优化组件（可选）：
echo    - post-navigation-mobile.html → layouts\_partials\content\post-navigation.html
echo    - related-posts-mobile.html → layouts\_partials\content\related-posts.html
echo    - post-license-compact.html → layouts\_partials\content\post-license.html
echo.
echo 4. 更新配置文件：
echo    - params-updated.yaml 的内容 → config\_default\params.yaml
echo    - menus-updated.yaml 的内容 → config\_default\menus.yaml
echo.
echo ========================================
echo.
echo 完成后运行测试: hugo server -D
echo.
pause
