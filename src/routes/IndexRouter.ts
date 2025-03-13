import express, { Request, Response, Router } from "express";

class IndexRouter {
  private router: Router;
  constructor() {
    this.router = express.Router();
    this.connectRoutes();
  }

  private connectRoutes(): void {
    this.router.get("/health", (_req: Request, res: Response) => {
      res.send({ message: "Health is Wealth...!" });
    });
  }

  public getRoutes(): Router {
    return this.router;
  }
}

// Export the router
export default IndexRouter;
