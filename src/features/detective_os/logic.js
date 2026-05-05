/**
 * Detective OS Logic v3.0 - Forensic Normalization Engine
 */

// Initial "Sloppy" database (Witness Reports from USB)
const DEFAULT_DATA = [
    { log_id: "#001", subject: "Leduc (Butler)", observation: "Hallway, Kitchen, Dining Room. Claims he was prepping tea." },
    { log_id: "#002", subject: "Beatrix (Nanny)", observation: "Nursery, Laundry. Claims she was washing the cradle linens." },
    { log_id: "#003", subject: "Thomas (Partner)", observation: "Living Room. Claims he was playing piano to calm his nerves." },
    { log_id: "#004", subject: "Off. Miller", observation: "Crime Scene. Found the body at 22:00." },
    { log_id: "#005", subject: "System Registry", observation: "Piano (ERR_DATA_BLOCK_772: HIDDEN_RESTRICTED)" }
];

// Suspect Profiles (Unlocked after normalization)
const PROFILES = {
    "Leduc": { name: "Jeanne-Paul Leduc", role: "Butler", bio: "Loyal servant for 20 years. Alibi: Tea preparation.", icon: "🤵" },
    "Beatrix": { name: "Beatrix Lémur", role: "Nanny", bio: "Childcare specialist. Long-term family tie.", icon: "👵" },
    "Thomas": { name: "Thomas Souvellier", role: "Partner", bio: "Professor. Deeply grieved by the loss.", icon: "🧐" },
    "Miller": { name: "Officer Miller", role: "Police", bio: "First responder on scene.", icon: "👮" },
    "System": { name: "Registry Logs", role: "System", bio: "Automated biometric sensors.", icon: "💾" }
};

// State Variables
let DetectiveData = [];
let isUnlocked = false;
let isImported = false;
let currentStep = 1; // 1: Atomicity, 2: Primary Key
let selectedKeys = new Set();
let tabState = 'database';
let crossRefQueryCount = 0;
let selectedSuspect = null;
let accusationFiled = false;

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    loadState();
    checkSetup();
    updateIntegrityMeter();
    renderTable();
    renderSuspectProfiles();
});

function loadState() {
    const savedData = localStorage.getItem('Detective_os_data');
    DetectiveData = savedData ? JSON.parse(savedData) : [];
    isUnlocked = localStorage.getItem('Detective_os_unlocked') === 'true';
    isImported = localStorage.getItem('Detective_os_imported') === 'true';
    crossRefQueryCount = parseInt(localStorage.getItem('Detective_os_queries') || '0');
    
    if (isUnlocked) currentStep = 3;
    else if (isImported && DetectiveData.length > 0) {
        const hasCommas = DetectiveData.some(row => row.observation.includes(","));
        currentStep = hasCommas ? 1 : 2;
    }
}

function checkSetup() {
    const overlay = document.getElementById("screen-overlay");
    const setupCard = document.getElementById("setup-card");
    const importBtn = document.getElementById("import-btn");
    const repairBtn = document.getElementById("repair-btn");
    const title = document.getElementById("setup-title");
    const text = document.getElementById("setup-text");
    const icon = document.getElementById("setup-icon");

    if (isUnlocked || isImported) {
        if (isUnlocked) {
            overlay.style.display = "none";
        } else {
            // Imported but not yet repaired
            icon.innerText = "⚠️";
            title.innerText = "CRITICAL FAULT";
            text.innerText = "Inconsistent data mapping detected. Normalization protocols failed. Manual repair required to decrypt witness identities.";
            importBtn.style.display = "none";
            repairBtn.style.display = "block";
        }
        return;
    }

    // Check for USB
    const hasUSB = checkInventoryLocal('usb_stick');
    if (hasUSB) {
        icon.innerText = "💾";
        title.innerText = "USB Drive Detected";
        text.innerText = "External data cluster identified. Initialize forensic scan to extract witness registries.";
        importBtn.style.display = "block";
        importBtn.innerText = "INITIALIZE SCAN";
    } else {
        icon.innerText = "🔍";
        title.innerText = "Awaiting Evidence";
        text.innerText = "System online. Please locate and connect the Crime Scene USB drive to begin analysis.";
        importBtn.style.display = "none";
    }
}

