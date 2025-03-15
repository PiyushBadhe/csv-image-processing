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

    this.router.get("*", (_req: Request, res: Response) => {
      res.send("Uh Ohh! This route doesn't exist");
    });
  }

  public getRoutes(): Router {
    return this.router;
  }
}

export default IndexRouter;
