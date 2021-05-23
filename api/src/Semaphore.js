class Semaphore {
  constructor() {
    this.colorIdx = 0;
    this.interval = 2000;
  }

  nextColor() {
    this.colorIdx += 1;
    if (this.colorIdx === 3) {
      this.colorIdx = 0;
    }
    
    return this.colorIdx;
  }
}

module.exports = Semaphore
