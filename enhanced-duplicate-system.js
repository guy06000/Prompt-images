// Système amélioré de détection et fusion de doublons avec visualisation
class EnhancedDuplicateSystem {
    constructor(promptManager) {
        this.promptManager = promptManager;
        this.duplicateGroups = new Map();
        this.identicalGroups = new Map(); // Groupes avec prompt ET JSON identiques
        this.init();
    }
    
    init() {
        // Ajouter les contrôles dans l'interface
        this.addEnhancedControls();
        // Scanner automatiquement au chargement
        this.scanForIdenticalPrompts();
        // Écouter les changements
        this.addChangeListeners();
    }
    
    // Ajouter les contrôles améliorés
    addEnhancedControls() {
        // Bouton pour activer/désactiver la vue des doublons
        const headerActions = document.querySelector('.header-actions');
        if (!headerActions) return;
        
        const duplicateViewBtn = document.createElement('button');
        duplicateViewBtn.className = 'btn-icon enhanced-duplicate-btn';
        duplicateViewBtn.id = 'enhancedDuplicateBtn';
        duplicateViewBtn.title = 'Afficher les doublons identiques';
        duplicateViewBtn.innerHTML = `
            <i class="fas fa-layer-group"></i>
            <span class="duplicate-count-badge" style="display: none;">0</span>
        `;
        duplicateViewBtn.onclick = () => this.toggleDuplicateView();
        
        // Insérer le bouton
        const existingDuplicateBtn = document.getElementById('duplicateBtn');
        if (existingDuplicateBtn) {
            existingDuplicateBtn.parentNode.insertBefore(duplicateViewBtn, existingDuplicateBtn);
        } else {
            const backupBtn = document.getElementById('backupBtn');
            if (backupBtn) {
                backupBtn.parentNode.insertBefore(duplicateViewBtn, backupBtn.nextSibling);
            }
        }
    }
    
    // Scanner pour les prompts identiques (contenu + JSON)
    scanForIdenticalPrompts() {
        this.identicalGroups.clear();
        const prompts = this.promptManager.prompts;
        
        // Créer des groupes basés sur le contenu ET le JSON
        prompts.forEach(prompt => {
            const key = this.getUniqueKey(prompt);
            if (!this.identicalGroups.has(key)) {
                this.identicalGroups.set(key, []);
            }
            this.identicalGroups.get(key).push(prompt);
        });
        
        // Filtrer pour ne garder que les groupes avec des doublons
        const duplicates = new Map();
        this.identicalGroups.forEach((group, key) => {
            if (group.length > 1) {
                duplicates.set(key, group);
            }
        });
        this.identicalGroups = duplicates;
        
        // Mettre à jour le compteur
        this.updateDuplicateCounter();
        
        // Si des doublons sont trouvés, les mettre en évidence automatiquement
        if (this.identicalGroups.size > 0) {
            this.highlightIdenticalPrompts();
        }
    }
    
    // Générer une clé unique basée sur le contenu ET le JSON
    getUniqueKey(prompt) {
        const content = (prompt.content || '').trim().toLowerCase();
        const json = (prompt.jsonParams || '').trim();
        // Normaliser le JSON pour la comparaison
        let normalizedJson = '';
        try {
            if (json) {
                const parsed = JSON.parse(json);
                normalizedJson = JSON.stringify(parsed, Object.keys(parsed).sort());
            }
        } catch (e) {
            normalizedJson = json;
        }
        return `${content}|||${normalizedJson}`;
    }
    
