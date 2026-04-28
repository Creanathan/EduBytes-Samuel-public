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
    // [AI - ANTIGRAVITY] - Mangled narrative clue hidden by 1NF violations
    { log_id: "#005", subject: "System Registry", observation: "Piano (ERR_DATA_BLOCK_772: HIDDEN_RESTRICTED)" }
];

let currentStep = 1; // 1: Atomicity, 2: Primary Key
let selectedKeys = new Set(); // For Step 2

// Load saved data - Start EMPTY if no data is found in storage
let DetectiveData = JSON.parse(localStorage.getItem('Detective_os_data')) || [];
let isUnlocked = localStorage.getItem('Detective_os_unlocked') === 'true';
let isImported = localStorage.getItem('Detective_os_imported') === 'true' || DetectiveData.length > 0;

// Initialize UI
document.addEventListener("DOMContentLoaded", () => {
    checkSetup();
    if (isUnlocked) currentStep = 2; 
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

    // Robust item check (Parent -> LocalStorage fallback)
    const hasLedger = checkInventoryLocal('ledger');
    const hasUSB = checkInventoryLocal('usb_stick');

    if (hasUSB) {
        icon.innerText = "\uD83D\uDCBE";
        title.innerText = "Encrypted USB Detected";
        text.innerText = "Encrypted drive found in port. Manual decryption and import required to extract the crime scene registry.";
        importBtn.innerText = "DECRYPT & IMPORT";
        importBtn.style.display = "block";
        importBtn.onclick = startImport;
    } else if (hasLedger) {
        icon.innerText = "\uD83D\uDCC1";
        title.innerText = "Data Ledger Detected";
        text.innerText = "Physical Detective registries found. Ready to scan and import into local registry for normalization.";
        importBtn.innerText = "SCAN & IMPORT";
        importBtn.style.display = "block";
        importBtn.onclick = startImport;
    } else {
        icon.innerText = "\uD83D\uDCE1";
        title.innerText = "No Data Source Detected";
        text.innerText = "Detective OS is online but local registries are empty. Please obtain a data source (Ledger or USB) to begin analysis.";
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
    DetectiveData = [...DEFAULT_DATA]; 
    localStorage.setItem('Detective_os_imported', 'true');
    localStorage.setItem('Detective_os_data', JSON.stringify(DetectiveData));

    document.getElementById("loading-screen").style.display = "none";
    document.getElementById("crash-screen").style.display = "flex";
}

function showRepairInterface() {
    document.getElementById("crash-screen").style.display = "none";
    const mainInterface = document.getElementById("main-interface");
    mainInterface.style.display = "block";
    mainInterface.style.animation = "slideDown 0.5s forwards";
    renderTable();
}

function resetData() {
    if (confirm("WARNING: This will wipe your current database and re-import from the source. Proceed?")) {
        localStorage.removeItem('Detective_os_imported');
        localStorage.removeItem('Detective_os_data');
        localStorage.removeItem('Detective_os_unlocked');
        location.reload(); // Hard reset
    }
}

function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.innerText = msg || "DATABASE UPDATED";
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2000);
}

function handleKey(event, index, field) {
    if (event.key === "Enter") {
        event.preventDefault();
        event.target.blur(); // Triggers editCell via onblur
    }
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
        // Logic to reveal the 'Butler' clue only after normalization is fixed
        if (displayObs.includes("ERR_DATA_BLOCK_772") && isUnlocked) {
            displayObs = "Piano (UNSUCCESSFUL: Butler hid the key?)";
        }

        const isEditable = !isUnlocked;
        const obsClass = (displayObs.includes(",") && currentStep === 1) ? "corrupt-cell" : "";

        tr.innerHTML = `
            <td contenteditable="${isEditable}" onkeydown="handleKey(event, ${index}, 'log_id')" onblur="editCell(${index}, 'log_id', this.innerText)">${row.log_id}</td>
            <td contenteditable="${isEditable}" onkeydown="handleKey(event, ${index}, 'subject')" onblur="editCell(${index}, 'subject', this.innerText)">${row.subject}</td>
            <td contenteditable="${isEditable}" class="${obsClass}" onkeydown="handleKey(event, ${index}, 'observation')" onblur="editCell(${index}, 'observation', this.innerText)">${displayObs}</td>
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

    // Educational Logic: 
    // In Step 1 (Non-Atomic), searching for a single item fails because the cell is "A, B, C"
    // In Step 2 (Normalized), searching for a single item succeeds.
    
    const results = DetectiveData.filter(row => row.searched_rooms.toLowerCase() === query);
    
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
        const containsPartial = DetectiveData.some(row => row.searched_rooms.toLowerCase().includes(query));
        feedback.className = "search-feedback error";
        if (containsPartial && currentStep === 1) {
            feedback.innerText = `QUERY ERROR: Exact match not found. The database cannot filter "${query}" because it is part of a non-atomic list. Normalize the data first.`;
        } else {
            feedback.innerText = `QUERY EMPTY: No exact matches found for "${query}".`;
        }
    }
}

function showSuccessUI() {
    const banner = document.getElementById("error-banner");
    if (banner) banner.style.display = "none";

    const success = document.getElementById("success-banner");
    if (success) success.style.display = "flex";

    const label = document.getElementById("step-label");
    if (label) label.innerText = "Step 3: Data Secured (1NF Compliance)";

    const table = document.getElementById("Detective-db");
    if (table) {
        table.classList.add("success-glow");
        const rows = table.querySelectorAll("tbody tr");
        rows.forEach(row => {
            // Highlight the newly revealed clue
            if (row.innerText.includes("Butler hid the key?")) {
                row.style.background = "rgba(200, 134, 10, 0.25)";
                row.style.border = "1px solid #c8860a";
                row.style.boxShadow = "inset 0 0 15px rgba(200, 134, 10, 0.1)";
            }
        });
    }

    // Success text update
    const feedback = document.getElementById("search-feedback");
    feedback.className = "search-feedback success";
    feedback.style.display = "block";
    feedback.innerText = "QUERY ENGINE ONLINE: Data is now atomic and searchable. Try searching for 'Piano'.";
}
