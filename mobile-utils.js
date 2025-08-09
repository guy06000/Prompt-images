// ========================================
// FONCTIONS JAVASCRIPT POUR MOBILE
// ========================================

// Fonction pour générer une carte de prompt optimisée mobile
function createPromptCard(prompt) {
    // Récupérer la première image si disponible
    const firstImage = prompt.images && prompt.images.length > 0 ? prompt.images[0] : null;
    
    // Créer les tags HTML
    const tagsHtml = prompt.tags && prompt.tags.length > 0 
        ? prompt.tags.map(tag => `<span class="prompt-card-tag">${escapeHtml(tag)}</span>`).join('')
        : '';
    
    // Créer l'élément de carte
    const card = document.createElement('div');
    card.className = 'prompt-card';
    card.dataset.promptId = prompt.id;
    
    card.innerHTML = `
        <!-- Image en haut de la carte -->
        <div class="prompt-card-image">
            ${firstImage 
                ? `<img src="${firstImage}" alt="${escapeHtml(prompt.title)}" loading="lazy">`
                : `<div class="no-image">
                       <i class="fas fa-image"></i>
                   </div>`
            }
            <!-- Badge de catégorie -->
            <span class="category-badge">
                <i class="${getCategoryIcon(prompt.category)}"></i> ${escapeHtml(prompt.category || 'Sans catégorie')}
            </span>
        </div>
        
        <!-- Contenu de la carte -->
        <div class="prompt-card-content">
            <!-- En-tête avec titre et actions -->
            <div class="prompt-card-header">
                <h3 class="prompt-card-title">${escapeHtml(prompt.title)}</h3>
                <div class="prompt-card-actions">
                    <button onclick="copyPrompt('${prompt.id}')" title="Copier">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button onclick="editPrompt('${prompt.id}')" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deletePrompt('${prompt.id}')" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <!-- Description -->
            ${prompt.description 
                ? `<p class="prompt-card-description">${escapeHtml(prompt.description)}</p>`
                : ''
            }
            
            <!-- Prompt avec fond différent -->
            <div class="prompt-card-prompt">
                <div class="prompt-card-prompt-text">${escapeHtml(prompt.prompt)}</div>
            </div>
            
            <!-- Tags -->
            ${tagsHtml ? `<div class="prompt-card-tags">${tagsHtml}</div>` : ''}
            
            <!-- Footer avec métadonnées -->
            <div class="prompt-card-footer">
                <div class="prompt-card-meta">
                    <span><i class="fas fa-images"></i> ${prompt.images?.length || 0}</span>
                    <span><i class="fas fa-comment"></i> ${prompt.comment ? '1' : '0'}</span>
                    <span><i class="fas fa-code"></i> ${prompt.json ? 'JSON' : '-'}</span>
                </div>
            </div>
        </div>
    `;
    
    // Ajouter l'événement de clic pour ouvrir les détails
    card.addEventListener('click', (e) => {
        // Ne pas ouvrir si on clique sur un bouton
        if (!e.target.closest('button')) {
            showPromptDetails(prompt.id);
        }
    });
    
    return card;
}

// Fonction pour obtenir l'icône de catégorie
function getCategoryIcon(category) {
    const icons = {
        'Flux': 'fa-stream',
        'Krea': 'fa-palette',
        'Portraits': 'fa-user-circle',
        'Paysages': 'fa-mountain',
        'Concept Art': 'fa-drafting-compass',
        'Réaliste': 'fa-camera',
        'Artistique': 'fa-paint-brush',
        'Autre': 'fa-folder'
    };
    return icons[category] || 'fa-folder';
}

