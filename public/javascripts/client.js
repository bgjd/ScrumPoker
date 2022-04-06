const socket = io();
const CARDS = ['0', '½', '1', '3', '5', '8', '13', '20', '40', '100', '?'];
var SELECTED_CARD = null;

function generateSelection() {
    var selectionDiv = document.querySelector('#selection');
    selectionDiv.innerHTML = ''

    for (const card of CARDS) {
        var thisDiv = document.createElement('div');
        thisDiv.classList.add('card');
        thisDiv.innerHTML = card;
        thisDiv.addEventListener('click', selectionListener);
        selectionDiv.appendChild(thisDiv);

        if (card === SELECTED_CARD) {
            thisDiv.style.backgroundColor = 'yellow';
        }
    }
}

function handleResetSelection() {
    SELECTED_CARD = null;
    generateSelection();
}
function selectionListener(e) {
    const val = e.target.innerHTML;
    SELECTED_CARD = val;
    socket.emit('selection', socket.id, val);
    generateSelection();    
 }

function drawVotes(users) {
    var voteContainer = document.querySelector('#votes');
    voteContainer.innerHTML = '';

    for(const user of users) {
        var thisDiv = document.createElement('div');
        thisDiv.classList.add('card');
        thisDiv.innerText = user.val;
        voteContainer.appendChild(thisDiv);
    }
}

function drawHost() {
    console.log('You are now the host yay!');
    var hostContainer = document.querySelector('#host');
    hostContainer.innerHTML = '';

    var resetButton = document.createElement('button');
    var revealButton = document.createElement('button');

    resetButton.innerText = 'Reset';
    resetButton.onclick = () => {
        socket.emit('reset', socket.id);
    };
    hostContainer.appendChild(resetButton);

    revealButton.innerText = 'Reveal';
    revealButton.onclick = () => {
        socket.emit('reveal', socket.id);
    }
    hostContainer.appendChild(revealButton);
}

function init() {
    generateSelection();
}

init();
socket.on('users', drawVotes);
socket.on('reset_selection', handleResetSelection);
socket.on('host_set', drawHost);