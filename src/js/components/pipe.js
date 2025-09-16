export class Pipe {

  context = null;
  x = 0;
  y = 0;
  passed = false;
  position = 0; // 0 for top, 1 for bottom

  width = 64;
  height = 512;

  imageLoaded = false;

  image = new Image();

  constructor() {}

  setPosition(position) {
    this.position = position;
    this.image.src = position === 0 ? './images/top_pipe.png' : './images/bottom_pipe.png';
    this.image.onload = () => { this.imageLoaded = true; }
  }

  draw() {
    if (this.context && this.imageLoaded) {
      this.context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  }

}
