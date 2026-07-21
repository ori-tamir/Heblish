@echo off
chcp 65001 >nul
echo ========================================
echo   Heblish - Keyboard layout helper
echo ========================================
echo.
echo 1. Open edge://extensions
echo 2. Copy the Extension ID under HeblishFlip
echo.
set /p EXTID=Paste Extension ID here: 
if "%EXTID%"=="" (
  echo Error: no ID entered.
  pause
  exit /b 1
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0native\install.ps1" -ExtensionId "%EXTID%"
echo.
echo Done. Reload the extension in Edge and test.
pause
