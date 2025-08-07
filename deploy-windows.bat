@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM ==========================================
REM 网站性能检测工具 - Windows 自动部署脚本
REM ==========================================

REM 颜色定义
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM 打印带颜色的信息
:print_info
echo %BLUE%[INFO]%NC% %~1
goto :eof

:print_success
echo %GREEN%[SUCCESS]%NC% %~1
goto :eof

:print_warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

:print_error
echo %RED%[ERROR]%NC% %~1
goto :eof

REM 检查管理员权限
:check_admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    call :print_error "此脚本需要管理员权限运行"
    call :print_info "请右键点击脚本，选择'以管理员身份运行'"
    pause
    exit /b 1
)
call :print_success "管理员权限检查通过"
goto :eof

REM 检查Windows版本
:check_windows
ver | findstr /i "5\.1\|5\.2\|6\.0\|6\.1" >nul
if %errorLevel% equ 0 (
    call :print_error "此脚本不支持 Windows XP/Vista/7"
    call :print_info "请使用 Windows 8/10/11 或 Windows Server 2012+"
    pause
    exit /b 1
)
call :print_success "Windows版本检查通过"
goto :eof

REM 检查PowerShell
:check_powershell
powershell -Command "Exit" >nul 2>&1
if %errorLevel% neq 0 (
    call :print_error "PowerShell不可用"
    pause
    exit /b 1
)
call :print_success "PowerShell检查通过"
goto :eof

REM 检查并安装Node.js
:install_nodejs
call :print_info "正在检查Node.js..."

REM 检查是否已安装Node.js
node --version >nul 2>&1
if %errorLevel% equ 0 (
    for /f "tokens=*" %%a in ('node --version') do set NODE_VERSION=%%a
    call :print_info "检测到已安装的Node.js版本: !NODE_VERSION!"
    
    REM 检查版本是否满足要求 (简化检查)
    echo !NODE_VERSION! | findstr "v18\|v19\|v20\|v21" >nul
    if %errorLevel% equ 0 (
        call :print_success "Node.js版本满足要求，跳过安装"
        goto :eof
    ) else (
        call :print_warning "Node.js版本过低，需要升级到v18.0.0以上"
    )
)

call :print_info "正在下载Node.js安装程序..."

REM 创建临时目录
if not exist "%TEMP%\domain-test-deploy" mkdir "%TEMP%\domain-test-deploy"

REM 下载Node.js安装程序 (使用PowerShell)
powershell -Command "& {Invoke-WebRequest -Uri 'https://nodejs.org/dist/v18.19.0/node-v18.19.0-x64.msi' -OutFile '%TEMP%\domain-test-deploy\node-installer.msi'}"

if %errorLevel% neq 0 (
    call :print_error "Node.js安装程序下载失败"
    pause
    exit /b 1
)

REM 安装Node.js
call :print_info "正在安装Node.js..."
msiexec /i "%TEMP%\domain-test-deploy\node-installer.msi" /quiet /norestart

if %errorLevel% neq 0 (
    call :print_error "Node.js安装失败"
    pause
    exit /b 1
)

REM 清理临时文件
rmdir /s /q "%TEMP%\domain-test-deploy" 2>nul

REM 刷新环境变量
call :refresh_env

REM 验证安装
node --version >nul 2>&1
if %errorLevel% equ 0 (
    for /f "tokens=*" %%a in ('node --version') do set NODE_VERSION=%%a
    for /f "tokens=*" %%a in ('npm --version') do set NPM_VERSION=%%a
    call :print_success "Node.js安装成功: !NODE_VERSION!"
    call :print_success "npm安装成功: !NPM_VERSION!"
) else (
    call :print_error "Node.js安装失败"
    pause
    exit /b 1
)

goto :eof

REM 刷新环境变量
:refresh_env
call :print_info "正在刷新环境变量..."
for /f "tokens=*" %%a in ('whoami /groups ^| find "S-1-16-12288"') do set IS_ADMIN=1
if defined IS_ADMIN (
    REM 管理员权限下刷新系统环境变量
    reg delete "HKCU\Environment" /v TEMP /f >nul 2>&1
    reg delete "HKCU\Environment" /v TMP /f >nul 2>&1
)
goto :eof

REM 检查并安装Git
:install_git
call :print_info "正在检查Git..."

git --version >nul 2>&1
if %errorLevel% equ 0 (
    for /f "tokens=*" %%a in ('git --version') do set GIT_VERSION=%%a
    call :print_info "检测到已安装的Git: !GIT_VERSION!"
    call :print_success "Git已安装，跳过安装"
    goto :eof
)

call :print_info "正在下载Git安装程序..."

