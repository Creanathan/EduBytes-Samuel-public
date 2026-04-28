# EduBytes — Technical Design Standard

This document standardizes the interaction logic and state requirements for Chapter 1, ensuring consistency between the design documents and the JavaScript implementation.

---

## 1. Global State Logic (GameState)

| Flag | Logic Trigger | Purpose |
| :--- | :--- | :--- |
| `talked_to_leduc` | Dialogue with Butler | Tracks initial greeting. |
| `crime_scene_unlocked` | Butler's "Please" option | Reveals the Up arrow to the Crime Scene. |
| `crime_scene_visited` | Crime Scene entry monologue | Tracks progression into the investigation phase. |
| `database_normalized` | 1NF Puzzle completion | Unlocks trust-building dialogue with Butler. |
| `butler_revealed_key` | Dialogue with Butler after normalization | Reveals the location of the key in the Piano. |
| `has_nannys_key` | Piano interaction | Unlocks the Nanny's Room door. |
| `nannys_room_unlocked` | Nanny's Room entry | Tracks completion of Chapter 1. |

---

## 2. Standard Interaction Responses (Chapter 1)

### Hallway Objects
*   **Mirror**: "Maybe I should've shaved."
*   **Clock**: "An old Howard Millar grandfather clock."
*   **Butler (Leduc)**: Conditional greeting (4 states: First meeting, Delayed decision, Ready to go, Post-visit).

### Living Room Objects
*   **Piano**: 
    *   *Default*: "I shouldn't waste any time playing a tune..."
    *   *Normalized*: "Aha! A small silver key with a 'N' engraved on it."
