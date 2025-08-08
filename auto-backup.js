// Système de sauvegarde automatique
class AutoBackup {
    constructor(promptManager) {
        this.promptManager = promptManager;
        this.backupKey = 'prompts_auto_backup';
        this.settingsKey = 'backup_settings';
        this.fileHandle = null;
        this.isSupported = 'showSaveFilePicker' in window;
        
        // Charger les paramètres
        this.settings = this.loadSettings();
        
        // Initialiser
        this.init();
    }
    
    loadSettings() {
        const stored = localStorage.getItem(this.settingsKey);
        return stored ? JSON.parse(stored) : {
            enabled: true,
            autoSaveInterval: 60000, // 1 minute
            backupLocation: null,
            lastBackup: null
        };
    }
    
    saveSettings() {
        localStorage.setItem(this.settingsKey, JSON.stringify(this.settings));
    }
    
    init() {
        // Ajouter les contrôles dans l'interface
        this.addBackupControls();
        
        // Démarrer la sauvegarde automatique si activée
        if (this.settings.enabled) {
            this.startAutoSave();
        }
        
        // Essayer de récupérer la dernière sauvegarde au démarrage
        this.loadFromBackup();
    }
    
    addBackupControls() {
        // Créer le bouton de configuration de sauvegarde
        const headerActions = document.querySelector('.header-actions');
        const backupBtn = document.createElement('button');
        backupBtn.className = 'btn-icon';
        backupBtn.id = 'backupBtn';
        backupBtn.title = 'Configuration de sauvegarde';
        backupBtn.innerHTML = '<i class="fas fa-save"></i>';
        backupBtn.onclick = () => this.showBackupDialog();
        
        // Insérer avant le bouton de thème
        const themeBtn = document.getElementById('themeToggle');
        headerActions.insertBefore(backupBtn, themeBtn);
        
        // Ajouter l'indicateur de statut
        this.addStatusIndicator();
    }
    
    addStatusIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'backupStatus';
        indicator.className = 'backup-status';
        indicator.innerHTML = `
            <i class="fas fa-circle"></i>
            <span>Sauvegarde ${this.settings.enabled ? 'active' : 'inactive'}</span>
        `;
        document.querySelector('.app-header').appendChild(indicator);
        this.updateStatusIndicator();
    }
    
    updateStatusIndicator() {
        const indicator = document.getElementById('backupStatus');
        if (!indicator) return;
        
        const icon = indicator.querySelector('i');
        const text = indicator.querySelector('span');
        
        if (this.settings.enabled) {
            icon.className = 'fas fa-circle';
            icon.style.color = '#10b981';
            if (this.settings.lastBackup) {
                const time = new Date(this.settings.lastBackup).toLocaleTimeString();
                text.textContent = `Dernière sauvegarde: ${time}`;
            } else {
                text.textContent = 'Sauvegarde active';
            }
        } else {
            icon.className = 'fas fa-circle';
            icon.style.color = '#94a3b8';
            text.textContent = 'Sauvegarde inactive';
        }
    }
    
    showBackupDialog() {
        // Créer le modal de configuration
        const existingModal = document.getElementById('backupModal');
        if (existingModal) existingModal.remove();
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'backupModal';
        modal.innerHTML = `
            <div class="modal-content modal-small">
                <div class="modal-header">
                    <h2>Configuration de la sauvegarde</h2>
                    <button class="btn-close" onclick="autoBackup.closeBackupDialog()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body" style="padding: 1rem;">
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="backupEnabled" ${this.settings.enabled ? 'checked' : ''}>
                            Activer la sauvegarde automatique
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label for="backupInterval">Intervalle de sauvegarde</label>
                        <select id="backupInterval">
                            <option value="30000" ${this.settings.autoSaveInterval === 30000 ? 'selected' : ''}>30 secondes</option>
                            <option value="60000" ${this.settings.autoSaveInterval === 60000 ? 'selected' : ''}>1 minute</option>
                            <option value="300000" ${this.settings.autoSaveInterval === 300000 ? 'selected' : ''}>5 minutes</option>
                            <option value="600000" ${this.settings.autoSaveInterval === 600000 ? 'selected' : ''}>10 minutes</option>
                        </select>
                    </div>
                    
                    ${this.isSupported ? `
                        <div class="form-group">
                            <button class="btn-primary" onclick="autoBackup.selectBackupLocation()">
                                <i class="fas fa-folder"></i> Choisir le dossier de sauvegarde
                            </button>
                            <small id="backupLocation">${this.settings.backupLocation || 'Aucun dossier sélectionné'}</small>
                        </div>
                    ` : ''}
                    
                    <div class="form-group">
                        <button class="btn-secondary" onclick="autoBackup.createBackupNow()">
                            <i class="fas fa-download"></i> Sauvegarder maintenant
                        </button>
                        <button class="btn-secondary" onclick="autoBackup.loadBackupFile()">
                            <i class="fas fa-upload"></i> Charger une sauvegarde
                        </button>
                    </div>
                    
                    <div class="form-group">
                        <small>
                            ${this.settings.lastBackup ? 
                                `Dernière sauvegarde: ${new Date(this.settings.lastBackup).toLocaleString()}` : 
                                'Aucune sauvegarde effectuée'}
                        </small>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="autoBackup.closeBackupDialog()">Annuler</button>
                    <button class="btn-primary" onclick="autoBackup.saveBackupSettings()">
                        <i class="fas fa-save"></i> Sauvegarder
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    closeBackupDialog() {
        const modal = document.getElementById('backupModal');
        if (modal) modal.remove();
    }
    
    saveBackupSettings() {
        this.settings.enabled = document.getElementById('backupEnabled').checked;
        this.settings.autoSaveInterval = parseInt(document.getElementById('backupInterval').value);
        
        this.saveSettings();
        
        // Redémarrer ou arrêter la sauvegarde automatique
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        if (this.settings.enabled) {
            this.startAutoSave();
        }
        
        this.updateStatusIndicator();
        this.closeBackupDialog();
        this.promptManager.showToast('Configuration sauvegardée', 'success');
    }
    
    startAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setInterval(() => {
            this.createBackupSilent();
        }, this.settings.autoSaveInterval);
        
        // Sauvegarder immédiatement
        this.createBackupSilent();
    }
    
    async selectBackupLocation() {
        if (!this.isSupported) {
            this.promptManager.showToast('Votre navigateur ne supporte pas cette fonctionnalité', 'error');
            return;
        }
        
        try {
            const dirHandle = await window.showDirectoryPicker({
                mode: 'readwrite'
            });
            this.fileHandle = dirHandle;
            this.settings.backupLocation = dirHandle.name;
            document.getElementById('backupLocation').textContent = dirHandle.name;
            this.saveSettings();
            this.promptManager.showToast('Dossier sélectionné', 'success');
        } catch (err) {
            if (err.name !== 'AbortError') {
                this.promptManager.showToast('Erreur lors de la sélection du dossier', 'error');
            }
        }
    }
    
    getBackupData() {
        return {
            prompts: this.promptManager.prompts,
            categories: this.promptManager.categories,
            backupDate: new Date().toISOString(),
            version: '1.2.0',
            totalPrompts: this.promptManager.prompts.length,
            totalCategories: this.promptManager.categories.length
        };
    }
    
    async createBackupNow() {
        const data = this.getBackupData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prompts_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        // Essayer de sauvegarder dans localStorage avec gestion d'erreur
        try {
            localStorage.setItem(this.backupKey, JSON.stringify(data));
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                console.warn('Stockage plein - la sauvegarde a été téléchargée mais pas stockée localement');
                // Le fichier a quand même été téléchargé, c'est l'essentiel
            }
        }
        
        this.settings.lastBackup = new Date().toISOString();
        this.saveSettings();
        this.updateStatusIndicator();
        this.promptManager.showToast('Sauvegarde créée', 'success');
    }
    
    async createBackupSilent() {
        try {
            // Vérifier d'abord si on peut sauvegarder
            const data = this.getBackupData();
            const dataStr = JSON.stringify(data);
            
            // Essayer de sauvegarder dans localStorage
            try {
                localStorage.setItem(this.backupKey, dataStr);
            } catch (quotaError) {
                if (quotaError.name === 'QuotaExceededError') {
                    // Nettoyer les anciennes sauvegardes
                    this.cleanupOldBackups();
                    // Réessayer une fois
                    try {
                        localStorage.setItem(this.backupKey, dataStr);
                    } catch (retryError) {
                        console.warn('Stockage plein, sauvegarde ignorée');
                        // Ne pas afficher d'erreur pour ne pas spammer l'utilisateur
                        return;
                    }
                } else {
                    throw quotaError;
                }
            }
            
            // Si on a accès au système de fichiers, sauvegarder aussi là
            if (this.fileHandle && this.isSupported) {
                try {
                    const fileName = `prompts_auto_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
                    const file = await this.fileHandle.getFileHandle(fileName, { create: true });
                    const writable = await file.createWritable();
                    await writable.write(JSON.stringify(data, null, 2));
                    await writable.close();
                } catch (err) {
                    console.log('Sauvegarde fichier échouée, utilisation de localStorage uniquement');
                }
            }
            
            this.settings.lastBackup = new Date().toISOString();
            this.saveSettings();
            this.updateStatusIndicator();
            
        } catch (err) {
            console.error('Erreur lors de la sauvegarde automatique:', err);
        }
    }
    
    // Nettoyer les anciennes sauvegardes automatiques
    cleanupOldBackups() {
        try {
            const backups = [];
            for (let key in localStorage) {
                if (key.includes('prompts_auto_backup_')) {
                    backups.push(key);
                }
            }
            
            // Trier par date et garder seulement les 2 dernières
            backups.sort().reverse();
            if (backups.length > 2) {
                backups.slice(2).forEach(key => {
                    localStorage.removeItem(key);
                });
                console.log(`Nettoyage auto: ${backups.length - 2} ancienne(s) sauvegarde(s) supprimée(s)`);
            }
        } catch (e) {
            console.error('Erreur lors du nettoyage des sauvegardes:', e);
        }
    }
    
    async loadBackupFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    this.restoreFromBackup(data);
                } catch (err) {
                    this.promptManager.showToast('Erreur lors du chargement de la sauvegarde', 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }
    
    loadFromBackup() {
        // Essayer de charger depuis localStorage
        const backup = localStorage.getItem(this.backupKey);
        if (backup) {
            try {
                const data = JSON.parse(backup);
                // Vérifier si la sauvegarde est plus récente que les données actuelles
                if (data.prompts && data.prompts.length > 0) {
                    const currentPrompts = localStorage.getItem('prompts');
                    if (!currentPrompts || JSON.parse(currentPrompts).length === 0) {
                        this.restoreFromBackup(data);
                        this.promptManager.showToast('Sauvegarde automatique restaurée', 'info');
                    }
                }
            } catch (err) {
                console.error('Erreur lors de la restauration automatique:', err);
            }
        }
    }
    
    restoreFromBackup(data) {
        if (data.prompts && Array.isArray(data.prompts)) {
            this.promptManager.prompts = data.prompts;
            this.promptManager.savePrompts();
        }
        
        if (data.categories && Array.isArray(data.categories)) {
            this.promptManager.categories = data.categories;
            this.promptManager.saveCategories();
        }
        
        this.promptManager.renderCategories();
        this.promptManager.renderPrompts();
        this.promptManager.showToast(`Sauvegarde restaurée: ${data.totalPrompts || 0} prompts`, 'success');
    }
}

// Initialiser le système de sauvegarde automatique
let autoBackup;
document.addEventListener('DOMContentLoaded', () => {
    // Attendre que l'app principale soit chargée
    setTimeout(() => {
        if (window.app) {
            autoBackup = new AutoBackup(window.app);
            window.autoBackup = autoBackup;
        }
    }, 100);
});