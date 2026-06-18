$ErrorActionPreference = 'Stop'

$PROJECT_DIR = "d:\0neDrive\Abu Sena Office\Zamzami Internasional\SMOD\MyZamzami\Online\EduGame"
$SDK_DIR = "d:\android_sdk_tmp"
$CMDLINE_ZIP = "$SDK_DIR\cmdline-tools.zip"
$CMDLINE_DIR = "$SDK_DIR\cmdline-tools"

if (-Not (Test-Path $SDK_DIR)) {
    New-Item -ItemType Directory -Force -Path $SDK_DIR | Out-Null
}

if (-Not (Test-Path "$CMDLINE_DIR\latest\bin\sdkmanager.bat")) {
    Write-Host "[INFO] Downloading Android Command Line Tools..."
    Invoke-WebRequest -Uri "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip" -OutFile $CMDLINE_ZIP -UseBasicParsing
    
    Write-Host "[INFO] Extracting..."
    Expand-Archive -Path $CMDLINE_ZIP -DestinationPath $CMDLINE_DIR -Force
    Remove-Item $CMDLINE_ZIP
    
    Rename-Item "$CMDLINE_DIR\cmdline-tools" "latest"
}

$SDKMANAGER = "$CMDLINE_DIR\latest\bin\sdkmanager.bat"

$env:JAVA_HOME = "$PROJECT_DIR\jdk-21.0.11+10"

Write-Host "[INFO] Accepting Licenses..."
$yesContent = [string]::Join("`n", (1..100 | % { "y" }))
$yesContent | & $SDKMANAGER --licenses

Write-Host "[INFO] Installing Android SDK Components..."
& $SDKMANAGER "platform-tools" "platforms;android-36" "build-tools;34.0.0"

Write-Host "[INFO] Building APK..."
$env:ANDROID_HOME = $SDK_DIR
$env:ANDROID_SDK_ROOT = $SDK_DIR

Set-Location "$PROJECT_DIR\android"
.\gradlew.bat assembleDebug --no-daemon

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[SUCCESS] APK is ready at: android\app\build\outputs\apk\debug\app-debug.apk"
} else {
    Write-Host "`n[ERROR] Build failed."
    exit 1
}
