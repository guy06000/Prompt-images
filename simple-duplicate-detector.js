// Système simplifié de détection visuelle des doublons
class SimpleDuplicateDetector {
    constructor(promptManager) {
        this.promptManager = promptManager;
        this.duplicateGroups = new Map();
        this.isActive = false;
        this.init();
    }
    
    init() {
        this.addDetectionButton();
    }
    
    // Ajouter le bouton de détection dans la barre d'outils
    addDetectionButton() {
        const headerActions = document.querySelector('.header-actions');
        if (!headerActions) return;
        
        // Vérifier si le bouton existe déjà
        if (document.getElementById('detectDuplicatesBtn')) return;
        
        // Créer le bouton de détection
        const detectBtn = document.createElement('button');
        detectBtn.className = 'btn-icon';
        detectBtn.id = 'detectDuplicatesBtn';
        detectBtn.title = 'Vérifier les doublons';
        detectBtn.innerHTML = `
            <i class="fas fa-search-plus"></i>
            <span class="duplicate-badge" style="display: none;">0</span>
        `;
        detectBtn.onclick = () => this.toggleDuplicateDetection();
        
        // Insérer le bouton avant le bouton de thème
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
            headerActions.insertBefore(detectBtn, themeBtn);
        } else {
            headerActions.appendChild(detectBtn);
        }
        
