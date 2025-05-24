import { Router } from "express";

export const router = Router();

router.post("/", (req, res) => {
    res.json({
        message: "Create Space",
    });
});

router.delete("/:spaceId", (req, res) => {
    //
    res.json({
        message: "Delete Space",
    });
});

router.get("/all", (req, res) => {
    res.json({
        message: "Get all Space",
    });
});

router.get("/:spaceId", (req, res) => {
    res.json({
        message: "Get Space",
    });
});

router.post("/element", (req, res) => {
    res.json({
        message: "Create Element",
    });
});

router.delete("/element", (req, res) => {
    res.json({
        message: "Delete Element",
    });
});