// Fonction pour échapper le HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Fonction pour afficher les détails d'un prompt
function showPromptDetails(promptId) {
    const prompt = getPromptById(promptId);
    if (!prompt) return;
    
    // Créer une modal de détails optimisée pour mobile
    const modal = document.createElement('div');
    modal.className = 'modal prompt-details-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${escapeHtml(prompt.title)}</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="modal-body">
                <!-- Galerie d'images -->
                ${prompt.images && prompt.images.length > 0 
                    ? `<div class="prompt-images-gallery">
                           ${prompt.images.map(img => 
                               `<img src="${img}" alt="Image" onclick="openImageFullscreen('${img}')">`
                           ).join('')}
                       </div>`
                    : ''
                }
                
                <!-- Informations -->
                <div class="prompt-details">
                    <div class="detail-group">
                        <label>Catégorie</label>
                        <p>${escapeHtml(prompt.category || 'Sans catégorie')}</p>
                    </div>
                    
                    ${prompt.description 
                        ? `<div class="detail-group">
                               <label>Description</label>
                               <p>${escapeHtml(prompt.description)}</p>
                           </div>`
                        : ''
                    }
                    
                    <div class="detail-group">
                        <label>Prompt</label>
                        <div class="prompt-text-box">
                            ${escapeHtml(prompt.prompt)}
                        </div>
                    </div>
                    
                    ${prompt.comment 
                        ? `<div class="detail-group">
                               <label>Commentaire</label>
                               <p>${escapeHtml(prompt.comment)}</p>
                           </div>`
                        : ''
                    }
                    
                    ${prompt.json 
                        ? `<div class="detail-group">
                               <label>Configuration JSON</label>
                               <pre class="json-box">${escapeHtml(prompt.json)}</pre>
                           </div>`
                        : ''
                    }
                    
                    ${prompt.tags && prompt.tags.length > 0
                        ? `<div class="detail-group">
                               <label>Tags</label>
                               <div class="tags-list">
                                   ${prompt.tags.map(tag => 
                                       `<span class="tag">${escapeHtml(tag)}</span>`
                                   ).join('')}
                               </div>
                           </div>`
                        : ''
                    }
                </div>
            </div>
            
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="copyPrompt('${prompt.id}')">
                    <i class="fas fa-copy"></i> Copier
                </button>
                <button class="btn btn-primary" onclick="editPrompt('${prompt.id}')">
                    <i class="fas fa-edit"></i> Modifier
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

// Fonction pour ouvrir une image en plein écran
function openImageFullscreen(imageSrc) {
    const viewer = document.createElement('div');
    viewer.className = 'image-viewer-fullscreen';
    viewer.innerHTML = `
        <button class="close-viewer" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
        <img src="${imageSrc}" alt="Image">
    `;
    viewer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
    `;
    viewer.querySelector('img').style.cssText = `
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    `;
    viewer.querySelector('.close-viewer').style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        font-size: 24px;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    // Fermer en cliquant sur le fond
    viewer.addEventListener('click', (e) => {
        if (e.target === viewer) {
            viewer.remove();
        }
    });
    
    document.body.appendChild(viewer);
}

// Fonction pour défiler vers le haut
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Fonction pour basculer la recherche
function toggleSearch() {
    const searchBar = document.querySelector('.search-bar');
    if (searchBar) {
        searchBar.focus();
        searchBar.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Fonction pour initialiser le drag & drop sur mobile
function initMobileDragDrop() {
    const uploadZone = document.getElementById('imageUploadZone');
    const fileInput = document.getElementById('imageInput');
    
    if (uploadZone && fileInput) {
        // Click pour sélectionner
        uploadZone.addEventListener('click', () => {
            fileInput.click();
        });
        
        // Gestion des fichiers sélectionnés
        fileInput.addEventListener('change', (e) => {
            handleFiles(e.target.files);
        });
        
        // Drag & Drop (fonctionne aussi sur certains mobiles)
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('drag-over');
        });
        
        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('drag-over');
        });
        
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('drag-over');
            handleFiles(e.dataTransfer.files);
        });
    }
}

// Fonction pour gérer les fichiers uploadés
function handleFiles(files) {
    const preview = document.getElementById('imagesPreview');
    if (!preview) return;
    
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const previewItem = document.createElement('div');
                previewItem.className = 'image-preview-item';
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                    <button class="remove-image" onclick="this.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                preview.appendChild(previewItem);
            };
            
            reader.readAsDataURL(file);
        }
    });
}

// Fonction pour détecter si on est sur mobile
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
           || window.innerWidth <= 768;
}

// Fonction pour optimiser les performances sur mobile
function optimizeMobilePerformance() {
    if (isMobile()) {
        // Lazy loading des images
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.setAttribute('loading', 'lazy');
        });
        
        // Réduire les animations si nécessaire
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.setProperty('--animation-duration', '0.01s');
        }
        
        // Optimiser le scroll
        document.addEventListener('touchmove', function(e) {
            // Permettre le scroll uniquement sur les éléments scrollables
            if (!e.target.closest('.modal-body, .prompts-grid, .actions-bar')) {
                // e.preventDefault(); // Décommenter si nécessaire
            }
        }, { passive: true });
        
        // Gérer l'orientation
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                window.scrollTo(0, 0);
            }, 100);
        });
    }
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
    initMobileDragDrop();
    optimizeMobilePerformance();
    
    // Ajuster la hauteur pour iOS
    const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
});

// Export des fonctions pour utilisation globale
window.mobileUtils = {
    createPromptCard,
    showPromptDetails,
    openImageFullscreen,
    scrollToTop,
    toggleSearch,
    isMobile,
    handleFiles,
    optimizeMobilePerformance
};
