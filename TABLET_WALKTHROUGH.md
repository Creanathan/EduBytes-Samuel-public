# Detective Tablet — Player Walkthrough & User Manual

This document describes the successful path through the Detective Tablet's 1NF normalization puzzle, including step-by-step instructions, what the player sees at each stage, hints when stuck, and tips for future development.

---

## Overview

The Detective Tablet is a forensic analysis tool found inside the player's **Inventory**. Once a USB stick is collected from the Bureau (Crime Scene), the player can import corrupted witness testimony data and must fix it using **First Normal Form (1NF)** database rules to reveal hidden suspect identities and a critical narrative clue.

---

## Successful Path — Step by Step

### Stage 1 — Collect the USB Stick

**Location**: Crime Scene / Bureau desk  
**Action**: Interact with the USB stick to collect it.  
**Result**: Item `usb_stick` is added to Inventory.

> **If stuck**: The USB is on the desk in the Bureau close-up. It requires one interaction click to pick up. It will appear in your Inventory (💼 bottom-right).

---

### Stage 2 — Open the Detective Tablet

**Action**: Click the 💼 Inventory button (bottom-right corner of the game screen).  
**Action**: In the Inventory drawer, click on the **Detective Tablet** tool.  
**Result**: The tablet opens in a panel/modal showing the Detective OS interface.

---

### Stage 3 — Import Screen (USB Detected)

**What you see**: A dark setup screen with:
- Icon: 💾
- Title: **"Encrypted USB Detected"**
- Text: "Encrypted drive found in port. Manual decryption and import required..."
- Button: **"DECRYPT & IMPORT"**

**Action**: Click **"DECRYPT & IMPORT"**.

> **If stuck**: Make sure you have the USB stick in your Inventory first. If you see "No Data Source Detected" instead, go back to the Crime Scene and collect the USB.

---

### Stage 4 — Loading Screen

**What you see**: An animated loading bar filling from 0% to 100% with the label:  
`Loading data clusters... XX%`

**Action**: Wait. This completes automatically (approx. 3 seconds).

---

### Stage 5 — System Halt (Crash Screen)

**What you see**: A red screen with:
- Icon: ☠
- Title: **"SYSTEM HALT"**
- Error: `CRITICAL_STRUCTURAL_ERROR: The imported database has failed validation due to non-atomic data mapping (Normalization Fault).`
- Button: **"REPAIR DATABASE"** (red)

**Action**: Click **"REPAIR DATABASE"**.

> **What this means**: The police interview database on the USB is corrupted — it doesn't follow the rules of a proper database. You need to fix it manually before you can read the information.

---

### Stage 6 — Repair Interface (Main Puzzle)

**What you see**: The main database table with:
- A red error banner at the top: **"1NF Integrity Fault"**
- A table with 5 rows
- All **Subject** cells showing: `[REDACTED]`
- Some **Observation** cells showing red ⚠ warnings (these are the corrupt cells)
- Controls: SEARCH bar, `+ ADD ROW` button
- Header buttons: **REIMPORT** (red, top right) and **HOW TO FIX** (in the error banner)

**The corrupt data looks like this:**

| Log_ID | Subject | Observation |
|--------|---------|-------------|
| #001 | [REDACTED] | ⚠ Hallway, Kitchen, Dining Room. Claims he was prepping tea. |
| #002 | [REDACTED] | ⚠ Nursery, Laundry. Claims she was washing the cradle linens. |
| #003 | [REDACTED] | Living Room. Claims he was playing piano to calm his nerves. |
| #004 | [REDACTED] | Crime Scene. Found the body at 22:00. |
| #005 | [REDACTED] | Piano (ERR_DATA_BLOCK_772: HIDDEN_RESTRICTED) |

> **Tip**: Click **"HOW TO FIX"** to open the Forensic Database Manual for guidance.

---

### Stage 7 — Step 1: Fixing Atomicity (Removing Commas)

**The Problem**: Rows #001 and #002 have multiple locations in one cell (separated by commas). A proper 1NF database requires that each cell contains exactly **one piece of information**.

**The Goal**: Split every multi-value cell into separate rows.

#### Solution for Row #001 (Butler's Report):

