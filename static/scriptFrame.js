// Get elements
const video = document.getElementById('video');
const sentenceDisplay = document.getElementById('sentence');

// Initialize webcam
navigator.mediaDevices.getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
    video.onloadedmetadata = () => {
      video.play();
      startPrediction(); // Start prediction only when video is ready
    };
  })
  .catch((error) => {
    console.error("Error accessing webcam: ", error);
    sentenceDisplay.innerText = "Webcam access denied.";
  });

// Function to capture a frame and send to server
function captureFrame() {
  if (!video.videoWidth || !video.videoHeight) return;

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob((blob) => {
    if (!blob) return;

    const formData = new FormData();
    formData.append('image', blob, 'frame.jpg');

    fetch('/predict', {
      method: 'POST',
      body: formData
    })
      .then((response) => response.json())
      .then((data) => {
        sentenceDisplay.innerText = `Predicted Sign: ${data.prediction}`;
      })
      .catch((error) => {
        console.error("Prediction error: ", error);
        sentenceDisplay.innerText = "Prediction failed.";
      });
  }, 'image/jpeg');
}

// Start interval after video is ready
function startPrediction() {
  setInterval(captureFrame, 500);
}
