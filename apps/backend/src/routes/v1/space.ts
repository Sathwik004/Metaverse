import { Router } from "express";
import { AddElementSchema, CreateSpaceSchema, DeleteElementSchema } from "../../types";
import { userMiddleware } from "../../middlewares/user";
import client from "@repo/db/client";
import { id } from "zod/v4/locales";

export const router = Router();

router.post("/", userMiddleware, async (req, res) => {
    const parsedData = CreateSpaceSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({
            message: "Validation failed",
        });
        return;
    }

    try {
        const existingSpace = await client.space.findFirst({
            where: {
                creatorId: req.userId!,
            },
        });
        if (existingSpace) {
            res.status(400).json({
                message: "You have already created a space. Maximum allowed is 1.",
            });
            return;
        }

        if (!parsedData.data.mapId){
        const space = await client.space.create({
            data: {
                name: parsedData.data.name,
                width: parseInt(parsedData.data.dimensions.split("x")[0]),
                height: parseInt(parsedData.data.dimensions.split("x")[1]),
                creatorId: req.userId!,  
            }
        });
        res.json({
            message: "Empty space created successfully",
            spaceId: space.id,
        });
        return;
    }
    const map = await client.map.findUnique({
        where: {
            id: parsedData.data.mapId,
        },
        select: {
            elements: true,
            width: true,
            height: true
        },
    });
    if (!map) {
        res.status(404).json({
            message: "Map not found",
        });
        return;
    }

    let space = await client.$transaction(async (tx) => {
        const space = await client.space.create({
            data:{
                name: parsedData.data.name,
                width: map.width,
                height: map.height,
                creatorId: req.userId!,
            }
        })
        await client.spaceElements.createMany({
            data: map.elements.map((element) => ({
                elementId: element.elementId,
                spaceId: space.id,
                x: element.x!,
                y: element.y!,
            })),
        });
        return space;

    })
    res.json({
        message: "Space created successfully",
        spaceId: space.id,
    });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create space",
        });
    }
    return;

});


router.delete("/element",userMiddleware, async (req, res) => {
   const parsedData = DeleteElementSchema.safeParse(req.body);
    if (!parsedData.success) {
         res.status(400).json({
              message: "Validation failed",
         });
         return;
    }

    try {
        const element = await client.spaceElements.findUnique({
            where: {
                id: parsedData.data.elementId,
            },
            select: {
                space: {
                    select: {
                        creatorId: true,
                    }
                }
            }
        });

        if (!element) {
            res.status(404).json({
                message: "Element not found",
            });
            return;
        }

        if (element.space.creatorId !== req.userId) {
            res.status(403).json({
                message: "You are not allowed to delete this element",
            });
            return;
        }

        await client.spaceElements.delete({
            where: {
                id: parsedData.data.elementId,
            },
        });

        res.json({
            message: "Element deleted successfully",
            id: parsedData.data.elementId,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete element from space",
        });
    }
    return;
});


router.delete("/:spaceId",userMiddleware, async (req, res) => {

    const spaceId = req.params.spaceId;
    if (!spaceId) {
        res.status(400).json({
            message: "Space ID is required",
        });
        return;
    }
    try {
        const space = await client.space.findUnique({
        where: {
            id: spaceId,
        },
        select: {
            creatorId: true,
        }
    });

        if (!space) {
            res.status(400).json({
                message: "Space not found in delete spcae",
            });
            return;
        }
        if (space.creatorId !== req.userId) {
            res.status(403).json({
                message: "You are not allowed to delete this space",
            });
            return;
        }
        await client.space.delete({
            where: {
                id: spaceId,
            },
        });
        res.json({
            message: "Space deleted successfully",
        });
    } catch (error) {
        
        res.status(500).json({
            message: "Failed to delete space",
        });
    }
    
    return;

});

router.get("/all",userMiddleware, async (req, res) => {
    try {
        const spaces = await client.space.findMany({
            where: {
                creatorId: req.userId,
            },
            select: {
                id: true,
                name: true,
                width: true,
                height: true,
            }
        });
        res.json({
            spaces,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch spaces",
        });
    }
    return;
});

router.get("/:spaceId",userMiddleware, async (req, res) => {
    const spaceId = req.params.spaceId;

    try {
        const space = await client.space.findUnique({
        where: {
            id: spaceId,
        },
        include: {
            elements: {
                include: {
                    element: true
                }
            },
        },
    })

    if (!space) {
        res.status(400).json({
            message: "Space not found in post space",
        });
        return;
    }

    res.json({
        space: {
            id: space.id,
            name: space.name,
            "dimensions": `${space.width}x${space.height}`,
            elements: space.elements.map((e) => ({
                id: e.id,
                element: {
                    elementId: e.element.id,
                    imageUrl: e.element.imageUrl,
                    width: e.element.width,
                    height: e.element.height,
                    static: e.element.static,
                },
                x: e.x,
                y: e.y,
            })),
        },
    })

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch space",
        });
    }
    return;
});

router.post("/element", userMiddleware, async (req, res) => {
    const parsedData = AddElementSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({
            message: "Validation failed",
        });
        return;
    }
    try {
        const space = await client.space.findUnique({
            where: {
                id: parsedData.data.spaceId,
                creatorId: req.userId,
            },
            select: {
                width: true,
                height: true,
            }
        });

        if (!space) {
            res.status(404).json({
                message: "Space not found in post ele",
            });
            return;
        }

        if (parsedData.data.x > space.width || parsedData.data.y > space.height || parsedData.data.x < 0 || parsedData.data.y < 0) {
            res.status(400).json({
                message: "Element position is out of bounds",
            });
            return;
        }
        if (parsedData.data.x == 0 || parsedData.data.y == 0) {
            res.status(400).json({
                message: "Element position cannot be (0,0) this is the spawn point",
            });
            return;
        }

        const existingElement = await client.spaceElements.findFirst({
            where: {
                x: parsedData.data.x,
                y: parsedData.data.y,
                spaceId: parsedData.data.spaceId,
            },
            select: {
                id: true,
            }
        });

        if (existingElement) {
            res.status(400).json({
                message: "Element already exists at this position",
            });
            return;
        }

        const element = await client.spaceElements.create({
            data: {
                elementId: parsedData.data.elementId,
                spaceId: parsedData.data.spaceId,
                x: parsedData.data.x,
                y: parsedData.data.y,
            }
        });

        res.json({
            message: "Element added to space successfully",
            elementId: element.id,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to add element to space",
        });
    }
    
    return;
});
