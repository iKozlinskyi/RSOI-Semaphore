const {
  CONNECTION_EVT,
  MALFUNCTION_EVT,
  POWER_STATE_EVT,
  SET_TIME_EVT,
  MODE_EVT,
  MODE_WAIT,
  MODE_ACTIVE,
  TURN_ON_EVT,
  TURN_OFF_EVT,
  COLOR_EVT,
  DEMAND_EVT
} = require("./src/constants")
const Semaphore = require('./src/Semaphore')
const PORT = process.env.PORT || 3001
const io = require("socket.io")(PORT, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let id = 0;
const sem = new Semaphore(2000);
sem.onNext((color) => {
  io.sockets.emit(COLOR_EVT, {id, color, timestamp: new Date()})
  id++;
})

let currentTime = 0;

io.on(CONNECTION_EVT, (socket) => {
  console.log("a user connected");
  if (!sem.active) {
    sem.start();
  }

  socket.on(POWER_STATE_EVT, ({state: power}) => {
    if (power) {
      sem.start();
      io.sockets.emit(TURN_ON_EVT, {id, timestamp: new Date()})
    } else {
      sem.stop();
      io.sockets.emit(TURN_OFF_EVT, {id, timestamp: new Date()})
    }
    id++;
  })

  socket.on(MALFUNCTION_EVT, ({state: malfunction}) => {
    if (!malfunction) {
      sem.start();
      io.sockets.emit(TURN_ON_EVT, {id, timestamp: new Date()})
    } else {
      sem.stop();
      io.sockets.emit(TURN_OFF_EVT, {id, timestamp: new Date()})
    }
    id++;
  })

  socket.on(SET_TIME_EVT, ({time}) => {
    if (time === null) {
      return;
    }
    currentTime = Number(time.substring(0, time.indexOf(":")))
    let mode;
    if (currentTime <= 6 && sem.active) {
      mode = MODE_WAIT
      sem.stop();
    } else if(currentTime > 6 && !sem.active) {
      mode = MODE_ACTIVE
      sem.start();
    }
    
    if (!!mode) {
      io.sockets.emit(MODE_EVT, {mode: mode, id, timestamp: new Date()})
      id++;
    }
  })

  socket.on(DEMAND_EVT, () => {
    if (currentTime > 6) {
      return
    }
    io.sockets.emit(MODE_EVT, {mode: MODE_ACTIVE, id, timestamp: new Date()})
    id++;
    io.sockets.emit(COLOR_EVT, {id, color: 2, timestamp: new Date()})
    id++;
    setTimeout(() => {
      io.sockets.emit(MODE_EVT, {mode: MODE_WAIT, id, timestamp: new Date()})
      id++;
    }, sem.interval)
  })
});
