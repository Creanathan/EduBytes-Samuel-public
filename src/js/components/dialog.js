/**
 * Dialog Engine - Dynamic click-to-advance dialog renderer
 * Reads from the global DIALOGS object (dialogs.js must be loaded first).
 * Supports: setFlag, addItem, goTo, showBtn actions (pipe-separated).
 * Supports: conditional interaction variants based on GameState flags.
 */

(function () {
    // --- Detect current room from URL ---
    const path = window.location.pathname;
    const filename = path.substring(path.lastIndexOf("/") + 1).replace(".html", "");
    const roomDialogs = DIALOGS[filename] || [];

    // --- State ---
    let currentDialogIndex = 0;
    let currentLineIndex = 0;

    // --- DOM Setup ---
    const container = document.getElementById("dialog-container");
    if (!container) return;

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
        display: none;
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
    contentContainer.style.cssText = `flex: 1; display: flex; flex-direction: column;`;

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
    textEl.style.cssText = `line-height: 1.6; min-height: 40px;`;

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
    optionsEl.style.cssText = `margin-top: 12px; display: flex; gap: 10px; flex-wrap: wrap;`;

    contentContainer.appendChild(speakerEl);
    contentContainer.appendChild(textEl);
    contentContainer.appendChild(hintEl);
    contentContainer.appendChild(optionsEl);
    dialogBox.appendChild(portraitContainer);
    dialogBox.appendChild(contentContainer);
    container.appendChild(dialogBox);

    function render() {
        const dialog = roomDialogs[currentDialogIndex];
        if (!dialog) { closeDialog(); return; }

        speakerEl.textContent = dialog.speaker;

        // Portrait mapping
        const name = dialog.speaker.toLowerCase();
        let portraitSrc = "";
        if (name.includes("dekoning")) portraitSrc = "../../assets/images/characters/detective.png";
        else if (name.includes("leduc") || name.includes("butler")) portraitSrc = "../../assets/images/characters/butler.png";
        else if (name.includes("thomas")) portraitSrc = "../../assets/images/characters/thomas.png";
        else if (name.includes("beatrix") || name.includes("lemur")) portraitSrc = "../../assets/images/characters/beatrix.png";

        portraitImg.style.display = portraitSrc ? "block" : "none";
        if (portraitSrc) portraitImg.src = portraitSrc;

        optionsEl.innerHTML = "";

        if (currentLineIndex < dialog.lines.length) {
            textEl.textContent = dialog.lines[currentLineIndex];
            hintEl.style.display = "block";
        } else {
            hintEl.style.display = "none";
            if (dialog.options && dialog.options.length > 0) {
                dialog.options.forEach(opt => {
                    const btn = document.createElement("button");
                    btn.textContent = opt.label;
                    btn.style.cssText = `
                        padding: 8px 16px; background: #444; color: #eee;
                        border: 1px solid #666; border-radius: 4px;
                        cursor: pointer; font-size: 14px;
                    `;
                    btn.addEventListener("mouseenter", () => btn.style.background = "#555");
                    btn.addEventListener("mouseleave", () => btn.style.background = "#444");
                    btn.addEventListener("click", (e) => { e.stopPropagation(); handleOption(opt.action); });
                    optionsEl.appendChild(btn);
                });
            } else {
                moveToNextDialog();
            }
        }
    }

    // Supports pipe-separated multi-actions: "setFlag:X|showBtn:btn-top|exit"
    function handleOption(action) {
        if (!action) { moveToNextDialog(); return; }
        const parts = action.split("|");
        let navigating = false;

        parts.forEach(part => {
            part = part.trim();
            if (part === "exit") {
                // fall through to advance
            } else if (part === "close") {
                // Immediately close dialog, skip any remaining queued steps
                navigating = true;
                closeDialog();
                // Clear remaining steps so closing is permanent
                roomDialogs.length = 0;
            } else if (part.startsWith("setFlag:")) {
                const flag = part.split(":").slice(1).join(":");
                if (window.GameState) window.GameState.setFlag(flag);
            } else if (part.startsWith("addItem:")) {
                const itemId = part.split(":")[1];
                if (window.Inventory) window.Inventory.addItem(itemId);
            } else if (part.startsWith("goTo:")) {
                navigating = true;
                const url = part.split(":")[1];
                if (window.EduBytesNavigation && typeof window.EduBytesNavigation.allowRoomNavigation === 'function') {
                    window.EduBytesNavigation.allowRoomNavigation(url);
                }
                if (window.goToLocation) window.goToLocation(url);
                else window.location.href = url;
            } else if (part.startsWith("showBtn:")) {
                const btnId = part.split(":")[1];
                const btn = document.getElementById(btnId);
                if (btn) {
                    btn.style.display = "flex";
                    // Small delay to ensure display:flex is applied before opacity transition starts
                    setTimeout(() => btn.classList.add('visible'), 50);
                }
            } else if (part.startsWith("setBackground:")) {
                const imgPath = part.split(":").slice(1).join(":");
                const bg = document.querySelector(".room-background");
                if (bg) bg.style.backgroundImage = `url('${imgPath}')`;
            } else if (part.startsWith("hideObj:")) {
                const objId = part.split(":")[1];
                const obj = document.getElementById(objId);
                if (obj) obj.style.display = "none";
            } else if (part.startsWith("playSound:")) {
                const soundType = part.split(":")[1];
                if (window.AudioEngine && window.AudioEngine.play) {
                    window.AudioEngine.play(soundType);
                }
            }
        });

        if (!navigating) moveToNextDialog();
    }

    function moveToNextDialog() {
        currentDialogIndex++;
        currentLineIndex = 0;
        if (currentDialogIndex >= roomDialogs.length) closeDialog();
        else render();
    }

    function closeDialog() {
        dialogBox.style.display = "none";
    }

    dialogBox.addEventListener("click", () => {
        const dialog = roomDialogs[currentDialogIndex];
        if (!dialog) return;
        if (currentLineIndex < dialog.lines.length) {
            currentLineIndex++;
            render();
        }
    });

    if (roomDialogs.length > 0) {
        dialogBox.style.display = "block";
        render();
    }

    // Global showInteraction — supports conditional arrays
    window.showInteraction = (key) => {
        const interactionData = DIALOGS.interactions[key];
        if (!interactionData) { console.error("No interaction found for key:", key); return; }

        let interaction;
        if (Array.isArray(interactionData)) {
            interaction = interactionData.find(variant => {
                if (!variant.condition) return true;
                try {
                    return (new Function("GameState", "Inventory", "return !!(" + variant.condition + ")"))(window.GameState, window.Inventory);
                } catch(e) { return false; }
            });
        } else {
            interaction = interactionData;
        }

        if (!interaction) { console.warn("No matching condition for interaction:", key); return; }

        // Support multi-step sequences via 'steps' property
        roomDialogs.length = 0;
        if (interaction.steps && Array.isArray(interaction.steps)) {
            interaction.steps.forEach(s => roomDialogs.push(s));
        } else {
            roomDialogs.push(interaction);
        }
        currentDialogIndex = 0;
        currentLineIndex = 0;
        dialogBox.style.display = "block";
        render();
    };
})();
