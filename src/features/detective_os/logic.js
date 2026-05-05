/**
 * Detective OS Logic - 1NF Normalization Puzzle
 * Developer: Detective Louis Dekoning (In-Lore)
 */

// Initial "Dirty" database (Narrative Witness Reports)
const DEFAULT_DATA = [
    { log_id: "#001", subject: "Leduc (Butler)", observation: "Hallway, Kitchen, Dining Room. Claims he was prepping tea." },
    { log_id: "#002", subject: "Beatrix (Nanny)", observation: "Nursery, Laundry. Claims she was washing the cradle linens." },
    { log_id: "#003", subject: "Thomas (Partner)", observation: "Living Room. Claims he was playing piano to calm his nerves." },
    { log_id: "#004", subject: "Off. Miller", observation: "Crime Scene. Found the body at 22:00." },
    // [AI - ANTIGRAVITY] - Alibi contradiction hidden by 1NF violations
    { log_id: "#005", subject: "System Registry", observation: "Piano (ERR_DATA_BLOCK_772: HIDDEN_RESTRICTED)" }
];

// State Variables
let DetectiveData = [];
let isUnlocked = false;
let isImported = false;
let currentStep = 1; // 1: Atomicity, 2: Primary Key
let selectedKeys = new Set();
let originalCellValue = "";

// Phase 2: Post-Unlock State
let tabState = 'database';      // 'database' | 'crossref' | 'accusation'
let crossRefQueryCount = 0;     // gates the accusation tab
let selectedSuspect = null;     // suspect being accused
let accusationFiled = false;    // whether accusation was submitted

// Load saved data
function loadState() {
    const savedData = localStorage.getItem('Detective_os_data');
    DetectiveData = savedData ? JSON.parse(savedData) : [];
    isUnlocked = localStorage.getItem('Detective_os_unlocked') === 'true';
    isImported = localStorage.getItem('Detective_os_imported') === 'true';
    
    // Determine current step based on state
    if (isUnlocked) {
        currentStep = 3; // Finished
    } else if (isImported && DetectiveData.length > 0) {
        const hasCommas = DetectiveData.some(row => row.observation.includes(","));
        currentStep = hasCommas ? 1 : 2;
    } else {
        currentStep = 1;
    }
}

// Initialize UI
document.addEventListener("DOMContentLoaded", () => {
    loadState();
    checkSetup();
    renderTable();
});

function checkInventoryLocal(id) {
    // 1. Try parent access (preferred)
    try {
        if (window.parent && window.parent.Inventory && typeof window.parent.Inventory.hasItem === 'function') {
            return window.parent.Inventory.hasItem(id);
        }
    } catch (e) {
        console.warn("[Tablet] Parent inventory access blocked (CORS). Falling back to localStorage.");
    }

    // 2. Fallback: Direct localStorage check (for local file:// testing)
    try {
        const invData = localStorage.getItem('edubytes_inventory');
        if (invData) {
            const items = JSON.parse(invData);
            return Array.isArray(items) && items.includes(id);
        }
    } catch (e) {
        console.error("[Tablet] Failed to read inventory from localStorage.");
    }
    return false;
}

function showGuide() {
    document.getElementById("guide-modal").style.display = "flex";
}

function hideGuide() {
    document.getElementById("guide-modal").style.display = "none";
}

