// Système de fusion de prompts identiques
class PromptMerger {
    constructor(promptManager) {
        this.promptManager = promptManager;
        this.duplicateGroups = new Map();
        this.mergeMode = false;
        this.selectedForMerge = new Set();
        this.init();
    }
    
    init() {
        this.addMergeControls();
        this.detectDuplicateGroups();
    }
    
    // Ajouter les contrôles de fusion
    addMergeControls() {
        // Bouton de mode fusion
        const headerActions = document.querySelector('.header-actions');
        const mergeBtn = document.createElement('button');
        mergeBtn.className = 'btn-icon';
        mergeBtn.id = 'mergeBtn';
        mergeBtn.title = 'Mode fusion des doublons';
        mergeBtn.innerHTML = '<i class="fas fa-object-group"></i>';
        mergeBtn.onclick = () => this.toggleMergeMode();
        
        // Insérer après le bouton de doublons
        const duplicateBtn = document.getElementById('duplicateBtn');
        if (duplicateBtn) {
            duplicateBtn.parentNode.insertBefore(mergeBtn, duplicateBtn.nextSibling);
        } else {
            const backupBtn = document.getElementById('backupBtn');
            if (backupBtn) {
                backupBtn.parentNode.insertBefore(mergeBtn, backupBtn.nextSibling);
            }
        }
        
        // Ajouter le panneau de fusion
        this.createMergePanel();
    }
    
    // Créer le panneau de fusion
    createMergePanel() {
        const panel = document.createElement('div');
        panel.id = 'mergePanel';
        panel.className = 'merge-panel';
        panel.style.display = 'none';
        panel.innerHTML = `
            <div class="merge-panel-header">
                <h3><i class="fas fa-object-group"></i> Mode Fusion</h3>
                <button class="btn-close-panel" onclick="promptMerger.closeMergePanel()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="merge-panel-content">
                <p id="mergeInfo">Aucun groupe de doublons détecté</p>
                <div id="mergeGroups"></div>
                <div class="merge-actions" style="display: none;">
                    <button class="btn-secondary" onclick="promptMerger.cancelMerge()">
                        <i class="fas fa-times"></i> Annuler
                    </button>
                    <button class="btn-primary" id="mergeSelectedBtn" onclick="promptMerger.mergeSelected()">
                        <i class="fas fa-compress"></i> Fusionner la sélection
                    </button>
                </div>
            </div>
        `;
        document.querySelector('.main-content').appendChild(panel);
    }
    
    // Activer/désactiver le mode fusion
    toggleMergeMode() {
        this.mergeMode = !this.mergeMode;
        const btn = document.getElementById('mergeBtn');
        const panel = document.getElementById('mergePanel');
        
        if (this.mergeMode) {
            btn.classList.add('active');
            panel.style.display = 'block';
            this.detectDuplicateGroups();
            this.highlightDuplicates();
            this.updateMergePanel();
        } else {
            btn.classList.remove('active');
            panel.style.display = 'none';
            this.clearHighlights();
            this.selectedForMerge.clear();
        }
    }
    
    // Détecter les groupes de doublons
    detectDuplicateGroups() {
        this.duplicateGroups.clear();
        const prompts = this.promptManager.prompts;
        
        // Grouper les prompts par contenu + JSON identiques
        prompts.forEach(prompt => {
            const key = this.getPromptKey(prompt);
            if (!this.duplicateGroups.has(key)) {
                this.duplicateGroups.set(key, []);
            }
            this.duplicateGroups.get(key).push(prompt);
        });
        
        // Filtrer pour ne garder que les groupes avec des doublons
        const duplicates = new Map();
        this.duplicateGroups.forEach((group, key) => {
            if (group.length > 1) {
                duplicates.set(key, group);
            }
        });
        this.duplicateGroups = duplicates;
    }
    
    // Générer une clé unique pour un prompt
    getPromptKey(prompt) {
        const content = prompt.content || '';
        const json = prompt.jsonParams || '';
        return `${content}|||${json}`;
    }
    
