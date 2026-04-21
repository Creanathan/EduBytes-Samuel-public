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

            #tablet-widget:hover .tablet-widget-icon {
                border-color: #fff;
            }

            #tablet-widget:hover .tablet-widget-icon::after {
                background: #fff;
            }

            /* Minimalist label below */
            .tablet-widget-label {
                position: absolute;
                top: -18px;
                left: 50%;
                transform: translateX(-50%);
                font-family: 'Segoe UI', sans-serif;
                font-size: 9px;
                letter-spacing: 1.5px;
                text-transform: uppercase;
                color: rgba(200, 134, 10, 0.55);
                white-space: nowrap;
                opacity: 0;
                transition: opacity 0.25s, transform 0.25s;
                pointer-events: none;
            }

            #tablet-widget:hover .tablet-widget-label {
                opacity: 1;
                transform: translateX(-50%) translateY(-2px);
            }
        `;
        document.head.appendChild(style);

        // Build the widget DOM
        const widget = document.createElement('div');
        widget.id = 'tablet-widget';
        widget.innerHTML = `
            <div class="tablet-widget-button">
                <span class="tablet-widget-icon"></span>
            </div>
        `;

        widget.addEventListener('click', () => {
            showTabletOverlay();
        });

        document.body.appendChild(widget);

        // Listen for the tablet telling us to close
        window.addEventListener('message', (event) => {
            if (event.data.type === 'closeTablet') {
                hideTabletOverlay();
            }
        });
    }

    let isTabletOpen = false;

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

            // Add styles for the overlay
            const style = document.createElement('style');
            style.textContent = `
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
                    background: rgba(0, 0, 0, 0.4);
                    backdrop-filter: blur(10px) brightness(0.35);
                    pointer-events: all;
                    opacity: 1;
                }

                .tablet-container {
                    width: 860px;
                    height: 640px;
                    transform: translateY(100vh) scale(0.9);
                    transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
                }

                #tablet-overlay.active .tablet-container {
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
        }

        // Set source and show
        const iframe = document.getElementById('tablet-iframe');
        // Relative path calculation
        const isRoom = window.location.href.includes('/rooms/');
        iframe.src = isRoom ? "../../normalization_demo/index.html" : "../normalization_demo/index.html";
        
        // Trigger animation
        setTimeout(() => {
            overlay.classList.add('active');
        }, 10);
    }

    function hideTabletOverlay() {
        const overlay = document.getElementById('tablet-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            // Cleanup iframe source after animation to reset State for next open
            setTimeout(() => {
                document.getElementById('tablet-iframe').src = "about:blank";
                isTabletOpen = false;
            }, 600);
        }
    }

        // Keyboard shortcut
        document.addEventListener('keydown', (event) => {
            if (event.key === "ArrowDown" || event.key === "s" || event.key === "S") {
                showTabletOverlay();
            }
        });

        document.addEventListener('DOMContentLoaded', buildTabletWidget);
})();
