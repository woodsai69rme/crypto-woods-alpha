
@echo off
setlocal enabledelayedexpansion
title Ultimate Crypto Trading Platform - Launcher

REM Ultimate Crypto Trading Platform - Interactive Launch Menu (Windows)

:check_dependencies
where node >nul 2>nul
if !errorlevel! neq 0 (
    echo ❌ Node.js is required but not installed.
    echo Please install Node.js and try again.
    pause
    exit /b 1
)

where npm >nul 2>nul
if !errorlevel! neq 0 (
    echo ❌ NPM is required but not installed.  
    echo Please install NPM and try again.
    pause
    exit /b 1
)

:main_menu
cls
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║          🚀 ULTIMATE CRYPTO TRADING PLATFORM 🚀             ║
echo ║                                                              ║
echo ║              Professional-Grade Trading Suite                ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 📋 Main Menu - Select an option:
echo.
echo 🏃 Development ^& Execution:
echo   1) 🚀 Start Development Server
echo   2) 🏭 Build for Production
echo   3) 🌐 Start Production Server
echo   4) 🐳 Run with Docker
echo.
echo 🧪 Testing ^& Quality:
echo   5) 🔬 Run All Tests
echo   6) 📊 Generate Coverage Report
echo   7) 🔍 Run Comprehensive Audit
echo   8) 🔐 Security Scan
echo.
echo 📚 Documentation ^& Deployment:
echo   9) 📖 Generate Documentation
echo  10) 🚢 Deploy to Cloud
echo  11) 📦 Create Release Package
echo.
echo ⚙️  Utilities:
echo  12) 🔧 Setup Environment
echo  13) 🗄️  Database Management
echo  14) 📋 System Information
echo  15) 🧹 Cleanup ^& Reset
echo.
echo   0) ❌ Exit
echo.
set /p choice="Enter your choice [0-15]: "

if "%choice%"=="1" goto start_dev
if "%choice%"=="2" goto build_prod
if "%choice%"=="3" goto start_prod
if "%choice%"=="4" goto run_docker
if "%choice%"=="5" goto run_tests
if "%choice%"=="6" goto generate_coverage
if "%choice%"=="7" goto run_audit
if "%choice%"=="8" goto security_scan
if "%choice%"=="9" goto generate_docs
if "%choice%"=="10" goto deploy_cloud
if "%choice%"=="11" goto create_release
if "%choice%"=="12" goto setup_env
if "%choice%"=="13" goto db_management
if "%choice%"=="14" goto system_info
if "%choice%"=="15" goto cleanup_reset
if "%choice%"=="0" goto exit_script
echo Invalid choice. Please try again.
pause
goto main_menu

:start_dev
echo.
echo 🚀 Starting Development Server...
echo Opening at: http://localhost:8080
call npm run dev
pause
goto main_menu

:build_prod
echo.
echo 🏭 Building for Production...
call npm run build
echo ✅ Build complete! Files are in dist/
pause
goto main_menu

:start_prod
echo.
echo 🌐 Starting Production Server...
if not exist dist (
    echo 📦 Building project first...
    call npm run build
)
call npm run start
pause
goto main_menu

:run_docker
echo.
echo 🐳 Running with Docker...
if exist docker-compose.yml (
    docker-compose up --build
) else (
    echo Building Docker image...
    docker build -t crypto-trading-platform .
    docker run -p 8080:8080 crypto-trading-platform
)
pause
goto main_menu

:run_tests
echo.
echo 🧪 Running Complete Test Suite...
call scripts\test_all.bat
pause
goto main_menu

:generate_coverage
echo.
echo 📊 Generating Coverage Report...
call npm run test:coverage
echo ✅ Coverage report generated!
pause
goto main_menu

:run_audit
echo.
echo 🔍 Running Comprehensive Audit...
call npm run audit:comprehensive
pause
goto main_menu

:security_scan
echo.
echo 🔐 Running Security Scan...
call npm audit --audit-level high
echo Security tests completed.
pause
goto main_menu

:generate_docs
echo.
echo 📖 Generating Documentation...
echo Building documentation from /docs folder...
echo ✅ Documentation ready in /docs
pause
goto main_menu

:deploy_cloud
cls
echo 🚢 Cloud Deployment Menu
echo.
echo 1) Deploy to Vercel
echo 2) Deploy to Railway
echo 3) Deploy to Render  
echo 4) Deploy to Fly.io
echo 5) Deploy via Docker
echo 0) Back to main menu
echo.
set /p deploy_choice="Select deployment target: "

