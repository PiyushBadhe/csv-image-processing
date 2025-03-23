export type csvDetails = {
  input_csv_name: string;
  process_id: string;
  status: string;
  output_csv_name?: string;
  has_invalid_urls: boolean;
  invalid_metadata?: object | null;
};

export type ProcessedImage = {
  product_name: string;
  image_url: string;
};

export type ProcessStatus = "processing" | "completed" | "failed";

export const csvHeaders = <const>["s. no.", "product name", "input image urls"];
