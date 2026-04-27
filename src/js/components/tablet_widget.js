/**
 * Tablet Widget — EduBytes Samuel
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
                transition: background 0.5s ease, backdrop-filter 0.5s ease;
                pointer-events: none;
                opacity: 0;
            }

            #tablet-overlay.active {
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(5px) brightness(0.4);
                pointer-events: all;
                opacity: 1;
            }

            .tablet-container {
                /* FIXED INTERNAL SIZE */
                width: 860px;
                height: 640px;
                transform: translateY(100vh) scale(1);
                transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
                display: flex;
                flex-direction: column;
                box-shadow: 0 10px 60px rgba(0,0,0,0.8);
                border-radius: 24px;
                overflow: hidden;
                background: #000;
                transform-origin: center center;
            }

            #tablet-overlay.active .tablet-container {
                /* Will be overwritten by JS scaling */
                transform: translateY(0) scale(1);
            }

            #tablet-iframe {
                width: 100%;
                height: 100%;
                border: none;
                background: transparent;
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
            }
        });

        // Add resize listener for scaling
        window.addEventListener('resize', updateTabletScale);
    }

    function updateNotification() {
        const dot = document.getElementById('tablet-notif');
        if (!dot) return;
        
        const isUnlocked = localStorage.getItem('police_os_unlocked') === 'true';
        if (!isUnlocked) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    }

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
                    <iframe id="tablet-iframe" frameborder="0"></iframe>
                </div>
            `;
            document.body.appendChild(overlay);
        }

        // Set source and show
        const iframe = document.getElementById('tablet-iframe');
        // Relative path calculation
        const isRoom = window.location.href.includes('/rooms/');
        iframe.src = isRoom ? "../../normalization_demo/index.html" : "../normalization_demo/index.html";
        
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

    document.addEventListener('DOMContentLoaded', buildTabletWidget);
})();
