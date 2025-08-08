// Gestionnaire de prompts - Application principale
class PromptManager {
    constructor() {
        this.prompts = this.loadPrompts();
        this.categories = this.loadCategories();
        this.currentCategory = 'all';
        this.currentEditId = null;
        this.tempImages = []; // Images temporaires pour le formulaire
        this.galleryImages = []; // Images pour la galerie
        this.currentGalleryIndex = 0;
        this.init();
    }

    // Initialisation
    init() {
        this.setupEventListeners();
        this.renderCategories();
        this.renderPrompts();
        this.updateTheme();
        this.checkForExamples();
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
            { id: 'flux', name: 'Flux', icon: 'fa-bolt' },
            { id: 'krea', name: 'Krea', icon: 'fa-palette' },
            { id: 'portrait', name: 'Portraits', icon: 'fa-user' },
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
        document.getElementById('addPromptBtn').addEventListener('click', () => this.openPromptModal());
        document.getElementById('addCategoryBtn').addEventListener('click', () => this.openCategoryModal());
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
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchPrompts(e.target.value);
        });
        
        // Modal Prompt
        document.getElementById('closeModal').addEventListener('click', () => this.closePromptModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closePromptModal());
        document.getElementById('promptForm').addEventListener('submit', (e) => this.savePrompt(e));
        
        // Modal Catégorie
        document.getElementById('closeCategoryModal').addEventListener('click', () => this.closeCategoryModal());
        document.getElementById('cancelCategoryBtn').addEventListener('click', () => this.closeCategoryModal());
        document.getElementById('categoryForm').addEventListener('submit', (e) => this.saveCategory(e));
        
        // Upload d'images
        document.getElementById('promptImages').addEventListener('change', (e) => this.handleImageUpload(e));
        
        // Drag and drop pour les images
        const uploadZone = document.querySelector('.image-upload-zone');
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('drag-over');
        });
        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('drag-over');
        });
        uploadZone.addEventListener('drop', (e) => {            e.preventDefault();
            uploadZone.classList.remove('drag-over');
            this.handleImageDrop(e);
        });
        
        // Galerie d'images
        document.getElementById('galleryClose').addEventListener('click', () => this.closeGallery());
        document.getElementById('galleryPrev').addEventListener('click', () => this.galleryPrevious());
        document.getElementById('galleryNext').addEventListener('click', () => this.galleryNext());
        document.getElementById('imageGalleryModal').addEventListener('click', (e) => {
            if (e.target.id === 'imageGalleryModal') this.closeGallery();
        });
        
        // Fermer modal en cliquant dehors
        document.getElementById('promptModal').addEventListener('click', (e) => {
            if (e.target.id === 'promptModal') this.closePromptModal();
        });
        document.getElementById('categoryModal').addEventListener('click', (e) => {
            if (e.target.id === 'categoryModal') this.closeCategoryModal();
        });
    }
    
    // Rendu des catégories
    renderCategories() {
        const list = document.getElementById('categoryList');
        const selectCategory = document.getElementById('promptCategory');
        
        // Compter les prompts par catégorie
        const counts = { all: this.prompts.length };
        this.categories.forEach(cat => {            counts[cat.id] = this.prompts.filter(p => p.category === cat.id).length;
        });
        
        // Catégorie "Tous"
        let html = `
            <li class="category-item ${this.currentCategory === 'all' ? 'active' : ''}" 
                data-category="all" onclick="app.filterByCategory('all')">
                <span><i class="fas fa-folder"></i> Tous les prompts</span>
                <span class="count">${counts.all}</span>
            </li>
        `;
        
        // Options pour le select
        let options = '<option value="">Sélectionner une catégorie</option>';
        
        // Autres catégories
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
            options += `<option value="${cat.id}">${cat.name}</option>`;
        });
        
        list.innerHTML = html;
        selectCategory.innerHTML = options;
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
            document.getElementById('sectionTitle').textContent = 'Tous les prompts';
        }
        
        // Rafraîchir l'affichage
        this.renderCategories();
        this.renderPrompts();
        
        // Déclencher la sauvegarde automatique
        if (window.autoBackup && window.autoBackup.settings.enabled) {
            window.autoBackup.createBackupSilent();
        }
    }
    
    // Rendu des prompts
    renderPrompts(filteredPrompts = null) {
        const grid = document.getElementById('promptsGrid');
        const emptyState = document.getElementById('emptyState');
        const prompts = filteredPrompts || this.getFilteredPrompts();
        
        if (prompts.length === 0) {
            grid.innerHTML = '';
            emptyState.classList.add('show');
            return;
        }
        
        emptyState.classList.remove('show');
        
        grid.innerHTML = prompts.map(prompt => {
            const category = this.categories.find(c => c.id === prompt.category);
            const tags = prompt.tags ? prompt.tags.split(',').map(t => t.trim()).filter(t => t) : [];
            const images = prompt.images || [];
            
            return `
                <div class="prompt-card" data-id="${prompt.id}">
                    <div class="prompt-card-header">
                        <div>
                            <h3>${this.escapeHtml(prompt.title)}</h3>
                            <div class="prompt-card-category">
                                <i class="fas ${category?.icon || 'fa-folder'}"></i>
                                ${category?.name || 'Non catégorisé'}
                            </div>
                        </div>                        <div class="prompt-card-actions">
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
                                    <img src="${img}" alt="Image ${index + 1}">
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
                        </a>                    ` : ''}
                    
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
                </div>
            `;
        }).join('');
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
                // Mettre à jour le titre
        const category = this.categories.find(c => c.id === categoryId);
        document.getElementById('sectionTitle').textContent = 
            categoryId === 'all' ? 'Tous les prompts' : category?.name || 'Prompts';
        
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
        document.getElementById('imagePreviewGrid').innerHTML = '';
        
        if (promptId) {
            const prompt = this.prompts.find(p => p.id === promptId);
            if (prompt) {
                title.textContent = 'Éditer le prompt';
                document.getElementById('promptTitle').value = prompt.title;
                document.getElementById('promptCategory').value = prompt.category;
                document.getElementById('promptReplicateLink').value = prompt.replicateLink || '';
                document.getElementById('promptDescription').value = prompt.description || '';
                document.getElementById('promptContent').value = prompt.content;
                document.getElementById('promptComment').value = prompt.comment || '';
                document.getElementById('promptJson').value = prompt.jsonParams || '';
                document.getElementById('promptTags').value = prompt.tags || '';
                this.currentEditId = promptId;
                
                // Charger les images existantes
                if (prompt.images && prompt.images.length > 0) {
                    this.tempImages = [...prompt.images];
                    this.renderImagePreviews();
                }
            }
        } else {
            title.textContent = 'Nouveau Prompt';
            form.reset();
            this.currentEditId = null;
        }
        
        modal.classList.add('show');
        
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
        document.getElementById('promptModal').classList.remove('show');
        document.getElementById('promptForm').reset();
        document.getElementById('imagePreviewGrid').innerHTML = '';
        this.tempImages = [];
        this.currentEditId = null;
        
        // Cacher l'indicateur de doublon
        if (window.duplicateDetector) {
            window.duplicateDetector.hideDuplicateIndicator();
        }
    }
    
    savePrompt(e) {
        e.preventDefault();
        
        const promptData = {
            id: this.currentEditId || this.generateId(),
            title: document.getElementById('promptTitle').value,
            category: document.getElementById('promptCategory').value,
            replicateLink: document.getElementById('promptReplicateLink').value,
            description: document.getElementById('promptDescription').value,
            content: document.getElementById('promptContent').value,
            comment: document.getElementById('promptComment').value,
            jsonParams: document.getElementById('promptJson').value,
            tags: document.getElementById('promptTags').value,
            images: this.tempImages,
            createdAt: this.currentEditId ? 
                this.prompts.find(p => p.id === this.currentEditId).createdAt : 
                new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (this.currentEditId) {
            const index = this.prompts.findIndex(p => p.id === this.currentEditId);
            this.prompts[index] = promptData;            this.showToast('Prompt modifié avec succès', 'success');
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
            navigator.clipboard.writeText(prompt.content).then(() => {                this.showToast('Prompt copié dans le presse-papier !', 'success');
            }).catch(() => {
                this.showToast('Erreur lors de la copie', 'error');
            });
        }
    }
    
    copyJson(promptId) {
        const prompt = this.prompts.find(p => p.id === promptId);
        if (prompt && prompt.jsonParams) {
            navigator.clipboard.writeText(prompt.jsonParams).then(() => {
                this.showToast('Paramètres JSON copiés !', 'success');
            }).catch(() => {
                this.showToast('Erreur lors de la copie', 'error');
            });
        }
    }
    
    formatJson() {
        const jsonTextarea = document.getElementById('promptJson');
        const statusElement = document.getElementById('jsonStatus');
        
        if (!jsonTextarea.value.trim()) {
            statusElement.textContent = '';
            return;
        }
        
        try {
            const parsed = JSON.parse(jsonTextarea.value);
            jsonTextarea.value = JSON.stringify(parsed, null, 2);
            statusElement.textContent = '✅ JSON formaté avec succès';
            statusElement.className = 'json-status success';
            setTimeout(() => {
                statusElement.textContent = '';
            }, 3000);
        } catch (e) {
            statusElement.textContent = '❌ JSON invalide: ' + e.message;
            statusElement.className = 'json-status error';
        }
    }
    
    validateJson() {
        const jsonTextarea = document.getElementById('promptJson');
        const statusElement = document.getElementById('jsonStatus');
        
        if (!jsonTextarea.value.trim()) {
            statusElement.textContent = 'ℹ️ Aucun JSON à valider';
            statusElement.className = 'json-status info';
            setTimeout(() => {
                statusElement.textContent = '';
            }, 3000);
            return;
        }
        
        try {
            JSON.parse(jsonTextarea.value);
            statusElement.textContent = '✅ JSON valide !';
            statusElement.className = 'json-status success';
            setTimeout(() => {
                statusElement.textContent = '';
            }, 3000);
        } catch (e) {
            statusElement.textContent = '❌ JSON invalide: ' + e.message;
            statusElement.className = 'json-status error';
        }
    }
    
    showJsonTemplates() {
        const templatesDiv = document.getElementById('jsonTemplates');
        if (templatesDiv.style.display === 'none') {
            templatesDiv.style.display = 'block';
        } else {
            templatesDiv.style.display = 'none';
        }
    }
    
    insertTemplate(templateName) {
        const templates = {
            'flux': {
                "model": "flux-1.1-pro",
                "guidance_scale": 3.5,
                "num_inference_steps": 25,
                "width": 1024,
                "height": 1024,
                "prompt_strength": 0.8,
                "seed": -1
            },
            'sdxl': {
                "model": "stable-diffusion-xl",
                "cfg_scale": 7,
                "steps": 30,
                "sampler": "DPM++ 2M Karras",
                "width": 1024,
                "height": 1024,
                "negative_prompt": "",
                "seed": -1
            },
            'sdxl_turbo': {
                "model": "sdxl-turbo",
                "cfg_scale": 1,
                "steps": 1,
                "sampler": "Euler a",
                "width": 512,
                "height": 512,
                "seed": -1
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
            'dalle3': {
                "model": "dall-e-3",
                "quality": "hd",
                "size": "1024x1024",
                "style": "vivid",
                "n": 1
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
            'comfyui': {
                "checkpoint": "model.safetensors",
                "seed": -1,
                "steps": 20,
                "cfg": 8,
                "sampler_name": "euler",
                "scheduler": "normal",
                "width": 1024,
                "height": 1024
            },
            'automatic1111': {
                "steps": 20,
                "sampler_name": "Euler a",
                "cfg_scale": 7,
                "seed": -1,
                "width": 512,
                "height": 512,
                "batch_size": 1
            }
        };
        
        const template = templates[templateName];
        if (template) {
            document.getElementById('promptJson').value = JSON.stringify(template, null, 2);
            document.getElementById('jsonTemplates').style.display = 'none';
            this.showToast(`Template ${templateName.toUpperCase()} inséré !`, 'success');
        }
    }
    
    // Gestion des catégories
    openCategoryModal() {
        document.getElementById('categoryModal').classList.add('show');
    }
    
    closeCategoryModal() {
        document.getElementById('categoryModal').classList.remove('show');
        document.getElementById('categoryForm').reset();
    }
    
    saveCategory(e) {
        e.preventDefault();
        
        const categoryData = {
            id: this.generateId(),
            name: document.getElementById('categoryName').value,
            icon: document.getElementById('categoryIcon').value || 'fa-folder'
        };
        
        // Vérifier si le nom existe déjà
        if (this.categories.some(c => c.name.toLowerCase() === categoryData.name.toLowerCase())) {
            this.showToast('Une catégorie avec ce nom existe déjà', 'error');
            return;        }
        
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
        document.getElementById('loadExamplesBtn').style.display = 'none';
        this.showToast('Exemples de prompts chargés avec succès !', 'success');
    }
    
    // Thème
    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const icon = document.querySelector('#themeToggle i');
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    updateTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        
        const icon = document.querySelector('#themeToggle i');
        icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
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
        
        files.forEach(file => {            const reader = new FileReader();
            reader.onload = (event) => {
                this.tempImages.push(event.target.result);
                this.renderImagePreviews();
            };
            reader.readAsDataURL(file);
        });
    }
    
    renderImagePreviews() {
        const grid = document.getElementById('imagePreviewGrid');
        grid.innerHTML = this.tempImages.map((img, index) => `
            <div class="image-preview-item">
                <img src="${img}" alt="Image ${index + 1}" onclick="app.previewImage('${img}')">
                <button class="btn-remove-image" onclick="app.removeImage(${index})">
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
        window.open(imageSrc, '_blank');
    }
        // Galerie d'images
    openGallery(promptId, startIndex = 0) {
        const prompt = this.prompts.find(p => p.id === promptId);
        if (!prompt || !prompt.images || prompt.images.length === 0) return;
        
        this.galleryImages = prompt.images;
        this.currentGalleryIndex = startIndex;
        this.updateGalleryImage();
        
        document.getElementById('imageGalleryModal').classList.add('show');
    }
    
    closeGallery() {
        document.getElementById('imageGalleryModal').classList.remove('show');
        this.galleryImages = [];
        this.currentGalleryIndex = 0;
    }
    
    updateGalleryImage() {
        if (this.galleryImages.length === 0) return;
        
        const image = document.getElementById('galleryImage');
        const info = document.getElementById('galleryInfo');
        
        image.src = this.galleryImages[this.currentGalleryIndex];
        info.textContent = `${this.currentGalleryIndex + 1} / ${this.galleryImages.length}`;
        
        // Gérer l'affichage des boutons précédent/suivant
        document.getElementById('galleryPrev').style.display = 
            this.galleryImages.length > 1 ? 'block' : 'none';        document.getElementById('galleryNext').style.display = 
            this.galleryImages.length > 1 ? 'block' : 'none';
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
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                           type === 'error' ? 'fa-times-circle' : 
                           type === 'warning' ? 'fa-exclamation-circle' : 
                           'fa-info-circle'}"></i>
            ${message}
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialiser l'application au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PromptManager();
});