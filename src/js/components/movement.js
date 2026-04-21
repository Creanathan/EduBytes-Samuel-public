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