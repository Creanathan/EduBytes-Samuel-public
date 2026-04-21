const rooms = [
    "living_room.html",
    "hallway.html",
    "nursery.html"
];

//Checkt of bestandsnaam bestaat
let currentIndex = rooms.findIndex(room => window.location.href.includes(room));


function nextRoom() {
    let nextIndex = (currentIndex + 1) % rooms.length;

    if (currentIndex < nextIndex) {
        window.location.href = rooms[nextIndex];
    }
}

function previousRoom() {
    let prevIndex = (currentIndex - 1 + rooms.length) % rooms.length;

    if (currentIndex > prevIndex) {
        window.location.href = rooms[prevIndex];
    }
}

// Functie om de Police Tablet te openen
function openTablet() {
    // Navigate to the correct relative path based on current folder depth
    if (window.location.href.includes('/rooms/')) {
        window.location.href = "../../normalization_demo/index.html";
    } else {
        window.location.href = "../normalization_demo/index.html";
    }
}

// Luister naar de pijl naar beneden op het toetsenbord
document.addEventListener('keydown', function(event) {
    if (event.key === "ArrowDown" || event.key === "s" || event.key === "S") {
        openTablet();
    }
});

// Koppel de visuele "BOTTOM" knop als deze bestaat op de pagina
document.addEventListener("DOMContentLoaded", () => {
    const btnBottom = document.getElementById("btn-bottom");
    if (btnBottom) {
        btnBottom.onclick = openTablet;
    }
});