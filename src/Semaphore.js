const Timer = require('./Timer')

class Semaphore {
  constructor(interval) {
    this.colorIdx = 0;
    this.interval = interval;
    this.active = false;
    this._listener = () => {};
    this.timer = new Timer(() => this._listener(this._nextColor()), this.interval)
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
    // TODO: yellow in the middle
    this.colorIdx += 1;
    if (this.colorIdx === 3) {
      this.colorIdx = 0;
    }
    
    return this.colorIdx;
  }
  
  onNext(listener) {
    this._listener = listener;
  }
}

module.exports = Semaphore
