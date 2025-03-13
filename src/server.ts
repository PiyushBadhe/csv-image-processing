import app from "./app";
import http from "http";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

class Server {
  private port: number;
  private server: http.Server;

  constructor() {
    this.port = this.getPort(); // Get port from environment variables or default
    this.server = http.createServer(app); // Create the HTTP server
    this.setupApp();
    this.registerEvents();
  }

  /**
   * Load port from environment variables or set a default value
   */
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
      console.log(`Server is running on port ${this.port}`);
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
      case "EACCES": // Error case: Permission denied
        console.error(`${bind} requires elevated privileges`);
        process.exit(1); // Exit the process with an error code 1
        break;
      case "EADDRINUSE": // Error case: Port is already in use
        console.error(`${bind} is already in use`);
        process.exit(1); // Exit the process with an error code 1
        break;
      default:
        throw error; // If it's an unknown error, rethrow it
    }
  }
}

// Initialize and start the server
const server = new Server();
server.start();
