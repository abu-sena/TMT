@echo off
REM ====================================================
REM One-click APK builder for Adab Quest
REM Downloads portable JDK 17, builds SPA, and creates APK
REM ====================================================

setlocal enabledelayedexpansion
set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"

echo ============================================
echo   Adab Quest - Android APK Builder
echo ============================================
echo.

REM --- Step 1: Check for JDK 17 ---
set JDK_DIR=%PROJECT_DIR%jdk-21.0.11+10
set JAVA_EXE=%JDK_DIR%\bin\java.exe

if exist "%JAVA_EXE%" (
    echo [OK] JDK 17 portable found
    goto :build_spa
)

echo [INFO] Downloading portable JDK 17 (~180 MB)...
echo Please wait, this only happens once...
echo.

powershell -Command "& {
    $url = 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.14%%2B7/OpenJDK17U-jdk_x64_windows_hotspot_17.0.14_7.zip'
    $output = '%PROJECT_DIR%jdk17_temp.zip'
    $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing
    Write-Host '[OK] Downloaded'
    Expand-Archive -Path $output -DestinationPath '%PROJECT_DIR%' -Force
    Remove-Item $output
    $extracted = Get-ChildItem '%PROJECT_DIR%' -Directory | Where-Object { \$_.Name -like 'jdk-17*' } | Select-Object -First 1
    Rename-Item \$extracted.FullName 'portable_jdk17'
    Write-Host '[OK] JDK 17 extracted'
}"

if not exist "%JAVA_EXE%" (
    echo [ERROR] Failed to download JDK 17.
    echo Please install Java 17+ manually from: https://adoptium.net/
    echo Then set JAVA_HOME and try again.
    pause
    exit /b 1
)

:build_spa
echo.
echo [STEP 1/3] Building web app...
call npx vite build --config vite.spa.config.ts
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Web build failed
    pause
    exit /b 1
)
echo [OK] Web build complete

echo.
echo [STEP 2/3] Syncing with Capacitor...
call npx cap sync
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Capacitor sync failed
    pause
    exit /b 1
)
echo [OK] Sync complete

echo.
echo [STEP 3/3] Building APK with Gradle + JDK 21...
set JAVA_HOME=%JDK_DIR%
cd android

call gradlew.bat assembleDebug -Dorg.gradle.java.home=%JDK_DIR%
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] APK build failed
    echo Check the error above.
    cd ..
    pause
    exit /b 1
)

cd ..
echo.
echo ============================================
echo   BUILD SUCCESS!
echo ============================================
echo.
echo APK location:
echo   android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo Copy this file to your HUAWEI MatePad 11 and install.
echo See: docs\HUAWEI_MATEPAD_INSTALL_GUIDE.md
echo.
pause
