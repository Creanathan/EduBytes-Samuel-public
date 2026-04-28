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
                right: 24px;
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
                padding: 16px 20px;
                background: rgba(200, 134, 10, 0.05);
                border-bottom: 1px solid rgba(200, 134, 10, 0.1);
                font-family: 'Segoe UI', sans-serif;
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 3px;
                color: #c8860a;
                font-weight: 700;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .drawer-content {
                max-height: 380px;
                overflow-y: auto;
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .inventory-item {
                display: flex;
                align-items: center;
                gap: 14px;
                padding: 12px 16px;
                background: rgba(255,255,255,0.02);
                border-radius: 10px;
                border: 1px solid rgba(255,255,255,0.05);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                cursor: default;
            }

            .inventory-item.interactive {
                cursor: pointer;
                background: rgba(200, 134, 10, 0.03);
                border-color: rgba(200, 134, 10, 0.1);
            }

            .inventory-item.interactive:hover {
                background: rgba(200, 134, 10, 0.08);
                border-color: rgba(200, 134, 10, 0.3);
                transform: translateX(4px);
            }

            .item-thumb {
                width: 36px;
                height: 36px;
                background: rgba(0,0,0,0.4);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                border: 1px solid rgba(255,255,255,0.05);
            }

            .item-name {
                font-size: 14px;
                color: rgba(255,255,255,0.9);
                font-family: 'Segoe UI', sans-serif;
                letter-spacing: 0.5px;
                font-weight: 500;
            }

            .empty-msg {
                text-align: center;
                padding: 30px;
                color: rgba(255,255,255,0.25);
                font-size: 12px;
                font-style: italic;
                letter-spacing: 1px;
            }
        `;
        document.head.appendChild(style);

        // Build Widget
        const widget = document.createElement('div');
        widget.id = 'inventory-widget';
        widget.title = 'Open Inventory';
        widget.innerHTML = `
            <div class="inventory-button">
                <span class="inventory-icon">💼</span>
                <div class="inventory-badge" id="inventory-count-badge">0</div>
            </div>
        `;

        // Build Drawer
        const drawer = document.createElement('div');
        drawer.id = 'inventory-drawer';
        drawer.innerHTML = `
            <div class="drawer-header">
                <span>Inventory</span>
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

        function openTablet() {
            closeDrawer();
            if (window.TabletWidget && window.TabletWidget.toggle) {
                window.TabletWidget.toggle();
            }
        }

        function renderInventory() {
            const container = document.getElementById('inventory-items-container');
            const items = (window.Inventory ? window.Inventory.getItems() : []).filter(i => typeof i === 'string');
            
            // Start with permanent tools (No more labels)
            let html = `
                <div class="inventory-item interactive" onclick="window.openTabletFromInv()">
                    <div class="item-thumb">📱</div>
                    <div class="item-name">Detective Tablet</div>
                </div>
            `;

            if (items.length > 0) {
                html += items.map(id => {
                    const data = ITEM_MAP[id] || { name: id.replace(/_/g, ' '), icon: '🔎' };
                    return `
                        <div class="inventory-item">
                            <div class="item-thumb">${data.icon}</div>
                            <div class="item-name">${data.name}</div>
                        </div>
                    `;
                }).join('');
            }

            container.innerHTML = html;

            const badge = document.getElementById('inventory-count-badge');
            const count = items.length;
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }

        // Listen for updates
        window.addEventListener('inventoryUpdate', renderInventory);
        renderInventory(); // Initial render

        // Expose openTablet for the HTML onclick
        window.openTabletFromInv = openTablet;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildInventoryUI);
    } else {
        buildInventoryUI();
    }
    // Expose for external access
    window.InventoryUI = {
        toggle: () => {
            const drawer = document.getElementById('inventory-drawer');
            if (drawer) {
                if (drawer.classList.contains('active')) {
                    drawer.classList.remove('active');
                    setTimeout(() => drawer.style.display = 'none', 300);
                } else {
                    renderInventory();
                    drawer.style.display = 'block';
                    setTimeout(() => drawer.classList.add('active'), 10);
                }
            }
        }
    };
})();
