import { container, inject, injectable } from "tsyringe";
import { EnvConfiguration } from "../utils";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
@injectable()
export default class AuthController {
  private _envConfiguration: EnvConfiguration;
  constructor(@inject(EnvConfiguration) envConfiguration: EnvConfiguration) {
    this._envConfiguration = envConfiguration;
  }

  public async signin(req, res) {
    const { email, password } = req.body;

    const adminEmail = this._envConfiguration.ADMIN_EMAIL;
    const adminPasswordHash = this._envConfiguration.ADMIN_PASSWORD_HASH;
    const jwtSecret = this._envConfiguration.JWT_SECRET;

    if (email !== adminEmail) {
      return res
        .status(401)
        .json({ status: false, message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, adminPasswordHash);
    if (!isValid) {
      return res
        .status(401)
        .json({ status: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ role: "admin" }, jwtSecret, { expiresIn: "7d" });

    return res.json({ status: true, token, message: "Signed in" });
  }

  public async signout(req: Request, res: Response) {
    return res.json({ status: true, message: "Signed out" });
  }
}

export const RegisterAuthControllerDI = () => {
  container.register(AuthController.name, { useClass: AuthController });
};
