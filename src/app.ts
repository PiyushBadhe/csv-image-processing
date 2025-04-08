import CsvRouter from "@routes/csvRouter";
import ThirdPartyRouter from "@routes/ThirdPartyRouter";
import express, { Request, Response, NextFunction } from "express";
import SequelizeDatabase from "@config/sequelize";
import AppUtils from "@utils/appUtils";
import path from "path";

class App {
  public app: express.Application;
  private publicDirectoryPath: string = path.join(__dirname, "../public");
  constructor() {
    this.app = express();
    this.initializeApp();
    this.configureMiddleware();
    this.initializeRoutes();
  }

  private initializeApp(): void {
    this.app.use(
      "/public/images",
      express.static(path.join(this.publicDirectoryPath, "images"))
    );
    this.app.use(
      "/public/processed files",
      express.static(path.join(this.publicDirectoryPath, "processed"))
    );
    this.app.use(
      "/public/uploads",
      express.static(path.join(this.publicDirectoryPath, "uploads"))
    );
    SequelizeDatabase.connect(); // Initialize sequelize instance method to establish the database connection
  }

  private configureMiddleware(): void {
    this.app.use(express.json());

    this.app.use(this.errorHandler);

    // Logging for each request
    this.app.use((req: Request, _res: Response, next: NextFunction) => {
      console.debug(AppUtils.colorText.cyan(`${req.method} ${req.url}`));
      next();
    });
  }

  private initializeRoutes(): void {
    const routes = this.routesInstantiations;

    this.app.use("/csv", routes.csv); // CSV routes
    this.app.use("/", routes.thirdParty); // Third-Party routes
  }

  private routesInstantiations = {
    thirdParty: new ThirdPartyRouter().getRoutes(),
    csv: new CsvRouter().getRoutes(),
  };

  private errorHandler = (
    error: any,
    _req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    console.error(AppUtils.colorText.red(`Error occurred: ${error}`)); // Log the error for debugging
    if (error) {
      res.status(error.statusCode || 500).json({
        message: error.message || "Internal Server Error",
      });
      return next(error);
    }
  };
}

export default new App().app;