        // Ajouter le panneau de résultats
        this.createResultPanel();
    }
    
    // Créer le panneau de résultats
    createResultPanel() {
        if (document.getElementById('duplicateResultPanel')) return;
        
        const panel = document.createElement('div');
        panel.id = 'duplicateResultPanel';
        panel.className = 'duplicate-result-panel';
        panel.style.display = 'none';
        panel.innerHTML = `
            <div class="panel-header">
                <h3><i class="fas fa-clone"></i> Doublons détectés</h3>
                <button class="btn-close-panel" onclick="simpleDuplicateDetector.closePanel()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="panel-content">
                <div id="duplicateStats"></div>
                <div id="duplicateGroups"></div>
                <div class="panel-actions">
                    <button class="btn-secondary" onclick="simpleDuplicateDetector.clearDetection()">
                        <i class="fas fa-eraser"></i> Effacer la détection
                    </button>
                    <button class="btn-primary" onclick="simpleDuplicateDetector.mergeAllGroups()">
                        <i class="fas fa-compress-arrows-alt"></i> Fusionner tous les groupes
                    </button>
                </div>
            </div>
        `;
        
        document.querySelector('.main-content').appendChild(panel);
    }
    
    // Basculer la détection
    toggleDuplicateDetection() {
        this.isActive = !this.isActive;
        const btn = document.getElementById('detectDuplicatesBtn');
        
        if (this.isActive) {
            btn.classList.add('active');
            this.detectDuplicates();
            this.showPanel();
        } else {
            btn.classList.remove('active');
            this.clearHighlights();
            this.closePanel();
        }
    }
    
    // Détecter les doublons
    detectDuplicates() {
        this.duplicateGroups.clear();
        const prompts = this.promptManager.prompts;
        
        // Grouper par contenu + JSON identiques
        prompts.forEach(prompt => {
            const key = this.getPromptKey(prompt);
            if (!this.duplicateGroups.has(key)) {
                this.duplicateGroups.set(key, []);
            }
            this.duplicateGroups.get(key).push(prompt);
        });
        
        // Filtrer pour ne garder que les groupes avec doublons
        const duplicates = new Map();
        this.duplicateGroups.forEach((group, key) => {
            if (group.length > 1) {
                duplicates.set(key, group);
            }
        });
        this.duplicateGroups = duplicates;
        
        // Mettre à jour l'affichage
        this.updateDisplay();
        this.highlightDuplicates();
        this.updateBadge();
    }
    
    // Générer une clé unique pour un prompt
    getPromptKey(prompt) {
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
    
    // Mettre en surbrillance les doublons
    highlightDuplicates() {
        // Effacer les anciennes surbrillances
        this.clearHighlights();
        
        // Appliquer les nouvelles surbrillances
        let groupIndex = 1;
        this.duplicateGroups.forEach((group, key) => {
            const colorClass = `duplicate-group-${(groupIndex % 5) + 1}`;
            
            group.forEach(prompt => {
                const card = document.querySelector(`.prompt-card[data-id="${prompt.id}"]`);
                if (card) {
                    // Ajouter les classes de style
                    card.classList.add('duplicate-highlight', colorClass);
                    
                    // Ajouter le badge de groupe
                    const badge = document.createElement('div');
                    badge.className = 'duplicate-group-badge';
                    badge.innerHTML = `
                        <span class="group-label">Groupe ${groupIndex}</span>
                        <span class="group-count">${group.length} cartes</span>
                    `;
                    card.appendChild(badge);
                    
                    // Ajouter le bouton de fusion sur chaque carte
                    const header = card.querySelector('.prompt-card-header');
                    if (header && !header.querySelector('.merge-single-btn')) {
                        const mergeBtn = document.createElement('button');
                        mergeBtn.className = 'merge-single-btn';
                        mergeBtn.title = 'Fusionner ce groupe';
                        mergeBtn.innerHTML = `<i class="fas fa-compress-arrows-alt"></i> Fusionner`;
                        mergeBtn.onclick = (e) => {
                            e.stopPropagation();
                            this.mergeGroup(key);
                        };
                        header.appendChild(mergeBtn);
                    }
                }
            });
            
            groupIndex++;
        });
    }
    
    // Effacer les surbrillances
    clearHighlights() {
        document.querySelectorAll('.prompt-card').forEach(card => {
            card.classList.remove('duplicate-highlight', 
                'duplicate-group-1', 'duplicate-group-2', 
                'duplicate-group-3', 'duplicate-group-4', 'duplicate-group-5');
            
            const badge = card.querySelector('.duplicate-group-badge');
            if (badge) badge.remove();
            
            const mergeBtn = card.querySelector('.merge-single-btn');
            if (mergeBtn) mergeBtn.remove();
        });
    }
    
    // Mettre à jour l'affichage du panneau
    updateDisplay() {
        const statsDiv = document.getElementById('duplicateStats');
        const groupsDiv = document.getElementById('duplicateGroups');
        
        if (this.duplicateGroups.size === 0) {
            statsDiv.innerHTML = `
                <div class="no-duplicates">
                    <i class="fas fa-check-circle"></i>
                    <p>Aucun doublon détecté !</p>
                    <small>Tous vos prompts sont uniques.</small>
                </div>
            `;
            groupsDiv.innerHTML = '';
            return;
        }
        
        const totalDuplicates = Array.from(this.duplicateGroups.values())
            .reduce((sum, group) => sum + group.length - 1, 0);
        
        statsDiv.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <i class="fas fa-layer-group"></i>
                    <span class="stat-value">${this.duplicateGroups.size}</span>
                    <span class="stat-label">Groupes</span>
                </div>
                <div class="stat-item">
                    <i class="fas fa-clone"></i>
                    <span class="stat-value">${totalDuplicates}</span>
                    <span class="stat-label">Doublons</span>
                </div>
            </div>
        `;
        
        // Afficher les groupes
        let groupIndex = 1;
        let groupsHtml = '';
        this.duplicateGroups.forEach((group, key) => {
            const totalImages = group.reduce((sum, p) => 
                sum + (p.images ? p.images.length : 0), 0);
            
            groupsHtml += `
                <div class="duplicate-group-item">
                    <div class="group-header">
                        <span class="group-title">Groupe ${groupIndex}</span>
                        <span class="group-info">${group.length} cartes • ${totalImages} images</span>
                    </div>
                    <div class="group-preview">
                        ${this.truncateText(group[0].content, 100)}
                    </div>
                    <div class="group-cards">
                        ${group.map(p => `
                            <span class="card-title">${p.title}</span>
                        `).join(' • ')}
                    </div>
                    <button class="btn-merge-group" onclick="simpleDuplicateDetector.mergeGroup('${key}')">
                        <i class="fas fa-compress-arrows-alt"></i> Fusionner ce groupe
                    </button>
                </div>
            `;
            groupIndex++;
        });
        
        groupsDiv.innerHTML = groupsHtml;
    }
    
    // Fusionner un groupe
    mergeGroup(groupKey) {
        const group = this.duplicateGroups.get(groupKey);
        if (!group || group.length < 2) return;
        
        if (confirm(`Voulez-vous fusionner ces ${group.length} cartes identiques ?`)) {
            // Utiliser la fonction de fusion avec conservation des liens
            if (window.mergeImagesWithLinks) {
                this.performMergeWithLinks(group);
            } else {
                this.performBasicMerge(group);
            }
        }
    }
    
    // Effectuer la fusion avec conservation des liens
    performMergeWithLinks(group) {
        // Trier par date
        const sorted = [...group].sort((a, b) => 
            new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        
        const master = sorted[0];
        const toDelete = sorted.slice(1);
        
        // Fusionner les images avec liens
        const mergedImages = window.mergeImagesWithLinks ? 
            window.mergeImagesWithLinks(sorted) : 
            this.mergeImagesBasic(sorted);
        
        // Fusionner les métadonnées
        const comments = [master.comment];
        const tags = new Set();
        
        sorted.forEach(p => {
            if (p.comment && !comments.includes(p.comment)) {
                comments.push(p.comment);
            }
            if (p.tags) {
                p.tags.split(',').forEach(tag => tags.add(tag.trim()));
            }
        });
        
        // Mettre à jour le maître
        master.images = mergedImages;
        master.comment = comments.filter(c => c).join('\n--- Fusion ---\n');
        master.tags = Array.from(tags).join(', ');
        master.updatedAt = new Date().toISOString();
        
        // Note de fusion
        const note = `[Fusionné ${toDelete.length} doublon(s) le ${new Date().toLocaleDateString()}]`;
        master.comment = master.comment ? `${master.comment}\n\n${note}` : note;
        
        // Supprimer les doublons
        toDelete.forEach(p => {
            const index = this.promptManager.prompts.findIndex(prompt => prompt.id === p.id);
            if (index > -1) {
                this.promptManager.prompts.splice(index, 1);
            }
        });
        
        // Sauvegarder
        try {
            this.promptManager.savePrompts();
            this.promptManager.renderCategories();
            this.promptManager.renderPrompts();
            
            // Message de succès
            const imageCount = Array.isArray(mergedImages) ? mergedImages.length : 0;
            this.promptManager.showToast(
                `✅ Fusion réussie : ${toDelete.length} doublon(s), ${imageCount} image(s) conservée(s)`,
                'success'
            );
            
            // Refaire la détection
            this.detectDuplicates();
            
        } catch (e) {
            console.error('Erreur lors de la fusion:', e);
            this.promptManager.showToast('Erreur lors de la fusion', 'error');
        }
    }
    
    // Fusion basique (fallback)
    mergeImagesBasic(group) {
        const images = [];
        group.forEach(prompt => {
            if (prompt.images) {
                prompt.images.forEach(img => {
                    if (!images.includes(img)) {
                        images.push(img);
                    }
                });
            }
        });
        return images;
    }
    
    // Fusionner tous les groupes
    mergeAllGroups() {
        if (this.duplicateGroups.size === 0) {
            this.promptManager.showToast('Aucun groupe à fusionner', 'info');
            return;
        }
        
        const totalGroups = this.duplicateGroups.size;
        const totalCards = Array.from(this.duplicateGroups.values())
            .reduce((sum, group) => sum + group.length, 0);
        
        if (confirm(`Voulez-vous fusionner tous les groupes ?\n${totalGroups} groupes, ${totalCards} cartes au total`)) {
            let merged = 0;
            
            this.duplicateGroups.forEach((group, key) => {
                if (group.length > 1) {
                    this.performMergeWithLinks(group);
                    merged++;
                }
            });
            
            this.promptManager.showToast(`✅ ${merged} groupe(s) fusionné(s) avec succès`, 'success');
            
            // Fermer et réinitialiser
            this.clearDetection();
        }
    }
    
    // Effacer la détection
    clearDetection() {
        this.isActive = false;
        const btn = document.getElementById('detectDuplicatesBtn');
        if (btn) btn.classList.remove('active');
        
        this.clearHighlights();
        this.closePanel();
        this.duplicateGroups.clear();
        this.updateBadge();
    }
    
    // Afficher le panneau
    showPanel() {
        const panel = document.getElementById('duplicateResultPanel');
        if (panel) {
            panel.style.display = 'block';
            setTimeout(() => panel.classList.add('show'), 10);
        }
    }
    
    // Fermer le panneau
    closePanel() {
        const panel = document.getElementById('duplicateResultPanel');
        if (panel) {
            panel.classList.remove('show');
            setTimeout(() => panel.style.display = 'none', 300);
        }
    }
    
    // Mettre à jour le badge
    updateBadge() {
        const badge = document.querySelector('#detectDuplicatesBtn .duplicate-badge');
        if (!badge) return;
        
        if (this.duplicateGroups.size > 0) {
            const total = Array.from(this.duplicateGroups.values())
                .reduce((sum, group) => sum + group.length - 1, 0);
            badge.textContent = total;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }
    
    // Tronquer le texte
    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
}

// Initialiser le détecteur simplifié
let simpleDuplicateDetector;
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.app) {
            simpleDuplicateDetector = new SimpleDuplicateDetector(window.app);
            window.simpleDuplicateDetector = simpleDuplicateDetector;
        }
    }, 100);
});