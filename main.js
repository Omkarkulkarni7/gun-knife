const axios = require("axios");
const fs = require("fs");
const Jimp = require("jimp");

async function main() {
    const imageFilePath = "images\\gun2.jpg";
    const outputImagePath = "C:\\Users\\Admin\\Desktop\\gun detection\\output\\output.jpg";

    // Read the image file
    const image = fs.readFileSync(imageFilePath, {
        encoding: "base64"
    });

    try {
        // Make the POST request and wait for the response
        const response = await axios({
            method: "POST",
            url: "https://detect.roboflow.com/gun-detection-tiywn/4",
            params: {
                api_key: "pYzS2DrM7iNFISXayEgZ"
            },
            data: image,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        // Parse the response data
        const responseData = await response.data;
        console.log(responseData);

        // Load the original image using Jimp
        const originalImage = await Jimp.read(imageFilePath);

        if (originalImage) {
            console.log('image uploaded in jimp');

            // Loop through the predictions and draw borders
            responseData.predictions.forEach(prediction => {
                let x = prediction.x;
                let y = prediction.y;
                const width = prediction.width;
                const height = prediction.height;

                x = x - originalImage.getWidth()/40 ;
                y = y - originalImage.getHeight()/45 ;
                

                console.log(x, y, width, height);

                // Draw a border around the detected gun (a yellow rectangle)
                for (let i = 0; i < width; i++) {
                    // Top border
                    originalImage.setPixelColor(Jimp.cssColorToHex("#FFFF00"), x + i, y);
                    // Bottom border
                    originalImage.setPixelColor(Jimp.cssColorToHex("#FFFF00"), x + i, y + height - 1);
                }
                for (let j = 0; j < height; j++) {
                    // Left border
                    originalImage.setPixelColor(Jimp.cssColorToHex("#FFFF00"), x, y + j);
                    // Right border
                    originalImage.setPixelColor(Jimp.cssColorToHex("#FFFF00"), x + width - 1, y + j);
                }
            });

            // Save the modified image
            originalImage.write(outputImagePath, () => {
                console.log("Modified image saved successfully.");
            });
        }
    } catch (error) {
        console.log(error.message);
    }
}

main();
