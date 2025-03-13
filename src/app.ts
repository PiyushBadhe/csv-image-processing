import IndexRouter from "@routes/IndexRouter";
import express, { Request, Response, NextFunction } from "express";

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.initializeApp();
    this.configureMiddleware();
    this.initializeRoutes();
  }

  private initializeApp(): void {
    this.app.use("/public", express.static("public"));
    this.app.use("/public/images", express.static("images"));
  }

  private configureMiddleware(): void {
    this.app.use(express.json());

    this.app.use(this.errorHandler);

    // Logging for each request
    this.app.use((req: Request, _res: Response, next: NextFunction) => {
      console.debug(`${req.method} ${req.url}`);
      next();
    });
  }

  private initializeRoutes(): void {
    const routes = this.routesInstantiations;

    this.app.use("/", routes.index); // Home routes
  }

  private routesInstantiations = {
    index: new IndexRouter().getRoutes(),
  };

  private errorHandler = (
    error: any,
    _req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    console.error("Error occurred:", error); // Log the error for debugging
    if (error) {
      res.status(error.statusCode || 500).json({
        message: error.message || "Internal Server Error",
      });
      return next(error);
    }
  };
}

export default new App().app; // Export the Express app instance
