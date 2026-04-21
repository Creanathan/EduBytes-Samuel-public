/**
 * Police OS Logic - 1NF Normalization Puzzle
 * Developer: Detective Louis Dekoning (In-Lore)
 */

// Hardcoded initial "Dirty" database
let policeData = [
    { log_id: "#001", officer: "Off. Miller", searched_rooms: "Kitchen" },
    { log_id: "#002", officer: "Det. Louis", searched_rooms: "Nursery, Living Room, Hallway" },
    { log_id: "#003", officer: "Off. Hayes", searched_rooms: "Study, Master Bedroom" },
    { log_id: "#004", officer: "Sgt. Cross", searched_rooms: "Bathroom" }
];

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
}

/**
 * De Interactie (Atoomsplitser)
 * Cuts the string by comma, duplicates metadata, and replaces the row.
 */
function splitData(index) {
    const corruptRow = policeData[index];
    
    // 1. Split the data by comma
    const roomsArray = corruptRow.searched_rooms.split(",").map(room => room.trim());

    // 2. Remove the original corrupt row from the array (simulating .remove())
    policeData.splice(index, 1);

    // 3. For each room, generate a new row duplicating the crucial Log_ID and Officer data
    const newRows = roomsArray.map(room => {
        return {
            log_id: corruptRow.log_id,
            officer: corruptRow.officer,
            searched_rooms: room
        };
    });

    // Insert the newly generated atomic rows at the exact same location
    policeData.splice(index, 0, ...newRows);

    // Re-render the visual table
    renderTable();
}

/**
 * 4. Acceptatiecriteria (Definition of Done)
 * Checks if the table is 100% in 1NF and triggers the lore reward.
 */
function checkWinCondition() {
    // Determine if any commas exist in the current dataset
    const isCorrupted = policeData.some(row => row.searched_rooms.includes(","));

    if (!isCorrupted) {
        triggerSuccessState();
    }
}

let isUnlocked = false;

function triggerSuccessState() {
    // Prevent triggering multiple times
    if (isUnlocked) return;
    isUnlocked = true;

    // UI Update 1: Remove Error Banner
    const banner = document.getElementById("error-banner");
    banner.style.display = "none";

    // UI Update 2: Neon Green Table Borders
    const table = document.getElementById("police-db");
    table.classList.add("success-glow");

    // UI Update 3: Lore Integration (Reward Popup)
    const reward = document.getElementById("reward-section");
    reward.style.display = "block";
}
