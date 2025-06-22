import { container, inject, injectable } from "tsyringe";
import AuthController from "../controllers/authController";
import { Router } from "express";

@injectable()
export class AuthRoutes {
    public readonly router: Router
    private readonly _authController: AuthController

    constructor(
        @inject(AuthController.name) authController: AuthController
    ) {
        this.router = Router()
        this._authController = authController

        this.registerRoutes()

    }


    private registerRoutes() {

        this.router.post('/signin', async (req, res) => {
            return this._authController.signin(req, res)
        })

    }
}

export const registerAuthRoutesDI = () => {
    container.register(AuthRoutes.name, { useClass: AuthRoutes })
}