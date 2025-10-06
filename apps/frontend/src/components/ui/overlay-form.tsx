
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "./dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./select";
import { Button } from "./button";
import { Input } from "./input";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";

// Dummy map list
export const dummyMaps = [
    { id: "map1", name: "Map One" },
    { id: "map2", name: "Map Two" },
    { id: "map3", name: "Map Three" },
    { id: "none", name: "None" },
];

interface OverlayFormProps {
    open: boolean;
    onClose: () => void;
    onCreate: (data: { name: string; dimensions: string; mapId?: string }) => void;
}

export function OverlayForm({ open, onClose, onCreate }: OverlayFormProps) {
    const [spaceName, setSpaceName] = useState("");
    const [height, setHeight] = useState("");
    const [width, setWidth] = useState("");
    const [mapId, setMapId] = useState("none");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!spaceName || !height || !width) return;
        onCreate({
            name: spaceName,
            dimensions: `${height}x${width}`,
            ...(mapId !== "none" && { mapId }),
        });
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
            <form onSubmit={handleSubmit}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create Space</DialogTitle>
                        {/* Optionally add a DialogDescription here */}
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="space-name">Space Name</Label>
                            <Input id="space-name" value={spaceName} onChange={e => setSpaceName(e.target.value)} placeholder="Enter space name" />
                        </div>
                        <div className="grid gap-3 grid-cols-2">
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="height">Height</Label>
                                <Input
                                    id="height"
                                    type="number"
                                    value={height}
                                    onChange={e => setHeight(e.target.value)}
                                    placeholder="Height"
                                    className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"

                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="width">Width</Label>
                                <Input
                                    id="width"
                                    type="number"
                                    value={width}
                                    onChange={e => setWidth(e.target.value)}
                                    placeholder="Width"
                                    className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"

                                />
                            </div>
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="map">Map</Label>
                            <Select value={mapId} onValueChange={setMapId}>
                                <SelectTrigger id="map">
                                    <SelectValue placeholder="Select a map" />
                                </SelectTrigger>
                                <SelectContent>
                                    {dummyMaps.map(map => (
                                        <SelectItem key={map.id} value={map.id}>{map.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleSubmit}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
}
