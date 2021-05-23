class Semaphore {
  constructor() {
    this.colorIdx = 0;
    this.colors = ["red", "green", "blue"];
  }

  nextColor() {
    this.colorIdx += 1;
    if (this.colorIdx === 3) {
      this.colorIdx = 0;
    }

    return this.colors[this.colorIdx];
  }
}

module.exports = Semaphore
