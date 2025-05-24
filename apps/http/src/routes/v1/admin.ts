import { Router } from "express";

export const router = Router();

router.post("/element", (req, res) => {
    res.json({
        message: "Create Element",
    });
});

router.put("/element/:elementId", (req, res) => {
    res.json({
        message: "Update Element",
    });
});

router.post("/avatar", (req, res) => {
    res.json({
        message: "Create Avatar",
    });
});

router.post("/map", (req, res) => {
    res.json({
        message: "Create Map",
    });
});
