/**
 * Police OS Logic - 1NF Normalization Puzzle
 * Developer: Detective Louis Dekoning (In-Lore)
 */

// Initial "Dirty" database
const DEFAULT_DATA = [
    { log_id: "#001", officer: "Off. Miller", searched_rooms: "Kitchen" },
    { log_id: "#002", officer: "Det. Louis", searched_rooms: "Nursery, Living Room, Hallway" },
    { log_id: "#003", officer: "Off. Hayes", searched_rooms: "Study, Master Bedroom" },
    { log_id: "#004", officer: "Sgt. Cross", searched_rooms: "Bathroom" },
    // [AI - ANTIGRAVITY] - Narrative conflict clue
    { log_id: "#005", officer: "Off. Miller", searched_rooms: "Piano (UNSUCCESSFUL: Butler hid the key?)" }
];

let currentStep = 1; // 1: Atomicity, 2: Primary Key
let selectedKeys = new Set(); // For Step 2

// Load saved data - Start EMPTY if no data is found in storage
let policeData = JSON.parse(localStorage.getItem('police_os_data')) || [];
let isUnlocked = localStorage.getItem('police_os_unlocked') === 'true';
let isImported = localStorage.getItem('police_os_imported') === 'true' || policeData.length > 0;

// Initialize UI
document.addEventListener("DOMContentLoaded", () => {
    checkSetup();
    if (isUnlocked) currentStep = 2; 
    renderTable();
});

function checkSetup() {
    const setupScreen = document.getElementById("setup-screen");
    const mainInterface = document.getElementById("main-interface");
    const importBtn = document.getElementById("import-btn");
    const title = document.getElementById("setup-title");
    const text = document.getElementById("setup-text");
    const icon = document.getElementById("setup-status-icon");

    // If already imported, show the main interface
    if (isImported) {
        setupScreen.style.display = "none";
        mainInterface.style.display = "block";
        return;
    }

    // Check parent inventory for data sources
    const hasLedger = window.parent.Inventory && window.parent.Inventory.hasItem('ledger');
    const hasUSB = window.parent.Inventory && window.parent.Inventory.hasItem('usb_stick');

    if (hasUSB) {
        icon.innerText = "\uD83D\uDCBE";
        title.innerText = "Encrypted USB Detected";
        text.innerText = "Encrypted drive found in port. Manual decryption and import required to extract the crime scene registry.";
        importBtn.innerText = "DECRYPT & IMPORT";
        importBtn.style.display = "block";
    } else if (hasLedger) {
        icon.innerText = "\uD83D\uDCC1";
        title.innerText = "Data Ledger Detected";
        text.innerText = "Physical police registries found. Ready to scan and import into local registry for normalization.";
        importBtn.innerText = "SCAN & IMPORT";
        importBtn.style.display = "block";
    } else {
        icon.innerText = "\uD83D\uDCE1";
        title.innerText = "No Data Source Detected";
        text.innerText = "Police OS is online but local registries are empty. Please obtain a data source (Ledger or USB) to begin analysis.";
        importBtn.style.display = "none";
    }
}

