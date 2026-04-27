@echo off
setlocal
pushd "%~dp0"
set PORT=%1
if "%PORT%"=="" set PORT=8000

python -m http.server %PORT% 2>NUL || python3 -m http.server %PORT%
if ERRORLEVEL 1 (
  echo.
  echo Could not start the HTTP server.
  echo Make sure Python 3 is installed and available as "python" or "python3".
  echo
  pause
)
popd
