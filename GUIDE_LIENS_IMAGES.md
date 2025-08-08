# 🔗 Système de Liens d'Images - Documentation

## 📋 Vue d'ensemble

Le système de liens d'images permet d'associer une URL source à chaque image de vos prompts. Cela vous permet de :
- **Retélécharger** l'image depuis sa source originale
- **Conserver la référence** de où l'image a été générée (Replicate, MidJourney, DALL-E, etc.)
- **Fusionner intelligemment** les images avec leurs liens lors de la fusion de prompts identiques

## ✨ Fonctionnalités

### 1. **Ajout de liens aux images**
- Pour chaque image uploadée, vous pouvez ajouter un lien source optionnel
- Le lien est sauvegardé avec l'image dans la base de données
- Possibilité d'ajouter/modifier le lien à tout moment

### 2. **Fusion intelligente**
Lors de la fusion de prompts identiques :
- **Toutes les images sont conservées** (pas de doublons)
- **Les liens sources sont préservés** 
- Si deux images identiques ont des liens différents, le lien non-vide est conservé
- La galerie finale contient toutes les images uniques avec leurs liens

### 3. **Accès rapide aux sources**
- Icône de lien sur chaque image qui a une source
- Clic pour ouvrir la source dans un nouvel onglet
- Possibilité de télécharger depuis la source

## 🎯 Comment utiliser

### Ajouter un lien à une nouvelle image

1. **Uploadez votre image** normalement (glisser-déposer ou bouton)
2. **Cliquez sur le bouton "🔗 Lien source"** sous l'aperçu de l'image
3. **Entrez l'URL source** dans le champ qui apparaît
4. **Cliquez sur ✓** pour enregistrer le lien

### Ajouter un lien à une image existante

1. **Éditez le prompt** contenant l'image
2. **Cliquez sur "🔗 Lien source"** sous l'image
3. **Ajoutez ou modifiez l'URL**
4. **Sauvegardez le prompt**

### Visualiser les liens

#### Dans la galerie d'images
- Les images avec liens ont un **badge 🔗** 
- **Survolez l'image** pour voir les options
- Cliquez sur **"Source"** pour ouvrir le lien
- Cliquez sur **"⬇"** pour télécharger depuis la source

#### Dans les cartes de prompts
- Un petit **indicateur de lien** apparaît sur les images avec source
- Cliquez dessus pour ouvrir la source

## 🔄 Fusion avec conservation des liens

### Exemple pratique

**Situation initiale :**
- Prompt A : "Portrait réaliste" 
  - Image 1 (lien: replicate.com/abc123)
  - Image 2 (pas de lien)
- Prompt B : "Portrait réaliste" (identique)
  - Image 3 (lien: midjourney.com/xyz789)
  - Image 2 (lien: dall-e.com/def456) ← même image mais avec lien

**Après fusion :**
- Prompt fusionné : "Portrait réaliste"
  - Image 1 (lien: replicate.com/abc123) ✅
  - Image 2 (lien: dall-e.com/def456) ✅ Lien récupéré
  - Image 3 (lien: midjourney.com/xyz789) ✅

## 💡 Cas d'usage recommandés

### 1. **Génération sur plusieurs plateformes**
Vous testez le même prompt sur :
- Replicate
- MidJourney  
- DALL-E
- Stable Diffusion

→ Gardez les liens sources pour comparer et retélécharger

### 2. **Collaboration en équipe**
- Partagez vos prompts avec les sources
- Les collègues peuvent accéder aux images originales
- Traçabilité complète de la génération

### 3. **Archivage professionnel**
- Conservation des métadonnées de génération
- Preuve de source pour usage commercial
- Historique complet du processus créatif

## 🛠️ Détails techniques

### Format de stockage

Les images sont maintenant stockées comme objets :

```javascript
{
  url: "data:image/png;base64...", // ou URL de l'image
  link: "https://replicate.com/...", // URL source (optionnel)
  name: "portrait_001.png" // Nom du fichier
}
```

### Rétrocompatibilité

- Les anciennes images (format string) sont automatiquement migrées
- Le système détecte et convertit au nouveau format
- Aucune perte de données

### API disponible

```javascript
// Ajouter un lien à une image
imageLinkManager.updateImageLink(index, url);

// Fusionner des images avec leurs liens
imageLinkManager.mergeImagesWithLinks(prompts);

// Préparer les images pour la sauvegarde
imageLinkManager.prepareImagesForSave(images);
```

## ⚙️ Configuration

Le système est **activé par défaut** et ne nécessite aucune configuration.

Pour désactiver temporairement l'affichage des liens :
- Les liens restent sauvegardés mais peuvent être masqués via CSS
- Ajoutez `.image-link-container { display: none; }` à votre thème

## 🔧 Dépannage

### Les liens ne s'affichent pas
1. Rafraîchissez la page (F5)
2. Vérifiez que `image-link-manager.js` est chargé
3. Ouvrez la console (F12) et cherchez les erreurs

### Les liens ne sont pas sauvegardés
1. Vérifiez l'espace de stockage disponible
2. Assurez-vous de cliquer sur ✓ après avoir entré le lien
3. Sauvegardez le prompt après modification

### Problème lors de la fusion
1. Utilisez l'outil de nettoyage si le stockage est plein
2. Exportez vos données avant la fusion
3. Vérifiez que les prompts sont vraiment identiques

## 📊 Avantages

- ✅ **Traçabilité complète** : Gardez l'historique de génération
- ✅ **Économie d'espace** : Téléchargez depuis la source au lieu de stocker localement
- ✅ **Fusion intelligente** : Aucune perte de liens lors des fusions
- ✅ **Interface intuitive** : Ajout de liens en 2 clics
- ✅ **Rétrocompatible** : Fonctionne avec vos données existantes

## 🚀 Prochaines améliorations prévues

- Import automatique des métadonnées depuis les URLs
- Extraction automatique des paramètres de génération
- Synchronisation avec les APIs des plateformes
- Export des liens dans les sauvegardes

---

*Note : Cette fonctionnalité est particulièrement utile pour les professionnels qui génèrent des images sur plusieurs plateformes et ont besoin de maintenir une traçabilité complète de leur travail créatif.*