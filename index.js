const path = require('path');
const express = require('express');
const app = express();
const socketio = require('socket.io');

// Settings
app.use(express.urlencoded({ extended: true }))
app.set('port', process.env.PORT || 3000);
app.set('views', './views');
app.set('view engine', 'ejs');

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Listening
const server = app.listen(app.get('port'), () => {
    console.log("Server on port: " + app.get('port'));
});

const io = socketio(server);

// |||||||||||||GAME VARIABLES||||||||||||||||||||||||||||||
var rooms = {}; // En cada room ocurren las variables que entran en juego
// |||||||||||||||||||||||||||||||||||||||||||||||||||||||||

// web sockets
io.on('connection', socket => {
    // console.log("New connection", socket.id);
    socket.on('mess', data => {
        io.sockets.emit('serverMess', data);
    })
    socket.on('disconnect', () => {
        getUserRooms(socket).forEach(room => {
            if (rooms[room].count > 0) {
                rooms[room].count -= 1;
            }
            rooms[room].readyUsers = []; // para que no quede registro
            delete rooms[room].users[socket.id];
            // console.log("someone left -->", rooms);
        })
    })
    socket.on('new-user', room => {
        socket.join(room);
        rooms[room].users[socket.id] = "";
        // console.log("-->", rooms);
        socket.to(room).broadcast.emit('user-connected', "New User Connected");
    })
    socket.on('add-mistery', (room, name) => {
        rooms[room].users[socket.id] = name;
        rooms[room].count += 1;
        // console.log("-->", rooms);
        // Para que le llegen a todos los del room incluyendo al emisor
        io.sockets.to(room).emit("state-mistery", rooms[room].count);

        if (rooms[room].count == 3) {
            for (let i in rooms[room].users) {
                rooms[room].readyUsers.push(i);
            }
            // console.log("-->", rooms);
        }
    })
    socket.on('lets-play', room => {
        // CONDICION PARA DETERMINAR SI NO SON LOS MISMOS NOMBRES
        // AND THIS IS HORRIBLE... I KNOW

        // AQUI TAMBIEN SE REALIZA EL INTERCAMBIO DE NOMBRES
        if (rooms[room].justOne) {
            // FIRST USER, SEND THE NAME OF THE SECOND AND THIRD NAME
            io.sockets.to(rooms[room].readyUsers[0]).emit("position",
                {
                    posi: 1,
                    two: rooms[room].users[rooms[room].readyUsers[0]], //Send by First User
                    three: rooms[room].users[rooms[room].readyUsers[1]]
                }); //Send by Second User

            // SECOND USER, SEND THE NAME OF THE THIRD AND FIRST NAME
            io.sockets.to(rooms[room].readyUsers[1]).emit("position",
                {
                    posi: 2,
                    one: rooms[room].users[rooms[room].readyUsers[2]], //Send by Third User
                    three: rooms[room].users[rooms[room].readyUsers[1]]
                }); //Send by by Second User

            // THIRD USER, SEND THE NAME OF THE FIRST AND SECOND NAME
            io.sockets.to(rooms[room].readyUsers[2]).emit("position",
                {
                    posi: 3,
                    one: rooms[room].users[rooms[room].readyUsers[2]], //Send by Third User
                    two: rooms[room].users[rooms[room].readyUsers[0]]
                }); //Send by First User
        }
        rooms[room].justOne = false;

    })
    socket.on('set-question', (room, quest) => {
        socket.to(room).broadcast.emit('get-question', quest);
    })
    socket.on('say-yes', (room, ans) => {
        io.sockets.to(rooms[room].readyUsers[rooms[room].playOrder - 1]).emit('get-yes', 'y');
        rooms[room].answered.push(ans);
        nextPlayer(io, room);
    })
    socket.on('say-no', (room, ans) => {
        io.sockets.to(rooms[room].readyUsers[rooms[room].playOrder - 1]).emit('get-no', 'n');
        rooms[room].answered.push(ans);
        nextPlayer(io, room);
    })
    socket.on('iknow', room => {
        rooms[room].iknow = true;
        socket.to(room).broadcast.emit('get-iknow', 'iknow');
    })
});

// this is not my code https://github.com/carban/Realtime-Chat-App-With-Rooms/blob/master/server.js
function getUserRooms(socket) {
    return Object.entries(rooms).reduce((names, [name, room]) => {
        if (room.users[socket.id] != null) names.push(name)
        return names
    }, [])
}

function nextPlayer(io, room) {

    if (rooms[room].answered.length == 2) {
        var winner = false;
        if (rooms[room].iknow) {
            if (rooms[room].answered[0] == 'y' && rooms[room].answered[1] == 'y') {
                // WINNER
                winner = true;
            }
            rooms[room].iknow = false;
        }

        rooms[room].answered = [];

        if (!winner) {
            // Next Order condition
            if (rooms[room].playOrder == 3) {
                rooms[room].playOrder = 0;
            }
            rooms[room].playOrder++;

            // console.log("NEXT: ", rooms[room].playOrder);
            io.sockets.to(room).emit('next-step', rooms[room].playOrder);
        } else {
            // SEND WINNER STATUS
            io.sockets.to(room).emit('winner', rooms[room].playOrder);
            delete rooms[room];
        }
    }
}

// Routes
app.get('/', (req, res) => {
    res.render('index');
})

app.get('/roomcopy', (req, res) => {
    res.render('roomcopy');
})

// Creating a room
app.post('/room', (req, res) => {
    if (rooms[req.body.room] != null) {
        return res.redirect('/')
    }
    rooms[req.body.room] = { users: {}, count: 0, readyUsers: [], playOrder: 1, iknow: false, answered: [], justOne: true };
    res.redirect(req.body.room)
    // console.log("Room created");
})

app.get('/:room', (req, res) => {
    if (rooms[req.params.room] == null) {
        return res.redirect('/');
    } else if (rooms[req.params.room].count >= 3) {
        return res.redirect('/');
    } else {
        res.render('room', { roomName: req.params.room });
    }
})
