// Système amélioré de gestion des images avec liens sources
class ImageLinkManager {
    constructor(promptManager) {
        this.promptManager = promptManager;
        this.init();
    }
    
    init() {
        // Migrer les données existantes si nécessaire
        this.migrateExistingImages();
        // Améliorer l'interface d'ajout d'images
        this.enhanceImageInterface();
    }
    
    // Migrer les images existantes vers le nouveau format
    migrateExistingImages() {
        let migrated = false;
        this.promptManager.prompts.forEach(prompt => {
            if (prompt.images && Array.isArray(prompt.images)) {
                // Vérifier si migration nécessaire
                const needsMigration = prompt.images.some(img => typeof img === 'string');
                if (needsMigration) {
                    prompt.images = prompt.images.map(img => {
                        if (typeof img === 'string') {
                            // Convertir en objet
                            return {
                                url: img,
                                link: '',
                                name: this.extractFileName(img)
                            };
                        }
                        return img;
                    });
                    migrated = true;
                }
            }
        });
        
        if (migrated) {
            this.promptManager.savePrompts();
            console.log('Migration des images effectuée');
        }
    }
    
    // Extraire le nom de fichier d'une URL
    extractFileName(url) {
        if (!url) return 'image';
        try {
            if (url.startsWith('data:')) {
                return 'image_' + Date.now();
            }
            const parts = url.split('/');
            return parts[parts.length - 1] || 'image';
        } catch (e) {
            return 'image';
        }
    }
    
    // Améliorer l'interface d'ajout d'images
    enhanceImageInterface() {
        // Observer les changements dans le modal
        const observer = new MutationObserver(() => {
            this.enhanceImagePreviews();
        });
        
        const modal = document.getElementById('promptModal');
        if (modal) {
            observer.observe(modal, { 
                childList: true, 
                subtree: true 
            });
        }
    }
    
    // Améliorer les aperçus d'images avec champs de liens
    enhanceImagePreviews() {
        const previewGrid = document.getElementById('imagePreviewGrid');
        if (!previewGrid) return;
        
        // Améliorer chaque aperçu d'image
        previewGrid.querySelectorAll('.image-preview-item').forEach((item, index) => {
            if (item.querySelector('.image-link-input')) return; // Déjà amélioré
            
            const imageData = this.promptManager.tempImages[index];
            if (!imageData) return;
            
            // Créer le champ de lien
            const linkContainer = document.createElement('div');
            linkContainer.className = 'image-link-container';
            linkContainer.innerHTML = `
                <div class="image-link-field">
                    <input type="url" 
                           class="image-link-input" 
                           placeholder="Lien source (optionnel)" 
                           value="${imageData.link || ''}"
                           data-index="${index}"
                           title="URL source de l'image pour retéléchargement">
                    <button type="button" 
                            class="btn-link-action" 
                            onclick="imageLinkManager.toggleLinkField(${index})"
                            title="Ajouter/Modifier le lien source">
                        <i class="fas fa-link"></i>
                    </button>
                </div>
                ${imageData.link ? `
                    <a href="${imageData.link}" 
                       target="_blank" 
                       class="image-source-link"
                       title="Ouvrir la source">
                       <i class="fas fa-external-link-alt"></i> Source
                    </a>
                ` : ''}
            `;
            
            item.appendChild(linkContainer);
            
            // Écouter les changements
            const input = linkContainer.querySelector('.image-link-input');
            input.addEventListener('change', (e) => {
                this.updateImageLink(index, e.target.value);
            });
        });
    }
    
    // Basculer l'affichage du champ de lien
    toggleLinkField(index) {
        const item = document.querySelectorAll('.image-preview-item')[index];
        if (!item) return;
        
        const linkField = item.querySelector('.image-link-field');
        const input = item.querySelector('.image-link-input');
        
        if (linkField.style.display === 'none' || !linkField.style.display) {
            linkField.style.display = 'flex';
            input.focus();
        } else {
            linkField.style.display = 'none';
        }
    }
    