*   **Door (Nanny's)**: 
    *   *Default*: "Locked. Best to ask for a key later."
    *   *With Key*: Unlocks the room and changes the background to the "Open Door" version.
*   **Thomas**: Grieving partner; hiring dialogue.

### Nursery Objects
*   **Cradle**: "Best not to wake them up..."
*   **Family Picture**: "The Dégrasse family. They seem... close. Wait, is that the Nanny in the corner?"
*   **Beatrix (Nanny)**: 2 states (Initial shock/Introduction, and investigative offer).

### Crime Scene Objects
*   **Body**: Investigate Amelia's physical state (Discoloration clue).
*   **Broken Glass**: Evidence of the residue.
*   **USB Stick**: Item required to import data into the Detective Tablet.
*   **Detective Tablet**: Personal forensic tool. See Section 5 for full spec.

---

## 3. UI Navigation Logic

*   **Left (Hallway)**: Living Room.
*   **Right (Hallway)**: Nursery.
*   **Up (Hallway)**: Crime Scene (Locked by `crime_scene_unlocked`).
*   **Down (Hallway)**: Outside.
*   **Up (Living Room)**: Nanny's Room (Locked by `has_nannys_key`).

---

## 4. UI Design Standards

- **Hamburger Menu**: Dedicated to system-level navigation (Home) and settings (Audio). Investigative tools are excluded to maintain immersion.
- **Inventory**: The primary investigative hub (💼 icon) located in the bottom-right. Uses a glassmorphic drawer design. Labels are clean — no redundant headings.
- **Detective Tablet**: Integrated as a permanent "Tool" inside the Inventory drawer.
- **Interaction Model**: Physical items collected in the world (USB, Ledger) are imported through the Tablet interface within the Inventory.

---

## 5. Detective Tablet — Full Specification

### 5.1 Purpose
The Detective Tablet is an in-game forensic tool that teaches First Normal Form (1NF) database normalization through active investigation. The player must fix a corrupted witness testimony database to reveal hidden identities and key narrative clues.

### 5.2 Boot Sequence (State Machine)

| State | Condition | UI Shown |
| :--- | :--- | :--- |
| **No Data Source** | No USB or Ledger in inventory | "No Data Source Detected" setup screen |
| **USB Detected** | `usb_stick` in inventory | "Encrypted USB Detected" setup screen with DECRYPT & IMPORT button |
| **Loading** | User clicked IMPORT | Animated loading bar ("Loading data clusters...") |
| **SYSTEM HALT (Crash)** | Import complete | Red crash screen: "CRITICAL_STRUCTURAL_ERROR" |
| **Repair Interface** | User clicked "REPAIR DATABASE" | Main database table with editable rows |
| **Unlocked** | 1NF puzzle solved | Success banner, identities revealed, search enabled |

### 5.3 Database Schema (Narrative Witness Reports)

The database (`DEFAULT_DATA`) contains the initial police interview records from the USB stick. It is **intentionally non-atomic** to create the 1NF violation the player must fix.

| Log_ID | Subject (Hidden) | Observation (Corrupted) |
| :--- | :--- | :--- |
| #001 | Leduc (Butler) | `Hallway, Kitchen, Dining Room. Claims he was prepping tea.` |
| #002 | Beatrix (Nanny) | `Nursery, Laundry. Claims she was washing the cradle linens.` |
| #003 | Thomas (Partner) | `Living Room. Claims he was playing piano to calm his nerves.` |
| #004 | Off. Miller | `Crime Scene. Found the body at 22:00.` |
| #005 | System Registry | `Piano (ERR_DATA_BLOCK_772: HIDDEN_RESTRICTED)` |

**1NF Violations**: Entries #001 and #002 contain comma-separated location lists in `Observation`. These must be split into atomic rows. Entry #005 is a narrative clue that is decrypted only after `isUnlocked=true`.

### 5.4 Reward Mechanic — Redacted Identities

- **Before normalization**: The `Subject` column displays `[REDACTED]` for all rows.
- **After normalization**: The `Subject` column is fully revealed, decrypting the names of the Butler (Leduc), Nanny (Beatrix), and the Partner (Thomas). This is the player's reward for solving the puzzle.
- **Hidden Clue**: Entry #005's `ERR_DATA_BLOCK_772` block decrypts to: *"Piano (UNSUCCESSFUL: Butler hid the key?)"*, pointing to the Piano as the next investigation target.

### 5.5 REIMPORT Mechanic

The `REIMPORT` button allows a player to reset their editing attempts **without losing their USB item or needing to re-run the loading sequence**.

**Correct REIMPORT Behaviour:**
1. Restores `DetectiveData` to a fresh deep copy of `DEFAULT_DATA`.
2. Keeps `Detective_os_imported = 'true'` in localStorage (user still "has" their USB).
3. Removes `Detective_os_unlocked` from localStorage.
4. Resets `isUnlocked=false`, `currentStep=1`, `selectedKeys=new Set()`.
5. Shows the main repair interface immediately with fresh dirty data.
6. Shows a toast: "DATABASE RESTORED — ORIGINAL DATA LOADED".

> **Key rule**: REIMPORT must NOT send the user back to the USB scanning/import screen. It only resets the *edits*. The import itself is irreversible.

### 5.6 localStorage Keys

| Key | Type | Purpose |
| :--- | :--- | :--- |
| `Detective_os_imported` | `'true'` / absent | Whether the USB has been decrypted and loaded. |
| `Detective_os_data` | JSON string | The current state of the editable database. |
| `Detective_os_unlocked` | `'true'` / absent | Whether the 1NF puzzle has been solved. |
| `Detective_os_queries` | Number string | Tracks how many cross-reference queries the user has run (unlocks Accusation tab). |
| `Detective_os_accusation` | String | The name of the primary suspect accused by the player. |

### 5.7 1NF Puzzle Steps

**Step 1 — Atomicity**: Remove all commas from the `Observation` column. Each cell must contain exactly one piece of information. Players edit cells manually (`contenteditable`), use `[DEL]` to remove rows, or use `[ADD ROW]` to create new atomic entries. Cells with commas are highlighted with a red `⚠` warning (`corrupt-cell` class).

**Step 2 — Composite Keys**: Once data is atomic, the `Log_ID` values repeat (e.g., #001 now has multiple rows). The player must click the `Log_ID` and `Observation` column headers to identify the **Composite Primary Key** that uniquely identifies every row. Success triggers `triggerSuccessState()`.

### 5.8 Cell Editing Controls

| Control | Action |
| :--- | :--- |
| Click a cell | Enter edit mode |
| `Enter` key | Save edit (triggers `editCell()` via blur) |
| `Escape` key | Revert to original value (stored in `originalCellValue`) |
| `[DEL]` button | Remove the entire row |

### 5.9 Phase 2: Post-Normalization (Tabbed Interface)

Once normalization is achieved (`isUnlocked = true`), the tablet reveals a 3-tab navigation system, transitioning from a repair utility to an analytical forensic tool.

**1. DATABASE Tab**: 
- The existing interface. 
- Becomes read-only (editing disabled).
- Displays the **Decrypted Case File** panel (Suspect Profile Cards).

**2. CROSS-REFERENCE Tab**:
- Educational purpose: Demonstrates the power of normalized, atomic data by enabling precise SQL-like filtering.
- Inputs: Suspect dropdown & Free-text keyword location.
- **Contradiction Engine**: If the query involves `Piano` and returns the `System Registry` entry, AND the user queries `Butler` showing he lacks a Piano alibi, the system displays a narrative `⚠ CONTRADICTION DETECTED` alert.

**3. FILE ACCUSATION Tab**:
- Narrative purpose: Gives the technical work a real-world consequence.
- Gated behind: The user must run at least one query in the Cross-Reference tab (`Detective_os_queries > 0`).
- Generates an auto-summary of suspect alibis, highlighting contradictions.
- Allows the user to select a suspect and submit an accusation.
- Posts a `message` to the parent window: `{ type: 'accusation_filed', suspect: 'Leduc (Butler)', correct: true }`.

### 5.10 VALIDATE Feedback Engine

A persistent **✓ VALIDATE** button exists in the database toolbar to provide real-time status checks:
- **Step 1 (Atomicity)**: Returns a bulleted list of all rows that still contain commas.
- **Step 1 Passed**: Confirms atomicity and instructs the user to select headers for the composite key.
- **Step 2 (Keys)**: Displays currently selected headers and alerts if the composite key is incomplete.
- **Fully Validated**: Confirms full 1NF compliance and directs the user to the analytical tabs.
