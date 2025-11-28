/*
 * Pixel Sorting Sketch - Unified Gallery
 * by Alan Mo
 */

// --- CONFIGURATION ---
// Array of 12 images
const IMAGE_PATHS = [
  "images/1.jpg",
  "images/2.jpg",
  "images/3.jpg",
  "images/4.jpg",
  "images/5.jpg",
  "images/6.jpg",
  "images/7.jpg",
  "images/8.jpg",
  "images/9.jpg",
  "images/10.jpg",
  "images/11.jpg",
  "images/12.jpg"
];

// IDs matching the HTML containers
const CANVAS_CONTAINER_IDS = [
  "canvas-1", "canvas-2", "canvas-3", "canvas-4",
  "canvas-5", "canvas-6", "canvas-7", "canvas-8",
  "canvas-9", "canvas-10", "canvas-11", "canvas-12"
];

const ANIMATION_SPEED = 5;
// ---------------------

const sketchFactory = (imagePath) => {
  return (p) => {
    let originalImg;
    let displayImg;
    let sortProgress = 0;
    let isHovering = false;

    p.preload = () => {
      originalImg = p.loadImage(imagePath);
      // Resize large images for performance
      if (originalImg.width > 800) {
        originalImg.resize(800, 0); 
      }
    };

    p.setup = () => {
      // Create canvas matching image size
      let canvas = p.createCanvas(originalImg.width, originalImg.height);
      canvas.mouseOver(startSort);
      canvas.mouseOut(startReset);

      p.pixelDensity(1);
      
      displayImg = p.createImage(originalImg.width, originalImg.height);
      originalImg.loadPixels();
      displayImg.loadPixels();

      // Initialize display with original
      displayImg.copy(
        originalImg, 0, 0, originalImg.width, originalImg.height,
        0, 0, displayImg.width, displayImg.height
      );

      p.image(displayImg, 0, 0);
      p.noLoop();
    };

    p.draw = () => {
      if (isHovering) {
        if (sortProgress < p.width) {
          let endCol = p.min(sortProgress + ANIMATION_SPEED, p.width);

          for (let x = sortProgress; x < endCol; x++) {
            let columnPixels = [];
            for (let y = 0; y < p.height; y++) {
              let index = (y * p.width + x) * 4;
              columnPixels.push([
                originalImg.pixels[index + 0],
                originalImg.pixels[index + 1],
                originalImg.pixels[index + 2],
                originalImg.pixels[index + 3]
              ]);
            }

            // Sort based on brightness
            columnPixels.sort((a, b) => p.brightness(a) - p.brightness(b));

            for (let y = 0; y < p.height; y++) {
              let sortedColor = columnPixels[y];
              let index = (y * p.width + x) * 4;
              displayImg.pixels[index + 0] = sortedColor[0];
              displayImg.pixels[index + 1] = sortedColor[1];
              displayImg.pixels[index + 2] = sortedColor[2];
              displayImg.pixels[index + 3] = 255; 
            }
          }
          displayImg.updatePixels();
          sortProgress = endCol;
        } else {
          p.noLoop();
        }
      } else {
        // Reset animation logic
        if (sortProgress > 0) {
          let startCol = p.max(0, sortProgress - ANIMATION_SPEED);
          displayImg.copy(
            originalImg, startCol, 0, ANIMATION_SPEED, p.height, 
            startCol, 0, ANIMATION_SPEED, p.height
          ); 
          sortProgress = startCol;
        } else {
          p.noLoop();
        }
      }
      p.image(displayImg, 0, 0);
    };

    function startSort() {
      isHovering = true;
      sortProgress = 0;
      displayImg.copy(
        originalImg, 0, 0, originalImg.width, originalImg.height,
        0, 0, displayImg.width, displayImg.height
      );
      p.loop(); 
    }

    function startReset() {
      isHovering = false;
      p.loop(); 
    }
  }; 
}; 

window.addEventListener("load", () => {
  for (let i = 0; i < CANVAS_CONTAINER_IDS.length; i++) {
    // Check if the container exists to prevent errors
    if(document.getElementById(CANVAS_CONTAINER_IDS[i])) {
      let imagePath = IMAGE_PATHS[i];
      let containerID = CANVAS_CONTAINER_IDS[i];
      let sketch = sketchFactory(imagePath);
      new p5(sketch, containerID);
    }
  }
});