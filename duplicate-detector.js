// Système de détection de doublons pour Prompt Manager
class DuplicateDetector {
    constructor(promptManager) {
        this.promptManager = promptManager;
        this.duplicates = [];
        this.init();
    }
    
    init() {
        this.addDuplicateControls();
        this.addRealTimeDetection();
    }
    
    // Ajouter les contrôles dans l'interface
    addDuplicateControls() {
        // Ajouter le bouton de vérification des doublons
        const headerActions = document.querySelector('.header-actions');
        const duplicateBtn = document.createElement('button');
        duplicateBtn.className = 'btn-icon';
        duplicateBtn.id = 'duplicateBtn';
        duplicateBtn.title = 'Vérifier les doublons';
        duplicateBtn.innerHTML = '<i class="fas fa-clone"></i>';
        duplicateBtn.onclick = () => this.showDuplicatesModal();
        
        // Insérer après le bouton de sauvegarde
        const backupBtn = document.getElementById('backupBtn');
        if (backupBtn) {
            backupBtn.parentNode.insertBefore(duplicateBtn, backupBtn.nextSibling);
        } else {
            const themeBtn = document.getElementById('themeToggle');
            headerActions.insertBefore(duplicateBtn, themeBtn);
        }
        
        // Ajouter un indicateur de doublons
        this.updateDuplicateIndicator();
    }
    