REM 创建临时目录
if not exist "%TEMP%\domain-test-deploy" mkdir "%TEMP%\domain-test-deploy"

REM 下载Git安装程序
powershell -Command "& {Invoke-WebRequest -Uri 'https://github.com/git-for-windows/git/releases/download/v2.44.0.windows.1/Git-2.44.0-64-bit.exe' -OutFile '%TEMP%\domain-test-deploy\git-installer.exe'}"

if %errorLevel% neq 0 (
    call :print_error "Git安装程序下载失败"
    pause
    exit /b 1
)

REM 安装Git
call :print_info "正在安装Git..."
"%TEMP%\domain-test-deploy\git-installer.exe" /VERYSILENT /NORESTART

if %errorLevel% neq 0 (
    call :print_error "Git安装失败"
    pause
    exit /b 1
)

REM 清理临时文件
rmdir /s /q "%TEMP%\domain-test-deploy" 2>nul

REM 刷新环境变量
call :refresh_env

REM 验证安装
git --version >nul 2>&1
if %errorLevel% equ 0 (
    for /f "tokens=*" %%a in ('git --version') do set GIT_VERSION=%%a
    call :print_success "Git安装成功: !GIT_VERSION!"
) else (
    call :print_error "Git安装失败"
    pause
    exit /b 1
)

goto :eof

REM 创建应用目录
:create_app_directory
call :print_info "正在创建应用目录..."

set "APP_DIR=C:\domain-test"
set "LOG_DIR=C:\domain-test\logs"
set "DB_DIR=C:\domain-test\db"

REM 创建目录
if not exist "%APP_DIR%" mkdir "%APP_DIR%"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
if not exist "%DB_DIR%" mkdir "%DB_DIR%"

call :print_success "应用目录创建完成: %APP_DIR%"
goto :eof

REM 复制项目文件
:copy_project_files
call :print_info "正在复制项目文件..."

set "APP_DIR=C:\domain-test"
set "CURRENT_DIR=%CD%"

REM 复制项目文件
xcopy /E /I /H /Y "%CURRENT_DIR%" "%APP_DIR%"

call :print_success "项目文件复制完成"
goto :eof

REM 安装项目依赖
:install_project_dependencies
call :print_info "正在安装项目依赖..."

set "APP_DIR=C:\domain-test"

REM 切换到应用目录
cd /d "%APP_DIR%"

REM 安装依赖
call npm install

REM 初始化数据库
call npx prisma generate

call :print_success "项目依赖安装完成"
goto :eof

REM 创建环境配置文件
:create_env_file
call :print_info "正在创建环境配置文件..."

set "APP_DIR=C:\domain-test"
set "ENV_FILE=%APP_DIR%\.env"

REM 创建环境文件
echo # 应用配置 > "%ENV_FILE%"
echo NODE_ENV=production >> "%ENV_FILE%"
echo PORT=3000 >> "%ENV_FILE%"
echo HOST=0.0.0.0 >> "%ENV_FILE%"
echo. >> "%ENV_FILE%"
echo # 数据库配置 >> "%ENV_FILE%"
echo DATABASE_URL="file:./db/dev.db" >> "%ENV_FILE%"
echo. >> "%ENV_FILE%"
echo # 日志配置 >> "%ENV_FILE%"
echo LOG_LEVEL=info >> "%ENV_FILE%"
echo LOG_FILE=./logs/app.log >> "%ENV_FILE%"
echo. >> "%ENV_FILE%"
echo # 安全配置 >> "%ENV_FILE%"
echo CORS_ORIGIN=http://localhost:3000,https://your-domain.com >> "%ENV_FILE%"

call :print_success "环境配置文件创建完成: %ENV_FILE%"
goto :eof

REM 创建Windows服务
:create_windows_service
call :print_info "正在创建Windows服务..."

set "APP_DIR=C:\domain-test"

REM 检查是否已安装NSSM
nssm version >nul 2>&1
if %errorLevel% neq 0 (
    call :print_info "正在下载NSSM..."
    
    REM 创建临时目录
    if not exist "%TEMP%\domain-test-deploy" mkdir "%TEMP%\domain-test-deploy"
    
    REM 下载NSSM
    powershell -Command "& {Invoke-WebRequest -Uri 'https://nssm.cc/release/nssm-2.24.zip' -OutFile '%TEMP%\domain-test-deploy\nssm.zip'}"
    
    if %errorLevel% neq 0 (
        call :print_error "NSSM下载失败"
        pause
        exit /b 1
    )
    
    REM 解压NSSM
    powershell -Command "& {Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('%TEMP%\domain-test-deploy\nssm.zip', '%TEMP%\domain-test-deploy\nssm')}"
    
    REM 复制NSSM到系统目录
    copy "%TEMP%\domain-test-deploy\nssm\nssm-2.24\win64\nssm.exe" "C:\Windows\System32\" >nul
    
    REM 清理临时文件
    rmdir /s /q "%TEMP%\domain-test-deploy" 2>nul
)

