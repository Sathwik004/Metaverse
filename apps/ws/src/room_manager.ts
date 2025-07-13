import { OutgoingMessage } from "./types";
import { User } from "./user";

export class RoomManager{
    rooms: Map<String, User[]> = new Map();
    static instance: RoomManager;

    private constructor() {}

    static getInstance(): RoomManager {
        if (!RoomManager.instance) {
            RoomManager.instance = new RoomManager();
        }
        return RoomManager.instance;
    }

    public addUserToRoom(spaceId: string, user: User): void {
        if (!this.rooms.has(spaceId)) {
            this.rooms.set(spaceId, [user]);
            return
        } 
        if(this.rooms.get(spaceId)?.length! > 10){
            return
        }
        this.rooms.set(spaceId, [...(this.rooms.get(spaceId) ?? []), user]);
    }

    public broadcastMessage(message: OutgoingMessage,spaceId: string, user: User): void {

        if(!this.rooms.has(spaceId)) {
            console.error(`Room with ID ${spaceId} does not exist in broadcast.`);
            return;
        }

        this.rooms.get(spaceId)!.forEach((u) => {
            if (user.id !== u.id) {
                try {
                    u.send(message);
                } catch (error) {
                    console.error(`Failed to send message to user ${user.id}:`, error);
                }
            }
        });
    }

    public removeUserFromRoom(spaceId: string, user: User): void {
        if (!this.rooms.has(spaceId)) {
            console.error(`Room with ID ${spaceId} does not exist in removeUser.`);
            return;
        }

        this.rooms.set(spaceId, (this.rooms.get(spaceId)?.filter((u) => u.id !== user.id) ?? []));
    }
}