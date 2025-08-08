# Script PowerShell pour Prompt Manager avec sauvegarde automatique
# ================================================

# Configuration
$AppPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackupFolder = Join-Path $AppPath "backups"
$AppFile = Join-Path $AppPath "index.html"
$MaxBackups = 10  # Nombre maximum de sauvegardes à conserver

# Couleurs pour l'affichage
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Clear-Host
Write-Host "╔═══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     PROMPT MANAGER - GESTIONNAIRE DE PROMPTS   ║" -ForegroundColor Cyan
Write-Host "║           Avec Sauvegarde Automatique          ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Créer le dossier de sauvegardes s'il n'existe pas
if (!(Test-Path $BackupFolder)) {
    New-Item -ItemType Directory -Path $BackupFolder | Out-Null
    Write-Host "[✓] Dossier de sauvegardes créé" -ForegroundColor Green
}

# Fonction pour créer une sauvegarde depuis localStorage
function Create-BackupFromBrowser {
    $backupDate = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $backupFile = Join-Path $BackupFolder "backup_$backupDate.json"
    
    # Script JavaScript pour extraire les données du localStorage
    $jsScript = @"
javascript:(function(){
    const data = {
        prompts: JSON.parse(localStorage.getItem('prompts') || '[]'),
        categories: JSON.parse(localStorage.getItem('categories') || '[]'),
        backupDate: new Date().toISOString(),
        source: 'PowerShell Backup Script'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'temp_backup.json';
    a.click();
})();
"@
    
    Write-Host "[i] Pour créer une sauvegarde manuelle :" -ForegroundColor Yellow
    Write-Host "    1. Ouvrez l'application dans le navigateur" -ForegroundColor Gray
    Write-Host "    2. Appuyez sur F12 (Console développeur)" -ForegroundColor Gray
    Write-Host "    3. Collez le script JavaScript ci-dessus" -ForegroundColor Gray
    Write-Host ""
}

# Vérifier les sauvegardes existantes
$existingBackups = Get-ChildItem -Path $BackupFolder -Filter "*.json" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending

if ($existingBackups.Count -gt 0) {
    Write-Host "[i] Sauvegardes existantes trouvées :" -ForegroundColor Yellow
    $existingBackups | Select-Object -First 5 | ForEach-Object {
        $size = [math]::Round($_.Length / 1KB, 2)
        Write-Host "    • $($_.Name) ($size KB) - $($_.LastWriteTime)" -ForegroundColor Gray
    }
    Write-Host ""
    
    # Nettoyer les anciennes sauvegardes
    if ($existingBackups.Count -gt $MaxBackups) {
        $toDelete = $existingBackups | Select-Object -Skip $MaxBackups
        $toDelete | ForEach-Object {
            Remove-Item $_.FullName -Force
        }
        Write-Host "[✓] $($toDelete.Count) ancienne(s) sauvegarde(s) supprimée(s)" -ForegroundColor Green
    }
}

# Vérifier si l'application existe
if (Test-Path $AppFile) {
    Write-Host "[✓] Application trouvée" -ForegroundColor Green
    Write-Host "[i] Ouverture dans le navigateur..." -ForegroundColor Cyan
    Start-Process $AppFile
    Write-Host "[✓] Application lancée !" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "╔═══════════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "║              CONSEILS D'UTILISATION            ║" -ForegroundColor Yellow
    Write-Host "╚═══════════════════════════════════════════════╝" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "• La sauvegarde automatique se fait toutes les minutes" -ForegroundColor White
    Write-Host "• Cliquez sur l'icône 💾 pour configurer la sauvegarde" -ForegroundColor White
    Write-Host "• Les sauvegardes sont dans le dossier 'backups'" -ForegroundColor White
    Write-Host "• Maximum $MaxBackups sauvegardes conservées" -ForegroundColor White
    Write-Host ""
    
    # Surveiller le dossier de sauvegardes
    Write-Host "[i] Surveillance des sauvegardes active..." -ForegroundColor Cyan
    Write-Host "    Appuyez sur Ctrl+C pour quitter" -ForegroundColor Gray
    Write-Host ""
    
    # Boucle de surveillance
    $lastCheck = Get-Date
    while ($true) {
        Start-Sleep -Seconds 30
        
        $newBackups = Get-ChildItem -Path $BackupFolder -Filter "*.json" | Where-Object { $_.LastWriteTime -gt $lastCheck }
        if ($newBackups) {
            foreach ($backup in $newBackups) {
                $size = [math]::Round($backup.Length / 1KB, 2)
                Write-Host "[✓] Nouvelle sauvegarde: $($backup.Name) ($size KB)" -ForegroundColor Green
            }
            $lastCheck = Get-Date
        }
    }
    
} else {
    Write-Host "[✗] ERREUR: Application introuvable !" -ForegroundColor Red
    Write-Host "    Vérifiez que index.html est présent" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Appuyez sur une touche pour fermer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")