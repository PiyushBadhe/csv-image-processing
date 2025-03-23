import ThirdPartyController from "@controllers/thirdPartyController";
import express, { Request, Response, Router } from "express";

class ThirdPartyRouter {
  private router: Router;
  private thirdPartyController: ThirdPartyController;

  constructor() {
    this.router = express.Router();
    this.thirdPartyController = new ThirdPartyController();
    this.connectRoutes();
  }

  private connectRoutes(): void {
    this.router.get("/health", (_req: Request, res: Response) => {
      res.send({ message: "Health is Wealth...!" });
    });

    this.router.get("/hook", (req: Request, res: Response) => {
      res.send(req.body);
    });

    this.router.post(
      "/web-hook",
      this.thirdPartyController.setWebhookData.bind(this.thirdPartyController)
    );

    this.router.get(
      "/web-hook",
      this.thirdPartyController.getWebhookData.bind(this.thirdPartyController)
    );

    // this.router.get("*", (_req: Request, res: Response) => {
    //   res.send("Uh Ohh! This route doesn't exist");
    // });
  }

  public getRoutes(): Router {
    return this.router;
  }
}

export default ThirdPartyRouter;