    // Mettre à jour le lien d'une image
    updateImageLink(index, link) {
        if (this.promptManager.tempImages[index]) {
            // S'assurer que c'est un objet
            if (typeof this.promptManager.tempImages[index] === 'string') {
                this.promptManager.tempImages[index] = {
                    url: this.promptManager.tempImages[index],
                    link: link,
                    name: this.extractFileName(this.promptManager.tempImages[index])
                };
            } else {
                this.promptManager.tempImages[index].link = link;
            }
            
            // Mettre à jour l'affichage du lien source
            this.updateSourceLinkDisplay(index);
        }
    }
    
    // Mettre à jour l'affichage du lien source
    updateSourceLinkDisplay(index) {
        const item = document.querySelectorAll('.image-preview-item')[index];
        if (!item) return;
        
        const imageData = this.promptManager.tempImages[index];
        const linkContainer = item.querySelector('.image-link-container');
        
        if (imageData && imageData.link) {
            // Ajouter ou mettre à jour le lien source
            let sourceLink = linkContainer.querySelector('.image-source-link');
            if (!sourceLink) {
                sourceLink = document.createElement('a');
                sourceLink.className = 'image-source-link';
                sourceLink.target = '_blank';
                sourceLink.innerHTML = '<i class="fas fa-external-link-alt"></i> Source';
                linkContainer.appendChild(sourceLink);
            }
            sourceLink.href = imageData.link;
            sourceLink.title = 'Ouvrir la source';
        } else {
            // Supprimer le lien source s'il existe
            const sourceLink = linkContainer.querySelector('.image-source-link');
            if (sourceLink) sourceLink.remove();
        }
    }
    
    // Fusionner les images avec leurs liens lors de la fusion de prompts
    mergeImagesWithLinks(promptsToMerge) {
        const mergedImages = new Map();
        
        promptsToMerge.forEach(prompt => {
            if (prompt.images && Array.isArray(prompt.images)) {
                prompt.images.forEach(img => {
                    let imageData;
                    
                    // Gérer les deux formats (string ou objet)
                    if (typeof img === 'string') {
                        imageData = {
                            url: img,
                            link: '',
                            name: this.extractFileName(img)
                        };
                    } else {
                        imageData = img;
                    }
                    
                    // Utiliser l'URL comme clé pour éviter les doublons
                    const key = imageData.url;
                    
                    // Si l'image existe déjà, fusionner les liens
                    if (mergedImages.has(key)) {
                        const existing = mergedImages.get(key);
                        // Garder le lien le plus pertinent (non vide)
                        if (!existing.link && imageData.link) {
                            existing.link = imageData.link;
                        }
                    } else {
                        mergedImages.set(key, imageData);
                    }
                });
            }
        });
        
        return Array.from(mergedImages.values());
    }
    
    // Préparer les images pour la sauvegarde
    prepareImagesForSave(tempImages) {
        if (!tempImages || !Array.isArray(tempImages)) return [];
        
        return tempImages.map(img => {
            if (typeof img === 'string') {
                return {
                    url: img,
                    link: '',
                    name: this.extractFileName(img)
                };
            }
            return img;
        });
    }
    
    // Charger les images dans le formulaire d'édition
    loadImagesForEdit(images) {
        if (!images || !Array.isArray(images)) return [];
        
        return images.map(img => {
            if (typeof img === 'string') {
                return {
                    url: img,
                    link: '',
                    name: this.extractFileName(img)
                };
            }
            return img;
        });
    }
    
