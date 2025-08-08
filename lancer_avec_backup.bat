@echo off
title Prompt Manager - Gestionnaire de Prompts IA
echo ========================================
echo   PROMPT MANAGER - DEMARRAGE
echo ========================================
echo.

REM Créer le dossier de sauvegardes s'il n'existe pas
if not exist "backups" (
    mkdir backups
    echo [INFO] Dossier de sauvegardes cree
)

REM Vérifier si une sauvegarde automatique existe
if exist "backups\auto_backup_latest.json" (
    echo [INFO] Sauvegarde automatique trouvee
    copy /Y "backups\auto_backup_latest.json" "backups\backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%.json" >nul 2>&1
    echo [INFO] Sauvegarde archivee
)

echo.
echo [INFO] Ouverture de l'application...
echo.
echo ----------------------------------------
echo Pour fermer : Appuyez sur Ctrl+C
echo ----------------------------------------
echo.

REM Ouvrir l'application dans le navigateur par défaut
start "" "index.html"

echo [OK] Application lancee dans votre navigateur
echo.

REM Garder la fenêtre ouverte pour les logs
pause >nul