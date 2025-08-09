// Gestionnaire de prompts - Application principale avec optimisations mobile
class PromptManager {
    constructor() {
        this.prompts = this.loadPrompts();
        this.categories = this.loadCategories();
        this.currentCategory = 'all';
        this.currentEditId = null;
        this.tempImages = []; // Images temporaires pour le formulaire
        this.galleryImages = []; // Images pour la galerie
        this.currentGalleryIndex = 0;
        this.isMobile = window.innerWidth <= 768; // Détection mobile
        this.init();
    }

    // Initialisation
    init() {
        this.setupEventListeners();
        this.renderCategories();
        this.renderPrompts();
        this.updateTheme();
        this.checkForExamples();
        this.initMobileFeatures();
    }
    
    // Initialiser les fonctionnalités mobiles
    initMobileFeatures() {
        if (this.isMobile) {
            // Ajuster la hauteur pour iOS
            this.setViewportHeight();
            window.addEventListener('resize', () => this.setViewportHeight());
            window.addEventListener('orientationchange', () => this.setViewportHeight());
            
            // Optimiser les performances
            this.optimizeMobilePerformance();
        }
    }
    
    // Ajuster la hauteur du viewport pour iOS
    setViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    // Optimiser les performances sur mobile
    optimizeMobilePerformance() {
        // Lazy loading des images
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.setAttribute('loading', 'lazy');
        });
        
        // Réduire les animations si nécessaire
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.setProperty('--animation-duration', '0.01s');
        }
    }
    
    // Vérifier si on doit afficher le bouton pour charger les exemples
    checkForExamples() {
        if (this.prompts.length === 0) {
            const loadExamplesBtn = document.getElementById('loadExamplesBtn');
            if (loadExamplesBtn) {
                loadExamplesBtn.style.display = 'inline-flex';
            }
        }
    }

    // Chargement des données depuis localStorage
    loadPrompts() {
        const stored = localStorage.getItem('prompts');
        return stored ? JSON.parse(stored) : [];
    }

    loadCategories() {
        const stored = localStorage.getItem('categories');
        const defaultCategories = [
            { id: 'flux', name: 'Flux', icon: 'fa-stream' },
            { id: 'krea', name: 'Krea', icon: 'fa-palette' },
            { id: 'portrait', name: 'Portraits', icon: 'fa-user-circle' },
            { id: 'landscape', name: 'Paysages', icon: 'fa-mountain' },
            { id: 'concept', name: 'Concept Art', icon: 'fa-drafting-compass' },
            { id: 'realistic', name: 'Réaliste', icon: 'fa-camera' },
            { id: 'artistic', name: 'Artistique', icon: 'fa-paint-brush' },
            { id: 'other', name: 'Autre', icon: 'fa-folder' }
        ];
        return stored ? JSON.parse(stored) : defaultCategories;
    }
    
    // Sauvegarde des données
    savePrompts() {
        localStorage.setItem('prompts', JSON.stringify(this.prompts));
    }

    saveCategories() {
        localStorage.setItem('categories', JSON.stringify(this.categories));
    }

    // Configuration des événements
    setupEventListeners() {
        // Boutons principaux
        const addPromptBtn = document.getElementById('addPromptBtn');
        if (addPromptBtn) {
            addPromptBtn.addEventListener('click', () => this.openPromptModal());
        }
        
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => this.openCategoryModal());
        }
        
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });
        document.getElementById('importFile').addEventListener('change', (e) => this.importData(e));
        
        // Bouton charger les exemples
        const loadExamplesBtn = document.getElementById('loadExamplesBtn');
        if (loadExamplesBtn) {
            loadExamplesBtn.addEventListener('click', () => this.loadExamples());
        }
        
        // Recherche
        const searchInput = document.getElementById('searchInput') || document.getElementById('searchBar');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchPrompts(e.target.value);
            });
        }
        
        // Modal Prompt
        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => this.closePromptModal());
        }
        
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closePromptModal());
        }
        
        const promptForm = document.getElementById('promptForm');
        if (promptForm) {
            promptForm.addEventListener('submit', (e) => this.savePrompt(e));
        }
        
        // Modal Catégorie
        const closeCategoryModal = document.getElementById('closeCategoryModal');
        if (closeCategoryModal) {
            closeCategoryModal.addEventListener('click', () => this.closeCategoryModal());
        }
        
        const cancelCategoryBtn = document.getElementById('cancelCategoryBtn');
        if (cancelCategoryBtn) {
            cancelCategoryBtn.addEventListener('click', () => this.closeCategoryModal());
        }
        
        const categoryForm = document.getElementById('categoryForm');
        if (categoryForm) {
            categoryForm.addEventListener('submit', (e) => this.saveCategory(e));
        }
        
        // Upload d'images
        const promptImages = document.getElementById('promptImages') || document.getElementById('imageInput');
        if (promptImages) {
            promptImages.addEventListener('change', (e) => this.handleImageUpload(e));
        }
        
        // Drag and drop pour les images
        const uploadZone = document.querySelector('.image-upload-zone') || document.getElementById('imageUploadZone');
        if (uploadZone) {
            // Click pour sélectionner sur mobile
            uploadZone.addEventListener('click', () => {
                const imageInput = document.getElementById('promptImages') || document.getElementById('imageInput');
                if (imageInput) imageInput.click();
            });
            
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
                this.handleImageDrop(e);
            });
        }
        
        // Galerie d'images
        const galleryClose = document.getElementById('galleryClose');
        if (galleryClose) {
            galleryClose.addEventListener('click', () => this.closeGallery());
        }
        
        const galleryPrev = document.getElementById('galleryPrev');
        if (galleryPrev) {
            galleryPrev.addEventListener('click', () => this.galleryPrevious());
        }
        
        const galleryNext = document.getElementById('galleryNext');
        if (galleryNext) {
            galleryNext.addEventListener('click', () => this.galleryNext());
        }
        
        const imageGalleryModal = document.getElementById('imageGalleryModal');
        if (imageGalleryModal) {
            imageGalleryModal.addEventListener('click', (e) => {
                if (e.target.id === 'imageGalleryModal') this.closeGallery();
            });
        }
        
        // Fermer modal en cliquant dehors
        const promptModal = document.getElementById('promptModal');
        if (promptModal) {
            promptModal.addEventListener('click', (e) => {
                if (e.target.id === 'promptModal') this.closePromptModal();
            });
        }
        
        const categoryModal = document.getElementById('categoryModal');
        if (categoryModal) {
            categoryModal.addEventListener('click', (e) => {
                if (e.target.id === 'categoryModal') this.closeCategoryModal();
            });
        }
        
        // Gestion du scroll pour le bouton "scroll to top" sur mobile
        if (this.isMobile) {
            window.addEventListener('scroll', () => {
                const scrollBtn = document.getElementById('scrollTopBtn');
                if (scrollBtn) {
                    if (window.scrollY > 300) {
                        scrollBtn.style.display = 'flex';
                    } else {
                        scrollBtn.style.display = 'none';
                    }
                }
            });
        }
    }
    
    // Rendu des catégories
    renderCategories() {
        const list = document.getElementById('categoryList');
        const selectCategory = document.getElementById('promptCategory') || document.getElementById('category');
        const categoryFilters = document.getElementById('categoryFilters');
        
        // Compter les prompts par catégorie
        const counts = { all: this.prompts.length };
        this.categories.forEach(cat => {
            counts[cat.id] = this.prompts.filter(p => p.category === cat.id).length;
        });
        
        // Pour la liste de catégories (sidebar desktop)
        if (list) {
            let html = `
                <li class="category-item ${this.currentCategory === 'all' ? 'active' : ''}" 
                    data-category="all" onclick="app.filterByCategory('all')">
                    <span><i class="fas fa-folder"></i> Tous les prompts</span>
                    <span class="count">${counts.all}</span>
                </li>
            `;
            
            this.categories.forEach(cat => {
                const promptCount = counts[cat.id] || 0;
                
                html += `
                    <li class="category-item ${this.currentCategory === cat.id ? 'active' : ''}" 
                        data-category="${cat.id}">
                        <div class="category-content">
                            <div class="category-main" onclick="app.filterByCategory('${cat.id}')">
                                <span><i class="fas ${cat.icon || 'fa-folder'}"></i> ${cat.name}</span>
                                <span class="count">${promptCount}</span>
                            </div>
                            <button class="btn-delete-category" onclick="event.stopPropagation(); app.deleteCategory('${cat.id}')" title="Supprimer la catégorie">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </li>
                `;
            });
            
            list.innerHTML = html;
        }
        
        // Pour les filtres de catégories (mobile)
        if (categoryFilters) {
            let filterHtml = `
                <button class="category-filter ${this.currentCategory === 'all' ? 'active' : ''}" 
                        data-category="all" onclick="app.filterByCategory('all')">
                    <i class="fas fa-th"></i> Tout
                </button>
            `;
            
            this.categories.forEach(cat => {
                const promptCount = counts[cat.id] || 0;
                filterHtml += `
                    <button class="category-filter ${this.currentCategory === cat.id ? 'active' : ''}" 
                            data-category="${cat.id}" onclick="app.filterByCategory('${cat.id}')">
                        <i class="fas ${cat.icon || 'fa-folder'}"></i> ${cat.name}
                        ${promptCount > 0 ? `<span class="filter-count">${promptCount}</span>` : ''}
                    </button>
                `;
            });
            
            categoryFilters.innerHTML = filterHtml;
        }
        
        // Pour le select dans le formulaire
        if (selectCategory) {
            let options = '<option value="">Sélectionner une catégorie</option>';
            this.categories.forEach(cat => {
                options += `<option value="${cat.id}">${cat.name}</option>`;
            });
            selectCategory.innerHTML = options;
        }
    }
    
    // Supprimer une catégorie
    deleteCategory(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (!category) return;
        
        // Compter les prompts dans cette catégorie
        const promptsInCategory = this.prompts.filter(p => p.category === categoryId);
        const promptCount = promptsInCategory.length;
        
        if (promptCount > 0) {
            // Afficher un modal pour choisir l'action
            this.showDeleteCategoryModal(categoryId, category.name, promptCount);
        } else {
            // Pas de prompts, supprimer directement
            if (confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?`)) {
                this.performDeleteCategory(categoryId);
            }
        }
    }
    
    // Afficher le modal de suppression de catégorie
    showDeleteCategoryModal(categoryId, categoryName, promptCount) {
        const existingModal = document.getElementById('deleteCategoryModal');
        if (existingModal) existingModal.remove();
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'deleteCategoryModal';
        
        // Créer les options pour déplacer les prompts
        const otherCategories = this.categories.filter(c => c.id !== categoryId);
        const categoryOptions = otherCategories.map(cat => 
            `<option value="${cat.id}">${cat.name}</option>`
        ).join('');
        
        modal.innerHTML = `
            <div class="modal-content modal-small">
                <div class="modal-header">
                    <h2>Supprimer la catégorie "${categoryName}"</h2>
                    <button class="btn-close" onclick="app.closeDeleteCategoryModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body" style="padding: 1.5rem;">
                    <div class="warning-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Cette catégorie contient <strong>${promptCount} prompt(s)</strong>.</p>
                        <p>Que voulez-vous faire avec ces prompts ?</p>
                    </div>
                    
                    <div class="delete-options">
                        <label class="delete-option">
                            <input type="radio" name="deleteOption" value="move" checked>
                            <div class="option-content">
                                <strong>Déplacer vers une autre catégorie</strong>
                                <select id="targetCategory" class="category-select">
                                    ${categoryOptions}
                                    <option value="other">Autre (non catégorisé)</option>
                                </select>
                            </div>
                        </label>
                        
                        <label class="delete-option">
                            <input type="radio" name="deleteOption" value="delete">
                            <div class="option-content">
                                <strong>Supprimer tous les prompts</strong>
                                <small class="text-danger">⚠️ Cette action est irréversible</small>
                            </div>
                        </label>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="app.closeDeleteCategoryModal()">
                        Annuler
                    </button>
                    <button class="btn-danger" onclick="app.confirmDeleteCategory('${categoryId}')">
                        <i class="fas fa-trash"></i> Supprimer la catégorie
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    // Fermer le modal de suppression
    closeDeleteCategoryModal() {
        const modal = document.getElementById('deleteCategoryModal');
        if (modal) modal.remove();
    }
    
    // Confirmer la suppression de catégorie
    confirmDeleteCategory(categoryId) {
        const selectedOption = document.querySelector('input[name="deleteOption"]:checked').value;
        
        if (selectedOption === 'move') {
            const targetCategory = document.getElementById('targetCategory').value;
            this.movePromptsAndDeleteCategory(categoryId, targetCategory);
        } else if (selectedOption === 'delete') {
            if (confirm('Êtes-vous VRAIMENT sûr de vouloir supprimer tous les prompts de cette catégorie ? Cette action est irréversible !')) {
                this.deletePromptsAndCategory(categoryId);
            }
        }
        
        this.closeDeleteCategoryModal();
    }
    
    // Déplacer les prompts et supprimer la catégorie
    movePromptsAndDeleteCategory(categoryId, targetCategoryId) {
        // Déplacer tous les prompts vers la nouvelle catégorie
        this.prompts.forEach(prompt => {
            if (prompt.category === categoryId) {
                prompt.category = targetCategoryId;
                prompt.updatedAt = new Date().toISOString();
            }
        });
        
        // Sauvegarder les prompts
        this.savePrompts();
        
        // Supprimer la catégorie
        this.performDeleteCategory(categoryId);
        
        const targetCategory = this.categories.find(c => c.id === targetCategoryId);
        const targetName = targetCategory ? targetCategory.name : 'Autre';
        this.showToast(`Prompts déplacés vers "${targetName}" et catégorie supprimée`, 'success');
    }
    
    // Supprimer les prompts et la catégorie
    deletePromptsAndCategory(categoryId) {
        const deletedCount = this.prompts.filter(p => p.category === categoryId).length;
        
        // Supprimer tous les prompts de cette catégorie
        this.prompts = this.prompts.filter(p => p.category !== categoryId);
        this.savePrompts();
        
        // Supprimer la catégorie
        this.performDeleteCategory(categoryId);
        
        this.showToast(`Catégorie et ${deletedCount} prompt(s) supprimés`, 'success');
        
        // Mettre à jour l'indicateur de doublons
        if (window.duplicateDetector) {
            window.duplicateDetector.updateDuplicateIndicator();
        }
    }
    
    // Effectuer la suppression de la catégorie
    performDeleteCategory(categoryId) {
        // Supprimer la catégorie
        this.categories = this.categories.filter(c => c.id !== categoryId);
        this.saveCategories();
        
        // Si on était sur cette catégorie, revenir à "Tous"
        if (this.currentCategory === categoryId) {
            this.currentCategory = 'all';
            const sectionTitle = document.getElementById('sectionTitle');
            if (sectionTitle) {
                sectionTitle.textContent = 'Tous les prompts';
            }
        }
        
        // Rafraîchir l'affichage
        this.renderCategories();
        this.renderPrompts();
        
        // Déclencher la sauvegarde automatique
        if (window.autoBackup && window.autoBackup.settings.enabled) {
            window.autoBackup.createBackupSilent();
        }
    }
    
    // Créer une carte de prompt (version optimisée mobile/desktop)
    createPromptCard(prompt) {
        const category = this.categories.find(c => c.id === prompt.category);
        const tags = prompt.tags ? prompt.tags.split(',').map(t => t.trim()).filter(t => t) : [];
        const images = prompt.images || [];
        const firstImage = images.length > 0 ? images[0] : null;
        
        // Créer l'élément de carte
        const card = document.createElement('div');
        card.className = 'prompt-card';
        card.dataset.id = prompt.id;
        
        if (this.isMobile) {
            // Version mobile avec image en haut
            card.innerHTML = `
                <!-- Image en haut de la carte -->
                <div class="prompt-card-image">
                    ${firstImage 
                        ? `<img src="${firstImage}" alt="${this.escapeHtml(prompt.title)}" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'no-image\\'><i class=\\'fas fa-image\\'></i></div>'">`
                        : `<div class="no-image">
                               <i class="fas fa-image"></i>
                           </div>`
                    }
                    <!-- Badge de catégorie -->
                    <span class="category-badge">
                        <i class="fas ${category?.icon || 'fa-folder'}"></i> ${this.escapeHtml(category?.name || 'Sans catégorie')}
                    </span>
                </div>
                
                <!-- Contenu de la carte -->
                <div class="prompt-card-content">
                    <!-- En-tête avec titre et actions -->
                    <div class="prompt-card-header">
                        <h3 class="prompt-card-title">${this.escapeHtml(prompt.title)}</h3>
                        <div class="prompt-card-actions">
                            <button onclick="event.stopPropagation(); app.copyPrompt('${prompt.id}')" title="Copier">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button onclick="event.stopPropagation(); app.editPrompt('${prompt.id}')" title="Modifier">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="event.stopPropagation(); app.deletePrompt('${prompt.id}')" title="Supprimer">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Description -->
                    ${prompt.description 
                        ? `<p class="prompt-card-description">${this.escapeHtml(prompt.description)}</p>`
                        : ''
                    }
                    
                    <!-- Prompt avec fond différent -->
                    <div class="prompt-card-prompt">
                        <div class="prompt-card-prompt-text">${this.escapeHtml(prompt.content)}</div>
                    </div>
                    
                    <!-- Tags -->
                    ${tags.length > 0 ? `
                        <div class="prompt-card-tags">
                            ${tags.slice(0, 3).map(tag => `<span class="prompt-card-tag">${this.escapeHtml(tag)}</span>`).join('')}
                        </div>
                    ` : ''}
                    
                    <!-- Footer avec métadonnées -->
                    <div class="prompt-card-footer">
                        <div class="prompt-card-meta">
                            <span><i class="fas fa-images"></i> ${images.length}</span>
                            <span><i class="fas fa-comment"></i> ${prompt.comment ? '1' : '0'}</span>
                            <span><i class="fas fa-code"></i> ${prompt.jsonParams ? 'JSON' : '-'}</span>
                        </div>
                    </div>
                </div>
            `;
            
            // Ajouter l'événement de clic pour ouvrir les détails
            card.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    this.showPromptDetails(prompt.id);
                }
            });
        } else {
            // Version desktop (structure existante)
            card.innerHTML = `
                <div class="prompt-card-header">
                    <div>
                        <h3>${this.escapeHtml(prompt.title)}</h3>
                        <div class="prompt-card-category">
                            <i class="fas ${category?.icon || 'fa-folder'}"></i>
                            ${category?.name || 'Non catégorisé'}
                        </div>
                    </div>
                    <div class="prompt-card-actions">
                        <button class="btn-card-action" onclick="app.copyPrompt('${prompt.id}')" title="Copier">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="btn-card-action" onclick="app.editPrompt('${prompt.id}')" title="Éditer">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-card-action delete" onclick="app.deletePrompt('${prompt.id}')" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                ${images.length > 0 ? `
                    <div class="prompt-card-images">
                        ${images.slice(0, 3).map((img, index) => `
                            <div class="prompt-card-image" onclick="app.openGallery('${prompt.id}', ${index})">
                                <img src="${img}" alt="Image ${index + 1}" loading="lazy">
                                ${index === 2 && images.length > 3 ? `
                                    <span class="image-count">+${images.length - 3}</span>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${prompt.replicateLink ? `
                    <a href="${prompt.replicateLink}" target="_blank" class="replicate-link">
                        <i class="fas fa-external-link-alt"></i> Voir sur Replicate
                    </a>
                ` : ''}
                
                ${prompt.description ? `<p class="prompt-card-description">${this.escapeHtml(prompt.description)}</p>` : ''}
                <div class="prompt-card-content">${this.escapeHtml(prompt.content)}</div>
                ${prompt.comment ? `
                    <div class="prompt-card-comment">
                        <i class="fas fa-comment"></i> 
                        <span>${this.escapeHtml(prompt.comment)}</span>
                    </div>
                ` : ''}
                ${prompt.jsonParams ? `
                    <div class="prompt-card-json">
                        <div class="json-header">
                            <i class="fas fa-code"></i> Paramètres JSON
                            <button class="btn-copy-json" onclick="app.copyJson('${prompt.id}')" title="Copier le JSON">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                        <pre class="json-content">${this.escapeHtml(prompt.jsonParams)}</pre>
                    </div>
                ` : ''}
                ${tags.length > 0 ? `
                    <div class="prompt-card-tags">
                        ${tags.map(tag => `<span class="tag">#${this.escapeHtml(tag)}</span>`).join('')}
                    </div>
                ` : ''}
            `;
            
            // Sur desktop, double-clic pour éditer
            card.addEventListener('dblclick', () => {
                this.editPrompt(prompt.id);
            });
        }
        
        return card;
    }
    
    // Afficher les détails d'un prompt (mobile)
    showPromptDetails(promptId) {
        const prompt = this.prompts.find(p => p.id === promptId);
        if (!prompt) return;
        
        const modal = document.getElementById('promptDetailsModal');
        const content = document.getElementById('promptDetailsContent');
        const title = document.getElementById('detailsTitle');
        
        if (!modal || !content) {
            // Créer la modal si elle n'existe pas
            this.createPromptDetailsModal(prompt);
            return;
        }
        
        // Mettre à jour le titre
        if (title) {
            title.textContent = prompt.title;
        }
        
        const category = this.categories.find(c => c.id === prompt.category);
        const tags = prompt.tags ? prompt.tags.split(',').map(t => t.trim()).filter(t => t) : [];
        
        // Créer le contenu des détails
        content.innerHTML = `
            <!-- Galerie d'images -->
            ${prompt.images && prompt.images.length > 0 
                ? `<div class="prompt-images-gallery">
                       ${prompt.images.map((img, index) => 
                           `<img src="${img}" alt="Image ${index + 1}" onclick="app.openImageFullscreen('${img}')">`
                       ).join('')}
                   </div>`
                : ''
            }
            
            <!-- Informations -->
            <div class="prompt-details">
                <div class="detail-group">
                    <label>Catégorie</label>
                    <p><i class="fas ${category?.icon || 'fa-folder'}"></i> ${this.escapeHtml(category?.name || 'Sans catégorie')}</p>
                </div>
                
                ${prompt.description 
                    ? `<div class="detail-group">
                           <label>Description</label>
                           <p>${this.escapeHtml(prompt.description)}</p>
                       </div>`
                    : ''
                }
                
                <div class="detail-group">
                    <label>Prompt</label>
                    <div class="prompt-text-box">
                        ${this.escapeHtml(prompt.content)}
                    </div>
                    <button class="btn btn-sm" onclick="app.copyPrompt('${prompt.id}')">
                        <i class="fas fa-copy"></i> Copier le prompt
                    </button>
                </div>
                
                ${prompt.comment 
                    ? `<div class="detail-group">
                           <label>Commentaire / Notes</label>
                           <p>${this.escapeHtml(prompt.comment)}</p>
                       </div>`
                    : ''
                }
                
                ${prompt.jsonParams 
                    ? `<div class="detail-group">
                           <label>Configuration JSON</label>
                           <pre class="json-box">${this.escapeHtml(prompt.jsonParams)}</pre>
                           <button class="btn btn-sm" onclick="app.copyJson('${prompt.id}')">
                               <i class="fas fa-copy"></i> Copier JSON
                           </button>
                       </div>`
                    : ''
                }
                
                ${prompt.replicateLink 
                    ? `<div class="detail-group">
                           <label>Lien Replicate</label>
                           <a href="${prompt.replicateLink}" target="_blank" class="btn btn-sm">
                               <i class="fas fa-external-link-alt"></i> Ouvrir sur Replicate
                           </a>
                       </div>`
                    : ''
                }
                
                ${tags.length > 0
                    ? `<div class="detail-group">
                           <label>Tags</label>
                           <div class="prompt-tags">
                               ${tags.map(tag => 
                                   `<span class="tag">${this.escapeHtml(tag)}</span>`
                               ).join('')}
                           </div>
                       </div>`
                    : ''
                }
            </div>
        `;
        
        // Configurer les boutons du footer
        const copyBtn = document.getElementById('copyPromptBtn');
        const editBtn = document.getElementById('editPromptBtn');
        
        if (copyBtn) {
            copyBtn.onclick = () => {
                this.copyPrompt(promptId);
                this.closeModal('promptDetailsModal');
            };
        }
        
        if (editBtn) {
            editBtn.onclick = () => {
                this.closeModal('promptDetailsModal');
                this.editPrompt(promptId);
            };
        }
        
        // Afficher la modal
        modal.style.display = 'flex';
        modal.classList.add('show');
    }
    
    // Créer la modal de détails si elle n'existe pas
    createPromptDetailsModal(prompt) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'promptDetailsModal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="detailsTitle">${this.escapeHtml(prompt.title)}</h2>
                    <button class="close-btn" onclick="app.closeModal('promptDetailsModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body" id="promptDetailsContent">
                    <!-- Le contenu sera généré -->
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="copyPromptBtn">
                        <i class="fas fa-copy"></i> Copier
                    </button>
                    <button class="btn btn-primary" id="editPromptBtn">
                        <i class="fas fa-edit"></i> Modifier
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Appeler à nouveau pour remplir le contenu
        this.showPromptDetails(prompt.id);
    }
    
    // Fermer une modal par ID
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }
    
    // Ouvrir une image en plein écran
    openImageFullscreen(imageSrc) {
        const viewer = document.createElement('div');
        viewer.className = 'image-viewer-fullscreen';
        viewer.innerHTML = `
            <button class="close-viewer" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
            <img src="${imageSrc}" alt="Image" loading="lazy">
        `;
        
        // Fermer en cliquant sur le fond
        viewer.addEventListener('click', (e) => {
            if (e.target === viewer) {
                viewer.remove();
            }
        });
        
        document.body.appendChild(viewer);
    }
    
    // Rendu des prompts
    renderPrompts(filteredPrompts = null) {
        const grid = document.getElementById('promptsGrid');
        const emptyState = document.getElementById('emptyState');
        const prompts = filteredPrompts || this.getFilteredPrompts();
        
        if (!grid) return;
        
        if (prompts.length === 0) {
            grid.innerHTML = '';
            grid.style.display = 'none';
            if (emptyState) {
                emptyState.style.display = 'block';
                emptyState.classList.add('show');
            }
            return;
        }
        
        if (emptyState) {
            emptyState.style.display = 'none';
            emptyState.classList.remove('show');
        }
        grid.style.display = '';
        
        // Vider la grille
        grid.innerHTML = '';
        
        // Créer les cartes avec la fonction optimisée
        prompts.forEach(prompt => {
            const card = this.createPromptCard(prompt);
            grid.appendChild(card);
        });
        
        // Animation d'apparition sur mobile
        if (this.isMobile) {
            this.animateCards();
        }
    }
    
    // Animer l'apparition des cartes
    animateCards() {
        const cards = document.querySelectorAll('.prompt-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }
    
    // Filtrage et recherche
    getFilteredPrompts() {
        if (this.currentCategory === 'all') {
            return this.prompts;
        }
        return this.prompts.filter(p => p.category === this.currentCategory);
    }
    
    filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        
        // Mettre à jour l'UI
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.toggle('active', item.dataset.category === categoryId);
        });
        
        // Mettre à jour les filtres mobiles
        document.querySelectorAll('.category-filter').forEach(filter => {
            filter.classList.toggle('active', filter.dataset.category === categoryId);
        });
        
        // Mettre à jour le titre
        const category = this.categories.find(c => c.id === categoryId);
        const sectionTitle = document.getElementById('sectionTitle');
        if (sectionTitle) {
            sectionTitle.textContent = 
                categoryId === 'all' ? 'Tous les prompts' : category?.name || 'Prompts';
        }
        
        this.renderPrompts();
    }
    
    searchPrompts(query) {
        if (!query.trim()) {
            this.renderPrompts();
            return;
        }
        
        const searchTerm = query.toLowerCase();
        const filtered = this.getFilteredPrompts().filter(prompt => 
            prompt.title.toLowerCase().includes(searchTerm) ||
            prompt.content.toLowerCase().includes(searchTerm) ||
            prompt.description?.toLowerCase().includes(searchTerm) ||
            prompt.comment?.toLowerCase().includes(searchTerm) ||
            prompt.jsonParams?.toLowerCase().includes(searchTerm) ||
            prompt.tags?.toLowerCase().includes(searchTerm)
        );
        
        this.renderPrompts(filtered);
    }
    
    // Gestion des modals
    openPromptModal(promptId = null) {
        const modal = document.getElementById('promptModal');
        const form = document.getElementById('promptForm');
        const title = document.getElementById('modalTitle');
        
        // Réinitialiser les images temporaires
        this.tempImages = [];
        const imagePreviewGrid = document.getElementById('imagePreviewGrid') || document.getElementById('imagesPreview');
        if (imagePreviewGrid) {
            imagePreviewGrid.innerHTML = '';
        }
        
        if (promptId) {
            const prompt = this.prompts.find(p => p.id === promptId);
            if (prompt) {
                if (title) title.textContent = 'Éditer le prompt';
                
                // Remplir les champs
                const fields = {
                    'promptTitle': prompt.title,
                    'title': prompt.title,
                    'promptCategory': prompt.category,
                    'category': prompt.category,
                    'promptReplicateLink': prompt.replicateLink || '',
                    'replicateLink': prompt.replicateLink || '',
                    'promptDescription': prompt.description || '',
                    'description': prompt.description || '',
                    'promptContent': prompt.content,
                    'prompt': prompt.content,
                    'promptComment': prompt.comment || '',
                    'comment': prompt.comment || '',
                    'promptJson': prompt.jsonParams || '',
                    'json': prompt.jsonParams || '',
                    'promptTags': prompt.tags || '',
                    'tags': prompt.tags || ''
                };
                
                for (const [id, value] of Object.entries(fields)) {
                    const element = document.getElementById(id);
                    if (element) element.value = value;
                }
                
                this.currentEditId = promptId;
                
                // Charger les images existantes
                if (prompt.images && prompt.images.length > 0) {
                    this.tempImages = [...prompt.images];
                    this.renderImagePreviews();
                }
            }
        } else {
            if (title) title.textContent = 'Nouveau Prompt';
            if (form) form.reset();
            this.currentEditId = null;
        }
        
        if (modal) {
            modal.classList.add('show');
            modal.style.display = 'flex';
        }
        
        // Réactiver la détection de doublons
        if (window.duplicateDetector) {
            window.duplicateDetector.addRealTimeDetection();
            // Vérifier immédiatement si c'est une édition
            if (promptId) {
                setTimeout(() => {
                    window.duplicateDetector.checkForDuplicateRealTime();
                }, 100);
            }
        }
    }
    
    closePromptModal() {
        const modal = document.getElementById('promptModal');
        const form = document.getElementById('promptForm');
        const imagePreviewGrid = document.getElementById('imagePreviewGrid') || document.getElementById('imagesPreview');
        
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
        
        if (form) form.reset();
        if (imagePreviewGrid) imagePreviewGrid.innerHTML = '';
        
        this.tempImages = [];
        this.currentEditId = null;
        
        // Cacher l'indicateur de doublon
        if (window.duplicateDetector) {
            window.duplicateDetector.hideDuplicateIndicator();
        }
    }
    
    savePrompt(e) {
        e.preventDefault();
        
        // Récupérer les valeurs des champs (compatible avec les deux structures HTML)
        const getFieldValue = (ids) => {
            for (const id of ids) {
                const element = document.getElementById(id);
                if (element) return element.value;
            }
            return '';
        };
        
        const promptData = {
            id: this.currentEditId || this.generateId(),
            title: getFieldValue(['promptTitle', 'title']),
            category: getFieldValue(['promptCategory', 'category']),
            replicateLink: getFieldValue(['promptReplicateLink', 'replicateLink']),
            description: getFieldValue(['promptDescription', 'description']),
            content: getFieldValue(['promptContent', 'prompt']),
            comment: getFieldValue(['promptComment', 'comment']),
            jsonParams: getFieldValue(['promptJson', 'json']),
            tags: getFieldValue(['promptTags', 'tags']),
            images: this.tempImages,
            createdAt: this.currentEditId ? 
                this.prompts.find(p => p.id === this.currentEditId).createdAt : 
                new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (this.currentEditId) {
            const index = this.prompts.findIndex(p => p.id === this.currentEditId);
            this.prompts[index] = promptData;
            this.showToast('Prompt modifié avec succès', 'success');
        } else {
            this.prompts.push(promptData);
            this.showToast('Prompt créé avec succès', 'success');
        }
        
        this.savePrompts();
        this.renderCategories();
        this.renderPrompts();
        this.closePromptModal();
        
        // Déclencher la sauvegarde automatique
        if (window.autoBackup && window.autoBackup.settings.enabled) {
            window.autoBackup.createBackupSilent();
        }
        
        // Mettre à jour l'indicateur de doublons
        if (window.duplicateDetector) {
            window.duplicateDetector.updateDuplicateIndicator();
        }
    }
    
    editPrompt(promptId) {
        this.openPromptModal(promptId);
    }
    
    deletePrompt(promptId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce prompt ?')) {
            this.prompts = this.prompts.filter(p => p.id !== promptId);
            this.savePrompts();
            this.renderCategories();
            this.renderPrompts();
            this.showToast('Prompt supprimé', 'success');
            
            // Déclencher la sauvegarde automatique
            if (window.autoBackup && window.autoBackup.settings.enabled) {
                window.autoBackup.createBackupSilent();
            }
            
            // Mettre à jour l'indicateur de doublons
            if (window.duplicateDetector) {
                window.duplicateDetector.updateDuplicateIndicator();
            }
        }
    }
    
    copyPrompt(promptId) {
        const prompt = this.prompts.find(p => p.id === promptId);
        if (prompt) {
            navigator.clipboard.writeText(prompt.content).then(() => {
                this.showToast('Prompt copié dans le presse-papier !', 'success');
            }).catch(() => {
                // Fallback pour les anciens navigateurs
                const textArea = document.createElement('textarea');
                textArea.value = prompt.content;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showToast('Prompt copié !', 'success');
            });
        }
    }
    
    copyJson(promptId) {
        const prompt = this.prompts.find(p => p.id === promptId);
        if (prompt && prompt.jsonParams) {
            navigator.clipboard.writeText(prompt.jsonParams).then(() => {
                this.showToast('Paramètres JSON copiés !', 'success');
            }).catch(() => {
                // Fallback
                const textArea = document.createElement('textarea');
                textArea.value = prompt.jsonParams;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showToast('JSON copié !', 'success');
            });
        }
    }
    
    formatJson() {
        const jsonTextarea = document.getElementById('promptJson') || document.getElementById('json');
        const statusElement = document.getElementById('jsonStatus') || document.getElementById('jsonValidation');
        
        if (!jsonTextarea || !jsonTextarea.value.trim()) {
            if (statusElement) statusElement.textContent = '';
            return;
        }
        
        try {
            const parsed = JSON.parse(jsonTextarea.value);
            jsonTextarea.value = JSON.stringify(parsed, null, 2);
            if (statusElement) {
                statusElement.textContent = '✅ JSON formaté avec succès';
                statusElement.className = 'json-status success';
                setTimeout(() => {
                    statusElement.textContent = '';
                }, 3000);
            }
        } catch (e) {
            if (statusElement) {
                statusElement.textContent = '❌ JSON invalide: ' + e.message;
                statusElement.className = 'json-status error';
            }
        }
    }
    
    validateJson() {
        const jsonTextarea = document.getElementById('promptJson') || document.getElementById('json');
        const statusElement = document.getElementById('jsonStatus') || document.getElementById('jsonValidation');
        
        if (!jsonTextarea || !jsonTextarea.value.trim()) {
            if (statusElement) {
                statusElement.textContent = 'ℹ️ Aucun JSON à valider';
                statusElement.className = 'json-status info';
                setTimeout(() => {
                    statusElement.textContent = '';
                }, 3000);
            }
            return;
        }
        
        try {
            JSON.parse(jsonTextarea.value);
            if (statusElement) {
                statusElement.textContent = '✅ JSON valide !';
                statusElement.className = 'json-status success';
                setTimeout(() => {
                    statusElement.textContent = '';
                }, 3000);
            }
        } catch (e) {
            if (statusElement) {
                statusElement.textContent = '❌ JSON invalide: ' + e.message;
                statusElement.className = 'json-status error';
            }
        }
    }
    
    showJsonTemplates() {
        const templatesDiv = document.getElementById('jsonTemplates');
        if (templatesDiv) {
            if (templatesDiv.style.display === 'none') {
                templatesDiv.style.display = 'block';
            } else {
                templatesDiv.style.display = 'none';
            }
        }
    }
    
    insertTemplate(templateName) {
        const templates = {
            'flux-dev': {
                "model": "flux-1.1-pro",
                "guidance_scale": 3.5,
                "num_inference_steps": 25,
                "width": 1024,
                "height": 1024,
                "prompt_strength": 0.8,
                "seed": -1
            },
            'flux-schnell': {
                "model": "flux-schnell",
                "guidance_scale": 0,
                "num_inference_steps": 4,
                "width": 1024,
                "height": 1024,
                "seed": -1
            },
            'stable-diffusion': {
                "model": "stable-diffusion-xl",
                "cfg_scale": 7,
                "steps": 30,
                "sampler": "DPM++ 2M Karras",
                "width": 1024,
                "height": 1024,
                "negative_prompt": "",
                "seed": -1
            },
            'dalle': {
                "model": "dall-e-3",
                "quality": "hd",
                "size": "1024x1024",
                "style": "vivid",
                "n": 1
            },
            'midjourney': {
                "model": "midjourney-v6",
                "stylize": 100,
                "quality": 1,
                "chaos": 0,
                "aspect_ratio": "1:1",
                "weird": 0,
                "version": 6
            },
            'krea': {
                "model": "krea-ai",
                "guidance_scale": 7.5,
                "steps": 50,
                "width": 1024,
                "height": 1024,
                "seed": -1
            },
            'leonardo': {
                "model": "leonardo-diffusion",
                "guidance_scale": 7,
                "num_inference_steps": 30,
                "width": 768,
                "height": 768,
                "scheduler": "LEONARDO",
                "preset_style": "LEONARDO"
            },
            'playground': {
                "model": "playground-v2.5",
                "guidance_scale": 3,
                "num_inference_steps": 50,
                "width": 1024,
                "height": 1024,
                "sampler": "K_EULER_ANCESTRAL",
                "seed": -1
            },
            'custom': {}
        };
        
        const template = templates[templateName];
        if (template) {
            const jsonTextarea = document.getElementById('promptJson') || document.getElementById('json');
            if (jsonTextarea) {
                jsonTextarea.value = JSON.stringify(template, null, 2);
            }
            
            const templatesDiv = document.getElementById('jsonTemplates');
            if (templatesDiv) {
                templatesDiv.style.display = 'none';
            }
            
            this.showToast(`Template ${templateName.toUpperCase()} inséré !`, 'success');
        }
    }
    
    // Gestion des catégories
    openCategoryModal() {
        const modal = document.getElementById('categoryModal');
        if (modal) {
            modal.classList.add('show');
            modal.style.display = 'flex';
        }
    }
    
    closeCategoryModal() {
        const modal = document.getElementById('categoryModal');
        const form = document.getElementById('categoryForm');
        
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
        
        if (form) form.reset();
    }
    
    saveCategory(e) {
        e.preventDefault();
        
        const nameField = document.getElementById('categoryName') || document.getElementById('newCategoryName');
        const iconField = document.getElementById('categoryIcon') || document.getElementById('newCategoryIcon');
        
        if (!nameField) return;
        
        const categoryData = {
            id: this.generateId(),
            name: nameField.value,
            icon: iconField?.value || 'fa-folder'
        };
        
        // Vérifier si le nom existe déjà
        if (this.categories.some(c => c.name.toLowerCase() === categoryData.name.toLowerCase())) {
            this.showToast('Une catégorie avec ce nom existe déjà', 'error');
            return;
        }
        
        this.categories.push(categoryData);
        this.saveCategories();
        this.renderCategories();
        this.closeCategoryModal();
        this.showToast('Catégorie créée avec succès', 'success');
        
        // Déclencher la sauvegarde automatique
        if (window.autoBackup && window.autoBackup.settings.enabled) {
            window.autoBackup.createBackupSilent();
        }
    }
    
    // Import/Export
    exportData() {
        const data = {
            prompts: this.prompts,
            categories: this.categories,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prompts_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showToast('Données exportées avec succès', 'success');
    }
    
    importData(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                if (data.prompts && Array.isArray(data.prompts)) {
                    this.prompts = data.prompts;
                    this.savePrompts();
                }
                
                if (data.categories && Array.isArray(data.categories)) {
                    this.categories = data.categories;
                    this.saveCategories();
                }
                
                this.renderCategories();
                this.renderPrompts();
                this.showToast('Données importées avec succès', 'success');
                
                // Mettre à jour l'indicateur de doublons
                if (window.duplicateDetector) {
                    window.duplicateDetector.updateDuplicateIndicator();
                }
            } catch (error) {
                this.showToast('Erreur lors de l\'import du fichier', 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    }
    
    // Charger les exemples de prompts
    loadExamples() {
        const exemplesPrompts = [
            {
                id: 'exemple_1',
                title: 'Portrait Cinématique Réaliste',
                category: 'portrait',
                replicateLink: 'https://replicate.com/black-forest-labs/flux-1.1-pro',
                description: 'Portrait photoréaliste avec éclairage dramatique',
                content: 'Cinematic portrait of a young woman with flowing auburn hair, dramatic side lighting, golden hour, shallow depth of field, shot on 85mm lens, professional photography, hyperrealistic, 8k resolution, moody atmosphere, film grain',
                comment: 'Fonctionne très bien avec Flux 1.1 Pro. Utiliser guidance_scale=3.5 et num_inference_steps=25 pour de meilleurs résultats. Ajouter "looking at camera" pour un regard direct.',
                jsonParams: '{"model": "flux-1.1-pro", "guidance_scale": 3.5, "num_inference_steps": 25, "width": 1024, "height": 1024, "prompt_strength": 0.8, "seed": -1}',
                tags: 'portrait, cinématique, flux, réaliste, golden hour',
                images: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'exemple_2',
                title: 'Paysage Fantasy Studio Ghibli',
                category: 'landscape',
                description: 'Paysage fantastique dans le style Studio Ghibli',
                content: 'Majestic floating castle in the clouds, ethereal fantasy landscape, waterfalls cascading from sky islands, rainbow bridges, magical aurora in the background, Studio Ghibli style, highly detailed, vibrant colors, volumetric lighting, epic scale',
                comment: 'Testé avec SDXL et Midjourney. Pour SDXL, ajouter "anime style, cel shading" améliore le rendu. Éviter les prompts négatifs trop restrictifs.',
                jsonParams: '{"model": "stable-diffusion-xl", "cfg_scale": 7, "steps": 30, "sampler": "DPM++ 2M Karras", "width": 1344, "height": 768, "negative_prompt": "low quality, blurry"}',
                tags: 'paysage, fantasy, ghibli, artistique, anime',
                images: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'exemple_3',
                title: 'Cyberpunk City Night',
                category: 'concept',
                description: 'Ville futuriste cyberpunk sous la pluie',
                content: 'Futuristic cyberpunk city at night, neon lights reflecting on wet streets, flying cars, holographic advertisements, rain, blade runner atmosphere, ultra detailed, cinematic composition, ray tracing, 8k, artstation trending',
                comment: 'Excellent avec Stable Diffusion XL. CFG Scale 7, Steps 30. Ajouter "purple and cyan color scheme" pour une palette vibrante. Negative: "blurry, low quality"',
                jsonParams: '{"model": "sdxl-turbo", "cfg_scale": 7, "steps": 30, "width": 1920, "height": 1080, "sampler": "Euler a", "color_grading": "cyberpunk", "style_preset": "cinematic"}',
                tags: 'cyberpunk, ville, néon, futuriste, concept art',
                images: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        
        this.prompts = [...this.prompts, ...exemplesPrompts];
        this.savePrompts();
        this.renderCategories();
        this.renderPrompts();
        
        // Cacher le bouton après le chargement
        const loadExamplesBtn = document.getElementById('loadExamplesBtn');
        if (loadExamplesBtn) {
            loadExamplesBtn.style.display = 'none';
        }
        
        this.showToast('Exemples de prompts chargés avec succès !', 'success');
    }
    
    // Thème
    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const icon = document.querySelector('#themeToggle i');
        if (icon) {
            icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
    
    updateTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        
        const icon = document.querySelector('#themeToggle i');
        if (icon) {
            icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
    
    // Gestion des images
    handleImageUpload(e) {
        const files = Array.from(e.target.files);
        this.processImageFiles(files);
    }
    
    handleImageDrop(e) {
        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        this.processImageFiles(files);
    }
    
    processImageFiles(files) {
        if (files.length === 0) return;
        
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                this.tempImages.push(event.target.result);
                this.renderImagePreviews();
            };
            reader.readAsDataURL(file);
        });
    }
    
    renderImagePreviews() {
        const grid = document.getElementById('imagePreviewGrid') || document.getElementById('imagesPreview');
        if (!grid) return;
        
        grid.innerHTML = this.tempImages.map((img, index) => `
            <div class="image-preview-item">
                <img src="${img}" alt="Image ${index + 1}" onclick="app.previewImage('${img}')">
                <button class="btn-remove-image remove-image" onclick="app.removeImage(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }
    
    removeImage(index) {
        this.tempImages.splice(index, 1);
        this.renderImagePreviews();
    }
    
    previewImage(imageSrc) {
        if (this.isMobile) {
            this.openImageFullscreen(imageSrc);
        } else {
            window.open(imageSrc, '_blank');
        }
    }
    
    // Galerie d'images
    openGallery(promptId, startIndex = 0) {
        const prompt = this.prompts.find(p => p.id === promptId);
        if (!prompt || !prompt.images || prompt.images.length === 0) return;
        
        this.galleryImages = prompt.images;
        this.currentGalleryIndex = startIndex;
        this.updateGalleryImage();
        
        const modal = document.getElementById('imageGalleryModal');
        if (modal) {
            modal.classList.add('show');
            modal.style.display = 'flex';
        }
    }
    
    closeGallery() {
        const modal = document.getElementById('imageGalleryModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
        this.galleryImages = [];
        this.currentGalleryIndex = 0;
    }
    
    updateGalleryImage() {
        if (this.galleryImages.length === 0) return;
        
        const image = document.getElementById('galleryImage');
        const info = document.getElementById('galleryInfo');
        
        if (image) {
            image.src = this.galleryImages[this.currentGalleryIndex];
        }
        
        if (info) {
            info.textContent = `${this.currentGalleryIndex + 1} / ${this.galleryImages.length}`;
        }
        
        // Gérer l'affichage des boutons précédent/suivant
        const prevBtn = document.getElementById('galleryPrev');
        const nextBtn = document.getElementById('galleryNext');
        
        if (prevBtn) {
            prevBtn.style.display = this.galleryImages.length > 1 ? 'block' : 'none';
        }
        
        if (nextBtn) {
            nextBtn.style.display = this.galleryImages.length > 1 ? 'block' : 'none';
        }
    }
    
    galleryPrevious() {
        if (this.galleryImages.length <= 1) return;
        this.currentGalleryIndex = (this.currentGalleryIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
        this.updateGalleryImage();
    }
    
    galleryNext() {
        if (this.galleryImages.length <= 1) return;
        this.currentGalleryIndex = (this.currentGalleryIndex + 1) % this.galleryImages.length;
        this.updateGalleryImage();
    }
    
    // Utilitaires
    generateId() {
        return 'prompt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showToast(message, type = 'info') {
        // Supprimer les toasts existants sur mobile
        if (this.isMobile) {
            const existingToasts = document.querySelectorAll('.toast');
            existingToasts.forEach(toast => toast.remove());
        }
        
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.style.cssText = `
                position: fixed;
                bottom: ${this.isMobile ? '80px' : '20px'};
                left: ${this.isMobile ? '50%' : 'auto'};
                right: ${this.isMobile ? 'auto' : '20px'};
                transform: ${this.isMobile ? 'translateX(-50%)' : 'none'};
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.style.cssText = `
            background: ${type === 'success' ? '#10b981' : 
                         type === 'error' ? '#ef4444' : 
                         type === 'warning' ? '#f59e0b' : 
                         '#3b82f6'};
            color: white;
            padding: 12px 24px;
            border-radius: ${this.isMobile ? '50px' : '8px'};
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 8px;
            animation: ${this.isMobile ? 'slideInUp' : 'slideInRight'} 0.3s ease;
            pointer-events: auto;
            ${this.isMobile ? 'white-space: nowrap;' : ''}
        `;
        
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                           type === 'error' ? 'fa-times-circle' : 
                           type === 'warning' ? 'fa-exclamation-circle' : 
                           'fa-info-circle'}"></i>
            ${message}
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = this.isMobile ? 'slideOutDown 0.3s ease' : 'fadeOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // Ajouter une catégorie (pour le bouton + dans le modal)
    addCategory() {
        const nameField = document.getElementById('newCategoryName');
        const iconField = document.getElementById('newCategoryIcon');
        
        if (!nameField || !nameField.value.trim()) {
            this.showToast('Veuillez entrer un nom de catégorie', 'warning');
            return;
        }
        
        const categoryData = {
            id: this.generateId(),
            name: nameField.value.trim(),
            icon: iconField?.value || 'fa-folder'
        };
        
        // Vérifier si le nom existe déjà
        if (this.categories.some(c => c.name.toLowerCase() === categoryData.name.toLowerCase())) {
            this.showToast('Une catégorie avec ce nom existe déjà', 'error');
            return;
        }
        
        this.categories.push(categoryData);
        this.saveCategories();
        this.renderCategories();
        
        // Rafraîchir la liste dans le modal de gestion des catégories
        this.refreshCategoriesList();
        
        // Réinitialiser les champs
        nameField.value = '';
        if (iconField) iconField.value = 'fa-folder';
        
        this.showToast('Catégorie ajoutée avec succès', 'success');
    }
    
    // Rafraîchir la liste des catégories dans le modal
    refreshCategoriesList() {
        const list = document.getElementById('categoriesList');
        if (!list) return;
        
        list.innerHTML = this.categories.map(cat => {
            const promptCount = this.prompts.filter(p => p.category === cat.id).length;
            return `
                <div class="category-list-item">
                    <div class="category-info">
                        <i class="fas ${cat.icon}"></i>
                        <span>${cat.name}</span>
                        <span class="category-count">${promptCount} prompts</span>
                    </div>
                    <button class="btn btn-sm btn-danger" onclick="app.deleteCategory('${cat.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        }).join('');
    }
    
    // Afficher le modal de gestion des catégories
    showCategoryModal() {
        const modal = document.getElementById('categoryModal');
        if (modal) {
            this.refreshCategoriesList();
            modal.classList.add('show');
            modal.style.display = 'flex';
        }
    }
    
    // Fonctions pour mobile (scroll, recherche)
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    toggleSearch() {
        const searchBar = document.getElementById('searchBar') || document.getElementById('searchInput');
        if (searchBar) {
            searchBar.focus();
            searchBar.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    // Fonctions pour les templates JSON
    applyJsonTemplate() {
        const templateSelect = document.getElementById('jsonTemplate');
        if (templateSelect && templateSelect.value) {
            this.insertTemplate(templateSelect.value);
        }
    }
    
    // Fonction pour importer des prompts
    importPrompts() {
        const importInput = document.getElementById('importInput') || document.getElementById('importFile');
        if (importInput) {
            importInput.click();
        }
    }
    
    // Fonction pour exporter des prompts
    exportPrompts() {
        this.exportData();
    }
    
    // Fonction pour vérifier les doublons
    checkDuplicates() {
        if (window.duplicateDetector) {
            window.duplicateDetector.showDuplicatesModal();
        } else {
            this.showToast('Détecteur de doublons non disponible', 'warning');
        }
    }
    
    // Fonction pour copier du texte dans le presse-papier
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('Copié dans le presse-papier!', 'success');
        }).catch(err => {
            console.error('Erreur lors de la copie:', err);
            // Fallback pour les anciens navigateurs
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('Copié!', 'success');
        });
    }
    
    // Fonction pour afficher le modal principal
    showPromptModal() {
        this.openPromptModal();
    }
    
    // Fonction pour fermer un modal par ID
    closeModalById(modalId) {
        this.closeModal(modalId);
    }
}

// Fonctions globales pour compatibilité avec onclick dans HTML
window.app = null;

// Fonctions utilitaires globales
window.scrollToTop = function() {
    if (window.app) window.app.scrollToTop();
};

window.toggleSearch = function() {
    if (window.app) window.app.toggleSearch();
};

window.showPromptModal = function() {
    if (window.app) window.app.showPromptModal();
};

window.copyToClipboard = function(text) {
    if (window.app) window.app.copyToClipboard(text);
};

window.loadExamples = function() {
    if (window.app) window.app.loadExamples();
};

window.importPrompts = function() {
    if (window.app) window.app.importPrompts();
};

window.exportPrompts = function() {
    if (window.app) window.app.exportPrompts();
};

window.checkDuplicates = function() {
    if (window.app) window.app.checkDuplicates();
};

window.applyJsonTemplate = function() {
    if (window.app) window.app.applyJsonTemplate();
};

window.showCategoryModal = function() {
    if (window.app) window.app.showCategoryModal();
};

window.addCategory = function() {
    if (window.app) window.app.addCategory();
};

// Initialiser l'application au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PromptManager();
    
    // Ajouter les styles d'animation si ils n'existent pas
    if (!document.getElementById('mobileAnimations')) {
        const style = document.createElement('style');
        style.id = 'mobileAnimations';
        style.textContent = `
            @keyframes slideInUp {
                from {
                    transform: translateY(100%) translateX(-50%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0) translateX(-50%);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutDown {
                from {
                    transform: translateY(0) translateX(-50%);
                    opacity: 1;
                }
                to {
                    transform: translateY(100%) translateX(-50%);
                    opacity: 0;
                }
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes fadeOut {
                from {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
});
