@echo off
echo ========================================
echo    RELANCER PROPREMENT L'APPLICATION
echo ========================================
echo.
echo Ce script nettoie le cache et relance l'application
echo.
echo Fermeture des navigateurs...
taskkill /F /IM chrome.exe 2>nul
taskkill /F /IM firefox.exe 2>nul
taskkill /F /IM msedge.exe 2>nul
timeout /t 2 > nul
echo.
echo Ouverture de l'application...
start index.html
echo.
echo Si les doublons ne s'affichent pas :
echo 1. Appuyez sur F5 pour rafraichir
echo 2. Appuyez sur Ctrl+F5 pour vider le cache
echo 3. Cliquez sur le bouton loupe+ dans la barre d'outils
echo.
pause