import { container, inject, injectable } from "tsyringe";
import { UserController } from "../controllers/userController";
import { verifyAdmin } from "../middleware/verifyAdmin.middleware";
import { Router } from "express";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });
@injectable()
export class UserRoutes {
  public readonly router: Router;
  private readonly _userController: UserController;

  constructor(@inject(UserController.name) userController: UserController) {
    this.router = Router();
    this._userController = userController;

    this.registerRoutes();
  }

  private registerRoutes() {
    this.router.post("/", async (req, res) => {
      return this._userController.createUser(req, res);
    });

    this.router.get("/pending", verifyAdmin, async (req, res) => {
      return this._userController.getPendingUsers(req, res);
    });

    this.router.get("/", verifyAdmin, async (req, res) => {
      return this._userController.getAllUsers(req, res);
    });

    this.router.post("/register", upload.single('profileImage'), async (req, res) => {
      return this._userController.registerUser(req, res);
    });

    
    this.router.get("/:id/mark-paid", verifyAdmin, async (req, res) => {
      return this._userController.updateUserToPaidEndpoint(req, res);
    });

    this.router.get("/:id", verifyAdmin, async (req, res) => {
      return this._userController.findUser(req, res);
    });
  }
}

export const registerUserRoutesDI = () => {
  container.register(UserRoutes.name, { useClass: UserRoutes });
};
