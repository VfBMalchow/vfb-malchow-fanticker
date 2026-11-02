@echo off
setlocal
set "CITY_PYTHON=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
if exist "%CITY_PYTHON%" (
  "%CITY_PYTHON%" "%~dp0scripts\import-stadtliga-datei.py"
) else (
  python "%~dp0scripts\import-stadtliga-datei.py"
  if errorlevel 1 pause
)
