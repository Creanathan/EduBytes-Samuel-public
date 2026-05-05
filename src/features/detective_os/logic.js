/**
 * Detective OS Logic v4.2 - Forensic Normalization Engine (COMPACT)
 */

const DEFAULT_DATA = [
    { log_id: "#001", subject: "Leduc (Butler)", observation: "Hallway, Kitchen, Dining Room. Claims he was prepping tea." },
    { log_id: "#002", subject: "Beatrix (Nanny)", observation: "Nursery, Laundry. Claims she was washing the cradle linens." },
    { log_id: "#003", subject: "Thomas (Partner)", observation: "Living Room. Claims he was playing piano to calm his nerves." },
    { log_id: "#004", subject: "Off. Miller", observation: "Crime Scene. Found the body at 22:00." },
    { log_id: "#005", subject: "System Registry", observation: "Piano (ERR_DATA_BLOCK_772: HIDDEN_RESTRICTED)" }
];

const PROFILES = {
    "Leduc": { name: "Jeanne-Paul Leduc", role: "Butler", bio: "Loyal servant for 20 years. Alibi: Tea prep.", icon: "🤵" },
    "Beatrix": { name: "Beatrix Lémur", role: "Nanny", bio: "Childcare specialist. Lie detected in logs.", icon: "👵" },
    "Thomas": { name: "Thomas Souvellier", role: "Partner", bio: "Amelia's partner. Professor.", icon: "🧐" }
};

let DetectiveData = [];
let isUnlocked = false;
let isImported = false;
let currentStep = 1;
let selectedKeys = new Set();
let crossRefQueryCount = 0;
let selectedSuspect = null;

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
    const importBtn = document.getElementById("import-btn");
    const repairBtn = document.getElementById("repair-btn");

    if (isUnlocked || isImported) {
        if (isUnlocked) {
            overlay.style.display = "none";
            document.getElementById("nav-crossref").classList.add("nav-reveal");
            document.getElementById("nav-accusation").classList.add("nav-reveal");
        } else {
            document.getElementById("setup-title").innerText = "INTEGRITY ERROR";
            importBtn.style.display = "none";
            repairBtn.style.display = "block";
        }
        return;
    }

    if (checkInventoryLocal('usb_stick')) {
        document.getElementById("setup-title").innerText = "USB DATA DETECTED";
        importBtn.style.display = "block";
    }
}

function startImport() {
    const importBtn = document.getElementById("import-btn");
    const loadingBox = document.getElementById("loading-box");
    const bar = document.getElementById("loading-bar-fill");
    
    importBtn.style.display = "none";
    loadingBox.style.display = "block";
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += 5;
        bar.style.width = `${progress}%`;
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                isImported = true;
                DetectiveData = JSON.parse(JSON.stringify(DEFAULT_DATA));
                localStorage.setItem('Detective_os_imported', 'true');
                localStorage.setItem('Detective_os_data', JSON.stringify(DetectiveData));
                checkSetup();
            }, 400);
        }
    }, 50);
}

function showRepairInterface() {
    document.getElementById("screen-overlay").style.display = "none";
    renderTable();
}

function updateIntegrityMeter() {
    const bar = document.getElementById("integrity-bar");
    const label = document.getElementById("integrity-percent");
    let percent = isUnlocked ? 100 : (isImported ? (currentStep === 1 ? 25 : 50 + selectedKeys.size * 25) : 0);
    if (percent > 100) percent = 100;
    bar.style.width = `${percent}%`;
    label.innerText = `${percent}%`;
}

