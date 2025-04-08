import ProcessedCsvDetails from "@models/ProcessedCsvDetails";
import { ProcessStatus } from "@type/attributes";

export class ProcessedCsvDetailsDTO {
  processId: string;
  status: string;
  message: string;
  warning?: string;
  invalidProductURLs?: object | null;
  // private readonly completed: ProcessStatus = "completed";

  constructor(
    model: ProcessedCsvDetails,
    customMessage: string = `CSV Process status: ${model.status}`,
    warningMessage: string = "Some products have invalid image URLs!"
  ) {
    this.processId = model.process_id;
    this.status = model.status;
    this.message = customMessage;
    if (model.has_invalid_urls) {
      this.warning = warningMessage;
      this.invalidProductURLs = model.invalid_metadata;
    }
  }
}
