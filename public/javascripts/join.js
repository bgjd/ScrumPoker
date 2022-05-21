function join_room() {
    const room = document.getElementById("room").value;
    location.href = document.location.pathname + '/' + room;
}