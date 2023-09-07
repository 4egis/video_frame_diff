// DOM element selectors.
const videoPlayer = document.getElementById('videoPlayer');
const videoInput = document.getElementById('videoInput');
const splitLine = document.getElementById('splitLine');
const splitLineVisual = document.getElementById('splitLineVisual');

// Global variables.
let csvData = [];
let canvas = createCanvas();
let ctx = canvas.getContext('2d');
let lastImageData = null;

// Event listeners.
videoInput.addEventListener('change', handleVideoInput);
videoPlayer.addEventListener('loadedmetadata', handleVideoMetadata);
window.addEventListener('resize', updateLinePosition);

/**
 * Handles changes to the video input.
 */
function handleVideoInput() {
  const file = this.files[0];
  const url = URL.createObjectURL(file);
  videoPlayer.src = url;
}

/**
 * Handles video metadata loading.
 */
function handleVideoMetadata() {
  updateLinePosition();
  canvas.width = videoPlayer.videoWidth;
  canvas.height = videoPlayer.videoHeight;
}

/**
 * Creates a new canvas element.
 * @return {HTMLCanvasElement} The newly created canvas element.
 */
function createCanvas() {
  return document.createElement('canvas');
}

/**
 * Updates the position of the split line.
 */
function updateLinePosition() {
  const splitLinePosition = splitLine.value;
  const videoWidth = videoPlayer.offsetWidth;
  const linePosition = (splitLinePosition / 100) * videoWidth;
  splitLineVisual.style.left = `${linePosition}px`;
}


/**
 * Analyzes frames from the video.
 */
let analysisInProgress = false;
function analyzeFrames() {

  if (analysisInProgress) return;

  analysisInProgress = true;

  console.time('Execution Time');
  const fps = 25;
  csvData = [
    ['Time', 'Left Average Pixel Intensity Difference', 'Right Average Pixel Intensity Difference']
  ];
  const splitLinePos = splitLine.value / 100;
  const splitLinePixelPos = Math.floor(canvas.width * splitLinePos);

  var timeout = null;

  /**
   * Processes frames as the video is playing.
   */
  function processFrame() {
    let begin = Date.now();
    updateFrame(canvas, ctx, videoPlayer);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    if (lastImageData) {
      const diffs = calculatePixelIntensityDiff(
          imageData, lastImageData, splitLinePixelPos, canvas.width, canvas.height);
      csvData.push([videoPlayer.currentTime, diffs.leftAvgDiff, diffs.rightAvgDiff]);
    }
    lastImageData = new Uint8Array(imageData);

    let delay = 1000 / fps - (Date.now() - begin);

    if (videoPlayer.currentTime < videoPlayer.duration) {
      setTimeout(processFrame, delay);
    } else {
      console.log('Analysis execution time');
      console.timeEnd('Execution Time');
      exportCsv();
      analysisInProgress = false;
    }
  }

  videoPlayer.currentTime = 0;
  videoPlayer.play();
  setTimeout(processFrame, 0);
}

/**
 * Draws the current video frame on the canvas.
 * @param {HTMLCanvasElement} canvas - The canvas element.
 * @param {CanvasRenderingContext2D} ctx - The canvas context.
 * @param {HTMLVideoElement} video - The video element.
 */
function updateFrame(canvas, ctx, video) {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
}

/**
 * Calculates the pixel intensity differences.
 * @param {Uint8Array} imageData - The image data.
 * @param {Uint8Array} lastImageData - The last image data.
 * @param {number} splitLinePixelPos - The split line position in pixels.
 * @param {number} width - The canvas width.
 * @param {number} height - The canvas height.
 * @return {Object} The average pixel intensity differences.
 */
function calculatePixelIntensityDiff(imageData, lastImageData, splitLinePixelPos, width, height) {
  let leftDiff = 0;
  let rightDiff = 0;
  const splitLinePos = splitLinePixelPos / width;

  for (let i = 0; i < imageData.length; i += 4) {
    const x = (i / 4) % width;
    const diff = Math.abs(imageData[i] - lastImageData[i]);

    if (x < splitLinePixelPos) {
      leftDiff += diff;
    } else {
      rightDiff += diff;
    }
  }

  const leftAvgDiff = leftDiff / (width * height * splitLinePos);
  const rightAvgDiff = rightDiff / (width * height * (1 - splitLinePos));

  return {leftAvgDiff, rightAvgDiff};
}

/**
 * Exports the CSV data.
 */
function exportCsv() {
  const csvContent = csvData.map(e => e.join(',')).join('\n');
  const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
  const link = createDownloadLink(blob, 'motion_analysis.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Creates a download link for the file.
 * @param {Blob} blob - The blob data.
 * @param {string} fileName - The file name.
 * @return {HTMLAnchorElement} The created download link.
 */
function createDownloadLink(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  return link;
}
