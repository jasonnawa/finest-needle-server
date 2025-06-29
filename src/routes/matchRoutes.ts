import { container, inject, injectable } from "tsyringe";
import { MatchController } from "../controllers/matchController";
import { verifyAdmin } from "../middleware/verifyAdmin.middleware";
import { Router } from "express";

@injectable()
export class MatchRoutes {
  public readonly router: Router;
  private readonly _matchController: MatchController;

  constructor(@inject(MatchController.name) matchController: MatchController) {
    this.router = Router();
    this._matchController = matchController;

    this.registerRoutes();
  }

  private registerRoutes() {
    this.router.post("/", verifyAdmin, async (req, res) => {
      return this._matchController.createMatch(req, res);
    });

    this.router.get("/", verifyAdmin, async (req, res) => {
      return this._matchController.getAllMatches(req, res);
    });

    this.router.delete('/', verifyAdmin, async(req, res)=> {
      return this._matchController.unmatch(req, res)
    })
  }
}

export const registerMatchRoutesDI = () => {
  container.register(MatchRoutes.name, { useClass: MatchRoutes });
};
