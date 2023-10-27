const axios = require("axios");
const Jimp = require("jimp");
const NodeWebcam = require("node-webcam");

// Create a webcam instance with your desired options
const webcam = NodeWebcam.create({
   width: 1280, // Set the width of the captured frames
   height: 720, // Set the height of the captured frames
   quality: 100, // Set the image quality (0 to 100)
   output: "jpeg", // Set the output format (jpeg, png)
   callbackReturn: "base64", // Specify base64 as the return type for the captured frames
   device: false // Use the default device (false) or specify a specific device (e.g., "/dev/video0")
});

async function main() {
   try {
       const apiUrl1 = "https://detect.roboflow.com/gun-detection-tiywn/4"; // Replace with your first API endpoint
       const apiKey1 = "pYzS2DrM7iNFISXayEgZ"; // Replace with your first API key
       const apiUrl2 = "https://detect.roboflow.com/knife-detection-hgvy2/1"; // Replace with your second API endpoint
       const apiKey2 = "pYzS2DrM7iNFISXayEgZ"; // Replace with your second API key

       // Continuously capture frames at 1 fps and process them for both APIs
       setInterval(async () => {
           try {
               // Capture a frame from the camera
               const frameData = await captureFrame();

               // Process the captured frame for the first API
               await processFrame(frameData, apiUrl1, apiKey1);

               // Process the captured frame for the second API
               await processFrame(frameData, apiUrl2, apiKey2);
           } catch (captureError) {
               console.error("Error capturing frame:", captureError);
           }
       }, 1000); // 1 frame per second (1000 milliseconds)
   } catch (error) {
       console.error("Main function error:", error);
   }
}

// Function to capture a frame from the camera
function captureFrame() {
    return new Promise((resolve, reject) => {
        try {
            webcam.capture("frame", (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        } catch (captureError) {
            reject(captureError);
        }
    });
}

// Function to send a POST request and draw boxes on the image
async function processFrame(frameData, apiUrl, apiKey) {
   try {
       // Send a POST request to the API endpoint
       const response = await axios.post(apiUrl, {
           image: frameData,
           api_key: apiKey
       });

       // Extract the relevant information from the API response (class, bbox)
       const responseData = response.data.predictions.map((prediction) => {
           return {
               class: prediction.class,
               bbox: prediction.bbox,
           };
       });

       // Load the captured frame using Jimp
      try {
         const frameImage = await Jimp.read(Buffer.from(frameData, "base64"));
      } catch (error) {
        console.error("Error reading image:", error);
      }

       // Draw boxes on the frame image
       responseData.forEach((prediction) => {
           const { x, y, width, height } = prediction.bbox;
           const color = prediction.class === "Gun" ? "#FFFF00" : "#FF0000";

           // Draw boxes on the image using Jimp
           for (let i = 0; i < width; i++) {
               frameImage.setPixelColor(Jimp.cssColorToHex(color), x + i, y);
               frameImage.setPixelColor(Jimp.cssColorToHex(color), x + i, y + height - 1);
           }
           for (let j = 0; j < height; j++) {
               frameImage.setPixelColor(Jimp.cssColorToHex(color), x, y + j);
               frameImage.setPixelColor(Jimp.cssColorToHex(color), x + width - 1, y + j);
           }
       });

       // Save the modified frame image
       frameImage.write("frame_with_boxes.jpg", () => {
           console.log("Modified frame image saved successfully.");
       });
   } catch (error) {
       console.error("Error processing frame:", error);
   }
}

main();
