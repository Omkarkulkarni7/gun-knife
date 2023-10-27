const axios = require("axios");
const fs = require("fs");
const Jimp = require("jimp");

async function main() {
    const imageFilePath = "img\\darpan.jpg";
    const outputImagePath = "C:\\Users\\Admin\\Desktop\\gun detection\\output\\output.jpg";

    // Read the image file
    const image = fs.readFileSync(imageFilePath, {
        encoding: "base64"
    });

    try {
        // Create promises for both API calls
        const yellowBoxPromise = getBoundingBoxes(image, "https://detect.roboflow.com/gun-detection-tiywn/4", "pYzS2DrM7iNFISXayEgZ", "#FFFF00");
        const redBoxPromise = getBoundingBoxes(image, "https://detect.roboflow.com/knife-detection-hgvy2/1", "pYzS2DrM7iNFISXayEgZ", "#FF0000");

        // Wait for both promises to resolve
        const [yellowBoxes, redBoxes] = await Promise.all([yellowBoxPromise, redBoxPromise]);

        // Load the original image using Jimp
        const originalImage = await Jimp.read(imageFilePath);

        if (originalImage) {
            console.log('Image uploaded in Jimp');

            // Draw yellow boxes
            drawBoxes(originalImage, yellowBoxes, "#FFFF00");

            // Draw red boxes
            drawBoxes(originalImage, redBoxes, "#FF0000");

            // Save the modified image
            originalImage.write(outputImagePath, () => {
                console.log("Modified image saved successfully.");
            });
        }
    } catch (error) {
        console.log(error.message);
    }
}

/// Function to get bounding boxes from the API
async function getBoundingBoxes(image, apiUrl, apiKey, boxColor) {
    try {
        const response = await axios({
            method: "POST",
            url: apiUrl,
            params: {
                api_key: apiKey
            },
            data: image,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        const responseData = await response.data;

        // Filter the response to get the relevant information (class, bbox)
        const boxes = responseData.predictions.map(prediction => {
            const x = prediction.x;
            const y = prediction.y;
            const width = prediction.width;
            const height = prediction.height;
            const classLabel = prediction.class;

            return {
                class: classLabel,
                bbox: { x, y, width, height }
            };
        });

        return { color: boxColor, boxes };
    } catch (error) {
        console.error("Error while fetching bounding boxes:");
        console.error("API URL: ", apiUrl);
        console.error("API Key: ", apiKey);
        console.error("Status Code: ", error.response ? error.response.status : "N/A");
        console.error("Response Data: ", error.response ? error.response.data : "N/A");
        // Handle the error as needed, e.g., retry or skip the image
        throw error;
    }
}


// Function to draw colored boxes on the image
function drawBoxes(image, boxesInfo, color) {
    try {
        if (boxesInfo && boxesInfo.boxes && Array.isArray(boxesInfo.boxes)) {
            boxesInfo.boxes.forEach(box => {
                let x = box.bbox.x;
                let y = box.bbox.y;
                const width = box.bbox.width;
                const height = box.bbox.height;

                x = x - image.getWidth()/40 ;
                y = y - image.getHeight()/45 ;

                for (let i = 0; i < width; i++) {
                    // Top border
                    image.setPixelColor(Jimp.cssColorToHex(color), x + i, y);
                    // Bottom border
                    image.setPixelColor(Jimp.cssColorToHex(color), x + i, y + height - 1);
                }
                for (let j = 0; j < height; j++) {
                    // Left border
                    image.setPixelColor(Jimp.cssColorToHex(color), x, y + j);
                    // Right border
                    image.setPixelColor(Jimp.cssColorToHex(color), x + width - 1, y + j);
                }
            });
        } else {
            console.log("Invalid or missing boxesInfo data");
        }
    } catch (error) {
        console.error("Error while drawing boxes:", error);
    }
}



main();
