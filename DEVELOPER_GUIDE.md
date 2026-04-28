# Developer Guide — NormaLIES Technical Standards

This guide is for developers working on the NormaLIES codebase. It covers security, performance, and implementation patterns required to keep the game robust and professional.

---

## 0. Repository & Deployment

### Active Repository
**All development must target this repository only:**

```
https://github.com/Creanathan/EduBytes.git  (origin)
```

Git remote configuration (local machine):

| Remote | URL | Status |
| :--- | :--- | :--- |
| `origin` | `https://github.com/Creanathan/EduBytes.git` | ✅ **Active — use this** |
| `samuel-old` | `https://github.com/SamuelWeyts/EduBytes.git` | ❌ Retired — do not push here |
| `public` | `https://github.com/Creanathan/EduBytes-Samuel-public.git` | 📦 Public mirror |

> **Note**: The `SamuelWeyts/EduBytes` repository is archived and no longer maintained. It was the original development fork. All pushes must now go to `Creanathan/EduBytes` (the `origin` remote).

### GitHub Pages Deployment
GitHub Pages typically updates **within 1–5 minutes** after a push to `main`. You can monitor the build status under:
`https://github.com/Creanathan/EduBytes/actions`

To push and deploy:
```bash
git add .
git commit -m "Your message"
git push origin main   # pushes to Creanathan/EduBytes ✅
```

---

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

## 3. Detective Tablet — Implementation Patterns

### Location
- The Tablet is located **inside the Inventory** (bottom-right `💼` button).
- It is launched via `window.TabletWidget.toggle()`, called by the Inventory UI (`inventory_ui.js`).

### State Lifecycle

The tablet uses three `localStorage` keys to manage its state machine:

```
Detective_os_imported  →  Was data ever loaded from the USB?
Detective_os_data      →  The current JSON state of the database rows.
Detective_os_unlocked  →  Has the 1NF puzzle been successfully completed?
```

On `DOMContentLoaded`, `loadState()` reads all three and uses them to determine `currentStep` (1 = atomicity, 2 = keys, 3 = finished). `checkSetup()` then routes to the correct UI screen.

### Adding a New Inventory Check

The tablet uses a two-layer check to detect if the player has collected the USB stick:

```js
function checkInventoryLocal(id) {
    // Layer 1: Try the parent window's Inventory object (preferred, in-game)
    try {
        if (window.parent?.Inventory?.hasItem) return window.parent.Inventory.hasItem(id);
    } catch (e) { /* CORS — fall through */ }

    // Layer 2: Read localStorage directly (for local file:// testing)
    try {
        const items = JSON.parse(localStorage.getItem('edubytes_inventory') || '[]');
        return items.includes(id);
    } catch (e) { return false; }
}
```

### REIMPORT Mechanic (Critical Pattern)

The `resetData()` function implements a **soft reset**. It must follow this exact pattern:

```js
// CORRECT: restore data, keep import flag alive, go back to repair UI
DetectiveData = JSON.parse(JSON.stringify(DEFAULT_DATA)); // deep copy!
isImported = true;       // User still "has" their USB
isUnlocked = false;
currentStep = 1;
selectedKeys = new Set();
localStorage.setItem('Detective_os_data', JSON.stringify(DetectiveData));
localStorage.setItem('Detective_os_imported', 'true');
localStorage.removeItem('Detective_os_unlocked');
// Show main-interface directly, NOT the setup screen.
```

> **Never** call `localStorage.removeItem('Detective_os_imported')` inside `resetData()`. This is the bug that was sending players back to the USB scanning screen. REIMPORT only resets *edits*, not the import itself.

### Manual Edit Lifecycle (`editCell`)

```js
// 1. User clicks a cell → onfocus stores originalCellValue
// 2. User types new content
// 3a. User presses Enter → blur() fires → editCell() saves to DetectiveData + localStorage
// 3b. User presses Esc  → cell text reverts to originalCellValue → blur() fires → editCell() sees no change, exits early
// 4. checkStepCondition() is called → checks for commas / key selection → may advance step
```

### Mangled Data Pattern (ERR_DATA_BLOCK)

Use the `ERR_DATA_BLOCK_772` string in `DEFAULT_DATA` to mask narrative clues. The `renderTable()` function handles dynamic decryption:

```js
if (displayObs.includes("ERR_DATA_BLOCK_772") && isUnlocked) {
    displayObs = "Piano (UNSUCCESSFUL: Butler hid the key?)";
}
```

### Identity Redaction Pattern (Subject Column)

The `Subject` column is always `[REDACTED]` until `isUnlocked = true`:

```js
// In renderTable():
let displaySubject = row.subject;
if (!isUnlocked) displaySubject = "[REDACTED]";
// The cell is contenteditable="false" — the player cannot edit identities.
```

---

## 4. Risks & Mitigations

| Risk | Mitigation | Status |
| :--- | :--- | :--- |
| **Direct URL Access** | `routing.js` checks flags on every page load. | **Implemented** |
| **Local Storage Editing** | Implement a HMAC or simple checksum for save data. | **Pending** |
| **Race Conditions** | Ensure `responsive.js` waits for images to load before syncing. | **Implemented** |
| **Global Variable Tampering** | Wrap services in IIFEs and provide a controlled API. | **In Progress** |
| **REIMPORT sending user to import screen** | `resetData()` must keep `Detective_os_imported=true`. | **Fixed** |

---

## 5. How to Add a New Room
1. Create `src/rooms/new_room.html`.
2. Follow the standard HTML structure (see `hallway.html`).
3. Add the room and its entry requirements to `src/js/core/routing.js`.
4. Add the room's dialogue/monologue to `src/js/data/dialogs.js`.
5. Add the background image to `src/assets/rooms/` using a descriptive `snake_case` name.
