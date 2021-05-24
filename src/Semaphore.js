const Timer = require('./Timer')

class Semaphore {
  constructor(interval) {
    this.colorIdx = 0;
    this.interval = interval;
    this.active = false;
    this._listener = () => {};
    this.timer = new Timer(() => this._listener(this._nextColor()), this.interval)
    this.colorChangeStep = 1;
  }
  
  start() {
    this.active = true;
    this.timer.start()
  }
  
  stop() {
    this.active = false;
    this.timer.stop()
  }

  _nextColor() {
    if (this.colorIdx === 2) {
      this.colorChangeStep = -1
    } else if (this.colorIdx === 0) {
      this.colorChangeStep = 1;
    }
    this.colorIdx += this.colorChangeStep;
    
    return this.colorIdx;
  }
  
  onNext(listener) {
    this._listener = listener;
  }
}

module.exports = Semaphore
