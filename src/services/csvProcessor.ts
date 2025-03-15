import fs from "fs";
import csv from "csv-parser";

class CsvServices {
  private normalizedHeaders: Record<string, string> = {};

  processCSV = (filePath: string): Promise<Record<string, string>[]> => {
    return new Promise((resolve, reject) => {
      const results: Record<string, string>[] = [];

      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", () => {
          resolve(results);
        })
        .on("error", (error) => {
          reject(new Error(`Error processing CSV: ${error.message}`));
        });
    });
  };

  validateCSVHeaders = (
    filePath: string,
    requiredHeaders: string[]
  ): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const stream = fs
        .createReadStream(filePath)
        .pipe(csv())
        .on("headers", (headers: string[]) => {
          const lowerCaseHeaders = headers.map((header) =>
            header.trim().toLowerCase()
          );
          const isValid = requiredHeaders.every((reqHeader) =>
            lowerCaseHeaders.includes(reqHeader)
          );
          stream.destroy(); // Stopped reading after headers
          resolve(isValid);
        })
        .on("error", (error) => reject(error));
    });
  };

  validateImageURLs = (
    filePath: string
  ): Promise<{ allValid: boolean; invalidProducts: object[] }> => {
    return new Promise((resolve, reject) => {
      const urlRegex =
        /^(https?:\/\/)[\w.-]+\.[a-z]{2,}(:\d+)?(\/[^\s]*)?(\?.*)?$/i;
      let allValid = true;
      const invalidProducts: object[] = [];

      fs.createReadStream(filePath)
        .pipe(csv())
        .on("headers", (headers) => {
          // Normalized column names by converting them to lowercase
          this.normalizedHeaders = headers.reduce(
            (data: Record<string, string>, header: string) => {
              data[header.toLowerCase()] = header;
              return data;
            },
            {} as Record<string, string>
          );
        })
        .on("data", (row) => {
          // Using normalized column names
          const productName =
            row[this.normalizedHeaders["product name"]]?.trim() ||
            "Unknown Product";
          const serialNumber = row[this.normalizedHeaders["s. no."]];
          const imageUrls =
            row[this.normalizedHeaders["input image urls"]]
              ?.split(",")
              .map((url: string) => url.trim()) || [];

          // Checking if any URL is invalid
          const hasInvalidURL = imageUrls.some(
            (url: string) => !urlRegex.test(url)
          );
          if (hasInvalidURL) {
            const sNo = `S. No.: ${serialNumber} &&`;
            const pName = `Product Name: ${productName}`;
            invalidProducts.push({ product: `${sNo} ${pName}` });
            allValid = false;
          }
        })
        .on("end", () => resolve({ allValid, invalidProducts }))
        .on("error", (error) => reject(error));
    });
  };
}

export default new CsvServices();
