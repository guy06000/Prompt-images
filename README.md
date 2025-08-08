# 📝 Prompt Manager - Gestionnaire de Prompts pour Images IA

Une application web moderne pour organiser, gérer et partager vos prompts d'IA pour la génération d'images.

## ✨ Fonctionnalités

### 🎯 Principales
- **Gestion des prompts** : Créez, éditez et supprimez vos prompts facilement
- **Catégories personnalisées** : Organisez vos prompts par catégories (Flux, Krea, Portraits, Paysages, etc.)
- **Commentaires/Notes** : Ajoutez des notes personnelles pour chaque prompt (paramètres utilisés, retours d'expérience, etc.)
- **Paramètres JSON** : Stockez les configurations exactes de vos modèles d'IA avec templates intégrés
- **Détection de doublons** : Système intelligent qui détecte les prompts identiques ou similaires en temps réel
- **Sauvegarde automatique** : Protection de vos données avec sauvegardes régulières sur votre PC
- **Galerie d'images** : Attachez et visualisez les images générées pour chaque prompt
- **Recherche instantanée** : Trouvez rapidement vos prompts par titre, contenu, description, commentaire, JSON ou tags
- **Tags** : Ajoutez des tags pour une meilleure organisation
- **Mode sombre/clair** : Interface adaptée à vos préférences

### 🔧 Fonctionnalités avancées
- **Import/Export** : Sauvegardez et partagez vos collections de prompts en JSON
- **Liens Replicate** : Intégrez des liens vers vos modèles Replicate préférés
- **Copie rapide** : Copiez un prompt dans le presse-papier en un clic
- **Exemples intégrés** : Chargez des exemples de prompts pour commencer rapidement
- **Drag & Drop** : Glissez-déposez des images directement dans le formulaire
- **Suppression de catégories** : Gérez vos catégories avec options de déplacement ou suppression des prompts associés

## 🚀 Installation

1. Clonez ou téléchargez le projet
2. Ouvrez `index.html` dans votre navigateur
3. C'est tout ! L'application fonctionne localement dans votre navigateur

### Lancement rapide (Windows)
Double-cliquez sur `lancer.bat` pour ouvrir l'application directement.

## 💡 Utilisation

### Premier lancement
Au premier lancement, l'application est vide. Vous pouvez :
- Cliquer sur **"Charger des exemples"** pour avoir des prompts de démonstration
- Ou commencer directement en créant votre premier prompt

### Créer un prompt
1. Cliquez sur **"Nouveau prompt"**
2. Remplissez les informations :
   - **Titre** : Un nom descriptif pour votre prompt
   - **Catégorie** : Sélectionnez ou créez une catégorie
   - **Lien Replicate** : (Optionnel) URL vers le modèle utilisé
   - **Description** : (Optionnel) Description courte
   - **Prompt** : Le texte complet de votre prompt
   - **Commentaire** : (Optionnel) Vos notes personnelles, paramètres utilisés, etc.
   - **Tags** : (Optionnel) Mots-clés séparés par des virgules
   - **Images** : (Optionnel) Glissez-déposez ou sélectionnez les images générées

### Organiser vos prompts
- **Catégories** : Créez des catégories personnalisées avec icônes
- **Supprimer une catégorie** : 
  - Survolez la catégorie et cliquez sur l'icône 🗑️
  - Si la catégorie contient des prompts, choisissez de :
    - Les déplacer vers une autre catégorie
    - Les supprimer avec la catégorie
- **Tags** : Utilisez des tags pour un filtrage croisé
- **Recherche** : La barre de recherche filtre en temps réel

### Fonctionnalités des commentaires
Les commentaires vous permettent de :
- Noter les paramètres exacts utilisés (CFG Scale, Steps, etc.)
- Garder trace des variations testées
- Noter ce qui fonctionne ou ne fonctionne pas
- Ajouter des conseils pour une utilisation future
- Partager des astuces avec d'autres utilisateurs lors de l'export

### Sauvegarder et partager
- **Export** : Téléchargez tous vos prompts en JSON
- **Import** : Chargez des prompts depuis un fichier JSON
- Les données sont automatiquement sauvegardées dans le localStorage du navigateur

## 🎨 Structure des catégories par défaut

- **Flux** : Prompts pour Flux (Black Forest Labs)
- **Krea** : Prompts pour Krea AI
- **Portraits** : Prompts de portraits
- **Paysages** : Prompts de paysages
- **Concept Art** : Art conceptuel et design
- **Réaliste** : Images photoréalistes
- **Artistique** : Styles artistiques variés
- **Autre** : Prompts divers

## 📁 Structure du projet

```
Pompt app/
├── index.html          # Page principale
├── app.js             # Logique de l'application
├── styles.css         # Styles CSS
├── lancer.bat         # Script de lancement Windows
├── load_examples.js   # Script pour charger des exemples
└── README.md          # Documentation
```

## 🔐 Confidentialité

- Toutes les données sont stockées localement dans votre navigateur
- Aucune donnée n'est envoyée vers un serveur
- Vos prompts restent 100% privés

## 🛠️ Technologies utilisées

- HTML5
- CSS3 (avec variables CSS pour le theming)
- JavaScript vanilla (ES6+)
- Font Awesome pour les icônes
- LocalStorage pour la persistance

## 📝 Notes de version

### v1.4.0 (Actuelle)
- ✅ Ajout de la suppression de catégories
- ✅ Options intelligentes pour gérer les prompts lors de la suppression
- ✅ Interface améliorée pour la gestion des catégories
- ✅ Protection optionnelle des catégories importantes

### v1.3.0
- ✅ Système de détection de doublons intelligent
- ✅ Détection en temps réel lors de la saisie
- ✅ Analyse globale avec nettoyage automatique
- ✅ Comparaison visuelle des prompts similaires
- ✅ Support des variations avec JSON différent

### v1.2.0
- ✅ Système de sauvegarde automatique complet
- ✅ Support des paramètres JSON avec templates
- ✅ 9 templates de modèles d'IA intégrés
- ✅ Validation et formatage JSON en temps réel

### v1.1.0
- ✅ Ajout de la fonctionnalité de commentaires/notes personnelles
- ✅ Amélioration de la recherche (inclut maintenant les commentaires)
- ✅ Bouton pour charger des exemples au premier lancement
- ✅ Correction de bugs d'interface

### v1.0.0
- Version initiale avec toutes les fonctionnalités de base

## 🤝 Contribution

N'hésitez pas à forker le projet et proposer des améliorations !

## 📄 Licence

Projet open source - Utilisez-le librement !

---

Développé avec ❤️ pour la communauté IA