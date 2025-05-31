import { Router } from "express";
import { CreateAvatarScheme, CreateElementSchema, CreateMapSchema, UpdateElementSchema } from "../../types";
import { adminMiddleware } from "../../middlewares/admin";
import client from "@repo/db/client";

export const router = Router();

router.post("/element",adminMiddleware, async (req, res) => {
    const parsedData = CreateElementSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({
            message: "Validation failed",
        });
        return;
    }

    try {
     const element = await client.element.create({
        data: {
            imageUrl: parsedData.data.imageUrl,
            width: parsedData.data.width,
            height: parsedData.data.height,
            static: parsedData.data.static,
        },
    });
        res.json({
            message: "Element created successfully",
            elementId: element.id,
        });   
    } catch (error) {
        res.json({
            message: "Failed to create element",
        })
    }
    return;
});

router.put("/element/:elementId",adminMiddleware, async (req, res) => {
    const parsedData = UpdateElementSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({
            message: "Validation failed",
        });
        return;
    }

    try {
        const element = await client.element.update({
            where: {
                id: req.params.elementId,
            },
            data: {
                imageUrl: parsedData.data.imageUrl,
            },
        });
        res.json({
            message: "Element updated successfully",
            elementId: element.id,
        });
    } catch (error) {
        res.json({
            message: "Failed to update element",
        });
    }
    return;
});

router.post("/avatar",adminMiddleware, async (req, res) => {
    const parsedData = CreateAvatarScheme.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({
            message: "Validation failed",
        });
        return;
    }

    try {
        const avatar = await client.avatar.create({
        data: {
            name: parsedData.data.name,
            imageUrl: parsedData.data.imageUrl,
        },
    });
    res.json({
        message: "Avatar created successfully",
        avatarId: avatar.id,
    })

    } catch (error) {
        res.status(500).json({
            message: "Failed to create avatar",
        });
    }
    return;

});

router.post("/map",adminMiddleware, async (req, res) => {
    const parsedData = CreateMapSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({
            message: "Validation failed",
        });
        return;
    }

    try {
        
        const map = await client.map.create({
            data: {
                thumbnail: parsedData.data.thumbnail,
                name: parsedData.data.name,
                width: parseInt(parsedData.data.dimensions.split("x")[0]),
                height: parseInt(parsedData.data.dimensions.split("x")[1]),
                elements: {
                    create: parsedData.data.elements.map((e) => ({
                        elementId: e.elementId,
                        x: e.x,
                        y: e.y,
                    })),
                },
            },
        });
        res.json({
            message: "Map created successfully",
            mapId: map.id,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create map",
        });
        
    }
    return;
});
