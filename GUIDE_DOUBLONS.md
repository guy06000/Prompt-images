# 🔍 Guide du Système de Détection de Doublons

## 📌 Vue d'ensemble

Le système de détection de doublons intelligent analyse vos prompts pour identifier :
- **Doublons exacts** : Prompts identiques (contenu + JSON)
- **Doublons partiels** : Même contenu mais JSON différent
- **Prompts similaires** : Contenu similaire à 80% ou plus

## 🎯 Fonctionnalités principales

### 1. Détection en temps réel
Pendant que vous tapez un nouveau prompt, le système :
- ✅ Vérifie instantanément les doublons
- ⚠️ Affiche une alerte si un doublon est détecté
- 📊 Indique le pourcentage de similarité
- 🔗 Permet d'ouvrir le doublon pour comparaison

### 2. Analyse globale
Le bouton **🔍 Clone** dans la barre d'outils permet de :
- Scanner tous les prompts existants
- Grouper les doublons par similarité
- Nettoyer les doublons exacts en un clic
- Comparer visuellement les prompts similaires

### 3. Indicateurs visuels

#### En édition :
- 🔴 **Rouge** : Prompt identique détecté (100% match)
- 🟡 **Orange** : Prompt similaire trouvé (80-99% match)
- 🔵 **Info** : JSON différent malgré contenu identique

#### Dans la liste :
- **Badge numérique** sur le bouton clone : Nombre total de doublons
- **Couleur du bouton** : Rouge si des doublons exacts existent

## 🚀 Comment utiliser

### Vérification lors de la création

1. **Créez un nouveau prompt**
2. Commencez à taper le contenu
3. Si un doublon existe, une alerte apparaît
4. Cliquez sur "Voir" pour comparer
5. Décidez si vous voulez continuer ou modifier

### Analyse complète

1. **Cliquez sur l'icône 🔍 Clone**
2. Le modal affiche tous les groupes de doublons
3. Pour chaque groupe :
   - L'original est affiché en premier
   - Les doublons sont listés avec leur similarité
   - Actions disponibles : Comparer, Éditer, Supprimer

### Nettoyage automatique

1. Dans le modal des doublons
2. Cliquez sur **"Nettoyer les doublons exacts"**
3. Seuls les doublons 100% identiques sont supprimés
4. Les prompts avec JSON différent sont conservés

## 📊 Algorithme de détection

### Calcul de similarité

Le système utilise l'**algorithme de Levenshtein** pour calculer :
- **Distance d'édition** entre deux textes
- **Pourcentage de similarité** (0-100%)
- **Comparaison normalisée** (insensible à la casse)

### Règles de détection

| Type | Contenu | JSON | Action suggérée |
|------|---------|------|-----------------|
| **Doublon exact** | 100% identique | 100% identique | Supprimer |
| **Doublon partiel** | 100% identique | Différent | Réviser/Fusionner |
| **Similaire** | 80-99% | Variable | Comparer et décider |
| **Unique** | <80% | Variable | Conserver |

## 🎨 Types de doublons

### 1. Doublons exacts (Rouge)
- Contenu identique ET JSON identique
- Généralement créés par erreur
- Peuvent être supprimés automatiquement

### 2. Doublons partiels (Orange)
- Contenu identique MAIS JSON différent
- Souvent des variations volontaires
- Conservés par défaut (paramètres différents)

### 3. Prompts similaires (Bleu)
- Contenu similaire à 80% ou plus
- Variations créatives du même concept
- Nécessitent une révision manuelle

## ⚙️ Configuration JSON

Le système considère que deux prompts avec **JSON différent ne sont PAS des doublons complets**, même si le contenu est identique. Cela permet de :

- Garder plusieurs versions avec différents paramètres
- Tester différentes configurations
- Optimiser pour différents modèles

### Exemple pratique

**Prompt 1:**
```
Contenu: "A beautiful sunset over the ocean"
JSON: {"model": "flux", "steps": 25}
```

**Prompt 2:**
```
Contenu: "A beautiful sunset over the ocean"
JSON: {"model": "sdxl", "steps": 30}
```

→ **Résultat** : Doublon partiel (conservé car JSON différent)

## 🛠️ Actions disponibles

### Sur un doublon détecté

1. **Comparer** : Affiche côte à côte les deux prompts
2. **Éditer** : Ouvre le prompt en édition
3. **Supprimer** : Retire le doublon
4. **Ignorer** : Continue sans modification

### Nettoyage en masse

- **Automatique** : Supprime uniquement les doublons 100% identiques
- **Manuel** : Permet de choisir prompt par prompt
- **Intelligent** : Conserve les variations avec JSON différent

## 💡 Conseils d'utilisation

### Bonnes pratiques

1. **Vérifiez régulièrement** : Cliquez sur l'icône clone chaque semaine
2. **Nommez distinctement** : Utilisez des titres descriptifs
3. **Documentez les variations** : Utilisez les commentaires pour expliquer
4. **Gardez les variantes utiles** : JSON différent = variation légitime

### Optimisation

- **Fusionnez les similaires** : Combinez les prompts à 90%+ de similarité
- **Organisez par catégorie** : Facilite la détection visuelle
- **Utilisez les tags** : Pour différencier les variations

## 🚨 Résolution de problèmes

### Le détecteur ne fonctionne pas

1. Rafraîchissez la page (F5)
2. Vérifiez que JavaScript est activé
3. Effacez le cache du navigateur

### Trop de faux positifs

- Ajustez mentalement le seuil (80% par défaut)
- Ignorez les alertes pour les variations volontaires
- Utilisez des JSON différents pour les variantes

### Performance lente

- Limitez le nombre de prompts (< 1000 recommandé)
- Nettoyez régulièrement les doublons
- Utilisez un navigateur moderne

## 📈 Statistiques

Le système affiche :
- **Nombre total de doublons**
- **Groupes de doublons**
- **Pourcentage de similarité**
- **Type de doublon** (exact/partiel/similaire)

## 🔐 Sécurité

- Analyse 100% locale
- Aucune donnée envoyée en ligne
- Suppression réversible via sauvegarde

## 🎯 Cas d'usage

### Pour les créateurs
- Éviter les répétitions involontaires
- Maintenir une bibliothèque propre
- Identifier les patterns récurrents

### Pour les équipes
- Standardiser les prompts
- Éviter le travail en double
- Partager des variations optimisées

### Pour l'optimisation
- Comparer les performances
- Tester des variations
- Identifier les meilleures versions

---

*Système de détection de doublons v1.0 - Gardez vos prompts uniques et organisés !* 🔍