const rooms = [
    "hallway.html",
    "nursery.html",
    "living_room.html"
];

//Checkt of bestandsnaam bestaat
let currentIndex = rooms.findIndex(room => window.location.href.includes(room));


function nextRoom() {
    let nextIndex = (currentIndex + 1) % rooms.length;

    window.location.href = rooms[nextIndex];
}


function previousRoom() {
    let prevIndex = (currentIndex - 1 + rooms.length) % rooms.length;

    window.location.href = rooms[prevIndex];
}