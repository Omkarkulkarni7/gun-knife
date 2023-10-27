const axios = require("axios");
const fs = require("fs");
const Jimp = require("jimp");
const path = require("path");

async function main() {
    const inputFolder = "C:\\Users\\Admin\\Desktop\\gun detection\\images";
    const outputFolder = "C:\\Users\\Admin\\Desktop\\gun detection\\output";

    try {
        if (!fs.existsSync(outputFolder)) {
            fs.mkdirSync(outputFolder);
        }

        const imageFiles = fs.readdirSync(inputFolder).filter(file => {
            return file.endsWith(".jpg"); // Change the file extension to ".jpg"
        });

        for (const imageFile of imageFiles) {
            const imageFilePath = path.join(inputFolder, imageFile);
            const outputImagePath = path.join(outputFolder, imageFile);
            const image = fs.readFileSync(imageFilePath);

            console.log(imageFilePath);

            try {
                const yellowBoxPromise = getBoundingBoxes(image, "https://detect.roboflow.com/gun-detection-tiywn/4", "pYzS2DrM7iNFISXayEgZ", "#FFFF00");
                const redBoxPromise = getBoundingBoxes(image, "https://detect.roboflow.com/knife-detection-hgvy2/1", "pYzS2DrM7iNFISXayEgZ", "#FF0000");

                const [yellowBoxes, redBoxes] = await Promise.all([yellowBoxPromise, redBoxPromise]);
                const originalImage = await Jimp.read(imageFilePath);

                if (originalImage) {
                    console.log(`Image ${imageFile} uploaded in Jimp`);
                    drawBoxes(originalImage, yellowBoxes, "#FFFF00");
                    drawBoxes(originalImage, redBoxes, "#FF0000");

                    originalImage.write(outputImagePath, () => {
                        console.log(`Modified image saved as ${outputImagePath}`);
                    });
                }
            } catch (error) {
                console.log(`Error processing image ${imageFile}:`, error.message);
            }
        }

        console.log("All images processed successfully.");
    } catch (error) {
        console.error("Error while processing images:", error);
    }
}

// The rest of your code for getBoundingBoxes and drawBoxes remains the same

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
        console.error("Error while fetching bounding boxes:", error);
        // Handle the error as needed, e.g., retry or skip the image
        throw error;
    }
}

function drawBoxes(image, boxesInfo, color) {
    try {
        if (boxesInfo && boxesInfo.boxes && Array.isArray(boxesInfo.boxes)) {
            boxesInfo.boxes.forEach(box => {
                let x = box.bbox.x;
                let y = box.bbox.y;
                const width = box.bbox.width;
                const height = box.bbox.height;

                x = x - image.getWidth() / 40;
                y = y - image.getHeight() / 45;

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
