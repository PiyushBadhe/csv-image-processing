import axios from "axios";
import fs from "fs";
import path from "path";
import sharp from "sharp";

class ImageProcessor {
  /**
   * Downloads an image from a URL, compresses it by reducing quality by 50%, and saves it with a modified name.
   * @param imageUrl - URL of the image.
   * @param outputDir - Directory where the image will be saved.
   */
  async compressImage(imageUrl: string): Promise<string | null> {
    try {
      const response = await axios({
        url: imageUrl,
        responseType: "arraybuffer",
      });

      const imageBuffer = Buffer.from(response.data);

      const urlParts = new URL(imageUrl);
      const originalFilename = path.basename(urlParts.pathname);

      const ext = path.extname(originalFilename);
      const baseName = path.basename(originalFilename, ext);
      const newFilename = `${baseName}_processed${ext}`;

      const outputDirectory = path.join(__dirname, "../../public/images");
      if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: false });
      }
      const outputFilePath = path.join(outputDirectory, newFilename);

      const compressedImage = await sharp(imageBuffer)
        .jpeg({ quality: 50 })
        .toBuffer();

      fs.writeFileSync(outputFilePath, compressedImage);
      return newFilename;
    } catch (error) {
      console.error("Error processing image:", error);
      return null;
    }
  }
}

export default ImageProcessor;
