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
        max-width: 800px;
        background: rgba(15, 10, 15, 0.95);
        border: 2px solid #c8860a;
        border-radius: 12px;
        padding: 20px;
        color: #eee;
        font-family: 'Segoe UI', sans-serif;
        font-size: 16px;
        z-index: 900;
        cursor: pointer;
        user-select: none;
        box-shadow: 0 10px 30px rgba(0,0,0,0.8);
        display: flex;
        gap: 20px;
        align-items: flex-start;
    `;

    const portraitContainer = document.createElement("div");
    const portraitImg = document.createElement("img");
    portraitImg.style.cssText = `
        width: 100px;
        height: 100px;
        border-radius: 8px;
        object-fit: cover;
        border: 2px solid #c8860a;
        box-shadow: 0 0 15px rgba(0,0,0,0.7);
        display: none;
    `;
    portraitContainer.appendChild(portraitImg);

    const contentContainer = document.createElement("div");
    contentContainer.style.cssText = `
        flex: 1;
        display: flex;
        flex-direction: column;
    `;

    const speakerEl = document.createElement("div");
    speakerEl.id = "dialog-speaker";
    speakerEl.style.cssText = `
        font-weight: bold;
        font-size: 14px;
        color: #c8860a;
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

    contentContainer.appendChild(speakerEl);
    contentContainer.appendChild(textEl);
    contentContainer.appendChild(hintEl);
    contentContainer.appendChild(optionsEl);

    dialogBox.appendChild(portraitContainer);
    dialogBox.appendChild(contentContainer);
    container.appendChild(dialogBox);

    // --- Render current state ---
    function render() {
        const dialog = roomDialogs[currentDialogIndex];
        if (!dialog) {
            closeDialog();
            return;
        }

        speakerEl.textContent = dialog.speaker;
        
        // Handle Portrait Mapping
        const name = dialog.speaker.toLowerCase();
        let portraitSrc = "";
        if (name.includes("dekoning")) portraitSrc = "../../assets/images/characters/detective.png";
        else if (name.includes("leduc") || name.includes("butler")) portraitSrc = "../../assets/images/characters/butler.png";
        else if (name.includes("thomas")) portraitSrc = "../../assets/images/characters/thomas.png";
        else if (name.includes("beatrix") || name.includes("lemur")) portraitSrc = "../../assets/images/characters/beatrix.png";

        if (portraitSrc) {
            portraitImg.src = portraitSrc;
            portraitImg.style.display = "block";
        } else {
            portraitImg.style.display = "none";
        }

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
        } else if (action && action.startsWith("addItem:")) {
            const itemId = action.split(":")[1];
            if (window.Inventory) {
                window.Inventory.addItem(itemId);
            }
            moveToNextDialog();
        } else if (action && action.startsWith("goTo:")) {
            const url = action.split(":")[1];
            if (window.goToLocation) {
                window.goToLocation(url);
            } else {
                window.location.href = url;
            }
            moveToNextDialog();
        }
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
