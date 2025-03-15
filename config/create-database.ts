import { Client } from "pg";
import config from ".";
import AppUtils from "@utils/appUtils";

class DatabaseClient {
  private client: Client;

  constructor() {
    this.client = new Client({
      user: config.user,
      password: config.password,
      host: config.host,
      port: Number(config.port),
      database: process.env.PG_DEFAULT_DATABASE,
    });
  }

  async connect(): Promise<void> {
    await this.client
      .connect()
      .catch((err) =>
        console.error(
          AppUtils.colorText.red(`Error connecting to default database: ${err}`)
        )
      );
  }

  async disconnect(): Promise<void> {
    await this.client.end();
  }

  getClient(): Client {
    return this.client;
  }
}

class DatabaseCreator {
  private connection = new DatabaseClient();
  private client = this.connection.getClient();
  private dbName = config.database;

  async createDatabaseIfNotExists(): Promise<void> {
    await this.connection.connect();

    const result = await this.client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [this.dbName]
    );

    if (result.rowCount !== 0) return this.connection.disconnect();

    await this.client
      .query(`CREATE DATABASE "${this.dbName}"`)
      .then(
        ({ command }) =>
          command === "CREATE" &&
          console.info(
            AppUtils.colorText.green(
              `Database "${config.database}" created successfully.`
            )
          )
      )
      .catch((err) =>
        console.error(
          AppUtils.colorText.red(`Error while creating database: ${err}`)
        )
      )
      .finally(() => this.connection.disconnect());
  }
}

new DatabaseCreator().createDatabaseIfNotExists();
