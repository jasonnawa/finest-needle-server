import { container, inject, injectable } from "tsyringe";
import StripeController from "../controllers/stripeController";
import { Router } from "express";

@injectable()
export class StripeRoutes {
    public readonly router: Router
    private readonly _stripeController: StripeController

    constructor(
        @inject(StripeController.name) stripeController: StripeController
    ) {
        this.router = Router()
        this._stripeController = stripeController

        this.registerRoutes()

    }


    private registerRoutes() {

        this.router.post('/create-checkout-session', async (req, res) => {
            return this._stripeController.createPaymentSession(req, res)
        })

        this.router.post('/create-course-checkout-session', async (req, res) => {
            return this._stripeController.createCoursePaymentSession(req, res)
        })

    }
}

export const registerStripeRoutesDI = () => {
    container.register(StripeRoutes.name, { useClass: StripeRoutes })
}