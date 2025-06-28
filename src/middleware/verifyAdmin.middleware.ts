import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const verifyAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ status: false, message: "Not authenticated" });
    return;
  }

  const token = authHeader.split(" ")[1];

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