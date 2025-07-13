import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { router as userRouter } from "./user";
import { router as spaceRouter } from "./space";
import { router as adminRouter } from "./admin";
import { SignInSchema, SignUpSchema } from "../../types";
import client from "@repo/db/client"; 

export const router = Router();


router.post("/signup", async (req, res) => {

  const parsedData = SignUpSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.status(400).json({
      message: "Validation failed",
    });
    return;
  }

  try {

    const hashedpassword = bcrypt.hashSync(parsedData.data.password, 10);
    const user = await client.user.create({
      data: {
        username: parsedData.data.username,
        password: hashedpassword,
        role: parsedData.data.type === "admin" ? "Admin" : "User",
      },
    });

    res.json({
      userId: user.id,
      message: "User created successfully"
    });
    
  } catch (error) {
    console.error("Error creating user:", error);

    res.status(500).json({
      message: "User already exists",
    });
    
  }
  return;
});

router.post("/signin", async (req, res) => {

  const parsedData = SignInSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({
      message: "Validation failed",
    });
    return;
  }

  try {

    const user = await client.user.findFirst({
      where: {
        username: parsedData.data.username,
      },
    });

    if (!user) {
      res.status(400).json({
        message: "User not found",
      });
      return;
    }

    const isPasswordValid = bcrypt.compareSync(parsedData.data.password, user.password);
    
    if (!isPasswordValid) {
      res.status(403).json({
        message: "Invalid password",
      });
      return;
    }

    let secret = "default_secret";
    if (user.role === "Admin") {
      secret = process.env.JWT_SECRET_ADMIN || "default_admin_secret";
      console.log("Admin user signing in", process.env.JWT_SECRET_ADMIN);
    } else {
      secret = process.env.JWT_SECRET_USER || "default_user_secret";
      console.log("user signing in", process.env.JWT_SECRET_USER);

    }
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      secret
    );

    res.json({
      token: token,
      message: "User signed in successfully"
    });
    
  } catch (error) {
    console.error("Error signing in user:", error);
    res.status(500).json({
      message: "Internal server error",});
  }
  return;    
  });

router.get("/avatars", async (req, res) => {
  try {
    const avatars = await client.avatar.findMany();
    res.json({
        avatars: avatars.map(avatar => ({
            id: avatar.id,
            name: avatar.name,
            imageUrl: avatar.imageUrl,
        })),
        message: "Avatars fetched successfully"
    });
    return
  } catch (error) {
    res.status(500).json({
        message: "Failed to fetch avatars",
    });
    return;
    
  }
    
  });
  
router.get("/elements", async (req, res) => {
  try {
    const elements = await client.element.findMany();
    res.json({
        elements: elements.map(element => ({
          id: element.id,
          imageUrl: element.imageUrl,
          height: element.height,
          width: element.width,
          static: element.static, 
        })),
        message: "Elements fetched successfully"
    });

  } catch (error) {
    res.status(500).json({
        message: "Failed to fetch elements",
    });
  }
  return;
    
  });

router.get("/check", (req,res) => {
  res.json({
    message: "API is working",
  });
  return;
})

router.use("/user", userRouter);
router.use("/space", spaceRouter);
router.use("/admin", adminRouter);