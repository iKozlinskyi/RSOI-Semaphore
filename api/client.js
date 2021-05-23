const io = require('socket.io-client')
const socket = io("http://localhost:3000");


socket.on('color', (color) => {
  console.log("Color: ", color)
})

