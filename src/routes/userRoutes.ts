import { container, inject, injectable } from "tsyringe";
import { UserController } from "../controllers/userController";
import { Router } from "express";

@injectable()
export class UserRoutes {
    public readonly router: Router
    private readonly _userController: UserController

    constructor(
        @inject(UserController.name) userController: UserController
    ) {
        this.router = Router()
        this._userController = userController

        this.registerRoutes()

    }


    private registerRoutes() {

        this.router.post('/', async (req, res) => {
            return this._userController.createUser(req, res)
        })

        this.router.get('/:id', async (req, res) => {
            return this._userController.findUser(req, res)
        })

        this.router.post('/register', async (req, res) => {
            return this._userController.registerUser(req, res)
        })
    }
}

export const registerUserRoutesDI = () => {
    container.register(UserRoutes.name, { useClass: UserRoutes })
}