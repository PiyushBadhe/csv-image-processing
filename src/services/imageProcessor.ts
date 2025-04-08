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
      const ext: string = path.extname(originalFilename);
      const baseName = path.basename(originalFilename, ext);
      const newFilename = `${baseName}_processed${ext}`;

      // Create output directory if not exists
      const outputDirectory = path.join(__dirname, "../../public/images");
      if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
      }

      const outputFilePath = path.join(outputDirectory, newFilename);

      // Image format
      const metadata = await sharp(imageBuffer).metadata();
      let compressedImage: Buffer;

      const newWidth = metadata?.width
        ? Math.floor(metadata.width / 2)
        : undefined;

      const newHeight = metadata?.height
        ? Math.floor(metadata.height / 2)
        : undefined;

      // Format-specific compression
      switch (metadata.format) {
        case "jpeg":
        case "jpg":
          compressedImage = await sharp(imageBuffer)
            .resize({ width: newWidth, height: newHeight })
            .jpeg({ quality: 50, force: true })
            .toBuffer();
          break;
        case "png":
          compressedImage = await sharp(imageBuffer)
            .resize({ width: newWidth, height: newHeight })
            .png({
              quality: 50,
              compressionLevel: 9,
              effort: 10,
              force: true,
            })
            .toBuffer();
          break;
        case "webp":
        default:
          compressedImage = await sharp(imageBuffer)
            .resize({ width: newWidth, height: newHeight })
            .webp({ quality: 50, effort: 10, force: true })
            .toBuffer();
          break;
      }

      fs.writeFileSync(outputFilePath, compressedImage);
      return newFilename;
    } catch (error) {
      console.error("Error processing image:", error);
      return null;
    }
  }
}

export default ImageProcessor;
