@echo off
echo ========================================
echo    TEST COMPLET DE DETECTION DE DOUBLONS
echo ========================================
echo.
echo Ce test va :
echo 1. Creer des donnees de test avec doublons
echo 2. Ouvrir l'application
echo 3. Vous permettre de tester la detection
echo.
echo [1/2] Creation des donnees de test...
start creer_donnees_test.html
echo.
echo Creez les donnees de test dans la page qui s'ouvre
echo Puis fermez-la pour continuer
echo.
pause
echo.
echo [2/2] Ouverture de l'application...
start index.html
echo.
echo ========================================
echo    INSTRUCTIONS DE TEST
echo ========================================
echo.
echo 1. ACTIVER LA DETECTION :
echo    - Cliquez sur le bouton [Loupe+] dans la barre
echo    - Le bouton devient bleu
echo.
echo 2. VERIFIER LA SURBRILLANCE :
echo    - Les cartes "Portrait cyberpunk" sont en ROUGE
echo    - Les cartes "Paysage fantastique" sont en ORANGE
echo    - Chaque groupe a sa couleur
echo.
echo 3. TESTER LA FUSION :
echo    - Cliquez sur "Fusionner" sur une carte
echo    - OU dans le panneau lateral
echo    - Verifiez que toutes les images sont conservees
echo.
echo 4. VERIFIER LES LIENS :
echo    - Les liens sources sont preserves
echo    - Badge sur les images avec liens
echo.
echo Si tout fonctionne, le systeme est OK !
echo.
pause