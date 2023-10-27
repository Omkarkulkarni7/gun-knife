const videoElement = document.getElementById('camera-feed');
let imageCount = 0;

// Check if the user's browser supports the getUserMedia API
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Request access to the user's camera
    navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
            videoElement.srcObject = stream;
            videoElement.onloadedmetadata = () => {
                // Capture an image every 2 seconds
                setInterval(() => {
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.width = videoElement.videoWidth;
                    canvas.height = videoElement.videoHeight;
                    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

                    // Save the captured image as JPG
                    const timestamp = new Date().getTime();
                    const imageFileName = `images/capture_${timestamp}_${imageCount}.jpg`;

                    // Increment the imageCount to ensure unique filenames
                    imageCount++;

                    // Convert the canvas data to JPG format
                    const dataURL = canvas.toDataURL('image/jpeg');

                    // Create a Blob from the data URL
                    const blob = dataURItoBlob(dataURL);

                    // Create a Blob URL for the Blob
                    const blobUrl = URL.createObjectURL(blob);

                    // Create a link element to trigger the download
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = imageFileName;
                    link.click();
                }, 2000);
            };
        })
        .catch((error) => {
            console.error('Error accessing the camera:', error);
        });
} else {
    console.error('getUserMedia is not supported in this browser');
}

// Helper function to convert data URI to Blob
function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], { type: 'image/jpeg' });
}
