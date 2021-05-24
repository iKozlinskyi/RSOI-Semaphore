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
sem.onNext((color) => io.sockets.emit(COLOR_EVT, {id: id++, color, timestamp: new Date()}))

let currentTime = 0;

io.on(CONNECTION_EVT, (socket) => {
  console.log("a user connected");
  if (!sem.active) {
    sem.start();
  }

  socket.on(POWER_STATE_EVT, ({state: power}) => {
    console.log(sem, power)
    if (power) {
      sem.start();
      io.sockets.emit(TURN_ON_EVT, {id, timestamp: new Date()})
    } else {
      sem.stop();
      io.sockets.emit(TURN_OFF_EVT, {id, timestamp: new Date()})
    }
  })

  socket.on(MALFUNCTION_EVT, ({state: malfunction}) => {
    if (!malfunction) {
      sem.start();
      io.sockets.emit(TURN_ON_EVT, {id, timestamp: new Date()})
    } else {
      sem.stop();
      io.sockets.emit(TURN_OFF_EVT, {id, timestamp: new Date()})
    }
  })

  socket.on(SET_TIME_EVT, ({time}) => {
    time = Number(time)
    currentTime = time;

    let mode;
    if (currentTime < 6) {
      mode = MODE_WAIT
    } else {
      mode = MODE_ACTIVE
    }

    io.sockets.emit(MODE_EVT, {MODE_EVT: mode, id, timestamp: new Date()})
  })

  socket.on(DEMAND_EVT, () => {
    io.sockets.emit(MODE_EVT, {MODE_EVT: MODE_ACTIVE, id, timestamp: new Date()})
    io.sockets.emit(COLOR_EVT, 2)
    setTimeout(() => {
      io.sockets.emit(MODE_EVT, {MODE_EVT: MODE_WAIT, id, timestamp: new Date()})
    }, sem.interval)
  })
});
