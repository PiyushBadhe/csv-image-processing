import CsvServices from "@services/csvProcessor";
import GenericApiResponse from "@utils/apiResponse";
import { Request, Response } from "express";
import fs from "fs";
import path from "path";

class ThirdPartyController {
  async setWebhookData(req: Request, res: Response): Promise<void> {
    try {
      const processId = req.query.id as string;

      if (!processId)
        return GenericApiResponse.sendFailure(res, "Process ID is required.");

      const { response, headers, processedData } = req.body;
      const { processed, processedFileName: processedFile } = response;
      const processRequestID = req.query.id;

      // Store webhook data mapped to processId
      CsvServices.webhookDataStore.set(processId, {
        processRequestID,
        processed,
        processedFile,
        headers,
        processedData,
      });

      return GenericApiResponse.sendSuccess(
        res,
        null,
        "Webhook received successfully."
      );
    } catch (error: any) {
      GenericApiResponse.sendError(res, error.message);
    }
  }

  async getWebhookData(req: Request, res: Response): Promise<void> {
    try {
      const processId = req.query.id as string; // Get ID from query params
      const webView = req.query.webView === "true";

      if (!processId) {
        return GenericApiResponse.sendFailure(res, "Process ID is required.");
      }

      const webhookData = CsvServices.webhookDataStore.get(processId); // Retrieve stored data

      if (!webhookData) {
        return GenericApiResponse.sendFailure(
          res,
          "No data found for the given Process ID."
        );
      }

      if (webView) {
        const htmlFilePath = path.join(
          __dirname,
          "../shared/pages/webhookTemplate.html"
        );
        fs.readFile(htmlFilePath, "utf-8", (err, html) => {
          if (err) {
            console.error("Error reading HTML file:", err);
            return res.status(500).send("Error loading the webhook data page.");
          }

          // Inject webhook data as a valid JSON string
          const jsonData = JSON.stringify(webhookData).replace(/</g, "\\u003c"); // Prevent HTML injection
          const renderedHtml = html.replace("__WEBHOOK_DATA__", jsonData);

          res.send(renderedHtml);
        });

        return;
      }

      return GenericApiResponse.sendSuccess(
        res,
        webhookData,
        "Webhook data retrieved successfully."
      );
    } catch (error: any) {
      GenericApiResponse.sendError(res, error.message);
    }
  }
}

export default ThirdPartyController;
