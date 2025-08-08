// Patch simplifié pour la fusion avec conservation des liens
// Ce code améliore SEULEMENT la fusion pour garder les liens, sans changer le reste

(function() {
    // Attendre que les systèmes soient prêts
    const waitForSystems = setInterval(() => {
        if (window.promptMerger && window.enhancedDuplicateSystem) {
            clearInterval(waitForSystems);
            patchMergeSystems();
        }
    }, 100);
    
    function patchMergeSystems() {
        console.log('🔗 Patch de fusion avec liens activé');
        
        // Fonction helper pour fusionner les images avec leurs liens
        window.mergeImagesWithLinks = function(prompts) {
            const imageMap = new Map();
            
            prompts.forEach(prompt => {
                if (prompt.images && Array.isArray(prompt.images)) {
                    prompt.images.forEach(img => {
                        // Gérer les deux formats (string ou objet)
                        let imageData;
                        if (typeof img === 'string') {
                            imageData = {
                                url: img,
                                link: '',
                                name: 'image'
                            };
                        } else {
                            imageData = img;
                        }
                        
                        // Utiliser l'URL comme clé unique
                        const key = imageData.url;
                        
                        // Si l'image existe déjà
                        if (imageMap.has(key)) {
                            const existing = imageMap.get(key);
                            // Garder le lien non vide s'il y en a un
                            if (!existing.link && imageData.link) {
                                existing.link = imageData.link;
                            }
                        } else {
                            imageMap.set(key, imageData);
                        }
                    });
                }
            });
            
            return Array.from(imageMap.values());
        };
        
        // Patcher la méthode performMerge du système de doublons amélioré
        if (window.enhancedDuplicateSystem) {
            const originalPerformMerge = window.enhancedDuplicateSystem.performMerge;
            window.enhancedDuplicateSystem.performMerge = function(groupKey) {
                const group = this.identicalGroups.get(groupKey);
                if (!group || group.length < 2) return;
                
                try {
                    // Trier par date
                    const sortedGroup = [...group].sort((a, b) => 
                        new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
                    );
                    
                    const master = sortedGroup[0];
                    const duplicates = sortedGroup.slice(1);
                    
                    // Utiliser la nouvelle méthode de fusion avec liens
                    const allImages = window.mergeImagesWithLinks(sortedGroup);
                    
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
                    const mergedInfo = `[Fusionné le ${new Date().toLocaleDateString()} : ${duplicates.length} doublon(s), ${allImages.length} image(s) totale(s) avec liens conservés]`;
                    master.comment = master.comment ? `${master.comment}\n\n${mergedInfo}` : mergedInfo;
                    
                    // Supprimer les doublons
                    duplicates.forEach(prompt => {
                        const index = this.promptManager.prompts.findIndex(p => p.id === prompt.id);
                        if (index > -1) {
                            this.promptManager.prompts.splice(index, 1);
                        }
                    });
                    
                    // Sauvegarder avec gestion d'erreur
                    try {
                        this.promptManager.savePrompts();
                    } catch (e) {
                        if (e.name === 'QuotaExceededError') {
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
                    this.showSuccessNotification(duplicates.length, allImages.length);
                    
                    // Rescanner
                    this.scanForIdenticalPrompts();
                    
                } catch (error) {
                    console.error('Erreur lors de la fusion:', error);
                    this.showErrorNotification(error.message);
                }
            };
        }
        
        // Patcher aussi le prompt-merger pour utiliser la même méthode
        if (window.promptMerger) {
            const originalPerformMerge = window.promptMerger.performMerge;
            window.promptMerger.performMerge = function(promptsToMerge) {
                if (promptsToMerge.length < 2) return;
                
                // Trier par date
                promptsToMerge.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                
                const masterPrompt = promptsToMerge[0];
                const promptsToDelete = promptsToMerge.slice(1);
                
                // Utiliser la nouvelle méthode de fusion avec liens
                const allImages = window.mergeImagesWithLinks(promptsToMerge);
                
                // Fusionner les commentaires et tags
                const allComments = [masterPrompt.comment];
                const allTags = new Set();
                
                promptsToMerge.forEach(prompt => {
                    if (prompt.comment && !allComments.includes(prompt.comment)) {
                        allComments.push(prompt.comment);
                    }
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
                masterPrompt.comment = (masterPrompt.comment ? masterPrompt.comment + '\n---\n' : '') + 
                                       `[Fusionné avec: ${mergedFrom} le ${new Date().toLocaleDateString()} - Images et liens conservés]`;
                
                // Supprimer les doublons
                promptsToDelete.forEach(prompt => {
                    const index = this.promptManager.prompts.findIndex(p => p.id === prompt.id);
                    if (index > -1) {
                        this.promptManager.prompts.splice(index, 1);
                    }
                });
                
                // Sauvegarder avec gestion d'erreur
                try {
                    this.promptManager.savePrompts();
                } catch (e) {
                    if (e.name === 'QuotaExceededError') {
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
                
                // Rafraîchir
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
                this.promptManager.showToast(
                    `✅ Fusion réussie : ${promptsToDelete.length} prompt(s) fusionné(s), ${allImages.length} image(s) avec liens conservée(s)`,
                    'success'
                );
                
                // Mettre à jour les indicateurs
                if (window.duplicateDetector) {
                    window.duplicateDetector.updateDuplicateIndicator();
                }
            };
        }
        
        console.log('✅ Système de fusion avec conservation des liens activé');
    }
})();