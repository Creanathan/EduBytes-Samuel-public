/**
 * Dialog Engine - Dynamic click-to-advance dialog renderer
 * Reads from the global DIALOGS object (dialogs.js must be loaded first).
 *
 * Usage: Each room HTML just needs:
 *   <div id="dialog-container"></div>
 *   <script src="../../js/data/dialogs.js"></script>
 *   <script src="../../js/components/dialog.js"></script>
 *
 * The engine auto-detects the current room from the filename.
 */

(function () {
    // --- Detect current room from URL ---
    const path = window.location.pathname;
    const filename = path.substring(path.lastIndexOf("/") + 1).replace(".html", "");
    const roomDialogs = DIALOGS[filename] || [];

    if (roomDialogs.length === 0) return; // No dialogs for this room

    // --- State ---
    let currentDialogIndex = 0;   // Which dialog block we're on
    let currentLineIndex = 0;     // Which line within that block

    // --- DOM Setup ---
    const container = document.getElementById("dialog-container");
    if (!container) return;

    // Build the dialog box
    const dialogBox = document.createElement("div");
    dialogBox.id = "dialog-box";
    dialogBox.style.cssText = `
        position: fixed;
        bottom: 60px;
        left: 50%;
        transform: translateX(-50%);
        width: 80%;
        max-width: 700px;
        background: rgba(30, 30, 40, 0.95);
        border: 2px solid #555;
        border-radius: 8px;
        padding: 20px;
        color: #eee;
        font-family: 'Segoe UI', sans-serif;
        font-size: 16px;
        z-index: 900;
        cursor: pointer;
        user-select: none;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    `;

    const speakerEl = document.createElement("div");
    speakerEl.id = "dialog-speaker";
    speakerEl.style.cssText = `
        font-weight: bold;
        font-size: 14px;
        color: #aaa;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 1px;
    `;

    const textEl = document.createElement("div");
    textEl.id = "dialog-text";
    textEl.style.cssText = `
        line-height: 1.6;
        min-height: 40px;
    `;

    const hintEl = document.createElement("div");
    hintEl.id = "dialog-hint";
    hintEl.style.cssText = `
        text-align: right;
        font-size: 11px;
        color: rgba(255,255,255,0.35);
        margin-top: 10px;
        letter-spacing: 1px;
        text-transform: uppercase;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
    `;

    hintEl.appendChild(document.createTextNode("Click to continue"));

    const optionsEl = document.createElement("div");
    optionsEl.id = "dialog-options";
    optionsEl.style.cssText = `
        margin-top: 12px;
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    `;

    dialogBox.appendChild(speakerEl);
    dialogBox.appendChild(textEl);
    dialogBox.appendChild(hintEl);
    dialogBox.appendChild(optionsEl);
    container.appendChild(dialogBox);

    // --- Render current state ---
    function render() {
        const dialog = roomDialogs[currentDialogIndex];
        if (!dialog) {
            closeDialog();
            return;
        }

        speakerEl.textContent = dialog.speaker;
        optionsEl.innerHTML = "";

        if (currentLineIndex < dialog.lines.length) {
            // Still showing lines — click to advance
            textEl.textContent = dialog.lines[currentLineIndex];
            hintEl.style.display = "block";
        } else {
            // All lines shown — show options or auto-close
            hintEl.style.display = "none";

            if (dialog.options && dialog.options.length > 0) {
                dialog.options.forEach(opt => {
                    const btn = document.createElement("button");
                    btn.textContent = opt.label;
                    btn.style.cssText = `
                        padding: 8px 16px;
                        background: #444;
                        color: #eee;
                        border: 1px solid #666;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                    `;
                    btn.addEventListener("mouseenter", () => btn.style.background = "#555");
                    btn.addEventListener("mouseleave", () => btn.style.background = "#444");
                    btn.addEventListener("click", (e) => {
                        e.stopPropagation();
                        handleOption(opt.action);
                    });
                    optionsEl.appendChild(btn);
                });
            } else {
                // No options defined — move to next dialog or close
                moveToNextDialog();
            }
        }
    }

    function handleOption(action) {
        if (action === "exit") {
            moveToNextDialog();
        }
        // Future actions can be added here (e.g., "unlock_door", "give_item")
    }

    function moveToNextDialog() {
        currentDialogIndex++;
        currentLineIndex = 0;

        if (currentDialogIndex >= roomDialogs.length) {
            closeDialog();
        } else {
            render();
        }
    }

    function closeDialog() {
        dialogBox.style.display = "none";
    }

    // --- Click to advance lines ---
    dialogBox.addEventListener("click", () => {
        const dialog = roomDialogs[currentDialogIndex];
        if (!dialog) return;

        if (currentLineIndex < dialog.lines.length) {
            currentLineIndex++;
            render();
        }
    });

    // --- Start ---
    render();

    // --- Global Interface for interaction triggers ---
    window.showInteraction = (key) => {
        const interaction = DIALOGS.interactions[key];
        if (!interaction) {
            console.error("No interaction found for key:", key);
            return;
        }

        // Setup the new dialog content (temporary override or separate system)
        // For simplicity, we just 'inject' it as a one-off roomDialogs entry
        const originalRoomDialogs = [...roomDialogs];
        const originalIndex = currentDialogIndex;
        const originalLine = currentLineIndex;

        // Reset and play this specific interaction
        // Note: For a true game engine, we'd handle this more robustly, 
        // but this fits the "simple and scalable" request.
        
        // We override the current room's dialogs temporarily
        roomDialogs.length = 0;
        roomDialogs.push(interaction);
        currentDialogIndex = 0;
        currentLineIndex = 0;
        dialogBox.style.display = "block";
        render();

        // Restore room dialogs after this one is closed? 
        // Or just let it be. Let's keep it simple: interaction replaces current queue.
    };
})();
