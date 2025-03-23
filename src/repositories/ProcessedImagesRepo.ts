import ProcessedImages from "@models/ProcessedImages";
import { ProcessedImage } from "@type/attributes";

class ProcessedImagesRepo {
  async insert(processedData: ProcessedImage): Promise<void> {
    const { product_name, image_url } = processedData;
    await ProcessedImages.create({ product_name, image_url });
  }
}

export default ProcessedImagesRepo;
