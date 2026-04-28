/**
 * Device Blocking Service - EduBytes
 * Restricts the game to desktop/laptop screens by showing a Noir-themed overlay
 * if the screen width is too narrow (e.g., mobile/portrait).
 */

(function () {
    const MIN_WIDTH = 1024; // Standard desktop/laptop threshold

    function checkDevice() {
        let overlay = document.getElementById('device-block-overlay');
        
        if (window.innerWidth < MIN_WIDTH) {
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'device-block-overlay';
                overlay.innerHTML = `
                    <div class="block-content">
                        <div class="block-icon">\u26A0</div>
                        <h1>Investigation Halted</h1>
                        <p>Detective, this case requires the precision of a desktop or laptop workstation.</p>
                        <p class="small">Please return on a wider screen to continue the investigation.</p>
                        <div class="resolution-info">Current Width: ${window.innerWidth}px</div>
                    </div>
                `;
                document.body.appendChild(overlay);

                // Inject Styles
                const style = document.createElement('style');
                style.id = 'device-block-style';
                style.textContent = `
                    #device-block-overlay {
                        position: fixed;
                        inset: 0;
                        background: #0a0a0c;
                        z-index: 99999;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #e8dcc8;
                        font-family: 'Segoe UI', Tahoma, sans-serif;
                        text-align: center;
                        padding: 40px;
                        animation: fade-in 0.5s ease forwards;
                    }

                    @keyframes fade-in {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }

                    .block-content {
                        max-width: 500px;
                        border: 1px solid rgba(200, 134, 10, 0.3);
                        padding: 60px 40px;
                        border-radius: 20px;
                        background: linear-gradient(135deg, #0d1117 0%, #050505 100%);
                        box-shadow: 0 20px 80px rgba(0,0,0,0.8);
                    }

                    .block-icon {
                        font-size: 64px;
                        color: #c8860a;
                        margin-bottom: 24px;
                        text-shadow: 0 0 20px rgba(200, 134, 10, 0.4);
                    }

                    h1 {
                        font-size: 24px;
                        text-transform: uppercase;
                        letter-spacing: 4px;
                        margin-bottom: 16px;
                        color: #c8860a;
                        position: static !important; /* Override room styles */
                    }

                    p {
                        font-size: 16px;
                        line-height: 1.6;
                        color: rgba(232, 220, 200, 0.8);
                        margin-bottom: 8px;
                    }

                    .small {
                        font-size: 13px;
                        color: rgba(232, 220, 200, 0.5);
                        font-style: italic;
                    }

                    .resolution-info {
                        margin-top: 32px;
                        font-family: monospace;
                        font-size: 11px;
                        color: rgba(200, 134, 10, 0.4);
                        letter-spacing: 1px;
                    }
                `;
                document.head.appendChild(style);
            }
        } else {
            if (overlay) {
                overlay.remove();
                const style = document.getElementById('device-block-style');
                if (style) style.remove();
            }
        }
    }

    // Initial check
    document.addEventListener('DOMContentLoaded', checkDevice);
    // Listen for resize
    window.addEventListener('resize', checkDevice);
})();
