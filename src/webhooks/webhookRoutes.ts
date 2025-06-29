import { container, inject, injectable } from "tsyringe";
import StripeWebhookController from "./stripeWebhook";
import { Router } from "express";
import { Request, Response } from "express";

@injectable()
export class WebhookRoutes {
    public readonly router: Router
    private readonly _stripeWebhookController: StripeWebhookController

    constructor(
        @inject(StripeWebhookController.name) stripeWebhookController: StripeWebhookController
    ) {
        this.router = Router()
        this._stripeWebhookController = stripeWebhookController

        this.registerRoutes()

    }


    private registerRoutes() {

        this.router.post('/stripe', async (req, res) => {
            return this._stripeWebhookController.handleStripeWebhook(req, res)
        })

    }
}

export const registerWebhookRoutesDI = () => {
    container.register(WebhookRoutes.name, { useClass: WebhookRoutes })
}