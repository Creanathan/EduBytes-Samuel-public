// Helper for explicit spatial routing
/**
 * Helper for explicit spatial routing
 * @param {string} url - Target HTML file
 * @param {string} [requiredItem] - Optional item ID required for access
 */
function goToLocation(url, requiredItem) {
    if (requiredItem && window.Inventory && !window.Inventory.hasItem(requiredItem)) {
        // Find which object would match this lock to show its dialog
        // For simplicity, we trigger a specific interaction for the lock
        if (window.showInteraction) {
            // Check if there is a specific 'locked' interaction defined in dialogs.js
            // or just use a generic 'door_locked' one.
            showInteraction('door_nursery'); 
        } else {
            alert("This path is locked. You need a key.");
        }
        return;
    }

    if (window.AudioEngine) {
        window.AudioEngine.play('door_open');
        setTimeout(() => {
            window.location.href = url;
        }, 300);
    } else {
        window.location.href = url;
    }
}


