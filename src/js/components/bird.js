export class Bird {

  context = null;
  x = 0;
  y = 0;

  width = 34;
  height = 24;
  images = [];
  imgIndex = 0;
  totalImages = 4;
  imageLoaded = false;

  frameCount = 0;
  framesPerImage = 7;

  constructor() {
    for(let i = 0; i < this.totalImages; i++){
      let image = new Image();
      image.src = `/images/flappybird${i}.png`
      image.onload = () => this.imageLoaded = true;
      this.images.push(image);
    }
  }

  draw() {
    if (this.context && this.imageLoaded) {
      this.context.drawImage(this.images[this.imgIndex], this.x, this.y, this.width, this.height);
      
      this.frameCount++;

      if(this.frameCount >= this.framesPerImage){
        this.imgIndex = (this.imgIndex + 1) % this.totalImages;
        this.frameCount = 0;
      }
      
    }
    
  }


}
