const io = require('socket.io-client')
const socket = io("http://localhost:3001");

socket.onAny((eventName, ...args) => {
  console.log(eventName, args)
});