function startImport() {
    const importBtn = document.getElementById("import-btn");
    const loadingBox = document.getElementById("loading-box");
    const bar = document.getElementById("loading-bar-fill");
    const label = document.getElementById("loading-text");
    
    importBtn.style.display = "none";
    loadingBox.style.display = "block";
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 5;
        if (progress > 100) progress = 100;
        
        bar.style.width = `${progress}%`;
        const files = ["alibi_log.db", "sensor_data.xml", "witness_001.dat", "mansion_map.json"];
        const currentFile = files[Math.floor(progress / 25) % files.length];
        label.innerText = `Extracting: ${currentFile} ... ${Math.floor(progress)}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(completeImport, 600);
        }
    }, 60);
}

function completeImport() {
    isImported = true;
    DetectiveData = JSON.parse(JSON.stringify(DEFAULT_DATA));
    localStorage.setItem('Detective_os_imported', 'true');
    localStorage.setItem('Detective_os_data', JSON.stringify(DetectiveData));
    checkSetup();
}

function showRepairInterface() {
    document.getElementById("screen-overlay").style.display = "none";
    renderTable();
}

function updateIntegrityMeter() {
    const bar = document.getElementById("integrity-bar");
    const label = document.getElementById("integrity-percent");
    const stepLabel = document.getElementById("step-label");
    
    let percent = 0;
    if (isImported) {
        const corruptCount = DetectiveData.filter(row => row.observation.includes(",")).length;
        const atomicityProgress = Math.max(0, 50 - (corruptCount * 10));
        percent = atomicityProgress;
        
        if (currentStep >= 2) {
            percent = 50 + (selectedKeys.size * 25);
            if (percent > 100) percent = 100;
        }
    }
    if (isUnlocked) percent = 100;

    bar.style.width = `${percent}%`;
    label.innerText = `${Math.floor(percent)}%`;
    
    if (percent < 50) stepLabel.innerText = "System Fault // Atomicity Violation";
    else if (percent < 100) stepLabel.innerText = "Integrity Warning // Identity Mapping Pending";
    else stepLabel.innerText = "System Secure // All Clusters Validated";
}

function renderTable() {
    const tbody = document.querySelector("#Detective-db tbody");
    const thead = document.querySelector("#Detective-db thead tr");
    if (!tbody) return;
    
    tbody.innerHTML = "";
    updateIntegrityMeter();

    // Step 2 Header Interaction
    if (currentStep === 2 && !isUnlocked) {
        const headers = thead.querySelectorAll("th");
        headers.forEach(th => {
            const colName = th.innerText.toLowerCase();
            if (colName === "cmd") return;
            th.style.cursor = "pointer";
            th.onclick = () => toggleKey(colName);
            th.classList.toggle("key-selected", selectedKeys.has(colName));
        });
    }

    DetectiveData.forEach((row, index) => {
        const tr = document.createElement("tr");
        let displayObs = row.observation;
        let displaySubject = isUnlocked ? row.subject : "[REDACTED]";

        if (displayObs.includes("ERR_DATA_BLOCK") && isUnlocked) {
            displayObs = "Piano. Silver Key missing. Subject B. Lemur identified nearby.";
        }

        const isEditable = !isUnlocked;
        const obsClass = (displayObs.includes(",") && currentStep === 1) ? "corrupt-cell" : "";

        tr.innerHTML = `
            <td contenteditable="${isEditable}" onblur="editCell(${index}, 'log_id', this.innerText)">${row.log_id}</td>
            <td style="color: var(--accent-amber); font-weight: bold;">${displaySubject}</td>
            <td contenteditable="${isEditable}" class="${obsClass}" onblur="editCell(${index}, 'observation', this.innerText)">${displayObs}</td>
            <td>${!isUnlocked ? `<button onclick="deleteRow(${index})" style="background:none; border:none; color:var(--accent-red); cursor:pointer;">✕</button>` : '✓'}</td>
        `;
        tbody.appendChild(tr);
    });
}

function editCell(index, field, newValue) {
    if (isUnlocked) return;
    DetectiveData[index][field] = newValue.trim();
    localStorage.setItem('Detective_os_data', JSON.stringify(DetectiveData));
    
    // Check if step 1 is done
    const hasCommas = DetectiveData.some(row => row.observation.includes(","));
    if (!hasCommas && currentStep === 1) {
        currentStep = 2;
        showToast("ATOMICITY ACHIEVED // PROCEED TO KEY MAPPING");
    }
    
    renderTable();
    checkWinCondition();
}

function toggleKey(colName) {
    if (selectedKeys.has(colName)) selectedKeys.delete(colName);
    else selectedKeys.add(colName);
    renderTable();
    checkWinCondition();
}

function checkWinCondition() {
    if (currentStep === 2 && selectedKeys.has("log_id") && selectedKeys.has("observation") && selectedKeys.size === 2) {
        triggerSuccess();
    }
}

function triggerSuccess() {
    isUnlocked = true;
    localStorage.setItem('Detective_os_unlocked', 'true');
    showToast("DATABASE SECURED // IDENTITIES DECRYPTED");
    
    // Unlock sidebar
    document.getElementById("nav-crossref").classList.remove("locked");
    document.getElementById("nav-accusation").classList.remove("locked");
    
    renderTable();
    renderSuspectProfiles();
    
    if (window !== window.parent) {
        window.parent.postMessage({ type: 'normalization_complete' }, '*');
    }
}

function renderSuspectProfiles() {
    const container = document.getElementById("suspect-profiles-container");
    const placeholder = document.getElementById("profile-placeholder");
    if (!container) return;

    if (!isUnlocked) {
        container.innerHTML = "";
        placeholder.style.display = "flex";
        return;
    }

    placeholder.style.display = "none";
    const suspects = ["Leduc", "Beatrix", "Thomas"];
    container.innerHTML = suspects.map(id => {
        const p = PROFILES[id];
        return `
            <div class="suspect-card">
                <div class="suspect-avatar">${p.icon}</div>
                <div class="suspect-info">
                    <h4>${p.name}</h4>
                    <p><b>ROLE:</b> ${p.role}</p>
                    <p>${p.bio}</p>
                </div>
            </div>
        `;
    }).join("");
}

function switchTab(name) {
    if (name !== 'database' && !isUnlocked) return;
    
    tabState = name;
    ['database', 'crossref', 'accusation'].forEach(t => {
        const el = document.getElementById('tab-' + t);
        const nav = document.getElementById('nav-' + t);
        if (el) el.style.display = (t === name) ? 'block' : 'none';
        if (nav) nav.classList.toggle('active', t === name);
    });

    if (name === 'accusation') buildAccusationPanel();
}

// Logic for Cross-Ref and Accusation (reused from v2 with UI updates)
function runCrossRef() {
    const suspect = document.getElementById('crossref-suspect').value.toLowerCase();
    const keyword = document.getElementById('crossref-keyword').value.trim().toLowerCase();
    const resultsDiv = document.getElementById('crossref-results');
    const tbody = resultsDiv.querySelector('tbody');
    const alert = document.getElementById('contradiction-alert');

    const matches = DetectiveData.filter(row => {
        return (!suspect || row.subject.toLowerCase().includes(suspect)) &&
               (!keyword || row.observation.toLowerCase().includes(keyword));
    });

    tbody.innerHTML = matches.map(row => `
        <tr>
            <td>${row.log_id}</td>
            <td style="color:var(--accent-amber)">${row.subject}</td>
            <td>${row.observation}</td>
        </tr>
    `).join("");

    resultsDiv.style.display = matches.length > 0 ? "block" : "none";
    
    // Contradiction Logic
    if (keyword.includes('piano') && matches.some(r => r.observation.includes('B. Lemur'))) {
        alert.style.display = "block";
        alert.innerHTML = `<div style="background:rgba(255, 77, 77, 0.1); border:1px solid var(--accent-red); padding:15px; border-radius:12px; font-size:12px; color:var(--accent-red);">
            <strong>⚠ FORENSIC CONTRADICTION:</strong> System Log #005 identifies Beatrix Lémur at the Piano. This conflicts with her statement in Log #002.
        </div>`;
    } else {
        alert.style.display = "none";
    }

    crossRefQueryCount++;
    localStorage.setItem('Detective_os_queries', crossRefQueryCount);
}

function buildAccusationPanel() {
    const gate = document.getElementById('accusation-gate-msg');
    const panel = document.getElementById('accusation-panel');
    const summary = document.getElementById('investigation-summary');
    const grid = document.getElementById('suspect-btn-grid');

    if (crossRefQueryCount === 0) return;

    gate.style.display = "none";
    panel.style.display = "block";

    summary.innerHTML = `<strong>ANALYSIS SUMMARY:</strong> Data normalization has exposed inconsistencies in witness reports. The most significant deviation was found in the Nanny's alibi regarding the Living Room (Piano) access logs.`;

    const suspects = [
        { id: 'leduc', name: 'Leduc' },
        { id: 'beatrix', name: 'Beatrix' },
        { id: 'thomas', name: 'Thomas' }
    ];

    grid.innerHTML = suspects.map(s => `
        <button class="btn-primary" style="background:var(--bg-deep); border:1px solid var(--glass-border); color:#fff;" onclick="selectSuspect('${s.id}', this)">${s.name}</button>
    `).join("");
}