    // Afficher les images dans la galerie avec leurs liens
    renderImageGallery(images, promptId) {
        if (!images || images.length === 0) return '';
        
        return images.map((img, index) => {
            const imageData = typeof img === 'string' ? 
                { url: img, link: '', name: this.extractFileName(img) } : img;
            
            return `
                <div class="gallery-image-item" data-index="${index}">
                    <img src="${imageData.url}" 
                         alt="${imageData.name || 'Image'}" 
                         onclick="app.openImageGallery('${promptId}', ${index})">
                    ${imageData.link ? `
                        <div class="image-actions">
                            <a href="${imageData.link}" 
                               target="_blank" 
                               class="image-source-btn"
                               title="Voir la source"
                               onclick="event.stopPropagation()">
                               <i class="fas fa-link"></i>
                            </a>
                            <a href="${imageData.link}" 
                               download
                               class="image-download-btn"
                               title="Télécharger depuis la source"
                               onclick="event.stopPropagation()">
                               <i class="fas fa-download"></i>
                            </a>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }
    
    // Créer l'aperçu d'image avec gestion du lien
    createImagePreview(imageData, index) {
        const data = typeof imageData === 'string' ? 
            { url: imageData, link: '', name: this.extractFileName(imageData) } : imageData;
        
        const div = document.createElement('div');
        div.className = 'image-preview-item';
        div.dataset.index = index;
        
        div.innerHTML = `
            <img src="${data.url}" alt="${data.name || 'Image'}">
            <button type="button" 
                    class="btn-remove-image" 
                    onclick="app.removeImage(${index})"
                    title="Supprimer l'image">
                <i class="fas fa-times"></i>
            </button>
            <div class="image-link-container">
                <button type="button" 
                        class="btn-link-toggle" 
                        onclick="imageLinkManager.showLinkInput(${index})"
                        title="Ajouter/modifier le lien source">
                    <i class="fas fa-link"></i>
                </button>
                <div class="image-link-field" style="display: none;">
                    <input type="url" 
                           class="image-link-input" 
                           placeholder="URL source (optionnel)" 
                           value="${data.link || ''}"
                           data-index="${index}">
                    <button type="button" 
                            class="btn-save-link"
                            onclick="imageLinkManager.saveLinkFromInput(${index})"
                            title="Enregistrer le lien">
                        <i class="fas fa-check"></i>
                    </button>
                </div>
                ${data.link ? `
                    <a href="${data.link}" 
                       target="_blank" 
                       class="image-source-indicator"
                       title="Source disponible">
                       <i class="fas fa-external-link-alt"></i>
                    </a>
                ` : ''}
            </div>
        `;
        
        return div;
    }
    
    // Afficher le champ de saisie du lien
    showLinkInput(index) {
        const items = document.querySelectorAll('.image-preview-item');
        const item = items[index];
        if (!item) return;
        
        const field = item.querySelector('.image-link-field');
        const button = item.querySelector('.btn-link-toggle');
        
        if (field.style.display === 'none') {
            field.style.display = 'flex';
            field.querySelector('.image-link-input').focus();
            button.classList.add('active');
        } else {
            field.style.display = 'none';
            button.classList.remove('active');
        }
    }
    
    // Sauvegarder le lien depuis le champ de saisie
    saveLinkFromInput(index) {
        const items = document.querySelectorAll('.image-preview-item');
        const item = items[index];
        if (!item) return;
        
        const input = item.querySelector('.image-link-input');
        const link = input.value.trim();
        
        this.updateImageLink(index, link);
        
        // Cacher le champ
        const field = item.querySelector('.image-link-field');
        field.style.display = 'none';
        
        // Mettre à jour l'indicateur
        this.updateLinkIndicator(item, link);
    }
    
    // Mettre à jour l'indicateur de lien
    updateLinkIndicator(item, link) {
        let indicator = item.querySelector('.image-source-indicator');
        
        if (link) {
            if (!indicator) {
                indicator = document.createElement('a');
                indicator.className = 'image-source-indicator';
                indicator.target = '_blank';
                indicator.title = 'Source disponible';
                indicator.innerHTML = '<i class="fas fa-external-link-alt"></i>';
                item.querySelector('.image-link-container').appendChild(indicator);
            }
            indicator.href = link;
        } else if (indicator) {
            indicator.remove();
        }
    }
}

// Initialiser le gestionnaire de liens d'images
let imageLinkManager;
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.app) {
            imageLinkManager = new ImageLinkManager(window.app);
            window.imageLinkManager = imageLinkManager;
        }
    }, 400);
});