    // Mettre en évidence les doublons
    highlightDuplicates() {
        // Réinitialiser les highlights
        document.querySelectorAll('.prompt-card').forEach(card => {
            card.classList.remove('duplicate-highlight', 'group-1', 'group-2', 'group-3', 'group-4', 'group-5');
        });
        
        // Appliquer les couleurs par groupe
        let groupIndex = 1;
        this.duplicateGroups.forEach((group, key) => {
            const colorClass = `group-${groupIndex % 5 + 1}`;
            group.forEach(prompt => {
                const card = document.querySelector(`.prompt-card[data-id="${prompt.id}"]`);
                if (card) {
                    card.classList.add('duplicate-highlight', colorClass);
                    
                    // Ajouter le badge de groupe
                    if (!card.querySelector('.merge-badge')) {
                        const badge = document.createElement('div');
                        badge.className = 'merge-badge';
                        badge.innerHTML = `
                            <span class="group-number">Groupe ${groupIndex}</span>
                            <span class="image-count">${prompt.images?.length || 0} image(s)</span>
                        `;
                        card.appendChild(badge);
                    }
                    
                    // Ajouter le bouton de sélection pour fusion
                    if (!card.querySelector('.merge-select-btn')) {
                        const selectBtn = document.createElement('button');
                        selectBtn.className = 'merge-select-btn';
                        selectBtn.innerHTML = '<i class="fas fa-check"></i>';
                        selectBtn.onclick = (e) => {
                            e.stopPropagation();
                            this.toggleSelection(prompt.id, key);
                        };
                        card.querySelector('.prompt-card-header').appendChild(selectBtn);
                    }
                }
            });
            groupIndex++;
        });
    }
    
    // Gérer la sélection pour fusion
    toggleSelection(promptId, groupKey) {
        const card = document.querySelector(`.prompt-card[data-id="${promptId}"]`);
        const selectBtn = card.querySelector('.merge-select-btn');
        
        if (this.selectedForMerge.has(promptId)) {
            this.selectedForMerge.delete(promptId);
            card.classList.remove('selected-for-merge');
            selectBtn.classList.remove('selected');
        } else {
            this.selectedForMerge.add(promptId);
            card.classList.add('selected-for-merge');
            selectBtn.classList.add('selected');
        }
        
        this.updateMergeButton();
    }
    
