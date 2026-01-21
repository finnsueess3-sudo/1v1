const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 500;

const socket = io();
let room = "";
let state = {};
let me = { x: 100, y: 300, vy: 0, dir: 1, flying: false };
let keys = {};
let anim = 0;

function join() {
  room = document.getElementById("room").value;
  socket.emit("join", room);
  document.getElementById("menu").style.display = "none";
}

function unlock() {
  if (document.getElementById("pin").value === "141211") {
    me.flying = true;
    document.getElementById("pinBox").style.display = "none";
  }
}

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

socket.on("state", s => state = s);

function shoot() {
  socket.emit("shoot", {
    room,
    bullet: { x: me.x, y: me.y, vx: me.dir * 8 }
  });
}

function kick() {
  // Trefferlogik serverseitig erweiterbar
}

function update() {
  if (keys.a) { me.x -= 4; me.dir = -1; anim++; }
  if (keys.d) { me.x += 4; me.dir = 1; anim++; }

  if (!me.flying) {
    me.vy += 0.6;
    me.y += me.vy;
    if (me.y > 300) { me.y = 300; me.vy = 0; }
    if (keys.w && me.y === 300) me.vy = -12;
  } else if (keys[" "]) {
    me.y -= 5;
  }

  socket.emit("update", { room, data: me });
}

function drawStick(x, y) {
  ctx.beginPath();
  ctx.arc(x, y-20, 10, 0, Math.PI*2);
  ctx.moveTo(x, y-10);
  ctx.lineTo(x, y+20);
  ctx.moveTo(x-10, y);
  ctx.lineTo(x+10, y);
  ctx.moveTo(x, y+20);
  ctx.lineTo(x-10+Math.sin(anim*0.1)*5, y+40);
  ctx.moveTo(x, y+20);
  ctx.lineTo(x+10-Math.sin(anim*0.1)*5, y+40);
  ctx.stroke();
}

function render() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  if (!state.players) return;

  for (let id in state.players) {
    drawStick(state.players[id].x, state.players[id].y);
  }

  state.bullets?.forEach(b => {
    b.x += b.vx;
    ctx.fillRect(b.x, b.y, 6, 2);
  });

  update();
  requestAnimationFrame(render);
}

render();