The original cell says:  
`Hallway, Kitchen, Dining Room. Claims he was prepping tea.`

You need to turn this into **3 separate rows**, each with a single location:

| Log_ID | Observation |
|--------|-------------|
| #001 | Hallway. Claims he was prepping tea. |
| #001 | Kitchen. Claims he was prepping tea. |
| #001 | Dining Room. Claims he was prepping tea. |

**How to do it**:
1. Click on the Observation cell in row #001.
2. Edit the text to only say `Hallway. Claims he was prepping tea.` and press **Enter**.
3. Click **+ ADD ROW** to create a new row.
4. Edit the new row's Log_ID to `#001` and its Observation to `Kitchen. Claims he was prepping tea.`
5. Click **+ ADD ROW** again.
6. Edit the new row's Log_ID to `#001` and Observation to `Dining Room. Claims he was prepping tea.`

#### Solution for Row #002 (Nanny's Report):

The original cell says:  
`Nursery, Laundry. Claims she was washing the cradle linens.`

Turn this into **2 rows**:

| Log_ID | Observation |
|--------|-------------|
| #002 | Nursery. Claims she was washing the cradle linens. |
| #002 | Laundry. Claims she was washing the cradle linens. |

**How to do it**:
1. Click the Observation cell in row #002 and edit it to `Nursery. Claims she was washing the cradle linens.` → press **Enter**.
2. Click **+ ADD ROW**, set Log_ID to `#002` and Observation to `Laundry. Claims she was washing the cradle linens.`

> **Hint**: The ⚠ red warning on a cell means it contains a comma. Your goal is to have **zero** red cells. Once all commas are removed, the puzzle advances automatically.

> **Made a mistake?** Click **REIMPORT** in the header (red button) to restore the original corrupted data and try again from scratch.

> **Keyboard shortcuts**:
> - **Enter** — Save your cell edit
> - **Esc** — Cancel and revert a cell edit
> - **[DEL]** button — Delete an entire row

---

### Stage 8 — Step 2: Assigning Composite Keys

**What changes**: Once all commas are removed, the error banner message changes to:  
**"Entity Integrity Violation"** — "Individual Log_IDs are no longer unique..."

The column headers **Log_ID**, **Subject**, and **Observation** start pulsing/glowing, indicating they are now clickable.

**The Problem**: After splitting rows #001 and #002, there are now multiple rows with the same Log_ID (e.g., three rows all with `#001`). A database needs a way to **uniquely identify** every row.

**The Solution**: A **Composite Primary Key** — a combination of two columns that together uniquely identifies each row. In this database, that is `Log_ID + Observation`.

**How to do it**:
1. Click the **Log_ID** column header → it should highlight in amber with a 🔑 icon.
2. Click the **Observation** column header → it should highlight in amber with a 🔑 icon.
3. Both headers selected = correct composite key.

