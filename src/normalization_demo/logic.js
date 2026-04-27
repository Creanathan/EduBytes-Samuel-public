/**
 * Police OS Logic - 1NF Normalization Puzzle
 * Developer: Detective Louis Dekoning (In-Lore)
 */

// Initial "Dirty" database
const DEFAULT_DATA = [
    { log_id: "#001", officer: "Off. Miller", searched_rooms: "Kitchen" },
    { log_id: "#002", officer: "Det. Louis", searched_rooms: "Nursery, Living Room, Hallway" },
    { log_id: "#003", officer: "Off. Hayes", searched_rooms: "Study, Master Bedroom" },
    { log_id: "#004", officer: "Sgt. Cross", searched_rooms: "Bathroom" }
];

// Load saved data or use default
let policeData = JSON.parse(localStorage.getItem('police_os_data')) || DEFAULT_DATA;
let isUnlocked = localStorage.getItem('police_os_unlocked') === 'true';

// Initialize UI
document.addEventListener("DOMContentLoaded", renderTable);

function renderTable() {
    const tbody = document.querySelector("#police-db tbody");
    tbody.innerHTML = ""; // Clear existing rows

    policeData.forEach((row, index) => {
        const tr = document.createElement("tr");

        // Check if the cell has a comma (violates 1NF Atomicity)
        const hasComma = row.searched_rooms.includes(",");
        
        let roomsCellHTML = "";
        if (hasComma) {
            // Add corrupt styling and the click interaction (Atomic Splitter)
            roomsCellHTML = `<td class="corrupt-cell" onclick="splitData(${index})">${row.searched_rooms}</td>`;
        } else {
            // Normal, clean cell
            roomsCellHTML = `<td>${row.searched_rooms}</td>`;
        }

        tr.innerHTML = `
            <td>${row.log_id}</td>
            <td>${row.officer}</td>
            ${roomsCellHTML}
        `;
        tbody.appendChild(tr);
    });

    checkWinCondition();
    
    // Auto-trigger if already unlocked from a previous session
    if (isUnlocked) {
        showSuccessUI();
    }
}

function splitData(index) {
    if (isUnlocked) return; // Prevent edits once finalized

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

    // Save to localStorage
    localStorage.setItem('police_os_data', JSON.stringify(policeData));

    renderTable();
}

function checkWinCondition() {
    const isCorrupted = policeData.some(row => row.searched_rooms.includes(","));
    if (!isCorrupted) {
        triggerSuccessState();
    }
}

function triggerSuccessState() {
    if (isUnlocked) return;
    isUnlocked = true;
    localStorage.setItem('police_os_unlocked', 'true');
    showSuccessUI();
}

function showSuccessUI() {
    // UI Update 1: Remove Error Banner
    const banner = document.getElementById("error-banner");
    if (banner) banner.style.display = "none";

    // UI Update 2: Show Success Banner
    const success = document.getElementById("success-banner");
    if (success) success.style.display = "flex";

    // UI Update 3: Neon Green Table Borders
    const table = document.getElementById("police-db");
    if (table) table.classList.add("success-glow");
}
