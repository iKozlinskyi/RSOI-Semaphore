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
const sem = new Semaphore();

const intervalFactory = () => setInterval(() => {
  io.sockets.emit(COLOR_EVT, { id: id++, color: sem.nextColor() });
}, sem.interval);
let currentTime = 0;

let semTimer = intervalFactory()
io.on(CONNECTION_EVT, (socket) => {
  console.log("a user connected");

  socket.on(POWER_STATE_EVT, ({state}) => {
    if (state) {
      semTimer = intervalFactory(socket)
      sem.active = false;
      io.sockets.emit(TURN_ON_EVT)
    } else {
      clearInterval(semTimer);
      sem.active = false;
      io.sockets.emit(TURN_OFF_EVT)
    }
  })

  socket.on(MALFUNCTION_EVT, ({state}) => {
    if (state) {
      semTimer = intervalFactory(socket)
      sem.active = false;
      io.sockets.emit(TURN_ON_EVT)
    } else {
      clearInterval(semTimer);
      sem.active = false;
      io.sockets.emit(TURN_OFF_EVT)
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

    io.sockets.emit(MODE_EVT, mode)
  })

  socket.on(DEMAND_EVT, () => {
    io.sockets.emit(MODE_EVT, MODE_ACTIVE)
    io.sockets.emit(COLOR_EVT, 2)
    setInterval(() => {
      io.sockets.emit(MODE_EVT, MODE_WAIT)
    }, sem.interval)
  })
});
