var io = null;
var users = [];
var host = null;
var revealed = false;

function init(io_val) {
    io = io_val;
}

function getUsers() {
    if (revealed) {
        return users;
    }

    hiddenUsers = Array(users.length);
    for (var idx = 0; idx < users.length; idx++) {
        const thisVal = users[idx].val ? 'X' : ' '
        hiddenUsers[idx] = { val: thisVal };
    }

    return hiddenUsers
}

function emitUsers() {
    io.emit('users', getUsers());
}

function handleSelection(id, val) {
    if (revealed) {
        return;
    }
    updateOrAddSelection(id, val);
    console.log(users);
    emitUsers();
}

function handleReset(id) {
    if (id != host) {
        return;
    }

    for (var user of users) {
        user.val = null;
    }

    revealed = false;

    emitUsers();
    io.emit('reset_selection');
}

function handleReveal(id) {
    if (id != host) {
        return;
    }

    revealed = true;
    emitUsers();
}

function updateOrAddSelection(id, val) {
    for (const user of users) {
        if (user.id == id) {
            user.val = val;
            return;
        }
    }
    users.push({ id, val });
}

function onConnection(socket) {
    console.log('someone connected - ' + socket.id);
    users.push({id:socket.id, val:null});
    if (host === null) {
      host = socket.id;
      socket.emit('host_set')
    }
  
    emitUsers();
  
    socket.on('selection', handleSelection);
    socket.on('reset', handleReset);
    socket.on('reveal', handleReveal);
  
  
    socket.on('disconnect', () => {
      users = users.filter( (element) => {
        return element.id != socket.id;
      });
  
      if (host === socket.id) {
        host = users[0] ? users[0].id : null;
  
        if (host) {
          io.to(host).emit('host_set')
        }
      }
  
      console.log(socket.id + ' disconnected');
      console.log(users);
      emitUsers();
    });
}

module.exports.init = init;
module.exports.onConnection = onConnection;