function renderTable() {
    const tbody = document.querySelector("#Detective-db tbody");
    const thead = document.querySelector("#Detective-db thead tr");
    if (!tbody) return;
    tbody.innerHTML = "";
    updateIntegrityMeter();

    if (currentStep === 2 && !isUnlocked) {
        thead.querySelectorAll("th").forEach(th => {
            const col = th.innerText.toLowerCase();
            if (col === "cmd") return;
            th.style.cursor = "pointer";
            th.onclick = () => toggleKey(col);
            th.style.color = selectedKeys.has(col) ? "var(--accent-gold)" : "var(--text-low)";
        });
    }

    DetectiveData.forEach((row, index) => {
        const tr = document.createElement("tr");
        let obs = row.observation;
        if (obs.includes("ERR_DATA_BLOCK") && isUnlocked) obs = "Piano. Silver Key missing. Subject B. Lemur nearby.";
        const isEditable = !isUnlocked;
        tr.innerHTML = `
            <td contenteditable="${isEditable}" onblur="editCell(${index}, 'log_id', this.innerText)">${row.log_id}</td>
            <td style="color:var(--accent-gold); font-weight:bold;">${isUnlocked ? row.subject : "[REDACTED]"}</td>
            <td contenteditable="${isEditable}" class="${(obs.includes(",") && currentStep === 1) ? 'cell-error' : ''}" onblur="editCell(${index}, 'observation', this.innerText)">${obs}</td>
            <td>${!isUnlocked ? `<button onclick="deleteRow(${index})" style="background:none; border:none; color:var(--accent-error); cursor:pointer;">✕</button>` : '✓'}</td>
        `;
        tbody.appendChild(tr);
    });
}

function editCell(index, field, val) {
    if (isUnlocked) return;
    DetectiveData[index][field] = val.trim();
    localStorage.setItem('Detective_os_data', JSON.stringify(DetectiveData));
    if (!DetectiveData.some(r => r.observation.includes(",")) && currentStep === 1) currentStep = 2;
    renderTable();
    checkWin();
}

function toggleKey(col) {
    if (selectedKeys.has(col)) selectedKeys.delete(col);
    else selectedKeys.add(col);
    renderTable();
    checkWin();
}

function checkWin() {
    const keys = Array.from(selectedKeys);
    if (currentStep === 2 && keys.includes("id") && keys.some(k => k.includes("observation")) && keys.length === 2) {
        isUnlocked = true;
        localStorage.setItem('Detective_os_unlocked', 'true');
        document.getElementById("nav-crossref").classList.add("nav-reveal");
        document.getElementById("nav-accusation").classList.add("nav-reveal");
        renderTable();
        renderSuspectProfiles();
        if (window !== window.parent) window.parent.postMessage({ type: 'normalization_complete' }, '*');
    }
}

function renderSuspectProfiles() {
    const container = document.getElementById("suspect-profiles-container");
    const placeholder = document.getElementById("profile-placeholder");
    if (!container) return;
    if (!isUnlocked) { placeholder.style.display = "flex"; container.innerHTML = ""; return; }
    placeholder.style.display = "none";
    container.innerHTML = Object.keys(PROFILES).map(id => {
        const p = PROFILES[id];
        return `<div class="profile-card"><div style="display:flex; align-items:center; gap:8px;"><div class="profile-avatar">${p.icon}</div><div class="profile-name">${p.name}</div></div><div class="profile-meta"><b>${p.role}</b>: ${p.bio}</div></div>`;
    }).join("");
}

function switchTab(name) {
    if (name !== 'database' && !isUnlocked) return;
    ['database', 'crossref', 'accusation'].forEach(t => {
        const el = document.getElementById('tab-' + t);
        const nav = document.getElementById('nav-' + t);
        if (el) el.style.display = (t === name) ? 'block' : 'none';
        if (nav) nav.classList.toggle('active', t === name);
    });
    if (name === 'accusation') buildAccusationPanel();
}

function validateDB() {
    const fb = document.getElementById("validate-feedback");
    const manualBtn = document.getElementById("manual-btn");
    fb.style.display = "block";
    const hasCommas = DetectiveData.some(r => r.observation.includes(","));
    if (hasCommas) { 
        fb.style.color = "var(--accent-error)"; 
        fb.innerHTML = "ERROR: Non-atomic data."; 
        if (manualBtn) manualBtn.classList.add("highlight-manual");
    } else if (!isUnlocked) { 
        fb.style.color = "var(--accent-gold)"; 
        fb.innerHTML = "STEP 1 PASSED: Select ID and Observation headers."; 
        if (manualBtn) manualBtn.classList.add("highlight-manual");
    } else { 
        fb.style.color = "var(--accent-cyan)"; 
        fb.innerHTML = "VERIFIED: 1NF Compliant."; 
        if (manualBtn) manualBtn.classList.remove("highlight-manual");
    }
}

