import {
  Table,
  Column,
  DataType,
  Index,
  AllowNull,
  Model,
} from "sequelize-typescript";

@Table({
  tableName: "processed_images",
  timestamps: false,
})
export default class ProcessedImages extends Model {
  @AllowNull(false)
  @Column(DataType.STRING)
  product_name!: string;

  @Index
  @AllowNull(false)
  @Column(DataType.STRING)
  image_url!: string;
}