REM 安装服务
nssm install DomainTest "C:\Program Files\nodejs\node.exe" "%APP_DIR%\server.ts"
nssm set DomainTest AppDirectory "%APP_DIR%"
nssm set DomainTest Description "Domain Test Application"
nssm set DomainTest Start SERVICE_AUTO_START
nssm set DomainTest AppEnvironmentExtra "NODE_ENV=production" "PORT=3000" "HOST=0.0.0.0"

REM 配置服务恢复选项
nssm set DomainTest AppExit Default Exit
nssm set DomainTest AppRestartDelay 10000

call :print_success "Windows服务创建完成"
goto :eof

REM 启动服务
:start_service
call :print_info "正在启动服务..."

REM 启动服务
nssm start DomainTest

REM 等待服务启动
timeout /t 5 /nobreak >nul

REM 检查服务状态
nssm status DomainTest
if %errorLevel% equ 0 (
    call :print_success "服务启动成功"
) else (
    call :print_error "服务启动失败"
    call :print_info "请检查事件查看器获取详细错误信息"
    pause
    exit /b 1
)

goto :eof

REM 配置防火墙
:configure_firewall
call :print_info "正在配置防火墙..."

REM 启用防火墙规则
netsh advfirewall firewall add rule name="Domain Test HTTP" dir=in action=allow protocol=TCP localport=3000 >nul
netsh advfirewall firewall add rule name="Domain Test HTTPS" dir=in action=allow protocol=TCP localport=443 >nul

call :print_success "防火墙配置完成"
goto :eof

REM 安装PM2
:install_pm2
call :print_info "正在安装PM2..."

npm install -g pm2

if %errorLevel% equ 0 (
    call :print_success "PM2安装成功"
    
    REM 安装PM2 Windows服务
    pm2-service-install -n DomainTest
    
    REM 启动应用
    cd /d "C:\domain-test"
    pm2 start server.ts --name "domain-test"
    pm2 save
) else (
    call :print_warning "PM2安装失败，将使用NSSM管理服务"
)

goto :eof

REM 显示部署结果
:show_deployment_result
call :print_success "=========================================="
call :print_success "部署完成！"
call :print_success "=========================================="

echo.
echo %GREEN%服务信息:%NC%
echo   服务名称: DomainTest
echo   服务地址: http://localhost:3000
echo   日志目录: C:\domain-test\logs

echo.
echo %GREEN%管理命令:%NC%
echo   查看状态: nssm status DomainTest
echo   查看日志: nssm dump DomainTest
echo   重启服务: nssm restart DomainTest
echo   停止服务: nssm stop DomainTest
echo   删除服务: nssm remove DomainTest confirm

echo.
echo %GREEN%应用目录:%NC%
echo   应用路径: C:\domain-test
echo   配置文件: C:\domain-test\.env
echo   数据库文件: C:\domain-test\db

echo.
echo %GREEN%故障排除:%NC%
echo   查看详细日志: type C:\domain-test\logs\app.log
echo   检查端口占用: netstat -ano | findstr :3000
echo   重启服务: nssm restart DomainTest

echo.
echo %YELLOW%注意:%NC%
echo   请确保防火墙已正确配置端口3000
echo   建议配置域名和SSL证书用于生产环境
echo   可以使用IIS或Nginx作为反向代理

echo.
goto :eof

REM 主函数
:main
echo %BLUE%
echo ==========================================
echo   网站性能检测工具 - Windows 部署脚本
echo ==========================================
echo %NC%

REM 检查运行环境
call :check_admin
call :check_windows
call :check_powershell

REM 确认部署
echo %YELLOW%此脚本将部署网站性能检测工具到您的系统%NC%
echo %YELLOW%部署过程将修改系统配置和安装软件包%NC%
set /p "CONFIRM=是否继续? (y/N): "
if /i "!CONFIRM!" neq "y" (
    call :print_info "部署已取消"
    pause
    exit /b 0
)

REM 执行部署步骤
call :install_nodejs
call :install_git
call :create_app_directory
call :copy_project_files
call :install_project_dependencies
call :create_env_file
call :create_windows_service
call :start_service
call :configure_firewall
call :install_pm2

REM 显示部署结果
call :show_deployment_result

pause
goto :eof

REM 运行主函数
call :main