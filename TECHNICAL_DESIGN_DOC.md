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
*   **Mirror**: "Maybe I should’ve shaved."
*   **Clock**: "An old Howard Millar grandfather clock."
*   **Butler (Leduc)**: Conditional greeting (4 states: First meeting, Delayed decision, Ready to go, Post-visit).

### Living Room Objects
*   **Piano**: 
    *   *Default*: "I shouldn’t waste any time playing a tune..."
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
*   **Body**: Investigate Amelia’s physical state (Discoloration clue).
*   **Broken Glass**: Evidence of the residue.
*   **Detective Tablet**: Entry point for the 1NF puzzle.

---

## 3. UI Navigation Logic

*   **Left (Hallway)**: Living Room.
*   **Right (Hallway)**: Nursery.
*   **Up (Hallway)**: Crime Scene (Locked by `crime_scene_unlocked`).
*   **Down (Hallway)**: Outside.
*   **Up (Living Room)**: Nanny's Room (Locked by `has_nannys_key`).
