# Project Structure — NormaLIES

This document outlines the standard directory structure for the NormaLIES project. Developers should adhere to this structure to maintain consistency and ensure that path-dependent services (like the Routing Guard and Dialog Engine) function correctly.

## Root Directory
- `index.html`: The game's entry point (Start Screen). Handles initial session checks and global navigation.
- `MASTER_PLAN.md`: The high-level roadmap and current development status.
- `PROJECT_STRUCTURE.md`: (This file) Overview of the folder hierarchy.
- `DEVELOPER_GUIDE.md`: Technical documentation, security practices, and implementation rules.

## /src — Source Code
The core of the application.

### /src/rooms
Contains all playable room files.
- `outside.html`, `hallway.html`, etc.
- `/snippets`: HTML fragments for interactive objects or dynamic content (e.g., `hallway_interactable_texts.html`).

### /src/js — JavaScript Logic
- `/core`: Essential game services. Must be loaded in order.
    - `gamestate.js`: Persistence and flag management.
    - `routing.js`: Security and navigation guard.
    - `inventory.js`: Item collection and management.
    - `responsive.js`: Scaling and ambient background generation.
- `/components`: UI and interaction logic.
    - `dialog.js`: The narrative engine.
    - `movement.js`: Navigation button logic.
    - `tablet_widget.js`: In-game tablet UI.
    - `game_menu.js`: Main escape/settings menu.
- `/data`: Static data stores.
    - `dialogs.js`: The master interaction database.

### /src/css — Styling
- `rooms.css`: Core layout and interactive styling for all rooms.
- `start.css`: Dedicated styling for the main menu.
- `tablet.css`: Styling for the police tablet interface.

### /src/assets — Multimedia
- `/rooms`: Background images for the investigation.
- `/images`: UI icons and character portraits.
- `/audio`: Sound effects and background tracks.

### /src/ui_templates
Reusable HTML components for consistent UI rendering across different rooms.
