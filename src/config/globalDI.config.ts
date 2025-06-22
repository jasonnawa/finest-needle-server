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
export default class GlobalDIConfig{

    public static registerAllDI(){
        console.log("Registering all DI");
        registerEnvConfigurationDI()

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
    }

}