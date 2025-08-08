@echo off
echo ========================================
echo    TEST COMPLET DU SYSTEME
echo ========================================
echo.
echo Ce test va verifier :
echo 1. Le systeme de liens d'images
echo 2. La fusion avec conservation des liens
echo 3. La detection des doublons
echo.
echo Appuyez sur une touche pour commencer...
pause > nul
echo.
echo [1/3] Ouverture du test des liens...
start test_liens_images.html
timeout /t 2 > nul
echo.
echo [2/3] Ouverture du test de fusion...
start test_fusion_amelioree.html
timeout /t 2 > nul
echo.
echo [3/3] Ouverture de l'application principale...
start index.html
echo.
echo ========================================
echo    INSTRUCTIONS DE TEST
echo ========================================
echo.
echo Dans l'application principale :
echo.
echo 1. AJOUTER UN LIEN A UNE IMAGE :
echo    - Creez ou editez un prompt
echo    - Uploadez une image
echo    - Cliquez sur "Lien source"
echo    - Entrez une URL (ex: https://replicate.com/xyz)
echo    - Sauvegardez
echo.
echo 2. TESTER LA FUSION :
echo    - Creez 2 prompts identiques avec des images differentes
echo    - Ajoutez des liens aux images
echo    - Activez la detection de doublons
echo    - Fusionnez les cartes
echo    - Verifiez que toutes les images ET liens sont conserves
echo.
echo 3. VERIFIER LES LIENS :
echo    - Ouvrez la galerie d'images d'un prompt
echo    - Les images avec liens ont un badge
echo    - Cliquez pour acceder a la source
echo.
echo Documentation complete : GUIDE_LIENS_IMAGES.md
echo.
pause