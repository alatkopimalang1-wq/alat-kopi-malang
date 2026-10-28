@echo off
chcp 65001 >nul
title Upload Project Alat Kopi Malang ke GitHub
echo ====================================================================
echo   UPLOAD PROJECT KE GITHUB: alatkopimalang1-wq/alat-kopi-malang
echo ====================================================================
echo.

set "GIT_CMD=git"
if exist "%TEMP%\MinGit\cmd\git.exe" set "GIT_CMD=%TEMP%\MinGit\cmd\git.exe"
if exist "C:\Program Files\Git\cmd\git.exe" set "GIT_CMD=C:\Program Files\Git\cmd\git.exe"
if exist "%LOCALAPPDATA%\Programs\Git\cmd\git.exe" set "GIT_CMD=%LOCALAPPDATA%\Programs\Git\cmd\git.exe"

:: 1. Pastikan perubahan terbaru sudah di-commit
echo [*] Menyimpan perubahan terbaru ke Git lokal...
"%GIT_CMD%" add .
"%GIT_CMD%" commit -m "Update project Alat Kopi Malang" >nul 2>nul

:: 2. Hubungkan ke Remote GitHub https://github.com/alatkopimalang1-wq/alat-kopi-malang.git
set "REPO_URL=https://github.com/alatkopimalang1-wq/alat-kopi-malang.git"
"%GIT_CMD%" remote remove origin >nul 2>nul
"%GIT_CMD%" remote add origin %REPO_URL%
"%GIT_CMD%" branch -M main

echo.
echo [*] Mengunggah (push) project ke %REPO_URL% ...
echo     (Jika muncul jendela Login GitHub, silakan Sign in dengan akun GitHub Anda)
"%GIT_CMD%" push -u origin main

echo.
echo ====================================================================
echo [SELESAI] Project berhasil diunggah ke:
echo https://github.com/alatkopimalang1-wq/alat-kopi-malang
echo ====================================================================
pause
