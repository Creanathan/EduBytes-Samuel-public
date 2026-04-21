// Helper for explicit spatial routing
function goToLocation(url) {
    window.location.href = url;
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

// Luister naar de pijl naar beneden op het toetsenbord (Voor Tablet)
document.addEventListener('keydown', function(event) {
    if (event.key === "ArrowDown" || event.key === "s" || event.key === "S") {
        openTablet();
    }
});
