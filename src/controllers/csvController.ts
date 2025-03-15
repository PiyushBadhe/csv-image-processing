import { Request, Response, NextFunction } from "express";
import multer, { Multer } from "multer";
import CsvServices from "@services/csvProcessor";
import path from "path";
import AppUtils from "@utils/appUtils";

class CsvController {
  public upload: Multer;

  constructor() {
    this.upload = multer({
      storage: multer.diskStorage({
        destination: path.join(__dirname, "../../public/processed"),
        filename: (_req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    });
  }

  public async csvUpload(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const filePath = req.file.path;
    const originalFileName = req.file.originalname;
    const savedFileName = req.file.filename;
    const requiredHeaders = <const>[
      "s. no.",
      "product name",
      "input image urls",
    ];

    try {
      // Validate CSV headers
      const headersValid = await CsvServices.validateCSVHeaders(
        filePath,
        Array.from(requiredHeaders)
      );
      if (!headersValid) {
        res.status(400).json({
          error:
            "Invalid CSV headers. Expected: 'S. No.', 'Product Name', 'Input Image Urls'",
        });
        return;
      }

      // Validate Image URLs and get product names with invalid links
      const { invalidProducts } = await CsvServices.validateImageURLs(filePath);

      // Process CSV data
      const results = await CsvServices.processCSV(filePath);

      // Send response with processed data and list of invalid products (if any)
      res.json({
        requestID: AppUtils.generateUniqueProcessId(),
        requestedFile: originalFileName,
        processedFile: savedFileName,
        // data: results,
        productsWithInvalidURL: invalidProducts.length
          ? {
              message: "Some products have invalid image URLs",
              products: invalidProducts,
            }
          : null,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default CsvController;
