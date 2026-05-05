/**
 * Inventory Service — EduBytes
 * Manages the collection of evidence and items.
 * Persists data via localStorage.
 */

const Inventory = (function() {
    const STORAGE_KEY = 'edubytes_inventory';
    let items = [];

    function generateHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return 'eb-inv-' + hash.toString(16);
    }

    // Initialize on load
    function init() {
        const saved = localStorage.getItem(STORAGE_KEY);
        const sig = localStorage.getItem(STORAGE_KEY + '_sig');
        if (saved) {
            try {
                if (generateHash(saved) !== sig) {
                    console.error("[Security] Inventory tampering detected.");
                    items = [];
                    save();
                    return;
                }
                items = JSON.parse(saved);
            } catch (e) {
                console.error("Failed to load inventory:", e);
                items = [];
            }
        }
    }

    function save() {
        const serialized = JSON.stringify(items);
        localStorage.setItem(STORAGE_KEY, serialized);
        localStorage.setItem(STORAGE_KEY + '_sig', generateHash(serialized));
        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent('inventoryUpdate', { detail: { items } }));
    }

    init();

    return {
        /**
         * Adds an item to the inventory.
         * @param {string} id - Unique identifier for the item (e.g., 'nursery_key')
         */
        addItem: function(id) {
            if (!items.includes(id)) {
                items.push(id);
                save();
                console.log(`[Inventory] Added: ${id}`);
                return true;
            }
            return false;
        },

        /**
         * Checks if the player has a specific item.
         * @param {string} id 
         * @returns {boolean}
         */
        hasItem: function(id) {
            return items.includes(id);
        },

        /**
         * Removes an item (e.g., after use).
         * @param {string} id 
         */
        removeItem: function(id) {
            const index = items.indexOf(id);
            if (index > -1) {
                items.splice(index, 1);
                save();
                return true;
            }
            return false;
        },

        /**
         * Returns a list of all current items.
         */
        getItems: function() {
            return [...items];
        },

        /**
         * Clears all inventory data.
         */
        reset: function() {
            items = [];
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(STORAGE_KEY + '_sig');
            // Dispatch event for UI updates
            window.dispatchEvent(new CustomEvent('inventoryUpdate', { detail: { items } }));
        }
    };
})();

// Export to window for global access relative to the game structure
window.Inventory = Inventory;