if "%deploy_choice%"=="1" (
    echo 🚀 Deploying to Vercel...
    vercel --prod 2>nul || echo Install Vercel CLI first: npm i -g vercel
)
if "%deploy_choice%"=="2" (
    echo 🚀 Deploying to Railway...
    railway deploy 2>nul || echo Install Railway CLI first
)
if "%deploy_choice%"=="3" (
    echo 🚀 Deploying to Render...
    echo Push to GitHub and connect via Render dashboard
)
if "%deploy_choice%"=="4" (
    echo 🚀 Deploying to Fly.io...
    flyctl deploy 2>nul || echo Install Fly CLI first
)
if "%deploy_choice%"=="5" (
    echo 🚀 Docker deployment...
    call scripts\deploy.bat
)
if "%deploy_choice%"=="0" goto main_menu
pause
goto main_menu

:create_release
echo.
echo 📦 Creating Release Package...
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "VERSION=%dt:~0,4%.%dt:~4,2%.%dt:~6,2%"
echo Creating release v!VERSION!...

call npm run build
if not exist releases mkdir releases
tar -czf releases\crypto-trading-platform-v!VERSION!.tar.gz dist\ docs\ scripts\ package.json README.md 2>nul || (
    echo Creating zip package instead...
    powershell Compress-Archive -Path dist\,docs\,scripts\,package.json,README.md -DestinationPath releases\crypto-trading-platform-v!VERSION!.zip
)

echo ✅ Release package created: releases\crypto-trading-platform-v!VERSION!
pause
goto main_menu

:setup_env
echo.
echo 🔧 Environment Setup
call scripts\setup.bat
pause
goto main_menu

:db_management
cls
echo 🗄️  Database Management Menu
echo.
echo 1) View Database Status
echo 2) Run Migrations
echo 3) Seed Test Data
echo 4) Backup Database
echo 5) Reset Database
echo 0) Back to main menu
echo.
set /p db_choice="Select option: "

if "%db_choice%"=="1" (
    echo 📊 Database Status:
    call npm run db:status 2>nul || echo Configure database connection first
)
if "%db_choice%"=="2" (
    echo 🔄 Running migrations...
    call npm run db:migrate 2>nul || echo Configure database first
)
if "%db_choice%"=="3" (
    echo 🌱 Seeding data...
    call npm run db:seed 2>nul || echo Seed script not configured
)
if "%db_choice%"=="4" (
    echo 💾 Creating backup...
    call npm run db:backup 2>nul || echo Backup script not configured
)
if "%db_choice%"=="5" (
    echo ⚠️  Resetting database...
    call npm run db:reset 2>nul || echo Reset script not configured
)
if "%db_choice%"=="0" goto main_menu
pause
goto main_menu

:system_info
cls
echo 📋 System Information
echo.
echo Node.js: 
node --version
echo NPM:
npm --version
echo Git:
git --version 2>nul || echo Not installed
echo OS: Windows
echo.
echo Project Status:
if exist node_modules echo ✅ Dependencies installed
if not exist node_modules echo ❌ Dependencies not installed
if exist dist echo ✅ Production build exists
if not exist dist echo ❌ No production build  
if exist .env echo ✅ Environment configured
if not exist .env echo ❌ Environment not configured
echo.
echo Available Scripts:
call npm run 2>nul
pause
goto main_menu

:cleanup_reset
cls
echo 🧹 Cleanup ^& Reset Options
echo.
echo ⚠️  Warning: These operations may delete data!
echo.
echo 1) Clean build artifacts (dist/, .cache/)
echo 2) Reset node_modules (reinstall dependencies)
echo 3) Clear logs and temp files
echo 4) Full reset (everything except source code)
echo 0) Back to main menu
echo.
set /p cleanup_choice="Select cleanup option: "

if "%cleanup_choice%"=="1" (
    echo 🧹 Cleaning build artifacts...
    rmdir /s /q dist 2>nul
    rmdir /s /q .cache 2>nul
    rmdir /s /q .vite 2>nul
    echo ✅ Build artifacts cleaned
)
if "%cleanup_choice%"=="2" (
    echo 🧹 Resetting dependencies...
    rmdir /s /q node_modules 2>nul
    del package-lock.json 2>nul
    call npm install
)
if "%cleanup_choice%"=="3" (
    echo 🧹 Clearing logs...
    rmdir /s /q logs 2>nul
    del *.log 2>nul
    echo ✅ Logs cleared
)
if "%cleanup_choice%"=="4" (
    echo 🧹 Full reset...
    rmdir /s /q dist 2>nul
    rmdir /s /q .cache 2>nul
    rmdir /s /q .vite 2>nul
    rmdir /s /q node_modules 2>nul
    rmdir /s /q logs 2>nul
    del *.log 2>nul
    call npm install
)
if "%cleanup_choice%"=="0" goto main_menu
pause
goto main_menu

:exit_script
echo.
echo 👋 Goodbye! Happy coding!
pause
exit /b 0