function checkSetup() {
    const setupScreen = document.getElementById("setup-screen");
    const mainInterface = document.getElementById("main-interface");
    const importBtn = document.getElementById("import-btn");
    const reimportBtn = document.getElementById("reimport-btn-header");
    const title = document.getElementById("setup-title");
    const text = document.getElementById("setup-text");
    const icon = document.getElementById("setup-status-icon");

    // If already unlocked (normalization done), show the results directly
    if (isUnlocked) {
        setupScreen.style.display = "none";
        mainInterface.style.display = "block";
        reimportBtn.style.display = "block";
        return;
    }

    // If imported but not yet repaired, show crash screen
    if (isImported) {
        setupScreen.style.display = "none";
        document.getElementById("crash-screen").style.display = "flex";
        reimportBtn.style.display = "block";
        return;
    }

    // Show setup screen for fresh import
    setupScreen.style.display = "flex";
    reimportBtn.style.display = "none";

    // Robust item check (Parent -> LocalStorage fallback)
    const hasUSB = checkInventoryLocal('usb_stick');

    if (hasUSB) {
        icon.innerText = "\uD83D\uDCBE";
        title.innerText = "Encrypted USB Detected";
        text.innerText = "Encrypted drive found in port. Manual decryption and import required to extract the crime scene registry.";
        importBtn.innerText = "DECRYPT & IMPORT";
        importBtn.style.display = "block";
        importBtn.onclick = startImport;
    } else {
        icon.innerText = "\uD83D\uDCE1";
        title.innerText = "No Data Source Detected";
        text.innerText = "Detective OS is online but local registries are empty. Please obtain a data source (USB) to begin analysis.";
        importBtn.innerText = "RESCAN SYSTEM";
        importBtn.style.display = "block";
        importBtn.onclick = checkSetup;
    }
}

