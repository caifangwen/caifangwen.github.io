@echo off
chcp 65001 
echo ========================================
echo Hugo Narrow 主题快速优化安装
echo ========================================
echo.

cd /d C:\Users\Frida\pages

REM 1. 创建目录
echo [1/5] 创建 CSS 目录...
if not exist "assets\css" mkdir assets\css

REM 2. 创建自定义 CSS
echo [2/5] 创建自定义样式文件...
(
echo /* 移动端首页文章列表优化 */
echo @media ^(max-width: 768px^) {
echo   body.home .post-list article ^> a ^> div ^> div:first-child {
echo     display: none !important;
echo   }
echo   body.home .post-list {
echo     max-width: 90%%;
echo     margin-left: auto;
echo     margin-right: auto;
echo   }
echo   body.home .post-list article ^> a ^> div {
echo     padding: 1rem !important;
echo   }
echo   body.home .post-list article h3 {
echo     font-size: 1rem !important;
echo     margin-bottom: 0.75rem !important;
echo   }
echo   body.home .post-list article p {
echo     font-size: 0.875rem !important;
echo     line-height: 1.5 !important;
echo   }
echo }
) > assets\css\custom.css

REM 3. 更新 archetype
echo [3/5] 更新文章模板...
(
echo ---
echo title: "{{ replace .File.ContentBaseName "-" " " ^| title }}"
echo date: {{ .Date }}
echo draft: true
echo description: ""
echo summary: ""
echo tags: []
echo categories: []
echo cover: ""
echo author: "Frida"
echo ---
echo.
echo ^<^!-- 在这里开始写作 --^>
) > archetypes\default.md

REM 4. 创建技术文章模板
echo [4/5] 创建技术文章模板...
(
echo ---
echo title: "{{ replace .File.ContentBaseName "-" " " ^| title }}"
echo date: {{ .Date }}
echo draft: true
echo description: ""
echo summary: ""
echo tags: ["技术"]
echo categories: ["技术博客"]
echo cover: ""
echo author: "Frida"
echo ---
echo.
echo ## 概述
echo.
echo ## 解决方案
echo.
echo ## 总结
) > archetypes\tech-post.md

REM 5. 检查配置文件
echo [5/5] 检查配置文件...
findstr /C:"customCSS:" config\_default\params.yaml >nul
if errorlevel 1 (
    echo 需要手动添加 customCSS 配置到 config\_default\params.yaml
    echo.
    echo 请在文件末尾添加：
    echo customCSS:
    echo   - "css/custom.css"
)

echo.
echo ========================================
echo ✅ 安装完成！
echo ========================================
echo.
echo 已完成的优化：
echo   ✓ 移动端首页隐藏文章图片
echo   ✓ 移动端卡片更窄、更紧凑
echo   ✓ 优化文章创建模板
echo.
echo 下一步：
echo   1. 如果上面提示需要，手动添加 customCSS 配置
echo   2. 运行: hugo server -D
echo   3. 测试移动端效果
echo.
pause