    // Mettre à jour le bouton de fusion
    updateMergeButton() {
        const mergeBtn = document.getElementById('mergeSelectedBtn');
        const mergeActions = document.querySelector('.merge-actions');
        
        if (this.selectedForMerge.size >= 2) {
            mergeActions.style.display = 'flex';
            mergeBtn.innerHTML = `<i class="fas fa-compress"></i> Fusionner ${this.selectedForMerge.size} prompts`;
            
            // Vérifier que les prompts sélectionnés sont identiques
            const selectedPrompts = Array.from(this.selectedForMerge).map(id => 
                this.promptManager.prompts.find(p => p.id === id)
            );
            
            const firstKey = this.getPromptKey(selectedPrompts[0]);
            const allSame = selectedPrompts.every(p => this.getPromptKey(p) === firstKey);
            
            if (!allSame) {
                mergeBtn.disabled = true;
                mergeBtn.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Les prompts doivent être identiques`;
            } else {
                mergeBtn.disabled = false;
            }
        } else {
            mergeActions.style.display = 'none';
        }
    }
    
    // Mettre à jour le panneau de fusion
    updateMergePanel() {
        const info = document.getElementById('mergeInfo');
        const groupsDiv = document.getElementById('mergeGroups');
        
        if (this.duplicateGroups.size === 0) {
            info.textContent = 'Aucun groupe de doublons détecté';
            groupsDiv.innerHTML = '';
            return;
        }
        
        info.innerHTML = `<strong>${this.duplicateGroups.size}</strong> groupe(s) de doublons détecté(s)`;
        
        let html = '';
        let groupIndex = 1;
        this.duplicateGroups.forEach((group, key) => {
            const totalImages = group.reduce((sum, p) => sum + (p.images?.length || 0), 0);
            const colorClass = `group-${groupIndex % 5 + 1}`;
            
            html += `
                <div class="merge-group ${colorClass}">
                    <div class="merge-group-header">
                        <span class="group-title">Groupe ${groupIndex}</span>
                        <span class="group-stats">${group.length} prompts • ${totalImages} images</span>
                    </div>
                    <div class="merge-group-content">
                        <div class="prompt-preview">${this.truncateText(group[0].content, 100)}</div>
                        <div class="merge-group-items">
                            ${group.map(p => `
                                <div class="merge-item">
                                    <span class="item-title">${p.title}</span>
                                    <span class="item-images">${p.images?.length || 0} img</span>
                                </div>
                            `).join('')}
                        </div>
                        <button class="btn-merge-group" onclick="promptMerger.mergeGroup('${key}')">
                            <i class="fas fa-compress"></i> Fusionner ce groupe
                        </button>
                    </div>
                </div>
            `;
            groupIndex++;
        });
        
        groupsDiv.innerHTML = html;
    }
    
    // Fusionner un groupe entier
    mergeGroup(groupKey) {
        const group = this.duplicateGroups.get(groupKey);
        if (!group || group.length < 2) return;
        
        this.performMerge(group);
    }
    
    // Fusionner les prompts sélectionnés
    mergeSelected() {
        if (this.selectedForMerge.size < 2) return;
        
        const selectedPrompts = Array.from(this.selectedForMerge).map(id => 
            this.promptManager.prompts.find(p => p.id === id)
        );
        
        this.performMerge(selectedPrompts);
    }
    
    // Effectuer la fusion
    performMerge(promptsToMerge) {
        if (promptsToMerge.length < 2) return;
        
        // Trier par date de création pour garder le plus ancien
        promptsToMerge.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        
        const masterPrompt = promptsToMerge[0];
        const promptsToDelete = promptsToMerge.slice(1);
        
        // Collecter toutes les images uniques avec leurs liens
        let allImages;
        if (window.imageLinkManager) {
            allImages = window.imageLinkManager.mergeImagesWithLinks([masterPrompt, ...promptsToDelete]);
        } else {
            // Fallback : méthode basique
            const imageSet = new Set();
            [masterPrompt, ...promptsToDelete].forEach(prompt => {
                (prompt.images || []).forEach(img => imageSet.add(img));
            });
            allImages = Array.from(imageSet);
        }
        
        // Fusionner les commentaires
        const allComments = [masterPrompt.comment];
        promptsToDelete.forEach(prompt => {
            if (prompt.comment && prompt.comment !== masterPrompt.comment) {
                allComments.push(prompt.comment);
            }
        });
        
        // Fusionner les tags
        const allTags = new Set();
        [masterPrompt, ...promptsToDelete].forEach(prompt => {
            if (prompt.tags) {
                prompt.tags.split(',').forEach(tag => allTags.add(tag.trim()));
            }
        });
        
        // Mettre à jour le prompt maître
        masterPrompt.images = allImages;
        masterPrompt.comment = allComments.filter(c => c).join('\n---\n');
        masterPrompt.tags = Array.from(allTags).join(', ');
        masterPrompt.updatedAt = new Date().toISOString();
        
        // Ajouter une note de fusion
        const mergedFrom = promptsToDelete.map(p => p.title).join(', ');
        const totalImages = Array.isArray(allImages) ? allImages.length : allImages.size;
        masterPrompt.comment = (masterPrompt.comment ? masterPrompt.comment + '\n---\n' : '') + 
                               `[Fusionné avec: ${mergedFrom} le ${new Date().toLocaleDateString()}]`;
        
        // Supprimer les doublons
        promptsToDelete.forEach(prompt => {
            const index = this.promptManager.prompts.findIndex(p => p.id === prompt.id);
            if (index > -1) {
                this.promptManager.prompts.splice(index, 1);
            }
        });
        
        // Sauvegarder avec gestion d'erreur de quota
        try {
            this.promptManager.savePrompts();
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                // Nettoyer et réessayer
                this.cleanupStorageForMerge();
                try {
                    this.promptManager.savePrompts();
                } catch (retryError) {
                    this.showStorageError();
                    return;
                }
            } else {
                console.error('Erreur lors de la sauvegarde:', e);
                this.promptManager.showToast('Erreur lors de la sauvegarde', 'error');
                return;
            }
        }
        
        // Rafraîchir l'affichage
        this.promptManager.renderCategories();
        this.promptManager.renderPrompts();
        
        // Réinitialiser
        this.selectedForMerge.clear();
        this.detectDuplicateGroups();
        
        if (this.mergeMode) {
            this.highlightDuplicates();
            this.updateMergePanel();
        }
        
        // Message de confirmation
        const totalImages = Array.isArray(allImages) ? allImages.length : allImages.size;
        this.promptManager.showToast(
            `✅ Fusion réussie : ${promptsToDelete.length} prompt(s) fusionné(s), ${totalImages} image(s) conservée(s)`,
            'success'
        );
        
        // Mettre à jour les indicateurs
        if (window.duplicateDetector) {
            window.duplicateDetector.updateDuplicateIndicator();
        }
        
        // Déclencher la sauvegarde automatique
        if (window.autoBackup && window.autoBackup.settings.enabled) {
            window.autoBackup.createBackupSilent();
        }
    }
    
    // Nettoyer les highlights
    clearHighlights() {
        document.querySelectorAll('.prompt-card').forEach(card => {
            card.classList.remove('duplicate-highlight', 'selected-for-merge', 
                                 'group-1', 'group-2', 'group-3', 'group-4', 'group-5');
            const badge = card.querySelector('.merge-badge');
            if (badge) badge.remove();
            const selectBtn = card.querySelector('.merge-select-btn');
            if (selectBtn) selectBtn.remove();
        });
    }
    
    // Fermer le panneau
    closeMergePanel() {
        this.mergeMode = false;
        document.getElementById('mergeBtn').classList.remove('active');
        document.getElementById('mergePanel').style.display = 'none';
        this.clearHighlights();
        this.selectedForMerge.clear();
    }
    
    // Annuler la fusion
    cancelMerge() {
        this.selectedForMerge.clear();
        document.querySelectorAll('.selected-for-merge').forEach(card => {
            card.classList.remove('selected-for-merge');
            const btn = card.querySelector('.merge-select-btn');
            if (btn) btn.classList.remove('selected');
        });
        this.updateMergeButton();
    }
    
    // Tronquer le texte
    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    // Mettre à jour après changements
    update() {
        if (this.mergeMode) {
            this.detectDuplicateGroups();
            this.highlightDuplicates();
            this.updateMergePanel();
        }
    }
}

// Initialiser le système de fusion
let promptMerger;
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.app) {
            promptMerger = new PromptMerger(window.app);
            window.promptMerger = promptMerger;
        }
    }, 300);
});    
    // Nettoyer le stockage pour permettre la fusion
    cleanupStorageForMerge() {
        try {
            // Supprimer les anciennes sauvegardes
            const backups = [];
            for (let key in localStorage) {
                if (key.includes('prompts_auto_backup_')) {
                    backups.push(key);
                }
            }
            
            // Trier et garder seulement les 2 dernières
            backups.sort().reverse();
            if (backups.length > 2) {
                backups.slice(2).forEach(key => {
                    localStorage.removeItem(key);
                });
            }
            
            console.log(`Nettoyage effectué : ${backups.length - 2} sauvegarde(s) supprimée(s)`);
        } catch (e) {
            console.error('Erreur lors du nettoyage:', e);
        }
    }
    
    // Afficher une erreur de stockage
    showStorageError() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content modal-small">
                <div class="modal-header">
                    <h2>⚠️ Stockage plein</h2>
                    <button class="btn-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p>Le stockage local est plein et empêche la fusion.</p>
                    <p><strong>Solutions :</strong></p>
                    <ol>
                        <li>Utilisez l'outil de nettoyage</li>
                        <li>Exportez vos prompts</li>
                        <li>Supprimez les anciennes sauvegardes</li>
                    </ol>
                </div>
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="this.closest('.modal').remove()">
                        Fermer
                    </button>
                    <button class="btn-primary" onclick="window.open('nettoyer_stockage.html', '_blank')">
                        🔧 Ouvrir l'outil de nettoyage
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Tronquer le texte
    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    // Mettre à jour après changements
    update() {
        if (this.mergeMode) {
            this.detectDuplicateGroups();
            this.highlightDuplicates();
            this.updateMergePanel();
        }
    }
}

// Initialiser le système de fusion
let promptMerger;
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.app) {
            promptMerger = new PromptMerger(window.app);
            window.promptMerger = promptMerger;
        }
    }, 300);
});