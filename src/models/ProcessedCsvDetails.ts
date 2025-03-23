import {
  Table,
  Column,
  DataType,
  Index,
  AllowNull,
  Default,
  Model,
} from "sequelize-typescript";
import { csvDetails } from "@type/attributes";

@Table({
  tableName: "processed_csv_details",
  timestamps: false,
})
export default class ProcessedCsvDetails extends Model implements csvDetails {
  @Index
  @Column(DataType.STRING)
  input_csv_name!: string;

  @AllowNull(false)
  @Default("")
  @Column(DataType.STRING)
  process_id!: string;

  @AllowNull(false)
  @Default("processing")
  @Column(DataType.STRING)
  status!: string;

  @AllowNull(false)
  @Default("")
  @Column(DataType.STRING)
  output_csv_name!: string;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  has_invalid_urls!: boolean;

  @AllowNull(true)
  @Default(null)
  @Column(DataType.JSON)
  invalid_metadata?: object | null;

  @AllowNull(false)
  @Default(DataType.NOW)
  @Column(DataType.DATE)
  created_at!: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  updated_at?: Date;
}
