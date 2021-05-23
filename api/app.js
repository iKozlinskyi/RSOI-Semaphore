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
  COLOR_EVT
} = require("./src/constants")
const Semaphore = require('./src/Semaphore')
const io = require("socket.io")(3001, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let id = 0;
const sem = new Semaphore();

const intervalFactory = (socket) => setInterval(() => {
  socket.emit(COLOR_EVT, { id: id++, color: sem.nextColor() });
}, sem.interval);
let currentTime = 0;
io.on(CONNECTION_EVT, (socket) => {
  console.log("a user connected");
  let semTimer = intervalFactory(socket)

  socket.on(POWER_STATE_EVT, ({state}) => {
    if (state) {
      semTimer = intervalFactory(socket)
      sem.active = false;
      socket.emit(TURN_ON_EVT)
    } else {
      clearInterval(semTimer);
      sem.active = false;
      socket.emit(TURN_OFF_EVT)
    }
  })

  socket.on(MALFUNCTION_EVT, ({state}) => {
    if (state) {
      semTimer = intervalFactory(socket)
      sem.active = false;
      socket.emit(TURN_ON_EVT)
    } else {
      clearInterval(semTimer);
      sem.active = false;
      socket.emit(TURN_OFF_EVT)
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

    socket.emit(MODE_EVT, mode)
  })

  socket.on("on-demand", () => {
    socket.emit(MODE_EVT, MODE_ACTIVE)
    socket.emit(COLOR_EVT, 2)
    setInterval(() => {
      socket.emit(MODE_EVT, MODE_WAIT)
    }, sem.interval)
  })
});
