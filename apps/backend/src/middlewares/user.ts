import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers["authorization"];
  const token = header?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

    try {
        const decoded = jwt.decode(token) as { userId: string, role: string };
        if (!decoded || !decoded.userId || !decoded.role) {
            res.status(400).json({ message: "Invalid token" });
            return;
        }
        if (decoded.role === "User") {
          const key = process.env.JWT_SECRET_USER || "default_secret";
          console.log(key)
          const verified = jwt.verify(token, key) as { userId: string, role: string };
          req.userId = verified.userId; 
          req.role = "User"; 
        }
        else {
            if (decoded.role === "Admin") {
                const verified = jwt.verify(token, process.env.JWT_SECRET_ADMIN || "default_secret") as { userId: string, role: string };
                req.userId = verified.userId;
                req.role = "Admin"; 
            }
        }
        next();
    }
    catch (error) {
        res.status(400).json({ message: "Validation Failed" });
        return
    }
}