    // Mettre en évidence les prompts identiques
    highlightIdenticalPrompts() {
        // Réinitialiser tous les highlights
        document.querySelectorAll('.prompt-card').forEach(card => {
            card.classList.remove('identical-duplicate', 'duplicate-group-1', 'duplicate-group-2', 
                                 'duplicate-group-3', 'duplicate-group-4', 'duplicate-group-5');
            const indicator = card.querySelector('.duplicate-indicator-badge');
            if (indicator) indicator.remove();
            const mergeBtn = card.querySelector('.quick-merge-btn');
            if (mergeBtn) mergeBtn.remove();
        });
        
        // Appliquer les nouveaux highlights
        let groupIndex = 1;
        this.identicalGroups.forEach((group, key) => {
            const colorClass = `duplicate-group-${(groupIndex % 5) + 1}`;
            
            group.forEach(prompt => {
                const card = document.querySelector(`.prompt-card[data-id="${prompt.id}"]`);
                if (!card) return;
                
                // Ajouter les classes de style
                card.classList.add('identical-duplicate', colorClass);
                
                // Ajouter l'indicateur de doublon
                const indicator = document.createElement('div');
                indicator.className = 'duplicate-indicator-badge';
                indicator.innerHTML = `
                    <div class="indicator-content">
                        <i class="fas fa-clone"></i>
                        <span>Groupe ${groupIndex}</span>
                        <span class="separator">•</span>
                        <span>${group.length} cartes identiques</span>
                        <span class="separator">•</span>
                        <span>${this.getTotalImages(group)} images</span>
                    </div>
                `;
                card.appendChild(indicator);
                
                // Ajouter le bouton de fusion rapide
                const mergeBtn = document.createElement('button');
                mergeBtn.className = 'quick-merge-btn';
                mergeBtn.title = 'Fusionner ce groupe';
                mergeBtn.innerHTML = `
                    <i class="fas fa-compress-arrows-alt"></i>
                    <span>Fusionner</span>
                `;
                mergeBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.quickMergeGroup(key);
                };
                card.querySelector('.prompt-card-header').appendChild(mergeBtn);
            });
            
            groupIndex++;
        });
    }
    
    // Calculer le nombre total d'images dans un groupe
    getTotalImages(group) {
        return group.reduce((total, prompt) => {
            return total + (prompt.images ? prompt.images.length : 0);
        }, 0);
    }
    
    // Fusion rapide d'un groupe
    quickMergeGroup(groupKey) {
        const group = this.identicalGroups.get(groupKey);
        if (!group || group.length < 2) return;
        
        // Demander confirmation avec un modal visuel
        this.showMergeConfirmationModal(group);
    }
    
    // Afficher le modal de confirmation de fusion
    showMergeConfirmationModal(group) {
        // Supprimer le modal existant s'il y en a un
        const existingModal = document.getElementById('mergeConfirmModal');
        if (existingModal) existingModal.remove();
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'mergeConfirmModal';
        
        // Trier par date pour identifier le plus ancien
        const sortedGroup = [...group].sort((a, b) => 
            new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        );
        const master = sortedGroup[0];
        const duplicates = sortedGroup.slice(1);
        
        // Collecter toutes les images
        const allImages = new Set();
        group.forEach(prompt => {
            (prompt.images || []).forEach(img => allImages.add(img));
        });
        
        modal.innerHTML = `
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h2>
                        <i class="fas fa-compress-arrows-alt"></i> 
                        Confirmer la fusion
                    </h2>
                    <button class="btn-close" onclick="document.getElementById('mergeConfirmModal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="merge-confirmation-content">
                        <div class="merge-info-box">
                            <h3>Résumé de la fusion</h3>
                            <div class="merge-stats">
                                <div class="stat-item">
                                    <i class="fas fa-clone"></i>
                                    <span><strong>${group.length}</strong> cartes identiques</span>
                                </div>
                                <div class="stat-item">
                                    <i class="fas fa-images"></i>
                                    <span><strong>${allImages.size}</strong> images au total</span>
                                </div>
                                <div class="stat-item">
                                    <i class="fas fa-check-circle"></i>
                                    <span>Carte conservée : <strong>${master.title}</strong></span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="merge-preview">
                            <h4>Aperçu du prompt</h4>
                            <div class="prompt-content-preview">
                                ${this.escapeHtml(master.content).substring(0, 200)}${master.content.length > 200 ? '...' : ''}
                            </div>
                            ${master.jsonParams ? `
                                <div class="json-preview">
                                    <strong>Paramètres JSON :</strong>
                                    <code>${this.escapeHtml(master.jsonParams).substring(0, 100)}${master.jsonParams.length > 100 ? '...' : ''}</code>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="images-to-merge">
                            <h4>Galerie d'images combinée (${allImages.size} images)</h4>
                            <div class="merge-images-grid">
                                ${Array.from(allImages).slice(0, 8).map(img => `
                                    <div class="merge-image-preview">
                                        <img src="${img}" alt="Image">
                                    </div>
                                `).join('')}
                                ${allImages.size > 8 ? `
                                    <div class="merge-image-more">
                                        <span>+${allImages.size - 8}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        
                        <div class="merge-warning">
                            <i class="fas fa-info-circle"></i>
                            <p>Les cartes suivantes seront supprimées après fusion :</p>
                            <ul>
                                ${duplicates.map(d => `<li>${d.title} (${d.images?.length || 0} images)</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="document.getElementById('mergeConfirmModal').remove()">
                        <i class="fas fa-times"></i> Annuler
                    </button>
                    <button class="btn-primary" onclick="enhancedDuplicateSystem.performMerge('${this.getUniqueKey(master)}')">
                        <i class="fas fa-compress-arrows-alt"></i> Confirmer la fusion
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    // Effectuer la fusion
    performMerge(groupKey) {
        const group = this.identicalGroups.get(groupKey);
        if (!group || group.length < 2) return;
        
        try {
            // Trier par date
            const sortedGroup = [...group].sort((a, b) => 
                new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
            );
            
            const master = sortedGroup[0];
            const duplicates = sortedGroup.slice(1);
            
            // Collecter toutes les images uniques avec leurs liens
            const allImages = imageLinkManager ? 
                imageLinkManager.mergeImagesWithLinks(sortedGroup) :
                this.mergeImagesBasic(sortedGroup);
            
            // Fusionner les métadonnées
            const allComments = [master.comment];
            const allTags = new Set();
            
            [master, ...duplicates].forEach(prompt => {
                if (prompt.comment && !allComments.includes(prompt.comment)) {
                    allComments.push(prompt.comment);
                }
                if (prompt.tags) {
                    prompt.tags.split(',').forEach(tag => allTags.add(tag.trim()));
                }
            });
            
            // Mettre à jour le prompt maître
            master.images = allImages;
            master.comment = allComments.filter(c => c).join('\n--- Fusion ---\n');
            master.tags = Array.from(allTags).join(', ');
            master.updatedAt = new Date().toISOString();
            
            // Ajouter une note de fusion
            const totalImages = Array.isArray(allImages) ? allImages.length : allImages.size;
            const mergedInfo = `[Fusionné le ${new Date().toLocaleDateString()} : ${duplicates.length} doublon(s), ${totalImages} image(s) totale(s)]`;
            master.comment = master.comment ? `${master.comment}\n\n${mergedInfo}` : mergedInfo;
            
            // Supprimer les doublons
            duplicates.forEach(prompt => {
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
                    // Essayer de nettoyer et réessayer
                    this.cleanupStorageAndRetry(() => {
                        this.promptManager.savePrompts();
                    });
                } else {
                    throw e;
                }
            }
            
            // Rafraîchir l'interface
            this.promptManager.renderCategories();
            this.promptManager.renderPrompts();
            
            // Fermer le modal
            const modal = document.getElementById('mergeConfirmModal');
            if (modal) modal.remove();
            
            // Afficher une notification de succès
            this.showSuccessNotification(duplicates.length, allImages.size);
            
            // Rescanner pour mettre à jour l'affichage
            this.scanForIdenticalPrompts();
            
            // Déclencher une sauvegarde automatique si disponible (avec gestion d'erreur)
            if (window.autoBackup && window.autoBackup.settings.enabled) {
                try {
                    window.autoBackup.createBackupSilent();
                } catch (e) {
                    console.warn('Sauvegarde automatique échouée:', e.message);
                }
            }
            
        } catch (error) {
            console.error('Erreur lors de la fusion:', error);
            this.showErrorNotification(error.message);
        }
    }
    
    // Afficher une notification de succès
    showSuccessNotification(mergedCount, totalImages) {
        const notification = document.createElement('div');
        notification.className = 'merge-success-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <div class="notification-text">
                    <strong>Fusion réussie !</strong>
                    <p>${mergedCount} carte(s) fusionnée(s) • ${totalImages} image(s) conservée(s)</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animation d'entrée
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Suppression automatique après 4 secondes
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
    
    // Basculer l'affichage des doublons
    toggleDuplicateView() {
        const btn = document.getElementById('enhancedDuplicateBtn');
        const isActive = btn.classList.contains('active');
        
        if (isActive) {
            btn.classList.remove('active');
            this.clearDuplicateHighlights();
        } else {
            btn.classList.add('active');
            this.scanForIdenticalPrompts();
        }
    }
    
    // Nettoyer les highlights
    clearDuplicateHighlights() {
        document.querySelectorAll('.prompt-card').forEach(card => {
            card.classList.remove('identical-duplicate', 'duplicate-group-1', 'duplicate-group-2', 
                                 'duplicate-group-3', 'duplicate-group-4', 'duplicate-group-5');
            const indicator = card.querySelector('.duplicate-indicator-badge');
            if (indicator) indicator.remove();
            const mergeBtn = card.querySelector('.quick-merge-btn');
            if (mergeBtn) mergeBtn.remove();
        });
    }
    
    // Mettre à jour le compteur de doublons
    updateDuplicateCounter() {
        const badge = document.querySelector('.duplicate-count-badge');
        if (!badge) return;
        
        const totalGroups = this.identicalGroups.size;
        const totalDuplicates = Array.from(this.identicalGroups.values())
            .reduce((sum, group) => sum + group.length - 1, 0);
        
        if (totalGroups > 0) {
            badge.textContent = totalDuplicates;
            badge.style.display = 'block';
            badge.title = `${totalGroups} groupe(s), ${totalDuplicates} doublon(s)`;
        } else {
            badge.style.display = 'none';
        }
    }
    
    // Ajouter des écouteurs de changements
    addChangeListeners() {
        // Écouter les changements dans les prompts
        const originalSave = this.promptManager.savePrompts;
        this.promptManager.savePrompts = () => {
            originalSave.call(this.promptManager);
            // Rescanner après chaque sauvegarde
            setTimeout(() => this.scanForIdenticalPrompts(), 100);
        };
    }
    
    // Fonction utilitaire pour échapper le HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialiser le système amélioré
let enhancedDuplicateSystem;
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.app) {
            enhancedDuplicateSystem = new EnhancedDuplicateSystem(window.app);
            window.enhancedDuplicateSystem = enhancedDuplicateSystem;
            
            // Scanner automatiquement au démarrage
            setTimeout(() => {
                enhancedDuplicateSystem.scanForIdenticalPrompts();
            }, 500);
        }
    }, 300);
});    
    // Nettoyer le stockage et réessayer
    cleanupStorageAndRetry(callback) {
        try {
            // Nettoyer les anciennes sauvegardes automatiques
            const keysToRemove = [];
            for (let key in localStorage) {
                if (key.includes('auto_backup') && !key.includes('settings')) {
                    keysToRemove.push(key);
                }
            }
            
            // Garder seulement les 2 dernières sauvegardes
            const backups = keysToRemove
                .filter(k => k.includes('prompts_auto_backup_'))
                .sort()
                .reverse();
            
            if (backups.length > 2) {
                backups.slice(2).forEach(key => {
                    localStorage.removeItem(key);
                });
            }
            
            // Réessayer le callback
            if (callback) {
                callback();
            }
            
        } catch (e) {
            console.error('Impossible de nettoyer le stockage:', e);
            this.showStorageFullWarning();
        }
    }
    
    // Afficher un avertissement de stockage plein
    showStorageFullWarning() {
        const warning = document.createElement('div');
        warning.className = 'storage-warning-modal';
        warning.innerHTML = `
            <div class="storage-warning-content">
                <h3>⚠️ Stockage plein</h3>
                <p>Le stockage local est plein. La fusion ne peut pas être effectuée.</p>
                <p>Solutions :</p>
                <ul>
                    <li>Ouvrez <strong>nettoyer_stockage.html</strong> pour libérer de l'espace</li>
                    <li>Exportez vos prompts avant de continuer</li>
                    <li>Désactivez les sauvegardes automatiques temporairement</li>
                </ul>
                <button onclick="window.open('nettoyer_stockage.html', '_blank')">
                    🔧 Ouvrir l'outil de nettoyage
                </button>
                <button onclick="this.parentElement.parentElement.remove()">
                    Fermer
                </button>
            </div>
        `;
        document.body.appendChild(warning);
    }
    
    // Afficher une notification d'erreur
    showErrorNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-exclamation-triangle"></i>
                <div class="notification-text">
                    <strong>Erreur lors de la fusion</strong>
                    <p>${message}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animation d'entrée
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Suppression automatique après 5 secondes
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
    
    // Fonction utilitaire pour échapper le HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialiser le système amélioré
