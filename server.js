const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let multiplier = 1;
let crashPoint = 0;
let running = false;

function startRound() {
  multiplier = 1;
  crashPoint = (1 / (1 - Math.random())) * 4;
  running = true;

  let interval = setInterval(() => {
    multiplier += 0.05;
    io.emit("multiplier", multiplier.toFixed(2));

    if (multiplier >= crashPoint) {
      clearInterval(interval);
      running = false;
      io.emit("crash", multiplier.toFixed(2));
      setTimeout(startRound, 4000);
    }
  }, 100);
}

io.on("connection", (socket) => {
  socket.emit("multiplier", multiplier.toFixed(2));

  socket.on("cashout", () => {
    socket.emit("cashed", multiplier);
  });
});

server.listen(3000, () => {
  console.log("Server running");
  startRound();
});