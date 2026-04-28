/**
 * Tablet Widget — EduBytes
 * Injects a small fixed "tablet" icon in the bottom-right corner of every room.
 * Clicking it opens the Police OS via openTablet().
 * Also removes the keyboard shortcut link to keep it clean.
 */

(function () {
    function buildTabletWidget() {
        // Inject styles
        const style = document.createElement('style');
        style.textContent = `
            #tablet-widget {
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 9000;
                cursor: pointer;
                user-select: none;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }

            #tablet-widget:hover {
                transform: scale(1.1);
            }

            /* Basic circular button style matching the volume control */
            .tablet-widget-button {
                width: 44px;
                height: 44px;
                background: rgba(10, 10, 15, 0.85);
                border: 1px solid rgba(200, 134, 10, 0.35);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(8px);
                box-shadow: 0 4px 15px rgba(0,0,0,0.6);
                transition: all 0.25s ease;
            }

            .tablet-widget-icon {
                width: 18px;
                height: 26px;
                border: 2px solid rgba(200, 134, 10, 0.85);
                border-radius: 3px;
                position: relative;
                transition: border-color 0.2s;
            }

            .tablet-widget-icon::after {
                content: '';
                position: absolute;
                bottom: 3px;
                left: 50%;
                transform: translateX(-50%);
                width: 3px;
                height: 3px;
                background: rgba(200, 134, 10, 0.85);
                border-radius: 50%;
            }

            /* Notification Ping Effect */
            .tablet-notif-dot {
                position: absolute;
                top: -2px;
                right: -2px;
                width: 12px;
                height: 12px;
                background: #e74c3c;
                border-radius: 50%;
                border: 2px solid #0a0a0f;
                z-index: 10;
                display: none;
            }

            .tablet-notif-dot.active {
                display: block;
                animation: pulse-red 2s infinite;
            }

            @keyframes pulse-red {
                0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7); }
                70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(231, 76, 60, 0); }
                100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(231, 76, 60, 0); }
            }

            #tablet-widget:hover .tablet-widget-icon {
                border-color: #fff;
            }

            #tablet-widget:hover .tablet-widget-icon::after {
                background: #fff;
            }

            #tablet-overlay {
                position: fixed;
                inset: 0;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(0, 0, 0, 0);
                backdrop-filter: blur(0px) brightness(1);
                transition: background 0.6s ease, backdrop-filter 0.6s ease;
                pointer-events: none;
                opacity: 0;
            }

            #tablet-overlay.active {
                background: rgba(0, 0, 10, 0.7);
                backdrop-filter: blur(12px) brightness(0.3);
                pointer-events: all;
                opacity: 1;
            }

            .tablet-container {
                /* FIXED INTERNAL SIZE */
                width: 860px;
                height: 640px;
                transform: translateY(100vh) scale(0.8) rotateX(10deg);
                transition: transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
                display: flex;
                flex-direction: column;
                
                /* Premium Bezel: Brushed Metal / Matte Noir */
                background: linear-gradient(145deg, #1e1e24 0%, #111116 100%);
                padding: 40px 24px;
                border-radius: 38px;
                border: 1px solid rgba(255,255,255,0.08);
                box-shadow: 
                    0 30px 100px rgba(0,0,0,0.95),
                    0 0 0 1px rgba(0,0,0,0.8),
                    inset 0 1px 2px rgba(255,255,255,0.15);
                position: relative;
                overflow: hidden;
                transform-origin: center bottom;
                perspective: 1000px;
            }

            /* Screen Glare Layer */
            .tablet-container::after {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: linear-gradient(
                    45deg,
                    transparent 45%,
                    rgba(255, 255, 255, 0.03) 48%,
                    rgba(255, 255, 255, 0.06) 50%,
                    rgba(255, 255, 255, 0.03) 52%,
                    transparent 55%
                );
                pointer-events: none;
                z-index: 20;
                transform: rotate(-15deg);
                opacity: 0.6;
            }

            /* Camera & Speaker Grille Detail */
            .tablet-bezel-details-top {
                position: absolute;
                top: 16px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 6px;
            }

            .tablet-lens {
                width: 10px;
                height: 10px;
                background: radial-gradient(circle at 30% 30%, #3a4a5a, #050508);
                border-radius: 50%;
                box-shadow: 
                    0 0 0 1px #000,
                    inset 0 0 5px rgba(0,0,0,1);
            }

            .tablet-speaker {
                width: 40px;
                height: 3px;
                background: #08080a;
                border-radius: 4px;
                border: 1px solid rgba(255,255,255,0.05);
                box-shadow: inset 0 1px 2px #000;
            }

            /* Home Button / Indicator Detail */
            .tablet-home-btn {
                position: absolute;
                bottom: 12px;
                left: 50%;
                transform: translateX(-50%);
                width: 50px;
                height: 16px;
                background: #0a0a0f;
                border: 1px solid #252530;
                border-radius: 8px;
                box-shadow: 
                    inset 0 2px 4px rgba(0,0,0,0.8),
                    0 1px 0 rgba(255,255,255,0.05);
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .tablet-home-indicator {
                width: 14px;
                height: 2px;
                background: rgba(200, 134, 10, 0.4);
                border-radius: 2px;
                box-shadow: 0 0 8px rgba(200, 134, 10, 0.2);
            }

            #tablet-overlay.active .tablet-container {
                /* Will be overwritten by JS scaling */
                transform: translateY(0) scale(1) rotateX(0deg);
            }

            #tablet-iframe {
                width: 100%;
                height: 100%;
                border: 1px solid #000;
                background: #000;
                border-radius: 6px;
                box-shadow: 0 0 40px rgba(0,0,0,0.8);
                position: relative;
                z-index: 5;
            }
        `;
        document.head.appendChild(style);

        // Build the widget DOM
        const widget = document.createElement('div');
        widget.id = 'tablet-widget';
        widget.innerHTML = `
            <div class="tablet-widget-button">
                <span class="tablet-widget-icon">
                    <div class="tablet-notif-dot" id="tablet-notif"></div>
                </span>
            </div>
        `;

        widget.addEventListener('click', () => {
            showTabletOverlay();
        });

        document.body.appendChild(widget);

        // Update notification state
        updateNotification();

        // Listen for the tablet telling us to close or that it's finished
        window.addEventListener('message', (event) => {
            if (event.data.type === 'closeTablet') {
                hideTabletOverlay();
                updateNotification();
            } else if (event.data.type === 'normalization_complete') {
                console.log("[Narrative] Normalization 1NF achieved. Setting game flag.");
                if (window.GameState) {
                    window.GameState.setFlag('database_normalized');
                }
            }
        });

        // Add resize listener for scaling
        window.addEventListener('resize', updateTabletScale);
    }

    function updateNotification() {
        const dot = document.getElementById('tablet-notif');
        if (!dot) return;
        
        // [AI - ANTIGRAVITY] - Logical Blinking: 
        // Only blink if we have data to fix (ledger) but haven't fixed it yet.
        const hasLedger = window.Inventory && window.Inventory.hasItem('police_ledger');
        const hasUSB = window.Inventory && window.Inventory.hasItem('usb_stick');
        const isUnlocked = localStorage.getItem('police_os_unlocked') === 'true';

        if ((hasLedger || hasUSB) && !isUnlocked) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    }

    // Expose refresh to global for GameState/Inventory events
    window.TabletWidget = {
        refresh: updateNotification,
        toggle: () => {
            const overlay = document.getElementById('tablet-overlay');
            if (overlay && overlay.classList.contains('active')) {
                hideTabletOverlay();
            } else {
                showTabletOverlay();
            }
        }
    };

    // Auto-refresh on a timer to catch inventory changes without complex events
    setInterval(updateNotification, 1000);

    let isTabletOpen = false;

    function updateTabletScale() {
        const container = document.querySelector('.tablet-container');
        if (!container || !isTabletOpen) return;

        const winW = window.innerWidth;
        const winH = window.innerHeight;
        
        // Calculate scale to fit 860x640 with some padding
        const scaleW = (winW * 0.95) / 860;
        const scaleH = (winH * 0.9) / 640;
        const finalScale = Math.min(scaleW, scaleH, 1.0);

        container.style.transform = `translateY(0) scale(${finalScale})`;
    }

    function showTabletOverlay() {
        if (isTabletOpen) return;
        isTabletOpen = true;

        // Create overlay if not exists
        let overlay = document.getElementById('tablet-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'tablet-overlay';
            overlay.innerHTML = `
                <div class="tablet-container">
                    <div class="tablet-bezel-details-top">
                        <div class="tablet-speaker"></div>
                        <div class="tablet-lens"></div>
                    </div>
                    <iframe id="tablet-iframe" frameborder="0"></iframe>
                    <div class="tablet-home-btn">
                        <div class="tablet-home-indicator"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
        }

        // Set source and show
        const iframe = document.getElementById('tablet-iframe');
        
        // Robust pathing: find the root by splitting at 'src/'
        const currentURL = window.location.href;
        const rootURL = currentURL.split('/src/')[0];
        // Updated path after refactoring
        iframe.src = rootURL + "/src/docs/demo/";
        
        // Trigger animation
        setTimeout(() => {
            overlay.classList.add('active');
            updateTabletScale();
        }, 10);
    }

    function hideTabletOverlay() {
        const overlay = document.getElementById('tablet-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            const container = document.querySelector('.tablet-container');
            if (container) {
                container.style.transform = 'translateY(100vh) scale(1)';
            }
            // Cleanup iframe source after animation to reset State for next open
            setTimeout(() => {
                document.getElementById('tablet-iframe').src = "about:blank";
                isTabletOpen = false;
            }, 600);
        }
    }

    // Self-start or wait for DOM
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        buildTabletWidget();
    } else {
        document.addEventListener('DOMContentLoaded', buildTabletWidget);
    }
})();
