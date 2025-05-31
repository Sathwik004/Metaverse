import { Router } from "express";
import { GetBulkMetadataSchema, UpdateMetadataSchema } from "../../types";
import client from "@repo/db/client";
import { userMiddleware } from "../../middlewares/user";

export const router = Router();


router.post("/metadata",userMiddleware, async (req, res) => {
    
    const parsedData = UpdateMetadataSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({
            message: "Validation failed",
        });
        return;
    }
    try {
        
        await client.user.update({
            where: {
                id: req.userId,
            },
            data: {
                avatarId: parsedData.data.avatarId,
            }
        })

        res.json({
            message: "Metadata updated successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update metadata",
        });
    }
    return;

})

router.get("/metadata/bulk", async (req, res) => {

    const parsedData = GetBulkMetadataSchema.safeParse(req.query);
    if (!parsedData.success ) {
        res.status(400).json({
            message: "Validation failed",
        });
        return;
    }
    if (!parsedData.data.userIds) {
        res.status(400).json({
            message: "User IDs are required",
        });
        return;
    }

    const userIds = parsedData.data.userIds;
    const metadata = await client.user.findMany({
        where: {
            id: {
                in: userIds,
            }
        },
        select: {
            id: true,
            avatar: true,
        }
    })
    res.json({
        avatars: metadata.map((user) => ({
            id: user.id,
            avatarUrl: user.avatar?.imageUrl || null,
        })),
    });
})