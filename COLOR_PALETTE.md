# EduBytes - Color Scheme & Design System

This document outlines the official color palette and design principles for the "EduBytes" Noir Detective game. All new components and UI elements should adhere to these specifications to maintain a consistent, premium aesthetic.

## The "Modern Noir" Palette

The visual identity of the project is built on high-contrast, moody tones with warm metallic accents, reflecting the grit and sophistication of a classic detective mystery.

### 1. Primary Neutrals (The Shadows)

Used for backgrounds, deep shadows, and core UI surfaces.

| Color | HEX | Usage |
| :--- | :--- | :--- |
| **Deep Void** | `#000000` | Global page background, absolute shadows. |
| **Obsidian** | `#0a0a0f` | UI container backgrounds, modal surfaces, button bases. |
| **Graphite** | `#1e1e28` | Secondary UI elements, hover states, border backgrounds. |

### 2. Accent Colors (The Light)

Used for interactive elements, highlights, and important narrative cues.

| Color | HEX | Usage |
| :--- | :--- | :--- |
| **Vintage Gold** | `#c8860a` | **Primary Accent.** Borders, icons, speaker names, active states. |
| **Muted Ivory** | `#e8dcc8` | Primary text color, readable labels, soft highlights. |
| **Detective White** | `#ffffff` | Pure highlights, hover text, critical information. |

### 3. Functional Colors (System Status)

Used for warnings, interactive indicators, and specialized UI states.

| Color | HEX | Usage |
| :--- | :--- | :--- |
| **Blood Red** | `#e74c3c` | Danger actions (Restart), notifications, high-priority warnings. |
| **Dimmed Red** | `#c0392b` | Hover states for danger actions, background tints for errors. |

---

## UI Components & Visual Styles

### Glassmorphism & Depth
Most UI elements (Menu, Tablet, Dialogs) should utilize a "Glassmorphic" look to feel integrated into the 3D space:
- **Background**: `rgba(10, 10, 15, 0.85)` to `0.95`.
- **Backdrop Filter**: `blur(8px)` to `16px`.
- **Borders**: Thin (1px - 2px) semi-transparent borders using **Vintage Gold** (`rgba(200, 134, 10, 0.3)`).

### Typography
- **Primary Font**: `'Segoe UI'`, Tahoma, Geneva, Verdana, sans-serif.
- **Narrative Text**: Clean, sans-serif with generous line-height (`1.6`).
- **Headings**: Uppercase, tracked out (`letter-spacing: 4px`) to evoke a cinematic title feel.

### Atmospheric Effects
- **Vignette**: A radial gradient from transparent to `rgba(0,0,0,0.6)` is applied to all room backgrounds.
- **Ambient Blur**: Letterboxing/Pillarboxing is filled with a blurred (`60px`) and darkened (`brightness: 0.35`) version of the active room background.

---

*Note: When implementing colors in CSS, prefer using the specific RGBA values defined in `rooms.css` and `game_menu.js` to ensure proper transparency and layering.*
