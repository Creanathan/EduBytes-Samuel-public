/**
 * Inventory Service — EduBytes
 * Manages the collection of evidence and items.
 * Persists data via localStorage.
 */

const Inventory = (function() {
    const STORAGE_KEY = 'edubytes_inventory';
    let items = [];

    // Initialize on load
    function init() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                items = JSON.parse(saved);
            } catch (e) {
                console.error("Failed to load inventory:", e);
                items = [];
            }
        }
    }

    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
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
        }
    };
})();

// Export to window for global access relative to the game structure
window.Inventory = Inventory;