let enhancedDuplicateSystem;
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.app) {
            enhancedDuplicateSystem = new EnhancedDuplicateSystem(window.app);
            window.enhancedDuplicateSystem = enhancedDuplicateSystem;
            
            // Scanner automatiquement au démarrage
            setTimeout(() => {
                enhancedDuplicateSystem.scanForIdenticalPrompts();
            }, 500);
        }
    }, 300);
});    
    // Méthode de fusion basique pour rétrocompatibilité
    mergeImagesBasic(group) {
        const allImages = new Set();
        group.forEach(prompt => {
            if (prompt.images && Array.isArray(prompt.images)) {
                prompt.images.forEach(img => {
                    // Gérer les deux formats
                    if (typeof img === 'string') {
                        allImages.add(img);
                    } else if (img && img.url) {
                        allImages.add(img);
                    }
                });
            }
        });
        return Array.from(allImages);
    }
    
    // Nettoyer le stockage et réessayer
    cleanupStorageAndRetry(callback) {
        try {
            // Nettoyer les anciennes sauvegardes automatiques
            const keysToRemove = [];
            for (let key in localStorage) {
                if (key.includes('auto_backup') && !key.includes('settings')) {
                    keysToRemove.push(key);
                }
            }
            
            // Garder seulement les 2 dernières sauvegardes
            const backups = keysToRemove
                .filter(k => k.includes('prompts_auto_backup_'))
                .sort()
                .reverse();
            
            if (backups.length > 2) {
                backups.slice(2).forEach(key => {
                    localStorage.removeItem(key);
                });
            }
            
            // Réessayer le callback
            if (callback) {
                callback();
            }
            
        } catch (e) {
            console.error('Impossible de nettoyer le stockage:', e);
            this.showStorageFullWarning();
        }
    }
    
    // Afficher un avertissement de stockage plein
    showStorageFullWarning() {
        const warning = document.createElement('div');
        warning.className = 'storage-warning-modal';
        warning.innerHTML = `
            <div class="storage-warning-content">
                <h3>⚠️ Stockage plein</h3>
                <p>Le stockage local est plein. La fusion ne peut pas être effectuée.</p>
                <p>Solutions :</p>
                <ul>
                    <li>Ouvrez <strong>nettoyer_stockage.html</strong> pour libérer de l'espace</li>
                    <li>Exportez vos prompts avant de continuer</li>
                    <li>Désactivez les sauvegardes automatiques temporairement</li>
                </ul>
                <button onclick="window.open('nettoyer_stockage.html', '_blank')">
                    🔧 Ouvrir l'outil de nettoyage
                </button>
                <button onclick="this.parentElement.parentElement.remove()">
                    Fermer
                </button>
            </div>
        `;
        document.body.appendChild(warning);
    }
    
    // Afficher une notification d'erreur
    showErrorNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-exclamation-triangle"></i>
                <div class="notification-text">
                    <strong>Erreur lors de la fusion</strong>
                    <p>${message}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animation d'entrée
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Suppression automatique après 5 secondes
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
    
    // Fonction utilitaire pour échapper le HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialiser le système amélioré
let enhancedDuplicateSystem;
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.app) {
            enhancedDuplicateSystem = new EnhancedDuplicateSystem(window.app);
            window.enhancedDuplicateSystem = enhancedDuplicateSystem;
            
            // Scanner automatiquement au démarrage
            setTimeout(() => {
                enhancedDuplicateSystem.scanForIdenticalPrompts();
            }, 500);
        }
    }, 300);
});