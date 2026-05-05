# Educational Mechanic: 1NF Normalization

This document outlines the implementation of the **First Normal Form (1NF)** educational mechanic within the *EduBytes* Noir detective game.

## 1. Core Concept
In *EduBytes*, database normalization is presented as a **forensic data recovery** tool. Players do not just "solve a puzzle"; they are reconstructing messy police logs to find hidden investigative leads.

## 2. The 1NF Rule: Atomicity
The game focuses on the first rule of normalization: **Each cell must contain a single, unique (atomic) value.**
*   **The Problem**: Multiple room names (e.g., "Nursery, Living Room") are crammed into a single cell.
*   **The Solution**: The player must split these entries into separate, atomic rows to secure the database integrity.

## 3. Narrative Integration (Chapter 1)

The mechanic is integrated into the story through a logical character-driven loop:

1.  **The Breadcrumb (Hallway)**:
    The Butler (Leduc) complains about the sloppy police work and mentions that **Thomas** took the messy registries to the living room.
2.  **The Giver (Living Room)**:
    **Thomas** hands you the police tablet, asking you to fix the data so they can find out what the local police missed.
    *   *Mechanism: Sets flag `tablet_found`.*
3.  **The Puzzle (Tablet - Police OS)**:
    The player must perform a two-step normalization:
    *   **Phase 1**: Achieve Atomicity (Split rows).
    *   **Phase 2**: Assign Composite Primary Key (Log ID + Searched Room).
4.  **The Benefit (Search Engine)**:
    The player can now use the **Search Bar**. Searching for "Piano" (which failed before normalization) now reveals:
    > **Log #005**: *"Silver Key detected missing from Living Room Piano. Subject B. Lemur (Nanny) identified nearby."*
    *   *Mechanism: Sets flag `database_normalized`.*
5.  **The Confrontation (Nursery)**:
    The detective now has the information to ask **Beatrix (The Nanny)** about her location. He points out that while she claimed to be in the Nursery (`Log #002`), the forensic log (`Log #005`) places her at the Piano. She admits to "securing" the key and hands it over.
    *   *Mechanism: Sets flag `has_nannys_key`.*

## 4. Technical Details

### Game Flags
*   `tablet_found`: Set when Thomas gives the tablet to the player.
*   `database_normalized`: Set when the 1NF puzzle and Key Assignment are solved.
*   `has_nannys_key`: Set when the Nanny gives the key after being confronted with the tablet data.

## 5. Content Attribution

To maintain project integrity, the codebase distinguishes between original design content and AI-integrated mechanics:

*   **[DESIGNER]**: Original narrative text, character personalities, and location settings provided in the initial design documents.
*   **[AI - ANTIGRAVITY]**: Forensic normalization logic (Atomicity + Keys), the Query/Search simulation, and the character-driven investigative flow.

Specific AI-added content includes:
*   Tablet Query Engine: Real-time search feedback demonstrating 1NF benefits.
*   Thomas/Nanny Hand-off: The refined logic of obtaining the tablet and key.
*   Nanny's Room: High-fidelity "Discovery" interactions (Window, Bed, Dresser, Cabinet).