    // Détection en temps réel lors de la saisie
    addRealTimeDetection() {
        const contentTextarea = document.getElementById('promptContent');
        const jsonTextarea = document.getElementById('promptJson');
        
        if (contentTextarea) {
            // Créer l'indicateur de doublon
            const indicator = document.createElement('div');
            indicator.id = 'duplicateIndicator';
            indicator.className = 'duplicate-indicator';
            indicator.style.display = 'none';
            contentTextarea.parentNode.insertBefore(indicator, contentTextarea.nextSibling);
            
            // Détection avec debounce
            let debounceTimer;
            contentTextarea.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.checkForDuplicateRealTime();
                }, 500);
            });
            
            if (jsonTextarea) {
                jsonTextarea.addEventListener('input', () => {
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(() => {
                        this.checkForDuplicateRealTime();
                    }, 500);
                });
            }
        }
    }
    
    // Vérifier les doublons en temps réel
    checkForDuplicateRealTime() {
        const currentContent = document.getElementById('promptContent').value.trim();
        const currentJson = document.getElementById('promptJson').value.trim();
        const currentEditId = this.promptManager.currentEditId;
        
        if (!currentContent) {
            this.hideDuplicateIndicator();
            return;
        }
        
        const duplicates = this.findDuplicates(currentContent, currentJson, currentEditId);
        
        if (duplicates.length > 0) {
            this.showDuplicateIndicator(duplicates);
        } else {
            this.hideDuplicateIndicator();
        }
    }
    
    // Afficher l'indicateur de doublon
    showDuplicateIndicator(duplicates) {
        const indicator = document.getElementById('duplicateIndicator');
        if (!indicator) return;
        
        const isDuplicate = duplicates.some(d => d.similarity === 100);
        const isSimilar = duplicates.some(d => d.similarity >= 80 && d.similarity < 100);
        
        if (isDuplicate) {
            indicator.className = 'duplicate-indicator duplicate';
            indicator.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <span>Attention : Prompt identique détecté !</span>
                <button onclick="duplicateDetector.showDuplicateDetails('${duplicates[0].id}')">Voir</button>
            `;
        } else if (isSimilar) {
            indicator.className = 'duplicate-indicator similar';
            indicator.innerHTML = `
                <i class="fas fa-info-circle"></i>
                <span>Prompt similaire trouvé (${Math.round(duplicates[0].similarity)}% de similarité)</span>
                <button onclick="duplicateDetector.showDuplicateDetails('${duplicates[0].id}')">Voir</button>
            `;
        }
        
        indicator.style.display = 'flex';
    }
    
    // Cacher l'indicateur
    hideDuplicateIndicator() {
        const indicator = document.getElementById('duplicateIndicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }
    
    // Trouver les doublons
    findDuplicates(content, jsonParams = '', excludeId = null) {
        const duplicates = [];
        
        this.promptManager.prompts.forEach(prompt => {
            if (excludeId && prompt.id === excludeId) return;
            
            // Calculer la similarité
            const contentSimilarity = this.calculateSimilarity(content, prompt.content);
            const jsonSimilarity = this.calculateJsonSimilarity(jsonParams, prompt.jsonParams || '');
            
            // Si le contenu est identique mais le JSON différent, ce n'est pas un doublon complet
            const isDuplicate = contentSimilarity === 100 && jsonSimilarity === 100;
            const isPartialDuplicate = contentSimilarity === 100 && jsonSimilarity < 100;
            const isSimilar = contentSimilarity >= 80;
            
            if (isDuplicate || isPartialDuplicate || isSimilar) {
                duplicates.push({
                    id: prompt.id,
                    title: prompt.title,
                    category: prompt.category,
                    content: prompt.content,
                    jsonParams: prompt.jsonParams,
                    similarity: contentSimilarity,
                    jsonSimilarity: jsonSimilarity,
                    type: isDuplicate ? 'duplicate' : isPartialDuplicate ? 'partial' : 'similar'
                });
            }
        });
        
        return duplicates.sort((a, b) => b.similarity - a.similarity);
    }
    
    // Calculer la similarité entre deux textes (algorithme de Levenshtein)
    calculateSimilarity(str1, str2) {
        if (!str1 || !str2) return 0;
        if (str1 === str2) return 100;
        
        // Normaliser les textes
        const s1 = str1.toLowerCase().trim();
        const s2 = str2.toLowerCase().trim();
        
        if (s1 === s2) return 100;
        
        // Algorithme de distance de Levenshtein
        const longer = s1.length > s2.length ? s1 : s2;
        const shorter = s1.length > s2.length ? s2 : s1;
        
        if (longer.length === 0) return 100;
        
        const editDistance = this.levenshteinDistance(longer, shorter);
        const similarity = ((longer.length - editDistance) / longer.length) * 100;
        
        return Math.round(similarity);
    }
    
    // Distance de Levenshtein
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }
    
    // Calculer la similarité JSON
    calculateJsonSimilarity(json1, json2) {
        if (!json1 && !json2) return 100;
        if (!json1 || !json2) return 0;
        if (json1 === json2) return 100;
        
        try {
            const obj1 = JSON.parse(json1);
            const obj2 = JSON.parse(json2);
            
            // Comparer les clés
            const keys1 = Object.keys(obj1).sort();
            const keys2 = Object.keys(obj2).sort();
            
            if (keys1.join(',') !== keys2.join(',')) return 50;
            
            // Comparer les valeurs
            let matches = 0;
            let total = keys1.length;
            
            keys1.forEach(key => {
                if (JSON.stringify(obj1[key]) === JSON.stringify(obj2[key])) {
                    matches++;
                }
            });
            
            return Math.round((matches / total) * 100);
            
        } catch (e) {
            // Si ce n'est pas du JSON valide, comparer comme du texte
            return this.calculateSimilarity(json1, json2);
        }
    }
    
    // Scanner tous les prompts pour les doublons
    scanAllDuplicates() {
        const duplicateGroups = [];
        const processed = new Set();
        
        this.promptManager.prompts.forEach((prompt, index) => {
            if (processed.has(prompt.id)) return;
            
            const duplicates = this.findDuplicates(prompt.content, prompt.jsonParams, prompt.id);
            
            if (duplicates.length > 0) {
                const group = {
                    original: prompt,
                    duplicates: duplicates
                };
                duplicateGroups.push(group);
                processed.add(prompt.id);
                duplicates.forEach(d => processed.add(d.id));
            }
        });
        
        return duplicateGroups;
    }
    
    // Afficher le modal des doublons
    showDuplicatesModal() {
        const duplicateGroups = this.scanAllDuplicates();
        
        const existingModal = document.getElementById('duplicatesModal');
        if (existingModal) existingModal.remove();
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'duplicatesModal';
        
        const totalDuplicates = duplicateGroups.reduce((sum, group) => sum + group.duplicates.length, 0);
        
        modal.innerHTML = `
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h2>
                        <i class="fas fa-clone"></i> 
                        Analyse des doublons
                        ${totalDuplicates > 0 ? `<span class="badge">${totalDuplicates}</span>` : ''}
                    </h2>
                    <button class="btn-close" onclick="duplicateDetector.closeDuplicatesModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body duplicates-body">
                    ${duplicateGroups.length === 0 ? `
                        <div class="no-duplicates">
                            <i class="fas fa-check-circle"></i>
                            <h3>Aucun doublon détecté !</h3>
                            <p>Tous vos prompts sont uniques.</p>
                        </div>
                    ` : `
                        <div class="duplicates-stats">
                            <div class="stat">
                                <i class="fas fa-copy"></i>
                                <span>${duplicateGroups.length} groupe(s) de doublons</span>
                            </div>
                            <div class="stat">
                                <i class="fas fa-exclamation-triangle"></i>
                                <span>${totalDuplicates} prompt(s) similaire(s)</span>
                            </div>
                        </div>
                        <div class="duplicates-list">
                            ${duplicateGroups.map((group, index) => this.renderDuplicateGroup(group, index)).join('')}
                        </div>
                    `}
                </div>
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="duplicateDetector.closeDuplicatesModal()">
                        Fermer
                    </button>
                    ${duplicateGroups.length > 0 ? `
                        <button class="btn-primary" onclick="duplicateDetector.cleanupDuplicates()">
                            <i class="fas fa-broom"></i> Nettoyer les doublons exacts
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    // Rendre un groupe de doublons
    renderDuplicateGroup(group, index) {
        const category = this.promptManager.categories.find(c => c.id === group.original.category);
        
        return `
            <div class="duplicate-group">
                <div class="duplicate-header">
                    <h4>Groupe ${index + 1}: ${group.original.title}</h4>
                    <span class="category-badge">
                        <i class="fas ${category?.icon || 'fa-folder'}"></i> 
                        ${category?.name || 'Non catégorisé'}
                    </span>
                </div>
                <div class="duplicate-original">
                    <div class="prompt-preview">
                        <div class="preview-header">
                            <strong>Original:</strong>
                            <div class="actions">
                                <button onclick="app.editPrompt('${group.original.id}')" title="Éditer">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </div>
                        </div>
                        <div class="preview-content">${this.promptManager.escapeHtml(group.original.content)}</div>
                        ${group.original.jsonParams ? `
                            <div class="preview-json">
                                <strong>JSON:</strong> ${this.promptManager.escapeHtml(group.original.jsonParams).substring(0, 100)}...
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="duplicate-items">
                    ${group.duplicates.map(dup => this.renderDuplicateItem(dup)).join('')}
                </div>
            </div>
        `;
    }
    
    // Rendre un élément doublon
    renderDuplicateItem(duplicate) {
        const typeLabel = duplicate.type === 'duplicate' ? 'Identique' : 
                         duplicate.type === 'partial' ? 'Contenu identique' : 
                         'Similaire';
        const typeClass = duplicate.type === 'duplicate' ? 'duplicate' : 
                         duplicate.type === 'partial' ? 'partial' : 
                         'similar';
        
        return `
            <div class="duplicate-item ${typeClass}">
                <div class="duplicate-info">
                    <span class="duplicate-title">${duplicate.title}</span>
                    <span class="duplicate-badge ${typeClass}">
                        ${typeLabel} (${duplicate.similarity}%)
                    </span>
                    ${duplicate.jsonSimilarity < 100 && duplicate.similarity === 100 ? `
                        <span class="json-diff-badge">JSON différent</span>
                    ` : ''}
                </div>
                <div class="duplicate-actions">
                    <button onclick="duplicateDetector.compareDuplicates('${duplicate.id}')" title="Comparer">
                        <i class="fas fa-exchange-alt"></i>
                    </button>
                    <button onclick="app.editPrompt('${duplicate.id}')" title="Éditer">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="duplicateDetector.deleteDuplicate('${duplicate.id}')" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    // Afficher les détails d'un doublon
    showDuplicateDetails(promptId) {
        const prompt = this.promptManager.prompts.find(p => p.id === promptId);
        if (!prompt) return;
        
        // Fermer le modal de création/édition si ouvert
        this.promptManager.closePromptModal();
        
        // Ouvrir le prompt en mode édition
        this.promptManager.openPromptModal(promptId);
    }
    
    // Comparer deux prompts
    compareDuplicates(promptId) {
        const prompt = this.promptManager.prompts.find(p => p.id === promptId);
        if (!prompt) return;
        
        // Créer un modal de comparaison
        const compareModal = document.createElement('div');
        compareModal.className = 'modal show';
        compareModal.id = 'compareModal';
        compareModal.innerHTML = `
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h2>Comparaison de prompts</h2>
                    <button class="btn-close" onclick="document.getElementById('compareModal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body compare-body">
                    <div class="compare-grid">
                        <div class="compare-column">
                            <h3>Original (en édition)</h3>
                            <div class="compare-content">
                                <strong>Titre:</strong> ${document.getElementById('promptTitle')?.value || 'N/A'}<br>
                                <strong>Contenu:</strong><br>
                                <pre>${document.getElementById('promptContent')?.value || 'N/A'}</pre>
                                ${document.getElementById('promptJson')?.value ? `
                                    <strong>JSON:</strong><br>
                                    <pre>${document.getElementById('promptJson').value}</pre>
                                ` : ''}
                            </div>
                        </div>
                        <div class="compare-column">
                            <h3>${prompt.title}</h3>
                            <div class="compare-content">
                                <strong>Titre:</strong> ${prompt.title}<br>
                                <strong>Contenu:</strong><br>
                                <pre>${prompt.content}</pre>
                                ${prompt.jsonParams ? `
                                    <strong>JSON:</strong><br>
                                    <pre>${prompt.jsonParams}</pre>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="document.getElementById('compareModal').remove()">
                        Fermer
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(compareModal);
    }
    
    // Supprimer un doublon
    deleteDuplicate(promptId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce prompt ?')) {
            this.promptManager.prompts = this.promptManager.prompts.filter(p => p.id !== promptId);
            this.promptManager.savePrompts();
            this.promptManager.renderCategories();
            this.promptManager.renderPrompts();
            this.promptManager.showToast('Doublon supprimé', 'success');
            
            // Rafraîchir le modal
            this.showDuplicatesModal();
        }
    }
    
    // Nettoyer tous les doublons exacts
    cleanupDuplicates() {
        const duplicateGroups = this.scanAllDuplicates();
        let deletedCount = 0;
        
        duplicateGroups.forEach(group => {
            group.duplicates.forEach(dup => {
                if (dup.type === 'duplicate') {
                    this.promptManager.prompts = this.promptManager.prompts.filter(p => p.id !== dup.id);
                    deletedCount++;
                }
            });
        });
        
        if (deletedCount > 0) {
            this.promptManager.savePrompts();
            this.promptManager.renderCategories();
            this.promptManager.renderPrompts();
            this.promptManager.showToast(`${deletedCount} doublon(s) exact(s) supprimé(s)`, 'success');
            
            // Rafraîchir le modal
            this.showDuplicatesModal();
        } else {
            this.promptManager.showToast('Aucun doublon exact à supprimer', 'info');
        }
    }
    
    // Fermer le modal des doublons
    closeDuplicatesModal() {
        const modal = document.getElementById('duplicatesModal');
        if (modal) modal.remove();
    }
    
    // Mettre à jour l'indicateur de doublons
    updateDuplicateIndicator() {
        const duplicateGroups = this.scanAllDuplicates();
        const totalDuplicates = duplicateGroups.reduce((sum, group) => sum + group.duplicates.length, 0);
        
        const duplicateBtn = document.getElementById('duplicateBtn');
        if (duplicateBtn) {
            if (totalDuplicates > 0) {
                duplicateBtn.innerHTML = `
                    <i class="fas fa-clone"></i>
                    <span class="badge-small">${totalDuplicates}</span>
                `;
                duplicateBtn.classList.add('has-duplicates');
            } else {
                duplicateBtn.innerHTML = '<i class="fas fa-clone"></i>';
                duplicateBtn.classList.remove('has-duplicates');
            }
        }
    }
}

// Initialiser le détecteur de doublons
let duplicateDetector;
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.app) {
            duplicateDetector = new DuplicateDetector(window.app);
            window.duplicateDetector = duplicateDetector;
            
            // Mettre à jour l'indicateur après le rendu initial
            setTimeout(() => {
                duplicateDetector.updateDuplicateIndicator();
            }, 500);
        }
    }, 200);
});