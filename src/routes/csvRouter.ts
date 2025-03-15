import express, { Router } from "express";
import CsvController from "@controllers/csvController";

class CsvRouter {
  private router: Router;
  private controller: CsvController;
  constructor() {
    this.router = express.Router();
    this.controller = new CsvController();
    this.connectRoutes();
  }

  private connectRoutes(): void {
    this.router.post(
      "/upload",
      this.controller.upload.single("file"),
      this.controller.csvUpload.bind(this.controller)
    );
  }

  public getRoutes(): Router {
    return this.router;
  }
}

export default CsvRouter;
