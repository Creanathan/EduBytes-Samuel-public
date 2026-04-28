/**
 * Global Game Menu Component - EduBytes
 * Implements a unified hamburger menu in the top-right corner of every room.
 * Features:
 * - Hamburger icon with dropdown animation.
 * - Unified Audio Settings (Volume & Mute) persistent across rooms.
 * - Access to Tablet/Police OS.
 */

(function () {
    function buildGameMenu() {
        // 0. Safeguard: Prevent multiple initializations
        if (document.getElementById('game-menu-wrap')) return;

        // 1. Inject Styles
        const style = document.createElement('style');
        style.textContent = `
            #game-menu-wrap {
                position: fixed;
                top: 14px;
                right: 16px;
                z-index: 10000;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }

            #hamburger-btn {
                background: rgba(10, 10, 15, 0.85);
                border: 1px solid rgba(200, 134, 10, 0.3);
                border-radius: 8px;
                width: 44px;
                height: 44px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 5px;
                cursor: pointer;
                backdrop-filter: blur(12px);
                transition: all 0.25s ease;
                box-shadow: 0 4px 15px rgba(0,0,0,0.4);
            }

            #hamburger-btn span {
                width: 22px;
                height: 2px;
                background: rgba(200, 134, 10, 0.85);
                border-radius: 2px;
                transition: all 0.3s ease;
            }

            #hamburger-btn:hover {
                background: #1e1e28;
                border-color: rgba(200, 134, 10, 0.7);
                box-shadow: 0 0 14px rgba(200, 134, 10, 0.25);
            }

            #hamburger-btn.active span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
            #hamburger-btn.active span:nth-child(2) { opacity: 0; }
            #hamburger-btn.active span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

            #menu-dropdown {
                position: absolute;
                top: calc(100% + 12px);
                right: 0;
                background: rgba(10, 10, 15, 0.95);
                border: 1px solid rgba(200, 134, 10, 0.3);
                border-radius: 12px;
                padding: 10px;
                width: 220px;
                backdrop-filter: blur(16px);
                box-shadow: 0 8px 32px rgba(0,0,0,0.6);
                display: none;
                flex-direction: column;
                gap: 6px;
                animation: menu-in 0.2s ease both;
            }

            #menu-dropdown.open { display: flex; }

            @keyframes menu-in {
                from { opacity: 0; transform: translateY(-10px) scale(0.95); }
                to   { opacity: 1; transform: translateY(0) scale(1); }
            }

            .menu-item {
                padding: 12px;
                border-radius: 8px;
                cursor: pointer;
                transition: background 0.2s;
                display: flex;
                align-items: center;
                gap: 12px;
                color: #e8dcc8;
                font-size: 14px;
                letter-spacing: 0.5px;
                background: transparent;
                border: none;
                width: 100%;
                text-align: left;
            }

            .menu-item:hover {
                background: #1e1e28;
                color: #ffffff;
            }

            .menu-item i { font-size: 16px; color: rgba(200, 134, 10, 0.7); }

            /* Audio Sub-panel */
            .audio-sub-panel {
                padding: 10px;
                background: #0a0a0f;
                border: 1px solid rgba(200, 134, 10, 0.2);
                border-radius: 8px;
                margin-top: 5px;
                display: none;
                flex-direction: column;
                gap: 12px;
            }

            .audio-sub-panel.open { display: flex; }

            .audio-label {
                font-size: 10px;
                letter-spacing: 1px;
                text-transform: uppercase;
                color: rgba(200, 134, 10, 0.7);
            }

            #volume-slider {
                -webkit-appearance: none;
                width: 100%;
                height: 4px;
                background: #1e1e28;
                border-radius: 4px;
                outline: none;
            }

            #volume-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 14px; height: 14px;
                background: #c8860a;
                border-radius: 50%;
                cursor: pointer;
            }

            .mute-btn {
                background: #1e1e28;
                border: 1px solid rgba(200, 134, 10, 0.3);
                color: #c8860a;
                padding: 6px;
                border-radius: 6px;
                font-size: 12px;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .mute-btn:hover {
                background: rgba(200, 134, 10, 0.1);
            }

            .mute-btn.active {
                background: rgba(192, 57, 43, 0.2);
                border-color: rgba(192, 57, 43, 0.5);
                color: #e74c3c;
            }
        `;
        document.head.appendChild(style);

        // 2. Build DOM
        const wrap = document.createElement('div');
        wrap.id = 'game-menu-wrap';
        wrap.innerHTML = `
            <div id="hamburger-btn">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <div id="menu-dropdown">
                <button type="button" class="menu-item" id="menu-audio-toggle">
                    <span>\uD83D\uDD0A Audio Settings</span>
                </button>
                <div class="audio-sub-panel" id="audio-panel">
                    <span class="audio-label">Volume</span>
                    <input type="range" id="volume-slider" min="0" max="1" step="0.05">
                    <div class="mute-btn" id="mute-btn">Mute Audio</div>
                </div>
                <button type="button" class="menu-item" id="main-menu-btn">
                    <span>\uD83C\uDFE0 Home</span>
                </button>
            </div>
        `;
        document.body.appendChild(wrap);

        // 3. Logic
        const btn = document.getElementById('hamburger-btn');
        const dropdown = document.getElementById('menu-dropdown');
        const audioPanel = document.getElementById('audio-panel');
        const slider = document.getElementById('volume-slider');
        const muteBtn = document.getElementById('mute-btn');

        function closeMenu() {
            btn.classList.remove('active');
            dropdown.classList.remove('open');
            audioPanel.classList.remove('open');
        }

        dropdown.addEventListener('click', (e) => {
            const menuItem = e.target.closest('.menu-item');
            if (!menuItem) return;

            e.preventDefault();
            e.stopPropagation();

            if (menuItem.id === 'menu-audio-toggle') {
                audioPanel.classList.toggle('open');
                return;
            }

            if (menuItem.id === 'main-menu-btn') {
                closeMenu();
                const currentPath = window.location.pathname;
                const roomsDir = currentPath.substring(0, currentPath.lastIndexOf('/'));
                const htmlDir = roomsDir.substring(0, roomsDir.lastIndexOf('/'));
                window.location.href = htmlDir + '/start.html';
            }
        });

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            btn.classList.toggle('active');
            dropdown.classList.toggle('open');
            if (window.AudioEngine) window.AudioEngine.tryStart();
        });

        // Initialize values from AudioEngine
        if (window.AudioEngine) {
            slider.value = window.AudioEngine.getVolume();
            updateMuteState();
        }

        slider.addEventListener('input', () => {
            if (window.AudioEngine) {
                window.AudioEngine.setVolume(parseFloat(slider.value));
                window.AudioEngine.setMuted(false);
                updateMuteState();
            }
        });

        muteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.AudioEngine) {
                const newState = !window.AudioEngine.isMuted();
                window.AudioEngine.setMuted(newState);
                updateMuteState();
            }
        });

        function updateMuteState() {
            const muted = window.AudioEngine.isMuted();
            muteBtn.textContent = muted ? 'Unmute Audio' : 'Mute Audio';
            muteBtn.classList.toggle('active', muted);
        }

        // Close on outside click
        document.addEventListener('click', (e) => {
            closeMenu();
        });

        dropdown.addEventListener('click', e => e.stopPropagation());
    }

    // Use a more robust check for DOM ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        buildGameMenu();
    } else {
        document.addEventListener('DOMContentLoaded', buildGameMenu);
    }
})();