> **Hint**: Think about it — if you know both the Log_ID (#001) AND the Observation (Hallway vs Kitchen vs Dining Room), you can find exactly one row. That's why they form the key together.

> **Don't click Subject** — Subject is [REDACTED] and not part of the key.

---

### Stage 9 — Success! (Normalization Complete)

**What happens**:
- A green **"Database Normalized"** banner appears.
- The table glows green.
- **Subject column is decrypted** — `[REDACTED]` is replaced with real names.
- The **Tab Bar** appears at the top: `DATABASE`, `CROSS-REFERENCE`, and `FILE ACCUSATION`.
- A **Case File: Suspect Profiles** section appears below the table, grouping the decrypted observations cleanly by suspect.

> **Note**: The puzzle is solved, but the investigation isn't over. You now have clean, atomic data. It's time to use it to find the killer.

**Action**: Click the **CROSS-REFERENCE** tab at the top.

---

### Stage 10 — Cross-Reference Analysis

**What you see**: A forensic query tool that lets you filter the newly normalized database by suspect and keyword.

**The Goal**: Find contradictions in the suspects' alibis.

**How to do it**:
1. Select **Leduc (Butler)** from the suspect dropdown.
2. The results show his alibi: he was in the Hallway, Kitchen, and Dining Room. He never mentions the Piano.
3. In the keyword box, type `Piano` and hit **ANALYZE**.
4. The results show a **System Registry** entry: *"Piano (UNSUCCESSFUL: Butler hid the key?)"*.
5. A **⚠ CONTRADICTION DETECTED** alert appears, explaining that Butler's alibi conflicts with the system log.

> **Why this matters**: This proves the power of database normalization. Before you fixed the commas, searching for "Piano" would have been inaccurate or impossible. Now, every query is precise.

**Action**: Once you've run at least one query and found the contradiction, click the **FILE ACCUSATION** tab.

---

### Stage 11 — Filing the Accusation

**What you see**: An investigation summary showing which suspects have clean alibis and which have contradictions. 

**How to do it**:
1. Review the summary: Leduc (Butler) is flagged with a red `!` for a contradiction.
2. Click the **Leduc (Butler)** button to select him as the primary suspect.
3. Click the red **⚖ SUBMIT ACCUSATION** button.
4. A green **"✓ ACCUSATION FILED"** confirmation appears. The system formally logs your findings.

**Action**: Click **"Close Tablet & Confront Suspect"** and head to the Living Room to investigate the Piano.

## Hints for Stuck Players

### "I don't see any corrupt cells"
→ All your Observation cells may already be atomic (no commas). You are probably on **Step 2** — check if the column headers are clickable/pulsing. Click **Log_ID** then **Observation** to complete the key assignment.

### "I clicked a header but nothing happened"
→ You are probably still on **Step 1** (there are still commas in cells). Look for any remaining ⚠ red cells and fix them first.

### "I deleted the wrong row and can't recover"
→ Click **REIMPORT** (red button, top header). Confirm. This restores the original database exactly as it was on the USB, discarding all your edits.

### "The table is empty after REIMPORT"
→ This should not happen with the current fix. If it does, close and reopen the tablet — it will reload the restored data from localStorage.

### "I can't find the USB stick"
→ It is in the **Bureau** (Crime Scene room). Look on the desk in the close-up view. Click once to collect.

### "The REIMPORT button is not visible"
→ The REIMPORT button only appears after you have successfully imported data. If you see the setup screen, you haven't imported yet.

### "The Subject column still shows [REDACTED] after I selected both keys"
→ Make sure you selected **exactly 2 keys**: `Log_ID` and `Observation`. Deselect any others by clicking them again. The selection must be precisely those two — no more, no less.

### "I can't open the FILE ACCUSATION tab"
→ The accusation panel is locked until you actually use the database you just fixed. Go to the **CROSS-REFERENCE** tab and run at least one query (e.g., search for "Piano") to unlock it.

### "I filed an accusation against the wrong person"
→ The system logs all accusations, but if you select the wrong suspect, it will tell you the forensic data doesn't support your conclusion. You cannot change your accusation once filed, but you can still close the tablet and investigate the Piano.

---

## Quick Reference Card

| Action | How |
|--------|-----|
| Open Tablet | 💼 Inventory → Detective Tablet |
| Import USB data | Click "DECRYPT & IMPORT" |
| Start repair | Click "REPAIR DATABASE" on crash screen |
| Edit a cell | Click it, type, press Enter |
| Cancel an edit | Press Esc |
| Delete a row | Click [DEL] button on that row |
| Add a new row | Click "+ ADD ROW" |
| Reset all edits | Click REIMPORT (red, top header) |
| Open manual | Click "HOW TO FIX" in error banner |
| Close tablet | Click EXIT or press Esc |

---

## What the Tablet Teaches

| Concept | How it's demonstrated |
|---------|----------------------|
| **Atomicity** | Comma-separated values in one cell must be split into individual rows |
| **Non-atomic data = search failure** | Searching "Hallway" finds nothing when the cell says "Hallway, Kitchen" |
| **Atomic data = searchable** | After splitting, searching "Hallway" finds exactly one row |
| **Composite Primary Key** | Log_ID alone repeats after splitting; Log_ID + Observation uniquely identifies each row |
| **Reward for normalization** | Hidden identities [REDACTED] are decrypted only after 1NF compliance |
| **Power of precise queries** | The Cross-Reference tool only works properly *because* the data is atomic |
| **Data integrity** | Finding contradictions between alibis and system logs using filtered queries |
