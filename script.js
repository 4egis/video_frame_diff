let video = document.getElementById('videoPlayer');
let csvData = [];

document.getElementById('videoInput').addEventListener('change', function() {
  const file = this.files[0];
  const url = URL.createObjectURL(file);
  video.src = url;
});

function updateLinePosition() {
  const splitLinePosition = document.getElementById('splitLine').value;
  const videoWidth = document.getElementById('videoPlayer').offsetWidth;
  const linePosition = (splitLinePosition / 100) * videoWidth;
  document.getElementById('splitLineVisual').style.left = linePosition + 'px';
}

document.getElementById('videoPlayer').addEventListener('loadedmetadata', function() {
  updateLinePosition();
});

window.addEventListener('resize', function() {
  updateLinePosition();
});

// Analyze frames by counting average pixel intensity difference between each two consecutive frames
// and saves it in global variable 'csvData'
function analyzeFrames() {
  csvData = [["Frame number", "Left Average Pixel Intensity Difference", "Right Average Pixel Intensity Difference"]];
  let canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d');
  let lastImageData = null;
  let splitLinePos = document.getElementById("splitLine").value / 100;

  video.addEventListener('seeked', function() {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    if (lastImageData) {
      let leftDiff = 0, rightDiff = 0;
      let splitLinePixelPos = Math.floor(canvas.width * splitLinePos);

      for (let i = 0; i < imageData.length; i+=4) {
        let x = (i / 4) % canvas.width;
        let diff = Math.abs(imageData[i] - lastImageData[i]);

        if (x < splitLinePixelPos) {
          leftDiff += diff;
        } else {
          rightDiff += diff;
        }
      }
      
      let leftAvgDiff = leftDiff / (canvas.width * canvas.height * splitLinePos);
      let rightAvgDiff = rightDiff / (canvas.width * canvas.height * (1 - splitLinePos));

      csvData.push([video.currentTime, leftAvgDiff, rightAvgDiff]);
    }
    
    lastImageData = new Uint8Array(imageData);
    
    if (video.currentTime < video.duration) {
      video.currentTime += 1;
    } else {
      video.removeEventListener('seeked', arguments.callee);
      alert("Analysis complete!");
    }
  });

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  video.currentTime = 0;
}

// Exports data to csv file 
// Data is stored in following way:
// [Frame number, Left Average Pixel Intensity Difference, Right Average Pixel Intensity Difference]
function exportCSV() {
  let csvContent = csvData.map(e => e.join(",")).join("\n");
  let blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  let link = document.createElement("a");
  let url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "motion_analysis.csv");
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
