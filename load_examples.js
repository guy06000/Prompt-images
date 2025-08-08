// Script pour charger automatiquement des exemples au premier lancement
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier si c'est le premier lancement (pas de prompts sauvegardés)
    const existingPrompts = localStorage.getItem('prompts');
    
    if (!existingPrompts || JSON.parse(existingPrompts).length === 0) {
        // Exemples de prompts avec commentaires
        const exemplesPrompts = [
            {
                id: 'exemple_1',
                title: 'Portrait Cinématique Réaliste',
                category: 'portrait',
                replicateLink: 'https://replicate.com/black-forest-labs/flux-1.1-pro',
                description: 'Portrait photoréaliste avec éclairage dramatique',
                content: 'Cinematic portrait of a young woman with flowing auburn hair, dramatic side lighting, golden hour, shallow depth of field, shot on 85mm lens, professional photography, hyperrealistic, 8k resolution, moody atmosphere, film grain',
                comment: 'Fonctionne très bien avec Flux 1.1 Pro. Utiliser guidance_scale=3.5 et num_inference_steps=25 pour de meilleurs résultats. Ajouter "looking at camera" pour un regard direct.',
                tags: 'portrait, cinématique, flux, réaliste, golden hour',
                images: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'exemple_2',
                title: 'Paysage Fantasy Studio Ghibli',
                category: 'landscape',
                replicateLink: '',
                description: 'Paysage fantastique dans le style Studio Ghibli',
                content: 'Majestic floating castle in the clouds, ethereal fantasy landscape, waterfalls cascading from sky islands, rainbow bridges, magical aurora in the background, Studio Ghibli style, highly detailed, vibrant colors, volumetric lighting, epic scale',
                comment: 'Testé avec SDXL et Midjourney. Pour SDXL, ajouter "anime style, cel shading" améliore le rendu. Éviter les prompts négatifs trop restrictifs qui peuvent nuire au style artistique.',
                tags: 'paysage, fantasy, ghibli, artistique, anime',
                images: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'exemple_3',
                title: 'Cyberpunk City Night',
                category: 'concept',
                replicateLink: '',
                description: 'Ville futuriste cyberpunk sous la pluie',
                content: 'Futuristic cyberpunk city at night, neon lights reflecting on wet streets, flying cars, holographic advertisements, rain, blade runner atmosphere, ultra detailed, cinematic composition, ray tracing, 8k, artstation trending',
                comment: 'Excellent avec Stable Diffusion XL. Paramètres recommandés: CFG Scale 7, Steps 30. Ajouter "purple and cyan color scheme" pour une palette plus vibrante. Negative prompt: "blurry, low quality, oversaturated"',
                tags: 'cyberpunk, ville, néon, futuriste, concept art',
                images: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'exemple_4', 
                title: 'Logo Minimaliste Moderne',
                category: 'artistic',
                replicateLink: '',
                description: 'Design de logo épuré et moderne',
                content: 'Minimalist geometric logo design, clean lines, modern, professional, vector art style, black and white, negative space, simple shapes, corporate identity, scalable design',
                comment: 'Utiliser avec DALL-E 3 ou Midjourney. Pour DALL-E, préciser "flat design, no gradients". Midjourney: ajouter "--no realistic --v 5.2" pour un meilleur contrôle du style vectoriel.',
                tags: 'logo, design, minimaliste, vectoriel',
                images: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        
        // Sauvegarder les exemples
        localStorage.setItem('prompts', JSON.stringify(exemplesPrompts));
        
        // Afficher un message de bienvenue
        console.log('✨ Exemples de prompts chargés avec succès !');
        
        // Recharger la page pour afficher les exemples
        window.location.reload();
    }
});