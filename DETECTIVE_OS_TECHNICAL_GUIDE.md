# Detective OS Technical & Design Guide (v4.2 "Compact Titan")

This document outlines the architecture, design philosophy, and functional logic of the **Detective OS** forensic tablet interface.

---

## 1. Core Purpose
The Detective OS serves as the primary educational and investigative tool in the game. Its role is to:
- **Educate**: Teach 1NF (First Normal Form) database normalization (Atomicity and Composite Keys).
- **Investigate**: Provide a platform to cross-reference witness statements and uncover alibi contradictions.
- **Progress**: Gate the final accusation mechanic behind successful forensic analysis.

---

## 2. Design Philosophy (Titan v4.2)
The UI follows a **Noir-Tech Glassmorphic** aesthetic, designed to feel premium and immersive.

### Visual Standards:
- **Color Palette**: Deep backgrounds (`#08090b`), translucent glass surfaces, and high-contrast accents (Amber `#ffcc33` for data, Cyan `#00f2ff` for integrity).
- **Glassmorphism**: Extensive use of `backdrop-filter: blur(20px)` and subtle white borders (`rgba(255,255,255,0.08)`) to create depth.
- **Atmosphere**: Subtle CRT scanlines and vignette overlays reinforce the hardware-terminal feel.
- **Typography**: `Outfit` for general UI and `JetBrains Mono` for forensic data/log IDs.

### Responsiveness:
- **Optimized Viewport**: Specifically tuned for the **810x558** iframe viewport within the game.
- **Compact Layout**: Reduced margins and padding to maximize the data workspace.
- **Collapsible Evidence Tray**: The right-hand profile panel is collapsible (Toggle via 📂) to prioritize database width on restricted screens.

---

## 3. UI Components

### A. System Header
- **Integrity Meter**: Visualizes progress through the normalization steps.
- **System Controls**: Quick access to the Manual (📖) and Exit (✕).
- **Manual Highlight**: The manual button will "glow" (CSS animation) if the user fails a validation check, guiding them to help.

### B. Sidebar (OS Nav)
- **Database (📋)**: The data entry and repair workspace.
- **Analysis (🔗)**: Locked until 1NF is achieved. Used for querying contradictions.
- **Report (⚖️)**: Locked until analysis is conducted. Used for the final accusation.
- **Evidence Toggle (📂)**: Opens/Closes the right-hand suspect profile tray.

### C. Evidence Tray
- **Suspect Profiles**: "Decrypted" metadata for suspects. Profiles are only revealed once the database achieves 1NF, serving as a narrative reward.

---

## 4. Normalization Logic (1NF)

The gameplay loop consists of two distinct technical steps:

### Step 1: Atomicity
- **Requirement**: Every cell in the `Observation Evidence` column must contain only one piece of data (no commas).
- **Interaction**: Users must split multi-room reports (e.g., "Kitchen, Hallway") into separate rows using the `+ ROW` button.
- **Validation**: Checks if any cell in the observation column contains a comma.

### Step 2: Composite Primary Keys
- **Requirement**: Identify the columns that uniquely identify a record.
- **Interaction**: Users must click the **ID** and **Observation Evidence** headers to mark them as keys.
- **Validation**: Checks if exactly these two headers are selected.

---

## 5. Technical Integration

### State Management:
- **LocalStorage**: Persistent storage for `Detective_os_data`, `Detective_os_unlocked`, and `Detective_os_queries`.
- **Reset**: A factory reset button clears local storage and reloads the default "dirty" dataset.

### Parent Communication:
The tablet communicates with the main game engine via `window.parent.postMessage`:
- `type: 'normalization_complete'`: Triggered when the DB is successfully repaired.
- `type: 'accusation_filed'`: Transmits the suspect ID and correctness to the main narrative engine.
- `type: 'closeTablet'`: Closes the tablet UI.

### Item Dependency:
- The tablet logic checks the parent's `Inventory` for the `usb_stick` item before allowing the "Initialize Scan" process.

---

## 6. Directory Structure
- `index.html`: Core structure and toggle logic.
- `style.css`: All glassmorphic styling, animations, and responsive media queries.
- `logic.js`: Forensic engine, validation rules, and state persistence.

---

*Document Version: 1.0.1 // Forensic Core v4.2*
