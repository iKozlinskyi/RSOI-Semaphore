class Timer {
  constructor(func, time) {
    this.timer = false;
    this.func = func;
    this.time = time;
  }
  
  start() {
    if (!this.isRunning()) {
      this.timer = setInterval(this.func, this.time);
    }
  }

  stop() {
    clearInterval(this.timer);
    this.timer = false;
  };
  
  isRunning() {
    return this.timer !== false;
  }
}

module.exports = Timer
