const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(express.static("public"));

let rooms = {};

io.on("connection", socket => {

  socket.on("join", room => {
    socket.join(room);
    if (!rooms[room]) rooms[room] = { players: {}, bullets: [] };

    rooms[room].players[socket.id] = {
      x: 100, y: 300, hp: 100, flying: false
    };
  });

  socket.on("update", ({ room, data }) => {
    const p = rooms[room]?.players[socket.id];
    if (!p) return;

    // 🛡️ Anti-Cheat: Max Speed
    if (Math.abs(data.x - p.x) < 20) {
      Object.assign(p, data);
    }
  });

  socket.on("shoot", ({ room, bullet }) => {
    rooms[room]?.bullets.push(bullet);
  });

  socket.on("disconnect", () => {
    for (let r in rooms) {
      delete rooms[r].players[socket.id];
    }
  });
});

setInterval(() => {
  for (let r in rooms) {
    io.to(r).emit("state", rooms[r]);
  }
}, 1000 / 60);

server.listen(process.env.PORT || 3000);
