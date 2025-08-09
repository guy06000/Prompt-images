// Variables globales
let prompts = [];
let categories = [];
let filteredPrompts = [];
let currentEditingId = null;
let currentPage = 1;
const itemsPerPage = 12;

// Templates JSON pour les modèles d'IA
const jsonTemplates = {
    'Flux Dev': {
        "model": "black-forest-labs/flux-dev",
        "width": 1024,
        "height": 1024,
        "num_outputs": 1,
        "guidance_scale": 7.5,
        "num_inference_steps": 50,
        "seed": null
    },
    'Flux Schnell': {
        "model": "black-forest-labs/flux-schnell",
        "width": 1024,
        "height": 1024,
        "num_outputs": 1,
        "num_inference_steps": 4,
        "seed": null
    },
    'SDXL': {
        "prompt": "",
        "negative_prompt": "",
        "width": 1024,
        "height": 1024,
        "num_outputs": 1,
        "scheduler": "K_EULER",
        "num_inference_steps": 50,
        "guidance_scale": 7.5,
        "seed": null
    },
    'Krea AI': {
        "prompt": "",
        "aspect_ratio": "1:1",
        "style": "photorealistic",
        "quality": "high"
    },
    'Midjourney': {
        "prompt": "",
        "aspect_ratio": "--ar 1:1",
        "version": "--v 6",
        "stylize": "--s 100",
        "quality": "--q 1"
    },
    'DALL-E 3': {
        "prompt": "",
        "size": "1024x1024",
        "quality": "standard",
        "style": "vivid"
    },
    'ComfyUI': {
        "prompt": "",
        "negative_prompt": "",
        "width": 1024,
        "height": 1024,
        "cfg_scale": 7,
        "steps": 20,
        "sampler_name": "euler",
        "scheduler": "normal",
        "seed": -1
    },
    'Leonardo AI': {
        "prompt": "",
        "negative_prompt": "",
        "width": 1024,
        "height": 1024,
        "guidance_scale": 7,
        "num_inference_steps": 30,
        "preset_style": "LEONARDO"
    },
    'Ideogram': {
        "prompt": "",
        "aspect_ratio": "ASPECT_1_1",
        "model": "V_2",
        "magic_prompt_option": "AUTO"
    }
};

// Catégories par défaut
const defaultCategories = [
    { name: 'Flux', icon: 'fa-bolt', count: 0 },
    { name: 'Krea', icon: 'fa-palette', count: 0 },
    { name: 'Portraits', icon: 'fa-user', count: 0 },
    { name: 'Paysages', icon: 'fa-mountain', count: 0 },
    { name: 'Concept Art', icon: 'fa-lightbulb', count: 0 },
    { name: 'Réaliste', icon: 'fa-camera', count: 0 },
    { name: 'Artistique', icon: 'fa-paint-brush', count: 0 },
    { name: 'Autre', icon: 'fa-folder', count: 0 }
];

// Fonction pour ajouter le support tactile
function addTouchSupport(element, callback, options = {}) {
    if (!element) return;
    
    const { preventDefault = true, stopPropagation = false } = options;
    
    // Gestionnaire unifié pour click et touch
    function handleInteraction(e) {
        if (preventDefault) e.preventDefault();
        if (stopPropagation) e.stopPropagation();
        callback(e);
    }
    
    // Ajouter les événements
    element.addEventListener('click', handleInteraction);
    element.addEventListener('touchend', handleInteraction);
    
    // Effet visuel au touch
    element.addEventListener('touchstart', function(e) {
        element.style.transform = 'scale(0.98)';
        element.style.opacity = '0.8';
    });
    
    element.addEventListener('touchend', function(e) {
        setTimeout(() => {
            element.style.transform = '';
            element.style.opacity = '';
        }, 150);
    });
    
    // Annuler l'effet si on glisse
    element.addEventListener('touchmove', function(e) {
        element.style.transform = '';
        element.style.opacity = '';
    });
}

// Fonction pour détecter si on est sur mobile
function isMobile() {
    return window.innerWidth <= 768;
}

// Gestion du menu mobile
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarClose = document.getElementById('sidebarClose');
    const mobileOverlay = document.getElementById('mobileOverlay');

    function openSidebar() {
        sidebar.classList.add('open');
        mobileOverlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        mobileOverlay.classList.remove('show');
        document.body.style.overflow = '';
    }

    addTouchSupport(mobileMenuToggle, openSidebar);
    addTouchSupport(sidebarClose, closeSidebar);
    addTouchSupport(mobileOverlay, closeSidebar);

    // Fermer au redimensionnement vers desktop
    window.addEventListener('resize', () => {
        if (!isMobile()) {
            closeSidebar();
        }
    });
}

// Gestion des modales
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Focus sur le premier input
    const firstInput = modal.querySelector('input:not([type="hidden"]), textarea, select');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

// Gestion des notifications
function showNotification(message, type = 'success') {
    const notifications = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    notifications.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', function() {
    console.log('Application démarrée');
    
    // Désactiver le zoom sur double-tap mobile
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Charger les données
    loadFromStorage();
    
    // Initialiser l'interface
    initMobileMenu();
    initEventListeners();
    populateTemplates();
    updateDisplay();
    
    // Afficher la zone vide ou les cartes selon le contenu
    if (prompts.length === 0) {
        showEmptyState();
    } else {
        hideEmptyState();
        // Sur mobile, s'assurer que la sidebar est fermée au démarrage
        if (isMobile()) {
            const sidebar = document.getElementById('sidebar');
            const mobileOverlay = document.getElementById('mobileOverlay');
            sidebar.classList.remove('open');
            mobileOverlay.classList.remove('show');
        }
    }
});

// Initialisation des événements
function initEventListeners() {
    // Boutons nouveau prompt
    addTouchSupport(document.getElementById('newPromptBtn'), () => openPromptModal());
    addTouchSupport(document.getElementById('mobileNewPrompt'), () => openPromptModal());
    addTouchSupport(document.getElementById('emptyNewPrompt'), () => openPromptModal());
    
    // Boutons charger exemples
    addTouchSupport(document.getElementById('loadExamplesBtn'), loadExamples);
    addTouchSupport(document.getElementById('emptyLoadExamples'), loadExamples);
    
    // Gestion des modales
    setupModalEvents();
    
    // Recherche
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    
    searchInput.addEventListener('input', handleSearch);
    addTouchSupport(searchClear, clearSearch);
    
    // Filtres
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
    document.getElementById('tagFilter').addEventListener('change', applyFilters);
    
    // Gestion des catégories
    addTouchSupport(document.getElementById('manageCategoriesBtn'), () => openModal('categoryModal'));
    addTouchSupport(document.getElementById('categoryManageBtn'), () => openModal('categoryModal'));
    addTouchSupport(document.getElementById('addCategoryBtn'), addCategory);
    
    // Import/Export
    addTouchSupport(document.getElementById('exportBtn'), exportData);
    addTouchSupport(document.getElementById('importBtn'), () => document.getElementById('importFile').click());
    document.getElementById('importFile').addEventListener('change', importData);
    
    // Thème
    addTouchSupport(document.getElementById('themeToggle'), toggleTheme);
    
    // Pagination
    addTouchSupport(document.getElementById('prevPage'), () => changePage(-1));
    addTouchSupport(document.getElementById('nextPage'), () => changePage(1));
    
    // Upload d'images
    setupImageUpload();
    
    // JSON templates
    document.getElementById('jsonTemplate').addEventListener('change', applyJsonTemplate);
    addTouchSupport(document.getElementById('formatJsonBtn'), formatJson);
    
    // Validation JSON en temps réel
    document.getElementByI
