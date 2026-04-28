# Developer Guide — NormaLIES Technical Standards

This guide is for developers working on the NormaLIES codebase. It covers security, performance, and implementation patterns required to keep the game robust and professional.

## 1. Security & Anti-Cheat
As a client-side web game, 100% security is impossible, but we implement several layers to discourage cheating and ensure narrative integrity:

### Encapsulation (Protecting the Global Scope)
Avoid attaching critical game variables directly to `window`. 
- **Pattern**: Use IIFEs (Immediately Invoked Function Expressions) or ES6 Modules to keep logic private.
- **Cheater Risk**: If `GameState` is globally accessible, a user can type `GameState.setFlag('crime_scene_unlocked')` in the console.
- **Improvement Needed**: We are transitioning `GameState` to use a validation hash (Checksum) to ensure `localStorage` isn't manually edited.

### Routing Guard
The `routing.js` service is the primary security layer.
- It prevents users from jumping to late-game rooms (e.g., `nannys_room.html`) by typing the URL directly.
- **Rule**: Every new room must be registered in `RoutingGuard.ACCESS_RULES`.

---

## 2. Performance Optimization
To ensure a smooth experience on hosted servers:

### Image Management
- **Lazy Loading**: Use `loading="lazy"` for non-background images.
- **Ambient Sync**: The `ResponsiveScaler` handles the heavy lifting of blurring edges. Ensure it is only called when necessary (e.g., window resize or background change).
- **Format**: Prefer `.webp` for new assets to reduce payload size.

### Narrative Engine
- The `DialogEngine` in `dialog.js` is optimized to process pipe-separated actions (e.g., `setFlag:X|goTo:Y`). 
- **Rule**: Keep interaction strings clean. Avoid complex logic inside the `action` strings; handle that in `gamestate.js`.

---

## 3. Risks & Mitigations

| Risk | Mitigation | Status |
| :--- | :--- | :--- |
| **Direct URL Access** | `routing.js` checks flags on every page load. | **Implemented** |
| **Local Storage Editing** | Implement a HMAC or simple checksum for save data. | **Pending** |
| **Race Conditions** | Ensure `responsive.js` waits for images to load before syncing. | **Implemented** |
| **Global Variable Tampering** | Wrap services in IIFEs and provide a controlled API. | **In Progress** |

---

## 4. How to Add a New Room
1. Create `src/rooms/new_room.html`.
2. Follow the standard HTML structure (see `hallway.html`).
3. Add the room and its entry requirements to `src/js/core/routing.js`.
4. Add the room's dialogue/monologue to `src/js/data/dialogs.js`.
5. Add the background image to `src/assets/rooms/` using a descriptive `snake_case` name.
