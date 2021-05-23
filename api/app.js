const express = require("express");
const app = express();
const Semaphore = require('./src/Semaphore')
const io = require("socket.io")(3000, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});



let id = 0;
const sem = new Semaphore();
io.on("connection", (socket) => {
  console.log("a user connected");

  setInterval(() => {
    socket.emit("color", { id: id++, color: sem.nextColor() });
  }, 2000);
});
