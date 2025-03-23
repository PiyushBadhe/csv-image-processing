import { Sequelize } from "sequelize-typescript";
import path from "path";
import fs from "fs";
import config from ".";
import AppUtils from "@utils/appUtils";

class SequelizeDatabase {
  private modelsDirectory: string;
  private modelFiles: string[];
  private models: any[];
  private sequelize: Sequelize;

  constructor() {
    this.modelsDirectory = path.join(__dirname, "../src/models");

    this.modelFiles = fs
      .readdirSync(this.modelsDirectory)
      .filter(
        (file) =>
          (file.endsWith(".ts") || file.endsWith(".js")) &&
          !file.endsWith("BaseModel.ts")
      );

    this.models = this.modelFiles.map(
      (file) => require(path.join(this.modelsDirectory, file)).default
    );

    if (!config.database || !config.user || !config.password) {
      throw new Error(
        "Database configuration is incomplete. Check environment variables."
      );
    }

    this.sequelize = new Sequelize({
      database: config.database,
      dialect: "postgres",
      username: config.user,
      password: config.password,
      logging: false,
      models: this.models,
    });
  }

  public async connect(): Promise<void> {
    try {
      await this.sequelize.authenticate();
      console.info(AppUtils.colorText.blue("Database Connected"));
      await this.sequelize.sync({ alter: true, force: false });
    } catch (error) {
      console.error(
        AppUtils.colorText.red(`Error connecting to the database: ${error}`)
      );
    }
  }
}

export default new SequelizeDatabase();
