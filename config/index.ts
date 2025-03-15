import dotenv from "dotenv";
dotenv.config(); // Load environment variables for serverless database connection

// Interface for db environment variables
interface IConfig {
  host: string | undefined;
  user: string | undefined;
  port: string | undefined;
  password: string | undefined;
  database: string | undefined;
  pg_query_params: string | undefined;
}

// Postgres connection requirements
const config: IConfig = {
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  port: process.env.PG_PORT,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  pg_query_params: process.env.PG_QUERY_PARAMS,
};

export default config;
