/**
 * Routing Guard Service - EduBytes
 * Prevents unauthorized access to rooms by checking GameState flags.
 * This ensures players cannot bypass progression by editing the URL.
 */
(function () {
    const ACCESS_RULES = {
        'outside': { flag: null, redirect: 'outside.html' },
        'hallway': { flag: null, redirect: 'outside.html' },
        'living_room': { flag: null, redirect: 'hallway.html' },
        'nursery': { flag: null, redirect: 'living_room.html' },
        'crime_scene': { flag: 'crime_scene_unlocked', redirect: 'hallway.html' },
        'nannys_room': { flag: 'nannys_room_unlocked', redirect: 'living_room.html' }
    };

    function redirectToSafe(message) {
        if (message) {
            localStorage.setItem('routing_blocked_msg', message);
        }
        window.location.replace('outside.html');
    }

    function getFilenameFromPath(path) {
        const rawFilename = path.substring(path.lastIndexOf('/') + 1).replace('.html', '');
        return rawFilename.replace(/[^a-z0-9_]/gi, '');
    }

    function isAllowedRoom(filename) {
        if (filename === 'outside') return true;

        const currentRoom = sessionStorage.getItem('edubytes_current_room');
        const allowedRoom = sessionStorage.getItem('edubytes_allowed_room');

        return filename === currentRoom || filename === allowedRoom;
    }

    window.EduBytesNavigation = {
        allowRoomNavigation(url) {
            const anchor = document.createElement('a');
            anchor.href = url;
            const filename = getFilenameFromPath(anchor.pathname);
            if (!filename) return;
            sessionStorage.setItem('edubytes_allowed_room', filename);
        },
        markCurrentRoom(filename) {
            if (!filename) return;
            sessionStorage.setItem('edubytes_current_room', filename);
            sessionStorage.removeItem('edubytes_allowed_room');
        }
    };

    function checkAccess() {
        const path = window.location.pathname;
        const rawFilename = path.substring(path.lastIndexOf('/') + 1).replace('.html', '');
        const filename = rawFilename.replace(/[^a-z0-9_]/gi, '');

        if (!filename || filename !== rawFilename) {
            console.warn(`[Security] Invalid room request: ${rawFilename}. Redirecting to outside.html.`);
            redirectToSafe('Access denied.');
            return false;
        }

        const rule = ACCESS_RULES[filename];
        if (!rule) {
            console.warn(`[Security] Unknown room requested: ${filename}. Redirecting to outside.html.`);
            redirectToSafe('Room not available.');
            return false;
        }

        if (!isAllowedRoom(filename)) {
            console.warn(`[Security] Direct URL navigation blocked for ${filename}. Redirecting to outside.html.`);
            redirectToSafe('Please use in-game navigation to move between rooms.');
            return false;
        }

        if (rule.flag) {
            const hasAccess = window.GameState && window.GameState.hasFlag(rule.flag);
            if (!hasAccess) {
                console.warn(`[Security] Unauthorized access attempt to ${filename}. Redirecting to ${rule.redirect}...`);
                localStorage.setItem('routing_blocked_msg', `You haven't unlocked the ${filename.replace('_', ' ')} yet.`);
                window.location.replace(rule.redirect);
                return false;
            }
        }

        // Access is allowed. Track last visited room.
        window.EduBytesNavigation.markCurrentRoom(filename);
        localStorage.setItem('edubytes_last_room', filename + '.html');
        return true;
    }

    if (!checkAccess()) {
        window.stop();
    }
})();
