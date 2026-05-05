/**
 * GameState Service
 * Manages global narrative flags and story progression states.
 * Persists data via localStorage so flags survive page reloads.
 */
(function() {
    const STORAGE_KEY = 'edubytes_gamestate';

    class GameStateService {
        #flags = {}; // Private field for better security

        constructor() {
            this.load();
        }

        // Simple string hashing for tamper detection
        #generateHash(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash |= 0;
            }
            return 'eb-' + hash.toString(16);
        }

        load() {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                const sig = localStorage.getItem(STORAGE_KEY + '_sig');
                
                if (stored) {
                    // Check integrity
                    if (this.#generateHash(stored) !== sig) {
                        console.error("[Security] State tampering detected. Resetting investigation.");
                        this.reset();
                        return;
                    }
                    this.#flags = JSON.parse(stored);
                }
            } catch (e) {
                console.error("Failed to load game state", e);
                this.#flags = {};
            }
        }

        save() {
            try {
                const serialized = JSON.stringify(this.#flags);
                localStorage.setItem(STORAGE_KEY, serialized);
                localStorage.setItem(STORAGE_KEY + '_sig', this.#generateHash(serialized));
            } catch (e) {
                console.error("Failed to save game state", e);
            }
        }

        setFlag(key, value = true) {
            this.#flags[key] = value;
            this.save();
        }

        hasFlag(key) {
            return !!this.#flags[key];
        }

        clearFlag(key) {
            delete this.#flags[key];
            this.save();
        }

        reset() {
            this.#flags = {};
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(STORAGE_KEY + '_sig');
            
            // Clear Detective OS (Tablet) State
            localStorage.removeItem('Detective_os_data');
            localStorage.removeItem('Detective_os_unlocked');
            localStorage.removeItem('Detective_os_imported');
            localStorage.removeItem('Detective_os_queries');
            localStorage.removeItem('Detective_os_accusation');
            
            // Clear Room State
            localStorage.removeItem('edubytes_last_room');
        }
    }

    window.GameState = new GameStateService();
})();
