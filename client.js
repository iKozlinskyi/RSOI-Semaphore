const io = require('socket.io-client')
const socket = io("http://localhost:3001");


socket.on('color', (color) => {
  console.log("Color: ", color)
})

socket.onAny((eventName, ...args) => {
  console.log(eventName)
});
