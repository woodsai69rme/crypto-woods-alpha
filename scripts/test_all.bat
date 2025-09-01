
@echo off
setlocal enabledelayedexpansion

REM Ultimate Crypto Trading Platform - Complete Test Suite (Windows)
echo 🧪 Starting Comprehensive Test Suite...

REM Create logs directory if it doesn't exist
if not exist logs mkdir logs

REM Test results tracking
set UNIT_TESTS_PASSED=false
set INTEGRATION_TESTS_PASSED=false
set E2E_TESTS_PASSED=false
set SECURITY_TESTS_PASSED=false
set PERFORMANCE_TESTS_PASSED=false

REM 1. Unit Tests
echo.
echo 🔬 Running Unit Tests...
call npm run test:unit > logs\unit-tests.log 2>&1
if !errorlevel! == 0 (
    echo ✅ Unit Tests PASSED
    set UNIT_TESTS_PASSED=true
) else (
    echo ❌ Unit Tests FAILED
)

REM 2. Integration Tests
echo.
echo 🔗 Running Integration Tests...
call npm run test:integration > logs\integration-tests.log 2>&1
if !errorlevel! == 0 (
    echo ✅ Integration Tests PASSED
    set INTEGRATION_TESTS_PASSED=true
) else (
    echo ❌ Integration Tests FAILED
)

REM 3. E2E Tests
echo.
echo 🎭 Running E2E Tests...
call npm run test:e2e > logs\e2e-tests.log 2>&1
if !errorlevel! == 0 (
    echo ✅ E2E Tests PASSED
    set E2E_TESTS_PASSED=true
) else (
    echo ❌ E2E Tests FAILED
)

REM 4. Security Tests
echo.
echo 🔐 Running Security Tests...
call npm run test:security > logs\security-tests.log 2>&1
if !errorlevel! == 0 (
    echo ✅ Security Tests PASSED
    set SECURITY_TESTS_PASSED=true
) else (
    echo ❌ Security Tests FAILED
)

REM 5. Performance Tests
echo.
echo ⚡ Running Performance Tests...
call npm run test:performance > logs\performance-tests.log 2>&1
if !errorlevel! == 0 (
    echo ✅ Performance Tests PASSED
    set PERFORMANCE_TESTS_PASSED=true
) else (
    echo ❌ Performance Tests FAILED
)

REM 6. Code Coverage
echo.
echo 📊 Generating Code Coverage Report...
call npm run test:coverage > logs\coverage.log 2>&1

REM 7. Audit Tests
echo.
echo 🔍 Running System Audit...
call npm run audit:comprehensive > logs\audit.log 2>&1

echo.
echo 📋 Test Suite Complete!
echo Check logs\ directory for detailed results.

if "%UNIT_TESTS_PASSED%"=="true" if "%INTEGRATION_TESTS_PASSED%"=="true" if "%E2E_TESTS_PASSED%"=="true" if "%SECURITY_TESTS_PASSED%"=="true" if "%PERFORMANCE_TESTS_PASSED%"=="true" (
    echo 🎉 ALL TESTS PASSED! System is ready for deployment.
    exit /b 0
) else (
    echo ⚠️  Some tests failed. Check logs and fix issues before deployment.
    exit /b 1
)
