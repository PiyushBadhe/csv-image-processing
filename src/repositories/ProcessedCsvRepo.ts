import ProcessedCsvDetails from "@models/ProcessedCsvDetails";
import { csvDetails } from "@type/attributes";

class ProcessedCsvRepo {
  async newCsvUpload(csvAttributes: csvDetails): Promise<void> {
    await ProcessedCsvDetails.create(csvAttributes);
  }

  async retrieveByProcessId(
    processId: string
  ): Promise<ProcessedCsvDetails | null> {
    return (
      (await ProcessedCsvDetails.findOne({
        where: { process_id: processId },
      })) ?? null
    );
  }

  async updateProcessStatus(
    processId: string,
    newStatus: string,
    fileName: string
  ): Promise<void> {
    await ProcessedCsvDetails.update(
      { status: newStatus, updated_at: new Date(), output_csv_name: fileName },
      { where: { process_id: processId } }
    );
  }
}

export default ProcessedCsvRepo;
