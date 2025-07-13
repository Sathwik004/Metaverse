import { RoomManager } from "./room_manager";
import { OutgoingMessage } from "./types";
import client from "@repo/db/client";
import jwt, { JwtPayload } from "jsonwebtoken";
import { WebSocket } from "ws";

const JWT_SECRET = process.env.JWT_SECRET

function getRandomString(length: number) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

export class User {
    public id: string;
    private userId?: string;
    private spaceId?: string;
    private x: number;
    private y: number;

    constructor(private ws: WebSocket) {
        this.id = getRandomString(10);
        this.ws = ws;
        this.x = 0;
        this.y = 0;
        this.initHandlers();
    }

    initHandlers(){
        this.ws.on("message",  async (event) =>  {
            const parsedData = JSON.parse(event.toString());

            switch (parsedData.type) {
                case "join":
                    const spaceId = parsedData.payload.spaceId;
                    const token = parsedData.payload.token;
                    const userId = (jwt.verify(token, JWT_SECRET || "default_secret") as JwtPayload).userId;
                    if(!userId){
                        this.ws.close(1008, "Invalid token");
                        return;
                    }

                    const space = await client.space.findFirst({
                        where: {
                            id: spaceId,
                        },
                    });
                    if(!space){
                        this.ws.close(1008, "Space not found");
                        return;
                    }
                    this.userId = userId;
                    this.spaceId = spaceId;

                    RoomManager.getInstance().addUserToRoom(this.spaceId!, this);
                    this.send({
                        type: "space-joined",
                        payload: {
                            spawn: {
                                x: this.x,
                                y: this.y,
                            },
                        users: RoomManager.getInstance().rooms.get(spaceId)?.filter(x => x.id !== this.id)?.map((u) => ({id: u.id})) ?? []
                    },
                        users: RoomManager.getInstance().rooms.get(this.spaceId!)?.
                        filter((u) => u.userId !== this.userId).
                        map((u) => ({id: u.id})) ?? []
                    });

                    RoomManager.getInstance().broadcastMessage({
                        type: "user-joined",
                        payload: {
                            userId: this.userId,
                            x: this.x,
                            y: this.y,
                        },
                    }, this.spaceId!, this);
                    break;  
                case "move":
                    const moveX = parsedData.payload.x || 0;
                    const moveY = parsedData.payload.y || 0;
                    const displacementX = Math.abs(moveX - this.x);
                    const displacementY = Math.abs(moveY - this.y);

                    if (this.spaceId) {
                        const space = await client.space.findFirst({
                            where: {
                                id: this.spaceId,
                            },
                        });
                        if (!space) {
                            this.ws.close(1008, "Space not found");
                            return;
                        }
                        if (moveX < 0 || moveY < 0 || moveX > space.width || moveY > space.height || displacementX + displacementY > 1) {
                            this.send({
                                type: "movement-rejected",
                                payload: {
                                    x: this.x,
                                    y: this.y
                                }
                            });
                            return;
                        }
                        // Check if an element exists at the new position
                        const elementAtPosition = await client.spaceElements.findFirst({
                            where: {
                                x: moveX,
                                y: moveY,
                                spaceId: this.spaceId,
                            },
                            select: {
                                id: true,
                                elementId: true,
                            },
                        });

                        if (elementAtPosition) {
                            const element = await client.element.findUnique({
                                where: {
                                    id: elementAtPosition.elementId,
                                },
                                select: {
                                    static: true,
                                },
                            });

                            if (element?.static) {
                                this.send({
                                type: "movement-rejected",
                                payload: {
                                    x: this.x,
                                    y: this.y
                                }
                            });
                                return;
                            }
                        }

                        this.x = moveX;
                        this.y = moveY;
                        RoomManager.getInstance().broadcastMessage({
                            type: "user-moved",
                            payload: {
                                x: this.x,
                                y: this.y,
                                userId: this.userId,
                            },
                        }, this.spaceId, this);
                    } else {
                        this.send({
                        type: "movement-rejected",
                        payload: {
                            x: this.x,
                            y: this.y
                        }
                    });
                    }

            }
        });
    }

    public send(payload: OutgoingMessage){
        try {
            this.ws.send(JSON.stringify(payload));
        } catch (error) {
        }
    }

    destroy() {
        RoomManager.getInstance().broadcastMessage({
            type: "user-left",
            payload: {
                userId: this.userId,
            },
        }, this.spaceId!, this);
        RoomManager.getInstance().removeUserFromRoom(this.spaceId!, this);
    }

}