function startImport() {
    document.getElementById("setup-screen").style.display = "none";
    document.getElementById("loading-screen").style.display = "flex";
    
    let progress = 0;
    const bar = document.getElementById("loading-bar-fill");
    const label = document.getElementById("loading-text");
    
    const interval = setInterval(() => {
        progress += Math.random() * 8;
        if (progress > 100) progress = 100;
        
        bar.style.width = `${progress}%`;
        label.innerText = `Loading data clusters... ${Math.floor(progress)}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(completeImport, 400);
        }
    }, 80); 
}

function completeImport() {
    isImported = true;
    // Deep copy to ensure DEFAULT_DATA remains pristine for future resets
    DetectiveData = JSON.parse(JSON.stringify(DEFAULT_DATA)); 
    localStorage.setItem('Detective_os_imported', 'true');
    localStorage.setItem('Detective_os_data', JSON.stringify(DetectiveData));

    document.getElementById("loading-screen").style.display = "none";
    document.getElementById("crash-screen").style.display = "flex";
}

function showRepairInterface() {
    document.getElementById("crash-screen").style.display = "none";
    const mainInterface = document.getElementById("main-interface");
    mainInterface.style.display = "flex";
    mainInterface.style.animation = "slideDown 0.5s forwards";
    renderTable();
}

function resetData() {
    // REIMPORT: Does NOT clear the import flag — user keeps their USB item.
    // Only resets edits back to the original dirty DEFAULT_DATA so they can try again.
    if (confirm("REIMPORT: This will discard all your edits and restore the original corrupted database from the USB. Proceed?")) {

        // 1. Restore original dirty data (deep copy so DEFAULT_DATA stays pristine)
        DetectiveData = JSON.parse(JSON.stringify(DEFAULT_DATA));

        // 2. Keep isImported=true but reset puzzle state
        isImported = true;
        isUnlocked = false;
        currentStep = 1;
        selectedKeys = new Set();

        // 3. Persist the reset data (but keep imported flag alive)
        localStorage.setItem('Detective_os_data', JSON.stringify(DetectiveData));
        localStorage.setItem('Detective_os_imported', 'true');
        localStorage.removeItem('Detective_os_unlocked');

        // 4. Reset UI — show the repair interface directly with fresh data
        const ids = ["setup-screen", "crash-screen", "loading-screen"];
        ids.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = "none"; });

        const successBanner = document.getElementById("success-banner");
        const errorBanner   = document.getElementById("error-banner");
        const stepLabel     = document.getElementById("step-label");
        const mainInterface = document.getElementById("main-interface");
        const table         = document.getElementById("Detective-db");

        if (successBanner) successBanner.style.display = "none";
        if (errorBanner)   errorBanner.style.display   = "flex";
        if (stepLabel)     stepLabel.innerText = "Step 1: Achieving Atomicity (1NF)";
        if (table)         table.classList.remove("success-glow");

        // Reset header styles (remove pulse / key-selected)
        document.querySelectorAll("#Detective-db th").forEach(th => {
            th.classList.remove("key-selected");
            th.style.animation = "";
            th.onclick = null;
            th.style.cursor = "";
            th.innerHTML = th.innerText.replace("🔑 ", "");
        });

        if (mainInterface) {
            mainInterface.style.display = "flex";
            mainInterface.style.animation = "slideDown 0.4s ease-out";
        }

        document.getElementById("reimport-btn-header").style.display = "block";

        renderTable();
        showToast("DATABASE RESTORED — ORIGINAL DATA LOADED");
    }
}

function showToast(msg) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.innerText = msg || "DATABASE UPDATED";
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2000);
}

// ─────────────────────────────────────────
// TAB NAVIGATION
// ─────────────────────────────────────────
function switchTab(name) {
    tabState = name;
    ['database','crossref','accusation'].forEach(t => {
        const el = document.getElementById('tab-' + t);
        const btn = document.getElementById('tab-btn-' + t);
        if (el)  el.style.display  = (t === name) ? 'block' : 'none';
        if (btn) btn.classList.toggle('active', t === name);
    });
    // When switching to accusation, build the panel
    if (name === 'accusation') buildAccusationPanel();
}

// ─────────────────────────────────────────
// CROSS-REFERENCE TOOL
// ─────────────────────────────────────────
function runCrossRef() {
    const suspectFilter  = document.getElementById('crossref-suspect').value.toLowerCase();
    const keywordFilter  = document.getElementById('crossref-keyword').value.trim().toLowerCase();
    const tbody          = document.getElementById('crossref-tbody');
    const resultsDiv     = document.getElementById('crossref-results');
    const emptyDiv       = document.getElementById('crossref-empty');
    const countLabel     = document.getElementById('crossref-count-label');
    const contradDiv     = document.getElementById('contradiction-alert');

    if (!tbody) return;

    // Filter rows
    const matches = DetectiveData.filter(row => {
        const subjectMatch  = !suspectFilter  || row.subject.toLowerCase().includes(suspectFilter);
        const keywordMatch  = !keywordFilter  || row.observation.toLowerCase().includes(keywordFilter);
        return subjectMatch && keywordMatch;
    });

    tbody.innerHTML = '';
    contradDiv.style.display = 'none';

    if (matches.length === 0) {
        resultsDiv.style.display = 'none';
        emptyDiv.style.display   = 'block';
    } else {
        emptyDiv.style.display   = 'none';
        resultsDiv.style.display = 'block';
        countLabel.innerText = `RESULTS — ${matches.length} record(s) found`;

        matches.forEach(row => {
            const tr = document.createElement('tr');
            let obs = row.observation;
            const isCritical = obs.includes('B. Lemur') || obs.includes('Silver Key') || obs.includes('ERR_DATA_BLOCK');
            tr.innerHTML = `
                <td>${row.log_id}</td>
                <td style="color:var(--accent-amber)">${row.subject}</td>
                <td style="${isCritical ? 'color:var(--accent-amber);font-weight:bold;' : ''}">${obs}</td>
            `;
            tbody.appendChild(tr);
        });

        // Contradiction detection
        const contradiction = detectContradictions(suspectFilter, keywordFilter, matches);
        if (contradiction) {
            contradDiv.style.display = 'block';
            contradDiv.innerHTML = contradiction;
        }
    }

    // Track query count — gates accusation tab
    crossRefQueryCount++;
    localStorage.setItem('Detective_os_queries', crossRefQueryCount);
    showToast(`QUERY COMPLETE — ${matches.length} record(s)`);
}

function detectContradictions(suspectFilter, keywordFilter, matches) {
    const isNannyQuery   = suspectFilter.includes('beatrix') || suspectFilter.includes('lemur') || suspectFilter.includes('nanny');
    const isPianoQuery   = keywordFilter.includes('piano');
    const hasNannyPianoEntry = matches.some(r => r.observation.includes('B. Lemur'));

    if (isPianoQuery && hasNannyPianoEntry) {
        return `<b>⚠ CONTRADICTION DETECTED:</b> The System Registry (Log #005) identifies Beatrix Lémur at the Piano. However, her official statement (Log #002) claims she was in the Nursery and Laundry all night. This proves she lied about her whereabouts.`;
    }
    if (isNannyQuery) {
        const nannyObs = matches.map(r => r.observation.toLowerCase());
        const mentionsPiano = nannyObs.some(o => o.includes('piano'));
        if (!mentionsPiano) {
            return `<b>⚠ NOTE:</b> Beatrix Lémur claims she was only in the Nursery and Laundry. Run a 'Piano' query to see if there are any records of her elsewhere in the mansion.`;
        }
    }
    return null;
}

// ─────────────────────────────────────────
// ACCUSATION PANEL
// ─────────────────────────────────────────
function buildAccusationPanel() {
    const gateMsg  = document.getElementById('accusation-gate-msg');
    const panel    = document.getElementById('accusation-panel');
    const summary  = document.getElementById('investigation-summary');
    const btnGrid  = document.getElementById('suspect-btn-grid');

    if (crossRefQueryCount === 0) {
        gateMsg.style.display = 'block';
        panel.style.display   = 'none';
        return;
    }

    gateMsg.style.display = 'none';
    panel.style.display   = 'block';

    // Build investigation summary (who has contradictions)
    const suspects = [
        { name: 'Beatrix (Nanny)', key: 'beatrix',  contradiction: true,  reason: '1 contradiction — Alibi (#002) conflicts with physical evidence (#005)' },
        { name: 'Leduc (Butler)',   key: 'leduc',   contradiction: false, reason: 'Alibi consistent with recovered tea preparation logs' },
        { name: 'Thomas (Partner)',key: 'thomas',   contradiction: false, reason: 'Present at Piano — stated consistently in all reports' },
        { name: 'Off. Miller',     key: 'miller',   contradiction: false, reason: 'First responder — found body at 22:00' },
    ];

    summary.innerHTML = suspects.map(s => `
        <div class="summary-row">
            <span class="summary-indicator ${s.contradiction ? 'indicator-warn' : 'indicator-ok'}">${s.contradiction ? '!' : '✓'}</span>
            <span class="summary-name">${s.name}</span>
            <span class="summary-reason">${s.reason}</span>
        </div>
    `).join('');

    // Build suspect selection buttons
    btnGrid.innerHTML = suspects.map(s => `
        <button class="suspect-sel-btn ${s.contradiction ? 'btn-flagged' : ''}" 
                id="sel-${s.key}" 
                onclick="selectSuspect('${s.name}', '${s.key}')">
            ${s.name}
        </button>
    `).join('');

    // Restore previous selection
    if (selectedSuspect) {
        const keyMap = suspects.reduce((acc, s) => { acc[s.name] = s.key; return acc; }, {});
        const btn = document.getElementById('sel-' + keyMap[selectedSuspect]);
        if (btn) btn.classList.add('selected');
        document.getElementById('submit-btn').disabled = false;
    }
}

function selectSuspect(name, key) {
    selectedSuspect = name;
    // Clear all selections
    document.querySelectorAll('.suspect-sel-btn').forEach(b => b.classList.remove('selected'));
    // Highlight chosen
    const btn = document.getElementById('sel-' + key);
    if (btn) btn.classList.add('selected');
    // Enable submit
    document.getElementById('submit-btn').disabled = false;
    showToast(`SUSPECT MARKED: ${name}`);
}

function submitAccusation() {
    if (!selectedSuspect || accusationFiled) return;
    accusationFiled = true;

    localStorage.setItem('Detective_os_accusation', selectedSuspect);

    const isCorrect = selectedSuspect.includes('Beatrix') || selectedSuspect.includes('Nanny') || selectedSuspect.includes('Lémur');

    // Post to parent game
    try {
        if (window !== window.parent) {
            window.parent.postMessage({
                type: 'accusation_filed',
                suspect: selectedSuspect,
                correct: isCorrect
            }, '*');
        }
    } catch(e) {}

    const confirmDiv = document.getElementById('accusation-confirm');
    const submitBtn  = document.getElementById('submit-btn');
    if (submitBtn) submitBtn.disabled = true;

    if (isCorrect) {
        confirmDiv.className = 'accusation-confirm success';
        confirmDiv.innerHTML = `
            <div class="accusation-title">✓ ACCUSATION FILED</div>
            <div>Primary suspect: <b>${selectedSuspect}</b></div>
            <div style="margin-top:8px;">The System Registry data confirms a Piano access attempt inconsistent with the Nanny's stated alibi. A formal investigation report has been submitted. Return to the investigation and confront Beatrix.</div>
            <button class="btn-continue" style="margin-top:14px;" onclick="closeTablet()">Close Tablet &amp; Confront Suspect</button>
        `;
    } else {
        confirmDiv.className = 'accusation-confirm warn';
        confirmDiv.innerHTML = `
            <div class="accusation-title">⚠ ACCUSATION LOGGED</div>
            <div>Primary suspect: <b>${selectedSuspect}</b></div>
            <div style="margin-top:8px;">This accusation has been logged, but the forensic data points to a different conclusion. Review the Cross-Reference tab and look for the Piano access contradiction.</div>
            <button class="btn-continue" style="margin-top:14px;" onclick="closeTablet()">Close Tablet</button>
        `;
    }
    confirmDiv.style.display = 'block';
}

function validateDB() {
    const fb = document.getElementById("validate-feedback");
    fb.style.display = "block";

    // Check 1: No data at all
    if (DetectiveData.length === 0) {
        fb.className = "validate-feedback error";
        fb.innerHTML = "<b>VALIDATE ERROR:</b> Database is empty. Import data first.";
        return;
    }

    // Check 2: Atomicity — find all rows with commas
    const corruptRows = DetectiveData
        .map((row, i) => ({ i, row }))
        .filter(({ row }) => row.observation.includes(","));

    if (corruptRows.length > 0) {
        const list = corruptRows.map(({ row }) =>
            `<li>Row <b>${row.log_id}</b>: "${row.observation.substring(0, 60)}..."</li>`
        ).join("");
        fb.className = "validate-feedback error";
        fb.innerHTML = `<b>FAIL — Step 1 Not Passed:</b> ${corruptRows.length} non-atomic row(s) detected.<ul style="margin:6px 0 0 16px;">${list}</ul>Split these into separate rows to fix.`;
        return;
    }

    // Check 3: All data atomic — check if still on step 1
    if (currentStep === 1) {
        fb.className = "validate-feedback warn";
        fb.innerHTML = "<b>STEP 1 PASSED ✔</b> — All cells are atomic. Now identify the Composite Key by clicking the column headers.";
        currentStep = 2;
        updateStepUI();
        renderTable();
        return;
    }

    // Check 4: Keys assigned
    if (isUnlocked) {
        fb.className = "validate-feedback success";
        fb.innerHTML = "<b>FULLY VALIDATED ✔</b> — Database is 1NF compliant. Composite key confirmed. Case file unlocked.";
        return;
    }

    // Step 2 in progress — remind which keys are selected
    const selected = [...selectedKeys].join(" + ") || "none";
    fb.className = "validate-feedback warn";
    fb.innerHTML = `<b>STEP 1 PASSED ✔</b> — Data is atomic. Selected keys: <b>${selected}</b>. You need <b>log_id + observation</b> to uniquely identify each row.`;
}

function handleKey(event, index, field) {
    if (event.key === "Enter") {
        event.preventDefault();
        event.target.blur(); // Triggers editCell via onblur
    }
    if (event.key === "Escape") {
        event.target.innerText = originalCellValue; // Revert
        event.target.blur();
    }
}

function onFocusCell(event) {
    originalCellValue = event.target.innerText;
}

function addRow() {
    if (isUnlocked) return;
    const newRow = {
        log_id: "#NEW",
        subject: "Witness Name",
        observation: "Empty"
    };
    DetectiveData.push(newRow);
    localStorage.setItem('Detective_os_data', JSON.stringify(DetectiveData));
    renderTable();
    showToast("ROW ADDED");
}

function deleteRow(index) {
    if (isUnlocked) return;
    DetectiveData.splice(index, 1);
    localStorage.setItem('Detective_os_data', JSON.stringify(DetectiveData));
    renderTable();
    showToast("ROW DELETED");
}

function editCell(index, field, newValue) {
    if (isUnlocked) return;
    const oldVal = DetectiveData[index][field];
    const cleanVal = newValue.trim();
    
    if (oldVal === cleanVal) return; // No change

    DetectiveData[index][field] = cleanVal;
    localStorage.setItem('Detective_os_data', JSON.stringify(DetectiveData));
    showToast();
    checkStepCondition(); 
}

function renderTable() {
    const tbody = document.querySelector("#Detective-db tbody");
    const thead = document.querySelector("#Detective-db thead tr");
    if (!tbody) return;
    tbody.innerHTML = ""; 

    // Step 2 Header Interaction
    if (currentStep === 2 && !isUnlocked) {
        const headers = thead.querySelectorAll("th");
        headers.forEach(th => {
            const colName = th.innerText.toLowerCase();
            th.style.cursor = "pointer";
            th.onclick = () => toggleKey(colName);
            
            if (selectedKeys.has(colName)) {
                th.classList.add("key-selected");
                th.innerHTML = `🔑 ${th.innerText.replace("🔑 ", "")}`;
            } else {
                th.classList.remove("key-selected");
                th.innerHTML = th.innerText.replace("🔑 ", "");
            }
        });
    }

    DetectiveData.forEach((row, index) => {
        const tr = document.createElement("tr");

        let displayObs = row.observation;
        let displaySubject = row.subject;

        // Logic to reveal the 'Beatrix' clue only after normalization is fixed
        if (displayObs.includes("ERR_DATA_BLOCK_772") && isUnlocked) {
            displayObs = "Piano. Silver Key missing. Subject B. Lemur identified nearby.";
        }

        // REWARD MECHANIC: Hide the Subject until unlocked
        if (!isUnlocked) {
            displaySubject = "[REDACTED]";
        }

        const isEditable = !isUnlocked;
        const obsClass = (displayObs.includes(",") && currentStep === 1) ? "corrupt-cell" : "";

        tr.innerHTML = `
            <td contenteditable="${isEditable}" onfocus="onFocusCell(event)" onkeydown="handleKey(event, ${index}, 'log_id')" onblur="editCell(${index}, 'log_id', this.innerText)">${row.log_id}</td>
            <td contenteditable="false" style="color: var(--accent-amber); opacity: 0.7;">${displaySubject}</td>
            <td contenteditable="${isEditable}" class="${obsClass}" onfocus="onFocusCell(event)" onkeydown="handleKey(event, ${index}, 'observation')" onblur="editCell(${index}, 'observation', this.innerText)">${displayObs}</td>
            ${!isUnlocked ? `<td><button onclick="deleteRow(${index})" style="background:none; border:none; color:var(--accent-red); cursor:pointer; font-size:10px;">[DEL]</button></td>` : ''}
        `;
        tbody.appendChild(tr);
    });

    checkStepCondition();
    
    if (isUnlocked) {
        showSuccessUI();
    }
}

function toggleKey(colName) {
    if (selectedKeys.has(colName)) selectedKeys.delete(colName);
    else selectedKeys.add(colName);
    renderTable();
}

function splitData(index) {
    // Keep this for backward compatibility if user clicks a comma-cell, but now we have manual edit too
    if (currentStep !== 1 || isUnlocked) return;

    const corruptRow = DetectiveData[index];
    if (!corruptRow.observation.includes(",")) return;

    const obsArray = corruptRow.observation.split(",").map(obs => obs.trim());

    DetectiveData.splice(index, 1);
    const newRows = obsArray.map(obs => {
        return {
            log_id: corruptRow.log_id,
            subject: corruptRow.subject,
            observation: obs
        };
    });

    DetectiveData.splice(index, 0, ...newRows);
    localStorage.setItem('Detective_os_data', JSON.stringify(DetectiveData));
    renderTable();
}

function checkStepCondition() {
    if (isUnlocked) return;

    if (currentStep === 1) {
        const isCorrupted = DetectiveData.some(row => row.observation.includes(","));
        if (!isCorrupted) {
            currentStep = 2;
            updateStepUI();
            renderTable();
        }
    } else if (currentStep === 2) {
        // Win condition: Log_ID and Observation selected as composite key
        if (selectedKeys.has("log_id") && selectedKeys.has("observation") && selectedKeys.size === 2) {
            triggerSuccessState();
        }
    }
}

function updateStepUI() {
    const label = document.getElementById("step-label");
    const errorTitle = document.getElementById("error-title");
    const errorText = document.getElementById("error-text");

    if (currentStep === 2) {
        label.innerText = "Step 2: Assigning Composite Primary Keys";
        errorTitle.innerText = "Entity Integrity Violation";
        errorText.innerText = "Individual Log_IDs are no longer unique. Identify the COMPOSITE KEY by tapping the headers (Columns) that uniquely identify each row.";
        
        // Add visual cue to headers
        const headers = document.querySelectorAll("#Detective-db th");
        headers.forEach(th => th.style.animation = "pulse-border 2s infinite");
    }
}

function triggerSuccessState() {
    if (isUnlocked) return;
    isUnlocked = true;
    localStorage.setItem('Detective_os_unlocked', 'true');
    
    // [AI - ANTIGRAVITY] - Notify parent game that normalization is complete
    if (window !== window.parent) {
        window.parent.postMessage({ type: 'normalization_complete' }, '*');
    }
    
    showSuccessUI();
}

function runQuery() {
    const query = document.getElementById("db-search").value.trim().toLowerCase();
    const feedback = document.getElementById("search-feedback");
    
    if (!query) {
        feedback.style.display = "none";
        return;
    }

    feedback.style.display = "block";

    // Educational Logic: 
    // In Step 1 (Non-Atomic), searching for a single item fails because the cell is "A, B, C"
    // In Step 2 (Normalized), searching for a single item succeeds.
    
    const results = DetectiveData.filter(row => row.observation.toLowerCase() === query);
    
    if (results.length > 0) {
        feedback.className = "search-feedback success";
        feedback.innerText = `QUERY SUCCESS: ${results.length} record(s) found for "${query}".`;
        
        // Highlight matching rows
        const rows = document.querySelectorAll("#Detective-db tbody tr");
        rows.forEach(row => {
            if (row.cells[2].innerText.toLowerCase() === query) {
                row.style.backgroundColor = "rgba(39, 174, 96, 0.2)";
            } else {
                row.style.backgroundColor = "";
            }
        });
    } else {
        const containsPartial = DetectiveData.some(row => row.observation.toLowerCase().includes(query));
        feedback.className = "search-feedback error";
        if (containsPartial && currentStep === 1) {
            feedback.innerText = `QUERY ERROR: Exact match not found. The database cannot filter "${query}" because it is part of a non-atomic list. Normalize the data first.`;
        } else {
            feedback.innerText = `QUERY EMPTY: No exact matches found for "${query}".`;
        }
    }
}

function showSuccessUI() {
    // Hide error, show success banner
    const banner = document.getElementById("error-banner");
    if (banner) banner.style.display = "none";
    const success = document.getElementById("success-banner");
    if (success) success.style.display = "flex";

    // Reveal tab bar (the key post-unlock feature)
    const tabBar = document.getElementById("tab-bar");
    if (tabBar) tabBar.style.display = "flex";

    // Restore cross-ref query count from localStorage
    crossRefQueryCount = parseInt(localStorage.getItem('Detective_os_queries') || '0');
    if (localStorage.getItem('Detective_os_accusation')) {
        accusationFiled = true;
        selectedSuspect = localStorage.getItem('Detective_os_accusation');
    }

    // Hide add-row (editing disabled after unlock)
    const addBtn = document.getElementById("add-row-btn");
    if (addBtn) addBtn.style.display = "none";

    // Update step label
    const label = document.getElementById("step-label");
    if (label) label.innerText = "Case File Decrypted — Use tabs to analyse";

    // Glow the table
    const table = document.getElementById("Detective-db");
    if (table) {
        table.classList.add("success-glow");
        table.querySelectorAll("tbody tr").forEach(row => {
            if (row.innerText.includes("B. Lemur") || row.innerText.includes("Silver Key")) {
                row.style.background = "rgba(200, 134, 10, 0.25)";
                row.style.border = "1px solid #c8860a";
                row.style.boxShadow = "inset 0 0 15px rgba(200, 134, 10, 0.1)";
            }
        });
    }

    // Validate feedback auto-update
    const fb = document.getElementById("validate-feedback");
    if (fb) {
        fb.style.display = "block";
        fb.className = "validate-feedback success";
        fb.innerHTML = "<b>FULLY VALIDATED ✔</b> — 1NF compliant. Use CROSS-REFERENCE tab to investigate contradictions.";
    }
}

