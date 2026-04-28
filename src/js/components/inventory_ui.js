/**
 * Inventory UI Component — EduBytes
 * Renders the "Evidence Bag" button and drawer.
 * Positioned next to the Tablet widget.
 */

(function() {
    function buildInventoryUI() {
        const style = document.createElement('style');
        style.textContent = `
            #inventory-widget {
                position: fixed;
                bottom: 24px;
                right: 88px; /* Offset from tablet widget */
                z-index: 9000;
                cursor: pointer;
                user-select: none;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }

            #inventory-widget:hover {
                transform: scale(1.1);
            }

            .inventory-button {
                width: 44px;
                height: 44px;
                background: rgba(15, 10, 5, 0.85); /* Slightly browner 'leather' feel */
                border: 1px solid rgba(200, 134, 10, 0.35);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(8px);
                box-shadow: 0 4px 15px rgba(0,0,0,0.6);
                transition: all 0.25s ease;
            }

            .inventory-icon {
                font-size: 18px;
                color: rgba(200, 134, 10, 0.85);
            }

            #inventory-widget:hover .inventory-button {
                border-color: rgba(200, 134, 10, 0.7);
                background: rgba(200, 134, 10, 0.15);
                box-shadow: 0 0 15px rgba(200, 134, 10, 0.25);
            }

            .inventory-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                min-width: 18px;
                height: 18px;
                background: #c8860a;
                color: #000;
                border-radius: 9px;
                font-family: 'Segoe UI', sans-serif;
                font-size: 10px;
                font-weight: bold;
                display: none; /* Shown when count > 0 */
                align-items: center;
                justify-content: center;
                border: 1px solid rgba(0,0,0,0.5);
            }

            /* The Inventory Drawer */
            #inventory-drawer {
                position: fixed;
                bottom: 80px;
                right: 24px;
                width: 250px;
                background: rgba(10, 10, 15, 0.95);
                border: 1px solid rgba(200, 134, 10, 0.2);
                border-radius: 12px;
                backdrop-filter: blur(20px);
                box-shadow: 0 10px 40px rgba(0,0,0,0.8);
                display: none;
                opacity: 0;
                transform: translateY(10px);
                transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
                z-index: 9500;
                overflow: hidden;
            }

            #inventory-drawer.active {
                display: block;
                opacity: 1;
                transform: translateY(0);
            }

            .drawer-header {
                padding: 12px 16px;
                background: rgba(200, 134, 10, 0.1);
                border-bottom: 1px solid rgba(200, 134, 10, 0.1);
                font-family: 'Segoe UI', sans-serif;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: #c8860a;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .drawer-content {
                max-height: 300px;
                overflow-y: auto;
                padding: 12px;
            }

            .inventory-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 10px;
                background: rgba(255,255,255,0.03);
                border-radius: 6px;
                margin-bottom: 8px;
                border: 1px solid transparent;
                transition: all 0.2s;
            }

            .inventory-item:hover {
                background: rgba(200, 134, 10, 0.05);
                border-color: rgba(200, 134, 10, 0.2);
            }

            .item-thumb {
                width: 32px;
                height: 32px;
                background: rgba(0,0,0,0.3);
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
            }

            .item-name {
                font-size: 13px;
                color: rgba(255,255,255,0.8);
                font-family: 'Segoe UI', sans-serif;
            }

            .empty-msg {
                text-align: center;
                padding: 24px;
                color: rgba(255,255,255,0.3);
                font-size: 12px;
                font-style: italic;
            }
        `;
        document.head.appendChild(style);

        // Build Widget
        const widget = document.createElement('div');
        widget.id = 'inventory-widget';
        widget.title = 'Open Evidence Bag (Inventory)';
        widget.innerHTML = `
            <div class="inventory-button">
                <span class="inventory-icon">🎒</span>
                <div class="inventory-badge" id="inventory-count-badge">0</div>
            </div>
        `;

        // Build Drawer
        const drawer = document.createElement('div');
        drawer.id = 'inventory-drawer';
        drawer.innerHTML = `
            <div class="drawer-header">
                <span>Evidence Bag</span>
                <span style="opacity: 0.5; font-size: 9px;">Investigation Ledger</span>
            </div>
            <div class="drawer-content" id="inventory-items-container">
                <!-- Items injected here -->
            </div>
        `;

        document.body.appendChild(widget);
        document.body.appendChild(drawer);

        // Interactions
        widget.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDrawer();
        });

        document.addEventListener('click', (e) => {
            if (drawer.classList.contains('active') && !drawer.contains(e.target)) {
                closeDrawer();
            }
        });

        function toggleDrawer() {
            if (drawer.classList.contains('active')) {
                closeDrawer();
            } else {
                renderInventory();
                drawer.style.display = 'block';
                setTimeout(() => drawer.classList.add('active'), 10);
            }
        }

        function closeDrawer() {
            drawer.classList.remove('active');
            setTimeout(() => {
                if(!drawer.classList.contains('active')) drawer.style.display = 'none';
            }, 300);
        }

        const ITEM_MAP = {
            'nursery_key': { name: 'Nursery Key', icon: '🔑' },
            'bloody_glass': { name: 'Glass Shard', icon: '💎' },
            'ledger': { name: 'Missing Ledger', icon: '📓' },
            'usb_stick': { name: 'USB Flash Drive', icon: '💾' }
        };

        function renderInventory() {
            const container = document.getElementById('inventory-items-container');
            const items = (window.Inventory ? window.Inventory.getItems() : []).filter(i => typeof i === 'string');
            
            if (items.length === 0) {
                container.innerHTML = '<div class="empty-msg">No evidence collected yet.</div>';
            } else {
                container.innerHTML = items.map(id => {
                    const data = ITEM_MAP[id] || { name: id.replace(/_/g, ' '), icon: '🔎' };
                    return `
                        <div class="inventory-item">
                            <div class="item-thumb">${data.icon}</div>
                            <div class="item-name">${data.name}</div>
                        </div>
                    `;
                }).join('');
            }

            const badge = document.getElementById('inventory-count-badge');
            const count = items.length;
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }

        // Listen for updates
        window.addEventListener('inventoryUpdate', renderInventory);
        renderInventory(); // Initial render
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildInventoryUI);
    } else {
        buildInventoryUI();
    }
    // Expose for external access (e.g., Hamburger Menu)
    window.InventoryUI = {
        toggle: () => {
            const drawer = document.getElementById('inventory-drawer');
            if (drawer) {
                // Manually trigger the transition logic since buildInventoryUI is local
                if (drawer.classList.contains('active')) {
                    drawer.classList.remove('active');
                    setTimeout(() => drawer.style.display = 'none', 300);
                } else {
                    drawer.style.display = 'block';
                    setTimeout(() => drawer.classList.add('active'), 10);
                }
            }
        }
    };
})();
