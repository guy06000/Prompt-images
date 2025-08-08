@echo off
echo.
echo ==================================================
echo    PROMPT MANAGER v1.3.0 - MENU PRINCIPAL
echo ==================================================
echo.
echo Choisissez une option :
echo.
echo [1] Lancer l'application
echo [2] Lancer avec surveillance (PowerShell)
echo [3] Lancer avec backup (Batch)
echo.
echo --- Documentation ---
echo [4] Guide de sauvegarde
echo [5] Guide des doublons
echo [6] Guide des categories
echo [7] README general
echo.
echo --- Outils ---
echo [8] Ouvrir le dossier de sauvegardes
echo [9] Charger des donnees de test (doublons)
echo.
set /p choix="Votre choix (1-9) : "

if "%choix%"=="1" (
    start "" "index.html"
    echo Application lancee !
    timeout /t 2 >nul
    exit
)

if "%choix%"=="2" (
    powershell.exe -ExecutionPolicy Bypass -File "StartWithBackup.ps1"
    exit
)

if "%choix%"=="3" (
    call lancer_avec_backup.bat
    exit
)

if "%choix%"=="4" (
    start "" "GUIDE_SAUVEGARDE.md"
    echo Guide de sauvegarde ouvert !
    timeout /t 2 >nul
    exit
)

if "%choix%"=="5" (
    start "" "GUIDE_DOUBLONS.md"
    echo Guide des doublons ouvert !
    timeout /t 2 >nul
    exit
)

if "%choix%"=="6" (
    start "" "GUIDE_CATEGORIES.md"
    echo Guide des categories ouvert !
    timeout /t 2 >nul
    exit
)

if "%choix%"=="7" (
    start "" "README.md"
    echo README ouvert !
    timeout /t 2 >nul
    exit
)

if "%choix%"=="8" (
    if not exist "backups" mkdir backups
    start "" "backups"
    echo Dossier de sauvegardes ouvert !
    timeout /t 2 >nul
    exit
)

if "%choix%"=="9" (
    echo.
    echo Cette option va charger des donnees de test avec des doublons.
    echo Vos donnees actuelles seront ecrasees !
    echo.
    set /p confirm="Etes-vous sur ? (O/N) : "
    if /i "%confirm%"=="O" (
        copy /Y "test_doublons.json" "test_import.json" >nul
        echo.
        echo Importez le fichier "test_import.json" dans l'application
        echo via le bouton Import (icone upload).
        echo.
        start "" "index.html"
        pause
    )
    exit
)

echo Choix invalide !
timeout /t 2 >nul
exit