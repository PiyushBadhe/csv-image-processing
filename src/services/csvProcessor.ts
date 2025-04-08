import ProcessedCsvRepo from "@repositories/ProcessedCsvRepo";
import ProcessedImagesRepo from "@repositories/ProcessedImagesRepo";
import ImageProcessor from "@services/imageProcessor";
import { csvDetails, ProcessStatus } from "@type/attributes";
import axios from "axios";
import csv from "csv-parser";
import fs from "fs";
import path from "path";

class CsvServices {
  private normalizedHeaders: Record<string, string> = {};
  private imageProcessor: ImageProcessor;
  private processedImageRepo: ProcessedImagesRepo;
  private urlRegex: RegExp =
    /^(https?:\/\/)[\w.-]+\.[a-z]{2,}(:\d+)?(\/[^\s]*)?(\?.*)?$/i;
  private processedCsvRepo: ProcessedCsvRepo;

  constructor() {
    this.imageProcessor = new ImageProcessor();
    this.processedImageRepo = new ProcessedImagesRepo();
    this.processedCsvRepo = new ProcessedCsvRepo();
  }

  private normalizeHeaders(headers: string[]): void {
    this.normalizedHeaders = headers.reduce(
      (data: Record<string, string>, header: string) => {
        data[header.toLowerCase()] = header;
        return data;
      },
      {} as Record<string, string>
    );
  }

  async validateCSVHeaders(
    filePath: string,
    requiredHeaders: string[]
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const stream = fs.createReadStream(filePath).pipe(csv());

      stream
        .on("headers", (headers: string[]) => {
          this.normalizeHeaders(headers);
          const lowerCaseHeaders = headers.map((header) =>
            header.trim().toLowerCase()
          );

          const isValid = requiredHeaders.every((reqHeader) =>
            lowerCaseHeaders.includes(reqHeader)
          );

          resolve(isValid);
          stream.destroy();
        })
        .on("error", (error) => reject(error));
    });
  }

  async validateImageURLs(filePath: string): Promise<object[]> {
    const invalidProducts: object[] = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          const productName =
            row[this.normalizedHeaders["product name"]]?.trim();
          const serialNumber = row[this.normalizedHeaders["s. no."]];
          const imageUrls = row[this.normalizedHeaders["input image urls"]]
            ?.split(",")
            .map((url: string) => url.trim());

          const invalidUrls = imageUrls.filter(
            (url: string) => !this.urlRegex.test(url)
          );

          if (invalidUrls.length > 0) {
            invalidProducts.push({
              "Sr. No.": serialNumber,
              "Product Name": productName,
              "Invalid Image URL(s)": invalidUrls.join(", "),
            });
          }
        })
        .on("end", () => resolve(invalidProducts))
        .on("error", (error) => reject(error));
    });
  }

  async processImageURLs(
    filePath: string,
    inputFileName: string,
    requestId: string
  ): Promise<{ processed: boolean; processedFileName: string }> {
    return new Promise((resolve, reject) => {
      const collectedData: string[][] = [];
      let headersCollected = false;

      const outputDirectory = path.join(
        __dirname,
        "../../public/processed files"
      );
      if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
      }
      const outputFileName = `${Date.now()}-processed-${inputFileName}`;
      const outputFilePath = path.join(outputDirectory, outputFileName);

      const processingTasks: Promise<void>[] = [];

      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          if (!headersCollected) {
            collectedData.push([...Object.keys(row), "Output Image URLs"]);
            headersCollected = true;
          }

          const serialNumber = parseInt(
            row[this.normalizedHeaders["s. no."]],
            10
          );
          const productName =
            row[this.normalizedHeaders["product name"]]?.trim();
          const inputImageUrls = row[this.normalizedHeaders["input image urls"]]
            ?.split(",")
            .map((url: string) => url.trim());

          const validUrls = inputImageUrls.filter((url: string) =>
            this.urlRegex.test(url)
          );
          const outputImageUrls: string[] = [];

          const imageProcessingTask = Promise.all(
            validUrls.map(async (url: string) => {
              const newImageName = await this.imageProcessor.compressImage(url);
              const newImageUrl = `${process.env.PUBLIC_IMAGE_URL}/${newImageName}`;
              outputImageUrls.push(newImageUrl);

              await this.processedImageRepo.insert({
                product_name: productName,
                image_url: newImageUrl,
              });
            })
          ).then(() => {
            collectedData.push([
              serialNumber.toString(),
              productName,
              inputImageUrls.join(", "),
              outputImageUrls.join(", "),
            ]);
          });

          processingTasks.push(imageProcessingTask);
        })
        .on("end", async () => {
          await Promise.all(processingTasks);

          const sortedData = collectedData.slice(1).sort((a, b) => {
            return parseInt(a[0], 10) - parseInt(b[0], 10);
          });

          const mergedData = [collectedData[0], ...sortedData];

          const csvContent = mergedData
            .map((row) => row.map((value) => `"${value}"`).join(","))
            .join("\n");

          fs.writeFileSync(outputFilePath, csvContent, "utf8");
          const response = {
            processed: true,
            processedFileName: outputFileName,
          };
          await this.triggerWebhookNotification(
            `${process.env.WEBHOOK_URL!}?id=${requestId}`,
            { response, headers: collectedData[0], processedData: sortedData }
          );

          resolve(response);
        })
        .on("error", (error) => reject(error));
    });
  }

  public async saveCsvDetails(
    input_csv_name: string,
    process_id: string,
    status: string,
    has_invalid_urls: boolean,
    invalid_metadata?: object | null
  ) {
    const verifiedCsv: csvDetails = {
      input_csv_name,
      process_id,
      status,
      has_invalid_urls,
      invalid_metadata,
    };

    await this.processedCsvRepo.newCsvUpload(verifiedCsv);
  }

  public async updateProcessStatus(
    processRequestId: string,
    status: ProcessStatus,
    outputFileName?: string
  ): Promise<void> {
    await this.processedCsvRepo.updateProcessStatus(
      processRequestId,
      status,
      outputFileName || ""
    );
  }

  private async triggerWebhookNotification(webhookUrl: string, data: object) {
    try {
      await axios.post(webhookUrl, data, {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Failed to send webhook:", error);
    }
  }

  public static webhookDataStore = new Map<string, any>(); // Store webhook data in-memory
}

export default CsvServices;
