/*
 * Pixel Sorting Sketch - 4 Instance Version
 * by Alan Mo
 *
 * This script uses p5.js "instance mode" to create four
 * independent sorting animations on the same page.
 */

// --- CONFIGURATION ---
const IMAGE_PATHS = [
  "images/erosion-1.jpg",
  "images/erosion-2.jpg",
  "images/erosion-3.jpg",
  "images/erosion-4.jpg",
];

// The IDs of the HTML divs we will attach our canvases to.
const CANVAS_CONTAINER_IDS = ["canvas-1", "canvas-2", "canvas-3", "canvas-4"];

// How many columns to process per frame. Higher = faster animation.
const ANIMATION_SPEED = 4;
// ---------------------

/**
 * A "factory function" that creates a new, self-contained
 * p5.js sketch for a single image.
 * * @param {string} imagePath - The path to the image to load.
 * @returns {function} A function that p5.js can use as a sketch.
 */
const sketchFactory = (imagePath) => {
  // This is the function p5.js will run.
  // We pass 'p' as an argument, which is the p5.js instance.
  // This is how we call p5 functions like p.createCanvas() instead of createCanvas()
  return (p) => {
    // --- Sketch-specific variables ---
    let originalImg;
    let displayImg;
    let sortProgress = 0;
    let isHovering = false;
    // ---------------------------------

    p.preload = () => {
      originalImg = p.loadImage(imagePath);

      // Resize the image if it's too large for performance
      if (originalImg.width > 800) {
        originalImg.resize(800, 0); // 0 maintains aspect ratio
      }
    };

    p.setup = () => {
      let canvas = p.createCanvas(originalImg.width, originalImg.height);

      // We'll be given the ID of our container when we're created
      // (see the loop at the bottom of this file)

      canvas.mouseOver(startSort);
      canvas.mouseOut(startReset);

      p.pixelDensity(1);
      
      // Create a new image buffer to draw to
      displayImg = p.createImage(originalImg.width, originalImg.height);

      // Load the pixels for BOTH images
      originalImg.loadPixels();
      displayImg.loadPixels();

      // Copy the original image into our display buffer
      displayImg.copy(
        originalImg,
        0,
        0,
        originalImg.width,
        originalImg.height,
        0,
        0,
        displayImg.width,
        displayImg.height
      );

      // Draw the initial image
      p.image(displayImg, 0, 0);

      // Stop the draw() loop
      p.noLoop();
    };

    p.draw = () => {
      if (isHovering) {
        // --- SORTING (on hover) ---
        if (sortProgress < p.width) {
          let endCol = p.min(sortProgress + ANIMATION_SPEED, p.width);

          for (let x = sortProgress; x < endCol; x++) {
            let columnPixels = [];
            for (let y = 0; y < p.height; y++) {
              let index = (y * p.width + x) * 4;
              let r = originalImg.pixels[index + 0];
              let g = originalImg.pixels[index + 1];
              let b = originalImg.pixels[index + 2];
              let a = originalImg.pixels[index + 3];
              columnPixels.push([r, g, b, a]);
            }

            // --- SORT LOGIC ---
            // Sort the pixels: by brightness/luminance (ascending)
            columnPixels.sort((a, b) => {
              return p.brightness(a) - p.brightness(b);
            });
            // ------------------

            // Draw the sorted pixels back to the display image buffer
            for (let y = 0; y < p.height; y++) {
              let sortedColor = columnPixels[y];
              let index = (y * p.width + x) * 4;
              displayImg.pixels[index + 0] = sortedColor[0]; // R
              displayImg.pixels[index + 1] = sortedColor[1]; // G
              displayImg.pixels[index + 2] = sortedColor[2]; // B
              displayImg.pixels[index + 3] = 255; // Force 100% opacity
            }
          }

          displayImg.updatePixels();
          sortProgress = endCol;
        } else {
          p.noLoop();
        }
      } else {
        // --- RESETTING (on unhover) ---
        if (sortProgress > 0) {
          let startCol = p.max(0, sortProgress - ANIMATION_SPEED);

          displayImg.copy(
            originalImg, // Source
            startCol,
            0, // Source X, Y
            ANIMATION_SPEED,
            p.height, // Source W, H
            startCol,
            0, // Dest X, Y
            ANIMATION_SPEED,
            p.height
          ); // Dest W, H

          sortProgress = startCol;
        } else {
          p.noLoop();
        }
      }

      // At the end of every frame, draw the (now modified) displayImg
      p.image(displayImg, 0, 0);
    };

    // --- Event Handlers ---
    function startSort() {
      isHovering = true;

      // Always reset the progress and the image buffer on a new hover.
      sortProgress = 0;
      displayImg.copy(
        originalImg,
        0,
        0,
        originalImg.width,
        originalImg.height,
        0,
        0,
        displayImg.width,
        displayImg.height
      );

      p.loop(); // Start the draw() loop
    }

    function startReset() {
      isHovering = false;
      p.loop(); // Start the draw() loop
    }
  }; // End of the sketch function
}; // End of the factory

// --- Main Execution ---
// This runs when the window is loaded.
// It loops through our container IDs and creates a new
// p5 sketch for each one.
window.addEventListener("load", () => {
  for (let i = 0; i < CANVAS_CONTAINER_IDS.length; i++) {
    // Get the image path and container ID
    let imagePath = IMAGE_PATHS[i];
    let containerID = CANVAS_CONTAINER_IDS[i];

    // Create the sketch function
    let sketch = sketchFactory(imagePath);

    // Create a new p5 instance
    // The 2nd arg is the ID of the HTML element
    // to attach the canvas to.
    new p5(sketch, containerID);
  }
});
