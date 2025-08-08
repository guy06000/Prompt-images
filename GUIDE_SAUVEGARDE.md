# 💾 Système de Sauvegarde Automatique - Guide d'utilisation

## 🎯 Vue d'ensemble

Le système de sauvegarde automatique protège vos prompts en créant des sauvegardes régulières sur votre PC. Les données sont sauvegardées à trois niveaux :

1. **LocalStorage** (navigateur) - Sauvegarde instantanée
2. **Sauvegarde automatique** - Toutes les minutes (configurable)
3. **Fichiers de sauvegarde** - Sur votre disque dur

## 🚀 Configuration rapide

### 1. Activer la sauvegarde automatique

1. Ouvrez l'application
2. Cliquez sur l'icône **💾** dans la barre d'outils (en haut)
3. Cochez **"Activer la sauvegarde automatique"**
4. Choisissez l'intervalle de sauvegarde (30 sec, 1 min, 5 min, ou 10 min)
5. Cliquez sur **"Sauvegarder"**

### 2. Indicateur de statut

En bas à droite de l'en-tête, vous verrez :
- 🟢 **Vert** : Sauvegarde active avec l'heure de la dernière sauvegarde
- ⚪ **Gris** : Sauvegarde inactive

## 📁 Méthodes de sauvegarde

### Méthode 1 : LocalStorage (Automatique)
- ✅ **Toujours actif**
- Sauvegarde instantanée dans le navigateur
- Survit aux fermetures du navigateur
- Limité à ~10MB de données

### Méthode 2 : Export manuel
1. Cliquez sur **"Sauvegarder maintenant"** dans le panneau de configuration
2. Un fichier JSON sera téléchargé avec la date et l'heure
3. Format : `prompts_backup_2024-01-15T10-30-45.json`

### Méthode 3 : Dossier de sauvegarde (Chrome/Edge uniquement)
1. Cliquez sur **"Choisir le dossier de sauvegarde"**
2. Sélectionnez un dossier sur votre PC
3. Les sauvegardes seront créées automatiquement dans ce dossier
4. **Note** : Nécessite l'autorisation du navigateur

## 🔄 Restauration des données

### Restauration automatique au démarrage
L'application vérifie automatiquement s'il existe une sauvegarde et la restaure si nécessaire.

### Restauration manuelle
1. Cliquez sur l'icône **💾**
2. Cliquez sur **"Charger une sauvegarde"**
3. Sélectionnez votre fichier de sauvegarde JSON
4. Les données seront restaurées immédiatement

## 🛠️ Scripts de lancement avancés

### Option 1 : Batch simple (Windows)
Double-cliquez sur `lancer_avec_backup.bat`
- Crée automatiquement un dossier "backups"
- Archive les sauvegardes existantes
- Lance l'application

### Option 2 : PowerShell avancé
Clic droit sur `StartWithBackup.ps1` → "Exécuter avec PowerShell"
- Surveillance en temps réel des sauvegardes
- Nettoyage automatique des anciennes sauvegardes (garde les 10 dernières)
- Affichage détaillé des informations

## 📊 Structure des sauvegardes

Chaque sauvegarde contient :
```json
{
  "prompts": [...],           // Tous vos prompts
  "categories": [...],        // Toutes vos catégories
  "backupDate": "2024-01-15", // Date de sauvegarde
  "version": "1.2.0",         // Version de l'app
  "totalPrompts": 42,         // Nombre de prompts
  "totalCategories": 8        // Nombre de catégories
}
```

## 🔐 Sécurité et confidentialité

- ✅ **100% local** - Aucune donnée envoyée sur Internet
- ✅ **Chiffrement** - Utilise le chiffrement du navigateur
- ✅ **Contrôle total** - Vous choisissez où sauvegarder
- ✅ **Portable** - Les sauvegardes peuvent être partagées/déplacées

## ⚡ Déclencheurs de sauvegarde

La sauvegarde automatique se déclenche lors de :
- ➕ Ajout d'un nouveau prompt
- ✏️ Modification d'un prompt existant
- 🗑️ Suppression d'un prompt
- 📁 Création/modification de catégorie
- ⏰ Intervalle de temps écoulé

## 🚨 Résolution de problèmes

### La sauvegarde ne fonctionne pas
1. Vérifiez que JavaScript est activé
2. Vérifiez l'espace disque disponible
3. Essayez un autre navigateur (Chrome/Edge recommandé)

### Impossible de choisir un dossier
- Fonctionnalité disponible uniquement sur Chrome/Edge
- Utilisez l'export manuel comme alternative

### Les données sont perdues
1. Vérifiez le dossier "backups"
2. Regardez dans les téléchargements
3. Vérifiez le localStorage : F12 → Application → Local Storage

## 💡 Conseils et bonnes pratiques

1. **Sauvegarde régulière** : Configurez sur 1 minute pour une protection maximale
2. **Export hebdomadaire** : Faites un export manuel chaque semaine
3. **Dossier cloud** : Choisissez un dossier synchronisé (Google Drive, OneDrive)
4. **Nommage** : Gardez les noms de fichiers avec dates pour l'historique
5. **Test de restauration** : Testez régulièrement la restauration

## 📈 Limitations

- **LocalStorage** : Maximum ~10MB (environ 1000 prompts avec images)
- **Fichiers** : Pas de limite de taille
- **Navigateurs supportés** : 
  - Chrome ✅ (toutes fonctionnalités)
  - Edge ✅ (toutes fonctionnalités)  
  - Firefox ⚠️ (pas de sélection de dossier)
  - Safari ⚠️ (pas de sélection de dossier)

## 🆘 Support

En cas de problème :
1. Consultez d'abord cette documentation
2. Vérifiez la console du navigateur (F12)
3. Essayez de désactiver/réactiver la sauvegarde
4. Redémarrez le navigateur

---

*Système de sauvegarde v1.0 - Vos données sont précieuses, protégez-les !* 💾