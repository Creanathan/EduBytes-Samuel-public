const Game = {

    currentRoom: null,
    roomCache: {},

    async start(room){
        this.loadRoom(room);
    },

    async loadRoom(room){

        this.currentRoom = room;

        let html;

        if(this.roomCache[room]){
            html = this.roomCache[room];
        } else {

            const res = await fetch(`rooms/${room}.html`);
            html = await res.text();
            this.roomCache[room] = html;
        }

        document.getElementById("game").innerHTML = html;

        this.bindActions();
    },

    bindActions(){

        document.querySelectorAll("[data-room]").forEach(el=>{
            el.onclick = () => {
                this.loadRoom(el.dataset.room);
            };
        });

        document.querySelectorAll("[data-item]").forEach(el=>{
            el.onclick = () => {
                this.takeItem(el.dataset.item);
                el.remove();
            };
        });

    },

};