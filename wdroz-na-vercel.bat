@echo off
title Wdrazanie Festivo na Vercel
echo ==============================================
echo    Wdrazanie Festivo na platforme Vercel
echo ==============================================
echo.
echo Za chwile otworzy sie logowanie Vercel (jesli jeszcze nie jestes zalogowany).
echo Naciskaj Enter na pytania instalatora.
echo.
cd /d "%~dp0"
call npx vercel --prod
echo.
echo Gotowe! Twoj link do aplikacji pojawil sie powyzej.
pause
