// Patch pour app.js - Gestion des images avec liens
// Ce code remplace certaines méthodes de app.js pour supporter les liens d'images

(function() {
    // Attendre que app soit disponible
    const waitForApp = setInterval(() => {
        if (window.app) {
            clearInterval(waitForApp);
            patchAppMethods();
        }
    }, 100);
    
    function patchAppMethods() {
        const app = window.app;
        
        // Modifier processImageFiles pour supporter les liens
        app.processImageFiles = function(files) {
            if (files.length === 0) return;
            
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    // Créer un objet image avec structure étendue
                    const imageData = {
                        url: event.target.result,
                        link: '', // Lien vide par défaut
                        name: file.name
                    };
                    this.tempImages.push(imageData);
                    this.renderImagePreviews();
                };
                reader.readAsDataURL(file);
            });
        };
        
        // Modifier renderImagePreviews pour afficher les champs de liens
        app.renderImagePreviews = function() {
            const grid = document.getElementById('imagePreviewGrid');
            grid.innerHTML = this.tempImages.map((img, index) => {
                const imageData = typeof img === 'string' ? 
                    { url: img, link: '', name: 'image' } : img;
                
                return `
                    <div class="image-preview-item" data-index="${index}">
                        <img src="${imageData.url}" alt="${imageData.name || 'Image'}">
                        <button type="button" class="btn-remove-image" onclick="app.removeImage(${index})">
                            <i class="fas fa-times"></i>
                        </button>
                        <div class="image-link-container">
                            <button type="button" 
                                    class="btn-link-toggle" 
                                    onclick="imageLinkManager.showLinkInput(${index})"
                                    title="Ajouter/modifier le lien source">
                                <i class="fas fa-link"></i> Lien source
                            </button>
                            <div class="image-link-field" style="display: none;">
                                <input type="url" 
                                       class="image-link-input" 
                                       placeholder="URL source (optionnel)" 
                                       value="${imageData.link || ''}"
                                       data-index="${index}">
                                <button type="button" 
                                        class="btn-save-link"
                                        onclick="imageLinkManager.saveLinkFromInput(${index})"
                                        title="Enregistrer">
                                    <i class="fas fa-check"></i>
                                </button>
                            </div>
                            ${imageData.link ? `
                                <a href="${imageData.link}" 
                                   target="_blank" 
                                   class="image-source-indicator"
                                   title="Source : ${imageData.link}">
                                   <i class="fas fa-external-link-alt"></i> Source disponible
                                </a>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('');
            
            // Réappliquer les écouteurs d'événements si nécessaire
            if (window.imageLinkManager) {
                window.imageLinkManager.enhanceImagePreviews();
            }
        };
        
        // Modifier la méthode de sauvegarde pour gérer le nouveau format
        const originalSavePrompt = app.savePrompt;
        app.savePrompt = function(e) {
            e.preventDefault();
            
            // Normaliser les images avant sauvegarde
            if (this.tempImages && this.tempImages.length > 0) {
                this.tempImages = this.tempImages.map(img => {
                    if (typeof img === 'string') {
                        return {
                            url: img,
                            link: '',
                            name: 'image'
                        };
                    }
                    return img;
                });
            }
            
            // Appeler la méthode originale
            originalSavePrompt.call(this, e);
        };
        
        // Modifier l'affichage de la galerie pour supporter les liens
        app.updateGalleryImage = function() {
            if (this.galleryImages.length === 0) return;
            
            const currentImage = this.galleryImages[this.currentGalleryIndex];
            const imageData = typeof currentImage === 'string' ? 
                { url: currentImage, link: '' } : currentImage;
            
            const image = document.getElementById('galleryImage');
            const info = document.getElementById('galleryInfo');
            
            image.src = imageData.url;
            info.innerHTML = `
                ${this.currentGalleryIndex + 1} / ${this.galleryImages.length}
                ${imageData.link ? `
                    <a href="${imageData.link}" 
                       target="_blank" 
                       class="gallery-source-link"
                       title="Voir la source">
                       <i class="fas fa-external-link-alt"></i>
                    </a>
                ` : ''}
            `;
            
            // Gérer l'affichage des boutons
            document.getElementById('galleryPrev').style.display = 
                this.galleryImages.length > 1 ? 'block' : 'none';
            document.getElementById('galleryNext').style.display = 
                this.galleryImages.length > 1 ? 'block' : 'none';
        };
        
        // Modifier l'affichage des images dans les cartes
        const originalRenderPrompts = app.renderPrompts;
        app.renderPrompts = function(customPrompts) {
            // Appeler la méthode originale
            originalRenderPrompts.call(this, customPrompts);
            
            // Améliorer l'affichage des images avec indicateurs de liens
            document.querySelectorAll('.prompt-card').forEach(card => {
                const promptId = card.dataset.id;
                const prompt = this.prompts.find(p => p.id === promptId);
                
                if (prompt && prompt.images && prompt.images.length > 0) {
                    const imagesContainer = card.querySelector('.prompt-card-images');
                    if (imagesContainer) {
                        imagesContainer.innerHTML = prompt.images.map((img, index) => {
                            const imageData = typeof img === 'string' ? 
                                { url: img, link: '' } : img;
                            
                            return `
                                <div class="image-item ${imageData.link ? 'has-link' : ''}" 
                                     data-index="${index}">
                                    <img src="${imageData.url}" 
                                         alt="Image ${index + 1}" 
                                         onclick="app.openGallery('${promptId}', ${index})">
                                    ${imageData.link ? `
                                        <div class="image-link-badge" title="Source disponible">
                                            <a href="${imageData.link}" 
                                               target="_blank"
                                               onclick="event.stopPropagation()">
                                               <i class="fas fa-link"></i>
                                            </a>
                                        </div>
                                    ` : ''}
                                </div>
                            `;
                        }).join('');
                    }
                }
            });
        };
        
        console.log('✅ App patché pour supporter les liens d\'images');
    }
})();