import { ProcessedCsvDetailsDTO } from "@DTO/ProcessedCsvDetailsDTO";
import HttpStatus from "@enums/response";
import ProcessedCsvRepo from "@repositories/ProcessedCsvRepo";
import CsvServices from "@services/csvProcessor";
import { csvHeaders } from "@type/attributes";
import GenericApiResponse from "@utils/apiResponse";
import AppUtils from "@utils/appUtils";
import { Request, Response } from "express";
import multer, { Multer } from "multer";
import path from "path";

class CsvController {
  upload: Multer;
  private processedCsvRepo: ProcessedCsvRepo;
  private csvServices: CsvServices;

  constructor() {
    this.upload = multer({
      storage: multer.diskStorage({
        destination: path.join(__dirname, "../../public/uploads"),
        filename: (_req, file, cb) => {
          cb(null, `${Date.now()}-original-${file.originalname}`);
        },
      }),
    });
    this.csvServices = new CsvServices();
    this.processedCsvRepo = new ProcessedCsvRepo();
  }

  async csvUpload(req: Request, res: Response): Promise<void> {
    if (!req.file)
      return GenericApiResponse.sendFailure(res, "No file uploaded");

    if (req.file.mimetype !== "text/csv")
      return GenericApiResponse.sendFailure(res, "Uploaded file is not a CSV.");

    const filePath = req.file.path;
    const originalFileName = req.file.originalname;
    const requiredHeaders = csvHeaders;

    const processRequestId = AppUtils.generateUniqueProcessId();

    GenericApiResponse.sendSuccess(
      res,
      {
        requestID: processRequestId,
        processStatus: `${process.env.CSV_STATUS_URL}?id=${processRequestId}`,
      },
      "Please follow the link to check the status of the conversion process."
    );

    (async () => {
      try {
        const headersValid = await this.csvServices.validateCSVHeaders(
          filePath,
          Array.from(requiredHeaders)
        );
        if (!headersValid)
          return GenericApiResponse.sendFailure(
            res,
            "Invalid CSV headers.",
            HttpStatus.CONFLICT
          );

        const invalidProducts = await this.csvServices.validateImageURLs(
          filePath
        );

        await this.csvServices.saveCsvDetails(
          originalFileName,
          processRequestId,
          "processing",
          invalidProducts.length > 0,
          invalidProducts.length > 0 ? invalidProducts : null
        );

        const { processed: isProcessed, processedFileName } =
          await this.csvServices.processImageURLs(
            filePath,
            originalFileName,
            processRequestId
          );

        if (isProcessed) {
          return await this.csvServices.updateProcessStatus(
            processRequestId,
            "completed",
            processedFileName
          );
        }

        await this.csvServices.updateProcessStatus(processRequestId, "failed");
        GenericApiResponse.sendFailure(res, "Image processing failed.");
      } catch (error: any) {
        await this.csvServices.updateProcessStatus(processRequestId, "failed");
        GenericApiResponse.sendError(res, error.message);
      }
    })();
  }

  async fetchProcessStatus(req: Request, res: Response): Promise<void> {
    try {
      const processId = req.query.id as string;

      if (!processId)
        return GenericApiResponse.sendFailure(res, "Process ID is required.");

      const processStatus = await this.processedCsvRepo.retrieveByProcessId(
        processId
      );

      if (!processStatus)
        return GenericApiResponse.sendFailure(
          res,
          "No response found for requested process ID"
        );

      const dtoData = new ProcessedCsvDetailsDTO(processStatus);

      return GenericApiResponse.sendSuccess(res, dtoData);
    } catch (error: any) {
      GenericApiResponse.sendError(res, error.message);
    }
  }
}

export default CsvController;
