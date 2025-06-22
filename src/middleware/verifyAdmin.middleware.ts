import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const verifyAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies["auth_token"];
  if (!token) {
    res.status(401).json({ status: false, message: "Not authenticated" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    if ((decoded as any).role !== "admin") {
      res.status(403).json({ status: false, message: "Forbidden" });
      return;
    }
    next();
  } catch {
    res.status(401).json({ status: false, message: "Invalid token" });
  }
};