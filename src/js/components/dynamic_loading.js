/**
 * Performance Engine — EduBytes
 * Handles pre-rendering, image pre-caching, and asset optimization
 * for a faster, "app-like" experience when hosted online.
 */

(function() {
    const PATH_CONFIG = {
        'index.html': ['outside.html'],
        'outside.html': ['hallway.html'],
        'hallway.html': ['outside.html', 'living_room.html', 'crime_scene.html'],
        'living_room.html': ['hallway.html', 'nursery.html', 'nannys_room.html'],
        'nursery.html': ['living_room.html'],
        'crime_scene.html': ['hallway.html', 'crime_scene_bureau.html'],
        'crime_scene_bureau.html': ['crime_scene.html'],
        'nannys_room.html': ['living_room.html']
    };

    let currentFile = window.location.pathname.split('/').pop();
    if (!currentFile || !currentFile.endsWith('.html')) {
        currentFile = 'index.html';
    }

    const connections = PATH_CONFIG[currentFile] || [];

    // 1. Modern Speculation Rules (Chrome 108+)
    // Pre-renders the HTML of connected rooms in the background
    if (HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules')) {
        const specRulesUrls = connections.map(room => {
            if (currentFile === 'index.html') {
                return './src/rooms/' + room;
            }
            return room;
        });
        const specRules = {
            "prerender": [{
                "source": "list",
                "urls": specRulesUrls
            }]
        };
        const script = document.createElement('script');
        script.type = 'speculationrules';
        script.textContent = JSON.stringify(specRules);
        document.head.appendChild(script);
    }

    // 2. Image Pre-caching (Legacy support & Non-Chrome)
    // Pre-loads the background images of adjacent rooms
    function prefetchImages() {
        // Map of room files to their primary background images
        const roomAssets = {
            'outside.html': '/src/assets/rooms/outside.png',
            'hallway.html': '/src/assets/rooms/hallway_main.png',
            'living_room.html': '/src/assets/rooms/living_room_closed.png',
            'nursery.html': '/src/assets/rooms/nursery.png',
            'crime_scene.html': '/src/assets/rooms/crime_scene_main.png',
            'crime_scene_bureau.html': '/src/assets/rooms/crime_scene_bureau.png',
            'nannys_room.html': '/src/assets/rooms/nannys_room_main.png'
        };

        connections.forEach(room => {
            const assetPath = roomAssets[room];
            if (assetPath) {
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.as = 'image';
                
                // Construct relative path
                if (currentFile === 'index.html') {
                    link.href = '.' + assetPath; // e.g. ./src/assets/rooms/outside.png
                } else {
                    link.href = '..' + assetPath.replace('/src', ''); // e.g. ../assets/rooms/outside.png
                }

                document.head.appendChild(link);
            }
        });
    }

    // Delay pre-fetching to prioritize current page load
    if (document.readyState === 'complete') {
        prefetchImages();
    } else {
        window.addEventListener('load', prefetchImages);
    }

    // 3. Asset Modernization (Auto-apply lazy loading to non-critical images)
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('img:not(.critical)').forEach(img => {
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
        });
    });

    console.log(`[Performance] Optimized for ${currentFile}. Connections prefetched: ${connections.length}`);
})();
