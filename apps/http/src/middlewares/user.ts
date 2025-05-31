import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { NextFunction, Request, Response } from "express";

export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers["authorization"];
  const token = header?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

    try {
        const decoded = jwt.verify(token, JWT_SECRET || "default_secret") as { userId: string, role: string };
        
        req.userId = decoded.userId; 
        req.role = "User"; // Ensure role is typed correctly
        next();
    }
    catch (error) {
        res.status(400).json({ message: "Validation Failed" });
        return
    }
}