import { Router } from "express";
import { router as userRouter } from "./user";
import { router as spaceRouter } from "./space";
import { router as adminRouter } from "./admin";

export const router = Router();

router.post("/signup", (req, res) => {
  res.json({ 
    message: "Sign up"
    });
});

router.post("/signin", (req, res) => {
    res.json({ 
        message: "Sign In", token: "token-uhi8358tv3avw1133"
    });
  });

router.get("/avatars", (req, res) => {
    res.json({ 
        message: "Avatars"
    });
  });
  
router.get("/elements", (req, res) => {
    res.json({ 
        message: "Elements"
    });
  });


router.use("/user", userRouter);
router.use("/space", spaceRouter);
router.use("/admin", adminRouter);