function startImport() {
    const importBtn = document.getElementById("import-btn");
    const text = document.getElementById("setup-text");
    const icon = document.getElementById("setup-status-icon");
    
    importBtn.disabled = true;
    importBtn.style.opacity = "0.5";
    
    let progress = 0;
    icon.classList.add("pulse-fast");
    
    const interval = setInterval(() => {
        progress += 5;
        text.innerText = `UPLINK IN PROGRESS... ${progress}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
            completeImport();
        }
    }, 50); // Simulate fast digital transfer

    function completeImport() {
        isImported = true;
        policeData = [...DEFAULT_DATA]; // Load the default dirty data
        localStorage.setItem('police_os_imported', 'true');
        localStorage.setItem('police_os_data', JSON.stringify(policeData));

        const setupScreen = document.getElementById("setup-screen");
        const mainInterface = document.getElementById("main-interface");
        
        setupScreen.style.animation = "slideDown 0.5s reverse forwards";
        setTimeout(() => {
            setupScreen.style.display = "none";
            mainInterface.style.display = "block";
            mainInterface.style.animation = "slideDown 0.5s forwards";
            renderTable();
        }, 500);
    }
}

function renderTable() {
    const tbody = document.querySelector("#police-db tbody");
    const thead = document.querySelector("#police-db thead tr");
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

    policeData.forEach((row, index) => {
        const tr = document.createElement("tr");

        // Check if the cell has a comma (violates 1NF Atomicity)
        const hasComma = row.searched_rooms.includes(",");
        
        let roomsCellHTML = "";
        if (hasComma && currentStep === 1) {
            roomsCellHTML = `<td class="corrupt-cell" onclick="splitData(${index})">${row.searched_rooms}</td>`;
        } else {
            roomsCellHTML = `<td>${row.searched_rooms}</td>`;
        }

        tr.innerHTML = `
            <td>${row.log_id}</td>
            <td>${row.officer}</td>
            ${roomsCellHTML}
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
    if (currentStep !== 1 || isUnlocked) return;

    const corruptRow = policeData[index];
    const roomsArray = corruptRow.searched_rooms.split(",").map(room => room.trim());

    policeData.splice(index, 1);
    const newRows = roomsArray.map(room => {
        return {
            log_id: corruptRow.log_id,
            officer: corruptRow.officer,
            searched_rooms: room
        };
    });

    policeData.splice(index, 0, ...newRows);
    localStorage.setItem('police_os_data', JSON.stringify(policeData));
    renderTable();
}

function checkStepCondition() {
    if (isUnlocked) return;

    if (currentStep === 1) {
        const isCorrupted = policeData.some(row => row.searched_rooms.includes(","));
        if (!isCorrupted) {
            currentStep = 2;
            updateStepUI();
            renderTable();
        }
    } else if (currentStep === 2) {
        // Win condition: Log_ID and Searched_Rooms selected as composite key
        if (selectedKeys.has("log_id") && selectedKeys.has("searched_rooms") && selectedKeys.size === 2) {
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
        const headers = document.querySelectorAll("#police-db th");
        headers.forEach(th => th.style.animation = "pulse-border 2s infinite");
    }
}

function triggerSuccessState() {
    if (isUnlocked) return;
    isUnlocked = true;
    localStorage.setItem('police_os_unlocked', 'true');
    
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
    
    const results = policeData.filter(row => row.searched_rooms.toLowerCase() === query);
    
    if (results.length > 0) {
        feedback.className = "search-feedback success";
        feedback.innerText = `QUERY SUCCESS: ${results.length} record(s) found for "${query}".`;
        
        // Highlight matching rows
        const rows = document.querySelectorAll("#police-db tbody tr");
        rows.forEach(row => {
            if (row.cells[2].innerText.toLowerCase() === query) {
                row.style.backgroundColor = "rgba(39, 174, 96, 0.2)";
            } else {
                row.style.backgroundColor = "";
            }
        });
    } else {
        const containsPartial = policeData.some(row => row.searched_rooms.toLowerCase().includes(query));
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

    const table = document.getElementById("police-db");
    if (table) {
        table.classList.add("success-glow");
        const rows = table.querySelectorAll("tbody tr");
        rows.forEach(row => {
            if (row.innerText.includes("Butler hid the key?")) {
                row.style.background = "rgba(200, 134, 10, 0.2)";
                row.style.border = "1px solid #c8860a";
            }
        });
    }

    // Success text update
    const feedback = document.getElementById("search-feedback");
    feedback.className = "search-feedback success";
    feedback.style.display = "block";
    feedback.innerText = "QUERY ENGINE ONLINE: Data is now atomic and searchable. Try searching for 'Piano'.";
}
