@echo off
chcp 65001 >nul
cd /d "%~dp0"

if not exist "%~dp0node_modules" (
  echo  [初始化] 首次运行，正在安装依赖，请稍候...
  call npm install
)

:menu
echo.
echo  ========================================
echo           邀请码生成工具
echo  ========================================
echo.
echo    1. 生成邀请码
echo    2. 查看已生成的邀请码
echo    0. 退出
echo.
set /p opt=  请输入选项 [1/2/0]:

if "%opt%"=="1" goto gen
if "%opt%"=="2" goto list
if "%opt%"=="0" goto end
echo   [提示] 无效选项，请重新输入
goto menu

:gen
echo.
set /p cnt=  生成数量（默认 10）:
if "%cnt%"=="" set cnt=10
set /p use=  每个码可用次数（默认 1）:
if "%use%"=="" set use=1
echo.
echo  ----------------------------------------
node gen-invite-codes.js --count %cnt% --maxUses %use%
echo  ----------------------------------------
echo.
pause
goto menu

:list
echo.
echo  ----------------------------------------
node gen-invite-codes.js --list
echo  ----------------------------------------
echo.
pause
goto menu

:end
exit /b
