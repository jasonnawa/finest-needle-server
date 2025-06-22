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

    // Set HTTP-only cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "strict",
    });

    return res.json({ status: true, message: "Signed in" , token: token});
  }

  public async signout(req: Request, res: Response) {
    res.clearCookie("auth_token");
    return res.json({ status: true, message: "Signed out" });
  }
}

export const RegisterAuthControllerDI = () => {
  container.register(AuthController.name, { useClass: AuthController });
};
