import { RegisterAuthControllerDI } from "../controllers/authController";
import { registerUserControllerDI } from "../controllers/userController";
import { registerMatchControllerDI } from "../controllers/matchController";


import { registerUserModelDI } from "../models/userModel";
import { registerMatchModelDI } from "../models/matchModel";
import { registerPreferenceModelDI } from "../models/preferenceModel";

import { registerBaseRoutesDI } from "../routes/baseRoutes";
import { registerAuthRoutesDI } from "../routes/authRoutes";
import { registerUserRoutesDI } from "../routes/userRoutes";
import { registerMatchRoutesDI } from "../routes/matchRoutes";

import { registerEnvConfigurationDI } from "../utils/env-config";
import { registerStripeControllerDI } from "../controllers/stripeController";
import { registerStripeRoutesDI } from "../routes/stripeRoutes";
import { registerStripeWebhookControllerDI } from "../webhooks/stripeWebhook";
import { registerWebhookRoutesDI } from "../webhooks/webhookRoutes";
import { registerCourseControllerDI } from "../controllers/courseController";
import { registerCourseModelDI } from "../models/courseModel";
import { registerCourseRoutesDI } from "../routes/courseRoutes";
export default class GlobalDIConfig{

    public static registerAllDI(){
        console.log("Registering all DI");
        registerEnvConfigurationDI()
        registerStripeControllerDI()
        registerStripeRoutesDI()
        registerStripeWebhookControllerDI()
        registerWebhookRoutesDI()

        registerBaseRoutesDI()
        registerAuthRoutesDI()
        registerUserRoutesDI()
        registerMatchRoutesDI()

        RegisterAuthControllerDI()
        registerUserControllerDI()
        registerMatchControllerDI()

        registerUserModelDI()
        registerPreferenceModelDI()
        registerMatchModelDI()

        registerCourseControllerDI()
        registerCourseModelDI()
        registerCourseRoutesDI()
    }

}