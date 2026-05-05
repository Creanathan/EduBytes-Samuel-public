/**
 * Global Initialization Service
 * Manages global assets and metadata across all pages.
 * Ensures consistent Favicon, Meta tags, and Global UI elements.
 */
(function() {
    // 1. Detect Base Path
    // index.html is in root, rooms are in src/rooms/
    const path = window.location.pathname;
    const isRoom = path.includes('/src/rooms/') || path.endsWith('.html') && path.includes('/rooms/');
    const basePath = isRoom ? '../' : './src/';
    
    const config = {
        favicon: 'assets/images/ui/logo.png',
        meta: {
            'description': 'NormaLIES — A Noir Detective Mystery. Investigate the Dégrasse mansion and solve the case.',
            'viewport': 'width=device-width, initial-scale=1.0'
        }
    };

    function init() {
        // --- Favicon Management ---
        let link = document.querySelector("link[rel*='icon']");
        if (!link) {
            link = document.createElement('link');
            link.type = 'image/png';
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = basePath + config.favicon;

        // --- Meta Tag Management ---
        Object.keys(config.meta).forEach(name => {
            let meta = document.querySelector(`meta[name='${name}']`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.name = name;
                document.head.appendChild(meta);
            }
            meta.content = config.meta[name];
        });

        // --- Character Encoding ---
        if (!document.querySelector('meta[charset]')) {
            const charset = document.createElement('meta');
            charset.setAttribute('charset', 'UTF-8');
            document.head.insertBefore(charset, document.head.firstChild);
        }

        console.log("[GlobalInit] Shared assets and meta-data initialized.");
    }

    // Run on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
