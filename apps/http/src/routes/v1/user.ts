import { Router } from "express";

export const router = Router();

router.get("/metadata",(req, res) => {
    res.json({
        message: "Metadata"
    })
})

router.get("/metadata/bulk",(req, res) => {
    res.json({
        message: "Bulk Metadata"
    })
})