function runCrossRef() {
    const suspect = document.getElementById('crossref-suspect').value.toLowerCase();
    const keyword = document.getElementById('crossref-keyword').value.trim().toLowerCase();
    const results = document.getElementById('crossref-results');
    const matches = DetectiveData.filter(r => (!suspect || r.subject.toLowerCase().includes(suspect)) && (!keyword || r.observation.toLowerCase().includes(keyword)));
    results.querySelector('tbody').innerHTML = matches.map(r => `<tr><td>${r.log_id}</td><td style="color:var(--accent-gold)">${r.subject}</td><td>${r.observation}</td></tr>`).join("");
    results.style.display = matches.length > 0 ? "block" : "none";
    const alert = document.getElementById('contradiction-alert');
    if (keyword.includes('piano') && matches.some(r => r.observation.includes('B. Lemur'))) {
        alert.style.display = "block";
        alert.innerHTML = `<div style="background:rgba(255, 62, 62, 0.05); border:1px solid var(--accent-error); padding:10px; border-radius:10px; font-size:10px; color:var(--accent-error);"><strong>⚠ CONTRADICTION:</strong> Log #005 identifies Beatrix Lémur at the Piano. Alibi #002 conflicts.</div>`;
    } else alert.style.display = "none";
    crossRefQueryCount++;
    localStorage.setItem('Detective_os_queries', crossRefQueryCount);
}

function buildAccusationPanel() {
    const gate = document.getElementById('accusation-gate-msg');
    const panel = document.getElementById('accusation-panel');
    if (crossRefQueryCount === 0) return;
    gate.style.display = "none";
    panel.style.display = "block";
    document.getElementById('investigation-summary').innerHTML = "<strong>FINDING:</strong> Nanny alibi contradiction detected (Piano logs).";
    document.getElementById('suspect-btn-grid').innerHTML = ['Leduc', 'Beatrix', 'Thomas'].map(s => `<button class="action-btn" style="background:rgba(0,0,0,0.4); border:1px solid var(--border-subtle); color:#fff;" onclick="selectSuspect('${s.toLowerCase()}', this)">${s}</button>`).join("");
}

function selectSuspect(id, btn) {
    selectedSuspect = id;
    document.querySelectorAll('#suspect-btn-grid button').forEach(b => b.style.borderColor = "var(--border-subtle)");
    btn.style.borderColor = "var(--accent-gold)";
    document.getElementById('submit-btn').disabled = false;
}

function submitAccusation() {
    const isCorrect = (selectedSuspect === 'beatrix');
    if (window !== window.parent) window.parent.postMessage({ type: 'accusation_filed', suspect: selectedSuspect, correct: isCorrect }, '*');
    alert(isCorrect ? "REPORT SUBMITTED." : "REPORT FILED. Evidence weak.");
    closeTablet();
}

function resetData() { if (confirm("RESET SYSTEM?")) { localStorage.clear(); location.reload(); } }
function showGuide() { 
    document.getElementById("guide-modal").style.display = "flex"; 
    const manualBtn = document.getElementById("manual-btn");
    if (manualBtn) manualBtn.classList.remove("highlight-manual");
}
function hideGuide() { document.getElementById("guide-modal").style.display = "none"; }
function addRow() { if (!isUnlocked) { DetectiveData.push({ log_id: "#NEW", subject: "Witness", observation: "..." }); renderTable(); } }
function deleteRow(index) { if (!isUnlocked) { DetectiveData.splice(index, 1); renderTable(); } }
function checkInventoryLocal(id) { try { if (window.parent && window.parent.Inventory) return window.parent.Inventory.hasItem(id); } catch(e) {} return JSON.parse(localStorage.getItem('edubytes_inventory') || '[]').includes(id); }