function selectSuspect(id, btn) {
    selectedSuspect = id;
    document.querySelectorAll('#suspect-btn-grid button').forEach(b => b.style.borderColor = "var(--glass-border)");
    btn.style.borderColor = "var(--accent-amber)";
    document.getElementById('submit-btn').disabled = false;
}

function submitAccusation() {
    const isCorrect = (selectedSuspect === 'beatrix');
    if (window !== window.parent) {
        window.parent.postMessage({ type: 'accusation_filed', suspect: selectedSuspect, correct: isCorrect }, '*');
    }
    alert(isCorrect ? "ACCUSATION FILED. The forensic evidence is conclusive." : "ACCUSATION LOGGED. The evidence for this suspect is weak.");
    closeTablet();
}

function resetData() {
    if (confirm("Restore factory database from USB clusters? All edits will be lost.")) {
        localStorage.clear();
        location.reload();
    }
}

function validateDB() {
    const hasCommas = DetectiveData.some(row => row.observation.includes(","));
    if (hasCommas) alert("Normalization Fault: Non-atomic data still present in cells.");
    else if (!isUnlocked) alert("Step 1 Passed. Now select the LOG_ID and OBSERVATION headers to define the Composite Key.");
    else alert("Database fully validated and secure.");
}

function showToast(msg) {
    console.log("[DetectiveOS]", msg);
}

function addRow() {
    if (isUnlocked) return;
    DetectiveData.push({ log_id: "#NEW", subject: "Witness", observation: "..." });
    renderTable();
}

function deleteRow(index) {
    if (isUnlocked) return;
    DetectiveData.splice(index, 1);
    renderTable();
}

function showGuide() { document.getElementById("guide-modal").style.display = "flex"; }
function hideGuide() { document.getElementById("guide-modal").style.display = "none"; }

function checkInventoryLocal(id) {
    try {
        if (window.parent && window.parent.Inventory) return window.parent.Inventory.hasItem(id);
    } catch(e) {}
    const inv = JSON.parse(localStorage.getItem('edubytes_inventory') || '[]');
    return inv.includes(id);
}
