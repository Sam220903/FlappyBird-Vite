export class Bird {

  context = null;
  x = 0;
  y = 0;

  width = 55;
  height = 57;
  images = [];
  imgIndex = 0;
  totalImages = 7;
  imageLoaded = false;

  frameCount = 0;
  framesPerImage = 7;

  constructor() {
    for(let i = 0; i < this.totalImages; i++){
      let image = new Image();
      image.src = `./images/eagle${i}.png`
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


  draw() {
    if (this.context && this.imageLoaded) {
      this.context.save();
      // Flip horizontally around the center of the bird
      this.context.translate(this.x + this.width / 2, this.y + this.height / 2);
      this.context.scale(-1, 1);
      this.context.drawImage(
        this.images[this.imgIndex],
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
      this.context.restore();

      this.frameCount++;
      if(this.frameCount >= this.framesPerImage){
        this.imgIndex = (this.imgIndex + 1) % this.totalImages;
        this.frameCount = 0;
      }
    }
  }

  // draw() {
  //   if (this.context && this.imageLoaded) {
  //     this.context.drawImage(this.images[this.imgIndex], this.x, this.y, this.width, this.height);
      
  //     this.frameCount++;

  //     if(this.frameCount >= this.framesPerImage){
  //       this.imgIndex = (this.imgIndex + 1) % this.totalImages;
  //       this.frameCount = 0;
  //     }
      
  //   }
    
  // }


}
