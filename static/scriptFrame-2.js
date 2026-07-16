let videoStream = null;
let captureInterval = null;

// Function to start webcam and capturing
function startCamera() {
    const video = document.getElementById('video');

    // Access webcam
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            videoStream = stream;
            video.srcObject = stream;
            video.play();

            // Start capturing frames every 100ms
            captureInterval = setInterval(captureFrame, 100);
        })
        .catch(error => {
            console.error("Error accessing webcam: ", error);
        });
}

// Function to stop webcam and capturing
function stopCamera() {
    const video = document.getElementById('video');

    // Stop sending frames
    if (captureInterval) {
        clearInterval(captureInterval);
        captureInterval = null;
    }

    // Stop webcam stream
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }

    video.srcObject = null;
    document.getElementById('sentence').innerText = "Stopped.";
}

// Function to capture frame and send it to server
function captureFrame() {
    const video = document.getElementById('video');

    if (!video.srcObject) {
        return; // Webcam is not started
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
        const formData = new FormData();
        formData.append('frame', blob, 'frame.jpg');

        fetch('/predict', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('sentence').innerText = `Predicted Sign: ${data.prediction}`;
        })
        .catch(error => {
            console.error("Error sending frame to server: ", error);
        });
    }, 'image/jpeg');
}
