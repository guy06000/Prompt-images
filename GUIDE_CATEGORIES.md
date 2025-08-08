# 📁 Guide de Gestion des Catégories

## 🎯 Vue d'ensemble

Le système de gestion des catégories vous permet d'organiser vos prompts de manière efficace avec des options avancées de suppression et de réorganisation.

## ✨ Fonctionnalités

### 1. Créer une catégorie
- Cliquez sur **"+ Nouvelle catégorie"** dans la barre latérale
- Entrez un nom descriptif
- Choisissez une icône Font Awesome (optionnel)
- Exemple : `fa-robot` pour l'IA, `fa-paint-brush` pour l'art

### 2. Supprimer une catégorie
1. **Survolez** la catégorie dans la liste
2. **Cliquez** sur l'icône 🗑️ qui apparaît
3. **Choisissez** l'action pour les prompts existants

### 3. Options de suppression

#### Catégorie vide
- Confirmation simple
- Suppression immédiate
- Aucun impact sur les prompts

#### Catégorie avec prompts
Deux options vous sont proposées :

**Option 1 : Déplacer les prompts**
- Conserve tous les prompts
- Les déplace vers une autre catégorie
- Idéal pour réorganiser

**Option 2 : Supprimer tout**
- Supprime la catégorie ET les prompts
- Action irréversible
- Double confirmation requise

## 🛡️ Catégories protégées

Vous pouvez protéger certaines catégories importantes en modifiant le code :

```javascript
// Dans app.js, méthode isProtectedCategory
const protectedCategories = ['flux', 'krea']; // Ajoutez vos catégories ici
```

Les catégories protégées :
- Ne peuvent pas être supprimées
- N'affichent pas le bouton de suppression
- Garantissent l'intégrité de votre organisation

## 📊 Indicateurs visuels

### Dans la liste des catégories
- **Nombre de prompts** : Badge indiquant le total
- **Icône de suppression** : Visible au survol
- **Catégorie active** : Fond coloré

### Dans le modal de suppression
- **Avertissement orange** : Nombre de prompts concernés
- **Options claires** : Radio buttons pour choisir l'action
- **Boutons d'action** : Annuler (gris) / Supprimer (rouge)

## 💡 Cas d'usage

### Réorganisation
1. Créez une nouvelle catégorie améliorée
2. Supprimez l'ancienne en déplaçant les prompts
3. Résultat : Structure optimisée sans perte

### Nettoyage
1. Identifiez les catégories obsolètes
2. Supprimez avec leurs prompts si non pertinents
3. Résultat : Base de données allégée

### Migration
1. Fusionnez plusieurs catégories similaires
2. Déplacez tous les prompts vers une seule
3. Supprimez les catégories redondantes

## ⚠️ Précautions

### Avant de supprimer
- **Vérifiez** le nombre de prompts
- **Exportez** vos données (bouton Export)
- **Considérez** le déplacement plutôt que la suppression

### Sauvegarde automatique
- La suppression déclenche une sauvegarde
- Les données sont stockées dans localStorage
- Utilisez le système de backup pour plus de sécurité

## 🔄 Workflow recommandé

### Pour supprimer une catégorie
1. **Analysez** : Vérifiez les prompts contenus
2. **Décidez** : Déplacer ou supprimer ?
3. **Agissez** : Cliquez sur le bouton de suppression
4. **Confirmez** : Validez votre choix

### Pour réorganiser
1. **Planifiez** : Définissez la nouvelle structure
2. **Créez** : Ajoutez les nouvelles catégories
3. **Migrez** : Déplacez les prompts
4. **Nettoyez** : Supprimez les anciennes catégories

## 🎨 Personnalisation des icônes

Les catégories utilisent Font Awesome 6. Exemples d'icônes :

| Catégorie | Icône | Code |
|-----------|-------|------|
| Portraits | 👤 | `fa-user` |
| Paysages | 🏔️ | `fa-mountain` |
| Cyberpunk | 🤖 | `fa-robot` |
| Fantasy | 🐉 | `fa-dragon` |
| Code | 💻 | `fa-code` |
| Art | 🎨 | `fa-palette` |
| Photo | 📷 | `fa-camera` |
| Vidéo | 🎬 | `fa-video` |

## 🚀 Raccourcis

### Actions rapides
- **Survol** : Affiche le bouton de suppression
- **Clic** : Filtre par catégorie
- **Clic sur 🗑️** : Ouvre le modal de suppression

### Navigation
- Catégorie "Tous" : Toujours disponible, non supprimable
- Retour automatique à "Tous" si catégorie active supprimée

## 📈 Statistiques

Le système affiche :
- **Nombre total de prompts** par catégorie
- **Catégorie active** en surbrillance
- **Impact de la suppression** dans le modal

## 🔐 Sécurité

### Confirmations multiples
1. Premier clic : Ouvre le modal
2. Choix de l'action : Radio buttons
3. Confirmation finale : Bouton "Supprimer"
4. Double confirmation pour suppression totale

### Récupération
- Sauvegarde automatique avant suppression
- Export manuel recommandé
- LocalStorage conserve l'historique

## 💭 Bonnes pratiques

### Organisation optimale
- **5-10 catégories** maximum pour rester gérable
- **Noms descriptifs** et uniques
- **Icônes cohérentes** pour l'identification visuelle
- **Révision régulière** de la structure

### Maintenance
- Nettoyez les catégories vides mensuellement
- Fusionnez les catégories similaires
- Archivez plutôt que supprimer si incertain

## 🆘 Résolution de problèmes

### La suppression ne fonctionne pas
1. Rafraîchissez la page (F5)
2. Vérifiez la console (F12) pour les erreurs
3. Assurez-vous que JavaScript est activé

### Prompts perdus après suppression
1. Vérifiez le système de sauvegarde automatique
2. Consultez le dossier "backups"
3. Utilisez la fonction Import pour restaurer

### Catégorie ne peut pas être supprimée
- Vérifiez si elle est protégée dans le code
- Assurez-vous d'avoir les droits (pas en mode lecture seule)

## 🎯 Conseils avancés

### Structure idéale
```
├── Par type de modèle (Flux, SDXL, Midjourney)
├── Par style (Réaliste, Artistique, Cartoon)
├── Par sujet (Portraits, Paysages, Objets)
└── Par projet (Client A, Projet B, Tests)
```

### Nommage efficace
- Préfixes pour grouper : "AI-", "Art-", "Test-"
- Suffixes pour versions : "-v1", "-final", "-draft"
- Emojis pour identification rapide

---

*Système de gestion des catégories v1.4.0 - Organisez vos prompts efficacement !* 📁