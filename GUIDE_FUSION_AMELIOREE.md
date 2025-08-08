# 🔄 Système de Détection et Fusion des Doublons Amélioré

## 📋 Vue d'ensemble

Le système amélioré de détection et fusion des doublons identifie automatiquement les cartes de prompt qui ont **exactement le même contenu ET les mêmes paramètres JSON**, les met en évidence visuellement et permet de les fusionner facilement en conservant toutes les images.

## ✨ Fonctionnalités principales

### 1. **Détection automatique des doublons**
- Le système scanne automatiquement tous vos prompts au chargement
- Identifie les cartes avec un contenu ET des paramètres JSON identiques
- Affiche un compteur de doublons dans la barre d'outils

### 2. **Visualisation intuitive**
- **Bordures colorées** : Chaque groupe de doublons a une couleur unique (rouge, orange, vert, bleu, violet)
- **Badge indicateur** : Affiche le numéro du groupe, le nombre de cartes identiques et le total d'images
- **Animation subtile** : Les cartes identiques pulsent légèrement pour attirer l'attention
- **Effet de surbrillance** : Ombre colorée autour des cartes pour une meilleure visibilité

### 3. **Fusion rapide en un clic**
- **Bouton "Fusionner"** directement sur chaque carte identique
- **Modal de confirmation** avec aperçu détaillé avant fusion
- **Conservation automatique** de toutes les images uniques
- **Notification de succès** après la fusion

## 🎯 Comment utiliser le système

### Étape 1 : Activer la détection
1. Cliquez sur le bouton **"Afficher les doublons identiques"** (icône de calques) dans la barre d'outils
2. Le badge rouge indique le nombre total de doublons détectés

### Étape 2 : Identifier les groupes
- Les cartes identiques sont entourées de la même couleur
- Le badge en haut de chaque carte indique :
  - Le numéro du groupe
  - Le nombre de cartes identiques
  - Le nombre total d'images dans le groupe

### Étape 3 : Fusionner les doublons
1. Cliquez sur le bouton **"Fusionner"** sur n'importe quelle carte du groupe
2. Vérifiez les informations dans le modal de confirmation :
   - Nombre de cartes à fusionner
   - Total d'images qui seront conservées
   - Aperçu du prompt et des paramètres JSON
   - Galerie des images combinées
3. Cliquez sur **"Confirmer la fusion"**

### Résultat de la fusion
- **Carte principale conservée** : La plus ancienne du groupe
- **Images combinées** : Toutes les images uniques sont ajoutées à la carte principale
- **Métadonnées fusionnées** : 
  - Commentaires combinés
  - Tags unifiés
  - Note de fusion ajoutée avec la date et les détails
- **Cartes doublons supprimées** automatiquement
- **Sauvegarde automatique** déclenchée si activée

## 🎨 Codes couleur des groupes

- 🔴 **Rouge** (Groupe 1) : Premier groupe de doublons
- 🟠 **Orange** (Groupe 2) : Deuxième groupe
- 🟢 **Vert** (Groupe 3) : Troisième groupe
- 🔵 **Bleu** (Groupe 4) : Quatrième groupe
- 🟣 **Violet** (Groupe 5) : Cinquième groupe

Les couleurs se répètent si vous avez plus de 5 groupes.

## ⚙️ Détails techniques

### Critères de détection
Pour être considérées comme identiques, deux cartes doivent avoir :
1. **Le même contenu de prompt** (insensible à la casse et aux espaces)
2. **Les mêmes paramètres JSON** (ordre des propriétés ignoré)

### Processus de fusion
1. Les cartes sont triées par date de création
2. La plus ancienne devient la carte principale
3. Toutes les images uniques sont collectées
4. Les métadonnées sont combinées intelligemment
5. Une note de traçabilité est ajoutée

### Sauvegarde et sécurité
- Sauvegarde automatique avant fusion si activée
- Possibilité d'annuler dans le modal de confirmation
- Historique de fusion dans les commentaires de la carte

## 💡 Conseils d'utilisation

1. **Vérifiez régulièrement** : Activez la détection après l'import de nouveaux prompts
2. **Fusionnez par groupe** : Traitez un groupe à la fois pour plus de contrôle
3. **Vérifiez les images** : L'aperçu montre toutes les images qui seront conservées
4. **Utilisez les sauvegardes** : Activez la sauvegarde automatique pour plus de sécurité

## 🔧 Dépannage

### Les doublons ne sont pas détectés
- Vérifiez que le contenu est exactement identique
- Vérifiez que les paramètres JSON sont identiques (valeurs et structure)
- Rafraîchissez la page si nécessaire

### La fusion ne fonctionne pas
- Assurez-vous d'avoir au moins 2 cartes identiques
- Vérifiez qu'il y a suffisamment d'espace de stockage local
- Essayez de recharger la page

## 📊 Avantages du système

- ✅ **Gain d'espace** : Élimine les doublons inutiles
- ✅ **Organisation** : Garde une seule version de chaque prompt
- ✅ **Préservation** : Aucune image n'est perdue
- ✅ **Traçabilité** : Historique complet des fusions
- ✅ **Rapidité** : Fusion en quelques clics
- ✅ **Visuel** : Interface claire et intuitive

---

*Note : Ce système fonctionne en complément des systèmes existants de détection de doublons et de fusion. Il est spécifiquement optimisé pour les doublons parfaits (contenu + JSON identiques).*