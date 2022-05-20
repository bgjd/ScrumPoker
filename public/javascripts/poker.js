function PokerRoom(io, room_id) {
    this.io = io;
    this.users = [];
    this.host = null;
    this.revealed = false;
    this.roomId = room_id;
}

/* Get the list of user votes, if in revealed mode these will be the true votes, when not in revealed 
 * mode the votes will be replaced with an 'X' */
PokerRoom.prototype.getUsers = function () {
    if (this.revealed) {
        return this.users;
    }

    hiddenUsers = Array(this.users.length);
    for (var idx = 0; idx < this.users.length; idx++) {
        const thisVal = this.users[idx].val ? 'X' : ' '
        hiddenUsers[idx] = { val: thisVal };
    }

    return hiddenUsers
}

PokerRoom.prototype.emitUsers = function () {
    this.io.to(this.roomId).emit('users', this.getUsers());
}

PokerRoom.prototype.updateOrAddSelection = function (id, val) {
    for (const user of this.users) {
        if (user.id == id) {
            user.val = val;
            return;
        }
    }
    this.users.push({ id, val });
}

/* Handle a user making a vote selection */
PokerRoom.prototype.handleSelection = function (id, val) {
    if (this.revealed) {
        return;
    }
    this.updateOrAddSelection(id, val);
    console.log(this.users);
    this.emitUsers();
}

/* Handle resetting the votes */
PokerRoom.prototype.handleReset = function (id) {
    if (id != this.host) {
        return;
    }

    for (var user of this.users) {
        user.val = null;
    }

    this.revealed = false;

    this.emitUsers();
    this.io.to(this.roomId).emit('reset_selection');
}

/* Handle revealing everyone's votes */
PokerRoom.prototype.handleReveal = function (id) {
    if (id != this.host) {
        return;
    }

    this.revealed = true;
    this.emitUsers();
}

/* Handle a new user joining */
PokerRoom.prototype.onConnection = function (socket) {
    console.log('someone connected - ' + socket.id);
    this.users.push({id:socket.id, val:null});
    if (this.host === null) {
      this.host = socket.id;
      socket.emit('host_set')
    }
  
    this.emitUsers();
  
    socket.on('selection', this.handleSelection.bind(this));
    socket.on('reset', this.handleReset.bind(this));
    socket.on('reveal', this.handleReveal.bind(this));
  
  
    socket.on('disconnect', () => {
      this.users = this.users.filter( (element) => {
        return element.id != socket.id;
      });
  
      if (this.host === socket.id) {
        this.host = this.users[0] ? this.users[0].id : null;
  
        if (this.host) {
          this.io.to(this.host).emit('host_set')
        }
        else {
            socket.emit('delete_room');
        }
      }
  
      console.log(socket.id + ' disconnected');
      console.log(this.users);
      this.emitUsers();
    });
}

module.exports = PokerRoom;