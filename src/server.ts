import app from "./app";
import http from "http";
import dotenv from "dotenv";
import AppUtils from "@utils/appUtils";

dotenv.config();

class Server {
  private port: number;
  private server: http.Server;

  constructor() {
    this.port = this.getPort();
    this.server = http.createServer(app);
    this.setupApp();
    this.registerEvents();
  }

  private getPort(): number {
    const port = Number(process.env.EXPRESS_PORT);
    if (isNaN(port))
      throw new Error("Invalid PORT value in environment variables");

    return port;
  }

  /**
   * Set up the application configurations
   */
  private setupApp(): void {
    app.set("port", this.port);
  }

  /**
   * Register server events
   */
  private registerEvents(): void {
    this.server.on("error", (error: NodeJS.ErrnoException) => {
      this.handleError(error);
    });
  }

  /**
   * Start the server
   */
  public start(): void {
    this.server.listen(this.port, () => {
      console.info(
        AppUtils.colorText.blue(`Server is running on port ${this.port}`)
      );
    });
  }

  /**
   * Handle server errors
   */
  private handleError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== "listen") {
      throw error; // If the error is not related to 'listen', rethrow it.
    }

    const bind =
      typeof this.port === "string" ? `Pipe ${this.port}` : `Port ${this.port}`;

    switch (error.code) {
      case "EADDRINUSE": // Error case: Port is already in use
        console.error(`${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  }
}

const server = new Server();
server.start();
